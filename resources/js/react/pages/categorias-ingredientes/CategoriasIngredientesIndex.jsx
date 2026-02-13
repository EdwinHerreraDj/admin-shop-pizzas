import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import CategoriaIngredienteModal from "./CategoriaIngredienteModal";

export default function CategoriasIngredientesIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        const { data } = await axios.get("/api/admin/categorias-ingredientes");
        setItems(data);
        setLoading(false);
    };

    useEffect(() => {
        load().catch(() => {
            toast.error("No se pudieron cargar las categorías");
            setLoading(false);
        });
    }, []);

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
            await axios.delete(
                `/api/admin/categorias-ingredientes/${deleteItem.id}`,
            );
            toast.success("Categoría eliminada");
            setDeleteItem(null);
            load();
        } catch (e) {
            toast.error(e?.response?.data?.message ?? "No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-7 min-h-screen bg-slate-50">
            {/* HEADER CARD */}
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
                <div className="rounded-3xl bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    {/* IZQUIERDA */}
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
                            <i className="mgc_bread_line"></i>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Categorías de ingredientes
                            </h1>
                            <p className="text-sm text-gray-500">
                                Organización y gestión de categorías
                            </p>
                        </div>
                    </div>

                    {/* DERECHA */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/admin/ingredientes"
                            className="
                        inline-flex items-center gap-2
                        h-11 px-5
                        rounded-xl
                        border border-gray-200
                        bg-white
                        text-gray-700
                        text-sm font-medium
                        hover:bg-gray-50
                        hover:border-gray-300
                        transition
                    "
                        >
                            <i className="mgc_arrow_left_line text-lg"></i>
                            Regresar
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
                        transition
                        shadow-xl
                        shadow-emerald-600/30
                    "
                        >
                            <i className="mgc_add_line text-lg"></i>
                            Nueva categoría
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
            shadow-[0_10px_40px_rgba(0,0,0,0.08)]
            overflow-hidden
        "
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* HEADER */}
                        <thead className="bg-slate-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                <th className="px-7 py-4 w-[100px]">ID</th>
                                <th className="px-7 py-4">Nombre</th>
                                <th className="px-7 py-4 w-[120px]">Orden</th>
                                <th className="px-7 py-4 text-right w-[180px]">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-7 py-14 text-center text-gray-400"
                                    >
                                        Cargando categorías...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-7 py-14 text-center text-gray-400"
                                    >
                                        No hay categorías registradas
                                    </td>
                                </tr>
                            ) : (
                                items.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="
                                    group
                                    hover:bg-violet-50/40
                                    transition
                                "
                                    >
                                        {/* ID */}
                                        <td className="px-7 py-5 text-gray-400 font-medium tabular-nums">
                                            #{row.id}
                                        </td>

                                        {/* Nombre */}
                                        <td className="px-7 py-5">
                                            <span className="font-semibold text-gray-900">
                                                {row.nombre}
                                            </span>
                                        </td>

                                        {/* Orden */}
                                        <td className="px-7 py-5">
                                            <span
                                                className="
                                            inline-flex items-center
                                            px-3 py-1
                                            rounded-full
                                            bg-slate-100
                                            text-slate-700
                                            text-xs
                                            font-semibold
                                        "
                                            >
                                                {row.orden}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-7 py-5">
                                            <div className="flex justify-end">
                                                <div
                                                    className="
                                                flex items-center gap-2
                                                opacity-80 group-hover:opacity-100
                                                transition
                                            "
                                                >
                                                    <button
                                                        onClick={() =>
                                                            onEdit(row)
                                                        }
                                                        className="
                                                    w-9 h-9
                                                    flex items-center justify-center
                                                    rounded-lg
                                                    text-gray-500
                                                    hover:bg-gray-100
                                                    hover:text-gray-700
                                                    transition
                                                "
                                                    >
                                                        <i className="mgc_edit_2_line text-lg"></i>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            onDelete(row)
                                                        }
                                                        className="
                                                    w-9 h-9
                                                    flex items-center justify-center
                                                    rounded-lg
                                                    text-rose-500
                                                    hover:bg-rose-50
                                                    hover:text-rose-600
                                                    transition
                                                "
                                                    >
                                                        <i className="mgc_delete_2_line text-lg"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALES */}
            {open && (
                <CategoriaIngredienteModal
                    item={editing}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false);
                        load();
                    }}
                />
            )}

            {deleteItem && (
                <ConfirmDeleteModal
                    title="Eliminar categoría"
                    message={`¿Seguro que deseas eliminar "${deleteItem.nombre}"?`}
                    confirmText={deleting ? "Eliminando…" : "Eliminar"}
                    onCancel={() => setDeleteItem(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}
