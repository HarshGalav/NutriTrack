export interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface MealData extends NutritionData {
  id: string
  name: string
  description?: string
  imageUrl?: string
  quantity: number
  unit: string
  createdAt: Date
}

export interface UserGoals {
  dailyCalorieGoal: number
  dailyProteinGoal: number
  dailyCarbGoal: number
  dailyFatGoal: number
}

export interface DailyNutrition extends NutritionData {
  date: string
  meals: MealData[]
}

export interface WeeklyData {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}