import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { CartItem, cartTotal, clearCart, initCart, listCart } from "../lib/cart";
import { createOrder } from "../lib/orders";
import { reduceProductStock } from "../lib/products";
import { useRequireRole } from "../lib/session";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
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

  if (authorized === false) return null;
  if (authorized === null) return null;

  function confirmOrderPrompt() {
    setConfirmVisible(true);
  }

  function closeConfirm() {
    setConfirmVisible(false);
  }

  async function confirmOrder() {
    setIsProcessing(true);
    try {
      const order = await createOrder(items, cartTotal());
      await Promise.all(items.map((item) => reduceProductStock(item.productId, item.quantity)));
      clearCart();

      const receiptHtml = `
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px;">
          <h1>Order #${order.id.toString().padStart(4, '0')}</h1>
          <p style="font-size: 16px; color: #555;">Thank you for your order. Please present this receipt to the cashier for payment confirmation.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="text-align:left; border-bottom:1px solid #ddd; padding:8px 0;">Item</th>
                <th style="text-align:center; border-bottom:1px solid #ddd; padding:8px 0;">Qty</th>
                <th style="text-align:right; border-bottom:1px solid #ddd; padding:8px 0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item) => `
                <tr>
                  <td style="padding:8px 0;">${item.name}</td>
                  <td style="text-align:center; padding:8px 0;">${item.quantity}</td>
                  <td style="text-align:right; padding:8px 0;">₱${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; display:flex; justify-content:space-between;">
            <strong>Total</strong>
            <strong>₱${order.total.toFixed(2)}</strong>
          </div>
          <p style="margin-top: 24px; color: #555;">Order Number: <strong>#${order.id.toString().padStart(4, '0')}</strong></p>
        </body>
      </html>
    `;

      // navigate to the print page for a better UI and printing flow
      setOrderId(order.id);
      setOrderPlaced(true);
      try {
        router.push((`/print/${order.id}`) as any);
      } catch (err) {
        console.warn('Navigation to print page failed', err);
      }
    } catch (err) {
      console.warn('Order creation failed', err);
    } finally {
      setIsProcessing(false);
    }
  }

  if (orderPlaced) {
    return (
      <View style={styles.container}>
        <View style={[bento.card, styles.heroCard]}>
          <View style={styles.titleRow}>
            <MaterialIcons name="check-circle" size={28} color={COLORS.primary} />
            <Text style={styles.title}>Checkout Complete</Text>
          </View>
          <Text style={styles.sectionDescription}>Your order was placed successfully. Present the order number to the cashier when you arrive.</Text>
          {orderId ? (
            <View style={styles.orderNumberBox}>
              <Text style={styles.orderNumberLabel}>Order Number</Text>
              <Text style={styles.orderNumber}>#{orderId.toString().padStart(4, '0')}</Text>
            </View>
          ) : null}
          <Text style={styles.bodyText}>Thank you for your purchase. We're preparing your order now.</Text>
        </View>
        <AppButton title="Continue shopping" onPress={() => router.push("/customer")} style={styles.primaryButton} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={[bento.card, styles.heroCard]}>
            <MaterialIcons name="payment" size={32} color={COLORS.primary} />
            <Text style={styles.title}>Checkout</Text>
            <Text style={styles.sectionDescription}>Your cart is empty. Add products to continue.</Text>
            <AppButton title="Browse products" onPress={() => router.push("/customer")} style={styles.primaryButton} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[bento.card, styles.heroCard]}> 
        <View style={styles.titleRow}>
          <MaterialIcons name="payment" size={28} color={COLORS.primary} />
          <Text style={styles.title}>Checkout</Text>
        </View>
        <Text style={styles.sectionDescription}>Confirm your order and complete checkout with a receipt for the cashier.</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerStyle={styles.flatContentContainer}
        numColumns={1}
        renderItem={({ item }) => (
          <View style={[bento.card, styles.item]}>
            <View style={styles.itemHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₱{item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.meta}>Qty: {item.quantity}</Text>
            <Text style={styles.subtotal}>Subtotal: ₱{(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={[bento.card, styles.summaryCard]}>
              <Text style={styles.summaryLabel}>Total amount</Text>
              <Text style={styles.total}>₱{cartTotal().toFixed(2)}</Text>
            </View>
            <AppButton title="Place order" onPress={confirmOrderPrompt} style={styles.primaryButton} disabled={isProcessing} />
          </View>
        )}
      />
      {confirmVisible ? (
        <View style={styles.modalOverlay}>
          <View style={[bento.card, styles.modalCard]}>
            <Text style={styles.modalTitle}>Confirm your order</Text>
            <Text style={styles.modalText}>Once placed, the order will be sent to the cashier for processing.</Text>
            <View style={styles.modalActions}>
              <AppButton title="Cancel" variant="secondary" onPress={closeConfirm} style={styles.modalButton} />
              <AppButton title="Confirm order" onPress={() => { closeConfirm(); confirmOrder(); }} style={styles.modalButton} />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flatContentContainer: {
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
    marginBottom: 18,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text },
  sectionDescription: { color: COLORS.muted, marginBottom: 14, lineHeight: 20 },
  bodyText: { color: COLORS.text, lineHeight: 22 },
  orderNumberBox: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#eef6ff',
    borderWidth: 1,
    borderColor: '#c9ddf5',
  },
  orderNumberLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
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
  meta: { color: COLORS.muted, marginBottom: 8 },
  subtotal: { fontWeight: "600", color: COLORS.text },
  footer: { marginTop: 16, width: "100%", maxWidth: 640, alignSelf: 'center' },
  summaryCard: { padding: 18, marginBottom: 14 },
  summaryLabel: { color: COLORS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  total: { fontWeight: "800", fontSize: 22, color: COLORS.primary },
  primaryButton: { width: "100%" },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10, color: COLORS.text },
  modalText: { color: COLORS.muted, lineHeight: 22, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1 },
});
