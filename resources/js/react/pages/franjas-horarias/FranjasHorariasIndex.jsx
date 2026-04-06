import React from "react";
import { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";
import FranjaHorariaModal from "./FranjaHorariaModal";
import ConfirmDeleteModal from "@/react/components/ConfirmDeleteModal";

const DIAS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

export default function FranjasHorariasIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const eliminar = async () => {
        if (!deleteItem) return;
        setDeleting(true);
        try {
            await api.delete(`/franjas-horarias/${deleteItem.id}`);
            toast.success("Franja eliminada");
            setDeleteItem(null);
            load();
        } catch {
            toast.error("Error eliminando franja");
        }
        setDeleting(false);
    };

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/franjas-horarias");
            setItems(data);
        } catch {
            toast.error("Error cargando franjas");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    // Agrupar por día
    const porDia = DIAS.map((nombre, i) => ({
        dia: i,
        nombre,
        franjas: items.filter((f) => f.dia_semana === i),
    }));

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center text-xl shadow-lg">
                            <i className="mgc_time_line"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Franjas Horarias
                            </h1>
                            <p className="text-sm text-gray-500">
                                Configura los horarios de entrega y recogida
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto">
                        <button
                            onClick={() => {
                                setEditing(null);
                                setOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-fuchsia-600/30 hover:opacity-95 transition w-full sm:w-auto"
                        >
                            <i className="mgc_add_line text-lg"></i>
                            Nueva franja
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENIDO POR DÍA */}
            {loading ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">
                    Cargando franjas...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {porDia.map(({ dia, nombre, franjas }) => (
                        <div
                            key={dia}
                            className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-5 py-3 border-b border-gray-100 bg-slate-50/70 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700">
                                    {nombre}
                                </h2>
                                <span className="text-xs text-gray-400">
                                    {franjas.length} franja
                                    {franjas.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="p-4">
                                {franjas.length === 0 ? (
                                    <div className="text-center text-gray-400 text-xs py-4">
                                        Sin franjas configuradas
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {franjas.map((f) => (
                                            <div
                                                key={f.id}
                                                className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 group hover:bg-violet-50/40 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            f.activo
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-200 text-slate-700"
                                                        }`}
                                                    >
                                                        {f.activo
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {f.hora_apertura?.slice(
                                                            0,
                                                            5,
                                                        )}{" "}
                                                        —{" "}
                                                        {f.hora_cierre?.slice(
                                                            0,
                                                            5,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => {
                                                            setEditing(f);
                                                            setOpen(true);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                                                    >
                                                        <i className="mgc_edit_2_line text-base text-gray-600"></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteItem(f)
                                                        }
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 transition"
                                                    >
                                                        <i className="mgc_delete_2_line text-base text-rose-500"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {open && (
                <FranjaHorariaModal
                    item={editing}
                    onClose={() => setOpen(false)}
                    onSaved={load}
                />
            )}

            {deleteItem && (
                <ConfirmDeleteModal
                    title="Eliminar franja horaria"
                    message={`Vas a eliminar la franja ${DIAS[deleteItem.dia_semana]} ${deleteItem.hora_apertura?.slice(0, 5)} - ${deleteItem.hora_cierre?.slice(0, 5)}. Esta acción no se puede deshacer.`}
                    confirmText={deleting ? "Eliminando..." : "Eliminar"}
                    onConfirm={eliminar}
                    onCancel={() => setDeleteItem(null)}
                />
            )}
        </div>
    );
}
