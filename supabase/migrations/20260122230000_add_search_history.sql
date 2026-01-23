create table if not exists user_searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  tail_number text not null,
  searched_at timestamptz default now()
);

alter table user_searches enable row level security;

create policy "Users can view their own searches"
  on user_searches for select
  using (auth.uid() = user_id);

create policy "Users can insert their own searches"
  on user_searches for insert
  with check (auth.uid() = user_id);
