#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh

### FRONTEND
npm config set cache /var/www/.npm-cache --global
cd /var/www/frontend
npm install


### BACKEND CONFIG
cd /var/www/backend

if [ ! -f ".env" ]; then
  cp .env.example .env
fi
if [ ! -f ".env.testing" ]; then
  cp .env.testing.example .env.testing
fi

chown -R www-data:www-data .
composer install
php artisan key:generate
php artisan migrate

php-fpm
