export const SAMPLE_PRODUCTS = [
  { id: 1, name: 'SariSmart Combo', price: '₱135.00', label: 'Best seller', desc: 'A complete meal with sandwich, drink, and snack.', details: ['Popular choice', 'Fast pickup', 'Best value'] },
  { id: 2, name: 'Coke', price: '₱15.00', label: 'Cold drink', desc: 'Refreshing cola for any meal.', details: ['Chilled bottle', 'Favorite refreshment'] },
  { id: 3, name: 'Chips', price: '₱12.00', label: 'Quick snack', desc: 'Crunchy potato chips.', details: ['Light snack', 'Great with drinks'] },
];

export const EXAMPLE_CART_ITEMS = [
  { id: 2, name: 'Coke', price: '₱15.00', qty: 1 },
  { id: 1, name: 'SariSmart Combo', price: '₱135.00', qty: 1 },
];

export const EXAMPLE_NAV = [
  { href: '/examples/customer', title: 'Customer area', description: 'Browse menu items and open product details.', icon: 'shopping-bag' },
  { href: '/examples/product?id=1', title: 'Product detail', description: 'Inspect an item and add it to the cart.', icon: 'inventory' },
  { href: '/examples/cart', title: 'Cart review', description: 'Review selected items and totals.', icon: 'shopping-cart' },
  { href: '/examples/checkout', title: 'Checkout flow', description: 'Complete a mock order and return.', icon: 'payment' },
];

export function getProductById(id: string | number) {
  const lookup = String(id);
  return SAMPLE_PRODUCTS.find((product) => String(product.id) === lookup) ?? SAMPLE_PRODUCTS[0];
}

export function getCartTotal(items: Array<{ price: string; qty: number }>) {
  return items.reduce((sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.qty, 0);
}
