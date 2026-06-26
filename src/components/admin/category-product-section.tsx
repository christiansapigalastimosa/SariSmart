import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, TextInput, View } from "react-native";
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
  confirmTargetId: number | null;
  confirmMessage: string;
  confirmLabel?: string;
  onConfirmDelete: (productId: number) => void;
  onCancelDelete: () => void;
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
  confirmTargetId,
  confirmMessage,
  confirmLabel,
  onConfirmDelete,
  onCancelDelete,
  onChangeField,
  onSaveEdit,
  onPickImage,
}: CategoryProductSectionProps) {
  const router = useRouter();
  const confirmAnim = useRef(new Animated.Value(confirmTargetId === null ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(confirmAnim, {
      toValue: confirmTargetId !== null ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [confirmTargetId, confirmAnim]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {products.length === 0 ? (
        <Text style={styles.emptyText}>No products in this category yet.</Text>
      ) : (
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={[styles.productCard, editingId === product.id && styles.productCardEditing]}>
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
                <TextInput
                  style={styles.input}
                  value={editingFields.discount ?? ""}
                  onChangeText={(value) => onChangeField("discount", value)}
                  placeholder="Special offer %"
                  keyboardType="decimal-pad"
                />
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
                {confirmTargetId === product.id ? (
                  <Animated.View
                    style={[
                      styles.inlineConfirmBox,
                      {
                        opacity: confirmAnim,
                        transform: [
                          {
                            translateY: confirmAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [6, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.inlineConfirmText}>{confirmMessage}</Text>
                    <View style={styles.inlineConfirmActions}>
                      <AppButton title="Cancel" variant="secondary" onPress={onCancelDelete} style={styles.inlineButton} />
                      <AppButton title={confirmLabel ?? 'Delete'} variant="danger" onPress={() => onConfirmDelete(product.id)} style={styles.inlineButton} />
                    </View>
                  </Animated.View>
                ) : null}
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
                {product.discount ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>Special offer {product.discount}% off</Text>
                  </View>
                ) : null}
                <Text style={styles.productMeta}>{product.category}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                {product.stock < 10 && (
                  <View style={styles.stockAlertContainer}>
                    <MaterialIcons name="warning" size={16} color="#dc2626" />
                    <Text style={styles.stockAlertText}>Low stock alert - {product.stock} item{product.stock !== 1 ? 's' : ''} remaining</Text>
                  </View>
                )}
                <View style={styles.productFooter}>
                  <Text style={[styles.stockText, product.stock < 10 && styles.lowStockText]}>
                    Stock: {product.stock}
                  </Text>
                  <View style={styles.actionGroup}>
                    <AppButton title="Edit" onPress={() => router.push(`/admin/edit-product/${product.id}`)} variant="secondary" style={styles.smallButton} />
                    <AppButton title="Delete" onPress={() => onDelete(product.id)} variant="danger" style={styles.smallButton} />
                  </View>
                </View>
                {confirmTargetId === product.id ? (
                  <Animated.View
                    style={[
                      styles.inlineConfirmBox,
                      {
                        opacity: confirmAnim,
                        transform: [
                          {
                            translateY: confirmAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [6, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.inlineConfirmText}>{confirmMessage}</Text>
                    <View style={styles.inlineConfirmActions}>
                      <AppButton title="Cancel" variant="secondary" onPress={onCancelDelete} style={styles.inlineButton} />
                      <AppButton title={confirmLabel ?? 'Delete'} variant="danger" onPress={() => onConfirmDelete(product.id)} style={styles.inlineButton} />
                    </View>
                  </Animated.View>
                ) : null}
              </>
            )}
          </View>
        ))}
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  sectionHeading: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: COLORS.text },
  emptyText: { color: COLORS.muted, fontSize: 14, marginBottom: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productCard: {
    flexBasis: '48%',
    width: '48%',
    minWidth: 180,
    maxWidth: 280,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    alignSelf: 'flex-start',
  },
  productCardEditing: {
    width: '100%',
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
  lowStockText: { color: '#dc2626', fontWeight: '600' },
  stockAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  stockAlertText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
    marginBottom: 8,
  },
  discountText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  actionGroup: { flexDirection: "row", flexWrap: "wrap" },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#f0f4f8',
  },
  splitButtons: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginTop: 10 },
  flexButton: { flex: 1, minWidth: 100, marginTop: 8, marginRight: 10 },
  smallButton: { minWidth: 120, marginTop: 8, marginRight: 10 },
  inlineConfirmBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inlineConfirmText: {
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 18,
    fontSize: 13,
  },
  inlineConfirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  inlineButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});