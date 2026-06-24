import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from './theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export default function AppButton({ title, onPress, variant = 'primary', disabled, style, textStyle }: ButtonProps) {
  const backgroundColor =
    variant === 'primary'
      ? COLORS.primary
      : variant === 'secondary'
      ? '#eef2ff'
      : variant === 'danger'
      ? COLORS.danger
      : 'transparent';

  const borderColor =
    variant === 'ghost'
      ? '#cbd5e1'
      : variant === 'secondary'
      ? '#cbd5e1'
      : backgroundColor;

  const textColor =
    variant === 'secondary'
      ? COLORS.primary
      : variant === 'ghost'
      ? COLORS.text
      : '#ffffff';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor, borderColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});
