/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, Question, DimensionId, AnalysisResult, Cohort } from './types';
import { DIMENSIONS } from './constants';

export function analyzeResponses(responses: Response[], questions: Question[]): AnalysisResult[] {
  if (responses.length === 0) return [];

  const results: AnalysisResult[] = DIMENSIONS.map((dim) => {
    let totalDimScore = 0;
    let totalDimResponses = 0;
    const individualScores: number[] = [];

    responses.forEach((resp) => {
      let respSum = 0;
      let respCount = 0;

      Object.entries(resp.answers).forEach(([qId, value]) => {
        const question = questions.find((q) => q.id === qId);
        if (question && question.weights[dim.id] !== undefined) {
          const weight = question.weights[dim.id]!;
          
          // Reverse scoring logic: if weight is negative, value = 6 - value
          const finalValue = weight < 0 ? (6 - value) : value;
          
          respSum += finalValue;
          respCount += 1;
        }
      });

      if (respCount > 0) {
        const mean = respSum / respCount;
        const finalRespScore = mean * 20; // Convert 1-5 to 0-100 (approx)
        individualScores.push(finalRespScore);
        totalDimScore += finalRespScore;
        totalDimResponses += 1;
      }
    });

    const mean = totalDimResponses > 0 ? totalDimScore / totalDimResponses : 50;

    return {
      dimensionId: dim.id,
      score: Math.round(mean),
      distribution: individualScores,
      interpretation: getInterpretation(dim.id, mean),
    };
  });

  return results;
}

function getInterpretation(dimId: DimensionId, score: number): string {
  if (score > 70) {
    switch (dimId) {
      case 'intrinsic_motivation': return 'High mastery orientation; students seek understanding for internal satisfaction.';
      case 'autonomy_readiness': return 'High self-direction; students are comfortable with open-ended tasks.';
      case 'deep_processing': return 'Strong conceptual focus; students look for underlying principles.';
      case 'surface_risk': return 'Low risk of rote memorization; students avoid surface-level shortcuts.';
      case 'metacognitive_monitoring': return 'Strong self-regulation; students actively monitor their understanding.';
      case 'structure_dependence': return 'High need for scaffolding; students may feel lost without explicit steps.';
      case 'collaboration_affinity': return 'Strong social orientation; students thrive in peer-to-peer settings.';
      case 'reflective_depth': return 'High epistemic maturity; students connect learning to real-world contexts.';
      case 'cognitive_persistence': return 'High resilience; students persist through difficult challenges.';
    }
  } else if (score < 40) {
    switch (dimId) {
      case 'intrinsic_motivation': return 'Performance/Extrinsic orientation; students may focus on grades over mastery.';
      case 'autonomy_readiness': return 'Preference for structure; students may struggle with open-ended projects.';
      case 'deep_processing': return 'Potential surface focus; students may miss underlying conceptual links.';
      case 'surface_risk': return 'High risk of surface learning; students may prioritize rote memorization.';
      case 'metacognitive_monitoring': return 'Weak self-regulation; students may not notice when they are confused.';
      case 'structure_dependence': return 'High tolerance for ambiguity; students enjoy open-ended discovery.';
      case 'collaboration_affinity': return 'Independent preference; students may find group work distracting.';
      case 'reflective_depth': return 'Limited reflection; students may see topics as isolated facts.';
      case 'cognitive_persistence': return 'Low resilience; students may give up quickly on difficult tasks.';
    }
  }
  return 'Balanced or mixed orientation across the cohort.';
}

export function getStrategies(results: AnalysisResult[]) {
  const strategies = [];

  const structure = results.find(r => r.dimensionId === 'structure_dependence');
  const autonomy = results.find(r => r.dimensionId === 'autonomy_readiness');
  const metacog = results.find(r => r.dimensionId === 'metacognitive_monitoring');

  if (structure && structure.score > 70 && metacog && metacog.score < 50) {
    strategies.push({
      title: 'Guided Scaffolding',
      description: 'Provide detailed worksheets and frequent formative feedback cycles.',
      theory: 'Cognitive Load Theory (Sweller)',
      impact: 'high'
    });
  }

  const deep = results.find(r => r.dimensionId === 'deep_processing');
  const reflect = results.find(r => r.dimensionId === 'reflective_depth');
  if (deep && deep.score > 70 && reflect && reflect.score > 70) {
    strategies.push({
      title: 'Inquiry-Based Learning',
      description: 'Use research-based assignments that require high-level synthesis.',
      theory: 'Constructivism (Piaget/Vygotsky)',
      impact: 'high'
    });
  }

  const social = results.find(r => r.dimensionId === 'collaboration_affinity');
  if (social && social.score > 70) {
    strategies.push({
      title: 'Cooperative Pedagogy',
      description: 'Implement structured group tasks and peer-instruction cycles.',
      theory: 'Social Constructivism (Vygotsky)',
      impact: 'moderate'
    });
  }

  return strategies;
}

export function getAssignmentRecommendations(results: AnalysisResult[]) {
  const recommendations = [];
  
  const autonomy = results.find(r => r.dimensionId === 'autonomy_readiness');
  const deep = results.find(r => r.dimensionId === 'deep_processing');
  const metacog = results.find(r => r.dimensionId === 'metacognitive_monitoring');

  // Low Effort Option
  recommendations.push({
    type: 'Low Effort Adjustment',
    title: 'Reflective Minute Paper',
    description: 'Ask students to identify the "muddiest point" at the end of each session.',
    scaffolding: 'Low',
    cognitiveLevel: 'Understanding / Analyzing',
    theory: 'Metacognition (Flavell)'
  });

  // Moderate Redesign
  if (autonomy && autonomy.score > 65) {
    recommendations.push({
      type: 'Moderate Innovation',
      title: 'Multi-Format Choice Board',
      description: 'Allow students to choose their project format (paper, podcast, or video).',
      scaffolding: 'Moderate',
      cognitiveLevel: 'Creating',
      theory: 'Universal Design for Learning (UDL)'
    });
  } else {
    recommendations.push({
      type: 'Moderate Innovation',
      title: 'Structured Case Study',
      description: 'Provide a real-world scenario with guided questions leading to a solution.',
      scaffolding: 'High',
      cognitiveLevel: 'Applying',
      theory: 'Case-Based Learning'
    });
  }

  // High Innovation
  if (deep && deep.score > 70 && autonomy && autonomy.score > 65 && metacog && metacog.score > 60) {
    recommendations.push({
      type: 'High Innovation',
      title: 'Problem-Based Learning (PBL)',
      description: 'Teams solve real community problems with minimal initial guidance.',
      scaffolding: 'Adaptive',
      cognitiveLevel: 'Evaluating / Creating',
      theory: 'PBL (Barrows)'
    });
  }

  return recommendations;
}
