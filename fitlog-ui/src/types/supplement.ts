export interface SupplementDto {
  id: string;
  name: string;
  usageNote?: string;
  dosage?: string;
  timing?: string;
  /** Nutrition per serving; counted in daily totals on days the supplement is marked as taken. */
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
}

export interface CreateSupplementRequest {
  name: string;
  usageNote?: string;
  dosage?: string;
  timing?: string;
  /** Nutrition per serving; counted in daily totals on days the supplement is marked as taken. */
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
}

