## Descrição

Microsserviço de catálogo

## Rodar a aplicação

#### Crie os containers com Docker

```bash
$ docker-compose up
```

#### Accesse no browser

```
http://localhost:8000
```

## Comandos Uteis

```bash
  php artisan make:model Models/<Model> --all
  php artisan make:migration create_category_video_table
  php artisan make:rule GenresHasCategoriesRule

  php artisan migrate --seed
  php artisan migrate:refresh --seed

  php artisan tinker


  php artisan make:test CategoryTest --unit
  vendor/bin/phpunit tests/Feature/Http/Controllers/Api/CategoryControllerTest.php

  php artisan storage:link

  php artisan make:resource CategoryResource

  https://github.com/Superbalist/laravel-google-cloud-storage
  composer require superbalist/laravel-google-cloud-storage


  https://github.com/fruitcake/laravel-cors
  composer require barryvdh/laravel-cors
  php artisan vendor:publish --provider="Barryvdh\Cors\ServiceProvider"

```
