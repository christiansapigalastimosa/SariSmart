import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import bento from '../../components/ui/bento-styles';
import AppButton from '../../components/ui/button';
import ConfirmDialog from '../../components/ui/confirm-dialog';
import { COLORS } from '../../components/ui/theme';
import { getSavedReports, initOrders, listOrders, saveReportFile, sendReportAndArchive, totalSales } from '../../lib/orders';
import { useRequireRole } from '../../lib/session';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [overallSales, setOverallSales] = useState<number>(0);
  const [overallOrders, setOverallOrders] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const router = useRouter();

  function closeConfirm() {
    setConfirmAction(null);
  }
  const authorized = useRequireRole("admin");

  useEffect(() => {
    let mounted = true;
    Promise.all([getSavedReports(), initOrders()]).then(async ([saved]) => {
      if (!mounted) return;
      setReports(saved.slice().reverse());
      // load current orders and compute overview
      const all = listOrders();
      setOverallOrders(all.length);
      setOverallSales(totalSales());
      const counts: Record<string, number> = {};
      all.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
      setStatusCounts(counts);
      setRecentOrders(all.slice().reverse().slice(0, 10));
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  async function handleSaveReport(report: any) {
    try {
      const uri = await saveReportFile(report);
      if (uri.startsWith('browser-download:')) {
        setSaveMessage(`Report download started: ${uri.replace('browser-download:', '')}`);
      } else if (Platform.OS === 'android') {
        setSaveMessage('Report saved to the selected phone folder. Open your file manager and look in the directory you chose.');
      } else {
        setSaveMessage('Report saved and share options opened. Choose Files or another app to save it if needed.');
      }
    } catch (err: any) {
      setSaveMessage(`Failed to save report: ${err?.message ?? 'Unknown error'}`);
    }
  }

  async function handleGenerateAndArchive() {
    try {
      const report = await sendReportAndArchive();
      // refresh saved reports and overview
      const saved = await getSavedReports();
      await initOrders();
      const all = listOrders();
      setReports(saved.slice().reverse());
      setOverallOrders(all.length);
      setOverallSales(totalSales());
      const counts: Record<string, number> = {};
      all.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
      setStatusCounts(counts);
      setRecentOrders(all.slice().reverse().slice(0, 10));
      setSaveMessage('Report generated and archived.');
      return report;
    } catch (err: any) {
      setSaveMessage(`Failed to generate report: ${err?.message ?? 'Unknown error'}`);
    }
  }

  function promptGenerateAndArchive() {
    setConfirmAction({
      title: 'Generate report',
      message: 'Generate a new report and archive completed orders? This will save the current orders as an archived report.',
      confirmLabel: 'Generate',
      onConfirm: handleGenerateAndArchive,
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item, idx) => String(idx)}
        contentContainerStyle={styles.flatContentContainer}
        numColumns={1}
        ListHeaderComponent={() => (
<View style={[bento.card, styles.heroCard]}>
            <View style={styles.titleRow}>
              <MaterialIcons name="bar-chart" size={28} color={COLORS.primary} />
              <View>
                <Text style={styles.title}>Reports</Text>
                <Text style={styles.subtitle}>Sales overview and reporting tools for the canteen.</Text>
              </View>
            </View>

            {saveMessage ? <View style={styles.messageBox}><Text style={styles.messageText}>{saveMessage}</Text></View> : null}

            <View style={styles.summaryGrid}>
              <View style={[bento.card, styles.summaryCard]}>
                <Text style={styles.summaryLabel}>Overall sales</Text>
                <Text style={styles.summaryValue}>₱{overallSales.toFixed(2)}</Text>
              </View>
              <View style={[bento.card, styles.summaryCard]}>
                <Text style={styles.summaryLabel}>Total orders</Text>
                <Text style={styles.summaryValue}>{overallOrders}</Text>
              </View>
              <View style={[bento.card, styles.summaryCard]}>
                <Text style={styles.summaryLabel}>Completed</Text>
                <Text style={styles.summaryValue}>{statusCounts['completed'] || 0}</Text>
              </View>
              <View style={[bento.card, styles.summaryCard]}>
                <Text style={styles.summaryLabel}>Reported</Text>
                <Text style={styles.summaryValue}>{statusCounts['reported'] || 0}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <AppButton title="Generate & Archive" onPress={promptGenerateAndArchive} style={styles.actionButton} />
              <AppButton title="View Archive" onPress={() => router.push('/admin/reports-archive')} variant="secondary" style={styles.actionButton} />
              <AppButton title="Refresh" onPress={async () => {
                await initOrders();
                const all = listOrders();
                setOverallOrders(all.length);
                setOverallSales(totalSales());
                const counts: Record<string, number> = {};
                all.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
                setStatusCounts(counts);
                setRecentOrders(all.slice().reverse().slice(0, 10));
                const saved = await getSavedReports();
                setReports(saved.slice().reverse());
              }} variant="secondary" style={styles.actionButton} />
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Recent orders</Text>
              {recentOrders.length === 0 ? (
                <View style={[bento.card, styles.emptyCard]}>
                  <Text style={styles.emptyTitle}>No recent orders yet</Text>
                  <Text style={styles.emptyText}>Once orders are completed, they will appear here.</Text>
                </View>
              ) : (
                recentOrders.map((o) => (
                  <View key={o.id} style={[bento.card, styles.orderCard]}>
                    <View style={styles.orderRow}>
                      <Text style={styles.cardTitle}>Order #{o.id}</Text>
                      <Text style={styles.orderAmount}>₱{o.total.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.detailText}>{o.status} • {new Date(o.createdAt).toLocaleString()}</Text>
                    <Text style={styles.detailText}>Items: {o.items.length}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={[bento.card, styles.emptyCard]}> 
            <Text style={styles.emptyTitle}>No archived reports yet</Text>
            <Text style={styles.emptyText}>Generate and archive a report to see it listed here.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[bento.card, styles.reportCard]}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportDate}>{new Date(item.generatedAt).toLocaleString()}</Text>
              <Text style={styles.reportMeta}>{item.items.length} items</Text>
            </View>
            <View style={styles.reportSummary}>
              <View style={styles.reportStat}>
                <Text style={styles.reportStatLabel}>Sales</Text>
                <Text style={styles.reportStatValue}>₱{item.totalSales.toFixed(2)}</Text>
              </View>
              <View style={styles.reportStat}>
                <Text style={styles.reportStatLabel}>Orders</Text>
                <Text style={styles.reportStatValue}>{item.totalOrders}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Items</Text>
            {item.items.map((it: any) => (
              <Text key={it.productId} style={styles.itemLine}>
                • {it.name} x{it.quantity} — ₱{it.revenue.toFixed(2)}
              </Text>
            ))}
            <AppButton title="Save report" onPress={() => handleSaveReport(item)} style={styles.saveButton} />
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerRow}>
            <AppButton title="Back" onPress={() => router.push('/admin')} variant="secondary" style={styles.backButton} />
          </View>
        )}
      />
      <ConfirmDialog
        visible={!!confirmAction}
        title={confirmAction?.title ?? ''}
        message={confirmAction?.message ?? ''}
        confirmLabel={confirmAction?.confirmLabel}
        onConfirm={() => {
          confirmAction?.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 24 },
  flatContentContainer: { paddingBottom: 24 },
  heroCard: {
    marginBottom: 16,
    padding: 22,
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { color: COLORS.muted, marginTop: 2, marginBottom: 16, lineHeight: 20 },
  messageBox: { marginBottom: 16, padding: 14, borderRadius: 18, backgroundColor: '#eef7ff', borderWidth: 1, borderColor: '#cfe4ff' },
  messageText: { color: COLORS.primary },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, minWidth: 150, padding: 16, borderRadius: 20 },
  summaryLabel: { color: COLORS.muted, marginBottom: 8, fontSize: 13 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  actionButton: { minWidth: 130 },
  sectionBlock: { marginBottom: 18 },
  sectionTitle: { marginBottom: 12, fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyCard: { padding: 20, marginBottom: 16, borderRadius: 22, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: COLORS.text, textAlign: 'center' },
  emptyText: { color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  orderCard: { marginBottom: 12, padding: 16, borderRadius: 22, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 },
  orderAmount: { fontWeight: '700', color: COLORS.primary },
  reportCard: { marginBottom: 16, padding: 18, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.secondary, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  reportDate: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  reportMeta: { color: COLORS.muted, fontSize: 13 },
  reportSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  reportStat: { flex: 1, minWidth: 120, padding: 12, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: COLORS.border },
  reportStatLabel: { color: COLORS.muted, marginBottom: 6, fontSize: 13 },
  reportStatValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  detailText: { color: COLORS.text, marginBottom: 4, lineHeight: 20 },
  itemLine: { color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  saveButton: { marginTop: 12, minWidth: 120 },
  footerRow: { marginTop: 8, alignItems: 'flex-start' },
  backButton: { minWidth: 100 },
});
