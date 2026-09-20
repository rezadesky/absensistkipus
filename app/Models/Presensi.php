<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    use HasFactory;

    protected $table = 'presensi';

    protected $fillable = [
        'user_id',
        'tanggal',
        'jam_masuk',
        'jam_pulang',
        'status',
        'latitude_masuk',
        'longitude_masuk',
        'latitude_pulang',
        'longitude_pulang',
        'foto_masuk',
        'foto_pulang',
        'keterangan',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
        'latitude_masuk' => 'float',
        'longitude_masuk' => 'float',
        'latitude_pulang' => 'float',
        'longitude_pulang' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
