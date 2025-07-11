const CONST = 4;
const DURACION = 120;
const urls = {
  H1tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=0&single=true&output=csv',
  H1tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=355259796&single=true&output=csv',
  H1tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=923004067&single=true&output=csv',
  H2tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=991944699&single=true&output=csv',
  H2tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1251501192&single=true&output=csv',
  H2tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1487547326&single=true&output=csv',
};

let datos = [];
let seleccion = [];
let fragmentos = [];
let estados = [];
let audio = new Audio();
let actual = -1;

function loadCSV(clave) {
  document.getElementById('cargando').style.display = 'block';
  fetch(urls[clave])
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true }).data;
      datos = parsed.slice(0, 15).map(row => ({
        autor: row.Autor,
        obra: row.Obra,
        url: row.URL_audio
      }));
      iniciarAudiciones();
    });
}

function iniciarAudiciones() {
  seleccion = [];
  fragmentos = [];
  estados = Array(CONST).fill('stop');
  const audiciones = document.getElementById('audiciones');
  audiciones.innerHTML = '';

  while (seleccion.length < CONST) {
    let idx = Math.floor(Math.random() * datos.length);
    if (!seleccion.includes(idx)) {
      seleccion.push(idx);
      fragmentos.push(null);
    }
  }

  seleccion.forEach((idx, i) => {
    const cont = document.createElement('div');
    cont.className = 'audicion';

    const btn = document.createElement('button');
    btn.className = 'boton-audicion';
    btn.textContent = `Audición ${i + 1}`;
    btn.onclick = () => reproducir(i, datos[idx].url, btn);
    cont.appendChild(btn);

    const texto = document.createElement('div');
    texto.className = 'solucion';
    texto.textContent = `${datos[idx].autor}: ${datos[idx].obra}`;
    texto.style.display = 'none';
    cont.appendChild(texto);

    audiciones.appendChild(cont);
  });

  const btnSol = document.createElement('button');
  btnSol.id = 'mostrar-soluciones';
  btnSol.textContent = 'Mostrar soluciones';
  btnSol.onclick = () => {
    document.querySelectorAll('.solucion').forEach(el => el.style.display = 'block');
    btnSol.disabled = true;
  };
  audiciones.appendChild(btnSol);

  document.getElementById('cargando').style.display = 'none';
  actual = -1;
}

function reproducir(i, url, btn) {
  if (actual === i) {
    if (!audio.paused) {
      audio.pause();
      estados[i] = 'pause';
      btn.classList.remove('activo');
      btn.classList.add('pausado');
    } else {
      audio.play();
      estados[i] = 'play';
      btn.classList.remove('pausado');
      btn.classList.add('activo');
    }
    return;
  }

  // Parar anterior
  if (actual !== -1) {
    estados[actual] = 'stop';
    const btnAnt = document.querySelectorAll('.boton-audicion')[actual];
    btnAnt.classList.remove('activo', 'pausado');
    audio.pause();
  }

  audio = new Audio(url);
  audio.addEventListener('loadedmetadata', () => {
    if (!fragmentos[i]) {
      let maxInicio = Math.max(0, audio.duration - DURACION);
      fragmentos[i] = Math.random() * maxInicio;
    }
    audio.currentTime = fragmentos[i];
    audio.play();
    estados[i] = 'play';
    btn.classList.add('activo');
    actual = i;
  });

  audio.addEventListener('ended', () => {
    btn.classList.remove('activo', 'pausado');
    estados[i] = 'stop';
    actual = -1;
  });
}
