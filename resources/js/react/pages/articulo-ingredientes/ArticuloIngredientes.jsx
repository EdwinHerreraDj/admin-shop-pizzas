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
        <div className="p-6 space-y-8">
            <h1 className="text-xl font-semibold">
                Ingredientes — {articulo?.nombre}
            </h1>

            {categorias.map(([categoria, items]) => (
                <div
                    key={categoria}
                    className="bg-white border rounded-xl p-5 space-y-3"
                >
                    <h2 className="text-sm font-semibold uppercase text-gray-600">
                        {categoria}
                    </h2>

                    {items.map((i, index) => (
                        <div
                            key={i.ingrediente_id}
                            className="grid grid-cols-12 gap-3 items-center text-sm"
                        >
                            <div className="col-span-4 font-medium">
                                {i.nombre}
                            </div>

                            <div className="col-span-5 flex gap-4">
                                <label>
                                    <input
                                        type="radio"
                                        checked={i.estado === "ninguno"}
                                        onChange={() =>
                                            setEstado(
                                                categoria,
                                                index,
                                                "ninguno",
                                            )
                                        }
                                    />{" "}
                                    No usar
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        checked={i.estado === "base"}
                                        onChange={() =>
                                            setEstado(categoria, index, "base")
                                        }
                                    />{" "}
                                    Base
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        checked={i.estado === "extra"}
                                        onChange={() =>
                                            setEstado(categoria, index, "extra")
                                        }
                                    />{" "}
                                    Extra
                                </label>
                            </div>

                            <div className="col-span-3">
                                {i.estado === "extra" && (
                                    <input
                                        type="number"
                                        min="1"
                                        value={i.max_cantidad}
                                        onChange={(e) =>
                                            setMaxCantidad(
                                                categoria,
                                                index,
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full border rounded px-2 py-1"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="flex justify-end gap-3">
                {dirty && (
                    <span className="text-sm text-orange-600 self-center">
                        Cambios sin guardar
                    </span>
                )}

                <button
                    onClick={guardar}
                    disabled={!dirty || saving}
                    className="
                        px-6 py-2
                        rounded-lg
                        bg-indigo-600
                        text-white
                        font-semibold
                        disabled:opacity-40
                    "
                >
                    {saving ? "Guardando…" : "Guardar cambios"}
                </button>
            </div>
        </div>
    );
}
