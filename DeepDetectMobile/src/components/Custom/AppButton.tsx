import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle,StyleProp, } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { COLORS } from '../../constants/colors'
import { SHADOWS } from '../../constants/shadows'
import { FONTFAMILY } from '../../constants/fontFamily'

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
  colors = [COLORS.blueDark, COLORS.greenAccent],
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 0 },
}: AppButtonProps) => {
  return (
    <View style={[styles.buttonShadowContainer, buttonContainerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={styles.buttonTouchable}
      >
        <LinearGradient
          colors={colors}
          start={startPoint}
          end={endPoint}
          style={[styles.button, buttonStyle]}
        >
          <Text style={[styles.buttonText, textStyle]}>{text}</Text>
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
    color: COLORS.white,
  },
})
