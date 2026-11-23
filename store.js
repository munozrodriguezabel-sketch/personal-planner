/* ==========================================================================
   Capa de datos (Store) con caché local y sincronización en Supabase
   Interfaz:
     init() · subscribe(col, cb) · set(col, id, obj) · del(col, id)
     exportAll() · importAll(data) · label
   ========================================================================== */
const COLS = ['tasks', 'habits', 'done', 'routines', 'workouts', 'books', 'reads'];

const Store = (() => {
  const PFX = 'personalplanner:v1:';
  const cache = {};
  const subs = {};
  let cloudSyncTimer = null;

  const clone = o => JSON.parse(JSON.stringify(o));

  const emptyCache = () => {
    const obj = {};
    COLS.forEach(c => { obj[c] = {}; });
    return obj;
  };

  const readLocal = c => {
    try {
      return JSON.parse(localStorage.getItem(PFX + c)) || {};
    } catch (e) {
      return {};
    }
  };

  const writeLocal = c => {
    try {
      localStorage.setItem(PFX + c, JSON.stringify(cache[c] || {}));
    } catch (e) {}
  };

  const writeAllLocal = () => {
    COLS.forEach(c => writeLocal(c));
  };

  const emit = c => {
    if (subs[c]) subs[c](clone(cache[c] || {}));
  };

  const emitAll = () => {
    COLS.forEach(c => emit(c));
  };

  const getClient = () => window.supabaseClient || null;

  const getUser = async () => {
    const client = getClient();
    if (!client || !client.auth) return null;
    if (window.currentSupabaseUser) return window.currentSupabaseUser;
    try {
      const { data } = await client.auth.getSession();
      return (data && data.session && data.session.user) || null;
    } catch (e) {
      return null;
    }
  };

  const snapshotCols = () => {
    const out = {};
    COLS.forEach(c => {
      out[c] = clone(cache[c] || {});
    });
    return out;
  };

  const mergeDataIntoCache = (src, shouldEmit = true) => {
    if (!src || typeof src !== 'object') return 0;
    let count = 0;
    COLS.forEach(c => {
      if (src[c] && typeof src[c] === 'object') {
        Object.entries(src[c]).forEach(([id, obj]) => {
          cache[c][id] = clone(obj);
          count++;
        });
        writeLocal(c);
        if (shouldEmit) emit(c);
      }
    });
    return count;
  };

  const pushToCloudNow = async () => {
    const client = getClient();
    const user = await getUser();
    if (!client || !user) return;

    const payload = {
      user_id: user.id,
      state: snapshotCols()
    };

    const { error } = await client
      .from('planner_state')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error('Error guardando en Supabase:', error);
    }
  };

  const scheduleCloudPush = () => {
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => {
      pushToCloudNow();
    }, 250);
  };

  const pullFromCloud = async () => {
    const client = getClient();
    const user = await getUser();
    if (!client || !user) return;

    const { data, error } = await client
      .from('planner_state')
      .select('state')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error leyendo desde Supabase:', error);
      return;
    }

    if (data && data.state && typeof data.state === 'object') {
      const cloudSrc = data.state.data ? data.state.data : data.state;
      COLS.forEach(c => {
        cache[c] = {};
      });
      mergeDataIntoCache(cloudSrc, true);
    } else {
      // Si el usuario aún no tenía fila en Supabase, sube lo que haya en caché local
      await pushToCloudNow();
    }
  };

  return {
    label: 'Supabase + Local',

    async init() {
      const fresh = emptyCache();
      COLS.forEach(c => {
        cache[c] = readLocal(c) || fresh[c];
      });

      window.addEventListener('storage', e => {
        if (e.key && e.key.startsWith(PFX)) {
          const c = e.key.slice(PFX.length);
          if (cache[c]) {
            cache[c] = readLocal(c);
            emit(c);
          }
        }
      });

      window.addEventListener('planner:auth-changed', async ev => {
        const user = ev && ev.detail ? ev.detail.user : null;
        if (user) {
          await pullFromCloud();
        } else {
          COLS.forEach(c => {
            cache[c] = readLocal(c);
          });
          emitAll();
        }
      });

      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }

      const user = await getUser();
      if (user) {
        await pullFromCloud();
      }
    },

    subscribe(c, cb) {
      subs[c] = cb;
      emit(c);
    },

    async set(c, id, o) {
      if (!cache[c]) cache[c] = {};
      cache[c][id] = clone(o);
      writeLocal(c);
      emit(c);
      scheduleCloudPush();
    },

    async del(c, id) {
      if (!cache[c]) cache[c] = {};
      delete cache[c][id];
      writeLocal(c);
      emit(c);
      scheduleCloudPush();
    },

    exportAll() {
      return {
        app: 'personal-planner',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: snapshotCols()
      };
    },

    async importAll(d) {
      const src = d && d.data ? d.data : d;
      const n = mergeDataIntoCache(src, true);
      writeAllLocal();
      await pushToCloudNow();
      return n;
    }
  };
})();
