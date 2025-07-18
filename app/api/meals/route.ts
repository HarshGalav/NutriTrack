import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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
      unit
    } = body

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        name,
        description,
        imageUrl,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: fiber ? parseFloat(fiber) : null,
        sugar: sugar ? parseFloat(sugar) : null,
        sodium: sodium ? parseFloat(sodium) : null,
        quantity: parseFloat(quantity),
        unit,
      },
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error creating meal:", error)
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const limit = searchParams.get('limit')

    let whereClause: any = {
      userId: session.user.id,
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      whereClause.createdAt = {
        gte: startDate,
        lt: endDate,
      }
    }

    const meals = await prisma.meal.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(meals)
  } catch (error) {
    console.error("Error fetching meals:", error)
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    )
  }
}