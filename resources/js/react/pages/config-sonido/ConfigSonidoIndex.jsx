import React, { useEffect, useState, useRef } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function ConfigSonidoIndex() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const fileRef = useRef(null);
    const audioRef = useRef(null);

    const cargar = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/configuracion/sonido");
            setConfig(data);
        } catch {
            toast.error("Error cargando configuración");
        }
        setLoading(false);
    };

    useEffect(() => {
        cargar();
    }, []);

    const toggleActivo = async () => {
        try {
            const { data } = await api.put("/configuracion/sonido", {
                sonido_activo: !config.sonido_activo,
            });
            setConfig(data);
            toast.success(
                data.sonido_activo
                    ? "Sonido activado"
                    : "Sonido desactivado",
            );
        } catch {
            toast.error("Error actualizando");
        }
    };

    const subirArchivo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append("archivo", file);
            const { data } = await api.post(
                "/configuracion/sonido/archivo",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            setConfig(data);
            toast.success("Archivo de sonido subido");
        } catch (err) {
            const msg =
                err.response?.data?.errors?.archivo?.[0] ??
                "Error subiendo archivo";
            toast.error(msg);
        }
        setSubiendo(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const eliminarArchivo = async () => {
        setEliminando(true);
        try {
            const { data } = await api.delete(
                "/configuracion/sonido/archivo",
            );
            setConfig(data);
            toast.success("Archivo eliminado, se usará sonido por defecto");
        } catch {
            toast.error("Error eliminando archivo");
        }
        setEliminando(false);
    };

    const previsualizar = () => {
        if (config?.tiene_archivo && config?.sonido_archivo) {
            const url = `/storage/${config.sonido_archivo}`;
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        } else {
            // Sonido por defecto: ding-ding
            try {
                const ctx = new (window.AudioContext ||
                    window.webkitAudioContext)();
                [0, 0.25].forEach((delay) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = 880;
                    osc.type = "sine";
                    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(
                        0.001,
                        ctx.currentTime + delay + 0.2,
                    );
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.2);
                });
            } catch {}
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-400 text-sm">
                Cargando...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center text-2xl shadow-lg">
                        🔔
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Sonido de Alerta
                        </h1>
                        <p className="text-sm text-gray-500">
                            Configura el sonido cuando llega un nuevo pedido a
                            cocina
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                {/* Toggle activar/desactivar */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">
                                Sonido de notificación
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Reproduce un sonido cuando entra un nuevo pedido
                                en cocina
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleActivo}
                            className={`relative w-14 h-8 rounded-full transition shadow-inner ${
                                config?.sonido_activo
                                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                                    : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition ${
                                    config?.sonido_activo
                                        ? "translate-x-6"
                                        : ""
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Archivo de sonido */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-1">
                        Archivo de sonido
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Sube un archivo MP3, WAV u OGG (máx. 2MB). Si no subes
                        ninguno, se usará un sonido por defecto.
                    </p>

                    {/* Estado actual */}
                    {config?.tiene_archivo ? (
                        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🎵</span>
                                <div>
                                    <div className="text-sm font-semibold text-emerald-800">
                                        Sonido personalizado
                                    </div>
                                    <div className="text-xs text-emerald-600">
                                        {config.sonido_archivo
                                            ?.split("/")
                                            .pop()}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={eliminarArchivo}
                                disabled={eliminando}
                                className="h-9 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition disabled:opacity-50"
                            >
                                {eliminando ? "..." : "Eliminar"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                            <span className="text-xl">🔔</span>
                            <div>
                                <div className="text-sm font-semibold text-amber-800">
                                    Sonido por defecto
                                </div>
                                <div className="text-xs text-amber-600">
                                    Doble tono "ding-ding"
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3">
                        <label
                            className={`h-11 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:opacity-95 transition shadow-lg shadow-fuchsia-600/30 flex items-center gap-2 cursor-pointer text-sm ${subiendo ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            <i className="mgc_upload_line text-lg"></i>
                            {subiendo ? "Subiendo..." : "Subir sonido"}
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".mp3,.wav,.ogg"
                                onChange={subirArchivo}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={previsualizar}
                            className="h-11 px-5 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                        >
                            <i className="mgc_play_line text-lg"></i>
                            Previsualizar
                        </button>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} className="hidden" />
        </div>
    );
}
