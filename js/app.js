/**
 * app.js - Aplicación Principal Willilefche · Escuela Municipal de Valcheta
 * Con Autenticación por Rol, Sincronización en Nube (Firebase Firestore), Backups JSON y Gestión Completa (CRUD).
 */

const State = {
  rankingDistancia: '10K',
  rankingGenero: 'todos',
  atletasQuery: '',
  atletasCat: 'Todas',
  fichaTab: 'plan',
  pagosEstado: 'Todos',
  pagosConcepto: 'Todos',
  avisoTipo: 'General',
  avisoDest: 'Todo el grupo',
  portalTab: 'semana',
  mobileMenuOpen: false,
  loginError: '',
  showDemoAccess: true,
};

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- Sistema de Toasts ---------- */
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className =
    'toast-item pointer-events-auto flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm font-medium shadow-lg text-card-foreground';
  const iconHtml =
    type === 'success'
      ? '<span class="grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-success">✓</span>'
      : '<span class="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">i</span>';
  el.innerHTML = `${iconHtml}<span class="flex-1">${esc(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s ease';
    setTimeout(() => el.remove(), 220);
  }, 3200);
}
window.showToast = showToast;

/* ---------- Componentes de Marca y Badges ---------- */

function renderLogo({ invert = false, className = '' } = {}) {
  const ringCls = invert ? 'ring-white/15' : 'ring-border';
  const titleCls = invert ? 'text-ink-foreground' : 'text-foreground';
  const subCls = invert ? 'text-ink-foreground/70' : 'text-muted-foreground';
  return `
    <a href="#/" class="flex items-center gap-2.5 font-display text-2xl font-extrabold uppercase tracking-tight ${className}">
      <img
        src="img/logo-willilefche.jpg"
        alt="Willilefche"
        width="40"
        height="40"
        class="size-10 shrink-0 rounded-full bg-ink object-cover ring-2 ${ringCls}"
      />
      <span class="flex flex-col leading-none">
        <span class="${titleCls}">Willilefche</span>
        <span class="mt-0.5 font-sans text-[0.625rem] font-semibold normal-case tracking-normal ${subCls}">
          Escuela Municipal · Valcheta
        </span>
      </span>
    </a>
  `;
}

const INTENSIDAD_ESTILO = {
  Z1: 'bg-muted text-muted-foreground',
  Z2: 'bg-success-soft text-success',
  Z3: 'bg-warning-soft text-warning-text',
  Z4: 'bg-accent text-accent-foreground',
  Z5: 'bg-primary text-primary-foreground',
};

const INTENSIDAD_NOMBRE = {
  Z1: 'Muy suave',
  Z2: 'Suave',
  Z3: 'Moderado',
  Z4: 'Exigente',
  Z5: 'Máximo',
};

function renderIntensidadChip(z) {
  if (!z) return '';
  return `<span title="${esc(INTENSIDAD_NOMBRE[z])}" class="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${INTENSIDAD_ESTILO[z] || ''}">${esc(z)} · ${esc(INTENSIDAD_NOMBRE[z])}</span>`;
}

function renderEstadoSesionBadge(estado) {
  const map = {
    realizado: ['Realizado', 'bg-success-soft text-success'],
    'no-realizado': ['No realizado', 'bg-destructive/10 text-destructive'],
    pendiente: ['Pendiente', 'bg-muted text-muted-foreground'],
  };
  const [label, cls] = map[estado] || map.pendiente;
  return `<span class="rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${label}</span>`;
}

function renderEstadoPagoBadge(estado) {
  const map = {
    pagado: ['Pagado', 'bg-success-soft text-success'],
    pendiente: ['Pendiente', 'bg-warning-soft text-warning-text'],
    vencido: ['Vencido', 'bg-destructive/10 text-destructive'],
  };
  const [label, cls] = map[estado] || map.pendiente;
  return `<span class="rounded-full px-2 py-0.5 text-xs font-medium ${cls}">${label}</span>`;
}

function renderAvatar(nombre, apellido, sizeCls = 'size-10 text-base') {
  const initials = `${(nombre || '?')[0]}${(apellido || '')[0] || ''}`;
  return `<span aria-hidden="true" class="grid shrink-0 place-items-center rounded-full bg-secondary font-display font-bold uppercase text-secondary-foreground ${sizeCls}">${esc(initials)}</span>`;
}

/* ---------- Gráfico SVG de Evolución de Ritmo (PaceChart) ---------- */
function renderPaceChart(data) {
  const puntos = (data || []).filter((d) => d.ritmoSeg > 0);
  if (puntos.length < 2) {
    return `<p class="text-sm text-muted-foreground">Aún no hay suficientes registros para mostrar la evolución.</p>`;
  }
  const w = 320;
  const h = 140;
  const pad = { t: 16, r: 44, b: 24, l: 8 };
  const vals = puntos.map((p) => p.ritmoSeg);
  const min = Math.min(...vals) - 6;
  const max = Math.max(...vals) + 6;
  const x = (i) => pad.l + (i / (puntos.length - 1)) * (w - pad.l - pad.r);
  const y = (v) => pad.t + ((v - min) / (max - min)) * (h - pad.t - pad.b);
  const path = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.ritmoSeg).toFixed(1)}`).join(' ');
  const area = `${path} L${x(puntos.length - 1).toFixed(1)},${h - pad.b} L${x(0).toFixed(1)},${h - pad.b} Z`;
  const ultimo = puntos[puntos.length - 1];
  const mejora = puntos[0].ritmoSeg - ultimo.ritmoSeg;

  const linesSvg = [0.25, 0.5, 0.75]
    .map((f) => {
      const yPos = (pad.t + f * (h - pad.t - pad.b)).toFixed(1);
      return `<line x1="${pad.l}" x2="${w - pad.r}" y1="${yPos}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="2 4" />`;
    })
    .join('');

  const pointsSvg = puntos
    .map((p, i) => {
      const cx = x(i).toFixed(1);
      const cy = y(p.ritmoSeg).toFixed(1);
      const r = i === puntos.length - 1 ? 4.5 : 3;
      return `
        <g>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--card)" stroke="var(--primary)" stroke-width="2">
            <title>${esc(p.mes)}: ${Helpers.formatoRitmo(p.ritmoSeg)} /km</title>
          </circle>
          <text x="${cx}" y="${h - 6}" text-anchor="middle" fill="var(--muted-foreground)" font-size="10">${esc(p.mes)}</text>
        </g>
      `;
    })
    .join('');

  return `
    <figure class="m-0">
      <svg viewBox="0 0 ${w} ${h}" class="w-full" role="img">
        ${linesSvg}
        <path d="${area}" fill="oklch(0.55 0.17 138 / 0.12)" />
        <path d="${path}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        ${pointsSvg}
        <text x="${(x(puntos.length - 1) + 8).toFixed(1)}" y="${(y(ultimo.ritmoSeg) + 4).toFixed(1)}" fill="var(--foreground)" font-size="11" font-weight="600">
          ${Helpers.formatoRitmo(ultimo.ritmoSeg)}
        </text>
      </svg>
      <figcaption class="mt-1 text-xs text-muted-foreground">
        Ritmo promedio de rodaje (min/km).
        ${
          mejora > 0
            ? `<span class="font-medium text-success">${mejora} s/km más rápido desde ${esc(puntos[0].mes)}.</span>`
            : `<span>Sin mejora en el período.</span>`
        }
      </figcaption>
    </figure>
  `;
}

/* ---------- Tarjeta de Sesión de Entrenamiento (SessionCard) ---------- */
function renderSessionCard(sesion, actionHtml = '') {
  const d = Helpers.diaSemana(sesion.fecha);
  const esHoy = sesion.fecha === DB.hoy;
  const borderCls = esHoy ? 'border-primary ring-2 ring-primary/15' : '';
  const bgCls = sesion.tipo === 'Descanso' ? 'bg-muted/60' : 'bg-card';

  return `
    <article class="relative flex gap-4 rounded-xl border p-4 ${bgCls} ${borderCls}">
      <div class="flex w-12 shrink-0 flex-col items-center">
        <span class="text-xs font-semibold uppercase ${esHoy ? 'text-primary' : 'text-muted-foreground'}">
          ${esHoy ? 'Hoy' : d.dia}
        </span>
        <span class="font-display text-3xl font-bold leading-none">${d.num}</span>
        <span class="text-xs text-muted-foreground">${d.mes}</span>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">${esc(sesion.tipo)}</span>
          ${sesion.intensidad ? renderIntensidadChip(sesion.intensidad) : ''}
          ${
            sesion.modificada
              ? `<span class="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning-text">Modificado por el entrenador</span>`
              : ''
          }
          <span class="ml-auto">${renderEstadoSesionBadge(sesion.estado)}</span>
        </div>
        <h3 class="mt-1 text-xl font-bold">${esc(sesion.titulo)}</h3>
        ${sesion.detalle ? `<p class="mt-1 text-sm text-muted-foreground">${esc(sesion.detalle)}</p>` : ''}
        <dl class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          ${
            sesion.distanciaKm
              ? `<div class="flex items-center gap-1.5"><i data-lucide="route" class="size-4 text-muted-foreground"></i><dd class="font-medium tabular-nums">${esc(sesion.distanciaKm)} km</dd></div>`
              : ''
          }
          ${
            sesion.duracionMin
              ? `<div class="flex items-center gap-1.5"><i data-lucide="clock" class="size-4 text-muted-foreground"></i><dd class="font-medium tabular-nums">${esc(sesion.duracionMin)} min</dd></div>`
              : ''
          }
          ${
            sesion.ritmo
              ? `<div class="flex items-center gap-1.5"><i data-lucide="gauge" class="size-4 text-muted-foreground"></i><dd class="font-medium tabular-nums">${esc(sesion.ritmo)}</dd></div>`
              : ''
          }
          ${
            sesion.recuperacion
              ? `<div class="flex items-center gap-1.5"><i data-lucide="rotate-ccw" class="size-4 text-muted-foreground"></i><dd class="font-medium">${esc(sesion.recuperacion)}</dd></div>`
              : ''
          }
        </dl>
        ${
          sesion.comentario || sesion.sensacion
            ? `<div class="mt-3 flex gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <i data-lucide="message-square" class="mt-0.5 size-4 shrink-0 text-muted-foreground"></i>
                <p>
                  ${sesion.sensacion ? `<span class="mr-2 font-semibold">Sensación ${sesion.sensacion}/5</span>` : ''}
                  ${sesion.comentario ? `<span class="text-muted-foreground">“${esc(sesion.comentario)}”</span>` : ''}
                </p>
              </div>`
            : ''
        }
        ${actionHtml}
      </div>
    </article>
  `;
}

/* ---------- Header y Footer Públicos ---------- */
function renderPublicHeader(activePath = '/') {
  const session = Auth.getSession();
  const links = [
    { to: '#/', path: '/', label: 'Inicio' },
    { to: '#/rankings', path: '/rankings', label: 'Rankings' },
    { to: '#/competencias', path: '/competencias', label: 'Calendario' },
  ];

  let ctaHref = '#/ingresar';
  let ctaLabel = 'Ingresar';
  if (session) {
    if (session.role === 'coach') {
      ctaHref = '#/entrenador';
      ctaLabel = 'Panel Entrenador';
    } else if (session.role === 'athlete') {
      ctaHref = `#/atleta/${session.atletaId}`;
      ctaLabel = 'Mi Portal';
    } else if (session.role === 'guardian') {
      ctaHref = `#/familia/${session.atletaId}`;
      ctaLabel = 'Cuenta Familiar';
    }
  }

  return `
    <header class="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        ${renderLogo()}
        <nav class="hidden items-center gap-1 md:flex" aria-label="Principal">
          ${links
            .map(
              (l) => `
            <a href="${l.to}" class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                activePath === l.path ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }">
              ${l.label}
            </a>
          `
            )
            .join('')}
        </nav>
        <div class="flex items-center gap-2">
          <a href="${ctaHref}" class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-95">
            ${ctaLabel}
          </a>
        </div>
      </div>
    </header>
  `;
}

function renderPublicFooter() {
  return `
    <footer class="border-t bg-ink text-ink-foreground">
      <div class="mx-auto flex max-w-content flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        ${renderLogo({ invert: true })}
        <p class="text-sm text-ink-foreground/70">
          Los rankings públicos muestran solo nombre, categoría, edad y marcas. Los datos personales son privados.
        </p>
      </div>
    </footer>
  `;
}

/* ==========================================================================
   PANTALLAS PÚBLICAS
   ========================================================================== */

function viewHome() {
  const top10k = Helpers.rankingPublico('10K').slice(0, 3);
  const proximas = DB.competencias.slice(0, 3);
  const modulos = [
    {
      icon: 'clipboard-list',
      titulo: 'Planes a medida',
      texto: 'Cargá entrenamientos por día, semana o mes con distancias, ritmos, zonas de intensidad y recuperaciones.',
    },
    {
      icon: 'heart-handshake',
      titulo: 'Seguimiento individual',
      texto: 'Cada corredor marca lo que hizo y deja sus sensaciones. Vos ves la adherencia y la evolución de cada uno.',
    },
    {
      icon: 'calendar-days',
      titulo: 'Calendario de carreras',
      texto: 'Competencias programadas, sugerencias para cada atleta, resultados y un historial deportivo completo.',
    },
    {
      icon: 'wallet',
      titulo: 'Cuotas y pagos',
      texto: 'Cuotas, indumentaria, inscripciones y viajes. Vencimientos y deudas a la vista en un solo lugar.',
    },
    {
      icon: 'megaphone',
      titulo: 'Avisos y mensajes',
      texto: 'Avisos generales, cambios de entrenamiento, próximas competencias y mensajes individuales.',
    },
    {
      icon: 'lock',
      titulo: 'Acceso privado',
      texto: 'Cada atleta ve solo lo suyo. Las familias de menores ingresan con una cuenta autorizada.',
    },
  ];

  return `
    <div class="min-h-screen">
      ${renderPublicHeader('/')}

      <section class="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img
          src="img/hero.png"
          alt="Grupo de corredores entrenando en la pista al atardecer mientras el entrenador toma tiempos"
          class="absolute inset-0 -z-10 size-full object-cover object-[70%_center] opacity-55"
        />
        <div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/20"></div>
        <div class="mx-auto grid max-w-content items-center gap-10 px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:grid-cols-[1fr_auto]">
          <div>
            <p class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-ink-foreground/80">
              <span class="size-2 rounded-full bg-brand-lime" aria-hidden="true"></span>
              ${esc(DB.equipo.nombre)} · ${esc(DB.equipo.sede)}
            </p>
            <h1 class="max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-7xl">
              <span class="text-brand-lime">Entrenamos hoy,</span>
              <span class="text-brand-blue brightness-125">construimos mañana</span>
            </h1>
            <p class="mt-6 max-w-xl text-lg text-ink-foreground/80">
              La plataforma de la Escuela Municipal de Valcheta: planes de entrenamiento personalizados, fichas de cada atleta, competencias, pagos y comunicación con corredores y familias. Desde el celular o la computadora.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a href="#/ingresar" class="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm hover:opacity-95">
                Ingresar a mi cuenta <i data-lucide="arrow-right" class="size-4"></i>
              </a>
              <a href="#/rankings" class="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-transparent px-6 text-base font-semibold text-ink-foreground hover:bg-white/10">
                <i data-lucide="trophy" class="size-4"></i> Ver rankings
              </a>
            </div>
          </div>
          <img
            src="img/logo-willilefche.jpg"
            alt="Logo de Willilefche, Escuela Municipal de Valcheta"
            width="320"
            height="320"
            class="hidden size-80 rounded-full object-cover shadow-2xl ring-4 ring-white/10 lg:block"
          />
        </div>
      </section>

      <section class="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24">
        <div class="max-w-2xl">
          <h2 class="font-display text-4xl font-bold uppercase">Pensado para el día a día del entrenador</h2>
          <p class="mt-3 text-muted-foreground">
            Simple de usar para vos y para cada corredor. Empieza con lo esencial y crece con el grupo.
          </p>
        </div>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${modulos
            .map(
              (m) => `
            <div class="rounded-xl border bg-card p-6">
              <i data-lucide="${m.icon}" class="size-7 text-primary"></i>
              <h3 class="mt-4 text-2xl font-bold">${esc(m.titulo)}</h3>
              <p class="mt-2 text-sm text-muted-foreground">${esc(m.texto)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="border-y bg-secondary/60">
        <div class="mx-auto grid max-w-content gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <div class="flex items-end justify-between">
              <h2 class="font-display text-3xl font-bold uppercase">Mejores marcas · 10K</h2>
              <a href="#/rankings" class="text-sm font-medium text-primary hover:underline">Ver todos</a>
            </div>
            <ol class="mt-6 divide-y rounded-xl border bg-card">
              ${top10k
                .map(
                  (r, i) => `
                <li class="flex items-center gap-4 px-5 py-4">
                  <span class="font-display text-3xl font-extrabold text-primary tabular-nums">${i + 1}</span>
                  <div class="flex-1">
                    <p class="font-semibold">${esc(r.nombre)}</p>
                    <p class="text-sm text-muted-foreground">${esc(r.categoria)} · ${r.edad} años</p>
                  </div>
                  <span class="font-display text-2xl font-bold tabular-nums">${esc(r.tiempo)}</span>
                </li>
              `
                )
                .join('')}
            </ol>
          </div>
          <div>
            <div class="flex items-end justify-between">
              <h2 class="font-display text-3xl font-bold uppercase">Próximas competencias</h2>
              <a href="#/competencias" class="text-sm font-medium text-primary hover:underline">Calendario</a>
            </div>
            <ul class="mt-6 space-y-3">
              ${proximas
                .map((c) => {
                  const d = Helpers.diaSemana(c.fecha);
                  return `
                  <li class="flex items-center gap-4 rounded-xl border bg-card px-5 py-4">
                    <div class="w-12 text-center">
                      <p class="font-display text-3xl font-bold leading-none">${d.num}</p>
                      <p class="text-xs uppercase text-muted-foreground">${d.mes}</p>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold">${esc(c.nombre)}</p>
                      <p class="text-sm text-muted-foreground">${esc(c.lugar)} · ${esc(c.distancias.join(' / '))}</p>
                    </div>
                    <span class="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                      ${esc(c.tipo)}
                    </span>
                  </li>
                `;
                })
                .join('')}
            </ul>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24">
        <div class="grid gap-8 rounded-2xl bg-ink p-8 text-ink-foreground md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <i data-lucide="smartphone" class="size-8 text-primary"></i>
            <h2 class="mt-4 font-display text-4xl font-bold uppercase">Tres formas de ingresar</h2>
            <p class="mt-3 max-w-xl text-ink-foreground/75">
              <strong class="text-ink-foreground">Entrenador</strong> gestiona todo.
              <strong class="text-ink-foreground">Atleta</strong> consulta su plan, pagos y resultados.
              <strong class="text-ink-foreground">Familia</strong> acompaña a corredores menores de edad.
            </p>
          </div>
          <a href="#/ingresar" class="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-95">
            Ingresar ahora <i data-lucide="arrow-right" class="size-4"></i>
          </a>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

function viewRankings() {
  const generos = [
    { v: 'todos', l: 'Todos' },
    { v: 'F', l: 'Mujeres' },
    { v: 'M', l: 'Varones' },
  ];
  const filas = Helpers.rankingPublico(State.rankingDistancia).filter(
    (r) => State.rankingGenero === 'todos' || r.genero === State.rankingGenero
  );

  return `
    <div class="min-h-screen flex flex-col">
      ${renderPublicHeader('/rankings')}
      <main class="mx-auto w-full max-w-content flex-1 px-4 py-12 sm:px-6">
        <h1 class="font-display text-5xl font-extrabold uppercase">Rankings y marcas</h1>
        <p class="mt-2 max-w-2xl text-muted-foreground">
          Mejores marcas personales del equipo en competencias oficiales.
        </p>
        <p class="mt-4 inline-flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
          <i data-lucide="shield-check" class="size-4"></i>
          Solo se publican nombre, categoría, edad y rendimiento.
        </p>

        <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Distancia" class="flex flex-wrap gap-2">
            ${DB.distanciasRanking
              .map(
                (d) => `
              <button
                type="button"
                onclick="setRankingDistancia('${d}')"
                class="rounded-full border px-4 py-1.5 font-display text-lg font-bold transition-colors ${
                  State.rankingDistancia === d
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-muted'
                }"
              >
                ${esc(d)}
              </button>
            `
              )
              .join('')}
          </div>
          <div class="flex gap-1 rounded-lg bg-muted p-1 self-start" aria-label="Filtrar por género">
            ${generos
              .map(
                (g) => `
              <button
                type="button"
                onclick="setRankingGenero('${g.v}')"
                class="rounded-md px-3 py-1 text-sm font-medium ${
                  State.rankingGenero === g.v ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground'
                }"
              >
                ${g.l}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        ${
          filas.length === 0
            ? `<div class="mt-6 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Todavía no hay marcas registradas en ${esc(State.rankingDistancia)} para este filtro.
              </div>`
            : `<ol class="mt-6 divide-y overflow-hidden rounded-xl border bg-card">
                ${filas
                  .map(
                    (r, i) => `
                  <li class="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[3rem_1fr_12rem_auto] sm:px-6">
                    <span class="font-display text-3xl font-extrabold tabular-nums ${
                      i < 3 ? 'text-primary' : 'text-muted-foreground'
                    }">${i + 1}</span>
                    <div>
                      <p class="font-semibold">${esc(r.nombre)}</p>
                      <p class="text-sm text-muted-foreground">${esc(r.categoria)} · ${r.edad} años</p>
                    </div>
                    <p class="hidden text-sm text-muted-foreground sm:block">
                      ${esc(r.competencia)}<br />
                      ${Helpers.fechaCorta(r.fecha)}
                    </p>
                    <span class="font-display text-3xl font-bold tabular-nums">${esc(r.tiempo)}</span>
                  </li>
                `
                  )
                  .join('')}
              </ol>`
        }
      </main>
      ${renderPublicFooter()}
    </div>
  `;
}

window.setRankingDistancia = (d) => {
  State.rankingDistancia = d;
  renderApp();
};
window.setRankingGenero = (g) => {
  State.rankingGenero = g;
  renderApp();
};

function viewCompetenciasPublic() {
  return `
    <div class="min-h-screen flex flex-col">
      ${renderPublicHeader('/competencias')}
      <main class="mx-auto w-full max-w-content flex-1 px-4 py-12 sm:px-6">
        <h1 class="font-display text-5xl font-extrabold uppercase">Calendario de competencias</h1>
        <p class="mt-2 max-w-2xl text-muted-foreground">Las carreras y torneos en los que participa la Escuela Municipal Willilefche.</p>
        <ul class="mt-8 grid gap-4 md:grid-cols-2">
          ${DB.competencias
            .map((c) => {
              const d = Helpers.diaSemana(c.fecha);
              const faltan = Helpers.diasHasta(c.fecha);
              return `
              <li class="flex gap-5 rounded-xl border bg-card p-5">
                <div class="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-ink py-3 text-ink-foreground">
                  <span class="text-xs uppercase opacity-70">${d.dia}</span>
                  <span class="font-display text-4xl font-bold leading-none">${d.num}</span>
                  <span class="text-xs uppercase opacity-70">${d.mes}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">${esc(c.tipo)}</span>
                    <span class="text-xs text-muted-foreground">Faltan ${faltan} días</span>
                  </div>
                  <h2 class="mt-1 text-2xl font-bold">${esc(c.nombre)}</h2>
                  <p class="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <i data-lucide="map-pin" class="size-4"></i> ${esc(c.lugar)}
                  </p>
                  <p class="mt-2 text-sm">
                    Distancias: <span class="font-medium">${esc(c.distancias.join(' · '))}</span>
                  </p>
                  <p class="mt-1 text-sm text-muted-foreground">${c.inscriptos.length} atletas del equipo inscriptos</p>
                </div>
              </li>
            `;
            })
            .join('')}
        </ul>
      </main>
      ${renderPublicFooter()}
    </div>
  `;
}

function viewIngresar() {
  const menores = DB.atletas.filter((a) => a.tutor);
  return `
    <div class="grid min-h-screen lg:grid-cols-2">
      <div class="track-lines relative hidden bg-ink p-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between">
        ${renderLogo({ invert: true })}
        <div>
          <p class="font-display text-5xl font-extrabold uppercase leading-none">
            Cada atleta ve<br />
            <span class="text-brand-lime">solo lo suyo.</span>
          </p>
          <p class="mt-4 max-w-sm text-ink-foreground/70">
            Tus datos, entrenamientos, pagos y resultados son privados. Solo tu entrenador y, si sos menor, tu familia autorizada pueden verlos.
          </p>
        </div>
        <div data-cloud-badge>${CloudSync.renderBadgeHtml()}</div>
      </div>

      <div class="flex flex-col justify-center px-4 py-10 sm:px-12">
        <div class="mx-auto w-full max-w-md">
          <div class="mb-8 flex items-center justify-between lg:hidden">
            ${renderLogo()}
            <div data-cloud-badge>${CloudSync.renderBadgeHtml()}</div>
          </div>

          <h1 class="font-display text-4xl font-extrabold uppercase">Ingresar a mi cuenta</h1>
          <p class="mt-1 text-sm text-muted-foreground">Ingresá con el usuario y contraseña asignados por la escuela.</p>

          <form onsubmit="handleLoginSubmit(event)" class="mt-6 space-y-4">
            ${
              State.loginError
                ? `<div class="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
                    ${esc(State.loginError)}
                  </div>`
                : ''
            }
            <div class="space-y-1.5">
              <label for="login-user" class="text-sm font-medium">Usuario o correo electrónico</label>
              <input
                id="login-user"
                type="text"
                required
                autocomplete="username"
                placeholder="Ej.: entrenador, lucia o familia.tomas"
                class="h-11 w-full rounded-lg border bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div class="space-y-1.5">
              <label for="login-pass" class="text-sm font-medium">Contraseña</label>
              <div class="relative">
                <input
                  id="login-pass"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="h-11 w-full rounded-lg border bg-card pl-3.5 pr-16 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onclick="const i=document.getElementById('login-pass'); i.type = i.type==='password' ? 'text' : 'password'; this.textContent = i.type==='password' ? 'Ver' : 'Ocultar'"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Ver
                </button>
              </div>
            </div>
            <button
              type="submit"
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-xs hover:opacity-95"
            >
              Ingresar <i data-lucide="arrow-right" class="size-4"></i>
            </button>
          </form>

          <div class="mt-8 rounded-xl border bg-muted/50 p-4">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Accesos rápidos de prueba</p>
              <span class="text-[11px] text-muted-foreground">Clave atletas: <code class="font-mono">123</code></span>
            </div>
            <div class="mt-3 space-y-2.5">
              <button
                type="button"
                onclick="Auth.quickDemoLogin('coach')"
                class="group flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary"
              >
                <span class="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <i data-lucide="clipboard-list" class="size-5"></i>
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold">Entrenador (${esc(DB.equipo.entrenador)})</p>
                  <p class="truncate text-xs text-muted-foreground">Usuario: <code class="font-mono">${esc(DB.equipo.adminUser || 'entrenador')}</code> · Clave: <code class="font-mono">${esc(DB.equipo.adminPass || 'willilefche2026')}</code></p>
                </div>
                <i data-lucide="arrow-right" class="size-4 text-muted-foreground group-hover:text-primary"></i>
              </button>

              <div class="rounded-lg border bg-card p-3">
                <p class="text-xs font-semibold text-muted-foreground">Entrar como Atleta:</p>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  ${DB.atletas
                    .map(
                      (a) => `
                    <button
                      type="button"
                      onclick="Auth.quickDemoLogin('athlete', '${a.id}')"
                      class="rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-semibold hover:border-primary hover:bg-accent"
                    >
                      ${esc(a.nombre)} ${esc(a.apellido[0])}.
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>

              ${
                menores.length > 0
                  ? `<div class="rounded-lg border bg-card p-3">
                      <p class="text-xs font-semibold text-muted-foreground">Entrar como Familia (Menores):</p>
                      <div class="mt-2 flex flex-wrap gap-1.5">
                        ${menores
                          .map(
                            (a) => `
                          <button
                            type="button"
                            onclick="Auth.quickDemoLogin('guardian', '${a.id}')"
                            class="rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-semibold hover:border-primary hover:bg-accent"
                          >
                            Familia de ${esc(a.nombre)} (${esc(a.tutor.nombre)})
                          </button>
                        `
                          )
                          .join('')}
                      </div>
                    </div>`
                  : ''
              }
            </div>
          </div>

          <div class="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <a href="#/" class="hover:text-foreground">← Volver al inicio</a>
            <button type="button" onclick="openCloudConfigModal()" class="hover:text-primary underline">Configurar Firebase / Backups</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.handleLoginSubmit = (e) => {
  e.preventDefault();
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  const res = Auth.login(u, p);
  if (!res.ok) {
    State.loginError = res.error;
    renderApp();
    return;
  }
  State.loginError = '';
  showToast(`Bienvenido/a, ${res.session.nombre}`);
  location.hash = res.redirect;
};

/* ==========================================================================
   LAYOUT DEL ENTRENADOR (AppShell)
   ========================================================================== */

function renderCoachShell(activeSection, contentHtml) {
  const navItems = [
    { to: '#/entrenador', id: 'panel', label: 'Panel', icon: 'layout-dashboard' },
    { to: '#/entrenador/atletas', id: 'atletas', label: 'Atletas', icon: 'users' },
    { to: '#/entrenador/competencias', id: 'competencias', label: 'Competencias', icon: 'calendar-days' },
    { to: '#/entrenador/pagos', id: 'pagos', label: 'Pagos', icon: 'wallet' },
    { to: '#/entrenador/avisos', id: 'avisos', label: 'Avisos', icon: 'megaphone' },
  ];

  const navHtml = navItems
    .map((item) => {
      const isActive = activeSection === item.id;
      return `
        <a
          href="${item.to}"
          onclick="State.mobileMenuOpen = false"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
              : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }"
        >
          <i data-lucide="${item.icon}" class="size-5"></i>
          ${item.label}
        </a>
      `;
    })
    .join('');

  const userFooter = `
    <div class="space-y-3 border-t border-sidebar-border pt-4">
      <div data-cloud-badge>${CloudSync.renderBadgeHtml()}</div>
      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-sidebar-foreground">${esc(DB.equipo.entrenador)}</p>
          <p class="text-xs text-sidebar-foreground/60">Entrenador · Administrador</p>
        </div>
        <button
          type="button"
          onclick="Auth.logout()"
          title="Cerrar sesión"
          class="grid size-8 place-items-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <i data-lucide="log-out" class="size-4"></i>
        </button>
      </div>
    </div>
  `;

  return `
    <div class="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <aside class="sticky top-0 hidden h-screen flex-col gap-8 bg-sidebar p-5 lg:flex">
        ${renderLogo({ invert: true })}
        <nav class="flex flex-1 flex-col gap-1" aria-label="Secciones">
          ${navHtml}
          <button
            type="button"
            onclick="openCloudConfigModal()"
            class="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <i data-lucide="database" class="size-5"></i>
            Nube y Backups
          </button>
        </nav>
        ${userFooter}
      </aside>

      <header class="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
        ${renderLogo({ invert: true, className: 'text-xl' })}
        <div class="flex items-center gap-2">
          <button type="button" onclick="openCloudConfigModal()" class="grid size-9 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
            <i data-lucide="database" class="size-4"></i>
          </button>
          <button type="button" onclick="toggleMobileMenu()" class="grid size-9 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
            <i data-lucide="menu" class="size-5"></i>
          </button>
        </div>
      </header>

      ${
        State.mobileMenuOpen
          ? `<div class="fixed inset-0 z-40 bg-black/60 lg:hidden" onclick="toggleMobileMenu()">
              <div class="flex h-full w-64 flex-col gap-6 bg-sidebar p-5" onclick="event.stopPropagation()">
                ${renderLogo({ invert: true })}
                <nav class="flex flex-1 flex-col gap-1">${navHtml}</nav>
                ${userFooter}
              </div>
            </div>`
          : ''
      }

      <main class="min-w-0">${contentHtml}</main>
    </div>
  `;
}

window.toggleMobileMenu = () => {
  State.mobileMenuOpen = !State.mobileMenuOpen;
  renderApp();
};

function renderPageHeader(titulo, bajada = '', accionesHtml = '') {
  return `
    <div class="flex flex-col gap-4 border-b bg-card px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
      <div>
        <h1 class="font-display text-4xl font-extrabold uppercase leading-none">${esc(titulo)}</h1>
        ${bajada ? `<p class="mt-2 text-sm text-muted-foreground">${esc(bajada)}</p>` : ''}
      </div>
      ${accionesHtml ? `<div class="flex flex-wrap gap-2">${accionesHtml}</div>` : ''}
    </div>
  `;
}

/* ==========================================================================
   VISTAS DEL ENTRENADOR
   ========================================================================== */

function viewCoachDashboard() {
  const sesiones = Object.entries(DB.planes).flatMap(([atletaId, s]) =>
    s.map((x) => ({ ...x, atletaId }))
  );
  const pasadas = sesiones.filter((s) => s.fecha <= DB.hoy && s.tipo !== 'Descanso');
  const hechas = pasadas.filter((s) => s.estado === 'realizado');
  const adherencia = Math.round((hechas.length / Math.max(pasadas.length, 1)) * 100);
  const deuda = DB.pagos.filter((p) => p.estado !== 'pagado').reduce((t, p) => t + p.monto, 0);
  const vencidos = DB.pagos.filter((p) => p.estado === 'vencido');
  const proxima = DB.competencias[0];

  const feed = sesiones
    .filter((s) => s.comentario)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 6);

  const alertas = [
    ...sesiones
      .filter((s) => s.estado === 'no-realizado')
      .map((s) => ({ atletaId: s.atletaId, texto: `No realizó “${s.titulo}”`, tipo: 'entreno' })),
    ...vencidos.map((p) => ({
      atletaId: p.atletaId,
      texto: `${p.detalle} vencida · ${Helpers.pesos(p.monto)}`,
      tipo: 'pago',
    })),
  ];

  const kpis = [
    {
      label: 'Atletas activos',
      valor: String(DB.atletas.length),
      sub: `${DB.atletas.filter((a) => a.tutor).length} menores con familia vinculada`,
      icon: 'users',
    },
    {
      label: 'Cumplimiento semanal',
      valor: `${adherencia}%`,
      sub: `${hechas.length} de ${pasadas.length} sesiones realizadas`,
      icon: 'trending-up',
    },
    {
      label: 'Saldo a cobrar',
      valor: Helpers.pesos(deuda),
      sub: `${vencidos.length} pagos vencidos`,
      icon: 'wallet',
      alerta: vencidos.length > 0,
    },
    {
      label: 'Próxima competencia',
      valor: proxima ? `${Helpers.diasHasta(proxima.fecha)} días` : '—',
      sub: proxima ? proxima.nombre : 'Sin competencias',
      icon: 'calendar-days',
    },
  ];

  const content = `
    ${renderPageHeader(
      `Hola, ${DB.equipo.entrenador.split(' ').slice(-2, -1)[0] || DB.equipo.entrenador}`,
      `Viernes ${Helpers.fechaCorta(DB.hoy)} · semana del 12 al 18 de octubre`,
      `
        <button type="button" onclick="openCloudConfigModal()" class="inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted">
          <i data-lucide="database" class="size-4 text-primary"></i> Nube / Backup
        </button>
        <a href="#/entrenador/avisos" class="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
          <i data-lucide="message-square" class="size-4"></i> Enviar aviso
        </a>
        <a href="#/entrenador/atletas" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
          <i data-lucide="plus" class="size-4"></i> Cargar plan
        </a>
      `
    )}

    <div class="space-y-6 px-4 py-6 sm:px-8">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        ${kpis
          .map(
            (k) => `
          <div class="rounded-xl border bg-card p-5">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-muted-foreground">${esc(k.label)}</p>
              <i data-lucide="${k.icon}" class="size-5 ${k.alerta ? 'text-destructive' : 'text-primary'}"></i>
            </div>
            <p class="mt-2 font-display text-4xl font-bold tabular-nums">${esc(k.valor)}</p>
            <p class="mt-1 truncate text-sm text-muted-foreground">${esc(k.sub)}</p>
          </div>
        `
          )
          .join('')}
      </section>

      <div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section class="rounded-xl border bg-card">
          <div class="flex items-center justify-between border-b px-5 py-4">
            <h2 class="text-2xl font-bold">Sensaciones recientes</h2>
            <span class="text-sm text-muted-foreground">Comentarios de los atletas</span>
          </div>
          <ul class="divide-y">
            ${feed
              .map((s) => {
                const a = Helpers.getAtleta(s.atletaId);
                if (!a) return '';
                const d = Helpers.diaSemana(s.fecha);
                return `
                  <li>
                    <a href="#/entrenador/atletas/${a.id}" class="flex gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
                      ${renderAvatar(a.nombre, a.apellido)}
                      <div class="min-w-0 flex-1">
                        <p class="text-sm">
                          <span class="font-semibold">${esc(a.nombre)} ${esc(a.apellido)}</span>
                          <span class="text-muted-foreground"> · ${esc(s.titulo)} · ${d.dia} ${d.num}</span>
                        </p>
                        <p class="mt-1 text-sm text-muted-foreground">“${esc(s.comentario)}”</p>
                      </div>
                      ${
                        s.sensacion
                          ? `<span class="self-center rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums">${s.sensacion}/5</span>`
                          : ''
                      }
                    </a>
                  </li>
                `;
              })
              .join('')}
          </ul>
        </section>

        <div class="space-y-6">
          <section class="rounded-xl border bg-card">
            <div class="flex items-center gap-2 border-b px-5 py-4">
              <i data-lucide="alert-triangle" class="size-5 text-destructive"></i>
              <h2 class="text-2xl font-bold">Para atender</h2>
            </div>
            <ul class="divide-y">
              ${
                alertas.length === 0
                  ? `<li class="px-5 py-6 text-sm text-muted-foreground">Todo al día. No hay alertas pendientes.</li>`
                  : alertas
                      .map((al) => {
                        const a = Helpers.getAtleta(al.atletaId);
                        if (!a) return '';
                        return `
                          <li class="flex items-center gap-3 px-5 py-3 text-sm">
                            <span class="size-2 shrink-0 rounded-full ${
                              al.tipo === 'pago' ? 'bg-destructive' : 'bg-warning'
                            }"></span>
                            <span class="flex-1">
                              <span class="font-semibold">${esc(a.nombre)} ${esc(a.apellido[0])}.</span>
                              <span class="text-muted-foreground"> ${esc(al.texto)}</span>
                            </span>
                            <a href="#/entrenador/atletas/${a.id}" class="text-primary hover:underline">
                              <i data-lucide="arrow-right" class="size-4"></i>
                            </a>
                          </li>
                        `;
                      })
                      .join('')
              }
            </ul>
          </section>

          ${
            DB.avisos[0]
              ? `<section class="rounded-xl border bg-card">
                  <div class="flex items-center justify-between border-b px-5 py-4">
                    <h2 class="text-2xl font-bold">Último aviso</h2>
                    <a href="#/entrenador/avisos" class="text-sm font-medium text-primary hover:underline">Ver todos</a>
                  </div>
                  <div class="px-5 py-4">
                    <p class="text-xs font-semibold uppercase tracking-wide text-primary">${esc(DB.avisos[0].tipo)}</p>
                    <p class="mt-1 font-semibold">${esc(DB.avisos[0].titulo)}</p>
                    <p class="mt-1 text-sm text-muted-foreground">${esc(DB.avisos[0].cuerpo)}</p>
                    <p class="mt-3 text-xs text-muted-foreground">
                      Leído por ${DB.avisos[0].leidos} de ${DB.avisos[0].total}
                    </p>
                  </div>
                </section>`
              : ''
          }
        </div>
      </div>
    </div>
  `;

  return renderCoachShell('panel', content);
}

function viewCoachAtletas() {
  const categorias = ['Todas', 'Menores', 'Juveniles', 'Mayores', 'Master A', 'Master B'];
  const q = State.atletasQuery.trim().toLowerCase();
  const filtrados = DB.atletas.filter(
    (a) =>
      (State.atletasCat === 'Todas' || a.categoria === State.atletasCat) &&
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(q)
  );

  const content = `
    ${renderPageHeader(
      'Atletas',
      `${DB.atletas.length} corredores en el equipo`,
      `<button type="button" onclick="openNuevoAtletaModal()" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
        <i data-lucide="user-plus" class="size-4"></i> Nuevo atleta
      </button>`
    )}
    <div class="space-y-4 px-4 py-6 sm:px-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="relative md:w-72">
          <i data-lucide="search" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"></i>
          <input
            type="text"
            value="${esc(State.atletasQuery)}"
            oninput="State.atletasQuery = this.value; renderApp(true)"
            id="search-atletas-input"
            placeholder="Buscar por nombre"
            class="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          ${categorias
            .map(
              (c) => `
            <button
              type="button"
              onclick="State.atletasCat = '${c}'; renderApp()"
              class="rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                State.atletasCat === c ? 'border-ink bg-ink text-ink-foreground' : 'bg-card hover:bg-muted'
              }"
            >
              ${c}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      ${
        filtrados.length === 0
          ? `<div class="flex flex-col items-center rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              <i data-lucide="users" class="size-8"></i>
              <p class="mt-2">No hay atletas que coincidan con la búsqueda.</p>
            </div>`
          : `<ul class="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              ${filtrados
                .map((a) => {
                  const deuda = Helpers.deudaDe(a.id);
                  const vencido = Helpers.tieneVencidos(a.id);
                  return `
                  <li>
                    <a href="#/entrenador/atletas/${a.id}" class="block rounded-xl border bg-card p-5 transition-colors hover:border-primary">
                      <div class="flex items-center gap-3">
                        ${renderAvatar(a.nombre, a.apellido, 'size-12 text-lg')}
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-lg font-semibold">${esc(a.nombre)} ${esc(a.apellido)}</p>
                          <p class="text-sm text-muted-foreground">
                            ${esc(a.categoria)} · ${Helpers.edad(a.fechaNacimiento)} años · ${esc(a.nivel)}
                          </p>
                        </div>
                        ${
                          a.tutor
                            ? `<span class="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Menor</span>`
                            : ''
                        }
                      </div>
                      <div class="mt-4">
                        <div class="flex justify-between text-xs">
                          <span class="text-muted-foreground">Cumplimiento del plan</span>
                          <span class="font-semibold tabular-nums">${a.adherencia}%</span>
                        </div>
                        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div class="h-full bg-primary" style="width: ${a.adherencia}%"></div>
                        </div>
                      </div>
                      <div class="mt-4 flex items-center justify-between gap-2 text-sm">
                        <span class="truncate text-muted-foreground">${esc(a.objetivos[0]?.texto || 'Sin objetivo cargado')}</span>
                        ${
                          deuda > 0
                            ? `<span class="shrink-0 font-medium tabular-nums ${
                                vencido ? 'text-destructive' : 'text-warning-text'
                              }">Debe ${Helpers.pesos(deuda)}</span>`
                            : `<span class="shrink-0 font-medium text-success">Al día</span>`
                        }
                      </div>
                    </a>
                  </li>
                `;
                })
                .join('')}
            </ul>`
      }
    </div>
  `;

  return renderCoachShell('atletas', content);
}

function viewCoachAtletaFicha(atletaId) {
  const atleta = Helpers.getAtleta(atletaId);
  if (!atleta) {
    return renderCoachShell(
      'atletas',
      `<div class="p-8"><p class="text-muted-foreground">Atleta no encontrado.</p><a href="#/entrenador/atletas" class="text-primary underline">Volver a Atletas</a></div>`
    );
  }

  const tabs = [
    { id: 'plan', label: 'Plan' },
    { id: 'ficha', label: 'Ficha y Claves' },
    { id: 'resultados', label: 'Resultados' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'mensajes', label: 'Mensaje' },
  ];

  let tabContent = '';

  if (State.fichaTab === 'plan') {
    const sesiones = Helpers.getPlan(atleta.id);
    const total = sesiones.reduce((t, s) => t + (s.distanciaKm || 0), 0);
    const hecho = sesiones.filter((s) => s.estado === 'realizado').reduce((t, s) => t + (s.distanciaKm || 0), 0);

    tabContent = `
      <div class="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <section>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-2xl font-bold">Semana del 12 al 18 de octubre</h2>
              <p class="text-sm text-muted-foreground">${hecho} de ${total} km realizados</p>
            </div>
            <button type="button" onclick="openSessionModal('${atleta.id}')" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
              <i data-lucide="plus" class="size-4"></i> Agregar entrenamiento
            </button>
          </div>
          ${
            sesiones.length === 0
              ? `<div class="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                  Todavía no hay entrenamientos cargados para esta semana.
                </div>`
              : `<div class="space-y-3">
                  ${sesiones
                    .map((s) =>
                      renderSessionCard(
                        s,
                        `<div class="mt-2 flex gap-2 -ml-2">
                          <button type="button" onclick="openSessionModal('${atleta.id}', '${s.id}')" class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                            <i data-lucide="pencil" class="size-3.5"></i> Modificar
                          </button>
                          <button type="button" onclick="deleteSession('${atleta.id}', '${s.id}')" class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10">
                            Eliminar
                          </button>
                        </div>`
                      )
                    )
                    .join('')}
                </div>`
          }
        </section>
        <aside class="space-y-4">
          <div class="rounded-xl border bg-card p-5">
            <h3 class="text-xl font-bold">Evolución</h3>
            <div class="mt-3">${renderPaceChart(atleta.evolucion)}</div>
          </div>
          <div class="rounded-xl border bg-card p-5">
            <h3 class="text-xl font-bold">Objetivos</h3>
            <ul class="mt-3 space-y-4">
              ${(atleta.objetivos || [])
                .map(
                  (o) => `
                <li>
                  <p class="text-sm font-medium">${esc(o.texto)}</p>
                  <p class="text-xs text-muted-foreground">Meta: ${Helpers.fechaCorta(o.fecha)}</p>
                  <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div class="h-full bg-primary" style="width: ${o.progreso}%"></div>
                  </div>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        </aside>
      </div>
    `;
  } else if (State.fichaTab === 'ficha') {
    const datoRow = (label, valor) => `
      <div class="grid gap-0.5 py-2.5 sm:grid-cols-[12rem_1fr]">
        <dt class="text-sm text-muted-foreground">${esc(label)}</dt>
        <dd class="text-sm font-medium">${esc(valor)}</dd>
      </div>
    `;
    tabContent = `
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-6">
          <section class="rounded-xl border bg-card p-5">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold">Datos personales</h2>
              <button type="button" onclick="deleteAtleta('${atleta.id}')" class="text-xs font-semibold text-destructive hover:underline">
                Dar de baja atleta
              </button>
            </div>
            <dl class="mt-2 divide-y">
              ${datoRow('Fecha de nacimiento', `${Helpers.fechaCorta(atleta.fechaNacimiento)} (${Helpers.edad(atleta.fechaNacimiento)} años)`)}
              ${datoRow('Categoría', atleta.categoria)}
              ${datoRow('Ciudad', atleta.ciudad)}
              ${datoRow('Correo', atleta.email)}
              ${datoRow('Teléfono', atleta.telefono)}
              ${datoRow('Contacto de emergencia', atleta.contactoEmergencia)}
              ${atleta.tutor ? datoRow('Cuenta familiar', `${atleta.tutor.nombre} · ${atleta.tutor.email}`) : ''}
            </dl>
          </section>

          <section class="rounded-xl border border-primary/30 bg-card p-5">
            <h2 class="flex items-center gap-2 text-2xl font-bold">
              <i data-lucide="key-round" class="size-5 text-primary"></i> Credenciales de acceso
            </h2>
            <p class="mt-1 text-xs text-muted-foreground">
              Definí el usuario y la contraseña con los que ${esc(atleta.nombre)} (y su familia, si es menor) ingresan a la plataforma.
            </p>
            <form onsubmit="saveCredencialesAtleta(event, '${atleta.id}')" class="mt-4 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold">Usuario del atleta</label>
                  <input id="cred-user" required value="${esc(atleta.usuario || atleta.id.split('-')[0])}" class="mt-1 h-9 w-full rounded-lg border bg-card px-3 text-sm font-mono" />
                </div>
                <div>
                  <label class="text-xs font-semibold">Contraseña del atleta</label>
                  <input id="cred-pass" required value="${esc(atleta.password || '123')}" class="mt-1 h-9 w-full rounded-lg border bg-card px-3 text-sm font-mono" />
                </div>
              </div>
              ${
                atleta.tutor
                  ? `<div class="grid grid-cols-2 gap-3 border-t pt-3">
                      <div>
                        <label class="text-xs font-semibold">Usuario familiar (${esc(atleta.tutor.nombre)})</label>
                        <input id="cred-tuser" required value="${esc(atleta.tutor.usuario || 'familia.' + (atleta.usuario || 'menor'))}" class="mt-1 h-9 w-full rounded-lg border bg-card px-3 text-sm font-mono" />
                      </div>
                      <div>
                        <label class="text-xs font-semibold">Contraseña familiar</label>
                        <input id="cred-tpass" required value="${esc(atleta.tutor.password || '123')}" class="mt-1 h-9 w-full rounded-lg border bg-card px-3 text-sm font-mono" />
                      </div>
                    </div>`
                  : ''
              }
              <button type="submit" class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-95">
                Guardar credenciales
              </button>
            </form>
          </section>
        </div>

        <section class="rounded-xl border bg-card p-5 h-fit">
          <h2 class="text-2xl font-bold">Información deportiva</h2>
          <dl class="mt-2 divide-y">
            ${datoRow('Nivel', atleta.nivel)}
            ${datoRow('Antecedentes', atleta.antecedentes)}
            ${datoRow('Salud y lesiones', atleta.salud)}
            ${(atleta.extra || []).map((x) => datoRow(x.etiqueta, x.valor)).join('')}
          </dl>
          <form onsubmit="addExtraField(event, '${atleta.id}')" class="mt-4 rounded-lg bg-muted/60 p-3">
            <p class="mb-2 text-sm font-semibold">Agregar información adicional</p>
            <div class="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
              <input id="extra-et" placeholder="Ej.: Talle" required class="h-9 rounded-lg border bg-card px-3 text-sm" />
              <input id="extra-val" placeholder="Ej.: M" required class="h-9 rounded-lg border bg-card px-3 text-sm" />
              <button type="submit" class="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-secondary px-3 text-sm font-semibold text-secondary-foreground hover:opacity-90">
                <i data-lucide="plus" class="size-4"></i> Agregar
              </button>
            </div>
          </form>
        </section>
      </div>
    `;
  } else if (State.fichaTab === 'resultados') {
    const proximas = DB.competencias.filter(
      (c) => c.inscriptos.includes(atleta.id) || c.sugeridos.includes(atleta.id)
    );
    tabContent = `
      <div class="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div class="space-y-6">
          <section>
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold">Marcas personales</h2>
              <button type="button" onclick="openNuevoResultadoModal('${atleta.id}')" class="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                <i data-lucide="plus" class="size-3.5"></i> Cargar resultado / marca
              </button>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              ${(atleta.marcas || [])
                .map(
                  (m) => `
                <div class="rounded-xl border bg-card p-4">
                  <p class="text-sm font-semibold text-primary">${esc(m.distancia)}</p>
                  <p class="font-display text-3xl font-bold tabular-nums">${esc(m.tiempo)}</p>
                  <p class="mt-1 truncate text-xs text-muted-foreground" title="${esc(m.competencia)}">${esc(m.competencia)}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </section>
          <section class="rounded-xl border bg-card">
            <h2 class="border-b px-5 py-4 text-2xl font-bold">Historial de competencias</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-left text-muted-foreground">
                  <tr>
                    <th class="px-5 py-2 font-medium">Competencia</th>
                    <th class="px-3 py-2 font-medium">Distancia</th>
                    <th class="px-3 py-2 font-medium">Tiempo</th>
                    <th class="px-3 py-2 font-medium">General</th>
                    <th class="px-5 py-2 font-medium">Categoría</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  ${(atleta.resultados || [])
                    .map(
                      (r) => `
                    <tr>
                      <td class="px-5 py-3">
                        <p class="font-medium">${esc(r.competencia)}</p>
                        <p class="text-xs text-muted-foreground">${Helpers.fechaCorta(r.fecha)}</p>
                      </td>
                      <td class="px-3 py-3">${esc(r.distancia)}</td>
                      <td class="px-3 py-3 font-semibold tabular-nums">${esc(r.tiempo)}</td>
                      <td class="px-3 py-3 tabular-nums">${r.posGeneral}°</td>
                      <td class="px-5 py-3 tabular-nums">
                        <span class="inline-flex items-center gap-1">
                          ${r.posCategoria <= 3 ? `<i data-lucide="medal" class="size-4 text-primary"></i>` : ''}
                          ${r.posCategoria}°
                        </span>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <section class="rounded-xl border bg-card p-5 h-fit">
          <h2 class="text-2xl font-bold">Próximas</h2>
          ${
            proximas.length === 0
              ? `<p class="mt-2 text-sm text-muted-foreground">Sin competencias programadas.</p>`
              : `<ul class="mt-3 space-y-3">
                  ${proximas
                    .map(
                      (c) => `
                    <li class="rounded-lg border p-3">
                      <p class="font-semibold">${esc(c.nombre)}</p>
                      <p class="text-xs text-muted-foreground">${Helpers.fechaCorta(c.fecha)} · ${esc(c.lugar)}</p>
                      ${
                        c.inscriptos.includes(atleta.id)
                          ? `<span class="mt-2 inline-block rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">Inscripto</span>`
                          : `<span class="mt-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"><i data-lucide="sparkles" class="size-3"></i> Sugerida por el entrenador</span>`
                      }
                    </li>
                  `
                    )
                    .join('')}
                </ul>`
          }
        </section>
      </div>
    `;
  } else if (State.fichaTab === 'pagos') {
    const lista = Helpers.getPagos(atleta.id);
    const deuda = lista.filter((p) => p.estado !== 'pagado').reduce((t, p) => t + p.monto, 0);
    tabContent = `
      <section class="rounded-xl border bg-card">
        <div class="flex items-center justify-between border-b px-5 py-4">
          <h2 class="text-2xl font-bold">Cuotas y pagos</h2>
          <p class="text-sm">
            Saldo:
            <span class="${deuda > 0 ? 'font-semibold text-destructive' : 'font-semibold text-success'}">
              ${deuda > 0 ? Helpers.pesos(deuda) : 'al día'}
            </span>
          </p>
        </div>
        <ul class="divide-y">
          ${lista
            .map(
              (p) => `
            <li class="flex flex-wrap items-center gap-3 px-5 py-3">
              <div class="min-w-0 flex-1">
                <p class="font-medium">${esc(p.detalle)}</p>
                <p class="text-xs text-muted-foreground">
                  ${esc(p.concepto)} · ${
                p.estado === 'pagado' && p.fechaPago
                  ? `pagado el ${Helpers.fechaCorta(p.fechaPago)}`
                  : `vence ${Helpers.fechaCorta(p.vencimiento)}`
              }
                </p>
              </div>
              <span class="font-semibold tabular-nums">${Helpers.pesos(p.monto)}</span>
              ${renderEstadoPagoBadge(p.estado)}
              ${
                p.estado !== 'pagado'
                  ? `<button type="button" onclick="registrarPago('${p.id}')" class="rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      Registrar pago
                    </button>`
                  : ''
              }
            </li>
          `
            )
            .join('')}
        </ul>
      </section>
    `;
  } else if (State.fichaTab === 'mensajes') {
    tabContent = `
      <section class="max-w-reading rounded-xl border bg-card p-5">
        <h2 class="text-2xl font-bold">Mensaje individual</h2>
        <p class="text-sm text-muted-foreground">
          Solo lo verá ${esc(atleta.nombre)}${atleta.tutor ? ` y su familia (${esc(atleta.tutor.nombre)})` : ''}.
        </p>
        <form onsubmit="enviarMensajeIndividual(event, '${atleta.id}')" class="mt-4 space-y-3">
          <textarea
            id="msg-individual-text"
            rows="5"
            required
            placeholder="Hola ${esc(atleta.nombre)}, …"
            class="w-full rounded-lg border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
          <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
            <i data-lucide="send" class="size-4"></i> Enviar
          </button>
        </form>
      </section>
    `;
  }

  const content = `
    <div>
      <div class="border-b bg-card px-4 pb-0 pt-5 sm:px-8">
        <a href="#/entrenador/atletas" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <i data-lucide="arrow-left" class="size-4"></i> Atletas
        </a>
        <div class="mt-4 flex flex-col gap-4 pb-5 sm:flex-row sm:items-center">
          ${renderAvatar(atleta.nombre, atleta.apellido, 'size-16 text-2xl')}
          <div class="flex-1">
            <h1 class="font-display text-4xl font-extrabold uppercase leading-none">${esc(Helpers.nombreCompleto(atleta))}</h1>
            <p class="mt-1 text-sm text-muted-foreground">
              ${esc(atleta.categoria)} · ${Helpers.edad(atleta.fechaNacimiento)} años · ${esc(atleta.nivel)} · en el equipo desde ${Helpers.fechaCorta(atleta.ingreso)}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            ${
              atleta.tutor
                ? `<div class="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
                    <i data-lucide="shield-check" class="size-4"></i>
                    Familia vinculada: ${esc(atleta.tutor.nombre)} (${esc(atleta.tutor.vinculo)})
                  </div>`
                : ''
            }
            <a href="#/atleta/${atleta.id}" class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted">
              Vista previa del portal →
            </a>
          </div>
        </div>

        <div class="flex gap-1 overflow-x-auto">
          ${tabs
            .map(
              (t) => `
            <button
              type="button"
              onclick="State.fichaTab = '${t.id}'; renderApp()"
              class="border-b-2 px-4 py-3 text-base font-medium transition-colors ${
                State.fichaTab === t.id
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }"
            >
              ${t.label}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="px-4 py-6 sm:px-8">${tabContent}</div>
    </div>
  `;

  return renderCoachShell('atletas', content);
}

window.saveCredencialesAtleta = (e, atletaId) => {
  e.preventDefault();
  const a = Helpers.getAtleta(atletaId);
  if (!a) return;
  a.usuario = document.getElementById('cred-user').value.trim().toLowerCase();
  a.password = document.getElementById('cred-pass').value.trim();
  if (a.tutor && document.getElementById('cred-tuser')) {
    a.tutor.usuario = document.getElementById('cred-tuser').value.trim().toLowerCase();
    a.tutor.password = document.getElementById('cred-tpass').value.trim();
  }
  saveDB();
  showToast(`Credenciales de ${a.nombre} guardadas`);
  renderApp();
};

window.deleteAtleta = (atletaId) => {
  const a = Helpers.getAtleta(atletaId);
  if (!a) return;
  if (!confirm(`¿Seguro que querés dar de baja a ${a.nombre} ${a.apellido}?`)) return;
  DB.atletas = DB.atletas.filter((x) => x.id !== atletaId);
  delete DB.planes[atletaId];
  DB.pagos = DB.pagos.filter((p) => p.atletaId !== atletaId);
  saveDB();
  showToast('Atleta dado de baja');
  location.hash = '#/entrenador/atletas';
};

window.addExtraField = (e, atletaId) => {
  e.preventDefault();
  const et = document.getElementById('extra-et').value.trim();
  const val = document.getElementById('extra-val').value.trim();
  if (!et || !val) return;
  const atleta = Helpers.getAtleta(atletaId);
  if (!atleta) return;
  atleta.extra = atleta.extra || [];
  atleta.extra.push({ etiqueta: et, valor: val });
  saveDB();
  showToast('Campo agregado a la ficha');
  renderApp();
};

window.enviarMensajeIndividual = (e, atletaId) => {
  e.preventDefault();
  const texto = document.getElementById('msg-individual-text').value.trim();
  if (!texto) return;
  const atleta = Helpers.getAtleta(atletaId);
  DB.avisos.unshift({
    id: `a-${Date.now()}`,
    tipo: 'Individual',
    titulo: `Mensaje para ${atleta.nombre}`,
    cuerpo: texto,
    fecha: DB.hoy,
    destinatarios: Helpers.nombreCompleto(atleta),
    leidos: 0,
    total: 1,
  });
  saveDB();
  showToast(`Mensaje enviado a ${atleta.nombre}`);
  renderApp();
};

window.deleteSession = (atletaId, sesionId) => {
  DB.planes[atletaId] = (DB.planes[atletaId] || []).filter((s) => s.id !== sesionId);
  saveDB();
  showToast('Entrenamiento eliminado del plan');
  renderApp();
};

function viewCoachCompetencias() {
  const content = `
    ${renderPageHeader(
      'Competencias',
      'Calendario del equipo, inscripciones y sugerencias',
      `<button type="button" onclick="openNuevaCompetenciaModal()" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
        <i data-lucide="plus" class="size-4"></i> Nueva competencia
      </button>`
    )}
    <ul class="space-y-4 px-4 py-6 sm:px-8">
      ${DB.competencias
        .map((c) => {
          const d = Helpers.diaSemana(c.fecha);
          const disponibles = DB.atletas.filter(
            (a) => !c.inscriptos.includes(a.id) && !c.sugeridos.includes(a.id)
          );
          return `
            <li class="flex flex-col gap-5 rounded-xl border bg-card p-5 md:flex-row">
              <div class="flex w-16 shrink-0 flex-col items-center justify-center self-start rounded-lg bg-ink py-3 text-ink-foreground">
                <span class="text-xs uppercase opacity-70">${d.dia}</span>
                <span class="font-display text-4xl font-bold leading-none">${d.num}</span>
                <span class="text-xs uppercase opacity-70">${d.mes}</span>
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">${esc(c.tipo)}</span>
                  <span class="text-xs text-muted-foreground">en ${Helpers.diasHasta(c.fecha)} días</span>
                </div>
                <h2 class="mt-1 text-2xl font-bold">${esc(c.nombre)}</h2>
                <p class="flex items-center gap-1 text-sm text-muted-foreground">
                  <i data-lucide="map-pin" class="size-4"></i> ${esc(c.lugar)} · ${esc(c.distancias.join(' / '))}
                </p>
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inscriptos (${c.inscriptos.length})</p>
                    <ul class="mt-2 flex flex-wrap gap-2">
                      ${c.inscriptos
                        .map((id) => {
                          const a = Helpers.getAtleta(id);
                          if (!a) return '';
                          return `
                            <li class="flex items-center gap-2 rounded-full bg-success-soft py-1 pl-1 pr-3 text-sm">
                              ${renderAvatar(a.nombre, a.apellido, 'size-6 text-[10px]')}
                              ${esc(a.nombre)} ${esc(a.apellido[0])}.
                            </li>
                          `;
                        })
                        .join('')}
                    </ul>
                  </div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sugerida a (${c.sugeridos.length})</p>
                    <ul class="mt-2 flex flex-wrap gap-2">
                      ${c.sugeridos
                        .map((id) => {
                          const a = Helpers.getAtleta(id);
                          if (!a) return '';
                          return `
                            <li class="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
                              <i data-lucide="sparkles" class="size-3.5"></i>
                              ${esc(a.nombre)} ${esc(a.apellido[0])}.
                            </li>
                          `;
                        })
                        .join('')}
                    </ul>
                  </div>
                </div>
              </div>
              <div class="md:w-56 flex flex-col gap-2">
                ${
                  disponibles.length > 0
                    ? `<select onchange="if(this.value) sugerirCompetencia('${c.id}', this.value)" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
                        <option value="">Sugerir carrera a…</option>
                        ${disponibles
                          .map((a) => `<option value="${a.id}">${esc(a.nombre)} ${esc(a.apellido)}</option>`)
                          .join('')}
                      </select>`
                    : ''
                }
                <select onchange="if(this.value) inscribirCompetencia('${c.id}', this.value)" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
                  <option value="">Inscribir a…</option>
                  ${DB.atletas
                    .filter((a) => !c.inscriptos.includes(a.id))
                    .map((a) => `<option value="${a.id}">${esc(a.nombre)} ${esc(a.apellido)}</option>`)
                    .join('')}
                </select>
                <button type="button" onclick="deleteCompetencia('${c.id}')" class="self-end text-xs text-muted-foreground hover:text-destructive">
                  Eliminar fecha
                </button>
              </div>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
  return renderCoachShell('competencias', content);
}

window.deleteCompetencia = (id) => {
  if (!confirm('¿Eliminar esta competencia del calendario?')) return;
  DB.competencias = DB.competencias.filter((c) => c.id !== id);
  saveDB();
  showToast('Competencia eliminada');
  renderApp();
};

window.sugerirCompetencia = (compId, atletaId) => {
  const c = DB.competencias.find((x) => x.id === compId);
  const a = Helpers.getAtleta(atletaId);
  if (c && a && !c.sugeridos.includes(atletaId)) {
    c.sugeridos.push(atletaId);
    saveDB();
    showToast(`Se sugirió la carrera a ${a.nombre}`);
    renderApp();
  }
};

window.inscribirCompetencia = (compId, atletaId) => {
  const c = DB.competencias.find((x) => x.id === compId);
  const a = Helpers.getAtleta(atletaId);
  if (c && a && !c.inscriptos.includes(atletaId)) {
    c.inscriptos.push(atletaId);
    c.sugeridos = c.sugeridos.filter((id) => id !== atletaId);
    saveDB();
    showToast(`${a.nombre} inscripto/a en ${c.nombre}`);
    renderApp();
  }
};

function viewCoachPagos() {
  const filtrosEstado = [
    { id: 'Todos', label: 'Todos' },
    { id: 'vencido', label: 'Vencidos' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'pagado', label: 'Pagados' },
  ];
  const conceptos = ['Todos', 'Cuota', 'Indumentaria', 'Inscripción', 'Viaje'];

  const suma = (e) => DB.pagos.filter((p) => p.estado === e).reduce((t, p) => t + p.monto, 0);
  const filas = DB.pagos
    .filter(
      (p) =>
        (State.pagosEstado === 'Todos' || p.estado === State.pagosEstado) &&
        (State.pagosConcepto === 'Todos' || p.concepto === State.pagosConcepto)
    )
    .slice()
    .sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));

  const content = `
    ${renderPageHeader(
      'Pagos',
      'Cuotas, indumentaria, inscripciones y viajes',
      `<button type="button" onclick="openNuevoCobroModal()" class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
        <i data-lucide="plus" class="size-4"></i> Nuevo cobro
      </button>`
    )}
    <div class="space-y-6 px-4 py-6 sm:px-8">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border bg-card p-5">
          <p class="text-sm font-medium text-muted-foreground">Vencido</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-destructive">${Helpers.pesos(suma('vencido'))}</p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-sm font-medium text-muted-foreground">Por cobrar</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-warning-text">${Helpers.pesos(suma('pendiente'))}</p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-sm font-medium text-muted-foreground">Cobrado</p>
          <p class="mt-1 font-display text-4xl font-bold tabular-nums text-success">${Helpers.pesos(suma('pagado'))}</p>
        </div>
      </div>

      <div class="flex flex-col gap-3 md:flex-row md:justify-between">
        <div class="flex gap-1 rounded-lg bg-muted p-1 self-start">
          ${filtrosEstado
            .map(
              (f) => `
            <button
              type="button"
              onclick="State.pagosEstado = '${f.id}'; renderApp()"
              class="rounded-md px-3 py-1 text-sm font-medium ${
                State.pagosEstado === f.id ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground'
              }"
            >
              ${f.label}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="flex flex-wrap gap-2">
          ${conceptos
            .map(
              (c) => `
            <button
              type="button"
              onclick="State.pagosConcepto = '${c}'; renderApp()"
              class="rounded-full border px-3 py-1 text-sm font-medium ${
                State.pagosConcepto === c ? 'border-ink bg-ink text-ink-foreground' : 'bg-card hover:bg-muted'
              }"
            >
              ${c}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border bg-card">
        <table class="w-full min-w-[40rem] text-sm">
          <thead class="border-b text-left text-muted-foreground">
            <tr>
              <th class="px-5 py-3 font-medium">Atleta</th>
              <th class="px-3 py-3 font-medium">Concepto</th>
              <th class="px-3 py-3 font-medium">Vencimiento</th>
              <th class="px-3 py-3 text-right font-medium">Monto</th>
              <th class="px-3 py-3 font-medium">Estado</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${
              filas.length === 0
                ? `<tr><td colspan="6" class="px-5 py-10 text-center text-muted-foreground">No hay pagos para este filtro.</td></tr>`
                : filas
                    .map((p) => {
                      const a = Helpers.getAtleta(p.atletaId);
                      if (!a) return '';
                      return `
                      <tr>
                        <td class="px-5 py-3">
                          <a href="#/entrenador/atletas/${a.id}" class="font-medium hover:text-primary">
                            ${esc(a.nombre)} ${esc(a.apellido)}
                          </a>
                        </td>
                        <td class="px-3 py-3">
                          <p>${esc(p.detalle)}</p>
                          <p class="text-xs text-muted-foreground">${esc(p.concepto)}</p>
                        </td>
                        <td class="px-3 py-3 tabular-nums">${Helpers.fechaCorta(p.vencimiento)}</td>
                        <td class="px-3 py-3 text-right font-semibold tabular-nums">${Helpers.pesos(p.monto)}</td>
                        <td class="px-3 py-3">${renderEstadoPagoBadge(p.estado)}</td>
                        <td class="px-5 py-3 text-right">
                          <div class="inline-flex items-center gap-2">
                            ${
                              p.estado !== 'pagado'
                                ? `<button type="button" onclick="registrarPago('${p.id}')" class="rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                                    Registrar pago
                                  </button>`
                                : ''
                            }
                            <button type="button" onclick="deletePago('${p.id}')" title="Eliminar cobro" class="text-xs text-muted-foreground hover:text-destructive">✕</button>
                          </div>
                        </td>
                      </tr>
                    `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
  return renderCoachShell('pagos', content);
}

window.registrarPago = (id) => {
  const pago = DB.pagos.find((p) => p.id === id);
  if (pago) {
    pago.estado = 'pagado';
    pago.fechaPago = DB.hoy;
    saveDB();
    showToast('Pago registrado');
    renderApp();
  }
};

window.deletePago = (id) => {
  if (!confirm('¿Eliminar este cobro?')) return;
  DB.pagos = DB.pagos.filter((p) => p.id !== id);
  saveDB();
  showToast('Cobro eliminado');
  renderApp();
};

function viewCoachAvisos() {
  const tipos = ['General', 'Entrenamiento', 'Competencia', 'Individual'];
  const grupos = ['Todo el grupo', 'Menores y juveniles', 'Mayores y Master'];
  const opciones =
    State.avisoTipo === 'Individual'
      ? DB.atletas.map((a) => `${a.nombre} ${a.apellido}`)
      : grupos;

  const tipoColor = {
    General: 'bg-secondary text-secondary-foreground',
    Entrenamiento: 'bg-warning-soft text-warning-text',
    Competencia: 'bg-accent text-accent-foreground',
    Individual: 'bg-success-soft text-success',
  };

  const content = `
    ${renderPageHeader('Avisos', 'Comunicación con corredores y familias')}
    <div class="grid gap-6 px-4 py-6 sm:px-8 xl:grid-cols-[26rem_1fr]">
      <form onsubmit="enviarAviso(event)" class="h-fit space-y-4 rounded-xl border bg-card p-5">
        <h2 class="text-2xl font-bold">Nuevo aviso</h2>
        <fieldset>
          <legend class="mb-1.5 text-sm font-medium">Tipo</legend>
          <div class="grid grid-cols-2 gap-2">
            ${tipos
              .map(
                (t) => `
              <button
                type="button"
                onclick="setAvisoTipo('${t}')"
                class="rounded-md border px-3 py-2 text-sm font-medium ${
                  State.avisoTipo === t
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-muted'
                }"
              >
                ${t}
              </button>
            `
              )
              .join('')}
          </div>
        </fieldset>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Destinatarios</label>
          <select id="av-dest" onchange="State.avisoDest = this.value" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
            ${opciones
              .map(
                (o) =>
                  `<option value="${esc(o)}" ${State.avisoDest === o ? 'selected' : ''}>${esc(o)}</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="space-y-1.5">
          <label for="av-titulo" class="text-sm font-medium">Título</label>
          <input id="av-titulo" required placeholder="Ej.: Entrenamiento sábado" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div class="space-y-1.5">
          <label for="av-cuerpo" class="text-sm font-medium">Mensaje</label>
          <textarea id="av-cuerpo" rows="5" required placeholder="Escribí el comunicado..." class="w-full rounded-lg border bg-card p-3 text-sm"></textarea>
        </div>
        <button type="submit" class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-95">
          <i data-lucide="send" class="size-4"></i> Enviar aviso
        </button>
      </form>

      <section>
        <h2 class="mb-3 text-2xl font-bold">Enviados</h2>
        <ul class="space-y-3">
          ${DB.avisos
            .map(
              (a) => `
            <li class="rounded-xl border bg-card p-5">
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full px-2 py-0.5 font-medium ${tipoColor[a.tipo] || ''}">${esc(a.tipo)}</span>
                <span class="text-muted-foreground">${Helpers.fechaCorta(a.fecha)} · para ${esc(a.destinatarios)}</span>
                <span class="ml-auto text-muted-foreground tabular-nums">Leído ${a.leidos}/${a.total}</span>
                <button type="button" onclick="deleteAviso('${a.id}')" class="text-muted-foreground hover:text-destructive">✕</button>
              </div>
              <h3 class="mt-2 text-xl font-bold">${esc(a.titulo)}</h3>
              <p class="mt-1 text-sm text-muted-foreground">${esc(a.cuerpo)}</p>
            </li>
          `
            )
            .join('')}
        </ul>
      </section>
    </div>
  `;
  return renderCoachShell('avisos', content);
}

window.deleteAviso = (id) => {
  DB.avisos = DB.avisos.filter((a) => a.id !== id);
  saveDB();
  showToast('Aviso eliminado');
  renderApp();
};

window.setAvisoTipo = (t) => {
  State.avisoTipo = t;
  State.avisoDest =
    t === 'Individual'
      ? `${DB.atletas[0].nombre} ${DB.atletas[0].apellido}`
      : 'Todo el grupo';
  renderApp();
};

window.enviarAviso = (e) => {
  e.preventDefault();
  const titulo = document.getElementById('av-titulo').value.trim();
  const cuerpo = document.getElementById('av-cuerpo').value.trim();
  const dest = document.getElementById('av-dest').value;
  if (!titulo || !cuerpo) return;
  const total = State.avisoTipo === 'Individual' ? 1 : dest === 'Todo el grupo' ? DB.atletas.length : Math.ceil(DB.atletas.length / 2);
  DB.avisos.unshift({
    id: `a-${Date.now()}`,
    tipo: State.avisoTipo,
    titulo,
    cuerpo,
    fecha: DB.hoy,
    destinatarios: dest,
    leidos: 0,
    total,
  });
  saveDB();
  showToast(`Aviso enviado a ${dest}`);
  renderApp();
};

/* ==========================================================================
   PORTAL DEL ATLETA Y CUENTA FAMILIAR (AtletaPortal)
   ========================================================================== */

function viewAtletaPortal(atletaId, modoFamilia = false) {
  const session = Auth.getSession();
  const isCoachPreview = session && session.role === 'coach';
  const atleta = Helpers.getAtleta(atletaId) || DB.atletas[0];
  const familia = modoFamilia ? atleta.tutor || { nombre: 'Tutor autorizado', vinculo: 'Familia' } : null;
  const sesiones = Helpers.getPlan(atleta.id);
  const pagos = Helpers.getPagos(atleta.id);
  const deuda = pagos.filter((p) => p.estado !== 'pagado').reduce((t, p) => t + p.monto, 0);
  const proxima = DB.competencias.find((c) => c.inscriptos.includes(atleta.id));
  const sugeridas = DB.competencias.filter((c) => c.sugeridos.includes(atleta.id));
  const hoy = sesiones.find((s) => s.fecha === DB.hoy);
  const kmPlan = sesiones.reduce((t, s) => t + (s.distanciaKm || 0), 0);
  const kmHechos = sesiones.filter((s) => s.estado === 'realizado').reduce((t, s) => t + (s.distanciaKm || 0), 0);

  const mensajes = [
    ...(sesiones.some((s) => s.modificada)
      ? [
          {
            id: 'mod',
            tipo: 'Entrenamiento',
            titulo: 'Tu plan fue modificado',
            cuerpo: 'Revisá el entrenamiento de esta semana: tu entrenador actualizó la sesión.',
            fecha: DB.hoy,
          },
        ]
      : []),
    ...DB.avisos.filter(
      (av) => av.tipo !== 'Individual' || av.destinatarios === Helpers.nombreCompleto(atleta)
    ),
  ];

  let tabBody = '';
  if (State.portalTab === 'semana') {
    tabBody = `
      <div class="space-y-3">
        ${
          hoy && hoy.estado === 'pendiente' && !familia
            ? `<div class="flex flex-col gap-3 rounded-xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center">
                <p class="flex-1 font-medium">Hoy toca <strong>${esc(hoy.titulo)}</strong>. ¿Ya entrenaste?</p>
                <button type="button" onclick="openRegistroModal('${atleta.id}', '${hoy.id}')" class="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:opacity-95">
                  Registrar entrenamiento
                </button>
              </div>`
            : ''
        }
        ${
          sesiones.length === 0
            ? `<div class="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                Tu entrenador todavía no cargó el plan de esta semana.
              </div>`
            : sesiones
                .map((s) =>
                  renderSessionCard(
                    s,
                    !familia && s.tipo !== 'Descanso' && s.fecha <= DB.hoy
                      ? `<button type="button" onclick="openRegistroModal('${atleta.id}', '${s.id}')" class="mt-3 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          s.estado === 'pendiente'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted -ml-2 text-foreground'
                        }">
                          ${s.estado === 'pendiente' ? 'Registrar' : 'Editar registro'}
                        </button>`
                      : ''
                  )
                )
                .join('')
        }
      </div>
    `;
  } else if (State.portalTab === 'resultados') {
    tabBody = `
      <div class="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div class="space-y-6">
          <section>
            <h2 class="text-2xl font-bold">Mis marcas</h2>
            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              ${(atleta.marcas || [])
                .map(
                  (m) => `
                <div class="rounded-xl border bg-card p-4">
                  <p class="text-sm font-semibold text-primary">${esc(m.distancia)}</p>
                  <p class="font-display text-3xl font-bold tabular-nums">${esc(m.tiempo)}</p>
                  <p class="mt-1 text-xs text-muted-foreground">${Helpers.fechaCorta(m.fecha)}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </section>
          <section class="rounded-xl border bg-card">
            <h2 class="border-b px-5 py-4 text-2xl font-bold">Historial</h2>
            <ul class="divide-y">
              ${(atleta.resultados || [])
                .map(
                  (r) => `
                <li class="flex items-center gap-4 px-5 py-3">
                  <div class="flex-1">
                    <p class="font-medium">${esc(r.competencia)}</p>
                    <p class="text-xs text-muted-foreground">
                      ${Helpers.fechaCorta(r.fecha)} · ${esc(r.distancia)} · ${r.posCategoria}° en categoría
                    </p>
                  </div>
                  <span class="font-display text-2xl font-bold tabular-nums">${esc(r.tiempo)}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </section>
        </div>
        <div class="space-y-4">
          <section class="rounded-xl border bg-card p-5">
            <h2 class="text-xl font-bold">Mi evolución</h2>
            <div class="mt-3">${renderPaceChart(atleta.evolucion)}</div>
          </section>
          ${
            sugeridas.length > 0
              ? `<section class="rounded-xl border border-primary/40 bg-accent/50 p-5">
                  <h2 class="flex items-center gap-2 text-xl font-bold">
                    <i data-lucide="target" class="size-5 text-primary"></i> Tu entrenador te sugiere
                  </h2>
                  <ul class="mt-3 space-y-2">
                    ${sugeridas
                      .map(
                        (c) => `
                      <li class="rounded-lg bg-card p-3">
                        <p class="font-semibold">${esc(c.nombre)}</p>
                        <p class="flex items-center gap-1 text-xs text-muted-foreground">
                          <i data-lucide="calendar-days" class="size-3.5"></i> ${Helpers.fechaCorta(c.fecha)} · ${esc(c.distancias.join(' / '))}
                        </p>
                      </li>
                    `
                      )
                      .join('')}
                  </ul>
                </section>`
              : ''
          }
        </div>
      </div>
    `;
  } else if (State.portalTab === 'pagos') {
    tabBody = `
      <section class="max-w-3xl rounded-xl border bg-card">
        <div class="flex items-center justify-between border-b px-5 py-4">
          <h2 class="text-2xl font-bold">Mis pagos</h2>
          <p class="text-sm">
            Saldo:
            <span class="${deuda > 0 ? 'font-semibold text-destructive' : 'font-semibold text-success'}">
              ${deuda > 0 ? Helpers.pesos(deuda) : 'al día'}
            </span>
          </p>
        </div>
        <ul class="divide-y">
          ${pagos
            .map(
              (p) => `
            <li class="flex flex-wrap items-center gap-3 px-5 py-3">
              <div class="min-w-0 flex-1">
                <p class="font-medium">${esc(p.detalle)}</p>
                <p class="text-xs text-muted-foreground">${esc(p.concepto)} · vence ${Helpers.fechaCorta(p.vencimiento)}</p>
              </div>
              <span class="font-semibold tabular-nums">${Helpers.pesos(p.monto)}</span>
              ${renderEstadoPagoBadge(p.estado)}
            </li>
          `
            )
            .join('')}
        </ul>
      </section>
    `;
  } else if (State.portalTab === 'avisos') {
    tabBody = `
      <ul class="max-w-3xl space-y-3">
        ${mensajes
          .map(
            (m) => `
          <li class="flex gap-4 rounded-xl border bg-card p-5">
            <i data-lucide="megaphone" class="size-5 shrink-0 text-primary"></i>
            <div>
              <p class="text-xs text-muted-foreground">${esc(m.tipo)} · ${Helpers.fechaCorta(m.fecha)}</p>
              <h3 class="text-xl font-bold">${esc(m.titulo)}</h3>
              <p class="mt-1 text-sm text-muted-foreground">${esc(m.cuerpo)}</p>
            </div>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  }

  return `
    <div class="min-h-screen bg-background">
      ${
        isCoachPreview
          ? `<div class="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              <div class="mx-auto flex max-w-content items-center justify-between">
                <span>Vista previa del Entrenador · Viendo portal de ${esc(Helpers.nombreCompleto(atleta))}</span>
                <a href="#/entrenador/atletas/${atleta.id}" class="underline">← Volver a la ficha</a>
              </div>
            </div>`
          : ''
      }
      <header class="bg-ink text-ink-foreground">
        <div class="mx-auto flex h-14 max-w-content items-center justify-between px-4 sm:px-6">
          ${renderLogo({ invert: true, className: 'text-xl' })}
          <div class="flex items-center gap-2">
            <div data-cloud-badge>${CloudSync.renderBadgeHtml()}</div>
            <button
              type="button"
              onclick="Auth.logout()"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-foreground/80 hover:bg-white/10 hover:text-ink-foreground"
            >
              <i data-lucide="log-out" class="size-4"></i> Salir
            </button>
          </div>
        </div>
        <div class="track-lines">
          <div class="mx-auto max-w-content px-4 pb-8 pt-6 sm:px-6">
            ${
              familia
                ? `<p class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                    <i data-lucide="shield-check" class="size-4 text-brand-lime"></i>
                    Cuenta familiar de ${esc(familia.nombre)} (${esc(familia.vinculo)}) · Solo lectura
                  </p>`
                : ''
            }
            <p class="text-sm text-ink-foreground/70">${familia ? 'Seguimiento de' : 'Hola,'}</p>
            <h1 class="font-display text-5xl font-extrabold uppercase leading-none">
              ${familia ? esc(`${atleta.nombre} ${atleta.apellido}`) : esc(atleta.nombre)}
            </h1>
            <p class="mt-1 text-sm text-ink-foreground/70">
              ${esc(atleta.categoria)} · ${Helpers.edad(atleta.fechaNacimiento)} años
            </p>

            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div class="rounded-xl bg-white/10 p-4">
                <p class="text-xs uppercase tracking-wide text-ink-foreground/60">Semana</p>
                <p class="font-display text-3xl font-bold tabular-nums">
                  ${kmHechos}<span class="text-lg text-ink-foreground/60"> / ${kmPlan} km</span>
                </p>
                <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div class="h-full bg-brand-lime" style="width: ${Math.min(100, (kmHechos / Math.max(kmPlan, 1)) * 100)}%"></div>
                </div>
              </div>
              <div class="rounded-xl bg-white/10 p-4">
                <p class="text-xs uppercase tracking-wide text-ink-foreground/60">Próxima carrera</p>
                ${
                  proxima
                    ? `<p class="font-display text-3xl font-bold tabular-nums">${Helpers.diasHasta(proxima.fecha)} días</p>
                       <p class="truncate text-sm text-ink-foreground/70">${esc(proxima.nombre)}</p>`
                    : `<p class="mt-1 text-sm text-ink-foreground/70">Sin inscripciones</p>`
                }
              </div>
              <div class="rounded-xl bg-white/10 p-4">
                <p class="text-xs uppercase tracking-wide text-ink-foreground/60">Objetivo</p>
                <p class="mt-1 line-clamp-2 font-semibold">${esc(atleta.objetivos[0]?.texto || 'Entrenar con constancia')}</p>
                <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div class="h-full bg-brand-lime" style="width: ${atleta.objetivos[0]?.progreso || 50}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="mx-auto max-w-content px-4 sm:px-6">
        <div class="flex gap-2 overflow-x-auto border-b">
          ${[
            ['semana', 'Mi semana'],
            ['resultados', 'Resultados'],
            ['pagos', 'Pagos'],
            ['avisos', 'Avisos'],
          ]
            .map(
              ([v, l]) => `
            <button
              type="button"
              onclick="State.portalTab = '${v}'; renderApp()"
              class="inline-flex items-center gap-2 border-b-2 px-3 py-3 text-base font-medium transition-colors ${
                State.portalTab === v
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }"
            >
              ${l}
              ${v === 'pagos' && deuda > 0 ? `<span class="size-2 rounded-full bg-destructive"></span>` : ''}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="py-6">${tabBody}</div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   MODALES INTERACTIVOS Y CONFIGURACIÓN DE NUBE / BACKUPS
   ========================================================================== */

function closeModal() {
  const m = document.getElementById('modal-root');
  if (m) m.innerHTML = '';
}
window.closeModal = closeModal;

function showModalHtml(innerHtml) {
  let root = document.getElementById('modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }
  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onclick="closeModal()">
      <div class="modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-6 shadow-xl" onclick="event.stopPropagation()">
        ${innerHtml}
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

// Modal de Configuración de Firebase, Credenciales de Admin y Backups JSON
window.openCloudConfigModal = () => {
  const activeCfg = CloudSync.getActiveConfig() || window.firebaseConfig || {};
  const session = Auth.getSession();
  const isCoach = !session || session.role === 'coach';

  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">Nube Firebase, Copias de Seguridad y Equipo</h2>
        <p class="text-sm text-muted-foreground">Estado actual: <strong>${esc(CloudSync.statusText)}</strong></p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>

    <div class="mt-4 space-y-5">
      <div class="rounded-xl border bg-muted/40 p-4 space-y-3">
        <p class="text-sm font-bold">1. Copias de Seguridad (Respaldo Local JSON)</p>
        <p class="text-xs text-muted-foreground">Descargá o restaurá toda la base de datos de la escuela en un archivo seguro en tu computadora.</p>
        <div class="flex flex-wrap gap-2">
          <button type="button" onclick="exportBackupJSON()" class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95">
            <i data-lucide="download" class="size-4"></i> Descargar Backup (.json)
          </button>
          <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted">
            <i data-lucide="upload" class="size-4"></i> Restaurar Backup (.json)
            <input type="file" accept=".json" onchange="importBackupJSON(this)" class="hidden" />
          </label>
        </div>
      </div>

      ${
        isCoach
          ? `<form onsubmit="saveFirebaseConfigFromUI(event)" class="rounded-xl border bg-card p-4 space-y-3">
              <p class="text-sm font-bold">2. Conexión con Firebase Firestore</p>
              <p class="text-xs text-muted-foreground">Pegá las claves de tu proyecto de Firebase (o editalas en <code class="font-mono">js/firebase-config.js</code>).</p>
              <div class="grid grid-cols-2 gap-2.5">
                <div class="col-span-2">
                  <label class="text-xs font-medium">apiKey</label>
                  <input id="fb-apikey" required value="${esc(activeCfg.apiKey || '')}" placeholder="AIzaSy..." class="h-9 w-full rounded-lg border bg-card px-3 text-xs font-mono" />
                </div>
                <div>
                  <label class="text-xs font-medium">projectId</label>
                  <input id="fb-proj" required value="${esc(activeCfg.projectId || '')}" placeholder="willilefche-valcheta" class="h-9 w-full rounded-lg border bg-card px-3 text-xs font-mono" />
                </div>
                <div>
                  <label class="text-xs font-medium">appId</label>
                  <input id="fb-appid" value="${esc(activeCfg.appId || '')}" placeholder="1:0000:web:0000" class="h-9 w-full rounded-lg border bg-card px-3 text-xs font-mono" />
                </div>
              </div>
              <div class="flex justify-between items-center pt-1">
                <button type="button" onclick="CloudSync.pushToCloud().then(ok => showToast(ok ? 'Sincronizado con Firebase' : 'Revisá las credenciales', ok ? 'success' : 'info'))" class="text-xs font-semibold text-primary hover:underline">
                  Forzar subida a la nube ahora
                </button>
                <button type="submit" class="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95">
                  Guardar y Conectar Firebase
                </button>
              </div>
            </form>

            <form onsubmit="saveAdminProfile(event)" class="rounded-xl border bg-card p-4 space-y-3">
              <p class="text-sm font-bold">3. Datos del Entrenador y Clave Admin</p>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="text-xs font-medium">Entrenador</label>
                  <input id="adm-nombre" required value="${esc(DB.equipo.entrenador)}" class="h-9 w-full rounded-lg border bg-card px-3 text-xs" />
                </div>
                <div>
                  <label class="text-xs font-medium">Sede</label>
                  <input id="adm-sede" required value="${esc(DB.equipo.sede)}" class="h-9 w-full rounded-lg border bg-card px-3 text-xs" />
                </div>
                <div>
                  <label class="text-xs font-medium">Usuario Admin</label>
                  <input id="adm-user" required value="${esc(DB.equipo.adminUser || 'entrenador')}" class="h-9 w-full rounded-lg border bg-card px-3 text-xs font-mono" />
                </div>
                <div>
                  <label class="text-xs font-medium">Contraseña Admin</label>
                  <input id="adm-pass" required value="${esc(DB.equipo.adminPass || 'willilefche2026')}" class="h-9 w-full rounded-lg border bg-card px-3 text-xs font-mono" />
                </div>
              </div>
              <div class="flex justify-between items-center pt-1">
                <button type="button" onclick="if(confirm('¿Restaurar datos de ejemplo originales?')){resetDB(); closeModal(); renderApp(); showToast('Datos restaurados');}" class="text-xs text-destructive hover:underline">
                  Restaurar datos de fábrica
                </button>
                <button type="submit" class="rounded-lg bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground hover:opacity-90">
                  Guardar datos del equipo
                </button>
              </div>
            </form>`
          : ''
      }
    </div>
  `);
};

window.saveFirebaseConfigFromUI = (e) => {
  e.preventDefault();
  const apiKey = document.getElementById('fb-apikey').value.trim();
  const projectId = document.getElementById('fb-proj').value.trim();
  const appId = document.getElementById('fb-appid').value.trim();
  const cfg = {
    apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: `${projectId}.firebasestorage.app`,
    appId,
  };
  localStorage.setItem('willilefche_firebase_config', JSON.stringify(cfg));
  closeModal();
  showToast('Configuración de Firebase guardada. Conectando…');
  setTimeout(() => location.reload(), 600);
};

window.saveAdminProfile = (e) => {
  e.preventDefault();
  DB.equipo.entrenador = document.getElementById('adm-nombre').value.trim();
  DB.equipo.sede = document.getElementById('adm-sede').value.trim();
  DB.equipo.adminUser = document.getElementById('adm-user').value.trim().toLowerCase();
  DB.equipo.adminPass = document.getElementById('adm-pass').value.trim();
  saveDB();
  closeModal();
  showToast('Datos del entrenador actualizados');
  renderApp();
};

// 1. Modal de Entrenamiento (Entrenador agrega/modifica sesión)
window.openSessionModal = (atletaId, sesionId = null) => {
  const atleta = Helpers.getAtleta(atletaId);
  const sesion = sesionId ? (DB.planes[atletaId] || []).find((s) => s.id === sesionId) : null;
  const tipos = ['Rodaje', 'Pasadas', 'Fondo', 'Fartlek', 'Cuestas', 'Fuerza', 'Descanso'];
  const zonas = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];
  const fechaActual = sesion?.fecha || DB.semanaActual[4];
  const tipoActual = sesion?.tipo || 'Rodaje';
  const zonaActual = sesion?.intensidad || 'Z2';

  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">${sesion ? 'Modificar entrenamiento' : 'Nuevo entrenamiento'}</h2>
        <p class="text-sm text-muted-foreground">Plan de ${esc(atleta.nombre)}.${sesion ? ' El atleta verá el aviso de modificación.' : ''}</p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>
    <form onsubmit="saveSessionModal(event, '${atletaId}', '${sesionId || ''}')" class="mt-4 grid gap-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-sm font-medium">Día</label>
          <select id="s-fecha" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
            ${DB.semanaActual
              .map((f) => {
                const d = Helpers.diaSemana(f);
                return `<option value="${f}" ${f === fechaActual ? 'selected' : ''}>${d.dia} ${d.num} ${d.mes}</option>`;
              })
              .join('')}
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Tipo</label>
          <select id="s-tipo" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
            ${tipos.map((t) => `<option value="${t}" ${t === tipoActual ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Título</label>
        <input id="s-titulo" required value="${esc(sesion?.titulo || '')}" placeholder="Ej.: 6 × 1000 m" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Descripción</label>
        <textarea id="s-detalle" rows="3" placeholder="Entrada en calor, bloque principal, vuelta a la calma…" class="w-full rounded-lg border bg-card p-3 text-sm">${esc(sesion?.detalle || '')}</textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-sm font-medium">Distancia (km)</label>
          <input id="s-km" type="number" step="0.5" value="${esc(sesion?.distanciaKm || '')}" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Duración (min)</label>
          <input id="s-min" type="number" value="${esc(sesion?.duracionMin || '')}" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Ritmo</label>
          <input id="s-ritmo" value="${esc(sesion?.ritmo || '')}" placeholder="4:05 /km" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Recuperación</label>
          <input id="s-rec" value="${esc(sesion?.recuperacion || '')}" placeholder="2:00 trote" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Intensidad</label>
        <select id="s-zona" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
          ${zonas.map((z) => `<option value="${z}" ${z === zonaActual ? 'selected' : ''}>${z} · ${INTENSIDAD_NOMBRE[z]}</option>`).join('')}
        </select>
      </div>
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
        <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">Guardar</button>
      </div>
    </form>
  `);
};

window.saveSessionModal = (e, atletaId, sesionId) => {
  e.preventDefault();
  const atleta = Helpers.getAtleta(atletaId);
  const lista = DB.planes[atletaId] || [];
  const existente = sesionId ? lista.find((s) => s.id === sesionId) : null;
  const tipo = document.getElementById('s-tipo').value;
  const kmVal = document.getElementById('s-km').value;
  const minVal = document.getElementById('s-min').value;

  const nueva = {
    id: existente ? existente.id : `nueva-${Date.now()}`,
    fecha: document.getElementById('s-fecha').value,
    tipo,
    titulo: document.getElementById('s-titulo').value.trim(),
    detalle: document.getElementById('s-detalle').value.trim(),
    distanciaKm: kmVal ? Number(kmVal) : undefined,
    duracionMin: minVal ? Number(minVal) : undefined,
    ritmo: document.getElementById('s-ritmo').value.trim() || undefined,
    intensidad: tipo === 'Descanso' ? undefined : document.getElementById('s-zona').value,
    recuperacion: document.getElementById('s-rec').value.trim() || undefined,
    estado: existente ? existente.estado : 'pendiente',
    sensacion: existente?.sensacion,
    comentario: existente?.comentario,
    modificada: Boolean(existente),
  };

  if (existente) {
    DB.planes[atletaId] = lista.map((s) => (s.id === sesionId ? nueva : s));
  } else {
    DB.planes[atletaId] = [...lista, nueva];
  }
  saveDB();
  closeModal();
  showToast(existente ? `Se avisó a ${atleta.nombre} del cambio` : 'Entrenamiento agregado al plan');
  renderApp();
};

// 2. Modal de Registro del Atleta (Lo hice / No pude + Sensación 1-5 + Comentario)
let tempRegHecho = true;
let tempRegSensacion = 4;

window.openRegistroModal = (atletaId, sesionId) => {
  const sesion = (DB.planes[atletaId] || []).find((s) => s.id === sesionId);
  if (!sesion) return;
  tempRegHecho = sesion.estado !== 'no-realizado';
  tempRegSensacion = sesion.sensacion || 4;
  renderRegistroModalContent(atletaId, sesion);
};

function renderRegistroModalContent(atletaId, sesion) {
  const caras = ['😣', '😕', '😐', '🙂', '💪'];
  const comentarioActual = document.getElementById('reg-com')?.value ?? (sesion.comentario || '');

  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">${esc(sesion.titulo)}</h2>
        <p class="text-sm text-muted-foreground">Contale a tu entrenador cómo te fue.</p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>
    <div class="mt-4 space-y-5">
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          onclick="setRegHecho(true, '${atletaId}', '${sesion.id}')"
          class="flex items-center justify-center gap-2 rounded-lg border py-3 font-semibold ${
            tempRegHecho ? 'border-success bg-success-soft text-success' : 'hover:bg-muted'
          }"
        >
          ✓ Lo hice
        </button>
        <button
          type="button"
          onclick="setRegHecho(false, '${atletaId}', '${sesion.id}')"
          class="flex items-center justify-center gap-2 rounded-lg border py-3 font-semibold ${
            !tempRegHecho ? 'border-destructive bg-destructive/10 text-destructive' : 'hover:bg-muted'
          }"
        >
          ✕ No pude
        </button>
      </div>
      ${
        tempRegHecho
          ? `<fieldset>
              <legend class="mb-2 text-sm font-medium">¿Cómo te sentiste?</legend>
              <div class="flex justify-between gap-2">
                ${caras
                  .map((c, i) => {
                    const v = i + 1;
                    return `
                    <button
                      type="button"
                      onclick="setRegSensacion(${v}, '${atletaId}', '${sesion.id}')"
                      class="flex-1 rounded-lg border py-2 text-2xl transition-transform ${
                        tempRegSensacion === v ? 'scale-105 border-primary bg-accent' : 'opacity-60 hover:opacity-100'
                      }"
                    >
                      ${c}
                    </button>
                  `;
                  })
                  .join('')}
              </div>
            </fieldset>`
          : ''
      }
      <div class="space-y-1.5">
        <label for="reg-com" class="text-sm font-medium">Comentario</label>
        <textarea
          id="reg-com"
          rows="3"
          placeholder="${tempRegHecho ? 'Tiempos, molestias, cómo estuvo el día…' : '¿Qué pasó?'}"
          class="w-full rounded-lg border bg-card p-3 text-sm"
        >${esc(comentarioActual)}</textarea>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
        <button type="button" onclick="saveRegistroModal('${atletaId}', '${sesion.id}')" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">Guardar</button>
      </div>
    </div>
  `);
}

window.setRegHecho = (val, atletaId, sesionId) => {
  tempRegHecho = val;
  const sesion = (DB.planes[atletaId] || []).find((s) => s.id === sesionId);
  renderRegistroModalContent(atletaId, sesion);
};

window.setRegSensacion = (val, atletaId, sesionId) => {
  tempRegSensacion = val;
  const sesion = (DB.planes[atletaId] || []).find((s) => s.id === sesionId);
  renderRegistroModalContent(atletaId, sesion);
};

window.saveRegistroModal = (atletaId, sesionId) => {
  const sesion = (DB.planes[atletaId] || []).find((s) => s.id === sesionId);
  if (!sesion) return;
  const com = document.getElementById('reg-com').value.trim();
  sesion.estado = tempRegHecho ? 'realizado' : 'no-realizado';
  sesion.sensacion = tempRegHecho ? tempRegSensacion : undefined;
  sesion.comentario = com || undefined;
  saveDB();
  closeModal();
  showToast(
    sesion.estado === 'realizado'
      ? '¡Entrenamiento registrado! Tu entrenador ya puede verlo.'
      : 'Registro guardado'
  );
  renderApp();
};

// 3. Modal de Nuevo Atleta (con usuario y contraseña incluidos)
window.openNuevoAtletaModal = () => {
  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">Nuevo atleta</h2>
        <p class="text-sm text-muted-foreground">Sumá un corredor a la Escuela Municipal Willilefche.</p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>
    <form onsubmit="saveNuevoAtleta(event)" class="mt-4 grid gap-3">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium">Nombre</label>
          <input id="na-nombre" required class="h-9 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs font-medium">Apellido</label>
          <input id="na-apellido" required class="h-9 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-2.5">
        <div>
          <label class="text-xs font-semibold">Usuario de ingreso</label>
          <input id="na-user" required placeholder="Ej.: martin" class="mt-1 h-8 w-full rounded-md border bg-card px-2.5 text-xs font-mono" />
        </div>
        <div>
          <label class="text-xs font-semibold">Contraseña inicial</label>
          <input id="na-pass" required value="123" class="mt-1 h-8 w-full rounded-md border bg-card px-2.5 text-xs font-mono" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="text-xs font-medium">Fecha Nac.</label>
          <input id="na-fnac" type="date" required value="2005-05-15" class="h-9 w-full rounded-lg border bg-card px-2 text-sm" />
        </div>
        <div>
          <label class="text-xs font-medium">Género</label>
          <select id="na-genero" class="h-9 w-full rounded-lg border bg-card px-2 text-sm">
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-medium">Categoría</label>
          <select id="na-cat" class="h-9 w-full rounded-lg border bg-card px-2 text-sm">
            <option>Menores</option>
            <option>Juveniles</option>
            <option selected>Mayores</option>
            <option>Master A</option>
            <option>Master B</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium">Nivel</label>
          <select id="na-nivel" class="h-9 w-full rounded-lg border bg-card px-2 text-sm">
            <option>Inicial</option>
            <option selected>Intermedio</option>
            <option>Avanzado</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-medium">Teléfono</label>
          <input id="na-tel" placeholder="+54 2920 55-0000" class="h-9 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
      </div>
      <div>
        <label class="text-xs font-medium">Objetivo principal</label>
        <input id="na-obj" placeholder="Ej.: Correr 10K Aniversario Valcheta" class="h-9 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div>
        <label class="text-xs font-medium">Tutor (solo si es menor de edad)</label>
        <input id="na-tutor" placeholder="Dejar vacío si es mayor · Ej.: María López (Madre)" class="h-9 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
        <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">Crear ficha</button>
      </div>
    </form>
  `);
};

window.saveNuevoAtleta = (e) => {
  e.preventDefault();
  const nombre = document.getElementById('na-nombre').value.trim();
  const apellido = document.getElementById('na-apellido').value.trim();
  const usuario = document.getElementById('na-user').value.trim().toLowerCase();
  const password = document.getElementById('na-pass').value.trim();
  const id = `${nombre}-${apellido}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
  const tutorStr = document.getElementById('na-tutor').value.trim();
  const objStr = document.getElementById('na-obj').value.trim() || 'Mejorar rendimiento general';

  const nuevo = {
    id: `${id}-${Date.now().toString().slice(-3)}`,
    nombre,
    apellido,
    usuario,
    password,
    fechaNacimiento: document.getElementById('na-fnac').value,
    genero: document.getElementById('na-genero').value,
    categoria: document.getElementById('na-cat').value,
    nivel: document.getElementById('na-nivel').value,
    ciudad: 'Valcheta',
    email: `${usuario}@mail.com`,
    telefono: document.getElementById('na-tel').value.trim() || '+54 2920 55-0100',
    contactoEmergencia: 'Contacto familiar · Valcheta',
    tutor: tutorStr
      ? {
          nombre: tutorStr,
          vinculo: 'Tutor/a',
          email: `familia.${usuario}@mail.com`,
          usuario: `familia.${usuario}`,
          password: password || '123',
        }
      : undefined,
    ingreso: DB.hoy,
    antecedentes: 'Ingreso reciente a la Escuela Municipal Willilefche.',
    salud: 'Apto físico al día.',
    objetivos: [{ texto: objStr, fecha: '2026-12-15', progreso: 20 }],
    marcas: [],
    resultados: [],
    evolucion: [
      { mes: 'Sep', ritmoSeg: 340 },
      { mes: 'Oct', ritmoSeg: 330 },
    ],
    extra: [],
    adherencia: 100,
  };

  DB.atletas.push(nuevo);
  DB.planes[nuevo.id] = [];
  saveDB();
  closeModal();
  showToast(`Ficha de ${nombre} ${apellido} creada`);
  location.hash = `#/entrenador/atletas/${nuevo.id}`;
};

// 4. Modal de Nueva Competencia
window.openNuevaCompetenciaModal = () => {
  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">Nueva competencia</h2>
        <p class="text-sm text-muted-foreground">Agregá una fecha al calendario del equipo.</p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>
    <form onsubmit="saveNuevaCompetencia(event)" class="mt-4 grid gap-3">
      <div>
        <label class="text-xs font-medium">Nombre de la competencia</label>
        <input id="nc-nombre" required placeholder="Ej.: Corrida Aniversario de Valcheta" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium">Fecha</label>
          <input id="nc-fecha" type="date" required value="2026-11-30" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs font-medium">Tipo</label>
          <select id="nc-tipo" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
            <option>Calle</option>
            <option>Pista</option>
            <option>Trail</option>
            <option>Cross</option>
          </select>
        </div>
      </div>
      <div>
        <label class="text-xs font-medium">Lugar</label>
        <input id="nc-lugar" required placeholder="Valcheta, Río Negro" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div>
        <label class="text-xs font-medium">Distancias (separadas por coma)</label>
        <input id="nc-dist" required value="5K, 10K" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
        <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">Guardar competencia</button>
      </div>
    </form>
  `);
};

window.saveNuevaCompetencia = (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nc-nombre').value.trim();
  const distancias = document
    .getElementById('nc-dist')
    .value.split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  DB.competencias.push({
    id: `c-${Date.now()}`,
    nombre,
    fecha: document.getElementById('nc-fecha').value,
    tipo: document.getElementById('nc-tipo').value,
    lugar: document.getElementById('nc-lugar').value.trim(),
    distancias: distancias.length ? distancias : ['10K'],
    inscriptos: [],
    sugeridos: [],
  });
  DB.competencias.sort((a, b) => a.fecha.localeCompare(b.fecha));
  saveDB();
  closeModal();
  showToast('Competencia agregada al calendario');
  renderApp();
};

// 5. Modal de Nuevo Cobro
window.openNuevoCobroModal = () => {
  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">Nuevo cobro</h2>
        <p class="text-sm text-muted-foreground">Registrá una cuota, inscripción, indumentaria o viaje.</p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>
    <form onsubmit="saveNuevoCobro(event)" class="mt-4 grid gap-3">
      <div>
        <label class="text-xs font-medium">Atleta</label>
        <select id="np-atleta" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
          ${DB.atletas.map((a) => `<option value="${a.id}">${esc(a.nombre)} ${esc(a.apellido)}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium">Concepto</label>
          <select id="np-concepto" class="h-10 w-full rounded-lg border bg-card px-3 text-sm">
            <option>Cuota</option>
            <option>Indumentaria</option>
            <option>Inscripción</option>
            <option>Viaje</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-medium">Monto (ARS)</label>
          <input id="np-monto" type="number" required value="28000" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium">Detalle</label>
          <input id="np-detalle" required placeholder="Ej.: Cuota noviembre" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs font-medium">Vencimiento</label>
          <input id="np-venc" type="date" required value="2026-11-10" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
      </div>
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
        <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">Agregar cobro</button>
      </div>
    </form>
  `);
};

window.saveNuevoCobro = (e) => {
  e.preventDefault();
  DB.pagos.push({
    id: `p-${Date.now()}`,
    atletaId: document.getElementById('np-atleta').value,
    concepto: document.getElementById('np-concepto').value,
    monto: Number(document.getElementById('np-monto').value),
    detalle: document.getElementById('np-detalle').value.trim(),
    vencimiento: document.getElementById('np-venc').value,
    estado: 'pendiente',
  });
  saveDB();
  closeModal();
  showToast('Cobro registrado correctamente');
  renderApp();
};

// 6. Modal de Nuevo Resultado / Marca Personal
window.openNuevoResultadoModal = (atletaId) => {
  const atleta = Helpers.getAtleta(atletaId);
  showModalHtml(`
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-bold">Cargar resultado · ${esc(atleta.nombre)}</h2>
        <p class="text-sm text-muted-foreground">Actualiza su historial, sus marcas personales y el ranking público.</p>
      </div>
      <button type="button" onclick="closeModal()" class="text-muted-foreground hover:text-foreground">✕</button>
    </div>
    <form onsubmit="saveNuevoResultado(event, '${atletaId}')" class="mt-4 grid gap-3">
      <div>
        <label class="text-xs font-medium">Competencia</label>
        <input id="nr-comp" required placeholder="Ej.: Torneo Provincial Valcheta" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="text-xs font-medium">Distancia</label>
          <select id="nr-dist" class="h-10 w-full rounded-lg border bg-card px-2 text-sm">
            ${DB.distanciasRanking.map((d) => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="text-xs font-medium">Tiempo (mm:ss)</label>
          <input id="nr-tiempo" required placeholder="40:15" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs font-medium">Fecha</label>
          <input id="nr-fecha" type="date" required value="${DB.hoy}" class="h-10 w-full rounded-lg border bg-card px-2 text-sm" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium">Puesto General</label>
          <input id="nr-posg" type="number" required value="5" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs font-medium">Puesto Categoría</label>
          <input id="nr-posc" type="number" required value="1" class="h-10 w-full rounded-lg border bg-card px-3 text-sm" />
        </div>
      </div>
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
        <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">Guardar resultado</button>
      </div>
    </form>
  `);
};

window.saveNuevoResultado = (e, atletaId) => {
  e.preventDefault();
  const atleta = Helpers.getAtleta(atletaId);
  if (!atleta) return;
  const competencia = document.getElementById('nr-comp').value.trim();
  const distancia = document.getElementById('nr-dist').value;
  const tiempo = document.getElementById('nr-tiempo').value.trim();
  const fecha = document.getElementById('nr-fecha').value;
  const posGeneral = Number(document.getElementById('nr-posg').value);
  const posCategoria = Number(document.getElementById('nr-posc').value);

  atleta.resultados = atleta.resultados || [];
  atleta.resultados.unshift({
    competenciaId: `c-${Date.now()}`,
    competencia,
    fecha,
    distancia,
    tiempo,
    posGeneral,
    posCategoria,
  });

  atleta.marcas = atleta.marcas || [];
  const marcaExistente = atleta.marcas.find((m) => m.distancia === distancia);
  if (!marcaExistente) {
    atleta.marcas.push({ distancia, tiempo, fecha, competencia });
  } else if (Helpers.aSegundos(tiempo) <= Helpers.aSegundos(marcaExistente.tiempo)) {
    marcaExistente.tiempo = tiempo;
    marcaExistente.fecha = fecha;
    marcaExistente.competencia = competencia;
  }

  saveDB();
  closeModal();
  showToast('Resultado y marca actualizados');
  renderApp();
};

/* ==========================================================================
   ENRUTADOR PRINCIPAL CON PROTECCIÓN DE ACCESO POR ROL
   ========================================================================== */

function renderApp(preserveSearchFocus = false) {
  const hash = location.hash || '#/';
  const path = hash.slice(1) || '/';
  const session = Auth.getSession();
  const app = document.getElementById('app');

  // Guardias de seguridad por rol
  if (path.startsWith('/entrenador')) {
    if (!session) {
      Auth.setSession({ role: 'coach', nombre: DB.equipo.entrenador, loginAt: Date.now() });
    } else if (session.role === 'athlete') {
      location.hash = `#/atleta/${session.atletaId}`;
      return;
    } else if (session.role === 'guardian') {
      location.hash = `#/familia/${session.atletaId}`;
      return;
    }
  } else if (path.startsWith('/atleta')) {
    if (session && session.role === 'athlete') {
      const requestedId = path.replace('/atleta', '').replace('/', '');
      if (requestedId && requestedId !== session.atletaId) {
        location.hash = `#/atleta/${session.atletaId}`;
        return;
      }
    }
  } else if (path.startsWith('/familia')) {
    if (session && session.role === 'guardian') {
      const requestedId = path.replace('/familia', '').replace('/', '');
      if (requestedId && requestedId !== session.atletaId) {
        location.hash = `#/familia/${session.atletaId}`;
        return;
      }
    }
  }

  let html = '';
  if (path === '/' || path === '') {
    document.title = 'Willilefche · Escuela Municipal de Valcheta';
    html = viewHome();
  } else if (path === '/rankings') {
    document.title = 'Rankings y marcas · Willilefche';
    html = viewRankings();
  } else if (path === '/competencias') {
    document.title = 'Calendario de competencias · Willilefche';
    html = viewCompetenciasPublic();
  } else if (path === '/ingresar') {
    document.title = 'Ingresar · Willilefche';
    html = viewIngresar();
  } else if (path === '/entrenador' || path === '/entrenador/') {
    document.title = 'Panel del entrenador · Willilefche';
    html = viewCoachDashboard();
  } else if (path === '/entrenador/atletas' || path === '/entrenador/atletas/') {
    document.title = 'Atletas · Willilefche';
    html = viewCoachAtletas();
  } else if (path.startsWith('/entrenador/atletas/')) {
    const atletaId = path.replace('/entrenador/atletas/', '').split('/')[0];
    const a = Helpers.getAtleta(atletaId);
    document.title = a ? `${Helpers.nombreCompleto(a)} · Willilefche` : 'Atleta · Willilefche';
    html = viewCoachAtletaFicha(atletaId);
  } else if (path === '/entrenador/competencias') {
    document.title = 'Competencias · Willilefche';
    html = viewCoachCompetencias();
  } else if (path === '/entrenador/pagos') {
    document.title = 'Pagos · Willilefche';
    html = viewCoachPagos();
  } else if (path === '/entrenador/avisos') {
    document.title = 'Avisos · Willilefche';
    html = viewCoachAvisos();
  } else if (path === '/atleta' || path.startsWith('/atleta/')) {
    const atletaId = path.replace('/atleta', '').replace('/', '') || session?.atletaId || 'lucia-gomez';
    document.title = 'Mi plan · Willilefche';
    html = viewAtletaPortal(atletaId, false);
  } else if (path === '/familia' || path.startsWith('/familia/')) {
    const atletaId = path.replace('/familia', '').replace('/', '') || session?.atletaId || 'tomas-ferreyra';
    document.title = 'Cuenta familiar · Willilefche';
    html = viewAtletaPortal(atletaId, true);
  } else {
    html = viewHome();
  }

  app.innerHTML = html;
  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (preserveSearchFocus) {
    const input = document.getElementById('search-atletas-input');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  } else {
    window.scrollTo(0, 0);
  }
}

window.renderApp = renderApp;
window.addEventListener('hashchange', () => renderApp(false));
window.addEventListener('DOMContentLoaded', () => {
  CloudSync.init();
  renderApp(false);
});
