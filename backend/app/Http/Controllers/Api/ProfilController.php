<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfilController extends Controller
{
    /**
     * Cas d'utilisation : Gérer son compte (modification des informations).
     */
    public function update(Request $request)
    {
        $utilisateur = $request->user();

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:190', Rule::unique('utilisateurs', 'email')->ignore($utilisateur->id)],
        ]);

        $utilisateur->update($data);

        return response()->json($utilisateur);
    }

    /**
     * Cas d'utilisation : Gérer son compte (réinitialisation du mot de passe, depuis le profil).
     */
    public function mettreAJourMotDePasse(Request $request)
    {
        $utilisateur = $request->user();

        $data = $request->validate([
            'mot_de_passe_actuel' => ['required', 'string'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($data['mot_de_passe_actuel'], $utilisateur->mot_de_passe)) {
            throw ValidationException::withMessages([
                'mot_de_passe_actuel' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $utilisateur->update([
            'mot_de_passe' => Hash::make($data['mot_de_passe']),
        ]);

        return response()->noContent();
    }
}
