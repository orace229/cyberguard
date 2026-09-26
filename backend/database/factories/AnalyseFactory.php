<?php

namespace Database\Factories;

use App\Models\Analyse;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Analyse>
 */
class AnalyseFactory extends Factory
{
    protected $model = Analyse::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'utilisateur_id' => Utilisateur::factory(),
            'url' => fake()->url(),
            'date_analyse' => now(),
            'score' => fake()->numberBetween(0, 100),
            'niveau_risque' => fake()->randomElement(['bon', 'moyen', 'faible']),
            'statut' => 'terminee',
        ];
    }

    public function enCours(): static
    {
        return $this->state(fn (array $attributes) => [
            'score' => null,
            'niveau_risque' => null,
            'statut' => 'en_cours',
        ]);
    }

    public function echouee(): static
    {
        return $this->state(fn (array $attributes) => [
            'score' => null,
            'niveau_risque' => null,
            'statut' => 'echec',
            'motif_echec' => 'Le site est injoignable (aucune réponse en HTTPS ni en HTTP dans le délai imparti).',
        ]);
    }
}
