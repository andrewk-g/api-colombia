// Utilidades compartidas por todas las páginas.

const API_BASE = "https://api-colombia.com/api/v1";

/**
 * Hace una petición GET a la API y devuelve el JSON.
 * Lanza un Error si la respuesta no es exitosa (status fuera de 200-299).
 */
async function obtenerDatos(endpoint) {
  const respuesta = await fetch(`${API_BASE}/${endpoint}`);
  if (!respuesta.ok) {
    throw new Error(`La API respondió con el estado ${respuesta.status} en /${endpoint}`);
  }
  return respuesta.json();
}

/** Crea un elemento con clase y texto opcionales (sin usar innerHTML). */
function crearElemento(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined && texto !== null) el.textContent = texto;
  return el;
}

/** Formatea números con separadores de miles en español de Colombia. */
function formatearNumero(valor) {
  return typeof valor === "number" ? valor.toLocaleString("es-CO") : "Sin dato";
}

/** Muestra el mensaje de carga en el elemento de estado. */
function mostrarCarga(estado, mensaje) {
  estado.className = "status status--loading";
  estado.textContent = mensaje;
}

/** Muestra un mensaje de error en el elemento de estado. */
function mostrarError(estado, error) {
  console.error(error);
  estado.className = "status status--error";
  estado.textContent = "No fue posible cargar la información. Revisa tu conexión e intenta recargar la página.";
}

/** Oculta el elemento de estado cuando la carga termina bien. */
function ocultarEstado(estado) {
  estado.className = "status";
  estado.textContent = "";
}
