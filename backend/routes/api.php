<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\WorkflowController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend is running',
        'timestamp' => now()
    ]);
});

Route::get('/campaigns/test', [CampaignController::class, 'test']);

// Simple test route without controller
Route::get('/simple-test', function () {
    return response()->json([
        'message' => 'Simple test works',
        'data' => ['item1', 'item2', 'item3']
    ]);
});

// Public campaign routes — these MUST be registered BEFORE any resource
// route that defines a {campaign} wildcard, otherwise "approved" gets
// captured as a campaign ID and hits the auth middleware.
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/approved', [CampaignController::class, 'getApprovedCampaigns']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management — admin-only delete that removes the Supabase Auth account too
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Campaign routes — exclude 'index' since it's public above.
    // 'show' (GET /campaigns/{campaign}) is kept here so it requires auth.
    Route::apiResource('campaigns', CampaignController::class)->except(['index']);
    Route::get('/campaigns/resident-phone-numbers', [CampaignController::class, 'getResidentPhoneNumbers']);
    Route::post('/campaigns/{id}/approve', [CampaignController::class, 'approve']);
    Route::post('/campaigns/{id}/reject', [CampaignController::class, 'reject']);
    Route::post('/campaigns/{id}/request-revision', [CampaignController::class, 'requestRevision']);

    // Content routes
    Route::apiResource('contents', ContentController::class);
    Route::get('/campaigns/{campaignId}/contents', [ContentController::class, 'index']);

    // AI routes
    Route::post('/ai/text-to-speech', [AIController::class, 'textToSpeech']);
    Route::post('/ai/generate-text', [AIController::class, 'generateText']);
    Route::post('/ai/rewrite', [AIController::class, 'rewrite']);
});

// Public SMS distribution route (for testing - add auth in production)
Route::post('/campaigns/distribute-sms', [CampaignController::class, 'distributeSMS']);

// Workflow metrics route (for Process Monitoring Dashboard)
Route::get('/workflow/metrics', [WorkflowController::class, 'getMetrics']);
Route::post('/workflow/escalation-check', [WorkflowController::class, 'runEscalationCheck']);
