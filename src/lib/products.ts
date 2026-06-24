import AsyncStorage from '@react-native-async-storage/async-storage';

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock: number;
  category: string;
  image?: string;
};

export const CATEGORIES = ["Drinks", "Snacks", "Meal"];

const STORAGE_KEY = "SariSmart:products";

let products: Product[] = [
  { id: 1, name: "Coke", price: 15.0, description: "Chilled soda to refresh your day.", stock: 20, category: "Drinks" },
  { id: 2, name: "Iced Tea", price: 20.0, description: "Sweet iced tea with lemon.", stock: 15, category: "Drinks" },
  { id: 3, name: "Lemonade", price: 18.0, description: "Fresh squeezed lemonade.", stock: 18, category: "Drinks" },
  { id: 4, name: "Orange Juice", price: 28.0, description: "Pure orange juice.", stock: 16, category: "Drinks" },
  { id: 5, name: "Mango Shake", price: 35.0, description: "Creamy mango shake.", stock: 14, category: "Drinks" },
  { id: 6, name: "Bottled Water", price: 10.0, description: "Still water to stay hydrated.", stock: 40, category: "Drinks" },
  { id: 7, name: "Sparkling Water", price: 18.0, description: "Refreshingly fizzy water.", stock: 22, category: "Drinks" },
  { id: 8, name: "Fruit Punch", price: 25.0, description: "Sweet fruit punch.", stock: 20, category: "Drinks" },
  { id: 9, name: "Coffee", price: 30.0, description: "Hot brewed coffee.", stock: 18, category: "Drinks" },
  { id: 10, name: "Cappuccino", price: 45.0, description: "Creamy cappuccino with foam.", stock: 12, category: "Drinks" },
  { id: 11, name: "Latte", price: 48.0, description: "Smooth latte with steamed milk.", stock: 14, category: "Drinks" },
  { id: 12, name: "Hot Chocolate", price: 38.0, description: "Warm, sweet hot chocolate.", stock: 16, category: "Drinks" },
  { id: 13, name: "Green Tea", price: 22.0, description: "Light and soothing green tea.", stock: 18, category: "Drinks" },
  { id: 14, name: "Matcha Latte", price: 50.0, description: "Rich matcha latte.", stock: 10, category: "Drinks" },
  { id: 15, name: "Energy Drink", price: 40.0, description: "Boost your energy.", stock: 20, category: "Drinks" },
  { id: 16, name: "Smoothie", price: 55.0, description: "Mixed berry smoothie.", stock: 12, category: "Drinks" },
  { id: 17, name: "Pineapple Juice", price: 28.0, description: "Fresh pineapple juice.", stock: 15, category: "Drinks" },
  { id: 18, name: "Apple Juice", price: 28.0, description: "Fresh apple juice.", stock: 15, category: "Drinks" },
  { id: 19, name: "Milk Tea", price: 32.0, description: "Classic milk tea.", stock: 18, category: "Drinks" },
  { id: 20, name: "Mineral Water", price: 12.0, description: "Mineral-rich water.", stock: 32, category: "Drinks" },
  { id: 21, name: "Soda Float", price: 40.0, description: "Soda with ice cream.", stock: 10, category: "Drinks" },
  { id: 22, name: "Strawberry Shake", price: 38.0, description: "Creamy strawberry shake.", stock: 14, category: "Drinks" },
  { id: 23, name: "Chocolate Milk", price: 28.0, description: "Cold chocolate milk.", stock: 20, category: "Drinks" },
  { id: 24, name: "Cold Brew", price: 50.0, description: "Slow-brewed cold coffee.", stock: 12, category: "Drinks" },
  { id: 25, name: "Iced Coffee", price: 42.0, description: "Chilled iced coffee.", stock: 16, category: "Drinks" },
  { id: 26, name: "Ginger Ale", price: 22.0, description: "Crisp ginger ale.", stock: 20, category: "Drinks" },
  { id: 27, name: "Root Beer", price: 22.0, description: "Classic root beer.", stock: 20, category: "Drinks" },
  { id: 28, name: "Peach Tea", price: 25.0, description: "Sweet peach tea.", stock: 18, category: "Drinks" },
  { id: 29, name: "Cranberry Juice", price: 28.0, description: "Tart cranberry juice.", stock: 14, category: "Drinks" },
  { id: 30, name: "Coconut Water", price: 35.0, description: "Refreshing coconut water.", stock: 16, category: "Drinks" },
  { id: 31, name: "Chips", price: 12.0, description: "Crunchy potato chips.", stock: 25, category: "Snacks" },
  { id: 32, name: "Cookie", price: 8.5, description: "Fresh cookie with chocolate chunks.", stock: 30, category: "Snacks" },
  { id: 33, name: "Granola Bar", price: 14.0, description: "Healthy granola bar.", stock: 24, category: "Snacks" },
  { id: 34, name: "Popcorn", price: 18.0, description: "Buttery popcorn.", stock: 20, category: "Snacks" },
  { id: 35, name: "Pretzel", price: 15.0, description: "Soft salted pretzel.", stock: 22, category: "Snacks" },
  { id: 36, name: "Nuts Mix", price: 28.0, description: "Mixed nuts snack.", stock: 18, category: "Snacks" },
  { id: 37, name: "Fruit Cup", price: 22.0, description: "Fresh mixed fruit cup.", stock: 20, category: "Snacks" },
  { id: 38, name: "Yogurt Parfait", price: 35.0, description: "Creamy yogurt and granola.", stock: 16, category: "Snacks" },
  { id: 39, name: "Cheese Sticks", price: 18.0, description: "Melted cheese sticks.", stock: 18, category: "Snacks" },
  { id: 40, name: "Crackers", price: 12.0, description: "Crispy crackers.", stock: 22, category: "Snacks" },
  { id: 41, name: "Brownie", price: 25.0, description: "Chocolate brownie.", stock: 18, category: "Snacks" },
  { id: 42, name: "Muffin", price: 20.0, description: "Blueberry muffin.", stock: 18, category: "Snacks" },
  { id: 43, name: "Donut", price: 18.0, description: "Glazed donut.", stock: 24, category: "Snacks" },
  { id: 44, name: "Trail Mix", price: 26.0, description: "Sweet and salty trail mix.", stock: 20, category: "Snacks" },
  { id: 45, name: "Rice Cake", price: 14.0, description: "Light rice cakes.", stock: 26, category: "Snacks" },
  { id: 46, name: "Candy Bar", price: 18.0, description: "Chocolate candy bar.", stock: 28, category: "Snacks" },
  { id: 47, name: "Fruit Snack", price: 16.0, description: "Fruit-flavored snack.", stock: 24, category: "Snacks" },
  { id: 48, name: "Potato Wedges", price: 30.0, description: "Crispy potato wedges.", stock: 16, category: "Snacks" },
  { id: 49, name: "Nachos", price: 34.0, description: "Loaded nachos.", stock: 14, category: "Snacks" },
  { id: 50, name: "Biscuit", price: 10.0, description: "Buttery biscuit.", stock: 30, category: "Snacks" },
  { id: 51, name: "Mozzarella Sticks", price: 36.0, description: "Crispy cheese sticks.", stock: 14, category: "Snacks" },
  { id: 52, name: "Veggie Sticks", price: 22.0, description: "Crunchy vegetable sticks.", stock: 20, category: "Snacks" },
  { id: 53, name: "Hummus & Pita", price: 32.0, description: "Creamy hummus with pita.", stock: 16, category: "Snacks" },
  { id: 54, name: "Cupcake", price: 24.0, description: "Vanilla cupcake.", stock: 18, category: "Snacks" },
  { id: 55, name: "Pita Chips", price: 20.0, description: "Crispy pita chips.", stock: 22, category: "Snacks" },
  { id: 56, name: "Energy Bites", price: 28.0, description: "Nutty energy bites.", stock: 18, category: "Snacks" },
  { id: 57, name: "Peanut Butter Cups", price: 22.0, description: "Chocolate peanut butter cups.", stock: 20, category: "Snacks" },
  { id: 58, name: "Dried Mango", price: 26.0, description: "Sweet dried mango.", stock: 18, category: "Snacks" },
  { id: 59, name: "Oatmeal Cookie", price: 16.0, description: "Chewy oatmeal cookie.", stock: 24, category: "Snacks" },
  { id: 60, name: "Cheese Puff", price: 14.0, description: "Light cheese puff.", stock: 26, category: "Snacks" },
  { id: 61, name: "Chicken Sandwich", price: 65.0, description: "Hearty chicken sandwich with lettuce.", stock: 12, category: "Meal" },
  { id: 62, name: "Rice Bowl", price: 75.0, description: "Savory rice bowl with vegetables.", stock: 10, category: "Meal" },
  { id: 63, name: "Beef Burger", price: 95.0, description: "Juicy beef burger with cheese.", stock: 14, category: "Meal" },
  { id: 64, name: "Veggie Wrap", price: 55.0, description: "Fresh veggie wrap.", stock: 16, category: "Meal" },
  { id: 65, name: "Pasta", price: 80.0, description: "Pasta with tomato sauce.", stock: 12, category: "Meal" },
  { id: 66, name: "Fried Rice", price: 70.0, description: "Soy-fried rice with egg.", stock: 14, category: "Meal" },
  { id: 67, name: "Chicken Salad", price: 68.0, description: "Grilled chicken salad.", stock: 12, category: "Meal" },
  { id: 68, name: "Fish Tacos", price: 85.0, description: "Crispy fish tacos.", stock: 10, category: "Meal" },
  { id: 69, name: "Grilled Cheese", price: 50.0, description: "Melted cheese sandwich.", stock: 16, category: "Meal" },
  { id: 70, name: "Pizza Slice", price: 60.0, description: "Classic pizza slice.", stock: 18, category: "Meal" },
  { id: 71, name: "Burrito", price: 78.0, description: "Bean and cheese burrito.", stock: 14, category: "Meal" },
  { id: 72, name: "Noodle Soup", price: 65.0, description: "Savory noodle soup.", stock: 16, category: "Meal" },
  { id: 73, name: "Omelette", price: 55.0, description: "Cheese omelette.", stock: 18, category: "Meal" },
  { id: 74, name: "Panini", price: 72.0, description: "Grilled panini sandwich.", stock: 12, category: "Meal" },
  { id: 75, name: "Sushi Roll", price: 110.0, description: "California sushi roll.", stock: 10, category: "Meal" },
  { id: 76, name: "Quinoa Bowl", price: 85.0, description: "Healthy quinoa bowl.", stock: 12, category: "Meal" },
  { id: 77, name: "Steak & Rice", price: 120.0, description: "Steak served with rice.", stock: 8, category: "Meal" },
  { id: 78, name: "Meat Pie", price: 60.0, description: "Savory meat pie.", stock: 14, category: "Meal" },
  { id: 79, name: "Taco Salad", price: 72.0, description: "Spicy taco salad.", stock: 12, category: "Meal" },
  { id: 80, name: "Curry Rice", price: 78.0, description: "Warm curry rice.", stock: 12, category: "Meal" },
  { id: 81, name: "Pasta Primavera", price: 88.0, description: "Vegetable pasta.", stock: 12, category: "Meal" },
  { id: 82, name: "Shepherd's Pie", price: 90.0, description: "Comforting shepherd's pie.", stock: 10, category: "Meal" },
  { id: 83, name: "Chicken Alfredo", price: 95.0, description: "Creamy chicken Alfredo.", stock: 10, category: "Meal" },
  { id: 84, name: "Fish & Chips", price: 92.0, description: "Classic fish and chips.", stock: 10, category: "Meal" },
  { id: 85, name: "Vegetable Stir Fry", price: 75.0, description: "Stir fried veggies.", stock: 14, category: "Meal" },
  { id: 86, name: "Pulled Pork Sandwich", price: 92.0, description: "Pulled pork with slaw.", stock: 10, category: "Meal" },
  { id: 87, name: "Lasagna", price: 98.0, description: "Baked lasagna.", stock: 10, category: "Meal" },
  { id: 88, name: "Baked Potato", price: 55.0, description: "Loaded baked potato.", stock: 16, category: "Meal" },
  { id: 89, name: "Caesar Salad", price: 70.0, description: "Crisp Caesar salad.", stock: 14, category: "Meal" },
  { id: 90, name: "Shrimp Pasta", price: 110.0, description: "Shrimp pasta in garlic sauce.", stock: 10, category: "Meal" },
];

let nextId = 91;

async function saveProducts(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ products, nextId }));
  } catch (err) {
    // ignore storage errors for now
    console.warn("Failed to save products", err);
  }
}

export async function initProducts(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.products)) {
      products = parsed.products as Product[];
    }
    if (typeof parsed.nextId === "number") nextId = parsed.nextId;
  } catch (err) {
    console.warn("Failed to load products", err);
  }
}

export function addProduct(name: string, price: number, description?: string, stock: number = 0, category: string = "Other", image?: string): Product {
  const p: Product = { id: nextId++, name, price, description, stock, category, image };
  products.push(p);
  // fire and forget save
  saveProducts();
  return p;
}

export async function reduceProductStock(productId: number, quantity: number): Promise<void> {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  product.stock = Math.max(0, product.stock - quantity);
  await saveProducts();
}

export async function updateProductStock(productId: number, stock: number): Promise<void> {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  product.stock = Math.max(0, Math.floor(stock));
  await saveProducts();
}

type UpdateProductData = Omit<Partial<Product>, 'image'> & { image?: string | null };

export async function updateProduct(productId: number, data: UpdateProductData): Promise<void> {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  if (typeof data.name === 'string') product.name = data.name;
  if (typeof data.price === 'number') product.price = data.price;
  if (typeof data.description === 'string') product.description = data.description;
  if (typeof data.stock === 'number') product.stock = Math.max(0, Math.floor(data.stock));
  if (typeof data.category === 'string') product.category = data.category;
  if (typeof data.image === 'string') product.image = data.image;
  if (data.image === null) delete product.image;
  await saveProducts();
}

export function getProductById(productId: number): Product | undefined {
  return products.find((p) => p.id === productId);
}

export async function deleteProduct(productId: number): Promise<void> {
  products = products.filter((p) => p.id !== productId);
  await saveProducts();
}

export function listProducts(): Product[] {
  // return newest-first
  return products.slice().reverse();
}
