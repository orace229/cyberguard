<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Analyse;
use App\Models\ParametreScore;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ParametreController extends Controller
{
    /**
     * Cas d'utilisation : Administrer la plateforme (statistiques globales).
     */
    public function statistiques()
    {
        return response()->json([
            'total_utilisateurs' => Utilisateur::count(),
            'total_analyses' => Analyse::count(),
            'score_moyen_global' => (int) round(Analyse::where('statut', 'terminee')->avg('score') ?? 0),
            'repartition_risque' => [
                'bon' => Analyse::where('niveau_risque', 'bon')->count(),
                'moyen' => Analyse::where('niveau_risque', 'moyen')->count(),
                'faible' => Analyse::where('niveau_risque', 'faible')->count(),
            ],
        ]);
    }

    /**
     * Cas d'utilisation : Administrer la plateforme (paramètres de scoring).
     */
    public function afficherParametresScore()
    {
        return response()->json(ParametreScore::actuels());
    }

    /**
     * Cas d'utilisation : Administrer la plateforme (mise à jour des paramètres de scoring).
     */
    public function mettreAJourParametresScore(Request $request)
    {
        $data = $request->validate([
            'poids_https' => ['required', 'integer', 'min:0', 'max:100'],
            'poids_certificat_ssl' => ['required', 'integer', 'min:0', 'max:100'],
            'poids_headers' => ['required', 'integer', 'min:0', 'max:100'],
            'poids_cookies' => ['required', 'integer', 'min:0', 'max:100'],
            'poids_vulnerabilites' => ['required', 'integer', 'min:0', 'max:100'],
            'poids_fichiers_exposes' => ['required', 'integer', 'min:0', 'max:100'],
            'poids_email_securise' => ['required', 'integer', 'min:0', 'max:100'],
            'seuil_bon' => ['required', 'integer', 'min:0', 'max:100'],
            'seuil_moyen' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $sommePoids = $data['poids_https'] + $data['poids_certificat_ssl'] + $data['poids_headers']
            + $data['poids_cookies'] + $data['poids_vulnerabilites'] + $data['poids_fichiers_exposes']
            + $data['poids_email_securise'];
        if ($sommePoids !== 100) {
            throw ValidationException::withMessages([
                'poids_https' => ["La somme des pondérations doit être égale à 100 (actuellement {$sommePoids})."],
            ]);
        }

        if ($data['seuil_moyen'] >= $data['seuil_bon']) {
            throw ValidationException::withMessages([
                'seuil_moyen' => ['Le seuil "moyen" doit être strictement inférieur au seuil "bon".'],
            ]);
        }

        $parametres = ParametreScore::actuels();
        $parametres->update($data);

        return response()->json($parametres);
    }
}
