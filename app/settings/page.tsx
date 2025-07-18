'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Save, Loader2, Target } from "lucide-react"
import { UserGoals } from "@/lib/types"

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<UserGoals>({
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbGoal: 250,
    dailyFatGoal: 65,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchGoals()
    }
  }, [session])

  const fetchGoals = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goals),
      })

      if (response.ok) {
        alert('Goals updated successfully!')
      } else {
        alert('Failed to update goals. Please try again.')
      }
    } catch (error) {
      console.error('Error updating goals:', error)
      alert('Failed to update goals. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGoals(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nutrition Goals</h1>
        <p className="text-muted-foreground">
          Set your daily nutrition targets to track your progress
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Daily Targets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dailyCalorieGoal" className="block text-sm font-medium mb-2">
                Daily Calories
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="dailyCalorieGoal"
                  name="dailyCalorieGoal"
                  value={goals.dailyCalorieGoal}
                  onChange={handleChange}
                  min="1000"
                  max="5000"
                  step="50"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground">kcal</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 1,800-2,400 kcal/day
              </p>
            </div>

            <div>
              <label htmlFor="dailyProteinGoal" className="block text-sm font-medium mb-2">
                Daily Protein
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="dailyProteinGoal"
                  name="dailyProteinGoal"
                  value={goals.dailyProteinGoal}
                  onChange={handleChange}
                  min="50"
                  max="300"
                  step="5"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground">g</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 0.8-1.2g per kg body weight
              </p>
            </div>

            <div>
              <label htmlFor="dailyCarbGoal" className="block text-sm font-medium mb-2">
                Daily Carbohydrates
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="dailyCarbGoal"
                  name="dailyCarbGoal"
                  value={goals.dailyCarbGoal}
                  onChange={handleChange}
                  min="100"
                  max="500"
                  step="10"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground">g</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 45-65% of total calories
              </p>
            </div>

            <div>
              <label htmlFor="dailyFatGoal" className="block text-sm font-medium mb-2">
                Daily Fat
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="dailyFatGoal"
                  name="dailyFatGoal"
                  value={goals.dailyFatGoal}
                  onChange={handleChange}
                  min="30"
                  max="150"
                  step="5"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground">g</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 20-35% of total calories
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Quick Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGoals({
                  dailyCalorieGoal: 1800,
                  dailyProteinGoal: 120,
                  dailyCarbGoal: 200,
                  dailyFatGoal: 60,
                })}
                className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent hover:text-accent-foreground"
              >
                Weight Loss
              </button>
              <button
                type="button"
                onClick={() => setGoals({
                  dailyCalorieGoal: 2200,
                  dailyProteinGoal: 150,
                  dailyCarbGoal: 275,
                  dailyFatGoal: 75,
                })}
                className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent hover:text-accent-foreground"
              >
                Maintenance
              </button>
              <button
                type="button"
                onClick={() => setGoals({
                  dailyCalorieGoal: 2800,
                  dailyProteinGoal: 180,
                  dailyCarbGoal: 350,
                  dailyFatGoal: 90,
                })}
                className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent hover:text-accent-foreground"
              >
                Muscle Gain
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Goals</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}