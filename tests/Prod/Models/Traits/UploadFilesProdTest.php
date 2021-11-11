<?php

namespace Tests\Prod\Models\Traits;

use PHPUnit\Framework\TestCase;
use Illuminate\Http\UploadedFile;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\Traits\TestProd;
use Tests\Traits\TestStorages;

class UploadFilesProdTest extends TestCase
{
    use TestStorages, TestProd;
    private $uploadFiles;

    protected function setUp(): void
    {
        parent::setUp();
        $this->skipTestIfNotProd();

        $this->uploadFiles = new UploadFilesStub();
        \Config::set('filesystems.default', 'gcs');
    }

    protected function tearDown(): void
    {
        if ($this->isTestingProd()) {
            $this->deleteAllFiles();
        }
        parent::tearDown();
    }

    public function testUploadFile()
    {
        $file = UploadedFile::fake()->create('video.mp4');

        $this->uploadFiles->uploadFile($file);

        \Storage::assertExists("1/{$file->hashName()}");
    }

    public function testUploadFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');

        $this->uploadFiles->uploadFiles([$file1, $file2]);

        \Storage::assertExists("1/{$file1->hashName()}");
        \Storage::assertExists("1/{$file2->hashName()}");
    }

    public function testDeleteFile()
    {
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
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->uploadFiles->uploadFiles([$file1, $file2]);
        $this->uploadFiles->deleteFiles([$file1->hashName(), $file2]);

        \Storage::assertMissing("1/{$file1->hashName()}");
        \Storage::assertMissing("1/{$file2->hashName()}");
    }
}
