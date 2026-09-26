<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Reprend le comportement de VerifyEmail (lien signé, génération de l'URL
 * via VerifyEmail::createUrlUsing défini dans AppServiceProvider) mais avec
 * un contenu en français, cohérent avec le reste de l'application.
 */
class VerifierEmailNotification extends VerifyEmail
{
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage)
            ->subject('Vérifiez votre adresse email — CyberGuard Bénin')
            ->line('Merci de vous être inscrit sur CyberGuard Bénin.')
            ->line('Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.')
            ->action('Vérifier mon adresse email', $url)
            ->line('Si vous n\'êtes pas à l\'origine de cette inscription, vous pouvez ignorer cet email.');
    }
}
