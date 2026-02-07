import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import PrecioIngredienteModal from "./PrecioIngredienteModal";

export default function PreciosIngredientesIndex() {
    const [items, setItems] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [tamanos, setTamanos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);

        const [preciosRes, ingRes, tiposRes, tamanosRes] = await Promise.all([
            axios.get("/api/admin/ingrediente-precios"),
            axios.get("/api/admin/ingredientes"),
            axios.get("/api/admin/tipos-producto"),
            axios.get("/api/admin/tamanos"),
        ]);

        setItems(preciosRes.data);
        setIngredientes(ingRes.data);
        setTipos(tiposRes.data);
        setTamanos(tamanosRes.data);
        setLoading(false);
    };

    useEffect(() => {
        load().catch(() => {
            toast.error("No se pudieron cargar los precios");
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
                `/api/admin/ingrediente-precios/${deleteItem.id}`,
            );
            toast.success("Precio eliminado");
            setDeleteItem(null);
            load();
        } catch {
            toast.error("No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">
                    Precios de ingredientes
                </h1>

                <button
                    onClick={onCreate}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                    Nuevo
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr className="text-left">
                            <th className="px-4 py-3">Ingrediente</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Tamaño</th>
                            <th className="px-4 py-3">Precio</th>
                            <th className="px-4 py-3 w-[160px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-4 py-6 text-gray-500"
                                >
                                    Cargando…
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
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
                                    <td className="px-4 py-3 font-medium">
                                        {row.ingrediente.nombre}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.tipo_producto.nombre}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.tamano.nombre}
                                    </td>
                                    <td className="px-4 py-3">
                                        € {Number(row.precio).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="px-3 py-1.5 rounded-lg text-sm border border-red-200 text-red-600"
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
                <PrecioIngredienteModal
                    item={editing}
                    ingredientes={ingredientes}
                    tipos={tipos}
                    tamanos={tamanos}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false);
                        load();
                    }}
                />
            )}

            {deleteItem && (
                <ConfirmDeleteModal
                    title="Eliminar precio"
                    message="¿Seguro que deseas eliminar este precio?"
                    confirmText={deleting ? "Eliminando…" : "Eliminar"}
                    onCancel={() => setDeleteItem(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}
