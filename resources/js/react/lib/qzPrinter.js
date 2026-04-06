import qz from "qz-tray";

// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────

// Nombre exacto de la impresora tal como aparece en Windows.
// Cambiar si el nombre varía en el equipo.
const NOMBRE_IMPRESORA = "EPSON TM-T20II Receipt";

// Ancho del papel en caracteres (80mm ≈ 48 columnas en fuente estándar)
const ANCHO = 48;

// ─────────────────────────────────────────────────────────────────────────────
// Conexión
// ─────────────────────────────────────────────────────────────────────────────

// Deshabilitar la firma de certificados para desarrollo.
// En producción se puede configurar con certificados firmados.
qz.security.setCertificatePromise(() =>
    Promise.resolve(
        "-----BEGIN CERTIFICATE-----\nMIIBBDCBrAIJAIpW0rmjx0QLMA0GCSqGSIb3DQEBCwUAMBExDzANBgNVBAMMBnF6\ndGVzdDAeFw0yMzAxMDEwMDAwMDBaFw0zMzAxMDEwMDAwMDBaMBExDzANBgNVBAMM\nBnF6dGVzdDAyMA0GCSqGSIb3DQEBAQUAAwIhADAeBhcqhkjOPQIBBggqhkjOPQMB\nBwMHAAQBAAAAATANBgkqhkiG9w0BAQsFAAMCAQAwDQYJKoZIhvcNAQELBQADAgEA\n-----END CERTIFICATE-----",
    ),
);
qz.security.setSignatureAlgorithm("SHA512");
qz.security.setSignaturePromise(() => (resolve) => resolve(""));

let conectado = false;

async function conectar() {
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

/**
 * Comprueba si QZ Tray está disponible sin intentar conectar.
 */
export function qzDisponible() {
    return conectado && qz.websocket.isActive();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formato ESC/POS
// ─────────────────────────────────────────────────────────────────────────────

const ESC = "\x1B";
const GS = "\x1D";

const CMD = {
    INIT: ESC + "@",
    CENTER: ESC + "a\x01",
    LEFT: ESC + "a\x00",
    BOLD_ON: ESC + "E\x01",
    BOLD_OFF: ESC + "E\x00",
    DOUBLE_ON: GS + "!\x11", // doble alto + doble ancho
    DOUBLE_OFF: GS + "!\x00",
    CUT: GS + "V\x00", // corte total
    FEED: ESC + "d\x03", // avanzar 3 líneas
    LINEA: "------------------------------------------------\n",
    LINEA_PUNTOS: "- - - - - - - - - - - - - - - - - - - - - - - -\n",
};

function eur(n) {
    return Number(n || 0).toFixed(2) + " EUR";
}

function fila(izq, der) {
    const espacios = ANCHO - izq.length - der.length;
    return izq + " ".repeat(Math.max(1, espacios)) + der + "\n";
}

function centrar(texto) {
    const pad = Math.max(0, Math.floor((ANCHO - texto.length) / 2));
    return " ".repeat(pad) + texto + "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// Generar datos del ticket
// ─────────────────────────────────────────────────────────────────────────────

const METODO_PAGO_LABEL = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia",
};

function generarTicket(pedido) {
    let t = "";

    // Inicializar impresora
    t += CMD.INIT;

    // ── Cabecera ──────────────────────────────────────────────
    t += CMD.CENTER;
    t += CMD.DOUBLE_ON;
    t += pedido.codigo + "\n";
    t += CMD.DOUBLE_OFF;
    t += new Date(pedido.created_at).toLocaleString("es-ES") + "\n";
    t += CMD.LEFT;
    t += CMD.LINEA;

    // ── Datos cliente ─────────────────────────────────────────
    t += fila("Cliente", pedido.cliente_nombre);
    t += fila("Teléfono", pedido.cliente_telefono);

    if (pedido.tipo_entrega === "recogida") {
        t += CMD.BOLD_ON;
        t += centrar("*** RECOGIDA EN TIENDA ***");
        t += CMD.BOLD_OFF;
    } else {
        const dir = `${pedido.direccion ?? ""}, ${pedido.codigo_postal ?? ""}`;
        t += fila("Dirección", dir.length > 25 ? dir.slice(0, 25) : dir);
    }

    t += fila("Pago", METODO_PAGO_LABEL[pedido.metodo_pago] ?? pedido.metodo_pago);

    // Hora deseada
    if (pedido.hora_deseada) {
        t += CMD.BOLD_ON;
        t += fila("Hora deseada", pedido.hora_deseada);
        t += CMD.BOLD_OFF;
    }

    t += CMD.LINEA;

    // ── Items ─────────────────────────────────────────────────
    for (const item of pedido.items ?? []) {
        // Nombre del item con precio
        t += CMD.BOLD_ON;
        const nombre = `${item.cantidad}x ${item.nombre}`;
        const tamano = item.tamano ? ` (${item.tamano})` : "";
        const precio = eur(item.subtotal);
        const textoItem = nombre + tamano;

        // Si cabe en una línea con el precio
        if (textoItem.length + precio.length + 1 <= ANCHO) {
            t += fila(textoItem, precio);
        } else {
            // Nombre en una línea, precio en la siguiente alineado a la derecha
            t += textoItem + "\n";
            t += " ".repeat(ANCHO - precio.length) + precio + "\n";
        }
        t += CMD.BOLD_OFF;

        // Precio unitario si cantidad > 1
        if (item.cantidad > 1) {
            const pu = `  (${eur(item.precio_unitario)} c/u)`;
            t += pu + "\n";
        }

        // Ingredientes
        for (const ing of item.ingredientes ?? []) {
            const signo = ing.tipo === "extra" ? "+" : "-";
            const ingNombre = ing.ingrediente?.nombre ?? `#${ing.ingrediente_id}`;
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

    // ── Totales ───────────────────────────────────────────────
    t += fila("Subtotal", eur(pedido.subtotal));

    if (Number(pedido.gastos_envio) > 0) {
        t += fila("Envío", eur(pedido.gastos_envio));
    }

    t += CMD.BOLD_ON;
    t += CMD.DOUBLE_ON;
    t += fila("TOTAL", eur(pedido.total));
    t += CMD.DOUBLE_OFF;
    t += CMD.BOLD_OFF;

    // ── Observaciones ─────────────────────────────────────────
    if (pedido.observaciones) {
        t += CMD.LINEA;
        t += CMD.BOLD_ON;
        t += "OBS: " + pedido.observaciones + "\n";
        t += CMD.BOLD_OFF;
    }

    // ── Footer ────────────────────────────────────────────────
    t += "\n";
    t += CMD.CENTER;
    t += "-- Comanda generada automáticamente --\n";
    t += CMD.LEFT;

    // Avanzar y cortar
    t += CMD.FEED;
    t += CMD.CUT;

    return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Función pública: imprimir ticket de pedido
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Imprime un ticket térmico vía QZ Tray.
 * Retorna true si se imprimió, false si QZ no está disponible.
 */
export async function imprimirTicketQZ(pedido) {
    const ok = await conectar();
    if (!ok) return false;

    try {
        const config = qz.configs.create(NOMBRE_IMPRESORA, {
            encoding: "ISO-8859-15",
        });
        const ticket = generarTicket(pedido);

        await qz.print(config, [
            {
                type: "raw",
                format: "plain",
                data: ticket,
                options: { language: "ESCPOS" },
            },
        ]);

        return true;
    } catch (err) {
        console.error("Error al imprimir con QZ Tray:", err);
        return false;
    }
}

export default { imprimirTicketQZ, qzDisponible };
