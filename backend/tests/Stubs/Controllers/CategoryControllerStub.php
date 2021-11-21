<?php

namespace Tests\Stubs\Controllers;

use App\Http\Controllers\Api\BasicCrudController;
use Tests\Stubs\Models\CategoryStub;
use Tests\Stubs\Resources\CategoryStubResource;

class CategoryControllerStub extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'description' => 'nullable|max:255'
    ];

    protected function model()
    {
        return CategoryStub::class;
    }

    protected function resource()
    {
        return CategoryStubResource::class;
    }

    protected function resourceCollection()
    {
        return $this->resource();
    }

    protected function rulesStore()
    {
        return $this->rules;
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }
}
