// Variables globales
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
let finTimeout = null;

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

  const contenedor = document.createElement('div');
  contenedor.className = 'audiciones-columna';

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
    
    const selector = document.createElement('select');
    selector.className = 'selector-solucion';
    
    datos.forEach(d => {
      const opcion = document.createElement('option');
      opcion.value = `${d.autor}: ${d.obra}`;
      opcion.textContent = `${d.autor}: ${d.obra}`;
      selector.appendChild(opcion);
    });
    
    zona.appendChild(selector);
    caja.appendChild(zona);

    contenedor.appendChild(caja);
  });

  audiciones.appendChild(contenedor);

  const btnSoluciones = document.createElement('button');
  btnSoluciones.id = 'mostrar-soluciones';
  btnSoluciones.textContent = 'Soluciones';
  btnSoluciones.onclick = () => {
    const zonas = document.querySelectorAll('.zona-solucion');
    zonas.forEach((zona, i) => {
      const selector = zona.querySelector('select');
      const correcta = `${datos[seleccion[i]].autor}: ${datos[seleccion[i]].obra}`;
      const elegida = selector.value;
  
      selector.classList.remove('correcto', 'incorrecto');
      if (elegida === correcta) {
        selector.classList.add('correcto');
      } else {
        selector.classList.add('incorrecto');
      }
  
      selector.disabled = true;
    });
  
    btnSoluciones.disabled = true;
  };

  audiciones.appendChild(btnSoluciones);

  document.getElementById('cargando').style.display = 'none';
}

function reproducir(i, url, btn) {
  if (finTimeout) {
    clearTimeout(finTimeout);
    finTimeout = null;
  }

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

    finTimeout = setTimeout(() => {
      audio.pause();
      btn.classList.remove('activo', 'pausado');
      estados[i] = 'stop';
      actual = -1;
    }, DURACION * 1000);
  });

  audio.addEventListener('ended', () => {
    if (finTimeout) {
      clearTimeout(finTimeout);
      finTimeout = null;
    }
    btn.classList.remove('activo', 'pausado');
    estados[i] = 'stop';
    actual = -1;
  });
}
