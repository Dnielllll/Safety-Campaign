<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            // Update status enum to include approval workflow statuses
            $table->enum('status', ['draft', 'submitted', 'pending_approval', 'needs_revision', 'approved', 'published', 'rejected', 'archived', 'active', 'completed', 'cancelled'])
                ->default('draft')
                ->change();

            // Add new columns for approval workflow
            $table->string('campaign_type')->nullable()->after('target_audience');
            $table->text('admin_notes')->nullable()->after('description');

            // Make start_date and end_date nullable for flexibility
            $table->date('start_date')->nullable()->change();
            $table->date('end_date')->nullable()->change();
            $table->string('target_audience')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            // Revert status enum to original values
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])
                ->default('draft')
                ->change();

            // Remove new columns
            $table->dropColumn(['campaign_type', 'admin_notes']);

            // Revert nullable changes
            $table->date('start_date')->nullable(false)->change();
            $table->date('end_date')->nullable(false)->change();
            $table->string('target_audience')->nullable(false)->change();
        });
    }
};
