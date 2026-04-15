import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';

export interface CustomTextProps extends RNTextProps {
  weight?: '400' | '500' | '600' | '700' | 'bold' | 'normal';
}

export const CustomText = React.forwardRef<RNText, CustomTextProps>(
  ({ style, weight, ...props }, ref) => {
    let fontFamily = 'Inter_400Regular';

    // Flatten style to inspect any fontWeight passed
    const flattenedStyle = (StyleSheet.flatten(style) || {}) as TextStyle;
    const finalWeight = weight || flattenedStyle.fontWeight;

    if (finalWeight === '500') fontFamily = 'Inter_500Medium';
    else if (finalWeight === '600') fontFamily = 'Inter_600SemiBold';
    else if (finalWeight === '700' || finalWeight === 'bold') fontFamily = 'Inter_700Bold';

    // We strip fontWeight from the final style because on Android, setting both 
    // a custom custom font family and a font weight can sometimes fall back to the default system font.
    const customStyle: TextStyle = { fontFamily };
    if (finalWeight) {
      customStyle.fontWeight = undefined; 
    }

    return (
      <RNText
        ref={ref}
        {...props}
        style={[customStyle, style, finalWeight ? { fontWeight: undefined } : undefined]}
      />
    );
  }
);

CustomText.displayName = 'CustomText';
