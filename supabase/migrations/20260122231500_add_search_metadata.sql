alter table user_searches 
add column if not exists search_data jsonb;

comment on column user_searches.search_data is 'Snapshot of aircraft details and risk score at time of search';
