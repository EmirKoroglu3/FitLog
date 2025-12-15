export interface ProfileDto {
  id: string;
  email: string;
  name: string;
  surname: string;
  height?: number;
  weight?: number;
  gender?: string;
  birthDate?: string;
  fitnessGoal?: string;
  experienceLevel?: string;
  age?: number;
  bmi?: number;
  bmiCategory?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  surname?: string;
  height?: number;
  weight?: number;
  gender?: string;
  birthDate?: string;
  fitnessGoal?: string;
  experienceLevel?: string;
}

export interface ProfileRecommendation {
  category: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProfileAnalysis {
  profile: ProfileDto;
  recommendations: ProfileRecommendation[];
  suggestedProgram: string;
  dailyCalorieNeed: number;
  dailyProteinNeed: number;
}

