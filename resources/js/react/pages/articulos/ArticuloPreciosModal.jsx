import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ArticuloPreciosModal({ articulo, onClose, onSaved }) {
    const [tamanos, setTamanos] = useState([]);
    const [precios, setPrecios] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* =========================
       CARGA INICIAL
    ========================= */
    const load = async () => {
        setLoading(true);

        try {
            const res = await axios.get(
                `/api/admin/articulos/${articulo.id}/precios`,
            );

            const { tamanos, precios } = res.data;

            setTamanos(tamanos);

            // Construir estructura interna
            const estructura = {};

            tamanos.forEach((t) => {
                const precioExistente = precios.find(
                    (p) => p.tamano_id === t.id,
                );

                estructura[t.id] = {
                    activo: !!precioExistente,
                    precio: precioExistente?.precio ?? "",
                };
            });

            setPrecios(estructura);
        } catch (e) {
            toast.error("No se pudieron cargar los precios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* =========================
       MANEJO CAMBIOS
    ========================= */
    const toggleTamano = (tamanoId, checked) => {
        setPrecios((prev) => ({
            ...prev,
            [tamanoId]: {
                ...prev[tamanoId],
                activo: checked,
            },
        }));
    };

    const changePrecio = (tamanoId, value) => {
        setPrecios((prev) => ({
            ...prev,
            [tamanoId]: {
                ...prev[tamanoId],
                precio: value,
            },
        }));
    };

    /* =========================
       GUARDAR
    ========================= */
    const handleSave = async () => {
        const activos = Object.entries(precios).filter(([_, v]) => v.activo);

        // Validación básica
        for (const [tamanoId, value] of activos) {
            if (!value.precio || parseFloat(value.precio) < 0) {
                toast.error("Hay precios inválidos");
                return;
            }
        }

        const payload = {
            precios: activos.map(([tamanoId, value]) => ({
                tamano_id: parseInt(tamanoId),
                precio: parseFloat(value.precio),
            })),
        };

        setSaving(true);

        try {
            await axios.put(
                `/api/admin/articulos/${articulo.id}/precios`,
                payload,
            );

            toast.success("Precios actualizados");
            onSaved();
        } catch (e) {
            toast.error(
                e?.response?.data?.message ??
                    "No se pudieron guardar los precios",
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================
       UI
    ========================= */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6">
            <div
                className="
            bg-white
            w-full
            max-w-3xl
            rounded-3xl
            overflow-hidden
            shadow-[0_40px_120px_rgba(0,0,0,0.35)]
            flex flex-col
            max-h-[90vh]
        "
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-precios-title"
            >
                {/* HEADER */}
                <div className="px-7 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                            <i className="mgc_coin_line"></i>
                        </div>

                        <div>
                            <h2
                                id="modal-precios-title"
                                className="font-semibold tracking-tight"
                            >
                                Gestionar precios
                            </h2>
                            <p className="text-sm text-white/80">
                                {articulo.nombre}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        aria-label="Cerrar"
                    >
                        <i className="mgc_close_line text-xl"></i>
                    </button>
                </div>

                {/* BODY */}
                <div className="p-7 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center text-slate-400 py-10">
                            Cargando…
                        </div>
                    ) : tamanos.length === 0 ? (
                        <div className="text-center text-slate-400 py-10">
                            No hay tamaños disponibles
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tamanos.map((tamano) => (
                                <div
                                    key={tamano.id}
                                    className="
                                flex flex-col sm:flex-row sm:items-center sm:justify-between
                                gap-4
                                bg-slate-50
                                border border-slate-200
                                rounded-2xl
                                px-6 py-5
                                transition
                                hover:border-emerald-300 hover:bg-emerald-50/40
                            "
                                >
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={
                                                precios[tamano.id]?.activo ||
                                                false
                                            }
                                            onChange={(e) =>
                                                toggleTamano(
                                                    tamano.id,
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />

                                        <div>
                                            <span className="font-semibold text-slate-800">
                                                {tamano.nombre}
                                            </span>
                                            <p className="text-xs text-slate-400">
                                                Activar tamaño y definir precio
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                disabled={
                                                    !precios[tamano.id]?.activo
                                                }
                                                value={
                                                    precios[tamano.id]
                                                        ?.precio || ""
                                                }
                                                onChange={(e) =>
                                                    changePrecio(
                                                        tamano.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="
                                            w-32
                                            h-11
                                            px-3 pr-8
                                            rounded-xl
                                            border border-slate-300
                                            text-sm
                                            focus:outline-none
                                            focus:ring-2 focus:ring-emerald-500
                                            disabled:bg-slate-100
                                            disabled:text-slate-400
                                        "
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                                €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-100 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`
                    h-11 px-6 rounded-xl text-sm font-semibold transition
                    ${
                        saving
                            ? "bg-slate-400 cursor-not-allowed text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }
                `}
                    >
                        {saving ? "Guardando…" : "Guardar precios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
