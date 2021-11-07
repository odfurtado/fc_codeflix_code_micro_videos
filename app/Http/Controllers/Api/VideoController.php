<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => 'required|array|exists:genres,id,deleted_at,NULL'
        ];
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        $self = $this;

        $video = \DB::transaction(function () use ($validatedData, $self) {
            $video = $this->model()::create($validatedData);
            $self->handleRelations($video, $validatedData);
            return $video;
        });
        $video->refresh();

        return $video;
    }

    public function update(Request $request, $id)
    {
        $video = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->rulesUpdate());
        $self = $this;

        $video = \DB::transaction(function () use ($video, $validatedData, $self) {
            $video->update($validatedData);
            $self->handleRelations($video, $validatedData);
            return $video;
        });

        return $video;
    }

    protected function handleRelations(Video $video, array $validatedData)
    {
        $video->categories()->sync($validatedData['categories_id']);
        $video->genres()->sync($validatedData['genres_id']);
    }

    protected function model()
    {
        return Video::class;
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
