<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    #[Fillable([
        'title',
        'description',
        'start_date',
        'end_date',
        'target_audience',
        'status',
        'created_by',
        'priority',
        'budget',
        'location',
        'expected_reach',
        'campaign_type',
        'admin_notes'
    ])]

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'budget' => 'decimal:2',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }

    public function engagementLogs()
    {
        return $this->hasMany(EngagementLog::class);
    }
}
