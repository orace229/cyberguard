<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class ConnexionGoogleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Intentionnellement PAS de Referer vers le frontend ici : un vrai
        // retour depuis Google arrive avec un Referer pointant vers
        // accounts.google.com (ou aucun), jamais vers notre frontend. Un
        // Referer localhost:5173 masquerait un vrai bug (session non
        // démarrée sur le chemin de retour Google).
        $this->withHeader('Referer', 'https://accounts.google.com/');
    }

    public function test_la_redirection_pointe_vers_google(): void
    {
        $reponse = $this->get('/api/auth/google/redirect');

        $reponse->assertStatus(302);
        $this->assertStringContainsString('accounts.google.com', $reponse->headers->get('Location'));
    }

    public function test_le_callback_refuse_de_creer_un_compte_si_lemail_nexiste_pas(): void
    {
        // Google n'est qu'un mode de connexion, jamais un mode d'inscription :
        // sans compte préexistant, on refuse et on invite à s'inscrire d'abord.
        $this->simulerUtilisateurGoogle('inconnu@gmail.com', 'Personne Inconnue');

        $reponse = $this->get('/api/auth/google/callback');

        $reponse->assertRedirect('http://localhost:5173/?erreur_google=compte_introuvable');
        $this->assertDatabaseMissing('utilisateurs', ['email' => 'inconnu@gmail.com']);
        $this->assertGuest();
    }

    public function test_le_callback_connecte_un_compte_existant_par_email(): void
    {
        $existant = Utilisateur::factory()->create(['email' => 'deja-inscrit@gmail.com']);

        $this->simulerUtilisateurGoogle('deja-inscrit@gmail.com', 'Peu importe');

        $reponse = $this->get('/api/auth/google/callback');

        $reponse->assertRedirect('http://localhost:5173/accueil');
        $this->assertAuthenticatedAs($existant);
        $this->assertDatabaseCount('utilisateurs', 1);
    }

    public function test_le_callback_refuse_un_compte_desactive(): void
    {
        Utilisateur::factory()->create(['email' => 'desactive@gmail.com', 'statut' => 'desactive']);

        $this->simulerUtilisateurGoogle('desactive@gmail.com', 'Compte désactivé');

        $reponse = $this->get('/api/auth/google/callback');

        $reponse->assertRedirect('http://localhost:5173/?erreur_google=compte_desactive');
        $this->assertGuest();
    }

    public function test_le_callback_redirige_avec_une_erreur_si_google_echoue(): void
    {
        Socialite::shouldReceive('driver->stateless->user')->andThrow(new \Exception('échec OAuth'));

        $reponse = $this->get('/api/auth/google/callback');

        $reponse->assertRedirect('http://localhost:5173/?erreur_google=echec');
        $this->assertGuest();
    }

    private function simulerUtilisateurGoogle(string $email, string $nom): void
    {
        $utilisateurGoogle = Mockery::mock(SocialiteUser::class);
        $utilisateurGoogle->shouldReceive('getEmail')->andReturn($email);
        $utilisateurGoogle->shouldReceive('getName')->andReturn($nom);

        Socialite::shouldReceive('driver->stateless->user')->andReturn($utilisateurGoogle);
    }
}
