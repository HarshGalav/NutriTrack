import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  serving: {
    size: number;
    unit: string;
    description: string;
  };
  source: "openfoodfacts" | "cache" | "manual";
}

export interface ScanError {
  type:
    | "camera_permission"
    | "barcode_not_found"
    | "product_not_found"
    | "network_error";
  message: string;
  suggestions: string[];
}

export interface CachedProduct {
  barcode: string;
  product: ScannedProduct;
  cachedAt: Date;
  expiresAt: Date;
}

export class BarcodeService {
  private reader: BrowserMultiFormatReader;
  private dbName = "barcode-cache";
  private dbVersion = 1;

  constructor() {
    this.reader = new BrowserMultiFormatReader();
  }

  async decodeFromVideoElement(
    videoElement: HTMLVideoElement
  ): Promise<string> {
    try {
      const result = await this.reader.decodeOnceFromVideoDevice(
        undefined,
        videoElement
      );
      return result.getText();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new Error("No barcode found");
      }
      throw error;
    }
  }

  async startContinuousDecoding(
    videoElement: HTMLVideoElement,
    onResult: (barcode: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      await this.reader.decodeFromVideoDevice(
        null,
        videoElement,
        (result, error) => {
          if (result) {
            onResult(result.getText());
          }
          if (error && !(error instanceof NotFoundException)) {
            onError(error);
          }
        }
      );
    } catch (error) {
      onError(error as Error);
    }
  }

  stopDecoding(): void {
    this.reader.reset();
  }

  async getProductInfo(barcode: string): Promise<ScannedProduct> {
    // First check cache
    const cached = await this.getCachedProduct(barcode);
    if (cached && cached.expiresAt > new Date()) {
      return cached.product;
    }

    // Fetch from Open Food Facts API
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 0) {
        throw new Error("Product not found");
      }

      const product = this.formatOpenFoodFactsData(data.product, barcode);

      // Cache the product
      await this.cacheProduct(barcode, product);

      return product;
    } catch (error) {
      throw new Error(`Failed to fetch product info: ${error}`);
    }
  }

  private formatOpenFoodFactsData(
    product: Record<string, unknown>,
    barcode: string
  ): ScannedProduct {
    const nutriments = (product.nutriments as Record<string, number>) || {};
    const servingSize =
      (product.serving_size as string) ||
      (product.product_quantity as string) ||
      "100";

    return {
      barcode,
      name: (product.product_name as string) || "Unknown Product",
      brand: product.brands as string,
      imageUrl: product.image_url as string,
      nutrition: {
        calories: Math.round(
          nutriments.energy_kcal_100g || nutriments["energy-kcal_100g"] || 0
        ),
        protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
        fiber: nutriments.fiber_100g
          ? Math.round(nutriments.fiber_100g * 10) / 10
          : undefined,
        sugar: nutriments.sugars_100g
          ? Math.round(nutriments.sugars_100g * 10) / 10
          : undefined,
        sodium: nutriments.sodium_100g
          ? Math.round(nutriments.sodium_100g * 1000) / 10
          : undefined, // Convert to mg
      },
      serving: {
        size: parseFloat(servingSize) || 100,
        unit: (product.serving_size as string) ? "g" : "g",
        description: (product.serving_size as string) || "100g",
      },
      source: "openfoodfacts",
    };
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", {
            keyPath: "barcode",
          });
          store.createIndex("expiresAt", "expiresAt", { unique: false });
        }
      };
    });
  }

  async cacheProduct(barcode: string, product: ScannedProduct): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(["products"], "readwrite");
      const store = transaction.objectStore("products");

      const cachedProduct: CachedProduct = {
        barcode,
        product,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      await store.put(cachedProduct);
    } catch (error) {
      console.warn("Failed to cache product:", error);
    }
  }

  async getCachedProduct(barcode: string): Promise<CachedProduct | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(["products"], "readonly");
      const store = transaction.objectStore("products");

      return new Promise((resolve, reject) => {
        const request = store.get(barcode);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Convert date strings back to Date objects
            result.cachedAt = new Date(result.cachedAt);
            result.expiresAt = new Date(result.expiresAt);
          }
          resolve(result || null);
        };
      });
    } catch (error) {
      console.warn("Failed to get cached product:", error);
      return null;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(["products"], "readwrite");
      const store = transaction.objectStore("products");
      const index = store.index("expiresAt");

      const range = IDBKeyRange.upperBound(new Date());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn("Failed to clear expired cache:", error);
    }
  }
}
