<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengaturanAbsensi extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_absensi';

    protected $fillable = [
        'nama_instansi',
        'latitude',
        'longitude',
        'radius_meter',
        'jam_masuk',
        'toleransi_keterlambatan_menit',
        'jam_pulang',
        'wajib_foto',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meter' => 'integer',
        'toleransi_keterlambatan_menit' => 'integer',
        'wajib_foto' => 'boolean',
    ];
}
