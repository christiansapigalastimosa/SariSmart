import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import CategoryBoxes from "../components/category-boxes";
import ProductList from "../components/product-list";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { addToCart, cartCount, initCart, listCart, subscribeCartChange } from "../lib/cart";
import { initProducts, listProducts, Product } from "../lib/products";
import { useRequireRole } from "../lib/session";

export default function Customer() {
  const router = useRouter();
  const authorized = useRequireRole("customer");
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [cartProductIds, setCartProductIds] = useState<number[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = useRef(true);

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

  useEffect(() => {
    let mounted = true;

    initProducts().then(() => {
      if (!mounted) return;
      setComboProducts(listProducts().filter((product) => product.category.toLowerCase() === 'combo'));
    });

    return () => {
      mounted = false;
    };
  }, []);

  function doRefreshCart() {
    if (!isMountedRef.current) return;
    setCartProductIds(listCart().map((item) => item.productId));
    setCartItemCount(cartCount());
  }

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Ensure mounted ref is set to true while component is mounted
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCartChange(() => {
      if (isMountedRef.current) {
        doRefreshCart();
      }
    });
    return unsubscribe;
  }, []);

  // Auto-refresh cart every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        doRefreshCart();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  const onRefresh = async () => {
    if (!isMountedRef.current) return;
    setIsRefreshing(true);
    try {
      await initCart();
      await initProducts();
      if (isMountedRef.current) {
        setCartProductIds(listCart().map((item) => item.productId));
        setCartItemCount(cartCount());
        setComboProducts(listProducts().filter((product) => product.category.toLowerCase() === 'combo'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  };


  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
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
          <View style={[styles.infoBox, styles.cartBox, compact && styles.infoBoxCompact]}>
            <Text style={styles.infoLabel}>Your cart</Text>
            <Text style={styles.cartLink}>{cartItemCount} items</Text>
            <AppButton title="Open cart" variant="secondary" onPress={() => router.push('/cart')} style={styles.openCartButton} />
          </View>
        </View>
      </View>

      <View style={[bento.card, styles.sectionCard]}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
              <MaterialIcons name="close" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {!searchTerm && (
        <View style={[bento.card, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Choose a category</Text>
          <CategoryBoxes selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          <View style={styles.comboSection}>
            <View style={styles.comboHeader}>
              <Text style={styles.sectionTitle}>Combo Deals</Text>
              <Text style={styles.sectionMeta}>Swipe sideways to browse featured combos.</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.comboScrollContent}
            >
              {comboProducts.length === 0 ? (
                <View style={styles.comboEmpty}>
                  <Text style={styles.emptyText}>No combo items available yet.</Text>
                </View>
              ) : (
                comboProducts.map((product) => (
                  <View 
                    key={product.id} 
                    style={styles.comboCard}
                  >
                    <TouchableOpacity
                      onPress={() => router.push(`/product/${product.id}`)}
                      activeOpacity={0.8}
                      style={styles.comboClickableArea}
                    >
                      {product.image ? (
                        <Image source={{ uri: product.image }} style={styles.comboImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.comboImagePlaceholder}>
                          <MaterialIcons name="image" size={28} color={COLORS.muted} />
                        </View>
                      )}
                      <Text style={styles.comboName}>{product.name}</Text>
                      <Text style={styles.comboPrice}>₱{product.price.toFixed(2)}</Text>
                      <Text style={styles.comboDesc} numberOfLines={3}>
                        {product.description}
                      </Text>
                    </TouchableOpacity>
                    <AppButton
                      title={product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                      onPress={async () => {
                        if (product.stock > 0) {
                          await addToCart(product);
                          doRefreshCart();
                        }
                      }}
                      disabled={product.stock <= 0}
                      style={styles.comboButton}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}

      <View style={[bento.card, styles.sectionCard, styles.productSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchTerm
              ? `Search results for "${searchTerm}"`
              : selectedCategory === 'All Products'
              ? 'All Products'
              : `${selectedCategory} Products`}
          </Text>
          <Text style={styles.sectionMeta}>
            {searchTerm
              ? 'Found matching products'
              : selectedCategory === 'All Products'
              ? 'Showing all available items'
              : `Showing ${selectedCategory.toLowerCase()} items`}
          </Text>
        </View>
        <ProductList
          showAddToCart
          searchTerm={searchTerm}
          categoryFilter={searchTerm ? undefined : selectedCategory === 'All Products' ? undefined : selectedCategory}
          cartProductIds={cartProductIds}
          onCartChange={doRefreshCart}
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
  infoBox: { flex: 1, minWidth: 150, borderRadius: 22, padding: 16, backgroundColor: '#f8fafc', borderWidth: 0, shadowColor: COLORS.secondary, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  cartBox: { backgroundColor: '#eff6ff', borderColor: '#dbeafe' },
  infoLabel: { color: COLORS.muted, marginBottom: 6, fontSize: 13 },
  infoValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  cartLink: { color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  openCartButton: { width: '100%', marginTop: 6 },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  clearButton: {
    padding: 6,
  },
  comboSection: {
    marginTop: 16,
  },
  comboHeader: {
    marginBottom: 12,
  },
  comboScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  comboCard: {
    width: 220,
    minHeight: 190,
    marginRight: 12,
    borderRadius: 22,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  comboName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: COLORS.text,
  },
  comboPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  comboDesc: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  comboImage: {
    width: '100%',
    height: 110,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#eef2ff',
  },
  comboImagePlaceholder: {
    width: '100%',
    height: 110,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  comboButton: {
    marginTop: 'auto',
    width: '100%',
  },
  comboEmpty: {
    width: 220,
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  comboClickableArea: {
    flex: 1,
  },
});
