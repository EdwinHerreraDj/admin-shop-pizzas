import React from "react";

export default function ConfirmDeleteModal({
    title = "Confirmar eliminación",
    message,
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)]
                    overflow-hidden animate-[fadeIn_0.2s_ease-out,scaleIn_0.25s_ease-out]"
            >
                {/* Cabecera */}
                <div className="flex items-start gap-4 p-6 border-b bg-gray-50">
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl
                            bg-red-100 text-red-600
                            flex items-center justify-center text-xl"
                    >
                        <i className="mgc_alert_line"></i>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-gray-900 leading-tight">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 bg-white">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-medium
                           bg-gray-100 text-gray-700
                           hover:bg-gray-200
                           active:scale-[0.98]
                           transition-all"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl text-sm font-semibold
                           bg-red-600 text-white
                           hover:bg-red-700
                           active:scale-[0.97]
                           shadow-sm
                           transition-all"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
