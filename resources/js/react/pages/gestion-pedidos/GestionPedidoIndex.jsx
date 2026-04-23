import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { imprimirTicketQZ } from "@/react/lib/qzPrinter";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const ESTADOS = {
    pendiente: {
        label: "Pendiente",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
    },
    aceptado: {
        label: "Aceptado",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
    },
    en_preparacion: {
        label: "Preparando",
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
    },
    listo: {
        label: "Listo",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
    },
    en_camino: {
        label: "En camino",
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200",
    },
    entregado: {
        label: "Entregado",
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
    },
    cancelado: {
        label: "Cancelado",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
    },
};

const HOY = new Date().toISOString().slice(0, 10);
const eur = (n) => Number(n || 0).toFixed(2) + " €";

// ─────────────────────────────────────────────────────────────────────────────
// EstadoBadge
// ─────────────────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
    const cfg = ESTADOS[estado] ?? ESTADOS.cancelado;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
            {cfg.label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta estadística
// ─────────────────────────────────────────────────────────────────────────────

function TarjetaStat({ titulo, valor, sub, icono, gradiente }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
            <div
                className={`w-12 h-12 rounded-2xl ${gradiente} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
            >
                {icono}
            </div>
            <div>
                <div className="text-xs text-slate-500 font-medium">
                    {titulo}
                </div>
                <div className="text-xl font-bold text-slate-900">{valor}</div>
                {sub && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal base
// ─────────────────────────────────────────────────────────────────────────────

function Modal({ titulo, onClose, children, footer }) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold tracking-tight">
                            {titulo}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        >
                            <i className="mgc_close_line text-xl" />
                        </button>
                    </div>
                </div>
                {/* Body */}
                <div className="px-6 py-5 space-y-4">{children}</div>
                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    {footer}
                </div>
            </div>
        </div>,
        document.body,
    );
}

function BtnGuardar({ loading, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-95 transition shadow-lg shadow-violet-500/30 disabled:opacity-50"
        >
            {loading ? "Guardando…" : "Guardar"}
        </button>
    );
}

function BtnCancelar({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="h-11 px-5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition"
        >
            Cancelar
        </button>
    );
}

function FormLabel({ children }) {
    return (
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </label>
    );
}

function FormInput({ value, onChange, name, placeholder, type = "text" }) {
    return (
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
        />
    );
}

function FormSelect({ value, onChange, name, children }) {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
        >
            {children}
        </select>
    );
}

function FormTextarea({ value, onChange, name, placeholder, rows = 3 }) {
    return (
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 resize-none"
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: cambiar estado
// ─────────────────────────────────────────────────────────────────────────────

function ModalEstado({ pedido, onClose, onSaved }) {
    const [estado, setEstado] = useState(pedido.estado);
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(false);

    const guardar = async () => {
        setLoading(true);
        try {
            const res = await axios.patch(
                `/api/admin/gestion/pedidos/${pedido.id}/estado`,
                {
                    estado,
                    motivo: estado === "cancelado" ? motivo : undefined,
                },
            );
            toast.success("Estado actualizado");
            onSaved(res.data.pedido);
            onClose();
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "Error al cambiar estado",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            titulo={`Cambiar estado — ${pedido.codigo}`}
            onClose={onClose}
            footer={
                <>
                    <BtnCancelar onClick={onClose} />
                    <BtnGuardar loading={loading} onClick={guardar} />
                </>
            }
        >
            <div>
                <FormLabel>Nuevo estado</FormLabel>
                <FormSelect
                    name="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                >
                    {Object.entries(ESTADOS).map(([val, { label }]) => (
                        <option key={val} value={val}>
                            {label}
                        </option>
                    ))}
                </FormSelect>
            </div>
            {estado === "cancelado" && (
                <div>
                    <FormLabel>Motivo de cancelación</FormLabel>
                    <FormTextarea
                        name="motivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Cliente no contestó, fuera de zona…"
                    />
                </div>
            )}
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: editar datos del cliente
// ─────────────────────────────────────────────────────────────────────────────

function ModalEditar({ pedido, onClose, onSaved }) {
    const [form, setForm] = useState({
        cliente_nombre: pedido.cliente_nombre ?? "",
        cliente_telefono: pedido.cliente_telefono ?? "",
        direccion: pedido.direccion ?? "",
        observaciones: pedido.observaciones ?? "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const guardar = async () => {
        setLoading(true);
        try {
            const res = await axios.patch(
                `/api/admin/gestion/pedidos/${pedido.id}/observaciones`,
                form,
            );
            toast.success("Pedido actualizado");
            onSaved(res.data.pedido);
            onClose();
        } catch {
            toast.error("Error al actualizar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            titulo={`Editar pedido — ${pedido.codigo}`}
            onClose={onClose}
            footer={
                <>
                    <BtnCancelar onClick={onClose} />
                    <BtnGuardar loading={loading} onClick={guardar} />
                </>
            }
        >
            {[
                { label: "Nombre cliente", name: "cliente_nombre" },
                { label: "Teléfono", name: "cliente_telefono" },
                { label: "Dirección", name: "direccion" },
            ].map(({ label, name }) => (
                <div key={name}>
                    <FormLabel>{label}</FormLabel>
                    <FormInput
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                    />
                </div>
            ))}
            <div>
                <FormLabel>Observaciones</FormLabel>
                <FormTextarea
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                />
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: confirmar eliminación
// ─────────────────────────────────────────────────────────────────────────────

function ModalEliminar({ pedido, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const eliminar = async () => {
        setLoading(true);
        try {
            await axios.delete(`/api/admin/gestion/pedidos/${pedido.id}`);
            toast.success(`Pedido ${pedido.codigo} eliminado`);
            onDeleted(pedido.id);
            onClose();
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "No se pudo eliminar el pedido",
            );
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                            ⚠️
                        </div>
                        <div>
                            <h3 className="font-semibold">Eliminar pedido</h3>
                            <p className="text-white/80 text-xs">
                                Esta acción no se puede deshacer
                            </p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-3 text-sm text-slate-600">
                    <p>
                        ¿Seguro que quieres eliminar el pedido{" "}
                        <strong className="font-mono text-slate-800">
                            {pedido.codigo}
                        </strong>
                        ?
                    </p>
                    <p className="text-xs text-slate-500">
                        Se borrará el pedido, sus artículos e ingredientes. Los
                        clientes con el código guardado ya no podrán hacer
                        tracking.
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <BtnCancelar onClick={onClose} />
                    <button
                        onClick={eliminar}
                        disabled={loading}
                        className="h-11 px-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:opacity-95 transition shadow-lg shadow-rose-500/30 disabled:opacity-50"
                    >
                        {loading ? "Eliminando…" : "Eliminar pedido"}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fila de pedido expandible
// ─────────────────────────────────────────────────────────────────────────────

function FilaPedido({ pedido, onActualizar, onEliminado }) {
    const [expandido, setExpandido] = useState(false);
    const [modal, setModal] = useState(null);
    const [imprimiendo, setImprimiendo] = useState(false);

    const handleImprimir = async (e) => {
        e.stopPropagation();
        setImprimiendo(true);
        try {
            // Cargar el pedido completo con items e ingredientes
            const { data } = await axios.get(
                `/api/admin/gestion/pedidos/${pedido.id}`,
            );
            const pedidoCompleto = data.pedido ?? data;
            const impreso = await imprimirTicketQZ(pedidoCompleto);
            if (impreso) {
                toast.success("Ticket enviado a impresora");
            } else {
                toast.error(
                    "No se pudo imprimir. Verifica que QZ Tray esté abierto.",
                );
            }
        } catch {
            toast.error("Error al cargar el pedido para imprimir");
        } finally {
            setImprimiendo(false);
        }
    };

    return (
        <>
            <tr
                onClick={() => setExpandido((v) => !v)}
                className={`cursor-pointer transition-colors hover:bg-violet-50/50 ${expandido ? "bg-violet-50/30" : ""}`}
            >
                <td className="px-4 py-3">
                    <span className="font-mono font-bold text-xs text-slate-800 tracking-wider">
                        {pedido.codigo}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                    {pedido.cliente_nombre}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                    {pedido.cliente_telefono}
                </td>
                <td className="px-4 py-3">
                    {pedido.tipo_entrega === "recogida" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                            ⭐ Recogida
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-cyan-50 text-cyan-700 border-cyan-200">
                            🛵 Domicilio
                        </span>
                    )}
                </td>
                <td className="px-4 py-3">
                    <EstadoBadge estado={pedido.estado} />
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
                    {eur(pedido.total)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(pedido.created_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                        {[
                            {
                                key: "estado",
                                icon: "mgc_transfer_line",
                                title: "Cambiar estado",
                            },
                            {
                                key: "editar",
                                icon: "mgc_edit_line",
                                title: "Editar datos",
                            },
                        ].map(({ key, icon, title }) => (
                            <button
                                key={key}
                                title={title}
                                onClick={() => setModal(key)}
                                className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition text-sm"
                            >
                                <i className={icon} />
                            </button>
                        ))}

                        {/* Imprimir */}
                        <button
                            title="Imprimir ticket"
                            onClick={handleImprimir}
                            disabled={imprimiendo}
                            className="h-8 w-8 flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition text-sm disabled:opacity-50"
                        >
                            <i className="mgc_print_line" />
                        </button>

                        {/* Eliminar */}
                        <button
                            title="Eliminar pedido"
                            onClick={() => setModal("eliminar")}
                            className="h-8 w-8 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition text-sm"
                        >
                            <i className="mgc_delete_2_line" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Fila expandida */}
            {expandido && (
                <tr className="bg-slate-50">
                    <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Cliente */}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                                    Cliente
                                </div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {pedido.cliente_nombre}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {pedido.cliente_telefono}
                                </div>
                                {pedido.direccion && (
                                    <div className="text-xs text-slate-400 mt-0.5">
                                        {pedido.direccion},{" "}
                                        {pedido.codigo_postal}
                                    </div>
                                )}
                            </div>

                            {/* Productos */}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                                    Productos
                                </div>
                                {(pedido.items ?? []).map((item) => (
                                    <div key={item.id} className="text-sm mb-1">
                                        <span className="font-bold text-slate-700">
                                            {item.cantidad}×
                                        </span>{" "}
                                        <span className="text-slate-800">
                                            {item.nombre}
                                        </span>
                                        {item.tamano && (
                                            <span className="text-xs text-slate-400 ms-1">
                                                ({item.tamano})
                                            </span>
                                        )}
                                        <span className="float-right text-xs text-slate-400">
                                            {eur(item.subtotal)}
                                        </span>
                                        {(item.ingredientes ?? []).length >
                                            0 && (
                                            <div className="pl-3 mt-0.5">
                                                {item.ingredientes.map(
                                                    (ing, i) => (
                                                        <span
                                                            key={i}
                                                            className={`me-2 text-[11px] ${ing.tipo === "extra" ? "text-emerald-600" : "text-rose-500 line-through"}`}
                                                        >
                                                            {ing.tipo ===
                                                            "extra"
                                                                ? "+"
                                                                : "−"}
                                                            {ing.ingrediente
                                                                ?.nombre ??
                                                                `#${ing.ingrediente_id}`}
                                                            {ing.mitad
                                                                ? ` [½${ing.mitad}]`
                                                                : ""}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Totales */}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                                    Totales
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{eur(pedido.subtotal)}</span>
                                </div>
                                {Number(pedido.gastos_envio) > 0 && (
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Envío</span>
                                        <span>{eur(pedido.gastos_envio)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1">
                                    <span>Total</span>
                                    <span>{eur(pedido.total)}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1 capitalize">
                                    {pedido.metodo_pago}
                                </div>
                                {pedido.observaciones && (
                                    <div className="mt-2 text-xs text-amber-800 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg px-2 py-1.5">
                                        ⚠️ {pedido.observaciones}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}

            {modal === "estado" && (
                <ModalEstado
                    pedido={pedido}
                    onClose={() => setModal(null)}
                    onSaved={onActualizar}
                />
            )}
            {modal === "editar" && (
                <ModalEditar
                    pedido={pedido}
                    onClose={() => setModal(null)}
                    onSaved={onActualizar}
                />
            )}
            {modal === "eliminar" && (
                <ModalEliminar
                    pedido={pedido}
                    onClose={() => setModal(null)}
                    onDeleted={onEliminado}
                />
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente raíz
// ─────────────────────────────────────────────────────────────────────────────

export default function GestionPedidosIndex() {
    const [pedidos, setPedidos] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [pagina, setPagina] = useState(1);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filtros, setFiltros] = useState({
        fecha_desde: HOY,
        fecha_hasta: "",
        estado: "",
        tipo_entrega: "",
        search: "",
    });

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                ...Object.fromEntries(
                    Object.entries(filtros).filter(([, v]) => v !== ""),
                ),
                page: pagina,
            };
            // Fix: resumen usa el mismo rango que la tabla — coherencia garantizada
            const resumenParams = {
                fecha_desde: filtros.fecha_desde || HOY,
                ...(filtros.fecha_hasta
                    ? { fecha_hasta: filtros.fecha_hasta }
                    : {}),
            };
            const [pedidosRes, resumenRes] = await Promise.all([
                axios.get("/api/admin/gestion/pedidos", { params }),
                axios.get("/api/admin/gestion/resumen", {
                    params: resumenParams,
                }),
            ]);
            // paginate() devuelve { data, current_page, last_page, total, ... }
            setPedidos(pedidosRes.data.data);
            setMeta({
                current_page: pedidosRes.data.current_page,
                last_page: pedidosRes.data.last_page,
                total: pedidosRes.data.total,
            });
            setResumen(resumenRes.data);
        } catch {
            toast.error("No se pudieron cargar los datos");
        } finally {
            setLoading(false);
        }
    }, [filtros, pagina]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const onActualizar = (actualizado) => {
        setPedidos((prev) =>
            prev.map((p) => (p.id === actualizado.id ? actualizado : p)),
        );
        refrescarResumen();
    };

    const onEliminado = (id) => {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
        setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
        refrescarResumen();
    };

    const refrescarResumen = () => {
        const resumenParams = {
            fecha_desde: filtros.fecha_desde || HOY,
            ...(filtros.fecha_hasta
                ? { fecha_hasta: filtros.fecha_hasta }
                : {}),
        };
        axios
            .get("/api/admin/gestion/resumen", { params: resumenParams })
            .then(({ data }) => setResumen(data))
            .catch(() => {});
    };

    const handleFiltro = (e) => {
        setPagina(1); // resetear a página 1 al cambiar cualquier filtro
        setFiltros((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-6">
            {/* ── HEADER ────────────────────────────────────────────────────── */}
            <div className="relative mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-[1px] shadow-[0_10px_50px_rgba(0,0,0,0.15)]">
                <div className="rounded-3xl bg-white px-7 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl shadow-lg">
                            <i className="mgc_file_line" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Informes de pedidos
                            </h1>
                            <p className="text-sm text-gray-500">
                                Gestión completa · acceso total de estados
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={cargar}
                        disabled={loading}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <i className="mgc_refresh_2_line text-lg" />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* ── RESUMEN ────────────────────────────────────────────────────── */}
            {resumen && (
                <>
                    {/* Fila 1: métricas económicas */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <TarjetaStat
                            titulo="Ventas del rango"
                            valor={eur(resumen.total_ventas)}
                            sub={`${resumen.n_entregados} entregado${resumen.n_entregados !== 1 ? "s" : ""} · ticket medio ${eur(resumen.ticket_medio)}`}
                            icono="💶"
                            gradiente="bg-gradient-to-br from-emerald-400 to-teal-500"
                        />
                        <TarjetaStat
                            titulo="Gastos de envío"
                            valor={eur(resumen.total_gastos_envio)}
                            sub="Solo pedidos entregados"
                            icono="🛵"
                            gradiente="bg-gradient-to-br from-blue-400 to-indigo-500"
                        />
                        <TarjetaStat
                            titulo="Total pedidos"
                            valor={resumen.total_pedidos}
                            sub={`${resumen.n_entregados} entregados · ${resumen.cancelados} cancelados · ${resumen.activos} activos`}
                            icono="📋"
                            gradiente="bg-gradient-to-br from-violet-400 to-purple-500"
                        />
                        <TarjetaStat
                            titulo="Tipo de entrega"
                            valor={`${resumen.domicilio} / ${resumen.recogida}`}
                            sub={`${resumen.domicilio} domicilio · ${resumen.recogida} recogida`}
                            icono="📍"
                            gradiente="bg-gradient-to-br from-orange-400 to-rose-500"
                        />
                    </div>

                    {/* Fila 2: métodos de pago */}
                    {resumen.por_metodo_pago &&
                        Object.keys(resumen.por_metodo_pago).length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 mb-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                                    Métodos de pago — pedidos entregados
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(
                                        resumen.por_metodo_pago,
                                    ).map(([metodo, datos]) => (
                                        <div
                                            key={metodo}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="text-sm font-semibold text-slate-700 capitalize">
                                                {metodo}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {datos.count} pedido
                                                {datos.count !== 1 ? "s" : ""}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">
                                                {eur(datos.total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </>
            )}

            {/* ── FILTROS ────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                    {[
                        { label: "Desde", name: "fecha_desde", type: "date" },
                        { label: "Hasta", name: "fecha_hasta", type: "date" },
                    ].map(({ label, name, type }) => (
                        <div key={name}>
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                                {label}
                            </div>
                            <input
                                type={type}
                                name={name}
                                value={filtros[name]}
                                onChange={handleFiltro}
                                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                            />
                        </div>
                    ))}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                            Estado
                        </div>
                        <select
                            name="estado"
                            value={filtros.estado}
                            onChange={handleFiltro}
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                        >
                            <option value="">Todos</option>
                            {Object.entries(ESTADOS).map(([val, { label }]) => (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                            Entrega
                        </div>
                        <select
                            name="tipo_entrega"
                            value={filtros.tipo_entrega}
                            onChange={handleFiltro}
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                        >
                            <option value="">Todas</option>
                            <option value="domicilio">Domicilio</option>
                            <option value="recogida">Recogida</option>
                        </select>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                            Buscar
                        </div>
                        <input
                            type="text"
                            name="search"
                            value={filtros.search}
                            onChange={handleFiltro}
                            placeholder="Código, nombre…"
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1 invisible">
                            ‎
                        </div>
                        <button
                            onClick={() =>
                                setFiltros({
                                    fecha_desde: HOY,
                                    fecha_hasta: "",
                                    estado: "",
                                    tipo_entrega: "",
                                    search: "",
                                })
                            }
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TABLA ──────────────────────────────────────────────────────── */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Cabecera tabla */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
                    <div>
                        <span className="text-sm font-semibold text-slate-700">
                            Listado de pedidos
                        </span>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            {meta.total} resultado{meta.total !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <span className="text-xs text-slate-400">
                        Página {meta.current_page} de {meta.last_page}
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                        Cargando…
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                        No hay pedidos con esos filtros
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm text-slate-700">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Teléfono</th>
                                    <th className="px-4 py-3">Entrega</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">
                                        Total
                                    </th>
                                    <th className="px-4 py-3">Hora</th>
                                    <th className="px-4 py-3 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pedidos.map((p) => (
                                    <FilaPedido
                                        key={p.id}
                                        pedido={p}
                                        onActualizar={onActualizar}
                                        onEliminado={onEliminado}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── PAGINACIÓN ─────────────────────────────────────────────────── */}
            {meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400">
                        Mostrando página {meta.current_page} de {meta.last_page}{" "}
                        · {meta.total} pedidos en total
                    </span>
                    <div className="flex items-center gap-1">
                        {/* Anterior */}
                        <button
                            onClick={() => setPagina((p) => p - 1)}
                            disabled={meta.current_page === 1 || loading}
                            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ← Anterior
                        </button>

                        {/* Números de página */}
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                            .filter((n) => {
                                // Mostrar: primera, última, actual y ±2 alrededor de la actual
                                return (
                                    n === 1 ||
                                    n === meta.last_page ||
                                    Math.abs(n - meta.current_page) <= 2
                                );
                            })
                            .reduce((acc, n, idx, arr) => {
                                // Insertar "…" cuando hay salto
                                if (idx > 0 && n - arr[idx - 1] > 1) {
                                    acc.push("…");
                                }
                                acc.push(n);
                                return acc;
                            }, [])
                            .map((n, idx) =>
                                n === "…" ? (
                                    <span
                                        key={`dots-${idx}`}
                                        className="h-9 px-2 flex items-center text-slate-400 text-sm"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={n}
                                        onClick={() => setPagina(n)}
                                        disabled={loading}
                                        className={`h-9 w-9 rounded-xl border text-sm font-medium transition disabled:opacity-50 ${
                                            n === meta.current_page
                                                ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ),
                            )}

                        {/* Siguiente */}
                        <button
                            onClick={() => setPagina((p) => p + 1)}
                            disabled={
                                meta.current_page === meta.last_page || loading
                            }
                            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
