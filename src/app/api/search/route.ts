import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

/**
 * GET /api/search?q=...&category=...&platform=...&maxPrice=...&sortBy=...
 * Returns product search results with optional AI insight metadata.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const sortBy = (searchParams.get("sortBy") as "price_asc" | "price_desc" | "rating" | "discount") || undefined;
    const inStock = searchParams.get("inStock") === "true" ? true : undefined;

    if (!q && !category) {
      return NextResponse.json({ error: "Query or category is required" }, { status: 400 });
    }

    const results = await searchProducts(q, { category, platform, maxPrice, sortBy, inStock });

    return NextResponse.json({
      success: true,
      query: q,
      total: results.length,
      products: results,
      metadata: {
        filters: { category, platform, maxPrice, sortBy, inStock },
        aiEnhanced: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[/api/search]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
