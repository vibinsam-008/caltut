import React, { useState, useEffect } from 'react';
import { CourseCurriculum } from '../../types';
import { generateUniversityMockExam, MockExamPaper } from '../../exam/mock-test-generator';
import { MathView } from '../MathView';
import {
  FileText,
  Clock,
  Award,
  CheckCircle2,
  KeyRound,
  Printer,
  RotateCcw,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MockTestViewProps {
  curriculum: CourseCurriculum;
}

export const MockTestView: React.FC<MockTestViewProps> = ({ curriculum }) => {
  const [examPaper, setExamPaper] = useState<MockExamPaper>(() =>
    generateUniversityMockExam(curriculum)
  );
  const [activeTab, setActiveTab] = useState<'paper' | 'test_mode' | 'answer_key'>('paper');
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Timed exam state
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(180 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});

  // Re-generate paper when curriculum changes
  useEffect(() => {
    setExamPaper(generateUniversityMockExam(curriculum));
  }, [curriculum.courseId]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemainingSeconds]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetTest = () => {
    setIsTimerRunning(false);
    setTimeRemainingSeconds(180 * 60);
    setStudentAnswers({});
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Step 5: University Model Examination & Marking Scheme</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Mock Examination & Complete Answer Key
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Full 100-mark semester exam paper formulated strictly according to{' '}
            <strong className="text-indigo-300">{examPaper.regulations}</strong>. Features{' '}
            <strong>Part A (10 × 2 = 20 Marks)</strong> and{' '}
            <strong>Part B (5 × 16 = 80 Marks)</strong> with full step-by-step marking schemes and examiner criteria.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('paper')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'paper'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Question Paper</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('test_mode');
                setIsTimerRunning(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'test_mode'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timed Practice Exam ({formatTimer(timeRemainingSeconds)})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('answer_key');
                setShowAnswerKey(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'answer_key'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Master Answer Key & Marking Scheme</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors ml-auto cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none text-indigo-400">
          <Award className="w-64 h-64" />
        </div>
      </div>

      {/* Official Exam Paper Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
        {/* Exam Title & Header */}
        <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1.5">
          <div className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">
            {examPaper.institution}
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-100 tracking-tight uppercase">
            B.E. / B.Tech. Degree Examinations — Model Examination
          </h2>
          <div className="text-sm font-bold text-slate-200">
            {examPaper.courseCode}: {examPaper.courseTitle}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            ({examPaper.regulations} • Common to all Engineering Branches)
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 pt-4 px-2 border-t border-slate-800 mt-3">
            <span>Time: 3 Hours</span>
            <span>Maximum Marks: 100 Marks</span>
          </div>

          {/* Instructions */}
          <div className="pt-2 text-left bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <span className="font-bold text-slate-300 block mb-1">General Instructions:</span>
            {examPaper.instructions.map((inst, i) => (
              <p key={i}>• {inst}</p>
            ))}
          </div>
        </div>

        {/* Global Answer Key Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">
              Verified Step-by-Step Solutions & Marking Rubrics
            </span>
          </div>

          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAnswerKey ? 'Hide All Solutions' : 'Reveal All Solutions & Key'}</span>
          </button>
        </div>

        {/* PART A: 10 Short Questions (2 Marks Each = 20 Marks) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                PART A — (10 × 2 = 20 Marks)
              </h3>
              <p className="text-xs text-slate-400">Answer ALL questions. Each question carries 2 marks.</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              20 Marks
            </span>
          </div>

          <div className="space-y-4">
            {examPaper.partA.map((q) => {
              const isOpen = showAnswerKey || expandedSolutions[q.id];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="font-mono text-xs font-bold text-indigo-400 mt-0.5">
                        Q.{q.questionNumber}
                      </span>
                      <div className="text-xs text-slate-200 leading-relaxed font-medium">
                        <MathView text={q.questionText} />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 flex-shrink-0">
                      [{q.marks} Marks]
                    </span>
                  </div>

                  {/* Student input field in timed exam mode */}
                  {activeTab === 'test_mode' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Type your final evaluated answer or formula..."
                        value={studentAnswers[q.id] || ''}
                        onChange={(e) =>
                          setStudentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Toggle solution button */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 font-mono">{q.unitTitle}</span>
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isOpen ? 'Hide Answer Key' : 'View Verified Solution'}</span>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Detailed Solution & Marking Scheme */}
                  {isOpen && (
                    <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-900/60 space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1">
                          Marking Rubric (Total 2 Marks):
                        </span>
                        <ul className="space-y-0.5 text-slate-300 text-[11px]">
                          {q.markingScheme.map((m, idx) => (
                            <li key={idx} className="flex items-center justify-between">
                              <span>• {m.criteria}</span>
                              <span className="font-mono text-indigo-300">+{m.marks} Mark</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-indigo-900/40">
                        <span className="text-[10px] font-mono font-bold uppercase text-indigo-300 block mb-1">
                          Model Solution:
                        </span>
                        <div className="text-slate-200 text-xs leading-relaxed space-y-1">
                          <MathView text={q.detailedSolution} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PART B: 5 Long Analytical Questions (16 Marks Each = 80 Marks) */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                PART B — (5 × 16 = 80 Marks)
              </h3>
              <p className="text-xs text-slate-400">
                Answer FIVE FULL questions, choosing either (a) or (b) from each question.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              80 Marks
            </span>
          </div>

          <div className="space-y-6">
            {examPaper.partB.map((q) => {
              const idChoiceA = `${q.id}-a`;
              const idChoiceB = `${q.id}-b`;
              const isChoiceAOpen = showAnswerKey || expandedSolutions[idChoiceA];
              const isChoiceBOpen = showAnswerKey || expandedSolutions[idChoiceB];

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-5 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-sm text-slate-100">
                      Question {q.questionNumber} • {q.unitTitle}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      [16 Marks]
                    </span>
                  </div>

                  {/* Choice (a) */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-300 font-mono block">
                          {q.questionNumber}. (a)
                        </span>
                        <div className="text-xs text-slate-200 leading-relaxed font-medium">
                          <MathView text={q.choiceA.statement} />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSolution(idChoiceA)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                      >
                        <span>{isChoiceAOpen ? 'Hide Solution' : 'View (a) Marking Scheme & Solution'}</span>
                        {isChoiceAOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isChoiceAOpen && (
                      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs mt-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1.5">
                            Step-by-Step Marking Breakdown (16 Marks):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                            {q.choiceA.markingScheme.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                              >
                                <span>• {item.step}</span>
                                <span className="font-mono text-indigo-300 font-bold">
                                  {item.marksAllocated}M
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-mono font-bold uppercase text-indigo-300 block mb-1">
                            Complete Official Worked Solution:
                          </span>
                          <div className="text-slate-200 text-xs leading-relaxed space-y-2">
                            <MathView text={q.choiceA.detailedSolution} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center justify-center">
                    <span className="px-4 py-1 rounded-full bg-slate-800 text-slate-300 font-bold font-mono text-xs border border-slate-700">
                      [ OR ]
                    </span>
                  </div>

                  {/* Choice (b) */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-300 font-mono block">
                          {q.questionNumber}. (b)
                        </span>
                        <div className="text-xs text-slate-200 leading-relaxed font-medium">
                          <MathView text={q.choiceB.statement} />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSolution(idChoiceB)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                      >
                        <span>{isChoiceBOpen ? 'Hide Solution' : 'View (b) Marking Scheme & Solution'}</span>
                        {isChoiceBOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isChoiceBOpen && (
                      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs mt-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1.5">
                            Step-by-Step Marking Breakdown (16 Marks):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                            {q.choiceB.markingScheme.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                              >
                                <span>• {item.step}</span>
                                <span className="font-mono text-indigo-300 font-bold">
                                  {item.marksAllocated}M
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-mono font-bold uppercase text-indigo-300 block mb-1">
                            Complete Official Worked Solution:
                          </span>
                          <div className="text-slate-200 text-xs leading-relaxed space-y-2">
                            <MathView text={q.choiceB.detailedSolution} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
