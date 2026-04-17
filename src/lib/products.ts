/**
 * Mock product data aggregator
 * Simulates cross-platform e-commerce search (Amazon, Flipkart, Meesho, Myntra, etc.)
 * In production: replace with real API calls / web crawlers
 */
import type { Product, PlatformListing } from "@/types";

const CATEGORIES = [
  "Electronics", "Fashion", "Home & Kitchen", "Sports & Fitness",
  "Beauty & Personal Care", "Books", "Toys & Games", "Automotive",
  "Health", "Grocery", "Furniture", "Jewellery"
];

const PLATFORMS = ["amazon", "flipkart", "meesho", "myntra"] as const;

// Mock product database - expanded to cover all e-commerce categories
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1", name: "Sony WH-1000XM5 Wireless Headphones", description: "Industry-leading noise cancellation, 30hr battery, premium sound",
    category: "Electronics", brand: "Sony", imageURL: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    price: 24999, originalPrice: 34999, discount: 29, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.8, reviews: 15420, inStock: true, tags: ["headphones", "wireless", "noise cancelling"], createdAt: new Date()
  },
  {
    id: "p2", name: "iPhone 15 Pro Max 256GB", description: "A17 Pro chip, ProRes video, titanium design",
    category: "Electronics", brand: "Apple", imageURL: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    price: 134900, originalPrice: 159900, discount: 16, platform: "flipkart", platformUrl: "https://flipkart.com",
    rating: 4.7, reviews: 8234, inStock: true, tags: ["iphone", "smartphone", "apple"], createdAt: new Date()
  },
  {
    id: "p3", name: "Nike Air Max 270 Running Shoes", description: "Max cushioning for all-day comfort, stylish design",
    category: "Fashion", brand: "Nike", imageURL: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    price: 8995, originalPrice: 12995, discount: 31, platform: "myntra", platformUrl: "https://myntra.com",
    rating: 4.5, reviews: 23100, inStock: true, sizes: ["7", "8", "9", "10", "11"], colors: ["Black", "White", "Red"],
    tags: ["shoes", "running", "nike"], createdAt: new Date()
  },
  {
    id: "p4", name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker", description: "7-in-1 multi-use programmable, 5.7L capacity",
    category: "Home & Kitchen", brand: "Instant Pot", imageURL: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400",
    price: 6499, originalPrice: 9999, discount: 35, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.6, reviews: 45000, inStock: true, tags: ["pressure cooker", "kitchen", "instant pot"], createdAt: new Date()
  },
  {
    id: "p5", name: "Samsung 65\" 4K QLED Smart TV", description: "Quantum Dot technology, Alexa built-in, Motion Xcelerator",
    category: "Electronics", brand: "Samsung", imageURL: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
    price: 89999, originalPrice: 129999, discount: 31, platform: "flipkart", platformUrl: "https://flipkart.com",
    rating: 4.4, reviews: 6700, inStock: true, tags: ["tv", "samsung", "smart tv", "4k"], createdAt: new Date()
  },
  {
    id: "p6", name: "Levi's 511 Slim Fit Jeans", description: "Classic slim fit, premium denim, versatile style",
    category: "Fashion", brand: "Levi's", imageURL: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    price: 2699, originalPrice: 3999, discount: 33, platform: "meesho", platformUrl: "https://meesho.com",
    rating: 4.3, reviews: 12300, inStock: true, sizes: ["28", "30", "32", "34", "36"], colors: ["Blue", "Black", "Grey"],
    tags: ["jeans", "levis", "fashion"], createdAt: new Date()
  },
  {
    id: "p7", name: "Dyson V15 Detect Cordless Vacuum", description: "Most powerful Dyson, laser dust detection, 60min battery",
    category: "Home & Kitchen", brand: "Dyson", imageURL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    price: 52900, originalPrice: 64900, discount: 18, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.7, reviews: 3200, inStock: true, tags: ["vacuum", "dyson", "cordless"], createdAt: new Date()
  },
  {
    id: "p8", name: "MacBook Air M3 13-inch 8GB 256GB", description: "M3 chip, 18hr battery, MagSafe charging, Liquid Retina display",
    category: "Electronics", brand: "Apple", imageURL: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 114900, originalPrice: 134900, discount: 15, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.9, reviews: 5600, inStock: true, colors: ["Midnight", "Starlight", "Space Grey"],
    tags: ["macbook", "laptop", "apple", "m3"], createdAt: new Date()
  },
  {
    id: "p9", name: "Yoga Mat Premium Non-Slip 6mm", description: "Eco-friendly TPE material, carrying strap, extra thick",
    category: "Sports & Fitness", brand: "Boldfit", imageURL: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400",
    price: 799, originalPrice: 1499, discount: 47, platform: "flipkart", platformUrl: "https://flipkart.com",
    rating: 4.2, reviews: 18900, inStock: true, colors: ["Purple", "Blue", "Green", "Black"],
    tags: ["yoga", "fitness", "mat"], createdAt: new Date()
  },
  {
    id: "p10", name: "L'Oréal Paris Revitalift Anti-Aging Serum", description: "1.5% Pure Hyaluronic Acid + Vitamin C, 30ml",
    category: "Beauty & Personal Care", brand: "L'Oréal", imageURL: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400",
    price: 649, originalPrice: 999, discount: 35, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.4, reviews: 32100, inStock: true, tags: ["serum", "skincare", "loreal"], createdAt: new Date()
  },
  {
    id: "p11", name: "Atomic Habits by James Clear", description: "Bestseller - Build good habits, break bad ones, proven framework",
    category: "Books", brand: "James Clear", imageURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    price: 299, originalPrice: 599, discount: 50, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.8, reviews: 89000, inStock: true, tags: ["book", "self-help", "habits"], createdAt: new Date()
  },
  {
    id: "p12", name: "Boat Airdopes 141 Wireless Earbuds", description: "42hr battery, ENx noise cancellation, IPX4 water resistant",
    category: "Electronics", brand: "Boat", imageURL: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    price: 999, originalPrice: 2999, discount: 67, platform: "flipkart", platformUrl: "https://flipkart.com",
    rating: 4.1, reviews: 54200, inStock: true, colors: ["Black", "White", "Blue"],
    tags: ["earbuds", "wireless", "boat"], createdAt: new Date()
  },
  {
    id: "p13", name: "Fastrack Ruffles Analog Watch", description: "Casual everyday watch, stainless steel case, leather strap",
    category: "Fashion", brand: "Fastrack", imageURL: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    price: 1695, originalPrice: 2995, discount: 43, platform: "myntra", platformUrl: "https://myntra.com",
    rating: 4.2, reviews: 8700, inStock: true, colors: ["Brown", "Black", "Blue"],
    tags: ["watch", "fastrack", "fashion"], createdAt: new Date()
  },
  {
    id: "p14", name: "Weber Q1200 Portable Gas Grill", description: "Compact gas grill, porcelain-enamelled lid, 2196 cm² cooking area",
    category: "Home & Kitchen", brand: "Weber", imageURL: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    price: 18999, originalPrice: 24999, discount: 24, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.5, reviews: 2100, inStock: false, tags: ["grill", "bbq", "outdoor"], createdAt: new Date()
  },
  {
    id: "p15", name: "LEGO Technic Bugatti Chiron 42083", description: "3599 pieces, working W16 engine, rear spoiler, 1:8 scale",
    category: "Toys & Games", brand: "LEGO", imageURL: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=400",
    price: 35999, originalPrice: 44999, discount: 20, platform: "amazon", platformUrl: "https://amazon.in",
    rating: 4.9, reviews: 4300, inStock: true, tags: ["lego", "toys", "technic"], createdAt: new Date()
  },
  {
    id: "p16", name: "Xiaomi Mi 11X 5G 128GB", description: "Snapdragon 870, 120Hz AMOLED, 4520mAh, 33W fast charge",
    category: "Electronics", brand: "Xiaomi", imageURL: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400",
    price: 22999, originalPrice: 29999, discount: 23, platform: "flipkart", platformUrl: "https://flipkart.com",
    rating: 4.3, reviews: 19800, inStock: true, colors: ["Cosmic Black", "Celestial Silver"],
    tags: ["phone", "xiaomi", "5g"], createdAt: new Date()
  },
];

/**
 * Search products across all categories with filters
 */
export async function searchProducts(
  query: string,
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    platform?: string;
    inStock?: boolean;
    sortBy?: "price_asc" | "price_desc" | "rating" | "discount";
  }
): Promise<Product[]> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
  const q = query.toLowerCase();
  let results = MOCK_PRODUCTS.filter(p => {
    const matchesQuery = !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand?.toLowerCase().includes(q)) ||
      (p.tags?.some(t => t.includes(q)));

    const matchesCategory = !filters?.category || filters.category === "All" ||
      p.category === filters.category;
    const matchesPrice = (!filters?.minPrice || p.price >= filters.minPrice) &&
      (!filters?.maxPrice || p.price <= filters.maxPrice);
    const matchesPlatform = !filters?.platform || p.platform === filters.platform;
    const matchesStock = filters?.inStock === undefined || p.inStock === filters.inStock;

    return matchesQuery && matchesCategory && matchesPrice && matchesPlatform && matchesStock;
  });

  // Sort results
  if (filters?.sortBy) {
    results = results.sort((a, b) => {
      switch (filters.sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        case "discount": return (b.discount || 0) - (a.discount || 0);
        default: return 0;
      }
    });
  }

  return results;
}

/**
 * Get product by ID with cross-platform listings
 */
export function getProductById(id: string): Product | null {
  return MOCK_PRODUCTS.find(p => p.id === id) || null;
}

/**
 * Get cross-platform price listings for a product
 */
export function getCrossPlatformListings(productName: string): PlatformListing[] {
  const basePrice = MOCK_PRODUCTS.find(p =>
    productName.toLowerCase().includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
  )?.price || 1000;

  return [
    {
      platform: "Amazon",
      price: basePrice,
      url: "https://amazon.in",
      inStock: true,
      deliveryDays: 2,
      seller: "Amazon Fulfilled"
    },
    {
      platform: "Flipkart",
      price: Math.floor(basePrice * (0.92 + Math.random() * 0.15)),
      url: "https://flipkart.com",
      inStock: Math.random() > 0.2,
      deliveryDays: 3,
      seller: "Flipkart Assured"
    },
    {
      platform: "Meesho",
      price: Math.floor(basePrice * (0.85 + Math.random() * 0.1)),
      url: "https://meesho.com",
      inStock: Math.random() > 0.3,
      deliveryDays: 7,
      seller: "Reseller"
    },
    {
      platform: "Snapdeal",
      price: Math.floor(basePrice * (0.88 + Math.random() * 0.12)),
      url: "https://snapdeal.com",
      inStock: Math.random() > 0.4,
      deliveryDays: 5,
      seller: "Snapdeal Store"
    },
  ];
}

/**
 * Get trending products by category
 */
export function getTrendingProducts(category?: string): Product[] {
  const sorted = [...MOCK_PRODUCTS]
    .filter(p => !category || category === "All" || p.category === category)
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, 8);
  return sorted;
}

/**
 * Get product recommendations based on preferences
 */
export function getRecommendedProducts(preferences: string[]): Product[] {
  const pref = preferences.map(p => p.toLowerCase());
  return MOCK_PRODUCTS
    .filter(p =>
      pref.some(pref =>
        p.category.toLowerCase().includes(pref) ||
        p.tags?.some(t => t.includes(pref))
      )
    )
    .slice(0, 6);
}

export { CATEGORIES, MOCK_PRODUCTS };
