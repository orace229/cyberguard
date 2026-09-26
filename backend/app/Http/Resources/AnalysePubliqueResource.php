<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Vue publique d'une analyse partagée : liste blanche explicite de 4
 * champs. Volontairement jamais le détail des contrôles ni le PDF —
 * publier les failles précises d'un site tiers serait une divulgation,
 * pas un partage (cf. décision prise avec l'utilisateur).
 */
class AnalysePubliqueResource extends JsonResource
{
    // Le reste de cette API renvoie des objets JSON bruts, jamais enveloppés
    // dans une clé "data" — on garde cette réponse cohérente avec le reste.
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'url' => $this->url,
            'date_analyse' => $this->date_analyse,
            'score' => $this->score,
            'niveau_risque' => $this->niveau_risque,
        ];
    }
}
