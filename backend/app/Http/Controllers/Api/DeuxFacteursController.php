<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

/**
 * Cas d'utilisation : Sécuriser son compte (authentification à deux
 * facteurs). Pensé en priorité pour les comptes administrateurs, qui
 * représentent une cible plus sensible qu'un compte utilisateur standard,
 * mais reste disponible pour tout compte qui souhaite l'activer.
 */
class DeuxFacteursController extends Controller
{
    /**
     * Démarre l'activation : génère un secret temporaire (pas encore
     * persisté sur le compte) et la clé à saisir dans une application
     * d'authentification (Google Authenticator, Authy...).
     */
    public function demarrerActivation(Request $request)
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        // Stocké en session le temps de la confirmation : le secret n'est
        // écrit sur le compte que si l'utilisateur prouve, en soumettant un
        // code valide, qu'il a correctement configuré son application.
        $request->session()->put('deux_facteurs_secret_en_attente', $secret);

        return response()->json([
            'secret' => $secret,
            'uri' => $google2fa->getQRCodeUrl(config('app.name'), $request->user()->email, $secret),
        ]);
    }

    /**
     * Confirme l'activation à partir d'un code généré par l'application
     * d'authentification, et active réellement le 2FA sur le compte.
     */
    public function confirmerActivation(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $secret = $request->session()->get('deux_facteurs_secret_en_attente');

        if (! $secret) {
            throw ValidationException::withMessages([
                'code' => ["Aucune activation en cours. Recommencez."],
            ]);
        }

        if (! (new Google2FA())->verifyKey($secret, $data['code'])) {
            throw ValidationException::withMessages([
                'code' => ["Code invalide."],
            ]);
        }

        $request->user()->update([
            'deux_facteurs_secret' => $secret,
            'deux_facteurs_active_le' => now(),
        ]);

        $request->session()->forget('deux_facteurs_secret_en_attente');

        return response()->json($request->user());
    }

    /**
     * Désactive le 2FA sur le compte connecté.
     */
    public function desactiver(Request $request)
    {
        $request->user()->update([
            'deux_facteurs_secret' => null,
            'deux_facteurs_active_le' => null,
        ]);

        return response()->json($request->user());
    }
}
