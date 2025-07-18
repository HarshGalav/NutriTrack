'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Camera, Upload, Type, Loader2 } from "lucide-react"

export default function ScanMeal() {
  const { status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [scanMode, setScanMode] = useState<'image' | 'text'>('image')
  const [textDescription, setTextDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    
    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const base64Data = base64.split(',')[1]

        // Analyze image with Gemini
        const response = await fetch('/api/meals/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'image',
            data: base64Data,
          }),
        })

        if (response.ok) {
          const mealData = await response.json()
          // Redirect to meal form with pre-filled data
          const params = new URLSearchParams(mealData)
          router.push(`/meals/add?${params.toString()}`)
        } else {
          alert('Failed to analyze image. Please try again.')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('Failed to analyze image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextAnalysis = async () => {
    if (!textDescription.trim()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/meals/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text',
          data: textDescription,
        }),
      })

      if (response.ok) {
        const mealData = await response.json()
        // Redirect to meal form with pre-filled data
        const params = new URLSearchParams(mealData)
        router.push(`/meals/add?${params.toString()}`)
      } else {
        alert('Failed to analyze description. Please try again.')
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      alert('Failed to analyze description. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Scan Your Meal</h1>
        <p className="text-muted-foreground">
          Use AI to analyze your food and get instant nutritional information
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg">
          <button
            onClick={() => setScanMode('image')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              scanMode === 'image'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Image</span>
          </button>
          <button
            onClick={() => setScanMode('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              scanMode === 'text'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
        </div>
      </div>

      {scanMode === 'image' ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Upload a photo of your meal</h3>
                <p className="text-muted-foreground mb-4">
                  Take a clear photo showing your food for best results
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Choose Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <label htmlFor="description" className="block text-sm font-medium">
              Describe your meal
            </label>
            <textarea
              id="description"
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g., Grilled chicken breast with steamed broccoli and brown rice"
              className="w-full h-32 px-3 py-2 border border-input rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleTextAnalysis}
            disabled={isLoading || !textDescription.trim()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Type className="w-4 h-4" />
                <span>Analyze Description</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Tips for better results:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Take photos in good lighting</li>
          <li>• Include the entire meal in the frame</li>
          <li>• Be specific in text descriptions</li>
          <li>• Include portion sizes when possible</li>
        </ul>
      </div>
    </div>
  )
}