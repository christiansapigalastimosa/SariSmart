import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const [pendingImageProductId, setPendingImageProductId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    productId: number;
    message: string;
    confirmLabel?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const authorized = useRequireRole("admin");

  useEffect(() => {
    let mounted = true;
    initProducts().then(() => {
      if (!mounted) return;
      setProducts(listProducts());
    });
    return () => {
      mounted = false;
    };
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
      discount: p.discount?.toString() ?? "",
    });
  }

  async function pickImageForEdit(productId: number) {
    if (Platform.OS === 'web') {
      setPendingImageProductId(productId);
      fileInputRef.current?.click();
      return;
    }

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const options: any = { quality: 0.8, base64: false };
      // Do not pass mediaTypes to avoid native casting issues across platforms
      const result = await ImagePicker.launchImageLibraryAsync(options);
      if ((result as any).cancelled || (result as any).canceled) return;
      const asset = result.assets?.[0] ?? (result as any);
      const uri = asset.uri;
      if (!uri) return;

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
    } catch (err) {
      console.warn('Pick image for edit failed', err);
    }
  }

  function onWebFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || pendingImageProductId === null) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingFields((current) => ({ ...current, image: reader.result as string }));
        setPendingImageProductId(null);
      }
    };
    reader.readAsDataURL(file);
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
    const discountValue = parseFloat(editingFields.discount as any);
    await updateProduct(productId, {
      name,
      price,
      description,
      stock,
      category: cat,
      image,
      discount: Number.isFinite(discountValue) ? discountValue : undefined,
    });
    initProducts().then(() => setProducts(listProducts()));
    setEditingId(null);
    setEditingFields({});
  }

  function handleDelete(productId: number) {
    setConfirmTarget({
      productId,
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
  }

  async function confirmDelete(productId: number) {
    await deleteProduct(productId);
    removeFromCart(productId);
    initProducts().then(() => setProducts(listProducts()));
    setConfirmTarget(null);
  }

  const catStr = typeof category === 'string' ? category : String(category ?? '');
  const filtered = products
    .filter((p) => p.category.toLowerCase() === catStr.toLowerCase())
    .filter((p) =>
      searchQuery.toLowerCase() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {Platform.OS === 'web' ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event: any) => {
            onWebFileSelected(event.target.files);
            event.target.value = '';
          }}
        />
      ) : null}
      <View style={[bento.card, styles.heroCard]}>
        <Text style={styles.title}>All {catStr}</Text>
        <Text style={styles.subtitle}>Manage all {catStr} products.</Text>
        <View style={styles.heroActions}>
          <AppButton title="Back" onPress={() => router.push('/admin')} variant="ghost" />
        </View>
      </View>

      <View style={styles.listWrap}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name, description..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Text style={styles.searchResultText}>
              Found {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <CategoryProductSection
          title={catStr}
          products={filtered}
          editingId={editingId}
          editingFields={editingFields}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onDelete={handleDelete}
          confirmTargetId={confirmTarget?.productId ?? null}
          confirmMessage={confirmTarget?.message ?? ''}
          confirmLabel={confirmTarget?.confirmLabel}
          onConfirmDelete={confirmDelete}
          onCancelDelete={() => setConfirmTarget(null)}
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
  searchContainer: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 8,
  },
  searchResultText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
});
