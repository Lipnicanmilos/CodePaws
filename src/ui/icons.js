/* Kódolabky — ikony ako inline SVG.
   Žiadne emoji v hernom UI: vyzerá na každom systéme inak a nedá sa mu
   nastaviť farba ani veľkosť. */

const stroke = (inner, rot = 0) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        style="transform: rotate(${rot}deg)">${inner}</svg>`;

const solid = (inner) =>
  `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  arrow: (rot = 0) => stroke('<path d="M12 20V5"/><path d="M5.5 11.5 12 5l6.5 6.5"/>', rot),

  turnRight: () => stroke('<path d="M11 20v-9a4 4 0 0 1 4-4h5"/><path d="m16 3 4 4-4 4"/>'),
  turnLeft:  () => stroke('<path d="M13 20v-9a4 4 0 0 0-4-4H4"/><path d="M8 3 4 7l4 4"/>'),

  drop: () => solid('<path d="M12 3.2c3.7 4.2 6.2 7.2 6.2 10.1a6.2 6.2 0 0 1-12.4 0C5.8 10.4 8.3 7.4 12 3.2z"/>'),

  bone: () => solid(
    '<rect x="7" y="10" width="10" height="4" rx="2"/>' +
    '<circle cx="6.3" cy="9.7" r="2.7"/><circle cx="6.3" cy="14.3" r="2.7"/>' +
    '<circle cx="17.7" cy="9.7" r="2.7"/><circle cx="17.7" cy="14.3" r="2.7"/>'
  ),

  fire: () => solid(
    '<path d="M13 2.2c.7 2.6 1.6 4.3 2.7 5.7 1.4 1.8 2.6 3.3 2.6 6A6.3 6.3 0 0 1 5.7 14c0-2.1 1-3.6 2-5 .3.9.9 1.5 1.7 1.8-.6-3.4.9-6.7 3.6-8.6z"/>'
  ),

  /** Záchranárska búdka — cieľ misie. */
  house: () =>
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2.8 21.4 11v9.4a.6.6 0 0 1-.6.6H3.2a.6.6 0 0 1-.6-.6V11z" fill="currentColor"/>' +
      '<path d="M8.6 21v-5.1a3.4 3.4 0 0 1 6.8 0V21z" fill="rgba(255,255,255,.82)"/>' +
      '<circle cx="12" cy="8.4" r="1.5" fill="rgba(255,255,255,.6)"/>' +
    '</svg>',
};

/** Šteniatko zhora, otočené na sever. Chvost je vlastná skupina — máva sám. */
export function dogSvg({ coat, ears, muzzle, vest, badge }) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <g class="dog-tail">
      <path d="M12 19.6c.15 1.9.85 3.1 2.2 3.8" fill="none" stroke="${ears}"
            stroke-width="2" stroke-linecap="round"/>
    </g>

    <ellipse cx="7.2" cy="18.4" rx="1.7" ry="2.2" fill="${ears}" transform="rotate(-14 7.2 18.4)"/>
    <ellipse cx="16.8" cy="18.4" rx="1.7" ry="2.2" fill="${ears}" transform="rotate(14 16.8 18.4)"/>

    <ellipse cx="12" cy="15.6" rx="5.6" ry="5.9" fill="${coat}"/>

    <path d="M6.6 14.3h10.8v2.6a1.6 1.6 0 0 1-1.6 1.6H8.2a1.6 1.6 0 0 1-1.6-1.6z" fill="${vest}"/>
    <circle cx="12" cy="16.1" r="1.25" fill="${badge}"/>

    <ellipse cx="7.1" cy="12" rx="1.8" ry="2.1" fill="${ears}" transform="rotate(-20 7.1 12)"/>
    <ellipse cx="16.9" cy="12" rx="1.8" ry="2.1" fill="${ears}" transform="rotate(20 16.9 12)"/>

    <ellipse cx="6.4" cy="8.3" rx="2.1" ry="3.1" fill="${ears}" transform="rotate(-20 6.4 8.3)"/>
    <ellipse cx="17.6" cy="8.3" rx="2.1" ry="3.1" fill="${ears}" transform="rotate(20 17.6 8.3)"/>

    <circle cx="12" cy="9" r="5" fill="${coat}"/>
    <ellipse cx="12" cy="5.7" rx="2.5" ry="2.2" fill="${muzzle}"/>
    <ellipse cx="12" cy="4.8" rx="1.05" ry=".85" fill="#241608"/>

    <circle cx="9.8" cy="8.7" r="1.05" fill="#241608"/>
    <circle cx="14.2" cy="8.7" r="1.05" fill="#241608"/>
    <circle cx="10.15" cy="8.35" r=".36" fill="#fff"/>
    <circle cx="14.55" cy="8.35" r=".36" fill="#fff"/>
  </svg>`;
}

/* Šesť šteniatok — každé má vlastnú farbu srsti a vestu vo farbe svojho
   povolania. Fifo je hasič, preto siréna; Bit technik, preto oceľ. */
export const CHARACTERS = {
  fifo: { name: 'Fifo', coat: '#f3ce8e', ears: '#c9924a', muzzle: '#fdf0da', vest: '#f04e37', badge: '#ffd98a' },
  bit:  { name: 'Bit',  coat: '#dcd6cb', ears: '#8f867a', muzzle: '#f7f4ee', vest: '#5fc9e8', badge: '#0d3b49' },
  ajka: { name: 'Ajka', coat: '#3b342e', ears: '#231e1a', muzzle: '#e8dccb', vest: '#ffb01f', badge: '#4a2f00' },
  luna: { name: 'Luna', coat: '#d3e2ea', ears: '#82a0b0', muzzle: '#f4fafd', vest: '#3f6fb5', badge: '#dbe9f5' },
  rex:  { name: 'Rex',  coat: '#cf9260', ears: '#8d5730', muzzle: '#f7e6d2', vest: '#34c79a', badge: '#0b3b2c' },
  cent: { name: 'Cent', coat: '#b07a44', ears: '#71481f', muzzle: '#f3e0c6', vest: '#9b6fc4', badge: '#f0e4fa' },
};
