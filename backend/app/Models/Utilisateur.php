<?php

namespace App\Models;

use App\Notifications\VerifierEmailNotification;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable implements CanResetPasswordContract, MustVerifyEmailContract
{
    use CanResetPassword, HasApiTokens, HasFactory, MustVerifyEmail, Notifiable;

    protected $table = 'utilisateurs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
        'role',
        'statut',
        'email_verified_at',
        'deux_facteurs_secret',
        'deux_facteurs_active_le',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
        'deux_facteurs_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_inscription' => 'datetime',
            'mot_de_passe' => 'hashed',
            // Le secret TOTP est chiffré au repos : une fuite de la base ne
            // suffit pas à elle seule à générer des codes valides.
            'deux_facteurs_secret' => 'encrypted',
            'deux_facteurs_active_le' => 'datetime',
        ];
    }

    /**
     * Laravel's auth system looks for the "password" column by default;
     * our column is named "mot_de_passe".
     */
    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(Analyse::class, 'utilisateur_id');
    }

    public function estAdministrateur(): bool
    {
        return $this->role === 'administrateur';
    }

    public function deuxFacteursActif(): bool
    {
        return $this->deux_facteurs_secret !== null && $this->deux_facteurs_active_le !== null;
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifierEmailNotification);
    }
}
