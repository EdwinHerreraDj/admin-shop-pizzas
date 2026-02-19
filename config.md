ARQUITECTURA DEFINITIVA – PIZZERÍA
🔹 1. articulos

Campos clave:

id

nombre

descripcion

tipo_producto_id (nullable)

personalizable (boolean)

publicado

orden

hora_inicio_venta

hora_fin_venta

🔹 2. tipo_producto

Función real:

Define qué ingredientes son compatibles con el artículo.

No define:

Tamaños

Precios

Si es personalizable

Ejemplos:

Pizza

Bebida

Postre

🔹 3. personalizable (boolean)

Significado exacto:

Permite al cliente modificar ingredientes en frontend.

Si true → Se carga configuración de ingredientes.

Si false → Solo se puede agregar al carrito sin modificar.

No controla:

Tamaños

Precios

Existencia de tipo

🔹 4. tamanos

Tabla global.

Ejemplos:

Pequeña

Mediana

Grande

Único

No dependen de tipo_producto.

🔹 5. articulo_precios

Relación:

articulo_id
tamano_id
precio


Un artículo puede:

Tener 1 tamaño (Único)

Tener varios tamaños

No depende de tipo_producto

No depende de personalizable

🔥 REGLAS IMPORTANTES (NO ROMPER)
✅ Regla 1

Si personalizable = true
→ Debe existir tipo_producto_id.

Porque necesitas saber qué ingredientes cargar.

✅ Regla 2

Si personalizable = false
→ Puede tener tipo_producto o no.

Ejemplo:

Cerveza puede tener tipo “Bebida”.

O puede no tener tipo si no lo usas para nada más.

✅ Regla 3

Precios SIEMPRE vienen de articulo_precios.

Nunca mezclar:

precio directo en articulo

articulo_precios en otros

Un solo sistema de precios.

✅ Regla 4

Tamaños son globales.

No dependen de tipo_producto.

🎯 Ejemplos reales
🍺 Cerveza

personalizable = false

tipo_producto = Bebida

tamaño = Único

precio = 3€

Frontend:
→ Solo botón “Agregar”

🍕 Pizza

personalizable = true

tipo_producto = Pizza

tamaños = Pequeña, Mediana, Grande

precios = varios

Frontend:
→ Botón “Personalizar”

🚨 COSAS QUE NO DEBEMOS HACER

❌ No eliminar tipo_producto si no es personalizable.
❌ No usar tipo_producto para decidir tamaños.
❌ No mezclar precio directo y articulo_precios.
❌ No hacer que personalizable controle precios.

📌 Resumen mental corto
tipo_producto → ingredientes
personalizable → permite modificar
tamanos → globales
articulo_precios → precios reales


