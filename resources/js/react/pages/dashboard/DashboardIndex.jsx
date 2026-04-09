import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const eur = (n) => Number(n || 0).toFixed(2) + " \u20AC";

const COLORES_ESTADO = {
    pendiente: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "mgc_time_line", label: "Pendientes" },
    aceptado: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "mgc_check_line", label: "Aceptados" },
    en_preparacion: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "mgc_fire_line", label: "Preparando" },
    listo: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "mgc_check_circle_line", label: "Listos" },
    en_camino: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: "mgc_riding_line", label: "En camino" },
    entregado: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: "mgc_check_2_line", label: "Entregados" },
    cancelado: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "mgc_close_circle_line", label: "Cancelados" },
};

const COLORES_GRAFICO = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#64748b"];

function KPI({ titulo, valor, sub, icono, gradiente }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${gradiente} flex items-center justify-center text-2xl text-white shadow-lg flex-shrink-0`}>
                {icono}
            </div>
            <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{titulo}</div>
                <div className="text-2xl font-bold text-slate-900">{valor}</div>
                {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

function EstadoCard({ estado, count }) {
    const cfg = COLORES_ESTADO[estado];
    if (!cfg) return null;
    return (
        <div className={`flex items-center gap-3 rounded-2xl border ${cfg.border} ${cfg.bg} px-4 py-3`}>
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center text-xl`}>
                <i className={cfg.icon} />
            </div>
            <div>
                <div className={`text-lg font-bold ${cfg.text}`}>{count}</div>
                <div className="text-xs text-slate-500">{cfg.label}</div>
            </div>
        </div>
    );
}

export default function DashboardIndex() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/admin/dashboard")
            .then(({ data }) => setData(data))
            .catch(() => toast.error("Error cargando dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center py-24 text-slate-400 text-sm">
                Cargando dashboard...
            </div>
        );
    }

    if (!data) return null;

    const { hoy, mes, ventas_semana, top_productos } = data;

    // Datos para pie chart de tipo entrega
    const dataPie = [
        { name: "Domicilio", value: hoy.domicilio },
        { name: "Recogida", value: hoy.recogida },
    ].filter((d) => d.value > 0);

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-[1px] shadow-[0_10px_50px_rgba(0,0,0,0.15)]">
                <div className="rounded-3xl bg-white px-7 py-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl shadow-lg">
                        <i className="mgc_home_3_line" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Resumen del negocio · {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KPI
                    titulo="Ventas hoy"
                    valor={eur(hoy.ventas)}
                    sub={`${hoy.entregados} pedido${hoy.entregados !== 1 ? "s" : ""} entregado${hoy.entregados !== 1 ? "s" : ""}`}
                    icono={<i className="mgc_currency_euro_line" />}
                    gradiente="bg-gradient-to-br from-emerald-400 to-teal-500"
                />
                <KPI
                    titulo="Pedidos hoy"
                    valor={hoy.total_pedidos}
                    sub={`${hoy.domicilio} domicilio · ${hoy.recogida} recogida`}
                    icono={<i className="mgc_file_line" />}
                    gradiente="bg-gradient-to-br from-violet-400 to-purple-500"
                />
                <KPI
                    titulo="Ticket medio hoy"
                    valor={eur(hoy.ticket_medio)}
                    sub="Por pedido entregado"
                    icono={<i className="mgc_shopping_cart_1_line" />}
                    gradiente="bg-gradient-to-br from-orange-400 to-rose-500"
                />
                <KPI
                    titulo="Ventas del mes"
                    valor={eur(mes.ventas)}
                    sub={`${mes.pedidos} pedidos · ticket medio ${eur(mes.ticket_medio)}`}
                    icono={<i className="mgc_chart_bar_line" />}
                    gradiente="bg-gradient-to-br from-blue-400 to-indigo-500"
                />
            </div>

            {/* ESTADOS HOY */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
                {Object.entries(hoy.por_estado).map(([estado, count]) => (
                    <EstadoCard key={estado} estado={estado} count={count} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* GRÁFICO VENTAS SEMANA */}
                <div className="lg:col-span-2 rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Ventas ultimos 7 dias</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={ventas_semana}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === "ventas" ? eur(value) : value,
                                    name === "ventas" ? "Ventas" : "Pedidos",
                                ]}
                                labelFormatter={(label) => `Dia: ${label}`}
                            />
                            <Bar dataKey="ventas" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="ventas" />
                            <Bar dataKey="pedidos" fill="#c4b5fd" radius={[8, 8, 0, 0]} name="pedidos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* PIE CHART TIPO ENTREGA */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Tipo de entrega hoy</h2>
                    {dataPie.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={dataPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#f59e0b" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
                            Sin pedidos hoy
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TOP PRODUCTOS */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                        <h2 className="text-sm font-semibold text-gray-700">Productos mas vendidos del mes</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {top_productos.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-400 text-sm">Sin datos este mes</div>
                        ) : (
                            top_productos.map((p, i) => (
                                <div key={p.nombre} className="flex items-center justify-between px-6 py-3 hover:bg-violet-50/30 transition">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: COLORES_GRAFICO[i % COLORES_GRAFICO.length] }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">{p.nombre}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-800">{p.total_vendido} uds</div>
                                        <div className="text-xs text-slate-400">{eur(p.total_ingresos)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* MÉTODOS DE PAGO HOY */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                        <h2 className="text-sm font-semibold text-gray-700">Metodos de pago hoy (entregados)</h2>
                    </div>
                    <div className="p-6">
                        {Object.keys(hoy.por_metodo_pago).length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">Sin pedidos entregados hoy</div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(hoy.por_metodo_pago).map(([metodo, datos]) => {
                                    const porcentaje = hoy.entregados > 0 ? Math.round((datos.count / hoy.entregados) * 100) : 0;
                                    return (
                                        <div key={metodo}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-gray-700 capitalize">{metodo}</span>
                                                <span className="text-sm text-slate-500">
                                                    {datos.count} pedido{datos.count !== 1 ? "s" : ""} · {eur(datos.total)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div
                                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2.5 rounded-full transition-all"
                                                    style={{ width: `${porcentaje}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
