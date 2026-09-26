<?php

namespace Tests\Feature;

use App\Jobs\TraiterAnalyseJob;
use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AnalyseControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    public function test_une_url_vers_une_adresse_privee_cree_lanalyse_pour_traitement_asynchrone(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur)->postJson('/api/analyses', [
            'url' => 'http://127.0.0.1:8000/api/moi',
        ]);

        $reponse->assertStatus(202);
        $this->assertDatabaseHas('analyses', [
            'url' => 'http://127.0.0.1:8000/api/moi',
            'utilisateur_id' => $utilisateur->id,
        ]);
        Queue::assertPushed(TraiterAnalyseJob::class);
    }

    public function test_une_url_vers_une_adresse_de_reseau_local_cree_lanalyse_pour_traitement_asynchrone(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur)->postJson('/api/analyses', [
            'url' => 'http://192.168.1.1/',
        ]);

        $reponse->assertStatus(202);
        $this->assertDatabaseHas('analyses', [
            'url' => 'http://192.168.1.1/',
            'utilisateur_id' => $utilisateur->id,
        ]);
        Queue::assertPushed(TraiterAnalyseJob::class);
    }

    public function test_une_url_sans_schema_est_completee_et_acceptee(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur)->postJson('/api/analyses', [
            'url' => 'pas-une-url',
        ]);

        $reponse->assertStatus(202);
        $this->assertDatabaseHas('analyses', [
            'url' => 'https://pas-une-url',
            'utilisateur_id' => $utilisateur->id,
        ]);
        Queue::assertPushed(TraiterAnalyseJob::class);
    }

    public function test_une_url_publique_valide_cree_lanalyse_et_met_le_job_en_file(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur)->postJson('/api/analyses', [
            'url' => 'https://example.com',
        ]);

        $reponse->assertStatus(202)->assertJsonPath('statut', 'en_cours');

        $this->assertDatabaseHas('analyses', [
            'url' => 'https://example.com',
            'utilisateur_id' => $utilisateur->id,
            'statut' => 'en_cours',
        ]);

        Queue::assertPushed(TraiterAnalyseJob::class, function (TraiterAnalyseJob $job) use ($reponse) {
            return $job->analyse->id === $reponse->json('id');
        });
    }

    public function test_une_url_sans_schema_est_completee_en_https(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur)->postJson('/api/analyses', [
            'url' => 'example.com',
        ]);

        $reponse->assertStatus(202);
        $this->assertDatabaseHas('analyses', [
            'url' => 'https://example.com',
            'utilisateur_id' => $utilisateur->id,
        ]);
    }

    public function test_un_utilisateur_ne_peut_pas_consulter_lanalyse_dun_autre(): void
    {
        $proprietaire = Utilisateur::factory()->create();
        $autre = Utilisateur::factory()->create();
        $analyse = Analyse::factory()->for($proprietaire, 'utilisateur')->create();

        $this->actingAs($autre)
            ->getJson("/api/analyses/{$analyse->id}")
            ->assertStatus(403);
    }

    public function test_un_administrateur_peut_consulter_lanalyse_dun_autre_utilisateur(): void
    {
        $proprietaire = Utilisateur::factory()->create();
        $admin = Utilisateur::factory()->administrateur()->create();
        $analyse = Analyse::factory()->for($proprietaire, 'utilisateur')->create();

        $this->actingAs($admin)
            ->getJson("/api/analyses/{$analyse->id}")
            ->assertOk();
    }

    public function test_une_analyse_introuvable_retourne_404(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->getJson('/api/analyses/999999')
            ->assertStatus(404);
    }

    public function test_lhistorique_ne_retourne_que_les_analyses_de_lutilisateur_connecte(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $autre = Utilisateur::factory()->create();

        Analyse::factory()->for($utilisateur, 'utilisateur')->count(2)->create();
        Analyse::factory()->for($autre, 'utilisateur')->create();

        $reponse = $this->actingAs($utilisateur)->getJson('/api/analyses');

        $reponse->assertOk();
        $this->assertCount(2, $reponse->json('data'));
    }
}
