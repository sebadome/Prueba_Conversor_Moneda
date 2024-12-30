// index.js

document.addEventListener("DOMContentLoaded", () => {
  const inputMonto = document.getElementById("monto");
  const selectMoneda = document.getElementById("moneda");
  const botonConvertir = document.getElementById("convertir");
  const resultado = document.getElementById("resultado");

  const apiURL = "https://mindicador.cl/api";

  // Función para obtener datos de la API
  async function getAndCreateDataToChart(moneda) {
      try {
          const res = await fetch(`${apiURL}/${moneda}`);
          if (!res.ok) throw new Error("Error al obtener los datos de la API");
          const data = await res.json();

          // Filtrar los últimos 10 días
          const ultimos10Dias = data.serie.slice(0, 10);
          const labels = ultimos10Dias.map(d => new Date(d.fecha).toLocaleDateString());
          const valores = ultimos10Dias.map(d => d.valor);

          return { labels, valores };
      } catch (error) {
          mostrarError(error.message);
          throw error; // Re-lanzar para que lo maneje quien lo llame
      }
  }

  // Función para mostrar errores en el DOM
  function mostrarError(mensaje) {
      resultado.innerHTML = `<p style="color: red;">${mensaje}</p>`;
  }

  // Función para renderizar el gráfico
  async function renderGrafica(moneda) {
      try {
          const { labels, valores } = await getAndCreateDataToChart(moneda);

          const ctx = document.getElementById("myChart").getContext("2d");
          new Chart(ctx, {
              type: "line",
              data: {
                  labels,
                  datasets: [{
                      label: `Historial de ${moneda.toUpperCase()}`,
                      data: valores,
                      borderColor: "rgb(75, 192, 192)",
                      tension: 0.1,
                  }],
              },
          });
      } catch (error) {
          console.error("Error al renderizar la gráfica", error);
      }
  }

  // Función principal para manejar la conversión
  async function convertirMoneda() {
      try {
          const monto = parseFloat(inputMonto.value);
          const moneda = selectMoneda.value;

          if (isNaN(monto) || monto <= 0) {
              mostrarError("Por favor ingresa un monto válido.");
              return;
          }

          if (!moneda) {
              mostrarError("Por favor selecciona una moneda.");
              return;
          }

          // Obtener datos de la API
          const res = await fetch(apiURL);
          if (!res.ok) throw new Error("Error al obtener los datos de la API");
          const data = await res.json();

          // Calcular conversión
          const tipoCambio = data[moneda]?.valor;
          if (!tipoCambio) {
              mostrarError("No se encontró el tipo de cambio para la moneda seleccionada.");
              return;
          }

          const conversion = (monto / tipoCambio).toFixed(2);

          // Mostrar resultado en el DOM
          resultado.innerHTML = `<p>${monto} CLP son aproximadamente ${conversion} ${moneda.toUpperCase()}</p>`;

          // Renderizar gráfica
          renderGrafica(moneda);
      } catch (error) {
          mostrarError(error.message);
      }
  }

  // Event listener para el botón
  botonConvertir.addEventListener("click", convertirMoneda);
});
