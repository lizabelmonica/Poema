
(function() {
  const overlay = document.getElementById('overlay');
  const panel = document.getElementById('panel');
  const testBtn = document.getElementById('testBtn');
  const file = document.getElementById('file');
  const bg = document.getElementById('bg');
  const badge = document.getElementById('badge');
  const debug = document.getElementById('debug');
  const peg = document.getElementById('peg');

  // Mouse follower (desktop)
  document.addEventListener('mousemove', (e)=>{
    if (!peg) return;
    peg.style.left = (e.clientX + 6) + 'px';
    peg.style.top  = (e.clientY + 6) + 'px';
  });

  // Manual background loader
  file.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      bg.style.backgroundImage = "url('" + ev.target.result + "')";
      badge.textContent = "Mapa cargado ✓";
    };
    r.readAsDataURL(f);
  });

  // Streets
  const streets = [
    { id:"prado",   label:"Paseo del Prado",       color:"#dc2626", points:[[480,120],[500,170],[520,230],[540,300],[555,360],[565,420]] },
    { id:"neptuno", label:"Neptuno",                color:"#059669", points:[[420,280],[470,280],[520,280],[580,280]] },
    { id:"galiano", label:"Galiano (Av. Italia)",   color:"#2563eb", points:[[410,240],[450,300],[480,360],[510,420]] },
    { id:"malecon", label:"Malecón",                color:"#a21caf", points:[[350,110],[420,130],[500,140],[600,145],[690,150]] },
    { id:"linea",   label:"Línea",                  color:"#d97706", points:[[650,120],[630,190],[610,260],[600,320],[590,380]] },
    { id:"sanrafael", label:"San Rafael",           color:"#0ea5e9", points:[[300,200],[360,220],[420,240],[480,260],[540,280]] },
    { id:"reina",    label:"Reina",                 color:"#9333ea", points:[[200,250],[280,270],[360,290],[440,310],[520,330],[600,350]] },
    { id:"butler",   label:"Butler St (Lawrenceville)", color:"#14b8a6", points:[[150,500],[230,490],[320,480],[410,470],[500,465],[580,460],[650,455],[720,452]] }
  ];

  const highlightMap = {
    "habana": "prado",
    "otoño": "linea",
    "calles": "reina",
    "avenidas": "neptuno",
    "recorrer": "neptuno",
    "recuerdos": "galiano",
    "mirada": "prado",
    "memoria": "prado",
    "país": "malecon",
    "pais": "malecon",
    "estación": "linea",
    "estacion": "linea",
    "luz": "sanrafael",
    "trópico": "malecon",
    "tropico": "malecon",
    "identidades": "butler",
    "pertenecen": "__ALL__",
    "pertenecen.": "__ALL__"
  };

  const verses = [
    "Ando viajando en el tiempo",
    "La luz es la del trópico",
    "Los árboles de una estación",
    "Que no existe",
    "En La Habana",
    "",
    "El otoño se dispara en mi cabeza",
    "Me hace recorrer aquellas calles",
    "Revivirlas",
    "Mientras deambulo esta casa en Lawrenceville",
    "",
    "No hay país",
    "Solo recuerdos",
    "La mirada ausente",
    "La memoria de cada músculo",
    "Cruzando identidades",
    "Como avenidas",
    "Que solo a mí pertenecen."
  ];

  let hover = null;
  let active = null; // click/tap selection

  function drawStreets() {
    overlay.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    streets.forEach(s => {
      const pl = document.createElementNS(ns, 'polyline');
      pl.setAttribute('fill','none');
      pl.setAttribute('stroke-linecap','round');
      pl.setAttribute('stroke-linejoin','round');
      pl.setAttribute('stroke-width','3');
      const pts = s.points.map(p => p.join(',')).join(' ');
      pl.setAttribute('points', pts);

      const isActiveAll = (hover === "__ALL__") || (active === "__ALL__");
      const isActiveStreet = (hover === s.id) || (active === s.id);
      const on = isActiveAll || isActiveStreet;

      pl.setAttribute('stroke', on ? s.color : 'rgba(0,0,0,.28)');
      pl.setAttribute('opacity', on ? '0.95' : '0.3');
      overlay.appendChild(pl);

      if (on) {
        const tx = document.createElementNS(ns, 'text');
        const last = s.points[s.points.length - 1];
        tx.setAttribute('x', last[0] + 6);
        tx.setAttribute('y', last[1] - 6);
        tx.setAttribute('fill', '#111827');
        tx.setAttribute('font-size', '14');
        tx.setAttribute('font-weight', '600');
        tx.textContent = s.label;
        overlay.appendChild(tx);
      }
    });
  }

  const PUNCT = /[.,;:!?¡¿()\\"“”'’]/g;
  function renderVerse(line) {
    const div = document.createElement('div');
    div.className = 'verse';
    const parts = line.split(/(\\s+)/);
    parts.forEach(p => {
      if (/^\\s+$/.test(p)) { div.appendChild(document.createTextNode(p)); return; }
      const bare = p.replace(PUNCT, "");
      const key = bare.toLowerCase();
      const street = highlightMap[key];
      if (street && bare) {
        const span = document.createElement('span');
        span.className = 'token';
        span.dataset.s = street;
        span.textContent = p;
        span.addEventListener('mouseenter', function() { hover = street; drawStreets(); });
        span.addEventListener('mouseleave', function() { hover = null; drawStreets(); });
        span.addEventListener('click', function() {
          if (active === street) { active = null; span.classList.remove('active'); }
          else {
            active = street;
            document.querySelectorAll('.token.active').forEach(function(t) { t.classList.remove('active'); });
            span.classList.add('active');
          }
          debug.textContent = "Última palabra: " + bare;
          drawStreets();
        });
        div.appendChild(span);
      } else {
        div.appendChild(document.createTextNode(p));
      }
    });
    return div;
  }

  function drawPoem() {
    panel.innerHTML = "";
    verses.forEach(function(line) {
      if (line === "") {
        const br = document.createElement('div');
        br.className = 'verse';
        br.innerHTML = '\\u00A0';
        panel.appendChild(br);
      } else {
        panel.appendChild(renderVerse(line));
      }
    });
  }

  // Test button: flash all
  testBtn.addEventListener('click', function() {
    const prevHover = hover, prevActive = active;
    hover = "__ALL__"; active = "__ALL__";
    debug.textContent = "Última palabra: (probar) TODO";
    drawStreets();
    setTimeout(function() { hover = prevHover; active = prevActive; drawStreets(); }, 1500);
  });

  drawPoem(); drawStreets();
})();
