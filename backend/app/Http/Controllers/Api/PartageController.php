<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnalysePubliqueResource;
use App\Models\Analyse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Cas d'utilisation : Consulter les rapports (partage public).
 */
class PartageController extends Controller
{
    public function activer(Request $request, Analyse $analyse)
    {
        $this->autoriserAcces($request, $analyse);

        $analyse->update([
            'partage_actif' => true,
            'partage_token' => Str::random(40),
        ]);

        $urlFrontend = rtrim(config('app.frontend_url'), '/');

        return response()->json([
            'partage_actif' => true,
            'partage_token' => $analyse->partage_token,
            'url_publique' => "{$urlFrontend}/partage/{$analyse->partage_token}",
        ]);
    }

    public function desactiver(Request $request, Analyse $analyse)
    {
        $this->autoriserAcces($request, $analyse);

        // Le token est effacé, pas juste masqué : un lien désactivé doit
        // mourir pour de bon, et réactiver le partage génère un lien neuf.
        $analyse->update([
            'partage_actif' => false,
            'partage_token' => null,
        ]);

        return response()->json(['partage_actif' => false]);
    }

    public function afficherPublique(string $token)
    {
        $analyse = Analyse::where('partage_token', $token)
            ->where('partage_actif', true)
            ->firstOrFail();

        return new AnalysePubliqueResource($analyse);
    }

    private function autoriserAcces(Request $request, Analyse $analyse): void
    {
        if (! $analyse->estAccessiblePar($request->user())) {
            abort(403);
        }
    }
}
