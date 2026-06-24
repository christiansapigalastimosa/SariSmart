import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { initOrders, listOrders, Order, processOrder } from "../lib/orders";
import { useRequireRole } from "../lib/session";

export default function Staff() {
  const [orders, setOrders] = useState<Order[]>([]);
  const authorized = useRequireRole("staff");

  useEffect(() => {
    let mounted = true;
    initOrders().then(() => {
      if (mounted) setOrders(listOrders());
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  function refreshOrders() {
    setOrders(listOrders());
  }

  async function handleProcess(orderId: number) {
    await processOrder(orderId);
    refreshOrders();
  }

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const inCashierQueue = orders.filter((order) => order.status === "sentToCashier");

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingOrders}
        keyExtractor={(order) => order.id.toString()}
        contentContainerStyle={styles.flatContentContainer}
        numColumns={1}
        ListHeaderComponent={() => (
          <View>
            <View style={[bento.card, styles.heroCard]}>
              <View style={styles.titleRow}>
                <MaterialIcons name="assignment" size={28} color={COLORS.primary} />
                <Text style={styles.title}>Staff Dashboard</Text>
              </View>
              <Text style={styles.subtitle}>Process incoming checkouts, then send orders to the cashier for payment confirmation.</Text>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, styles.summaryPending]}>
                  <Text style={styles.summaryLabel}>Pending orders</Text>
                  <Text style={styles.summaryValue}>{pendingOrders.length}</Text>
                </View>
                <View style={[styles.summaryCard, styles.summaryCashier]}>
                  <Text style={styles.summaryLabel}>In cashier queue</Text>
                  <Text style={styles.summaryValue}>{inCashierQueue.length}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Incoming customer checkouts</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={[bento.card, styles.card, styles.emptyStateCard]}>
            <Text style={styles.statusText}>No new customer checkouts are waiting for processing.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[bento.card, styles.card]}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.cardTitle}>Order #{item.id}</Text>
              <View style={[styles.statusPill, styles.statusPending]}>
                <Text style={styles.statusPillText}>Pending</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.cardMeta}>Total</Text>
              <Text style={styles.cardValue}>₱{item.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.subheading}>Items</Text>
            {item.items.map((product) => (
              <Text key={product.productId} style={styles.orderLine}>
                • {product.name} x{product.quantity} — ₱{(product.price * product.quantity).toFixed(2)}
              </Text>
            ))}
            <AppButton title="Process & send to cashier" onPress={() => handleProcess(item.id)} style={styles.actionButton} />
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerSection}>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Ready for Cashier</Text>
            {inCashierQueue.length === 0 ? (
              <Text style={styles.statusText}>No orders have been forwarded to the cashier yet.</Text>
            ) : (
              inCashierQueue.map((order) => (
                <View key={order.id} style={[bento.card, styles.card]}>
                  <Text style={styles.cardTitle}>Order #{order.id}</Text>
                  <Text>Status: Sent to cashier</Text>
                  <Text>Total: ₱{order.total.toFixed(2)}</Text>
                </View>
              ))
            )}
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
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 22,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: COLORS.text },
  subtitle: { color: COLORS.muted, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: COLORS.text },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  summaryPending: { backgroundColor: '#fff6ea' },
  summaryCashier: { backgroundColor: '#eef7ff' },
  summaryLabel: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  summaryValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statusText: { color: COLORS.muted, marginBottom: 12 },
  card: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    marginBottom: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: { fontWeight: "700", marginBottom: 8, color: COLORS.text, fontSize: 18 },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  statusPillText: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  statusPending: { backgroundColor: '#fdefe8' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardMeta: { color: COLORS.muted, fontSize: 13 },
  cardValue: { fontWeight: '700', color: COLORS.text },
  subheading: { marginTop: 10, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  orderLine: { marginLeft: 6, marginTop: 4, color: COLORS.text, lineHeight: 20 },
  actionButton: { marginTop: 16 },
  emptyStateCard: { alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  footerSection: { marginTop: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
});
