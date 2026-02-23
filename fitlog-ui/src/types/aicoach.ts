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

export interface AiCoachAnalysisResponse {
  trainingAdvice: string;
  nutritionAdvice: string;
  bulkCutRecommendation: string;
  macroSuggestion: string;
  plateauWarning: string;
  rawAiRecommendation: string;
  calculatedMetrics: AiCoachCalculatedMetrics;
}
