// Página 2: Presidentes de Colombia (/President), ordenados por año.

const estado = document.getElementById("estado");
const contenedor = document.getElementById("presidentes");
const total = document.getElementById("total-presidentes");

const IMAGEN_RESPALDO = "img/sin-foto.svg";
const COMMONS = "https://upload.wikimedia.org/wikipedia/commons";

/**
 * Imágenes de reemplazo (por id del presidente) para las fotos de la API que
 * ya no existen en Wikimedia (error 404). Tomadas de Wikimedia Commons.
 */
const IMAGENES_REEMPLAZO = {
  4: `${COMMONS}/7/70/Carlos_Holgu%C3%ADn_Mallarino_oleo.jpg`,
  17: `${COMMONS}/thumb/6/68/Jose_Vicente_Concha_LCCN20146960911.jpg/330px-Jose_Vicente_Concha_LCCN20146960911.jpg`,
  21: `${COMMONS}/thumb/f/f6/Miguel_Abad%C3%ADa_M%C3%A9ndez.jpg/330px-Miguel_Abad%C3%ADa_M%C3%A9ndez.jpg`,
  24: `${COMMONS}/f/f7/Eduardo-santos-montejo.jpg`,
  27: `${COMMONS}/thumb/e/ef/Dar%C3%ADo_Echand%C3%ADa_Olaya.webp/330px-Dar%C3%ADo_Echand%C3%ADa_Olaya.webp`,
  28: `${COMMONS}/thumb/d/db/Alberto_Lleras_Camargo%2C_Presidente_da_Col%C3%B4mbia.tif/lossy-page1-330px-Alberto_Lleras_Camargo%2C_Presidente_da_Col%C3%B4mbia.tif.jpg`,
  34: `${COMMONS}/thumb/d/db/Alberto_Lleras_Camargo%2C_Presidente_da_Col%C3%B4mbia.tif/lossy-page1-330px-Alberto_Lleras_Camargo%2C_Presidente_da_Col%C3%B4mbia.tif.jpg`,
  37: `${COMMONS}/thumb/f/fe/Carlos_Lleras_Restrepo_1.jpg/330px-Carlos_Lleras_Restrepo_1.jpg`,
  38: `${COMMONS}/thumb/e/e6/Misael_Pastrana.JPG/330px-Misael_Pastrana.JPG`,
  53: `${COMMONS}/thumb/a/a2/Colombian_Presidential_Candidate_Abelardo_de_la_Espriella_%28cropped%29.jpg/330px-Colombian_Presidential_Candidate_Abelardo_de_la_Espriella_%28cropped%29.jpg`,
};

/**
 * Devuelve la URL de la foto a mostrar:
 * 1. Si hay un reemplazo manual para ese id, se usa.
 * 2. Si la API no trae una URL válida, se usa la imagen local de respaldo.
 * 3. Varias fotos apuntan a miniaturas de Wikimedia con anchos no estándar
 *    (p. ej. 99px) que hoy responden con error 400; se reescriben a 330px.
 */
function obtenerImagen(presidente) {
  if (IMAGENES_REEMPLAZO[presidente.id]) return IMAGENES_REEMPLAZO[presidente.id];
  const url = presidente.image;
  if (!url || typeof url !== "string" || !url.startsWith("http")) return IMAGEN_RESPALDO;
  return url.replace(/\/thumb\/(.+)\/\d+px-([^/]+)$/, "/thumb/$1/330px-$2");
}

/**
 * Si la imagen falla, se reintenta una vez (Wikimedia puede responder 429 si
 * se piden muchas fotos a la vez) y, si vuelve a fallar, se usa el respaldo.
 */
function manejarErrorImagen(foto, url) {
  let reintentado = false;
  foto.addEventListener("error", () => {
    if (foto.src.endsWith(IMAGEN_RESPALDO)) return;
    if (!reintentado) {
      reintentado = true;
      setTimeout(() => { foto.src = url; }, 2000);
    } else {
      foto.src = IMAGEN_RESPALDO;
    }
  });
}

function obtenerAnio(fecha) {
  return fecha ? new Date(fecha).getFullYear() : null;
}

function formatearPeriodo(inicio, fin) {
  const anioInicio = obtenerAnio(inicio) ?? "?";
  const anioFin = obtenerAnio(fin) ?? "Actualidad";
  return anioInicio === anioFin ? `${anioInicio}` : `${anioInicio} – ${anioFin}`;
}

function crearTarjetaPresidente(presidente) {
  const nombreCompleto = `${presidente.name} ${presidente.lastName || ""}`.trim();

  const tarjeta = crearElemento("li", "card card--person");

  const figura = crearElemento("div", "card__photo");
  const foto = document.createElement("img");
  const url = obtenerImagen(presidente);
  manejarErrorImagen(foto, url);
  foto.src = url;
  foto.alt = `Retrato de ${nombreCompleto}`;
  foto.loading = "lazy";
  foto.decoding = "async";
  foto.width = 330;
  foto.height = 400;
  figura.append(foto, crearElemento("span", "card__year", obtenerAnio(presidente.startPeriodDate) ?? "—"));

  const cuerpo = crearElemento("div", "card__body");
  const datos = crearElemento("dl", "card__data");
  [
    ["Periodo", formatearPeriodo(presidente.startPeriodDate, presidente.endPeriodDate)],
    ["Partido", presidente.politicalParty || "Sin dato"],
  ].forEach(([etiqueta, valor]) => {
    const fila = crearElemento("div", "card__data-row");
    fila.append(crearElemento("dt", null, etiqueta), crearElemento("dd", null, valor));
    datos.append(fila);
  });

  cuerpo.append(crearElemento("h3", "card__title", nombreCompleto), datos);
  tarjeta.append(figura, cuerpo);
  return tarjeta;
}

async function cargarPresidentes() {
  mostrarCarga(estado, "Cargando presidentes…");

  try {
    const presidentes = await obtenerDatos("President");

    // Extra: ordenar por año (fecha de inicio del periodo, de más antiguo a más reciente).
    presidentes.sort((a, b) => new Date(a.startPeriodDate) - new Date(b.startPeriodDate));

    const fragmento = document.createDocumentFragment();
    presidentes.forEach((presidente) => fragmento.append(crearTarjetaPresidente(presidente)));
    contenedor.append(fragmento);

    total.textContent = presidentes.length;
    ocultarEstado(estado);
  } catch (error) {
    mostrarError(estado, error);
  }
}

cargarPresidentes();
