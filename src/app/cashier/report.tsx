import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import bento from '../../components/ui/bento-styles';
import AppButton from '../../components/ui/button';
import { COLORS } from '../../components/ui/theme';
import { generateSalesReport, initOrders, sendReportAndArchive } from '../../lib/orders';
import { useRequireRole } from '../../lib/session';

export default function CashierReport() {
  const [report, setReport] = useState<any | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const router = useRouter();
  const authorized = useRequireRole("cashier");

  useEffect(() => {
    mounted.current = true;
    initOrders().then(() => {
      if (!mounted.current) return;
      setReport(generateSalesReport());
    });
    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleSendReport() {
    if (!report) return;
    setSending(true);
    setError(null);
    try {
      await sendReportAndArchive();
      if (!mounted.current) return;
      setSent(true);
    } catch (err) {
      if (!mounted.current) return;
      setError('Unable to send the report. Please try again.');
      console.warn(err);
    } finally {
      if (!mounted.current) return;
      setSending(false);
    }
  }

  if (authorized === false) return null;
  if (authorized === null) return null;

  if (!report)
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.statusText}>Generating report...</Text>
      </ScrollView>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[bento.card, styles.heroCard]}>
        <Text style={styles.title}>Sales Report</Text>
        <Text style={styles.subtitle}>Generated at {report.generatedAt}</Text>
      </View>

          <View style={[bento.card, styles.card]}> 
        <Text style={styles.sectionTitle}>Totals</Text>
        <View style={styles.statRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Total sales</Text>
            <Text style={styles.statValue}>₱{report.totalSales.toFixed(2)}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{report.totalOrders}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Items sold</Text>
      {report.items.length === 0 ? (
        <View style={[bento.card, styles.card, styles.emptyStateCard]}>
          <Text style={styles.statusText}>No items sold yet.</Text>
        </View>
      ) : (
        <View>
          {report.items.map((item: any) => (
            <View key={item.productId} style={[bento.card, styles.card, styles.productCard]}>
              <View style={styles.productHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.productValue}>₱{item.revenue.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemText}>Quantity sold: {item.quantity}</Text>
            </View>
          ))}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {sent ? (
        <View style={[bento.card, styles.card, styles.sentCard]}>
          <Text style={styles.sentTitle}>Report sent successfully</Text>
          <Text style={styles.statusText}>The sales report has been archived and forwarded.</Text>
        </View>
      ) : (
        <AppButton
          title={sending ? 'Sending report…' : 'Confirm & send report'}
          onPress={handleSendReport}
          disabled={sending}
          style={styles.sendButton}
        />
      )}
      <AppButton title="Back" onPress={() => router.push('/cashier')} variant="secondary" style={styles.backButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 24 },
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
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, color: COLORS.text },
  subtitle: { color: COLORS.muted, fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: COLORS.text },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statBlock: {
    flex: 1,
    minWidth: 140,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  statLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  productCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontWeight: '700', marginBottom: 6, color: COLORS.text },
  itemText: { color: COLORS.text, marginBottom: 4 },
  statusText: { color: COLORS.muted, fontSize: 15, marginTop: 12 },
  productValue: { color: COLORS.secondary, fontWeight: '700' },
  errorText: { color: '#b91c1c', marginBottom: 12, fontWeight: '600' },
  sendButton: { marginBottom: 12 },
  sentCard: { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' },
  sentTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: COLORS.text },
  emptyStateCard: { alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  backButton: { marginTop: 12 },
});
