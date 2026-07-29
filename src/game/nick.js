/* Kódolabky — prezývka hráča.

   Prezývka je jediné, čo o dieťati ukladáme, a zámerne to nemá byť meno:
   krátka, veľkými písmenami, bez interpunkcie a bez zjavných vulgarizmov.
   Tá istá prezývka slúži lokálne (postup na tomto zariadení) aj v rebríčku,
   preto pravidlá žijú tu a nie v jednom z tých dvoch modulov. */

const BLOCKED = [
  'kokot', 'kurva', 'piced', 'picus', 'jebo', 'jebn', 'sral', 'sracka', 'hovno',
  'debil', 'idiot', 'kretén', 'kreten', 'mrdk', 'mrda', 'buzer', 'cigan',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'nigg', 'rape', 'nazi', 'hitler',
];

export const MAX_NICK = 10;

export function cleanNick(text) {
  return (text ?? '')
    .toLocaleUpperCase('sk-SK')
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NICK);
}

/** Vráti dôvod, prečo prezývka neprejde, alebo null keď je v poriadku. */
export function nickProblem(text) {
  const nick = cleanNick(text);
  if (nick.length < 2) return 'Prezývka musí mať aspoň dve písmená.';
  const flat = nick.toLocaleLowerCase('sk-SK').replace(/[^a-z0-9]/g, '');
  if (BLOCKED.some((bad) => flat.includes(bad))) return 'Takúto prezývku sem nedáme. Skús inú.';
  return null;
}
