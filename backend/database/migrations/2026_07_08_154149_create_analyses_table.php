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
        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->string('url');
            $table->timestamp('date_analyse')->useCurrent();
            $table->unsignedTinyInteger('score')->nullable();
            $table->enum('niveau_risque', ['bon', 'moyen', 'faible'])->nullable();
            $table->enum('statut', ['en_cours', 'terminee', 'echec'])->default('en_cours');
            $table->string('chemin_rapport_pdf')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analyses');
    }
};
