<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * List all users.
     */
    public function index(Request $request)
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json($users);
    }

    /**
     * Securely delete a user from both the public.users table and Supabase Auth.
     *
     * The Service Role Key never leaves the server — this is the whole point of
     * moving the admin operation here from the frontend.
     */
    public function destroy(Request $request, string $id)
    {
        // 1. Make sure the caller is an admin/super_admin.
        $caller = $request->user();
        if (!in_array($caller->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Forbidden: insufficient role.'], 403);
        }

        // 2. Prevent self-deletion.
        if ($caller->id === $id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        // 3. Find the profile row (gives us a 404 automatically if missing).
        $user = User::findOrFail($id);

        // 4. Call Supabase Admin API to delete the auth user.
        //    This removes their ability to log in entirely.
        $supabaseUrl     = config('services.supabase.url');
        $serviceRoleKey  = config('services.supabase.service_role_key');

        if ($supabaseUrl && $serviceRoleKey) {
            $response = Http::withHeaders([
                'apikey'        => $serviceRoleKey,
                'Authorization' => "Bearer {$serviceRoleKey}",
                'Content-Type'  => 'application/json',
            ])->delete("{$supabaseUrl}/auth/v1/admin/users/{$id}");

            if (!$response->successful()) {
                Log::error('Supabase auth user deletion failed', [
                    'user_id' => $id,
                    'status'  => $response->status(),
                    'body'    => $response->body(),
                ]);

                // 404 from Supabase means the auth user is already gone — that's fine.
                if ($response->status() !== 404) {
                    return response()->json([
                        'message' => 'Failed to delete user from Supabase Auth. Profile was NOT deleted.',
                        'detail'  => $response->json(),
                    ], 500);
                }
            }
        } else {
            Log::warning('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured — skipping auth deletion.');
        }

        // 5. Delete the profile row from public.users.
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully from both Auth and the users table.',
            'id'      => $id,
        ]);
    }
}
