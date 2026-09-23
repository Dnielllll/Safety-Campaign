<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Campaign;
use App\Services\IProgService;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = Campaign::with('creator');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
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

        $campaign = Campaign::create([
            'title' => $request->title,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'target_audience' => $request->target_audience,
            'status' => $request->status ?? 'draft',
            'created_by' => $request->user()->id,
            'priority' => $request->priority ?? 'medium',
            'budget' => $request->budget,
            'location' => $request->location,
            'expected_reach' => $request->expected_reach,
            'campaign_type' => $request->campaign_type,
            'admin_notes' => $request->admin_notes,
        ]);

        return response()->json($campaign->load('creator'), 201);
    }

    public function show($id)
    {
        $campaign = Campaign::with(['creator', 'contents'])->findOrFail($id);
        return response()->json($campaign);
    }

    public function update(Request $request, $id)
    {
        $campaign = Campaign::findOrFail($id);

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

        $campaign->update($request->all());

        return response()->json($campaign->load('creator'));
    }

    public function destroy($id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();
        return response()->json(['message' => 'Campaign deleted successfully']);
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
        $campaigns = Campaign::whereIn('status', ['approved', 'published', 'active'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($campaigns);
    }

    /**
     * Get all resident phone numbers for SMS distribution
     */
    public function getResidentPhoneNumbers()
    {
        // Fetch phone numbers from users table (residents are users with phone numbers)
        // Using Supabase directly since Laravel models might not be synced
        $phoneNumbers = \DB::table('users')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->pluck('phone')
            ->toArray();

        return response()->json([
            'phone_numbers' => $phoneNumbers,
            'total' => count($phoneNumbers),
        ]);
    }
}
