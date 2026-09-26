<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Analyse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnalyseController extends Controller
{
    /**
     * Cas d'utilisation : Modérer les analyses (vue globale, toutes plateformes confondues).
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'recherche' => ['nullable', 'string', 'max:255'],
            'niveau_risque' => ['nullable', 'in:bon,moyen,faible'],
            'statut' => ['nullable', 'in:en_cours,terminee,echec'],
        ]);

        $analyses = Analyse::query()
            ->with('utilisateur:id,nom,email')
            ->when(
                $data['recherche'] ?? null,
                fn ($query, $recherche) => $query->where(
                    fn ($q) => $q->where('url', 'like', '%'.$recherche.'%')
                        ->orWhereHas(
                            'utilisateur',
                            fn ($q2) => $q2->where('nom', 'like', '%'.$recherche.'%')
                                ->orWhere('email', 'like', '%'.$recherche.'%')
                        )
                )
            )
            ->when(
                $data['niveau_risque'] ?? null,
                fn ($query, $risque) => $query->where('niveau_risque', $risque)
            )
            ->when(
                $data['statut'] ?? null,
                fn ($query, $statut) => $query->where('statut', $statut)
            )
            ->latest('date_analyse')
            ->get();

        return response()->json(['data' => $analyses, 'total' => $analyses->count()]);
    }

    /**
     * Cas d'utilisation : Modérer les analyses (suppression d'une analyse d'un tiers).
     */
    public function destroy(Analyse $analyse)
    {
        if ($analyse->chemin_rapport_pdf && Storage::disk('local')->exists($analyse->chemin_rapport_pdf)) {
            Storage::disk('local')->delete($analyse->chemin_rapport_pdf);
        }

        $analyse->delete();

        return response()->noContent();
    }
}
