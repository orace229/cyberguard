<?php

namespace Tests\Unit;

use App\Jobs\TraiterAnalyseJob;
use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class LancerSurveillanceContinueTest extends TestCase
{
    use RefreshDatabase;

    private function creerAnalyse(Utilisateur $utilisateur, array $etats = []): Analyse
    {
        return Analyse::factory()->create(array_merge([
            'utilisateur_id' => $utilisateur->id,
            'statut' => 'terminee',
        ], $etats));
    }

    public function test_relance_uniquement_les_analyses_dues(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $due = $this->creerAnalyse($utilisateur, [
            'surveillance_continue' => true,
            'derniere_surveillance_le' => now()->subDays(10),
        ]);
        $pasEncoreDue = $this->creerAnalyse($utilisateur, [
            'surveillance_continue' => true,
            'derniere_surveillance_le' => now()->subDays(2),
        ]);
        $inactive = $this->creerAnalyse($utilisateur, [
            'surveillance_continue' => false,
        ]);
        $enCours = $this->creerAnalyse($utilisateur, [
            'surveillance_continue' => true,
            'derniere_surveillance_le' => now()->subDays(10),
            'statut' => 'en_cours',
        ]);
        $jamaisEncoreSurveillee = $this->creerAnalyse($utilisateur, [
            'surveillance_continue' => true,
            'derniere_surveillance_le' => null,
        ]);

        $this->artisan('analyses:surveiller')->assertSuccessful();

        Queue::assertPushed(TraiterAnalyseJob::class, 2);

        $this->assertNotNull($due->fresh()->derniere_surveillance_le);
        $this->assertTrue($due->fresh()->derniere_surveillance_le->greaterThan(now()->subMinute()));
        $this->assertNotNull($jamaisEncoreSurveillee->fresh()->derniere_surveillance_le);

        // Non concernées : la date ne doit pas bouger.
        $this->assertTrue($pasEncoreDue->fresh()->derniere_surveillance_le->equalTo($pasEncoreDue->derniere_surveillance_le));
        $this->assertNull($inactive->fresh()->derniere_surveillance_le);
        $this->assertTrue($enCours->fresh()->derniere_surveillance_le->equalTo($enCours->derniere_surveillance_le));
    }

    public function test_cree_une_nouvelle_ligne_danalyse_plutot_que_de_muter_lancienne(): void
    {
        Queue::fake();
        $utilisateur = Utilisateur::factory()->create();

        $source = $this->creerAnalyse($utilisateur, [
            'url' => 'https://exemple-surveille.bj',
            'score' => 60,
            'surveillance_continue' => true,
            'derniere_surveillance_le' => now()->subDays(10),
        ]);

        $this->artisan('analyses:surveiller');

        $this->assertSame(60, $source->fresh()->score);
        $this->assertSame(2, Analyse::where('url', 'https://exemple-surveille.bj')->count());

        $nouvelle = Analyse::where('url', 'https://exemple-surveille.bj')->where('id', '!=', $source->id)->first();
        $this->assertSame('en_cours', $nouvelle->statut);
        $this->assertSame($utilisateur->id, $nouvelle->utilisateur_id);
    }

    public function test_respecte_le_plafond_par_lot(): void
    {
        Queue::fake();
        config(['surveillance.lot_max' => 2]);
        $utilisateur = Utilisateur::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->creerAnalyse($utilisateur, [
                'surveillance_continue' => true,
                'derniere_surveillance_le' => now()->subDays(10),
            ]);
        }

        $this->artisan('analyses:surveiller');

        Queue::assertPushed(TraiterAnalyseJob::class, 2);
    }
}
