<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\IProgService;

class CampaignController extends Controller
{
    protected string $supabaseUrl;
    protected string $supabaseKey;

    public function __construct()
    {
        $this->supabaseUrl = env('SUPABASE_URL', 'https://zuuwqrxmkeryzbcrlrai.supabase.co');
        $this->supabaseKey = env('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXdxcnhta2VyeXpiY3JscmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDcxMzAsImV4cCI6MjEwMDI4MzEzMH0.CR289UHP5bxEavCMW1Z0h19Jrf6mm5YFC7NQ8RWkkm0');

        Log::info('CampaignController initialized', [
            'supabase_url' => $this->supabaseUrl,
            'supabase_key_length' => strlen($this->supabaseKey),
            'supabase_key_prefix' => substr($this->supabaseKey, 0, 20) . '...'
        ]);
    }

    public function test()
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'Campaign controller is working',
            'supabase_url' => $this->supabaseUrl,
            'supabase_key_set' => !empty($this->supabaseKey),
            'timestamp' => now()
        ]);
    }

    public function index(Request $request)
    {
        try {
            Log::info('Fetching campaigns', [
                'supabase_url' => $this->supabaseUrl,
                'supabase_key_set' => !empty($this->supabaseKey),
                'supabase_key_length' => strlen($this->supabaseKey),
            ]);

            $endpoint = "{$this->supabaseUrl}/rest/v1/campaigns?select=*";
            
            if ($request->has('status')) {
                $endpoint .= "&status=eq.{$request->status}";
            }

            if ($request->has('created_by')) {
                $endpoint .= "&created_by=eq.{$request->created_by}";
            }

            Log::info('Making request to Supabase', ['endpoint' => $endpoint]);

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get($endpoint);

            Log::info('Supabase response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body(),
            ]);

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()} - {$response->body()}");
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch campaigns', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'target_audience' => 'nullable|string',
                'priority' => 'sometimes|in:low,medium,high',
                'budget' => 'nullable|numeric',
                'location' => 'nullable|string',
                'expected_reach' => 'nullable|integer',
                'campaign_type' => 'nullable|string',
                'admin_notes' => 'nullable|string',
            ]);

            $campaignData = [
                'title' => $request->title,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'target_audience' => $request->target_audience,
                'status' => $request->status ?? 'draft',
                'created_by' => $request->user()->id ?? 1, // Default to user ID 1 if auth not available
                'priority' => $request->priority ?? 'medium',
                'budget' => $request->budget,
                'location' => $request->location,
                'expected_reach' => $request->expected_reach,
                'campaign_type' => $request->campaign_type,
                'admin_notes' => $request->admin_notes,
            ];

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->post("{$this->supabaseUrl}/rest/v1/campaigns", $campaignData);

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            return response()->json($response->json()[0], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create campaign', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/campaigns?id=eq.{$id}&select=*");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $campaigns = $response->json();
            if (empty($campaigns)) {
                return response()->json(['message' => 'Campaign not found'], 404);
            }

            return response()->json($campaigns[0]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch campaign', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'target_audience' => 'nullable|string',
                'status' => 'sometimes|in:draft,submitted,pending_approval,needs_revision,approved,published,rejected,archived',
                'priority' => 'sometimes|in:low,medium,high',
                'budget' => 'nullable|numeric',
                'location' => 'nullable|string',
                'expected_reach' => 'nullable|integer',
                'campaign_type' => 'nullable|string',
                'admin_notes' => 'nullable|string',
            ]);

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->patch("{$this->supabaseUrl}/rest/v1/campaigns?id=eq.{$id}", $request->all());

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $campaigns = $response->json();
            if (empty($campaigns)) {
                return response()->json(['message' => 'Campaign not found'], 404);
            }

            return response()->json($campaigns[0]);
        } catch (\Exception $e) {
            Log::error('Failed to update campaign', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->delete("{$this->supabaseUrl}/rest/v1/campaigns?id=eq.{$id}");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            return response()->json(['message' => 'Campaign deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete campaign', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Distribute campaign via SMS
     */
    public function distributeSMS(Request $request)
    {
        $request->validate([
            'phone_numbers' => 'required|array',
            'phone_numbers.*' => 'string',
            'campaign_title' => 'required|string',
            'campaign_description' => 'nullable|string',
        ]);

        $iProg = new IProgService();

        // Create SMS message from provided campaign data
        $message = "Barangay 178 Alert: {$request->campaign_title}\n\n";
        if ($request->campaign_description) {
            $message .= $request->campaign_description;
        }
        $message .= "\n\nVisit barangay178.gov.ph for more details.";

        $result = $iProg->sendBulkSMS($request->phone_numbers, $message);

        return response()->json([
            'message' => $result['success'] ? 'SMS distribution completed' : 'SMS distribution partially failed',
            'campaign_title' => $request->campaign_title,
            'distribution_result' => $result,
        ], $result['success'] ? 200 : 207);
    }

    /**
     * Get approved campaigns for distribution
     */
    public function getApprovedCampaigns()
    {
        try {
            Log::info('Fetching approved campaigns', [
                'supabase_url' => $this->supabaseUrl,
                'supabase_key_set' => !empty($this->supabaseKey),
            ]);

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/campaigns?status=in.(approved,published,active)&select=*&order=created_at.desc");

            Log::info('Supabase response for approved campaigns', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body(),
            ]);

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()} - {$response->body()}");
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch approved campaigns', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all resident phone numbers for SMS distribution
     */
    public function getResidentPhoneNumbers()
    {
        try {
            // Fetch phone numbers from users table via Supabase REST API
            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/users?select=phone&phone=not.is.null&phone=neq.");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $users = $response->json();
            $phoneNumbers = array_filter(array_column($users, 'phone'));

            return response()->json([
                'phone_numbers' => array_values($phoneNumbers),
                'total' => count($phoneNumbers),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch resident phone numbers', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Approve a campaign
     */
    public function approve(Request $request, $id)
    {
        try {
            Log::info('Approving campaign', ['campaign_id' => $id]);

            $updateData = [
                'status' => 'published',
                'approved_at' => now()->toISOString(),
            ];

            if ($request->has('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->patch("{$this->supabaseUrl}/rest/v1/campaigns?id=eq.{$id}", $updateData);

            Log::info('Supabase approve response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body(),
            ]);

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()} - {$response->body()}");
            }

            $campaigns = $response->json();
            if (empty($campaigns)) {
                return response()->json(['message' => 'Campaign not found'], 404);
            }

            return response()->json($campaigns[0]);
        } catch (\Exception $e) {
            Log::error('Failed to approve campaign', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reject a campaign
     */
    public function reject(Request $request, $id)
    {
        try {
            Log::info('Rejecting campaign', ['campaign_id' => $id]);

            $updateData = [
                'status' => 'rejected',
            ];

            if ($request->has('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->patch("{$this->supabaseUrl}/rest/v1/campaigns?id=eq.{$id}", $updateData);

            Log::info('Supabase reject response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body(),
            ]);

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()} - {$response->body()}");
            }

            $campaigns = $response->json();
            if (empty($campaigns)) {
                return response()->json(['message' => 'Campaign not found'], 404);
            }

            return response()->json($campaigns[0]);
        } catch (\Exception $e) {
            Log::error('Failed to reject campaign', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Request revision for a campaign
     */
    public function requestRevision(Request $request, $id)
    {
        try {
            Log::info('Requesting revision for campaign', ['campaign_id' => $id]);

            $request->validate([
                'admin_notes' => 'required|string',
            ]);

            $updateData = [
                'status' => 'needs_revision',
                'admin_notes' => $request->admin_notes,
            ];

            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type' => 'application/json',
                'Prefer' => 'return=representation',
            ])->patch("{$this->supabaseUrl}/rest/v1/campaigns?id=eq.{$id}", $updateData);

            Log::info('Supabase revision response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body(),
            ]);

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()} - {$response->body()}");
            }

            $campaigns = $response->json();
            if (empty($campaigns)) {
                return response()->json(['message' => 'Campaign not found'], 404);
            }

            return response()->json($campaigns[0]);
        } catch (\Exception $e) {
            Log::error('Failed to request revision', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }
}
