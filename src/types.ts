/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DimensionId = 
  | 'intrinsic_motivation'
  | 'autonomy_readiness'
  | 'deep_processing'
  | 'surface_risk'
  | 'metacognitive_monitoring'
  | 'structure_dependence'
  | 'collaboration_affinity'
  | 'reflective_depth'
  | 'cognitive_persistence';

export type LevelId = 'engagement' | 'cognitive' | 'support' | 'development';

export interface Level {
  id: LevelId;
  label: string;
  dimensions: DimensionId[];
}

export interface Dimension {
  id: DimensionId;
  label: string;
  description: string;
  framework: string;
  lowLabel: string;
  highLabel: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'likert' | 'scenario' | 'ranking';
  options?: string[];
  weights: Partial<Record<DimensionId, number>>;
  rationale: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
}

export interface Response {
  id: string;
  surveyId: string;
  timestamp: number;
  answers: Record<string, number>; // questionId -> value (0-1 or 1-5)
}

export interface Cohort {
  id: string;
  name: string;
  responses: Response[];
}

export interface AnalysisResult {
  dimensionId: DimensionId;
  score: number; // 0-100
  distribution: number[];
  interpretation: string;
}

export interface PedagogicalStrategy {
  title: string;
  description: string;
  theory: string;
  impact: 'low' | 'moderate' | 'high';
}
