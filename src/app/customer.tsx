import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import CategoryBoxes from "../components/category-boxes";
import ProductList from "../components/product-list";
import bento from "../components/ui/bento-styles";
import { COLORS } from "../components/ui/theme";
import { cartCount, initCart, listCart } from "../lib/cart";
import { useRequireRole } from "../lib/session";

export default function Customer() {
  const router = useRouter();
  const authorized = useRequireRole("customer");
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [cartProductIds, setCartProductIds] = useState<number[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    initCart().then(() => {
      if (!mounted) return;
      setCartProductIds(listCart().map((item) => item.productId));
      setCartItemCount(cartCount());
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  const refreshCart = () => {
    setCartProductIds(listCart().map((item) => item.productId));
    setCartItemCount(cartCount());
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[bento.card, styles.heroCard, compact && styles.heroCardCompact]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="shopping-bag" size={28} color={COLORS.primary} />
          <Text style={[styles.title, compact && styles.titleCompact]}>Customer Area</Text>
        </View>
        <Text style={[styles.sectionDescription, compact && styles.sectionDescriptionCompact]}>Browse cafeteria favorites, add items to your cart, and checkout quickly from any device.</Text>
        <View style={[styles.heroInfoRow, compact && styles.heroInfoRowCompact]}>
          <View style={[styles.infoBox, compact && styles.infoBoxCompact]}>
            <Text style={styles.infoLabel}>Cart items</Text>
            <Text style={[styles.infoValue, compact && styles.infoValueCompact]}>{cartItemCount}</Text>
          </View>
          <TouchableOpacity style={[styles.infoBox, styles.cartBox, compact && styles.infoBoxCompact]} onPress={() => router.push('/cart')}>
            <Text style={styles.infoLabel}>Your cart</Text>
            <Text style={styles.cartLink}>View cart now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[bento.card, styles.sectionCard]}>
        <Text style={styles.sectionTitle}>Choose a category</Text>
        <CategoryBoxes selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      </View>

      <View style={[bento.card, styles.sectionCard, styles.productSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{selectedCategory === 'All Products' ? 'All Products' : `${selectedCategory} Products`}</Text>
          <Text style={styles.sectionMeta}>
            {selectedCategory === 'All Products'
              ? 'Showing all available items'
              : `Showing ${selectedCategory.toLowerCase()} items`}
          </Text>
        </View>
        <ProductList
          showAddToCart
          categoryFilter={selectedCategory === 'All Products' ? undefined : selectedCategory}
          cartProductIds={cartProductIds}
          onCartChange={refreshCart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: {
    padding: 18,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 28,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    marginBottom: 18,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4, color: COLORS.primary },
  sectionDescription: { fontSize: 15, color: COLORS.muted, lineHeight: 22, marginBottom: 18 },
  heroInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoBox: { flex: 1, minWidth: 150, borderRadius: 20, padding: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: COLORS.border },
  cartBox: { backgroundColor: '#eef6ff', borderColor: '#cde7ff' },
  infoLabel: { color: COLORS.muted, marginBottom: 6, fontSize: 13 },
  infoValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  sectionCard: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 18,
  },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, color: COLORS.text },
  sectionMeta: { color: COLORS.muted, fontSize: 14 },
  cartLink: { color: COLORS.primary, fontSize: 15, fontWeight: '700', marginTop: 8 },
  productSection: { paddingBottom: 0 },
  /* Compact variants for small screens */
  heroCardCompact: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  titleCompact: { fontSize: 20 },
  sectionDescriptionCompact: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  heroInfoRowCompact: { gap: 8 },
  infoBoxCompact: { padding: 10, minWidth: 110, borderRadius: 12 },
  infoValueCompact: { fontSize: 20 },
});
