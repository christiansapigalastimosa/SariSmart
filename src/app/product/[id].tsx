import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import bento from "../../components/ui/bento-styles";
import AppButton from "../../components/ui/button";
import { COLORS } from "../../components/ui/theme";
import { addToCart } from "../../lib/cart";
import { initProducts, listProducts, Product } from "../../lib/products";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    let mounted = true;
    initProducts().then(() => {
      if (!mounted) return;
      const products = listProducts();
      const found = products.find((p) => p.id === parseInt(id as string));
      if (found) {
        setProduct(found);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product);
      setInCart(true);
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const hasOffer = typeof product.discount === 'number' && product.discount > 0;
  const discountedPrice = hasOffer ? product.price * (1 - product.discount! / 100) : product.price;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={[bento.card, styles.imageCard]}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image-not-supported" size={60} color={COLORS.muted} />
          </View>
        )}
      </View>

      <View style={[bento.card, styles.detailsCard]}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.priceBlock}>
              {hasOffer ? (
                <Text style={styles.oldPrice}>₱{product.price.toFixed(2)}</Text>
              ) : null}
              <Text style={[styles.price, hasOffer && styles.discountedPrice]}>₱{discountedPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        {hasOffer ? (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>Special offer {product.discount}% off</Text>
          </View>
        ) : null}

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <Text
            style={[
              styles.stock,
              product.stock > 0 ? styles.stockAvailable : styles.stockUnavailable,
            ]}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Text>
        </View>

        {product.stock > 0 && (
          <AppButton
            title={inCart ? "Added to cart ✓" : "Add to cart"}
            onPress={handleAddToCart}
            style={styles.addButton}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 28,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  imageCard: {
    width: "100%",
    maxWidth: 640,
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
  },
  detailsCard: {
    width: "100%",
    maxWidth: 640,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleSection: {
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.danger,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eef4ff",
    marginBottom: 20,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  oldPrice: {
    fontSize: 14,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: '#dc2626',
  },
  offerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
    marginBottom: 20,
  },
  offerText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 22,
  },
  stock: {
    fontSize: 14,
    fontWeight: "600",
  },
  stockAvailable: {
    color: "#10B981",
  },
  stockUnavailable: {
    color: COLORS.danger,
  },
  addButton: {
    marginTop: 12,
  },
  loading: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 40,
  },
});
