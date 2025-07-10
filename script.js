const hojaURLs = {
  H1tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=0&single=true&output=csv',
  H1tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=355259796&single=true&output=csv',
  H1tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=923004067&single=true&output=csv',
  H2tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=991944699&single=true&output=csv',
  H2tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1251501192&single=true&output=csv',
  H2tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1487547326&single=true&output=csv'
};

let datos = [];
let seleccionadas = [];
let audios = [];
let duracionSegundos = 30;

function parseDuracion(texto) {
  if (texto.includes(':')) {
    const [min, seg] = texto.split(':').map(x => parseInt(x));
    return min * 60 + (isNaN(seg) ? 0 : seg);
  } else {
    return parseInt(texto) * 60;
  }
}

function iniciarSesion() {
  const curso = document.getElementById('select-curso').value;
  const trimestre = document.getElementById('select-trimestre').value;
  const nAudiciones = parseInt(document.getElementById('num-audiciones').value);
  const duracionTexto = document.getElementById('duracion').value;
  duracionSegundos = parseDuracion(duracionTexto);

  const clave = `H${curso}tr${trimestre}`;
  const url = hojaURLs[clave];

  fetch(url)
    .then(res => res.text())
    .then(texto => {
      const resultado = Papa.parse(texto, { header: true, skipEmptyLines: true });
      datos = resultado.data
        .filter(obj => obj.Autor && obj.Obra && obj.URL_audio)
        .map(obj => ({
          autor: obj.Autor.trim(),
          obra: obj.Obra.trim(),
          url_audio: obj.URL_audio.trim()
        }));
      prepararAudiciones(nAudiciones);
    });
}

function prepararAudiciones(n) {
  seleccionadas = [];
  audios = [];

  const copia = [...datos];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * copia.length);
    const entrada = copia.splice(idx, 1)[0];
    seleccionadas.push(entrada);
  }

  generarBotones();
  document.getElementById('pantalla-inicial').classList.add('hidden');
  document.getElementById('pantalla-audicion').classList.remove('hidden');
}

function generarBotones() {
  const contenedor = document.getElementById('lista-audiciones');
  contenedor.innerHTML = '';
  audios = [];

  let pendientes = seleccionadas.length;
  document.getElementById('cargando-audios').classList.remove('hidden');
  contenedor.classList.add('hidden');

  seleccionadas.forEach((entrada, i) => {
    const audio = new Audio();
    audio.src = entrada.url_audio;
    audio.preload = 'metadata';
    audio.dataset.index = i;

    const btn = document.createElement('button');
    btn.className = 'btn-audio';
    btn.textContent = `${i + 1}`;
    btn.disabled = true;
    contenedor.appendChild(btn);

    audio.addEventListener('loadedmetadata', () => {
      const duracion = audio.duration;
      let inicio = 0;
      if (duracion > duracionSegundos) {
        inicio = Math.random() * (duracion - duracionSegundos);
      }
      audio.dataset.start = inicio;

      btn.disabled = false;
      btn.onclick = () => reproducirAudio(i, btn);

      pendientes--;
      if (pendientes === 0) {
        // Todos cargados
        document.getElementById('cargando-audios').classList.add('hidden');
        contenedor.classList.remove('hidden');
        console.log('Todos los audios listos');
      }
    });

    audio.addEventListener('error', () => {
      console.warn(`Error al cargar audio: ${entrada.url_audio}`);
      pendientes--;
      if (pendientes === 0) {
        document.getElementById('cargando-audios').classList.add('hidden');
        contenedor.classList.remove('hidden');
      }
    });

    audio.addEventListener('ended', () => detenerTodos());

    audios.push(audio);
  });
}

function reproducirAudio(i, boton) {
  const audio = audios[i];

  if (!audio.paused) {
    audio.pause();
    audio.currentTime = parseFloat(audio.dataset.start);
    activarTodos(true);
    return;
  }

  detenerTodos();
  audio.currentTime = parseFloat(audio.dataset.start);
  audio.play();
  activarTodos(false);
  boton.disabled = false;
}

function detenerTodos() {
  audios.forEach((a, i) => {
    if (!a.paused) a.pause();
  });
  activarTodos(true);
}

function activarTodos(activo) {
  document.querySelectorAll('.btn-audio').forEach(btn => {
    btn.disabled = !activo;
  });
}

function mostrarSolucion() {
  const botones = document.querySelectorAll('.btn-audio');
  botones.forEach((btn, i) => {
    const entrada = seleccionadas[i];
    btn.textContent = `${i + 1}. ${entrada.autor}: ${entrada.obra}`;
  });
}

function reiniciar() {
  detenerTodos();
  document.getElementById('pantalla-audicion').classList.add('hidden');
  document.getElementById('pantalla-inicial').classList.remove('hidden');
}
