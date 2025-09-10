export enum ClaimSource {
  Written = 'Written',
  Testimony = 'Testimony',
  TutorObservation = 'TutorObservation',
}

export interface Claim {
  id: string;
  source: ClaimSource;
  confirmed: boolean;
  claimDate: string;
  evidence: string;
  page: number | undefined;
}

export interface CriteriaDefinition {
  id: number;
  title: string;
  guidance: string[];
  claims: Claim[];
}

export interface CriteriaUnit {
  id: number;
  learningOutcome: string;
  sections: CriteriaSection[];
}

export interface CriteriaSection {
  id: number;
  learningOutcome: string;
  criteria: CriteriaDefinition[];
}

export interface CriteriaSet {
  courseTitle: string;
  courseCode: string;
  courseYear: string;
  units: CriteriaUnit[];
  sections: CriteriaSection[];
}
