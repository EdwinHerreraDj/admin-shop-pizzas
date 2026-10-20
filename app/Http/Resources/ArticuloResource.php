<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Services\MiniaturaImagen;
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
            // WebP ligero para las tarjetas de la tienda (o la original si aún no existe)
            'imagen_miniatura' => MiniaturaImagen::url($this->imagen),
            'personalizable' => $this->personalizable,
            'esComida' => $this->categorias->contains('es_comida', true),
            'tamanos' => $this->precios->map(fn($p) => [
                'id' => $p->tamano->id,
                'nombre' => $p->tamano->nombre,
                'precio' => $p->precio,
            ]),
        ];
    }
}
