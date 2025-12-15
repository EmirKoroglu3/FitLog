export interface SupplementDto {
  id: string;
  name: string;
  usageNote?: string;
  dosage?: string;
  timing?: string;
}

export interface CreateSupplementRequest {
  name: string;
  usageNote?: string;
  dosage?: string;
  timing?: string;
}

