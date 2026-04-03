-- Run this in your Supabase SQL Editor
-- Dashboard > Project > SQL Editor > New query

-- Legacy blob table retained for one-time migration by the app
create table if not exists buildwise_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists buildwise_app_state (
  id text primary key,
  active_scenario_id text,
  updated_at timestamptz not null default now()
);

create table if not exists buildwise_scenarios (
  id text primary key,
  name text not null,
  description text not null default '',
  project_name text not null default '',
  total_bua double precision not null default 0,
  landscape_area double precision not null default 0,
  total_area double precision not null default 0,
  budget_cap double precision,
  opex_months integer not null default 0,
  created_at_ms bigint not null,
  updated_at_ms bigint not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists buildwise_categories (
  id text primary key,
  scenario_id text not null references buildwise_scenarios(id) on delete cascade,
  name text not null,
  section text not null check (section in ('capex', 'opex')),
  sort_order double precision not null default 0,
  is_archived boolean not null default false,
  color text not null default '#94A3B8',
  budget_cap double precision,
  updated_at timestamptz not null default now()
);

create table if not exists buildwise_line_items (
  id text primary key,
  scenario_id text not null references buildwise_scenarios(id) on delete cascade,
  category_id text not null,
  name text not null,
  unit_cost double precision not null default 0,
  quantity double precision not null default 0,
  unit text not null,
  status text not null check (status in ('TBC', 'Estimated', 'Quoted', 'Committed', 'Invoiced', 'Paid')),
  team text check (team in ('PMO', 'AAED') or team is null),
  remark text not null default '',
  sort_order double precision not null default 0,
  is_archived boolean not null default false,
  created_at_ms bigint not null,
  updated_at_ms bigint not null,
  updated_at timestamptz not null default now()
);

create table if not exists buildwise_area_statements (
  id text primary key,
  scenario_id text not null references buildwise_scenarios(id) on delete cascade,
  label text not null,
  area_sqft double precision not null default 0,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_buildwise_scenarios_sort_order
  on buildwise_scenarios(sort_order);

create index if not exists idx_buildwise_categories_scenario
  on buildwise_categories(scenario_id, sort_order);

create index if not exists idx_buildwise_line_items_scenario
  on buildwise_line_items(scenario_id, sort_order);

create index if not exists idx_buildwise_line_items_category
  on buildwise_line_items(category_id);

create index if not exists idx_buildwise_area_statements_scenario
  on buildwise_area_statements(scenario_id, sort_order);

alter table buildwise_state enable row level security;
alter table buildwise_app_state enable row level security;
alter table buildwise_scenarios enable row level security;
alter table buildwise_categories enable row level security;
alter table buildwise_line_items enable row level security;
alter table buildwise_area_statements enable row level security;

drop policy if exists "Allow public read" on buildwise_state;
drop policy if exists "Allow public write" on buildwise_state;
drop policy if exists "Allow public update" on buildwise_state;
drop policy if exists "Allow public delete" on buildwise_state;

create policy "Allow public read" on buildwise_state
  for select using (true);

create policy "Allow public write" on buildwise_state
  for insert with check (true);

create policy "Allow public update" on buildwise_state
  for update using (true) with check (true);

create policy "Allow public delete" on buildwise_state
  for delete using (true);

drop policy if exists "BuildWise app_state read" on buildwise_app_state;
drop policy if exists "BuildWise app_state write" on buildwise_app_state;
drop policy if exists "BuildWise app_state update" on buildwise_app_state;
drop policy if exists "BuildWise app_state delete" on buildwise_app_state;

create policy "BuildWise app_state read" on buildwise_app_state
  for select using (true);

create policy "BuildWise app_state write" on buildwise_app_state
  for insert with check (true);

create policy "BuildWise app_state update" on buildwise_app_state
  for update using (true) with check (true);

create policy "BuildWise app_state delete" on buildwise_app_state
  for delete using (true);

drop policy if exists "BuildWise scenarios read" on buildwise_scenarios;
drop policy if exists "BuildWise scenarios write" on buildwise_scenarios;
drop policy if exists "BuildWise scenarios update" on buildwise_scenarios;
drop policy if exists "BuildWise scenarios delete" on buildwise_scenarios;

create policy "BuildWise scenarios read" on buildwise_scenarios
  for select using (true);

create policy "BuildWise scenarios write" on buildwise_scenarios
  for insert with check (true);

create policy "BuildWise scenarios update" on buildwise_scenarios
  for update using (true) with check (true);

create policy "BuildWise scenarios delete" on buildwise_scenarios
  for delete using (true);

drop policy if exists "BuildWise categories read" on buildwise_categories;
drop policy if exists "BuildWise categories write" on buildwise_categories;
drop policy if exists "BuildWise categories update" on buildwise_categories;
drop policy if exists "BuildWise categories delete" on buildwise_categories;

create policy "BuildWise categories read" on buildwise_categories
  for select using (true);

create policy "BuildWise categories write" on buildwise_categories
  for insert with check (true);

create policy "BuildWise categories update" on buildwise_categories
  for update using (true) with check (true);

create policy "BuildWise categories delete" on buildwise_categories
  for delete using (true);

drop policy if exists "BuildWise line_items read" on buildwise_line_items;
drop policy if exists "BuildWise line_items write" on buildwise_line_items;
drop policy if exists "BuildWise line_items update" on buildwise_line_items;
drop policy if exists "BuildWise line_items delete" on buildwise_line_items;

create policy "BuildWise line_items read" on buildwise_line_items
  for select using (true);

create policy "BuildWise line_items write" on buildwise_line_items
  for insert with check (true);

create policy "BuildWise line_items update" on buildwise_line_items
  for update using (true) with check (true);

create policy "BuildWise line_items delete" on buildwise_line_items
  for delete using (true);

drop policy if exists "BuildWise area_statements read" on buildwise_area_statements;
drop policy if exists "BuildWise area_statements write" on buildwise_area_statements;
drop policy if exists "BuildWise area_statements update" on buildwise_area_statements;
drop policy if exists "BuildWise area_statements delete" on buildwise_area_statements;

create policy "BuildWise area_statements read" on buildwise_area_statements
  for select using (true);

create policy "BuildWise area_statements write" on buildwise_area_statements
  for insert with check (true);

create policy "BuildWise area_statements update" on buildwise_area_statements
  for update using (true) with check (true);

create policy "BuildWise area_statements delete" on buildwise_area_statements
  for delete using (true);
