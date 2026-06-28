// ─── Brand / static colours (same in both themes) ─────────────────────────
const BRAND = {
  greenPrimary:  '#9FFFAE',
  greenLight:    '#B2FFBE',
  greenLighter:  '#C5FFCE',
  greenMuted:    '#9CEFB9',
  greenBackground:'#ECFFEF',
  greenAccent:   '#96F6AE',

  bluePrimary:   '#0060A9',
  blueDark:      '#2A7BB6',
  blueMedium:    '#669FCB',
  blueLight:     '#9AC0DC',
  blueSoft:      '#CDDFEE',
  blueBackground:'#F0F5FA',
  blueSurface:   '#E9EEF3',
  bluetext:      '#337FBA',
  blueMuted:     '#0061A9',

  black:         '#000000',
  gray:          '#D3D3D3',
  grayLight:     '#D9D9D9',

  red:           '#DB1C1C',
  lightred:      '#F72A2A',
};

// ─── Light Theme ────────────────────────────────────────────────────────────
export const LIGHT_THEME = {
  ...BRAND,
  // surfaces
  white:         '#FCFCFC',
  whiteSoft:     '#FDFDFD',
  whitePure:     '#FEFEFE',
  whitedark:     '#F9F9F9',
  grayBackground:'#F9F9F9',
  graySurface:   '#E3E3E3',
  // text
  textPrimary:   '#4F4B4C',
  textSecondary: '#7B7879',
  textDisabled:  '#A7A6A6',
  text:          '#B1B1B1',
  textdark:      '#323345',
  // borders
  border:        '#D3D3D3',
  divider:       '#E7E7E7',
  // theme flag
  isDark:        false,
  statusBar:     'dark-content' as const,
};

// ─── Dark Theme ─────────────────────────────────────────────────────────────
export const DARK_THEME = {
  ...BRAND,
  // surfaces
  white:         '#1A1D27',
  whiteSoft:     '#22263A',
  whitePure:     '#0F1117',
  whitedark:     '#252A3F',
  grayBackground:'#1A1D27',
  graySurface:   '#22263A',
  // text
  textPrimary:   '#EDEDED',
  textSecondary: '#9DA3B5',
  textDisabled:  '#565C73',
  text:          '#9DA3B5',
  textdark:      '#EDEDED',
  // borders
  border:        '#2E3348',
  divider:       '#252A3F',
  // overrides that look better in dark
  blueDark:      '#4A9FD6',
  blueSurface:   '#1E2235',
  blueBackground:'#141828',
  blueSoft:      '#1E2840',
  // theme flag
  isDark:        true,
  statusBar:     'light-content' as const,
};

export type AppTheme = typeof LIGHT_THEME;

// ─── Backward-compat alias (always light) ───────────────────────────────────
export const COLORS = LIGHT_THEME;
