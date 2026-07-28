/* Kódolabky — prepojenie na Supabase pre globálny Rebríček.

   Kým sú údaje prázdne, rebríček funguje lokálne (len toto zariadenie).
   Po vyplnení sa rebríček stane globálnym bez akejkoľvek ďalšej zmeny v hre.
   Postup je v server/README.md.

   POZOR na kľúče. Supabase ich premenoval, v konzole môžeš vidieť oba názvy:

     publishable (`sb_publishable_…`), staršie `anon`
        → verejný ZÁMERNE, patrí do kódu stránky, dáta chráni RLS v databáze

     secret (`sb_secret_…`), staršie `service_role`
        → obchádza všetky pravidlá RLS. Sem NIKDY nepatrí a nikdy sa necommituje. */

export const SUPABASE_URL = 'https://mdpfxmsovlccdaftfbkz.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_fk9gJExKzqI6rMaDJhrBMQ_ezR6dxrF';

/** Koľko priečok drží rebríček. Rovnaké číslo je aj v SQL funkcii. */
export const HALL_SIZE = 15;
