'use client'

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { MealForm } from "@/components/MealForm"

function AddMealContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  if (status === "unauthenticated") {
    router.push("/")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get pre-filled data from URL params (from AI analysis)
  const initialData = {
    name: searchParams.get('name') || '',
    description: searchParams.get('description') || '',
    calories: searchParams.get('calories') || '',
    protein: searchParams.get('protein') || '',
    carbs: searchParams.get('carbs') || '',
    fat: searchParams.get('fat') || '',
    fiber: searchParams.get('fiber') || '',
    sugar: searchParams.get('sugar') || '',
    sodium: searchParams.get('sodium') || '',
    quantity: searchParams.get('quantity') || '1',
    unit: searchParams.get('unit') || 'serving',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Meal</h1>
        <p className="text-muted-foreground">
          Enter the details of your meal and its nutritional information
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => router.push('/scan')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4 0v4m-4-4h-2m2-4V8a4 4 0 118 0v4m-6 0V8a4 4 0 00-8 0v4m2 4h.01" />
          </svg>
          <span>Scan Barcode</span>
        </button>
        <button
          onClick={() => router.push('/scan?mode=image')}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Scan with AI</span>
        </button>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <MealForm initialData={initialData} />
      </div>
    </div>
  )
}

export default function AddMeal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <AddMealContent />
    </Suspense>
  )
}