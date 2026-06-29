import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle,StyleProp, } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { SHADOWS } from '../../constants/shadows'
import { FONTFAMILY } from '../../constants/fontFamily'
import { useTheme } from '../../hooks/useTheme'

type AppButtonProps = {
  onPress: () => void;
  text: string;
  activeOpacity?: number;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  colors?: string[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  disabled?: boolean;
}


const AppButton = ({
  onPress,
  text,
  activeOpacity = 0.8,
  buttonContainerStyle,
  buttonStyle,
  textStyle,
  colors,
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 0 },
}: AppButtonProps) => {
  const theme = useTheme()
  const resolvedColors = colors || [theme.blueDark, theme.greenAccent]

  return (
    <View style={[styles.buttonShadowContainer, buttonContainerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={styles.buttonTouchable}
      >
        <LinearGradient
          colors={resolvedColors}
          start={startPoint}
          end={endPoint}
          style={[styles.button, buttonStyle]}
        >
          <Text style={[styles.buttonText, { color: theme.white }, textStyle]}>{text}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

export default AppButton

const styles = StyleSheet.create({
  buttonShadowContainer: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 28,
    ...SHADOWS.light,
  },
  buttonTouchable: {
    borderRadius: 28,
  },
  button: {
    height: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily:FONTFAMILY.VivitaMedium,
    fontSize: 18,
  },
})
