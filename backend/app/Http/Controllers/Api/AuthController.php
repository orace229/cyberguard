<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    /**
     * Cas d'utilisation : Gérer son compte (inscription).
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:190', Rule::unique('utilisateurs', 'email')],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $utilisateur = Utilisateur::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'mot_de_passe' => Hash::make($data['mot_de_passe']),
        ]);

        $utilisateur->sendEmailVerificationNotification();

        Auth::login($utilisateur);
        $request->session()->regenerate();

        return response()->json($utilisateur, 201);
    }

    /**
     * Cas d'utilisation : S'authentifier (connexion).
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'mot_de_passe' => ['required', 'string'],
        ]);

        $utilisateur = Utilisateur::where('email', $credentials['email'])->first();

        if (! $utilisateur || ! Hash::check($credentials['mot_de_passe'], $utilisateur->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ["Ces identifiants ne correspondent à aucun compte."],
            ]);
        }

        if ($utilisateur->statut === 'desactive') {
            throw ValidationException::withMessages([
                'email' => ["Ce compte a été désactivé."],
            ]);
        }

        // Compte protégé par l'authentification à deux facteurs : le mot de
        // passe seul ne suffit pas à ouvrir une session. On mémorise
        // temporairement, côté serveur uniquement, quel compte a passé la
        // première étape, en attendant le code de l'étape suivante.
        if ($utilisateur->deuxFacteursActif()) {
            $request->session()->put('connexion_en_attente_2fa', $utilisateur->id);

            return response()->json(['deux_facteurs_requis' => true]);
        }

        Auth::login($utilisateur, $request->boolean('se_souvenir'));
        $request->session()->regenerate();

        return response()->json($utilisateur);
    }

    /**
     * Cas d'utilisation : S'authentifier (validation du code à deux
     * facteurs) — deuxième étape de connexion pour un compte protégé.
     */
    public function verifierDeuxFacteurs(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $utilisateurId = $request->session()->get('connexion_en_attente_2fa');

        if (! $utilisateurId || ! ($utilisateur = Utilisateur::find($utilisateurId)) || ! $utilisateur->deuxFacteursActif()) {
            $request->session()->forget('connexion_en_attente_2fa');

            throw ValidationException::withMessages([
                'code' => ["Session de connexion expirée, reconnectez-vous."],
            ]);
        }

        if (! (new Google2FA())->verifyKey($utilisateur->deux_facteurs_secret, $data['code'])) {
            throw ValidationException::withMessages([
                'code' => ["Code invalide ou expiré."],
            ]);
        }

        $request->session()->forget('connexion_en_attente_2fa');

        Auth::login($utilisateur, $request->boolean('se_souvenir'));
        $request->session()->regenerate();

        return response()->json($utilisateur);
    }

    /**
     * Cas d'utilisation : S'authentifier (connexion via Google) — redirige
     * le navigateur vers l'écran de consentement Google.
     */
    public function redirigerVersGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Cas d'utilisation : S'authentifier (connexion via Google) — retour
     * depuis Google. Ne connecte qu'un compte déjà existant : Google n'est
     * qu'un mode de connexion, pas un mode d'inscription. Si aucun compte
     * ne correspond à l'email Google, l'utilisateur est invité à s'inscrire
     * d'abord via le formulaire classique.
     */
    public function callbackGoogle(Request $request)
    {
        $urlFrontend = rtrim(config('app.frontend_url'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable) {
            return redirect("{$urlFrontend}/?erreur_google=echec");
        }

        $utilisateur = Utilisateur::where('email', $googleUser->getEmail())->first();

        if (! $utilisateur) {
            return redirect("{$urlFrontend}/?erreur_google=compte_introuvable");
        }

        if ($utilisateur->statut === 'desactive') {
            return redirect("{$urlFrontend}/?erreur_google=compte_desactive");
        }

        Auth::login($utilisateur);
        $request->session()->regenerate();

        return redirect("{$urlFrontend}/accueil");
    }

    /**
     * Cas d'utilisation : S'authentifier (déconnexion).
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /**
     * Utilisateur actuellement connecté (pour restaurer la session côté SPA).
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
