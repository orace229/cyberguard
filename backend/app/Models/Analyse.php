<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Analyse extends Model
{
    use HasFactory;

    protected $table = 'analyses';

    protected $fillable = [
        'utilisateur_id',
        'url',
        'date_analyse',
        'score',
        'niveau_risque',
        'statut',
        'motif_echec',
        'chemin_rapport_pdf',
        'partage_actif',
        'partage_token',
        'surveillance_continue',
        'derniere_surveillance_le',
    ];

    protected function casts(): array
    {
        return [
            'date_analyse' => 'datetime',
            'score' => 'integer',
            'partage_actif' => 'boolean',
            'surveillance_continue' => 'boolean',
            'derniere_surveillance_le' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function resultatsVerification(): HasMany
    {
        return $this->hasMany(ResultatVerification::class, 'analyse_id');
    }

    /**
     * Propriétaire de l'analyse, ou administrateur — règle d'accès partagée
     * par AnalyseController, PartageController et SurveillanceController.
     */
    public function estAccessiblePar(Utilisateur $utilisateur): bool
    {
        return $this->utilisateur_id === $utilisateur->id || $utilisateur->estAdministrateur();
    }
}
