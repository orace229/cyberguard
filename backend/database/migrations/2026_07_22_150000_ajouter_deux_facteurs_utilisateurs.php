<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Authentification à deux facteurs (TOTP) — pensée en priorité pour les
     * comptes administrateurs, qui représentent une cible plus sensible
     * qu'un compte utilisateur standard, mais ouverte à tout compte.
     */
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->text('deux_facteurs_secret')->nullable()->after('mot_de_passe');
            $table->timestamp('deux_facteurs_active_le')->nullable()->after('deux_facteurs_secret');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn(['deux_facteurs_secret', 'deux_facteurs_active_le']);
        });
    }
};
