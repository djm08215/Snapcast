-- ============================================================
-- Snapcast 구독 시스템 스키마
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. profiles (auth.users 확장)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  plan text not null default 'free', -- 'free' | 'pro'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2. subscriptions (토스 빌링 정보)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  billing_key text not null,
  plan text not null default 'pro',
  status text not null default 'active', -- 'active' | 'cancelled' | 'expired'
  current_period_start timestamptz,
  current_period_end timestamptz,
  last_order_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 3. usage (월별 요약 사용량)
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  month text not null, -- 'YYYY-MM'
  count int not null default 0,
  updated_at timestamptz default now(),
  unique (user_id, month)
);

alter table public.usage enable row level security;

create policy "usage_select_own" on public.usage
  for select using (auth.uid() = user_id);

-- 4. summaries (요약 히스토리 - DB 저장)
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  video_url text not null,
  video_title text,
  result jsonb not null,
  created_at timestamptz default now()
);

alter table public.summaries enable row level security;

create policy "summaries_select_own" on public.summaries
  for select using (auth.uid() = user_id);

create policy "summaries_insert_own" on public.summaries
  for insert with check (auth.uid() = user_id);

create policy "summaries_delete_own" on public.summaries
  for delete using (auth.uid() = user_id);

-- 5. 신규 유저 가입 시 profile 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. increment_usage RPC (usage 카운트 원자적 증가)
create or replace function public.increment_usage(p_user_id uuid, p_month text)
returns void as $$
begin
  insert into public.usage (user_id, month, count, updated_at)
  values (p_user_id, p_month, 1, now())
  on conflict (user_id, month)
  do update set count = usage.count + 1, updated_at = now();
end;
$$ language plpgsql security definer;

-- 7. Service Role 전용 정책 (API routes에서 사용)
-- usage upsert
create policy "usage_upsert_service" on public.usage
  for all using (true)
  with check (true);

-- profiles update by service
create policy "profiles_update_service" on public.profiles
  for update using (true);

-- subscriptions insert/update by service
create policy "subscriptions_insert_service" on public.subscriptions
  for insert with check (true);

create policy "subscriptions_update_service" on public.subscriptions
  for update using (true);
