import test from 'node:test';
import assert from 'node:assert/strict';
import { ProblemGenerator } from './problem-generator';

test('ProblemGenerator returns standard verified problems from pool', () => {
  const generator = new ProblemGenerator();
  const problems = generator.queryProblems({
    unitId: 'unit-5',
    topicId: 'topic-5-1',
    count: 1,
  });

  assert.equal(problems.length, 1);
  assert.equal(problems[0].verificationStatus, 'verified');
  assert.ok(problems[0].verifiedSolutionSteps.length >= 3);
  assert.ok(problems[0].statement.includes('order of integration'));
});

test('ProblemGenerator generates and verifies parameter variations', () => {
  const generator = new ProblemGenerator();
  const variations = generator.generateVerifiedVariations(
    {
      unitId: 'unit-5',
      topicId: 'topic-5-1',
      difficulty: 'challenging',
    },
    2
  );

  assert.equal(variations.length, 2);
  variations.forEach((v) => {
    assert.equal(v.verificationStatus, 'verified');
    assert.ok(v.verificationMethod.includes('Simpson'));
    assert.ok(v.whiteboardSpec !== undefined);
  });
});

test('findBestProblemForTopic dynamically matches problems to present lesson', async () => {
  const { findBestProblemForTopic, VERIFIED_STANDARD_PROBLEMS } = await import('./standard-problems');

  // Test 1: Matrices Lesson
  const matrixTopic = {
    id: 'topic-1-1',
    unitId: 'unit-1',
    code: '1.1',
    title: 'Eigenvalues and Eigenvectors of Real Symmetric Matrices',
    description: 'Characteristic equation and Cayley-Hamilton theorem',
    learningObjectives: [],
    prerequisites: [],
    sourceReferences: [],
    approvalStatus: 'approved' as const,
  };
  const matrixUnit = {
    id: 'unit-1',
    courseId: 'course-1',
    unitNumber: 1,
    title: 'Unit I: Matrices',
    description: '',
    topics: [matrixTopic],
  };
  const matrixProblem = findBestProblemForTopic(matrixTopic, matrixUnit, VERIFIED_STANDARD_PROBLEMS);
  assert.equal(matrixProblem.id, 'prob-mit-eigenvalues-diagonalization');
  assert.ok(matrixProblem.title.includes('Eigenvalues') || matrixProblem.title.includes('Matrix'));
  assert.notEqual(matrixProblem.id, 'prob-mit-double-int-order-1');

  // Test 2: Differential Calculus / Extrema Lesson
  const extremaTopic = {
    id: 'topic-2-2',
    unitId: 'unit-2',
    code: '2.2',
    title: 'Maxima and Minima of Functions of Two Variables',
    description: 'Hessian determinant and critical points classification',
    learningObjectives: [],
    prerequisites: [],
    sourceReferences: [],
    approvalStatus: 'approved' as const,
  };
  const extremaUnit = {
    id: 'unit-2',
    courseId: 'course-1',
    unitNumber: 2,
    title: 'Unit II: Differential Calculus',
    description: '',
    topics: [extremaTopic],
  };
  const extremaProblem = findBestProblemForTopic(extremaTopic, extremaUnit, VERIFIED_STANDARD_PROBLEMS);
  assert.equal(extremaProblem.id, 'prob-mit-extrema-two-variables');

  // Test 3: Jacobians / Several Variables Lesson
  const jacobianTopic = {
    id: 'topic-3-1',
    unitId: 'unit-3',
    code: '3.1',
    title: 'Jacobians and Coordinate Transformations',
    description: 'Polar and cylindrical coordinate Jacobians',
    learningObjectives: [],
    prerequisites: [],
    sourceReferences: [],
    approvalStatus: 'approved' as const,
  };
  const jacobianUnit = {
    id: 'unit-3',
    courseId: 'course-1',
    unitNumber: 3,
    title: 'Unit III: Functions of Several Variables',
    description: '',
    topics: [jacobianTopic],
  };
  const jacobianProblem = findBestProblemForTopic(jacobianTopic, jacobianUnit, VERIFIED_STANDARD_PROBLEMS);
  assert.equal(jacobianProblem.id, 'prob-mit-jacobians-several-variables');

  // Test 4: Beta & Gamma Integral Calculus Lesson
  const betaTopic = {
    id: 'topic-4-2',
    unitId: 'unit-4',
    code: '4.2',
    title: 'Beta and Gamma Functions',
    description: 'Properties and trigonometric evaluations',
    learningObjectives: [],
    prerequisites: [],
    sourceReferences: [],
    approvalStatus: 'approved' as const,
  };
  const betaUnit = {
    id: 'unit-4',
    courseId: 'course-1',
    unitNumber: 4,
    title: 'Unit IV: Integral Calculus',
    description: '',
    topics: [betaTopic],
  };
  const betaProblem = findBestProblemForTopic(betaTopic, betaUnit, VERIFIED_STANDARD_PROBLEMS);
  assert.equal(betaProblem.id, 'prob-mit-beta-gamma-trig');

  // Test 5: Multiple Integrals Lesson
  const multipleIntTopic = {
    id: 'topic-5-1',
    unitId: 'unit-5',
    code: '5.1',
    title: 'Change of Order of Integration',
    description: 'Double integrals with vertical vs horizontal strips',
    learningObjectives: [],
    prerequisites: [],
    sourceReferences: [],
    approvalStatus: 'approved' as const,
  };
  const multipleIntUnit = {
    id: 'unit-5',
    courseId: 'course-1',
    unitNumber: 5,
    title: 'Unit V: Multiple Integrals',
    description: '',
    topics: [multipleIntTopic],
  };
  const multipleIntProblem = findBestProblemForTopic(multipleIntTopic, multipleIntUnit, VERIFIED_STANDARD_PROBLEMS);
  assert.equal(multipleIntProblem.id, 'prob-mit-double-int-order-1');
});
