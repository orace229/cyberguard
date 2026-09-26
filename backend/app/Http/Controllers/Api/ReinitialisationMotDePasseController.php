<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class ReinitialisationMotDePasseController extends Controller
{
    /**
     * Cas d'utilisation : Gérer son compte (demande de réinitialisation).
     */
    public function envoyerLien(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // On ne révèle jamais si l'email existe ou non côté réponse (évite
        // l'énumération de comptes) : le message est toujours identique.
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Si cette adresse est associée à un compte, un lien de réinitialisation vient de lui être envoyé.',
        ]);
    }

    /**
     * Cas d'utilisation : Gérer son compte (réinitialisation effective).
     */
    public function reinitialiser(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $statut = Password::reset(
            [
                'email' => $data['email'],
                'token' => $data['token'],
                'password' => $data['mot_de_passe'],
                'password_confirmation' => $request->input('mot_de_passe_confirmation'),
            ],
            function ($utilisateur, $motDePasse) {
                $utilisateur->forceFill([
                    'mot_de_passe' => Hash::make($motDePasse),
                ])->save();
            }
        );

        if ($statut !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Ce lien de réinitialisation est invalide ou a expiré.',
            ], 422);
        }

        return response()->json([
            'message' => 'Votre mot de passe a été réinitialisé avec succès.',
        ]);
    }
}
