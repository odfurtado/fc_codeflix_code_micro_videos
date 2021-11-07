<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{
    static $UUID_REGEX = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";

    use DatabaseMigrations;

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

    public function testCreate()
    {
        $video = Video::create([
            'title' => 'test1',
            'description' => 'description1',
            'year_launched' => 1985,
            'opened' => false,
            'rating' => 'L',
            'duration' => 120
        ]);
        $video->refresh();
        $this->assertEquals(36, strlen($video->id));
        $this->assertTrue(boolval(preg_match(CategoryTest::$UUID_REGEX, $video->id)));
        $this->assertEquals('test1', $video->title);
        $this->assertEquals('description1', $video->description);
        $this->assertEquals(1985, $video->year_launched);
        $this->assertEquals(false, $video->opened);
        $this->assertEquals('L', $video->rating);
        $this->assertEquals(120, $video->duration);
    }

    public function testUpdate()
    {
        $video = Video::create([
            'title' => 'test1',
            'description' => 'description1',
            'year_launched' => 1985,
            'opened' => false,
            'rating' => 'L',
            'duration' => 120
        ]);
        $video->refresh();

        $data = [
            'title' => 'test title updated',
            'description' => 'test description updated',
            'year_launched' => 2000,
            'opened' => true,
            'rating' => '12',
            'duration' => 90
        ];
        $video->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
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
}
