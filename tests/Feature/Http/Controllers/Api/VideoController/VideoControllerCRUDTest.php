<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerCRUDTest extends BaseVideoControllerTest
{
    use TestValidations, TestSaves, TestResources;

    private $serializedFields = [
        'id',
        'title',
        'description',
        'year_launched',
        'rating',
        'duration',
        'rating',
        'opened',
        'thumb_file_url',
        'banner_file_url',
        'video_file_url',
        'trailer_file_url',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ]
    ];

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));

        $response
            ->assertStatus(200)
            ->assertJsonStructure(
                [
                    'data' => [
                        '*' => $this->serializedFields
                    ],
                    'meta' => [],
                    'links' => []
                ]
            );
        $this->assertResource($response, VideoResource::collection(collect([$this->video])));
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
        $this->assertResource(
            $response,
            new VideoResource(Video::find($response->json('data.id')))
        );
    }

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => [],
            'genres_id' => []
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }


    public function testInvalidationMax()
    {
        $data = [
            'title' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger()
    {
        $data = [
            'duration' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationDateFormat()
    {
        $data = [
            'year_launched' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationBoolean()
    {
        $data = [
            'opened' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationIn()
    {
        $data = [
            'rating' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testInvalidationArray()
    {
        $data = [
            'categories_id' => 'a',
            'genres_id' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');
    }

    public function testInvalidationExists()
    {
        $data = [
            'categories_id' => ['100'],
            'genres_id' => ['100'],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testStoreWithoutFiles()
    {
        $response = $this->assertStore(
            $this->sendData,
            $this->testData + ['opened' => false]
        );

        $response->assertJsonStructure(['data' => $this->serializedFields]);
        $this->assertResource(
            $response,
            new VideoResource(Video::find($response->json('data.id')))
        );

        $this->assertStore(
            $this->sendData + ['opened' => true],
            $this->testData + ['opened' => true]
        );

        $this->assertStore(
            $this->sendData + ['rating' => Video::RATING_LIST[1]],
            $this->testData + ['rating' => Video::RATING_LIST[1]]
        );
    }

    public function testUpdateWithoutFiles()
    {
        $response = $this->assertUpdate(
            $this->sendData + ['opened' => false],
            $this->testData + ['opened' => false]
        );

        $response->assertJsonStructure(['data' => $this->serializedFields]);
        $this->assertResource(
            $response,
            new VideoResource(Video::find($response->json('data.id')))
        );

        $this->assertUpdate(
            $this->sendData + ['opened' => true],
            $this->testData + ['opened' => true]
        );

        $this->assertUpdate(
            $this->sendData + ['rating' => Video::RATING_LIST[1]],
            $this->testData + ['rating' => Video::RATING_LIST[1]]
        );
    }

    public function testDestroy()
    {
        $reponse = $this->json('DELETE', route('videos.destroy', ['video' => $this->video->id]));

        $reponse->assertStatus(204);
        $this->assertNull(video::find($this->video->id));
        $this->assertNotNull(video::withTrashed()->find($this->video->id));
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
