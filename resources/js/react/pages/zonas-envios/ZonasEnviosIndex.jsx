import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";
import ZonaEnvioModal from "./ZonaEnvioModal";
import ConfirmDeleteModal from "@/react/components/ConfirmDeleteModal";

export default function ZonasEnvioIndex() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const eliminar = async () => {
        if (!deleteItem) return;

        setDeleting(true);

        try {
            await api.delete(`/zonas-envio/${deleteItem.id}`);
            toast.success("Zona eliminada");
            setDeleteItem(null);
            load();
        } catch {
            toast.error("Error eliminando zona");
        }

        setDeleting(false);
    };

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/zonas-envio", {
                params: { search },
            });
            setItems(data.data);
        } catch {
            toast.error("Error cargando zonas");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [search]);

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div
                className="
            relative
            mb-8
            rounded-3xl
            bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600
            p-[1px]
            shadow-[0_20px_80px_rgba(0,0,0,0.12)]
        "
            >
                <div className="rounded-3xl bg-white px-6 py-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* IZQUIERDA */}
                    <div className="flex items-center gap-4">
                        <div
                            className="
                        w-12 h-12
                        rounded-2xl
                        bg-gradient-to-br from-violet-500 to-fuchsia-600
                        text-white
                        flex items-center justify-center
                        text-xl
                        shadow-lg
                    "
                        >
                            <i className="mgc_map_line"></i>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Zonas de Envío
                            </h1>
                            <p className="text-sm text-gray-500">
                                Gestiona las zonas y sus recargos asociados
                            </p>
                        </div>
                    </div>

                    {/* BOTÓN */}
                    <div className="w-full lg:w-auto">
                        <button
                            onClick={() => {
                                setEditing(null);
                                setOpen(true);
                            }}
                            className="
                        inline-flex items-center justify-center gap-2
                        h-11 px-6
                        rounded-xl
                        bg-gradient-to-r from-violet-600 to-fuchsia-600
                        text-white
                        text-sm font-semibold
                        shadow-lg shadow-fuchsia-600/30
                        hover:opacity-95
                        transition
                        w-full sm:w-auto
                    "
                        >
                            <i className="mgc_add_line text-lg"></i>
                            Nueva zona
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE CARD */}
            <div
                className="
            rounded-3xl
            bg-white
            border border-gray-200
            shadow-[0_10px_40px_rgba(0,0,0,0.06)]
            overflow-hidden
        "
            >
                {/* TOP BAR TABLA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700">
                            Listado de zonas
                        </h2>
                        <p className="text-xs text-gray-500">
                            Administra y filtra las zonas registradas
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <i className="mgc_search_line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                        <input
                            type="text"
                            placeholder="Buscar zona..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                        w-full
                        pl-10 pr-4
                        h-10
                        rounded-xl
                        border border-gray-200
                        bg-white
                        text-sm
                        text-gray-700
                        placeholder-gray-400
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500/40
                        focus:border-violet-500
                        transition
                    "
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="px-6 py-16 text-center text-gray-400 text-sm">
                            Cargando zonas...
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-gray-200">
                                <tr className="text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                    <th className="px-6 py-4 w-[120px]">CP</th>
                                    <th className="px-6 py-4">Barrio</th>
                                    <th className="px-6 py-4 w-[140px]">
                                        Recargo
                                    </th>
                                    <th className="px-6 py-4 w-[120px]">
                                        Activo
                                    </th>
                                    <th className="px-6 py-4 text-right w-[160px]">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                                                    <i className="mgc_inbox_line"></i>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    No hay zonas registradas
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Cuando crees una nueva zona
                                                    aparecerá aquí
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((zona) => (
                                        <tr
                                            key={zona.id}
                                            className="group hover:bg-violet-50/40 transition"
                                        >
                                            <td className="px-6 py-5 font-medium text-gray-500 tabular-nums">
                                                {zona.codigo_postal}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="font-semibold text-gray-900">
                                                    {zona.barrio}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-gray-700 font-medium">
                                                {zona.recargo} €
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`
                                                inline-flex items-center
                                                px-3 py-1
                                                rounded-full
                                                text-xs font-semibold
                                                ${
                                                    zona.activo
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-700"
                                                }
                                            `}
                                                >
                                                    {zona.activo
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => {
                                                            setEditing(zona);
                                                            setOpen(true);
                                                        }}
                                                        className="
                                                    w-9 h-9
                                                    flex items-center justify-center
                                                    rounded-lg
                                                    hover:bg-gray-100
                                                    transition
                                                "
                                                    >
                                                        <i className="mgc_edit_2_line text-lg text-gray-600"></i>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            setDeleteItem(zona)
                                                        }
                                                        className="
                                                    w-9 h-9
                                                    flex items-center justify-center
                                                    rounded-lg
                                                    hover:bg-rose-50
                                                    transition
                                                "
                                                    >
                                                        <i className="mgc_delete_2_line text-lg text-rose-500"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {open && (
                <ZonaEnvioModal
                    item={editing}
                    onClose={() => setOpen(false)}
                    onSaved={load}
                />
            )}

            {deleteItem && (
                <ConfirmDeleteModal
                    title="Eliminar zona de envío"
                    message={`Vas a eliminar la zona ${deleteItem.codigo_postal} - ${deleteItem.barrio}. Esta acción no se puede deshacer.`}
                    confirmText={deleting ? "Eliminando..." : "Eliminar"}
                    onConfirm={eliminar}
                    onCancel={() => setDeleteItem(null)}
                />
            )}
        </div>
    );
}
