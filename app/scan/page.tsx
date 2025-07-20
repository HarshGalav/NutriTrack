'use client'

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect, Suspense } from "react"
import { Camera, Upload, Type, Loader2, Scan } from "lucide-react"
import BarcodeScanner from "@/components/BarcodeScanner"
import ProductReview from "@/components/ProductReview"
import { BarcodeService, ScannedProduct } from "@/lib/barcode"

function ScanMealContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [scanMode, setScanMode] = useState<'image' | 'text' | 'barcode'>('barcode')
  const [textDescription, setTextDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null)
  const [barcodeService] = useState(() => new BarcodeService())
  const [showManualBarcodeEntry, setShowManualBarcodeEntry] = useState(false)
  const [manualBarcodeInput, setManualBarcodeInput] = useState("")

  // Set initial scan mode based on URL parameters
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'barcode' || mode === 'image' || mode === 'text') {
      setScanMode(mode)
    }
  }, [searchParams])

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

  const handleBarcodeFound = async (barcode: string) => {
    setIsLoading(true)
    try {
      const product = await barcodeService.getProductInfo(barcode)
      setScannedProduct(product)
      setShowBarcodeScanner(false)
    } catch (error) {
      console.error('Error fetching product info:', error)
      alert('Product not found. Please try scanning again or enter details manually.')
      setShowBarcodeScanner(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarcodeError = (error: string) => {
    console.error('Barcode scanner error:', error)
    alert(error)
    setShowBarcodeScanner(false)
  }

  const handleProductSave = async (mealData: unknown) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        alert('Failed to save meal. Please try again.')
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Failed to save meal. Please try again.')
    }
  }

  const handleProductCancel = () => {
    setScannedProduct(null)
  }

  const startBarcodeScanning = () => {
    setShowBarcodeScanner(true)
  }

  const handleManualBarcodeSubmit = () => {
    if (manualBarcodeInput.trim()) {
      setShowManualBarcodeEntry(false)
      handleBarcodeFound(manualBarcodeInput.trim())
      setManualBarcodeInput("")
    }
  }

  const handleManualBarcodeCancel = () => {
    setShowManualBarcodeEntry(false)
    setManualBarcodeInput("")
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
            onClick={() => setScanMode('barcode')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              scanMode === 'barcode'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Barcode</span>
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
      ) : scanMode === 'barcode' ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Scan className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Scan product barcode</h3>
                <p className="text-muted-foreground mb-4">
                  Point your camera at the barcode on packaged food items
                </p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={startBarcodeScanning}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        <span>Start Camera Scanning</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowManualBarcodeEntry(true)}
                    disabled={isLoading}
                    className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Type className="w-4 h-4" />
                    <span>Enter Barcode Manually</span>
                  </button>
                  
                  {/* Test barcode buttons for development */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Test with sample barcodes:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleBarcodeFound('3017620422003')}
                        disabled={isLoading}
                        className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded hover:bg-muted/80"
                      >
                        Nutella
                      </button>
                      <button
                        onClick={() => handleBarcodeFound('7622210951965')}
                        disabled={isLoading}
                        className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded hover:bg-muted/80"
                      >
                        Oreo
                      </button>
                      <button
                        onClick={() => handleBarcodeFound('8901030835289')}
                        disabled={isLoading}
                        className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded hover:bg-muted/80"
                      >
                        Maggi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          {scanMode === 'barcode' && (
            <>
              <li>• Hold the camera steady over the barcode</li>
              <li>• Ensure the barcode is clearly visible</li>
              <li>• Try different angles if scanning fails</li>
            </>
          )}
        </ul>
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onProductFound={handleBarcodeFound}
          onError={handleBarcodeError}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Manual Barcode Entry Modal */}
      {showManualBarcodeEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 w-full border border-border shadow-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Enter Barcode Manually
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Type or paste the barcode number from the product
              </p>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={manualBarcodeInput}
                  onChange={(e) => setManualBarcodeInput(e.target.value)}
                  placeholder="e.g., 1234567890123"
                  className="w-full px-4 py-3 border border-input rounded-lg text-center text-lg font-mono bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualBarcodeInput.trim()) {
                      handleManualBarcodeSubmit();
                    } else if (e.key === 'Escape') {
                      handleManualBarcodeCancel();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Usually 8-13 digits long
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleManualBarcodeCancel}
                  className="flex-1 px-4 py-2 border border-input text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualBarcodeSubmit}
                  disabled={!manualBarcodeInput.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Search Product
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: You can find the barcode on the product packaging, usually near the price tag
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Review Modal */}
      {scannedProduct && (
        <ProductReview
          product={scannedProduct}
          onSave={handleProductSave}
          onCancel={handleProductCancel}
        />
      )}
    </div>
  )
}

export default function ScanMeal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <ScanMealContent />
    </Suspense>
  )
}