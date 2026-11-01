import React, { useState } from 'react';
import { CourseCurriculum } from '../../types';
import { processSyllabusWithAI } from '../../services/api';
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  X,
  RefreshCw,
} from 'lucide-react';

interface SyllabusIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyllabusProcessedAndStartTutoring: (curriculum: CourseCurriculum) => void;
}

export const SyllabusIntakeModal: React.FC<SyllabusIntakeModalProps> = ({
  isOpen,
  onClose,
  onSyllabusProcessedAndStartTutoring,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Processing, 3: Review & Start
  const [inputText, setInputText] = useState<string>('');
  const [filename, setFilename] = useState<string>('My_Course_Syllabus.txt');
  const [courseCode, setCourseCode] = useState<string>('MA3151');
  const [courseTitle, setCourseTitle] = useState<string>('Matrices and Calculus');
  const [institution, setInstitution] = useState<string>('Madras Institute of Technology (MIT)');
  const [department, setDepartment] = useState<string>('Computer Science and Engineering');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    confidenceScore: number;
    extractedCurriculum: CourseCurriculum;
    source: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const loadMITTemplate = () => {
    setCourseCode('MA3151');
    setCourseTitle('Matrices and Calculus');
    setInstitution('Madras Institute of Technology (MIT), Anna University');
    setDepartment('Computer Science and Engineering');
    setInputText(`MA3151 - MATRICES AND CALCULUS
(Common to all branches of B.E. / B.Tech Programmes - Regulation 2021)

UNIT I: MATRICES
Eigenvalues and Eigenvectors of a real symmetric matrix - Characteristic equation - Properties of Eigenvalues and Eigenvectors - Cayley-Hamilton theorem - Diagonalization of matrices - Reduction of a quadratic form to canonical form by orthogonal transformation - Nature of quadratic forms.

UNIT II: DIFFERENTIAL CALCULUS
Representation of functions - Limit of a function - Continuity - Derivatives - Differentiation rules - Maxima and Minima of functions of two variables - Constrained extrema - Lagrange's multipliers method.

UNIT III: FUNCTIONS OF SEVERAL VARIABLES
Partial derivatives - Total derivative - Differentiation of implicit functions - Change of variables - Jacobians - Taylor's series for functions of two variables - Maxima and minima of functions of two variables.

UNIT IV: INTEGRAL CALCULUS
Definite and Indefinite integrals - Substitution rule - Techniques of Integration - Integration by parts - Trigonometric integrals - Improper integrals - Beta and Gamma functions and their properties.

UNIT V: MULTIPLE INTEGRALS
Double integrals - Change of order of integration - Double integrals in polar coordinates - Area enclosed by plane curves - Triple integrals - Volume of solids.
Prerequisites: Pre-calculus, algebra, basic trigonometric identities`);
  };

  const handleProcessSyllabus = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Please paste or upload your syllabus text before processing.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStep(2);

    try {
      const result = await processSyllabusWithAI(filename, inputText, {
        courseCode,
        courseTitle,
        institution,
        department,
        semester: 1,
      });

      if (result && result.extractedCurriculum) {
        setExtractedData(result);
        setStep(3);
      } else {
        throw new Error('Syllabus parsing failed to return valid curriculum structure.');
      }
    } catch (err: unknown) {
      setErrorMsg('Failed to process syllabus. Please check the text format and try again.');
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndStartTutoring = () => {
    if (extractedData?.extractedCurriculum) {
      onSyllabusProcessedAndStartTutoring(extractedData.extractedCurriculum);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Course Syllabus Setup & AI Ingestion</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Provide your syllabus so the AI tutor can align its explanations, problems, and whiteboard to your course.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 flex-1">
          {/* Step 1: Input / Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    placeholder="e.g. MA3151"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    placeholder="e.g. Matrices and Calculus"
                  />
                </div>
              </div>

              {/* Upload or Load Preset */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer font-medium transition-colors">
                  <UploadCloud className="w-4 h-4 text-indigo-400" />
                  <span>Upload Syllabus File (.txt / .doc)</span>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={loadMITTemplate}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Insert MIT Anna University MA3151 Syllabus</span>
                </button>
              </div>

              {/* Text Area */}
              <div className="space-y-1">
                <textarea
                  rows={9}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your course syllabus here with Unit headers (e.g. UNIT I: MATRICES, UNIT II: DIFFERENTIAL CALCULUS)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Processing with AI */}
          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-8 h-8 text-indigo-400" />
                </div>
                <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">AI is Analyzing Your Course Syllabus</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Extracting semester units, topic hierarchies, learning outcomes, and prerequisite dependency graphs...
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review Extracted Curriculum & Start Tutoring */}
          {step === 3 && extractedData && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Syllabus successfully parsed and structured ({extractedData.extractedCurriculum.units.length} Units detected)
                  </span>
                </div>
                <span className="font-mono text-emerald-400 text-[11px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                  Confidence: {(extractedData.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {extractedData.extractedCurriculum.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{unit.title}</span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        {unit.topics.length} Topics
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-1.5">
                      {unit.topics.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          {t.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800 rounded-xl text-xs text-indigo-200">
                <p>
                  <strong>Ready to begin:</strong> Clicking below will approve this curriculum and immediately begin the
                  tutoring session focused on <strong>Unit 1</strong> of your course.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>

          {step === 1 && (
            <button
              onClick={handleProcessSyllabus}
              disabled={isProcessing || !inputText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Process Syllabus with AI</span>
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleConfirmAndStartTutoring}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Approve & Start Tutoring Process</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
