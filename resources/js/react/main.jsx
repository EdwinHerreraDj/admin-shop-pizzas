import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

/* PAGES */
import TiposProductoIndex from "./pages/tipos-producto/TiposProductoIndex";
import TamanosIndex from "./pages/tamanos/tamanosIndex";
import CategoriasIngredientesIndex from "./pages/categorias-ingredientes/CategoriasIngredientesIndex";
import IngredientesIndex from "./pages/ingredientes/IngredientesIndex";
import PreciosIngredientesIndex from "./pages/precios-ingredientes/PreciosIngredientesIndex";
import ArticulosIndex from "./pages/articulos/ArticulosIndex";
import PreciosArticulosIndex from "./pages/precios-articulos/PreciosArticulosIndex";
import ArticuloIngredientes from "./pages/articulo-ingredientes/ArticuloIngredientes";
import CategoriasArticulos from "./pages/categorias-articulos/CategoriasArticulosIndex";
import OrdenCategorias from "./pages/categorias-articulos/OrdenCategorias";

/* =========================
   INGREDIENTES
========================= */

/* =========================
   TIPOS PRODUCTO
========================= */
const tiposProductoRoot = document.getElementById("tipos-producto-root");

if (tiposProductoRoot) {
    createRoot(tiposProductoRoot).render(
        <>
            <Toaster position="top-right" />
            <TiposProductoIndex />
        </>,
    );
}

const tamanosRoot = document.getElementById("tamanos-root");

if (tamanosRoot) {
    createRoot(tamanosRoot).render(
        <>
            <Toaster position="top-right" />
            <TamanosIndex />
        </>,
    );
}

const categoriasIngredientesRoot = document.getElementById(
    "categorias-ingredientes-root",
);

if (categoriasIngredientesRoot) {
    createRoot(categoriasIngredientesRoot).render(
        <>
            <Toaster position="top-right" />
            <CategoriasIngredientesIndex />
        </>,
    );
}

const ingredientesRoot = document.getElementById("ingredientes-root");

if (ingredientesRoot) {
    createRoot(ingredientesRoot).render(
        <>
            <Toaster position="top-right" />
            <IngredientesIndex />
        </>,
    );
}

const ingredientePreciosRoot = document.getElementById(
    "ingrediente-precios-root",
);

if (ingredientePreciosRoot) {
    createRoot(ingredientePreciosRoot).render(
        <>
            <Toaster position="top-right" />
            <PreciosIngredientesIndex />
        </>,
    );
}

const articulosRoot = document.getElementById("articulos-root");

if (articulosRoot) {
    createRoot(articulosRoot).render(
        <>
            <Toaster position="top-right" />
            <ArticulosIndex />
        </>,
    );
}

const articuloPreciosRoot = document.getElementById("articulo-precios-root");

if (articuloPreciosRoot) {
    createRoot(articuloPreciosRoot).render(
        <>
            <Toaster position="top-right" />
            <PreciosArticulosIndex />
        </>,
    );
}

const articuloIngredientesRoot = document.getElementById(
    "articulo-ingredientes-root",
);

if (articuloIngredientesRoot) {
    createRoot(articuloIngredientesRoot).render(
        <>
            <Toaster position="top-right" />
            <ArticuloIngredientes
                articuloId={articuloIngredientesRoot.dataset.articuloId}
            />
        </>,
    );
}

const categoriasArticulosRoot = document.getElementById(
    "categorias-articulos-root",
);

if (categoriasArticulosRoot) {
    createRoot(categoriasArticulosRoot).render(
        <>
            <Toaster position="top-right" />
            <CategoriasArticulos />
        </>,
    );
}

const categoriasOrdenArticulosRoot = document.getElementById(
    "categorias-orden-articulos-root",
);

if (categoriasOrdenArticulosRoot) {
    createRoot(categoriasOrdenArticulosRoot).render(
        <>
            <Toaster position="top-right" />
            <OrdenCategorias />
        </>,
    );
}
