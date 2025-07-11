const CONST = 4;
const DURACION = 120;

const urls = {
  H1tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=0&single=true&output=csv',
  H1tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=355259796&single=true&output=csv',
  H1tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=923004067&single=true&output=csv',
  H2tr1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=991944699&single=true&output=csv',
  H2tr2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1251501192&single=true&output=csv',
  H2tr3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb2p1IwuAK7jqnep9w4K5Vnmi-66ugFXv8JYTWRuDEIWDv7hGGlj7qk6SyU7ulW9DklaZ4-vIuehou/pub?gid=1487547326&single=true&output=csv'
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
  actual = -1;

  const audiciones = document.getElementById('audiciones');
  audiciones.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'audiciones-grid';

  while (seleccion.length < CONST) {
    const idx = Math.floor(Math.random() * datos.length);
    if (!seleccion.includes(idx)) {
      seleccion.push(idx);
      fragmentos.push(null);
    }
  }

  seleccion.forEach((idx, i) => {
    const caja = document.createElement('div');
    caja.className = 'audicion-caja';

    const boton = document.createElement('button');
    boton.className = 'boton-audicion';
    boton.textContent = `Audición ${i + 1}`;
    boton.onclick = () => reproducir(i, datos[idx].url, boton);
    caja.appendChild(boton);

    const zona = document.createElement('div');
    zona.className = 'zona-solucion';
    zona.textContent = '[esperando solución]';
    caja.appendChild(zona);

    grid.appendChild(caja);
  });

  audiciones.appendChild(grid);

  const btnSol = document.createElement('button');
  btnSol.id = 'mostrar-soluciones';
  btnSol.textContent = 'Mostrar soluciones';
  btnSol.onclick = () => {
    document.querySelectorAll('.zona-solucion').forEach((zona, i) => {
      const idx = seleccion[i];
      zona.textContent = `${datos[idx].autor}: ${datos[idx].obra}`;
      zona.style.fontWeight = 'bold';
    });
    btnSol.disabled = true;
  };
  
  // Estilo para evitar solapamientos
  btnSol.style.marginTop = '3rem';
  btnSol.style.marginBottom = '2rem';
  btnSol.style.display = 'block';
  
  audiciones.appendChild(btnSol);

  document.getElementById('cargando').style.display = 'none';
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

  if (actual !== -1) {
    estados[actual] = 'stop';
    const btnAnt = document.querySelectorAll('.boton-audicion')[actual];
    btnAnt.classList.remove('activo', 'pausado');
    audio.pause();
  }

  audio = new Audio(url);
  audio.addEventListener('loadedmetadata', () => {
    if (!fragmentos[i]) {
      const maxInicio = Math.max(0, audio.duration - DURACION);
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
