import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import CategoryProductSection from "../../../components/admin/category-product-section";
import bento from "../../../components/ui/bento-styles";
import AppButton from "../../../components/ui/button";
import { COLORS } from "../../../components/ui/theme";
import { removeFromCart } from "../../../lib/cart";
import { deleteProduct, initProducts, listProducts, Product, updateProduct } from "../../../lib/products";
import { useRequireRole } from "../../../lib/session";

export default function CategoryProductsPage() {
  const { category } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const router = useRouter();
  const authorized = useRequireRole("admin");

  useEffect(() => {
    initProducts().then(() => setProducts(listProducts()));
  }, []);

  if (authorized === false) return null;
  if (authorized === null) return null;

  function updateEditingField(field: string, value: string) {
    setEditingFields((current) => ({ ...current, [field]: value }));
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditingFields({
      name: p.name,
      price: String(p.price),
      description: p.description ?? "",
      stock: String(p.stock),
      category: p.category,
      image: p.image ?? "",
    });
  }

  async function pickImageForEdit(productId: number) {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const options: any = { quality: 0.8, base64: Platform.OS === 'web' };
      // Do not pass mediaTypes to avoid native casting issues across platforms
      const result = await ImagePicker.launchImageLibraryAsync(options);
      if ((result as any).cancelled || (result as any).canceled) return;
      const asset = result.assets?.[0] ?? (result as any);
      const uri = asset.uri;
      if (!uri) return;

      if (Platform.OS === 'web') {
        const base64 = asset.base64 ?? (result as any).base64;
        const mimeType = asset.type ?? 'image/jpeg';
        const dataUri = base64 ? `data:${mimeType};base64,${base64}` : uri;
        setEditingFields((current) => ({ ...current, image: dataUri }));
      } else {
        let destUri = uri;
        try {
          const imagesDir = FileSystem.documentDirectory + 'images';
          const dirInfo = await FileSystem.getInfoAsync(imagesDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
          }
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
          const dest = `${imagesDir}/${filename}`;
          await FileSystem.copyAsync({ from: uri, to: dest });
          destUri = dest;
        } catch (copyErr) {
          console.warn('Image copy failed for inline edit, using original uri', copyErr);
        }
        setEditingFields((current) => ({ ...current, image: destUri }));
      }
    } catch (err) {
      console.warn('Pick image for edit failed', err);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingFields({});
  }

  async function saveEdit(productId: number) {
    const name = editingFields.name?.trim();
    const price = parseFloat(editingFields.price as any) || 0;
    const description = editingFields.description?.trim() || undefined;
    const stock = parseInt(editingFields.stock as any, 10) || 0;
    const cat = editingFields.category || (category as string);
    const imageValue = editingFields.image?.trim();
    const image = imageValue === "" ? null : imageValue;
    await updateProduct(productId, { name, price, description, stock, category: cat, image });
    initProducts().then(() => setProducts(listProducts()));
    setEditingId(null);
    setEditingFields({});
  }

  async function handleDelete(productId: number) {
    await deleteProduct(productId);
    removeFromCart(productId);
    initProducts().then(() => setProducts(listProducts()));
  }

  const catStr = typeof category === 'string' ? category : String(category ?? '');
  const filtered = products.filter((p) => p.category.toLowerCase() === catStr.toLowerCase());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[bento.card, styles.heroCard]}>
        <Text style={styles.title}>All {catStr}</Text>
        <Text style={styles.subtitle}>Manage all {catStr} products.</Text>
        <View style={styles.heroActions}>
          <AppButton title="Back" onPress={() => router.push('/admin')} variant="ghost" />
        </View>
      </View>

      <View style={styles.listWrap}>
        <CategoryProductSection
          title={catStr}
          products={filtered}
          editingId={editingId}
          editingFields={editingFields}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onDelete={handleDelete}
          onChangeField={updateEditingField}
          onSaveEdit={saveEdit}
          onPickImage={pickImageForEdit}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { padding: 18, paddingBottom: 28 },
  heroCard: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    marginBottom: 18,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { color: COLORS.muted, marginTop: 6, lineHeight: 20 },
  heroActions: { marginTop: 16 },
  listWrap: { width: '100%', maxWidth: 640, alignSelf: 'center', marginTop: 20 },
});
