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
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 0,
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 } as any,
    elevation: 5,
  },
});
