import { NextRequest, NextResponse } from "next/server";
import { initiateInventoryCall } from "@/lib/sarvam";

/**
 * POST /api/sarvam/call
 * Initiates a Sarvam AI voice call to a store to check product inventory.
 * Body: { storePhone, storeName, productName, productDetails, userId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storePhone, storeName, productName, productDetails, userId } = body;

    if (!storePhone || !storeName || !productName) {
      return NextResponse.json(
        { error: "storePhone, storeName, and productName are required" },
        { status: 400 }
      );
    }

    const result = await initiateInventoryCall({
      storePhone, storeName, productName,
      productDetails: productDetails || `Customer is looking for ${productName}`,
      userId: userId || "anonymous",
    });

    return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[/api/sarvam/call]", error);
    return NextResponse.json({ error: "Failed to initiate call" }, { status: 500 });
  }
}
