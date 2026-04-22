import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

function Campo({ label, descripcion, value, onChange, type = "text", placeholder, disabled }) {
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
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="
                    mt-1 w-full h-11 px-3
                    rounded-xl border border-gray-300 bg-white font-medium
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                    disabled:bg-gray-100 disabled:text-gray-400
                "
            />
        </div>
    );
}

function Toggle({ activo, onChange, label, descripcion, colorOn = "bg-emerald-500", colorOff = "bg-gray-300" }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
            <div>
                <div className="text-sm font-semibold text-gray-800">{label}</div>
                {descripcion && <div className="text-xs text-gray-500">{descripcion}</div>}
            </div>
            <button
                onClick={() => onChange(!activo)}
                className={`relative w-12 h-7 rounded-full transition shadow-inner ${activo ? colorOn : colorOff}`}
            >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition ${activo ? "translate-x-5" : ""}`} />
            </button>
        </div>
    );
}

export default function PasarelaPagoIndex() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const [config, setConfig] = useState({
        redsys_entorno: "test",
        redsys_activo: false,
        redsys_merchant_code: "",
        redsys_terminal: "1",
        redsys_secret_key: "",
        redsys_moneda: "978",
        redsys_tipo_transaccion: "0",
        redsys_nombre_comercio: "",
        redsys_url_ok: "",
        redsys_url_ko: "",
    });
    const [secretKeySet, setSecretKeySet] = useState(false);
    const [secretKeyMasked, setSecretKeyMasked] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/configuracion/pasarela");
            setConfig({
                redsys_entorno: data.redsys_entorno || "test",
                redsys_activo: data.redsys_activo === "1",
                redsys_merchant_code: data.redsys_merchant_code || "",
                redsys_terminal: data.redsys_terminal || "1",
                redsys_secret_key: "",
                redsys_moneda: data.redsys_moneda || "978",
                redsys_tipo_transaccion: data.redsys_tipo_transaccion || "0",
                redsys_nombre_comercio: data.redsys_nombre_comercio || "",
                redsys_url_ok: data.redsys_url_ok || "",
                redsys_url_ko: data.redsys_url_ko || "",
            });
            setSecretKeySet(data.redsys_secret_key_set || false);
            setSecretKeyMasked(data.redsys_secret_key_masked || "");
        } catch {
            toast.error("Error cargando configuración");
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const guardar = async () => {
        setSaving(true);
        try {
            await api.put("/configuracion/pasarela", {
                ...config,
                redsys_activo: config.redsys_activo,
            });
            toast.success("Configuración guardada");
            load();
        } catch (e) {
            toast.error(e?.response?.data?.message ?? "Error al guardar");
        }
        setSaving(false);
    };

    const verificar = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const { data } = await api.post("/configuracion/pasarela/test");
            setTestResult(data);
        } catch {
            setTestResult({ ok: false, errores: ["Error de conexión con el servidor."] });
        }
        setTesting(false);
    };

    const esProduccion = config.redsys_entorno === "produccion";

    if (loading) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-lg">
                            <i className="mgc_bank_card_line"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Pasarela de Pago
                            </h1>
                            <p className="text-sm text-gray-500">
                                Configuración de Redsys / CaixaBank TPV Virtual
                            </p>
                        </div>
                    </div>

                    {/* Badge entorno */}
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        esProduccion
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${esProduccion ? "bg-red-500" : "bg-amber-500"}`} />
                        {esProduccion ? "PRODUCCION" : "TEST / SANDBOX"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Credenciales */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Credenciales Redsys
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Datos proporcionados por CaixaBank al activar el TPV Virtual
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            <Campo
                                label="Codigo de comercio (FUC)"
                                descripcion="Numero de 9 digitos proporcionado por el banco"
                                value={config.redsys_merchant_code}
                                onChange={(v) => setConfig({ ...config, redsys_merchant_code: v })}
                                placeholder="999008881"
                            />

                            <Campo
                                label="Numero de terminal"
                                descripcion="Normalmente es 1"
                                value={config.redsys_terminal}
                                onChange={(v) => setConfig({ ...config, redsys_terminal: v })}
                                placeholder="1"
                            />

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Clave secreta (SHA-256)
                                </label>
                                <p className="text-xs text-gray-400 mt-0.5 mb-1">
                                    Proporcionada por el banco. Se almacena cifrada y nunca se muestra completa.
                                </p>
                                {secretKeySet && !config.redsys_secret_key && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Configurada
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">{secretKeyMasked}</span>
                                    </div>
                                )}
                                <input
                                    type="password"
                                    value={config.redsys_secret_key}
                                    onChange={(e) => setConfig({ ...config, redsys_secret_key: e.target.value })}
                                    placeholder={secretKeySet ? "Dejar vacío para mantener la actual" : "Pegar la clave secreta aquí"}
                                    className="
                                        mt-1 w-full h-11 px-3
                                        rounded-xl border border-gray-300 bg-white font-mono text-sm
                                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                    "
                                />
                            </div>

                            <Campo
                                label="Nombre del comercio"
                                descripcion="Nombre que vera el cliente en la pasarela de pago"
                                value={config.redsys_nombre_comercio}
                                onChange={(v) => setConfig({ ...config, redsys_nombre_comercio: v })}
                                placeholder="Pizzería Casa de Campo"
                            />
                        </div>
                    </div>

                    {/* URLs de retorno de la tienda */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                URLs de retorno (tienda)
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Adonde vuelve el cliente despues de pagar en el TPV. Deben apuntar al dominio de la tienda React.
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            <Campo
                                label="URL de retorno OK"
                                descripcion="Pagina de la tienda cuando el pago es correcto"
                                value={config.redsys_url_ok}
                                onChange={(v) => setConfig({ ...config, redsys_url_ok: v })}
                                placeholder="https://tutienda.com/pago/ok"
                            />
                            <Campo
                                label="URL de retorno KO"
                                descripcion="Pagina de la tienda cuando el pago es rechazado"
                                value={config.redsys_url_ko}
                                onChange={(v) => setConfig({ ...config, redsys_url_ko: v })}
                                placeholder="https://tutienda.com/pago/error"
                            />
                        </div>
                    </div>

                    {/* Configuración avanzada */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Configuracion avanzada
                            </h2>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <Campo
                                    label="Codigo de moneda"
                                    descripcion="978 = Euro"
                                    value={config.redsys_moneda}
                                    onChange={(v) => setConfig({ ...config, redsys_moneda: v })}
                                    placeholder="978"
                                />
                                <Campo
                                    label="Tipo de transaccion"
                                    descripcion="0 = Autorizacion"
                                    value={config.redsys_tipo_transaccion}
                                    onChange={(v) => setConfig({ ...config, redsys_tipo_transaccion: v })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA LATERAL */}
                <div className="space-y-6">
                    {/* Entorno y activación */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                Estado
                            </h2>
                        </div>

                        <div className="p-5 space-y-4">
                            <Toggle
                                activo={config.redsys_activo}
                                onChange={(v) => setConfig({ ...config, redsys_activo: v })}
                                label="Pasarela activa"
                                descripcion="Habilitar el pago con tarjeta online"
                            />

                            {/* Selector de entorno */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Entorno
                                </label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setConfig({ ...config, redsys_entorno: "test" })}
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition ${
                                            !esProduccion
                                                ? "border-amber-400 bg-amber-50 text-amber-700"
                                                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        Test
                                    </button>
                                    <button
                                        onClick={() => setConfig({ ...config, redsys_entorno: "produccion" })}
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition ${
                                            esProduccion
                                                ? "border-red-400 bg-red-50 text-red-700"
                                                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        Produccion
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="p-5 space-y-3">
                            <button
                                onClick={guardar}
                                disabled={saving}
                                className="
                                    w-full h-12 rounded-xl
                                    bg-gradient-to-r from-emerald-600 to-teal-600
                                    text-white font-semibold
                                    hover:opacity-95 transition
                                    shadow-xl shadow-emerald-600/30
                                    disabled:opacity-50
                                "
                            >
                                {saving ? "Guardando..." : "Guardar configuracion"}
                            </button>

                            <button
                                onClick={verificar}
                                disabled={testing}
                                className="
                                    w-full h-12 rounded-xl
                                    border-2 border-gray-200
                                    text-gray-700 font-semibold
                                    hover:bg-gray-50 transition
                                    disabled:opacity-50
                                "
                            >
                                {testing ? "Verificando..." : "Verificar configuracion"}
                            </button>
                        </div>

                        {/* Resultado del test */}
                        {testResult && (
                            <div className={`mx-5 mb-5 p-4 rounded-xl text-sm ${
                                testResult.ok
                                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                    : "bg-red-50 border border-red-200 text-red-700"
                            }`}>
                                {testResult.ok ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">&#10003;</span>
                                        <span>{testResult.message}</span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-semibold mb-1">Errores encontrados:</div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {(testResult.errores || []).map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 p-5">
                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                            URLs activas
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="text-gray-400 block">Notificacion (backend, automatica):</span>
                                <code className="text-gray-700 bg-white px-2 py-1 rounded-lg border text-[11px] block mt-1 break-all">
                                    {window.location.origin}/api/shop/redsys/notificacion
                                </code>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Retorno OK (tienda):</span>
                                <code className="text-gray-700 bg-white px-2 py-1 rounded-lg border text-[11px] block mt-1 break-all">
                                    {config.redsys_url_ok || <span className="text-amber-500">Pendiente de configurar</span>}
                                </code>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Retorno KO (tienda):</span>
                                <code className="text-gray-700 bg-white px-2 py-1 rounded-lg border text-[11px] block mt-1 break-all">
                                    {config.redsys_url_ko || <span className="text-amber-500">Pendiente de configurar</span>}
                                </code>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                            La URL de notificacion es del backend y no se puede cambiar. Las de retorno OK/KO deben apuntar a la tienda React.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
