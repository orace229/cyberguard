<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\TraiterAnalyseJob;
use App\Models\Analyse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnalyseController extends Controller
{
    /**
     * Cas d'utilisation : Consulter les rapports (historique).
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'recherche' => ['nullable', 'string', 'max:255'],
            'niveau_risque' => ['nullable', 'in:bon,moyen,faible'],
        ]);

        return $request->user()
            ->analyses()
            ->when(
                $data['recherche'] ?? null,
                fn ($query, $recherche) => $query->where('url', 'like', '%'.$recherche.'%')
            )
            ->when(
                $data['niveau_risque'] ?? null,
                fn ($query, $niveau) => $query->where('niveau_risque', $niveau)
            )
            ->latest('date_analyse')
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Cas d'utilisation : Consulter le tableau de bord.
     */
    public function tableauDeBord(Request $request)
    {
        $utilisateur = $request->user();

        $totalAnalyses = $utilisateur->analyses()->count();

        $scoreMoyen = $utilisateur->analyses()->where('statut', 'terminee')->avg('score');

        $derniereAnalyse = $utilisateur->analyses()->latest('date_analyse')->first();

        $evolution = $utilisateur->analyses()
            ->where('statut', 'terminee')
            ->latest('date_analyse')
            ->limit(10)
            ->get(['date_analyse', 'score'])
            ->reverse()
            ->values();

        $derniersRapports = $utilisateur->analyses()
            ->latest('date_analyse')
            ->limit(5)
            ->get(['id', 'url', 'date_analyse', 'score', 'niveau_risque', 'statut']);

        return response()->json([
            'total_analyses' => $totalAnalyses,
            'score_moyen' => $scoreMoyen !== null ? (int) round($scoreMoyen) : null,
            'derniere_analyse' => $derniereAnalyse,
            'evolution' => $evolution,
            'derniers_rapports' => $derniersRapports,
        ]);
    }

    /**
     * Cas d'utilisation : Lancer une analyse → déclenche « Traiter l'analyse ».
     */
    public function store(Request $request)
    {
        // Un utilisateur qui saisit juste "exemple.bj" (sans schéma) ne doit
        // pas se heurter à une erreur de validation obscure : on suppose
        // HTTPS par défaut, comme le fait déjà le service d'analyse lorsqu'il
        // récupère la page.
        $urlBrute = trim((string) $request->input('url', ''));
        if ($urlBrute !== '' && ! preg_match('#^https?://#i', $urlBrute)) {
            $request->merge(['url' => 'https://'.$urlBrute]);
        }

        $data = $request->validate([
            'url' => ['required', 'string', 'max:255', 'url'],
        ]);

        // Pas de vérification DNS ici : dns_get_record() est un appel réseau
        // bloquant et sans timeout, qui peut retarder la réponse HTTP de
        // plusieurs secondes. Le contrôle anti-SSRF (hoteEstAutorise) est
        // déjà refait dans TraiterAnalyseJob avant toute vérification —
        // une URL refusée est simplement traitée en tâche de fond et
        // ressort avec statut "echec", sans bloquer l'utilisateur au clic.
        $analyse = $request->user()->analyses()->create([
            'url' => $data['url'],
            'date_analyse' => now(),
            'statut' => 'en_cours',
        ]);

        // Le traitement (requêtes réseau qui peuvent prendre 10-20s) est
        // délégué à une file d'attente pour ne pas bloquer la requête HTTP
        // de l'utilisateur : le frontend interroge périodiquement le statut.
        TraiterAnalyseJob::dispatch($analyse);

        return response()->json($analyse, 202);
    }

    /**
     * Cas d'utilisation : Consulter les rapports (détail).
     */
    public function show(Request $request, Analyse $analyse)
    {
        $this->autoriserAcces($request, $analyse);

        return $analyse->load('resultatsVerification');
    }

    /**
     * Cas d'utilisation : Consulter les rapports (téléchargement du PDF).
     */
    public function telechargerRapport(Request $request, Analyse $analyse)
    {
        $this->autoriserAcces($request, $analyse);

        if (! $analyse->chemin_rapport_pdf || ! Storage::disk('local')->exists($analyse->chemin_rapport_pdf)) {
            abort(404, 'Rapport non disponible pour cette analyse.');
        }

        return Storage::disk('local')->download(
            $analyse->chemin_rapport_pdf,
            'rapport-analyse-'.$analyse->id.'.pdf'
        );
    }

    private function autoriserAcces(Request $request, Analyse $analyse): void
    {
        if (! $analyse->estAccessiblePar($request->user())) {
            abort(403);
        }
    }
}