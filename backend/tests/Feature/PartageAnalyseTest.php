<?php

namespace Tests\Feature;

use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartageAnalyseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    private function creerAnalyseTerminee(Utilisateur $proprietaire): Analyse
    {
        return Analyse::factory()->create([
            'utilisateur_id' => $proprietaire->id,
            'statut' => 'terminee',
            'score' => 82,
            'niveau_risque' => 'bon',
        ]);
    }

    public function test_le_proprietaire_peut_activer_le_partage(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur);

        $reponse = $this->actingAs($utilisateur)
            ->postJson("/api/analyses/{$analyse->id}/partage")
            ->assertOk();

        $reponse->assertJsonPath('partage_actif', true);
        $this->assertNotNull($reponse->json('partage_token'));
        $this->assertTrue($analyse->fresh()->partage_actif);
        $this->assertNotNull($analyse->fresh()->partage_token);
    }

    public function test_un_non_proprietaire_ne_peut_pas_activer_le_partage(): void
    {
        $proprietaire = Utilisateur::factory()->create();
        $autre = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($proprietaire);

        $this->actingAs($autre)
            ->postJson("/api/analyses/{$analyse->id}/partage")
            ->assertForbidden();
    }

    public function test_un_non_proprietaire_ne_peut_pas_desactiver_le_partage(): void
    {
        $proprietaire = Utilisateur::factory()->create();
        $autre = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($proprietaire);
        $analyse->update(['partage_actif' => true, 'partage_token' => 'jeton-test']);

        $this->actingAs($autre)
            ->deleteJson("/api/analyses/{$analyse->id}/partage")
            ->assertForbidden();
    }

    public function test_desactiver_efface_le_token(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur);
        $analyse->update(['partage_actif' => true, 'partage_token' => 'jeton-test']);

        $this->actingAs($utilisateur)
            ->deleteJson("/api/analyses/{$analyse->id}/partage")
            ->assertOk()
            ->assertJsonPath('partage_actif', false);

        $analyse->refresh();
        $this->assertFalse($analyse->partage_actif);
        $this->assertNull($analyse->partage_token);
    }

    public function test_le_rapport_public_ne_contient_que_les_champs_agreges(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur);
        $analyse->update(['partage_actif' => true, 'partage_token' => 'jeton-public']);

        $reponse = $this->getJson('/api/partage/jeton-public')->assertOk();

        $reponse->assertJsonStructure(['url', 'date_analyse', 'score', 'niveau_risque']);
        $reponse->assertJsonMissingPath('resultats_verification');
        $reponse->assertJsonMissingPath('chemin_rapport_pdf');
        $reponse->assertJsonMissingPath('utilisateur_id');
        $reponse->assertJsonMissingPath('utilisateur');
    }

    public function test_le_rapport_public_est_introuvable_si_partage_inactif(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur);
        $analyse->update(['partage_actif' => false, 'partage_token' => 'jeton-inactif']);

        $this->getJson('/api/partage/jeton-inactif')->assertNotFound();
    }

    public function test_le_rapport_public_est_introuvable_avec_un_token_invalide(): void
    {
        $this->getJson('/api/partage/token-qui-nexiste-pas')->assertNotFound();
    }

    public function test_lancien_token_devient_invalide_apres_desactivation(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur);
        $analyse->update(['partage_actif' => true, 'partage_token' => 'jeton-a-revoquer']);

        $this->actingAs($utilisateur)
            ->deleteJson("/api/analyses/{$analyse->id}/partage")
            ->assertOk();

        $this->getJson('/api/partage/jeton-a-revoquer')->assertNotFound();
    }
}
