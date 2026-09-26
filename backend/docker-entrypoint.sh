#!/usr/bin/env sh
set -e

# Inoffensif si DB_CONNECTION=mysql (fichier vide jamais utilisé) : évite
# une erreur "database file does not exist" au premier démarrage en SQLite.
mkdir -p database
touch database/database.sqlite

php artisan config:cache

# Seul le service web doit lancer les migrations : les 3 services (web,
# queue, scheduler) démarrent depuis la même image et pourraient sinon
# tenter de migrer en même temps. Mettre RUN_MIGRATIONS=false sur les
# services queue/scheduler dans docker-compose.yml.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
# Lance le worker de file d'attente en tâche de fond (compatible Render Free Tier sans carte bancaire)
php artisan queue:work --tries=1 &

exec "$@"
