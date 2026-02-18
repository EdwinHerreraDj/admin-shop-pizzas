import React from "react";
import { useState, useRef, useEffect } from "react";

export default function RowActionsDropdown({
    row,
    onCategorias,
    onIngredientes,
    onPrecios,
    onDelete,
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative overflow-visible" ref={dropdownRef}>
            {/* Botón ⋯ */}
            <button
                onClick={() => setOpen(!open)}
                className="
            w-9 h-9
            flex items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-600
            hover:bg-slate-100
            hover:border-slate-300
            transition
        "
            >
                <i className="mgc_more_2_line text-lg"></i>
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="
                absolute right-0 top-full mt-2
                w-56
                bg-white
                border border-slate-200
                rounded-2xl
                shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                overflow-hidden
                z-[999]
            "
                >
                    <div className="py-2 text-sm">
                        {/* Categorías */}
                        <button
                            onClick={() => {
                                onCategorias(row);
                                setOpen(false);
                            }}
                            className="
                        w-full text-left px-4 py-2.5
                        hover:bg-slate-50
                        flex items-center gap-3
                        text-slate-700
                        transition
                    "
                        >
                            <i className="mgc_folder_line text-base"></i>
                            Categorías
                        </button>

                        {/* Ingredientes */}
                        {row.personalizable && (
                            <button
                                onClick={() => {
                                    onIngredientes(row);
                                    setOpen(false);
                                }}
                                className="
                            w-full text-left px-4 py-2.5
                            hover:bg-slate-50
                            flex items-center gap-3
                            text-slate-700
                            transition
                        "
                            >
                                <i className="mgc_grass_line text-base"></i>
                                Ingredientes
                            </button>
                        )}

                        {/* Precios */}
                        <button
                            onClick={() => {
                                onPrecios(row);
                                setOpen(false);
                            }}
                            className="
                        w-full text-left px-4 py-2.5
                        hover:bg-slate-50
                        flex items-center gap-3
                        text-slate-700
                        transition
                    "
                        >
                            <i className="mgc_coin_line text-base"></i>
                            Precios
                        </button>

                        <div className="border-t border-slate-100 my-2"></div>

                        {/* Eliminar */}
                        <button
                            onClick={() => {
                                onDelete(row);
                                setOpen(false);
                            }}
                            className="
                        w-full text-left px-4 py-2.5
                        hover:bg-rose-50
                        text-rose-600
                        flex items-center gap-3
                        transition
                    "
                        >
                            <i className="mgc_delete_2_line text-base"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
