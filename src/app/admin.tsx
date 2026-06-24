import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
// per-category lists moved to dedicated pages
import bento from "../components/ui/bento-styles";
import AppButton from "../components/ui/button";
import { COLORS } from "../components/ui/theme";
import { initOrders, totalSales } from "../lib/orders";
import { CATEGORIES, initProducts, listProducts } from "../lib/products";
import { useRequireRole } from "../lib/session";

export default function Admin() {
  const [totalSalesAmount, setTotalSalesAmount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const authorized = useRequireRole("admin");

  useEffect(() => {
    initProducts().then(() => {
      const products = listProducts();
      setProductCount(products.length);
      setCategoryCounts(
        CATEGORIES.reduce((acc, category) => {
          acc[category] = products.filter((item) => item.category === category).length;
          return acc;
        }, {} as Record<string, number>)
      );
    });
    initOrders().then(() => setTotalSalesAmount(totalSales()));
  }, []);

  useEffect(() => {
    if (refresh) {
      initProducts().then(() => {
        const products = listProducts();
        setProductCount(products.length);
        setCategoryCounts(
          CATEGORIES.reduce((acc, category) => {
            acc[category] = products.filter((item) => item.category === category).length;
            return acc;
          }, {} as Record<string, number>)
        );
      });
      initOrders().then(() => setTotalSalesAmount(totalSales()));
    }
  }, [refresh]);

  if (authorized === false) return null;
  if (authorized === null) return null;

  // product management moved to per-category pages

  const categorySummary = useMemo(
    () => CATEGORIES.map((category) => ({
      title: category,
      count: categoryCounts[category] ?? 0,
    })),
    [categoryCounts]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={[bento.card, styles.heroCard]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="admin-panel-settings" size={28} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>SariSmart Admin</Text>
            <Text style={styles.subtitle}>Dashboard for inventory, sales, and reports.</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={styles.statValue}>₱{totalSalesAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Products</Text>
            <Text style={styles.statValue}>{productCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Categories</Text>
            <Text style={styles.statValue}>{CATEGORIES.length}</Text>
          </View>
        </View>
        <Text style={styles.sectionHeading}>Quick actions</Text>
        <View style={styles.actionsGrid}>
          <AppButton title="Add product" onPress={() => router.push('/admin/add-product')} variant="primary" style={styles.actionButton} />
          <AppButton title="Reports" onPress={() => router.push('/admin/reports')} variant="secondary" style={styles.actionButton} />
          <AppButton title="Drinks" onPress={() => router.push({ pathname: '/admin/all-products/[category]', params: { category: 'Drinks' } })} variant="secondary" style={styles.actionButton} />
          <AppButton title="Snacks" onPress={() => router.push({ pathname: '/admin/all-products/[category]', params: { category: 'Snacks' } })} variant="secondary" style={styles.actionButton} />
          <AppButton title="Meal" onPress={() => router.push({ pathname: '/admin/all-products/[category]', params: { category: 'Meal' } })} variant="secondary" style={styles.actionButton} />
          <AppButton title="Refresh" onPress={() => {
            initOrders().then(() => setTotalSalesAmount(totalSales()));
            initProducts().then(() => {
              const products = listProducts();
              setProductCount(products.length);
              setCategoryCounts(
                CATEGORIES.reduce((acc, category) => {
                  acc[category] = products.filter((item) => item.category === category).length;
                  return acc;
                }, {} as Record<string, number>)
              );
            });
          }} variant="ghost" style={styles.actionButton} />
        </View>
      </View>

      <View style={styles.categoryPanel}>
        <Text style={styles.sectionTitle}>Inventory by category</Text>
        <View style={styles.categoryGrid}>
          {categorySummary.map((item) => (
            <View key={item.title} style={styles.categoryItem}>
              <Text style={styles.categoryTitle}>{item.title}</Text>
              <Text style={styles.categoryCount}>{item.count} items</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: {
    padding: 18,
    paddingBottom: 28,
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 18,
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  subtitle: { color: COLORS.muted, marginBottom: 18, lineHeight: 22 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: 160,
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginRight: 12,
    marginBottom: 12,
  },
  statPrimary: {
    backgroundColor: '#f3f9ff',
    borderColor: 'rgba(38, 122, 255, 0.16)',
  },
  statLabel: { color: COLORS.muted, marginBottom: 8, fontSize: 14 },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  sectionHeading: { fontSize: 16, fontWeight: 700, marginBottom: 12, color: COLORS.text },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%', marginBottom: 12 },
  actionButton: { minWidth: 140, marginTop: 0, marginRight: 12, marginBottom: 10, alignSelf: 'flex-start' },
  categoryPanel: { width: '100%', maxWidth: 640, alignSelf: 'center', marginTop: 18 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  categoryItem: { flexBasis: '30%', minWidth: 170, padding: 14, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  categoryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  categoryCount: { color: COLORS.muted },
  formWrap: { width: "100%", maxWidth: 640, alignSelf: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: COLORS.text },
  sectionDescription: { color: COLORS.muted, marginBottom: 16, lineHeight: 20 },
  formRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  fieldColumn: { flex: 1, minWidth: 150 },
  label: { marginTop: 12, marginBottom: 6, color: COLORS.muted },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
  },
  pickerOptions: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.surface, overflow: "hidden", marginBottom: 10 },
  pickerOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  submitButton: { marginTop: 8 },
  smallButton: { minWidth: 120, marginTop: 8 },
});
