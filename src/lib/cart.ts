import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './products';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  stock: number;
};

const STORAGE_KEY = 'SariSmart:cart';
let cart: CartItem[] = [];

async function saveCart(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn('Failed to save cart', err);
  }
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

export function addToCart(product: Product, quantity = 1): void {
  if (product.stock <= 0) return;
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: Math.min(quantity, product.stock),
      category: product.category,
      stock: product.stock,
    });
  }
  saveCart();
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
