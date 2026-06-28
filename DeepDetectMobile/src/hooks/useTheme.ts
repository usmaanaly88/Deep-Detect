import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { LIGHT_THEME, DARK_THEME, AppTheme } from '../constants/colors';

export const useTheme = (): AppTheme => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  return isDark ? DARK_THEME : LIGHT_THEME;
};
