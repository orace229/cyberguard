<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class DeuxFacteursTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    public function test_demarrer_activation_retourne_un_secret(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur)
            ->postJson('/api/deux-facteurs/demarrer')
            ->assertOk();

        $this->assertNotEmpty($reponse->json('secret'));
        $this->assertNotEmpty($reponse->json('uri'));
        // Rien n'est encore persisté sur le compte tant que le code n'a pas
        // été confirmé.
        $this->assertNull($utilisateur->fresh()->deux_facteurs_secret);
    }

    public function test_confirmer_activation_avec_un_bon_code_active_le_2fa(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $google2fa = new Google2FA();

        $demarrage = $this->actingAs($utilisateur)
            ->postJson('/api/deux-facteurs/demarrer')
            ->assertOk();
        $secret = $demarrage->json('secret');

        $this->actingAs($utilisateur)
            ->postJson('/api/deux-facteurs/confirmer', ['code' => $google2fa->getCurrentOtp($secret)])
            ->assertOk();

        $utilisateur->refresh();
        $this->assertTrue($utilisateur->deuxFacteursActif());
    }

    public function test_confirmer_activation_avec_un_mauvais_code_echoue(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)->postJson('/api/deux-facteurs/demarrer');

        $this->actingAs($utilisateur)
            ->postJson('/api/deux-facteurs/confirmer', ['code' => '000000'])
            ->assertStatus(422);

        $this->assertFalse($utilisateur->fresh()->deuxFacteursActif());
    }

    public function test_connexion_avec_2fa_actif_demande_un_code_avant_douvrir_la_session(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $utilisateur = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('bonmotdepasse'),
            'deux_facteurs_secret' => $secret,
            'deux_facteurs_active_le' => now(),
        ]);

        $reponse = $this->postJson('/api/connexion', [
            'email' => $utilisateur->email,
            'mot_de_passe' => 'bonmotdepasse',
        ]);

        $reponse->assertOk()->assertJsonPath('deux_facteurs_requis', true);
        $this->assertGuest();
    }

    public function test_le_code_deux_facteurs_valide_termine_la_connexion(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $utilisateur = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('bonmotdepasse'),
            'deux_facteurs_secret' => $secret,
            'deux_facteurs_active_le' => now(),
        ]);

        $this->postJson('/api/connexion', [
            'email' => $utilisateur->email,
            'mot_de_passe' => 'bonmotdepasse',
        ])->assertOk();

        $this->postJson('/api/connexion/deux-facteurs', [
            'code' => $google2fa->getCurrentOtp($secret),
        ])->assertOk()->assertJsonPath('email', $utilisateur->email);

        $this->assertAuthenticatedAs($utilisateur);
    }

    public function test_un_code_deux_facteurs_invalide_ne_connecte_pas(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $utilisateur = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('bonmotdepasse'),
            'deux_facteurs_secret' => $secret,
            'deux_facteurs_active_le' => now(),
        ]);

        $this->postJson('/api/connexion', [
            'email' => $utilisateur->email,
            'mot_de_passe' => 'bonmotdepasse',
        ])->assertOk();

        $this->postJson('/api/connexion/deux-facteurs', ['code' => '000000'])
            ->assertStatus(422);

        $this->assertGuest();
    }

    public function test_verifier_deux_facteurs_sans_connexion_en_attente_echoue(): void
    {
        $this->postJson('/api/connexion/deux-facteurs', ['code' => '123456'])
            ->assertStatus(422);

        $this->assertGuest();
    }

    public function test_desactiver_le_2fa(): void
    {
        $utilisateur = Utilisateur::factory()->create([
            'deux_facteurs_secret' => (new Google2FA())->generateSecretKey(),
            'deux_facteurs_active_le' => now(),
        ]);

        $this->actingAs($utilisateur)
            ->deleteJson('/api/deux-facteurs')
            ->assertOk();

        $this->assertFalse($utilisateur->fresh()->deuxFacteursActif());
    }
}
