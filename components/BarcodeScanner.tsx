"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, RotateCcw, Loader2 } from "lucide-react";
import { BarcodeService } from "@/lib/barcode";

interface BarcodeScannerProps {
  onProductFound: (barcode: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onProductFound,
  onError,
  onClose,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeServiceRef = useRef<BarcodeService | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isInitializedRef = useRef(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  // Stable function that won't cause re-renders
  const stopCamera = useCallback(() => {
    console.log("Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (barcodeServiceRef.current) {
      barcodeServiceRef.current.stopDecoding();
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Stable function for barcode detection
  const startBarcodeDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!barcodeServiceRef.current) return;

    try {
      await barcodeServiceRef.current.startContinuousDecoding(
        videoElement,
        (barcode) => {
          if (!isProcessing) {
            setIsProcessing(true);
            onProductFound(barcode);
          }
        },
        (error) => {
          console.warn("Barcode detection error:", error);
        }
      );
    } catch (error) {
      console.error("Failed to start barcode detection:", error);
      onError("Failed to start barcode scanning. Please try again.");
    }
  }, [isProcessing, onProductFound, onError]);

  // Stable function for starting camera
  const startCamera = useCallback(async () => {
    try {
      setHasPermission(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        return;
      }

      console.log("Requesting camera permission...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("Camera permission granted, setting up video...");
      streamRef.current = mediaStream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not available"));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => resolve();
          videoRef.current.onerror = () => reject(new Error("Video failed to load"));
          videoRef.current.play().catch(reject);
        });

        console.log("Video ready, starting barcode detection...");
        setIsScanning(true);
        await startBarcodeDetection(videoRef.current);
      }
    } catch (error: unknown) {
      console.error("Camera access error:", error);
      setHasPermission(false);

      let errorMessage = "Camera access denied. Please allow camera permissions and try again.";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera permission denied. Please allow camera access and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Camera not supported on this browser.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application.";
        }
      }

      onError(errorMessage);
    }
  }, [onError, startBarcodeDetection]);

  // Initialize only once
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    isInitializedRef.current = true;
    barcodeServiceRef.current = new BarcodeService();
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const handleTryAgain = useCallback(() => {
    stopCamera();
    setTimeout(() => startCamera(), 100);
  }, [stopCamera, startCamera]);

  const handleManualEntry = useCallback(() => {
    setShowManualEntry(true);
  }, []);

  const handleManualSubmit = useCallback(() => {
    if (manualBarcode.trim()) {
      setIsProcessing(true);
      setShowManualEntry(false);
      onProductFound(manualBarcode.trim());
    }
  }, [manualBarcode, onProductFound]);

  const handleManualCancel = useCallback(() => {
    setShowManualEntry(false);
    setManualBarcode("");
  }, []);

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Camera Access Required
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              To scan barcodes, please allow camera access. Look for the camera
              icon in your browser&apos;s address bar and click &quot;Allow&quot;.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
              <h4 className="font-medium text-sm mb-2">Troubleshooting:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Click the camera icon in your browser&apos;s address bar</li>
                <li>• Select &quot;Allow&quot; for camera permissions</li>
                <li>• Refresh the page after allowing permissions</li>
                <li>• Make sure no other app is using your camera</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleTryAgain}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Try Again
              </button>
              <button
                onClick={handleManualEntry}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Manual Entry
              </button>
            </div>
            <button
              onClick={handleClose}
              className="mt-3 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold">Scan Barcode</h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Scanning Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Scanning Frame */}
          <div className="w-64 h-40 border-2 border-white border-opacity-50 relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>

            {/* Scanning Line Animation */}
            {isScanning && !isProcessing && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-full h-0.5 bg-white animate-pulse absolute top-1/2 transform -translate-y-1/2"></div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <p className="text-white text-center mt-4">
            {isProcessing
              ? "Processing barcode..."
              : "Position barcode within the frame"}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-black bg-opacity-50">
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleManualEntry}
            disabled={isProcessing}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 flex items-center disabled:opacity-50"
          >
            Manual Entry
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">
            Make sure the barcode is clearly visible and well-lit
          </p>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Enter Barcode Manually
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Type or paste the barcode number from the product
              </p>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="e.g., 1234567890123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualBarcode.trim()) {
                      handleManualSubmit();
                    } else if (e.key === 'Escape') {
                      handleManualCancel();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Usually 8-13 digits long
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleManualCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualBarcode.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Search Product
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 Tip: You can find the barcode on the product packaging, usually near the price tag
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}