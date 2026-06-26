import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './products';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  stock: number;
  image?: string;
};

const STORAGE_KEY = 'SmartCanteen:cart';
let cart: CartItem[] = [];

const cartChangeListeners = new Set<() => void>();

function notifyCartChange() {
  for (const listener of cartChangeListeners) {
    try {
      listener();
    } catch (err) {
      console.warn('Cart change listener failed', err);
    }
  }
}

async function saveCart(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    notifyCartChange();
  } catch (err) {
    console.warn('Failed to save cart', err);
  }
}

export function subscribeCartChange(listener: () => void): () => void {
  cartChangeListeners.add(listener);
  return () => {
    cartChangeListeners.delete(listener);
  };
}

export async function initCart(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cart = parsed as CartItem[];
    }
  } catch (err) {
    console.warn('Failed to load cart', err);
  }
}

export function listCart(): CartItem[] {
  return cart.slice();
}

export async function addToCart(product: Product, quantity = 1): Promise<void> {
  if (product.stock <= 0) return;
  const effectivePrice = typeof product.discount === 'number' && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      quantity: Math.min(quantity, product.stock),
      category: product.category,
      stock: product.stock,
      image: product.image,
    });
  }
  // Ensure save completes before returning
  await saveCart().catch(err => console.warn('Failed to save cart after addToCart', err));
}

export function updateCartItemQuantity(productId: number, quantity: number): void {
  const item = cart.find((cartItem) => cartItem.productId === productId);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(quantity, item.stock));
  saveCart();
}

export function removeFromCart(productId: number): void {
  cart = cart.filter((item) => item.productId !== productId);
  saveCart();
}

export function clearCart(): void {
  cart = [];
  saveCart();
}

export function cartTotal(): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
