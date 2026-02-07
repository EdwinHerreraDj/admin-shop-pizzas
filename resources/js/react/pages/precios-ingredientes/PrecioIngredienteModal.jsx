import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PrecioIngredienteModal({
    item,
    ingredientes,
    tipos,
    tamanos,
    onClose,
    onSaved,
}) {
    const isEdit = !!item;

    const [ingredienteId, setIngredienteId] = useState(
        item?.ingrediente_id ?? "",
    );
    const [tipoId, setTipoId] = useState(item?.tipo_producto_id ?? "");
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
            const payload = {
                ingrediente_id: ingredienteId,
                tipo_producto_id: tipoId,
                tamano_id: tamanoId,
                precio,
            };

            if (isEdit) {
                await axios.put(`/api/admin/ingrediente-precios/${item.id}`, {
                    precio,
                });
                toast.success("Actualizado");
            } else {
                await axios.post("/api/admin/ingrediente-precios", payload);
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
                <div className="p-5 border-b bg-gray-50">
                    <div className="text-base font-semibold text-gray-900">
                        {title}
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {!isEdit && (
                        <>
                            <select
                                value={ingredienteId}
                                onChange={(e) =>
                                    setIngredienteId(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Ingrediente</option>
                                {ingredientes.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.nombre}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={tipoId}
                                onChange={(e) => setTipoId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Tipo de producto</option>
                                {tipos.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre}
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
                        className="px-4 py-2 rounded-lg border text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={save}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                        disabled={loading}
                    >
                        {loading ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
