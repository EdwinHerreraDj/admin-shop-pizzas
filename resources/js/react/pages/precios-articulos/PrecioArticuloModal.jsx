import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PrecioArticuloModal({
    item,
    articulos,
    tamanos,
    onClose,
    onSaved,
}) {
    const isEdit = !!item;

    const [articuloId, setArticuloId] = useState(item?.articulo_id ?? "");
    const [tamanoId, setTamanoId] = useState(item?.tamano_id ?? "");
    const [precio, setPrecio] = useState(item?.precio ?? "");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const title = useMemo(
        () => (isEdit ? "Editar precio" : "Nuevo precio"),
        [isEdit],
    );

    const save = async () => {
        setLoading(true);
        setErrors({});

        try {
            if (isEdit) {
                await axios.put(`/api/admin/articulo-precios/${item.id}`, {
                    precio,
                });
                toast.success("Actualizado");
            } else {
                await axios.post("/api/admin/articulo-precios", {
                    articulo_id: articuloId,
                    tamano_id: tamanoId,
                    precio,
                });
                toast.success("Creado");
            }

            onSaved();
        } catch (e) {
            if (e?.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
                toast.error(e.response.data.message ?? "Revisa el formulario");
            } else {
                toast.error("Error guardando");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b bg-gray-50 font-semibold">
                    {title}
                </div>

                <div className="p-5 space-y-4">
                    {!isEdit && (
                        <>
                            <select
                                value={articuloId}
                                onChange={(e) => setArticuloId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Artículo</option>
                                {articulos.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.nombre}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={tamanoId}
                                onChange={(e) => setTamanoId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Tamaño</option>
                                {tamanos.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <input
                        type="number"
                        step="0.01"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Precio"
                    />
                </div>

                <div className="p-5 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={save}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
                    >
                        {loading ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
