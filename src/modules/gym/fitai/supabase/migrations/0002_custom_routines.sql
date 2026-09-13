-- Punto Fuerte — Rutinas personalizadas creadas en la UI
-- Ejecutar en Supabase > SQL Editor, o via `supabase db push`.

-- 1) Rutinas custom (payload completo de la UI en JSONB; columnas auxiliares
--    para filtrado y orden estable)
create table if not exists public.custom_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text not null default '',
  name text not null default 'Rutina personalizada',
  category text not null default 'todos',
  difficulty text not null default 'Moderada',
  duration_minutes int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint custom_routines_user_client_uidx unique (user_id, client_id)
);

alter table public.custom_routines enable row level security;

create policy "own custom routines" on public.custom_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists custom_routines_user_idx on public.custom_routines (user_id);