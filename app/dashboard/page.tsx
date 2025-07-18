'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Plus, Camera, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DailyNutrition, UserGoals } from "@/lib/types"
import { getTodayDateString } from "@/lib/utils"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null)
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [nutritionRes, goalsRes] = await Promise.all([
        fetch(`/api/nutrition/daily?date=${getTodayDateString()}`),
        fetch('/api/user/goals')
      ])

      if (nutritionRes.ok) {
        const nutrition = await nutritionRes.json()
        setDailyNutrition(nutrition)
      }

      if (goalsRes.ok) {
        const goals = await goalsRes.json()
        setUserGoals(goals)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMeal = async (mealId: string) => {
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}!</h1>
          <p className="text-muted-foreground">Today&apos;s nutrition overview</p>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/scan"
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Meal</span>
          </Link>
          <Link
            href="/meals/add"
            className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </Link>
        </div>
      </div>

      {/* Nutrition Overview */}
      {dailyNutrition && userGoals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Calories</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{Math.round(dailyNutrition.calories)}</span>
              <span className="text-sm text-muted-foreground">/ {userGoals.dailyCalorieGoal}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getProgressPercentage(dailyNutrition.calories, userGoals.dailyCalorieGoal))}`}
                style={{ width: `${getProgressPercentage(dailyNutrition.calories, userGoals.dailyCalorieGoal)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Protein</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{Math.round(dailyNutrition.protein)}g</span>
              <span className="text-sm text-muted-foreground">/ {userGoals.dailyProteinGoal}g</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getProgressPercentage(dailyNutrition.protein, userGoals.dailyProteinGoal))}`}
                style={{ width: `${getProgressPercentage(dailyNutrition.protein, userGoals.dailyProteinGoal)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Carbs</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{Math.round(dailyNutrition.carbs)}g</span>
              <span className="text-sm text-muted-foreground">/ {userGoals.dailyCarbGoal}g</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getProgressPercentage(dailyNutrition.carbs, userGoals.dailyCarbGoal))}`}
                style={{ width: `${getProgressPercentage(dailyNutrition.carbs, userGoals.dailyCarbGoal)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Fat</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{Math.round(dailyNutrition.fat)}g</span>
              <span className="text-sm text-muted-foreground">/ {userGoals.dailyFatGoal}g</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(getProgressPercentage(dailyNutrition.fat, userGoals.dailyFatGoal))}`}
                style={{ width: `${getProgressPercentage(dailyNutrition.fat, userGoals.dailyFatGoal)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Meals */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Meals</h2>
        {dailyNutrition?.meals && dailyNutrition.meals.length > 0 ? (
          <div className="space-y-4">
            {dailyNutrition.meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-4">
                  {meal.imageUrl && (
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(meal.calories)} cal • {Math.round(meal.protein)}g protein
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meal.quantity} {meal.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/meals/edit/${meal.id}`)}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No meals logged today</p>
            <Link
              href="/scan"
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Your First Meal</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}