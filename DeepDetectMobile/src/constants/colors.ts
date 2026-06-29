// ─── Brand / static colours (same in both themes) ─────────────────────────
const BRAND = {
  greenPrimary:  '#00FF87', // Hyper-Mint Acid Green
  greenLight:    '#39FF14', // Luminous Lime
  greenLighter:  '#A7F3D0',
  greenMuted:    '#10B981',
  greenBackground:'rgba(0, 255, 135, 0.08)',
  greenAccent:   '#00FF87',

  bluePrimary:   '#6366F1', // Electric Indigo
  blueDark:      '#4F46E5', // Deep Synthwave Purple-Blue
  blueMedium:    '#00F0FF', // Cyber Cyan
  blueLight:     '#22D3EE',
  blueSoft:      'rgba(99, 102, 241, 0.15)', // Neon Tinted Indigo Overlay
  blueSurface:   'rgba(0, 240, 255, 0.08)',  // Cyber Cyan Ambient Surface
  blueBackground:'#030712',                  // Abyssal Space Black
  bluetext:      '#00F0FF',
  blueMuted:     '#6366F1',

  black:         '#030712', // Space Void Black
  gray:          '#64748B',
  grayLight:     '#CBD5E1',

  red:           '#FF0055', // Neon Rose Magenta Warning
  lightred:      '#FF4F81',
};

// ─── Light Theme ────────────────────────────────────────────────────────────
export const LIGHT_THEME = {
  ...BRAND,
  white:         '#F8FAFC',
  whiteSoft:     '#FFFFFF',
  whitePure:     '#FFFFFF',
  whitedark:     '#F1F5F9',
  grayBackground:'#F8FAFC',
  graySurface:   '#F1F5F9',
  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textDisabled:  '#94A3B8',
  text:          '#475569',
  textdark:      '#0F172A',
  border:        '#E2E8F0',
  divider:       '#F1F5F9',
  isDark:        false,
  statusBar:     'dark-content' as const,
};

// ─── Dark Theme ─────────────────────────────────────────────────────────────
export const DARK_THEME = {
  ...BRAND,
  white:         '#030712', // Abyssal Space Black
  whiteSoft:     '#0B0F19', // Cyber Slate Card Background
  whitePure:     '#02040A', // Void Core Black
  whitedark:     '#131B31', // Nebula Deep Blue
  grayBackground:'#030712',
  graySurface:   '#0D1326', // Premium card borders & headers

  // High Contrast Text
  textPrimary:   '#FFFFFF', // Clinical White
  textSecondary: '#94A3B8', // Muted Slate Silver
  textDisabled:  '#334155', // Darkened Steel Grey
  text:          '#94A3B8',
  textdark:      '#FFFFFF',

  // Tech Glassmorphic Borders
  border:        'rgba(99, 102, 241, 0.2)', // Semi-transparent Indigo Border
  divider:       'rgba(0, 240, 255, 0.1)',  // Semi-transparent Cyan Divider

  // Overrides for vibrant dark interface
  blueDark:      '#6366F1', // Shift toward luminous Electric Indigo
  blueSurface:   '#0E1428', // Glowing core
  blueBackground:'#030712',
  blueSoft:      'rgba(99, 102, 241, 0.25)',

  isDark:        true,
  statusBar:     'light-content' as const,
};

export type AppTheme = typeof LIGHT_THEME;
export const COLORS = DARK_THEME; // Default fallbacks use dark theme directly
