-- ============================================================================
-- ESQUEMA SQL DE PRODUCCIÓN PARA SUPABASE (PostgreSQL) — OVUM PWA
-- ============================================================================

-- 1. Tabla de Perfiles de Usuarias
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INT NOT NULL CHECK (age >= 10 AND age <= 100),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'user' o 'admin'
  cycle_length INT DEFAULT 28,
  period_duration INT DEFAULT 5,
  last_period_date DATE DEFAULT CURRENT_DATE,
  irregular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Registros Diarios del Ciclo (Mi Ciclo)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  flow TEXT NOT NULL DEFAULT 'ninguno',
  symptoms JSONB DEFAULT '[]'::jsonb,
  sleep_hours NUMERIC(4,1) DEFAULT 8,
  had_sex BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 3. Tabla de Bitácora Privada (Journaling Menstrual)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  entry_date DATE DEFAULT CURRENT_DATE,
  prompt TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla del Foro Comunitario ("Pensamientos Menstruantes")
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Talleres y Reservas (Campus EAFIT & Virtuales)
CREATE TABLE IF NOT EXISTS public.workshops (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date TEXT NOT NULL,
  spots_available INT NOT NULL DEFAULT 10,
  attendees JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.workshop_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id TEXT REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workshop_id, user_id)
);

-- 6. Tabla de Recursos Administrables de "Explora" (Playlists, Recetario, Biblioteca, Podcasts, Fanzine, Directorio)
CREATE TABLE IF NOT EXISTS public.explora_resources (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'recetario', 'playlist', 'biblioteca', 'podcasts', 'fanzine', 'directorio'
  badge TEXT NOT NULL,
  meta TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  extra_info TEXT DEFAULT '',
  action_label TEXT DEFAULT '',
  modal_title TEXT DEFAULT '',
  modal_body TEXT DEFAULT '',
  external_url TEXT DEFAULT '',
  accent TEXT DEFAULT 'fuchsia', -- 'fuchsia', 'crimson', 'blue', 'pink'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Configuración Global Administrable (Prompt del Journaling, Avisos)
CREATE TABLE IF NOT EXISTS public.app_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Tickets PQR & Sugerencias
CREATE TABLE IF NOT EXISTS public.pqr_tickets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Pendiente', -- 'Pendiente' o 'Resuelto'
  admin_reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semilla inicial de talleres oficiales de OVUM
INSERT INTO public.workshops (id, title, location, event_date, spots_available)
VALUES
  ('w1', 'Taller de Menstruación y Ciclicidad', 'Campus EAFIT - Bloque 38', '14 de Noviembre, 2026 - 3:00 PM', 6),
  ('w2', 'Cómo crear tu propia Toalla Reutilizable', 'Virtual (Google Meet)', '20 de Noviembre, 2026 - 5:00 PM', 15),
  ('w3', 'Journaling Menstrual y Gestión de Energía', 'Campus EAFIT - Ágora Cultural', '28 de Noviembre, 2026 - 10:00 AM', 8)
ON CONFLICT (id) DO NOTHING;

-- Semilla inicial de configuración global
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES
  ('journal_prompt', '¿En qué proyecto o idea sientes que tu creatividad quiere expandirse hoy?')
ON CONFLICT (setting_key) DO NOTHING;

-- Semilla inicial de recursos de Explora (incluyendo Playlists, Recetario, Fanzine, Podcasts, Biblioteca y Directorio)
INSERT INTO public.explora_resources (id, category, badge, meta, title, description, extra_info, action_label, modal_title, modal_body, external_url, accent)
VALUES
  ('r1', 'recetario', 'Recetario • Ovulación', '15 min • Antiinflamatorio', 'BOWL DE QUINOA, AGUACATE Y SEMILLAS', 'Rico en zinc, vitamina E y fibra para acompañar el pico de estrógenos y sostener tu vitalidad sin inflamación.', 'Ingredientes: Quinoa cocida, 1/2 aguacate, semillas de calabaza, espinaca baby y limón.', 'Ver preparación paso a paso', 'Receta: Bowl de Quinoa, Aguacate y Semillas', '1. Cocina 1 taza de quinoa con una pizca de sal marina.\n2. Corta medio aguacate en cubos y mezcla con espinaca baby fresca.\n3. Tuesta 2 cucharadas de semillas de calabaza (ricas en zinc para la fase ovulatoria).\n4. Adereza con aceite de oliva extravirgen y jugo de limón.', '', 'blue'),
  ('r2', 'recetario', 'Recetario • Menstruación', '10 min • Calmante', 'INFUSIÓN TIBIA DE JENGIBRE, CANELA Y CACAO', 'Ideal para desinflamar el útero, aliviar cólicos menstruales y aportar magnesio natural al cuerpo.', 'Ingredientes: Jengibre fresco rallado, 1 astilla de canela, 1 cucharada de cacao puro 70%.', 'Ver preparación paso a paso', 'Receta: Infusión de Jengibre, Canela y Cacao', '1. Hierve 1 taza de agua con una astilla de canela y jengibre rallado durante 5 minutos.\n2. Retira del fuego y disuelve 1 cucharada de cacao puro (fuente natural de magnesio que relaja el músculo uterino).\n3. Toma caliente mientras descansas con calor local.', '', 'crimson'),
  ('r3', 'playlist', 'Playlist Colaborativa', 'Spotify / Audio Cíclico', 'FOCO & ENERGÍA ALTA (FASE OVULATORIA)', 'Selección musical colaborativa para acompañar tus jornadas de estudio o movimiento.', 'Canciones destacadas: 1. Brillo Propio — 2. Ciclicidad Acústica — 3. Respirar en el Campus — 4. Calma Lútea.', 'Escuchar Playlist', 'Playlist Cíclica OVUM', 'Reproduciendo lista activa:\n1. Brillo Propio (3:42)\n2. Ciclicidad Acústica (4:10)\n3. Respirar en el Campus (2:58)\n4. Calma Lútea (3:30)', 'https://open.spotify.com', 'pink'),
  ('r4', 'biblioteca', 'Biblioteca Verificada', 'Lectura 5 min', 'LAS 4 FASES DE TU CICLO EXPLICADAS SIN RODEOS', 'Guía práctica para entender por qué tu energía, apetito y sueño cambian a lo largo del mes y cómo habitar cada etapa sin culpa.', '', 'Leer Guía Completa', 'Las 4 Fases de tu Ciclo', '1. Menstruación (Días 1-5): Descanso e introspección.\n2. Folicular (Días 6-12): Curiosidad, planeación y energía en ascenso.\n3. Ovulación (Días 13-16): Pico de vitalidad, expresión y empatía.\n4. Lútea (Días 17-28): Autocuidado, límites sanos y preparación para soltar.', '', 'fuchsia'),
  ('r5', 'podcasts', 'Podcast Recomendado', 'Audio 24 min', 'EP. 12: PRODUCTIVIDAD UNIVERSITARIA Y CICLICIDAD', 'Conversación con estudiantes de Medellín sobre cómo conciliar los parciales con los cambios hormonales.', '', 'Reproducir Episodio (24 min)', 'Podcast Ep. 12 — OVUM', 'Audio activo (24 min): Hablamos con Juliana y Sofía sobre el agotamiento mental del multitasking y cómo organizar el estudio según tu fase menstrual.', '', 'pink'),
  ('r6', 'fanzine', 'Fanzine Digital Ilustrado', 'Edición #1', 'FANZINE OVUM EDICIÓN #1: HABITAR EL CUERPO', 'Publicación gráfica transmedia con ilustraciones, relatos reales y desmitificación del tabú menstrual.', '', 'Hojear Fanzine Interactivo', 'Fanzine Digital OVUM #1', 'Página 1: El ciclo no es lineal, es espiral.\nPágina 2: Mitos que nos contaron sobre el dolor menstrual.\nPágina 3: Manifiesto por una educación menstrual libre de estigmas.', '', 'fuchsia'),
  ('r7', 'directorio', 'Directorio & Financiación', 'Alianzas Medellín', 'COPAS, DISCOS Y TOALLAS REUTILIZABLES', 'Catálogo de marcas locales en Medellín, descuentos estudiantiles y opciones de financiación comunitaria.', '', 'Ver Alianzas y Descuentos', 'Directorio de Gestión Menstrual Sostenible', '• Copa Menstrual Certificada: 25% dto con carné estudiantil.\n• Kit de 3 Toallas de Tela Algodón Orgánico: Financiación en 2 cuotas sin interés.\n• Panties Absorbentes: Alianza local Medellín.', '', 'blue')
ON CONFLICT (id) DO NOTHING;
