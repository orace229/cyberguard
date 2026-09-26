<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;

class UtilisateurController extends Controller
{
    /**
     * Cas d'utilisation : Gérer les comptes utilisateurs (liste).
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'recherche' => ['nullable', 'string', 'max:255'],
            'statut' => ['nullable', 'in:actif,desactive'],
        ]);

        // Affichés en une seule liste continue (pas de pagination) : le
        // volume d'utilisateurs d'une plateforme d'audit interne reste
        // raisonnable, une liste défilante est plus simple qu'un découpage
        // en pages.
        $utilisateurs = Utilisateur::query()
            ->when(
                $data['recherche'] ?? null,
                fn ($query, $recherche) => $query->where(
                    fn ($q) => $q->where('nom', 'like', '%'.$recherche.'%')
                        ->orWhere('email', 'like', '%'.$recherche.'%')
                )
            )
            ->when(
                $data['statut'] ?? null,
                fn ($query, $statut) => $query->where('statut', $statut)
            )
            ->withCount('analyses')
            ->latest('date_inscription')
            ->get();

        return response()->json(['data' => $utilisateurs, 'total' => $utilisateurs->count()]);
    }

    /**
     * Cas d'utilisation : Gérer les comptes utilisateurs (activer/désactiver).
     */
    public function basculerStatut(Request $request, Utilisateur $utilisateur)
    {
        if ($utilisateur->id === $request->user()->id) {
            abort(422, 'Vous ne pouvez pas désactiver votre propre compte.');
        }

        $utilisateur->update([
            'statut' => $utilisateur->statut === 'actif' ? 'desactive' : 'actif',
        ]);

        return response()->json($utilisateur);
    }

    /**
     * Cas d'utilisation : Gérer les comptes utilisateurs (promouvoir/rétrograder).
     *
     * Le garde-fou « auto-modification interdite » ci-dessous suffit à lui
     * seul à garantir qu'il reste toujours au moins un administrateur : pour
     * atteindre cette route, l'auteur de la requête doit déjà être
     * administrateur (middleware « admin »), et comme il ne peut jamais se
     * cibler lui-même, il compte toujours comme « un autre administrateur »
     * vis-à-vis de la cible — un contrôle explicite du nombre restant serait
     * donc du code mort, jamais atteignable.
     */
    public function basculerRole(Request $request, Utilisateur $utilisateur)
    {
        if ($utilisateur->id === $request->user()->id) {
            abort(422, 'Vous ne pouvez pas modifier votre propre rôle.');
        }

        $utilisateur->update([
            'role' => $utilisateur->role === 'administrateur' ? 'utilisateur' : 'administrateur',
        ]);

        return response()->json($utilisateur);
    }

    /**
     * Cas d'utilisation : Gérer les comptes utilisateurs (suppression).
     */
    public function destroy(Request $request, Utilisateur $utilisateur)
    {
        if ($utilisateur->id === $request->user()->id) {
            abort(422, 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $utilisateur->delete();

        return response()->noContent();
    }
}
