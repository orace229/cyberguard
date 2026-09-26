<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sépare le poids HTTPS/certificat (auparavant partagé moitié-moitié) et
     * ajoute deux nouvelles catégories de contrôle (fichiers exposés,
     * sécurité email) pour approfondir le moteur d'analyse.
     */
    public function up(): void
    {
        Schema::table('parametres_score', function (Blueprint $table) {
            $table->unsignedTinyInteger('poids_certificat_ssl')->default(15)->after('poids_https');
            $table->unsignedTinyInteger('poids_fichiers_exposes')->default(10)->after('poids_vulnerabilites');
            $table->unsignedTinyInteger('poids_email_securise')->default(5)->after('poids_fichiers_exposes');
        });

        DB::table('parametres_score')->update([
            'poids_https' => 20,
            'poids_certificat_ssl' => 15,
            'poids_headers' => 25,
            'poids_cookies' => 10,
            'poids_vulnerabilites' => 15,
            'poids_fichiers_exposes' => 10,
            'poids_email_securise' => 5,
        ]);
    }

    public function down(): void
    {
        Schema::table('parametres_score', function (Blueprint $table) {
            $table->dropColumn(['poids_certificat_ssl', 'poids_fichiers_exposes', 'poids_email_securise']);
        });
    }
};
