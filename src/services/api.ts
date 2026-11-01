/**
 * Frontend API Service Layer
 * Interacts with backend Express API for verification, syllabus management, and tutor reasoning.
 */

import {
  CalculusProblem,
  CourseCurriculum,
  ProblemFormat,
  DifficultyLevel,
} from '../types';
import { VerificationResult, RegionBounds } from '../math/math-engine';

export async function checkMathEquivalence(expr1: string, expr2: string): Promise<VerificationResult> {
  try {
    const res = await fetch('/api/math/verify-equivalence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expr1, expr2 }),
    });
    return await res.json();
  } catch {
    return {
      isValid: false,
      method: 'syntax_error',
      confidence: 0,
      message: 'Network error contacting math verification engine.',
    };
  }
}

export async function checkStepWithEngine(
  studentInput: string,
  expectedExpression: string,
  acceptableForms?: string[]
): Promise<{ isValid: boolean; feedback: string; errorType?: string }> {
  try {
    const res = await fetch('/api/math/check-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentInput, expectedExpression, acceptableForms }),
    });
    return await res.json();
  } catch {
    return {
      isValid: false,
      feedback: 'Verification service unreachable.',
    };
  }
}

export async function verifyOrderReversal(
  originalRegion: RegionBounds,
  reversedRegion: RegionBounds
): Promise<VerificationResult> {
  try {
    const res = await fetch('/api/math/verify-order-reversal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalRegion, reversedRegion }),
    });
    return await res.json();
  } catch {
    return {
      isValid: false,
      method: 'syntax_error',
      confidence: 0,
      message: 'Verification service error.',
    };
  }
}

export async function fetchCurriculum(): Promise<{ active: CourseCurriculum; all: CourseCurriculum[] }> {
  const res = await fetch('/api/curriculum');
  return await res.json();
}

export async function selectCurriculumCourse(courseId: string): Promise<CourseCurriculum> {
  const res = await fetch('/api/curriculum/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId }),
  });
  const data = await res.json();
  return data.active;
}

export async function uploadSyllabusFile(
  filename: string,
  rawText: string,
  metadata: { courseCode?: string; courseTitle?: string; institution?: string; regulations?: string }
) {
  const res = await fetch('/api/curriculum/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, rawText, metadata }),
  });
  return await res.json();
}

export interface DocumentUploadPayload {
  filename: string;
  base64?: string;
  rawText?: string;
  mimeType?: string;
}

export async function extractPdfText(
  filename: string,
  base64: string
): Promise<{ success: boolean; text: string; pages: number; filename: string; error?: string }> {
  try {
    const res = await fetch('/api/curriculum/extract-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, base64 }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      text: '',
      pages: 0,
      filename,
      error: err?.message || 'Failed to extract PDF text',
    };
  }
}

export async function processCourseDocuments(payload: {
  regulationsDoc?: DocumentUploadPayload;
  syllabusDoc: DocumentUploadPayload;
  metadata?: {
    courseCode?: string;
    courseTitle?: string;
    institution?: string;
    department?: string;
    semester?: number;
    regulations?: string;
  };
}): Promise<{
  success: boolean;
  source: string;
  confidenceScore: number;
  warnings: string[];
  extractedCurriculum: CourseCurriculum;
}> {
  const res = await fetch('/api/curriculum/process-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function processSyllabusWithAI(
  filename: string,
  rawText: string,
  metadata?: {
    courseCode?: string;
    courseTitle?: string;
    institution?: string;
    department?: string;
    semester?: number;
    regulations?: string;
  }
): Promise<{
  success: boolean;
  source: string;
  confidenceScore: number;
  warnings: string[];
  extractedCurriculum: CourseCurriculum;
}> {
  const res = await fetch('/api/curriculum/process-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, rawText, metadata }),
  });
  return await res.json();
}

export async function approveCurriculumDraft(
  courseId: string,
  approverName: string,
  versionTag?: string
) {
  const res = await fetch('/api/curriculum/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, approverName, versionTag }),
  });
  return await res.json();
}

export async function queryProblemsFromBackend(filters: {
  unitId?: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  format?: ProblemFormat;
  count?: number;
}): Promise<CalculusProblem[]> {
  const res = await fetch('/api/problems/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  const data = await res.json();
  return data.problems;
}

export async function requestTutorTurn(payload: {
  topicTitle: string;
  objectiveTitle: string;
  action: string;
  studentMessage?: string;
  currentStep?: unknown;
}) {
  const res = await fetch('/api/gemini/tutor-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}
