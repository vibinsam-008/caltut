/**
 * Adaptive Teaching Engine & Learner Model
 * Tracks evidence, misconceptions, and decides deterministic pedagogical actions.
 */

import { LearnerState, TeachingAction, EvidenceLevel } from '../types';

export const COMMON_CALCULUS_MISCONCEPTIONS = [
  {
    id: 'misc-order-swap-constants',
    name: 'Naive Reversal of Integration Order',
    description: 'Swapping upper and lower integration bounds numerically rather than re-evaluating the boundary curves of the region.',
    correction: 'Integration limits in the inner integral depend on the outer variable. Sketch the 2D region, identify whether strips are vertical (dy dx) or horizontal (dx dy), and re-express curves as x = h(y) or y = g(x).',
  },
  {
    id: 'misc-polar-jacobian-missing',
    name: 'Omission of Polar Jacobian (r)',
    description: 'Transforming dx dy to dr d(theta) without multiplying by the scale factor r.',
    correction: 'Area element in polar coordinates is dA = r dr d(theta), because the infinitesimal sector width expands proportional to radial distance r.',
  },
  {
    id: 'misc-saddle-confused-with-extremum',
    name: 'Saddle Point Confused with Local Extremum',
    description: 'Assuming critical point where grad(f) = 0 is a local max/min without checking Hessian discriminant Delta = f_xx * f_yy - (f_xy)^2.',
    correction: 'If Delta < 0 at a critical point, the surface curves upwards in one direction and downwards in another, forming a saddle point, not an extremum.',
  },
  {
    id: 'misc-improper-unbounded-evaluated-directly',
    name: 'Treating Infinite Bounds as Ordinary Numbers',
    description: 'Plugging in infinity directly rather than taking the limit as b -> infinity.',
    correction: 'An improper integral is defined strictly as a limit: int_a^inf f(x) dx = lim_{b -> inf} int_a^b f(x) dx. The limit must be demonstrated to converge.',
  },
];

export class AdaptiveTeachingEngine {
  private state: LearnerState;

  constructor(initialCourseId = 'mit_ma3151_calculus_2021') {
    this.state = {
      currentCourseId: initialCourseId,
      currentUnitId: 'unit-5',
      currentTopicId: 'topic-5-1',
      currentObjectiveId: 'lo-5-1-2',
      objectiveEvidence: {},
      observedMisconceptions: [],
      hintCounts: {},
      completedProblems: [],
      independentSuccessCount: 0,
      recommendedAction: 'explain_concept',
    };
    this.loadState();
  }

  private loadState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('mit_learner_state');
        if (saved) {
          this.state = JSON.parse(saved);
        }
      } catch {
        // use defaults
      }
    }
  }

  public saveState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('mit_learner_state', JSON.stringify(this.state));
      } catch {
        // ignore
      }
    }
  }

  public getState(): LearnerState {
    return { ...this.state };
  }

  public setTopic(unitId: string, topicId: string, objectiveId: string) {
    this.state.currentUnitId = unitId;
    this.state.currentTopicId = topicId;
    this.state.currentObjectiveId = objectiveId;
    if (!this.state.objectiveEvidence[objectiveId]) {
      this.state.objectiveEvidence[objectiveId] = 'not_assessed';
    }
    this.state.recommendedAction = 'explain_concept';
    this.saveState();
  }

  public recordHintUsed(problemId: string) {
    this.state.hintCounts[problemId] = (this.state.hintCounts[problemId] || 0) + 1;
    const objId = this.state.currentObjectiveId;
    if (this.state.objectiveEvidence[objId] !== 'demonstrated_independently') {
      this.state.objectiveEvidence[objId] = 'demonstrated_with_assistance';
    }
    this.state.recommendedAction = 'provide_hint';
    this.saveState();
  }

  public recordMisconception(misconceptionId: string) {
    if (!this.state.observedMisconceptions.includes(misconceptionId)) {
      this.state.observedMisconceptions.push(misconceptionId);
    }
    const objId = this.state.currentObjectiveId;
    this.state.objectiveEvidence[objId] = 'needs_reassessment';
    this.state.recommendedAction = 'explain_misconception';
    this.saveState();
  }

  /**
   * Evaluates problem completion:
   * Only awards 'demonstrated_independently' if completed without hints or assistance!
   */
  public recordProblemResult(
    problemId: string,
    objectiveId: string,
    isCorrect: boolean,
    hintsUsed: number
  ): EvidenceLevel {
    if (!this.state.completedProblems.includes(problemId) && isCorrect) {
      this.state.completedProblems.push(problemId);
    }

    let evidence: EvidenceLevel;
    if (!isCorrect) {
      evidence = 'needs_reassessment';
      this.state.recommendedAction = 'show_graph_representation';
    } else if (hintsUsed === 0) {
      evidence = 'demonstrated_independently';
      this.state.independentSuccessCount++;
      this.state.recommendedAction = 'assign_fresh_problem';
    } else {
      evidence = 'demonstrated_with_assistance';
      this.state.recommendedAction = 'verify_mathematical_step';
    }

    this.state.objectiveEvidence[objectiveId] = evidence;
    this.saveState();
    return evidence;
  }

  /**
   * Deterministic teaching policy deciding the next pedagogical action
   */
  public evaluateNextAction(context: {
    studentStepErrorCount: number;
    hasActiveVisual: boolean;
    studentAskedWhy: boolean;
    problemSolved: boolean;
  }): TeachingAction {
    if (context.problemSolved) {
      return 'assign_fresh_problem';
    }

    if (context.studentAskedWhy) {
      return 'give_intuitive_example';
    }

    if (context.studentStepErrorCount >= 2) {
      return 'show_graph_representation';
    }

    if (context.studentStepErrorCount === 1) {
      return 'provide_hint';
    }

    return 'request_missing_step';
  }
}

export const teachingEngine = new AdaptiveTeachingEngine();
