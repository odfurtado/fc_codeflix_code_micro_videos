<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    static $UUID_REGEX = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";

    use DatabaseMigrations;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testList()
    {
        //$category = Category::create(['name' => 'Categoria Teste']);
        factory(Category::class, 1)->create();

        $categories = Category::all();

        $this->assertCount(1, $categories);
        $categoryKeys = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'deleted_at'],
            $categoryKeys
        );
    }

    public function testCreate()
    {
        $category = Category::create([
            'name' => 'test1'
        ]);
        $category->refresh();
        $this->assertEquals(36, strlen($category->id));
        $this->assertTrue(boolval(preg_match(CategoryTest::$UUID_REGEX, $category->id)));
        $this->assertEquals('test1', $category->name);
        $this->assertNull($category->description);
        $this->assertTrue($category->is_active);


        $category = Category::create([
            'name' => 'test1',
            'description' => 'test description'
        ]);
        $this->assertEquals('test description', $category->description);


        $category = Category::create([
            'name' => 'test1',
            'is_active' => false
        ]);
        $this->assertFalse($category->is_active);

        $category = Category::create([
            'name' => 'test1',
            'is_active' => true
        ]);
        $this->assertTrue($category->is_active);
    }

    public function testUpdate()
    {
        $category = factory(Category::class)->create([
            'description' => 'test description',
            'is_active' => false
        ]);

        $data = [
            'name' => 'test name updated',
            'description' => 'test description updated',
            'is_active' => true
        ];
        $category->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $category->{$key});
        }
    }

    public function testDelete()
    {
        $category = factory(Category::class)->create();
        $this->assertNotNull(Category::find($category->id));

        $category->delete();
        $this->assertNull(Category::find($category->id));

        $category->restore();
        $this->assertNotNull(Category::find($category->id));
    }
}
