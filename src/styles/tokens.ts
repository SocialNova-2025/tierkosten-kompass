/**
 * Design tokens – TierKosten Kompass
 *
 * Single source of truth. Used in both CSS (global.css) and inline styles.
 * All inline button styles use these values directly so the host stylesheet
 * cannot override them (inline > class specificity).
 */
export const T = {
  // Surfaces
  bg:      '#F3F7F7',
  surface: '#FFFFFF',

  // Brand
  primary: '#0A7A73',
  pLight:  '#E4F1F0',
  pMid:    '#B0D4D0',

  // Text
  text:    '#0F1F1F',
  muted:   '#5C7474',

  // Borders
  border:  '#D6E4E4',

  // Status – functional only, never decorative
  green:       '#1A7A38',
  greenLight:  '#EBF5EE',
  greenBorder: '#1A7A38',

  amber:       '#8A6000',
  amberLight:  '#FEF3CD',
  amberBorder: '#C9970A',

  red:         '#B91C1C',
  redLight:    '#FEF0F0',
  redBorder:   '#B91C1C',
} as const

/** Inline style strings for buttons – immune to host stylesheet overrides */
export const BTN = {
  primary:
    'width:100%;height:56px;padding:0 20px;border-radius:14px;border:none;' +
    `background:${T.primary};color:#fff;font-size:15px;font-weight:700;` +
    'letter-spacing:-.02em;cursor:pointer;font-family:inherit;' +
    'display:flex;align-items:center;justify-content:center;',

  primaryDisabled:
    'width:100%;height:56px;padding:0 20px;border-radius:14px;border:none;' +
    `background:${T.pMid};color:#fff;font-size:15px;font-weight:700;` +
    'cursor:not-allowed;font-family:inherit;' +
    'display:flex;align-items:center;justify-content:center;opacity:.7;',

  outline:
    'width:100%;height:50px;padding:0 20px;border-radius:14px;' +
    `border:1.5px solid ${T.primary};background:transparent;color:${T.primary};` +
    'font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;' +
    'display:flex;align-items:center;justify-content:center;',

  ghost:
    'width:100%;padding:10px;border:none;background:transparent;' +
    `color:${T.muted};font-size:13px;cursor:pointer;font-family:inherit;` +
    'text-decoration:underline;display:flex;align-items:center;justify-content:center;',

  /** Subordinate text link – used for secondary CTAs on P1 */
  textLink:
    'width:100%;padding:9px;border:none;background:transparent;' +
    `color:${T.muted};font-size:13px;font-weight:400;` +
    'cursor:pointer;font-family:inherit;text-align:center;text-decoration:underline;',
} as const
