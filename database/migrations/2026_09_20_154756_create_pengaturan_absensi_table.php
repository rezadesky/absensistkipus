<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pengaturan_absensi', function (Blueprint $table) {
            $table->id();
            $table->string('nama_instansi')->default('STKIP Usman Safri Kutacane');
            $table->decimal('latitude', 10, 8)->default(3.486250); // Default koordinat kampus STKIP Usman Safri
            $table->decimal('longitude', 11, 8)->default(97.809167);
            $table->integer('radius_meter')->default(150); // Radius geofence dalam meter
            $table->time('jam_masuk')->default('08:00:00');
            $table->integer('toleransi_keterlambatan_menit')->default(15);
            $table->time('jam_pulang')->default('16:00:00');
            $table->boolean('wajib_foto')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pengaturan_absensi');
    }
};
