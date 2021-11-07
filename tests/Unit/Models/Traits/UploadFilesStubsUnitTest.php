<?php

namespace Tests\Unit\Models\Traits;

use PHPUnit\Framework\TestCase;
use Illuminate\Http\UploadedFile;
use Tests\Stubs\Models\UploadFilesStubs;

class UploadFilesStubsUnitTest extends TestCase
{
    private $uploadFiles;

    protected function setUp(): void
    {
        parent::setUp();
        $this->uploadFiles = new UploadFilesStubs();
    }

    public function testUploadFile()
    {
        \Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');

        $this->uploadFiles->uploadFile($file);

        \Storage::assertExists("1/{$file->hashName()}");
    }

    public function testUploadFiles()
    {
        \Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');

        $this->uploadFiles->uploadFiles([$file1, $file2]);

        \Storage::assertExists("1/{$file1->hashName()}");
        \Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testDeleteFile()
    {
        \Storage::fake();

        $file = UploadedFile::fake()->create('video1.mp4');
        $this->uploadFiles->uploadFile($file);
        $this->uploadFiles->deleteFile($file->hashName());
        \Storage::assertMissing("1/{$file->hashName()}");

        $file = UploadedFile::fake()->create('video1.mp4');
        $this->uploadFiles->uploadFile($file);
        $this->uploadFiles->deleteFile($file);
        \Storage::assertMissing("1/{$file->hashName()}");
    }

    public function testDeleteFiles()
    {
        \Storage::fake();

        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->uploadFiles->uploadFiles([$file1, $file2]);
        $this->uploadFiles->deleteFiles([$file1->hashName(), $file2]);

        \Storage::assertMissing("1/{$file1->hashName()}");
        \Storage::assertMissing("1/{$file2->hashName()}");
    }
}
