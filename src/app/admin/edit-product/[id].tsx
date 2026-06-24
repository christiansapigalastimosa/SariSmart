import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import bento from "../../../components/ui/bento-styles";
import AppButton from "../../../components/ui/button";
import { COLORS } from "../../../components/ui/theme";
import { CATEGORIES, deleteProduct, getProductById, initProducts, Product, updateProduct } from "../../../lib/products";
import { useRequireRole } from "../../../lib/session";

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const authorized = useRequireRole("admin");
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const previewImage = imageUri ?? (imageUrl.trim() ? imageUrl.trim() : null);

  useEffect(() => {
    let mounted = true;
    initProducts().then(() => {
      if (!mounted) return;
      const pid = parseInt(id as string, 10);
      const p = getProductById(pid);
      if (p) {
        setProduct(p);
        setName(p.name);
        setPrice(String(p.price));
        setStock(String(p.stock));
        setDescription(p.description ?? "");
        setCategory(p.category);
        const remoteImage = p.image?.startsWith('http') ? p.image : null;
        setImageUri(remoteImage ? null : p.image ?? null);
        setImageUrl(remoteImage ?? "");
      }
    });
    return () => { mounted = false; };
  }, [id]);

  if (authorized === false) return null;
  if (authorized === null) return null;

  async function pickImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setMessage('Permission to access photos is required.');
        return;
      }
      const options: any = { quality: 0.8, base64: Platform.OS === 'web' };
      // Do not pass mediaTypes to avoid native casting issues across platforms
      const result = await ImagePicker.launchImageLibraryAsync(options);
      if ((result as any).cancelled || (result as any).canceled) return;
      const asset = result.assets?.[0] ?? (result as any);
      const uri = asset.uri;
      if (!uri) return;

      if (Platform.OS === 'web') {
        const base64 = asset.base64 ?? (result as any).base64;
        const mimeType = asset.type ? asset.type : 'image/jpeg';
        setImageUri(base64 ? `data:${mimeType};base64,${base64}` : uri);
      } else {
        let destUri = uri;
        const resized = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
        destUri = resized.uri;
        try {
          const imagesDir = FileSystem.documentDirectory + 'images';
          const dirInfo = await FileSystem.getInfoAsync(imagesDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
          }
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
          const dest = `${imagesDir}/${filename}`;
          await FileSystem.copyAsync({ from: resized.uri, to: dest });
          destUri = dest;
        } catch (copyErr) {
          console.warn('Image copy failed, using resized uri', copyErr);
        }
        setImageUri(destUri);
      }
    } catch (err: any) {
      console.warn('Image pick error', err);
      setMessage('Failed to pick image.');
    }
  }

  async function onSave() {
    if (!product) return;
    const pr = parseFloat(price as any) || 0;
    const st = parseInt(stock as any, 10) || 0;
    if (!name.trim()) { setMessage('Name required'); return; }
    const image = imageUri ?? (imageUrl.trim() ? imageUrl.trim() : undefined);
    await updateProduct(product.id, { name: name.trim(), price: pr, stock: st, description: description.trim(), category, image });
    router.push('/admin?refresh=1');
  }

  async function onDelete() {
    if (!product) return;
    Alert.alert('Delete product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteProduct(product.id); router.push('/admin?refresh=1'); } }
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[bento.card, styles.heroCard]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="edit" size={28} color={COLORS.primary} />
          <Text style={styles.title}>Edit Product</Text>
        </View>
        <Text style={styles.subtitle}>Update product details and image.</Text>
      </View>

      <View style={styles.formWrap}>
        <Text style={styles.sectionTitle}>Product details</Text>
        {message ? <Text style={{ color: COLORS.primary, marginBottom: 8 }}>{message}</Text> : null}

        <Text style={styles.label}>Image (optional)</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="Image URL (optional)"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {previewImage ? (
          <Image source={{ uri: previewImage }} style={styles.imagePreview} resizeMode="cover" />
        ) : null}
        <View style={styles.imageActions}>
          <AppButton title={previewImage ? 'Change image' : 'Pick image'} onPress={pickImage} />
          {previewImage ? (
            <AppButton title="Remove" variant="secondary" onPress={() => {
              setImageUri(null);
              setImageUrl("");
            }} />
          ) : null}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product name" />

        <View style={styles.formRow}>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
          </View>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>Stock</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Short description" multiline />

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowCategoryOptions((current) => !current)}>
          <Text>{category} ▾</Text>
        </TouchableOpacity>
        {showCategoryOptions ? (
          <View style={styles.pickerOptions}>
            {CATEGORIES.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  setCategory(option);
                  setShowCategoryOptions(false);
                }}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <AppButton title="Save changes" onPress={onSave} style={styles.submitButton} />
        <AppButton title="Delete product" onPress={onDelete} variant="secondary" style={[styles.submitButton, { marginTop: 8 }]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { padding: 18, paddingBottom: 28 },
  heroCard: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 24, backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.secondary, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5, marginBottom: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { color: COLORS.muted, marginTop: 6 },
  formWrap: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: COLORS.text },
  label: { marginTop: 12, marginBottom: 6, color: COLORS.muted },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, backgroundColor: '#f8fafc', marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  fieldColumn: { flex: 1, minWidth: 150 },
  picker: { borderWidth: 1, borderColor: COLORS.border, padding: 14, borderRadius: 14, marginBottom: 10, backgroundColor: COLORS.surface },
  pickerOptions: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.surface, overflow: 'hidden', marginBottom: 10 },
  pickerOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  imagePreview: { width: 140, height: 100, borderRadius: 12, marginBottom: 8, backgroundColor: '#f0f4f8' },
  imageActions: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  submitButton: { marginTop: 8 },
});
