import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timezoneOffset = parseInt(searchParams.get('timezoneOffset') || '0')
  
  const now = new Date()
  const localDate = new Date(now.getTime() - (timezoneOffset * 60000))
  
  return NextResponse.json({
    serverTime: now.toISOString(),
    timezoneOffset: timezoneOffset,
    localTime: localDate.toISOString(),
    serverDate: now.toISOString().split('T')[0],
    localDate: localDate.toISOString().split('T')[0],
    dashboardRequestsDate: localDate.toISOString().split('T')[0]
  })
}