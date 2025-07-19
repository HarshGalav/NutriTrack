"use client";

import { useState } from "react";
import { ArrowLeft, Save, Edit3, Package } from "lucide-react";
import { ScannedProduct } from "@/lib/barcode";

interface MealData {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: number;
  servingUnit: string;
  notes: string;
  barcode: string;
  source: string;
}

interface ProductReviewProps {
  product: ScannedProduct;
  onSave: (mealData: MealData) => void;
  onCancel: () => void;
}

export default function ProductReview({
  product,
  onSave,
  onCancel,
}: ProductReviewProps) {
  const [servingSize, setServingSize] = useState(product.serving.size);
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const calculateNutrition = (
    baseValue: number,
    baseServing: number,
    currentServing: number
  ) => {
    return Math.round(((baseValue * currentServing) / baseServing) * 10) / 10;
  };

  const currentNutrition = {
    calories: calculateNutrition(
      product.nutrition.calories,
      product.serving.size,
      servingSize
    ),
    protein: calculateNutrition(
      product.nutrition.protein,
      product.serving.size,
      servingSize
    ),
    carbs: calculateNutrition(
      product.nutrition.carbs,
      product.serving.size,
      servingSize
    ),
    fat: calculateNutrition(
      product.nutrition.fat,
      product.serving.size,
      servingSize
    ),
    fiber: product.nutrition.fiber
      ? calculateNutrition(
          product.nutrition.fiber,
          product.serving.size,
          servingSize
        )
      : undefined,
    sugar: product.nutrition.sugar
      ? calculateNutrition(
          product.nutrition.sugar,
          product.serving.size,
          servingSize
        )
      : undefined,
    sodium: product.nutrition.sodium
      ? calculateNutrition(
          product.nutrition.sodium,
          product.serving.size,
          servingSize
        )
      : undefined,
  };

  const handleSave = () => {
    const mealData = {
      name: editedProduct.name,
      brand: editedProduct.brand || "",
      calories: currentNutrition.calories,
      protein: currentNutrition.protein,
      carbs: currentNutrition.carbs,
      fat: currentNutrition.fat,
      fiber: currentNutrition.fiber || 0,
      sugar: currentNutrition.sugar || 0,
      sodium: currentNutrition.sodium || 0,
      servingSize: servingSize,
      servingUnit: product.serving.unit,
      notes: notes,
      barcode: product.barcode,
      source: product.source,
    };
    onSave(mealData);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProductChange = (field: string, value: string | Record<string, number>) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: field === "nutrition" && typeof value === "object" 
        ? { ...prev.nutrition, ...value } 
        : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Review Product
          </h1>
          <button
            onClick={handleEditToggle}
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Product Info */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-start space-x-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
            ) : (
              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedProduct.name}
                    onChange={(e) =>
                      handleProductChange("name", e.target.value)
                    }
                    className="w-full text-lg font-semibold bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={editedProduct.brand || ""}
                    onChange={(e) =>
                      handleProductChange("brand", e.target.value)
                    }
                    placeholder="Brand"
                    className="w-full text-muted-foreground bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {editedProduct.name}
                  </h2>
                  {editedProduct.brand && (
                    <p className="text-muted-foreground font-medium mt-1">
                      {editedProduct.brand}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-3 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Barcode:</span>{" "}
                  {product.barcode}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Source:</span>{" "}
                  {product.source === "openfoodfacts"
                    ? "Open Food Facts"
                    : product.source}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Serving Size */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Serving Size
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={servingSize}
              onChange={(e) => setServingSize(parseFloat(e.target.value) || 0)}
              className="flex-1 border border-input rounded-lg px-4 py-3 text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg font-medium"
              min="0"
              step="0.1"
            />
            <span className="text-muted-foreground font-medium text-lg">
              {product.serving.unit}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 bg-muted/50 rounded-md px-3 py-2">
            <span className="font-medium">Original serving:</span>{" "}
            {product.serving.description}
          </p>
        </div>

        {/* Nutrition Facts */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Nutrition Facts
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border bg-primary/5 rounded-lg px-4">
              <span className="font-semibold text-foreground">Calories</span>
              <span className="text-2xl font-bold text-primary">
                {currentNutrition.calories}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                <span className="font-medium text-foreground">Protein</span>
                <span className="font-semibold text-foreground">
                  {currentNutrition.protein}g
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                <span className="font-medium text-foreground">Carbs</span>
                <span className="font-semibold text-foreground">
                  {currentNutrition.carbs}g
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                <span className="font-medium text-foreground">Fat</span>
                <span className="font-semibold text-foreground">
                  {currentNutrition.fat}g
                </span>
              </div>
              {currentNutrition.fiber !== undefined && (
                <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                  <span className="font-medium text-foreground">Fiber</span>
                  <span className="font-semibold text-foreground">
                    {currentNutrition.fiber}g
                  </span>
                </div>
              )}
              {currentNutrition.sugar !== undefined && (
                <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                  <span className="font-medium text-foreground">Sugar</span>
                  <span className="font-semibold text-foreground">
                    {currentNutrition.sugar}g
                  </span>
                </div>
              )}
              {currentNutrition.sodium !== undefined && (
                <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                  <span className="font-medium text-foreground">Sodium</span>
                  <span className="font-semibold text-foreground">
                    {currentNutrition.sodium}mg
                  </span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-semibold mb-4 text-foreground">
                Edit Nutrition (per {product.serving.size}
                {product.serving.unit})
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={editedProduct.nutrition.calories}
                    onChange={(e) =>
                      handleProductChange("nutrition", {
                        calories: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={editedProduct.nutrition.protein}
                    onChange={(e) =>
                      handleProductChange("nutrition", {
                        protein: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={editedProduct.nutrition.carbs}
                    onChange={(e) =>
                      handleProductChange("nutrition", {
                        carbs: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={editedProduct.nutrition.fat}
                    onChange={(e) =>
                      handleProductChange("nutrition", {
                        fat: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Notes (Optional)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this meal..."
            className="w-full h-24 border border-input rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Save Button */}
        <div className="pb-6">
          <button
            onClick={handleSave}
            disabled={servingSize <= 0}
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold text-lg shadow-sm transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Add to Meal Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
