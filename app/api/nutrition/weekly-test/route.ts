import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/nutrition/weekly-test - Starting request")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Found" : "Not found")
    console.log("User ID:", session?.user?.id)
    
    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock data for testing
    const mockData = [
      {
        date: "2025-01-17",
        calories: 1800,
        protein: 120,
        carbs: 200,
        fat: 60,
        fiber: 25,
        sugar: 50,
        sodium: 2000,
      },
      {
        date: "2025-01-18",
        calories: 2000,
        protein: 140,
        carbs: 220,
        fat: 70,
        fiber: 30,
        sugar: 60,
        sodium: 2200,
      },
      {
        date: "2025-01-19",
        calories: 1900,
        protein: 130,
        carbs: 210,
        fat: 65,
        fiber: 28,
        sugar: 55,
        sodium: 2100,
      }
    ]

    console.log("Returning mock data successfully")
    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error in weekly test:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch weekly test data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}