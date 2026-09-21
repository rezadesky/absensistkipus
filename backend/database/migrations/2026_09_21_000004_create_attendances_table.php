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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('attendance_date')->index();
            $table->dateTime('check_in')->nullable();
            $table->enum('status', ['hadir', 'izin', 'tidak_hadir'])->default('hadir')->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique constraint: one attendance record per user per date
            $table->unique(['user_id', 'attendance_date']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attendances');
    }
};
