import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1f3d8a',
  secondary: '#0f172a',
  surface: '#ffffff',
  background: '#f4f7ff',
  border: '#dfe7f5',
  text: '#101828',
  muted: '#475569',
  danger: '#dc2626',
};

export const globalStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 18,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
