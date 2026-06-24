import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { CartItem, cartTotal, initCart, listCart, removeFromCart, updateCartItemQuantity } from "../lib/cart";
import { useRequireRole } from "../lib/session";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [draftQuantity, setDraftQuantity] = useState(1);
  const router = useRouter();
  const authorized = useRequireRole("customer");

  useEffect(() => {
    let mounted = true;
    initCart().then(() => {
      if (mounted) setItems(listCart());
    });
    return () => {
      mounted = false;
    };
  }, []);

  function refresh() {
    setItems(listCart());
  }

  useEffect(() => {
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  function handleRemove(productId: number) {
    removeFromCart(productId);
    if (editingProductId === productId) {
      setEditingProductId(null);
    }
    refresh();
  }

  function startEdit(item: CartItem) {
    setEditingProductId(item.productId);
    setDraftQuantity(item.quantity);
  }

  function saveEdit(productId: number) {
    updateCartItemQuantity(productId, draftQuantity);
    setEditingProductId(null);
    refresh();
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
            <FlatList
              data={[]}
              keyExtractor={() => "empty"}
              renderItem={() => null}
              ListHeaderComponent={() => (
                <View style={[bento.card, styles.heroCard]}>
                  <Text style={styles.title}>Cart</Text>
                  <Text style={styles.sectionDescription}>Your cart is empty. Browse products and add items to checkout.</Text>
                </View>
              )}
              contentContainerStyle={styles.flatContentContainer}
              numColumns={1}
              ListFooterComponent={() => null}
            />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
          data={items}
          keyExtractor={(item) => item.productId.toString()}
          contentContainerStyle={styles.flatContentContainer}
          numColumns={1}
          ListHeaderComponent={() => (
          <View>
              <View style={styles.titleRow}>
                <MaterialIcons name="shopping-cart" size={28} color={COLORS.primary} />
                <Text style={styles.title}>Cart</Text>
              </View>
              <Text style={styles.sectionDescription}>Review your items and update quantities before checkout.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[bento.card, styles.item]}>
            <View style={styles.itemHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₱{item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.meta}>Category: {item.category}</Text>
            <Text style={styles.meta}>Qty: {item.quantity}</Text>
            <Text style={styles.subtotal}>Subtotal: ₱{(item.quantity * item.price).toFixed(2)}</Text>
            {editingProductId === item.productId ? (
              <View style={styles.editSection}>
                <View style={styles.qtyControls}>
                  <AppButton
                    title="-"
                    onPress={() => setDraftQuantity(Math.max(1, draftQuantity - 1))}
                    variant="secondary"
                    style={styles.qtyButton}
                  />
                  <Text style={styles.qtyLabel}>{draftQuantity}</Text>
                  <AppButton
                    title="+"
                    onPress={() => setDraftQuantity(Math.min(item.stock, draftQuantity + 1))}
                    variant="secondary"
                    style={styles.qtyButton}
                  />
                </View>
                <View style={styles.editActions}>
                  <AppButton title="Save" onPress={() => saveEdit(item.productId)} style={styles.itemButton} />
                  <AppButton title="Cancel" onPress={() => setEditingProductId(null)} variant="ghost" style={styles.itemButton} />
                </View>
              </View>
            ) : (
              <View style={styles.itemActions}>
                <AppButton title="Edit" onPress={() => startEdit(item)} variant="secondary" style={[styles.itemButton, styles.smallButton]} />
                <AppButton title="Delete" onPress={() => handleRemove(item.productId)} variant="danger" style={[styles.itemButton, styles.smallButton]} />
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={styles.total}>Total: ₱{cartTotal().toFixed(2)}</Text>
            <AppButton title="Checkout" onPress={handleCheckout} style={styles.checkoutButton} />
            <AppButton title="Select more" onPress={() => router.push("/customer")} variant="secondary" style={styles.selectMoreButton} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: {
    padding: 18,
    paddingBottom: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flatContentContainer: {
    padding: 18,
    paddingBottom: 28,
  },
  heroCard: {
    width: "100%",
    maxWidth: 640,
    alignSelf: 'center',
    borderRadius: 24,
    padding: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  subtitle: { color: COLORS.muted, lineHeight: 22, marginBottom: 10 },
  sectionDescription: { color: COLORS.muted, marginBottom: 14, lineHeight: 20 },
  item: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    marginBottom: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  name: { fontWeight: "700", color: COLORS.text },
  price: { fontWeight: "700", color: COLORS.secondary },
  meta: { color: COLORS.muted, marginBottom: 4 },
  subtotal: { color: COLORS.text, fontWeight: "600", marginBottom: 10 },
  itemButton: { marginTop: 8 },
  smallButton: { flex: 1 },
  itemActions: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
  editSection: { marginTop: 12 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  qtyButton: { width: 46, paddingHorizontal: 0 },
  qtyLabel: { color: COLORS.text, fontWeight: "700", fontSize: 16, minWidth: 24, textAlign: "center" },
  editActions: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  footer: { marginTop: 12, width: "100%", maxWidth: 640, alignSelf: 'center' },
  total: { fontWeight: "700", fontSize: 18, marginBottom: 12, color: COLORS.text },
  checkoutButton: { width: "100%", marginBottom: 12 },
  selectMoreButton: { width: "100%" },
});
