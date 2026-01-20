import { ProductCategory } from "@prisma/client";

export const products = [
  // ================= GROCERIES =================
  {
    name: "Basmati Rice",
    description: "Premium long grain basmati rice",
    price: 120,
    quantity: 200,
    category: ProductCategory.GROCERIES,
  },
  {
    name: "Wheat Flour",
    description: "Whole wheat atta",
    price: 65,
    quantity: 300,
    category: ProductCategory.GROCERIES,
  },
  {
    name: "Sugar",
    description: "Refined white sugar",
    price: 45,
    quantity: 250,
    category: ProductCategory.GROCERIES,
  },
  {
    name: "Salt",
    description: "Iodized cooking salt",
    price: 20,
    quantity: 500,
    category: ProductCategory.GROCERIES,
  },
  {
    name: "Cooking Oil",
    description: "Refined sunflower oil",
    price: 150,
    quantity: 180,
    category: ProductCategory.GROCERIES,
  },

  // ========== FRUITS & VEGETABLES ==========
  {
    name: "Apple",
    description: "Fresh red apples",
    price: 180,
    quantity: 200,
    category: ProductCategory.FRUITS_VEGETABLES,
  },
  {
    name: "Banana",
    description: "Organic bananas",
    price: 50,
    quantity: 300,
    category: ProductCategory.FRUITS_VEGETABLES,
  },
  {
    name: "Orange",
    description: "Juicy oranges",
    price: 90,
    quantity: 250,
    category: ProductCategory.FRUITS_VEGETABLES,
  },
  {
    name: "Tomato",
    description: "Farm fresh tomatoes",
    price: 40,
    quantity: 400,
    category: ProductCategory.FRUITS_VEGETABLES,
  },
  {
    name: "Potato",
    description: "Fresh potatoes",
    price: 35,
    quantity: 500,
    category: ProductCategory.FRUITS_VEGETABLES,
  },

  // ================= DAIRY =================
  {
    name: "Milk 1L",
    description: "Full cream milk",
    price: 60,
    quantity: 300,
    category: ProductCategory.DAIRY,
  },
  {
    name: "Curd",
    description: "Fresh dairy curd",
    price: 50,
    quantity: 200,
    category: ProductCategory.DAIRY,
  },
  {
    name: "Butter",
    description: "Salted butter",
    price: 240,
    quantity: 120,
    category: ProductCategory.DAIRY,
  },
  {
    name: "Cheese Slices",
    description: "Processed cheese slices",
    price: 260,
    quantity: 100,
    category: ProductCategory.DAIRY,
  },

  // ================= BEVERAGES =================
  {
    name: "Orange Juice",
    description: "Fresh orange juice",
    price: 95,
    quantity: 150,
    category: ProductCategory.BEVERAGES,
  },
  {
    name: "Apple Juice",
    description: "Cold pressed apple juice",
    price: 110,
    quantity: 120,
    category: ProductCategory.BEVERAGES,
  },
  {
    name: "Soft Drink",
    description: "Carbonated beverage",
    price: 40,
    quantity: 500,
    category: ProductCategory.BEVERAGES,
  },
  {
    name: "Energy Drink",
    description: "High energy drink",
    price: 125,
    quantity: 200,
    category: ProductCategory.BEVERAGES,
  },

  // ================= SNACKS =================
  {
    name: "Potato Chips",
    description: "Classic salted chips",
    price: 30,
    quantity: 600,
    category: ProductCategory.SNACKS,
  },
  {
    name: "Nachos",
    description: "Cheese flavored nachos",
    price: 55,
    quantity: 350,
    category: ProductCategory.SNACKS,
  },
  {
    name: "Popcorn",
    description: "Butter popcorn",
    price: 45,
    quantity: 300,
    category: ProductCategory.SNACKS,
  },
  {
    name: "Cookies",
    description: "Chocolate chip cookies",
    price: 70,
    quantity: 250,
    category: ProductCategory.SNACKS,
  },

  // ================= BAKERY =================
  {
    name: "White Bread",
    description: "Soft white bread",
    price: 40,
    quantity: 200,
    category: ProductCategory.BAKERY,
  },
  {
    name: "Brown Bread",
    description: "Healthy brown bread",
    price: 45,
    quantity: 180,
    category: ProductCategory.BAKERY,
  },
  {
    name: "Croissant",
    description: "Butter croissant",
    price: 75,
    quantity: 120,
    category: ProductCategory.BAKERY,
  },
  {
    name: "Muffin",
    description: "Chocolate muffin",
    price: 60,
    quantity: 150,
    category: ProductCategory.BAKERY,
  },

  // ================= MEAT & SEAFOOD =================
  {
    name: "Chicken Breast",
    description: "Boneless chicken breast",
    price: 320,
    quantity: 100,
    category: ProductCategory.MEAT_SEAFOOD,
  },
  {
    name: "Chicken Drumsticks",
    description: "Fresh chicken drumsticks",
    price: 280,
    quantity: 120,
    category: ProductCategory.MEAT_SEAFOOD,
  },
  {
    name: "Fish Fillet",
    description: "Fresh fish fillet",
    price: 420,
    quantity: 80,
    category: ProductCategory.MEAT_SEAFOOD,
  },
  {
    name: "Prawns",
    description: "Raw prawns",
    price: 520,
    quantity: 60,
    category: ProductCategory.MEAT_SEAFOOD,
  },

  // ================= HOUSEHOLD =================
  {
    name: "Dishwash Liquid",
    description: "Lemon dishwash liquid",
    price: 110,
    quantity: 200,
    category: ProductCategory.HOUSEHOLD,
  },
  {
    name: "Floor Cleaner",
    description: "Disinfectant floor cleaner",
    price: 180,
    quantity: 150,
    category: ProductCategory.HOUSEHOLD,
  },
  {
    name: "Detergent Powder",
    description: "Laundry detergent powder",
    price: 240,
    quantity: 180,
    category: ProductCategory.HOUSEHOLD,
  },
  {
    name: "Garbage Bags",
    description: "Large size garbage bags",
    price: 90,
    quantity: 300,
    category: ProductCategory.HOUSEHOLD,
  },

  // ================= PERSONAL CARE =================
  {
    name: "Shampoo",
    description: "Herbal shampoo",
    price: 220,
    quantity: 200,
    category: ProductCategory.PERSONAL_CARE,
  },
  {
    name: "Conditioner",
    description: "Hair conditioner",
    price: 210,
    quantity: 180,
    category: ProductCategory.PERSONAL_CARE,
  },
  {
    name: "Toothpaste",
    description: "Mint toothpaste",
    price: 95,
    quantity: 350,
    category: ProductCategory.PERSONAL_CARE,
  },
  {
    name: "Bath Soap",
    description: "Moisturizing soap",
    price: 45,
    quantity: 400,
    category: ProductCategory.PERSONAL_CARE,
  },
];
