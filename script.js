const CONST = 4;
const DURACION = 120; // duración en segundos

const urls = {
  H1tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=0&single=true&output=csv',
  H1tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=355259796&single=true&output=csv',
  H1tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=923004067&single=true&output=csv',
  H2tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=991944699&single=true&output=csv',
  H2tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1251501192&single=true&output=csv',
  H2tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1487547326&single=true&output=csv',
};

let seleccionadas = [];
let audioActual = null;
let puntosInicio = [];

function loadCSV(clave) {
  document.getElementById('cargando').style.display = 'block';
  fetch(urls[clave])
    .then(response => response.text())
    .then(texto => {
      const resultado = Papa.parse(texto, { header: true });
      const datos = resultado.data
        .filter(row => row.Autor && row.Obra && row.URL_audio);

      seleccionadas = seleccionarAleatorias(datos, CONST);
      puntosInicio = new Array(CONST).fill(null);
      mostrarAudiciones(seleccionadas);
      document.getElementById('cargando').style.display = 'none';
    });
}

function seleccionarAleatorias(array, cantidad) {
  const copia = [...array];
  const elegidas = [];
  while (elegidas.length < cantidad && copia.length > 0) {
    const i = Math.floor(Math.random() * copia.length);
    elegidas.push(copia.splice(i, 1)[0]);
  }
  return elegidas;
}

function mostrarAudiciones(lista) {
  const contenedor = document.getElementById('audiciones');
  contenedor.innerHTML = '';

  lista.forEach((item, i) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'audicion fila-audicion';

    const boton = document.createElement('button');
    boton.textContent = `Audición ${i + 1}`;
    boton.onclick = () => reproducirAudio(i);

    tarjeta.appendChild(boton);
    contenedor.appendChild(tarjeta);
  });

  const botonSoluciones = document.createElement('button');
  botonSoluciones.textContent = 'Mostrar soluciones';
  botonSoluciones.className = 'mostrar-soluciones';
  botonSoluciones.onclick = mostrarSoluciones;
  contenedor.appendChild(botonSoluciones);
}

function reproducirAudio(indice) {
  if (audioActual) {
    audioActual.pause();
    audioActual.currentTime = 0;
  }

  audioActual = new Audio(seleccionadas[indice].URL_audio);

  audioActual.addEventListener('loadedmetadata', () => {
    if (puntosInicio[indice] === null) {
      const maxInicio = Math.max(0, audioActual.duration - DURACION);
      puntosInicio[indice] = Math.random() * maxInicio;
    }
    audioActual.currentTime = puntosInicio[indice];
    audioActual.play();

    setTimeout(() => {
      audioActual.pause();
    }, DURACION * 1000);
  });
}

function mostrarSoluciones() {
  const contenedor = document.getElementById('audiciones');
  const filas = contenedor.getElementsByClassName('fila-audicion');

  seleccionadas.forEach((item, i) => {
    const span = document.createElement('span');
    span.textContent = ` → ${item.Autor}: ${item.Obra}`;
    span.className = 'solucion-texto';
    filas[i].appendChild(span);
  });
}
