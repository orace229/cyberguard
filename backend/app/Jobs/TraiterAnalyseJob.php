<?php

namespace App\Jobs;

use App\Models\Analyse;
use App\Services\AnalyseSecuriteService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Exécute « Traiter l'analyse » en tâche de fond : le contrôleur répond
 * immédiatement après avoir créé l'analyse (statut "en_cours"), pendant que
 * ce job effectue les vérifications réseau (qui peuvent prendre 10-20s) sans
 * bloquer la requête HTTP de l'utilisateur.
 */
class TraiterAnalyseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 60;

    public function __construct(public Analyse $analyse)
    {
    }

    public function handle(AnalyseSecuriteService $service): void
    {
        $service->executer($this->analyse);
    }

    public function failed(\Throwable $exception): void
    {
        $this->analyse->update([
            'statut' => 'echec',
            'motif_echec' => 'Une erreur inattendue est survenue pendant le traitement.',
        ]);
    }
}
