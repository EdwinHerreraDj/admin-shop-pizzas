import React from "react";
import { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

const DIAS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

export default function FranjaHorariaModal({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [diaSemana, setDiaSemana] = useState(0);
    const [horaApertura, setHoraApertura] = useState("12:00");
    const [horaCierre, setHoraCierre] = useState("16:00");
    const [activo, setActivo] = useState(true);

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setDiaSemana(item.dia_semana ?? 0);
            setHoraApertura(item.hora_apertura?.slice(0, 5) ?? "12:00");
            setHoraCierre(item.hora_cierre?.slice(0, 5) ?? "16:00");
            setActivo(!!item.activo);
        }
    }, [item]);

    const guardar = async () => {
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                dia_semana: Number(diaSemana),
                hora_apertura: horaApertura,
                hora_cierre: horaCierre,
                activo,
            };

            if (isEdit) {
                await api.put(`/franjas-horarias/${item.id}`, payload);
                toast.success("Franja actualizada");
            } else {
                await api.post("/franjas-horarias", payload);
                toast.success("Franja creada");
            }

            onSaved();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                toast.error("Error guardando franja");
            }
        }

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden">
                {/* HEADER */}
                <div className="px-6 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
                                <i className="mgc_time_line"></i>
                            </div>
                            <div>
                                <h2 className="font-semibold tracking-tight">
                                    {isEdit
                                        ? "Editar franja"
                                        : "Nueva franja"}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    Configuración del horario de servicio
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        >
                            <i className="mgc_close_line text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-6 space-y-6">
                    {/* Día de la semana */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Día de la semana
                        </label>
                        <select
                            value={diaSemana}
                            onChange={(e) => setDiaSemana(e.target.value)}
                            className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                        >
                            {DIAS.map((nombre, i) => (
                                <option key={i} value={i}>
                                    {nombre}
                                </option>
                            ))}
                        </select>
                        {errors.dia_semana && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.dia_semana[0]}
                            </div>
                        )}
                    </div>

                    {/* Horas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Hora apertura
                            </label>
                            <input
                                type="time"
                                value={horaApertura}
                                onChange={(e) =>
                                    setHoraApertura(e.target.value)
                                }
                                className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                            />
                            {errors.hora_apertura && (
                                <div className="mt-1 text-xs text-red-600">
                                    {errors.hora_apertura[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Hora cierre
                            </label>
                            <input
                                type="time"
                                value={horaCierre}
                                onChange={(e) => setHoraCierre(e.target.value)}
                                className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                            />
                            {errors.hora_cierre && (
                                <div className="mt-1 text-xs text-red-600">
                                    {errors.hora_cierre[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SWITCH ACTIVO */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
                        <div>
                            <div className="text-sm font-semibold text-gray-800">
                                Franja activa
                            </div>
                            <div className="text-xs text-gray-500">
                                Actívala para permitir pedidos en este horario
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActivo(!activo)}
                            className={`relative w-12 h-7 rounded-full transition shadow-inner ${
                                activo
                                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                                    : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition ${
                                    activo ? "translate-x-5" : ""
                                }`}
                            />
                        </button>
                    </div>

                    {errors.activo && (
                        <div className="text-xs text-red-600">
                            {errors.activo[0]}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="h-11 px-5 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        disabled={saving}
                        className="h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:opacity-95 transition shadow-xl shadow-fuchsia-600/30"
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
