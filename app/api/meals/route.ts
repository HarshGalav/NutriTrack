import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/meals - Starting request");

    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");

    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID");
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("User ID:", userId);

    const body = await request.json();
    console.log("Request body received:", Object.keys(body));

    const {
      name,
      description,
      imageUrl,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      quantity,
      unit,
      barcode,
      brand,
      source,
      servingSize,
      servingUnit,
      notes,
    } = body;

    console.log("Attempting to create meal in database...");

    const meal = await prisma.meal.create({
      data: {
        userId: userId,
        name,
        description: description || notes,
        imageUrl,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: fiber ? parseFloat(fiber) : null,
        sugar: sugar ? parseFloat(sugar) : null,
        sodium: sodium ? parseFloat(sodium) : null,
        quantity: servingSize ? parseFloat(servingSize) : parseFloat(quantity || 1),
        unit: servingUnit || unit || 'serving',
        barcode: barcode || null,
        brand: brand || null,
        source: source || null,
      },
    });

    console.log("Meal created successfully:", meal.id);
    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error creating meal:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });

    return NextResponse.json(
      {
        error: "Failed to create meal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const limit = searchParams.get("limit");

    const whereClause: {
      userId: string;
      createdAt?: {
        gte: Date;
        lt: Date;
      };
    } = {
      userId: session.user.id,
    };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      whereClause.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const meals = await prisma.meal.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}
