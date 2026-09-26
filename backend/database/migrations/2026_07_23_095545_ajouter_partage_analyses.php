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
        Schema::table('analyses', function (Blueprint $table) {
            $table->boolean('partage_actif')->default(false)->after('chemin_rapport_pdf');
            // Jamais l'id numérique : un token opaque empêche l'énumération
            // des rapports d'autres utilisateurs via l'URL publique.
            $table->string('partage_token')->nullable()->unique()->after('partage_actif');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('analyses', function (Blueprint $table) {
            $table->dropColumn(['partage_actif', 'partage_token']);
        });
    }
};
