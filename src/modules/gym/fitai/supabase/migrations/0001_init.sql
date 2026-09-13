-- Punto Fuerte — Schema inicial (Supabase Postgres)
-- Ejecutar en Supabase > SQL Editor, o via `supabase db push`.

-- 1) Perfiles públicos por usuario
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text,
  age int,
  gender text,
  height numeric,
  weight numeric,
  experience text,
  days_per_week int,
  avg_duration int,
  primary_goal text,
  target_muscles jsonb default '[]'::jsonb,
  equipment jsonb default '[]'::jsonb,
  injuries text default '',
  weekly_compliance numeric default 25,
  unit_system text default 'metric',
  notifications jsonb default '{"workoutReminders":true,"coachTips":true,"restTimerSound":true}'::jsonb,
  is_demo boolean default false,
  updated_at timestamptz default now()
);

-- 2) Rutinas semanales (ejercicios embebidos en JSONB)
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_number int not null,
  name text,
  focus text,
  description text,
  estimated_minutes int,
  difficulty text,
  target_muscles jsonb default '[]'::jsonb,
  exercises jsonb default '[]'::jsonb,
  is_rest_day boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

-- 3) Historial de sesiones de entrenamiento
create table if not exists public.workout_sessions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date text,
  routine_name text,
  duration_minutes int,
  total_volume_kg numeric,
  exercises_completed int,
  total_sets int,
  average_rpe numeric,
  calories_burned numeric,
  average_heart_rate int,
  peak_heart_rate int,
  allometric_power_watts numeric,
  allometric_calories numeric,
  user_observations text,
  ai_coach_feedback text,
  completed_sets jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4) Récords personales
create table if not exists public.personal_records (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_name text,
  record_value text,
  date text,
  category text,
  previous_value text,
  progress_percent numeric,
  allometric_score numeric,
  normalized_70kg_load numeric,
  created_at timestamptz default now()
);

-- 5) Evolución de peso corporal
create table if not exists public.weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date text,
  weight numeric,
  created_at timestamptz default now()
);

-- 6) Conversaciones con el Coach IA
create table if not exists public.chat_messages (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  sender text,
  text text,
  timestamp text,
  category text,
  source text,
  suggested_action jsonb,
  created_at timestamptz default now()
);

-- RLS: cada usuario sólo opera sobre sus propias filas
alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.personal_records enable row level security;
alter table public.weight_history enable row level security;
alter table public.chat_messages enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own routines" on public.routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own records" on public.personal_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own weight" on public.weight_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own chat" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Índices por usuario
create index if not exists routines_user_idx on public.routines (user_id);
create index if not exists sessions_user_idx on public.workout_sessions (user_id);
create index if not exists chat_user_idx on public.chat_messages (user_id);
create unique index if not exists routines_user_day_uidx on public.routines (user_id, day_number);
create unique index if not exists weight_user_date_uidx on public.weight_history (user_id, date);

-- Trigger: crea el perfil automáticamente al registrar un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Nota: la cuenta demo (demo@fitai.app) y sus datos se crean desde la propia
-- app (servicio `supabaseService.ensureDemoData`) la primera vez que el botón
-- circular entra a la demo. Así no dependemos de inserts frágiles en auth.users.