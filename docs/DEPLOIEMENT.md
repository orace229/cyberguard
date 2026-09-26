# Déploiement — CyberGuard Bénin

Ce document prépare le terrain pour un déploiement en production. Aucun
hébergeur n'est encore choisi au moment où ce guide est écrit : l'objectif
est que l'application soit déployable n'importe où (VPS, Render, Railway,
o2switch...) sans avoir à retoucher le code, en configurant seulement des
variables d'environnement.

## Prérequis

- Un hébergement capable de faire tourner **3 processus PHP en continu**
  (voir plus bas) + une base de données (SQLite suffit pour une démo,
  MySQL recommandé au-delà).
- Un hébergement statique (ou le même serveur) pour le frontend compilé
  (`npm run build` produit un dossier `dist/` à servir tel quel).
- Un nom de domaine par service si le frontend et le backend ne sont pas
  sur le même hôte (ex. `app.exemple.com` pour le frontend,
  `api.exemple.com` pour le backend).

## Les 3 processus backend à garder vivants

En local, `composer run dev` lance ces 3 processus en parallèle dans un
seul terminal (`php artisan serve`, `php artisan queue:listen`,
`php artisan schedule:work`). **En production, ce sont 3 processus
distincts et permanents**, sinon :

| Processus | Rôle | Commande en prod |
|---|---|---|
| Web | Sert l'API HTTP | `php artisan serve` (démo) ou PHP-FPM + nginx (charge réelle) |
| Queue | Traite les analyses en arrière-plan (`TraiterAnalyseJob`) | `php artisan queue:work --tries=1` |
| Scheduler | Déclenche `analyses:surveiller` une fois par jour | `php artisan schedule:work` |

**Important** : `queue:listen` (utilisé en local) recharge le code à chaque
job — pratique en développement, inutilement lent en production. Utilisez
`queue:work` en production ; il faut juste redémarrer ce processus après
chaque déploiement de nouveau code (`queue:work` garde l'ancien code chargé
en mémoire tant qu'il tourne).

Si l'un de ces 3 processus s'arrête silencieusement : les analyses restent
bloquées en "en_cours" (queue à l'arrêt) ou la surveillance continue ne se
déclenche jamais (scheduler à l'arrêt). Utilisez un superviseur de
processus (systemd, supervisor, ou le mécanisme de "process types" fourni
par la plupart des PaaS) pour les relancer automatiquement en cas de crash.

## Variables d'environnement

Toutes ces variables sont documentées avec leur valeur par défaut dans
`backend/.env.example` — cette table résume seulement leur rôle.

| Variable | Rôle |
|---|---|
| `APP_URL` | URL publique du backend (utilisée pour générer les liens signés de vérification d'email) |
| `FRONTEND_URL` | URL publique du frontend — pilote à la fois CORS (`config/cors.php`) et les liens envoyés par email (réinitialisation de mot de passe, vérification) |
| `SANCTUM_STATEFUL_DOMAINS` | Domaine(s) autorisés à ouvrir une session par cookie — doit correspondre au domaine réel du frontend en production |
| `DB_CONNECTION` / `DB_HOST` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | Base de données — `sqlite` par défaut, passer à `mysql` en décommentant les lignes correspondantes |
| `QUEUE_CONNECTION` | `database` — la file d'attente est stockée dans la même base que le reste, pas de service supplémentaire nécessaire |
| `MAIL_MAILER` et les `MAIL_*` associés | Envoi réel des emails (vérification de compte, réinitialisation de mot de passe) — voir le commentaire dans `.env.example` pour la configuration Gmail SMTP |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Connexion via Google — laisser vide désactive juste ce bouton, le reste de l'app fonctionne normalement |
| `SURVEILLANCE_LOT_MAX` / `SURVEILLANCE_INTERVALLE_JOURS` | Plafond et fréquence du re-scan automatique (surveillance continue) |
| `VITE_API_URL` (frontend) | URL de l'API que le frontend appelle — gravée dans le build statique, donc à fournir **au moment du build**, pas au runtime (voir `frontend/Dockerfile`, argument `VITE_API_URL`) |

## CORS

`config/cors.php` lit `FRONTEND_URL` automatiquement — il suffit de définir
cette variable avec le vrai domaine du frontend en production, aucune
modification de code nécessaire.

## Migrations

```
php artisan migrate --force
```

Le `--force` est nécessaire car `APP_ENV` ne sera plus `local` en
production, et Laravel demande une confirmation interactive sinon.

## Avec Docker (parité locale/démo)

Un `docker-compose.yml` à la racine du dépôt reproduit les 3 processus
backend + le frontend, chacun dans son propre conteneur :

```
cp backend/.env.example backend/.env    # puis éditer les valeurs réelles
php artisan key:generate --show          # coller le résultat dans APP_KEY
docker compose up --build
```

Le service `backend` lance les migrations au démarrage
(`RUN_MIGRATIONS=true`) ; les services `queue` et `scheduler` partagent la
même image mais ne migrent pas (`RUN_MIGRATIONS=false`), pour éviter que 3
conteneurs ne tentent de migrer en même temps.

Ce `docker-compose.yml` sert de base pour du développement/une démo locale
avec parité de processus — il ne préjuge pas de l'hébergeur final. La base
de données reste SQLite par défaut (un volume Docker la persiste entre les
redémarrages) ; passer à MySQL est un changement de `DB_CONNECTION` dans
`backend/.env`, sans toucher au code.

## État actuel

Aucun hébergeur n'est provisionné à ce jour. Ce document et les
`Dockerfile` associés rendent l'application déployable dès qu'un choix
d'hébergement sera fait — aucune étape supplémentaire de préparation n'est
nécessaire côté code.
