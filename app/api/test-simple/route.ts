import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({ 
      status: "success", 
      message: "API is working",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Simple test error:", error)
    return NextResponse.json({ 
      status: "error", 
      message: "API test failed"
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    return NextResponse.json({ 
      status: "success", 
      message: "POST request working",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Simple POST test error:", error)
    return NextResponse.json({ 
      status: "error", 
      message: "POST test failed"
    }, { status: 500 })
  }
}