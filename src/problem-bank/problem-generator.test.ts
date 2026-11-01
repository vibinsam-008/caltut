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
