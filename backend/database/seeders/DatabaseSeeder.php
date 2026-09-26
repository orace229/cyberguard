<?php

namespace Database\Seeders;

use App\Models\ParametreScore;
use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        ParametreScore::actuels();

        Utilisateur::factory()->administrateur()->create([
            'nom' => 'Administrateur CyberGuard',
            'email' => 'admin@cyberguard.bj',
        ]);

        Utilisateur::factory()->create([
            'nom' => 'Utilisateur Test',
            'email' => 'test@cyberguard.bj',
        ]);
    }
}
