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
      ? '#eff6ff'
      : variant === 'danger'
      ? COLORS.danger
      : 'transparent';

  const borderColor =
    variant === 'ghost'
      ? '#cbd5e1'
      : variant === 'secondary'
      ? 'transparent'
      : backgroundColor;

  const textColor =
    variant === 'secondary'
      ? COLORS.primary
      : variant === 'ghost'
      ? COLORS.text
      : '#ffffff';

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor, borderColor, opacity: disabled ? 0.64 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});
