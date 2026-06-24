import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../components/ui/theme";
import { EXAMPLE_CART_ITEMS, getCartTotal } from "../../lib/examples";

export default function ExamplesCart() {
  const total = getCartTotal(EXAMPLE_CART_ITEMS);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="shopping-cart" size={28} color={COLORS.primary} />
        <Text style={styles.title}>Cart Preview</Text>
        <Text style={styles.subtitle}>See your selected items and move to checkout.</Text>
      </View>

      <View style={styles.list}>
        {EXAMPLE_CART_ITEMS.map((it) => (
          <View key={it.id} style={styles.item}>
            <View>
              <Text style={styles.itemName}>{it.name}</Text>
              <Text style={styles.itemQty}>Qty: {it.qty}</Text>
            </View>
            <Text style={styles.itemPrice}>{it.price}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₱{total.toFixed(2)}</Text>
        <Link href="/examples/checkout" style={styles.checkoutBtn}><Text style={styles.checkoutText}>Checkout</Text></Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: COLORS.background },
  header: { width: '100%', maxWidth: 700, marginBottom: 16, padding: 18, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.primary, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  list: { width: '100%', maxWidth: 700, marginBottom: 12 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: '800', color: COLORS.secondary },
  itemQty: { color: COLORS.muted, marginTop: 6 },
  itemPrice: { fontWeight: '700', color: COLORS.text },
  footer: { width: '100%', maxWidth: 700, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  total: { fontSize: 18, fontWeight: '800' },
  checkoutBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  checkoutText: { color: '#fff', fontWeight: '700' },
});
