<?php

namespace App\Models;

use App\Models\Traits\Uuid;
use App\ModelFilters\CategoryFilter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use EloquentFilter\Filterable;

class Category extends Model
{
    use SoftDeletes, Uuid, Filterable;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'description', 'is_active'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function modelFilter()
    {
        return $this->provideFilter(CategoryFilter::class);
    }
}
