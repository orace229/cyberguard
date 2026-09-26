<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use App\Notifications\VerifierEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    public function test_inscription_envoie_un_email_de_verification(): void
    {
        Notification::fake();

        $reponse = $this->postJson('/api/inscription', [
            'nom' => 'Nouvel Utilisateur',
            'email' => 'nouveau@example.com',
            'mot_de_passe' => 'motdepasse123',
            'mot_de_passe_confirmation' => 'motdepasse123',
        ])->assertCreated();

        $utilisateur = Utilisateur::where('email', 'nouveau@example.com')->firstOrFail();

        Notification::assertSentTo($utilisateur, VerifierEmailNotification::class);
        $this->assertNull($utilisateur->email_verified_at);
    }

    public function test_un_lien_de_verification_valide_marque_lemail_comme_verifie(): void
    {
        $utilisateur = Utilisateur::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $utilisateur->id,
            'hash' => sha1($utilisateur->email),
        ]);

        $this->get($url)->assertRedirect();
        $this->assertNotNull($utilisateur->fresh()->email_verified_at);
    }

    public function test_un_hash_invalide_est_rejete(): void
    {
        $utilisateur = Utilisateur::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $utilisateur->id,
            'hash' => sha1('mauvaise-adresse@example.com'),
        ]);

        $reponse = $this->get($url);

        $reponse->assertRedirectContains('statut=echec');
        $this->assertNull($utilisateur->fresh()->email_verified_at);
    }

    public function test_un_lien_non_signe_est_rejete(): void
    {
        $utilisateur = Utilisateur::factory()->unverified()->create();

        $this->get("/api/email/verifier/{$utilisateur->id}/".sha1($utilisateur->email))
            ->assertForbidden();

        $this->assertNull($utilisateur->fresh()->email_verified_at);
    }

    public function test_verifier_un_email_deja_verifie_le_signale(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $utilisateur->id,
            'hash' => sha1($utilisateur->email),
        ]);

        $this->get($url)->assertRedirectContains('statut=deja_verifie');
    }

    public function test_renvoyer_necessite_detre_authentifie(): void
    {
        $this->postJson('/api/email/renvoyer')->assertUnauthorized();
    }

    public function test_renvoyer_envoie_une_nouvelle_notification(): void
    {
        Notification::fake();

        $utilisateur = Utilisateur::factory()->unverified()->create();

        $this->actingAs($utilisateur)
            ->postJson('/api/email/renvoyer')
            ->assertOk();

        Notification::assertSentTo($utilisateur, VerifierEmailNotification::class);
    }

    public function test_renvoyer_refuse_si_deja_verifie(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->postJson('/api/email/renvoyer')
            ->assertStatus(422);
    }
}
