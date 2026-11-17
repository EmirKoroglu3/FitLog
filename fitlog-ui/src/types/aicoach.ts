export type GoalType = 0 | 1 | 2; // Bulk, Cut, Maintain

export interface AiCoachAnalysisRequest {
  height: number;
  weight: number;
  bodyFatPercentage: number;
  goal: GoalType;
  weeklyWorkoutFrequency: number;
}

export interface AiCoachCalculatedMetrics {
  weeklyVolumePerExercise: Record<string, number>;
  averageWeeklyCalories: number;
  averageWeeklyProtein: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  progressiveOverloadDetected: boolean;
  plateauDetected: boolean;
  plateauExercises: string[];
}

export type InsightSeverity = 'good' | 'info' | 'warning';
export type InsightCategory = 'training' | 'nutrition' | 'body' | 'recovery';

export interface CoachInsight {
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  metric?: string | null;
  detail: string;
  action: string;
}

export interface CoachTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface CoachStats {
  sessionsPerWeek: number;
  loggedNutritionDays: number;
  averageDailyCalories: number;
  averageDailyProtein: number;
  proteinPerKg: number;
  weightChangePerWeek?: number | null;
  bodyWeightKg: number;
}

export interface AiCoachAnalysisResponse {
  summary: string;
  insights: CoachInsight[];
  targets: CoachTargets;
  stats: CoachStats;
  source: 'rules' | 'openai';
  trainingAdvice: string;
  nutritionAdvice: string;
  bulkCutRecommendation: string;
  macroSuggestion: string;
  plateauWarning: string;
  rawAiRecommendation: string;
  calculatedMetrics: AiCoachCalculatedMetrics;
}
