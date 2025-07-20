'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Calendar, TrendingUp, Activity, CalendarDays } from "lucide-react"
import { WeeklyData, DailyNutrition } from "@/lib/types"

export default function Trends() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [dailyData, setDailyData] = useState<DailyNutrition | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeeks, setSelectedWeeks] = useState(2)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [viewMode, setViewMode] = useState<'trends' | 'daily'>('trends')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedNutrient, setSelectedNutrient] = useState<'calories' | 'protein' | 'carbs' | 'fat' | 'all'>('calories')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const fetchWeeklyData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/nutrition/weekly?weeks=${selectedWeeks}`)
      if (response.ok) {
        const data = await response.json()
        setWeeklyData(data)
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedWeeks])

  const fetchDailyData = useCallback(async () => {
    setLoading(true)
    try {
      const timezoneOffset = new Date().getTimezoneOffset()
      const response = await fetch(`/api/nutrition/daily?date=${selectedDate}&timezoneOffset=${timezoneOffset}`)
      if (response.ok) {
        const data = await response.json()
        setDailyData(data)
      }
    } catch (error) {
      console.error('Error fetching daily data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    if (session) {
      if (viewMode === 'trends') {
        fetchWeeklyData()
      } else {
        fetchDailyData()
      }
    }
  }, [session, viewMode, fetchWeeklyData, fetchDailyData])

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = weeklyData.map(day => ({
    ...day,
    date: formatDate(day.date),
  }))

  const averages = weeklyData.length > 0 ? {
    calories: Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length),
    protein: Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / weeklyData.length),
    carbs: Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / weeklyData.length),
    fat: Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / weeklyData.length),
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 }

  const dailyTotals = dailyData ? {
    calories: Math.round(dailyData.calories),
    protein: Math.round(dailyData.protein),
    carbs: Math.round(dailyData.carbs),
    fat: Math.round(dailyData.fat),
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 }

  const displayData = viewMode === 'trends' ? averages : dailyTotals
  const dataLabel = viewMode === 'trends' ? 'per day' : 'total'

  const ChartComponent = chartType === 'line' ? LineChart : BarChart

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Mobile-optimized header */}
      <div className="mb-6 sm:mb-8">
        <div className="text-center sm:text-left mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Nutrition Analysis</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {viewMode === 'trends' ? 'Visualize your nutrition patterns over time' : 'View detailed nutrition data for specific dates'}
          </p>
        </div>

        {/* Mobile-first controls layout */}
        <div className="space-y-4">
          {/* View Mode Toggle - Always visible */}
          <div className="flex justify-center sm:justify-start">
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode('trends')}
                className={`px-3 py-2 rounded text-sm flex items-center space-x-2 ${
                  viewMode === 'trends'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trends</span>
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-2 rounded text-sm flex items-center space-x-2 ${
                  viewMode === 'daily'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Daily</span>
              </button>
            </div>
          </div>

          {/* Trends Controls - Mobile optimized */}
          {viewMode === 'trends' && (
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
              <div className="grid grid-cols-2 gap-3 sm:flex sm:space-x-3">
                <select
                  value={selectedWeeks}
                  onChange={(e) => setSelectedWeeks(parseInt(e.target.value))}
                  className="px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value={1}>Last Week</option>
                  <option value={2}>Last 2 Weeks</option>
                  <option value={4}>Last Month</option>
                </select>
                <select
                  value={selectedNutrient}
                  onChange={(e) => setSelectedNutrient(e.target.value as 'calories' | 'protein' | 'carbs' | 'fat' | 'all')}
                  className="px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="calories">Calories</option>
                  <option value="protein">Protein</option>
                  <option value="carbs">Carbs</option>
                  <option value="fat">Fat</option>
                  <option value="all">All Nutrients</option>
                </select>
              </div>
              <div className="flex justify-center sm:justify-start">
                <div className="flex bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-4 py-2 rounded text-sm ${
                      chartType === 'line'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-4 py-2 rounded text-sm ${
                      chartType === 'bar'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Bar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Daily Controls - Mobile optimized */}
          {viewMode === 'daily' && (
            <div className="flex justify-center sm:justify-start">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards - Mobile optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
              {viewMode === 'trends' ? 'Avg Calories' : 'Calories'}
            </h3>
            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold">{displayData.calories}</p>
          <p className="text-xs text-muted-foreground">{dataLabel}</p>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
              {viewMode === 'trends' ? 'Avg Protein' : 'Protein'}
            </h3>
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold">{displayData.protein}g</p>
          <p className="text-xs text-muted-foreground">{dataLabel}</p>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
              {viewMode === 'trends' ? 'Avg Carbs' : 'Carbs'}
            </h3>
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold">{displayData.carbs}g</p>
          <p className="text-xs text-muted-foreground">{dataLabel}</p>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
              {viewMode === 'trends' ? 'Avg Fat' : 'Fat'}
            </h3>
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold">{displayData.fat}g</p>
          <p className="text-xs text-muted-foreground">{dataLabel}</p>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'trends' ? (
        /* Chart - Mobile optimized */
        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {selectedNutrient === 'all' ? 'All Nutrients' : 
             selectedNutrient === 'calories' ? 'Daily Calories' :
             `Daily ${selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)}`}
          </h2>
          <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
            <ChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedNutrient === 'all' ? (
                // Show all nutrients when "All" is selected
                chartType === 'line' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Calories"
                    />
                    <Line
                      type="monotone"
                      dataKey="protein"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                      name="Protein (g)"
                    />
                    <Line
                      type="monotone"
                      dataKey="carbs"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b' }}
                      name="Carbs (g)"
                    />
                    <Line
                      type="monotone"
                      dataKey="fat"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6' }}
                      name="Fat (g)"
                    />
                  </>
                ) : (
                  <>
                    <Bar dataKey="calories" fill="#3b82f6" name="Calories" />
                    <Bar dataKey="protein" fill="#10b981" name="Protein (g)" />
                    <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" />
                    <Bar dataKey="fat" fill="#8b5cf6" name="Fat (g)" />
                  </>
                )
              ) : (
                // Show selected nutrient only
                chartType === 'line' ? (
                  <Line
                    type="monotone"
                    dataKey={selectedNutrient}
                    stroke={
                      selectedNutrient === 'calories' ? '#3b82f6' :
                      selectedNutrient === 'protein' ? '#10b981' :
                      selectedNutrient === 'carbs' ? '#f59e0b' : '#8b5cf6'
                    }
                    strokeWidth={2}
                    dot={{ 
                      fill: selectedNutrient === 'calories' ? '#3b82f6' :
                            selectedNutrient === 'protein' ? '#10b981' :
                            selectedNutrient === 'carbs' ? '#f59e0b' : '#8b5cf6'
                    }}
                    name={selectedNutrient === 'calories' ? 'Calories' : `${selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)} (g)`}
                  />
                ) : (
                  <Bar 
                    dataKey={selectedNutrient} 
                    fill={
                      selectedNutrient === 'calories' ? '#3b82f6' :
                      selectedNutrient === 'protein' ? '#10b981' :
                      selectedNutrient === 'carbs' ? '#f59e0b' : '#8b5cf6'
                    }
                    name={selectedNutrient === 'calories' ? 'Calories' : `${selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)} (g)`}
                  />
                )
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Daily View - Mobile optimized */
        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Meals for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          {dailyData?.meals && dailyData.meals.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {dailyData.meals.map((meal) => (
                <div key={meal.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-muted rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {meal.imageUrl && (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{meal.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {Math.round(meal.calories)} cal • {Math.round(meal.protein)}g protein
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {Math.round(meal.carbs)}g carbs • {Math.round(meal.fat)}g fat
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {meal.quantity} {meal.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(meal.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No meals logged for this date</p>
              <p className="text-sm text-muted-foreground">Select a different date or start logging meals!</p>
            </div>
          )}
        </div>
      )}

      {weeklyData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No nutrition data available for the selected period</p>
          <p className="text-sm text-muted-foreground">Start logging meals to see your trends!</p>
        </div>
      )}
    </div>
  )
}