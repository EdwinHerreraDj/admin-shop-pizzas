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
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">
                    Categorías de ingredientes
                </h1>

                <a href="/admin/ingredientes">Regresar</a>

                <button
                    onClick={onCreate}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                    Nueva
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr className="text-left">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Orden</th>
                            <th className="px-4 py-3 w-[180px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="px-4 py-6 text-gray-500"
                                >
                                    Cargando…
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="px-4 py-6 text-gray-500"
                                >
                                    Sin datos
                                </td>
                            </tr>
                        ) : (
                            items.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-gray-500">
                                        #{row.id}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {row.nombre}
                                    </td>
                                    <td className="px-4 py-3">{row.orden}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="px-3 py-1.5 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
