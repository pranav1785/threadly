/**
 * Shared TypeScript types for Threadly
 */

export type UserRole = "customer" | "retailer" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  preferences?: string[];
  location?: { lat: number; lng: number; city: string };
  phone?: string;
  bio?: string;
  wishlist?: string[];
}

export interface RetailerProfile {
  uid: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  categories: string[];
  description?: string;
  logoURL?: string;
  verified: boolean;
  rating?: number;
  totalProducts?: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  imageURL: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  platform: "amazon" | "flipkart" | "meesho" | "myntra" | "local" | "other";
  platformUrl?: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  retailerId?: string;
  storeName?: string;
  createdAt?: Date;
}

export interface PlatformListing {
  platform: string;
  price: number;
  url: string;
  inStock: boolean;
  deliveryDays?: number;
  seller?: string;
}

export interface ProductRequest {
  id: string;
  userId: string;
  userEmail: string;
  productName: string;
  description: string;
  category: string;
  maxPrice?: number;
  status: "open" | "fulfilled" | "closed";
  broadcasts: number;
  responses: RetailerResponse[];
  createdAt: Date;
  location?: string;
}

export interface RetailerResponse {
  retailerId: string;
  storeName: string;
  message: string;
  price?: number;
  available: boolean;
  respondedAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  type: "restock" | "price_drop" | "similar_found" | "request_fulfilled";
  productId?: string;
  productName: string;
  message: string;
  platform?: string;
  price?: number;
  url?: string;
  read: boolean;
  createdAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  product: Product;
  addedAt: Date;
  alertEnabled: boolean;
  targetPrice?: number;
}

export interface InventoryItem {
  id: string;
  retailerId: string;
  storeName: string;
  product: Product;
  quantity: number;
  updatedAt: Date;
}

export interface StoreNearby {
  id: string;
  storeName: string;
  address: string;
  city: string;
  phone: string;
  distance?: number;
  categories: string[];
  lat: number;
  lng: number;
  rating?: number;
  isOpen?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface TrendItem {
  id: string;
  keyword: string;
  category: string;
  score: number;
  growth: number;
  platform: string;
  detectedAt: Date;
  imageURL?: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
  query: string;
  expandedQuery?: string;
  categories?: string[];
  aiInsight?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalRequests: number;
  totalMessages: number;
  revenue?: number;
  viewsToday?: number;
  pendingRequests?: number;
}

export interface InventoryCallParams {
  storePhone: string;
  storeName: string;
  productName: string;
  productDetails?: string;
  userId: string;
}

export interface CallResult {
  success: boolean;
  message: string;
  inventoryFound: boolean;
  price?: number;
  quantity?: number;
  transcript?: string;
  callId?: string;
  duration?: number;
}
