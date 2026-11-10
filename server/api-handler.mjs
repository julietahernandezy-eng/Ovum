import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('tu-proyecto'));

// Lista de correos con permisos exclusivos de Administrador (configurable también por variable de entorno ADMIN_EMAILS en Vercel)
const DEFAULT_ADMIN_EMAILS = [
  'admin@ovum.app',
  'julieta@ovum.app',
  'julieta@eafit.edu.co',
  'juliana.admin@ovum.app'
];

export function isAdminEmail(email) {
  if (!email) return false;
  const clean = String(email).trim().toLowerCase();
  const envAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]);
  return allowed.has(clean);
}

// Semilla inicial de Recursos de Explora (100% administrables desde la vista de Administrador)
const DEFAULT_EXPLORA_RESOURCES = [
  {
    id: 'r1',
    category: 'recetario',
    badge: 'Recetario • Ovulación',
    meta: '15 min • Antiinflamatorio',
    title: 'BOWL DE QUINOA, AGUACATE Y SEMILLAS',
    description: 'Rico en zinc, vitamina E y fibra para acompañar el pico de estrógenos y sostener tu vitalidad sin inflamación.',
    extraInfo: 'Ingredientes: Quinoa cocida, 1/2 aguacate, semillas de calabaza, espinaca baby y limón.',
    actionLabel: 'Ver preparación paso a paso',
    modalTitle: 'Receta: Bowl de Quinoa, Aguacate y Semillas',
    modalBody: '1. Cocina 1 taza de quinoa con una pizca de sal marina.\n2. Corta medio aguacate en cubos y mezcla con espinaca baby fresca.\n3. Tuesta 2 cucharadas de semillas de calabaza (ricas en zinc para la fase ovulatoria).\n4. Adereza con aceite de oliva extravirgen y jugo de limón.',
    externalUrl: '',
    accent: 'blue'
  },
  {
    id: 'r2',
    category: 'recetario',
    badge: 'Recetario • Menstruación',
    meta: '10 min • Calmante',
    title: 'INFUSIÓN TIBIA DE JENGIBRE, CANELA Y CACAO',
    description: 'Ideal para desinflamar el útero, aliviar cólicos menstruales y aportar magnesio natural al cuerpo.',
    extraInfo: 'Ingredientes: Jengibre fresco rallado, 1 astilla de canela, 1 cucharada de cacao puro 70%.',
    actionLabel: 'Ver preparación paso a paso',
    modalTitle: 'Receta: Infusión de Jengibre, Canela y Cacao',
    modalBody: '1. Hierve 1 taza de agua con una astilla de canela y jengibre rallado durante 5 minutos.\n2. Retira del fuego y disuelve 1 cucharada de cacao puro (fuente natural de magnesio que relaja el músculo uterino).\n3. Toma caliente mientras descansas con calor local.',
    externalUrl: '',
    accent: 'crimson'
  },
  {
    id: 'r3',
    category: 'playlist',
    badge: 'Playlist Colaborativa',
    meta: 'Spotify / Audio Cíclico',
    title: 'FOCO & ENERGÍA ALTA (FASE OVULATORIA)',
    description: 'Selección musical colaborativa para acompañar tus jornadas de estudio o movimiento.',
    extraInfo: 'Canciones: 1. Brillo Propio — 2. Ciclicidad Acústica — 3. Respirar en el Campus — 4. Calma Lútea.',
    actionLabel: 'Escuchar Playlist',
    modalTitle: 'Playlist Cíclica OVUM',
    modalBody: 'Reproduciendo lista activa:\n1. Brillo Propio (3:42)\n2. Ciclicidad Acústica (4:10)\n3. Respirar en el Campus (2:58)\n4. Calma Lútea (3:30)',
    externalUrl: 'https://open.spotify.com',
    accent: 'pink'
  },
  {
    id: 'r4',
    category: 'biblioteca',
    badge: 'Biblioteca Verificada',
    meta: 'Lectura 5 min',
    title: 'LAS 4 FASES DE TU CICLO EXPLICADAS SIN RODEOS',
    description: 'Guía práctica para entender por qué tu energía, apetito y sueño cambian a lo largo del mes y cómo habitar cada etapa sin culpa.',
    extraInfo: '',
    actionLabel: 'Leer Guía Completa',
    modalTitle: 'Las 4 Fases de tu Ciclo',
    modalBody: '1. Menstruación (Días 1-5): Descanso e introspección.\n2. Folicular (Días 6-12): Curiosidad, planeación y energía en ascenso.\n3. Ovulación (Días 13-16): Pico de vitalidad, expresión y empatía.\n4. Lútea (Días 17-28): Autocuidado, límites sanos y preparación para soltar.',
    externalUrl: '',
    accent: 'fuchsia'
  },
  {
    id: 'r5',
    category: 'podcasts',
    badge: 'Podcast Recomendado',
    meta: 'Audio 24 min',
    title: 'EP. 12: PRODUCTIVIDAD UNIVERSITARIA Y CICLICIDAD',
    description: 'Conversación con estudiantes de Medellín sobre cómo conciliar los parciales con los cambios hormonales.',
    extraInfo: '',
    actionLabel: 'Reproducir Episodio (24 min)',
    modalTitle: 'Podcast Ep. 12 — OVUM',
    modalBody: 'Audio activo (24 min): Hablamos con Juliana y Sofía sobre el agotamiento mental del multitasking y cómo organizar el estudio según tu fase menstrual.',
    externalUrl: '',
    accent: 'pink'
  },
  {
    id: 'r6',
    category: 'fanzine',
    badge: 'Fanzine Digital Ilustrado',
    meta: 'Edición #1',
    title: 'FANZINE OVUM EDICIÓN #1: HABITAR EL CUERPO',
    description: 'Publicación gráfica transmedia con ilustraciones, relatos reales y desmitificación del tabú menstrual.',
    extraInfo: '',
    actionLabel: 'Hojear Fanzine Interactivo',
    modalTitle: 'Fanzine Digital OVUM #1',
    modalBody: 'Página 1: El ciclo no es lineal, es espiral.\nPágina 2: Mitos que nos contaron sobre el dolor menstrual.\nPágina 3: Manifiesto por una educación menstrual libre de estigmas.',
    externalUrl: '',
    accent: 'fuchsia'
  },
  {
    id: 'r7',
    category: 'directorio',
    badge: 'Directorio & Financiación',
    meta: 'Alianzas Medellín',
    title: 'COPAS, DISCOS Y TOALLAS REUTILIZABLES',
    description: 'Catálogo de marcas locales en Medellín, descuentos estudiantiles y opciones de financiación comunitaria.',
    extraInfo: '',
    actionLabel: 'Ver Alianzas y Descuentos',
    modalTitle: 'Directorio de Gestión Menstrual Sostenible',
    modalBody: '• Copa Menstrual Certificada: 25% dto con carné estudiantil.\n• Kit de 3 Toallas de Tela Algodón Orgánico: Financiación en 2 cuotas sin interés.\n• Panties Absorbentes: Alianza local Medellín.',
    externalUrl: '',
    accent: 'blue'
  }
];

const DEFAULT_APP_SETTINGS = {
  journalPrompt: '¿En qué proyecto o idea sientes que tu creatividad quiere expandirse hoy?',
  cyclePhaseTitle: 'CALENDARIO',
  cyclePhaseMessage: 'Hoy estás en tu fase de ovulación. Tu energía suele estar en su punto más alto.'
};

// Utilidad: Capitalizar Nombre y Apellido (Primera letra mayúscula, resto minúscula en cada palabra)
export function formatProperName(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
}

// Utilidad: Validar contraseña segura (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo)
export function validateStrongPassword(pw) {
  if (!pw || pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(pw)) return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(pw)) return 'La contraseña debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(pw)) return 'La contraseña debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'La contraseña debe incluir al menos un carácter especial (ej. @, #, !, *, $).';
  return null;
}

export function hashPassword(pw) {
  return crypto.createHash('sha256').update(String(pw)).digest('hex');
}

// Cliente REST ligero para Supabase (sin requerir node_modules externos)
async function supabaseRequest(table, { method = 'GET', query = '', body = null, single = false, upsert = false } = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
  const preferHeaders = [];
  if (single) preferHeaders.push('return=representation');
  if (upsert) preferHeaders.push('resolution=merge-duplicates');
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': preferHeaders.length ? preferHeaders.join(',') : 'return=representation'
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function loadLocalDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        userProfile: {
          name: "Juliana",
          lastName: "Ríos",
          age: 20,
          email: "juliana@ovum.app",
          cycleLength: 28,
          periodDuration: 5,
          lastPeriodDate: "2026-10-22",
          irregular: false
        },
        users: [],
        dailyLogs: {
          "2026-11-10": {
            flow: "ninguno",
            symptoms: ["Energía alta"],
            sleepHours: 8,
            hadSex: true
          },
          "2026-11-14": {
            flow: "moderado",
            symptoms: ["Energía alta", "Foco mental"],
            sleepHours: 8,
            hadSex: false
          }
        },
        journals: [
          {
            id: "j1",
            date: "2026-11-14",
            prompt: "¿En qué proyecto o idea sientes que tu creatividad quiere expandirse hoy?",
            content: "Hoy me sentí con mucha claridad mental en la universidad y pude avanzar en mi entrega sin agotarme."
          }
        ],
        posts: [
          {
            id: "1",
            author: "Juliana Ríos",
            content: "¿A alguna le pasa que en la fase lútea siente que no rinde igual en los parciales? ¿Cómo gestionan la frustración?",
            tags: ["#CuidadoEnLaU", "#FaseLútea"],
            likes: 12,
            commentsCount: 5,
            timestamp: "Hace 2 horas"
          },
          {
            id: "2",
            author: "Sofía M.",
            content: "Primera vez probando la copa menstrual en clase de natación y fue un éxito total. ¡Cero fugas!",
            tags: ["#CopaMenstrual", "#Autoconocimiento"],
            likes: 24,
            commentsCount: 8,
            timestamp: "Ayer"
          }
        ],
        workshops: [
          {
            id: "w1",
            title: "Taller de Menstruación y Ciclicidad",
            location: "Campus EAFIT - Bloque 38",
            date: "14 de Noviembre, 2026 - 3:00 PM",
            spotsAvailable: 6,
            isReserved: false
          },
          {
            id: "w2",
            title: "Cómo crear tu propia Toalla Reutilizable",
            location: "Virtual (Google Meet)",
            date: "20 de Noviembre, 2026 - 5:00 PM",
            spotsAvailable: 15,
            isReserved: false
          },
          {
            id: "w3",
            title: "Journaling Menstrual y Gestión de Energía",
            location: "Campus EAFIT - Ágora Cultural",
            date: "28 de Noviembre, 2026 - 10:00 AM",
            spotsAvailable: 8,
            isReserved: false
          }
        ],
        exploraResources: DEFAULT_EXPLORA_RESOURCES,
        appSettings: DEFAULT_APP_SETTINGS,
        pqrTickets: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!data.journals) data.journals = [];
    if (!data.users) data.users = [];
    if (!data.pqrTickets) data.pqrTickets = [];
    if (!data.exploraResources || data.exploraResources.length === 0) {
      data.exploraResources = DEFAULT_EXPLORA_RESOURCES;
    }
    if (data.workshops) {
      data.workshops.forEach(w => {
        if (!w.attendees) w.attendees = [];
      });
    }
    return data;
  } catch (e) {
    return {
      userProfile: { name: "Juliana", lastName: "Ríos", age: 20, cycleLength: 28, periodDuration: 5, irregular: false },
      users: [],
      dailyLogs: {},
      journals: [],
      posts: [],
      workshops: [],
      exploraResources: DEFAULT_EXPLORA_RESOURCES,
      appSettings: DEFAULT_APP_SETTINGS,
      pqrTickets: []
    };
  }
}

function saveLocalDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // En entornos serverless read-only se persiste en Supabase
  }
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length > 0) return JSON.parse(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res, pathname) {
  const db = loadLocalDB();

  // 1. GET /api/state
  if (req.method === 'GET' && pathname === '/api/state') {
    if (USE_SUPABASE) {
      try {
        const posts = await supabaseRequest('community_posts', { query: 'select=*&order=created_at.desc' });
        const workshops = await supabaseRequest('workshops', { query: 'select=*' });
        const resources = await supabaseRequest('explora_resources', { query: 'select=*&order=updated_at.desc' });
        const settingsRows = await supabaseRequest('app_settings', { query: 'select=*' });

        db.posts = (posts || []).map(p => ({
          id: p.id,
          author: p.author_name,
          content: p.content,
          tags: p.tags || [],
          likes: p.likes || 0,
          timestamp: new Date(p.created_at).toLocaleDateString('es-CO')
        }));
        if (workshops && workshops.length) {
          db.workshops = workshops.map(w => ({
            id: w.id,
            title: w.title,
            location: w.location,
            date: w.event_date,
            spotsAvailable: w.spots_available,
            isReserved: false,
            attendees: w.attendees || []
          }));
        }
        if (resources && resources.length) {
          db.exploraResources = resources.map(r => ({
            id: r.id,
            category: r.category,
            badge: r.badge,
            meta: r.meta || '',
            title: r.title,
            description: r.description,
            extraInfo: r.extra_info || '',
            actionLabel: r.action_label || '',
            modalTitle: r.modal_title || r.title,
            modalBody: r.modal_body || r.description,
            externalUrl: r.external_url || '',
            accent: r.accent || 'fuchsia'
          }));
        }
        if (settingsRows && settingsRows.length) {
          settingsRows.forEach(row => {
            if (row.setting_key === 'journal_prompt') {
              db.appSettings.journalPrompt = row.setting_value;
            }
          });
        }
        try {
          const journals = await supabaseRequest('journal_entries', { query: 'select=*&order=created_at.desc' });
          if (journals && journals.length) {
            db.journals = journals.map(j => ({
              id: j.id,
              date: j.entry_date,
              prompt: j.prompt,
              content: j.content
            }));
          }
        } catch (e) {
          // fallback a local
        }
      } catch (err) {
        console.warn('Fallback local state:', err.message);
      }
    }
    return sendJSON(res, 200, { ...db, storageEngine: USE_SUPABASE ? 'supabase' : 'local' });
  }

  // 2. POST /api/auth/register
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    try {
      const body = await parseBody(req);
      const firstName = formatProperName(body.firstName);
      const lastName = formatProperName(body.lastName);
      const age = Number(body.age);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!firstName || !lastName || !age || !email || !password) {
        return sendJSON(res, 400, { error: 'Todos los campos son obligatorios.' });
      }

      const pwError = validateStrongPassword(password);
      if (pwError) {
        return sendJSON(res, 400, { error: pwError });
      }

      const passwordHash = hashPassword(password);
      const role = isAdminEmail(email) ? 'admin' : 'user';

      if (USE_SUPABASE) {
        const existing = await supabaseRequest('users', { query: `select=id&email=eq.${encodeURIComponent(email)}` });
        if (existing && existing.length > 0) {
          return sendJSON(res, 409, { error: 'Ya existe una cuenta registrada con este correo electrónico.' });
        }
        const inserted = await supabaseRequest('users', {
          method: 'POST',
          body: {
            first_name: firstName,
            last_name: lastName,
            age,
            email,
            password_hash: passwordHash,
            role
          }
        });
        const u = inserted[0];
        return sendJSON(res, 201, {
          success: true,
          user: { id: u.id, firstName: u.first_name, lastName: u.last_name, age: u.age, email: u.email, role: u.role || role, isAdmin: (u.role || role) === 'admin' }
        });
      }

      const existing = db.users.find(u => u.email.toLowerCase() === email);
      if (existing) {
        return sendJSON(res, 409, { error: 'Ya existe una cuenta con este correo electrónico.' });
      }
      const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        age,
        email,
        passwordHash,
        role
      };
      db.users.push(newUser);
      db.userProfile = {
        ...db.userProfile,
        name: firstName,
        lastName,
        age,
        email,
        role,
        isAdmin: role === 'admin'
      };
      saveLocalDB(db);
      return sendJSON(res, 201, {
        success: true,
        user: { id: newUser.id, firstName, lastName, age, email, role, isAdmin: role === 'admin' }
      });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Datos de registro inválidos.' });
    }
  }

  // 3. POST /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const passwordHash = hashPassword(password);

      // Cuenta maestra preconfigurada de Administradora OVUM para acceso inmediato sin registro previo si usa credenciales oficiales
      if (isAdminEmail(email) && password === 'OvumAdmin!2026') {
        const adminProfile = {
          id: 'admin-master',
          firstName: 'Julieta',
          lastName: 'Admin',
          age: 22,
          email,
          role: 'admin',
          isAdmin: true
        };
        db.userProfile = {
          ...db.userProfile,
          name: adminProfile.firstName,
          lastName: adminProfile.lastName,
          age: adminProfile.age,
          email: adminProfile.email,
          role: 'admin',
          isAdmin: true
        };
        saveLocalDB(db);
        return sendJSON(res, 200, { success: true, user: adminProfile });
      }

      if (USE_SUPABASE) {
        const rows = await supabaseRequest('users', {
          query: `select=*&email=eq.${encodeURIComponent(email)}`
        });
        const user = rows && rows[0];
        if (!user || user.password_hash !== passwordHash) {
          return sendJSON(res, 401, { error: 'Correo o contraseña incorrectos.' });
        }
        const role = (user.role === 'admin' || isAdminEmail(user.email)) ? 'admin' : 'user';
        return sendJSON(res, 200, {
          success: true,
          user: {
            id: user.id,
            firstName: formatProperName(user.first_name),
            lastName: formatProperName(user.last_name),
            age: user.age,
            email: user.email,
            role,
            isAdmin: role === 'admin'
          }
        });
      }

      const user = db.users.find(
        u => u.email.toLowerCase() === email && (u.passwordHash === passwordHash || u.password === password)
      );
      if (!user) {
        return sendJSON(res, 401, { error: 'Correo o contraseña incorrectos.' });
      }
      const formattedFirst = formatProperName(user.firstName);
      const formattedLast = formatProperName(user.lastName);
      const role = (user.role === 'admin' || isAdminEmail(user.email)) ? 'admin' : 'user';
      db.userProfile = {
        ...db.userProfile,
        name: formattedFirst,
        lastName: formattedLast,
        age: user.age,
        email: user.email,
        role,
        isAdmin: role === 'admin'
      };
      saveLocalDB(db);
      return sendJSON(res, 200, {
        success: true,
        user: {
          id: user.id,
          firstName: formattedFirst,
          lastName: formattedLast,
          age: user.age,
          email: user.email,
          role,
          isAdmin: role === 'admin'
        }
      });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al procesar el inicio de sesión.' });
    }
  }

  // 3.1 POST /api/auth/logout
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    db.userProfile = {
      name: "Visitante",
      lastName: "",
      age: 20,
      email: "",
      role: "user",
      isAdmin: false,
      cycleLength: 28,
      periodDuration: 5,
      lastPeriodDate: "2026-10-22",
      irregular: false
    };
    saveLocalDB(db);
    return sendJSON(res, 200, { success: true, userProfile: db.userProfile });
  }

  // 3.2 POST /api/user/cycle-calibration - Calibrar ciclo menstrual
  if (req.method === 'POST' && pathname === '/api/user/cycle-calibration') {
    try {
      const body = await parseBody(req);
      const lastPeriodDate = body.lastPeriodDate || db.userProfile.lastPeriodDate || '2026-10-22';
      const cycleLength = Number(body.cycleLength || db.userProfile.cycleLength || 28);
      const periodDuration = Number(body.periodDuration || db.userProfile.periodDuration || 5);
      const irregular = Boolean(body.irregular);

      db.userProfile = {
        ...db.userProfile,
        lastPeriodDate,
        cycleLength,
        periodDuration,
        irregular
      };

      if (USE_SUPABASE && (body.userId || db.userProfile.id)) {
        try {
          const uId = body.userId || db.userProfile.id;
          await supabaseRequest('users', {
            method: 'PATCH',
            query: `id=eq.${encodeURIComponent(uId)}`,
            body: {
              last_period_date: lastPeriodDate,
              cycle_length: cycleLength,
              period_duration: periodDuration,
              irregular
            }
          });
        } catch (e) {
          console.warn('Supabase calibration update error:', e.message);
        }
      }

      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, userProfile: db.userProfile });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al calibrar el ciclo.' });
    }
  }

  // 4. POST /api/logs - Guardar registro diario del calendario
  if (req.method === 'POST' && pathname === '/api/logs') {
    try {
      const { date, log, userId } = await parseBody(req);
      if (USE_SUPABASE && userId) {
        await supabaseRequest('daily_logs', {
          method: 'POST',
          single: true,
          body: {
            user_id: userId,
            log_date: date,
            flow: log.flow,
            symptoms: log.symptoms || [],
            sleep_hours: log.sleepHours || 8,
            had_sex: Boolean(log.hadSex)
          }
        });
      }
      db.dailyLogs[date] = log;
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, dailyLogs: db.dailyLogs });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Payload inválido' });
    }
  }

  // 5. POST /api/journals - Guardar entrada de Journaling Menstrual
  if (req.method === 'POST' && pathname === '/api/journals') {
    try {
      const { prompt, content, date } = await parseBody(req);
      const entry = {
        id: Date.now().toString(),
        date: date || new Date().toISOString().split('T')[0],
        prompt: prompt || db.appSettings.journalPrompt || 'Reflexión libre',
        content
      };
      db.journals.unshift(entry);
      if (USE_SUPABASE) {
        try {
          await supabaseRequest('journal_entries', {
            method: 'POST',
            body: {
              entry_date: entry.date,
              prompt: entry.prompt,
              content: entry.content
            }
          });
        } catch (e) {
          console.warn('Supabase journal save error:', e.message);
        }
      }
      saveLocalDB(db);
      return sendJSON(res, 201, { success: true, entry, journals: db.journals });
    } catch (err) {
      return sendJSON(res, 400, { error: 'No se pudo guardar la bitácora.' });
    }
  }

  // 6. POST /api/posts - Publicar en Foro "Pensamientos Menstruantes"
  if (req.method === 'POST' && pathname === '/api/posts') {
    try {
      const newPost = await parseBody(req);
      newPost.id = Date.now().toString();
      newPost.author = formatProperName(newPost.author || 'Usuaria OVUM');
      newPost.likes = 0;
      newPost.commentsCount = 0;
      newPost.timestamp = 'Justo ahora';

      if (USE_SUPABASE) {
        await supabaseRequest('community_posts', {
          method: 'POST',
          body: {
            author_name: newPost.author,
            content: newPost.content,
            tags: newPost.tags || []
          }
        });
      }

      db.posts.unshift(newPost);
      saveLocalDB(db);
      return sendJSON(res, 201, { success: true, post: newPost });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al crear publicación.' });
    }
  }

  // 6.1 POST /api/posts/like - Dar Me Gusta a una publicación del foro
  if (req.method === 'POST' && pathname === '/api/posts/like') {
    try {
      const { postId } = await parseBody(req);
      const post = db.posts.find(p => p.id === postId);
      if (post) {
        post.likes = (post.likes || 0) + 1;
        if (USE_SUPABASE) {
          try {
            await supabaseRequest('community_posts', {
              method: 'PATCH',
              query: `id=eq.${encodeURIComponent(postId)}`,
              body: { likes: post.likes }
            });
          } catch (e) {
            console.warn('Supabase like error:', e.message);
          }
        }
        saveLocalDB(db);
        return sendJSON(res, 200, { success: true, post, posts: db.posts });
      }
      return sendJSON(res, 404, { error: 'Publicación no encontrada.' });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al dar like.' });
    }
  }

  // 7. POST /api/workshops/rsvp - Reservar cupo de taller con registro de asistente
  if (req.method === 'POST' && pathname === '/api/workshops/rsvp') {
    try {
      const { workshopId, userId, userName, userEmail } = await parseBody(req);
      const workshop = db.workshops.find(w => w.id === workshopId);
      if (!workshop) {
        return sendJSON(res, 404, { error: 'Taller no encontrado.' });
      }
      workshop.attendees = workshop.attendees || [];
      const userIdent = userEmail || userId || 'anon';
      const existingIdx = workshop.attendees.findIndex(
        a => (userEmail && a.email && a.email.toLowerCase() === userEmail.toLowerCase()) || (userId && a.id === userId)
      );

      if (existingIdx >= 0) {
        // Cancelar reserva previa
        workshop.attendees.splice(existingIdx, 1);
        workshop.spotsAvailable += 1;
        workshop.isReserved = false;
      } else {
        // Nueva reserva
        if (workshop.spotsAvailable <= 0) {
          return sendJSON(res, 400, { error: 'No hay cupos disponibles.' });
        }
        workshop.attendees.push({
          id: userId || Date.now().toString(),
          name: formatProperName(userName || (db.userProfile ? `${db.userProfile.name} ${db.userProfile.lastName || ''}`.trim() : 'Usuaria OVUM')),
          email: userEmail || (db.userProfile ? db.userProfile.email : 'usuaria@ovum.app'),
          reservedAt: new Date().toLocaleDateString('es-CO')
        });
        workshop.spotsAvailable = Math.max(0, workshop.spotsAvailable - 1);
        workshop.isReserved = true;
      }
      if (USE_SUPABASE) {
        try {
          await supabaseRequest('workshops', {
            method: 'PATCH',
            query: `id=eq.${encodeURIComponent(workshopId)}`,
            body: {
              spots_available: workshop.spotsAvailable,
              attendees: workshop.attendees
            }
          });
        } catch (e) {
          console.warn('Supabase workshop RSVP sync error:', e.message);
        }
      }
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, workshop, workshops: db.workshops });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al procesar reserva de taller.' });
    }
  }

  // 8. POST /api/pqr - Crear ticket PQR
  if (req.method === 'POST' && pathname === '/api/pqr') {
    try {
      const ticket = await parseBody(req);
      ticket.id = `OVUM-${Math.floor(1000 + Math.random() * 9000)}`;
      ticket.status = 'Pendiente';
      ticket.adminReply = '';
      ticket.createdAt = new Date().toLocaleDateString('es-CO');
      if (USE_SUPABASE) {
        await supabaseRequest('pqr_tickets', {
          method: 'POST',
          body: {
            id: ticket.id,
            ticket_type: ticket.type,
            message: ticket.message,
            status: 'Pendiente'
          }
        });
      }
      db.pqrTickets.unshift(ticket);
      saveLocalDB(db);
      return sendJSON(res, 201, { success: true, ticketNumber: ticket.id, pqrTickets: db.pqrTickets });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al radicar PQR.' });
    }
  }

  // =========================================================================
  // ENDPOINTS PROTEGIDOS DEL PANEL DE ADMINISTRACIÓN (SOLO CORREOS AUTORIZADOS)
  // =========================================================================
  if (pathname.startsWith('/api/admin/')) {
    const headerEmail = req.headers['x-admin-email'] || '';
    const activeEmail = headerEmail || (db.userProfile && db.userProfile.email) || '';
    if (!isAdminEmail(activeEmail)) {
      return sendJSON(res, 403, {
        error: 'Acceso denegado: Tu correo electrónico no tiene permisos de administradora en OVUM.'
      });
    }
  }

  // 9. POST /api/admin/resources - Crear o editar un recurso de Explora
  if (req.method === 'POST' && pathname === '/api/admin/resources') {
    try {
      const body = await parseBody(req);
      const cat = body.category || 'general';
      const id = body.id || `res-${cat}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const accentMap = {
        recetario: 'blue',
        playlist: 'pink',
        biblioteca: 'fuchsia',
        podcasts: 'pink',
        fanzine: 'fuchsia',
        directorio: 'blue'
      };
      const item = {
        id,
        category: body.category || 'playlist',
        badge: body.badge || 'Recurso OVUM',
        meta: body.meta || '',
        title: String(body.title || '').trim(),
        description: String(body.description || '').trim(),
        extraInfo: String(body.extraInfo || '').trim(),
        actionLabel: String(body.actionLabel || 'Ver Detalle').trim(),
        modalTitle: String(body.modalTitle || body.title || '').trim(),
        modalBody: String(body.modalBody || body.description || '').trim(),
        externalUrl: String(body.externalUrl || '').trim(),
        accent: body.accent || accentMap[body.category] || 'fuchsia'
      };

      if (!item.title || !item.description) {
        return sendJSON(res, 400, { error: 'El título y la descripción son obligatorios.' });
      }

      if (USE_SUPABASE) {
        try {
          await supabaseRequest('explora_resources', {
            method: 'POST',
            single: true,
            upsert: true,
            body: {
              id: item.id,
              category: item.category,
              badge: item.badge,
              meta: item.meta,
              title: item.title,
              description: item.description,
              extra_info: item.extraInfo,
              action_label: item.actionLabel,
              modal_title: item.modalTitle,
              modal_body: item.modalBody,
              external_url: item.externalUrl,
              accent: item.accent
            }
          });

          // Consultar la lista completa actualizada desde Supabase para retornar el estado real
          const allRows = await supabaseRequest('explora_resources', { query: 'select=*&order=updated_at.desc' });
          if (allRows && allRows.length) {
            db.exploraResources = allRows.map(r => ({
              id: r.id,
              category: r.category,
              badge: r.badge,
              meta: r.meta || '',
              title: r.title,
              description: r.description,
              extraInfo: r.extra_info || '',
              actionLabel: r.action_label || '',
              modalTitle: r.modal_title || r.title,
              modalBody: r.modal_body || r.description,
              externalUrl: r.external_url || '',
              accent: r.accent || 'fuchsia'
            }));
            saveLocalDB(db);
            return sendJSON(res, 200, { success: true, item, exploraResources: db.exploraResources });
          }
        } catch (supaErr) {
          console.error('Supabase explora_resources save error:', supaErr.message);
          throw new Error('Error en Supabase: ' + supaErr.message);
        }
      }

      const idx = db.exploraResources.findIndex(r => r.id === id);
      if (idx >= 0) {
        db.exploraResources.splice(idx, 1);
      }
      db.exploraResources.unshift(item);
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, item, exploraResources: db.exploraResources });
    } catch (err) {
      console.error('Admin resource save error:', err);
      return sendJSON(res, 400, { error: err.message || 'Error al guardar el recurso.' });
    }
  }

  // 10. DELETE /api/admin/resources - Eliminar recurso de Explora
  if (req.method === 'DELETE' && pathname === '/api/admin/resources') {
    try {
      const { id } = await parseBody(req);
      if (USE_SUPABASE && id) {
        await supabaseRequest('explora_resources', { method: 'DELETE', query: `id=eq.${encodeURIComponent(id)}` });
        const allRows = await supabaseRequest('explora_resources', { query: 'select=*&order=updated_at.desc' });
        if (allRows) {
          db.exploraResources = allRows.map(r => ({
            id: r.id,
            category: r.category,
            badge: r.badge,
            meta: r.meta || '',
            title: r.title,
            description: r.description,
            extraInfo: r.extra_info || '',
            actionLabel: r.action_label || '',
            modalTitle: r.modal_title || r.title,
            modalBody: r.modal_body || r.description,
            externalUrl: r.external_url || '',
            accent: r.accent || 'fuchsia'
          }));
          saveLocalDB(db);
          return sendJSON(res, 200, { success: true, exploraResources: db.exploraResources });
        }
      }
      db.exploraResources = db.exploraResources.filter(r => r.id !== id);
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, exploraResources: db.exploraResources });
    } catch (err) {
      return sendJSON(res, 400, { error: 'No se pudo eliminar el recurso.' });
    }
  }

  // 11. POST /api/admin/workshops - Crear o editar un Taller (Campus EAFIT o Virtual)
  if (req.method === 'POST' && pathname === '/api/admin/workshops') {
    try {
      const body = await parseBody(req);
      const id = body.id || `w-${Date.now()}`;
      const workshop = {
        id,
        title: String(body.title || '').trim(),
        location: String(body.location || '').trim(),
        eventDate: String(body.eventDate || '').trim(),
        eventTime: String(body.eventTime || '').trim(),
        date: String(body.date || '').trim(),
        spotsAvailable: Number(body.spotsAvailable ?? 10),
        isReserved: false
      };

      if (!workshop.title || !workshop.location || !workshop.date) {
        return sendJSON(res, 400, { error: 'Título, lugar/modalidad, fecha y hora son obligatorios.' });
      }

      if (USE_SUPABASE) {
        await supabaseRequest('workshops', {
          method: 'POST',
          single: true,
          body: {
            id: workshop.id,
            title: workshop.title,
            location: workshop.location,
            event_date: workshop.date,
            spots_available: workshop.spotsAvailable,
            attendees: (db.workshops.find(w => w.id === id)?.attendees) || []
          }
        });
      }

      const idx = db.workshops.findIndex(w => w.id === id);
      if (idx >= 0) {
        db.workshops[idx] = { ...db.workshops[idx], ...workshop };
      } else {
        db.workshops.unshift(workshop);
      }
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, workshop, workshops: db.workshops });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al guardar el taller.' });
    }
  }

  // 12. DELETE /api/admin/workshops - Eliminar Taller
  if (req.method === 'DELETE' && pathname === '/api/admin/workshops') {
    try {
      const { id } = await parseBody(req);
      if (USE_SUPABASE && id) {
        await supabaseRequest('workshops', { method: 'DELETE', query: `id=eq.${encodeURIComponent(id)}` });
      }
      db.workshops = db.workshops.filter(w => w.id !== id);
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, workshops: db.workshops });
    } catch (err) {
      return sendJSON(res, 400, { error: 'No se pudo eliminar el taller.' });
    }
  }

  // 13. POST /api/admin/settings - Actualizar Prompt del Journaling o configuración global
  if (req.method === 'POST' && pathname === '/api/admin/settings') {
    try {
      const body = await parseBody(req);
      if (body.journalPrompt !== undefined) {
        db.appSettings.journalPrompt = String(body.journalPrompt).trim();
        if (USE_SUPABASE) {
          await supabaseRequest('app_settings', {
            method: 'POST',
            single: true,
            body: {
              setting_key: 'journal_prompt',
              setting_value: db.appSettings.journalPrompt
            }
          });
        }
      }
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, appSettings: db.appSettings });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al actualizar configuración.' });
    }
  }

  // 14. DELETE /api/admin/posts - Moderar / Eliminar post del Foro Comunitario
  if (req.method === 'DELETE' && pathname === '/api/admin/posts') {
    try {
      const { id } = await parseBody(req);
      if (USE_SUPABASE && id) {
        await supabaseRequest('community_posts', { method: 'DELETE', query: `id=eq.${encodeURIComponent(id)}` });
      }
      db.posts = db.posts.filter(p => p.id !== id);
      saveLocalDB(db);
      return sendJSON(res, 200, { success: true, posts: db.posts });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al eliminar publicación.' });
    }
  }

  // 15. POST /api/admin/pqr/resolve - Cambiar estado o responder un ticket PQR
  if (req.method === 'POST' && pathname === '/api/admin/pqr/resolve') {
    try {
      const { id, status, adminReply } = await parseBody(req);
      const ticket = db.pqrTickets.find(t => t.id === id);
      if (ticket) {
        ticket.status = status || (ticket.status === 'Resuelto' ? 'Pendiente' : 'Resuelto');
        if (adminReply !== undefined) ticket.adminReply = adminReply;
        saveLocalDB(db);
      }
      return sendJSON(res, 200, { success: true, pqrTickets: db.pqrTickets });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Error al actualizar el ticket PQR.' });
    }
  }

  // 16. DELETE /api/user/wipe - Borrado total (Habeas Data)
  if (req.method === 'DELETE' && pathname === '/api/user/wipe') {
    db.dailyLogs = {};
    db.journals = [];
    db.pqrTickets = [];
    db.userProfile = {
      name: "Usuaria",
      lastName: "",
      age: 20,
      email: "usuaria@ovum.app",
      role: "user",
      isAdmin: false,
      cycleLength: 28,
      periodDuration: 5,
      lastPeriodDate: new Date().toISOString().split('T')[0],
      irregular: false
    };
    saveLocalDB(db);
    return sendJSON(res, 200, { success: true, message: "Datos eliminados por completo" });
  }

  return sendJSON(res, 404, { error: 'Ruta API no encontrada' });
}
