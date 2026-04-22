import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

const CARD_VACIA = { icono: "", titulo: "", descripcion: "", activa: true };

function CardEditor({ index, card, onChange }) {
    const update = (campo, valor) => {
        onChange({ ...card, [campo]: valor });
    };

    return (
        <div
            className={`rounded-3xl bg-white border shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden transition ${
                card.activa
                    ? "border-gray-200"
                    : "border-gray-100 opacity-60"
            }`}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">
                        Card {index + 1}
                    </h3>
                </div>

                {/* Toggle activa */}
                <button
                    onClick={() => update("activa", !card.activa)}
                    className={`relative w-10 h-6 rounded-full transition shadow-inner ${
                        card.activa ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                    title={card.activa ? "Activa" : "Oculta"}
                >
                    <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition ${
                            card.activa ? "translate-x-4" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                {/* Icono */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Icono (emoji)
                    </label>
                    <input
                        type="text"
                        value={card.icono}
                        onChange={(e) => update("icono", e.target.value)}
                        placeholder="🍕"
                        maxLength={20}
                        className="
                            mt-1 w-full h-11 px-3
                            rounded-xl border border-gray-300 bg-white
                            text-2xl text-center
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                        "
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Pega un emoji o déjalo vacío
                    </p>
                </div>

                {/* Título */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Título
                    </label>
                    <input
                        type="text"
                        value={card.titulo}
                        onChange={(e) => update("titulo", e.target.value)}
                        placeholder="Ej: Entrega rápida"
                        maxLength={100}
                        className="
                            mt-1 w-full h-11 px-3
                            rounded-xl border border-gray-300 bg-white font-medium
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                        "
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Descripción
                    </label>
                    <textarea
                        value={card.descripcion}
                        onChange={(e) => update("descripcion", e.target.value)}
                        placeholder="Texto libre con información para el cliente"
                        rows={4}
                        maxLength={500}
                        className="
                            mt-1 w-full px-3 py-2
                            rounded-xl border border-gray-300 bg-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                            resize-none
                        "
                    />
                    <div className="text-xs text-gray-400 mt-1 text-right">
                        {card.descripcion.length}/500
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardPreview({ card }) {
    if (!card.activa) return null;
    if (!card.titulo && !card.descripcion && !card.icono) return null;

    return (
        <div className="rounded-2xl bg-white border border-gray-200 p-5 text-center shadow-sm">
            {card.icono && <div className="text-4xl mb-2">{card.icono}</div>}
            {card.titulo && (
                <h4 className="font-bold text-gray-800 mb-1">{card.titulo}</h4>
            )}
            {card.descripcion && (
                <p className="text-xs text-gray-600 whitespace-pre-line">
                    {card.descripcion}
                </p>
            )}
        </div>
    );
}

export default function CardsInfoIndex() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cards, setCards] = useState([CARD_VACIA, CARD_VACIA, CARD_VACIA]);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/configuracion/cards-info");
            const list = Array.isArray(data.cards) ? data.cards : [];
            const completas = [0, 1, 2].map(
                (i) => list[i] || { ...CARD_VACIA },
            );
            setCards(completas);
        } catch {
            toast.error("Error al cargar las cards");
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const guardar = async () => {
        setSaving(true);
        try {
            await api.put("/configuracion/cards-info", { cards });
            toast.success("Cards guardadas correctamente");
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "Error al guardar",
            );
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

    const activasCount = cards.filter((c) => c.activa).length;

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-[1px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
                <div className="rounded-3xl bg-white px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg">
                            <i className="mgc_layout_3_line"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Información en la tienda
                            </h1>
                            <p className="text-sm text-gray-500">
                                3 cards informativas que se muestran antes del
                                footer en la tienda
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {activasCount} de 3 activas
                    </span>
                </div>
            </div>

            {/* EDITORES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {cards.map((card, i) => (
                    <CardEditor
                        key={i}
                        index={i}
                        card={card}
                        onChange={(nueva) => {
                            const copia = [...cards];
                            copia[i] = nueva;
                            setCards(copia);
                        }}
                    />
                ))}
            </div>

            {/* VISTA PREVIA */}
            <div className="rounded-3xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/70">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Vista previa
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Así se verán las cards en la tienda
                    </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cards.map((c, i) => (
                            <CardPreview key={i} card={c} />
                        ))}
                    </div>
                    {activasCount === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No hay cards activas. Activa al menos una para
                            mostrarla en la tienda.
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <div className="flex justify-end">
                <button
                    onClick={guardar}
                    disabled={saving}
                    className="
                        h-12 px-8 rounded-xl
                        bg-gradient-to-r from-indigo-600 to-violet-600
                        text-white font-semibold
                        hover:opacity-95 transition
                        shadow-xl shadow-indigo-600/30
                        disabled:opacity-50
                    "
                >
                    {saving ? "Guardando..." : "Guardar cambios"}
                </button>
            </div>
        </div>
    );
}
