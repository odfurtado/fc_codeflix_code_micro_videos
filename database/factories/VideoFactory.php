<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Video;
use Faker\Generator as Faker;

$factory->define(Video::class, function (Faker $faker) {
    return [
        'title' => $faker->sentence(3),
        'description' => $faker->sentence(10),
        'year_launched' => $faker->year(),
        'opened' => $faker->boolean(),
        'rating' => Video::RATING_LIST[array_rand(Video::RATING_LIST)],
        'duration' => rand(1, 120)
    ];
});
