import test from 'node:test';
import assert from 'node:assert/strict';
import { AdaptiveTeachingEngine } from './learner-model';

test('AdaptiveTeachingEngine starts with default non-assessed state', () => {
  const engine = new AdaptiveTeachingEngine('mit_ma3151_calculus_2021');
  const state = engine.getState();
  assert.equal(state.currentCourseId, 'mit_ma3151_calculus_2021');
  assert.equal(state.independentSuccessCount, 0);
});

test('AdaptiveTeachingEngine awards demonstrated_independently only without hints', () => {
  const engine = new AdaptiveTeachingEngine('mit_ma3151_calculus_2021');

  // Solved with 2 hints
  const resultWithHints = engine.recordProblemResult('prob-1', 'lo-5-1-2', true, 2);
  assert.equal(resultWithHints, 'demonstrated_with_assistance');
  assert.equal(engine.getState().independentSuccessCount, 0);

  // Solved with 0 hints
  const independentResult = engine.recordProblemResult('prob-2', 'lo-5-1-2', true, 0);
  assert.equal(independentResult, 'demonstrated_independently');
  assert.equal(engine.getState().independentSuccessCount, 1);
});

test('AdaptiveTeachingEngine triggers graphical explanation on repeated errors', () => {
  const engine = new AdaptiveTeachingEngine('mit_ma3151_calculus_2021');
  const action = engine.evaluateNextAction({
    studentStepErrorCount: 2,
    hasActiveVisual: false,
    studentAskedWhy: false,
    problemSolved: false,
  });
  assert.equal(action, 'show_graph_representation');
});

test('AdaptiveTeachingEngine flags misconceptions and triggers remediation', () => {
  const engine = new AdaptiveTeachingEngine('mit_ma3151_calculus_2021');
  engine.recordMisconception('misc-order-swap-constants');
  const state = engine.getState();
  assert.ok(state.observedMisconceptions.includes('misc-order-swap-constants'));
  assert.equal(state.recommendedAction, 'explain_misconception');
});
