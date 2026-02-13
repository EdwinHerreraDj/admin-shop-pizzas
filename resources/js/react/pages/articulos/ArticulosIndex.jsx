import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ArticuloModal from "./ArticuloModal";
import ArticuloCategoriasModal from "./ArticuloCategoriasModal";

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

            {/* FILTROS */}
            <div className="mb-5 flex justify-end gap-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="
                h-11 w-64
                px-4
                rounded-xl
                border border-gray-300
                text-sm
                focus:ring-2 focus:ring-indigo-500
            "
                />

                <select
                    value={categoriaId}
                    onChange={(e) => {
                        setCategoriaId(e.target.value);
                        setPage(1);
                    }}
                    className="
                h-11 w-56
                px-3
                rounded-xl
                border border-gray-300
                text-sm
                focus:ring-2 focus:ring-indigo-500
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
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-sm">
                        {/* HEADER */}
                        <thead className="bg-slate-50/70 backdrop-blur-sm border-b border-gray-200">
                            <tr className="text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                <th className="px-7 py-4">Imagen</th>
                                <th className="px-7 py-4">Nombre</th>
                                <th className="px-7 py-4">Descripción</th>
                                <th className="px-7 py-4">Tipo</th>
                                <th className="px-7 py-4">Personalizable</th>
                                <th className="px-7 py-4">Publicado</th>
                                <th className="px-7 py-4">Categorías</th>
                                <th className="px-7 py-4">Orden</th>
                                <th className="px-7 py-4 w-[240px] text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="px-7 py-14 text-center text-gray-400"
                                    >
                                        Cargando…
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="px-7 py-14 text-center text-gray-400"
                                    >
                                        Sin datos
                                    </td>
                                </tr>
                            ) : (
                                items.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="
                    group
                    hover:bg-violet-50/60
                    transition
                "
                                    >
                                        {/* IMAGEN */}
                                        <td className="px-7 py-5">
                                            {row.imagen_url ? (
                                                <img
                                                    src={row.imagen_url}
                                                    alt={row.nombre}
                                                    className="
                                w-12 h-12
                                rounded-xl
                                object-cover
                                border
                            "
                                                />
                                            ) : (
                                                <div
                                                    className="
                                w-12 h-12
                                rounded-xl
                                bg-slate-100
                                flex items-center justify-center
                                text-slate-400
                            "
                                                >
                                                    <i className="mgc_xls_line text-xl"></i>
                                                </div>
                                            )}
                                        </td>

                                        {/* NOMBRE */}
                                        <td className="px-7 py-5 font-semibold text-gray-900">
                                            {row.nombre}
                                        </td>

                                        {/* DESCRIPCIÓN */}
                                        <td className="px-7 py-5 text-gray-600 max-w-[300px] truncate whitespace-nowrap">
                                            {row.descripcion ?? "No aplica"}
                                        </td>

                                        {/* TIPO */}
                                        <td className="px-7 py-5 text-gray-600">
                                            {row.tipo_producto?.nombre ??
                                                "No aplica"}
                                        </td>

                                        {/* PERSONALIZABLE */}
                                        <td className="px-7 py-5">
                                            <span
                                                className={`
                            inline-flex items-center
                            px-3 py-1
                            rounded-full
                            text-xs font-semibold
                            ${
                                row.personalizable
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-100 text-slate-600"
                            }
                        `}
                                            >
                                                {row.personalizable
                                                    ? "Sí"
                                                    : "No"}
                                            </span>
                                        </td>

                                        {/* PUBLICADO */}
                                        <td className="px-7 py-5">
                                            <span
                                                className={`
                            inline-flex items-center
                            px-3 py-1
                            rounded-full
                            text-xs font-semibold
                            ${
                                row.publicado
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-600"
                            }
                        `}
                                            >
                                                {row.publicado
                                                    ? "Publicado"
                                                    : "Oculto"}
                                            </span>
                                        </td>

                                        {/* CATEGORÍAS */}
                                        <td className="px-7 py-5">
                                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                {row.categorias?.length > 0 ? (
                                                    <>
                                                        {row.categorias
                                                            .slice(0, 2)
                                                            .map((cat) => (
                                                                <span
                                                                    key={cat.id}
                                                                    className="
                                            inline-flex items-center
                                            px-2 py-0.5
                                            rounded-lg
                                            bg-slate-100
                                            text-slate-700
                                            text-[11px]
                                            font-semibold
                                        "
                                                                >
                                                                    {cat.nombre}
                                                                </span>
                                                            ))}

                                                        {row.categorias.length >
                                                            2 && (
                                                            <span className="text-xs text-gray-400">
                                                                +
                                                                {row.categorias
                                                                    .length - 2}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">
                                                        Sin categoría
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ORDEN */}
                                        <td className="px-7 py-5 text-gray-500 font-medium">
                                            {row.orden}
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-7 py-5">
                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={() =>
                                                        setCategoriasArticulo(
                                                            row,
                                                        )
                                                    }
                                                    className="
                                inline-flex items-center gap-2
                                h-8 px-3
                                rounded-lg
                                bg-indigo-100
                                text-indigo-700
                                text-xs font-semibold
                                hover:bg-indigo-200
                            "
                                                >
                                                    <i className="mgc_folder_line"></i>
                                                    Categorías
                                                </button>

                                                {row.personalizable && (
                                                    <a
                                                        href={`/admin/articulos/${row.id}/ingredientes`}
                                                        className="
                                    inline-flex items-center gap-2
                                    h-8 px-3
                                    rounded-lg
                                    border border-gray-200
                                    text-xs font-semibold
                                    hover:bg-gray-50
                                "
                                                    >
                                                        <i className="mgc_grass_line"></i>
                                                        Ingredientes
                                                    </a>
                                                )}

                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="
                                w-8 h-8
                                flex items-center justify-center
                                rounded-lg
                                text-gray-500
                                hover:bg-gray-100
                            "
                                                >
                                                    <i className="mgc_edit_2_line"></i>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        onDelete(row)
                                                    }
                                                    className="
                                w-8 h-8
                                flex items-center justify-center
                                rounded-lg
                                text-rose-500
                                hover:bg-rose-50
                            "
                                                >
                                                    <i className="mgc_delete_2_line"></i>
                                                </button>
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
        </div>
    );
}
