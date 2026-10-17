/**
 * auth.js - Gestión de Sesiones Reales y Control de Acceso por Rol
 * Roles: Administrador (admin), Entrenador (Cristian Javier Torres), Atletas y Familias
 * Escuela Municipal de Atletismo Willilefche · Valcheta, Río Negro
 */

const SESSION_KEY = 'willilefche_session_real_v1';

// Limpiar sesiones de prueba anteriores
try {
  localStorage.removeItem('willilefche_session_v1');
} catch (e) {}

function normalizeUserStr(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function cleanDniStr(str) {
  return String(str || '')
    .trim()
    .replace(/\./g, '')
    .replace(/\s+/g, '');
}

const Auth = {
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  setSession(session) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('No se pudo guardar la sesión:', e);
    }
  },

  logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    location.hash = '#/ingresar';
  },

  login(userInput, passwordInput) {
    const rawUser = String(userInput || '').trim();
    const rawPass = String(passwordInput || '').trim();

    if (!rawUser || !rawPass) {
      return { ok: false, error: 'Ingresá tu usuario y contraseña.' };
    }

    const u = normalizeUserStr(rawUser);
    const uDni = cleanDniStr(rawUser);
    const pDni = cleanDniStr(rawPass);

    const eq = window.DB?.equipo || {};
    const adminUser = normalizeUserStr(eq.adminUser || 'admin');
    const adminPass = String(eq.adminPass || 'Admin123@');

    // 1. Verificar Usuario Administrador (admin / Admin123@)
    if (u === adminUser && rawPass === adminPass) {
      const session = {
        role: 'coach',
        subRole: 'admin',
        usuario: eq.adminUser || 'admin',
        nombre: 'Administrador General',
        loginAt: Date.now(),
      };
      this.setSession(session);
      return { ok: true, session, redirect: '#/entrenador' };
    }

    // 2. Verificar Usuario Entrenador (Fila 19: Cristian Javier Torres · DNI 27.884.821)
    const coachUser = normalizeUserStr(eq.coachUser || 'cristian.torres');
    const coachPass = cleanDniStr(eq.coachPass || '27884821');
    const coachDni = cleanDniStr(eq.entrenadorDni || '27.884.821');

    if (
      (u === coachUser || u === 'cristian.torres' || uDni === coachDni) &&
      (rawPass === (eq.coachPass || '27884821') || pDni === coachPass)
    ) {
      const session = {
        role: 'coach',
        subRole: 'coach',
        usuario: eq.coachUser || 'cristian.torres',
        nombre: `Prof. ${eq.entrenador || 'Cristian Javier Torres'}`,
        dni: eq.entrenadorDni || '27.884.821',
        loginAt: Date.now(),
      };
      this.setSession(session);
      return { ok: true, session, redirect: '#/entrenador' };
    }

    // 3. Verificar Usuarios Atletas y Cuentas Familiares
    const atletas = window.DB?.atletas || [];
    for (const a of atletas) {
      const aUser = normalizeUserStr(a.usuario);
      const aDni = cleanDniStr(a.dni);
      const aPass = String(a.password || aDni);
      const aPassClean = cleanDniStr(aPass);

      // Coincidencia de Atleta (por nombre.apellido o por DNI)
      const userMatchesAthlete =
        u === aUser ||
        (aDni && uDni === aDni) ||
        (a.email && u === normalizeUserStr(a.email));

      const passMatchesAthlete = rawPass === aPass || (pDni && pDni === aPassClean);

      if (userMatchesAthlete && passMatchesAthlete) {
        const session = {
          role: 'athlete',
          atletaId: a.id,
          usuario: a.usuario,
          dni: a.dni,
          nombre: `${a.nombre} ${a.apellido}`,
          loginAt: Date.now(),
        };
        this.setSession(session);
        return { ok: true, session, redirect: `#/atleta/${a.id}` };
      }

      // 4. Verificar Cuenta Familiar (Tutores de menores)
      if (a.tutor) {
        const tUser = normalizeUserStr(a.tutor.usuario);
        const tPass = String(a.tutor.password || aPass);
        const tPassClean = cleanDniStr(tPass);

        const userMatchesTutor =
          u === tUser || (a.tutor.email && u === normalizeUserStr(a.tutor.email));
        const passMatchesTutor = rawPass === tPass || (pDni && pDni === tPassClean);

        if (userMatchesTutor && passMatchesTutor) {
          const session = {
            role: 'guardian',
            atletaId: a.id,
            usuario: a.tutor.usuario,
            nombre: a.tutor.nombre,
            vinculo: a.tutor.vinculo,
            loginAt: Date.now(),
          };
          this.setSession(session);
          return { ok: true, session, redirect: `#/familia/${a.id}` };
        }
      }
    }

    return {
      ok: false,
      error: 'Usuario o contraseña incorrectos. Verificá tus datos o consultá con el entrenador.',
    };
  },
};

window.Auth = Auth;
