import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { addToCart } from "../lib/cart";
import { initProducts, listProducts, Product } from "../lib/products";
import bento from "./ui/bento-styles";
import AppButton from "./ui/button";
import { COLORS } from "./ui/theme";

type ProductListProps = {
  showAddToCart?: boolean;
  onCartChange?: () => void;
  categoryFilter?: string;
  cartProductIds?: number[];
};

export default function ProductList({ showAddToCart, onCartChange, categoryFilter, cartProductIds = [] }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    initProducts().then(() => {
      if (mounted) setProducts(listProducts());
    });
    return () => {
      mounted = false;
    };
  }, []);

  const normalize = (s: string) => s.trim().toLowerCase();
  const filteredProducts = categoryFilter
    ? products.filter((product) => normalize(product.category) === normalize(categoryFilter))
    : products;

  if (filteredProducts.length === 0) {
    return <Text style={styles.empty}>No products available for this category.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {filteredProducts.map((p) => {
        const inCart = cartProductIds.includes(p.id);
        return (
          <View key={p.id} style={[bento.card, styles.item]}>
            {p.image ? <Image source={{ uri: p.image }} style={styles.image} resizeMode="cover" /> : null}
            <View style={styles.row}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.price}>₱{p.price.toFixed(2)}</Text>
            </View>
            <View style={styles.rowTop}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{p.category}</Text>
              </View>
              {inCart ? (
                <View style={styles.addedBadge}>
                  <Text style={styles.addedText}>🛒 Added</Text>
                </View>
              ) : null}
            </View>
            {p.description ? <Text style={styles.desc}>{p.description}</Text> : null}
            <Text style={styles.stock}>Stock: {p.stock}</Text>
            {showAddToCart ? (
              <AppButton
                title={p.stock > 0 ? (inCart ? "Add more" : "Add to cart") : "Out of stock"}
                onPress={() => {
                  if (p.stock <= 0) return;
                  addToCart(p);
                  onCartChange?.();
                }}
                disabled={p.stock <= 0}
                variant={p.stock > 0 ? "primary" : "ghost"}
                style={styles.button}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 8,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  item: {
    width: '48%',
    minWidth: 150,
    maxWidth: 240,
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: { fontWeight: '800', fontSize: 15, color: COLORS.primary, flex: 1, marginRight: 8 },
  price: { fontWeight: '700', color: COLORS.danger, fontSize: 13 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eef4ff',
    marginBottom: 8,
  },
  categoryText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  addedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    marginBottom: 8,
  },
  addedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  desc: { color: COLORS.muted, fontSize: 12, marginBottom: 10, lineHeight: 18 },
  stock: { color: COLORS.text, marginBottom: 10, fontSize: 12 },
  button: { width: '100%' },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
});
