'use client'

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { MealForm } from "@/components/MealForm"

export default function AddMeal() {
  const { data: session, status } = useSession()
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

      <div className="bg-card p-6 rounded-lg border">
        <MealForm initialData={initialData} />
      </div>
    </div>
  )
}