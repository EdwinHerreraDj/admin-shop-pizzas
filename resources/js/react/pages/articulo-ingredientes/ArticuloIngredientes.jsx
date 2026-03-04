import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ArticuloIngredientes({ articuloId }) {
    const [articulo, setArticulo] = useState(null);
    const [ingredientes, setIngredientes] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [abiertos, setAbiertos] = useState({});

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
            const ing = data.ingredientes ?? {};
            setIngredientes(ing);

            // Abrir la primera categoría por defecto
            const keys = Object.keys(ing);
            if (keys.length > 0) {
                setAbiertos({ [keys[0]]: true });
            }

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

    const toggleCategoria = (categoria) => {
        setAbiertos((prev) => ({ ...prev, [categoria]: !prev[categoria] }));
    };

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
                max_cantidad: estado === "extra" ? 3 : null,
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

    const marcarTodosComoExtra = (categoria) => {
        setIngredientes((prev) => {
            const copy = structuredClone(prev);

            copy[categoria] = copy[categoria].map((i) => {
                if (i.estado === "ninguno") {
                    return {
                        ...i,
                        estado: "extra",
                        obligatorio: false,
                        incluido_por_defecto: false,
                        max_cantidad: 3,
                    };
                }
                return i;
            });

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

    /* =========================
       DATOS DERIVADOS PARA EL RESUMEN
    ========================= */
    const todosLosIngredientes = Object.values(ingredientes).flat();
    const ingredientesBase = todosLosIngredientes.filter(
        (i) => i.estado === "base",
    );
    const ingredientesNinguno = todosLosIngredientes.filter(
        (i) => i.estado === "ninguno",
    );

    if (loading) return <div className="p-6">Cargando…</div>;

    const categorias = Object.entries(ingredientes);

    return (
        <div className="min-h-screen">
            <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 space-y-10">
                {/* HEADER */}
                <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
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
                                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
                            >
                                <i className="mgc_arrow_left_line"></i>
                                Volver a artículos
                            </a>
                        </div>

                        {dirty && (
                            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-5 py-2.5 rounded-xl text-sm font-semibold self-start xl:self-auto">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Cambios sin guardar
                            </div>
                        )}
                    </div>
                </div>

                {/* RESUMEN VISUAL: BASE + NO USADOS */}
                {todosLosIngredientes.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-6 sm:px-8 lg:px-10 py-8 space-y-7">
                        <div>
                            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">
                                Vista previa
                            </p>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Composición del artículo
                            </h2>
                        </div>

                        {ingredientesBase.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                    Ingredientes base
                                    <span className="ml-1 text-xs font-medium bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                                        {ingredientesBase.length}
                                    </span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {ingredientesBase.map((i) => (
                                        <span
                                            key={i.ingrediente_id}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold ring-1 ring-emerald-200 select-none"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                                            {i.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {ingredientesBase.length > 0 &&
                            ingredientesNinguno.length > 0 && (
                                <div className="border-t border-slate-100"></div>
                            )}

                        {ingredientesNinguno.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                                    No utilizados
                                    <span className="ml-1 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                        {ingredientesNinguno.length}
                                    </span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {ingredientesNinguno.map((i) => (
                                        <span
                                            key={i.ingrediente_id}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium ring-1 ring-slate-200 select-none line-through decoration-slate-300"
                                        >
                                            {i.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {ingredientesBase.length === 0 &&
                            ingredientesNinguno.length === 0 && (
                                <p className="text-sm text-slate-400 italic">
                                    Aún no hay ingredientes configurados como
                                    base o descartados.
                                </p>
                            )}
                    </div>
                )}

                {/* EMPTY */}
                {categorias.length === 0 && (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm py-24 text-center">
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

                {/* CATEGORIAS — ACORDEÓN */}
                {categorias.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {categorias.map(([categoria, items], catIndex) => {
                            const abierto = !!abiertos[categoria];
                            const nBase = items.filter(
                                (i) => i.estado === "base",
                            ).length;
                            const nExtra = items.filter(
                                (i) => i.estado === "extra",
                            ).length;
                            const nNinguno = items.filter(
                                (i) => i.estado === "ninguno",
                            ).length;

                            return (
                                <div
                                    key={categoria}
                                    className={
                                        catIndex !== 0
                                            ? "border-t border-slate-200"
                                            : ""
                                    }
                                >
                                    {/* CABECERA */}
                                    <button
                                        onClick={() =>
                                            toggleCategoria(categoria)
                                        }
                                        className="w-full flex items-center justify-between px-6 sm:px-8 lg:px-10 py-5 hover:bg-slate-50 transition text-left"
                                    >
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h2 className="font-semibold text-gray-800 text-base">
                                                {categoria}
                                            </h2>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    marcarTodosComoExtra(
                                                        categoria,
                                                    );
                                                }}
                                                className="text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1 rounded-lg transition"
                                            >
                                                Marcar todos como extra
                                            </button>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {nBase > 0 && (
                                                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                                                        {nBase} base
                                                    </span>
                                                )}
                                                {nExtra > 0 && (
                                                    <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full">
                                                        {nExtra} extra
                                                    </span>
                                                )}
                                                {nNinguno > 0 && (
                                                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                                                        {nNinguno} sin usar
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400 font-medium">
                                                    · {items.length}{" "}
                                                    ingredientes
                                                </span>
                                            </div>
                                        </div>

                                        {/* Chevron */}
                                        <span
                                            className={`ml-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${abierto ? "rotate-180" : "rotate-0"}`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </span>
                                    </button>

                                    {/* CONTENIDO */}
                                    {abierto && (
                                        <div className="border-t border-slate-100 px-6 sm:px-8 lg:px-10 py-5 space-y-3">
                                            {items.map((i, index) => (
                                                <div
                                                    key={i.ingrediente_id}
                                                    className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 px-5 py-4 rounded-2xl border border-slate-200 hover:shadow-sm transition"
                                                >
                                                    {/* NOMBRE */}
                                                    <div className="lg:col-span-4">
                                                        <div className="font-semibold text-gray-900 text-base">
                                                            {i.nombre}
                                                        </div>
                                                    </div>

                                                    {/* SELECTOR */}
                                                    <div className="lg:col-span-5 flex flex-wrap gap-2">
                                                        {[
                                                            "ninguno",
                                                            "base",
                                                            "extra",
                                                        ].map((estado) => {
                                                            const active =
                                                                i.estado ===
                                                                estado;
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
                                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                                                        active
                                                                            ? estado ===
                                                                              "base"
                                                                                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                                                                : estado ===
                                                                                    "extra"
                                                                                  ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                                                                                  : "bg-slate-200 text-slate-700 ring-1 ring-slate-300"
                                                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                                    }`}
                                                                >
                                                                    {estado ===
                                                                    "ninguno"
                                                                        ? "No usar"
                                                                        : estado}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* MAX */}
                                                    <div className="lg:col-span-3 flex lg:justify-end">
                                                        {i.estado ===
                                                            "extra" && (
                                                            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-xl">
                                                                <span className="text-sm text-gray-500 font-medium">
                                                                    Máx.
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        i.max_cantidad
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setMaxCantidad(
                                                                            categoria,
                                                                            index,
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 outline-none bg-white"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FOOTER */}
                {categorias.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={guardar}
                            disabled={!dirty || saving}
                            className="inline-flex items-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-xl shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
