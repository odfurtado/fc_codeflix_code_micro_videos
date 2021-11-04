<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
   use DatabaseMigrations;

   /** @var CategoryControllerStub $controller */
   private $controller;

   protected function setUp(): void
   {
      parent::setUp();
      CategoryStub::dropTable();
      CategoryStub::createTable();

      $this->controller = new CategoryControllerStub();
   }

   protected function tearDown(): void
   {
      CategoryStub::dropTable();
      parent::tearDown();
   }

   public function testIndex()
   {
      /** @var CategoryStub $category */
      $category = CategoryStub::create([
         'name' => 'test_name',
         'description' => 'test_description'
      ]);

      $this->assertEquals([$category->toArray()], $this->controller->index()->toArray());
   }

   public function testnvalidationDataStore()
   {
      $this->expectException(ValidationException::class);

      /** @var object $request */
      $request = \Mockery::mock(Request::class);
      $request
         ->shouldReceive('all')
         ->andReturn(['name' => '']);
      $this->controller->store($request);
   }

   public function testStore()
   {
      /** @var object $request */
      $request = \Mockery::mock(Request::class);
      $request
         ->shouldReceive('all')
         ->andReturn(['name' => 'test_name', 'description' => 'test_description']);

      $obj = $this->controller->store($request);
      $this->assertEquals(CategoryStub::find($obj->id)->toArray(), $obj->toArray());
   }

   public function testIfFindOrFailFetchModel()
   {
      /** @var CategoryStub $category */
      $category = CategoryStub::create([
         'name' => 'test_name',
         'description' => 'test_description'
      ]);

      $reflectionClass = new \ReflectionClass(BasicCrudController::class);
      $reflectionMethod = $reflectionClass->getMethod('findOrFail');
      $reflectionMethod->setAccessible(true);

      $result = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
      $this->assertInstanceOf(CategoryStub::class, $result);
   }

   public function testIfFindOrFailThrowExceptionWhenIdInvalid()
   {
      $this->expectException(ModelNotFoundException::class);

      $reflectionClass = new \ReflectionClass(BasicCrudController::class);
      $reflectionMethod = $reflectionClass->getMethod('findOrFail');
      $reflectionMethod->setAccessible(true);

      $reflectionMethod->invokeArgs($this->controller, [0]);
   }

   public function testShow()
   {
      /** @var CategoryStub $category */
      $category = CategoryStub::create([
         'name' => 'test_name',
         'description' => 'test_description'
      ]);

      $result = $this->controller->show($category->id);

      $this->assertEquals($result->toArray(), CategoryStub::find($category->id)->toArray());
   }

   public function testUpdate()
   {
      /** @var CategoryStub $category */
      $category = CategoryStub::create([
         'name' => 'test_name',
         'description' => 'test_description'
      ]);

      /** @var object $request */
      $request = \Mockery::mock(Request::class);
      $request
         ->shouldReceive('all')
         ->andReturn(['name' => 'test_name_updated', 'description' => 'test_description_updated']);

      $result = $this->controller->update($request, $category->id);

      $this->assertEquals($result->toArray(), CategoryStub::find($category->id)->toArray());
   }

   public function testDestroy()
   {
      /** @var CategoryStub $category */
      $category = CategoryStub::create([
         'name' => 'test_name',
         'description' => 'test_description'
      ]);

      $response = $this->controller->destroy($category->id);

      $this->createTestResponse($response)->assertStatus(204);

      $this->assertNull(CategoryStub::find($category->id));
   }
}
