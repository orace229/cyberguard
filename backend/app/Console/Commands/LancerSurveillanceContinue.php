<?php

namespace App\Console\Commands;

use App\Jobs\TraiterAnalyseJob;
use App\Models\Analyse;
use Illuminate\Console\Command;

/**
 * Cas d'utilisation : Surveiller un site (re-scan périodique, opt-in).
 *
 * Relance les analyses dont le propriétaire a explicitement activé la
 * surveillance continue et dont l'intervalle est écoulé. Plafonné par lot
 * ("surveillance.lot_max") pour la même raison que le throttle sur
 * POST /analyses : chaque re-scan déclenche une dizaine de requêtes réseau
 * vers un site tiers.
 */
class LancerSurveillanceContinue extends Command
{
    protected $signature = 'analyses:surveiller';

    protected $description = "Relance les analyses sous surveillance continue dont l'intervalle est écoulé";

    public function handle(): int
    {
        $intervalle = (int) config('surveillance.intervalle_jours');
        $lotMax = (int) config('surveillance.lot_max');

        $dues = Analyse::where('surveillance_continue', true)
            ->where('statut', '!=', 'en_cours')
            ->where(function ($requete) use ($intervalle) {
                $requete->whereNull('derniere_surveillance_le')
                    ->orWhere('derniere_surveillance_le', '<=', now()->subDays($intervalle));
            })
            ->limit($lotMax)
            ->get();

        foreach ($dues as $source) {
            $nouvelleAnalyse = Analyse::create([
                'utilisateur_id' => $source->utilisateur_id,
                'url' => $source->url,
                'date_analyse' => now(),
                'statut' => 'en_cours',
            ]);

            TraiterAnalyseJob::dispatch($nouvelleAnalyse);

            $source->update(['derniere_surveillance_le' => now()]);
        }

        $this->info(\sprintf('%d analyse(s) relancée(s) sous surveillance continue.', $dues->count()));

        return self::SUCCESS;
    }
}
