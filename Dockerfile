# ==============================================================================
# CyberGuard Benin - Conteneur All-in-One (React Frontend + Laravel Backend)
# Conçu pour un hébergement 100% gratuit, 1 seul service, sans bug CORS / Cookies
# ==============================================================================

# Étape 1 : Compilation du Frontend React
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

# Étape 2 : Préparation du Backend Laravel avec Composer
FROM composer:2 AS composer-builder
WORKDIR /app
COPY backend/composer*.json ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-req=php+
COPY backend/ ./
RUN composer dump-autoload --optimize --no-dev --ignore-platform-req=php+

# Étape 3 : Image finale de production (PHP 8.4 CLI)
FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev libpng-dev libonig-dev libxml2-dev libsqlite3-dev unzip \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring bcmath dom zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copie le backend Laravel
COPY --from=composer-builder /app ./

# Copie le build compilé de React dans le dossier public de Laravel
COPY --from=frontend-builder /app/dist ./public

# Configuration des répertoires et permissions pour SQLite et les logs
RUN mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs bootstrap/cache database \
    && chmod -R 775 storage bootstrap/cache database

COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PORT=10000
ENV PHP_CLI_SERVER_WORKERS=4

EXPOSE 10000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
