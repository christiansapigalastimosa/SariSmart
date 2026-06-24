import { StyleSheet } from 'react-native';
import { COLORS } from './theme';

export default StyleSheet.create({
  contentContainer: {
    padding: 18,
    paddingBottom: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  card: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 0,
    marginBottom: 18,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 } as any,
    elevation: 4,
  },
});
