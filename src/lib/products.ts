import AsyncStorage from '@react-native-async-storage/async-storage';

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock: number;
  category: string;
  image?: string;
  discount?: number;
};

export const CATEGORIES = ["Drinks", "Snacks", "Meal", "Combo"];

const STORAGE_KEY = "SmartCanteen:products";

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
  { id: 91, name: "Classic Combo", price: 125.0, description: "Chicken sandwich with Coke and chips.", stock: 15, category: "Combo", image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80" },
  { id: 92, name: "Burger Combo", price: 145.0, description: "Beef burger with fries and Sprite.", stock: 12, category: "Combo", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80" },
  { id: 93, name: "Rice & Drink Combo", price: 110.0, description: "Rice bowl with egg and iced tea.", stock: 14, category: "Combo", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
  { id: 94, name: "Wrap & Juice Combo", price: 95.0, description: "Veggie wrap with orange juice and cookie.", stock: 16, category: "Combo", image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80" },
  { id: 95, name: "Pizza Party Combo", price: 130.0, description: "Pizza slice with mozzarella sticks and cola.", stock: 12, category: "Combo", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80" },
  { id: 96, name: "Pasta Special Combo", price: 150.0, description: "Pasta with garlic bread, salad and cappuccino.", stock: 10, category: "Combo", image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80" },
  { id: 97, name: "Taco Fiesta Combo", price: 135.0, description: "Fish tacos with nachos and mango shake.", stock: 11, category: "Combo", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
  { id: 98, name: "Salad & Smoothie Combo", price: 120.0, description: "Caesar salad with smoothie and granola bar.", stock: 13, category: "Combo", image: "https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=800&q=80" },
  { id: 99, name: "Breakfast Combo", price: 105.0, description: "Omelette with toast, coffee and pastry.", stock: 14, category: "Combo", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" },
  { id: 100, name: "Seafood Combo", price: 160.0, description: "Shrimp pasta with latte and fruit cup.", stock: 9, category: "Combo", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
  { id: 101, name: "Grilled Delight Combo", price: 140.0, description: "Grilled cheese with panini and iced coffee.", stock: 12, category: "Combo", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80" },
  { id: 102, name: "Spicy Combo", price: 130.0, description: "Taco salad with curry rice and energy drink.", stock: 11, category: "Combo", image: "https://images.unsplash.com/photo-1510626176961-4b37b4645829?auto=format&fit=crop&w=800&q=80" },
  { id: 103, name: "Curry Feast Combo", price: 135.0, description: "Curry rice with samosa and milk tea.", stock: 12, category: "Combo", image: "https://images.unsplash.com/photo-1603052875660-8d9afb5f8f85?auto=format&fit=crop&w=800&q=80" },
  { id: 104, name: "Veggie Lover Combo", price: 120.0, description: "Vegetable stir fry with quinoa bowl and green tea.", stock: 13, category: "Combo", image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80" },
  { id: 105, name: "Meat Feast Combo", price: 155.0, description: "Pulled pork sandwich with steak rice and coke.", stock: 10, category: "Combo", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80" },
  { id: 106, name: "Asian Fusion Combo", price: 145.0, description: "Sushi roll with noodle soup and matcha latte.", stock: 11, category: "Combo", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  { id: 107, name: "Shepherd's Choice Combo", price: 150.0, description: "Shepherd's pie with baked potato and hot chocolate.", stock: 10, category: "Combo", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  { id: 108, name: "Alfredo Dreams Combo", price: 155.0, description: "Chicken Alfredo with Caesar salad and latte.", stock: 10, category: "Combo", image: "https://images.unsplash.com/photo-1512058564366-c9b08a23c6a7?auto=format&fit=crop&w=800&q=80" },
  { id: 109, name: "Lasagna Night Combo", price: 155.0, description: "Lasagna with garlic bread and red wine (or grape juice).", stock: 10, category: "Combo", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  { id: 110, name: "Fish & Fun Combo", price: 150.0, description: "Fish and chips with fruit snack and mineral water.", stock: 11, category: "Combo", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
  { id: 111, name: "Roasted Chicken Combo", price: 140.0, description: "Roasted chicken with rice pilaf and latte.", stock: 12, category: "Combo", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80" },
  { id: 112, name: "BBQ Delight Combo", price: 155.0, description: "BBQ ribs with cornbread and iced tea.", stock: 10, category: "Combo", image: "https://images.unsplash.com/photo-1598511729148-33ec45b12f1a?auto=format&fit=crop&w=800&q=80" },
  { id: 113, name: "Sandwich Duo Combo", price: 125.0, description: "Turkey and cheese sandwich with chips and juice.", stock: 14, category: "Combo", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
  { id: 114, name: "Thai Green Combo", price: 145.0, description: "Green curry with rice and Thai iced tea.", stock: 11, category: "Combo", image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80" },
  { id: 115, name: "Mexican Night Combo", price: 138.0, description: "Enchiladas with refried beans and agua fresca.", stock: 12, category: "Combo" },
  { id: 116, name: "Italian Dream Combo", price: 160.0, description: "Ravioli with garlic bread, salad and wine (juice).", stock: 10, category: "Combo" },
  { id: 117, name: "Greek Island Combo", price: 135.0, description: "Souvlaki with Greek salad and ouzo (lemonade).", stock: 13, category: "Combo" },
  { id: 118, name: "Japanese Delight Combo", price: 155.0, description: "Tonkatsu with miso soup and green tea.", stock: 10, category: "Combo" },
  { id: 119, name: "Korean BBQ Combo", price: 150.0, description: "Korean BBQ beef with bibimbap and soju (cola).", stock: 11, category: "Combo" },
  { id: 120, name: "Indian Spice Combo", price: 135.0, description: "Butter chicken with naan and mango lassi.", stock: 12, category: "Combo" },
  { id: 121, name: "Spanish Fiesta Combo", price: 148.0, description: "Paella with chorizo and sangria (punch).", stock: 10, category: "Combo" },
  { id: 122, name: "Portuguese Sunrise Combo", price: 140.0, description: "Grilled sardines with rice and white wine (juice).", stock: 11, category: "Combo" },
  { id: 123, name: "Turkish Treasures Combo", price: 142.0, description: "Kebab with pita and Turkish coffee.", stock: 12, category: "Combo" },
  { id: 124, name: "Lebanese Feast Combo", price: 138.0, description: "Falafel wrap with hummus and mint lemonade.", stock: 13, category: "Combo" },
  { id: 125, name: "Vietnamese Pho Combo", price: 130.0, description: "Pho beef with spring rolls and iced coffee.", stock: 14, category: "Combo" },
  { id: 126, name: "Filipino Pride Combo", price: 125.0, description: "Adobo with jasmine rice and iced mango juice.", stock: 15, category: "Combo" },
  { id: 127, name: "Brazilian Churrasco Combo", price: 160.0, description: "Churrasco with black beans rice and caipirinha (punch).", stock: 10, category: "Combo" },
  { id: 128, name: "Argentine Asado Combo", price: 165.0, description: "Grilled steak with chimichurri, empanada and Malbec (cola).", stock: 9, category: "Combo" },
  { id: 129, name: "Middle East Mix Combo", price: 135.0, description: "Mixed grilled meats with tahini salad and pomegranate juice.", stock: 12, category: "Combo" },
  { id: 130, name: "African Fusion Combo", price: 140.0, description: "Jollof rice with plantains and okra soup.", stock: 11, category: "Combo" },
  { id: 131, name: "Hawaiian Island Combo", price: 145.0, description: "Kalua pork with rice and tropical juice.", stock: 12, category: "Combo" },
  { id: 132, name: "Mediterranean Escape Combo", price: 150.0, description: "Mezze platter with pita, hummus and lemonade.", stock: 11, category: "Combo" },
  { id: 133, name: "Caribbean Sunset Combo", price: 140.0, description: "Jerk chicken with plantain and mango punch.", stock: 12, category: "Combo" },
  { id: 134, name: "Moroccan Magic Combo", price: 145.0, description: "Tagine with couscous and mint tea.", stock: 10, category: "Combo" },
  { id: 135, name: "Swiss Alpine Combo", price: 155.0, description: "Fondue with bread and Swiss hot chocolate.", stock: 9, category: "Combo" },
  { id: 136, name: "Scandinavian Dream Combo", price: 140.0, description: "Salmon with rye bread and aquavit (juice).", stock: 11, category: "Combo" },
  { id: 137, name: "Russian Winter Combo", price: 135.0, description: "Beef stroganoff with beet salad and vodka (juice).", stock: 12, category: "Combo" },
  { id: 138, name: "Hungarian Goulash Combo", price: 140.0, description: "Goulash with sour cream and paprika bread.", stock: 11, category: "Combo" },
  { id: 139, name: "Polish Pierogi Combo", price: 130.0, description: "Pierogi with kielbasa and sour cream sauce.", stock: 13, category: "Combo" },
  { id: 140, name: "Czech Schnitzel Combo", price: 135.0, description: "Breaded schnitzel with potato salad and beer (cola).", stock: 12, category: "Combo" },
  { id: 141, name: "Austrian Wiener Combo", price: 145.0, description: "Wiener schnitzel with spätzle and apple strudel.", stock: 10, category: "Combo" },
  { id: 142, name: "Dutch Cheese Combo", price: 130.0, description: "Cheese croquettes with fries and cream sauce.", stock: 14, category: "Combo" },
  { id: 143, name: "Belgian Waffle Combo", price: 125.0, description: "Waffle with chocolate sauce and whipped cream.", stock: 15, category: "Combo" },
  { id: 144, name: "French Bistro Combo", price: 160.0, description: "Coq au vin with haricots and French bread.", stock: 10, category: "Combo" },
  { id: 145, name: "Swiss Raclette Combo", price: 155.0, description: "Raclette with potatoes, bread and pickles.", stock: 9, category: "Combo" },
  { id: 146, name: "Irish Stew Combo", price: 135.0, description: "Irish lamb stew with soda bread and Guinness (cola).", stock: 12, category: "Combo" },
  { id: 147, name: "Scottish Haggis Combo", price: 145.0, description: "Haggis with neeps and tatties.", stock: 10, category: "Combo" },
  { id: 148, name: "Welsh Rarebit Combo", price: 125.0, description: "Welsh cheese rarebit on toast with ham.", stock: 13, category: "Combo" },
  { id: 149, name: "Nordic Salmon Combo", price: 155.0, description: "Cured salmon with dark bread and dill sauce.", stock: 11, category: "Combo" },
  { id: 150, name: "Balkan Kebab Combo", price: 130.0, description: "Cevapcici with ajvar and pita bread.", stock: 14, category: "Combo" },
  { id: 151, name: "Caucasus Mountain Combo", price: 140.0, description: "Khachapuri with khinkali dumplings.", stock: 12, category: "Combo" },
  { id: 152, name: "Levantine Mezze Combo", price: 135.0, description: "Mixed mezze with fattoush salad and lemonade.", stock: 13, category: "Combo" },
  { id: 153, name: "Persian Royal Combo", price: 150.0, description: "Tahdig rice with kebab koobideh and saffron tea.", stock: 10, category: "Combo" },
  { id: 154, name: "Pakistani Biryani Combo", price: 140.0, description: "Chicken biryani with raita and naan.", stock: 12, category: "Combo" },
  { id: 155, name: "Bangladeshi Curry Combo", price: 125.0, description: "Fish curry with rice and dhal bread.", stock: 14, category: "Combo" },
  { id: 156, name: "Sri Lankan Spice Combo", price: 130.0, description: "Lamprais with sambols and lime juice.", stock: 13, category: "Combo" },
  { id: 157, name: "Malaysian Night Combo", price: 140.0, description: "Rendang with coconut rice and teh tarik.", stock: 12, category: "Combo" },
  { id: 158, name: "Singaporean Hawker Combo", price: 135.0, description: "Chicken rice with laksa soup and teh tarik.", stock: 13, category: "Combo" },
  { id: 159, name: "Indonesian Island Combo", price: 145.0, description: "Gado-gado with satay and iced coffee.", stock: 11, category: "Combo" },
  { id: 160, name: "Burmese Shan Combo", price: 130.0, description: "Shan noodles with pickled vegetables and tea.", stock: 12, category: "Combo" },
];

let nextId = 161;

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

export async function addProduct(name: string, price: number, description?: string, stock: number = 0, category: string = "Other", image?: string, discount?: number): Promise<Product> {
  const p: Product = { id: nextId++, name, price, description, stock, category, image };
  if (typeof discount === 'number' && discount > 0) {
    p.discount = discount;
  }
  products.push(p);
  // fire and forget save
  await saveProducts();
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
  if (typeof data.discount === 'number') {
    if (data.discount > 0) {
      product.discount = data.discount;
    } else {
      delete product.discount;
    }
  }
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
