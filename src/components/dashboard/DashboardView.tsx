import React from 'react';
import { CourseCurriculum, LearnerState } from '../../types';
import { VERIFIED_STANDARD_PROBLEMS } from '../../problem-bank/standard-problems';
import { MathView } from '../MathView';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Play,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  Layers,
  Award,
  UploadCloud,
} from 'lucide-react';

interface DashboardViewProps {
  curriculum: CourseCurriculum;
  learnerState: LearnerState;
  onNavigate: (tab: any) => void;
  onSelectProblem: (problemId: string) => void;
  onOpenSyllabusIntake?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  curriculum,
  learnerState,
  onNavigate,
  onSelectProblem,
  onOpenSyllabusIntake,
}) => {
  const featuredProblem = VERIFIED_STANDARD_PROBLEMS[0];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Madras Institute of Technology • Department of Mathematics</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            AI Engineering Calculus Tutor
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome, First-Year CSE Student. This workspace is customized for your actual course{' '}
            <strong>{curriculum.code}: {curriculum.title}</strong> ({curriculum.regulations}).
            Build conceptual intuition, derive mathematical methods, inspect geometric boundaries on the interactive whiteboard,
            and practice verified problems with step-by-step guidance.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSyllabusIntake}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-200" />
              <span>Provide Syllabus & Start Tutoring</span>
            </button>

            <button
              onClick={() => onNavigate('learn')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Learning Active Concept</span>
            </button>

            <button
              onClick={() => onNavigate('generate')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Standard Problems</span>
            </button>
          </div>
        </div>

        {/* Subtle geometric background watermark */}
        <div className="absolute right-[-20px] bottom-[-30px] opacity-10 pointer-events-none select-none text-indigo-400">
          <Layers className="w-80 h-80" />
        </div>
      </div>

      {/* Syllabus Processing Callout Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md bg-gradient-to-r from-indigo-950/40 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">
                Active Curriculum: {curriculum.code} ({curriculum.title})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {curriculum.approvalStatus === 'approved' ? 'Approved' : 'Draft'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The AI tutor derives methods, questions, and whiteboard visualizations tailored strictly to this syllabus.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSyllabusIntake}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload or Change Syllabus</span>
        </button>
      </div>

      {/* 5 Core Learning Modes Navigation Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
          Core Learning Modes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode A */}
          <div
            onClick={() => onNavigate('learn')}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer space-y-2.5 group shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Mode A: Learn a Concept</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prerequisite diagnosis, intuitive explanations before formulas, adaptive confusion detection, and closing independent application.
            </p>
          </div>

          {/* Mode B */}
          <div
            onClick={() => onNavigate('generate')}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer space-y-2.5 group shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Mode B: Generate Problems</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate syllabus-aligned problems across 4 difficulty tiers. Each problem is mathematically verified via SymPy & Quadrature before delivery.
            </p>
          </div>

          {/* Mode C */}
          <div
            onClick={() => onNavigate('guided')}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer space-y-2.5 group shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Mode C: Guided Solutions</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              5-stage guided walk-through with on-demand hints, mathematical justifications, intermediate step-checking, and error diagnosis.
            </p>
          </div>

          {/* Mode D */}
          <div
            onClick={() => onNavigate('whiteboard')}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer space-y-2.5 group shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Mode D: Math Whiteboard</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic coordinate grid, function plotting, double-integral region strip analysis (vertical vs horizontal slicing), and parameter exploration.
            </p>
          </div>

          {/* Mode E */}
          <div
            onClick={() => onNavigate('learn')}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer space-y-2.5 group shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Mode E: Live Voice Tutor</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Speak naturally with the tutor, receive spoken explanations, interrupt for clarification, and watch the whiteboard synchronize in real-time.
            </p>
          </div>

          {/* Syllabus Intelligence */}
          <div
            onClick={() => onNavigate('syllabus')}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/60 transition-all cursor-pointer space-y-2.5 group shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Syllabus Intelligence</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload course PDFs or regulations, extract prerequisite maps, manage versioning, and prevent teaching from unapproved drafts.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Verified Problem Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">
              FEATURED VERIFIED EXAM PROBLEM
            </span>
            <h3 className="text-base font-bold text-slate-100">{featuredProblem.title}</h3>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono">
            {featuredProblem.verificationStatus}
          </span>
        </div>

        <div className="text-slate-200 text-sm leading-relaxed bg-slate-950/70 p-4 rounded-lg border border-slate-800">
          <MathView text={featuredProblem.statement} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            Source: <span className="italic text-slate-300">{featuredProblem.sourceProvenance}</span>
          </span>

          <button
            onClick={() => {
              onSelectProblem(featuredProblem.id);
              onNavigate('guided');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <span>Solve with Step-by-Step Guidance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
