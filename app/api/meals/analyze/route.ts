import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyzeMealFromImage, analyzeMealFromText } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    let result

    if (type === 'image') {
      result = await analyzeMealFromImage(data)
    } else if (type === 'text') {
      result = await analyzeMealFromText(data)
    } else {
      return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing meal:", error)
    return NextResponse.json(
      { error: "Failed to analyze meal" },
      { status: 500 }
    )
  }
}