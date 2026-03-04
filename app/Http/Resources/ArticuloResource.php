<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticuloResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'imagen' => $this->imagen
                ? asset('storage/' . $this->imagen)
                : null,
            'personalizable' => $this->personalizable,
            'tamanos' => $this->precios->map(fn($p) => [
                'id' => $p->tamano->id,
                'nombre' => $p->tamano->nombre,
                'precio' => $p->precio,
            ]),
        ];
    }
}
