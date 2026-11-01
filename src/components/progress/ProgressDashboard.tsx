import React from 'react';
import { CourseCurriculum, LearnerState, EvidenceLevel } from '../../types';
import { COMMON_CALCULUS_MISCONCEPTIONS } from '../../learner/learner-model';
import {
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Brain,
} from 'lucide-react';

interface ProgressDashboardProps {
  curriculum: CourseCurriculum;
  learnerState: LearnerState;
  onNavigateToTopic?: (unitId: string, topicId: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  curriculum,
  learnerState,
  onNavigateToTopic,
}) => {
  // Aggregate evidence across all objectives
  const allObjectives = curriculum.units.flatMap((u) =>
    u.topics.flatMap((t) => t.learningObjectives)
  );

  const evidenceCounts: Record<EvidenceLevel, number> = {
    not_assessed: 0,
    uncertain: 0,
    demonstrated_with_assistance: 0,
    demonstrated_independently: 0,
    needs_reassessment: 0,
  };

  allObjectives.forEach((obj) => {
    const level = learnerState.objectiveEvidence[obj.id] || 'not_assessed';
    evidenceCounts[level] = (evidenceCounts[level] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-semibold">
            Section 4: Adaptive Learner Model
          </span>
          <h1 className="text-xl font-bold text-slate-100 mt-2">
            Mathematical Competence & Evidence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks authentic mathematical mastery. Mastery requires independent problem-solving performance,
            not arbitrary points or time spent reading solutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Independent</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {learnerState.independentSuccessCount}
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
            <span className="text-xl font-mono font-bold text-indigo-400">
              {learnerState.completedProblems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Evidence Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Independent</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-100">
            {evidenceCounts.demonstrated_independently}
          </p>
          <span className="text-[10px] text-slate-400 block">Solved without hints</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span>With Assistance</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-100">
            {evidenceCounts.demonstrated_with_assistance}
          </p>
          <span className="text-[10px] text-slate-400 block">Used hints / guidance</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Needs Reassessment</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-100">
            {evidenceCounts.needs_reassessment}
          </p>
          <span className="text-[10px] text-slate-400 block">Misconception detected</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Uncertain</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-100">
            {evidenceCounts.uncertain}
          </p>
          <span className="text-[10px] text-slate-400 block">Incomplete assessment</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Not Assessed</span>
            <Target className="w-4 h-4" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-100">
            {evidenceCounts.not_assessed}
          </p>
          <span className="text-[10px] text-slate-400 block">Syllabus backlog</span>
        </div>
      </div>

      {/* Misconceptions Tracking Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Observed Misconceptions & Diagnostic Remediation</span>
          </div>
          <span className="text-xs text-slate-400">
            {learnerState.observedMisconceptions.length} Active Records
          </span>
        </div>

        {learnerState.observedMisconceptions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No severe mathematical misconceptions flagged in recent sessions. Continue practicing to maintain rigorous conceptual accuracy.
          </p>
        ) : (
          <div className="space-y-3">
            {learnerState.observedMisconceptions.map((mId) => {
              const info = COMMON_CALCULUS_MISCONCEPTIONS.find((c) => c.id === mId);
              return (
                <div
                  key={mId}
                  className="p-3.5 bg-slate-950 rounded-lg border border-rose-900/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">
                      {info?.name || 'Mathematical Fallacy'}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">
                      Target for Remediation
                    </span>
                  </div>
                  <p className="text-slate-300">{info?.description}</p>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-300 mt-2">
                    <strong className="text-emerald-400">Correction & Insight:</strong> {info?.correction}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Syllabus Learning Objectives Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-200">
            Syllabus Learning Objectives Mastery Grid ({curriculum.code})
          </h2>
          <span className="text-xs text-slate-400">MIT Campus University Dept Syllabus</span>
        </div>

        <div className="space-y-4">
          {curriculum.units.map((unit) => (
            <div key={unit.id} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                {unit.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {unit.topics.flatMap((t) =>
                  t.learningObjectives.map((obj) => {
                    const status = learnerState.objectiveEvidence[obj.id] || 'not_assessed';
                    return (
                      <div
                        key={obj.id}
                        className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-indigo-400 font-bold">
                              {obj.code}
                            </span>
                            <span className="font-semibold text-slate-200">{obj.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{obj.description}</p>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize flex-shrink-0 ${
                            status === 'demonstrated_independently'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : status === 'demonstrated_with_assistance'
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              : status === 'needs_reassessment'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
