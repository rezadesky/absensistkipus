<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'day',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
