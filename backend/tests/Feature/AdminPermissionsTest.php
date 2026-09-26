<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:5173');
    }

    public function test_un_utilisateur_normal_ne_peut_pas_lister_les_comptes(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->getJson('/api/admin/utilisateurs')
            ->assertStatus(403);
    }

    public function test_un_utilisateur_normal_ne_peut_pas_consulter_les_statistiques(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->getJson('/api/admin/statistiques')
            ->assertStatus(403);
    }

    public function test_un_utilisateur_normal_ne_peut_pas_modifier_les_parametres_de_score(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->putJson('/api/admin/parametres-score', [])
            ->assertStatus(403);
    }

    public function test_un_administrateur_peut_lister_les_comptes(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        Utilisateur::factory()->count(3)->create();

        $this->actingAs($admin)
            ->getJson('/api/admin/utilisateurs')
            ->assertOk();
    }

    public function test_un_administrateur_ne_peut_pas_desactiver_son_propre_compte(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/utilisateurs/{$admin->id}/statut")
            ->assertStatus(422);

        $this->assertDatabaseHas('utilisateurs', ['id' => $admin->id, 'statut' => 'actif']);
    }

    public function test_un_administrateur_ne_peut_pas_supprimer_son_propre_compte(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/utilisateurs/{$admin->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('utilisateurs', ['id' => $admin->id]);
    }

    public function test_un_administrateur_peut_desactiver_un_autre_utilisateur(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        $cible = Utilisateur::factory()->create(['statut' => 'actif']);

        $this->actingAs($admin)
            ->patchJson("/api/admin/utilisateurs/{$cible->id}/statut")
            ->assertOk()
            ->assertJsonPath('statut', 'desactive');
    }

    public function test_un_administrateur_peut_promouvoir_un_utilisateur(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        $cible = Utilisateur::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/utilisateurs/{$cible->id}/role")
            ->assertOk()
            ->assertJsonPath('role', 'administrateur');
    }

    public function test_un_administrateur_peut_retrograder_un_autre_administrateur(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();
        $autreAdmin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/utilisateurs/{$autreAdmin->id}/role")
            ->assertOk()
            ->assertJsonPath('role', 'utilisateur');
    }

    public function test_un_administrateur_ne_peut_pas_modifier_son_propre_role(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/utilisateurs/{$admin->id}/role")
            ->assertStatus(422);

        $this->assertDatabaseHas('utilisateurs', ['id' => $admin->id, 'role' => 'administrateur']);
    }

    public function test_un_administrateur_peut_se_retrouver_seul_administrateur_restant(): void
    {
        // Il n'existe pas de garde "dernier administrateur" séparée : la
        // protection contre l'auto-modification suffit, puisque l'auteur de
        // la requête est toujours lui-même administrateur (sinon il
        // n'atteindrait pas cette route) et compte donc comme "un autre
        // administrateur" tant qu'il ne se cible pas lui-même. On vérifie
        // ici qu'un admin peut légitimement rétrograder le tout dernier
        // autre administrateur, sans se retrouver bloqué.
        $admin = Utilisateur::factory()->administrateur()->create();
        $dernierAutreAdmin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/utilisateurs/{$dernierAutreAdmin->id}/role")
            ->assertOk()
            ->assertJsonPath('role', 'utilisateur');

        $this->assertDatabaseCount('utilisateurs', 2);
        $this->assertSame(1, Utilisateur::where('role', 'administrateur')->count());
    }

    public function test_un_utilisateur_normal_ne_peut_pas_changer_de_role(): void
    {
        $utilisateur = Utilisateur::factory()->create();
        $cible = Utilisateur::factory()->create();

        $this->actingAs($utilisateur)
            ->patchJson("/api/admin/utilisateurs/{$cible->id}/role")
            ->assertStatus(403);
    }

    public function test_les_ponderations_de_score_doivent_totaliser_100(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->putJson('/api/admin/parametres-score', [
                'poids_https' => 50,
                'poids_certificat_ssl' => 15,
                'poids_headers' => 25,
                'poids_cookies' => 10,
                'poids_vulnerabilites' => 15,
                'poids_fichiers_exposes' => 10,
                'poids_email_securise' => 5,
                'seuil_bon' => 75,
                'seuil_moyen' => 40,
            ])
            ->assertStatus(422);
    }

    public function test_les_ponderations_de_score_sont_acceptees_si_la_somme_vaut_100(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->putJson('/api/admin/parametres-score', [
                'poids_https' => 20,
                'poids_certificat_ssl' => 15,
                'poids_headers' => 25,
                'poids_cookies' => 10,
                'poids_vulnerabilites' => 15,
                'poids_fichiers_exposes' => 10,
                'poids_email_securise' => 5,
                'seuil_bon' => 75,
                'seuil_moyen' => 40,
            ])
            ->assertOk();
    }

    public function test_le_seuil_moyen_doit_etre_inferieur_au_seuil_bon(): void
    {
        $admin = Utilisateur::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->putJson('/api/admin/parametres-score', [
                'poids_https' => 20,
                'poids_certificat_ssl' => 15,
                'poids_headers' => 25,
                'poids_cookies' => 10,
                'poids_vulnerabilites' => 15,
                'poids_fichiers_exposes' => 10,
                'poids_email_securise' => 5,
                'seuil_bon' => 50,
                'seuil_moyen' => 60,
            ])
            ->assertStatus(422);
    }
}
