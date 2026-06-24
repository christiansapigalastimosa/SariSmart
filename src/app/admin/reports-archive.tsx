import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import bento from '../../components/ui/bento-styles';
import AppButton from '../../components/ui/button';
import { COLORS } from '../../components/ui/theme';
import { clearSavedReports, exportAllReportsCSV, getSavedReports, hasTrash, moveReportToTrash, restoreLastTrash, saveReportFile } from '../../lib/orders';
import { useRequireRole } from '../../lib/session';

export default function ReportsArchive() {
  const [reports, setReports] = useState<any[]>([]);
  const [trashExists, setTrashExists] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const authorized = useRequireRole('admin');

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [r, t] = await Promise.all([getSavedReports(), hasTrash()]);
      if (mounted) {
        setReports(r.slice().reverse());
        setTrashExists(t);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function refresh() {
    const [r, t] = await Promise.all([getSavedReports(), hasTrash()]);
    setReports(r.slice().reverse());
    setTrashExists(t);
  }

  async function handleDelete(index: number) {
    Alert.alert('Delete report', 'Are you sure you want to delete this archived report?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await moveReportToTrash(reports.length - 1 - index);
        await refresh();
        setMessage('Report moved to trash. You can undo.');
      } },
    ]);
  }

  async function handleUndo() {
    const restored = await restoreLastTrash();
    if (restored) {
      await refresh();
      setMessage('Restore successful.');
    } else {
      setMessage('Nothing to restore.');
    }
  }

  async function handleClear() {
    Alert.alert('Clear archive', 'Delete all archived reports? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await clearSavedReports();
        await refresh();
      } },
    ]);
  }

  if (authorized === false) return null;
  if (authorized === null) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[bento.card, styles.headerCard]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="archive" size={24} color={COLORS.primary} />
          <View>
            <Text style={styles.title}>Archived Reports</Text>
            <Text style={styles.subtitle}>Stored sales reports and archive actions.</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Reports archived</Text>
            <Text style={styles.statValue}>{reports.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Trash available</Text>
            <Text style={styles.statValue}>{trashExists ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <AppButton
            title="Export CSV"
            onPress={async () => {
              try {
                const fn = await exportAllReportsCSV();
                setMessage(`Exported: ${fn}`);
              } catch (err: any) {
                setMessage(`Export failed: ${err?.message ?? err}`);
              }
            }}
            style={styles.smallButton}
          />
          {trashExists ? (
            <AppButton title="Undo last delete" onPress={handleUndo} variant="secondary" style={styles.smallButton} />
          ) : null}
          <AppButton title="Clear Archive" onPress={handleClear} variant="danger" style={styles.smallButton} />
          <AppButton title="Refresh" onPress={refresh} variant="ghost" style={styles.smallButton} />
          <AppButton title="Back" onPress={() => router.push('/admin/reports')} variant="secondary" style={styles.backButton} />
        </View>
      </View>

      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {reports.length === 0 ? (
        <View style={[bento.card, styles.emptyCard]}>
          <Text style={styles.emptyTitle}>No archived reports yet</Text>
          <Text style={styles.emptyText}>Archive completed reports from the main reports page so they appear here.</Text>
        </View>
      ) : (
        reports.map((report: any, idx: number) => (
          <View key={idx} style={[bento.card, styles.reportCard]}>
            <View style={styles.reportHeader}>
              <Text style={styles.cardTitle}>Report generated</Text>
              <Text style={styles.reportMeta}>{new Date(report.generatedAt).toLocaleString()}</Text>
            </View>
            <View style={styles.reportSummary}>
              <View style={styles.reportStat}>
                <Text style={styles.statLabel}>Sales</Text>
                <Text style={styles.statValue}>₱{report.totalSales.toFixed(2)}</Text>
              </View>
              <View style={styles.reportStat}>
                <Text style={styles.statLabel}>Orders</Text>
                <Text style={styles.statValue}>{report.totalOrders}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Items</Text>
            {report.items.map((it: any) => (
              <Text key={it.productId} style={styles.itemLine}>
                • {it.name} x{it.quantity} — ₱{it.revenue.toFixed(2)}
              </Text>
            ))}
            <View style={styles.reportActions}>
              <AppButton title="Download" onPress={() => saveReportFile(report)} style={styles.smallButton} />
              <AppButton title="Delete" onPress={() => handleDelete(idx)} variant="danger" style={styles.smallButton} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 24 },
  headerCard: { marginBottom: 16, padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { color: COLORS.muted, marginTop: 2, lineHeight: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, minWidth: 140, padding: 14, borderRadius: 18, backgroundColor: '#f5f9ff', borderWidth: 1, borderColor: COLORS.border },
  statLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  messageBox: { backgroundColor: '#eef7ff', borderRadius: 18, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#d9e9ff' },
  messageText: { color: COLORS.primary },
  emptyCard: { alignItems: 'center', padding: 24, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: COLORS.text, textAlign: 'center' },
  emptyText: { color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  reportCard: { marginBottom: 16, padding: 18 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  cardTitle: { fontWeight: '700', fontSize: 16, color: COLORS.text },
  reportMeta: { color: COLORS.muted, fontSize: 13 },
  reportSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  reportStat: { flex: 1, minWidth: 120, padding: 12, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: COLORS.border },
  detailText: { color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  sectionTitle: { fontWeight: '700', marginTop: 6, marginBottom: 8, color: COLORS.text },
  itemLine: { color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  reportActions: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  smallButton: { minWidth: 110 },
  backButton: { minWidth: 100 },
});
