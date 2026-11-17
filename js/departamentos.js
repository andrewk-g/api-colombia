// Página 1: Explorador de departamentos (/Department + /Region).

const estado = document.getElementById("estado");
const contenedor = document.getElementById("departamentos");
const resumen = document.getElementById("resumen-regiones");
const total = document.getElementById("total-departamentos");

function crearTarjetaDepartamento(departamento, nombreRegion) {
  const tarjeta = crearElemento("article", "card");

  const encabezado = crearElemento("div", "card__header");
  encabezado.append(
    crearElemento("h3", "card__title", departamento.name),
    crearElemento("span", "chip", nombreRegion)
  );

  const datos = crearElemento("dl", "card__data");
  const filas = [
    ["Población", `${formatearNumero(departamento.population)} hab.`],
    ["Superficie", `${formatearNumero(departamento.surface)} km²`],
  ];
  filas.forEach(([etiqueta, valor]) => {
    const fila = crearElemento("div", "card__data-row");
    fila.append(crearElemento("dt", null, etiqueta), crearElemento("dd", null, valor));
    datos.append(fila);
  });

  const descripcion = crearElemento(
    "p",
    "card__text",
    departamento.description || "Sin descripción disponible."
  );

  tarjeta.append(encabezado, datos, descripcion);
  return tarjeta;
}

function crearResumenRegiones(departamentos, regionesPorId) {
  // Extra: contar departamentos por región.
  const conteo = {};
  departamentos.forEach((dep) => {
    const nombre = regionesPorId[dep.regionId] || "Sin región";
    conteo[nombre] = (conteo[nombre] || 0) + 1;
  });

  Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, cantidad]) => {
      const item = crearElemento("div", "summary-item");
      item.append(
        crearElemento("span", "summary-item__value", cantidad),
        crearElemento("span", "summary-item__label", region)
      );
      resumen.append(item);
    });
}

async function cargarDepartamentos() {
  mostrarCarga(estado, "Cargando departamentos…");

  try {
    // La API no incluye el nombre de la región dentro del departamento,
    // así que se consultan ambos endpoints en paralelo y se cruzan por regionId.
    const [departamentos, regiones] = await Promise.all([
      obtenerDatos("Department"),
      obtenerDatos("Region"),
    ]);

    const regionesPorId = {};
    regiones.forEach((region) => {
      regionesPorId[region.id] = region.name;
    });

    departamentos.sort((a, b) => a.name.localeCompare(b.name, "es"));

    crearResumenRegiones(departamentos, regionesPorId);

    const fragmento = document.createDocumentFragment();
    departamentos.forEach((dep) => {
      fragmento.append(crearTarjetaDepartamento(dep, regionesPorId[dep.regionId] || "Sin región"));
    });
    contenedor.append(fragmento);

    total.textContent = departamentos.length;
    ocultarEstado(estado);
  } catch (error) {
    mostrarError(estado, error);
  }
}

cargarDepartamentos();
