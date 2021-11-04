<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CastMemberTest extends TestCase
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
        factory(CastMember::class, 1)->create();

        $castMembers = CastMember::all();

        $this->assertCount(1, $castMembers);
        $categoryKeys = array_keys($castMembers->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            ['id', 'name', 'type', 'created_at', 'updated_at', 'deleted_at'],
            $categoryKeys
        );
    }

    public function testCreate()
    {
        $category = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_ACTOR
        ]);
        $category->refresh();
        $this->assertEquals(36, strlen($category->id));
        $this->assertTrue(boolval(preg_match(CategoryTest::$UUID_REGEX, $category->id)));
        $this->assertEquals('test1', $category->name);
        $this->assertEquals(CastMember::TYPE_ACTOR, $category->type);
    }

    public function testUpdate()
    {
        $category = factory(CastMember::class)->create([
            'name' => 'test name',
            'type' => CastMember::TYPE_ACTOR
        ]);

        $data = [
            'name' => 'test name updated',
            'type' => CastMember::TYPE_DIRECTOR
        ];
        $category->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $category->{$key});
        }
    }

    public function testDelete()
    {
        $category = factory(CastMember::class)->create();
        $this->assertNotNull(CastMember::find($category->id));

        $category->delete();
        $this->assertNull(CastMember::find($category->id));

        $category->restore();
        $this->assertNotNull(CastMember::find($category->id));
    }
}
