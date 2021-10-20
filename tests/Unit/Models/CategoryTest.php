<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use PHPUnit\Framework\TestCase;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoryTest extends TestCase
{
    private $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = new Category();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'description', 'is_active'];

        $this->assertEqualsCanonicalizing($fillable, $this->category->getFillable());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->category->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];

        $this->assertEqualsCanonicalizing($dates, $this->category->getDates());
        $this->assertCount(count($dates), $this->category->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = ['is_active' => 'boolean'];
        $this->assertEqualsCanonicalizing($casts, $this->category->getCasts());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class];

        $this->assertEquals($traits, array_keys(class_uses(Category::class)));
    }
}
