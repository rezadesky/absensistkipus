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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip')->nullable()->unique()->after('id');
            $table->string('nik')->nullable()->after('nip');
            $table->string('role_type')->default('dosen_tendik')->after('email'); // admin, pimpinan, dosen_tendik
            $table->string('jabatan')->nullable()->after('role_type');
            $table->string('unit_kerja')->nullable()->after('jabatan'); // Prodi PGSD, Prodi Matematika, Bagian Keuangan, BAAK, dll.
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('unit_kerja');
            $table->string('no_hp')->nullable()->after('jenis_kelamin');
            $table->string('foto')->nullable()->after('no_hp');
            $table->boolean('is_active')->default(true)->after('foto');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nip',
                'nik',
                'role_type',
                'jabatan',
                'unit_kerja',
                'jenis_kelamin',
                'no_hp',
                'foto',
                'is_active',
            ]);
        });
    }
};
