/**
 * STUB LOCAL DE SUPABASE — MODO 100% LOCAL
 * TRANSMUTE funciona sin backend: esta capa imita la API de Supabase
 * (query builder, auth y functions) y resuelve siempre vacío/éxito local,
 * para que el resto del código no requiera credenciales ni red.
 */

export const IS_LOCAL_MODE = true;

const localUserId = 'local-adept';
export const LOCAL_USER = {
  id: localUserId,
  email: 'adepto@local.transmute',
  user_metadata: { full_name: 'Adept #001', avatar: 'User' },
  app_metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const LOCAL_SESSION = {
  user: LOCAL_USER,
  access_token: 'transmute-local-token',
  refresh_token: 'transmute-local-token',
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  expires_in: 60 * 60 * 24,
};

const emptyResult = (flags) => {
  const out = { data: flags.single ? null : [], error: null, count: 0 };
  if (flags.returnCount) return { count: 0, data: flags.single ? null : [], error: null };
  return out;
};

function makeChain() {
  const flags = {};
  const chain = {};
  const none = () => chain;

  ['select', 'eq', 'neq', 'in', 'not', 'or', 'ilike', 'like', 'is', 'gte', 'lte',
   'gt', 'lt', 'contains', 'containedBy', 'overlaps', 'textSearch', 'match',
   'order', 'limit', 'offset', 'range', 'returns', 'maybeSingle', 'single',
   'insert', 'upsert', 'update', 'delete', 'truncate', 'head', 'columns', 'from',
   'csv', 'filter', 'getError', 'setAuth', 'rpc'].forEach(method => { chain[method] = none; });

  chain.single = () => { flags.single = true; return chain; };
  chain.maybeSingle = () => { flags.single = true; return chain; };
  chain.select = (cols, opts) => {
    if (opts && opts.count) flags.returnCount = true;
    return chain;
  };
  chain.then = (resolve, reject) => Promise.resolve(emptyResult(flags)).then(resolve, reject);
  chain.catch = (reject) => Promise.resolve(emptyResult(flags)).catch(reject);
  chain.finally = (cb) => Promise.resolve(emptyResult(flags)).then(cb, cb);
  chain[Symbol.asyncIterator] = async function* () {};
  return chain;
}

function makeChannel(name) {
  const channel = { name, subscribers: [] };
  channel.on = () => channel;
  channel.subscribe = () => channel;
  channel.unsubscribe = () => channel;
  channel.removeChannel = () => channel;
  channel.send = () => channel;
  return channel;
}

const auth = {
  onAuthStateChange: (cb) => {
    const subscription = { unsubscribe: () => {}, id: 'local-sub' };
    setTimeout(() => {
      try { cb('SIGNED_IN', LOCAL_SESSION); } catch (e) { console.error(e); }
    }, 0);
    return { data: { subscription } };
  },
  getSession: () => Promise.resolve({ data: { session: LOCAL_SESSION }, error: null }),
  getUser: () => Promise.resolve({ data: { user: LOCAL_USER }, error: null }),
  refreshSession: () => Promise.resolve({ data: { session: LOCAL_SESSION }, error: null }),
  signInWithPassword: () => Promise.resolve({ data: { user: LOCAL_USER, session: LOCAL_SESSION }, error: null }),
  signUp: () => Promise.resolve({ data: { user: LOCAL_USER, session: LOCAL_SESSION }, error: null }),
  signInWithOtp: () => Promise.resolve({ data: { user: LOCAL_USER, session: LOCAL_SESSION }, error: null }),
  signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
  resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
  updateUser: (attrs) => Promise.resolve({ data: { user: { ...LOCAL_USER, ...attrs } }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
  verifyOtp: (params) => Promise.resolve({ data: { user: LOCAL_USER, session: LOCAL_SESSION }, error: null }),
};

export const supabase = {
  auth,
  from: () => makeChain(),
  channel: makeChannel,
  removeChannel: () => {},
  functions: {
    invoke: (name) => Promise.resolve({ data: null, error: new Error(`Función no disponible en modo local: ${name}`) }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('storage no disponible en modo local') }),
      download: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
      list: () => Promise.resolve({ data: [], error: null }),
      createSignedUrl: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  realtime: { connect: () => {}, disconnect: () => {} },
};