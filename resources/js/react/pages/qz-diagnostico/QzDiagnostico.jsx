import React, { useState } from "react";
import qz from "qz-tray";

// Importar para que se ejecute la configuración de seguridad (certificado + firma)
import "@/react/lib/qzPrinter";

export default function QzDiagnostico() {
    const [estado, setEstado] = useState("Desconectado");
    const [impresoras, setImpresoras] = useState([]);
    const [defaultPrinter, setDefaultPrinter] = useState(null);
    const [log, setLog] = useState([]);
    const [testPrinter, setTestPrinter] = useState("");
    const [testIp, setTestIp] = useState("192.168.123.100");

    // Impresora seleccionada para cocina
    const guardada = localStorage.getItem("qz_impresora");
    const [seleccionada, setSeleccionada] = useState(
        guardada ? JSON.parse(guardada) : null,
    );

    const seleccionar = (config) => {
        localStorage.setItem("qz_impresora", JSON.stringify(config));
        setSeleccionada(config);
    };

    const addLog = (msg) =>
        setLog((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ${msg}`,
        ]);

    const conectar = async () => {
        try {
            if (!qz.websocket.isActive()) {
                addLog("Conectando a QZ Tray...");
                await qz.websocket.connect();
            }
            setEstado("Conectado");
            addLog("Conectado a QZ Tray correctamente");
        } catch (err) {
            setEstado("Error");
            addLog(`Error al conectar: ${err?.message ?? err}`);
        }
    };

    const listarImpresoras = async () => {
        try {
            addLog("Buscando impresoras...");
            const lista = await qz.printers.find();
            setImpresoras(lista);
            addLog(`Encontradas ${lista.length} impresora(s)`);
        } catch (err) {
            addLog(`Error listando impresoras: ${err?.message ?? err}`);
        }
    };

    const buscarDefault = async () => {
        try {
            addLog("Buscando impresora por defecto...");
            const def = await qz.printers.getDefault();
            setDefaultPrinter(def);
            addLog(`Impresora por defecto: ${def}`);
        } catch (err) {
            addLog(
                `Error buscando impresora por defecto: ${err?.message ?? err}`,
            );
        }
    };

    const testImprimir = async (printer) => {
        try {
            addLog(`Imprimiendo test en: ${printer}`);
            const config = qz.configs.create(printer);
            const ticket =
                "\x1B@" +
                "\x1Ba\x01" +
                "\x1D!\x11" +
                "TEST QZ TRAY\n" +
                "\x1D!\x00" +
                new Date().toLocaleString("es-ES") +
                "\n" +
                "\x1Ba\x00" +
                "------------------------------------------------\n" +
                "Impresora: " + printer + "\n" +
                "Caracteres: n N a e i o u\n" +
                "Direccion Telefono Linea\n" +
                "Precio: 12,50 EUR\n" +
                "------------------------------------------------\n" +
                "\x1Ba\x01" +
                "Si lees esto correctamente,\n" +
                "la impresora funciona!\n\n\n" +
                "\x1Ba\x00" +
                "\x1Bd\x03" +
                "\x1DV\x00";
            await qz.print(config, [
                { type: "raw", format: "plain", data: ticket },
            ]);
            addLog("Test enviado correctamente");
        } catch (err) {
            addLog(`Error imprimiendo test: ${err?.message ?? err}`);
        }
    };

    const testImprimirIp = async () => {
        if (!testIp.trim()) return;
        try {
            addLog(`Imprimiendo test por IP: ${testIp}:9100`);
            const config = qz.configs.create(null, {
                host: testIp.trim(),
                port: 9100,
            });
            const ticket =
                "\x1B@" +
                "\x1Ba\x01" +
                "\x1D!\x11" +
                "TEST IP\n" +
                "\x1D!\x00" +
                new Date().toLocaleString("es-ES") +
                "\n" +
                "\x1Ba\x00" +
                "------------------------------------------------\n" +
                "IP: " + testIp + ":9100\n" +
                "Caracteres: n N a e i o u\n" +
                "Direccion Telefono Linea\n" +
                "Precio: 12,50 EUR\n" +
                "------------------------------------------------\n" +
                "\x1Ba\x01" +
                "Si lees esto correctamente,\n" +
                "la impresora funciona!\n\n\n" +
                "\x1Ba\x00" +
                "\x1Bd\x03" +
                "\x1DV\x00";
            await qz.print(config, [
                { type: "raw", format: "plain", data: ticket },
            ]);
            addLog("Test IP enviado correctamente");
        } catch (err) {
            addLog(`Error imprimiendo por IP: ${err?.message ?? err}`);
        }
    };

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* Header */}
            <div className="relative mb-6 rounded-3xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-[1px] shadow-lg">
                <div className="rounded-3xl bg-white px-6 py-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xl shadow-lg">
                        <i className="mgc_print_line"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            QZ Tray — Diagnóstico
                        </h1>
                        <p className="text-sm text-gray-500">
                            Estado:{" "}
                            <span
                                className={`font-bold ${estado === "Conectado" ? "text-emerald-600" : estado === "Error" ? "text-rose-600" : "text-amber-600"}`}
                            >
                                {estado}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Impresora seleccionada */}
            <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between ${seleccionada ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{seleccionada ? "✅" : "⚠️"}</span>
                    <div>
                        <div className="text-sm font-bold text-gray-800">
                            {seleccionada
                                ? `Impresora configurada: ${seleccionada.tipo === "ip" ? `IP ${seleccionada.host}:${seleccionada.port}` : seleccionada.nombre}`
                                : "No hay impresora seleccionada"}
                        </div>
                        <div className="text-xs text-gray-500">
                            {seleccionada
                                ? "Se usa para imprimir tickets en cocina"
                                : "Selecciona una impresora de la lista o usa una IP"}
                        </div>
                    </div>
                </div>
                {seleccionada && (
                    <button
                        onClick={() => {
                            localStorage.removeItem("qz_impresora");
                            setSeleccionada(null);
                        }}
                        className="h-9 px-3 rounded-xl border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-white transition"
                    >
                        Quitar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Acciones */}
                <div className="space-y-4">
                    {/* Conexión */}
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-3">
                            Conexión
                        </h2>
                        <button
                            onClick={conectar}
                            className="h-11 px-5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition w-full"
                        >
                            Conectar a QZ Tray
                        </button>
                    </div>

                    {/* Impresoras */}
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-3">
                            Impresoras detectadas
                        </h2>
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={listarImpresoras}
                                disabled={estado !== "Conectado"}
                                className="h-10 px-4 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-40"
                            >
                                Listar todas
                            </button>
                            <button
                                onClick={buscarDefault}
                                disabled={estado !== "Conectado"}
                                className="h-10 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40"
                            >
                                Ver por defecto
                            </button>
                        </div>

                        {defaultPrinter && (
                            <div className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2 mb-3">
                                Por defecto: <strong>{defaultPrinter}</strong>
                            </div>
                        )}

                        {impresoras.length > 0 && (
                            <div className="space-y-1">
                                {impresoras.map((p) => (
                                    <div
                                        key={p}
                                        className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 hover:bg-violet-50/40 transition"
                                    >
                                        <span className={`text-sm font-mono ${seleccionada?.tipo === "nombre" && seleccionada?.nombre === p ? "text-emerald-700 font-bold" : "text-gray-800"}`}>
                                            {p}
                                            {seleccionada?.tipo === "nombre" && seleccionada?.nombre === p && (
                                                <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">EN USO</span>
                                            )}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => testImprimir(p)}
                                                className="h-8 px-3 rounded-lg bg-violet-100 text-violet-700 text-xs font-semibold hover:bg-violet-200 transition"
                                            >
                                                Test
                                            </button>
                                            <button
                                                onClick={() => {
                                                    seleccionar({ tipo: "nombre", nombre: p });
                                                    addLog(`Impresora seleccionada: ${p}`);
                                                }}
                                                className="h-8 px-3 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition"
                                            >
                                                Usar esta
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Test por IP */}
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-3">
                            Test por IP directa (puerto 9100)
                        </h2>
                        {seleccionada?.tipo === "ip" && (
                            <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2 mb-3">
                                IP en uso: <strong>{seleccionada.host}:{seleccionada.port}</strong>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testIp}
                                onChange={(e) => setTestIp(e.target.value)}
                                placeholder="192.168.123.100"
                                className="flex-1 h-10 px-3 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                            />
                            <button
                                onClick={testImprimirIp}
                                disabled={estado !== "Conectado"}
                                className="h-10 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-40"
                            >
                                Test
                            </button>
                            <button
                                onClick={() => {
                                    seleccionar({ tipo: "ip", host: testIp.trim(), port: 9100 });
                                    addLog(`Impresora IP seleccionada: ${testIp}:9100`);
                                }}
                                className="h-10 px-4 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
                            >
                                Usar esta IP
                            </button>
                        </div>
                    </div>
                </div>

                {/* Log */}
                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-gray-800">Log</h2>
                        <button
                            onClick={() => setLog([])}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Limpiar
                        </button>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
                        {log.length === 0 ? (
                            <span className="text-slate-500">
                                Pulsa "Conectar" para empezar...
                            </span>
                        ) : (
                            log.map((line, i) => <div key={i}>{line}</div>)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
