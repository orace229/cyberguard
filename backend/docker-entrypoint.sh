#!/usr/bin/env sh
set -e

mkdir -p /var/www/html/database
touch /var/www/html/database/database.sqlite
chmod -R 777 /var/www/html/database /var/www/html/storage /var/www/html/bootstrap/cache

if [ ! -f .env ]; then
    cp .env.example .env || true
fi

php artisan config:clear
php artisan route:clear

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction || true
    php artisan db:seed --force --no-interaction || true
fi

# Lance le worker de file d'attente en tâche de fond (compatible Render Free Tier)
php artisan queue:work --tries=1 --daemon &

exec "$@"
