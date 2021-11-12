<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
    ];

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        $self = $this;

        $genre = \DB::transaction(function () use ($validatedData, $self) {
            $genre = $this->model()::create($validatedData);
            $self->handleRelations($genre, $validatedData);
            return $genre;
        });
        $genre->refresh();

        return new GenreResource($genre);
    }

    public function update(Request $request, $id)
    {
        $genre = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->rulesUpdate());
        $self = $this;

        $genre = \DB::transaction(function () use ($genre, $validatedData, $self) {
            $genre->update($validatedData);
            $self->handleRelations($genre, $validatedData);
            return $genre;
        });

        return new GenreResource($genre);
    }

    protected function handleRelations(genre $genre, array $validatedData)
    {
        $genre->categories()->sync($validatedData['categories_id']);
    }

    protected function model()
    {
        return Genre::class;
    }

    protected function resource()
    {
        return GenreResource::class;
    }

    protected function resourceCollection()
    {
        return GenreResource::class;
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
