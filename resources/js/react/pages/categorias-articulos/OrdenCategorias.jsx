import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function OrdenCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaId, setCategoriaId] = useState(null);

    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    /* =========================
       CARGAR CATEGORÍAS
    ========================= */
    useEffect(() => {
        api.get("/categorias-articulos")
            .then(({ data }) => {
                setCategorias(data);
                if (data.length) {
                    setCategoriaId(data[0].id);
                }
            })
            .catch(() => toast.error("Error cargando categorías"));
    }, []);

    /* =========================
       CARGAR ARTÍCULOS DE CATEGORÍA
    ========================= */
    useEffect(() => {
        if (!categoriaId) return;

        setLoading(true);

        api.get(`/categorias-articulos/${categoriaId}/articulos`)
            .then(({ data }) => {
                setArticulos(data.articulos);
            })
            .catch(() => toast.error("Error cargando artículos"))
            .finally(() => setLoading(false));
    }, [categoriaId]);

    /* =========================
       ORDENAR (↑ ↓)
    ========================= */
    const move = (index, direction) => {
        setArticulos((prev) => {
            const next = [...prev];
            const target = index + direction;

            if (target < 0 || target >= next.length) return prev;

            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    /* =========================
       GUARDAR ORDEN
    ========================= */
    const guardarOrden = async () => {
        if (!categoriaId) return;

        setSaving(true);

        const payload = {
            articulos: articulos.map((a, index) => ({
                id: a.id,
                orden: index,
            })),
        };

        try {
            await api.post(
                `/categorias-articulos/${categoriaId}/orden`,
                payload,
            );
            toast.success("Orden guardado correctamente");
        } catch {
            toast.error("Error guardando el orden");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-7 min-h-screen">
            {/* HEADER CARD */}
            <div
                className="
        relative
        mb-7
        rounded-3xl
        bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
        p-[1px]
        shadow-[0_10px_50px_rgba(0,0,0,0.15)]
    "
            >
                <div className="rounded-3xl bg-white px-6 py-5 flex items-center justify-between">
                    {/* IZQUIERDA */}
                    <div className="flex items-center gap-4">
                        <div
                            className="
                    w-12 h-12
                    rounded-2xl
                    bg-gradient-to-br from-indigo-500 to-violet-600
                    text-white
                    flex items-center justify-center
                    text-2xl
                    shadow-lg
                "
                        >
                            <i className="mgc_sort_ascending_line"></i>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Ordenar artículos
                            </h1>
                            <p className="text-sm text-gray-500">
                                Controla el orden de visualización por categoría
                            </p>
                        </div>
                    </div>

                    {/* DERECHA */}
                    <div className="flex items-center gap-3">
                        {/* BOTÓN SECUNDARIO */}
                        <a
                            href="/admin/categorias-articulos"
                            className="
                    inline-flex items-center gap-2
                    h-11 px-5
                    rounded-xl
                    border border-gray-200
                    bg-white
                    text-gray-700
                    text-sm font-medium
                    hover:bg-gray-50
                    hover:border-gray-300
                    transition
                "
                        >
                            <i className="mgc_arrow_left_line text-lg"></i>
                            Volver
                        </a>

                        {/* BOTÓN PRIMARIO */}
                        <button
                            onClick={guardarOrden}
                            disabled={saving || loading}
                            className="
                    inline-flex items-center gap-2
                    h-11 px-6
                    rounded-xl
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    text-white
                    text-sm font-semibold
                    shadow-xl
                    shadow-indigo-600/30
                    hover:opacity-95
                    transition
                    disabled:opacity-50
                "
                        >
                            <i className="mgc_save_line text-lg"></i>
                            {saving ? "Guardando…" : "Guardar orden"}
                        </button>
                    </div>
                </div>
            </div>

            {/* SELECT CARD */}
            <div
                className="
                mb-6
                rounded-2xl
                bg-white
                border border-gray-200
                shadow-sm
                p-5
                max-w-md
            "
            >
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoría
                </label>

                <select
                    value={categoriaId ?? ""}
                    onChange={(e) => setCategoriaId(Number(e.target.value))}
                    className="
                    mt-2
                    w-full h-11 px-3
                    rounded-xl
                    border border-gray-300
                    bg-white
                    font-medium
                    focus:outline-none
                    focus:ring-2
                    focus:ring-violet-500/40
                    focus:border-violet-500
                "
                >
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* LIST CARD */}
            <div
                className="
                rounded-3xl
                bg-white
                border border-gray-200
                shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                overflow-hidden
            "
            >
                {loading ? (
                    <div className="p-10 text-center text-gray-400">
                        Cargando…
                    </div>
                ) : articulos.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                        No hay artículos en esta categoría
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {articulos.map((articulo, index) => (
                            <div
                                key={articulo.id}
                                className="
                                flex items-center justify-between
                                px-6 py-4
                                hover:bg-violet-50/40
                                transition
                                group
                            "
                            >
                                {/* LEFT */}
                                <div className="flex items-center gap-4">
                                    <div
                                        className="
                                        w-9 h-9
                                        rounded-lg
                                        bg-slate-100
                                        flex items-center justify-center
                                        text-xs font-semibold
                                        text-gray-600
                                    "
                                    >
                                        {index + 1}
                                    </div>

                                    <span className="font-semibold text-gray-900">
                                        {articulo.nombre}
                                    </span>
                                </div>

                                {/* ACTIONS */}
                                <div
                                    className="
                                    flex items-center gap-2
                                    opacity-70
                                    group-hover:opacity-100
                                    transition
                                "
                                >
                                    <button
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        className="
                                        w-9 h-9
                                        flex items-center justify-center
                                        rounded-lg
                                        border border-gray-200
                                        bg-white
                                        hover:bg-gray-50
                                        disabled:opacity-30
                                        transition
                                    "
                                    >
                                        <i className="mgc_arrow_up_line"></i>
                                    </button>

                                    <button
                                        onClick={() => move(index, 1)}
                                        disabled={
                                            index === articulos.length - 1
                                        }
                                        className="
                                        w-9 h-9
                                        flex items-center justify-center
                                        rounded-lg
                                        border border-gray-200
                                        bg-white
                                        hover:bg-gray-50
                                        disabled:opacity-30
                                        transition
                                    "
                                    >
                                        <i className="mgc_arrow_down_line"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
