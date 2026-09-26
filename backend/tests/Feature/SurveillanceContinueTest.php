<?php

namespace Tests\Feature;

use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveillanceContinueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    private function creerAnalyseTerminee(Utilisateur $proprietaire, array $etats = []): Analyse
    {
        return Analyse::factory()->create(array_merge([
            'utilisateur_id' => $proprietaire->id,
            'statut' => 'terminee',
        ], $etats));
    }

    public function test_le_proprietaire_peut_activer_la_surveillance(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur);

        $this->actingAs($utilisateur)
            ->postJson("/api/analyses/{$analyse->id}/surveillance")
            ->assertOk()
            ->assertJsonPath('surveillance_continue', true);

        $analyse->refresh();
        $this->assertTrue($analyse->surveillance_continue);
        $this->assertNotNull($analyse->derniere_surveillance_le);
    }

    public function test_un_non_proprietaire_ne_peut_pas_activer_la_surveillance(): void
    {
        $proprietaire = Utilisateur::factory()->create();
        $autre = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($proprietaire);

        $this->actingAs($autre)
            ->postJson("/api/analyses/{$analyse->id}/surveillance")
            ->assertForbidden();
    }

    public function test_desactiver_la_surveillance(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = $this->creerAnalyseTerminee($utilisateur, ['surveillance_continue' => true]);

        $this->actingAs($utilisateur)
            ->deleteJson("/api/analyses/{$analyse->id}/surveillance")
            ->assertOk()
            ->assertJsonPath('surveillance_continue', false);

        $this->assertFalse($analyse->fresh()->surveillance_continue);
    }

    public function test_activer_desactive_la_surveillance_sur_une_autre_analyse_de_la_meme_url(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $ancienne = $this->creerAnalyseTerminee($utilisateur, [
            'url' => 'https://meme-site.bj',
            'surveillance_continue' => true,
        ]);
        $nouvelle = $this->creerAnalyseTerminee($utilisateur, [
            'url' => 'https://meme-site.bj',
        ]);

        $this->actingAs($utilisateur)
            ->postJson("/api/analyses/{$nouvelle->id}/surveillance")
            ->assertOk();

        $this->assertFalse($ancienne->fresh()->surveillance_continue);
        $this->assertTrue($nouvelle->fresh()->surveillance_continue);
    }
}
