<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{
    static $UUID_REGEX = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";

    use DatabaseMigrations;

    private $data;

    protected function setUp(): void
    {
        parent::setUp();
        $this->data = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
    }

    public function testList()
    {
        factory(Video::class, 1)->create();

        $videos = Video::all();

        $this->assertCount(1, $videos);
        $videoKeys = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            [
                'id', 'title', 'description', 'year_launched', 'opened', 'rating',
                'duration', 'created_at', 'updated_at', 'deleted_at'
            ],
            $videoKeys
        );
    }

    public function testCreateWithBasicFields()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();

        $video = Video::create($this->data);
        $video->refresh();
        $this->assertEquals(36, strlen($video->id));
        $this->assertTrue(boolval(preg_match(CategoryTest::$UUID_REGEX, $video->id)));
        $this->assertEquals($this->data['title'], $video->title);
        $this->assertEquals($this->data['description'], $video->description);
        $this->assertEquals($this->data['year_launched'], $video->year_launched);
        $this->assertFalse($video->opened);
        $this->assertEquals($this->data['rating'], $video->rating);
        $this->assertEquals($this->data['duration'], $video->duration);

        $this->assertDatabaseHas('videos', $this->data + ['id' => $video->id, 'opened' => false]);


        $video = Video::create($this->data + ['opened' => true]);
        $video->refresh();
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->data + ['id' => $video->id, 'opened' => true]);
    }

    public function testCreateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();

        $video = Video::create($this->data + [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id]
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $category->id,
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genre->id,
            'video_id' => $video->id
        ]);
    }

    function testRollbackCreate()
    {
        $hasError = false;
        try {
            Video::create($this->data + [
                'categories_id' => [1, 2]
            ]);
        } catch (QueryException $e) {
            $this->assertCount(0, Video::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdate()
    {
        $video = factory(Video::class)->create();

        $categoryUpdated = factory(Category::class)->create();
        $genreUpdated = factory(Genre::class)->create();

        $video->update($this->data + [
            'categories_id' => [$categoryUpdated->id],
            'genres_id' => [$genreUpdated->id]
        ]);

        foreach ($this->data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
        $this->assertDatabaseHas('videos', $this->data + ['id' => $video->id]);

        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoryUpdated->id,
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genreUpdated->id,
            'video_id' => $video->id
        ]);

        $video->update($this->data + [
            'opened' => true
        ]);
        $this->assertDatabaseHas('videos', $this->data + ['id' => $video->id, 'opened' => true]);
    }

    function testRollbackUpdate()
    {
        $video = factory(Video::class)->create();
        $currentTitle = $video->title;
        $hasError = false;
        try {
            $video->update($this->data + [
                'categories_id' => [1, 2]
            ]);
        } catch (QueryException $e) {
            $this->assertEquals($currentTitle, Video::find($video->id)->title);

            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testDelete()
    {
        $video = factory(Video::class)->create();
        $this->assertNotNull(Video::find($video->id));

        $video->delete();
        $this->assertNull(Video::find($video->id));

        $video->restore();
        $this->assertNotNull(Video::find($video->id));
    }


    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[0]]
        ]);

        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $video->id
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ]);

        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[1],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[2],
            'video_id' => $video->id
        ]);
    }

    public function testSyncGenres()
    {
        $genresId = factory(Genre::class, 3)->create()->pluck('id')->toArray();

        $video = factory(Video::class)->create();
        Video::handleRelations($video, [
            'genres_id' => [$genresId[0]]
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' => $video->id
        ]);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]]
        ]);

        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[1],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[2],
            'video_id' => $video->id
        ]);
    }
}
