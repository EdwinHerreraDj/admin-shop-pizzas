import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { imprimirTicketQZ, conectarQZ } from "@/react/lib/qzPrinter";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const ESTADOS = {
    pendiente: { label: "Pendiente", color: "amber", siguiente: "aceptado" },
    aceptado: { label: "Aceptado", color: "blue", siguiente: "en_camino" },
    en_camino: { label: "En camino", color: "cyan", siguiente: "entregado" },
    entregado: { label: "Entregado", color: "slate", siguiente: null },
    cancelado: { label: "Cancelado", color: "rose", siguiente: null },
};

// Panel de cocina: 3 columnas visibles (timeline por pedido).
// Cada pedido ocupa su propia fila horizontal y se desplaza entre celdas.
const COLUMNAS = ["pendiente", "aceptado", "en_camino"];

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
    if (estado === "aceptado") return minutos > 20;
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Impresión de comanda (ventana del navegador)
// ─────────────────────────────────────────────────────────────────────────────

async function imprimirComanda(pedido) {
    const impreso = await imprimirTicketQZ(pedido);
    if (impreso) {
        toast.success("Ticket enviado a impresora");
    } else {
        toast.error("No se pudo imprimir. Verifica que QZ Tray esté abierto.");
    }
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
    const [confirmCancelar, setConfirmCancelar] = useState(false);
    const [imprimiendo, setImprimiendo] = useState(false);

    const handleImprimir = async () => {
        setImprimiendo(true);
        await imprimirComanda(pedido);
        setImprimiendo(false);
    };

    const cfg = ESTADOS[pedido.estado] ?? ESTADOS.pendiente;
    const colors = COLOR_CLASSES[cfg.color];
    const siguiente = cfg.siguiente;
    const siguienteCfg = siguiente ? ESTADOS[siguiente] : null;
    const critico = esCritico(pedido.created_at, pedido.estado);

    return (
        <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${critico ? "border-rose-400 shadow-rose-100 shadow-md" : "border-slate-200"}`}
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

                {/* Dirección o recogida en tienda */}
                {pedido.tipo_entrega === "recogida" ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-2">
                        ⭐ Recogida en tienda
                    </div>
                ) : (
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-2">
                        <i className="mgc_location_line text-slate-400 mt-0.5" />
                        <span className="break-words">
                            {pedido.direccion}
                            {pedido.bloque ? `, ${pedido.bloque}` : ""}
                            {pedido.piso ? `, ${pedido.piso}` : ""}
                            {pedido.codigo_postal ? `, ${pedido.codigo_postal}` : ""}
                        </span>
                    </div>
                )}

                {/* Hora deseada */}
                {pedido.hora_deseada && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1.5 mb-2">
                        🕐 Hora deseada: {pedido.hora_deseada}
                    </div>
                )}

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

                {/* Total */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
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
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-2">
                    {/* Imprimir */}
                    <button
                        onClick={handleImprimir}
                        disabled={imprimiendo}
                        title="Imprimir comanda"
                        className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-2xl border transition text-lg active:scale-95 ${
                            imprimiendo
                                ? "border-violet-300 bg-violet-50 text-violet-500 animate-pulse"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                        }`}
                    >
                        {imprimiendo ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <i className="mgc_print_line" />
                        )}
                    </button>

                    {/* Cancelar */}
                    {!["entregado", "cancelado", "en_camino"].includes(
                        pedido.estado,
                    ) && (
                        <button
                            onClick={() => setConfirmCancelar(true)}
                            disabled={cargando}
                            className="h-12 flex-1 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-semibold hover:bg-rose-100 transition disabled:opacity-50 active:scale-95"
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
                            className={`h-12 flex-1 rounded-2xl text-white text-sm font-bold transition disabled:opacity-50 active:scale-95 ${COLOR_CLASSES[siguienteCfg.color]?.btn ?? "bg-slate-500"}`}
                        >
                            {cargando ? "…" : `${siguienteCfg.label} →`}
                        </button>
                    )}
                </div>
            </div>

            {/* Modal confirmación cancelar */}
            {confirmCancelar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-center">
                            <div className="text-3xl mb-2">⚠️</div>
                            <h3 className="font-bold text-lg">¿Cancelar pedido?</h3>
                            <p className="text-white/80 text-sm mt-1">
                                {pedido.codigo} — {pedido.cliente_nombre}
                            </p>
                        </div>
                        <div className="px-6 py-4 text-center text-sm text-slate-600">
                            Esta acción no se puede deshacer.
                        </div>
                        <div className="px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setConfirmCancelar(false)}
                                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition active:scale-95"
                            >
                                No, volver
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmCancelar(false);
                                    onCambiarEstado(pedido.id, "cancelado");
                                }}
                                disabled={cargando}
                                className="h-12 flex-1 rounded-2xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition disabled:opacity-50 active:scale-95"
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cabecera de columna (timeline) — solo título y contador
// ─────────────────────────────────────────────────────────────────────────────

function CabeceraColumna({ estado, count }) {
    const cfg = ESTADOS[estado];
    const colors = COLOR_CLASSES[cfg.color];

    return (
        <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 ${colors.colBg} ${colors.colBorder}`}
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
                {count}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hueco vacío de timeline — celda placeholder cuando el pedido no está en ese estado
// ─────────────────────────────────────────────────────────────────────────────

function HuecoVacio() {
    return (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 min-h-[120px]" />
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
    // IDs conocidos para detectar pedidos nuevos
    const idsConocidosRef = useRef(new Set());
    const primeraCargaRef = useRef(true);
    // Configuración de sonido
    const sonidoConfigRef = useRef({ activo: true, archivo: null });
    const audioRef = useRef(null);
    // Loop de sonido mientras haya pedidos pendientes (no aceptados)
    const sonidoLoopRef = useRef(null);
    const [silenciado, setSilenciado] = useState(false);
    const silenciadoRef = useRef(false);
    useEffect(() => {
        silenciadoRef.current = silenciado;
    }, [silenciado]);

    // Cargar config de sonido al montar
    useEffect(() => {
        axios.get("/api/admin/configuracion/sonido")
            .then(({ data }) => {
                sonidoConfigRef.current = {
                    activo: data.sonido_activo,
                    archivo: data.tiene_archivo ? `/storage/${data.sonido_archivo}` : null,
                };
                // Pre-cargar audio si hay archivo personalizado
                if (sonidoConfigRef.current.archivo) {
                    audioRef.current = new Audio(sonidoConfigRef.current.archivo);
                }
            })
            .catch(() => {});
    }, []);

    // ── Sonido de notificación ───────────────────────────────────────────
    const reproducirSonido = useCallback(() => {
        if (!sonidoConfigRef.current.activo) return;
        if (silenciadoRef.current) return;

        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            } else {
                // Sonido por defecto: ding-ding
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                [0, 0.25].forEach((delay) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = 880;
                    osc.type = "sine";
                    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.2);
                });
            }
        } catch { /* navegador sin audio */ }
    }, []);

    // ── Loop de sonido: suena cada 3s mientras haya pedidos pendientes ──
    const iniciarLoopSonido = useCallback(() => {
        if (sonidoLoopRef.current) return;
        reproducirSonido();
        sonidoLoopRef.current = setInterval(() => {
            reproducirSonido();
        }, 3000);
    }, [reproducirSonido]);

    const detenerLoopSonido = useCallback(() => {
        if (sonidoLoopRef.current) {
            clearInterval(sonidoLoopRef.current);
            sonidoLoopRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    // ── Cargar pedidos ─────────────────────────────────────────────────────
    const cargarPedidos = useCallback(async (silencioso = false) => {
        if (cargandoRef.current) return;
        cargandoRef.current = true;
        if (!silencioso) setLoading(true);
        try {
            const res = await axios.get("/api/admin/pedidos");
            const nuevos = res.data;

            // Detectar pedidos nuevos (no en la primera carga)
            if (!primeraCargaRef.current) {
                const nuevosIds = nuevos.map((p) => p.id);
                const hayNuevos = nuevosIds.some((id) => !idsConocidosRef.current.has(id));
                if (hayNuevos) {
                    // Un pedido nuevo quita el silenciado: vuelve a sonar
                    silenciadoRef.current = false;
                    setSilenciado(false);
                    toast("Nuevo pedido recibido!", { icon: "🔔" });
                }
            }

            // Actualizar IDs conocidos
            idsConocidosRef.current = new Set(nuevos.map((p) => p.id));
            primeraCargaRef.current = false;

            setPedidos(nuevos);
            setUltimaVez(new Date());

            // Loop de sonido mientras haya pedidos pendientes y no este silenciado
            const hayPendientes = nuevos.some((p) => p.estado === "pendiente");
            if (hayPendientes && !silenciadoRef.current) {
                iniciarLoopSonido();
            } else {
                detenerLoopSonido();
            }
        } catch {
            toast.error("No se pudieron cargar los pedidos");
        } finally {
            setLoading(false);
            cargandoRef.current = false;
        }
    }, [iniciarLoopSonido, detenerLoopSonido]);

    // Carga inicial + polling cada 15s + conexión QZ Tray
    useEffect(() => {
        cargarPedidos();
        conectarQZ();
        pollingRef.current = setInterval(() => cargarPedidos(true), 15000);
        return () => {
            clearInterval(pollingRef.current);
            detenerLoopSonido();
        };
    }, [cargarPedidos, detenerLoopSonido]);

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
            setPedidos((prev) => {
                const siguiente =
                    nuevoEstado === "entregado" || nuevoEstado === "cancelado"
                        ? prev.filter((p) => p.id !== pedidoId)
                        : prev.map((p) => (p.id === pedidoId ? actualizado : p));
                const quedanPendientes = siguiente.some(
                    (p) => p.estado === "pendiente",
                );
                if (!quedanPendientes) {
                    detenerLoopSonido();
                }
                return siguiente;
            });
            toast.success(`Pedido → ${ESTADOS[nuevoEstado]?.label}`);
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "Error al actualizar estado",
            );
        } finally {
            setCargandoId(null);
        }
    }, [detenerLoopSonido]);

    // ── Lista ordenada (timeline por pedido) ───────────────────────────────
    // Cada pedido es su propia fila; se ordenan por fecha para que los más
    // antiguos queden arriba (FIFO).
    const pedidosActivos = pedidos
        .filter((p) => COLUMNAS.includes(p.estado))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Contador por columna (para los badges del header)
    const conteoPorEstado = COLUMNAS.reduce((acc, estado) => {
        acc[estado] = pedidosActivos.filter((p) => p.estado === estado).length;
        return acc;
    }, {});

    const totalActivos = pedidosActivos.length;

    const hayPendientes = pedidos.some((p) => p.estado === "pendiente");

    const toggleSilenciado = () => {
        setSilenciado((prev) => {
            const nuevo = !prev;
            silenciadoRef.current = nuevo;
            if (nuevo) {
                detenerLoopSonido();
            } else if (hayPendientes) {
                iniciarLoopSonido();
            }
            return nuevo;
        });
    };

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

                    <div className="flex items-center gap-2">
                        {hayPendientes && (
                            <button
                                onClick={toggleSilenciado}
                                className={`inline-flex items-center gap-2 h-10 px-5 rounded-xl border text-sm font-medium shadow-sm transition ${
                                    silenciado
                                        ? "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse"
                                }`}
                                title={
                                    silenciado
                                        ? "Reactivar sonido"
                                        : "Silenciar hasta el proximo pedido"
                                }
                            >
                                <i
                                    className={
                                        silenciado
                                            ? "mgc_volume_off_line text-lg"
                                            : "mgc_volume_line text-lg"
                                    }
                                />
                                {silenciado ? "Silenciado" : "Silenciar"}
                            </button>
                        )}
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
            </div>

            {/* TABLERO — timeline por pedido (una fila por pedido, 3 huecos) */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                    Cargando pedidos…
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Cabecera de columnas, sticky para que se vea al hacer scroll */}
                    <div className="grid grid-cols-3 gap-3 sticky top-0 z-10 bg-white/80 backdrop-blur py-2">
                        {COLUMNAS.map((estado) => (
                            <CabeceraColumna
                                key={estado}
                                estado={estado}
                                count={conteoPorEstado[estado]}
                            />
                        ))}
                    </div>

                    {/* Filas: una por pedido */}
                    {pedidosActivos.length === 0 ? (
                        <div className="flex items-center justify-center py-24 text-slate-300 text-sm font-medium">
                            Sin pedidos activos
                        </div>
                    ) : (
                        pedidosActivos.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="grid grid-cols-3 gap-3 items-start"
                            >
                                {COLUMNAS.map((estado) =>
                                    pedido.estado === estado ? (
                                        <TarjetaPedido
                                            key={estado}
                                            pedido={pedido}
                                            onCambiarEstado={cambiarEstado}
                                            cargando={cargandoId === pedido.id}
                                        />
                                    ) : (
                                        <HuecoVacio key={estado} />
                                    ),
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
