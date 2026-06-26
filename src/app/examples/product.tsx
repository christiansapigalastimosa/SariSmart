import { MaterialIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import bento from "../../components/ui/bento-styles";
import { COLORS } from "../../components/ui/theme";
import { getProductById } from "../../lib/examples";

export default function ExamplesProduct() {
  const params = useLocalSearchParams();
  const id = String(params.id ?? '1');
  const product = getProductById(id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[bento.card, styles.header]}>
        <MaterialIcons name="inventory" size={28} color={COLORS.primary} />
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>{product.desc}</Text>
      </View>

      <View style={[bento.card, styles.card]}> 
        {product.details.map((detail: string) => (
          <Text key={detail} style={styles.detailText}>• {detail}</Text>
        ))}
      </View>

      <View style={styles.info}>
        <Text style={styles.price}>{product.price}</Text>
        <Link href="/examples/cart" style={styles.addBtn}><Text style={styles.addText}>Add to cart</Text></Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: COLORS.background },
  header: { width: '100%', maxWidth: 700, marginBottom: 16, padding: 18, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.primary, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  card: { width: '100%', maxWidth: 700, backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  detailText: { color: COLORS.secondary, marginBottom: 8 },
  info: { width: '100%', maxWidth: 700, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 22, fontWeight: '800' },
  addBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  addText: { color: '#fff', fontWeight: '700' },
});
