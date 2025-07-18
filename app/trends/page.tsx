'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Calendar, TrendingUp, Activity } from "lucide-react"
import { WeeklyData } from "@/lib/types"

export default function Trends() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeeks, setSelectedWeeks] = useState(2)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

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

  useEffect(() => {
    if (session) {
      fetchWeeklyData()
    }
  }, [session, fetchWeeklyData])

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

  const ChartComponent = chartType === 'line' ? LineChart : BarChart

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrition Trends</h1>
          <p className="text-muted-foreground">
            Visualize your nutrition patterns over time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedWeeks}
            onChange={(e) => setSelectedWeeks(parseInt(e.target.value))}
            className="px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={1}>Last Week</option>
            <option value={2}>Last 2 Weeks</option>
            <option value={4}>Last Month</option>
          </select>
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'line'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-sm ${
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Calories</h3>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{averages.calories}</p>
          <p className="text-xs text-muted-foreground">per day</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Protein</h3>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{averages.protein}g</p>
          <p className="text-xs text-muted-foreground">per day</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Carbs</h3>
            <Calendar className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold">{averages.carbs}g</p>
          <p className="text-xs text-muted-foreground">per day</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Fat</h3>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{averages.fat}g</p>
          <p className="text-xs text-muted-foreground">per day</p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        {/* Calories Chart */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Daily Calories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartType === 'line' ? (
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              ) : (
                <Bar dataKey="calories" fill="#3b82f6" />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Macronutrients Chart */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Macronutrients</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartType === 'line' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="protein"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="carbs"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fat"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </>
              ) : (
                <>
                  <Bar dataKey="protein" fill="#10b981" />
                  <Bar dataKey="carbs" fill="#f59e0b" />
                  <Bar dataKey="fat" fill="#8b5cf6" />
                </>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>

      {weeklyData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No nutrition data available for the selected period</p>
          <p className="text-sm text-muted-foreground">Start logging meals to see your trends!</p>
        </div>
      )}
    </div>
  )
}