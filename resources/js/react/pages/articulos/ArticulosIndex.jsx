import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ArticuloModal from "./ArticuloModal";
import ArticuloCategoriasModal from "./ArticuloCategoriasModal";
import ArticuloPreciosModal from "./ArticuloPreciosModal";
import RowActionsDropdown from "./RowActionsDropdown";

export default function ArticulosIndex() {
    const [items, setItems] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [loading, setLoading] = useState(true);

    // Filtros
    const [search, setSearch] = useState("");
    const [categoriaId, setCategoriaId] = useState("");

    // Paginación
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const perPage = 10;

    // Modales
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [categoriasArticulo, setCategoriasArticulo] = useState(null);

    // Estados para los precios de los articulos
    const [preciosArticulo, setPreciosArticulo] = useState(null);

    /* =========================
   CARGA DE ARTÍCULOS (REACTIVA)
========================= */
    const loadArticulos = async () => {
        setLoading(true);

        try {
            const res = await axios.get("/api/admin/articulos", {
                params: {
                    search,
                    categoria_id: categoriaId,
                    page,
                    per_page: perPage,
                },
            });

            setItems(res.data.data);
            setLastPage(res.data.last_page);
        } catch (e) {
            toast.error("No se pudieron cargar los artículos");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
   CARGA DE CATÁLOGOS (UNA VEZ)
========================= */
    const loadCatalogos = async () => {
        try {
            const [tiposRes, catRes] = await Promise.all([
                axios.get("/api/admin/tipos-producto"),
                axios.get("/api/admin/categorias-articulos"),
            ]);

            setTipos(tiposRes.data);
            setCategorias(catRes.data);
        } catch {
            toast.error("No se pudieron cargar los catálogos");
        }
    };

    /* =========================
   EFFECTS
========================= */

    // Catálogos → una sola vez
    useEffect(() => {
        loadCatalogos();
    }, []);

    // Artículos → cada vez que cambian filtros o página
    useEffect(() => {
        loadArticulos();
    }, [page, search, categoriaId]);

    /* =========================
   ACCIONES
========================= */
    const onCreate = () => {
        setEditing(null);
        setOpen(true);
    };

    const onEdit = (row) => {
        setEditing(row);
        setOpen(true);
    };

    const onDelete = (row) => {
        setDeleteItem(row);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        setDeleting(true);
        try {
            await axios.delete(`/api/admin/articulos/${deleteItem.id}`);
            toast.success("Artículo eliminado");
            setDeleteItem(null);
            loadArticulos();
        } catch (e) {
            toast.error(e?.response?.data?.message ?? "No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-7">
            {/* HEADER */}
            <div
                className="
            relative
            mb-7
            rounded-3xl
            bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
            p-[1px]
            shadow-[0_10px_50px_rgba(0,0,0,0.15)]
        "
            >
                <div className="rounded-3xl bg-white px-7 py-6 flex items-center justify-between">
                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                        <div
                            className="
                        w-12 h-12
                        rounded-2xl
                        bg-gradient-to-br from-indigo-500 to-violet-600
                        text-white
                        flex items-center justify-center
                        text-2xl
                        shadow-lg
                    "
                        >
                            <i className="mgc_box_3_line"></i>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Artículos
                            </h1>
                            <p className="text-sm text-gray-500">
                                Gestión completa del catálogo de productos
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/admin/categorias-articulos"
                            className="
                        inline-flex items-center gap-2
                        h-11 px-5
                        rounded-xl
                        border border-gray-200
                        bg-white
                        text-gray-700
                        text-sm font-medium
                        shadow-sm
                        hover:bg-gray-50
                        hover:border-gray-300
                        hover:shadow
                        transition
                    "
                        >
                            <i className="mgc_folder_line text-lg"></i>
                            Categorías
                        </a>

                        <button
                            onClick={onCreate}
                            className="
                        inline-flex items-center gap-2
                        h-11 px-6
                        rounded-xl
                        bg-gradient-to-r from-emerald-500 to-teal-600
                        text-white
                        text-sm font-semibold
                        hover:opacity-95
                        active:scale-[0.98]
                        transition
                        shadow-xl
                        shadow-emerald-600/30
                    "
                        >
                            <i className="mgc_add_line text-lg"></i>
                            Nuevo artículo
                        </button>
                    </div>
                </div>
            </div>


            {/* TABLE CARD */}
            <div
                className="
            rounded-3xl
            bg-white
            border border-gray-200
            shadow-[0_20px_60px_rgba(0,0,0,0.06)]
            overflow-hidden
        "
            >
                {/* TOP BAR TABLA */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/70">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-700">
                            Listado de artículos
                        </h2>
                        <p className="text-xs text-slate-500">
                            Filtra por nombre o categoría
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* BUSCADOR */}
                        <div className="relative w-full sm:w-64">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <i className="mgc_search_2_line text-lg"></i>
                            </div>

                            <input
                                type="text"
                                placeholder="Buscar por nombre…"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="
                        w-full h-10
                        pl-10 pr-4
                        rounded-xl
                        border border-slate-200
                        bg-white
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500/40
                        focus:border-violet-500
                        transition
                    "
                            />
                        </div>

                        {/* SELECT CATEGORÍA */}
                        <div className="relative w-full sm:w-56">
                            <select
                                value={categoriaId}
                                onChange={(e) => {
                                    setCategoriaId(e.target.value);
                                    setPage(1);
                                }}
                                className="
                        w-full h-10
                        px-3
                        rounded-xl
                        border border-slate-200
                        bg-white
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500/40
                        focus:border-violet-500
                        transition
                    "
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="w-full overflow-x-auto border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[1200px] text-sm text-slate-700">
                        {/* HEADER */}
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Imagen</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Precios</th>
                                <th className="px-6 py-4">Personalizable</th>
                                <th className="px-6 py-4">Publicado</th>
                                <th className="px-6 py-4">Categorías</th>
                                <th className="px-6 py-4">Orden</th>
                                <th className="px-6 py-4 w-[260px] text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="px-6 py-16 text-center text-slate-400 text-sm"
                                    >
                                        Cargando…
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="px-6 py-16 text-center text-slate-400 text-sm"
                                    >
                                        Sin datos
                                    </td>
                                </tr>
                            ) : (
                                items.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="group hover:bg-violet-50/50 transition-colors duration-200"
                                    >
                                        {/* IMAGEN */}
                                        <td className="px-6 py-5">
                                            {row.imagen_url ? (
                                                <img
                                                    src={row.imagen_url}
                                                    alt={row.nombre}
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                    <i className="mgc_xls_line text-lg"></i>
                                                </div>
                                            )}
                                        </td>

                                        {/* NOMBRE */}
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-slate-900">
                                                {row.nombre}
                                            </div>
                                        </td>

                                        {/* DESCRIPCIÓN */}
                                        <td className="px-6 py-5 max-w-[320px]">
                                            <p className="text-slate-600 truncate whitespace-nowrap">
                                                {row.descripcion ?? "No aplica"}
                                            </p>
                                        </td>

                                        {/* TIPO */}
                                        <td className="px-6 py-5 text-slate-600 font-medium">
                                            {row.tipo_producto?.nombre ??
                                                "No aplica"}
                                        </td>

                                        {/* PRECIOS */}
                                        <td className="px-6 py-5">
                                            {row.precios?.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {row.precios.map((p) => (
                                                        <div
                                                            key={p.tamano_id}
                                                            className="inline-flex items-center justify-between gap-4 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-100 w-fit"
                                                        >
                                                            <span>
                                                                {
                                                                    p.tamano
                                                                        ?.nombre
                                                                }
                                                            </span>
                                                            <span>
                                                                {parseFloat(
                                                                    p.precio,
                                                                ).toFixed(2)}
                                                                €
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">
                                                    Sin precios
                                                </span>
                                            )}
                                        </td>

                                        {/* PERSONALIZABLE */}
                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    row.personalizable
                                                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                                }`}
                                            >
                                                {row.personalizable
                                                    ? "Sí"
                                                    : "No"}
                                            </span>
                                        </td>

                                        {/* PUBLICADO */}
                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    row.publicado
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-rose-50 text-rose-600 border-rose-100"
                                                }`}
                                            >
                                                {row.publicado
                                                    ? "Publicado"
                                                    : "Oculto"}
                                            </span>
                                        </td>

                                        {/* CATEGORÍAS */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2 max-w-[240px]">
                                                {row.categorias?.length > 0 ? (
                                                    <>
                                                        {row.categorias
                                                            .slice(0, 2)
                                                            .map((cat) => (
                                                                <span
                                                                    key={cat.id}
                                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200"
                                                                >
                                                                    {cat.nombre}
                                                                </span>
                                                            ))}

                                                        {row.categorias.length >
                                                            2 && (
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                +
                                                                {row.categorias
                                                                    .length - 2}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">
                                                        Sin categoría
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ORDEN */}
                                        <td className="px-6 py-5 text-slate-500 font-semibold">
                                            {row.orden}
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end items-center gap-2">
                                                {/* Editar visible */}
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="
                h-9 px-4
                rounded-xl
                bg-indigo-600
                text-white
                text-xs font-semibold
                hover:bg-indigo-700
                transition
            "
                                                >
                                                    Editar
                                                </button>

                                                {/* Dropdown */}
                                                <RowActionsDropdown
                                                    row={row}
                                                    onCategorias={(r) =>
                                                        setCategoriasArticulo(r)
                                                    }
                                                    onIngredientes={(r) =>
                                                        (window.location.href = `/admin/articulos/${r.id}/ingredientes`)
                                                    }
                                                    onPrecios={(r) =>
                                                        setPreciosArticulo(r)
                                                    }
                                                    onDelete={(r) =>
                                                        onDelete(r)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINACIÓN */}
            {lastPage > 1 && (
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="h-9 px-4 rounded-lg border text-sm disabled:opacity-40"
                    >
                        Anterior
                    </button>

                    <span className="h-9 px-4 flex items-center text-sm text-gray-600">
                        Página {page} de {lastPage}
                    </span>

                    <button
                        disabled={page === lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-9 px-4 rounded-lg border text-sm disabled:opacity-40"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* MODALES */}
            {open && (
                <ArticuloModal
                    item={editing}
                    tipos={tipos}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false);
                        loadArticulos();
                    }}
                />
            )}

            {deleteItem && (
                <ConfirmDeleteModal
                    title="Eliminar artículo"
                    message={`¿Seguro que deseas eliminar "${deleteItem.nombre}"?`}
                    confirmText={deleting ? "Eliminando…" : "Eliminar"}
                    onCancel={() => setDeleteItem(null)}
                    onConfirm={confirmDelete}
                />
            )}

            {categoriasArticulo && (
                <ArticuloCategoriasModal
                    articulo={categoriasArticulo}
                    onClose={() => setCategoriasArticulo(null)}
                    onSaved={loadArticulos}
                />
            )}

            {preciosArticulo && (
                <ArticuloPreciosModal
                    articulo={preciosArticulo}
                    onClose={() => setPreciosArticulo(null)}
                    onSaved={() => {
                        setPreciosArticulo(null);
                        loadArticulos();
                    }}
                />
            )}
        </div>
    );
}
