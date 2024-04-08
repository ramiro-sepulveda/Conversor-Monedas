//Tomar ID necesarias
const botonResultado = document.getElementById("boton-calculo");
const selectMoneda = document.getElementById("select-moneda");
const resultadoConversion = document.getElementById("resultado");
const apiURL = "https://mindicador.cl/api/";
let opcionesMonedas = [];
const myChart = document.getElementById("myChart");
var graficoDeLinea = "";

//Importar datos de API y limpiar array

async function valoresMonedas() {
  try {
    const res = await fetch(apiURL);
    const data = await res.json();
    const monedas = Object.values(data);
    return monedas.splice(3, 12).filter((moneda=>moneda.unidad_medida == 'Pesos'));
  } catch (e) {
    alert(e.message);
    resultadoConversion.innerHTML = "Ha ocurrdio un error en el servidor";
  }
}
//Agregar monedas API al Select Form

async function dataSelect() {
  opcionesMonedas = await valoresMonedas();
  let html = `<option selected value="1">Selecciona una Moneda</option>`;
  opcionesMonedas.forEach((moneda) => {
    html += `<option id="${moneda.codigo}" value="${moneda.valor}">${moneda.nombre}</option>`;
  });
  selectMoneda.innerHTML = html;
  console.log(opcionesMonedas);
  return opcionesMonedas;
}

//Funcion DATA para grafico

async function graficoValores() {
  const apiGrafico =
    "https://mindicador.cl/api/" +
    opcionesMonedas[selectMoneda.selectedIndex - 1].codigo;

  const res = await fetch(apiGrafico);
  const data = await res.json();
  const monedaSeleccionada = Object.values(data);
  const arrayDias = monedaSeleccionada[5].splice(0, 10);

  const ejeFechas = arrayDias
    .map((moneda) => {
      return moneda.fecha.split("T")[0];
    })
    .map((moneda) => {
      return moneda.split("-").reverse().join("-");
    });
  ejeFechas.reverse();

  const ejeValores = arrayDias.map((moneda) => {
    return moneda.valor;
  });

  ejeValores.reverse();

  console.log(ejeFechas);
  console.log(ejeValores);

  const configData = {
    labels: ejeFechas,
    datasets: [
      {
        label: "Valor en Pesos Chilenos de una (1) unidad de: "+monedaSeleccionada[3],
        borderColor: "rgb(255, 99, 132)",
        data: ejeValores,
      },
    ],
  };

  return configData;
}

//Funcion RENDER para grafico

async function renderGrafica() {
  try {
    const data = await graficoValores();
    const config = {
      type: "line",
      data: data,
      options: {
        responsive: true,
      },
    };

    myChart.style.backgroundColor = "white";
    graficoDeLinea = new Chart(myChart, config);
    graficoDeLinea;
  } catch (e) {
    alert(e.message);
    resultadoConversion.innerHTML = "Ha ocurrdio un error en el servidor";
  }
}

dataSelect();

//Formula multiplicar INPUT x Valor Moneda y mostrar en P

botonResultado.addEventListener("click", () => {
  if (selectMoneda.selectedIndex == 0) {
    alert("Debes seleccionar una Moneda");
  } else {
    const pesosClp = document.getElementById("pesos-clp").value;
    const inputSelect = selectMoneda.value;
    let resultado = pesosClp / inputSelect;
    resultadoConversion.innerHTML =
      "$ " +
      resultado.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    console.log(resultado);

    renderGrafica();

    try {
      graficoDeLinea.destroy();
    } catch {}
  }
});
