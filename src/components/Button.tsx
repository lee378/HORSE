import React from 'react';
import { View, 
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { View,  Colors, Typography, Layout, BorderRadius, Shadows } from '../constants/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';

  const buttonStyle = [
    styles.button,
    isPrimary ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    isPrimary ? styles.primaryText : styles.secondaryText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.textPrimary : Colors.primaryAccent} />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <View
          
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ButtonContent />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: Layout.primaryButtonHeight,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.buttonPaddingHorizontal,
    minWidth: Layout.minTouchTarget * 3,
  },
  primaryButton: {
    ...Shadows.primaryButton,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.primaryAccent,
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.medium,
  },
  text: {
    ...Typography.h3,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.textPrimary,
  },
  secondaryText: {
    color: Colors.primaryAccent,
  },
  disabledText: {
    color: Colors.textSecondary,
  },
});
