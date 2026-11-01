import React from 'react';
import { CourseCurriculum, LearnerState } from '../../types';
import { VERIFIED_STANDARD_PROBLEMS } from '../../problem-bank/standard-problems';
import { generateTopicPedagogy } from '../../curriculum/topic-pedagogy';
import { MathView } from '../MathView';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Layers,
  UploadCloud,
  Target,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  curriculum: CourseCurriculum;
  learnerState: LearnerState;
  activeUnitId?: string;
  activeTopicId?: string;
  onNavigate: (tab: any) => void;
  onSelectProblem: (problemId: string) => void;
  onSelectLesson?: (unitId: string, topicId: string) => void;
  onOpenSyllabusIntake?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  curriculum,
  activeUnitId,
  activeTopicId,
  onNavigate,
  onSelectProblem,
  onSelectLesson,
  onOpenSyllabusIntake,
}) => {
  // Determine active unit and topic
  const activeUnit =
    (activeUnitId && curriculum.units.find((u) => u.id === activeUnitId)) ||
    curriculum.units[0];
  const activeTopic =
    (activeTopicId && activeUnit?.topics.find((t) => t.id === activeTopicId)) ||
    activeUnit?.topics[0];
  const activeObjective = activeTopic?.learningObjectives[0];

  const pedagogy = generateTopicPedagogy(activeTopic, activeUnit);

  // Match featured problem to current topic or unit
  const matchedProblem =
    VERIFIED_STANDARD_PROBLEMS.find((p) => {
      if (!activeTopic && !activeUnit) return false;
      const tTitle = (activeTopic?.title || '').toLowerCase();
      const uTitle = (activeUnit?.title || '').toLowerCase();

      if (
        tTitle.includes('several variable') ||
        tTitle.includes('extrema') ||
        tTitle.includes('lagrange') ||
        tTitle.includes('partial derivative') ||
        uTitle.includes('several variable')
      ) {
        return p.id.includes('extrema') || p.id.includes('lagrange');
      }
      if (
        tTitle.includes('eigen') ||
        tTitle.includes('matrix') ||
        tTitle.includes('matrices') ||
        uTitle.includes('matrix') ||
        uTitle.includes('matrices')
      ) {
        return p.id.includes('eigenvalues');
      }
      if (
        tTitle.includes('beta') ||
        tTitle.includes('gamma') ||
        uTitle.includes('integral calculus')
      ) {
        return p.id.includes('beta-gamma');
      }
      if (
        tTitle.includes('multiple') ||
        tTitle.includes('order') ||
        uTitle.includes('multiple integral')
      ) {
        return p.id.includes('double-int');
      }
      return false;
    }) || VERIFIED_STANDARD_PROBLEMS[0];

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
            Welcome, First-Year CSE Student. This workspace is synchronized to your active syllabus{' '}
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
              onClick={() => {
                if (activeUnit && activeTopic) {
                  onSelectLesson?.(activeUnit.id, activeTopic.id);
                }
                onNavigate('learn');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Learn Active Lesson: {activeTopic?.title || 'Core Calculus'}</span>
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

      {/* Dynamic Current Active Lesson Banner */}
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Current Active Lesson • {activeUnit?.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Tutoring Ready
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 mt-0.5">
                {activeTopic?.title || 'Core Calculus Foundations'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (activeUnit && activeTopic) {
                  onSelectLesson?.(activeUnit.id, activeTopic.id);
                }
                onNavigate('learn');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue Lesson in Mode A</span>
            </button>

            <button
              onClick={() => {
                onSelectProblem(matchedProblem.id);
                onNavigate('guided');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Solve Lesson Problem</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
              Learning Objective
            </span>
            <p className="text-slate-200 font-semibold text-xs">
              {activeObjective?.title || `Master core analytical methods of ${activeTopic?.title}`}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {activeObjective?.description ||
                'Understand foundational definitions, formulate mathematical models, and compute exact solutions.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
              Conceptual Pedagogy
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {pedagogy.intuitionSummary}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
              Key Governing Identity
            </span>
            <div className="text-slate-200 overflow-x-auto py-1">
              <MathView text={`$$${pedagogy.keyFormulaLatex}$$`} />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Course Syllabus Navigator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Course Syllabus & Lesson Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Structured units extracted from your syllabus ({curriculum.code}: {curriculum.title}). Select any lesson to start tutoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {curriculum.units.length} Units • {curriculum.units.reduce((acc, u) => acc + u.topics.length, 0)} Lessons
            </span>
            <button
              onClick={onOpenSyllabusIntake}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Syllabus</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curriculum.units.map((unit, uIdx) => (
            <div
              key={unit.id}
              className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800/60">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {uIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 truncate" title={unit.title}>
                    {unit.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex-shrink-0">
                  {unit.topics.length} topics
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {unit.topics.map((topic) => {
                  const isLessonActive = activeTopic?.id === topic.id;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => {
                        onSelectLesson?.(unit.id, topic.id);
                        onNavigate('learn');
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                        isLessonActive
                          ? 'bg-indigo-950/90 border border-indigo-500/70 text-indigo-200 font-semibold shadow-sm'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isLessonActive ? 'bg-indigo-400 ring-2 ring-indigo-400/30' : 'bg-slate-600'
                          }`}
                        />
                        <span className="truncate">{topic.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {isLessonActive ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">
                            CURRENT
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 group-hover:text-slate-300">
                            Start
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Step Complete Engineering Calculus Pathway */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Complete Engineering Calculus Learning Ladder</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              From syllabus & regulations intake to concept intuition, textbook solved examples, practice problems, and full university mock tests with answer keys.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
            5-Stage Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {/* Step 1: Syllabus & Regulations */}
          <div
            onClick={onOpenSyllabusIntake}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer space-y-2 group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              Regulations & Syllabus
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Upload university regulations, course PDF, or choose MIT / IIT / BS Grewal curricula.
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold block pt-1 group-hover:underline">
              Set Up Course →
            </span>
          </div>

          {/* Step 2: Concept Mastery */}
          <div
            onClick={() => {
              if (activeUnit && activeTopic) {
                onSelectLesson?.(activeUnit.id, activeTopic.id);
              }
              onNavigate('learn');
            }}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer space-y-2 group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              Concept Mastery
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prerequisite diagnosis, intuitive physical analogies, and synchronized whiteboard visualizer.
            </p>
            <span className="text-[10px] text-indigo-400 font-semibold block pt-1 group-hover:underline">
              Study Concept →
            </span>
          </div>

          {/* Step 3: Solved Examples */}
          <div
            onClick={() => onNavigate('examples')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer space-y-2 group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                3
              </span>
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              Solved Examples
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Line-by-line model proofs from BS Grewal, Erwin Kreyszig, and IIT NPTEL modules.
            </p>
            <span className="text-[10px] text-indigo-400 font-semibold block pt-1 group-hover:underline">
              Inspect Examples →
            </span>
          </div>

          {/* Step 4: Practice Problems & Guided Solutions */}
          <div
            onClick={() => {
              onSelectProblem(matchedProblem.id);
              onNavigate('guided');
            }}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer space-y-2 group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                4
              </span>
              <HelpCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              Practice & Clarify
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interactive problem solving, on-demand progressive hints, and step-checking feedback.
            </p>
            <span className="text-[10px] text-indigo-400 font-semibold block pt-1 group-hover:underline">
              Start Practice →
            </span>
          </div>

          {/* Step 5: Mock Exam & Key */}
          <div
            onClick={() => onNavigate('exam')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer space-y-2 group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                5
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              Mock Exam & Key
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Full 100-mark university question paper (Part A & B) with complete step-by-step marking rubrics.
            </p>
            <span className="text-[10px] text-amber-400 font-semibold block pt-1 group-hover:underline">
              Generate Exam →
            </span>
          </div>
        </div>
      </div>

      {/* Featured Verified Problem Card (Dynamically aligned to active topic) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">
              FEATURED PRACTICE PROBLEM FOR {activeTopic?.title.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-slate-100">{matchedProblem.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono capitalize">
              {matchedProblem.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{matchedProblem.verificationStatus}</span>
            </span>
          </div>
        </div>

        <div className="text-slate-200 text-sm leading-relaxed bg-slate-950/70 p-4 rounded-lg border border-slate-800">
          <MathView text={matchedProblem.statement} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            Source: <span className="italic text-slate-300">{matchedProblem.sourceProvenance}</span>
          </span>

          <button
            onClick={() => {
              onSelectProblem(matchedProblem.id);
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
