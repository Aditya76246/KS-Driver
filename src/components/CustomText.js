import React from 'react';
import { Text } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const CustomText = ({ children, style, numberOfLines, ...props }) => {
  const { t } = useLanguage();

  const translateChild = (child) => {
    if (typeof child === 'string') return t(child);
    if (Array.isArray(child)) return child.map(translateChild);
    return child;
  };

  return (
    <Text
      style={style}
      allowFontScaling={false}
      numberOfLines={numberOfLines}
      {...props}
    >
      {translateChild(children)}
    </Text>
  );
};

export default CustomText;
