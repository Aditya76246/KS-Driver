import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const CustomText = ({ children, style, numberOfLines, ...props }) => {
  const { i18n } = useTranslation();
  const textMap = i18n.getResourceBundle(i18n.language)?.text || {};

  const translateChild = (child) => {
    if (typeof child === 'string') {
      return textMap[child] || child;
    }

    if (Array.isArray(child)) {
      return child.map(translateChild);
    }

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
