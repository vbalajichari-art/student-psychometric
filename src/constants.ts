/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dimension, Question, Level } from './types';

export const LEVELS: Level[] = [
  { id: 'engagement', label: 'Level 1: Engagement Profile', dimensions: ['intrinsic_motivation', 'cognitive_persistence', 'autonomy_readiness'] },
  { id: 'cognitive', label: 'Level 2: Cognitive Processing', dimensions: ['deep_processing', 'surface_risk', 'metacognitive_monitoring'] },
  { id: 'support', label: 'Level 3: Instructional Support Needs', dimensions: ['structure_dependence', 'collaboration_affinity'] },
  { id: 'development', label: 'Level 4: Development Indicators', dimensions: ['reflective_depth'] },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: 'intrinsic_motivation',
    label: 'Intrinsic Motivation',
    description: 'Propensity for mastery orientation vs. extrinsic performance.',
    framework: 'Self-Determination Theory (Deci & Ryan)',
    lowLabel: 'Extrinsic',
    highLabel: 'Mastery',
  },
  {
    id: 'autonomy_readiness',
    label: 'Autonomy Readiness',
    description: 'Degree of self-determined motivation and desire for choice.',
    framework: 'Self-Determination Theory (Deci & Ryan)',
    lowLabel: 'Structured',
    highLabel: 'Self-Directed',
  },
  {
    id: 'deep_processing',
    label: 'Deep Processing',
    description: 'Propensity for seeking underlying principles and meaning.',
    framework: 'Biggs - Deep vs. Surface Learning',
    lowLabel: 'Low',
    highLabel: 'High',
  },
  {
    id: 'surface_risk',
    label: 'Surface Processing Risk',
    description: 'Propensity for rote memorization and exam-only focus.',
    framework: 'Biggs - Deep vs. Surface Learning',
    lowLabel: 'High Risk',
    highLabel: 'Low Risk',
  },
  {
    id: 'metacognitive_monitoring',
    label: 'Metacognitive Monitoring',
    description: 'Propensity for self-regulated learning and strategy adjustment.',
    framework: 'Metacognitive Awareness Inventory (Schraw & Dennison)',
    lowLabel: 'Low',
    highLabel: 'High',
  },
  {
    id: 'structure_dependence',
    label: 'Structure Dependence',
    description: 'Preference for explicit guidance vs. open-ended discovery.',
    framework: 'Cognitive Load Theory (Sweller)',
    lowLabel: 'Independent',
    highLabel: 'Dependent',
  },
  {
    id: 'collaboration_affinity',
    label: 'Collaboration Affinity',
    description: 'Preference for collaborative vs. independent learning.',
    framework: 'Social Constructivism (Vygotsky)',
    lowLabel: 'Independent',
    highLabel: 'Collaborative',
  },
  {
    id: 'reflective_depth',
    label: 'Reflective Depth',
    description: 'Propensity for connecting learning to real-life and reconsidering views.',
    framework: 'Reflective Practice (Schön)',
    lowLabel: 'Low',
    highLabel: 'High',
  },
  {
    id: 'cognitive_persistence',
    label: 'Cognitive Persistence',
    description: 'Propensity for effort regulation and resilience in difficult tasks.',
    framework: 'Self-Regulated Learning Research',
    lowLabel: 'Low',
    highLabel: 'High',
  },
];

export const DEFAULT_QUESTIONS: Question[] = [
  // A. Intrinsic Motivation
  { id: 'q1', text: 'I try to understand topics even when they are not directly graded.', type: 'likert', weights: { intrinsic_motivation: 1.0 }, rationale: 'Measures mastery orientation.' },
  { id: 'q2', text: 'I feel personally satisfied when I master a difficult concept.', type: 'likert', weights: { intrinsic_motivation: 1.0 }, rationale: 'Measures intrinsic satisfaction.' },
  { id: 'q3', text: 'I engage with course material beyond required tasks.', type: 'likert', weights: { intrinsic_motivation: 1.0 }, rationale: 'Measures engagement depth.' },
  
  // B. Autonomy Readiness
  { id: 'q4', text: 'I prefer assignments where I can choose my approach.', type: 'likert', weights: { autonomy_readiness: 1.0 }, rationale: 'Measures desire for choice.' },
  { id: 'q5', text: 'I am comfortable working without detailed step-by-step instructions.', type: 'likert', weights: { autonomy_readiness: 1.0 }, rationale: 'Measures comfort with ambiguity.' },
  { id: 'q6', text: 'I take initiative when tasks are open-ended.', type: 'likert', weights: { autonomy_readiness: 1.0 }, rationale: 'Measures self-directed initiative.' },
  
  // C. Deep Processing Orientation
  { id: 'q7', text: 'I try to connect new ideas to previous knowledge.', type: 'likert', weights: { deep_processing: 1.0 }, rationale: 'Measures relational thinking.' },
  { id: 'q8', text: 'I look for underlying principles rather than memorizing facts.', type: 'likert', weights: { deep_processing: 1.0 }, rationale: 'Measures conceptual focus.' },
  { id: 'q9', text: 'I question assumptions in what I study.', type: 'likert', weights: { deep_processing: 1.0 }, rationale: 'Measures critical engagement.' },
  
  // D. Surface Processing Risk (Reverse Scored)
  { id: 'q10', text: 'I focus only on what is likely to appear in exams.', type: 'likert', weights: { surface_risk: -1.0 }, rationale: 'Measures exam-only focus.' },
  { id: 'q11', text: 'Memorizing facts is usually enough for me.', type: 'likert', weights: { surface_risk: -1.0 }, rationale: 'Measures rote memorization.' },
  { id: 'q12', text: 'I avoid topics that require extended thinking.', type: 'likert', weights: { surface_risk: -1.0 }, rationale: 'Measures cognitive avoidance.' },
  
  // E. Metacognitive Monitoring
  { id: 'q13', text: 'I check whether I really understand what I read.', type: 'likert', weights: { metacognitive_monitoring: 1.0 }, rationale: 'Measures self-monitoring.' },
  { id: 'q14', text: 'I adjust my study strategy when something isn’t working.', type: 'likert', weights: { metacognitive_monitoring: 1.0 }, rationale: 'Measures strategy adjustment.' },
  { id: 'q15', text: 'I can identify when I am confused about a topic.', type: 'likert', weights: { metacognitive_monitoring: 1.0 }, rationale: 'Measures confusion awareness.' },
  
  // F. Structure Dependence
  { id: 'q16', text: 'I need clear instructions before starting a task.', type: 'likert', weights: { structure_dependence: 1.0 }, rationale: 'Measures instruction need.' },
  { id: 'q17', text: 'I feel lost when expectations are not explicitly stated.', type: 'likert', weights: { structure_dependence: 1.0 }, rationale: 'Measures ambiguity discomfort.' },
  { id: 'q18', text: 'I perform better when the learning steps are clearly outlined.', type: 'likert', weights: { structure_dependence: 1.0 }, rationale: 'Measures preference for scaffolding.' },
  
  // G. Collaboration Affinity
  { id: 'q19', text: 'I learn effectively through discussion.', type: 'likert', weights: { collaboration_affinity: 1.0 }, rationale: 'Measures discussion preference.' },
  { id: 'q20', text: 'Group tasks improve my understanding.', type: 'likert', weights: { collaboration_affinity: 1.0 }, rationale: 'Measures collaborative benefit.' },
  { id: 'q21', text: 'I contribute actively in collaborative settings.', type: 'likert', weights: { collaboration_affinity: 1.0 }, rationale: 'Measures social contribution.' },
  
  // H. Reflective Depth
  { id: 'q22', text: 'I think about how what I learn connects to real-life contexts.', type: 'likert', weights: { reflective_depth: 1.0 }, rationale: 'Measures context connection.' },
  { id: 'q23', text: 'I reflect on feedback to improve my approach.', type: 'likert', weights: { reflective_depth: 1.0 }, rationale: 'Measures feedback reflection.' },
  { id: 'q24', text: 'I reconsider my viewpoints when presented with new evidence.', type: 'likert', weights: { reflective_depth: 1.0 }, rationale: 'Measures epistemic flexibility.' },
  
  // I. Cognitive Persistence
  { id: 'q25', text: 'I continue working even when material is challenging.', type: 'likert', weights: { cognitive_persistence: 1.0 }, rationale: 'Measures persistence.' },
  { id: 'q26', text: 'I persist with difficult tasks before asking for help.', type: 'likert', weights: { cognitive_persistence: 1.0 }, rationale: 'Measures effort regulation.' },
  { id: 'q27', text: 'I enjoy solving complex problems.', type: 'likert', weights: { cognitive_persistence: 1.0 }, rationale: 'Measures cognitive resilience.' },
];
