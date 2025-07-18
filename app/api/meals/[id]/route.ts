import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const meal = await prisma.meal.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error fetching meal:", error)
    return NextResponse.json(
      { error: "Failed to fetch meal" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

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

    const meal = await prisma.meal.updateMany({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
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

    if (meal.count === 0) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    const updatedMeal = await prisma.meal.findUnique({
      where: { id: id },
    })

    return NextResponse.json(updatedMeal)
  } catch (error) {
    console.error("Error updating meal:", error)
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await prisma.meal.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting meal:", error)
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    )
  }
}