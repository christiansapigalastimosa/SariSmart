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

  useEffect(() => {
    if (!orderPlaced && !isProcessing && items.length > 0) {
      confirmOrder();
    }
  }, [items, orderPlaced, isProcessing]);

  if (authorized === false) return null;
  if (authorized === null) return null;

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
        <FlatList
          data={[]}
          keyExtractor={() => "complete"}
          contentContainerStyle={styles.flatContentContainer}
          numColumns={1}
          ListHeaderComponent={() => (
            <View style={[bento.card, styles.heroCard]}>
              <View style={styles.titleRow}>
                <MaterialIcons name="check-circle" size={28} color={COLORS.primary} />
                <Text style={styles.title}>Checkout Complete</Text>
              </View>
              <Text style={styles.sectionDescription}>Your order has been placed successfully. A receipt print dialog should appear next.</Text>
              {orderId ? (
                <View style={styles.orderNumberBox}>
                  <Text style={styles.orderNumberLabel}>Order Number</Text>
                  <Text style={styles.orderNumber}>#{orderId.toString().padStart(4, '0')}</Text>
                </View>
              ) : null}
              <Text style={styles.bodyText}>
                Please share this order number with the cashier to confirm your purchase quickly.
              </Text>
            </View>
          )}
          renderItem={() => null}
          ListFooterComponent={() => (
            <AppButton title="Continue shopping" onPress={() => router.push("/customer")} style={styles.primaryButton} />
          )}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[]}
          keyExtractor={() => "empty"}
          contentContainerStyle={styles.flatContentContainer}
          numColumns={1}
          ListHeaderComponent={() => (
            <View style={[bento.card, styles.heroCard]}>
              <Text style={styles.title}>Checkout</Text>
              <Text style={styles.sectionDescription}>Your cart is empty.</Text>
            </View>
          )}
          renderItem={() => null}
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
          <View style={styles.titleRow}>
            <MaterialIcons name="payment" size={28} color={COLORS.primary} />
            <Text style={styles.title}>Checkout</Text>
          </View>
        )}
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
            <Text style={styles.total}>Total: ₱{cartTotal().toFixed(2)}</Text>
            <AppButton title="Place order" onPress={confirmOrder} style={styles.primaryButton} />
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
    marginBottom: 18,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.muted, marginBottom: 10, lineHeight: 22 },
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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
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
  total: { fontWeight: "700", fontSize: 18, marginBottom: 12, color: COLORS.text },
  primaryButton: { width: "100%" },
});
