'use client'

import { AlertTriangle, RefreshCw, Edit3, Camera, Type, X } from 'lucide-react'

interface AIAnalysisErrorProps {
  isVisible: boolean
  analysisType: 'image' | 'text'
  errorMessage?: string
  onRetry: () => void
  onManualEntry: () => void
  onClose: () => void
}

const errorTips = {
  image: [
    'Ensure good lighting and clear visibility',
    'Include the entire meal in the frame',
    'Avoid blurry or dark photos',
    'Try taking the photo from different angles',
    'Make sure food items are clearly separated'
  ],
  text: [
    'Be more specific about ingredients',
    'Include cooking methods (grilled, fried, etc.)',
    'Mention portion sizes or quantities',
    'Use common food names',
    'Try breaking down complex dishes'
  ]
}

const retryMessages = {
  image: 'Take Another Photo',
  text: 'Try Different Description'
}

export default function AIAnalysisError({ 
  isVisible, 
  analysisType, 
  errorMessage = "I couldn't recognize the food in your submission",
  onRetry, 
  onManualEntry, 
  onClose 
}: AIAnalysisErrorProps) {
  if (!isVisible) return null

  const tips = errorTips[analysisType]
  const retryMessage = retryMessages[analysisType]
  const AnalysisIcon = analysisType === 'image' ? Camera : Type

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl max-w-md w-full border border-border shadow-2xl">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <AnalysisIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-foreground">
              Analysis Unsuccessful
            </h2>
            <p className="text-muted-foreground text-sm">
              {errorMessage}
            </p>
          </div>
        </div>

        {/* Error Details */}
        <div className="px-6 pb-4">
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                  What went wrong?
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Our AI had trouble identifying the food items in your {analysisType}. 
                  This can happen with unclear images, unusual dishes, or vague descriptions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="px-6 pb-4">
          <h3 className="font-medium mb-3 text-foreground">
            💡 Tips for better results:
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-4 border-t border-border">
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{retryMessage}</span>
            </button>
            
            <button
              onClick={onManualEntry}
              className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Edit3 className="w-4 h-4" />
              <span>Enter Meal Manually</span>
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Don't worry! You can always add meals manually with full control over the details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}