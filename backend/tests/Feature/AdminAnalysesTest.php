<?php

namespace Tests\Feature;

use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminAnalysesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    public function test_un_utilisateur_normal_ne_peut_pas_lister_toutes_les_analyses(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->getJson('/api/admin/analyses')
            ->assertStatus(403);
    }

    public function test_un_administrateur_peut_lister_les_analyses_de_tous_les_utilisateurs(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        $premier = Utilisateur::factory()->create();
        $second = Utilisateur::factory()->create();
        Analyse::factory()->for($premier, 'utilisateur')->create(['date_analyse' => now()->subMinute()]);
        Analyse::factory()->for($second, 'utilisateur')->create(['date_analyse' => now()]);

        $reponse = $this->actingAs($admin)
            ->getJson('/api/admin/analyses')
            ->assertOk();

        $this->assertSame(2, $reponse->json('total'));
        $reponse->assertJsonPath('data.0.utilisateur.email', $second->email);
    }

    public function test_la_recherche_filtre_par_url_ou_par_proprietaire(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        $cible = Utilisateur::factory()->create(['nom' => 'Jean Dupont']);
        Analyse::factory()->for($cible, 'utilisateur')->create(['url' => 'https://exemple-cible.test']);
        Analyse::factory()->create(['url' => 'https://autre-site.test']);

        $parUrl = $this->actingAs($admin)
            ->getJson('/api/admin/analyses?recherche=exemple-cible')
            ->assertOk();
        $this->assertSame(1, $parUrl->json('total'));

        $parProprietaire = $this->actingAs($admin)
            ->getJson('/api/admin/analyses?recherche=Dupont')
            ->assertOk();
        $this->assertSame(1, $parProprietaire->json('total'));
    }

    public function test_le_filtre_niveau_de_risque_fonctionne(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        Analyse::factory()->create(['niveau_risque' => 'faible']);
        Analyse::factory()->create(['niveau_risque' => 'bon']);

        $reponse = $this->actingAs($admin)
            ->getJson('/api/admin/analyses?niveau_risque=faible')
            ->assertOk();

        $this->assertSame(1, $reponse->json('total'));
        $reponse->assertJsonPath('data.0.niveau_risque', 'faible');
    }

    public function test_un_administrateur_peut_supprimer_une_analyse_dun_tiers(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        $analyse = Analyse::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/analyses/{$analyse->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('analyses', ['id' => $analyse->id]);
    }

    public function test_supprimer_une_analyse_supprime_aussi_son_rapport_pdf(): void
    {
        Storage::fake('local');
        $admin = Utilisateur::factory()->administrateur()->create();
        $analyse = Analyse::factory()->create(['chemin_rapport_pdf' => 'rapports/test.pdf']);
        Storage::disk('local')->put('rapports/test.pdf', 'contenu-fictif');

        $this->actingAs($admin)
            ->deleteJson("/api/admin/analyses/{$analyse->id}")
            ->assertNoContent();

        Storage::disk('local')->assertMissing('rapports/test.pdf');
    }

    public function test_un_utilisateur_normal_ne_peut_pas_supprimer_lanalyse_dun_tiers(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $analyse = Analyse::factory()->create();

        $this->actingAs($utilisateur)
            ->deleteJson("/api/admin/analyses/{$analyse->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('analyses', ['id' => $analyse->id]);
    }
}
