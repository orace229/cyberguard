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
        Schema::create('parametres_score', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('poids_https')->default(35);
            $table->unsignedTinyInteger('poids_headers')->default(30);
            $table->unsignedTinyInteger('poids_cookies')->default(15);
            $table->unsignedTinyInteger('poids_vulnerabilites')->default(20);
            $table->unsignedTinyInteger('seuil_bon')->default(75);
            $table->unsignedTinyInteger('seuil_moyen')->default(40);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametres_score');
    }
};
