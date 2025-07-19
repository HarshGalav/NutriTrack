import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Testing database connection...")
    
    // Test database connection
    await prisma.$connect()
    console.log("Database connected successfully")
    
    // Try to count users (this will test if the database schema is working)
    const userCount = await prisma.user.count()
    console.log("User count:", userCount)
    
    // Test if we can query meals table
    const mealCount = await prisma.meal.count()
    console.log("Meal count:", mealCount)
    
    return NextResponse.json({ 
      status: "success", 
      message: "Database connection successful",
      userCount,
      mealCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Database connection error:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json({ 
      status: "error", 
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}