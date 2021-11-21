<?php

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = Category::all();
        factory(Genre::class, 5)
            ->create()
            ->each(function (Genre $genre) use ($categories) {
                $categoriesId = $categories->random(2)->pluck('id')->toArray();
                $genre->categories()->attach($categoriesId);
            });
    }
}
