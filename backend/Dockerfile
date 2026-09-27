# Image unique réutilisée par les 3 services (web, queue, scheduler) du
# docker-compose à la racine du dépôt — seule la commande de démarrage
# change entre eux (voir docker-compose.yml et docker-entrypoint.sh).

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev

FROM php:8.2-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev libpng-dev libonig-dev libxml2-dev libsqlite3-dev unzip \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring bcmath dom zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
COPY --from=vendor /app ./

RUN mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PHP_CLI_SERVER_WORKERS=4

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
