import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import IngredienteModal from "./IngredienteModal";
import IngredientePreciosModal from "./IngredientePrecioModal";

export default function IngredientesIndex() {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [precioIngrediente, setPrecioIngrediente] = useState(null);
    const [search, setSearch] = useState("");

    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);

    const load = async (currentPage = page, currentSearch = search) => {
        setLoading(true);
        try {
            const [ingredientesRes, categoriasRes] = await Promise.all([
                axios.get("/api/admin/ingredientes", {
                    params: {
                        page: currentPage,
                        search: currentSearch,
                    },
                }),
                axios.get("/api/admin/categorias-ingredientes"),
            ]);

            setItems(ingredientesRes.data.data);
            setPagination(ingredientesRes.data);
            setCategorias(categoriasRes.data);
        } catch {
            toast.error("No se pudieron cargar los ingredientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(page, search);
    }, [page]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setPage(1);
            load(1, search);
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

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
            await axios.delete(`/api/admin/ingredientes/${deleteItem.id}`);
            toast.success("Ingrediente eliminado");
            setDeleteItem(null);

            if (items.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                load();
            }
        } catch (e) {
            toast.error(e?.response?.data?.message ?? "No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    };

    const agruparPreciosPorTipo = (precios = []) => {
        return precios.reduce((acc, p) => {
            const tipo = p.tipo_producto.nombre;
            if (!acc[tipo]) acc[tipo] = [];
            acc[tipo].push(p);
            return acc;
        }, {});
    };

    return (
        <div className="p-7 min-h-screen">
            <div className="relative mb-7 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-[1px] shadow-[0_10px_50px_rgba(0,0,0,0.15)]">
                <div className="rounded-3xl bg-white px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl shadow-lg">
                            <i className="mgc_grass_line"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Ingredientes
                            </h1>
                            <p className="text-sm text-gray-500">
                                Gestión centralizada de ingredientes
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCreate}
                            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:opacity-95 transition shadow-xl shadow-emerald-600/30"
                        >
                            <i className="mgc_add_line text-lg"></i>
                            Nuevo ingrediente
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-7 py-4 border-b border-gray-100 bg-slate-50/70">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700">
                            Listado de ingredientes
                        </h2>
                        <p className="text-xs text-gray-500">
                            Administra y filtra ingredientes por nombre o categoría
                        </p>
                    </div>

                    <div className="relative w-full md:w-[420px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <i className="mgc_search_2_line text-lg"></i>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar ingrediente o categoría..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                <th className="px-7 py-4 w-[90px]">ID</th>
                                <th className="px-7 py-4">Nombre</th>
                                <th className="px-7 py-4">Categoría</th>
                                <th className="px-7 py-4">Precio por tipo</th>
                                <th className="px-7 py-4 w-[150px]">Estado</th>
                                <th className="px-7 py-4 text-right w-[180px]">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-7 py-14 text-center text-gray-400">
                                        Cargando ingredientes...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-7 py-14 text-center text-gray-400">
                                        No hay resultados
                                    </td>
                                </tr>
                            ) : (
                                items.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className={`group transition ${
                                            index % 2 === 0 ? "bg-white" : "bg-slate-100/70"
                                        } hover:bg-violet-50`}
                                    >
                                        <td className="px-7 py-5 text-gray-500 font-medium tabular-nums">
                                            #{row.id}
                                        </td>

                                        <td className="px-7 py-5 font-semibold text-gray-900">
                                            {row.nombre}
                                        </td>

                                        <td className="px-7 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                                                {row.categoria?.nombre ?? "Sin categoría"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            {!row.precios?.length ? (
                                                <span className="text-xs text-gray-400 italic">
                                                    Sin precios asignados
                                                </span>
                                            ) : (
                                                <div className="space-y-2">
                                                    {Object.entries(
                                                        agruparPreciosPorTipo(row.precios)
                                                    ).map(([tipo, precios]) => (
                                                        <div
                                                            key={tipo}
                                                            className="border border-slate-200 rounded-lg p-2 bg-white"
                                                        >
                                                            <div className="text-xs font-semibold text-gray-700 mb-1">
                                                                {tipo.toUpperCase()}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-3 text-xs">
                                                                {precios.map((p, i) => (
                                                                    <React.Fragment key={i}>
                                                                        <span className="text-gray-500">
                                                                            {p.tamano.nombre}
                                                                        </span>
                                                                        <span className="text-right font-medium">
                                                                            {Number(p.precio).toFixed(2)} €
                                                                        </span>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-7 py-5">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    row.activo
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-rose-100 text-rose-600"
                                                }`}
                                            >
                                                {row.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>

                                        <td className="px-7 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setPrecioIngrediente(row)}
                                                    className="h-9 px-3 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-violet-100 hover:text-violet-700 transition"
                                                >
                                                    Precios
                                                </button>

                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 transition"
                                                >
                                                    <i className="mgc_edit_2_line text-lg"></i>
                                                </button>

                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 transition"
                                                >
                                                    <i className="mgc_delete_2_line text-lg"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div className="flex items-center justify-between px-7 py-4 border-t bg-slate-50">
                        <div className="text-xs text-gray-500">
                            Mostrando {pagination.from} - {pagination.to} de {pagination.total}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={!pagination.prev_page_url}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1 rounded-lg border bg-white disabled:opacity-40"
                            >
                                Anterior
                            </button>

                            <span className="text-sm font-medium">
                                Página {pagination.current_page} de {pagination.last_page}
                            </span>

                            <button
                                disabled={!pagination.next_page_url}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1 rounded-lg border bg-white disabled:opacity-40"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {open && (
                <IngredienteModal
                    item={editing}
                    categorias={categorias}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false);
                        load();
                    }}
                />
            )}

            {deleteItem && (
                <ConfirmDeleteModal
                    title="Eliminar ingrediente"
                    message={`¿Seguro que deseas eliminar "${deleteItem.nombre}"?`}
                    confirmText={deleting ? "Eliminando…" : "Eliminar"}
                    onCancel={() => setDeleteItem(null)}
                    onConfirm={confirmDelete}
                />
            )}

            {precioIngrediente && (
                <IngredientePreciosModal
                    ingrediente={precioIngrediente}
                    onClose={() => setPrecioIngrediente(null)}
                    onSaved={load}
                />
            )}
        </div>
    );
}
