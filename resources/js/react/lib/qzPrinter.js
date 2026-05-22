import qz from "qz-tray";

// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────

// La impresora se configura desde /admin/qz-diagnostico y se guarda en localStorage.
// Fallback al nombre por defecto si no hay nada guardado.
const NOMBRE_IMPRESORA_DEFAULT = "EPSON TM-T20II Receipt";

function getConfigImpresora() {
    try {
        const guardada = localStorage.getItem("qz_impresora");
        if (guardada) return JSON.parse(guardada);
    } catch { /* ignore */ }
    return { tipo: "nombre", nombre: NOMBRE_IMPRESORA_DEFAULT };
}

// Ancho del papel en caracteres (80mm ≈ 48 columnas en fuente estándar)
const ANCHO = 48;

// ─────────────────────────────────────────────────────────────────────────────
// Conexión
// ─────────────────────────────────────────────────────────────────────────────

// URL base de la API (misma que usa Laravel)
const API_BASE = window.location.origin + "/api";

// Certificado: se obtiene del backend
qz.security.setCertificatePromise(() =>
    fetch(`${API_BASE}/qz/certificate`)
        .then((r) => {
            if (!r.ok) throw new Error("No se pudo obtener el certificado QZ");
            return r.text();
        }),
);

// Firma: el backend firma con la clave privada (SHA-512 + RSA)
qz.security.setSignatureAlgorithm("SHA512");
qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
    fetch(`${API_BASE}/qz/sign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/plain",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content ?? "",
        },
        body: JSON.stringify({ request: toSign }),
    })
        .then((r) => {
            if (!r.ok) throw new Error("Error al firmar request QZ");
            return r.text();
        })
        .then(resolve)
        .catch(reject);
});

let conectado = false;

export async function conectarQZ() {
    if (conectado && qz.websocket.isActive()) return true;

    try {
        if (!qz.websocket.isActive()) {
            await qz.websocket.connect();
        }
        conectado = true;
        return true;
    } catch (err) {
        console.warn("QZ Tray no disponible:", err?.message ?? err);
        conectado = false;
        return false;
    }
}

export function qzDisponible() {
    return conectado && qz.websocket.isActive();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ESC = "\x1B";
const GS = "\x1D";

const CMD = {
    INIT: ESC + "@",
    CENTER: ESC + "a\x01",
    LEFT: ESC + "a\x00",
    BOLD_ON: ESC + "E\x01",
    BOLD_OFF: ESC + "E\x00",
    DOUBLE_ON: GS + "!\x11",
    DOUBLE_OFF: GS + "!\x00",
    CUT: GS + "V\x00",
    FEED: ESC + "d\x03",
    LINEA: "------------------------------------------------\n",
    LINEA_PUNTOS: "- - - - - - - - - - - - - - - - - - - - - - - -\n",
};

function eur(n) {
    return Number(n || 0).toFixed(2) + " EUR";
}

// Reemplaza caracteres especiales por equivalentes ASCII
function limpiar(texto) {
    if (!texto) return "";
    return texto
        .replace(/á/g, "a").replace(/Á/g, "A")
        .replace(/é/g, "e").replace(/É/g, "E")
        .replace(/í/g, "i").replace(/Í/g, "I")
        .replace(/ó/g, "o").replace(/Ó/g, "O")
        .replace(/ú/g, "u").replace(/Ú/g, "U")
        .replace(/ñ/g, "n").replace(/Ñ/g, "N")
        .replace(/ü/g, "u").replace(/Ü/g, "U")
        .replace(/¿/g, "?").replace(/¡/g, "!")
        .replace(/€/g, "EUR")
        .replace(/º/g, "o").replace(/ª/g, "a");
}

function fila(izq, der) {
    const espacios = ANCHO - izq.length - der.length;
    return izq + " ".repeat(Math.max(1, espacios)) + der + "\n";
}

function centrar(texto) {
    const pad = Math.max(0, Math.floor((ANCHO - texto.length) / 2));
    return " ".repeat(pad) + texto + "\n";
}

// Parte un texto largo en varias líneas, respetando palabras siempre que sea posible.
// Si una palabra excede el ancho, se corta a la fuerza.
function envolver(texto, ancho = ANCHO, indent = "") {
    if (!texto) return "";
    const anchoUtil = ancho - indent.length;
    const palabras = String(texto).split(/\s+/).filter(Boolean);
    const lineas = [];
    let actual = "";

    for (const palabra of palabras) {
        const candidato = actual ? `${actual} ${palabra}` : palabra;
        if (candidato.length <= anchoUtil) {
            actual = candidato;
            continue;
        }
        if (actual) lineas.push(actual);

        if (palabra.length > anchoUtil) {
            for (let i = 0; i < palabra.length; i += anchoUtil) {
                lineas.push(palabra.slice(i, i + anchoUtil));
            }
            actual = "";
        } else {
            actual = palabra;
        }
    }
    if (actual) lineas.push(actual);

    return lineas.map((l) => indent + l + "\n").join("");
}

// Etiqueta a la izquierda y valor envuelto debajo con indent.
function bloque(label, texto) {
    if (!texto) return "";
    return label + ":\n" + envolver(texto, ANCHO, "  ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Generar ticket
// ─────────────────────────────────────────────────────────────────────────────

const METODO_PAGO_LABEL = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia",
};

function generarTicket(pedido) {
    let t = "";

    t += CMD.INIT;

    // Cabecera
    t += CMD.CENTER;
    t += CMD.DOUBLE_ON;
    t += pedido.codigo + "\n";
    t += CMD.DOUBLE_OFF;
    t += new Date(pedido.created_at).toLocaleString("es-ES") + "\n";
    t += CMD.LEFT;
    t += CMD.LINEA;

    // Datos cliente (envueltos si son largos)
    t += bloque("Cliente", limpiar(pedido.cliente_nombre));
    t += fila("Telefono", pedido.cliente_telefono);

    if (pedido.tipo_entrega === "recogida") {
        t += CMD.BOLD_ON;
        t += centrar("*** RECOGIDA EN TIENDA ***");
        t += CMD.BOLD_OFF;
    } else {
        const partes = [
            pedido.direccion,
            pedido.bloque,
            pedido.piso,
            pedido.codigo_postal,
        ].filter(Boolean).join(", ");
        t += bloque("Direccion", limpiar(partes));
    }

    t += fila("Pago", METODO_PAGO_LABEL[pedido.metodo_pago] ?? pedido.metodo_pago);

    if (pedido.hora_deseada) {
        t += CMD.BOLD_ON;
        t += fila("Hora deseada", pedido.hora_deseada);
        t += CMD.BOLD_OFF;
    }

    t += CMD.LINEA;

    // Items
    for (const item of pedido.items ?? []) {
        t += CMD.BOLD_ON;
        const nombre = `${item.cantidad}x ${limpiar(item.nombre)}`;
        const tamano = item.tamano ? ` (${limpiar(item.tamano)})` : "";
        const precio = eur(item.subtotal);
        const textoItem = nombre + tamano;

        if (textoItem.length + precio.length + 1 <= ANCHO) {
            t += fila(textoItem, precio);
        } else {
            t += textoItem + "\n";
            t += " ".repeat(ANCHO - precio.length) + precio + "\n";
        }
        t += CMD.BOLD_OFF;

        if (item.cantidad > 1) {
            t += `  (${eur(item.precio_unitario)} c/u)\n`;
        }

        for (const ing of item.ingredientes ?? []) {
            const signo = ing.tipo === "extra" ? "+" : "-";
            const ingNombre = limpiar(ing.ingrediente?.nombre ?? `#${ing.ingrediente_id}`);
            const cant = ing.cantidad > 1 ? ` x${ing.cantidad}` : "";
            const mitad = ing.mitad ? ` [mitad ${ing.mitad}]` : "";
            const ingPrecio = ing.tipo === "extra" && Number(ing.precio) > 0
                ? ` ${eur(ing.precio)}`
                : "";
            t += `  ${signo} ${ingNombre}${cant}${mitad}${ingPrecio}\n`;
        }

        t += CMD.LINEA_PUNTOS;
    }

    t += CMD.LINEA;

    // Totales
    t += fila("Subtotal", eur(pedido.subtotal));

    if (Number(pedido.gastos_envio) > 0) {
        t += fila("Envio", eur(pedido.gastos_envio));
    }

    t += CMD.BOLD_ON;
    t += CMD.DOUBLE_ON;
    t += fila("TOTAL", eur(pedido.total));
    t += CMD.DOUBLE_OFF;
    t += CMD.BOLD_OFF;

    if (pedido.observaciones) {
        t += CMD.LINEA;
        t += CMD.BOLD_ON;
        t += "OBS:\n";
        t += envolver(limpiar(pedido.observaciones), ANCHO, "  ");
        t += CMD.BOLD_OFF;
    }

    t += "\n";
    t += CMD.CENTER;
    t += "-- Comanda generada automaticamente --\n";
    t += CMD.LEFT;

    t += CMD.FEED;
    t += CMD.CUT;

    return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Imprimir
// ─────────────────────────────────────────────────────────────────────────────

export async function imprimirTicketQZ(pedido) {
    const ok = await conectarQZ();
    if (!ok) return false;

    try {
        const impresora = getConfigImpresora();
        let config;

        if (impresora.tipo === "ip") {
            config = qz.configs.create(null, {
                host: impresora.host,
                port: impresora.port || 9100,
            });
        } else {
            config = qz.configs.create(impresora.nombre);
        }

        const ticket = generarTicket(pedido);

        await qz.print(config, [
            {
                type: "raw",
                format: "plain",
                data: ticket,
            },
        ]);

        return true;
    } catch (err) {
        console.error("Error al imprimir con QZ Tray:", err);
        return false;
    }
}

export default { imprimirTicketQZ, qzDisponible };
