"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Camera,
  Utensils,
  Zap,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface AIAnalysisLoaderProps {
  isVisible: boolean;
  analysisType: "image" | "text";
}

const analysisSteps = {
  image: [
    { icon: Camera, text: "Processing image...", duration: 1500 },
    { icon: Brain, text: "AI analyzing food items...", duration: 2000 },
    { icon: Utensils, text: "Identifying ingredients...", duration: 1800 },
    { icon: Zap, text: "Calculating nutrition...", duration: 1200 },
    { icon: CheckCircle, text: "Analysis complete!", duration: 500 },
  ],
  text: [
    { icon: Brain, text: "Understanding description...", duration: 1200 },
    { icon: Utensils, text: "Identifying food items...", duration: 1800 },
    { icon: Zap, text: "Calculating nutrition...", duration: 1500 },
    { icon: CheckCircle, text: "Analysis complete!", duration: 500 },
  ],
};

export default function AIAnalysisLoader({
  isVisible,
  analysisType,
}: AIAnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = analysisSteps[analysisType];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepTimer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) return;

      setCurrentStep(stepIndex);

      // Animate progress bar for current step
      let currentProgress = 0;
      const stepProgress = 100 / steps.length;
      const startProgress = stepIndex * stepProgress;

      progressInterval = setInterval(() => {
        currentProgress += 2;
        const totalProgress =
          startProgress + (currentProgress / 100) * stepProgress;
        setProgress(Math.min(totalProgress, (stepIndex + 1) * stepProgress));

        if (currentProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, steps[stepIndex].duration / 50);

      // Move to next step
      stepTimer = setTimeout(() => {
        clearInterval(progressInterval);
        runStep(stepIndex + 1);
      }, steps[stepIndex].duration);
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressInterval);
    };
  }, [isVisible, analysisType, steps]);

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep]?.icon || Loader2;
  const isComplete = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl p-8 max-w-md mx-4 w-full border border-border shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CurrentIcon
                className={`w-10 h-10 text-primary ${
                  !isComplete ? "animate-pulse" : ""
                }`}
              />
            </div>
            {!isComplete && (
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary/20 rounded-full animate-spin mx-auto">
                <div className="absolute top-0 left-0 w-4 h-4 bg-primary rounded-full"></div>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isComplete ? "🎉 Ready!" : "🤖 AI Analysis"}
          </h2>
          <p className="text-muted-foreground">
            {isComplete
              ? "Your meal has been analyzed successfully!"
              : "Our AI is analyzing your meal..."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-foreground">
            {steps[currentStep]?.text || "Processing..."}
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCurrentStep = index === currentStep;
            const isCompletedStep = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                  isCurrentStep
                    ? "bg-primary/10 border border-primary/20"
                    : isCompletedStep
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-muted/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrentStep
                      ? "bg-primary text-primary-foreground"
                      : isCompletedStep
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompletedStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <StepIcon
                      className={`w-4 h-4 ${
                        isCurrentStep ? "animate-pulse" : ""
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isCurrentStep
                      ? "text-foreground font-medium"
                      : isCompletedStep
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.text}
                </span>
                {isCurrentStep && (
                  <div className="ml-auto">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
                {isCompletedStep && (
                  <div className="ml-auto">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fun Facts */}
        {!isComplete && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 Did you know? Our AI can identify over 10,000 different food
              items and calculate nutrition with 95% accuracy!
            </p>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
              ✨ Redirecting you to review the results...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
