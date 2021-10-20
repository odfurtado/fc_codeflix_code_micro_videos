<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testList()
    {
        factory(Genre::class, 1)->create();

        $categories = Genre::all();

        $this->assertCount(1, $categories);
        $GenreKeys = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            ['id', 'name', 'is_active', 'created_at', 'updated_at', 'deleted_at'],
            $GenreKeys
        );
    }

    public function testCreate()
    {
        $Genre = Genre::create([
            'name' => 'test1'
        ]);
        $Genre->refresh();
        $this->assertEquals(36, strlen($Genre->id));
        $this->assertEquals('test1', $Genre->name);
        $this->assertTrue($Genre->is_active);


        $Genre = Genre::create([
            'name' => 'test1',
            'is_active' => false
        ]);
        $this->assertFalse($Genre->is_active);

        $Genre = Genre::create([
            'name' => 'test1',
            'is_active' => true
        ]);
        $this->assertTrue($Genre->is_active);
    }

    public function testUpdate()
    {
        $Genre = factory(Genre::class)->create([
            'is_active' => false
        ]);

        $data = [
            'name' => 'test name updated',
            'is_active' => true
        ];
        $Genre->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $Genre->{$key});
        }
    }

    public function testDelete()
    {
        $Genre = factory(Genre::class)->create();
        $this->assertNotNull(Genre::find($Genre->id));

        $Genre->delete();
        $this->assertNull(Genre::find($Genre->id));

        $Genre->restore();
        $this->assertNotNull(Genre::find($Genre->id));
    }
}
