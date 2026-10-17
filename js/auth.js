/**
 * auth.js - Gestión de Sesiones y Control de Acceso por Rol (Entrenador, Atleta, Familia)
 * Diseñado para Willilefche · Escuela Municipal de Valcheta
 */

const SESSION_KEY = 'willilefche_session_v1';

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
    const u = String(userInput || '').trim().toLowerCase();
    const p = String(passwordInput || '').trim();

    if (!u || !p) {
      return { ok: false, error: 'Ingresá tu usuario y contraseña.' };
    }

    const adminUser = (window.DB?.equipo?.adminUser || 'entrenador').toLowerCase();
    const adminPass = String(window.DB?.equipo?.adminPass || 'willilefche2026');

    // 1. Verificar Entrenador / Administrador
    if (
      (u === adminUser || u === 'entrenador' || u === 'admin') &&
      (p === adminPass || p === 'admin123' || p === 'willilefche2026')
    ) {
      const session = {
        role: 'coach',
        nombre: window.DB?.equipo?.entrenador || 'Entrenador',
        loginAt: Date.now(),
      };
      this.setSession(session);
      return { ok: true, session, redirect: '#/entrenador' };
    }

    // 2. Verificar Atletas
    const atletas = window.DB?.atletas || [];
    for (const a of atletas) {
      const aUser = (a.usuario || a.id.split('-')[0]).toLowerCase();
      const aEmail = (a.email || '').toLowerCase();
      const aFullName = `${a.nombre} ${a.apellido}`.toLowerCase();
      const aPass = String(a.password || '123');

      if ((u === aUser || u === aEmail || u === aFullName || u === a.id) && p === aPass) {
        const session = {
          role: 'athlete',
          atletaId: a.id,
          nombre: `${a.nombre} ${a.apellido}`,
          loginAt: Date.now(),
        };
        this.setSession(session);
        return { ok: true, session, redirect: `#/atleta/${a.id}` };
      }

      // 3. Verificar Cuenta Familiar (Tutores de menores)
      if (a.tutor) {
        const tUser = (a.tutor.usuario || `familia.${aUser}`).toLowerCase();
        const tEmail = (a.tutor.email || '').toLowerCase();
        const tPass = String(a.tutor.password || '123');

        if ((u === tUser || u === tEmail) && p === tPass) {
          const session = {
            role: 'guardian',
            atletaId: a.id,
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
      error: 'Usuario o contraseña incorrectos. Si sos atleta o familia, pedile tus datos a tu entrenador.',
    };
  },

  quickDemoLogin(role, atletaId = null) {
    if (role === 'coach') {
      this.setSession({
        role: 'coach',
        nombre: window.DB?.equipo?.entrenador || 'Entrenador',
        loginAt: Date.now(),
      });
      location.hash = '#/entrenador';
      return;
    }
    const a = window.Helpers.getAtleta(atletaId) || window.DB.atletas[0];
    if (role === 'athlete') {
      this.setSession({
        role: 'athlete',
        atletaId: a.id,
        nombre: `${a.nombre} ${a.apellido}`,
        loginAt: Date.now(),
      });
      location.hash = `#/atleta/${a.id}`;
      return;
    }
    if (role === 'guardian') {
      this.setSession({
        role: 'guardian',
        atletaId: a.id,
        nombre: a.tutor?.nombre || 'Familia',
        vinculo: a.tutor?.vinculo || 'Tutor',
        loginAt: Date.now(),
      });
      location.hash = `#/familia/${a.id}`;
    }
  },
};

window.Auth = Auth;
