<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthentificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Simule un appel du frontend SPA (même origine que
        // SANCTUM_STATEFUL_DOMAINS) : Sanctum n'active la session/cookie
        // que pour les requêtes reconnues comme provenant du frontend.
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    public function test_inscription_cree_un_compte_et_connecte_lutilisateur(): void
    {
        $reponse = $this->postJson('/api/inscription', [
            'nom' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'mot_de_passe' => 'motdepasse123',
            'mot_de_passe_confirmation' => 'motdepasse123',
        ]);

        $reponse->assertCreated()->assertJsonPath('email', 'ada@example.com');

        $this->assertDatabaseHas('utilisateurs', [
            'email' => 'ada@example.com',
            'role' => 'utilisateur',
        ]);
    }

    public function test_inscription_echoue_si_email_deja_utilise(): void
    {
        Utilisateur::factory()->create(['email' => 'existe@example.com']);

        $reponse = $this->postJson('/api/inscription', [
            'nom' => 'Doublon',
            'email' => 'existe@example.com',
            'mot_de_passe' => 'motdepasse123',
            'mot_de_passe_confirmation' => 'motdepasse123',
        ]);

        $reponse->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_inscription_echoue_si_mots_de_passe_differents(): void
    {
        $reponse = $this->postJson('/api/inscription', [
            'nom' => 'Test',
            'email' => 'test-confirm@example.com',
            'mot_de_passe' => 'motdepasse123',
            'mot_de_passe_confirmation' => 'autrechosealanflemme',
        ]);

        $reponse->assertStatus(422)->assertJsonValidationErrors('mot_de_passe');
    }

    public function test_connexion_reussie_avec_bons_identifiants(): void
    {
        Utilisateur::factory()->create([
            'email' => 'valide@example.com',
            'mot_de_passe' => Hash::make('bonmotdepasse'),
        ]);

        $reponse = $this->postJson('/api/connexion', [
            'email' => 'valide@example.com',
            'mot_de_passe' => 'bonmotdepasse',
        ]);

        $reponse->assertOk()->assertJsonPath('email', 'valide@example.com');
    }

    public function test_connexion_echoue_avec_mauvais_mot_de_passe(): void
    {
        Utilisateur::factory()->create([
            'email' => 'valide2@example.com',
            'mot_de_passe' => Hash::make('bonmotdepasse'),
        ]);

        $reponse = $this->postJson('/api/connexion', [
            'email' => 'valide2@example.com',
            'mot_de_passe' => 'mauvaismotdepasse',
        ]);

        $reponse->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_connexion_echoue_si_compte_desactive(): void
    {
        Utilisateur::factory()->create([
            'email' => 'desactive@example.com',
            'mot_de_passe' => Hash::make('bonmotdepasse'),
            'statut' => 'desactive',
        ]);

        $reponse = $this->postJson('/api/connexion', [
            'email' => 'desactive@example.com',
            'mot_de_passe' => 'bonmotdepasse',
        ]);

        $reponse->assertStatus(422);
    }

    public function test_moi_retourne_401_si_non_connecte(): void
    {
        $this->getJson('/api/moi')->assertStatus(401);
    }

    public function test_moi_retourne_lutilisateur_connecte(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->getJson('/api/moi')
            ->assertOk()
            ->assertJsonPath('id', $utilisateur->id);
    }

    public function test_deconnexion_termine_la_session(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->postJson('/api/deconnexion')
            ->assertNoContent();
    }

    public function test_une_route_protegee_est_inaccessible_sans_authentification(): void
    {
        $this->getJson('/api/analyses')->assertStatus(401);
    }
}
