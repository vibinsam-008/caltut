/**
 * Core Type Definitions for MIT Calculus Tutor
 */

export type DifficultyLevel = 'foundational' | 'standard' | 'challenging' | 'advanced';

export type ProblemFormat = 'conceptual' | 'computational' | 'derivation' | 'visualization' | 'application';

export type SolutionVisibility = 'hidden' | 'hints_available' | 'guided_solution' | 'full_solution';

export type AssessmentStyle = 'practice' | 'timed_mock_test' | 'topic_revision';

export type EvidenceLevel =
  | 'not_assessed'
  | 'uncertain'
  | 'demonstrated_with_assistance'
  | 'demonstrated_independently'
  | 'needs_reassessment';

export type TeachingAction =
  | 'explain_concept'
  | 'give_intuitive_example'
  | 'ask_diagnostic_question'
  | 'request_missing_step'
  | 'provide_hint'
  | 'show_graph_representation'
  | 'verify_mathematical_step'
  | 'explain_misconception'
  | 'adjust_difficulty'
  | 'assign_fresh_problem'
  | 'reassess_prerequisite';

export interface LearningObjective {
  id: string;
  code: string;
  title: string;
  description: string;
  prerequisites: string[];
  evidenceLevel: EvidenceLevel;
  lastAssessed?: string;
}

export interface Topic {
  id: string;
  unitId: string;
  code: string;
  title: string;
  description: string;
  learningObjectives: LearningObjective[];
  prerequisites: string[];
  sourceReferences: string[];
  approvalStatus: 'approved' | 'pending' | 'draft';
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  title: string;
  description: string;
  topics: Topic[];
}

export interface CourseCurriculum {
  courseId: string;
  code: string;
  title: string;
  institution: string;
  department: string;
  semester: number;
  regulations: string;
  syllabusVersion: string;
  approvalStatus: 'approved' | 'draft' | 'under_review';
  approvedBy?: string;
  approvalDate?: string;
  sourceDocuments: {
    id: string;
    filename: string;
    uploadedAt: string;
    documentType: string;
    pageCount: number;
  }[];
  units: Unit[];
}

export interface WhiteboardVisualSpec {
  type:
    | 'cartesian_plot'
    | 'bounded_region'
    | 'order_of_integration'
    | 'tangent_line'
    | 'polar_curve'
    | 'critical_points'
    | 'series_approximation';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xRange: [number, number];
  yRange: [number, number];
  functions: {
    id: string;
    expression: string;
    fnString: string;
    color: string;
    label?: string;
    style?: 'solid' | 'dashed';
  }[];
  region?: {
    lowerBoundFn: string;
    upperBoundFn: string;
    xMin: number;
    xMax: number;
    color?: string;
    opacity?: number;
    integrationOrder?: 'dy_dx' | 'dx_dy';
    stripDirection?: 'vertical' | 'horizontal';
  };
  points?: {
    x: number;
    y: number;
    label: string;
    color?: string;
  }[];
  parameters?: {
    name: string;
    label: string;
    min: number;
    max: number;
    step: number;
    currentValue: number;
  }[];
  annotations?: {
    text: string;
    x: number;
    y: number;
    align?: 'left' | 'center' | 'right';
  }[];
}

export interface ProblemStep {
  index: number;
  label: string;
  expression: string;
  justification: string;
  hint?: string;
  commonMisconception?: string;
  isCheckPoint?: boolean;
}

export interface CalculusProblem {
  id: string;
  courseId: string;
  unitId: string;
  topicId: string;
  learningObjectiveId: string;
  title: string;
  statement: string;
  difficulty: DifficultyLevel;
  format: ProblemFormat;
  prerequisites: string[];
  difficultyRationale: string;
  expectedAnswer: string;
  acceptableForms: string[];
  verifiedSolutionSteps: ProblemStep[];
  importantResults: string[];
  commonMisconceptions: {
    id: string;
    trigger: string;
    description: string;
    correction: string;
  }[];
  verificationMethod: string;
  verificationStatus: 'verified' | 'unverified' | 'requires_review';
  sourceProvenance: string;
  whiteboardSpec?: WhiteboardVisualSpec;
}

export interface GuidedSolutionSession {
  problem: CalculusProblem;
  currentStage: 1 | 2 | 3 | 4 | 5; // 1: Understand, 2: Strategy, 3: Derive, 4: Diagnose, 5: Verify
  revealedSteps: number;
  userStepInput: string;
  stepFeedback?: {
    isValid: boolean;
    feedback: string;
    errorType?: 'conceptual' | 'algebraic' | 'arithmetic' | 'geometric' | 'notation';
    suggestion?: string;
  };
  hintsGiven: number;
  completed: boolean;
}

export interface TutorMessage {
  id: string;
  sender: 'tutor' | 'student' | 'system';
  timestamp: string;
  text: string;
  latex?: string;
  actionTaken?: TeachingAction;
  visualSpec?: WhiteboardVisualSpec;
  diagnosticQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LearnerState {
  currentCourseId: string;
  currentUnitId: string;
  currentTopicId: string;
  currentObjectiveId: string;
  objectiveEvidence: Record<string, EvidenceLevel>;
  observedMisconceptions: string[];
  hintCounts: Record<string, number>;
  completedProblems: string[];
  independentSuccessCount: number;
  recommendedAction: TeachingAction;
}
