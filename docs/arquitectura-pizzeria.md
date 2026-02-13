STACK TECNOLÓGICO

Backend

Laravel

API REST bajo /api

API admin bajo /api/admin

Autenticación: sesión + CSRF (panel)

Base de datos MySQL

Frontend Admin

React embebido en Blade

Axios con baseURL /api/admin

TailwindCSS

react-hot-toast

Frontend Cliente

React (app pública)

Consumo de /api/\*

Carrito persistido en localStorage

2️⃣ ESTRUCTURA GLOBAL DEL SISTEMA
🧠 Núcleo de Productos
Tablas principales

tipos_producto

articulos

tamanos

articulo_precios

categorias_articulos

articulo_categoria

categorias_ingredientes

ingredientes

ingrediente_precios

articulo_ingredientes

Principio clave

No hay lógica implícita.
Todo está configurado en base de datos.

3️⃣ FLUJO DE CONFIGURACIÓN (ADMIN)

Orden correcto de configuración:

Crear tipos de producto

Crear tamaños

Crear categorías de ingredientes

Crear ingredientes

Definir precios por tipo + tamaño

Crear categorías de artículos

Crear artículo

Asignar precios base por tamaño

Configurar ingredientes base y extras

Si este orden no se respeta, el sistema queda inconsistente.

4️⃣ FLUJO DE PERSONALIZACIÓN (CLIENTE)
Pizza entera

Usuario elige artículo

Usuario elige tamaño

Sistema carga:

Ingredientes base (incluidos_por_defecto)

Ingredientes extra disponibles

Usuario puede:

Quitar base

Añadir extras

Modificar cantidad (si permitido)

Precio final =
precio_base_tamaño

suma(extras)

Pizza por mitades

Cada mitad:

Es un artículo independiente

Puede tener ingredientes distintos

Puede tener tamaño compartido

Precio:

Puede ser promedio o mayor precio (según regla futura)

5️⃣ ESTRUCTURA DEL CARRITO

Formato base:

{
id_unico,
articulo_id,
nombre,
tamaño_id,
tamaño_nombre,
precio_base,
extras: [],
ingredientes_quitados: [],
total,
cantidad
}

Principios:

Las pizzas por mitades nunca se agrupan.

Productos simples sí se agrupan por coincidencia exacta.

Persistencia en localStorage.

6️⃣ PRINCIPIOS ARQUITECTÓNICOS DEL SISTEMA

✔ Separación clara entre configuración y ejecución
✔ Precios normalizados
✔ Nada hardcodeado en frontend
✔ React solo gestiona estado y UI
✔ Laravel controla reglas de negocio
✔ Base de datos como única fuente de verdad

7️⃣ RIESGOS ACTUALES DEL SISTEMA

Complejidad creciente en personalización

Necesidad futura de validación fuerte en backend

Posible conflicto si se agregan combos o promociones

Gestión futura de pedidos y estados aún no integrada

8️⃣ SIGUIENTE NIVEL (AÚN NO IMPLEMENTADO)

Tabla pedidos

Tabla pedido_detalles

Snapshot de precios al momento del pedido

Control de stock

Sistema de estados (pendiente, en preparación, entregado)

Integración pasarela de pago
