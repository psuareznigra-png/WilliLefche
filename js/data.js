/**
 * data.js - Motor de Datos Cache-First + Sincronización en Tiempo Real con Firebase Firestore
 * Diseñado para Willilefche · Escuela Municipal de Valcheta
 */

const STORAGE_KEY = 'willilefche_db_v2';
const CUSTOM_FB_CONFIG_KEY = 'willilefche_firebase_config';
const HOY_DEFAULT = '2026-10-16';

const INITIAL_DB = {
  updatedAt: Date.now(),
  hoy: HOY_DEFAULT,
  equipo: {
    nombre: 'Escuela Municipal Willilefche',
    entrenador: 'Prof. Martín Ríos',
    sede: 'Valcheta, Río Negro',
    adminUser: 'entrenador',
    adminPass: 'willilefche2026',
  },
  semanaActual: [
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    '2026-10-17',
    '2026-10-18',
  ],
  distanciasRanking: ['1500 m', '3000 m', '5K', '10K', '21K', '42K'],
  atletas: [
    {
      id: 'lucia-gomez',
      nombre: 'Lucía',
      apellido: 'Gómez',
      usuario: 'lucia',
      password: '123',
      fechaNacimiento: '1996-03-14',
      genero: 'F',
      categoria: 'Mayores',
      nivel: 'Avanzado',
      ciudad: 'Valcheta',
      email: 'lucia.gomez@mail.com',
      telefono: '+54 2920 55-0142',
      contactoEmergencia: 'Pablo Gómez (hermano) · +54 2920 55-0199',
      ingreso: '2022-02-01',
      antecedentes:
        'Ex nadadora. Corre desde 2019. Completó 3 medias maratones y una maratón (Buenos Aires 2025).',
      salud: 'Fascitis plantar en 2024, resuelta. Control con kinesiólogo cada 2 meses.',
      objetivos: [
        { texto: 'Bajar de 1:35 en 21K', fecha: '2026-11-22', progreso: 75 },
        { texto: 'Maratón de Buenos Aires sub 3:20', fecha: '2027-09-20', progreso: 30 },
      ],
      marcas: [
        { distancia: '5K', tiempo: '19:48', fecha: '2026-05-10', competencia: 'Corre Valcheta 5K' },
        { distancia: '10K', tiempo: '41:12', fecha: '2026-08-02', competencia: '10K del Parque' },
        { distancia: '21K', tiempo: '1:36:40', fecha: '2026-06-14', competencia: 'Media de Viedma' },
        { distancia: '42K', tiempo: '3:31:05', fecha: '2025-09-21', competencia: 'Maratón de Buenos Aires' },
      ],
      resultados: [
        { competenciaId: 'c-10k-parque', competencia: '10K del Parque', fecha: '2026-08-02', distancia: '10K', tiempo: '41:12', posGeneral: 38, posCategoria: 4 },
        { competenciaId: 'c-media-rosario', competencia: 'Media de Viedma', fecha: '2026-06-14', distancia: '21K', tiempo: '1:36:40', posGeneral: 112, posCategoria: 9 },
        { competenciaId: 'c-corre-cba', competencia: 'Corre Valcheta 5K', fecha: '2026-05-10', distancia: '5K', tiempo: '19:48', posGeneral: 21, posCategoria: 2 },
      ],
      evolucion: [
        { mes: 'May', ritmoSeg: 318 },
        { mes: 'Jun', ritmoSeg: 314 },
        { mes: 'Jul', ritmoSeg: 309 },
        { mes: 'Ago', ritmoSeg: 305 },
        { mes: 'Sep', ritmoSeg: 301 },
        { mes: 'Oct', ritmoSeg: 297 },
      ],
      extra: [
        { etiqueta: 'Zapatillas', valor: 'Rotación: 2 pares, cambio a 650 km' },
        { etiqueta: 'FC máxima', valor: '188 lpm' },
      ],
      adherencia: 92,
    },
    {
      id: 'tomas-ferreyra',
      nombre: 'Tomás',
      apellido: 'Ferreyra',
      usuario: 'tomas',
      password: '123',
      fechaNacimiento: '2010-07-22',
      genero: 'M',
      categoria: 'Menores',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: 'tomas.ferreyra@mail.com',
      telefono: '+54 2920 55-0233',
      contactoEmergencia: 'Carla Ruiz (madre) · +54 2920 55-0234',
      tutor: {
        nombre: 'Carla Ruiz',
        vinculo: 'Madre',
        email: 'carla.ruiz@mail.com',
        usuario: 'familia.tomas',
        password: '123',
      },
      ingreso: '2024-03-04',
      antecedentes: 'Viene del fútbol infantil. Interés en pista (1500 m y 3000 m).',
      salud: 'Apto físico vigente hasta 03/2027. Sin lesiones.',
      objetivos: [
        { texto: '1500 m por debajo de 4:40', fecha: '2026-12-05', progreso: 60 },
        { texto: 'Participar del Provincial U18', fecha: '2027-03-15', progreso: 40 },
      ],
      marcas: [
        { distancia: '1500 m', tiempo: '4:51', fecha: '2026-09-12', competencia: 'Torneo de Pista Apertura' },
        { distancia: '3000 m', tiempo: '10:24', fecha: '2026-07-18', competencia: 'Control de pista' },
        { distancia: '5K', tiempo: '18:55', fecha: '2026-05-10', competencia: 'Corre Valcheta 5K' },
      ],
      resultados: [
        { competenciaId: 'c-pista-apertura', competencia: 'Torneo de Pista Apertura', fecha: '2026-09-12', distancia: '1500 m', tiempo: '4:51', posGeneral: 6, posCategoria: 3 },
        { competenciaId: 'c-corre-cba', competencia: 'Corre Valcheta 5K', fecha: '2026-05-10', distancia: '5K', tiempo: '18:55', posGeneral: 14, posCategoria: 1 },
      ],
      evolucion: [
        { mes: 'May', ritmoSeg: 300 },
        { mes: 'Jun', ritmoSeg: 296 },
        { mes: 'Jul', ritmoSeg: 290 },
        { mes: 'Ago', ritmoSeg: 288 },
        { mes: 'Sep', ritmoSeg: 281 },
        { mes: 'Oct', ritmoSeg: 278 },
      ],
      extra: [{ etiqueta: 'Escuela', valor: 'ESR N° 27 · turno mañana' }],
      adherencia: 84,
    },
    {
      id: 'graciela-paz',
      nombre: 'Graciela',
      apellido: 'Paz',
      usuario: 'graciela',
      password: '123',
      fechaNacimiento: '1968-11-02',
      genero: 'F',
      categoria: 'Master B',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: 'graciela.paz@mail.com',
      telefono: '+54 2920 55-0311',
      contactoEmergencia: 'Jorge Luna (esposo) · +54 2920 55-0312',
      ingreso: '2021-08-16',
      antecedentes: 'Empezó a correr a los 50. Prefiere trail y 10K de calle.',
      salud: 'Hipotiroidismo controlado. Trabajo de fuerza 2 veces por semana.',
      objetivos: [{ texto: 'Completar el trail de 25K en Meseta de Somuncurá', fecha: '2026-11-29', progreso: 65 }],
      marcas: [
        { distancia: '5K', tiempo: '26:30', fecha: '2026-05-10', competencia: 'Corre Valcheta 5K' },
        { distancia: '10K', tiempo: '55:48', fecha: '2026-08-02', competencia: '10K del Parque' },
      ],
      resultados: [
        { competenciaId: 'c-10k-parque', competencia: '10K del Parque', fecha: '2026-08-02', distancia: '10K', tiempo: '55:48', posGeneral: 402, posCategoria: 5 },
      ],
      evolucion: [
        { mes: 'May', ritmoSeg: 402 },
        { mes: 'Jun', ritmoSeg: 398 },
        { mes: 'Jul', ritmoSeg: 399 },
        { mes: 'Ago', ritmoSeg: 392 },
        { mes: 'Sep', ritmoSeg: 388 },
        { mes: 'Oct', ritmoSeg: 386 },
      ],
      extra: [],
      adherencia: 96,
    },
    {
      id: 'diego-alvarez',
      nombre: 'Diego',
      apellido: 'Álvarez',
      usuario: 'diego',
      password: '123',
      fechaNacimiento: '1983-01-30',
      genero: 'M',
      categoria: 'Master A',
      nivel: 'Avanzado',
      ciudad: 'Valcheta',
      email: 'diego.alvarez@mail.com',
      telefono: '+54 2920 55-0477',
      contactoEmergencia: 'Ana Sosa (pareja) · +54 2920 55-0478',
      ingreso: '2020-04-01',
      antecedentes: 'Triatleta reconvertido. 6 maratones completadas.',
      salud: 'Molestia en isquiotibial derecho (sep 2026), en seguimiento.',
      objetivos: [{ texto: '10K sub 37:00', fecha: '2026-12-13', progreso: 55 }],
      marcas: [
        { distancia: '5K', tiempo: '17:52', fecha: '2026-05-10', competencia: 'Corre Valcheta 5K' },
        { distancia: '10K', tiempo: '37:41', fecha: '2026-08-02', competencia: '10K del Parque' },
        { distancia: '21K', tiempo: '1:23:10', fecha: '2026-06-14', competencia: 'Media de Viedma' },
      ],
      resultados: [
        { competenciaId: 'c-10k-parque', competencia: '10K del Parque', fecha: '2026-08-02', distancia: '10K', tiempo: '37:41', posGeneral: 12, posCategoria: 2 },
        { competenciaId: 'c-media-rosario', competencia: 'Media de Viedma', fecha: '2026-06-14', distancia: '21K', tiempo: '1:23:10', posGeneral: 41, posCategoria: 6 },
      ],
      evolucion: [
        { mes: 'May', ritmoSeg: 276 },
        { mes: 'Jun', ritmoSeg: 273 },
        { mes: 'Jul', ritmoSeg: 271 },
        { mes: 'Ago', ritmoSeg: 268 },
        { mes: 'Sep', ritmoSeg: 274 },
        { mes: 'Oct', ritmoSeg: 270 },
      ],
      extra: [{ etiqueta: 'Reloj', valor: 'Sincroniza con Strava' }],
      adherencia: 71,
    },
    {
      id: 'sofia-benitez',
      nombre: 'Sofía',
      apellido: 'Benítez',
      usuario: 'sofia',
      password: '123',
      fechaNacimiento: '2008-04-09',
      genero: 'F',
      categoria: 'Juveniles',
      nivel: 'Intermedio',
      ciudad: 'Valcheta',
      email: 'sofia.benitez@mail.com',
      telefono: '+54 2920 55-0590',
      contactoEmergencia: 'Raúl Benítez (padre) · +54 2920 55-0591',
      tutor: {
        nombre: 'Raúl Benítez',
        vinculo: 'Padre',
        email: 'raul.benitez@mail.com',
        usuario: 'familia.sofia',
        password: '123',
      },
      ingreso: '2023-03-01',
      antecedentes: 'Atletismo escolar. Fuerte en cross country.',
      salud: 'Apto físico vigente hasta 02/2027.',
      objetivos: [{ texto: 'Podio en el Cross Provincial', fecha: '2026-11-08', progreso: 70 }],
      marcas: [
        { distancia: '3000 m', tiempo: '11:02', fecha: '2026-09-12', competencia: 'Torneo de Pista Apertura' },
        { distancia: '5K', tiempo: '20:15', fecha: '2026-05-10', competencia: 'Corre Valcheta 5K' },
      ],
      resultados: [
        { competenciaId: 'c-pista-apertura', competencia: 'Torneo de Pista Apertura', fecha: '2026-09-12', distancia: '3000 m', tiempo: '11:02', posGeneral: 4, posCategoria: 2 },
      ],
      evolucion: [
        { mes: 'May', ritmoSeg: 320 },
        { mes: 'Jun', ritmoSeg: 316 },
        { mes: 'Jul', ritmoSeg: 311 },
        { mes: 'Ago', ritmoSeg: 309 },
        { mes: 'Sep', ritmoSeg: 303 },
        { mes: 'Oct', ritmoSeg: 300 },
      ],
      extra: [],
      adherencia: 88,
    },
    {
      id: 'ramiro-quiroga',
      nombre: 'Ramiro',
      apellido: 'Quiroga',
      usuario: 'ramiro',
      password: '123',
      fechaNacimiento: '1991-09-05',
      genero: 'M',
      categoria: 'Mayores',
      nivel: 'Inicial',
      ciudad: 'Valcheta',
      email: 'ramiro.quiroga@mail.com',
      telefono: '+54 2920 55-0612',
      contactoEmergencia: 'Laura Díaz (madre) · +54 2920 55-0613',
      ingreso: '2026-06-02',
      antecedentes: 'Sedentario hasta 2026. Objetivo salud y primer 10K.',
      salud: 'Bajó 9 kg desde el ingreso. Control cardiológico OK (05/2026).',
      objetivos: [{ texto: 'Correr su primer 10K completo', fecha: '2026-11-15', progreso: 80 }],
      marcas: [{ distancia: '5K', tiempo: '29:40', fecha: '2026-09-27', competencia: 'Carrera Aniversario Valcheta' }],
      resultados: [
        { competenciaId: 'c-solidaria', competencia: 'Carrera Aniversario Valcheta', fecha: '2026-09-27', distancia: '5K', tiempo: '29:40', posGeneral: 288, posCategoria: 61 },
      ],
      evolucion: [
        { mes: 'May', ritmoSeg: 0 },
        { mes: 'Jun', ritmoSeg: 432 },
        { mes: 'Jul', ritmoSeg: 418 },
        { mes: 'Ago', ritmoSeg: 404 },
        { mes: 'Sep', ritmoSeg: 391 },
        { mes: 'Oct', ritmoSeg: 382 },
      ],
      extra: [],
      adherencia: 79,
    },
  ],
  planes: {
    'lucia-gomez': [
      { id: 'l1', fecha: '2026-10-12', tipo: 'Rodaje', titulo: 'Rodaje regenerativo', detalle: 'Suave, conversacional. Terminar con 4 rectas de 80 m.', distanciaKm: 10, ritmo: '5:25–5:40 /km', intensidad: 'Z2', estado: 'realizado', sensacion: 4, comentario: 'Piernas pesadas al principio, después bien.' },
      { id: 'l2', fecha: '2026-10-13', tipo: 'Pasadas', titulo: '6 × 1000 m', detalle: 'Entrada en calor 3 km + técnica. 6 × 1000 m a ritmo 10K. Vuelta a la calma 2 km.', distanciaKm: 13, ritmo: '4:05 /km', intensidad: 'Z4', recuperacion: '2:00 trote', estado: 'realizado', sensacion: 5, comentario: 'Todas entre 4:02 y 4:06. Excelente.' },
      { id: 'l3', fecha: '2026-10-14', tipo: 'Fuerza', titulo: 'Fuerza + core', detalle: 'Circuito A: sentadilla búlgara, peso muerto rumano, plancha lateral. 3 vueltas.', duracionMin: 45, intensidad: 'Z2', estado: 'realizado', sensacion: 3 },
      { id: 'l4', fecha: '2026-10-15', tipo: 'Rodaje', titulo: 'Rodaje medio', detalle: 'Ritmo cómodo, últimos 2 km progresivos.', distanciaKm: 12, ritmo: '5:10 /km', intensidad: 'Z3', estado: 'no-realizado', comentario: 'Me quedé en el trabajo, lo recupero el sábado.' },
      { id: 'l5', fecha: '2026-10-16', tipo: 'Fartlek', titulo: 'Fartlek 10 × 1′/1′', detalle: '3 km suaves + 10 × (1′ fuerte / 1′ suave) + 2 km suaves.', distanciaKm: 10, ritmo: '3:55 fuerte · 5:30 suave', intensidad: 'Z4', recuperacion: '1′ trote', estado: 'pendiente', modificada: true },
      { id: 'l6', fecha: '2026-10-17', tipo: 'Descanso', titulo: 'Descanso activo', detalle: 'Movilidad 20′ o caminata.', estado: 'pendiente' },
      { id: 'l7', fecha: '2026-10-18', tipo: 'Fondo', titulo: 'Fondo largo', detalle: 'Últimos 5 km a ritmo de media maratón (4:28).', distanciaKm: 22, ritmo: '5:05 → 4:28 /km', intensidad: 'Z3', estado: 'pendiente' },
    ],
    'tomas-ferreyra': [
      { id: 't1', fecha: '2026-10-12', tipo: 'Rodaje', titulo: 'Rodaje suave', detalle: 'Rodaje + 6 rectas.', distanciaKm: 6, ritmo: '5:00 /km', intensidad: 'Z2', estado: 'realizado', sensacion: 4 },
      { id: 't2', fecha: '2026-10-14', tipo: 'Pasadas', titulo: '8 × 400 m en pista', detalle: 'Entrada en calor 2 km + técnica. 8 × 400 a ritmo 1500.', distanciaKm: 7, ritmo: '74″ por vuelta', intensidad: 'Z5', recuperacion: '200 m trote', estado: 'realizado', sensacion: 5, comentario: 'Las últimas dos en 72″!' },
      { id: 't3', fecha: '2026-10-16', tipo: 'Cuestas', titulo: 'Cuestas cortas', detalle: '10 × 100 m en subida, bajada caminando.', distanciaKm: 6, intensidad: 'Z4', recuperacion: 'Bajada caminando', estado: 'pendiente' },
      { id: 't4', fecha: '2026-10-18', tipo: 'Rodaje', titulo: 'Rodaje largo', detalle: 'Ritmo cómodo, sin reloj.', distanciaKm: 9, intensidad: 'Z2', estado: 'pendiente' },
    ],
    'graciela-paz': [
      { id: 'g1', fecha: '2026-10-13', tipo: 'Rodaje', titulo: 'Rodaje con desnivel', detalle: 'Circuito del Arroyo, subidas caminando si hace falta.', distanciaKm: 9, intensidad: 'Z2', estado: 'realizado', sensacion: 4 },
      { id: 'g2', fecha: '2026-10-15', tipo: 'Fuerza', titulo: 'Fuerza tren inferior', detalle: 'Circuito B con bandas.', duracionMin: 40, estado: 'realizado', sensacion: 4 },
      { id: 'g3', fecha: '2026-10-18', tipo: 'Fondo', titulo: 'Fondo de trail', detalle: 'Sendero Meseta reconocimiento.', distanciaKm: 16, intensidad: 'Z2', estado: 'pendiente' },
    ],
    'diego-alvarez': [
      { id: 'd1', fecha: '2026-10-13', tipo: 'Rodaje', titulo: 'Rodaje suave', detalle: 'Sin cambios de ritmo por molestia isquio.', distanciaKm: 8, intensidad: 'Z2', estado: 'realizado', sensacion: 3, comentario: 'Molestia leve después del km 6.' },
      { id: 'd2', fecha: '2026-10-15', tipo: 'Pasadas', titulo: '5 × 1600 m', detalle: 'Ritmo 10K objetivo.', distanciaKm: 14, ritmo: '3:42 /km', intensidad: 'Z4', recuperacion: '2:30 trote', estado: 'no-realizado' },
      { id: 'd3', fecha: '2026-10-17', tipo: 'Fondo', titulo: 'Fondo', detalle: 'Ritmo cómodo.', distanciaKm: 18, intensidad: 'Z2', estado: 'pendiente' },
    ],
    'sofia-benitez': [
      { id: 's1', fecha: '2026-10-13', tipo: 'Pasadas', titulo: '5 × 800 m en césped', detalle: 'Simulación de cross.', distanciaKm: 8, ritmo: '3:40 /km', intensidad: 'Z4', recuperacion: '2:00 trote', estado: 'realizado', sensacion: 4 },
      { id: 's2', fecha: '2026-10-16', tipo: 'Rodaje', titulo: 'Rodaje suave', detalle: '', distanciaKm: 7, intensidad: 'Z2', estado: 'pendiente' },
    ],
    'ramiro-quiroga': [
      { id: 'r1', fecha: '2026-10-12', tipo: 'Rodaje', titulo: 'Correr/caminar', detalle: '8 × (5′ trote + 1′ caminata).', duracionMin: 48, intensidad: 'Z2', estado: 'realizado', sensacion: 4, comentario: 'Primera vez sin parar en los bloques!' },
      { id: 'r2', fecha: '2026-10-15', tipo: 'Rodaje', titulo: 'Rodaje continuo', detalle: '40′ continuos muy suave.', duracionMin: 40, intensidad: 'Z2', estado: 'realizado', sensacion: 3 },
      { id: 'r3', fecha: '2026-10-17', tipo: 'Rodaje', titulo: 'Rodaje 8 km', detalle: 'Ritmo cómodo.', distanciaKm: 8, intensidad: 'Z2', estado: 'pendiente' },
    ],
  },
  competencias: [
    { id: 'c-cross-prov', nombre: 'Cross Provincial Río Negro', fecha: '2026-11-08', lugar: 'Valcheta, Río Negro', distancias: ['4K', '6K', '8K'], tipo: 'Cross', inscriptos: ['sofia-benitez', 'tomas-ferreyra'], sugeridos: ['lucia-gomez'] },
    { id: 'c-10k-noche', nombre: '10K Nocturna de la Costanera', fecha: '2026-11-15', lugar: 'Viedma, Río Negro', distancias: ['5K', '10K'], tipo: 'Calle', inscriptos: ['ramiro-quiroga', 'diego-alvarez'], sugeridos: ['graciela-paz'] },
    { id: 'c-media-cba', nombre: 'Media Maratón Patagónica', fecha: '2026-11-22', lugar: 'Las Grutas, Río Negro', distancias: ['10K', '21K'], tipo: 'Calle', inscriptos: ['lucia-gomez'], sugeridos: ['diego-alvarez'] },
    { id: 'c-gigantes', nombre: 'Trail Meseta de Somuncurá', fecha: '2026-11-29', lugar: 'Valcheta, Río Negro', distancias: ['12K', '25K'], tipo: 'Trail', inscriptos: ['graciela-paz'], sugeridos: [] },
    { id: 'c-pista-cierre', nombre: 'Torneo de Pista Clausura', fecha: '2026-12-05', lugar: 'Pista Municipal · Valcheta', distancias: ['800 m', '1500 m', '3000 m'], tipo: 'Pista', inscriptos: ['tomas-ferreyra'], sugeridos: ['sofia-benitez'] },
  ],
  pagos: [
    { id: 'p1', atletaId: 'lucia-gomez', concepto: 'Cuota', detalle: 'Cuota octubre', monto: 28000, vencimiento: '2026-10-10', estado: 'pagado', fechaPago: '2026-10-05' },
    { id: 'p2', atletaId: 'lucia-gomez', concepto: 'Inscripción', detalle: 'Media Maratón Patagónica', monto: 35000, vencimiento: '2026-10-30', estado: 'pendiente' },
    { id: 'p3', atletaId: 'tomas-ferreyra', concepto: 'Cuota', detalle: 'Cuota octubre (menores)', monto: 22000, vencimiento: '2026-10-10', estado: 'vencido' },
    { id: 'p4', atletaId: 'tomas-ferreyra', concepto: 'Indumentaria', detalle: 'Musculosa oficial Willilefche', monto: 18500, vencimiento: '2026-10-25', estado: 'pendiente' },
    { id: 'p5', atletaId: 'graciela-paz', concepto: 'Cuota', detalle: 'Cuota octubre', monto: 28000, vencimiento: '2026-10-10', estado: 'pagado', fechaPago: '2026-10-08' },
    { id: 'p6', atletaId: 'graciela-paz', concepto: 'Viaje', detalle: 'Traslado Trail Somuncurá', monto: 15000, vencimiento: '2026-11-20', estado: 'pendiente' },
    { id: 'p7', atletaId: 'diego-alvarez', concepto: 'Cuota', detalle: 'Cuota septiembre', monto: 26000, vencimiento: '2026-09-10', estado: 'vencido' },
    { id: 'p8', atletaId: 'diego-alvarez', concepto: 'Cuota', detalle: 'Cuota octubre', monto: 28000, vencimiento: '2026-10-10', estado: 'vencido' },
    { id: 'p9', atletaId: 'sofia-benitez', concepto: 'Cuota', detalle: 'Cuota octubre (menores)', monto: 22000, vencimiento: '2026-10-10', estado: 'pagado', fechaPago: '2026-10-02' },
    { id: 'p10', atletaId: 'ramiro-quiroga', concepto: 'Cuota', detalle: 'Cuota octubre', monto: 28000, vencimiento: '2026-10-10', estado: 'pagado', fechaPago: '2026-10-09' },
    { id: 'p11', atletaId: 'ramiro-quiroga', concepto: 'Inscripción', detalle: '10K Nocturna de la Costanera', monto: 24000, vencimiento: '2026-11-01', estado: 'pendiente' },
    { id: 'p12', atletaId: 'lucia-gomez', concepto: 'Cuota', detalle: 'Cuota septiembre', monto: 26000, vencimiento: '2026-09-10', estado: 'pagado', fechaPago: '2026-09-07' },
  ],
  avisos: [
    { id: 'a1', tipo: 'Entrenamiento', titulo: 'Cambio de sede el viernes', cuerpo: 'Por el evento municipal, el fartlek del viernes 16 se hace en el circuito del Arroyo a las 19 h.', fecha: '2026-10-15', destinatarios: 'Todo el grupo', leidos: 14, total: 18 },
    { id: 'a2', tipo: 'Competencia', titulo: 'Inscripciones Media Patagónica', cuerpo: 'Cierran el 30/10. Quienes vayan a correr, avisen para gestionar la inscripción grupal con descuento.', fecha: '2026-10-12', destinatarios: 'Mayores y Master', leidos: 9, total: 12 },
    { id: 'a3', tipo: 'General', titulo: 'Nueva indumentaria Willilefche', cuerpo: 'Ya llegaron las musculosas y camperas de la escuela. Se retiran los martes en la pista.', fecha: '2026-10-07', destinatarios: 'Todo el grupo', leidos: 17, total: 18 },
  ],
};

function sanitizeForFirestore(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadLocalDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Asegurar que cada atleta tenga usuario y password por defecto si venía de v1
      if (Array.isArray(parsed.atletas)) {
        parsed.atletas.forEach((a) => {
          if (!a.usuario) a.usuario = a.id.split('-')[0];
          if (!a.password) a.password = '123';
          if (a.tutor && !a.tutor.usuario) {
            a.tutor.usuario = `familia.${a.usuario}`;
            a.tutor.password = '123';
          }
        });
      }
      if (parsed.equipo && !parsed.equipo.adminUser) {
        parsed.equipo.adminUser = 'entrenador';
        parsed.equipo.adminPass = 'willilefche2026';
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo caché local:', e);
  }
  return JSON.parse(JSON.stringify(INITIAL_DB));
}

window.DB = loadLocalDB();

/* ---------- Motor de Sincronización con Firebase Firestore ---------- */
const CloudSync = {
  firestore: null,
  status: 'local', // 'local' | 'connecting' | 'online' | 'error'
  statusText: 'Modo Local',
  _unsubscribe: null,
  _ignoreNextSnapshot: false,

  getActiveConfig() {
    try {
      const custom = localStorage.getItem(CUSTOM_FB_CONFIG_KEY);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed && parsed.apiKey && parsed.apiKey !== 'TU_API_KEY') {
          return parsed;
        }
      }
    } catch (e) {}
    if (window.firebaseConfig && window.firebaseConfig.apiKey && window.firebaseConfig.apiKey !== 'TU_API_KEY') {
      return window.firebaseConfig;
    }
    return null;
  },

  init() {
    const config = this.getActiveConfig();
    if (!config) {
      this.setStatus('local', 'Modo Local (Firebase pendiente)');
      return;
    }

    if (!window.firebase || !window.firebase.initializeApp) {
      this.setStatus('error', 'Sin conexión a Internet');
      return;
    }

    this.setStatus('connecting', 'Conectando a Firebase…');

    try {
      let app;
      if (window.firebase.apps && window.firebase.apps.length > 0) {
        app = window.firebase.app();
      } else {
        app = window.firebase.initializeApp(config);
      }

      this.firestore = window.firebase.firestore(app);

      // Activar persistencia offline de Firestore
      this.firestore
        .enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
          console.warn('Persistencia Firestore:', err.code);
        });

      const docRef = this.firestore.collection('willilefche').doc('main_db');

      // Escuchar cambios en tiempo real desde la nube
      this._unsubscribe = docRef.onSnapshot(
        (docSnap) => {
          this.setStatus('online', 'Sincronizado en Nube');
          if (this._ignoreNextSnapshot) {
            this._ignoreNextSnapshot = false;
            return;
          }
          if (docSnap.exists) {
            const cloudData = docSnap.data();
            if (cloudData && Array.isArray(cloudData.atletas)) {
              window.DB = cloudData;
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(window.DB));
              } catch (e) {}
              if (window.renderApp) window.renderApp(true);
            }
          } else {
            // Primera vez que se conecta: subir la base local a Firestore
            this.pushToCloud();
          }
        },
        (err) => {
          console.error('Error en suscripción Firestore:', err);
          if (err.code === 'permission-denied') {
            this.setStatus('error', 'Falta publicar Reglas en Firestore');
          } else {
            this.setStatus('error', 'Error de conexión nube');
          }
        }
      );
    } catch (e) {
      console.error('Error inicializando Firebase:', e);
      this.setStatus('error', 'Error en credenciales Firebase');
    }
  },

  setStatus(status, text) {
    this.status = status;
    this.statusText = text;
    document.querySelectorAll('[data-cloud-badge]').forEach((el) => {
      el.innerHTML = this.renderBadgeHtml();
    });
  },

  renderBadgeHtml() {
    const colors = {
      online: 'bg-success-soft text-success border-success/30',
      connecting: 'bg-warning-soft text-warning-text border-warning/30',
      local: 'bg-muted text-muted-foreground border-border',
      error: 'bg-destructive/10 text-destructive border-destructive/30',
    };
    const dotColors = {
      online: 'bg-success',
      connecting: 'bg-warning animate-pulse',
      local: 'bg-muted-foreground',
      error: 'bg-destructive',
    };
    const cls = colors[this.status] || colors.local;
    const dot = dotColors[this.status] || dotColors.local;
    return `
      <button
        type="button"
        onclick="openCloudConfigModal()"
        title="Configurar Firebase y Copias de Seguridad"
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-85 ${cls}"
      >
        <span class="size-2 rounded-full ${dot}"></span>
        <span>${this.statusText}</span>
      </button>
    `;
  },

  async pushToCloud() {
    if (!this.firestore) return false;
    try {
      this._ignoreNextSnapshot = true;
      window.DB.updatedAt = Date.now();
      const cleanData = sanitizeForFirestore(window.DB);
      await this.firestore.collection('willilefche').doc('main_db').set(cleanData);
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
  window.DB = JSON.parse(JSON.stringify(INITIAL_DB));
  saveDB();
}

window.saveDB = saveDB;
window.resetDB = resetDB;

/* ---------- Funciones de Backup (Exportar / Importar JSON) ---------- */
window.exportBackupJSON = () => {
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
    const [hy, hm, hd] = hoy.split('-').map(Number);
    let e = hy - y;
    if (hm < m || (hm === m && hd < d)) e--;
    return e;
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
