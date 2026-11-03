/* DEMOSTRACIÓN ESTÁTICA de «Avances TI».
 *
 * GitHub Pages solo sirve archivos: no puede ejecutar `server.js`. Este script se carga ANTES que el del tablero y hace dos
 * cosas: (1) responde a las llamadas `fetch('/api/…')` con datos de ejemplo que viven en la memoria de la pestaña, y (2) imita
 * el canal en vivo (`EventSource`). Así la MISMA interfaz funciona sin servidor. Todo es inventado; nada se guarda: al
 * recargar vuelve al inicio.
 */
(() => {
  const hoy = new Date();
  const dia = n => { const x = new Date(hoy); x.setDate(x.getDate() + n); return x.toLocaleDateString('en-CA'); };
  const iso = (n, h = 10) => { const x = new Date(hoy); x.setDate(x.getDate() + n); x.setHours(h, 0, 0, 0); return x.toISOString(); };

  /* ---------- personas ---------- */
  const people = { 'demo-ana': 'Ana Torres (demo)', 'demo-bruno': 'Bruno Salas (demo)', 'demo-carla': 'Carla Vega (demo)' };
  const YO = 'demo-ana';
  const me = { user: { login: YO, name: people[YO], avatar: '', admin: false, github: YO, argus: { username: 'ana@ejemplo.test', nombre: people[YO] } }, deviceFlow: false, org: 'Goberna-Lab' };

  /* ---------- proyectos y su historial ---------- */
  let n = 0; const uid = () => 'demo' + (++n).toString(36) + Math.random().toString(36).slice(2, 5);
  const proyectos = [
    { name: 'Portal de clientes', description: 'Autoservicio para que los clientes consulten y descarguen sus documentos.', owner: 'Ana Torres (demo)', ghUser: '', repo: 'portal-clientes', start: dia(-45), end: dia(15), progress: 72, status: 'en-curso', createdBy: YO },
    { name: 'Migración a la nube', description: 'Mover los servicios internos a la nueva infraestructura.', owner: 'Bruno Salas (demo)', ghUser: '', repo: 'migracion-nube', start: dia(-60), end: dia(4), progress: 35, status: 'en-riesgo', createdBy: 'demo-bruno' },
    { name: 'App móvil de campo', description: 'Registro de visitas desde el teléfono, también sin conexión.', owner: 'Carla Vega (demo)', ghUser: '', repo: '', start: dia(6), end: dia(70), progress: 5, status: 'planificado', createdBy: 'demo-carla' },
    { name: 'Panel de métricas', description: 'Tablero con indicadores semanales para la gerencia.', owner: 'Ana Torres (demo)', ghUser: '', repo: 'panel-metricas', start: dia(-95), end: dia(-12), progress: 100, status: 'completado', createdBy: YO },
  ].map(p => ({ id: uid(), lastSync: null, updated: iso(-1), tasks: [], ...p }));

  const quien = ['demo-ana', 'demo-bruno', 'demo-carla'];
  const tareas = [
    ['Formulario de registro con validación', 'Función'], ['Corrige el cierre de sesión que no limpiaba la caché', 'Corrección'],
    ['Documentación de la API pública', 'Documentación'], ['Pantalla de descarga de documentos', 'Función'], ['Prueba del flujo de recuperación de clave', 'Pruebas'],
    ['Rediseño de la tabla de documentos', 'Función'], ['Ajuste de permisos por tipo de cliente', 'Corrección'], ['Mejora de rendimiento en la lista', 'Rendimiento'],
    ['Aviso por correo cuando hay un documento nuevo', 'Función'], ['Actualización de dependencias', 'Mantenimiento'], ['Búsqueda por nombre y fecha', 'Función'], ['Corrige el orden de las fechas', 'Corrección'],
  ];
  proyectos.forEach((p, pi) => {
    if (!p.repo) return;
    const k = pi === 0 ? 12 : pi === 1 ? 6 : 5;
    for (let i = 0; i < k; i++) {
      const t = tareas[(i + pi * 3) % tareas.length], esPr = i % 3 !== 2, u = quien[(i + pi) % 3], ago = -(2 + i * 4 + pi);
      p.tasks.push(esPr
        ? { id: 'pr-' + (100 + i + pi * 20), kind: 'pr', n: 100 + i + pi * 20, title: t[0], type: t[1], url: '#', user: u, avatar: '', state: i === 0 ? 'open' : 'merged', date: iso(ago), ref: 'PR #' + (100 + i + pi * 20), nCommits: 2 + (i % 3),
            commits: [{ sha: 'a1b2c3' + i, msg: 'feat: ' + t[0].toLowerCase(), url: '#' }, { sha: 'd4e5f6' + i, msg: 'test: cubre el caso principal', url: '#' }] }
        : { id: 'c-' + pi + i + 'abcdef0', kind: 'commit', sha: pi + i + 'abcdef0', title: t[0], type: t[1], url: '#', user: u, avatar: '', state: 'commit', date: iso(ago), ref: 'Commit ' + pi + i + 'abcdef', hidden: false });
    }
    p.lastSync = iso(-1);
  });
  const vista = p => { const { tasks, ...r } = p; const ok = tasks.filter(t => !t.hidden); return { ...r, nTasks: ok.length, nDone: ok.filter(t => t.state === 'merged' || t.kind === 'commit').length }; };

  /* ---------- repositorios de ejemplo ---------- */
  const repos = [['portal-clientes', 'Portal de autoservicio para clientes', -120], ['migracion-nube', 'Scripts y guías de la migración', -150], ['panel-metricas', 'Tablero semanal de indicadores', -200], ['app-campo', 'App móvil de visitas', -20],
    ['sitio-web', 'Sitio institucional', -400], ['automatizaciones', 'Tareas programadas del equipo', -300], ['documentacion', 'Manuales y guías internas', -500], ['pruebas-carga', 'Pruebas de carga y rendimiento', -90]]
    .map(([name, description, c], i) => ({ name, private: i % 2 === 0, description, pushed: iso(-i), created: iso(c) }));

  /* ---------- Argus de ejemplo (conectado) ---------- */
  const T = (titulo, estado, vence, cierra, extra = {}) => ({ id: uid(), titulo, proyecto: { id: 'p', nombre: 'Operaciones' }, columna: estado === 'terminada' ? 'Finalizado' : 'En proceso', estado, prioridad: 1, creadaEl: iso(-30), inicioEl: null,
    venceEl: vence === null ? null : iso(vence, 12), terminadaEl: cierra === null ? null : iso(cierra, 16), sinFecha: vence === null, aTiempo: null, vencida: null, horasDedicadas: 2, horasEstimadas: 3, enlace: '#', ...extra });
  const argusT = [
    T('Revisar el informe mensual', 'terminada', -9, -10, { aTiempo: true }), T('Actualizar el inventario de equipos', 'terminada', -12, -8, { aTiempo: false }), T('Preparar la capacitación del equipo', 'terminada', -5, -6, { aTiempo: true }),
    T('Cerrar los pendientes de soporte', 'terminada', -3, -3, { aTiempo: true }), T('Renovar las licencias', 'pendiente', -2, null, { vencida: true }), T('Documentar el proceso de respaldo', 'pendiente', 6, null, { vencida: false }),
    T('Reunión con proveedores', 'pendiente', 12, null, { vencida: false }), T('Ordenar el archivo compartido', 'pendiente', null, null),
  ];
  let argus = { conectado: true, usuario: { nombre: people[YO], username: 'ana@ejemplo.test', email: 'ana@ejemplo.test' }, desde: dia(-30), hasta: dia(30), syncedAt: iso(0, 8) };
  const resumenArgus = () => {
    const te = argusT.filter(t => t.estado === 'terminada'), pe = argusT.filter(t => t.estado === 'pendiente'), cp = te.filter(t => t.aTiempo !== null);
    return { terminadas: te.length, pendientes: pe.length, pendientesVencidas: pe.filter(t => t.vencida === true).length, pendientesSinFecha: pe.filter(t => t.sinFecha).length, terminadasATiempo: cp.filter(t => t.aTiempo).length, terminadasConPlazo: cp.length };
  };
  const estadoArgus = () => {
    if (!argus.conectado) return { conectado: false, argusUrl: 'https://argus.ejemplo.test', usuario: null, desde: '', hasta: '', syncedAt: null, resumen: null, truncado: false, cumplimiento: null, soporta: true, oauth: false };
    const r = resumenArgus(), base = r.terminadasConPlazo + r.pendientesVencidas;
    return { ...argus, argusUrl: 'https://argus.ejemplo.test', resumen: r, truncado: false, cumplimiento: base ? Math.round(r.terminadasATiempo / base * 100) : null, soporta: true, oauth: false };
  };

  /* ---------- canal en vivo falso ---------- */
  const vivos = new Set();
  class ES {
    constructor() { this.l = {}; vivos.add(this); setTimeout(() => { this.onopen && this.onopen(); this.emitir(); this.l.people && this.l.people.forEach(f => f({ data: JSON.stringify(people) })); }, 40); }
    addEventListener(t, f) { (this.l[t] = this.l[t] || []).push(f); }
    emitir() { this.onmessage && this.onmessage({ data: JSON.stringify(proyectos.map(vista)) }); }
    close() { vivos.delete(this); }
  }
  window.EventSource = ES;
  const difundir = () => vivos.forEach(e => e.emitir());
  const difundirPersonas = () => vivos.forEach(e => e.l.people && e.l.people.forEach(f => f({ data: JSON.stringify(people) })));

  /* ---------- las rutas ---------- */
  const resp = (cuerpo, estado = 200) => Promise.resolve(new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json' } }));
  const limpiar = b => ({ name: String(b.name || '').slice(0, 120).trim(), description: String(b.description || '').slice(0, 500), owner: String(b.owner || '').slice(0, 80), ghUser: '', repo: String(b.repo || ''),
    start: b.start || '', end: b.end || '', progress: Math.max(0, Math.min(100, parseInt(b.progress) || 0)), status: b.status || 'en-curso' });
  const real = window.fetch.bind(window);
  window.fetch = (url, opt = {}) => {
    const u = new URL(String(url), location.href);
    if (!u.pathname.includes('/api/') || u.origin !== location.origin) return real(url, opt);
    const ruta = u.pathname.slice(u.pathname.indexOf('/api/')), m = (opt.method || 'GET').toUpperCase();
    let b = {}; try { b = opt.body ? JSON.parse(opt.body) : {}; } catch { /* sin cuerpo */ }
    let x;
    if (ruta === '/api/projects' && m === 'GET') return resp(proyectos.map(vista));
    if (ruta === '/api/projects' && m === 'POST') { const p = { id: uid(), lastSync: null, updated: iso(0), tasks: [], createdBy: YO, ...limpiar(b) }; proyectos.push(p); difundir(); return resp(vista(p), 201); }
    if ((x = ruta.match(/^\/api\/projects\/(\w+)$/))) {
      const i = proyectos.findIndex(p => p.id === x[1]); if (i < 0) return resp({ error: 'No existe' }, 404);
      if (m === 'PUT') { Object.assign(proyectos[i], limpiar(b)); difundir(); return resp(vista(proyectos[i])); }
      if (m === 'DELETE') { proyectos.splice(i, 1); difundir(); return resp({ ok: true }); }
    }
    if ((x = ruta.match(/^\/api\/projects\/(\w+)\/tasks(?:\/([\w.-]+))?$/))) {
      const p = proyectos.find(q => q.id === x[1]); if (!p) return resp({ error: 'No existe' }, 404);
      if (!x[2] && m === 'GET') return resp([...p.tasks].sort((a, c) => (a.date < c.date ? 1 : -1)));
      const t = p.tasks.find(q => q.id === x[2]); if (!t) return resp({ error: 'Tarea no encontrada' }, 404);
      if (m === 'PATCH') { if (typeof b.hidden === 'boolean') t.hidden = b.hidden; if (b.title) { t.title = String(b.title).slice(0, 160); t.edited = true; } difundir(); return resp(t); }
    }
    if ((x = ruta.match(/^\/api\/projects\/(\w+)\/sync$/)) && m === 'POST') { const p = proyectos.find(q => q.id === x[1]); if (p) p.lastSync = iso(0); difundir(); return resp({ added: 0, updated: p ? p.tasks.length : 0, total: p ? p.tasks.length : 0, prs: 0, commits: 0 }); }
    if (ruta === '/api/timeline') { const lim = Math.min(30, parseInt(u.searchParams.get('limit')) || 8);
      return resp(proyectos.flatMap(p => p.tasks.filter(t => !t.hidden && t.state !== 'closed').map(t => ({ ...t, commits: undefined, project: p.name, projectId: p.id }))).sort((a, c) => (a.date < c.date ? 1 : -1)).slice(0, lim)); }
    if (ruta === '/api/me') return resp(me);
    if (ruta === '/api/people') return resp(people);
    if (ruta === '/api/me/profile' && m === 'PUT') { const nombre = String(b.name || '').trim().slice(0, 60); if (nombre) people[YO] = nombre; me.user.name = people[YO]; difundirPersonas(); return resp({ name: nombre }); }
    if (ruta === '/api/gh/repos') return resp(repos);
    if (ruta === '/api/gh/members') return resp(Object.keys(people).map(login => ({ login, avatar: '' })));
    if ((x = ruta.match(/^\/api\/gh\/activity\/([\w.-]+)$/))) {
      const p = proyectos.find(q => q.repo === x[1]); const ts = p ? p.tasks : [];
      return resp({ prs: ts.filter(t => t.kind === 'pr').map(t => ({ n: t.n, title: t.title, url: '#', user: t.user, avatar: '', state: t.state, draft: false, updated: t.date })),
        commits: ts.filter(t => t.kind === 'commit').map(t => ({ sha: t.sha.slice(0, 7), url: '#', msg: t.title, user: t.user, avatar: '', date: t.date })) });
    }
    if (ruta === '/api/argus/estado') return resp(estadoArgus());
    if (ruta === '/api/argus/tareas') return resp({ ...estadoArgus(), tareas: argus.conectado ? argusT : [] });
    if (ruta === '/api/argus/rango' && m === 'PUT') { argus.desde = b.desde; argus.hasta = b.hasta; argus.syncedAt = iso(0, 9); return resp(estadoArgus()); }
    if (ruta === '/api/argus/sync' && m === 'POST') { argus.syncedAt = new Date().toISOString(); return resp(estadoArgus()); }
    if (ruta === '/api/argus/unlink' && m === 'POST') { argus.conectado = false; return resp(estadoArgus()); }
    if (ruta === '/api/argus/link' && m === 'POST') { argus.conectado = true; argus.desde = b.desde; argus.hasta = b.hasta; argus.syncedAt = new Date().toISOString(); return resp(estadoArgus()); }
    if (ruta === '/api/gh/logout' && m === 'POST') return resp({ ok: true });
    if (ruta.startsWith('/api/gh/')) return resp({ error: 'En la demostración no se conecta con GitHub de verdad.' }, 400);
    return resp({ error: 'No disponible en la demostración' }, 404);
  };

  /* ---------- cinta y avisos ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.setAttribute('role', 'note');
    c.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:99px;font:600 .8125rem system-ui,sans-serif;color:#fff;background:rgba(10,20,50,.72);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.3);box-shadow:0 8px 30px rgba(0,0,0,.3);max-width:calc(100vw - 24px);text-align:center';
    c.textContent = 'Demostración con datos de ejemplo · lo que cambies no se guarda';
    document.body.appendChild(c);
  });
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('#exp')) { e.preventDefault(); typeof toast === 'function' && toast('El Excel se genera en el servidor: no está disponible en la demostración.'); }
  }, true);
})();
