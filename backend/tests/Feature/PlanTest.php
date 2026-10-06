<?php

namespace Tests\Feature;

use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_utilisateur_voit_les_details_de_son_plan_gratuit(): void
    {
        $user = Utilisateur::factory()->create(['plan' => 'gratuit']);

        $response = $this->actingAs($user)->getJson('/api/plan');

        $response->assertStatus(200)
            ->assertJson([
                'plan' => 'gratuit',
                'est_payant' => false,
                'limite_mensuelle' => 1,
                'analyses_restantes' => 1,
            ]);
    }

    public function test_un_utilisateur_gratuit_ne_peut_pas_depasser_son_quota(): void
    {
        $user = Utilisateur::factory()->create(['plan' => 'gratuit']);

        // Crée 1 analyse effectuée ce mois-ci
        Analyse::factory()->create([
            'utilisateur_id' => $user->id,
            'date_analyse' => now(),
        ]);

        // La deuxième tentative d'analyse doit être bloquée avec HTTP 403
        $response = $this->actingAs($user)->postJson('/api/analyses', [
            'url' => 'https://exemple.bj',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'code' => 'QUOTA_ATTEINT',
            ]);
    }

    public function test_un_utilisateur_peut_passer_au_plan_pro(): void
    {
        $user = Utilisateur::factory()->create(['plan' => 'gratuit']);

        $response = $this->actingAs($user)->postJson('/api/plan/changer', [
            'plan' => 'pro',
            'methode_paiement' => 'momo',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'plan' => 'pro',
                'est_payant' => true,
            ]);

        $this->assertTrue($user->fresh()->estPro());
    }

    public function test_un_membre_pro_a_des_analyses_illimitees(): void
    {
        $user = Utilisateur::factory()->create(['plan' => 'pro']);

        // Même avec 5 analyses déjà faites, le membre pro peut relancer des analyses sans blocage
        Analyse::factory()->count(5)->create([
            'utilisateur_id' => $user->id,
            'date_analyse' => now(),
        ]);

        $response = $this->actingAs($user)->postJson('/api/analyses', [
            'url' => 'https://exemple.bj',
        ]);

        $response->assertStatus(202);
    }
}
