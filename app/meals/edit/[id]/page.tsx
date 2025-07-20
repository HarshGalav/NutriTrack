"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import { MealForm } from "@/components/MealForm";

interface Meal {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  quantity: number;
  unit: string;
  barcode?: string;
  brand?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

function EditMealContent({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealId, setMealId] = useState<string | null>(null);

  useEffect(() => {
    const getMealId = async () => {
      const resolvedParams = await params;
      setMealId(resolvedParams.id);
    };
    getMealId();
  }, [params]);

  const fetchMeal = useCallback(async () => {
    if (!mealId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/meals/${mealId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Meal not found");
        } else {
          setError("Failed to load meal");
        }
        return;
      }

      const mealData = await response.json();
      setMeal(mealData);
    } catch (error) {
      console.error("Error fetching meal:", error);
      setError("Failed to load meal");
    } finally {
      setLoading(false);
    }
  }, [mealId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && mealId) {
      fetchMeal();
    }
  }, [status, mealId, router, fetchMeal]);

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Meal Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The meal you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Convert meal data to form format
  const initialData = {
    name: meal.name,
    description: meal.description || "",
    calories: meal.calories.toString(),
    protein: meal.protein.toString(),
    carbs: meal.carbs.toString(),
    fat: meal.fat.toString(),
    fiber: meal.fiber?.toString() || "",
    sugar: meal.sugar?.toString() || "",
    sodium: meal.sodium?.toString() || "",
    quantity: meal.quantity.toString(),
    unit: meal.unit,
    imageUrl: meal.imageUrl || "",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Meal</h1>
        <p className="text-muted-foreground">
          Update the details of your meal and its nutritional information
        </p>
        {meal.barcode && (
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">Barcode:</span> {meal.barcode}
            {meal.brand && (
              <span className="ml-2">
                • <span className="font-medium">Brand:</span> {meal.brand}
              </span>
            )}
            {meal.source && (
              <span className="ml-2">
                • <span className="font-medium">Source:</span> {meal.source}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <MealForm
          initialData={initialData}
          mealId={meal.id}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}

export default function EditMeal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }
    >
      <EditMealContent params={params} />
    </Suspense>
  );
}
