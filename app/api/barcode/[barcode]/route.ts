import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BarcodeService } from "@/lib/barcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { barcode } = await params;
    
    if (!barcode || barcode.length < 8) {
      return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
    }

    const barcodeService = new BarcodeService();
    const product = await barcodeService.getProductInfo(barcode);

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching barcode product:", error);
    
    if (error instanceof Error && error.message.includes('Product not found')) {
      const { barcode } = await params;
      return NextResponse.json(
        { error: "Product not found", barcode },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch product information" },
      { status: 500 }
    );
  }
}