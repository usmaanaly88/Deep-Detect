import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import React from 'react'
import { SHADOWS } from '../../constants/shadows'
import { FONTFAMILY } from '../../constants/fontFamily'
import { hexToRgba } from '../../utils/helpers'
import { useTheme } from '../../hooks/useTheme'

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
  const theme = useTheme();
  const inputBgColor = disabledBackground ? theme.border : theme.whiteSoft;
  const inputTextColor = disabledBackground ? theme.textDisabled : theme.textPrimary;
  const placeholderColor = theme.textSecondary;

  return (
    <View style={containerStyle}>
      <TextInput
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor: inputBgColor,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: theme.border,
            color: inputTextColor,
            ...(shadow && SHADOWS.medium),
            ...(border && { 
              borderTopWidth: 2, 
              borderLeftWidth: 2, 
              borderTopColor: hexToRgba(theme.textPrimary, 0.15), 
              borderLeftColor: hexToRgba(theme.textPrimary, 0.15),
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
    borderWidth: 0,
    height: 52,
  },
})