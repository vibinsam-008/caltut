/**
 * Syllabus Intelligence and Curriculum Management Engine
 * Ingestion, extraction, review, versioning, and validation.
 */

import { CourseCurriculum, Unit, Topic, LearningObjective } from '../types';
import { OFFICIAL_MIT_CALCULUS_CURRICULUM } from './mit-syllabus';

export interface CurriculumExtractionResult {
  extractedCurriculum: CourseCurriculum;
  warnings: string[];
  uncertainEntities: {
    type: 'unit' | 'topic' | 'objective' | 'prerequisite';
    item: string;
    reason: string;
    suggestedAction: string;
  }[];
  confidenceScore: number;
}

export class CurriculumManager {
  private curricula: Map<string, CourseCurriculum> = new Map();
  private activeCourseId: string;

  constructor() {
    // Seed with official MIT approved curriculum
    this.curricula.set(OFFICIAL_MIT_CALCULUS_CURRICULUM.courseId, OFFICIAL_MIT_CALCULUS_CURRICULUM);
    this.activeCourseId = OFFICIAL_MIT_CALCULUS_CURRICULUM.courseId;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('mit_calculus_curricula');
        if (stored) {
          const parsed = JSON.parse(stored) as CourseCurriculum[];
          parsed.forEach((c) => this.curricula.set(c.courseId, c));
        }
        const active = window.localStorage.getItem('mit_calculus_active_course');
        if (active && this.curricula.has(active)) {
          this.activeCourseId = active;
        }
      } catch {
        // use defaults
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.curricula.values());
        window.localStorage.setItem('mit_calculus_curricula', JSON.stringify(list));
        window.localStorage.setItem('mit_calculus_active_course', this.activeCourseId);
      } catch {
        // ignore
      }
    }
  }

  public getAllCurricula(): CourseCurriculum[] {
    return Array.from(this.curricula.values());
  }

  public getActiveCurriculum(): CourseCurriculum {
    const curr = this.curricula.get(this.activeCourseId);
    return curr || OFFICIAL_MIT_CALCULUS_CURRICULUM;
  }

  public registerCurriculum(curr: CourseCurriculum) {
    this.curricula.set(curr.courseId, curr);
    this.saveToStorage();
  }

  public setActiveCurriculum(courseId: string): boolean {
    if (this.curricula.has(courseId)) {
      this.activeCourseId = courseId;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public getTopicById(topicId: string): { topic: Topic; unit: Unit } | null {
    const course = this.getActiveCurriculum();
    for (const unit of course.units) {
      const topic = unit.topics.find((t) => t.id === topicId);
      if (topic) return { topic, unit };
    }
    return null;
  }

  public getObjectiveById(objectiveId: string): LearningObjective | null {
    const course = this.getActiveCurriculum();
    for (const unit of course.units) {
      for (const topic of unit.topics) {
        const obj = topic.learningObjectives.find((o) => o.id === objectiveId);
        if (obj) return obj;
      }
    }
    return null;
  }

  /**
   * Ingest and extract curriculum structure from raw syllabus text/PDF text
   */
  public ingestSyllabusText(
    filename: string,
    rawText: string,
    metadata: {
      courseCode?: string;
      courseTitle?: string;
      institution?: string;
      department?: string;
      semester?: number;
    }
  ): CurriculumExtractionResult {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const units: Unit[] = [];
    const warnings: string[] = [];
    const uncertainEntities: CurriculumExtractionResult['uncertainEntities'] = [];

    let currentUnit: Unit | null = null;
    let currentTopic: Topic | null = null;
    let unitCount = 0;
    let topicCount = 0;
    let objCount = 0;

    const courseId = `course_${Date.now()}`;
    const code = metadata.courseCode || 'ENG-MATH';
    const title = metadata.courseTitle || 'Engineering Calculus';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect Unit Header (e.g. "UNIT I - MATRICES", "Unit 1: Differential Calculus", "Module 3")
      const unitMatch = line.match(/^(?:UNIT|MODULE|CHAPTER)\s+([IVXLCDM\d]+)[\s:\-]+(.*)/i);
      if (unitMatch) {
        unitCount++;
        const unitTitle = `Unit ${unitMatch[1]}: ${unitMatch[2].trim() || 'Untitled Unit'}`;
        currentUnit = {
          id: `unit-${courseId}-${unitCount}`,
          courseId,
          unitNumber: unitCount,
          title: unitTitle,
          description: `Extracted from ${filename}`,
          topics: [],
        };
        units.push(currentUnit);
        currentTopic = null;
        continue;
      }

      // If we don't have a unit yet, create a default first unit
      if (!currentUnit) {
        unitCount++;
        currentUnit = {
          id: `unit-${courseId}-${unitCount}`,
          courseId,
          unitNumber: unitCount,
          title: 'Unit I: Core Calculus',
          description: `Extracted from ${filename}`,
          topics: [],
        };
        units.push(currentUnit);
        warnings.push('Header missing before first topics; grouped into Unit I.');
      }

      // Detect Topic or Subtopic
      const isBulletOrNum = line.match(/^([0-9]+\.[0-9]+|[a-z]\)|\*|-|•)\s*(.*)/i);
      if (isBulletOrNum && line.length > 5) {
        const topicText = isBulletOrNum[2].trim();
        topicCount++;
        objCount++;

        const newTopic: Topic = {
          id: `topic-${courseId}-${topicCount}`,
          unitId: currentUnit.id,
          code: `${code}.${unitCount}.${topicCount}`,
          title: topicText,
          description: `Topic extracted from ${filename}, line ${i + 1}`,
          learningObjectives: [
            {
              id: `lo-${courseId}-${objCount}`,
              code: `LO-${unitCount}.${topicCount}`,
              title: `Master ${topicText}`,
              description: `Understand concepts and apply techniques of ${topicText}`,
              prerequisites: [],
              evidenceLevel: 'not_assessed',
            },
          ],
          prerequisites: [],
          sourceReferences: [`${filename}, Line ${i + 1}`],
          approvalStatus: 'draft',
        };
        currentUnit.topics.push(newTopic);
        currentTopic = newTopic;
        continue;
      }

      // If line mentions prerequisites
      if (line.toLowerCase().includes('prerequisite') && currentTopic) {
        const prereqText = line.replace(/prerequisite(s)?[:\-]/i, '').trim();
        if (prereqText) {
          currentTopic.prerequisites.push(prereqText);
        }
      }
    }

    if (units.length === 0 || units.every((u) => u.topics.length === 0)) {
      warnings.push('No distinct units or topics could be confidently identified from the text formatting.');
      uncertainEntities.push({
        type: 'unit',
        item: filename,
        reason: 'Unstructured document layout without clear Unit / Topic markers',
        suggestedAction: 'Review and add units manually or re-upload with clear headers.',
      });
    }

    const confidenceScore = Math.max(0.4, Math.min(0.95, (units.length * 0.15) + (topicCount * 0.05)));

    const extractedCurriculum: CourseCurriculum = {
      courseId,
      code,
      title,
      institution: metadata.institution || 'Madras Institute of Technology',
      department: metadata.department || 'Computer Science and Engineering',
      semester: metadata.semester || 1,
      regulations: 'Regulation Draft',
      syllabusVersion: `draft-${new Date().toISOString().slice(0, 10)}`,
      approvalStatus: 'draft',
      sourceDocuments: [
        {
          id: `doc-${Date.now()}`,
          filename,
          uploadedAt: new Date().toISOString(),
          documentType: 'Uploaded Course Document',
          pageCount: Math.ceil(lines.length / 40),
        },
      ],
      units,
    };

    // Store in draft list
    this.curricula.set(courseId, extractedCurriculum);
    this.saveToStorage();

    return {
      extractedCurriculum,
      warnings,
      uncertainEntities,
      confidenceScore,
    };
  }

  /**
   * Instructor approves a draft curriculum or bumps version
   */
  public approveCurriculum(
    courseId: string,
    approverName: string,
    versionTag = 'v1.0-approved'
  ): { success: boolean; message: string } {
    const curr = this.curricula.get(courseId);
    if (!curr) return { success: false, message: 'Course not found.' };

    curr.approvalStatus = 'approved';
    curr.approvedBy = approverName;
    curr.approvalDate = new Date().toISOString().slice(0, 10);
    curr.syllabusVersion = versionTag;

    // Mark all topics as approved
    curr.units.forEach((u) => {
      u.topics.forEach((t) => {
        t.approvalStatus = 'approved';
      });
    });

    this.saveToStorage();
    return { success: true, message: `Curriculum ${curr.code} approved as ${versionTag} by ${approverName}.` };
  }

  /**
   * Delete or reject a curriculum draft
   */
  public deleteCurriculum(courseId: string): boolean {
    if (courseId === OFFICIAL_MIT_CALCULUS_CURRICULUM.courseId) {
      return false; // Cannot delete official fixture
    }
    const deleted = this.curricula.delete(courseId);
    if (this.activeCourseId === courseId) {
      this.activeCourseId = OFFICIAL_MIT_CALCULUS_CURRICULUM.courseId;
    }
    this.saveToStorage();
    return deleted;
  }
}

export const curriculumManager = new CurriculumManager();
