import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ArticuloIngredientes({ articuloId }) {
    const [articulo, setArticulo] = useState(null);
    const [ingredientes, setIngredientes] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    /* =========================
       CARGA INICIAL
    ========================= */
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `/api/admin/articulos/${articuloId}/ingredientes-config`,
            );

            setArticulo(data.articulo);
            setIngredientes(data.ingredientes ?? {});
            setDirty(false);
        } catch {
            toast.error("No se pudo cargar la configuración");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* =========================
       CAMBIOS LOCALES
    ========================= */

    const setEstado = (categoria, index, estado) => {
        setIngredientes((prev) => {
            const copy = structuredClone(prev);

            copy[categoria][index] = {
                ...copy[categoria][index],
                estado,
                obligatorio: estado === "base",
                incluido_por_defecto: estado === "base",
                max_cantidad: estado === "extra" ? 1 : null,
            };

            return copy;
        });

        setDirty(true);
    };

    const setMaxCantidad = (categoria, index, value) => {
        setIngredientes((prev) => {
            const copy = structuredClone(prev);
            copy[categoria][index].max_cantidad = value;
            return copy;
        });

        setDirty(true);
    };

    /* =========================
       GUARDAR
    ========================= */
    const guardar = async () => {
        try {
            setSaving(true);

            const payload = [];

            Object.values(ingredientes).forEach((grupo) => {
                grupo.forEach((i) => {
                    payload.push({
                        ingrediente_id: i.ingrediente_id,
                        estado: i.estado,
                        obligatorio: i.obligatorio,
                        incluido_por_defecto: i.incluido_por_defecto,
                        max_cantidad: i.max_cantidad,
                    });
                });
            });

            await axios.post(
                `/api/admin/articulos/${articuloId}/sync-ingredientes`,
                { ingredientes: payload },
            );

            toast.success("Cambios guardados");
            load();
        } catch {
            toast.error("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Cargando…</div>;

    const categorias = Object.entries(ingredientes);

    return (
        <div className="min-h-screen">
            <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 space-y-10">
                {/* HEADER PREMIUM FULL WIDTH */}
                <div
                    className="
                relative
                rounded-3xl
                bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
                p-[1px]
                shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            "
                >
                    <div className="rounded-3xl bg-white px-8 py-7 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold tracking-widest text-violet-600 uppercase">
                                Configuración
                            </p>

                            <h1 className="text-3xl font-semibold text-gray-900 mt-1 tracking-tight">
                                Ingredientes del artículo
                            </h1>

                            <p className="text-gray-500 text-sm mt-1">
                                {articulo?.nombre}
                            </p>

                            <a
                                href="/admin/articulos"
                                className="
                            inline-flex items-center gap-2
                            mt-4
                            text-sm font-semibold
                            text-indigo-600
                            hover:text-indigo-700
                            transition
                        "
                            >
                                <i className="mgc_arrow_left_line"></i>
                                Volver a artículos
                            </a>
                        </div>

                        {dirty && (
                            <div
                                className="
                            inline-flex items-center gap-2
                            bg-amber-100
                            text-amber-800
                            px-5 py-2.5
                            rounded-xl
                            text-sm font-semibold
                            self-start xl:self-auto
                        "
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Cambios sin guardar
                            </div>
                        )}
                    </div>
                </div>

                {/* EMPTY */}
                {categorias.length === 0 && (
                    <div
                        className="
                    bg-white
                    rounded-3xl
                    border border-dashed border-slate-300
                    shadow-sm
                    py-24
                    text-center
                "
                    >
                        <div className="max-w-lg mx-auto px-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-6">
                                <i className="mgc_grass_line text-3xl"></i>
                            </div>

                            <p className="text-xl font-semibold text-gray-800">
                                Sin ingredientes configurados
                            </p>

                            <p className="text-gray-500 mt-2 text-sm">
                                Cuando existan ingredientes compatibles podrás
                                definir si son base o extra.
                            </p>
                        </div>
                    </div>
                )}

                {/* CATEGORIAS */}
                {categorias.map(([categoria, items]) => (
                    <div
                        key={categoria}
                        className="
                    bg-white
                    rounded-3xl
                    border border-slate-200
                    shadow-sm
                    px-6 sm:px-8 lg:px-10
                    py-8
                    space-y-8
                "
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <h2 className="font-semibold text-gray-800 text-xl">
                                {categoria}
                            </h2>

                            <span className="text-sm text-gray-400 font-medium">
                                {items.length} ingredientes
                            </span>
                        </div>

                        <div className="space-y-4">
                            {items.map((i, index) => (
                                <div
                                    key={i.ingrediente_id}
                                    className="
                                grid
                                grid-cols-1
                                lg:grid-cols-12
                                items-center
                                gap-6
                                px-5 py-5
                                rounded-2xl
                                border border-slate-200
                                hover:shadow-sm
                                transition
                            "
                                >
                                    {/* NOMBRE */}
                                    <div className="lg:col-span-4">
                                        <div className="font-semibold text-gray-900 text-base">
                                            {i.nombre}
                                        </div>
                                    </div>

                                    {/* SELECTOR VISUAL */}
                                    <div className="lg:col-span-5 flex flex-wrap gap-3">
                                        {["ninguno", "base", "extra"].map(
                                            (estado) => {
                                                const active =
                                                    i.estado === estado;

                                                return (
                                                    <button
                                                        key={estado}
                                                        onClick={() =>
                                                            setEstado(
                                                                categoria,
                                                                index,
                                                                estado,
                                                            )
                                                        }
                                                        className={`
                                                    px-5 py-2.5 rounded-xl text-sm font-semibold transition
                                                    ${
                                                        active
                                                            ? estado === "base"
                                                                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                                                : estado ===
                                                                    "extra"
                                                                  ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                                                                  : "bg-slate-200 text-slate-700 ring-1 ring-slate-300"
                                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }
                                                `}
                                                    >
                                                        {estado === "ninguno"
                                                            ? "No usar"
                                                            : estado}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>

                                    {/* MAX */}
                                    <div className="lg:col-span-3 flex lg:justify-end">
                                        {i.estado === "extra" && (
                                            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-xl">
                                                <span className="text-sm text-gray-500 font-medium">
                                                    Máx.
                                                </span>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={i.max_cantidad}
                                                    onChange={(e) =>
                                                        setMaxCantidad(
                                                            categoria,
                                                            index,
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="
                                                w-24
                                                px-3 py-2
                                                rounded-lg
                                                border border-slate-300
                                                text-sm font-medium
                                                focus:ring-2
                                                focus:ring-violet-500/40
                                                focus:border-violet-500
                                                outline-none
                                                bg-white
                                            "
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* FOOTER */}
                {categorias.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={guardar}
                            disabled={!dirty || saving}
                            className="
                        inline-flex items-center gap-2
                        px-10 py-3.5
                        rounded-xl
                        bg-gradient-to-r from-indigo-600 to-violet-600
                        text-white
                        text-sm font-semibold
                        shadow-xl
                        shadow-indigo-600/30
                        hover:opacity-95
                        transition
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                    "
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
