(() => {
  const PINK = "#FF4EC8";
  const CYAN = "#00E5FF";
  const YELLOW = "#FFE600";
  const LIME = "#7CFF5B";
  const MAGENTA = "#FF2D6A";
  const BLUE = "#4D9CFF";
  const INK = "#F6F6F8";
  const MUTED = "#B9B6C5";
  const FLOOR = "#08070B";
  const JOJO_CHAT = "grokbot://app/v1/agent?id=6afd7123-abe9-417e-8fef-c09903ffbca8";
  const LAUNCH_MS = Date.parse("2026-11-19T00:00:00+01:00");
  const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  const POLL_MS = 3000;

  const AGENTS = [
    { id: "analista", name: "Lucía · Analista de Directos", short: "Lucía", accent: CYAN, hair: "#2B1B12", skin: "#F1C27D", role: "Graba directos y VOD, transcribe y marca picos de chat y audio.", files: ["/workspace/oficina-gta6/clips-seleccionados/"] },
    { id: "seleccionador", name: "Jason · Seleccionador de Clips", short: "Jason", accent: YELLOW, hair: "#111111", skin: "#C68642", role: "Elige los momentos con más potencial y prepara el brief de edición.", files: ["/workspace/oficina-gta6/clips-seleccionados/", "/workspace/oficina-gta6/campañas/reglas.md"] },
    { id: "editor", name: "Tommy · Editor de Vídeo", short: "Tommy", accent: LIME, hair: "#7A3E9D", skin: "#FFDBAC", role: "Corta en vertical 9:16, subtítulos, gancho y marca de agua CrazyMory.", files: ["/workspace/oficina-gta6/listos-para-publicar/", "/workspace/oficina-gta6/muestras/"] },
    { id: "publicador", name: "Lance · Publicador", short: "Lance", accent: MAGENTA, hair: "#E8E8E8", skin: "#8D5524", role: "Sube a TikTok @crazymory y YouTube @CrazyMory, siempre con el OK de Crazy Mory.", files: ["/workspace/oficina-gta6/listos-para-publicar/"] },
    { id: "analista_pub", name: "Sonny · Analista de Publicaciones", short: "Sonny", accent: BLUE, hair: "#3B2A20", skin: "#E0AC69", role: "Mide cada clip publicado y devuelve lo aprendido a Selección.", files: ["/workspace/oficina-gta6/metricas/registro-clips.csv"] },
    { id: "buscador", name: "Ken · Buscador de Campañas y Monetización", short: "Ken", accent: PINK, hair: "#FFB000", skin: "#F1C27D", role: "Busca campañas de clipping y otras formas de ganar dinero desde España.", files: ["/workspace/oficina-gta6/campañas/reglas.md"] },
    { id: "jojo", name: "Genio (coordinador)", short: "Genio", accent: "#FFFFFF", hair: "#F5F5F5", skin: "#FFDBAC", role: "Coordina a los seis agentes y lleva cada clip a la aprobación de Crazy Mory.", files: ["/workspace/oficina-gta6/estado.json"] },
  ];

  const WIDE = {
    w: 960,
    h: 620,
    pos: {
      jojo: { x: 480, y: 148 },
      analista: { x: 126, y: 350 },
      seleccionador: { x: 126, y: 520 },
      editor: { x: 362, y: 445 },
      publicador: { x: 598, y: 445 },
      analista_pub: { x: 834, y: 350 },
      buscador: { x: 834, y: 520 },
    },
    zones: [
      { name: "COORDINACIÓN", x: 240, y: 36, w: 480, h: 192, accent: "#FFFFFF" },
      { name: "DETECCIÓN", x: 12, y: 236, w: 228, h: 372, accent: CYAN },
      { name: "PRODUCCIÓN", x: 248, y: 236, w: 228, h: 372, accent: LIME },
      { name: "PUBLICACIÓN", x: 484, y: 236, w: 228, h: 372, accent: MAGENTA },
      { name: "RESULTADOS", x: 720, y: 236, w: 228, h: 372, accent: BLUE },
    ],
  };
  const NARROW = {
    w: 400,
    h: 488,
    scale: 0.8,
    pos: {
      jojo: { x: 200, y: 118 },
      analista: { x: 60, y: 268 },
      seleccionador: { x: 146, y: 268 },
      editor: { x: 297, y: 268 },
      publicador: { x: 103, y: 422 },
      analista_pub: { x: 254, y: 422 },
      buscador: { x: 340, y: 422 },
    },
    zones: [
      { name: "COORDINACIÓN", x: 10, y: 28, w: 380, h: 144, accent: "#FFFFFF" },
      { name: "DETECCIÓN", x: 10, y: 178, w: 186, h: 148, accent: CYAN },
      { name: "PRODUCCIÓN", x: 204, y: 178, w: 186, h: 148, accent: LIME },
      { name: "PUBLICACIÓN", x: 10, y: 332, w: 186, h: 148, accent: MAGENTA },
      { name: "RESULTADOS", x: 204, y: 332, w: 186, h: 148, accent: BLUE },
    ],
    bubbleMax: {
      jojo: 130,
      analista: 90,
      seleccionador: 90,
      editor: 130,
      publicador: 130,
      analista_pub: 90,
      buscador: 90,
    },
  };

  const FLOW = [
    ["analista", "seleccionador", "Momentos"],
    ["seleccionador", "editor", "Brief"],
    ["editor", "jojo", "Clip para tu OK"],
    ["jojo", "publicador", "Aprobado"],
    ["publicador", "analista_pub", "Publicado"],
    ["analista_pub", "seleccionador", "Qué funciona"],
    ["buscador", "seleccionador", "Campañas"],
  ];

  const ORDER = ["analista", "seleccionador", "editor", "jojo", "buscador", "analista_pub", "publicador"];

  const FALLBACK_STATE = {
    estado: "En pausa",
    tipo: "pausa",
    tarea_actual: "",
    ultima_actualizacion: "",
    progreso: null,
    pasos_hechos: null,
    pasos_totales: null,
    paso_actual: null,
  };

  const els = {
    game: document.getElementById("game"),
    hud: document.getElementById("hud"),
    stamp: document.getElementById("updated-stamp"),
    demoBtn: document.getElementById("demo-btn"),
    demoNote: document.getElementById("demo-note"),
    office: document.getElementById("office"),
    officeWrap: document.getElementById("office-wrap"),
    chips: document.getElementById("chips"),
    panel: document.getElementById("panel"),
    liveBadge: document.getElementById("live-badge"),
    liveText: document.getElementById("live-text"),
  };

  let estado = {
    actualizado: "",
    contadores: { clips_publicados: 0, visualizaciones: 0, ingresos_usd: 0 },
    agentes: {},
    traspasos: [],
  };
  let selected = "editor";
  let demo = false;
  let width = 800;
  let t = 0;
  let lastFetchOk = 0;
  let lastFetchError = false;
  let fetching = false;
  let barFill = {};
  let barFrom = {};
  let barStarted = {};

  function agentById(id) {
    return AGENTS.find((a) => a.id === id) ?? AGENTS[6];
  }

  function stateOf(id) {
    return estado.agentes?.[id] ?? { ...FALLBACK_STATE, ultima_actualizacion: estado.actualizado };
  }

  function labelOf(st, tipo) {
    if (tipo === "pausa") return "Esperando";
    const e = (st && st.estado) || "";
    if (!e || /durm|pausa/i.test(e)) return "Esperando";
    return e;
  }

  function isActiveTipo(t) { return t === "trabajando" || t === "aprobacion"; }
  function anyoneWorking() {
    return Object.values(estado.agentes || {}).some((a) => isActiveTipo(a && a.tipo));
  }
  function officeOpen() {
    const o = estado.oficina;
    return !o || o.abierta !== false || anyoneWorking();
  }

  function tipoOf(s) {
    const typ = s?.tipo;
    if (estado.oficina && estado.oficina.abierta === false) {
      if (isActiveTipo(typ)) return typ;
      const isGenio = s && s === (estado.agentes || {}).jojo;
      return "esperando";
    }
    return typ === "trabajando" || typ === "aprobacion" ? typ : "esperando";
  }

  function barColor(tipo) {
    if (tipo === "trabajando") return LIME;
    if (tipo === "aprobacion") return YELLOW;
    if (tipo === "pausa") return MUTED;
    return CYAN;
  }

  function clampPct(n) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function isWaitingBar(st, tipo) {
    return st.progreso == null && tipo !== "trabajando";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function lerp(a, b, k) {
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  }

  function pad2(n) {
    return n < 10 ? `0${n}` : String(n);
  }

  function fmtMadrid(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    try {
      return new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d) + " (hora de Madrid)";
    } catch {
      return d.toLocaleString("es-ES");
    }
  }

  function ago(iso, now) {
    if (!iso) return "";
    const ms = now - Date.parse(iso);
    if (!Number.isFinite(ms) || ms < 0) return "ahora";
    const m = Math.floor(ms / 60000);
    if (m < 1) return "hace menos de 1 min";
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 48) return `hace ${h} h ${m % 60} min`;
    return `hace ${Math.floor(h / 24)} días`;
  }

  function agoSeconds(from, now) {
    if (!from) return "aún no";
    const s = Math.max(0, Math.floor((now - from) / 1000));
    if (s < 1) return "hace un instante";
    if (s < 60) return `hace ${s} s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    return `hace ${h} h ${m % 60} min`;
  }

  function updateLiveBadge(now) {
    const badge = els.liveBadge;
    const text = els.liveText;
    if (!lastFetchOk && fetching) {
      badge.className = "live-badge is-wait";
      text.textContent = "Conectando…";
      return;
    }
    if (lastFetchError && !lastFetchOk) {
      badge.className = "live-badge is-off";
      text.textContent = "Sin conexión · reintentando…";
      return;
    }
    if (lastFetchError) {
      badge.className = "live-badge is-off";
      text.textContent = "Sin conexión · reintentando…";
      return;
    }
    badge.className = "live-badge is-live";
    text.textContent = "En directo";
  }

  const FIREBASE_ESTADO_URL = "https://oficina-gta6-crazymory-default-rtdb.europe-west1.firebasedatabase.app/estado.json";

  function applyEstado(data) {
    if (!data || typeof data !== "object") throw new Error("json");
    estado = {
      actualizado: data.actualizado || "",
      contadores: {
        clips_publicados: data.contadores?.clips_publicados ?? 0,
        visualizaciones: data.contadores?.visualizaciones ?? 0,
        ingresos_usd: data.contadores?.ingresos_usd ?? 0,
      },
      agentes: data.agentes || {},
      oficina: data.oficina || null,
      traspasos: Array.isArray(data.traspasos) ? data.traspasos : [],
    };
    lastFetchOk = Date.now();
    lastFetchError = false;
    renderStatic();
  }

  async function fetchEstadoFrom(url) {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    applyEstado(data);
  }

  async function fetchEstado() {
    if (fetching) return;
    fetching = true;
    try {
      await fetchEstadoFrom(FIREBASE_ESTADO_URL);
    } catch {
      try {
        await fetchEstadoFrom(`estado.json`);
      } catch {
        lastFetchError = true;
      }
    } finally {
      fetching = false;
      updateLiveBadge(Date.now());
    }
  }

  function handleFirebaseEvent(raw) {
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }
    if (payload && (payload.path === "/" || payload.path === "" || payload.path == null)) {
      if (payload.data == null) {
        lastFetchError = true;
        updateLiveBadge(Date.now());
        fetchEstado();
        return;
      }
      try {
        applyEstado(payload.data);
      } catch {
        lastFetchError = true;
        fetchEstado();
      }
      updateLiveBadge(Date.now());
      return;
    }
    fetchEstado();
  }

  function subscribeEstado() {
    fetchEstado();
    if (typeof EventSource === "undefined") {
      setInterval(fetchEstado, POLL_MS);
      return;
    }
    let es;
    let opened = false;
    let fallbackTimer = 0;
    const startFallbackPoll = () => {
      if (fallbackTimer) return;
      fallbackTimer = setInterval(fetchEstado, POLL_MS);
    };
    const stopFallbackPoll = () => {
      if (!fallbackTimer) return;
      clearInterval(fallbackTimer);
      fallbackTimer = 0;
    };
    const connect = () => {
      try {
        es = new EventSource(FIREBASE_ESTADO_URL);
      } catch {
        startFallbackPoll();
        return;
      }
      const failSafe = setTimeout(() => {
        if (!opened) {
          try { es.close(); } catch {}
          startFallbackPoll();
        }
      }, 8000);
      const onOk = (ev) => {
        opened = true;
        clearTimeout(failSafe);
        stopFallbackPoll();
        handleFirebaseEvent(ev.data);
      };
      es.addEventListener("put", onOk);
      es.addEventListener("patch", onOk);
      es.addEventListener("cancel", () => {
        lastFetchError = true;
        updateLiveBadge(Date.now());
        startFallbackPoll();
      });
      es.onerror = () => {
        lastFetchError = true;
        updateLiveBadge(Date.now());
        if (!opened) {
          clearTimeout(failSafe);
          try { es.close(); } catch {}
          startFallbackPoll();
        }
      };
    };
    connect();
  }

  let barTarget = {};
  function currentFill(id, p, now) {
    if (p == null) {
      delete barFill[id];
      delete barFrom[id];
      delete barStarted[id];
      delete barTarget[id];
      return 0;
    }
    const target = clampPct(p);
    if (barFill[id] == null) {
      barFill[id] = target;
      barFrom[id] = target;
      barTarget[id] = target;
      barStarted[id] = now;
      return target;
    }
    if (barTarget[id] !== target) {
      barFrom[id] = barFill[id];
      barTarget[id] = target;
      barStarted[id] = now;
    }
    const k = Math.min(1, (now - (barStarted[id] || now)) / 700);
    const ease = 1 - Math.pow(1 - k, 2);
    const val = (barFrom[id] ?? 0) + (target - (barFrom[id] ?? 0)) * ease;
    barFill[id] = k >= 1 ? target : val;
    return barFill[id];
  }

  function deskBar(x, y, st, tipo, now) {
    const color = barColor(tipo);
    const p = st.progreso;
    const bw = 50;
    const bh = 7;
    if (isWaitingBar(st, tipo)) {
      return `<g shape-rendering="crispEdges">
        <rect x="${x - 32}" y="${y}" width="64" height="11" fill="#0C0B12" stroke="${color}" stroke-width="1.5"/>
        <text x="${x}" y="${y + 8}" text-anchor="middle" font-size="8" font-family="${MONO}" fill="${color}">en espera</text>
      </g>`;
    }
    const width = p == null ? bw - 4 : ((bw - 4) * clampPct(p)) / 100;
    const label = p == null ? "…" : `${Math.round(clampPct(p))}%`;
    const left = x - 36;
    const fill = p == null
      ? `<rect x="${left + 2}" y="${y + 1.5}" width="${bw - 4}" height="${bh - 3}" fill="url(#barra-indet)"/>`
      : `<g>
          <rect x="${left + 2}" y="${y + 1.5}" width="${Math.max(0, width)}" height="${bh - 3}" fill="${color}"/>
          ${width > 2 ? `<rect x="${left + 2}" y="${y + 1.5}" width="${Math.max(0, width)}" height="1.5" fill="#fff" opacity="0.35"/>` : ""}
        </g>`;
    return `<g shape-rendering="crispEdges">
      <rect x="${left}" y="${y}" width="${bw}" height="${bh}" fill="#0C0B12" stroke="${color}" stroke-width="1.5"/>
      ${fill}
      <text x="${left + bw + 4}" y="${y + 7}" font-size="8" font-family="${MONO}" fill="${INK}">${esc(label)}</text>
    </g>`;
  }

  function sprite(x, y, agent, now, seed, tipo, walking, seated) {
    const working = tipo === "trabajando";
    const paused = tipo === "pausa";
    const bob = paused ? 0 : walking ? Math.abs(Math.sin(now / 110)) * -3 : Math.sin(now / (working ? 260 : 520) + seed) * 1.6;
    const arm = walking ? Math.sin(now / 110) * 4 : working ? (Math.sin(now / 70 + seed) > 0 ? 2 : -1) : 0;
    const leg = walking ? Math.sin(now / 110) * 3 : 0;
    const blink = Math.sin(now / 900 + seed * 3) > 0.97;
    const top = y - 50 + bob + (paused ? 3 : 0);
    const isJojo = agent.id === "jojo";
    const eyeH = blink || paused ? 1 : 4;
    const crown = isJojo ? `
      <rect x="${x - 12}" y="${top - 6}" width="4" height="6" fill="${YELLOW}"/>
      <rect x="${x - 2}" y="${top - 8}" width="4" height="8" fill="${YELLOW}"/>
      <rect x="${x + 8}" y="${top - 6}" width="4" height="6" fill="${YELLOW}"/>
      <rect x="${x - 12}" y="${top - 2}" width="24" height="3" fill="${YELLOW}"/>` : "";
    const legs = seated ? "" : `
      <rect x="${x - 10}" y="${top + 40}" width="8" height="${10 + leg}" fill="#1A1A22"/>
      <rect x="${x + 2}" y="${top + 40}" width="8" height="${10 - leg}" fill="#1A1A22"/>`;
    return `<g shape-rendering="crispEdges">
      <ellipse cx="${x}" cy="${y + (seated ? 4 : 12)}" rx="16" ry="4" fill="#000" opacity="0.45"/>
      ${legs}
      <rect x="${x - 14}" y="${top + 22}" width="28" height="20" fill="${agent.accent}"/>
      <rect x="${x - 14}" y="${top + 22}" width="28" height="4" fill="#ffffff" opacity="0.25"/>
      <rect x="${x - 19}" y="${top + 24 + arm}" width="5" height="13" fill="${agent.accent}"/>
      <rect x="${x + 14}" y="${top + 24 - arm}" width="5" height="13" fill="${agent.accent}"/>
      <rect x="${x - 19}" y="${top + 36 + arm}" width="5" height="4" fill="${agent.skin}"/>
      <rect x="${x + 14}" y="${top + 36 - arm}" width="5" height="4" fill="${agent.skin}"/>
      <rect x="${x - 12}" y="${top + 6}" width="24" height="17" fill="${agent.skin}"/>
      <rect x="${x - 13}" y="${top}" width="26" height="8" fill="${agent.hair}"/>
      <rect x="${x - 13}" y="${top + 6}" width="4" height="8" fill="${agent.hair}"/>
      <rect x="${x + 9}" y="${top + 6}" width="4" height="8" fill="${agent.hair}"/>
      <rect x="${x - 7}" y="${top + 12}" width="4" height="${eyeH}" fill="#111"/>
      <rect x="${x + 3}" y="${top + 12}" width="4" height="${eyeH}" fill="#111"/>
      <rect x="${x - 3}" y="${top + 19}" width="6" height="1.5" fill="#7a2a2a"/>
      ${crown}
    </g>`;
  }

  function desk(x, y, agent, now, tipo) {
    const glow = tipo === "trabajando" ? 0.55 + 0.45 * Math.abs(Math.sin(now / 180)) : 0.25;
    const typing = tipo === "trabajando"
      ? `<rect x="${x - 38 + ((Math.floor(now / 90) % 5) * 4)}" y="${y + 4}" width="4" height="6" fill="${agent.accent}"/>`
      : "";
    return `<g shape-rendering="crispEdges">
      <rect x="${x - 46}" y="${y - 6}" width="92" height="30" rx="3" fill="#15131C" stroke="${agent.accent}" stroke-width="2"/>
      <rect x="${x - 46}" y="${y - 6}" width="92" height="5" fill="${agent.accent}" opacity="0.35"/>
      <rect x="${x + 14}" y="${y - 22}" width="26" height="17" fill="#0B0B10" stroke="${agent.accent}" stroke-width="1.5"/>
      <rect x="${x + 17}" y="${y - 19}" width="20" height="11" fill="${agent.accent}" opacity="${glow}"/>
      <rect x="${x + 25}" y="${y - 5}" width="4" height="3" fill="#444"/>
      <rect x="${x - 38}" y="${y + 4}" width="22" height="6" fill="#2A2733"/>
      ${typing}
    </g>`;
  }

  function bubble(x, y, text, tipo, accent, now, maxW) {
    const icon = tipo === "trabajando" ? "●" : tipo === "aprobacion" ? "!" : tipo === "pausa" ? "z" : "…";
    const color = tipo === "aprobacion" ? YELLOW : tipo === "pausa" ? MUTED : tipo === "trabajando" ? LIME : CYAN;
    let shown = String(text ?? "");
    if (maxW) {
      const extra = icon.length + 1;
      const maxChars = Math.max(6, Math.floor((maxW - 16) / 6.6) - extra);
      if (shown.length > maxChars) {
        const cut = shown.slice(0, Math.max(1, maxChars - 1));
        const sp = cut.lastIndexOf(" ");
        shown = `${(sp >= 8 ? cut.slice(0, sp) : cut).trim()}…`;
      }
    }
    const label = `${icon} ${shown}`;
    const w = Math.max(64, Math.min(maxW || 1e9, label.length * 6.6 + 16));
    const floatY = Math.sin(now / 600 + x) * 1.5;
    const pulse = tipo === "trabajando" ? 0.6 + 0.4 * Math.abs(Math.sin(now / 300)) : 1;
    return `<g transform="translate(0 ${floatY})">
      <rect x="${x - w / 2}" y="${y - 18}" width="${w}" height="20" rx="6" fill="#0C0B12" stroke="${accent}" stroke-width="1.5"/>
      <polygon points="${x - 5},${y + 2} ${x + 5},${y + 2} ${x},${y + 8}" fill="${accent}"/>
      <text x="${x}" y="${y - 4}" text-anchor="middle" font-size="11" font-family="${MONO}" fill="${INK}">
        <tspan fill="${color}" opacity="${pulse}">${esc(icon)}</tspan> ${esc(shown)}
      </text>
    </g>`;
  }

  function packet(x, y, accent) {
    return `<g shape-rendering="crispEdges">
      <rect x="${x - 9}" y="${y - 7}" width="18" height="14" fill="#F6F6F8" stroke="${accent}" stroke-width="2"/>
      <polygon points="${x - 3},${y - 4} ${x - 3},${y + 4} ${x + 4},${y}" fill="${accent}"/>
    </g>`;
  }

  function zoneFloor(zones, narrow) {
    const size = narrow ? 8 : 9;
    const tracking = narrow ? 1.8 : 2.2;
    return (zones || []).map((z) => {
      const lx = z.x + z.w / 2;
      const anchor = "middle";
      return `
      <g pointer-events="none">
        <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="5" fill="${z.accent}" opacity="0.045"/>
        <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="5" fill="none" stroke="${z.accent}" stroke-width="1.15" stroke-opacity="0.4"/>
        <text x="${lx}" y="${z.y + 15}" text-anchor="${anchor}" font-size="${size}" font-family="${MONO}" font-weight="700" letter-spacing="${tracking}" fill="${z.accent}" opacity="0.85">${esc(z.name)}</text>
      </g>`;
    }).join("");
  }

  function renderOffice(now) {
    const narrow = width < 560;
    const L = narrow ? NARROW : WIDE;
    const P = L.pos;
    const CYCLE = 6000;
    const phase = (now % CYCLE) / CYCLE;
    const handoffs = (estado.oficina && estado.oficina.abierta === false) ? [] : (estado.traspasos || []);

    const active = demo
      ? [FLOW[Math.floor(now / CYCLE) % FLOW.length]]
      : handoffs
          .filter((h) => h.activo && h.de in P && h.a in P)
          .map((h) => [h.de, h.a, h.que]);

    const s = L.scale || 1;
    const foot = 34 * s;
    const walkers = {};
    active.forEach(([from, to, label]) => {
      const a = { x: P[from].x, y: P[from].y + foot };
      const b = { x: P[to].x, y: P[to].y + foot };
      let k = 0;
      if (phase < 0.45) k = (phase / 0.45) * 0.78;
      else if (phase < 0.55) k = 0.78;
      else k = 0.78 * (1 - (phase - 0.55) / 0.45);
      walkers[from] = { pos: lerp(a, b, k), carrying: phase < 0.5, to, label };
    });

    const signX = L.w / 2 + Math.sin(now / 97) * (Math.sin(now / 1300) > 0.9 ? 2 : 0);
    const dash = -((now / 40) % 12);
    const lines = FLOW.map(([a, b], i) => {
      const isActive = active.some(([f, to]) => f === a && to === b);
      const accent = isActive ? agentById(a).accent : PINK;
      return `<line x1="${P[a].x}" y1="${P[a].y + foot}" x2="${P[b].x}" y2="${P[b].y + foot}" stroke="${accent}" stroke-opacity="${isActive ? 0.9 : 0.22}" stroke-width="${isActive ? 2.5 : 1.5}" stroke-dasharray="6 6" stroke-dashoffset="${dash}"/>`;
    }).join("");

    const desks = ORDER.map((id, i) => {
      const agent = agentById(id);
      const st = stateOf(id);
      const tipo = tipoOf(st);
      const p = P[id];
      const walker = walkers[id];
      const isSel = selected === id;
      const sel = isSel
        ? `<rect x="${p.x - 54}" y="${p.y - 62}" width="108" height="118" rx="8" fill="none" stroke="${agent.accent}" stroke-width="2" stroke-dasharray="4 4" opacity="${0.6 + 0.4 * Math.sin(now / 200)}"/>`
        : "";
      const seatedSprite = walker ? "" : sprite(p.x - 10, p.y, agent, now, i * 1.7, tipo, false, true);
      const cluster = `
        <rect x="${p.x - 60}" y="${p.y - 80}" width="120" height="148" fill="transparent"/>
        ${sel}
        ${seatedSprite}
        ${desk(p.x, p.y, agent, now, walker ? "esperando" : tipo)}
        <text x="${p.x}" y="${p.y + 44}" text-anchor="middle" font-size="11" font-family="${MONO}" fill="${MUTED}">${esc(agent.short)}</text>
        ${deskBar(p.x, p.y + 50, st, tipo, now)}
        ${bubble(p.x, p.y - 62, labelOf(st, tipo), tipo, agent.accent, now, L.bubbleMax && L.bubbleMax[id])}`;
      const xf = s === 1 ? "" : ` transform="translate(${p.x} ${p.y}) scale(${s}) translate(${-p.x} ${-p.y})"`;
      return `<g data-agent="${id}" style="cursor:pointer"${xf}>${cluster}
      </g>`;
    }).join("");

    const walkerSvg = Object.keys(walkers).map((id) => {
      const w = walkers[id];
      const agent = agentById(id);
      const tp = P[w.to];
      const packCarry = packet(w.pos.x, w.pos.y - 62, agent.accent);
      const packDesk = packet(tp.x - 30, tp.y - 8, agent.accent);
      const xfW = s === 1 ? "" : ` transform="translate(${w.pos.x} ${w.pos.y}) scale(${s}) translate(${-w.pos.x} ${-w.pos.y})"`;
      const xfD = s === 1 ? "" : ` transform="translate(${tp.x} ${tp.y}) scale(${s}) translate(${-tp.x} ${-tp.y})"`;
      return `<g pointer-events="none">
        <g${xfW}>
          ${sprite(w.pos.x, w.pos.y, agent, now, 1, "trabajando", true, false)}
          ${w.carrying ? packCarry : ""}
        </g>
        ${w.carrying ? "" : `<g${xfD}>${packDesk}</g>`}
      </g>`;
    }).join("");

    els.office.setAttribute("viewBox", `0 0 ${L.w} ${L.h}`);
    els.office.innerHTML = `
      <defs>
        <pattern id="tiles" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="${FLOOR}"/>
          <rect width="32" height="32" fill="none" stroke="${PINK}" stroke-opacity="0.08"/>
          <rect x="2" y="2" width="2" height="2" fill="${PINK}" opacity="0.12"/>
        </pattern>
        <pattern id="barra-indet" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="translate(${(now / 25) % 8} 0)">
          <rect width="8" height="8" fill="#0C0B12"/>
          <rect x="-3" y="0" width="4" height="8" fill="${LIME}" transform="skewX(-30)"/>
          <rect x="5" y="0" width="4" height="8" fill="${LIME}" transform="skewX(-30)"/>
        </pattern>
      </defs>
      <rect width="${L.w}" height="${L.h}" fill="url(#tiles)"/>
      <rect x="4" y="4" width="${L.w - 8}" height="${L.h - 8}" fill="none" stroke="${PINK}" stroke-width="3" opacity="0.7"/>
      ${zoneFloor(L.zones, narrow)}
      <rect x="0" y="20" width="30" height="7" fill="${CYAN}"/>
      <rect x="${L.w - 40}" y="30" width="40" height="6" fill="${MAGENTA}"/>
      <rect x="0" y="${L.h - 30}" width="24" height="5" fill="${LIME}"/>
      <rect x="${L.w - 26}" y="${L.h - 22}" width="22" height="5" fill="${YELLOW}"/>
      <rect x="${L.w / 2 - (narrow ? 54 : 70)}" y="${narrow ? 6 : 10}" width="${narrow ? 108 : 140}" height="${narrow ? 16 : 22}" fill="#0C0B12" stroke="${PINK}"/>
      <text x="${signX}" y="${narrow ? 18 : 26}" text-anchor="middle" font-size="${narrow ? 10 : 13}" font-family="${MONO}" font-weight="700" fill="${PINK}" letter-spacing="${narrow ? 2 : 3}">CRAZYMORY</text>
      ${lines}
      ${desks}
      ${walkerSvg}
    `;
  }

  function renderHud(now) {
    const rem = Math.max(0, LAUNCH_MS - Date.now());
    const d = Math.floor(rem / 86400000);
    const h = Math.floor((rem % 86400000) / 3600000);
    const m = Math.floor((rem % 3600000) / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    const c = estado.contadores;
    const compactHud = width < 560;
    const tiles = compactHud
      ? [
          ["Clips", String(c.clips_publicados ?? 0), CYAN],
          ["Vistas", Number(c.visualizaciones ?? 0).toLocaleString("es-ES"), YELLOW],
          ["Ingresos", `${c.ingresos_usd ?? 0} $`, LIME],
        ]
      : [
          ["Clips publicados", String(c.clips_publicados ?? 0), CYAN],
          ["Visualizaciones", Number(c.visualizaciones ?? 0).toLocaleString("es-ES"), YELLOW],
          ["Ingresos", `${c.ingresos_usd ?? 0} $`, LIME],
        ];
    els.hud.innerHTML = `
      <div class="hud">
        <div class="hud-tiles">
          ${tiles.map(([label, value, col]) => `
            <div class="tile" style="border-color:${col}">
              <div class="value" style="text-shadow:0 0 8px ${col}">${esc(value)}</div>
              <div class="label">${esc(label)}</div>
            </div>`).join("")}
        </div>
        <div class="launch">
          <div class="kicker">${rem === 0 ? "GTA VI ya ha salido" : (compactHud ? "GTA VI" : "Lanzamiento de GTA VI")}</div>
          <div class="clock">${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}</div>
          <div class="sub">19 nov 2026, 00:00 · hora de Madrid</div>
        </div>
      </div>`;
  }

  function renderPanel(nowClock, wallNow) {
    const agent = agentById(selected);
    const st = stateOf(selected);
    const tipo = tipoOf(st);
    const color = barColor(tipo);
    const outgoing = (estado.traspasos || []).filter((h) => h.de === selected && h.activo);
    const incoming = (estado.traspasos || []).filter((h) => h.a === selected && h.activo);
    const line = (k, v) => `<div class="line"><span class="k">${esc(k)}</span><span class="v">${v}</span></div>`;
    const steps = st.pasos_hechos != null && st.pasos_totales != null ? `paso ${st.pasos_hechos} de ${st.pasos_totales}` : null;
    let progressHtml;
    if (isWaitingBar(st, tipo)) {
      progressHtml = `<div class="line" style="margin:4px 0"><span class="k">Progreso</span><span class="v" style="color:${color};font-family:${MONO};letter-spacing:0.06em">en espera</span></div>`;
    } else {
      const p = st.progreso;
      const fill = currentFill(selected, p, wallNow);
      const fillHtml = p == null
        ? `<div class="bar-indet" style="background-image:repeating-linear-gradient(-45deg, ${color} 0 8px, #16141C 8px 16px);background-position:${Math.floor((nowClock / 20) % 22)}px 0"></div>`
        : `<div class="bar-fill" style="width:${fill}%;--bar:${color};background:${color}"></div>`;
      progressHtml = `<div class="progress">
        <div class="progress-meta">
          <span class="left">${esc(steps ?? (p == null ? "en curso" : "Progreso"))}</span>
          <span class="right" style="color:${color}">${p == null ? "…" : `${Math.round(clampPct(p))}%`}</span>
        </div>
        <div class="bar-track" style="border-color:${color}">${fillHtml}</div>
        ${st.paso_actual ? `<div class="paso">${esc(st.paso_actual)}</div>` : ""}
      </div>`;
    }
    const jojoBtn = selected === "jojo"
      ? `<div><a class="jojo-btn" href="${JOJO_CHAT}" aria-label="Hablar con Genio">Hablar con Genio</a></div>`
      : "";
    const updated = st.ultima_actualizacion
      ? `${esc(fmtMadrid(st.ultima_actualizacion))}, ${esc(ago(st.ultima_actualizacion, wallNow))}`
      : "—";
    els.panel.style.setProperty("--accent", agent.accent);
    els.panel.className = "panel";
    els.panel.innerHTML = `
      <div class="panel-head">
        <strong>${esc(agent.name)}</strong>
        <span class="panel-status">${esc(labelOf(st, tipoOf(st)).toUpperCase())}</span>
      </div>
      <div class="role">${esc(agent.role)}</div>
      ${line("Tarea actual", esc(st.tarea_actual || "—"))}
      ${progressHtml}
      ${outgoing.map((h) => line("Entrega", `${esc(h.que)} → ${esc(agentById(h.a).short)}`)).join("")}
      ${incoming.map((h) => line("Recibe", `${esc(h.que)} ← ${esc(agentById(h.de).short)}`)).join("")}
      ${line("Archivos", esc(agent.files.join(" · ")))}
      ${line("Último cambio", updated)}
      ${jojoBtn}
    `;
  }

  function renderChips() {
    els.chips.innerHTML = AGENTS.map((a) => `
      <button type="button" class="chip" data-agent="${a.id}" aria-pressed="${selected === a.id}" style="--accent:${a.accent};border-color:${selected === a.id ? a.accent : "#2A2733"}">${esc(a.short)}</button>
    `).join("");
  }

  function renderStamp(wallNow) {
    if (!estado.actualizado) {
      els.stamp.textContent = "Cargando estado…";
      return;
    }
    els.stamp.textContent = `Actualizado: ${fmtMadrid(estado.actualizado)} · ${ago(estado.actualizado, wallNow)}`;
  }

  function renderSign() {
    const el = document.getElementById("office-sign");
    if (!el) return;
    const o = estado.oficina;
    if (!o) { el.hidden = true; return; }
    el.hidden = false;
    const open = officeOpen();
    el.className = "office-sign " + (open ? "is-open" : "is-closed");
    el.textContent = open ? "ABIERTA" : "CERRADA";
    el.title = o.mensaje || "";
  }

  function renderStatic() {
    renderSign();
    renderChips();
    els.demoBtn.classList.toggle("is-on", demo);
    els.demoBtn.textContent = demo ? "Volver al estado real" : "Ver demo del flujo";
    els.demoNote.hidden = !demo;
    const nowClock = t;
    const wallNow = Date.now();
    renderHud(nowClock);
    renderPanel(nowClock, wallNow);
    renderStamp(wallNow);
  }

  function select(id) {
    if (!AGENTS.some((a) => a.id === id)) return;
    selected = id;
    renderStatic();
  }

  els.office.addEventListener("click", (ev) => {
    const g = ev.target.closest("[data-agent]");
    if (g) select(g.getAttribute("data-agent"));
  });

  els.chips.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-agent]");
    if (btn) select(btn.getAttribute("data-agent"));
  });

  els.demoBtn.addEventListener("click", () => {
    demo = !demo;
    renderStatic();
  });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) width = e.contentRect.width;
    });
    ro.observe(els.game);
    width = els.game.getBoundingClientRect().width;
  } else {
    width = els.game.getBoundingClientRect().width;
    window.addEventListener("resize", () => {
      width = els.game.getBoundingClientRect().width;
    });
  }

  let last = 0;
  function loop(ms) {
    if (ms - last > 33) {
      last = ms;
      t = ms;
      const wallNow = Date.now();
      renderOffice(ms);
      renderHud(ms);
      renderPanel(ms, wallNow);
      renderStamp(wallNow);
      updateLiveBadge(wallNow);
    }
    requestAnimationFrame(loop);
  }

  renderStatic();
  requestAnimationFrame(loop);
  subscribeEstado();
})();
