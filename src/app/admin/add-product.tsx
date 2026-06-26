import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import bento from "../../components/ui/bento-styles";
import AppButton from "../../components/ui/button";
import { COLORS } from "../../components/ui/theme";
import { addProduct, CATEGORIES } from "../../lib/products";
import { useRequireRole } from "../../lib/session";

export default function AdminAddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [discount, setDiscount] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const previewImage = imageUri ?? (imageUrl.trim() ? imageUrl.trim() : null);
  const authorized = useRequireRole("admin");

  if (authorized === false) return null;
  if (authorized === null) return null;

  async function onAdd() {
    const p = name.trim();
    const pr = parseFloat(price as any) || 0;
    const st = parseInt(stock as any, 10) || 0;
    if (!p) {
      setMessage('Please enter a product name.');
      return;
    }
    if (pr <= 0) {
      setMessage('Please enter a valid price greater than 0.');
      return;
    }
    const image = imageUri ?? (imageUrl.trim() ? imageUrl.trim() : undefined);
    const percentDiscount = parseFloat(discount as any);
    await addProduct(p, pr, description.trim(), st, category, image, percentDiscount > 0 ? percentDiscount : undefined);
    // navigate back to admin and trigger a refresh
    router.push('/admin?refresh=1');
  }

  async function pickImage() {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setMessage('Permission to access photos is required.');
        return;
      }
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
        console.warn('Image copy failed, using original uri', copyErr);
      }
      setImageUri(destUri);
    } catch (err: any) {
      console.warn('Image pick error', err);
      setMessage('Failed to pick image.');
    }
  }

  function onWebFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl('');
        setImageUri(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={[bento.card, styles.heroCard]}>
        <View style={styles.titleRow}>
          <MaterialIcons name="add-box" size={28} color={COLORS.primary} />
          <Text style={styles.title}>Add Product</Text>
        </View>
        <Text style={styles.subtitle}>Add a new product to the inventory.</Text>
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
        {previewImage ? (
          <Image source={{ uri: previewImage }} style={{ width: 140, height: 100, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
        ) : null}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <AppButton
            title={previewImage ? (Platform.OS === 'web' ? 'Change browser image' : 'Change image') : (Platform.OS === 'web' ? 'Upload from browser' : 'Pick image')}
            onPress={pickImage}
          />
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
        <TouchableOpacity style={styles.picker} onPress={() => setShowCategoryOptions((s) => !s)}>
          <Text>{category} ▾</Text>
        </TouchableOpacity>
        {showCategoryOptions ? (
          <View style={styles.pickerOptions}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.pickerOption}
                onPress={() => {
                  setCategory(c);
                  setShowCategoryOptions(false);
                }}
              >
                <Text>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Text style={styles.label}>Special offer (%)</Text>
        <TextInput
          style={styles.input}
          value={discount}
          onChangeText={setDiscount}
          placeholder="e.g. 10"
          keyboardType="decimal-pad"
        />

        <AppButton title="Add product" onPress={onAdd} style={styles.submitButton} />
        <AppButton title="Cancel" onPress={() => router.push('/admin')} variant="secondary" style={[styles.submitButton, { marginTop: 8 }]} />
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
  submitButton: { marginTop: 8 },
});
