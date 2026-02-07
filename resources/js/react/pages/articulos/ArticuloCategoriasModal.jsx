import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function ArticuloCategoriasModal({
    articulo,
    onClose,
    onSaved,
}) {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);

            const { data } = await api.get(
                `/articulos/${articulo.id}/categorias`,
            );

            // Normalizamos solo selección
            setCategorias(
                data.categorias.map((c) => ({
                    id: c.id,
                    nombre: c.nombre,
                    selected: c.asignada,
                })),
            );
        } catch {
            toast.error("Error cargando categorías");
        } finally {
            setLoading(false);
        }
    };

    const toggleCategoria = (id) => {
        setCategorias((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, selected: !c.selected } : c,
            ),
        );
    };

    const guardar = async () => {
        const payload = categorias
            .filter((c) => c.selected)
            .map((c) => ({
                id: c.id,
            }));

        try {
            setSaving(true);

            await api.post(`/articulos/${articulo.id}/categorias`, {
                categorias: payload,
            });

            toast.success("Categorías guardadas");
            onSaved();
            onClose();
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "Error guardando categorías",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden">
                {/* HEADER PREMIUM */}
                <div className="px-7 py-5 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                        {/* ICONO */}
                        <div
                            className="
                w-12 h-12
                rounded-2xl
                bg-white/20
                ring-1 ring-white/30
                backdrop-blur
                flex items-center justify-center
                text-2xl
            "
                        >
                            <i className="mgc_folder_line"></i>
                        </div>

                        {/* TITULO */}
                        <div>
                            <h2 className="font-semibold tracking-tight">
                                Categorías del artículo
                            </h2>
                            <p className="text-sm text-white/80">
                                {articulo.nombre}
                            </p>
                        </div>
                    </div>

                    {/* CLOSE */}
                    <button
                        onClick={onClose}
                        className="
            w-10 h-10
            rounded-xl
            bg-white/20
            hover:bg-white/30
            flex items-center justify-center
            transition
        "
                    >
                        <i className="mgc_close_line text-xl"></i>
                    </button>
                </div>

                {/* LISTADO */}
                <div className="p-7 space-y-3 max-h-[60vh] overflow-y-auto">
                    {categorias.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <i className="mgc_information_line text-4xl mb-3 block opacity-50"></i>
                            <p className="font-medium">
                                No hay categorías disponibles
                            </p>
                            <p className="text-sm text-gray-400">
                                Crea categorías primero para poder asignarlas a
                                este artículo
                            </p>
                        </div>
                    ) : (
                        categorias.map((cat) => (
                            <label
                                key={cat.id}
                                className={`
                    flex items-center justify-between
                    p-4
                    rounded-2xl
                    border
                    cursor-pointer
                    transition
                    ${
                        cat.selected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:bg-gray-50"
                    }
                `}
                            >
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={cat.selected}
                                        onChange={() => toggleCategoria(cat.id)}
                                        className="
                            w-5 h-5
                            rounded
                            border-gray-300
                            text-indigo-600
                            focus:ring-indigo-500
                        "
                                    />

                                    <span className="font-semibold text-gray-800">
                                        {cat.nombre}
                                    </span>
                                </div>

                                {cat.selected && (
                                    <i className="mgc_check_line text-indigo-600 text-xl"></i>
                                )}
                            </label>
                        ))
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-7 py-5 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="
                    h-11 px-5
                    rounded-xl
                    border border-gray-300
                    font-medium
                    text-gray-700
                    hover:bg-gray-100
                    transition
                "
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={guardar}
                        disabled={saving}
                        className="
                    h-11 px-6
                    rounded-xl
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-indigo-600/30
                    hover:opacity-95
                    active:scale-[0.98]
                    transition
                "
                    >
                        {saving ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
