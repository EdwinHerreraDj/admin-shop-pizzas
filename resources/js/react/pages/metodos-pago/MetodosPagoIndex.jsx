import React from "react";
import { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

function Toggle({ activo, onChange, label }) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => onChange(!activo)}
                className={`relative w-12 h-7 rounded-full transition shadow-inner ${
                    activo
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                        : "bg-gray-300"
                }`}
            >
                <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition ${
                        activo ? "translate-x-5" : ""
                    }`}
                />
            </button>
            <span className="text-sm text-gray-700">{label}</span>
        </div>
    );
}

export default function MetodosPagoIndex() {
    const [metodos, setMetodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/metodos-pago");
            setMetodos(data);
        } catch {
            toast.error("Error cargando métodos de pago");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const guardar = async (metodo, campo, valor) => {
        setSaving(metodo.id);
        try {
            const payload = {
                activo_domicilio: metodo.activo_domicilio,
                activo_recogida: metodo.activo_recogida,
                [campo]: valor,
            };
            const { data } = await api.put(
                `/metodos-pago/${metodo.id}`,
                payload,
            );
            setMetodos((prev) =>
                prev.map((m) => (m.id === data.id ? data : m)),
            );
            toast.success(`${metodo.nombre} actualizado`);
        } catch {
            toast.error("Error guardando");
        }
        setSaving(null);
    };

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center text-xl shadow-lg">
                        <i className="mgc_bank_card_line"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Métodos de Pago
                        </h1>
                        <p className="text-sm text-gray-500">
                            Activa o desactiva métodos según el tipo de entrega
                        </p>
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            {loading ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">
                    Cargando...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {metodos.map((metodo) => (
                        <div
                            key={metodo.id}
                            className={`rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden transition ${saving === metodo.id ? "opacity-60" : ""}`}
                        >
                            {/* Cabecera */}
                            <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/70 flex items-center gap-3">
                                <span className="text-2xl">
                                    {metodo.icono}
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800">
                                        {metodo.nombre}
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        {metodo.clave}
                                    </p>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="p-5 space-y-4">
                                <Toggle
                                    activo={metodo.activo_domicilio}
                                    onChange={(v) =>
                                        guardar(
                                            metodo,
                                            "activo_domicilio",
                                            v,
                                        )
                                    }
                                    label="Domicilio"
                                />
                                <Toggle
                                    activo={metodo.activo_recogida}
                                    onChange={(v) =>
                                        guardar(
                                            metodo,
                                            "activo_recogida",
                                            v,
                                        )
                                    }
                                    label="Recogida en tienda"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
