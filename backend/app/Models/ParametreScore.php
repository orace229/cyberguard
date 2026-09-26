<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametreScore extends Model
{
    protected $table = 'parametres_score';

    public $timestamps = false;

    protected $fillable = [
        'poids_https',
        'poids_certificat_ssl',
        'poids_headers',
        'poids_cookies',
        'poids_vulnerabilites',
        'poids_fichiers_exposes',
        'poids_email_securise',
        'seuil_bon',
        'seuil_moyen',
    ];

    protected function casts(): array
    {
        return [
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Il n'existe toujours qu'une seule ligne de configuration (id = 1).
     */
    public static function actuels(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
