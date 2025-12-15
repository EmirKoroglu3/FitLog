export interface NutritionLogDto {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbohydrates?: number;
  fat?: number;
  mealType?: string;
  notes?: string;
}

export interface CreateNutritionLogRequest {
  date: string;
  calories: number;
  protein: number;
  carbohydrates?: number;
  fat?: number;
  mealType?: string;
  notes?: string;
}

export interface NutritionSummaryDto {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  mealCount: number;
}

