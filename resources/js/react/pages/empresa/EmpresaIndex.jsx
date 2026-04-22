import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

function Campo({ label, descripcion, value, onChange, type = "text", placeholder, maxLength }) {
    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </label>
            {descripcion && (
                <p className="text-xs text-gray-400 mt-0.5 mb-1">{descripcion}</p>
            )}
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
        </div>
    );
}

export default function EmpresaIndex() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({});

    const set = (campo, valor) => setConfig((prev) => ({ ...prev, [campo]: valor }));

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/configuracion/empresa");
            setConfig(data);
        } catch {
            toast.error("Error al cargar la información");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const guardar = async () => {
        setSaving(true);
        try {
            await api.put("/configuracion/empresa", config);
            toast.success("Información guardada");
        } catch (e) {
            toast.error(e?.response?.data?.message ?? "Error al guardar");
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
            <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-lg">
                        <i className="mgc_building_3_line"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Información de empresa
                        </h1>
                        <p className="text-sm text-gray-500">
                            Datos de contacto, dirección y redes sociales que se mostrarán en la tienda
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Datos básicos */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Datos básicos
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <Campo
                                label="Nombre comercial"
                                value={config.empresa_nombre}
                                onChange={(v) => set("empresa_nombre", v)}
                                placeholder="Pizzería Casa de Campo"
                                maxLength={150}
                            />

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Descripción
                                </label>
                                <textarea
                                    value={config.empresa_descripcion ?? ""}
                                    onChange={(e) => set("empresa_descripcion", e.target.value)}
                                    placeholder="Breve descripción de la empresa que se muestra en el footer"
                                    rows={3}
                                    maxLength={1000}
                                    className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none"
                                />
                            </div>

                            <Campo
                                label="CIF / NIF"
                                descripcion="Obligatorio por ley para ecommerce"
                                value={config.empresa_cif}
                                onChange={(v) => set("empresa_cif", v)}
                                placeholder="B12345678"
                                maxLength={20}
                            />
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Contacto
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <Campo
                                label="Email"
                                type="email"
                                value={config.empresa_email}
                                onChange={(v) => set("empresa_email", v)}
                                placeholder="info@pizzeriacasadecampo.es"
                                maxLength={150}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Campo
                                    label="Teléfono principal"
                                    type="tel"
                                    value={config.empresa_telefono}
                                    onChange={(v) => set("empresa_telefono", v)}
                                    placeholder="958 585 112"
                                    maxLength={30}
                                />
                                <Campo
                                    label="WhatsApp"
                                    descripcion="Número con prefijo (ej: 34600000000)"
                                    type="tel"
                                    value={config.empresa_whatsapp}
                                    onChange={(v) => set("empresa_whatsapp", v)}
                                    placeholder="34600000000"
                                    maxLength={30}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Dirección
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <Campo
                                label="Dirección"
                                value={config.empresa_direccion}
                                onChange={(v) => set("empresa_direccion", v)}
                                placeholder="Paseo del Charcón, 13"
                                maxLength={255}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Campo
                                    label="Código postal"
                                    value={config.empresa_codigo_postal}
                                    onChange={(v) => set("empresa_codigo_postal", v)}
                                    placeholder="18110"
                                    maxLength={15}
                                />
                                <Campo
                                    label="Ciudad / Provincia"
                                    value={config.empresa_ciudad}
                                    onChange={(v) => set("empresa_ciudad", v)}
                                    placeholder="Las Gabias (Granada)"
                                    maxLength={100}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Google Maps */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Google Maps
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Pega aquí el código de incrustación (iframe) de Google Maps
                            </p>
                        </div>
                        <div className="p-6 space-y-3">
                            <details className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                                <summary className="cursor-pointer text-xs font-semibold text-blue-700">
                                    ¿Cómo obtengo el código?
                                </summary>
                                <ol className="text-xs text-blue-800 mt-2 pl-4 list-decimal space-y-1">
                                    <li>Busca tu dirección en Google Maps</li>
                                    <li>Haz clic en el botón "Compartir"</li>
                                    <li>Selecciona la pestaña "Insertar un mapa"</li>
                                    <li>Copia el código HTML completo (que empieza por &lt;iframe&gt;)</li>
                                    <li>Pégalo en el campo de abajo</li>
                                </ol>
                            </details>

                            <textarea
                                value={config.empresa_google_maps_embed ?? ""}
                                onChange={(e) => set("empresa_google_maps_embed", e.target.value)}
                                placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450"></iframe>'
                                rows={6}
                                maxLength={2000}
                                className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-y"
                            />

                            {config.empresa_google_maps_embed && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">
                                        Vista previa:
                                    </p>
                                    <div
                                        className="rounded-xl overflow-hidden border border-gray-200"
                                        style={{ height: "250px" }}
                                        dangerouslySetInnerHTML={{
                                            __html: config.empresa_google_maps_embed,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA LATERAL */}
                <div className="space-y-6">
                    {/* Redes sociales */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Redes sociales
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                URLs completas (https://...)
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <Campo
                                label="Facebook"
                                value={config.empresa_facebook}
                                onChange={(v) => set("empresa_facebook", v)}
                                placeholder="https://facebook.com/..."
                                maxLength={255}
                            />
                            <Campo
                                label="Instagram"
                                value={config.empresa_instagram}
                                onChange={(v) => set("empresa_instagram", v)}
                                placeholder="https://instagram.com/..."
                                maxLength={255}
                            />
                        </div>
                    </div>

                    {/* Botón guardar */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-5">
                        <button
                            onClick={guardar}
                            disabled={saving}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:opacity-95 transition shadow-xl shadow-cyan-600/30 disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar información"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
