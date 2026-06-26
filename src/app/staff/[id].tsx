import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import bento from "../../components/ui/bento-styles";
import AppButton from "../../components/ui/button";
import ConfirmDialog from "../../components/ui/confirm-dialog";
import { COLORS } from "../../components/ui/theme";
import { getOrder, initOrders, isOrderReady, Order, processOrder, setOrderItemPrepared } from "../../lib/orders";
import { useRequireRole } from "../../lib/session";

export default function StaffOrderDetail() {
  const { id } = useLocalSearchParams();
  const orderId = Number(id);
  const router = useRouter();
  const authorized = useRequireRole("staff");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      await initOrders();
      if (!mounted) return;
      const loaded = await getOrder(orderId);
      setOrder(loaded ?? null);
      setLoading(false);
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (authorized === false) return null;
  if (authorized === null) return null;

  function closeConfirm() {
    setConfirmState(null);
  }

  async function refreshOrder() {
    const loaded = await getOrder(orderId);
    setOrder(loaded ?? null);
  }

  async function handleTogglePrepared(productId: number) {
    if (!order) return;
    const current = order.items.find((item) => item.productId === productId);
    if (!current) return;
    await setOrderItemPrepared(orderId, productId, !current.prepared);
    await refreshOrder();
  }

  function handleBack() {
    router.back();
  }

  function handleProcess() {
    if (!order) return;
    setConfirmState({
      title: 'Send to cashier',
      message: `Send order #${order.id} to cashier for payment?`,
      confirmLabel: 'Confirm',
      onConfirm: async () => {
        await processOrder(order.id);
        await refreshOrder();
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading order details…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={[bento.card, styles.card]}>
          <Text style={styles.title}>Order not found</Text>
          <Text style={styles.subtitle}>This order may no longer exist or has already been processed.</Text>
          <AppButton title="Back to staff" onPress={handleBack} variant="secondary" style={styles.backButton} />
        </View>
      </View>
    );
  }

  const preparedCount = order.items.filter((item) => item.prepared).length;
  const allPrepared = isOrderReady(order);
  const statusLabel = order.status === 'pending' ? 'Pending' : order.status === 'sentToCashier' ? 'Sent to cashier' : 'Completed';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[bento.card, styles.card]}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Order #{order.id}</Text>
            <View style={[styles.statusPill, order.status === 'pending' ? styles.statusPending : styles.statusCashier]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Tap each item to mark it prepared. When every item is checked, the order can be sent to the cashier.</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>₱{order.total.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Prepared</Text>
            <Text style={styles.detailValue}>{preparedCount}/{order.items.length}</Text>
          </View>
        </View>

        <View style={[bento.card, styles.card]}>
          <Text style={styles.sectionTitle}>Order items</Text>
          {order.items.map((item) => (
            <TouchableOpacity
              key={`${item.productId}-${item.name}`}
              style={[styles.itemRow, item.prepared ? styles.itemPrepared : styles.itemPending]}
              onPress={() => handleTogglePrepared(item.productId)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>x{item.quantity} · ₱{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
              <View style={[styles.checkPill, item.prepared ? styles.checkReady : styles.checkNotReady]}>
                <Text style={[styles.checkText, item.prepared && styles.checkTextReady]}>
                  {item.prepared ? 'Prepared' : 'Tap to check'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <AppButton title="Back" onPress={handleBack} variant="secondary" style={styles.actionButton} />
          <AppButton
            title={order.status === 'pending' ? 'Send to cashier' : 'Already sent'}
            onPress={handleProcess}
            disabled={!allPrepared || order.status !== 'pending'}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={!!confirmState}
        title={confirmState?.title ?? ''}
        message={confirmState?.message ?? ''}
        confirmLabel={confirmState?.confirmLabel}
        onConfirm={async () => {
          if (confirmState?.onConfirm) await confirmState.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 18, paddingBottom: 28 },
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { color: COLORS.muted, lineHeight: 20, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: COLORS.muted, fontSize: 13 },
  detailValue: { fontWeight: '700', color: COLORS.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: COLORS.text },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 18, marginBottom: 10, borderWidth: 1 },
  itemPending: { borderColor: '#dbeafe', backgroundColor: '#f8fbff' },
  itemPrepared: { borderColor: '#c7f0d8', backgroundColor: '#ecfff1' },
  itemName: { fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  itemMeta: { color: COLORS.muted, fontSize: 13 },
  checkPill: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  checkReady: { backgroundColor: COLORS.primary },
  checkNotReady: { backgroundColor: '#dbeafe' },
  checkText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  checkTextReady: { color: '#fff' },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  statusPending: { backgroundColor: '#fdefe8' },
  statusCashier: { backgroundColor: '#eef7ff' },
  actionsRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginTop: 8 },
  actionButton: { flex: 1 },
  backButton: { marginTop: 16 },
  loadingText: { padding: 18, color: COLORS.muted },
});
