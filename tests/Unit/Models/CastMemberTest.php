<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use PHPUnit\Framework\TestCase;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMemberTest extends TestCase
{
    private $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = new CastMember();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'type'];

        $this->assertEqualsCanonicalizing($fillable, $this->castMember->getFillable());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->castMember->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];

        $this->assertEqualsCanonicalizing($dates, $this->castMember->getDates());
        $this->assertCount(count($dates), $this->castMember->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = ['type' => 'integer'];
        $this->assertEqualsCanonicalizing($casts, $this->castMember->getCasts());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class];

        $this->assertEquals($traits, array_keys(class_uses(CastMember::class)));
    }
}
