
(function () {
  function getClient() {
    return window.supabaseClient || null;
  }

  function ensureStyles() {
    if (document.getElementById('auth-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'auth-overlay-styles';
    style.textContent = `
      #auth-gate {
        position: fixed;
        inset: 0;
        background: #0d0d11;
        color: #f4f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #auth-gate.hidden {
        display: none;
      }
      .auth-card {
        width: 100%;
        max-width: 380px;
        background: #17171f;
        border: 1px solid #2a2a38;
        border-radius: 14px;
        padding: 24px;
        box-sizing: border-box;
      }
      .auth-card h1 {
        margin: 0 0 6px 0;
        font-size: 20px;
      }
      .auth-card p {
        margin: 0 0 18px 0;
        font-size: 13px;
        color: #a4a4b5;
      }
      .auth-field {
        margin-bottom: 12px;
      }
      .auth-field label {
        display: block;
        font-size: 12px;
        margin-bottom: 5px;
        color: #d0d0de;
      }
      .auth-field input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid #323244;
        background: #0d0d11;
        color: #ffffff;
        font-size: 14px;
        box-sizing: border-box;
      }
      .auth-actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }
      .auth-btn {
        flex: 1;
        padding: 10px 12px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .auth-btn-primary {
        background: #6c63ff;
        color: #ffffff;
      }
      .auth-btn-secondary {
        background: #262636;
        color: #e4e4f0;
      }
      .auth-status {
        margin-top: 12px;
        font-size: 12px;
        min-height: 18px;
        color: #9be7b0;
      }
      .auth-status.error {
        color: #ff8a8a;
      }
      #auth-logout-btn {
        position: fixed;
        right: 12px;
        bottom: 12px;
        z-index: 9000;
        padding: 6px 10px;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid #323244;
        background: #17171f;
        color: #e4e4f0;
        cursor: pointer;
        display: none;
      }
      #auth-logout-btn.visible {
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureUI() {
    ensureStyles();

    if (!document.getElementById('auth-gate')) {
      const gate = document.createElement('div');
      gate.id = 'auth-gate';
      gate.innerHTML = `
        <div class="auth-card">
          <h1>Personal Planner</h1>
          <p>Inicia sesión o crea tu cuenta para sincronizar tus datos entre dispositivos.</p>
          <div class="auth-field">
            <label for="auth-email">Correo electrónico</label>
            <input id="auth-email" type="email" autocomplete="email" placeholder="tu@correo.com">
          </div>
          <div class="auth-field">
            <label for="auth-password">Contraseña</label>
            <input id="auth-password" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres">
          </div>
          <div class="auth-actions">
            <button id="auth-login-btn" type="button" class="auth-btn auth-btn-primary">Entrar</button>
            <button id="auth-signup-btn" type="button" class="auth-btn auth-btn-secondary">Crear cuenta</button>
          </div>
          <div id="auth-status" class="auth-status"></div>
        </div>
      `;
      document.body.appendChild(gate);
    }

    if (!document.getElementById('auth-logout-btn')) {
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'auth-logout-btn';
      logoutBtn.type = 'button';
      logoutBtn.textContent = 'Cerrar sesión';
      document.body.appendChild(logoutBtn);
    }
  }

  function setStatus(msg, isError) {
    const el = document.getElementById('auth-status');
    if (!el) return;
    el.textContent = msg || '';
    el.className = isError ? 'auth-status error' : 'auth-status';
  }

  function updateUIForSession(session) {
    ensureUI();
    const gate = document.getElementById('auth-gate');
    const logoutBtn = document.getElementById('auth-logout-btn');
    const hasUser = Boolean(session && session.user);

    window.currentSupabaseUser = hasUser ? session.user : null;

    if (gate) {
      gate.classList.toggle('hidden', hasUser);
    }
    if (logoutBtn) {
      logoutBtn.classList.toggle('visible', hasUser);
    }

    window.dispatchEvent(
      new CustomEvent('planner:auth-changed', {
        detail: { user: hasUser ? session.user : null, session: session || null }
      })
    );
  }

  async function initAuth() {
    ensureUI();
    const client = getClient();
    if (!client || !client.auth) {
      setStatus('No se pudo conectar con el servicio de acceso.', true);
      return;
    }

    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('auth-login-btn');
    const signupBtn = document.getElementById('auth-signup-btn');
    const logoutBtn = document.getElementById('auth-logout-btn');

    loginBtn.addEventListener('click', async function () {
      setStatus('Entrando...', false);
      const email = (emailInput.value || '').trim();
      const password = passwordInput.value || '';
      if (!email || !password) {
        setStatus('Escribe tu correo y contraseña.', true);
        return;
      }
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus(error.message || 'No se pudo iniciar sesión.', true);
        return;
      }
      setStatus('Sesión iniciada.', false);
      updateUIForSession(data.session);
    });

    signupBtn.addEventListener('click', async function () {
      setStatus('Creando cuenta...', false);
      const email = (emailInput.value || '').trim();
      const password = passwordInput.value || '';
      if (!email || !password) {
        setStatus('Escribe tu correo y contraseña.', true);
        return;
      }
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) {
        setStatus(error.message || 'No se pudo crear la cuenta.', true);
        return;
      }
      if (data.session) {
        setStatus('Cuenta creada y sesión iniciada.', false);
        updateUIForSession(data.session);
      } else {
        setStatus('Cuenta creada. Revisa tu correo para confirmar si hace falta.', false);
      }
    });

    logoutBtn.addEventListener('click', async function () {
      await client.auth.signOut();
      updateUIForSession(null);
    });

    const { data } = await client.auth.getSession();
    updateUIForSession(data.session);

    client.auth.onAuthStateChange(function (_event, session) {
      updateUIForSession(session);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
