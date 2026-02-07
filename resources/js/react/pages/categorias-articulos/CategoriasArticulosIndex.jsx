import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import CategoriaArticuloModal from "./CategoriaArticuloModal";

export default function CategoriasArticulosIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /* =========================
       CARGA DESDE BD (FUENTE ÚNICA)
    ========================= */
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/categorias-articulos");
            setItems(data);
        } catch {
            toast.error("No se pudieron cargar las categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

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

    /* =========================
       DELETE (REAL)
    ========================= */
    const confirmDelete = async () => {
        if (!deleteItem) return;

        setDeleting(true);
        try {
            await api.delete(`/categorias-articulos/${deleteItem.id}`);
            toast.success("Categoría eliminada");
            setDeleteItem(null);

            load();
        } catch (e) {
            toast.error(
                e?.response?.data?.message ??
                    "No se pudo eliminar la categoría",
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-7 min-h-screen">
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
                <div className="rounded-3xl bg-white px-6 py-5 flex items-center justify-between">
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
                            <i className="mgc_folder_line"></i>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Categorías de artículos
                            </h1>
                            <p className="text-sm text-gray-500">
                                Organización comercial del catálogo
                            </p>
                        </div>
                    </div>

                    {/* DERECHA */}
                    <div className="flex items-center gap-3">
                        {/* Ghost button */}
                        <a
                            href="/admin/articulos"
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
                            <i className="mgc_box_3_line text-lg"></i>
                            Artículos
                        </a>

                        {/* BTN orden de articulos por categoria */}
                        <a
                            href="/admin/categorias-articulos/orden"
                            className="
                        inline-flex items-center gap-2
                        h-11 px-6
                        rounded-xl
                        bg-gradient-to-r from-indigo-600 to-violet-600
                        text-white
                        text-sm font-semibold
                        hover:opacity-95
                        transition
                        shadow-xl
                        shadow-indigo-600/30
                    "
                        >
                            <i className="mgc_classify_2_line text-lg"></i>
                            Ordenar artículos
                        </a>

                        {/* Primary */}
                        <button
                            onClick={onCreate}
                            className="
                        inline-flex items-center gap-2
                        h-11 px-6
                        rounded-xl
                        bg-gradient-to-r from-indigo-600 to-violet-600
                        text-white
                        text-sm font-semibold
                        hover:opacity-95
                        transition
                        shadow-xl
                        shadow-indigo-600/30
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
                                <th className="px-7 py-4 w-[90px]">ID</th>
                                <th className="px-7 py-4">Nombre</th>
                                <th className="px-7 py-4 w-[120px]">Orden</th>
                                <th className="px-7 py-4 w-[150px]">Estado</th>
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
                                        colSpan="5"
                                        className="px-7 py-14 text-center text-gray-400"
                                    >
                                        Cargando…
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
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
                                        <td className="px-7 py-5 text-gray-600">
                                            {row.orden ?? "—"}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-7 py-5">
                                            <span
                                                className={`
                                            inline-flex items-center
                                            px-3 py-1
                                            rounded-full
                                            text-xs font-semibold
                                            ${
                                                row.activo
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-rose-100 text-rose-600"
                                            }
                                        `}
                                            >
                                                {row.activo
                                                    ? "Activa"
                                                    : "Inactiva"}
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
                                                    {/* EDITAR */}
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

                                                    {/* ELIMINAR */}
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

            {/* MODALES — intactos */}
            {open && (
                <CategoriaArticuloModal
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
