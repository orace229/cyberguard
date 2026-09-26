<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultatVerification extends Model
{
    protected $table = 'resultats_verification';

    public $timestamps = false;

    protected $fillable = [
        'analyse_id',
        'type',
        'statut',
        'poids',
        'description',
        'recommandation',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function analyse(): BelongsTo
    {
        return $this->belongsTo(Analyse::class, 'analyse_id');
    }
}
