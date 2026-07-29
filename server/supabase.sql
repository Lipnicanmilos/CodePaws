-- Kódolabky — Rebríček v Supabase.
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
  dog        text        not null default 'fifo',
  at         date        not null default current_date,
  updated_at timestamptz not null default now()
);

-- Psík hráča (avatar v rebríčku) — doplnenie pre tabuľky založené staršou verziou.
alter table public.hall add column if not exists dog text not null default 'fifo';

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

-- Stará trojparametrová verzia musí preč — s novým parametrom s default hodnotou
-- by boli volania s tromi argumentmi nejednoznačné (dve funkcie by sedeli).
drop function if exists public.submit_score(text, integer, integer);

create or replace function public.submit_score(
  p_nick     text,
  p_points   integer,
  p_missions integer,
  p_dog      text default 'fifo'
)
returns setof public.hall
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Žiadny strop viazaný na počet levelov: taký sa pri každom novom leveli
  -- zabudne zvýšiť a poctivému hráčovi potom zápis tíško padne. Ostáva len
  -- poistka proti nezmyslu, ktorú hraním nikdy nedosiahneš.
  v_sane_points constant integer := 100000;
  v_hall_size   constant integer := 15;

  v_bad constant text[] := array[
    'kokot','kurva','piced','picus','jebo','jebn','sral','sracka','hovno',
    'debil','idiot','kreten','mrdk','mrda','buzer','cigan',
    'fuck','shit','bitch','cunt','dick','nigg','rape','nazi','hitler'
  ];

  -- Zoznam psíkov drží server sám — klientovi sa neverí ani v avataroch.
  v_dogs constant text[] := array['fifo','bit','ajka','luna','rex','cent'];

  v_nick text;
  v_flat text;
  v_dog  text;
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

  -- p_points sú NOVÉ body od posledného zápisu, nie celý súčet hráča.
  if p_points is null or p_points < 0 or p_points > v_sane_points then
    raise exception 'Body sú mimo rozsahu.';
  end if;

  if p_missions is null or p_missions < 0 or p_missions > 200 then
    raise exception 'Počet misií je mimo rozsahu.';
  end if;

  -- Neznámy psík nezhodí zápis — potichu sa nahradí Fifom.
  v_dog := case when p_dog = any(v_dogs) then p_dog else 'fifo' end;

  -- Jednoduchá brzda proti zaplaveniu.
  select updated_at into v_last from public.hall where nick = v_nick;
  if v_last is not null and v_last > now() - interval '5 seconds' then
    raise exception 'Priveľa zápisov za sebou. Skús o chvíľu.';
  end if;

  -- Jedna prezývka = jedna priečka a body sa PRIPOČÍTAVAJÚ: kto sa vráti a zahrá
  -- ďalšie kolo pod tou istou prezývkou, tomu priečka narastie. Klient posiela
  -- len nové body, takže druhý zápis toho istého pripočíta nulu.
  -- Misie sú počet vyriešených levelov — tie sa neskladajú, drží sa najvyšší.
  insert into public.hall as h (nick, points, missions, dog, at, updated_at)
  values (v_nick, p_points, p_missions, v_dog, current_date, now())
  on conflict (nick) do update set
    points     = h.points + excluded.points,
    missions   = greatest(h.missions, excluded.missions),
    dog        = excluded.dog,   -- posledný zvolený psík platí
    at         = case when excluded.points > 0 then excluded.at else h.at end,
    updated_at = now();

  return query
    select * from public.hall
    order by points desc, at asc
    limit v_hall_size;
end;
$$;

revoke all on function public.submit_score(text, integer, integer, text) from public;
grant execute on function public.submit_score(text, integer, integer, text) to anon, authenticated;

-- ── Údržba ─────────────────────────────────────────────────────────────────
-- Zmazať jednu prezývku:   delete from public.hall where nick = 'PREZYVKA';
-- Vynulovať celý rebríček: truncate public.hall;
