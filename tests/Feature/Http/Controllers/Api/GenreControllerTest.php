<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Http\Resources\GenreResource;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    private $genre;

    private $serializedFields = [
        'id',
        'name',
        'is_active',
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
        ]
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));
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
        $this->assertResource($response, GenreResource::collection(collect([$this->genre])));
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ])
            ->assertJsonFragment($this->genre->toArray());

        $this->assertResource($response, new GenreResource($this->genre));
    }

    public function testInvalidationData()
    {
        $data = [
            'name' => '',
            'categories_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');


        $data = [
            'name' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);


        $data = [
            'is_active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');


        $data = [
            'categories_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => ['100']
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testStore()
    {
        $category = factory(Category::class)->create();
        $data = [
            'name' => 'test'
        ];
        $response = $this->assertStore(
            $data + ['categories_id' => [$category->id]],
            $data + ['is_active' => true, 'deleted_at' => null]
        );
        $response->assertJsonStructure(['data' => $this->serializedFields]);
        $this->assertDatabaseHas(
            'category_genre',
            [
                'genre_id' => $response->json('data.id'),
                'category_id' => $category->id
            ]
        );
        $id = $response->json('data.id');
        $resource = new GenreResource(Genre::find($id));
        $this->assertResource($response, $resource);

        $data = [
            'name' => 'test',
            'is_active' => false
        ];
        $this->assertStore($data  + ['categories_id' => [$category->id]], $data);
    }

    public function testRollbackStore()
    {
        /** @var $controller Object */
        $controller = \Mockery::mock(GenreController::class);
        $controller->makePartial()->shouldAllowMockingProtectedMethods();
        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn([
                'name' => 'test',
                'is_active' => false
            ]);
        $controller
            ->shouldReceive('rulesStore')
            ->andReturn([]);
        $controller
            ->shouldReceive('model')
            ->andReturn(Genre::class);
        $controller
            ->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        /** @var $request Object */
        $request = \Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->store($request);
        } catch (TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdate()
    {
        $category = factory(Category::class)->create();
        $data = [
            'name' => 'test',
            'is_active' => true
        ];

        $response = $this->assertUpdate(
            $data + ['categories_id' => [$category->id]],
            $data + ['deleted_at' => null]
        );
        $response->assertJsonStructure(['data' => $this->serializedFields]);

        $this->assertDatabaseHas(
            'category_genre',
            [
                'genre_id' => $response->json('data.id'),
                'category_id' => $category->id
            ]
        );

        $id = $response->json('data.id');
        $resource = new GenreResource(Genre::find($id));
        $this->assertResource($response, $resource);
    }

    public function testRollbackUpdate()
    {
        $this->genre->refresh();

        /** @var $controller Object */
        $controller = \Mockery::mock(GenreController::class);
        $controller->makePartial()->shouldAllowMockingProtectedMethods();
        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn([
                'name' => 'test try update',
                'is_active' => true
            ]);
        $controller
            ->shouldReceive('rulesUpdate')
            ->andReturn([]);
        $controller
            ->shouldReceive('model')
            ->andReturn(Genre::class);
        $controller
            ->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        /** @var $request Object */
        $request = \Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->update($request, $this->genre->id);
        } catch (TestException $exception) {
            $genresDatabase = Genre::all();

            $this->assertCount(1, $genresDatabase);
            $this->assertEqualsCanonicalizing([$this->genre->toArray()], $genresDatabase->toArray());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testDestroy()
    {
        $reponse = $this->json('DELETE', route('genres.destroy', ['genre' => $this->genre->id]));

        $reponse->assertStatus(204);
        $this->assertNull(Genre::find($this->genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];

        $response = $this->json('POST', $this->routeStore(), $sendData);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('data.id')
        ]);

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->json(
            'PUT',
            route('genres.update', ['genre' => $response->json('data.id')]),
            $sendData
        );

        $this->assertDatabaseMissing('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('data.id')
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[1],
            'genre_id' => $response->json('data.id')
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[2],
            'genre_id' => $response->json('data.id')
        ]);
    }

    protected function model()
    {
        return Genre::class;
    }

    protected function routeStore()
    {
        return route('genres.store');
    }

    protected function routeUpdate()
    {
        return route('genres.update', ['genre' => $this->genre->id]);
    }
}
