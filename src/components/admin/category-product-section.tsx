import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { Product } from "../../lib/products";
import AppButton from "../ui/button";
import { COLORS } from "../ui/theme";

export type CategoryProductSectionProps = {
  title: string;
  products: Product[];
  editingId: number | null;
  editingFields: Record<string, string>;
  onStartEdit: (product: Product) => void;
  onCancelEdit: () => void;
  onDelete: (productId: number) => void;
  onChangeField: (field: string, value: string) => void;
  onSaveEdit: (productId: number) => void;
  onPickImage?: (productId: number) => void;
};

export default function CategoryProductSection({
  title,
  products,
  editingId,
  editingFields,
  onStartEdit,
  onCancelEdit,
  onDelete,
  onChangeField,
  onSaveEdit,
  onPickImage,
}: CategoryProductSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {products.length === 0 ? (
        <Text style={styles.emptyText}>No products in this category yet.</Text>
      ) : (
        products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            {editingId === product.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editingFields.name ?? ""}
                  onChangeText={(value) => onChangeField("name", value)}
                  placeholder="Name"
                />
                <TextInput
                  style={styles.input}
                  value={editingFields.price ?? ""}
                  onChangeText={(value) => onChangeField("price", value)}
                  placeholder="Price"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={styles.input}
                  value={editingFields.stock ?? ""}
                  onChangeText={(value) => onChangeField("stock", value)}
                  placeholder="Stock"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  value={editingFields.description ?? ""}
                  onChangeText={(value) => onChangeField("description", value)}
                  placeholder="Description"
                />
                <TextInput
                  style={styles.input}
                  value={editingFields.image ?? ""}
                  onChangeText={(value) => onChangeField("image", value)}
                  placeholder="Image URL"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {editingFields.image?.trim() ? (
                  <Image source={{ uri: editingFields.image.trim() }} style={styles.imagePreview} resizeMode="cover" />
                ) : null}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  <AppButton title={editingFields.image?.trim() ? 'Change image' : 'Pick image'} onPress={() => onPickImage?.(product.id)} />
                  {editingFields.image?.trim() ? (
                    <AppButton title="Remove" variant="secondary" onPress={() => onChangeField('image', '')} />
                  ) : null}
                </View>
                <TextInput
                  style={styles.input}
                  value={editingFields.category ?? ""}
                  onChangeText={(value) => onChangeField("category", value)}
                  placeholder="Category"
                />
                <View style={styles.splitButtons}>
                  <AppButton title="Save" onPress={() => onSaveEdit(product.id)} style={styles.flexButton} />
                  <AppButton title="Cancel" onPress={onCancelEdit} variant="ghost" style={styles.flexButton} />
                  <AppButton title="Delete" onPress={() => onDelete(product.id)} variant="danger" style={styles.flexButton} />
                </View>
              </>
            ) : (
              <>
                {product.image ? (
                  <Image source={{ uri: product.image }} style={styles.productThumbnail} resizeMode="cover" />
                ) : null}
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.productMeta}>{product.category}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.stockText}>Stock: {product.stock}</Text>
                  <View style={styles.actionGroup}>
                    <AppButton title="Edit" onPress={() => onStartEdit(product)} variant="secondary" style={styles.smallButton} />
                    <AppButton title="Delete" onPress={() => onDelete(product.id)} variant="danger" style={styles.smallButton} />
                  </View>
                </View>
              </>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  sectionHeading: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: COLORS.text },
  emptyText: { color: COLORS.muted, fontSize: 14, marginBottom: 12 },
  productCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  productHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  productName: { fontSize: 16, fontWeight: "700", color: COLORS.text, flex: 1, marginRight: 10 },
  productPrice: { fontWeight: "700", color: COLORS.secondary },
  productMeta: {
    color: COLORS.primary,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  productDescription: { color: COLORS.muted, marginBottom: 10, lineHeight: 20 },
  productThumbnail: { width: '100%', height: 120, borderRadius: 18, marginBottom: 12, backgroundColor: '#f0f4f8' },
  productFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
  stockText: { color: COLORS.text },
  actionGroup: { flexDirection: "row", flexWrap: "wrap" },
  splitButtons: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginTop: 10 },
  flexButton: { flex: 1, minWidth: 100, marginTop: 8, marginRight: 10 },
  smallButton: { minWidth: 120, marginTop: 8, marginRight: 10 },
});