import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbGoal: true,
        dailyFatGoal: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      dailyCalorieGoal: user.dailyCalorieGoal || 2000,
      dailyProteinGoal: user.dailyProteinGoal || 150,
      dailyCarbGoal: user.dailyCarbGoal || 250,
      dailyFatGoal: user.dailyFatGoal || 65,
    })
  } catch (error) {
    console.error("Error fetching user goals:", error)
    return NextResponse.json(
      { error: "Failed to fetch user goals" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { dailyCalorieGoal, dailyProteinGoal, dailyCarbGoal, dailyFatGoal } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dailyCalorieGoal: parseInt(dailyCalorieGoal),
        dailyProteinGoal: parseFloat(dailyProteinGoal),
        dailyCarbGoal: parseFloat(dailyCarbGoal),
        dailyFatGoal: parseFloat(dailyFatGoal),
      },
      select: {
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbGoal: true,
        dailyFatGoal: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user goals:", error)
    return NextResponse.json(
      { error: "Failed to update user goals" },
      { status: 500 }
    )
  }
}