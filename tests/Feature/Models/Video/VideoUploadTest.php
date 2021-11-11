<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Tests\Exceptions\TestException;

class VideoUploadTest extends BaseVideoTest
{
    public function testCreateWithFiles()
    {
        \Storage::fake();

        $video = Video::create(
            $this->data + [
                'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                'video_file' => UploadedFile::fake()->create('video.mp4')
            ]
        );

        \Storage::assertExists("{$video->id}/{$video->video_file}");
        \Storage::assertExists("{$video->id}/{$video->thumb_file}");
    }

    public function testCreateIfRollbackFiles()
    {
        \Storage::fake();
        \Event::listen(TransactionCommitted::class, function () {
            throw new TestException();
        });
        $hasError = false;

        try {
            Video::create(
                $this->data + [
                    'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                    'video_file' => UploadedFile::fake()->create('video.mp4')
                ]
            );
        } catch (TestException $e) {
            $this->assertCount(0, \Storage::allFiles());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $video = factory(Video::class)->create();

        $thumbFile = UploadedFile::fake()->image('thumb.jpg');
        $videoFile = UploadedFile::fake()->create('video.mp4');

        $video->update($this->data + [
            'thumb_file' => $thumbFile,
            'video_file' => $videoFile
        ]);

        \Storage::assertExists("{$video->id}/{$video->video_file}");
        \Storage::assertExists("{$video->id}/{$video->thumb_file}");

        $newVideoFile = UploadedFile::fake()->create('newvideo.mp4');

        $video->update($this->data + [
            'video_file' => $newVideoFile
        ]);
        \Storage::assertExists("{$video->id}/{$newVideoFile->hashName()}");
        \Storage::assertExists("{$video->id}/{$thumbFile->hashName()}");
        \Storage::assertMissing("{$video->id}/{$videoFile->hashName()}");
    }

    public function testUpdateIfRollbackFiles()
    {
        \Storage::fake();
        $video = factory(Video::class)->create();

        \Event::listen(TransactionCommitted::class, function () {
            throw new TestException();
        });

        $hasError = false;

        try {
            $video->update(
                $this->data + [
                    'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                    'video_file' => UploadedFile::fake()->create('video.mp4')
                ]
            );
        } catch (TestException $e) {
            $this->assertCount(0, \Storage::allFiles());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdateIfRollbackNewFilesAndMaintainOldFiles()
    {
        \Storage::fake();

        $thumbFile = UploadedFile::fake()->image('thumb.jpg');
        $videoFile = UploadedFile::fake()->create('video.mp4');
        $video = Video::create(
            $this->data + [
                'thumb_file' => $thumbFile,
                'video_file' => $videoFile
            ]
        );

        \Event::listen(TransactionCommitted::class, function () {
            throw new TestException();
        });

        $newVideoFile = UploadedFile::fake()->create('video2.mp4');
        $hasError = false;

        try {
            $video->update(
                $this->data + [
                    'video_file' => $newVideoFile
                ]
            );
        } catch (TestException $e) {
            $this->assertCount(2, \Storage::allFiles());
            \Storage::assertMissing("{$video->id}/{$newVideoFile->hashName()}");
            \Storage::assertExists("{$video->id}/{$thumbFile->hashName()}");
            \Storage::assertExists("{$video->id}/{$videoFile->hashName()}");
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }
}
