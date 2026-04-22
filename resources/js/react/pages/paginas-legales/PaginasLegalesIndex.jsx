import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

function ConfirmModal({ titulo, mensaje, onCancel, onConfirm, confirmText }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white">
                    <h3 className="font-semibold">{titulo}</h3>
                </div>
                <div className="p-6 text-gray-600 text-sm">{mensaje}</div>
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onCancel}
                        className="h-10 px-4 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:opacity-95 transition"
                    >
                        {confirmText ?? "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaginasLegalesIndex() {
    const [paginas, setPaginas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seleccionada, setSeleccionada] = useState(null);
    const [borrando, setBorrando] = useState(null);

    // Campos del editor
    const [titulo, setTitulo] = useState("");
    const [slug, setSlug] = useState("");
    const [contenido, setContenido] = useState("");
    const [activa, setActiva] = useState(true);
    const [creandoNueva, setCreandoNueva] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/paginas-legales");
            setPaginas(data);
            if (data.length > 0 && !seleccionada) {
                seleccionar(data[0]);
            }
        } catch {
            toast.error("Error al cargar las páginas");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const seleccionar = (p) => {
        setSeleccionada(p);
        setTitulo(p.titulo);
        setSlug(p.slug);
        setContenido(p.contenido ?? "");
        setActiva(Boolean(p.activa));
        setCreandoNueva(false);
    };

    const nuevaPagina = () => {
        setSeleccionada(null);
        setTitulo("");
        setSlug("");
        setContenido("");
        setActiva(true);
        setCreandoNueva(true);
    };

    const guardar = async () => {
        if (!titulo.trim()) {
            toast.error("El título es obligatorio");
            return;
        }
        setSaving(true);
        try {
            const payload = { titulo, slug: slug || null, contenido, activa };
            if (creandoNueva) {
                const { data } = await api.post("/paginas-legales", payload);
                toast.success("Página creada");
                setSeleccionada(data);
                setCreandoNueva(false);
            } else {
                const { data } = await api.put(
                    `/paginas-legales/${seleccionada.id}`,
                    payload,
                );
                toast.success("Página guardada");
                setSeleccionada(data);
            }
            load();
        } catch (e) {
            toast.error(e?.response?.data?.message ?? "Error al guardar");
        }
        setSaving(false);
    };

    const eliminar = async () => {
        if (!borrando) return;
        try {
            await api.delete(`/paginas-legales/${borrando.id}`);
            toast.success("Página eliminada");
            if (seleccionada?.id === borrando.id) {
                setSeleccionada(null);
                setTitulo("");
                setContenido("");
            }
            setBorrando(null);
            load();
        } catch {
            toast.error("No se pudo eliminar");
        }
    };

    if (loading) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-6 rounded-3xl bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-gray-900 text-white flex items-center justify-center text-xl shadow-lg">
                            <i className="mgc_file_2_line"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Páginas legales
                            </h1>
                            <p className="text-sm text-gray-500">
                                Términos, privacidad, cookies, aviso legal y
                                devoluciones
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={nuevaPagina}
                        className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-95 transition shadow-xl shadow-indigo-600/30 inline-flex items-center gap-2"
                    >
                        <i className="mgc_add_line text-lg"></i>
                        Nueva página
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* SIDEBAR — listado de páginas */}
                <div className="lg:col-span-1 rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/70">
                        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Páginas ({paginas.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {paginas.map((p) => {
                            const isSelected = seleccionada?.id === p.id && !creandoNueva;
                            return (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
                                        isSelected
                                            ? "bg-indigo-50 border-l-4 border-indigo-600"
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => seleccionar(p)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-800 truncate">
                                            {p.titulo}
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono truncate">
                                            /{p.slug}
                                        </div>
                                    </div>
                                    <span
                                        className={`ml-2 w-2 h-2 rounded-full flex-shrink-0 ${
                                            p.activa ? "bg-emerald-500" : "bg-gray-300"
                                        }`}
                                        title={p.activa ? "Activa" : "Oculta"}
                                    />
                                </div>
                            );
                        })}
                        {paginas.length === 0 && (
                            <div className="px-4 py-8 text-center text-xs text-gray-400">
                                No hay páginas
                            </div>
                        )}
                    </div>
                </div>

                {/* EDITOR */}
                <div className="lg:col-span-3 rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                    {seleccionada || creandoNueva ? (
                        <>
                            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    {creandoNueva
                                        ? "Nueva página"
                                        : "Editar página"}
                                </h2>
                                {!creandoNueva && seleccionada && (
                                    <button
                                        onClick={() =>
                                            setBorrando(seleccionada)
                                        }
                                        className="h-9 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition inline-flex items-center gap-1"
                                    >
                                        <i className="mgc_delete_2_line"></i>
                                        Eliminar
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            value={titulo}
                                            onChange={(e) =>
                                                setTitulo(e.target.value)
                                            }
                                            placeholder="Ej: Términos y Condiciones"
                                            maxLength={150}
                                            className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Slug (URL)
                                        </label>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) =>
                                                setSlug(
                                                    e.target.value
                                                        .toLowerCase()
                                                        .replace(/[^a-z0-9-]/g, "-"),
                                                )
                                            }
                                            placeholder="auto"
                                            maxLength={100}
                                            className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1 truncate">
                                            /legal/{slug || "auto-generado"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Contenido
                                    </label>
                                    <p className="text-xs text-gray-400 mt-0.5 mb-1">
                                        Puedes usar saltos de línea y párrafos. El HTML básico también se respeta (strong, em, ul, li, a, etc.).
                                    </p>
                                    <textarea
                                        value={contenido}
                                        onChange={(e) =>
                                            setContenido(e.target.value)
                                        }
                                        placeholder="Escribe aquí el texto de la página..."
                                        rows={20}
                                        className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-y"
                                    />
                                    <div className="text-xs text-gray-400 mt-1 text-right">
                                        {contenido.length.toLocaleString()}{" "}
                                        caracteres
                                    </div>
                                </div>

                                {/* Toggle activa */}
                                <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800">
                                            {activa
                                                ? "Página visible"
                                                : "Página oculta"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {activa
                                                ? "Los clientes pueden acceder a ella"
                                                : "No está disponible en la tienda"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiva(!activa)}
                                        className={`relative w-12 h-7 rounded-full transition shadow-inner ${
                                            activa
                                                ? "bg-emerald-500"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition ${
                                                activa ? "translate-x-5" : ""
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                                <button
                                    onClick={guardar}
                                    disabled={saving}
                                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:opacity-95 transition shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Guardando..."
                                        : creandoNueva
                                          ? "Crear página"
                                          : "Guardar cambios"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <i className="mgc_file_2_line text-5xl block mb-3"></i>
                            <p>Selecciona una página del listado o crea una nueva</p>
                        </div>
                    )}
                </div>
            </div>

            {borrando && (
                <ConfirmModal
                    titulo="Eliminar página"
                    mensaje={`¿Eliminar "${borrando.titulo}"? Esta acción no se puede deshacer.`}
                    onCancel={() => setBorrando(null)}
                    onConfirm={eliminar}
                    confirmText="Eliminar"
                />
            )}
        </div>
    );
}
