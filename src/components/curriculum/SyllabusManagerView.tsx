import React, { useState } from 'react';
import {
  CourseCurriculum,
} from '../../types';
import {
  uploadSyllabusFile,
  approveCurriculumDraft,
  selectCurriculumCourse,
} from '../../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Layers,
  History,
  FileCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  BookOpen,
} from 'lucide-react';

interface SyllabusManagerViewProps {
  currentCurriculum: CourseCurriculum;
  allCurricula: CourseCurriculum[];
  onCurriculumUpdated: (newCurr: CourseCurriculum) => void;
  onStartTutoringWithCurriculum?: (newCurr: CourseCurriculum) => void;
}

export const SyllabusManagerView: React.FC<SyllabusManagerViewProps> = ({
  currentCurriculum,
  allCurricula,
  onCurriculumUpdated,
  onStartTutoringWithCurriculum,
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'upload' | 'versions'>('hierarchy');
  const [pastedText, setPastedText] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('MA3151-CUSTOM');
  const [courseTitle, setCourseTitle] = useState<string>('Matrices and Calculus');
  const [institution, setInstitution] = useState<string>('Madras Institute of Technology');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestionResult, setIngestionResult] = useState<{
    warnings: string[];
    confidenceScore: number;
    extractedCurriculum: CourseCurriculum;
  } | null>(null);

  // Approval modal state
  const [approverName, setApproverName] = useState<string>('Prof. Department of Mathematics');
  const [versionTag, setVersionTag] = useState<string>('v2024.1-approved');
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const handleIngest = async () => {
    if (!pastedText.trim()) return;
    setIsIngesting(true);
    try {
      const result = await uploadSyllabusFile(
        `${courseCode}_Syllabus.txt`,
        pastedText,
        { courseCode, courseTitle, institution }
      );
      setIngestionResult(result);
      if (result.extractedCurriculum) {
        onCurriculumUpdated(result.extractedCurriculum);
      }
    } catch (err: unknown) {
      alert('Ingestion failed. Please check format.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await approveCurriculumDraft(
        currentCurriculum.courseId,
        approverName,
        versionTag
      );
      if (res.success) {
        setApprovalMessage(res.message);
        // refresh
        const updated = await selectCurriculumCourse(currentCurriculum.courseId);
        onCurriculumUpdated(updated);
      }
    } catch {
      alert('Failed to approve curriculum.');
    }
  };

  const handleSelectCourse = async (courseId: string) => {
    const updated = await selectCurriculumCourse(courseId);
    onCurriculumUpdated(updated);
  };

  const loadPresetMITTemplate = () => {
    setPastedText(`UNIT I - MATRICES
1.1 Characteristic Equation and Eigenvalues
1.2 Cayley-Hamilton Theorem & Diagonalization of Symmetric Matrices
Prerequisites: Matrix multiplication, Determinants of 3x3 matrices

UNIT II - DIFFERENTIAL CALCULUS
2.1 Limits, Continuity, and Tangent Lines
2.2 Maxima and Minima of Functions of Two Variables & Lagrange Multipliers
Prerequisites: Single-variable derivatives, Partial differentiation

UNIT III - FUNCTIONS OF SEVERAL VARIABLES
3.1 Total Derivatives and Multivariable Chain Rule
3.2 Jacobians and Functional Dependence
Prerequisites: Partial derivatives, Determinants

UNIT IV - INTEGRAL CALCULUS
4.1 Methods of Integration & Improper Integrals of Type 1 and 2
4.2 Beta and Gamma Functions with Trigonometric Definite Integrals
Prerequisites: Definite integrals, Antiderivatives

UNIT V - MULTIPLE INTEGRALS
5.1 Double Integrals in Cartesian Coordinates & Change of Order of Integration
5.2 Double Integrals in Polar Coordinates & Area Calculations
5.3 Triple Integrals in Cartesian Coordinates & Volume of Solids
Prerequisites: Curve sketching, Definite integration, Polar coordinates`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-semibold">
            Section 3: Syllabus Intelligence & Curriculum Manager
          </span>
          <h1 className="text-xl font-bold text-slate-100 mt-2">
            Curriculum Authority & Ingestion Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative syllabus extraction with OCR pipeline, prerequisite graph modeling, draft review, and instructor approval locks.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2">
          {currentCurriculum.approvalStatus === 'approved' ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official & Approved ({currentCurriculum.syllabusVersion})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-xs font-mono font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Unapproved Draft ({currentCurriculum.syllabusVersion})</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'hierarchy'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Extracted Curriculum Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Ingest New Syllabus / Document</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Version History & Courses</span>
        </button>
      </div>

      {/* Tab 1: Hierarchy and Approval */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Active Course Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {currentCurriculum.code}: {currentCurriculum.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentCurriculum.institution} • {currentCurriculum.department} • Semester {currentCurriculum.semester} • {currentCurriculum.regulations}
                </p>
              </div>

              {/* Approval controls */}
              {currentCurriculum.approvalStatus === 'draft' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Approver Name"
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-medium"
                  />
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve Syllabus as Official</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-emerald-400 font-mono">
                  Approved by: {currentCurriculum.approvedBy} on {currentCurriculum.approvalDate}
                </div>
              )}
            </div>

            {approvalMessage && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
                {approvalMessage}
              </div>
            )}
          </div>

          {/* Unit & Topics breakdown */}
          <div className="space-y-4">
            {currentCurriculum.units.map((unit) => (
              <div
                key={unit.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{unit.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{unit.description}</p>
                  </div>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                    {unit.topics.length} {unit.topics.length === 1 ? 'Topic' : 'Topics'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {unit.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{topic.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            topic.approvalStatus === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {topic.approvalStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{topic.description}</p>

                      {topic.prerequisites.length > 0 && (
                        <div className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Prerequisites:</strong>{' '}
                          {topic.prerequisites.join(', ')}
                        </div>
                      )}

                      {topic.sourceReferences && topic.sourceReferences.length > 0 && (
                        <div className="text-[10px] text-slate-500 italic">
                          Citation: {topic.sourceReferences[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Ingest New Syllabus Document */}
      {activeTab === 'upload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-100">Ingest Syllabus or Course Regulations</h2>
            <p className="text-xs text-slate-400 mt-1">
              Paste the text or OCR output from course regulations, lecture notes, question banks, or official syllabus PDFs.
              The parser will extract units, topics, subtopics, and prerequisite dependencies into a draft representation for review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Course Title</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium">Syllabus Document Text / OCR Output</label>
              <button
                onClick={loadPresetMITTemplate}
                className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Insert MIT Syllabus Template
              </button>
            </div>
            <textarea
              rows={12}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw syllabus text here with UNIT headers and topics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Extraction produces draft status until verified and approved by authorized faculty.
            </span>
            <button
              onClick={handleIngest}
              disabled={isIngesting || !pastedText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isIngesting ? 'Ingesting & Analyzing...' : 'Ingest & Review Extracted Curriculum'}</span>
            </button>
          </div>

          {/* Ingestion results and warnings */}
          {ingestionResult && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Curriculum Successfully Extracted (Confidence: {(ingestionResult.confidenceScore * 100).toFixed(0)}%)</span>
                </span>
                <span className="text-slate-400 font-mono">
                  {ingestionResult.extractedCurriculum.units.length} Units Extracted
                </span>
              </div>

              {ingestionResult.warnings.length > 0 && (
                <div className="space-y-1 text-xs text-amber-300 bg-amber-950/40 p-3 rounded-lg border border-amber-800/80">
                  <strong className="block">Parsing Observations:</strong>
                  <ul className="list-disc list-inside space-y-0.5">
                    {ingestionResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-300">
                  Ready to learn: This curriculum is structured into units and topics.
                </p>
                <button
                  onClick={() => onStartTutoringWithCurriculum?.(ingestionResult.extractedCurriculum)}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Tutoring Process with this Syllabus</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Version History & Courses */}
      {activeTab === 'versions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-slate-100">Curriculum Repositories & Version Registry</h2>
          <p className="text-xs text-slate-400">
            Switch between approved department curricula and experimental or revision drafts without losing teaching state.
          </p>

          <div className="space-y-3 pt-2">
            {allCurricula.map((curr) => (
              <div
                key={curr.courseId}
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                  curr.courseId === currentCurriculum.courseId
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-200">
                      {curr.code}: {curr.title}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {curr.syllabusVersion}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        curr.approvalStatus === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {curr.approvalStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {curr.institution} • {curr.department} • {curr.units.length} Units
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {curr.courseId === currentCurriculum.courseId ? (
                    <span className="text-xs text-indigo-400 font-semibold px-3 py-1 bg-indigo-950 rounded border border-indigo-800">
                      Active Course
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectCourse(curr.courseId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Select Course
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
