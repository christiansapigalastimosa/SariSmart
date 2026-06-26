import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import ConfirmDialog from "../components/ui/confirm-dialog";
import { COLORS } from "../components/ui/theme";
import { confirmOrderPayment, currentPeriodSales, initOrders, listOrders, Order } from "../lib/orders";
import { useRequireRole } from "../lib/session";

export default function Cashier() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesAmount, setSalesAmount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const router = useRouter();
  const authorized = useRequireRole("cashier");

  useEffect(() => {
    let mounted = true;
    initOrders().then(() => {
      if (mounted) setOrders(listOrders());
      if (mounted) setSalesAmount(currentPeriodSales());
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  function refreshOrders() {
    setOrders(listOrders());
    setSalesAmount(currentPeriodSales());
  }

  function closeConfirm() {
    setConfirmState(null);
  }

  async function handleReport() {
    router.push("/cashier/report");
  }

  async function handleConfirmPayment(orderId: number) {
    setConfirmState({
      title: 'Confirm payment',
      message: `Mark order #${orderId} as paid?`,
      confirmLabel: 'Confirm',
      onConfirm: async () => {
        await confirmOrderPayment(orderId);
        refreshOrders();
      },
    });
  }

  const readyOrders = orders.filter((order) => order.status === "sentToCashier");
  const completedOrders = orders.filter((order) => order.status === "completed");

  const query = searchQuery.trim().toLowerCase();
  const orderMatchesSearch = (order: Order) => {
    if (!query) return true;
    return (
      order.id.toString().includes(query) ||
      order.items.some((product) => product.name.toLowerCase().includes(query))
    );
  };

  const filteredReadyOrders = readyOrders.filter(orderMatchesSearch);
  const filteredCompletedOrders = completedOrders.filter(orderMatchesSearch);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReadyOrders}
        keyExtractor={(order) => order.id.toString()}
        contentContainerStyle={styles.flatContentContainer}
        numColumns={1}
        ListHeaderComponent={() => (
          <View style={[bento.card, styles.heroCard]}>
            <View style={styles.titleRow}>
              <MaterialIcons name="attach-money" size={28} color={COLORS.primary} />
              <Text style={styles.title}>Cashier Dashboard</Text>
            </View>
            <Text style={styles.subtitle}>Confirm payments and send daily reports to admin quickly.</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order # or item"
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summaryReady]}>
                <Text style={styles.summaryLabel}>Ready now</Text>
                <Text style={styles.summaryValue}>{readyOrders.length}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCompleted]}>
                <Text style={styles.summaryLabel}>Completed</Text>
                <Text style={styles.summaryValue}>{completedOrders.length}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summarySales]}>
                <Text style={styles.summaryLabel}>Total sales</Text>
                <Text style={styles.summaryValue}>₱{salesAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.topRow}>
              <AppButton title="Send Daily Report" onPress={handleReport} variant="secondary" style={styles.smallButton} />
            </View>
            <Text style={styles.sectionTitle}>Orders waiting for customer payment</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={[bento.card, styles.card, styles.emptyStateCard]}>
            <Text style={styles.statusText}>
              {searchQuery
                ? 'No orders match that search term.'
                : 'No orders are ready for cashier confirmation yet.'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[bento.card, styles.card]}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.cardTitle}>Order #{item.id}</Text>
              <View style={[styles.statusPill, styles.statusReady]}>
                <Text style={styles.pillText}>Waiting</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.cardMeta}>Total</Text>
              <Text style={styles.cardValue}>₱{item.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.subheading}>Items</Text>
            {item.items.map((product) => (
              <Text key={product.productId} style={styles.orderLine}>
                • {product.name} x{product.quantity}
              </Text>
            ))}
            <AppButton title="Confirm payment" onPress={() => handleConfirmPayment(item.id)} style={styles.actionButton} />
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerSection}>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Completed Orders</Text>
            {filteredCompletedOrders.length === 0 ? (
              <View style={[bento.card, styles.card, styles.emptyStateCard]}>
                <Text style={styles.statusText}>
                  {searchQuery
                    ? 'No completed orders match that search term.'
                    : 'No completed orders yet.'}
                </Text>
              </View>
            ) : (
              filteredCompletedOrders.map((order) => (
                <View key={order.id} style={[bento.card, styles.card, styles.completedCard]}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.cardTitle}>Order #{order.id}</Text>
                    <View style={[styles.statusPill, styles.statusComplete]}>
                      <Text style={styles.pillText}>Completed</Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>Total</Text>
                  <Text style={styles.cardValue}>₱{order.total.toFixed(2)}</Text>
                </View>
              ))
            )}
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
    maxWidth: 900,
    alignSelf: 'center',
    padding: 22,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 0,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: COLORS.text },
  subtitle: { color: COLORS.muted, marginBottom: 16, lineHeight: 22 },
  searchInput: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, minWidth: 140, borderRadius: 20, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  summaryReady: { backgroundColor: '#f8faf6' },
  summaryCompleted: { backgroundColor: '#eef6ff' },
  summarySales: { backgroundColor: '#fff7ed' },
  summaryLabel: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  summaryValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  topRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: 16 },
  metric: { fontWeight: "700", color: COLORS.text },
  smallButton: { minWidth: 160, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
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
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardMeta: { color: COLORS.muted, fontSize: 13 },
  cardValue: { color: COLORS.text, fontWeight: '700' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  orderLine: { marginLeft: 6, marginTop: 4, color: COLORS.text, lineHeight: 20 },
  statusReady: { backgroundColor: '#fef3c7' },
  statusComplete: { backgroundColor: '#d1fae5' },
  subheading: { marginTop: 10, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  actionButton: { marginTop: 16 },
  emptyStateCard: { alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  completedCard: { backgroundColor: '#f8fafc' },
  footerSection: { marginTop: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
});
