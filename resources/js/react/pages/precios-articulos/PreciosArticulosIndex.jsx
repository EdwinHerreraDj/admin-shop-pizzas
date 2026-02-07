import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import PrecioArticuloModal from "./PrecioArticuloModal";

export default function PreciosArticulosIndex() {
    const [items, setItems] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [tamanos, setTamanos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);

        const [preciosRes, artRes, tamRes] = await Promise.all([
            axios.get("/api/admin/articulo-precios"),
            axios.get("/api/admin/articulos"),
            axios.get("/api/admin/tamanos"),
        ]);

        setItems(preciosRes.data);
        setArticulos(artRes.data);
        setTamanos(tamRes.data);
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
            await axios.delete(`/api/admin/articulo-precios/${deleteItem.id}`);
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
                <h1 className="text-lg font-semibold">Precios de artículos</h1>

                <button
                    onClick={onCreate}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                >
                    Nuevo
                </button>
            </div>

            <div className="bg-white border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Artículo</th>
                            <th className="px-4 py-3">Tamaño</th>
                            <th className="px-4 py-3">Precio</th>
                            <th className="px-4 py-3 w-[160px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6">
                                    Cargando…
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6">
                                    Sin datos
                                </td>
                            </tr>
                        ) : (
                            items.map((row) => (
                                <tr key={row.id} className="border-t">
                                    <td className="px-4 py-3 font-medium">
                                        {row.articulo.nombre}
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
                                                className="px-3 py-1.5 border rounded text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="px-3 py-1.5 border rounded text-sm text-red-600"
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
                <PrecioArticuloModal
                    item={editing}
                    articulos={articulos}
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
