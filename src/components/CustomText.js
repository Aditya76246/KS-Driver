import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fontFamilies } from '../styles/fonts';

const CustomText = ({ children, style, numberOfLines, ...props }) => {
  return (
    <Text
      style={style}
      allowFontScaling={false}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;
