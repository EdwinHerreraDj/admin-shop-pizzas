import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function IngredientePreciosModal({
    ingrediente,
    onClose,
    onSaved,
}) {
    const [tipos, setTipos] = useState([]);
    const [precioBase, setPrecioBase] = useState("");
    const [loading, setLoading] = useState(true);

    const [tipoActivoId, setTipoActivoId] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(
                `/ingredientes/${ingrediente.id}/precios`,
            );
            setTipos(data.tipos);

            if (data.tipos.length) {
                setTipoActivoId(data.tipos[0].id);
            }
        } catch (e) {
            toast.error("Error cargando precios");
        } finally {
            setLoading(false);
        }
    };

    /** Actualiza un precio concreto */
    const setPrecio = (tipoId, tamanoId, value) => {
        setTipos((prev) =>
            prev.map((t) =>
                t.id === tipoId
                    ? {
                          ...t,
                          precios: {
                              ...(t.precios || {}),
                              [tamanoId]: value,
                          },
                      }
                    : t,
            ),
        );
    };

    /** Aplica el precio base a todos los tamaños de todos los tipos */
    const aplicarBaseATodos = () => {
        if (precioBase === "") return;

        setTipos((prev) =>
            prev.map((t) => ({
                ...t,
                precios: Object.fromEntries(
                    t.tamanos.map((tam) => [tam.id, precioBase]),
                ),
            })),
        );
    };

    const guardar = async () => {
        const payload = [];

        tipos.forEach((t) => {
            Object.entries(t.precios || {}).forEach(([tamanoId, precio]) => {
                if (precio !== "" && precio !== null) {
                    payload.push({
                        tipo_producto_id: t.id,
                        tamano_id: Number(tamanoId),
                        precio: Number(precio),
                    });
                }
            });
        });

        try {
            await api.post(`/ingredientes/${ingrediente.id}/precios`, {
                precios: payload,
            });

            toast.success("Precios guardados");
            onSaved();
            onClose();
        } catch (e) {
            toast.error("Error guardando precios");
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4">
            <div
                className="
        w-full max-w-4xl
        rounded-3xl
        bg-white
        shadow-[0_40px_120px_rgba(0,0,0,0.45)]
        overflow-hidden
    "
            >
                {/* HEADER PREMIUM */}
                <div
                    className="
            relative
            px-7 py-5
            bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
            text-white
        "
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="
                        w-12 h-12
                        rounded-2xl
                        bg-white/20
                        backdrop-blur
                        flex items-center justify-center
                        text-2xl
                    "
                            >
                                <i className="mgc_coin_line"></i>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Gestión de precios
                                </h2>
                                <p className="text-white/80 text-sm">
                                    {ingrediente.nombre}
                                </p>
                            </div>
                        </div>

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
                </div>

                {/* PRECIO BASE DESTACADO */}
                <div
                    className="
            px-7 py-5
            bg-gradient-to-b from-indigo-50 to-white
            border-b
            flex items-end gap-4
        "
                >
                    <div>
                        <label className="text-xs font-semibold uppercase text-indigo-600 tracking-wide">
                            Precio base global
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            value={precioBase}
                            onChange={(e) => setPrecioBase(e.target.value)}
                            placeholder="0.00"
                            className="
                        mt-1
                        h-11 w-44
                        px-3
                        rounded-xl
                        border border-indigo-200
                        bg-white
                        text-base
                        font-semibold
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500/40
                    "
                        />
                    </div>

                    <button
                        onClick={aplicarBaseATodos}
                        disabled={!tipoActivoId}
                        className={`
        h-11 px-5 rounded-xl font-semibold transition
        ${
            tipoActivoId
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
    `}
                    >
                        Aplicar a todos
                    </button>
                </div>

                {/* SELECTOR DE TIPOS */}
                <div className="px-7 py-4 border-b bg-white flex flex-wrap gap-2">
                    {tipos.map((tipo) => {
                        const activo = tipo.id === tipoActivoId;

                        return (
                            <button
                                key={tipo.id}
                                onClick={() => setTipoActivoId(tipo.id)}
                                className={`
                    px-4 py-2 rounded-xl text-sm font-semibold
                    transition
                    ${
                        activo
                            ? "bg-indigo-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                `}
                            >
                                {tipo.nombre}
                            </button>
                        );
                    })}
                </div>

                {/* LISTADO */}
                <div className="px-7 py-7 space-y-6 max-h-[62vh] overflow-y-auto bg-slate-50">
                    {tipos
                        .filter((t) => t.id === tipoActivoId)
                        .map((tipo) => (
                            <div
                                key={tipo.id}
                                className="
                rounded-2xl
                bg-white
                p-6
                shadow-sm
                border border-slate-200
            "
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div
                                        className="
                        w-9 h-9
                        rounded-lg
                        bg-violet-100
                        text-violet-600
                        flex items-center justify-center
                    "
                                    >
                                        <i className="mgc_grass_fill"></i>
                                    </div>

                                    <h3 className="font-semibold text-gray-800">
                                        {tipo.nombre}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    {tipo.tamanos.map((tam) => (
                                        <div key={tam.id}>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">
                                                {tam.nombre} · extra
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                value={
                                                    tipo.precios?.[tam.id] ?? ""
                                                }
                                                onChange={(e) =>
                                                    setPrecio(
                                                        tipo.id,
                                                        tam.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="
                                mt-1
                                w-full h-10
                                px-3
                                rounded-lg
                                border border-gray-300
                                bg-white
                                font-medium
                                focus:outline-none
                                focus:ring-2
                                focus:ring-violet-500/40
                                focus:border-violet-500
                            "
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>

                {/* FOOTER */}
                <div
                    className="
            px-7 py-5
            border-t
            bg-white
            flex justify-end gap-3
        "
                >
                    <button
                        onClick={onClose}
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
                        className="
                    h-11 px-6
                    rounded-xl
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    text-white
                    font-semibold
                    hover:opacity-95
                    transition
                    shadow-xl
                    shadow-indigo-600/30
                "
                    >
                        Guardar precios
                    </button>
                </div>
            </div>
        </div>
    );
}
