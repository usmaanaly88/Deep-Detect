import { ViewStyle } from 'react-native';
import { COLORS } from './colors';

type ShadowStyle = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

export const SHADOWS: Record<string, ShadowStyle> = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  darkwhite: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },
  strong: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
};
