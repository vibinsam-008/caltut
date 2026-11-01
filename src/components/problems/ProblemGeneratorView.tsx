import React, { useState } from 'react';
import {
  CalculusProblem,
  CourseCurriculum,
  DifficultyLevel,
  ProblemFormat,
  SolutionVisibility,
  AssessmentStyle,
} from '../../types';
import { queryProblemsFromBackend } from '../../services/api';
import { MathView } from '../MathView';
import {
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Play,
  Lightbulb,
} from 'lucide-react';

interface ProblemGeneratorViewProps {
  curriculum: CourseCurriculum;
  onLaunchGuidedProblem: (problem: CalculusProblem) => void;
}

export const ProblemGeneratorView: React.FC<ProblemGeneratorViewProps> = ({
  curriculum,
  onLaunchGuidedProblem,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('standard');
  const [format, setFormat] = useState<ProblemFormat>('computational');
  const [count, setCount] = useState<number>(3);
  const [visibility, setVisibility] = useState<SolutionVisibility>('hints_available');
  const [assessmentStyle, setAssessmentStyle] = useState<AssessmentStyle>('practice');

  const [problems, setProblems] = useState<CalculusProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [practiceSet, setPracticeSet] = useState<string[]>([]);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  // Active topics list depending on selected unit
  const activeTopics = React.useMemo(() => {
    if (selectedUnit === 'all') {
      return curriculum.units.flatMap((u) => u.topics);
    }
    const unit = curriculum.units.find((u) => u.id === selectedUnit);
    return unit ? unit.topics : [];
  }, [selectedUnit, curriculum]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const results = await queryProblemsFromBackend({
        unitId: selectedUnit,
        topicId: selectedTopic,
        difficulty,
        format,
        count,
      });
      setProblems(results);
    } catch {
      // Fallback
      setProblems([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run initial query on mount
  React.useEffect(() => {
    handleGenerate();
  }, []);

  const toggleAnswer = (id: string) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addToPracticeSet = (id: string) => {
    if (!practiceSet.includes(id)) {
      setPracticeSet((prev) => [...prev, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-semibold">
            Mode B: Verified Problem Generator
          </span>
          <h1 className="text-xl font-bold text-slate-100 mt-2">
            Standard Engineering Calculus Problem Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic problem synthesis with deterministic mathematical verification. Problems are verified for
            boundary consistency, domain restrictions, and solution existence before presentation.
          </p>
        </div>

        {practiceSet.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800 rounded-lg px-3 py-2 text-xs">
            <span className="text-indigo-300 font-semibold">Practice Set:</span>
            <span className="bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
              {practiceSet.length} {practiceSet.length === 1 ? 'problem' : 'problems'}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Configuration Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Syllabus & Problem Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {/* Unit selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Syllabus Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setSelectedTopic('all');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Units (Comprehensive)</option>
              {curriculum.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* Topic selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Topic Focus</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Topics</option>
              {activeTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="foundational">Foundational (Prerequisites & Definitions)</option>
              <option value="standard">Standard (Semester Exam Level)</option>
              <option value="challenging">Challenging (Multi-step Transformations)</option>
              <option value="advanced">Advanced (Proof & Non-trivial Boundaries)</option>
            </select>
          </div>

          {/* Problem Format */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Problem Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ProblemFormat)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="computational">Computational (Evaluate / Calculate)</option>
              <option value="conceptual">Conceptual (Identify & Reason)</option>
              <option value="derivation">Derivation (Step-by-step Proof)</option>
              <option value="visualization">Visualization (Region & Geometry)</option>
              <option value="application">Application (Engineering Modeling)</option>
            </select>
          </div>

          {/* Solution Visibility */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Solution Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as SolutionVisibility)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="hidden">Hidden (Exam conditions)</option>
              <option value="hints_available">Hints Available on Demand</option>
              <option value="guided_solution">Guided Solution Mode</option>
              <option value="full_solution">Full Verified Solution Visible</option>
            </select>
          </div>

          {/* Assessment Style */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Assessment Style</label>
            <select
              value={assessmentStyle}
              onChange={(e) => setAssessmentStyle(e.target.value as AssessmentStyle)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="practice">Self-Paced Practice</option>
              <option value="timed_mock_test">Timed Mock Test (20 min)</option>
              <option value="topic_revision">Topic Revision Set</option>
            </select>
          </div>

          {/* Count */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Number of Problems</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={1}>1 Problem</option>
              <option value={3}>3 Problems</option>
              <option value={5}>5 Problems (Full Set)</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer h-[38px]"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Verified Problems'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Problems List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Displaying <strong className="text-slate-200">{problems.length}</strong> mathematically verified problems
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Passed SymPy & Quadrature Quality Pipeline</span>
          </span>
        </div>

        {problems.map((prob, idx) => (
          <div
            key={prob.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors"
          >
            {/* Problem Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{prob.title}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {prob.difficulty}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {prob.verificationStatus}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Source: <span className="italic text-slate-300">{prob.sourceProvenance}</span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="text-slate-200 text-sm leading-relaxed bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <MathView text={prob.statement} />
            </div>

            {/* Verification Metadata Box */}
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Verification Method:</strong> {prob.verificationMethod}
                </span>
              </div>
              <div>
                <strong>Difficulty Rationale:</strong> {prob.difficultyRationale}
              </div>
            </div>

            {/* Answer & Derivation Toggle */}
            {visibility !== 'hidden' && (
              <div className="space-y-2">
                <button
                  onClick={() => toggleAnswer(prob.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{expandedAnswers[prob.id] ? 'Hide Answer & Key Results' : 'Show Verified Answer'}</span>
                </button>

                {expandedAnswers[prob.id] && (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2 animate-fadeIn">
                    <p className="font-semibold text-emerald-300">
                      Expected Answer: <span className="font-mono">{prob.expectedAnswer}</span>
                    </p>
                    <div className="space-y-1">
                      <span className="font-medium text-slate-300">Important Intermediate Steps:</span>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                        {prob.importantResults.map((res, i) => (
                          <li key={i}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => addToPracticeSet(prob.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>{practiceSet.includes(prob.id) ? 'Added to Set ✓' : 'Add to Practice Set'}</span>
              </button>

              <button
                onClick={() => onLaunchGuidedProblem(prob)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors ml-auto cursor-pointer"
              >
                <span>Solve in Guided Solution Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
