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
  php artisan migrate --seed

  php artisan migrate:refresh --seed

  php artisan tinker

  php artisan make:test CategoryTest --unit
```
