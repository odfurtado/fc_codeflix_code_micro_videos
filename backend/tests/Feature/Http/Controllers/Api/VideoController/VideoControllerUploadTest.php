<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadTest extends BaseVideoControllerTest
{
    use TestValidations, TestUploads;

    public function testInvalidationThumbFile()
    {
        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            VIDEO::THUMB_FILE_MAX_SIZE,
            'image'
        );
    }

    public function testInvalidationBannerFile()
    {
        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            VIDEO::BANNER_FILE_MAX_SIZE,
            'image'
        );
    }

    public function testInvalidationTrailerFile()
    {
        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            VIDEO::TRAILER_FILE_MAX_SIZE,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testInvalidationVideoFile()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            VIDEO::VIDEO_FILE_MAX_SIZE,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testStoreWithFiles()
    {
        \Storage::fake();

        $files = $this->getFiles();


        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData + $files
        );
        $response->assertStatus(200);
        $id = $response->json('data.id');
        foreach ($files as $file) {
            \Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();

        $files = $this->getFiles();

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + $files
        );

        $response->assertStatus(201);
        $id = $response->json('data.id');
        foreach ($files as $file) {
            \Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    private function getFiles()
    {
        return [
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'banner_file' => UploadedFile::fake()->create('banner_file.jpg'),
            'trailer_file' => UploadedFile::fake()->create('trailer_file.mp4'),
            'video_file' => UploadedFile::fake()->create('video_file.mp4'),
        ];
    }

    protected function model()
    {
        return Video::class;
    }

    protected function routeStore()
    {
        return route('videos.store');
    }

    protected function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }
}
