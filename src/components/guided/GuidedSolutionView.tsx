import React, { useState } from 'react';
import {
  CalculusProblem,
  ProblemStep,
} from '../../types';
import { checkStepWithEngine } from '../../services/api';
import { MathView } from '../MathView';
import { Whiteboard } from '../whiteboard/Whiteboard';
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Eye,
  RefreshCw,
  Compass,
  FileCheck2,
  BrainCircuit,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuidedSolutionViewProps {
  problem: CalculusProblem;
  onSelectSimilarProblem?: (topicId: string) => void;
  onRecordResult?: (problemId: string, objectiveId: string, isCorrect: boolean, hintsUsed: number) => void;
}

export const GuidedSolutionView: React.FC<GuidedSolutionViewProps> = ({
  problem,
  onSelectSimilarProblem,
  onRecordResult,
}) => {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [revealedStepCount, setRevealedStepCount] = useState<number>(1);
  const [hintsGiven, setHintsGiven] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [whyExplanation, setWhyExplanation] = useState<string | null>(null);
  const [studentInput, setStudentInput] = useState<string>('');
  const [stepFeedback, setStepFeedback] = useState<{
    isValid: boolean;
    feedback: string;
    errorType?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  // Stages definition
  const stages = [
    { num: 1, title: '1. Understand', desc: 'Identify givens & objective' },
    { num: 2, title: '2. Strategy', desc: 'Select mathematical method' },
    { num: 3, title: '3. Derive', desc: 'Step-by-step transformations' },
    { num: 4, title: '4. Diagnose', desc: 'Verify intermediate steps' },
    { num: 5, title: '5. Verify', desc: 'Independent application' },
  ];

  const handleShowNextStep = () => {
    if (revealedStepCount < problem.verifiedSolutionSteps.length) {
      setRevealedStepCount((prev) => prev + 1);
      setActiveHint(null);
      setWhyExplanation(null);
    } else {
      setCompleted(true);
      setCurrentStage(5);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      onRecordResult?.(problem.id, problem.learningObjectiveId, true, hintsGiven);
    }
  };

  const handleGiveHint = () => {
    const currentStep = problem.verifiedSolutionSteps[revealedStepCount - 1];
    if (currentStep?.hint) {
      setActiveHint(currentStep.hint);
    } else {
      setActiveHint(
        `Look closely at step ${revealedStepCount}: examine the boundary relations and determine how variables depend on each other.`
      );
    }
    setHintsGiven((h) => h + 1);
  };

  const handleExplainWhy = () => {
    const currentStep = problem.verifiedSolutionSteps[revealedStepCount - 1];
    if (currentStep?.justification) {
      setWhyExplanation(currentStep.justification);
    } else {
      setWhyExplanation(
        'In multivariable calculus, every algebraic transformation corresponds to a geometric property (e.g. projection, tangent slope, or region slicing).'
      );
    }
  };

  const handleCheckStep = async () => {
    if (!studentInput.trim()) return;
    setIsChecking(true);
    const expected = problem.verifiedSolutionSteps[revealedStepCount - 1]?.expression || problem.expectedAnswer;
    const result = await checkStepWithEngine(studentInput, expected, problem.acceptableForms);
    setIsChecking(false);
    setStepFeedback(result);

    if (result.isValid) {
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.8 } });
      if (revealedStepCount >= problem.verifiedSolutionSteps.length) {
        setCompleted(true);
        setCurrentStage(5);
        onRecordResult?.(problem.id, problem.learningObjectiveId, true, hintsGiven);
      }
    }
  };

  const handleRevealAll = () => {
    setShowFullSolution(true);
    setRevealedStepCount(problem.verifiedSolutionSteps.length);
    setCompleted(true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Problem Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-semibold">
              Mode C: Guided Solution
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono">
              Status: {problem.verificationStatus}
            </span>
            <span className="text-xs text-slate-400 capitalize">
              Difficulty: <strong className="text-slate-200">{problem.difficulty}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Source: <span className="text-slate-300 italic">{problem.sourceProvenance}</span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{problem.title}</h2>
          <div className="text-slate-200 text-base leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <MathView text={problem.statement} />
          </div>
        </div>
      </div>

      {/* 5-Stage Progression Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {stages.map((st) => (
          <button
            key={st.num}
            onClick={() => setCurrentStage(st.num as 1 | 2 | 3 | 4 | 5)}
            className={`p-3 rounded-xl border text-left transition-all ${
              currentStage === st.num
                ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                : currentStage > st.num
                ? 'bg-slate-900/90 border-emerald-800/60 text-slate-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{st.title}</span>
              {currentStage > st.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{st.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Workspace: Left Progression + Right Whiteboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Active Stage Content (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Stage 1: Understand the Problem */}
          {currentStage === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Compass className="w-4 h-4" />
                <span>Stage 1: Deconstructing the Problem</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before attempting algebraic transformations, identify what is given, what is constrained,
                and what the mathematical objective requires.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-200">Givens & Region:</span>
                  <p className="text-slate-400 mt-1">
                    Examine the inner and outer limits in the integral. For iterated integrals, inner limits
                    describe the active boundary curves, while outer limits define constant extremal span.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-200">Prerequisites needed:</span>
                  <ul className="list-disc list-inside text-slate-400 mt-1 space-y-1">
                    {problem.prerequisites.map((pr, idx) => (
                      <li key={idx}>{pr}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <span>Proceed to Strategy Formulation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Select a Strategy */}
          {currentStage === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <BrainCircuit className="w-4 h-4" />
                <span>Stage 2: Mathematical Strategy & Method Selection</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
                <p className="font-semibold text-slate-200">Why change order of integration?</p>
                <p className="text-slate-400 leading-relaxed">
                  Often an integrand cannot be integrated in elementary functions with respect to the inner variable
                  first (such as e^(y^2) with respect to y, or (sin x)/x with respect to x).
                  Reversing the order changes the differential element from dy dx to dx dy, yielding an
                  elementary antiderivative.
                </p>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs">
                <span className="font-semibold text-amber-300">Method Blueprint:</span>
                <ol className="list-decimal list-inside text-slate-300 mt-1.5 space-y-1">
                  <li>Sketch the 2D bounded region from the original limits.</li>
                  <li>Find all intersection points of the boundary curves.</li>
                  <li>Switch from vertical strips ($dy\,dx$) to horizontal strips ($dx\,dy$).</li>
                  <li>Re-express the boundary equations to give $x$ as a function of $y$.</li>
                </ol>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <span>Begin Step-by-Step Derivation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Step-by-Step Derivation */}
          {(currentStage === 3 || currentStage === 4 || currentStage === 5) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Derivation Progression</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Step {revealedStepCount} of {problem.verifiedSolutionSteps.length}
                </span>
              </div>

              {/* Step cards */}
              <div className="space-y-3">
                {problem.verifiedSolutionSteps.slice(0, revealedStepCount).map((step) => (
                  <div
                    key={step.index}
                    className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        Step {step.index}: {step.label}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                        Verified
                      </span>
                    </div>

                    <div className="py-2 text-slate-100 overflow-x-auto text-sm">
                      <MathView text={`$$${step.expression}$$`} />
                    </div>

                    <p className="text-xs text-slate-400 italic">
                      <strong>Mathematical justification:</strong> {step.justification}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Toolbar for Hints, Explanations, Next Step */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGiveHint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Give me a hint</span>
                  </button>

                  <button
                    onClick={handleExplainWhy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Explain why</span>
                  </button>

                  {revealedStepCount < problem.verifiedSolutionSteps.length && (
                    <button
                      onClick={handleShowNextStep}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors ml-auto cursor-pointer"
                    >
                      <span>Show next step</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!completed && (
                    <button
                      onClick={handleRevealAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal complete solution</span>
                    </button>
                  )}
                </div>

                {/* Active Hint display */}
                {activeHint && (
                  <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-lg text-xs text-amber-200 flex items-start gap-2 animate-fadeIn">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Pedagogical Hint:</span>
                      <p>{activeHint}</p>
                    </div>
                  </div>
                )}

                {/* Why Explanation display */}
                {whyExplanation && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800 rounded-lg text-xs text-indigo-200 flex items-start gap-2 animate-fadeIn">
                    <BrainCircuit className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Mathematical Justification:</span>
                      <p>{whyExplanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stage 4: Check My Step & Error Diagnosis */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <FileCheck2 className="w-4 h-4" />
              <span>Stage 4: Check Your Intermediate Step</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your mathematical expression for the current or next step. The verification engine checks
              algebraic equivalence, limits, and detects common calculus misconceptions.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()}
                placeholder="e.g. x = y/2 or int_0^4 int_{y/2}^{sqrt(y)} (x+y) dx dy"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={handleCheckStep}
                disabled={isChecking || !studentInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Check my step</span>
              </button>
            </div>

            {/* Step Feedback Banner */}
            {stepFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  stepFeedback.isValid
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-800 text-rose-200'
                }`}
              >
                {stepFeedback.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block mb-0.5">
                    {stepFeedback.isValid ? 'Step Verified!' : 'Needs Correction'}
                    {stepFeedback.errorType ? ` (${stepFeedback.errorType} error)` : ''}
                  </span>
                  <p>{stepFeedback.feedback}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stage 5: Independent Verification & Next Problem */}
          {completed && (
            <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-5 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Concept Application Demonstrated!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have successfully derived and verified all intermediate steps. Ready to test whether
                you can solve a similar problem independently without hints?
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectSimilarProblem?.(problem.topicId)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Give me a similar problem</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Synchronized Interactive Whiteboard (5 cols) */}
        <div className="lg:col-span-5 sticky top-4">
          <Whiteboard spec={problem.whiteboardSpec} />

          {/* Problem Misconceptions Warning Box */}
          {problem.commonMisconceptions && problem.commonMisconceptions.length > 0 && (
            <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Common Exam Trap in this Topic:</span>
              </div>
              {problem.commonMisconceptions.map((m) => (
                <div key={m.id} className="text-slate-300">
                  <p className="font-medium text-slate-200">{m.description}</p>
                  <p className="text-amber-200/90 mt-1 pl-2 border-l-2 border-amber-600">
                    {m.correction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
