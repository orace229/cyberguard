<?php

use App\Http\Middleware\EstAdministrateur;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->alias(['admin' => EstAdministrateur::class]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('analyses:surveiller')->dailyAt('03:00');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Backend 100% API : il n'existe aucune route "login" côté serveur.
        // Par défaut, le handler d'exceptions ne renvoie du JSON que si la
        // requête "expects json" (en-tête Accept adéquat) ; une navigation
        // classique du navigateur (ex. clic sur un lien de téléchargement)
        // n'envoie pas cet en-tête, et le handler retombe alors sur
        // `route('login')`, qui n'existe pas ici → 500 au lieu d'une propre
        // réponse 401/403. On force donc le rendu JSON pour toute route API.
        $exceptions->shouldRenderJsonWhen(fn ($request) => $request->is('api/*'));
    })->create();
