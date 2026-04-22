import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function EstadoTiendaIndex() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [cerrada, setCerrada] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [mensaje, setMensaje] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/configuracion/estado-tienda");
            setCerrada(Boolean(data.tienda_cerrada));
            setTitulo(data.titulo_cerrada ?? "");
            setMensaje(data.mensaje_cerrada ?? "");
        } catch {
            toast.error("Error cargando el estado de la tienda");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const guardar = async () => {
        setSaving(true);
        try {
            await api.put("/configuracion/estado-tienda", {
                tienda_cerrada: cerrada,
                titulo_cerrada: titulo,
                mensaje_cerrada: mensaje,
            });
            toast.success(
                cerrada ? "Tienda cerrada correctamente" : "Tienda abierta",
            );
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "Error al guardar los cambios",
            );
        }
        setSaving(false);
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
            <div
                className={`relative mb-8 rounded-3xl p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)] ${
                    cerrada
                        ? "bg-gradient-to-r from-red-500 via-rose-500 to-orange-500"
                        : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                }`}
            >
                <div className="rounded-3xl bg-white px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl shadow-lg ${
                                cerrada
                                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                                    : "bg-gradient-to-br from-emerald-500 to-teal-600"
                            }`}
                        >
                            <i
                                className={
                                    cerrada
                                        ? "mgc_lock_line"
                                        : "mgc_store_line"
                                }
                            ></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Estado de la tienda
                            </h1>
                            <p className="text-sm text-gray-500">
                                Abrir o cerrar temporalmente la tienda al
                                público
                            </p>
                        </div>
                    </div>

                    {/* Badge estado */}
                    <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            cerrada
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${cerrada ? "bg-red-500" : "bg-emerald-500"}`}
                        />
                        {cerrada ? "CERRADA" : "ABIERTA"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Toggle principal */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Control principal
                            </h2>
                        </div>

                        <div className="p-6">
                            <div
                                className={`flex items-center justify-between rounded-2xl border-2 p-5 transition ${
                                    cerrada
                                        ? "border-red-300 bg-red-50"
                                        : "border-emerald-300 bg-emerald-50"
                                }`}
                            >
                                <div>
                                    <div className="text-base font-bold text-gray-800">
                                        {cerrada
                                            ? "Tienda cerrada al público"
                                            : "Tienda abierta al público"}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {cerrada
                                            ? "Los clientes no pueden ver artículos ni hacer pedidos"
                                            : "Los clientes pueden realizar pedidos con normalidad"}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setCerrada(!cerrada)}
                                    className={`relative w-16 h-9 rounded-full transition shadow-inner ${
                                        cerrada
                                            ? "bg-red-500"
                                            : "bg-emerald-500"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition flex items-center justify-center text-xs ${
                                            cerrada ? "translate-x-7" : ""
                                        }`}
                                    >
                                        {cerrada ? "🔒" : "✓"}
                                    </span>
                                </button>
                            </div>

                            {cerrada && (
                                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex gap-2">
                                    <i className="mgc_information_line text-lg flex-shrink-0 mt-0.5"></i>
                                    <div>
                                        <strong>Importante:</strong> Mientras
                                        la tienda esté cerrada, los clientes
                                        verán el mensaje configurado abajo y no
                                        podrán hacer nuevos pedidos. Los
                                        pedidos existentes seguirán siendo
                                        accesibles para el seguimiento.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mensaje al cliente */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Mensaje para los clientes
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Lo que verán los clientes cuando la tienda
                                esté cerrada
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: ¡Estamos cerrados!"
                                    maxLength={150}
                                    className="
                                        mt-1 w-full h-11 px-3
                                        rounded-xl border border-gray-300 bg-white font-medium
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                                    "
                                />
                                <div className="text-xs text-gray-400 mt-1 text-right">
                                    {titulo.length}/150
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Mensaje
                                </label>
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Ej: Nos tomamos unas vacaciones. Volveremos pronto."
                                    rows={5}
                                    maxLength={1000}
                                    className="
                                        mt-1 w-full px-3 py-3
                                        rounded-xl border border-gray-300 bg-white
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                                        resize-none
                                    "
                                />
                                <div className="text-xs text-gray-400 mt-1 text-right">
                                    {mensaje.length}/1000
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA LATERAL */}
                <div className="space-y-6">
                    {/* Vista previa */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Vista previa
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 bg-gradient-to-br from-slate-50 to-gray-100 text-center">
                                <div className="text-5xl mb-3">🔒</div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {titulo || "¡Estamos cerrados!"}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {mensaje ||
                                        "Volveremos muy pronto. ¡Gracias por tu paciencia!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden p-5">
                        <button
                            onClick={guardar}
                            disabled={saving}
                            className={`w-full h-12 rounded-xl font-semibold text-white hover:opacity-95 transition shadow-xl disabled:opacity-50 ${
                                cerrada
                                    ? "bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/30"
                                    : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/30"
                            }`}
                        >
                            {saving
                                ? "Guardando..."
                                : cerrada
                                  ? "Cerrar tienda"
                                  : "Mantener abierta"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
