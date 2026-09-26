<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le poids appliqué à chaque contrôle au moment de l'analyse, pour
     * pouvoir prioriser les recommandations (plan d'action) sans dépendre
     * du barème actuel — qui peut changer après coup via l'administration.
     */
    public function up(): void
    {
        Schema::table('resultats_verification', function (Blueprint $table) {
            $table->unsignedTinyInteger('poids')->default(0)->after('statut');
        });
    }

    public function down(): void
    {
        Schema::table('resultats_verification', function (Blueprint $table) {
            $table->dropColumn('poids');
        });
    }
};
