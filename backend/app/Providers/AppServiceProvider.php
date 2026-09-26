<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Le lien de réinitialisation doit pointer vers l'écran React
        // (SPA), pas vers une route Laravel côté serveur — cette API
        // n'a aucune page HTML de réinitialisation.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $urlFrontend = rtrim(config('app.frontend_url'), '/');

            return sprintf(
                '%s/reinitialiser-mot-de-passe?token=%s&email=%s',
                $urlFrontend,
                $token,
                urlencode($notifiable->getEmailForPasswordReset())
            );
        });
    }
}
