<?php

namespace Tests\Unit\Models;

use App\Models\Video;
use PHPUnit\Framework\TestCase;
use App\Models\Traits\Uuid;
use App\Models\Traits\UploadFiles;
use Illuminate\Database\Eloquent\SoftDeletes;

class VideoUnitTest extends TestCase
{
    private $video;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testFillableAttribute()
    {
        $fillable = [
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'video_file',
            'trailer_file',
            'banner_file',
            'thumb_file'
        ];

        $this->assertEqualsCanonicalizing($fillable, $this->video->getFillable());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->video->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];

        $this->assertEqualsCanonicalizing($dates, $this->video->getDates());
        $this->assertCount(count($dates), $this->video->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = [
            'year_launched' => 'integer',
            'opened' => 'boolean',
            'duration' => 'integer',
        ];
        $this->assertEqualsCanonicalizing($casts, $this->video->getCasts());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class, UploadFiles::class];

        $this->assertEquals($traits, array_keys(class_uses(video::class)));
    }
}
