import React, { useState } from 'react';
import { CourseCurriculum, CalculusProblem } from '../../types';
import { AUTHENTIC_SOLVED_EXAMPLES, SolvedExample } from '../../curriculum/solved-examples-data';
import { MathView } from '../MathView';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Filter,
  GraduationCap,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SolvedExamplesViewProps {
  curriculum: CourseCurriculum;
  onLaunchPracticeProblem?: (problem: CalculusProblem) => void;
  onNavigateToConcept?: (unitId: string, topicId: string) => void;
}

export const SolvedExamplesView: React.FC<SolvedExamplesViewProps> = ({
  curriculum,
  onLaunchPracticeProblem,
  onNavigateToConcept,
}) => {
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    AUTHENTIC_SOLVED_EXAMPLES[0].id
  );
  const [showPitfalls, setShowPitfalls] = useState<boolean>(true);

  const activeExample =
    AUTHENTIC_SOLVED_EXAMPLES.find((ex) => ex.id === selectedExampleId) ||
    AUTHENTIC_SOLVED_EXAMPLES[0];

  const filteredExamples = AUTHENTIC_SOLVED_EXAMPLES.filter((ex) => {
    if (selectedBook === 'all') return true;
    return ex.sourceBook.includes(selectedBook);
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Step 3: Reference Solved Examples • Engineering Mathematics</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Solved Engineering Exam Examples
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Study rigorous, line-by-line mathematical solutions directly sourced from standard engineering authorities:{' '}
            <strong className="text-indigo-300">B.S. Grewal</strong> (Higher Engineering Mathematics),{' '}
            <strong className="text-indigo-300">Erwin Kreyszig</strong> (Advanced Engineering Mathematics), and{' '}
            <strong className="text-indigo-300">IIT NPTEL Calculus Modules</strong>. Review intermediate checkpoints before independent practice.
          </p>

          {/* Book Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" /> Source Authority:
            </span>
            <button
              onClick={() => setSelectedBook('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBook === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Authority Sources ({AUTHENTIC_SOLVED_EXAMPLES.length})
            </button>
            <button
              onClick={() => setSelectedBook('BS Grewal')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBook === 'BS Grewal'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              B.S. Grewal (44th Ed)
            </button>
            <button
              onClick={() => setSelectedBook('Kreyszig')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBook === 'Kreyszig'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Erwin Kreyszig (10th Ed)
            </button>
            <button
              onClick={() => setSelectedBook('IIT')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBook === 'IIT'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              IIT NPTEL Calculus
            </button>
          </div>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none text-indigo-400">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      {/* Main Grid: Selector on Left (4 cols), Detailed Solution on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Solved Examples */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
            <span>Solved Example Library</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {filteredExamples.length} Examples
            </span>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredExamples.map((ex) => {
              const isSelected = ex.id === selectedExampleId;
              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExampleId(ex.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/90 border-indigo-500 shadow-md text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-semibold truncate max-w-[170px]">
                      {ex.sourceBook}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {ex.topicTitle.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-xs leading-snug">
                    {ex.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {ex.methodOverview}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail: Full Worked Example */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          {/* Example Header */}
          <div className="pb-4 border-b border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                {activeExample.topicTitle} • Standard Model Solution
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Peer-Reviewed Authority
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-100">
              {activeExample.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Citation:</span>
              <span className="italic">{activeExample.source}</span>
            </div>
          </div>

          {/* Problem Statement Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
              Problem Statement
            </span>
            <div className="text-slate-200 text-sm leading-relaxed">
              <MathView text={activeExample.problemStatement} />
            </div>
          </div>

          {/* Strategic Overview & Governing Formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/60 space-y-1">
              <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block">
                Methodological Rationale
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeExample.methodOverview}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                Governing Theorem / Formula
              </span>
              <div className="text-slate-200 overflow-x-auto py-1">
                <MathView text={`$$${activeExample.formulaUsed}$$`} />
              </div>
            </div>
          </div>

          {/* Step-by-Step Rigorous Mathematical Solution */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Complete Line-by-Line Mathematical Working</span>
              </h3>
              <button
                onClick={() => setShowPitfalls(!showPitfalls)}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                {showPitfalls ? 'Hide Pitfall Warnings' : 'Show Pitfall Warnings'}
              </button>
            </div>

            <div className="space-y-3">
              {activeExample.solutionSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {step.stepNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                    {step.explanation}
                  </p>

                  <div className="pl-8 py-1.5 overflow-x-auto text-slate-100 text-sm font-mono">
                    <MathView text={`$$${step.mathLatex}$$`} />
                  </div>

                  {showPitfalls && step.pitfallWarning && (
                    <div className="ml-8 mt-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Common Exam Trap: </span>
                        <span>{step.pitfallWarning}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Concluding Result & Exam Tip */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-800/60 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              Final Evaluated Answer
            </span>
            <p className="text-sm font-bold text-slate-100 font-mono">
              {activeExample.finalAnswer}
            </p>
            <div className="pt-1 text-xs text-slate-300 flex items-start gap-1.5 border-t border-emerald-900/40">
              <Lightbulb className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Examiner Tip: </strong>
                {activeExample.examTips}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
