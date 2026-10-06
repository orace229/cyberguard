<?php

use App\Http\Controllers\Api\Admin\AnalyseController as AdminAnalyseController;
use App\Http\Controllers\Api\Admin\ParametreController as AdminParametreController;
use App\Http\Controllers\Api\Admin\UtilisateurController as AdminUtilisateurController;
use App\Http\Controllers\Api\AnalyseController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeuxFacteursController;
use App\Http\Controllers\Api\PartageController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\ReinitialisationMotDePasseController;
use App\Http\Controllers\Api\SurveillanceController;
use App\Http\Controllers\Api\VerificationEmailController;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

// Limitation de débit sur les routes sensibles : freine le brute-force sur
// l'authentification et le spam d'emails de réinitialisation.
Route::post('/inscription', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/connexion', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/connexion/deux-facteurs', [AuthController::class, 'verifierDeuxFacteurs'])->middleware('throttle:10,1');

Route::post('/mot-de-passe-oublie', [ReinitialisationMotDePasseController::class, 'envoyerLien'])->middleware('throttle:3,1');
Route::post('/reinitialiser-mot-de-passe', [ReinitialisationMotDePasseController::class, 'reinitialiser'])->middleware('throttle:6,1');

// Le lien de vérification pointe vers cette route directement (pas vers
// la SPA) : la signature Laravel doit être validée côté serveur, et
// l'utilisateur qui clique depuis sa messagerie n'a pas forcément de
// session active dans ce navigateur.
Route::get('/email/verifier/{id}/{hash}', [VerificationEmailController::class, 'verifier'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

// Rapport public partagé : lecture seule, pas d'auth, débit limité mais
// généreux (simple lecture, pas de requête réseau sortante).
Route::get('/partage/{token}', [PartageController::class, 'afficherPublique'])->middleware('throttle:30,1');

// Connexion via Google : navigation classique du navigateur (pas d'appel
// XHR), donc en dehors du throttling JSON habituel — Google gère déjà
// l'écran de consentement en amont. Le callback revient avec un Referer
// pointant vers Google (pas notre frontend), donc la détection "stateful"
// de Sanctum ne démarre pas de session automatiquement : on la force
// explicitement sur ces deux routes pour que Auth::login() fonctionne.
Route::middleware([EncryptCookies::class, StartSession::class])->group(function () {
    Route::get('/auth/google/redirect', [AuthController::class, 'redirigerVersGoogle'])->middleware('throttle:10,1');
    Route::get('/auth/google/callback', [AuthController::class, 'callbackGoogle']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/deconnexion', [AuthController::class, 'logout']);
    Route::get('/moi', [AuthController::class, 'me']);

    Route::get('/plan', [PlanController::class, 'afficher']);
    Route::post('/plan/changer', [PlanController::class, 'changer']);

    Route::put('/profil', [ProfilController::class, 'update']);
    Route::put('/profil/mot-de-passe', [ProfilController::class, 'mettreAJourMotDePasse']);

    Route::post('/email/renvoyer', [VerificationEmailController::class, 'renvoyer'])->middleware('throttle:3,1');

    Route::post('/deux-facteurs/demarrer', [DeuxFacteursController::class, 'demarrerActivation']);
    Route::post('/deux-facteurs/confirmer', [DeuxFacteursController::class, 'confirmerActivation']);
    Route::delete('/deux-facteurs', [DeuxFacteursController::class, 'desactiver']);

    Route::get('/tableau-de-bord', [AnalyseController::class, 'tableauDeBord']);

    Route::get('/analyses', [AnalyseController::class, 'index']);
    // Chaque analyse déclenche une dizaine de requêtes réseau (moteur
    // approfondi) : on limite pour éviter qu'un compte ne serve à
    // bombarder des cibles tierces ou à saturer la file d'attente.
    Route::post('/analyses', [AnalyseController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/analyses/{analyse}', [AnalyseController::class, 'show']);
    Route::get('/analyses/{analyse}/rapport', [AnalyseController::class, 'telechargerRapport']);
    Route::post('/analyses/{analyse}/partage', [PartageController::class, 'activer']);
    Route::delete('/analyses/{analyse}/partage', [PartageController::class, 'desactiver']);
    Route::post('/analyses/{analyse}/surveillance', [SurveillanceController::class, 'activer']);
    Route::delete('/analyses/{analyse}/surveillance', [SurveillanceController::class, 'desactiver']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/utilisateurs', [AdminUtilisateurController::class, 'index']);
        Route::patch('/utilisateurs/{utilisateur}/statut', [AdminUtilisateurController::class, 'basculerStatut']);
        Route::patch('/utilisateurs/{utilisateur}/role', [AdminUtilisateurController::class, 'basculerRole']);
        Route::delete('/utilisateurs/{utilisateur}', [AdminUtilisateurController::class, 'destroy']);

        Route::get('/analyses', [AdminAnalyseController::class, 'index']);
        Route::delete('/analyses/{analyse}', [AdminAnalyseController::class, 'destroy']);

        Route::get('/statistiques', [AdminParametreController::class, 'statistiques']);
        Route::get('/parametres-score', [AdminParametreController::class, 'afficherParametresScore']);
        Route::put('/parametres-score', [AdminParametreController::class, 'mettreAJourParametresScore']);
    });
});
