import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weeksBack = parseInt(searchParams.get('weeks') || '1')

    // Calculate date range for the past weeks
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - (weeksBack * 7))

    const meals = await prisma.meal.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group meals by date and calculate daily totals
    const dailyData: { [key: string]: {
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
    } } = {}

    meals.forEach(meal => {
      const date = meal.createdAt.toISOString().split('T')[0]
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        }
      }

      dailyData[date].calories += meal.calories
      dailyData[date].protein += meal.protein
      dailyData[date].carbs += meal.carbs
      dailyData[date].fat += meal.fat
      dailyData[date].fiber += meal.fiber || 0
      dailyData[date].sugar += meal.sugar || 0
      dailyData[date].sodium += meal.sodium || 0
    })

    // Fill in missing dates with zero values
    const result = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      result.push(dailyData[dateStr] || {
        date: dateStr,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching weekly nutrition:", error)
    return NextResponse.json(
      { error: "Failed to fetch weekly nutrition" },
      { status: 500 }
    )
  }
}