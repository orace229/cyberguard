<?php

namespace Database\Seeders;

use App\Models\ParametreScore;
use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        ParametreScore::actuels();

        Utilisateur::firstOrCreate(
            ['email' => 'admin@cyberguard.bj'],
            [
                'nom' => 'Administrateur CyberGuard',
                'mot_de_passe' => Hash::make('Password123!'),
                'role' => 'admin',
                'statut' => 'actif',
                'email_verified_at' => now(),
            ]
        );

        Utilisateur::firstOrCreate(
            ['email' => 'test@cyberguard.bj'],
            [
                'nom' => 'Utilisateur Test',
                'mot_de_passe' => Hash::make('Password123!'),
                'role' => 'utilisateur',
                'statut' => 'actif',
                'email_verified_at' => now(),
            ]
        );
    }
}
