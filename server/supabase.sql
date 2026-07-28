-- Kódolabky — Sieň slávy v Supabase.
-- Spusti celé naraz v SQL Editore. Dá sa spustiť opakovane.
--
-- Myšlienka: anon kľúč je v kóde stránky verejný, takže tabuľka NESMIE byť
-- priamo zapisovateľná — inak si ktokoľvek pošle milión bodov. Čítať sa smie
-- voľne, zapisovať len cez funkciu, ktorá si všetko overí sama.

-- ── Tabuľka ────────────────────────────────────────────────────────────────
create table if not exists public.hall (
  nick       text primary key,
  points     integer     not null check (points >= 0),
  missions   integer     not null default 0 check (missions >= 0),
  at         date        not null default current_date,
  updated_at timestamptz not null default now()
);

create index if not exists hall_points_idx on public.hall (points desc, at asc);

alter table public.hall enable row level security;

-- Čítať smie ktokoľvek…
drop policy if exists "hall je verejne citatelna" on public.hall;
create policy "hall je verejne citatelna"
  on public.hall for select
  to anon, authenticated
  using (true);

-- …zapisovať nikto. Žiadna insert/update/delete politika zámerne neexistuje,
-- takže priamy zápis anon kľúčom neprejde.

-- ── Zápis skóre ────────────────────────────────────────────────────────────
-- security definer = beží s právami vlastníka, teda obíde RLS. To je jediná
-- cesta, ako sa dá do tabuľky zapísať.

create or replace function public.submit_score(
  p_nick     text,
  p_points   integer,
  p_missions integer
)
returns setof public.hall
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Strop na jedného hráča: 250 bodov × počet levelov.
  -- PRI PRIDANÍ LEVELU TREBA ZVÝŠIŤ, inak sa poctivý hráč nezapíše.
  v_max_points constant integer := 1250;
  v_hall_size  constant integer := 15;

  v_bad constant text[] := array[
    'kokot','kurva','piced','picus','jebo','jebn','sral','sracka','hovno',
    'debil','idiot','kreten','mrdk','mrda','buzer','cigan',
    'fuck','shit','bitch','cunt','dick','nigg','rape','nazi','hitler'
  ];

  v_nick text;
  v_flat text;
  v_last timestamptz;
begin
  -- Prezývka sa čistí nanovo; tomu, čo prišlo od klienta, sa neverí.
  v_nick := regexp_replace(coalesce(p_nick, ''), '[^[:alnum:][:space:]-]', '', 'g');
  v_nick := btrim(regexp_replace(v_nick, '\s+', ' ', 'g'));
  v_nick := left(upper(v_nick), 10);

  if length(v_nick) < 2 then
    raise exception 'Prezývka musí mať aspoň dve písmená.';
  end if;

  v_flat := lower(regexp_replace(v_nick, '[^[:alnum:]]', '', 'g'));
  if exists (select 1 from unnest(v_bad) w where position(w in v_flat) > 0) then
    raise exception 'Takúto prezývku sem nedáme. Skús inú.';
  end if;

  if p_points is null or p_points < 0 or p_points > v_max_points then
    raise exception 'Body sú mimo rozsahu.';
  end if;

  if p_missions is null or p_missions < 0 or p_missions > 200 then
    raise exception 'Počet misií je mimo rozsahu.';
  end if;

  -- Jednoduchá brzda proti zaplaveniu.
  select updated_at into v_last from public.hall where nick = v_nick;
  if v_last is not null and v_last > now() - interval '5 seconds' then
    raise exception 'Priveľa zápisov za sebou. Skús o chvíľu.';
  end if;

  -- Jedna prezývka = jedna priečka; horší výsledok ten lepší neprepíše.
  insert into public.hall as h (nick, points, missions, at, updated_at)
  values (v_nick, p_points, p_missions, current_date, now())
  on conflict (nick) do update set
    points     = greatest(h.points, excluded.points),
    missions   = greatest(h.missions, excluded.missions),
    at         = case when excluded.points > h.points then excluded.at else h.at end,
    updated_at = now();

  return query
    select * from public.hall
    order by points desc, at asc
    limit v_hall_size;
end;
$$;

revoke all on function public.submit_score(text, integer, integer) from public;
grant execute on function public.submit_score(text, integer, integer) to anon, authenticated;

-- ── Údržba ─────────────────────────────────────────────────────────────────
-- Zmazať jednu prezývku:   delete from public.hall where nick = 'PREZYVKA';
-- Vynulovať celý rebríček: truncate public.hall;
