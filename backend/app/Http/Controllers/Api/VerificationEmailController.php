<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;

/**
 * Cas d'utilisation : S'authentifier (vérification d'email).
 *
 * Le lien de vérification pointe directement vers cette API (pas vers la
 * SPA) : la signature Laravel (middleware "signed") doit être validée
 * côté serveur, et l'utilisateur qui clique depuis sa messagerie n'a pas
 * forcément de session active dans ce navigateur.
 */
class VerificationEmailController extends Controller
{
    public function verifier(Request $request, string $id, string $hash)
    {
        $urlFrontend = rtrim(config('app.frontend_url'), '/');
        $utilisateur = Utilisateur::find($id);

        if (! $utilisateur || ! hash_equals(sha1($utilisateur->getEmailForVerification()), $hash)) {
            return redirect("{$urlFrontend}/email-verifie?statut=echec");
        }

        if ($utilisateur->hasVerifiedEmail()) {
            return redirect("{$urlFrontend}/email-verifie?statut=deja_verifie");
        }

        $utilisateur->markEmailAsVerified();

        return redirect("{$urlFrontend}/email-verifie?statut=succes");
    }

    public function renvoyer(Request $request)
    {
        $utilisateur = $request->user();

        if ($utilisateur->hasVerifiedEmail()) {
            return response()->json(['message' => 'Cette adresse est déjà vérifiée.'], 422);
        }

        $utilisateur->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }
}
