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
import ZonasEnvio from "./pages/zonas-envios/ZonasEnviosIndex";
import FranjasHorarias from "./pages/franjas-horarias/FranjasHorariasIndex";
import MetodosPago from "./pages/metodos-pago/MetodosPagoIndex";
import ConfigSonido from "./pages/config-sonido/ConfigSonidoIndex";
import QzDiagnostico from "./pages/qz-diagnostico/QzDiagnostico";
import DashboardIndex from "./pages/dashboard/DashboardIndex";
import CocinaIndex from "./pages/cocina/CocinaIndex";
import GestionPedidosIndex from "./pages/gestion-pedidos/GestionPedidoIndex";
import PasarelaPagoIndex from "./pages/pasarela-pago/PasarelaPagoIndex";
import EstadoTiendaIndex from "./pages/estado-tienda/EstadoTiendaIndex";
import CardsInfoIndex from "./pages/cards-info/CardsInfoIndex";
import PaginasLegalesIndex from "./pages/paginas-legales/PaginasLegalesIndex";
import EmpresaIndex from "./pages/empresa/EmpresaIndex";

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

const zonasEnvioRoot = document.getElementById("zonas-envio-root");

if (zonasEnvioRoot) {
    createRoot(zonasEnvioRoot).render(
        <>
            <Toaster position="top-right" />
            <ZonasEnvio />
        </>,
    );
}

const dashboardRoot = document.getElementById("dashboard-root");

if (dashboardRoot) {
    createRoot(dashboardRoot).render(
        <>
            <Toaster position="top-right" />
            <DashboardIndex />
        </>,
    );
}

const configSonidoRoot = document.getElementById("config-sonido-root");

if (configSonidoRoot) {
    createRoot(configSonidoRoot).render(
        <>
            <Toaster position="top-right" />
            <ConfigSonido />
        </>,
    );
}

const qzDiagnosticoRoot = document.getElementById("qz-diagnostico-root");

if (qzDiagnosticoRoot) {
    createRoot(qzDiagnosticoRoot).render(
        <>
            <Toaster position="top-right" />
            <QzDiagnostico />
        </>,
    );
}

const metodosPagoRoot = document.getElementById("metodos-pago-root");

if (metodosPagoRoot) {
    createRoot(metodosPagoRoot).render(
        <>
            <Toaster position="top-right" />
            <MetodosPago />
        </>,
    );
}

const franjasHorariasRoot = document.getElementById("franjas-horarias-root");

if (franjasHorariasRoot) {
    createRoot(franjasHorariasRoot).render(
        <>
            <Toaster position="top-right" />
            <FranjasHorarias />
        </>,
    );
}

const cocinaRoot = document.getElementById("cocina-root");

if (cocinaRoot) {
    createRoot(cocinaRoot).render(
        <>
            <Toaster position="top-right" />
            <CocinaIndex />
        </>,
    );
}

const gestionPedidosRoot = document.getElementById("gestion-pedidos-root");

if (gestionPedidosRoot) {
    createRoot(gestionPedidosRoot).render(
        <>
            <Toaster position="top-right" />
            <GestionPedidosIndex />
        </>,
    );
}

const pasarelaPagoRoot = document.getElementById("pasarela-pago-root");

if (pasarelaPagoRoot) {
    createRoot(pasarelaPagoRoot).render(
        <>
            <Toaster position="top-right" />
            <PasarelaPagoIndex />
        </>,
    );
}

const estadoTiendaRoot = document.getElementById("estado-tienda-root");

if (estadoTiendaRoot) {
    createRoot(estadoTiendaRoot).render(
        <>
            <Toaster position="top-right" />
            <EstadoTiendaIndex />
        </>,
    );
}

const cardsInfoRoot = document.getElementById("cards-info-root");

if (cardsInfoRoot) {
    createRoot(cardsInfoRoot).render(
        <>
            <Toaster position="top-right" />
            <CardsInfoIndex />
        </>,
    );
}

const paginasLegalesRoot = document.getElementById("paginas-legales-root");

if (paginasLegalesRoot) {
    createRoot(paginasLegalesRoot).render(
        <>
            <Toaster position="top-right" />
            <PaginasLegalesIndex />
        </>,
    );
}

const empresaRoot = document.getElementById("empresa-root");

if (empresaRoot) {
    createRoot(empresaRoot).render(
        <>
            <Toaster position="top-right" />
            <EmpresaIndex />
        </>,
    );
}
