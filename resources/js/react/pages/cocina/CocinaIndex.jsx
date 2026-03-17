import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const ESTADOS = {
    pendiente: { label: "Pendiente", color: "amber", siguiente: "aceptado" },
    aceptado: { label: "Aceptado", color: "blue", siguiente: "en_preparacion" },
    en_preparacion: {
        label: "Preparando",
        color: "violet",
        siguiente: "listo",
    },
    // Cocina termina aquí. El módulo de reparto es quien avanza de listo → en_camino.
    listo: { label: "Listo", color: "emerald", siguiente: null },
    en_camino: { label: "En camino", color: "cyan", siguiente: "entregado" },
    entregado: { label: "Entregado", color: "slate", siguiente: null },
    cancelado: { label: "Cancelado", color: "rose", siguiente: null },
};

// Panel de cocina: solo estos 4 estados.
// en_camino y entregado son responsabilidad del módulo de reparto.
const COLUMNAS = ["pendiente", "aceptado", "en_preparacion", "listo"];

// Fix #1: separar colBg y colBorder — eliminado el frágil .split(" ")[1]
const COLOR_CLASSES = {
    amber: {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-400",
        btn: "bg-amber-500 hover:bg-amber-600",
        colBg: "bg-amber-50",
        colBorder: "border-amber-200",
        text: "text-amber-700",
    },
    blue: {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        btn: "bg-blue-600 hover:bg-blue-700",
        colBg: "bg-blue-50",
        colBorder: "border-blue-200",
        text: "text-blue-700",
    },
    violet: {
        badge: "bg-violet-50 text-violet-700 border-violet-200",
        dot: "bg-violet-500",
        btn: "bg-violet-600 hover:bg-violet-700",
        colBg: "bg-violet-50",
        colBorder: "border-violet-200",
        text: "text-violet-700",
    },
    emerald: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        btn: "bg-emerald-600 hover:bg-emerald-700",
        colBg: "bg-emerald-50",
        colBorder: "border-emerald-200",
        text: "text-emerald-700",
    },
    cyan: {
        badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
        dot: "bg-cyan-500",
        btn: "bg-cyan-600 hover:bg-cyan-700",
        colBg: "bg-cyan-50",
        colBorder: "border-cyan-200",
        text: "text-cyan-700",
    },
    slate: {
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
        btn: "bg-slate-500 hover:bg-slate-600",
        colBg: "bg-slate-50",
        colBorder: "border-slate-200",
        text: "text-slate-600",
    },
    rose: {
        badge: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
        btn: "bg-rose-600 hover:bg-rose-700",
        colBg: "bg-rose-50",
        colBorder: "border-rose-200",
        text: "text-rose-700",
    },
};

// Fix #3: función única para label de pago — usada en tarjeta e impresión
const METODO_PAGO_LABEL = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia",
};
function labelPago(metodo) {
    return METODO_PAGO_LABEL[metodo] ?? metodo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

function tiempoTranscurrido(fechaStr) {
    const diff = Math.floor((Date.now() - new Date(fechaStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`;
}

function esCritico(fechaStr, estado) {
    const minutos = Math.floor((Date.now() - new Date(fechaStr)) / 60000);
    if (estado === "pendiente") return minutos > 3;
    if (estado === "en_preparacion") return minutos > 20;
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Impresión de comanda (ventana del navegador)
// ─────────────────────────────────────────────────────────────────────────────

function imprimirComanda(pedido) {
    const ventana = window.open("", "_blank", "width=400,height=620");

    // Fix: el navegador puede bloquear popups — fallback con toast
    if (!ventana) {
        toast.error(
            "El navegador bloqueó la ventana de impresión. Permite popups para este sitio.",
        );
        return;
    }

    const ingHtml = (ing) => {
        const signo = ing.tipo === "extra" ? "+" : "−";
        const nombre = ing.ingrediente?.nombre ?? `#${ing.ingrediente_id}`;
        const cant = ing.cantidad > 1 ? ` ×${ing.cantidad}` : "";
        const mitad = ing.mitad ? ` [mitad ${ing.mitad}]` : "";
        const tachado =
            ing.tipo === "quitado"
                ? "text-decoration:line-through;color:#888;"
                : "";
        return `<div style="padding-left:16px;font-size:12px;${tachado}">${signo} ${nombre}${cant}${mitad}</div>`;
    };

    const itemsHtml = (pedido.items ?? [])
        .map(
            (item) => `
        <div style="margin:6px 0">
            <div style="font-weight:700;font-size:14px">
                ${item.cantidad}× ${item.nombre}
                ${item.tamano ? `<span style="font-weight:400;font-size:12px"> (${item.tamano})</span>` : ""}
            </div>
            ${(item.ingredientes ?? []).map(ingHtml).join("")}
        </div>
        <div style="border-top:1px dotted #ccc;margin:4px 0"></div>
    `,
        )
        .join("");

    ventana.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Comanda ${pedido.codigo}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Courier New',monospace; font-size:13px; width:320px; padding:12px; color:#000; }
            .linea { border-top:1px dashed #000; margin:8px 0; }
            .fila  { display:flex; justify-content:space-between; font-size:12px; margin:2px 0; }
            .total { font-size:16px; font-weight:700; }
            .obs   { border:1px solid #000; padding:6px; margin-top:8px; font-size:12px; }
            .footer { text-align:center; font-size:11px; margin-top:10px; color:#666; }
            @media print { .no-print { display:none; } body { width:80mm; } }
        </style>
    </head><body>
        <div style="text-align:center;margin-bottom:10px">
            <div style="font-size:20px;font-weight:700;letter-spacing:2px">${pedido.codigo}</div>
            <div style="font-size:11px;margin-top:4px">${new Date(pedido.created_at).toLocaleString("es-ES")}</div>
        </div>
        <div class="linea"></div>
        <div class="fila"><span>Cliente</span><span>${pedido.cliente_nombre}</span></div>
        <div class="fila"><span>Teléfono</span><span>${pedido.cliente_telefono}</span></div>
        <div class="fila"><span>Dirección</span><span style="max-width:180px;text-align:right">${pedido.direccion}, ${pedido.codigo_postal}</span></div>
        <div class="fila"><span>Pago</span><span>${labelPago(pedido.metodo_pago)}</span></div>
        <div class="linea"></div>
        ${itemsHtml}
        <div class="linea"></div>
        <div class="fila"><span>Subtotal</span><span>${Number(pedido.subtotal).toFixed(2)}€</span></div>
        ${Number(pedido.gastos_envio) > 0 ? `<div class="fila"><span>Envío</span><span>${Number(pedido.gastos_envio).toFixed(2)}€</span></div>` : ""}
        <div class="fila total"><span>TOTAL</span><span>${Number(pedido.total).toFixed(2)}€</span></div>
        ${pedido.observaciones ? `<div class="obs">⚠️ ${pedido.observaciones}</div>` : ""}
        <div class="footer">— Comanda generada automáticamente —</div>
        <div class="no-print" style="text-align:center;margin-top:12px">
            <button onclick="window.print()" style="padding:8px 20px;font-size:14px;cursor:pointer">Imprimir</button>
        </div>
    </body></html>`);

    ventana.document.close();
    ventana.onload = () => ventana.print();
}

// ─────────────────────────────────────────────────────────────────────────────
// EstadoBadge
// ─────────────────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
    const cfg = ESTADOS[estado] ?? ESTADOS.pendiente;
    const colors = COLOR_CLASSES[cfg.color];
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${colors.badge}`}
        >
            {cfg.label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TiempoVivo — se actualiza cada 10s
// ─────────────────────────────────────────────────────────────────────────────

function TiempoVivo({ fecha, estado }) {
    const [label, setLabel] = useState(tiempoTranscurrido(fecha));
    const critico = esCritico(fecha, estado);

    useEffect(() => {
        const t = setInterval(() => setLabel(tiempoTranscurrido(fecha)), 10000);
        return () => clearInterval(t);
    }, [fecha]);

    return (
        <span
            className={`text-xs font-semibold ${critico ? "text-rose-600 animate-pulse" : "text-slate-400"}`}
        >
            ⏱ {label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// LineaIngrediente
// ─────────────────────────────────────────────────────────────────────────────

function LineaIngrediente({ ing }) {
    const esExtra = ing.tipo === "extra";
    const nombre = ing.ingrediente?.nombre ?? `Ing. #${ing.ingrediente_id}`;
    const cantidad = ing.cantidad > 1 ? ` ×${ing.cantidad}` : "";

    return (
        <div
            className={`flex items-center gap-1.5 text-[11px] py-0.5 ${esExtra ? "text-emerald-700" : "text-rose-600 line-through opacity-70"}`}
        >
            <span className="font-bold w-3">{esExtra ? "+" : "−"}</span>
            <span>
                {nombre}
                {cantidad}
            </span>
            {ing.mitad && (
                <span
                    className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold ${ing.mitad === "A" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                >
                    ½{ing.mitad}
                </span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TarjetaPedido
// ─────────────────────────────────────────────────────────────────────────────

function TarjetaPedido({ pedido, onCambiarEstado, cargando }) {
    const cfg = ESTADOS[pedido.estado] ?? ESTADOS.pendiente;
    const colors = COLOR_CLASSES[cfg.color];
    const siguiente = cfg.siguiente;
    const siguienteCfg = siguiente ? ESTADOS[siguiente] : null;
    const critico = esCritico(pedido.created_at, pedido.estado);

    return (
        <div
            className={`bg-white rounded-2xl border shadow-sm mb-3 overflow-hidden transition-all duration-200 ${critico ? "border-rose-400 shadow-rose-100 shadow-md" : "border-slate-200"}`}
        >
            {/* Barra de color superior */}
            <div className={`h-1 w-full ${colors.dot}`} />

            <div className="p-3.5">
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-800 tracking-wide">
                                {pedido.codigo}
                            </span>
                            <EstadoBadge estado={pedido.estado} />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                            {pedido.cliente_nombre} · {pedido.cliente_telefono}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <TiempoVivo
                            fecha={pedido.created_at}
                            estado={pedido.estado}
                        />
                        <div className="text-[10px] text-slate-400 mt-0.5">
                            {labelPago(pedido.metodo_pago)}
                        </div>
                    </div>
                </div>

                {/* Dirección */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-2">
                    <i className="mgc_location_line text-slate-400" />
                    <span className="truncate">
                        {pedido.direccion}, {pedido.codigo_postal}
                    </span>
                </div>

                {/* Items */}
                <div className="space-y-0 mb-2">
                    {(pedido.items ?? []).map((item) => (
                        <div
                            key={item.id}
                            className="py-1.5 border-b border-slate-50 last:border-0"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-700">
                                        {item.cantidad}×
                                    </span>
                                    <span className="text-xs text-slate-800">
                                        {item.nombre}
                                    </span>
                                    {item.tamano && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                            {item.tamano}
                                        </span>
                                    )}
                                    {item.nombre?.includes(" / ") && (
                                        <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold">
                                            ½+½
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                                    {Number(item.subtotal).toFixed(2)}€
                                </span>
                            </div>
                            {(item.ingredientes ?? []).length > 0 && (
                                <div className="pl-4 mt-0.5">
                                    {item.ingredientes.map((ing, i) => (
                                        <LineaIngrediente
                                            key={`${ing.ingrediente_id}-${ing.tipo}-${ing.mitad ?? "x"}-${i}`}
                                            ing={ing}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Observaciones */}
                {pedido.observaciones && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg px-2.5 py-1.5 mb-2">
                        ⚠️ {pedido.observaciones}
                    </div>
                )}

                {/* Total + acciones */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                    <div>
                        {Number(pedido.gastos_envio) > 0 && (
                            <div className="text-[10px] text-slate-400">
                                {Number(pedido.subtotal).toFixed(2)}€ +{" "}
                                {Number(pedido.gastos_envio).toFixed(2)}€ envío
                            </div>
                        )}
                        <div className="text-base font-bold text-slate-900">
                            {Number(pedido.total).toFixed(2)}€
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Imprimir */}
                        <button
                            onClick={() => imprimirComanda(pedido)}
                            title="Imprimir comanda"
                            className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition text-sm"
                        >
                            <i className="mgc_print_line" />
                        </button>

                        {/* Cancelar */}
                        {!["entregado", "cancelado", "en_camino"].includes(
                            pedido.estado,
                        ) && (
                            <button
                                onClick={() =>
                                    onCambiarEstado(pedido.id, "cancelado")
                                }
                                disabled={cargando}
                                className="h-8 px-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-semibold hover:bg-rose-100 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        )}

                        {/* Avanzar */}
                        {siguiente && (
                            <button
                                onClick={() =>
                                    onCambiarEstado(pedido.id, siguiente)
                                }
                                disabled={cargando}
                                className={`h-8 px-3 rounded-xl text-white text-[11px] font-bold transition disabled:opacity-50 ${COLOR_CLASSES[siguienteCfg.color]?.btn ?? "bg-slate-500"}`}
                            >
                                {cargando ? "…" : `${siguienteCfg.label} →`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Columna kanban
// ─────────────────────────────────────────────────────────────────────────────

function Columna({ estado, pedidos, onCambiarEstado, cargandoId }) {
    const cfg = ESTADOS[estado];
    const colors = COLOR_CLASSES[cfg.color];

    return (
        <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
            {/* Header */}
            <div
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl border-b-2 ${colors.colBg} ${colors.colBorder}`}
            >
                <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                <span
                    className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}
                >
                    {cfg.label}
                </span>
                <span
                    className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${colors.dot}`}
                >
                    {pedidos.length}
                </span>
            </div>

            {/* Tarjetas */}
            <div
                className={`flex-1 overflow-y-auto p-2.5 rounded-b-xl min-h-[200px] ${colors.colBg} border border-t-0 ${colors.colBorder}`}
            >
                {pedidos.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-xs text-slate-300 font-medium">
                        Sin pedidos
                    </div>
                ) : (
                    pedidos.map((p) => (
                        <TarjetaPedido
                            key={p.id}
                            pedido={p}
                            onCambiarEstado={onCambiarEstado}
                            cargando={cargandoId === p.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CocinaIndex — componente raíz
// ─────────────────────────────────────────────────────────────────────────────

export default function CocinaIndex() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cargandoId, setCargandoId] = useState(null);
    const [ultimaVez, setUltimaVez] = useState(null);
    const pollingRef = useRef(null);
    // Fix #2: evitar peticiones solapadas si una tarda más de 15s
    const cargandoRef = useRef(false);

    // ── Cargar pedidos ─────────────────────────────────────────────────────
    const cargarPedidos = useCallback(async (silencioso = false) => {
        if (cargandoRef.current) return; // ya hay una petición en curso
        cargandoRef.current = true;
        if (!silencioso) setLoading(true);
        try {
            const res = await axios.get("/api/admin/pedidos");
            setPedidos(res.data);
            setUltimaVez(new Date());
        } catch {
            toast.error("No se pudieron cargar los pedidos");
        } finally {
            setLoading(false);
            cargandoRef.current = false;
        }
    }, []);

    // Carga inicial + polling cada 15s
    useEffect(() => {
        cargarPedidos();
        pollingRef.current = setInterval(() => cargarPedidos(true), 15000);
        return () => clearInterval(pollingRef.current);
    }, [cargarPedidos]);

    // ── Cambiar estado ─────────────────────────────────────────────────────
    const cambiarEstado = useCallback(async (pedidoId, nuevoEstado) => {
        setCargandoId(pedidoId);
        try {
            const res = await axios.patch(
                `/api/admin/pedidos/${pedidoId}/estado`,
                {
                    estado: nuevoEstado,
                },
            );
            const actualizado = res.data.pedido;
            setPedidos((prev) =>
                prev.map((p) => (p.id === pedidoId ? actualizado : p)),
            );
            toast.success(`Pedido → ${ESTADOS[nuevoEstado]?.label}`);
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "Error al actualizar estado",
            );
        } finally {
            setCargandoId(null);
        }
    }, []);

    // ── Agrupar por columna ────────────────────────────────────────────────
    const porEstado = COLUMNAS.reduce((acc, estado) => {
        acc[estado] = pedidos
            .filter((p) => p.estado === estado)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return acc;
    }, {});

    // Usa COLUMNAS como fuente de verdad — coherente con el tablero
    const totalActivos = pedidos.filter((p) =>
        COLUMNAS.includes(p.estado),
    ).length;

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="p-6">
            {/* HEADER — mismo patrón que ArticulosIndex */}
            <div className="relative mb-6 rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 p-[1px] shadow-[0_10px_50px_rgba(0,0,0,0.15)]">
                <div className="rounded-3xl bg-white px-7 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 text-white flex items-center justify-center text-2xl shadow-lg">
                            🍕
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Panel Cocina
                            </h1>
                            <p className="text-sm text-gray-500">
                                {totalActivos > 0
                                    ? `${totalActivos} pedido${totalActivos > 1 ? "s" : ""} activo${totalActivos > 1 ? "s" : ""}`
                                    : "Sin pedidos activos ahora mismo"}
                                {ultimaVez && (
                                    <span className="ml-2 text-gray-400">
                                        · actualizado{" "}
                                        {ultimaVez.toLocaleTimeString("es-ES")}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => cargarPedidos()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <i className="mgc_refresh_2_line text-lg" />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* TABLERO */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                    Cargando pedidos…
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 items-start">
                    {COLUMNAS.map((estado) => (
                        <Columna
                            key={estado}
                            estado={estado}
                            pedidos={porEstado[estado]}
                            onCambiarEstado={cambiarEstado}
                            cargandoId={cargandoId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
