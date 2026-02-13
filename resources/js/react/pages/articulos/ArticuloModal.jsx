import React, { useMemo, useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ArticuloModal({ item, tipos, onClose, onSaved }) {
    const isEdit = !!item;

    const [nombre, setNombre] = useState(item?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(item?.descripcion ?? "");
    const [tipoId, setTipoId] = useState(item?.tipo_producto_id ?? "");
    const [personalizable, setPersonalizable] = useState(
        item?.personalizable ?? false,
    );
    const [publicado, setPublicado] = useState(item?.publicado ?? true);
    const [orden, setOrden] = useState(item?.orden ?? 1);

    const [imagen, setImagen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [preview, setPreview] = useState(null);
    const [objectUrl, setObjectUrl] = useState(null);

    const [horaInicio, setHoraInicio] = useState(item?.hora_inicio_venta ?? "");
    const [horaFin, setHoraFin] = useState(item?.hora_fin_venta ?? "");

    // Cleanup object URL on unmount or when preview changes
    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    useEffect(() => {
        if (isEdit && item?.imagen_url && !preview) {
            setPreview(item.imagen_url);
        }
    }, [isEdit, item?.imagen_url]); // Removido 'preview' de dependencias

    const title = useMemo(
        () => (isEdit ? "Editar artículo" : "Nuevo artículo"),
        [isEdit],
    );

    // Validación de horario
    const horarioError = useMemo(() => {
        if (horaInicio && horaFin && horaInicio >= horaFin) {
            return "La hora de fin debe ser posterior a la hora de inicio";
        }
        return null;
    }, [horaInicio, horaFin]);

    // Validación de campos requeridos
    const isValid = useMemo(() => {
        if (!nombre.trim()) return false;
        if (orden <= 0) return false;
        if (horarioError) return false;

        // SOLO si es personalizable exigimos tipo
        if (personalizable && !tipoId) return false;

        return true;
    }, [nombre, orden, horarioError, personalizable, tipoId]);

    const handleImageChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validar tipo de archivo
            if (!file.type.startsWith("image/")) {
                toast.error("Por favor selecciona un archivo de imagen válido");
                return;
            }

            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("La imagen no debe superar los 5MB");
                return;
            }

            // Limpiar URL anterior si existe
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }

            const newObjectUrl = URL.createObjectURL(file);
            setObjectUrl(newObjectUrl);
            setImagen(file);
            setPreview(newObjectUrl);
        },
        [objectUrl],
    );

    const handleClose = useCallback(() => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
        setPreview(null);
        setImagen(null);
        onClose();
    }, [objectUrl, onClose]);

    const save = async () => {
        if (!isValid) {
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const form = new FormData();

            form.append("nombre", nombre.trim());
            form.append("descripcion", descripcion.trim());
            form.append("personalizable", personalizable ? 1 : 0);
            form.append("publicado", publicado ? 1 : 0);
            form.append("orden", orden);
            if (personalizable) {
                form.append("tipo_producto_id", tipoId);
            }

            if (imagen) {
                form.append("imagen", imagen);
            }
            if (horaInicio) form.append("hora_inicio_venta", horaInicio);
            if (horaFin) form.append("hora_fin_venta", horaFin);

            if (isEdit) {
                form.append("_method", "PUT");
                await axios.post(`/api/admin/articulos/${item.id}`, form, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Artículo actualizado");
            } else {
                await axios.post("/api/admin/articulos", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Artículo creado");
            }

            // Cleanup
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setPreview(null);
            setImagen(null);
            setObjectUrl(null);

            onSaved();
        } catch (e) {
            if (e?.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
                toast.error("Revisa el formulario");
            } else {
                toast.error("Error guardando el artículo");
            }
        } finally {
            setLoading(false);
        }
    };

    const FieldError = ({ name }) =>
        errors[name] ? (
            <div className="mt-1 text-xs text-red-600">{errors[name][0]}</div>
        ) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6">
            <div
                className="
                    bg-white
                    w-full
                    max-w-3xl
                    rounded-3xl 
                    overflow-hidden
                    shadow-[0_40px_120px_rgba(0,0,0,0.35)]
                    flex flex-col
                    max-h-[90vh]
                "
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* HEADER */}
                <div className="px-7 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                            <i className="mgc_box_3_line"></i>
                        </div>

                        <div>
                            <h2
                                id="modal-title"
                                className="font-semibold tracking-tight"
                            >
                                {title}
                            </h2>
                            <p className="text-sm text-white/80">
                                Configuración del artículo
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        aria-label="Cerrar"
                    >
                        <i className="mgc_close_line text-xl"></i>
                    </button>
                </div>

                {/* BODY */}
                <div className="p-7 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="col-span-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">
                                Nombre <span className="text-red-500">*</span>
                            </label>

                            <input
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Pizza Barbacoa, Hamburguesa Deluxe..."
                                className={`mt-1 w-full h-11 px-3 rounded-xl border ${
                                    errors.nombre ? "border-red-500" : ""
                                }`}
                            />
                            <FieldError name="nombre" />
                        </div>

                        {/* Descripción */}
                        <div className="col-span-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">
                                Descripción
                            </label>

                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                rows={3}
                                placeholder="Describe brevemente el producto para el cliente..."
                                className={`mt-1 w-full px-3 py-2 rounded-xl border resize-none ${
                                    errors.descripcion ? "border-red-500" : ""
                                }`}
                            />
                            <FieldError name="descripcion" />
                        </div>

                        {/* Switches */}
                        <div className="flex justify-between items-center border rounded-2xl p-4">
                            <div>
                                <span className="text-sm font-semibold">
                                    Personalizable
                                </span>
                                <p className="text-xs text-gray-400">
                                    Permite modificar ingredientes
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPersonalizable(!personalizable)
                                }
                                className={`w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    personalizable
                                        ? "bg-indigo-500"
                                        : "bg-gray-300"
                                }`}
                                role="switch"
                                aria-checked={personalizable}
                            >
                                <span
                                    className={`block w-5 h-5 bg-white rounded-full m-1 transition-transform ${
                                        personalizable ? "translate-x-5" : ""
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex justify-between items-center border rounded-2xl p-4">
                            <div>
                                <span className="text-sm font-semibold">
                                    Publicado
                                </span>
                                <p className="text-xs text-gray-400">
                                    Visible para los clientes
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPublicado(!publicado)}
                                className={`w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                    publicado ? "bg-emerald-500" : "bg-gray-300"
                                }`}
                                role="switch"
                                aria-checked={publicado}
                            >
                                <span
                                    className={`block w-5 h-5 bg-white rounded-full m-1 transition-transform ${
                                        publicado ? "translate-x-5" : ""
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Tipo */}
                        {personalizable && (
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-500">
                                    Tipo de producto{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    value={tipoId}
                                    onChange={(e) => setTipoId(e.target.value)}
                                    className={`mt-1 w-full h-11 px-3 rounded-xl border ${
                                        errors.tipo_producto_id
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                >
                                    <option value="">
                                        Selecciona el tipo de producto
                                    </option>
                                    {tipos.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </select>

                                <FieldError name="tipo_producto_id" />
                            </div>
                        )}

                        {/* Orden */}
                        <div>
                            <label className="text-xs font-semibold uppercase text-gray-500">
                                Orden
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={orden}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setOrden(isNaN(val) || val < 1 ? 1 : val);
                                }}
                                placeholder="Ej: 1, 2, 3..."
                                className={`mt-1 w-full h-11 px-3 rounded-xl border ${
                                    errors.orden ? "border-red-500" : ""
                                }`}
                            />

                            <FieldError name="orden" />
                        </div>

                        {/* Imagen */}
                        <div className="col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Imagen
                            </label>

                            {preview && (
                                <div className="mt-3 flex items-center gap-3">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-16 h-16 rounded-xl object-cover border"
                                    />
                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium">
                                            {imagen
                                                ? "Nueva imagen"
                                                : "Imagen actual"}
                                        </div>
                                        {imagen?.name && (
                                            <div className="text-xs text-gray-400 truncate max-w-[180px]">
                                                {imagen.name}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (objectUrl) {
                                                URL.revokeObjectURL(objectUrl);
                                                setObjectUrl(null);
                                            }
                                            setPreview(
                                                isEdit
                                                    ? item?.imagen_url
                                                    : null,
                                            );
                                            setImagen(null);
                                        }}
                                        className="ml-auto text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}

                            <label
                                className="
                                    mt-2
                                    flex flex-col items-center justify-center
                                    gap-2
                                    h-36
                                    rounded-2xl
                                    border-2 border-dashed border-gray-300
                                    cursor-pointer
                                    hover:border-indigo-500
                                    hover:bg-indigo-50/40
                                    transition
                                    text-gray-500
                                "
                            >
                                <i className="mgc_image_line text-2xl"></i>

                                <span className="text-sm font-medium">
                                    Haz clic para seleccionar una imagen
                                </span>

                                <span className="text-xs text-gray-400">
                                    JPG o PNG — máximo 5MB — formato cuadrado
                                    recomendado
                                </span>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            <FieldError name="imagen" />
                        </div>

                        {/* Horario de venta */}
                        <div className="col-span-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">
                                Horario de venta (opcional)
                            </label>

                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400">
                                        Desde
                                    </span>
                                    <input
                                        type="time"
                                        value={horaInicio}
                                        onChange={(e) =>
                                            setHoraInicio(e.target.value)
                                        }
                                        className={`mt-1 w-full h-11 px-3 rounded-xl border ${
                                            errors.hora_inicio_venta
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    <FieldError name="hora_inicio_venta" />
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400">
                                        Hasta
                                    </span>
                                    <input
                                        type="time"
                                        value={horaFin}
                                        onChange={(e) =>
                                            setHoraFin(e.target.value)
                                        }
                                        className={`mt-1 w-full h-11 px-3 rounded-xl border ${
                                            errors.hora_fin_venta ||
                                            horarioError
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    <FieldError name="hora_fin_venta" />
                                    {horarioError && (
                                        <div className="mt-1 text-xs text-red-600">
                                            {horarioError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="mt-2 text-xs text-gray-400">
                                Si no se indica horario, el artículo se podrá
                                vender siempre.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={handleClose}
                        className="h-11 px-5 rounded-xl border hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={save}
                        disabled={loading || !isValid}
                        className={`h-11 px-6 rounded-xl font-semibold transition ${
                            loading || !isValid
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {loading ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
