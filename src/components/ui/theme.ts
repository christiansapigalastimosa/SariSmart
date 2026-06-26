import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#0f172a',
  surface: '#ffffff',
  white: '#ffffff',
  background: '#eef3ff',
  border: '#dbeafe',
  text: '#0f172a',
  muted: '#475569',
  danger: '#ef4444',
  success: '#16a34a',
  accent: '#7c3aed',
};

export const globalStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 18,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 0,
    padding: 22,
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 6,
  },
});
