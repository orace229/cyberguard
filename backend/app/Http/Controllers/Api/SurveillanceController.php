<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Analyse;
use Illuminate\Http\Request;

/**
 * Cas d'utilisation : Surveiller un site (re-scan périodique, opt-in).
 */
class SurveillanceController extends Controller
{
    public function activer(Request $request, Analyse $analyse)
    {
        $this->autoriserAcces($request, $analyse);

        // Une seule analyse surveillée par URL et par utilisateur : évite
        // de planifier deux re-scans indépendants pour la même cible si
        // plusieurs analyses passées portent sur la même URL.
        Analyse::where('utilisateur_id', $analyse->utilisateur_id)
            ->where('url', $analyse->url)
            ->where('id', '!=', $analyse->id)
            ->update(['surveillance_continue' => false]);

        // Initialisé à maintenant : le premier re-scan a lieu après un
        // intervalle complet, pas immédiatement à l'activation.
        $analyse->update([
            'surveillance_continue' => true,
            'derniere_surveillance_le' => now(),
        ]);

        return response()->json(['surveillance_continue' => true]);
    }

    public function desactiver(Request $request, Analyse $analyse)
    {
        $this->autoriserAcces($request, $analyse);

        $analyse->update(['surveillance_continue' => false]);

        return response()->json(['surveillance_continue' => false]);
    }

    private function autoriserAcces(Request $request, Analyse $analyse): void
    {
        if (! $analyse->estAccessiblePar($request->user())) {
            abort(403);
        }
    }
}
