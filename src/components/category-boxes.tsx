import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from './ui/theme';

const CATEGORY_GROUPS = ['All Products', 'Drinks', 'Snacks', 'Meal'];

type CategoryBoxesProps = {
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
};

export default function CategoryBoxes({ selectedCategory, onSelectCategory }: CategoryBoxesProps) {
  return (
    <View style={styles.grid}>
      {CATEGORY_GROUPS.map((category) => {
        const active = selectedCategory === category;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.8}
          >
            <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{category}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    flexBasis: '48%',
    minWidth: 130,
    maxWidth: 220,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  cardTitleActive: {
    color: '#fff',
  },
});
