<?php

namespace App\Models\Traits;

use Ramsey\Uuid\Uuid as RamseyUuuid;

trait Uuid {
   public static function boot() {
      parent::boot();
      static::creating(function($obj) {
          $obj->id = RamseyUuuid::uuid4()->toString();
      });
  }
}