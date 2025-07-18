'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Calculator } from "lucide-react"

interface MealFormData {
  name: string
  description: string
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  sugar: string
  sodium: string
  quantity: string
  unit: string
  imageUrl?: string
}

interface BaseNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  baseQuantity: number
  baseUnit: string
}

interface MealFormProps {
  initialData?: Partial<MealFormData>
  mealId?: string
  onSuccess?: () => void
}

// Unit conversion factors (relative to serving)
const UNIT_MULTIPLIERS: { [key: string]: number } = {
  serving: 1,
  cup: 1.2,
  piece: 0.8,
  slice: 0.6,
  bowl: 1.5,
  plate: 2,
  gram: 0.01,
  ounce: 0.28,
}

export function MealForm({ initialData, mealId, onSuccess }: MealFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    quantity: '1',
    unit: 'serving',
    ...initialData,
  })

  // Store base nutrition values (per 1 serving)
  const [baseNutrition, setBaseNutrition] = useState<BaseNutrition | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Define calculateNutrition with useCallback to avoid dependency issues
  const calculateNutrition = useCallback(() => {
    if (!baseNutrition) return

    setIsCalculating(true)
    
    const quantity = parseFloat(formData.quantity) || 1
    const unitMultiplier = UNIT_MULTIPLIERS[formData.unit] || 1
    const totalMultiplier = quantity * unitMultiplier

    const calculatedNutrition = {
      calories: (baseNutrition.calories * totalMultiplier).toFixed(1),
      protein: (baseNutrition.protein * totalMultiplier).toFixed(1),
      carbs: (baseNutrition.carbs * totalMultiplier).toFixed(1),
      fat: (baseNutrition.fat * totalMultiplier).toFixed(1),
      fiber: (baseNutrition.fiber * totalMultiplier).toFixed(1),
      sugar: (baseNutrition.sugar * totalMultiplier).toFixed(1),
      sodium: (baseNutrition.sodium * totalMultiplier).toFixed(1),
    }

    setFormData(prev => ({
      ...prev,
      ...calculatedNutrition
    }))

    setTimeout(() => setIsCalculating(false), 300)
  }, [baseNutrition, formData.quantity, formData.unit])

  // Initialize base nutrition when form data is first loaded
  useEffect(() => {
    if (initialData && !baseNutrition && initialData.calories) {
      const baseQuantity = parseFloat(initialData.quantity || '1')
      
      setBaseNutrition({
        calories: parseFloat(initialData.calories) / baseQuantity,
        protein: parseFloat(initialData.protein || '0') / baseQuantity,
        carbs: parseFloat(initialData.carbs || '0') / baseQuantity,
        fat: parseFloat(initialData.fat || '0') / baseQuantity,
        fiber: parseFloat(initialData.fiber || '0') / baseQuantity,
        sugar: parseFloat(initialData.sugar || '0') / baseQuantity,
        sodium: parseFloat(initialData.sodium || '0') / baseQuantity,
        baseQuantity: 1,
        baseUnit: 'serving'
      })
    }
  }, [initialData, baseNutrition])

  // Recalculate nutrition when quantity or unit changes
  useEffect(() => {
    if (baseNutrition && (formData.quantity || formData.unit)) {
      calculateNutrition()
    }
  }, [formData.quantity, formData.unit, baseNutrition, calculateNutrition])

  const setAsBaseNutrition = () => {
    const quantity = parseFloat(formData.quantity) || 1
    const unitMultiplier = UNIT_MULTIPLIERS[formData.unit] || 1
    const totalMultiplier = quantity * unitMultiplier

    setBaseNutrition({
      calories: parseFloat(formData.calories) / totalMultiplier,
      protein: parseFloat(formData.protein || '0') / totalMultiplier,
      carbs: parseFloat(formData.carbs || '0') / totalMultiplier,
      fat: parseFloat(formData.fat || '0') / totalMultiplier,
      fiber: parseFloat(formData.fiber || '0') / totalMultiplier,
      sugar: parseFloat(formData.sugar || '0') / totalMultiplier,
      sodium: parseFloat(formData.sodium || '0') / totalMultiplier,
      baseQuantity: 1,
      baseUnit: 'serving'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = mealId ? `/api/meals/${mealId}` : '/api/meals'
      const method = mealId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/dashboard')
        }
      } else {
        alert('Failed to save meal. Please try again.')
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Failed to save meal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Meal Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Grilled Chicken Salad"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Brief description of the meal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0.1"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium mb-2">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="serving">serving</option>
                <option value="cup">cup</option>
                <option value="piece">piece</option>
                <option value="slice">slice</option>
                <option value="bowl">bowl</option>
                <option value="plate">plate</option>
                <option value="gram">gram</option>
                <option value="ounce">ounce</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Nutritional Information</h3>
            {isCalculating && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calculator className="w-4 h-4 animate-pulse" />
                <span>Calculating...</span>
              </div>
            )}
          </div>

          {!baseNutrition && formData.calories && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Set Base Nutrition
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Set current values as base for automatic calculation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={setAsBaseNutrition}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Set Base</span>
                </button>
              </div>
            </div>
          )}

          {baseNutrition && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Auto-calculation enabled
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Nutrition values will update when you change quantity or unit
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBaseNutrition(null)}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  Disable
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="calories" className="block text-sm font-medium mb-2">
              Calories *
            </label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="protein" className="block text-sm font-medium mb-2">
                Protein (g) *
              </label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium mb-2">
                Carbs (g) *
              </label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="fat" className="block text-sm font-medium mb-2">
                Fat (g) *
              </label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="fiber" className="block text-sm font-medium mb-2">
                Fiber (g)
              </label>
              <input
                type="number"
                id="fiber"
                name="fiber"
                value={formData.fiber}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="sugar" className="block text-sm font-medium mb-2">
                Sugar (g)
              </label>
              <input
                type="number"
                id="sugar"
                name="sugar"
                value={formData.sugar}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="sodium" className="block text-sm font-medium mb-2">
                Sodium (mg)
              </label>
              <input
                type="number"
                id="sodium"
                name="sodium"
                value={formData.sodium}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{mealId ? 'Update' : 'Save'} Meal</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}