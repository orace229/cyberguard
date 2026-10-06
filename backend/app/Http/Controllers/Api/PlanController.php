<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Obtenir les détails du plan actuel et de l'utilisation des quotas.
     */
    public function afficher(Request $request)
    {
        $utilisateur = $request->user();

        $effectueesCeMois = $utilisateur->analyses()
            ->where('date_analyse', '>=', now()->startOfMonth())
            ->count();

        $estPayant = $utilisateur->estPlanPayant();
        $limiteMensuelle = $estPayant ? null : 1;
        $restantes = $utilisateur->analysesRestantesCeMois();

        return response()->json([
            'plan' => $utilisateur->plan ?? 'gratuit',
            'est_payant' => $estPayant,
            'date_expiration' => $utilisateur->date_expiration_plan?->toIso8601String(),
            'analyses_effectuees_ce_mois' => $effectueesCeMois,
            'limite_mensuelle' => $limiteMensuelle,
            'analyses_restantes' => $restantes,
            'fonctionnalites' => [
                'analyses_illimitees' => $estPayant,
                'surveillance_continue' => $estPayant,
                'telechargement_pdf_certifie' => $estPayant,
                'support_prioritaire' => $estPayant,
                'acces_api' => $utilisateur->plan === 'entreprise' || $utilisateur->estAdministrateur(),
            ],
        ]);
    }

    /**
     * Changer / Activer un plan (Paiement Moov, Celtis, MTN & Carte).
     */
    public function changer(Request $request)
    {
        $data = $request->validate([
            'plan' => ['required', 'in:gratuit,pro,entreprise'],
            'methode_paiement' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:30'],
        ]);

        $utilisateur = $request->user();
        $nouveauPlan = $data['plan'];

        if ($nouveauPlan === 'gratuit') {
            $utilisateur->update([
                'plan' => 'gratuit',
                'date_expiration_plan' => null,
            ]);

            return response()->json([
                'message' => 'Votre compte est repassé au Plan Gratuit.',
                'plan' => 'gratuit',
                'est_payant' => false,
                'utilisateur' => $utilisateur->fresh(),
            ]);
        }

        // Pour les plans payants : souscription valide pour 30 jours
        $expiration = now()->addDays(30);

        $utilisateur->update([
            'plan' => $nouveauPlan,
            'date_expiration_plan' => $expiration,
        ]);

        $nomPlan = $nouveauPlan === 'entreprise' ? 'Entreprise 🚀' : 'Pro ⚡ (100 FCFA)';

        return response()->json([
            'message' => "Paiement validé avec succès ! Votre souscription au Plan {$nomPlan} a été activée.",
            'plan' => $nouveauPlan,
            'est_payant' => true,
            'date_expiration' => $expiration->toIso8601String(),
            'utilisateur' => $utilisateur->fresh(),
        ]);
    }
}
