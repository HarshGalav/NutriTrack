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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const timezoneOffset = parseInt(searchParams.get('timezoneOffset') || '0')

    // Get meals from the last 3 days to account for timezone differences
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const allMeals = await prisma.meal.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: threeDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Filter meals by converting each meal's timestamp to the user's local date
    const meals = allMeals.filter(meal => {
      // Create a new date in the user's timezone
      // Note: getTimezoneOffset() returns the offset in minutes, and it's positive for timezones west of UTC
      const mealInUserTimezone = new Date(meal.createdAt.getTime() - (timezoneOffset * 60000))
      const mealDateString = mealInUserTimezone.toISOString().split('T')[0]
      
      return mealDateString === date
    })

    interface NutritionTotal {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber: number
      sugar: number
      sodium: number
    }

    interface MealData {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber: number | null
      sugar: number | null
      sodium: number | null
    }

    const totalNutrition = meals.reduce(
      (total: NutritionTotal, meal: MealData) => ({
        calories: total.calories + meal.calories,
        protein: total.protein + meal.protein,
        carbs: total.carbs + meal.carbs,
        fat: total.fat + meal.fat,
        fiber: total.fiber + (meal.fiber || 0),
        sugar: total.sugar + (meal.sugar || 0),
        sodium: total.sodium + (meal.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    )

    return NextResponse.json({
      date,
      ...totalNutrition,
      meals,
    })
  } catch (error) {
    console.error("Error fetching daily nutrition:", error)
    return NextResponse.json(
      { error: "Failed to fetch daily nutrition" },
      { status: 500 }
    )
  }
}