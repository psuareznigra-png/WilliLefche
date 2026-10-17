/**
 * data.js - Motor de Datos Reales Cache-First + Sincronización en Tiempo Real con Firebase Firestore
 * Escuela Municipal de Atletismo Willilefche · Valcheta, Río Negro
 */

const STORAGE_KEY = 'willilefche_db_real_v1';
const CUSTOM_FB_CONFIG_KEY = 'willilefche_firebase_config';

// Limpiar restos de bases de prueba anteriores en el navegador
try {
  localStorage.removeItem('willilefche_db_v1');
  localStorage.removeItem('willilefche_db_v2');
} catch (e) {}

function getTodayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getCurrentWeekISO(baseIso) {
  const [y, m, d] = (baseIso || getTodayISO()).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay(); // 0=Dom, 1=Lun...
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  dt.setUTCDate(dt.getUTCDate() + diffToMonday);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(dt);
    cur.setUTCDate(dt.getUTCDate() + i);
    days.push(cur.toISOString().slice(0, 10));
  }
  return days;
}

const HOY_DEFAULT = getTodayISO();

const DEFAULT_CONCEPTOS_COBRO = [
  { id: 'cuota', nombre: 'Cuota', montoSugerido: 15000, detalleSugerido: 'Cuota mensual' },
  { id: 'indumentaria', nombre: 'Indumentaria', montoSugerido: 25000, detalleSugerido: 'Indumentaria del equipo' },
  { id: 'viajes-competencias', nombre: 'Viajes y Competencias', montoSugerido: 20000, detalleSugerido: 'Viaje y participación en competencia' },
];

const INITIAL_DB = {
  appKey: 'WLF-VALCHETA-2026',
  version: 'real-1.0',
  updatedAt: Date.now(),
  hoy: HOY_DEFAULT,
  equipo: {
    nombre: 'Escuela Municipal Willilefche',
    sede: 'Valcheta, Río Negro',
    // Usuario Administrador
    adminUser: 'admin',
    adminPass: 'Admin123@',
    // Usuario Entrenador (Renglón 19 de la Nómina Inicial)
    entrenador: 'Cristian Javier Torres',
    entrenadorDni: '27.884.821',
    entrenadorFechaNacimiento: '1980-07-02',
    coachUser: 'cristian.torres',
    coachPass: '27884821',
  },
  semanaActual: getCurrentWeekISO(HOY_DEFAULT),
  distanciasRanking: ['80 m', '150 m', '300 m', '600 m', '800 m', '1500 m', '3000 m', '5K', '10K', '21K'],
  conceptosCobro: DEFAULT_CONCEPTOS_COBRO,
  atletas: [
    {
      id: 'alejo-rivas-abrate',
      nroNomina: 1,
      nombre: 'Alejo Efraín',
      apellido: 'Rivas Abrate',
      dni: '50.744.971',
      usuario: 'alejo.rivas',
      password: '50744971',
      fechaNacimiento: '2011-02-07',
      genero: 'M',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Rivas Abrate',
      tutor: {
        nombre: 'Familia Rivas Abrate',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.rivas',
        password: '50744971',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'valentina-guenumil',
      nroNomina: 2,
      nombre: 'Valentina',
      apellido: 'Guenumil',
      dni: '47.914.403',
      usuario: 'valentina.guenumil',
      password: '47914403',
      fechaNacimiento: '2007-02-28',
      genero: 'F',
      categoria: 'U20',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Guenumil',
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'nicolas-cayun',
      nroNomina: 3,
      nombre: 'Nicolás Axel',
      apellido: 'Cayún',
      dni: '52.322.748',
      usuario: 'nicolas.cayun',
      password: '52322748',
      fechaNacimiento: '2012-04-22',
      genero: 'M',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Cayún',
      tutor: {
        nombre: 'Familia Cayún',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.cayun',
        password: '52322748',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'rocio-ostertag',
      nroNomina: 4,
      nombre: 'Rocío Belén',
      apellido: 'Ostertag',
      dni: '52.328.278',
      usuario: 'rocio.ostertag',
      password: '52328278',
      fechaNacimiento: '2012-10-16',
      genero: 'F',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Ostertag',
      tutor: {
        nombre: 'Familia Ostertag',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.ostertag',
        password: '52328278',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'keyla-albatte-canoel',
      nroNomina: 5,
      nombre: 'Keyla Agostina',
      apellido: 'Albatte Cañoel',
      dni: '52.325.514',
      usuario: 'keyla.albatte',
      password: '52325514',
      fechaNacimiento: '2011-08-04',
      genero: 'F',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Albatte Cañoel',
      tutor: {
        nombre: 'Familia Albatte Cañoel',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.albatte',
        password: '52325514',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'jonas-yanca-paillalef',
      nroNomina: 6,
      nombre: 'Jonas Taiel',
      apellido: 'Yanca Paillalef',
      dni: '53.352.267',
      usuario: 'jonas.yanca',
      password: '53352267',
      fechaNacimiento: '2013-08-30',
      genero: 'M',
      categoria: 'U14',
      nivel: 'Inicial',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Yanca Paillalef',
      tutor: {
        nombre: 'Familia Yanca Paillalef',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.yanca',
        password: '53352267',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'mauro-ghezzi',
      nroNomina: 7,
      nombre: 'Mauro',
      apellido: 'Ghezzi',
      dni: '50.208.984',
      usuario: 'mauro.ghezzi',
      password: '50208984',
      fechaNacimiento: '2010-05-04',
      genero: 'M',
      categoria: 'U18',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Ghezzi',
      tutor: {
        nombre: 'Familia Ghezzi',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.ghezzi',
        password: '50208984',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'lucila-chico',
      nroNomina: 8,
      nombre: 'Lucila Aymará',
      apellido: 'Chico',
      dni: '53.014.584',
      usuario: 'lucila.chico',
      password: '53014584',
      fechaNacimiento: '2013-05-28',
      genero: 'F',
      categoria: 'U14',
      nivel: 'Inicial',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Chico',
      tutor: {
        nombre: 'Familia Chico',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.chico',
        password: '53014584',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'eluney-quiroga-casas',
      nroNomina: 9,
      nombre: 'Eluney Amely',
      apellido: 'Quiroga Casas',
      dni: '52.320.548',
      usuario: 'eluney.quiroga',
      password: '52320548',
      fechaNacimiento: '2012-04-28',
      genero: 'F',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Quiroga Casas',
      tutor: {
        nombre: 'Familia Quiroga Casas',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.quiroga',
        password: '52320548',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'rebea-catriel',
      nroNomina: 10,
      nombre: 'Rebea Aylen',
      apellido: 'Catriel',
      dni: '53.014.585',
      usuario: 'rebea.catriel',
      password: '53014585',
      fechaNacimiento: '2013-07-16',
      genero: 'F',
      categoria: 'U14',
      nivel: 'Inicial',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Catriel',
      tutor: {
        nombre: 'Familia Catriel',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.catriel',
        password: '53014585',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'ian-mortada',
      nroNomina: 11,
      nombre: 'Ian Nayhen',
      apellido: 'Mortada',
      dni: '51.237.336',
      usuario: 'ian.mortada',
      password: '51237336',
      fechaNacimiento: '2011-08-09',
      genero: 'M',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Mortada',
      tutor: {
        nombre: 'Familia Mortada',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.mortada',
        password: '51237336',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'santiago-marileo',
      nroNomina: 12,
      nombre: 'Santiago Darío',
      apellido: 'Marileo',
      dni: '53.015.898',
      usuario: 'santiago.marileo',
      password: '53015898',
      fechaNacimiento: '2013-04-28',
      genero: 'M',
      categoria: 'U14',
      nivel: 'Inicial',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Marileo',
      tutor: {
        nombre: 'Familia Marileo',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.marileo',
        password: '53015898',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'tiziana-zapata',
      nroNomina: 13,
      nombre: 'Tiziana Elizabeth',
      apellido: 'Zapata',
      dni: '51.033.277',
      usuario: 'tiziana.zapata',
      password: '51033277',
      fechaNacimiento: '2011-08-04',
      genero: 'F',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Zapata',
      tutor: {
        nombre: 'Familia Zapata',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.zapata',
        password: '51033277',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'jazmin-quilogran-cerdan',
      nroNomina: 14,
      nombre: 'Jazmín Selena',
      apellido: 'Quilográn Cerdan',
      dni: '51.237.348',
      usuario: 'jazmin.quilogran',
      password: '51237348',
      fechaNacimiento: '2011-09-19',
      genero: 'F',
      categoria: 'U16',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Quilográn Cerdan',
      tutor: {
        nombre: 'Familia Quilográn Cerdan',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.quilogran',
        password: '51237348',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'lucas-furlan',
      nroNomina: 15,
      nombre: 'Lucas Benjamín',
      apellido: 'Furlan',
      dni: '50.432.052',
      usuario: 'lucas.furlan',
      password: '50432052',
      fechaNacimiento: '2010-07-12',
      genero: 'M',
      categoria: 'U18',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Furlan',
      tutor: {
        nombre: 'Familia Furlan',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.furlan',
        password: '50432052',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
    {
      id: 'malena-bahamonde-uircain',
      nroNomina: 16,
      nombre: 'Malena Ahitana',
      apellido: 'Bahamonde Uircain',
      dni: '53.014.587',
      usuario: 'malena.bahamonde',
      password: '53014587',
      fechaNacimiento: '2013-06-05',
      genero: 'F',
      categoria: 'U14',
      nivel: 'Inicial',
      ciudad: 'Valcheta',
      email: '',
      telefono: '',
      contactoEmergencia: 'Familia Bahamonde Uircain',
      tutor: {
        nombre: 'Familia Bahamonde Uircain',
        vinculo: 'Tutor/a',
        email: '',
        usuario: 'familia.bahamonde',
        password: '53014587',
      },
      ingreso: '2026-03-01',
      antecedentes: 'Atleta de la Escuela Municipal de Atletismo Willilefche.',
      salud: 'Apto físico en seguimiento.',
      objetivos: [],
      marcas: [],
      resultados: [],
      evolucion: [],
      extra: [],
      adherencia: 100,
    },
  ],
  planes: {},
  competencias: [],
  pagos: [],
  avisos: [],
  mensajes: {},
};

/* ---------- Limpieza de campos undefined y reparación de acentos UTF-8 ---------- */
function fixMojibakeString(str) {
  if (typeof str !== 'string' || !str.includes('Ã')) return str;
  return str
    .replace(/Ã\u00ad/g, 'í')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã\u0081/g, 'Á')
    .replace(/Ã\u0089/g, 'É')
    .replace(/Ã\u008d/g, 'Í')
    .replace(/Ã\u0093/g, 'Ó')
    .replace(/Ã\u009a/g, 'Ú')
    .replace(/Ã\u0091/g, 'Ñ')
    .replace(/EfraÃn/g, 'Efraín')
    .replace(/RocÃo/g, 'Rocío')
    .replace(/DarÃo/g, 'Darío')
    .replace(/JazmÃn/g, 'Jazmín')
    .replace(/BenjamÃn/g, 'Benjamín')
    .replace(/RÃo/g, 'Río')
    .replace(/fÃsico/g, 'físico');
}

function fixMojibakeInObj(val) {
  if (typeof val === 'string') return fixMojibakeString(val);
  if (Array.isArray(val)) return val.map(fixMojibakeInObj);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) out[k] = fixMojibakeInObj(v);
    }
    return out;
  }
  return val;
}

function sanitizeForFirestore(obj) {
  return fixMojibakeInObj(JSON.parse(JSON.stringify(obj)));
}

function isDummyData(dbObj) {
  if (!dbObj || !Array.isArray(dbObj.atletas)) return true;
  if (dbObj.equipo && dbObj.equipo.entrenador === 'Prof. Martín Ríos') return true;
  if (dbObj.atletas.some((a) => a.id === 'lucia-gomez' || a.id === 'tomas-ferreyra')) return true;
  return false;
}

/* ---------- Carga Inicial (Cache-First) ---------- */
function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = fixMojibakeInObj(JSON.parse(raw));
      if (parsed && Array.isArray(parsed.atletas) && !isDummyData(parsed)) {
        // Asegurar credenciales y estructura del equipo actualizadas
        parsed.equipo = {
          ...INITIAL_DB.equipo,
          ...(parsed.equipo || {}),
          adminUser: parsed.equipo?.adminUser || 'admin',
          adminPass: parsed.equipo?.adminPass || 'Admin123@',
          entrenador: parsed.equipo?.entrenador || 'Cristian Javier Torres',
          entrenadorDni: parsed.equipo?.entrenadorDni || '27.884.821',
          entrenadorFechaNacimiento: parsed.equipo?.entrenadorFechaNacimiento || '1980-07-02',
          coachUser: parsed.equipo?.coachUser || 'cristian.torres',
          coachPass: parsed.equipo?.coachPass || '27884821',
        };
        if (!Array.isArray(parsed.conceptosCobro) || parsed.conceptosCobro.length === 0) {
          parsed.conceptosCobro = JSON.parse(JSON.stringify(DEFAULT_CONCEPTOS_COBRO));
        }
        parsed.hoy = getTodayISO();
        parsed.semanaActual = getCurrentWeekISO(parsed.hoy);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo localStorage:', e);
  }
  const fresh = JSON.parse(JSON.stringify(INITIAL_DB));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch (e) {}
  return fresh;
}

window.DB = loadDB();

/* ---------- Motor de Sincronización Firebase Firestore ---------- */
const CloudSync = {
  firestore: null,
  status: 'local', // 'local' | 'connecting' | 'online' | 'error'
  statusText: 'Modo Local (Sin nube)',
  _unsubscribe: null,
  _ignoreNextSnapshot: false,

  getActiveFirebaseConfig() {
    try {
      const customRaw = localStorage.getItem(CUSTOM_FB_CONFIG_KEY);
      if (customRaw) {
        const parsed = JSON.parse(customRaw);
        if (parsed && parsed.apiKey && parsed.projectId) {
          if (!parsed.databaseId) parsed.databaseId = (window.firebaseConfig && window.firebaseConfig.databaseId) || 'default';
          return parsed;
        }
      }
    } catch (e) {}
    return window.firebaseConfig || null;
  },

  isConfigValid(cfg) {
    return Boolean(
      cfg &&
        cfg.apiKey &&
        cfg.projectId &&
        !String(cfg.apiKey).includes('PEGAR_AQUI') &&
        String(cfg.apiKey).length > 10
    );
  },

  init() {
    const cfg = this.getActiveFirebaseConfig();
    if (!this.isConfigValid(cfg)) {
      this.setStatus('local', 'Modo Local · Falta configurar Firebase');
      return;
    }

    if (!window.firebase || !window.firebase.firestore) {
      this.setStatus('error', 'SDK de Firebase no disponible');
      return;
    }

    try {
      this.setStatus('connecting', 'Conectando a Firebase…');
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(cfg);
      }
      this.firestore = window.firebase.firestore();
      const targetDbId = cfg.databaseId || 'default';
      if (this.firestore && this.firestore._delegate && this.firestore._delegate._databaseId) {
        this.firestore._delegate._databaseId.database = targetDbId;
      }

      // Habilitar persistencia offline de Firestore
      this.firestore
        .enablePersistence({ synchronizeTabs: true })
        .catch(() => {});

      const docRef = this.firestore.collection('willilefche').doc('main_db');

      this._unsubscribe = docRef.onSnapshot(
        (snapshot) => {
          if (this._ignoreNextSnapshot) {
            this._ignoreNextSnapshot = false;
            this.setStatus('online', 'Sincronizado en vivo');
            return;
          }

          if (snapshot.exists) {
            const cloudData = fixMojibakeInObj(snapshot.data());
            // Si en la nube habían quedado datos de prueba viejos, migrar automáticamente los datos reales
            if (isDummyData(cloudData)) {
              console.log('Migrando Nómina Inicial real a Firebase Firestore...');
              this.pushToCloud();
              return;
            }
            if (cloudData && Array.isArray(cloudData.atletas)) {
              if (!Array.isArray(cloudData.conceptosCobro) || cloudData.conceptosCobro.length === 0) {
                cloudData.conceptosCobro = JSON.parse(JSON.stringify(DEFAULT_CONCEPTOS_COBRO));
              }
              window.DB = cloudData;
              window.DB.hoy = getTodayISO();
              window.DB.semanaActual = getCurrentWeekISO(window.DB.hoy);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(window.DB));
              } catch (e) {}
              this.setStatus('online', 'Sincronizado en vivo');
              if (typeof window.renderApp === 'function') {
                window.renderApp(true);
              }
            }
          } else {
            // Primera vez que se conecta el proyecto Firebase: subir Nómina Inicial real automáticamente
            this.pushToCloud();
          }
        },
        (err) => {
          console.error('Error en suscripción Firestore:', err);
          if (err.code === 'permission-denied') {
            this.setStatus('error', 'Permiso denegado (Revisar Reglas Firestore)');
          } else if (err.code === 'not-found' || (err.message && err.message.includes('does not exist'))) {
            this.setStatus('error', 'Falta crear Firestore Database en consola');
          } else {
            this.setStatus('error', 'Sin conexión (Guardando en caché local)');
          }
        }
      );
    } catch (err) {
      console.error('Error inicializando Firebase:', err);
      this.setStatus('error', 'Error de configuración Firebase');
    }
  },

  setStatus(status, text) {
    this.status = status;
    this.statusText = text;
    const badges = document.querySelectorAll('[data-cloud-badge]');
    badges.forEach((b) => {
      b.innerHTML = this.renderBadgeHtml();
    });
  },

  renderBadgeHtml() {
    const map = {
      online: ['bg-success-soft text-success border-success/30', '●'],
      connecting: ['bg-warning-soft text-warning-text border-warning/30', '◌'],
      error: ['bg-destructive/15 text-destructive border-destructive/30', '▲'],
      local: ['bg-muted text-muted-foreground border-border', '○'],
    };
    const [cls, dot] = map[this.status] || map.local;
    return `
      <span
        title="Estado de sincronización de la base de datos"
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold select-none ${cls}"
      >
        <span>${dot}</span>
        <span>${this.statusText}</span>
      </span>
    `;
  },

  async pushToCloud() {
    if (!this.firestore) return false;
    try {
      this._ignoreNextSnapshot = true;
      window.DB.appKey = 'WLF-VALCHETA-2026';
      window.DB.updatedAt = Date.now();
      const cleanData = sanitizeForFirestore(window.DB);
      await this.firestore.collection('willilefche').doc('main_db').set(cleanData);

      // También sincronizar colección individual de atletas/usuarios para consultas directas en Firebase
      try {
        const batch = this.firestore.batch();
        const usersCol = this.firestore.collection('willilefche_usuarios');
        // Admin
        batch.set(usersCol.doc('admin'), {
          appKey: 'WLF-VALCHETA-2026',
          id: 'admin',
          usuario: window.DB.equipo.adminUser || 'admin',
          password: window.DB.equipo.adminPass || 'Admin123@',
          role: 'admin',
          nombre: 'Administrador',
          updatedAt: window.DB.updatedAt,
        });
        // Entrenador (Fila 19)
        batch.set(usersCol.doc('entrenador_cristian_torres'), {
          appKey: 'WLF-VALCHETA-2026',
          id: 'entrenador_cristian_torres',
          nroNomina: 19,
          usuario: window.DB.equipo.coachUser || 'cristian.torres',
          password: window.DB.equipo.coachPass || '27884821',
          role: 'coach',
          nombre: window.DB.equipo.entrenador || 'Cristian Javier Torres',
          dni: window.DB.equipo.entrenadorDni || '27.884.821',
          fechaNacimiento: window.DB.equipo.entrenadorFechaNacimiento || '1980-07-02',
          updatedAt: window.DB.updatedAt,
        });
        // Atletas
        (window.DB.atletas || []).forEach((a) => {
          batch.set(usersCol.doc(a.id), {
            appKey: 'WLF-VALCHETA-2026',
            id: a.id,
            nroNomina: a.nroNomina || null,
            nombre: a.nombre,
            apellido: a.apellido,
            dni: a.dni || '',
            fechaNacimiento: a.fechaNacimiento || '',
            categoria: a.categoria || '',
            usuario: a.usuario,
            password: a.password,
            role: 'athlete',
            tutor: a.tutor || null,
            updatedAt: window.DB.updatedAt,
          });
        });
        await batch.commit();
      } catch (subErr) {
        console.warn('Aviso al sincronizar colección secundaria:', subErr);
      }

      this.setStatus('online', 'Sincronizado en Nube');
      return true;
    } catch (e) {
      console.error('Error guardando en Firestore:', e);
      this._ignoreNextSnapshot = false;
      this.setStatus('error', 'Error al guardar en nube');
      return false;
    }
  },
};

window.CloudSync = CloudSync;

function saveDB() {
  window.DB.updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.DB));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
  CloudSync.pushToCloud();
}

function resetDB() {
  const s = window.Auth && typeof window.Auth.getSession === 'function' ? window.Auth.getSession() : null;
  if (!s || s.subRole !== 'admin') return;
  window.DB = JSON.parse(JSON.stringify(INITIAL_DB));
  saveDB();
}

window.saveDB = saveDB;
window.resetDB = resetDB;

/* ---------- Funciones de Backup (Exportar / Importar JSON - Exclusivo Admin) ---------- */
window.exportBackupJSON = () => {
  const s = window.Auth && typeof window.Auth.getSession === 'function' ? window.Auth.getSession() : null;
  if (!s || s.subRole !== 'admin') {
    if (window.showToast) window.showToast('Acceso restringido al Administrador', 'info');
    return;
  }
  const dataStr = JSON.stringify(window.DB, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_willilefche_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  if (window.showToast) window.showToast('Copia de seguridad descargada');
};

window.importBackupJSON = (fileInput) => {
  const s = window.Auth && typeof window.Auth.getSession === 'function' ? window.Auth.getSession() : null;
  if (!s || s.subRole !== 'admin') {
    if (window.showToast) window.showToast('Acceso restringido al Administrador', 'info');
    return;
  }
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !Array.isArray(parsed.atletas)) {
        alert('El archivo seleccionado no es un backup válido de Willilefche.');
        return;
      }
      window.DB = parsed;
      saveDB();
      if (window.closeModal) window.closeModal();
      if (window.showToast) window.showToast('Copia de seguridad restaurada con éxito');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
};

/* ---------- Helpers de formato y consulta ---------- */

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

window.Helpers = {
  getAtleta(id) {
    return window.DB.atletas.find((a) => a.id === id);
  },
  getPlan(atletaId) {
    return (window.DB.planes[atletaId] || []).slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  getPagos(atletaId) {
    return window.DB.pagos.filter((p) => p.atletaId === atletaId);
  },
  nombreCompleto(a) {
    return `${a.nombre} ${a.apellido}`;
  },
  edad(fechaNacimiento, hoy = window.DB.hoy) {
    if (!fechaNacimiento) return 0;
    const [y, m, d] = fechaNacimiento.split('-').map(Number);
    const [hy, hm, hd] = (hoy || getTodayISO()).split('-').map(Number);
    let e = hy - y;
    if (hm < m || (hm === m && hd < d)) e--;
    return e;
  },
  calcularCategoria(fechaNacimiento, hoy = window.DB.hoy) {
    const e = this.edad(fechaNacimiento, hoy);
    if (e <= 11) return 'U12';
    if (e <= 13) return 'U14';
    if (e <= 15) return 'U16';
    if (e <= 17) return 'U18';
    if (e <= 19) return 'U20';
    if (e <= 34) return 'Mayores';
    if (e <= 44) return 'Master A';
    return 'Master B';
  },
  deudaDe(atletaId) {
    return this.getPagos(atletaId)
      .filter((p) => p.estado !== 'pagado')
      .reduce((t, p) => t + p.monto, 0);
  },
  tieneVencidos(atletaId) {
    return this.getPagos(atletaId).some((p) => p.estado === 'vencido');
  },
  aSegundos(t) {
    return String(t)
      .replace('″', '')
      .split(':')
      .map(Number)
      .reduce((acc, n) => acc * 60 + n, 0);
  },
  formatoRitmo(seg) {
    const m = Math.floor(seg / 60);
    const s = String(seg % 60).padStart(2, '0');
    return `${m}:${s}`;
  },
  pesos(n) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(n);
  },
  fechaCorta(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MESES[m - 1]} ${y}`;
  },
  diaSemana(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return { dia: DIAS[dt.getUTCDay()], num: d, mes: MESES[m - 1] };
  },
  diasHasta(iso, hoy = window.DB.hoy) {
    const a = Date.parse(`${iso}T00:00:00Z`);
    const b = Date.parse(`${hoy}T00:00:00Z`);
    return Math.round((a - b) / 86400000);
  },
  rankingPublico(distancia) {
    return window.DB.atletas
      .filter((a) => !a.excluirRanking)
      .flatMap((a) =>
        (a.marcas || [])
          .filter((m) => m.distancia === distancia)
          .map((m) => ({
            id: a.id,
            nombre: `${a.nombre} ${a.apellido[0]}.`,
            categoria: a.categoria,
            genero: a.genero,
            edad: this.edad(a.fechaNacimiento),
            tiempo: m.tiempo,
            competencia: m.competencia,
            fecha: m.fecha,
          }))
      )
      .sort((x, y) => this.aSegundos(x.tiempo) - this.aSegundos(y.tiempo));
  },
};
