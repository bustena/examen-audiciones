const CONST = 4;

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

function loadCSV(clave) {
  document.getElementById('cargando').style.display = 'block';
  fetch(urls[clave])
    .then(response => response.text())
    .then(texto => {
      const resultado = Papa.parse(texto, { header: true });
      const datos = resultado.data
        .filter(row => row.Autor && row.Obra && row.URL_audio); // limpiar vacíos

      seleccionadas = seleccionarAleatorias(datos, CONST);
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
    tarjeta.className = 'audicion';

    const boton = document.createElement('button');
    boton.textContent = `Audición ${i + 1}`;
    boton.onclick = () => reproducirAudio(item.URL_audio);

    tarjeta.appendChild(boton);
    contenedor.appendChild(tarjeta);
  });

  const botonSoluciones = document.createElement('button');
  botonSoluciones.textContent = 'Mostrar soluciones';
  botonSoluciones.className = 'mostrar-soluciones';
  botonSoluciones.onclick = mostrarSoluciones;

  contenedor.appendChild(botonSoluciones);
}

function reproducirAudio(url) {
  if (audioActual) {
    audioActual.pause();
    audioActual.currentTime = 0;
  }

  audioActual = new Audio(url);
  audioActual.play();
}

function mostrarSoluciones() {
  const contenedor = document.getElementById('audiciones');
  const lista = document.createElement('ul');
  lista.className = 'soluciones';

  seleccionadas.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `Audición ${i + 1}: ${item.Autor} – ${item.Obra}`;
    lista.appendChild(li);
  });

  contenedor.appendChild(lista);
}
