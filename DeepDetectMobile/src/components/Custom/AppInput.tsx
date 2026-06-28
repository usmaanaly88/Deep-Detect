import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import React from 'react'
import { COLORS } from '../../constants/colors'
import { SHADOWS } from '../../constants/shadows'
import { FONTFAMILY } from '../../constants/fontFamily'
import { hexToRgba } from '../../utils/helpers'

type AppInputProps = TextInputProps & {
  containerStyle?: ViewStyle;
  disabledBackground?: boolean;
  border?: boolean;  
  shadow?: boolean;
}

const AppInput = ({
  containerStyle,
  style,
  editable = true,
  disabledBackground = false,
  border = false,
  shadow = true,
  ...props
}: AppInputProps) => {
  const inputBgColor = disabledBackground ? COLORS.border : COLORS.white;
  const inputTextColor = disabledBackground ? COLORS.textDisabled : COLORS.black;
  const placeholderColor = COLORS.textSecondary;

  return (
    <View style={containerStyle}>
      <TextInput
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor: inputBgColor,
            borderRadius: 28,
            ...(shadow && SHADOWS.medium),
            ...(border && { 
              borderTopWidth: 2, 
              borderLeftWidth: 2, 
              borderTopColor: hexToRgba(COLORS.black, 0.15), 
              borderLeftColor: hexToRgba(COLORS.black, 0.15),
            }),
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...props}
      />
    </View>
  )
}

export default AppInput

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 20,
    paddingVertical:0,
    fontSize: 15,
    fontFamily: FONTFAMILY.GeomLight,
    color: COLORS.black, 
    // marginBottom: 34,
    borderWidth: 0,
    height: 52,
  },
})