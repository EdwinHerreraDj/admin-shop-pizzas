document.querySelectorAll('.form-dinamico').forEach(form => {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // limpiar errores
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('border-red-500'));

        const formData = new FormData(this);

        fetch(this.action, {
            method: this.method,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            body: formData
        })
            .then(async res => {
                if (res.status === 422) {
                    const errorData = await res.json();
                    const errors = errorData.errors;

                    console.error("❌ Errores de validación recibidos:", errors); // 👈 log detallado

                    Object.keys(errors).forEach(field => {
                        // Convierte precios.1.pequena → precios[1][pequena]
                        const fixedName = field
                            .replace(/\.(\d+)/g, "[$1]")
                            .replace(/\.(\w+)/g, "[$1]");

                        const input = form.querySelector(`[name="${fixedName}"]`);
                        if (input) {
                            input.classList.add('border-red-500');
                            const errorElement = input.closest('div').querySelector('.error-message');
                            if (errorElement) {
                                errorElement.textContent = errors[field][0];
                            }
                        }
                    });


                    throw new Error("Errores de validación"); // solo el mensaje
                }

                return res.json();
            })

            .then(data => {
                if (data.success) {
                    const notyf = new Notyf({
                        duration: 1000,
                        dismissible: true,
                        position: { x: 'right', y: 'top' },
                    });
                    notyf.success(data.message);

                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1000);
                }
            })
            .catch(err => console.error("❌ Error:", err));
    });
});

/* Configuración en local storage donde guardamos la ubicación del tab para cuando se refresque la pagina  */

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll("[role='tab']");
    const tabPanels = document.querySelectorAll("[role='tabpanel']");

    // restaurar tab activo
    const activeTabId = localStorage.getItem("activeTabId");
    if (activeTabId) {
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) {
            // desactivar todos
            tabs.forEach(tab => tab.classList.remove("active"));
            tabPanels.forEach(panel => panel.classList.add("hidden"));

            // activar el tab guardado
            activeTab.classList.add("active");
            const target = document.querySelector(activeTab.dataset.fcTarget);
            if (target) target.classList.remove("hidden");
        }
    }

    // guardar cuando se cambia de tab
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            localStorage.setItem("activeTabId", tab.id);
        });
    });
});

/* Mostrar el formulario de la vista pulsando el boton de agregar, y rectificar que si viene con datas es un formulario de edición */

document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.open);
        if (!target) return;

        target.classList.remove('hidden');

        // Asignar campos simples
        Object.entries(btn.dataset).forEach(([key, value]) => {
            if (key === "url") {
                target.action = value;
                return;
            }
            const input = target.querySelector(`[name="${key}"]`);
            if (!input) return;

            if (input.type === "checkbox") {
                input.checked = value === "1";
            } else if (input.tagName === "SELECT") {
                input.value = value || "";
            } else {
                input.value = value || "";
            }
        });

        // Limpiar todos los checks antes
        const allChecks = target.querySelectorAll('input[name="ingredientes[]"]');
        allChecks.forEach(chk => chk.checked = false);

        // Marcar ingredientes seleccionados
        if (btn.dataset.ingredientes) {
            try {
                const seleccionados = JSON.parse(btn.dataset.ingredientes);
                seleccionados.forEach(id => {
                    const chk = target.querySelector(`input[name="ingredientes[]"][value="${id}"]`);
                    if (chk) chk.checked = true;
                });
            } catch (e) {
                console.error("Error parseando data-ingredientes:", e);
            }
        }

        // Cargar precios si los hay
        if (btn.dataset.precios) {
            try {
                const precios = JSON.parse(btn.dataset.precios);
                Object.keys(precios).forEach((tipoId) => {
                    const campos = precios[tipoId];
                    Object.keys(campos).forEach((size) => {
                        const input = target.querySelector(
                            `[name="precios[${tipoId}][${size}]"]`
                        );
                        if (input) input.value = campos[size];
                    });
                });
            } catch (e) {
                console.error("Error parseando precios:", e);
            }
        }

        // ⚡ Si quieres regenerar los ingredientes agrupados por categoría al editar
        if (btn.dataset.tipo_producto_id) {
            fetch(`/ingredientes/tipo/${btn.dataset.tipo_producto_id}`)
                .then(res => res.json())
                .then(data => {
                    let container = target.querySelector('#ingredientes-container');
                    container.innerHTML = "";

                    if (data.length === 0) {
                        container.innerHTML = "<p class='text-gray-500'>No hay ingredientes</p>";
                        return;
                    }

                    let grouped = {};
                    data.forEach(ing => {
                        if (!grouped[ing.categoria]) grouped[ing.categoria] = [];
                        grouped[ing.categoria].push(ing);
                    });

                    Object.entries(grouped).forEach(([categoria, items]) => {
                        let card = document.createElement('div');
                        card.classList.add('border', 'rounded', 'p-3', 'mb-3');
                        card.innerHTML = `<h4 class="font-semibold text-gray-700 mb-2">${categoria}</h4>`;

                        items.forEach(ingrediente => {
                            let item = document.createElement('div');
                            item.classList.add('flex', 'items-center', 'gap-2', 'mb-1');

                            item.innerHTML = `
                            <input type="checkbox" name="ingredientes[]" value="${ingrediente.id}" id="ing-${ingrediente.id}" class="form-checkbox">
                            <label for="ing-${ingrediente.id}" class="text-sm">${ingrediente.nombre}</label>
                        `;

                            // marcar si ya estaba seleccionado
                            if (btn.dataset.ingredientes) {
                                const seleccionados = JSON.parse(btn.dataset.ingredientes);
                                if (seleccionados.includes(ingrediente.id)) {
                                    item.querySelector('input').checked = true;
                                }
                            }

                            card.appendChild(item);
                        });

                        container.appendChild(card);
                    });
                });
        }
    });

});



/* Cerrar el formulario y resetearlo */

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.close);
        target.classList.add('hidden');
        target.reset();
        /* Resetear todos los errores cuando se cierra el formulario */
        const errorMessages = target.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');
        const inputs = target.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.classList.remove('border-red-500'));
    });
});


/* INICIO DELETE Configuracucion del modal y petincion de delete  */

let deleteUrl = null;
let deleteRow = null;
let deleteBtn = null;

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn"); // se aplica a cualquier botón con esta clase
    if (btn) {
        e.preventDefault();

        // Guardamos valores
        deleteBtn = btn;
        deleteUrl = btn.dataset.url;
        deleteRow = btn.closest("tr");

        // Texto dinámico
        const name = btn.dataset.name || "este registro";
        document.getElementById("modal-delete-message").textContent =
            `Esta acción eliminará ${name} y todos los datos relacionados. ¿Deseas continuar?`;

        // Mostrar modal
        document.getElementById("modal-confirm-delete").classList.remove("hidden");
    }
});

// Cancelar
document.getElementById("cancel-delete").addEventListener("click", () => {
    document.getElementById("modal-confirm-delete").classList.add("hidden");
    deleteUrl = null;
    deleteRow = null;
});

// Confirmar
document.getElementById("confirm-delete").addEventListener("click", () => {
    if (!deleteUrl) return;

    fetch(deleteUrl, {
        method: "DELETE",
        headers: {
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
            "Accept": "application/json",
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                new Notyf({
                    duration: 3000,
                    position: { x: "right", y: "top" },
                    dismissible: true,
                }).success(data.message);
                if (deleteBtn && deleteBtn.dataset.redirect === "true") {
                    // recargar la página
                    location.reload();
                } else if (deleteRow) {
                    // elimina solo la fila
                    deleteRow.remove();
                }
            }
        })
        .catch((err) => console.error("❌ Error:", err))
        .finally(() => {
            document.getElementById("modal-confirm-delete").classList.add("hidden");
            deleteUrl = null;
            deleteRow = null;
            deleteBtn = null;
        });
});

/* FIN DELETE */


/* FILTRAR LOS INGREDIENTES DEPENDIENDO DEL CAMPO INPUT DE TIPO DE PRODUCTO */
function cargarIngredientes(tipoId, container, seleccionados = []) {
    container.innerHTML = "";

    if (!tipoId) return;

    fetch(`/ingredientes/tipo/${tipoId}`)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "<p class='text-gray-500 col-span-2'>No hay ingredientes disponibles</p>";
                return;
            }

            // Agrupar por categoría
            let grouped = {};
            data.forEach(ing => {
                if (!grouped[ing.categoria]) grouped[ing.categoria] = [];
                grouped[ing.categoria].push(ing);
            });

            // Pintar cada grupo como tarjeta
            Object.entries(grouped).forEach(([categoria, items]) => {
                let card = document.createElement('div');
                card.classList.add('border', 'rounded', 'p-3', 'mb-3');
                card.innerHTML = `<h4 class="font-semibold text-gray-700 mb-2">${categoria}</h4>`;

                items.forEach(ingrediente => {
                    let item = document.createElement('div');
                    item.classList.add('flex', 'items-center', 'gap-2', 'mb-1');

                    let checked = seleccionados.includes(ingrediente.id) ? "checked" : "";

                    item.innerHTML = `
                        <input type="checkbox" name="ingredientes[]" value="${ingrediente.id}" id="ing-${ingrediente.id}" class="form-checkbox" ${checked}>
                        <label for="ing-${ingrediente.id}" class="text-sm">${ingrediente.nombre}</label>
                    `;

                    card.appendChild(item);
                });

                container.appendChild(card);
            });
        })
        .catch(err => console.error(err));
}

// 👉 Para CREAR
document.getElementById('tipo_producto_id').addEventListener('change', function () {
    const container = document.getElementById('ingredientes-container');
    cargarIngredientes(this.value, container);
});
