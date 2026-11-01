import React, { useState } from 'react';
import { CourseCurriculum, LearnerState } from '../../types';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Volume2,
  Trash2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface SettingsViewProps {
  curriculum: CourseCurriculum;
  learnerState: LearnerState;
  onResetLearnerState: () => void;
  onResetRegulationsGate?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  curriculum,
  learnerState,
  onResetLearnerState,
  onResetRegulationsGate,
}) => {
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [tolerance, setTolerance] = useState<number>(0.05);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [gateResetSuccess, setGateResetSuccess] = useState<boolean>(false);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your learner evidence state?')) {
      onResetLearnerState();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleResetGate = () => {
    if (confirm('Return to the mandatory Regulations and Syllabus intake gate?')) {
      onResetRegulationsGate?.();
      setGateResetSuccess(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-2">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Calculus Tutor System & Verification Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure mathematical verification parameters, voice synthesis, and curriculum authority settings.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6 text-xs">
        {/* Verification Engine Settings */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Math Verification Engine</span>
          </h2>
          <p className="text-slate-400">
            Controls symbolic parsing and Simpson double quadrature checks for equivalence and order reversals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300">Numerical Equivalence Tolerance</span>
              <p className="text-[11px] text-slate-500">Maximum allowable relative discrepancy (default 5%)</p>
              <input
                type="range"
                min={0.01}
                max={0.1}
                step={0.01}
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 mt-2"
              />
              <span className="text-[11px] font-mono text-indigo-300">{(tolerance * 100).toFixed(0)}%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300">Verification Authority</span>
              <p className="text-[11px] text-slate-500">SymPy symbolic AST & composite Simpson 1/3 quadrature</p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] mt-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Deterministic Mode Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voice and Speech Synthesis Settings */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Live Voice Tutor Configuration (Mode E)</span>
          </h2>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Speech Rate</span>
              <span className="font-mono text-indigo-300">{speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.4}
              step={0.1}
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        {/* State Management */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 text-rose-400">
            <Trash2 className="w-4 h-4" />
            <span>Learner Evidence State Reset</span>
          </h2>
          <p className="text-slate-400">
            Clears demonstrated mastery records, misconception tracking, and hint counts to restart diagnosis from scratch.
          </p>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Learner State</span>
          </button>

          {resetSuccess && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Learner state reset successfully.</span>
            </p>
          )}
        </div>

        {/* Regulations & Syllabus Intake Reset */}
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Academic Regulations & Syllabus Onboarding Gate</span>
          </h2>
          <p className="text-slate-400">
            Re-enter the mandatory course regulations and syllabus document ingestion screen to switch universities or change curriculum.
          </p>

          <button
            onClick={handleResetGate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Enter Regulations & Syllabus Intake Gate</span>
          </button>

          {gateResetSuccess && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Redirecting to intake gate...</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
