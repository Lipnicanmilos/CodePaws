/* Kódolabky — prepojenie na Supabase pre globálnu Sieň slávy.

   Kým sú údaje prázdne, Sieň slávy funguje lokálne (len toto zariadenie).
   Po vyplnení sa rebríček stane globálnym bez akejkoľvek ďalšej zmeny v hre.
   Postup je v server/README.md.

   POZOR na kľúče: `anon` kľúč je verejný zámerne — je navrhnutý na to, aby bol
   v kóde stránky, a dáta chráni RLS na strane databázy. Kľúč `service_role`
   sem NIKDY nepatrí, ten obchádza všetky pravidlá. */

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

/** Koľko priečok drží Sieň slávy. Rovnaké číslo je aj v SQL funkcii. */
export const HALL_SIZE = 15;
