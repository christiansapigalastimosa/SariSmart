import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import ConfirmDialog from "../components/ui/confirm-dialog";
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

  const cartProductIds = items.map((item) => item.productId);

  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  function closeConfirm() {
    setConfirmState(null);
  }

  useEffect(() => {
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  function confirmRemove(productId: number) {
    setConfirmState({
      title: 'Remove item',
      message: 'Do you want to remove this item from your cart? This action cannot be undone.',
      confirmLabel: 'Remove',
      onConfirm: () => {
        removeFromCart(productId);
        if (editingProductId === productId) {
          setEditingProductId(null);
        }
        refresh();
      },
    });
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
        <View style={styles.emptyContainer}>
          <View style={[bento.card, styles.heroCard]}>
            <MaterialIcons name="shopping-cart" size={38} color={COLORS.primary} />
            <Text style={styles.title}>Your cart is empty</Text>
            <Text style={styles.sectionDescription}>Browse products and add items to checkout. Your favourites will be waiting here.</Text>
            <AppButton title="Browse products" onPress={() => router.push("/customer")} style={styles.primaryButton} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerStyle={styles.wrap}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={() => (
          <View style={[bento.card, styles.heroCard]}>
            <View style={styles.titleRow}>
              <MaterialIcons name="shopping-cart" size={28} color={COLORS.primary} />
              <Text style={styles.title}>My Cart</Text>
            </View>
            <Text style={styles.sectionDescription}>Review your items and adjust quantities before checkout.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[bento.card, styles.item]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
            ) : null}
            <View style={styles.itemBody}>
              <View style={styles.itemHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₱{item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.badgeRow}>
                <Text style={styles.itemBadge}>{item.category}</Text>
                <Text style={styles.stock}>Stock: {item.stock}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>Qty: {item.quantity}</Text>
                <Text style={styles.subtotal}>₱{(item.quantity * item.price).toFixed(2)}</Text>
              </View>
            </View>
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
                  <AppButton title="Save" onPress={() => saveEdit(item.productId)} style={[styles.itemButton, styles.actionButton]} textStyle={styles.itemActionText} />
                  <AppButton title="Cancel" onPress={() => setEditingProductId(null)} variant="ghost" style={[styles.itemButton, styles.actionButton]} textStyle={styles.itemActionText} />
                </View>
              </View>
            ) : (
              <View style={styles.itemActions}>
                <AppButton title="Edit" onPress={() => startEdit(item)} variant="secondary" style={[styles.itemButton, styles.actionButton]} textStyle={styles.itemActionText} />
                <AppButton title="Delete" onPress={() => confirmRemove(item.productId)} variant="danger" style={[styles.itemButton, styles.actionButton]} textStyle={styles.itemActionText} />
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={[bento.card, styles.summaryCard]}>
              <Text style={styles.summaryLabel}>Order total</Text>
              <Text style={styles.total}>₱{cartTotal().toFixed(2)}</Text>
            </View>
            <AppButton title="Checkout" onPress={handleCheckout} style={styles.checkoutButton} />
            <AppButton title="Continue shopping" onPress={() => router.push("/customer")} variant="secondary" style={styles.selectMoreButton} />
          </View>
        )}
      />
      <ConfirmDialog
        visible={!!confirmState}
        title={confirmState?.title ?? ''}
        message={confirmState?.message ?? ''}
        confirmLabel={confirmState?.confirmLabel}
        onConfirm={() => {
          confirmState?.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18 },
  contentContainer: {
    padding: 18,
    paddingBottom: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wrap: {
    padding: 18,
    paddingBottom: 28,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 740,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
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
    marginBottom: 18,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  sectionDescription: { color: COLORS.muted, marginBottom: 14, lineHeight: 20 },
  item: {
    flexBasis: '48%',
    minWidth: 170,
    maxWidth: 320,
    marginBottom: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  name: { flex: 1, flexWrap: 'wrap', marginRight: 8, fontWeight: "700", color: COLORS.text, fontSize: 16 },
  price: { flexShrink: 0, fontWeight: "700", color: COLORS.secondary },
  itemBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#eef4ff',
    color: COLORS.primary,
    overflow: 'hidden',
    fontWeight: '700',
  },
  itemBody: { marginTop: 14, flex: 1 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  meta: { color: COLORS.muted },
  stock: { color: COLORS.muted, fontSize: 12 },
  subtotal: { color: COLORS.text, fontWeight: "600" },
  itemButton: { marginTop: 8 },
  actionButton: { flex: 1, minWidth: 50, paddingHorizontal: 8 },
  itemActionText: { fontSize: 12, lineHeight: 16 },
  itemActions: { flexDirection: "row", flexWrap: 'wrap', justifyContent: "space-between", gap: 8, marginTop: 10 },
  editSection: { marginTop: 12 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  qtyButton: { width: 46, paddingHorizontal: 0 },
  qtyLabel: { color: COLORS.text, fontWeight: "700", fontSize: 16, minWidth: 24, textAlign: "center" },
  editActions: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  footer: { marginTop: 8, width: "100%", maxWidth: 640, alignSelf: 'center' },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    minWidth: 150,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  categoryCardContent: {
    flex: 1,
  },
  categoryImage: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  categoryImagePlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryActionButton: {
    marginTop: 8,
  },
  suggestionsScrollView: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
  },
  suggestionsScroll: {
    gap: 12,
  },
  suggestionItem: {
    width: 110,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  suggestionImage: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  suggestionImagePlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  suggestionMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  summaryCard: { padding: 16, marginBottom: 10 },
  summaryLabel: { color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  total: { fontWeight: "800", fontSize: 22, color: COLORS.primary },
  checkoutButton: { width: "100%", marginBottom: 8 },
  selectMoreButton: { width: "100%", marginBottom: 8 },
  primaryButton: { marginTop: 16 },
});
