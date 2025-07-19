import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/meals-test - Starting request")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Found" : "Not found")
    console.log("User ID:", session?.user?.id)
    
    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body received:", Object.keys(body))

    // Return mock success response
    const mockMeal = {
      id: "test-meal-id-" + Date.now(),
      userId: session.user.id,
      name: body.name,
      description: body.description,
      calories: parseFloat(body.calories),
      protein: parseFloat(body.protein),
      carbs: parseFloat(body.carbs),
      fat: parseFloat(body.fat),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("Returning mock meal successfully")
    return NextResponse.json(mockMeal)
  } catch (error) {
    console.error("Error in meal test:", error)
    return NextResponse.json(
      { 
        error: "Failed to create test meal",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}