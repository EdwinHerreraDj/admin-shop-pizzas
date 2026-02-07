/* =========================
   FORM SUBMIT (CREATE / EDIT)
========================= */
document.querySelectorAll(".form-dinamico").forEach((form) => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!this.action) {
            console.error("Formulario sin action definida", this);
            return;
        }

        form.querySelectorAll(".error-message").forEach(
            (el) => (el.textContent = ""),
        );
        form.querySelectorAll("input, select, textarea").forEach((el) =>
            el.classList.remove("border-red-500"),
        );

        const formData = new FormData(this);

        fetch(this.action, {
            method: this.method || "POST",
            headers: {
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]',
                ).content,
                Accept: "application/json",
            },
            body: formData,
        })
            .then(async (res) => {
                if (res.status === 422) {
                    const { errors } = await res.json();

                    Object.keys(errors).forEach((field) => {
                        const fixedName = field
                            .replace(/\.(\d+)/g, "[$1]")
                            .replace(/\.(\w+)/g, "[$1]");

                        const input = form.querySelector(
                            `[name="${fixedName}"]`,
                        );
                        if (input) {
                            input.classList.add("border-red-500");
                            const msg = input
                                .closest("div")
                                ?.querySelector(".error-message");
                            if (msg) msg.textContent = errors[field][0];
                        }
                    });

                    throw new Error("Validation error");
                }

                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    new Notyf({
                        duration: 1000,
                        position: { x: "right", y: "top" },
                    }).success(data.message);

                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1000);
                }
            })
            .catch((err) => console.error("❌ Error:", err));
    });
});

/* =========================
   CARGAR INGREDIENTES
========================= */
function cargarIngredientes(
    tipoId,
    container,
    seleccionados = [],
    marcarTodos = false,
    inputName = "ingredientes[]",
) {
    if (!container) return;

    container.innerHTML = "";
    if (!tipoId) return;

    fetch(`/ingredientes/tipo/${tipoId}`)
        .then((res) => res.json())
        .then((data) => {
            if (!data.length) {
                container.innerHTML =
                    "<p class='text-gray-500'>No hay ingredientes</p>";
                return;
            }

            const grouped = {};

            data.forEach((ing) => {
                const categoria = ing.categoria?.nombre || "Otros";
                const orden = ing.categoria?.orden ?? 999;

                if (!grouped[categoria]) {
                    grouped[categoria] = { orden, items: [] };
                }

                grouped[categoria].items.push(ing);
            });

            Object.entries(grouped)
                .sort((a, b) => a[1].orden - b[1].orden)
                .forEach(([categoria, group]) => {
                    const card = document.createElement("div");
                    card.className = "border rounded p-3 mb-3";
                    card.innerHTML = `<h4 class="font-semibold mb-2">${categoria}</h4>`;

                    group.items.forEach((ing) => {
                        const isChecked =
                            marcarTodos || seleccionados.includes(ing.id);

                        card.insertAdjacentHTML(
                            "beforeend",
                            `
                            <div class="flex items-center gap-2 mb-1">
                                <input
                                    type="checkbox"
                                    name="${inputName}"
                                    value="${ing.id}"
                                    ${isChecked ? "checked" : ""}
                                >
                                <span class="text-sm">${ing.nombre}</span>
                            </div>
                        `,
                        );
                    });

                    container.appendChild(card);
                });
        })
        .catch((err) => {
            console.error("Error cargando ingredientes:", err);
            container.innerHTML =
                "<p class='text-red-500'>Error al cargar ingredientes</p>";
        });
}

/* =========================
   CAMBIO TIPO PRODUCTO (CREAR)
========================= */
document
    .getElementById("tipo_producto_id")
    ?.addEventListener("change", function () {
        const tipoId = this.value;

        const baseContainer = document.getElementById(
            "ingredientes-base-container",
        );
        const extraContainer = document.getElementById(
            "ingredientes-extra-container",
        );

        cargarIngredientes(tipoId, baseContainer, [], false, "ingredientes[]");

        cargarIngredientes(
            tipoId,
            extraContainer,
            [],
            true,
            "ingredientes_extra[]",
        );
    });

/* =========================
   CAMBIO TIPO PRODUCTO (EDITAR)
========================= */
document
    .getElementById("tipo_producto_id_edit")
    ?.addEventListener("change", function () {
        const form = document.getElementById("form-articulos-edit");
        if (!form) return;

        const baseContainer = form.querySelector(
            "#ingredientes-base-container",
        );
        const extraContainer = form.querySelector(
            "#ingredientes-extra-container",
        );

        cargarIngredientes(
            this.value,
            baseContainer,
            [],
            false,
            "ingredientes[]",
        );
        cargarIngredientes(
            this.value,
            extraContainer,
            [],
            true,
            "ingredientes_extra[]",
        );
    });

/* =========================
   ABRIR MODALES (EDITAR)
========================= */
document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const form = document.getElementById(btn.dataset.open);
        if (!form) return;
        if (!this.getAttribute("action")) {
            console.error("Formulario sin action:", this);
            return;
        }

        form.classList.remove("hidden");
        if (btn.dataset.url) {
            form.action = btn.dataset.url;
        }

        // Campos simples
        Object.entries(btn.dataset).forEach(([key, value]) => {
            if (
                ["open", "url", "ingredientes", "ingredientes_extra"].includes(
                    key,
                )
            )
                return;
            const input = form.querySelector(`[name="${key}"]`);
            if (!input) return;

            if (input.type === "checkbox") {
                input.checked = value === "1";
            } else {
                input.value = value ?? "";
            }
        });

        const tipoId = btn.dataset.tipo_producto_id;
        if (!tipoId) return;

        const baseSeleccionados = btn.dataset.ingredientes
            ? JSON.parse(btn.dataset.ingredientes)
            : [];

        const extraSeleccionados = btn.dataset.ingredientes_extra
            ? JSON.parse(btn.dataset.ingredientes_extra)
            : [];

        // BASE
        cargarIngredientes(
            tipoId,
            form.querySelector("#ingredientes-container"),
            baseSeleccionados,
            false,
            "ingredientes[]",
        );

        // EXTRAS
        cargarIngredientes(
            tipoId,
            form.querySelector("#ingredientes-extra-container"),
            extraSeleccionados,
            false,
            "ingredientes_extra[]",
        );
    });
});

/* =========================
   CERRAR MODALES
========================= */
document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const form = document.getElementById(btn.dataset.close);
        if (!form) return;

        form.classList.add("hidden");
        form.reset();
        form.querySelectorAll(".error-message").forEach(
            (el) => (el.textContent = ""),
        );
        form.querySelectorAll("input, select, textarea").forEach((el) =>
            el.classList.remove("border-red-500"),
        );
    });
});

/* =========================
   DELETE
========================= */
let deleteUrl = null;
let deleteRow = null;

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    deleteUrl = btn.dataset.url;
    deleteRow = btn.closest("tr");

    document.getElementById("modal-delete-message").textContent =
        `Esta acción eliminará ${btn.dataset.name || "este registro"}.`;

    document.getElementById("modal-confirm-delete").classList.remove("hidden");
});

document.getElementById("cancel-delete")?.addEventListener("click", () => {
    document.getElementById("modal-confirm-delete").classList.add("hidden");
    deleteUrl = deleteRow = null;
});

document.getElementById("confirm-delete")?.addEventListener("click", () => {
    if (!deleteUrl) return;

    fetch(deleteUrl, {
        method: "DELETE",
        headers: {
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
                .content,
            Accept: "application/json",
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success && deleteRow) deleteRow.remove();
        })
        .finally(() => {
            document
                .getElementById("modal-confirm-delete")
                .classList.add("hidden");
            deleteUrl = deleteRow = null;
        });
});
