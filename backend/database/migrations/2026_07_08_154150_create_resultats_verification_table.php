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
        Schema::create('resultats_verification', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analyse_id')->constrained('analyses')->cascadeOnDelete();
            $table->string('type', 50);
            $table->enum('statut', ['conforme', 'non_conforme']);
            $table->text('description');
            $table->text('recommandation')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultats_verification');
    }
};
