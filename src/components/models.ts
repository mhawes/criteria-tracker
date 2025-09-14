export enum ClaimSource {
  Written = 'Written',
  Testimony = 'Testimony',
  TutorObservation = 'TutorObservation',
}

export interface CriteriaClaim {
  criteriaId: string;
  page: number | undefined;
}

export interface WorkSubmission {
  evidence: string;
  claimDate: string;
  source: ClaimSource;
  confirmed: boolean;
  criteriaClaims: CriteriaClaim[];
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
  _visible: boolean;
  id: string;
  title: string;
  guidance: string[];
  claims: Claim[];
}

export interface CriteriaUnit {
  _visible: boolean;
  id: string;
  learningOutcome: string;
  sections: CriteriaSection[];
}

export interface CriteriaSection {
  _visible: boolean;
  id: string;
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
