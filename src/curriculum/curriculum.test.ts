import test from 'node:test';
import assert from 'node:assert/strict';
import { CurriculumManager } from './curriculum-manager';
import { OFFICIAL_MIT_CALCULUS_CURRICULUM } from './mit-syllabus';

test('CurriculumManager initializes with official MIT MA3151 curriculum', () => {
  const manager = new CurriculumManager();
  const active = manager.getActiveCurriculum();
  assert.equal(active.code, 'MA3151');
  assert.equal(active.approvalStatus, 'approved');
  assert.equal(active.units.length, 5);
  assert.equal(active.units[4].title, 'Unit V: Multiple Integrals');
});

test('CurriculumManager ingests raw syllabus text into structured units and topics', () => {
  const manager = new CurriculumManager();
  const sampleText = `
    UNIT I - MATRICES
    1.1 Characteristic Equation and Eigenvalues
    1.2 Cayley-Hamilton Theorem
    Prerequisites: Matrix algebra, determinants
    
    UNIT II - DIFFERENTIAL CALCULUS
    2.1 Limits and Continuity
    2.2 Maxima and Minima of Several Variables
  `;

  const result = manager.ingestSyllabusText('Syllabus_Sample.txt', sampleText, {
    courseCode: 'MA3151-TEST',
    courseTitle: 'Engineering Mathematics I',
  });

  assert.equal(result.extractedCurriculum.approvalStatus, 'draft');
  assert.equal(result.extractedCurriculum.units.length, 2);
  assert.equal(result.extractedCurriculum.units[0].topics.length, 2);
  assert.ok(result.extractedCurriculum.units[0].topics[1].prerequisites.length > 0);

  // Approve the draft
  const approval = manager.approveCurriculum(result.extractedCurriculum.courseId, 'Dr. Academic Reviewer');
  assert.equal(approval.success, true);
  const updated = manager.getAllCurricula().find((c) => c.courseId === result.extractedCurriculum.courseId);
  assert.equal(updated?.approvalStatus, 'approved');
});

test('CurriculumManager prevents deletion of authoritative official curriculum', () => {
  const manager = new CurriculumManager();
  const deleted = manager.deleteCurriculum(OFFICIAL_MIT_CALCULUS_CURRICULUM.courseId);
  assert.equal(deleted, false);
});

test('CurriculumManager registers and sets active curriculum from processed syllabus', () => {
  const manager = new CurriculumManager();
  const customCurriculum = {
    ...OFFICIAL_MIT_CALCULUS_CURRICULUM,
    courseId: 'custom-user-course-101',
    code: 'MATH-USER-101',
    title: 'Custom Engineering Calculus',
  };

  manager.registerCurriculum(customCurriculum);
  assert.ok(manager.getAllCurricula().some((c) => c.courseId === 'custom-user-course-101'));

  const switched = manager.setActiveCurriculum('custom-user-course-101');
  assert.equal(switched, true);
  assert.equal(manager.getActiveCurriculum().code, 'MATH-USER-101');
});

