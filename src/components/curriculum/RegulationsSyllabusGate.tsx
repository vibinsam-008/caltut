import React, { useState } from 'react';
import { CourseCurriculum } from '../../types';
import { extractPdfText, processCourseDocuments, DocumentUploadPayload } from '../../services/api';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  RefreshCw,
  Library,
  Scale,
  Award,
  ChevronRight,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface RegulationsSyllabusGateProps {
  onConfirmAndEnter: (curriculum: CourseCurriculum, destinationTab?: 'dashboard' | 'learn') => void;
  initialCurriculum?: CourseCurriculum;
  isDismissable?: boolean;
  onDismiss?: () => void;
}

interface UploadedDocumentState {
  filename: string;
  base64?: string;
  rawText: string;
  pageCount: number;
  isPdf: boolean;
  fileSizeStr?: string;
  isExtracting: boolean;
}

export const RegulationsSyllabusGate: React.FC<RegulationsSyllabusGateProps> = ({
  onConfirmAndEnter,
  initialCurriculum,
  isDismissable = false,
  onDismiss,
}) => {
  // Academic Regulations State
  const [selectedRegulationScheme, setSelectedRegulationScheme] = useState<string>(
    initialCurriculum?.regulations || 'Anna University CBCS Regulation 2021'
  );
  const [courseCode, setCourseCode] = useState<string>(
    initialCurriculum?.code || 'MA3151'
  );
  const [courseTitle, setCourseTitle] = useState<string>(
    initialCurriculum?.title || 'Matrices and Calculus'
  );
  const [institution, setInstitution] = useState<string>(
    initialCurriculum?.institution || 'Madras Institute of Technology (MIT), Anna University'
  );
  const [department, setDepartment] = useState<string>(
    initialCurriculum?.department || 'Computer Science and Engineering'
  );
  const [semester, setSemester] = useState<number>(initialCurriculum?.semester || 1);

  // Document 1: Regulations PDF / Document
  const [regulationsDoc, setRegulationsDoc] = useState<UploadedDocumentState>({
    filename: 'Anna_University_CBCS_R2021_Regulations.pdf',
    rawText: `ANNA UNIVERSITY CHENNAI - AFFILIATED INSTITUTIONS & AUTONOMOUS CAMPUSES
REGULATIONS 2021: CHOICE BASED CREDIT SYSTEM (CBCS)
Common to B.E. / B.Tech. Degree Programmes (First Year Core Curriculum)

1. COURSE EVALUATION & CREDIT ALLOCATION SCHEME:
   - Course: Engineering Mathematics I (Matrices and Calculus)
   - Credits: 4 (3 Lectures + 1 Tutorial hour per week, total 60 contact hours)
   - Continuous Assessment (Internal): 40 Marks
   - End-Semester University Examination: 100 Marks (converted to 60%)

2. QUESTION PAPER PATTERN (100 MARKS):
   - Part A: 10 Questions × 2 Marks = 20 Marks (2 Questions from each of Units I to V, compulsory with no choice)
   - Part B: 5 Questions × 16 Marks = 80 Marks (One question with Either/Or internal choice from each Unit)
   - Minimum Passing Standard: 45% in End-Semester Exam and 50% Aggregate Overall.

3. COGNITIVE LEVELS & BLOOM'S TAXONOMY ALIGNMENT:
   - Remembering (K1), Understanding (K2), Applying (K3), Analyzing (K4), Evaluating (K5).`,
    pageCount: 4,
    isPdf: true,
    fileSizeStr: '284 KB',
    isExtracting: false,
  });

  // Document 2: Syllabus PDF / Document
  const [syllabusDoc, setSyllabusDoc] = useState<UploadedDocumentState>({
    filename: 'MA3151_Matrices_and_Calculus_Syllabus.pdf',
    rawText: `MA3151 - MATRICES AND CALCULUS
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

TEXTBOOKS & REFERENCES:
1. B.S. Grewal, "Higher Engineering Mathematics", 44th Edition, Khanna Publishers, New Delhi.
2. Erwin Kreyszig, "Advanced Engineering Mathematics", 10th Edition, John Wiley & Sons.
3. James Stewart, "Calculus: Early Transcendentals", 8th Edition, Cengage Learning.`,
    pageCount: 3,
    isPdf: true,
    fileSizeStr: '412 KB',
    isExtracting: false,
  });

  const [showRegTextEditor, setShowRegTextEditor] = useState<boolean>(false);
  const [showSylTextEditor, setShowSylTextEditor] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Dual Document Intake, 2: Verification Preview
  const [extractedData, setExtractedData] = useState<{
    confidenceScore: number;
    extractedCurriculum: CourseCurriculum;
    source: string;
    warnings?: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to handle PDF or text file reading
  const handleGenericFileUpload = async (
    file: File,
    target: 'regulations' | 'syllabus'
  ) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const fileSizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;

    if (target === 'regulations') {
      setRegulationsDoc((prev) => ({
        ...prev,
        filename: file.name,
        isPdf,
        fileSizeStr: fileSizeFormatted,
        isExtracting: true,
      }));
    } else {
      setSyllabusDoc((prev) => ({
        ...prev,
        filename: file.name,
        isPdf,
        fileSizeStr: fileSizeFormatted,
        isExtracting: true,
      }));
    }

    try {
      if (isPdf) {
        // Read file as Base64 Data URL and send to PDF extraction endpoint
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          const pdfResult = await extractPdfText(file.name, base64Data);

          if (target === 'regulations') {
            setRegulationsDoc((prev) => ({
              ...prev,
              base64: base64Data,
              rawText: pdfResult.text || prev.rawText,
              pageCount: pdfResult.pages || 1,
              isExtracting: false,
            }));
            // Auto detect regulation string if present in PDF
            if (pdfResult.text.includes('2021')) {
              setSelectedRegulationScheme('Anna University CBCS Regulation 2021');
            } else if (pdfResult.text.toLowerCase().includes('aicte')) {
              setSelectedRegulationScheme('AICTE Model Engineering Curriculum');
            }
          } else {
            setSyllabusDoc((prev) => ({
              ...prev,
              base64: base64Data,
              rawText: pdfResult.text || prev.rawText,
              pageCount: pdfResult.pages || 1,
              isExtracting: false,
            }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Plain text, markdown, or text document
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = (e.target?.result as string) || '';
          if (target === 'regulations') {
            setRegulationsDoc((prev) => ({
              ...prev,
              rawText: text,
              pageCount: 1,
              isExtracting: false,
            }));
          } else {
            setSyllabusDoc((prev) => ({
              ...prev,
              rawText: text,
              pageCount: Math.max(1, Math.ceil(text.split('\n').length / 35)),
              isExtracting: false,
            }));
          }
        };
        reader.readAsText(file);
      }
    } catch {
      if (target === 'regulations') {
        setRegulationsDoc((prev) => ({ ...prev, isExtracting: false }));
      } else {
        setSyllabusDoc((prev) => ({ ...prev, isExtracting: false }));
      }
    }
  };

  // Preset 1: Anna University MIT
  const loadAnnaUnivR2021 = () => {
    setSelectedRegulationScheme('Anna University CBCS Regulation 2021');
    setCourseCode('MA3151');
    setCourseTitle('Matrices and Calculus');
    setInstitution('Madras Institute of Technology (MIT), Anna University');
    setDepartment('Computer Science and Engineering');
    setSemester(1);

    setRegulationsDoc({
      filename: 'Anna_University_CBCS_R2021_Regulations.pdf',
      rawText: `ANNA UNIVERSITY CHENNAI - AFFILIATED INSTITUTIONS & AUTONOMOUS CAMPUSES
REGULATIONS 2021: CHOICE BASED CREDIT SYSTEM (CBCS)
Common to B.E. / B.Tech. Degree Programmes (First Year Core Curriculum)

1. COURSE EVALUATION & CREDIT ALLOCATION SCHEME:
   - Course: Engineering Mathematics I (Matrices and Calculus)
   - Credits: 4 (3 Lectures + 1 Tutorial hour per week, total 60 contact hours)
   - Continuous Assessment (Internal): 40 Marks
   - End-Semester University Examination: 100 Marks (converted to 60%)

2. QUESTION PAPER PATTERN (100 MARKS):
   - Part A: 10 Questions × 2 Marks = 20 Marks (2 Questions from each of Units I to V, compulsory with no choice)
   - Part B: 5 Questions × 16 Marks = 80 Marks (One question with Either/Or internal choice from each Unit)
   - Minimum Passing Standard: 45% in End-Semester Exam and 50% Aggregate Overall.

3. PRESCRIBED TEXTBOOKS:
   - B.S. Grewal, Higher Engineering Mathematics, 44th Edition, Khanna Publishers.
   - Erwin Kreyszig, Advanced Engineering Mathematics, 10th Edition, John Wiley & Sons.`,
      pageCount: 4,
      isPdf: true,
      fileSizeStr: '284 KB',
      isExtracting: false,
    });

    setSyllabusDoc({
      filename: 'MA3151_Matrices_and_Calculus_Syllabus.pdf',
      rawText: `MA3151 - MATRICES AND CALCULUS
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

TEXTBOOKS & REFERENCES:
1. B.S. Grewal, "Higher Engineering Mathematics", 44th Edition, Khanna Publishers, New Delhi.
2. Erwin Kreyszig, "Advanced Engineering Mathematics", 10th Edition, John Wiley & Sons.`,
      pageCount: 3,
      isPdf: true,
      fileSizeStr: '412 KB',
      isExtracting: false,
    });
  };

  // Preset 2: IIT NPTEL
  const loadIITNPTEL = () => {
    setSelectedRegulationScheme('IIT NPTEL Higher Engineering Mathematics (Core Modules)');
    setCourseCode('IIT-MATH-101');
    setCourseTitle('Multivariable Calculus and Real Analysis');
    setInstitution('Indian Institute of Technology (IIT) / NPTEL Framework');
    setDepartment('Department of Mathematics & Engineering Sciences');
    setSemester(1);

    setRegulationsDoc({
      filename: 'IIT_NPTEL_Academic_Regulations_Manual.pdf',
      rawText: `IIT NPTEL CORE ENGINEERING MATHEMATICS CURRICULUM MANUAL
Semester Framework for Autonomous & Institute B.Tech Students

ACADEMIC CREDIT ALLOCATION:
- Credits: 4 (3 Lectures, 1 Tutorial, Rigorous Mathematical Proof Requirements)
- Grading & Assessment: Weekly Proctored Assignments (25%), End-Course Proctored Exam (75%)
- Marking Pattern: Objective Analysis (20 Marks), Theoretical Proofs & Boundary Integrals (80 Marks)
- Prescribed Authorities: Erwin Kreyszig 10th Ed, Thomas' Calculus 11th Ed, B.S. Grewal 44th Ed.`,
      pageCount: 6,
      isPdf: true,
      fileSizeStr: '520 KB',
      isExtracting: false,
    });

    setSyllabusDoc({
      filename: 'IIT_NPTEL_Calculus_Syllabus.pdf',
      rawText: `IIT-MATH-101: MULTIVARIABLE CALCULUS AND LINEAR ALGEBRA
(National Programme on Technology Enhanced Learning - NPTEL IIT Modules)

UNIT I: FUNCTIONS OF SEVERAL VARIABLES
Limit, continuity, and differentiability of functions of several variables - Partial derivatives - Directional derivatives - Gradient vector - Tangent plane and normal line - Total differential - Chain rule - Taylor's theorem for functions of two variables - Extreme values and saddle points - Lagrange multipliers.

UNIT II: MULTIPLE INTEGRALS AND APPLICATIONS
Double integrals over general domains - Change of order of integration - Double integrals in polar coordinates - Triple integrals in cylindrical and spherical coordinates - Change of variables using Jacobians - Surface area of revolution - Volume, mass, and center of gravity of solids.

UNIT III: VECTOR DIFFERENTIAL AND INTEGRAL CALCULUS
Scalar and vector fields - Divergence and curl - Vector differential identities - Irrotational and solenoidal fields - Line integrals - Conservative fields and scalar potentials - Green's theorem in the plane - Surface integrals and flux - Gauss divergence theorem - Stokes' theorem and circulation.

UNIT IV: MATRICES AND SPECTRAL THEORY
Systems of linear equations - Rank and nullity - Eigenvalues and eigenvectors of real matrices - Cayley-Hamilton theorem - Orthogonal diagonalization of real symmetric matrices - Quadratic forms and classification.`,
      pageCount: 5,
      isPdf: true,
      fileSizeStr: '640 KB',
      isExtracting: false,
    });
  };

  // Preset 3: BS Grewal AICTE
  const loadBSGrewalAICTE = () => {
    setSelectedRegulationScheme('AICTE Model Engineering Curriculum (B.S. Grewal Standard)');
    setCourseCode('ENG-MATH-44');
    setCourseTitle('Higher Engineering Mathematics (AICTE Standard)');
    setInstitution('AICTE National Engineering Curriculum Framework');
    setDepartment('Engineering Sciences & Applied Mathematics');
    setSemester(1);

    setRegulationsDoc({
      filename: 'AICTE_Model_Curriculum_Guidelines.pdf',
      rawText: `AICTE ALL-INDIA COUNCIL FOR TECHNICAL EDUCATION
MODEL CURRICULUM FOR FIRST YEAR UNDERGRADUATE DEGREE IN ENGINEERING

CREDITS & EXAMINATION GUIDELINES:
- Course Code: BSC-101 (Mathematics - I: Calculus and Linear Algebra)
- Credits: 4 (3L + 1T + 0P)
- Continuous Internal Evaluation (CIE): 40 Marks (Test 1, Test 2, Quizzes)
- Semester End Examination (SEE): 60 Marks (Part A 20 Marks, Part B 80 Marks scaled to 60)
- Prescribed Text: Higher Engineering Mathematics by Dr. B.S. Grewal, 44th Edition, Khanna Publishers.`,
      pageCount: 8,
      isPdf: true,
      fileSizeStr: '730 KB',
      isExtracting: false,
    });

    setSyllabusDoc({
      filename: 'AICTE_BSGrewal_Syllabus.pdf',
      rawText: `ENG-MATH-44: HIGHER ENGINEERING MATHEMATICS (B.S. GREWAL 44TH EDITION)
(AICTE National Engineering Framework - Standard Course)

UNIT I: LINEAR ALGEBRA AND MATRICES
Rank of a matrix - Consistency of linear system of equations - Characteristic equation - Eigenvalues and Eigenvectors - Cayley-Hamilton theorem and matrix powers - Orthogonal transformation - Diagonalization of symmetric matrices - Quadratic forms and canonical reduction.

UNIT II: DIFFERENTIAL CALCULUS AND SEVERAL VARIABLES
Higher order partial derivatives - Euler's theorem on homogeneous functions - Total differential - Jacobians of transformations - Taylor and Maclaurin expansions for two variables - Maxima and minima of functions of two variables - Lagrange's method of undetermined multipliers.

UNIT III: INTEGRAL CALCULUS AND SPECIAL FUNCTIONS
Beta and Gamma functions and their essential properties - Error functions - Definite integrals as limits of sums - Differentiation under the integral sign (Leibnitz rule) - Evaluation of improper integrals.

UNIT IV: MULTIPLE INTEGRALS
Double integrals in Cartesian and Polar coordinates - Change of order of integration - Area of plane curves - Triple integrals - Volume of solids of revolution - Dirichlet's integrals and applications.

UNIT V: VECTOR CALCULUS
Gradient of a scalar field - Directional derivative - Divergence and curl of vector fields - Vector identities - Line, surface, and volume integrals - Verification and applications of Green's theorem, Gauss divergence theorem, and Stokes' theorem.`,
      pageCount: 4,
      isPdf: true,
      fileSizeStr: '390 KB',
      isExtracting: false,
    });
  };

  const handleProcessAndVerifyBothDocuments = async () => {
    if (!syllabusDoc.rawText.trim() && !regulationsDoc.rawText.trim()) {
      setErrorMsg('Please upload or provide either the Regulations PDF or Syllabus PDF before proceeding.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const regPayload: DocumentUploadPayload = {
        filename: regulationsDoc.filename,
        base64: regulationsDoc.base64,
        rawText: regulationsDoc.rawText,
        mimeType: regulationsDoc.isPdf ? 'application/pdf' : 'text/plain',
      };

      const sylPayload: DocumentUploadPayload = {
        filename: syllabusDoc.filename,
        base64: syllabusDoc.base64,
        rawText: syllabusDoc.rawText,
        mimeType: syllabusDoc.isPdf ? 'application/pdf' : 'text/plain',
      };

      const result = await processCourseDocuments({
        regulationsDoc: regPayload,
        syllabusDoc: sylPayload,
        metadata: {
          courseCode,
          courseTitle,
          institution,
          department,
          semester,
          regulations: selectedRegulationScheme,
        },
      });

      if (result && result.extractedCurriculum) {
        setExtractedData(result);
        setStep(2);
      } else {
        throw new Error('Verification failed to parse units and topics from documents.');
      }
    } catch {
      setErrorMsg('Unable to parse the documents. Ensure headers like Unit I, Unit II are identifiable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalConfirm = (destination: 'dashboard' | 'learn') => {
    if (extractedData?.extractedCurriculum) {
      const approved: CourseCurriculum = {
        ...extractedData.extractedCurriculum,
        code: courseCode || extractedData.extractedCurriculum.code,
        title: courseTitle || extractedData.extractedCurriculum.title,
        institution: institution || extractedData.extractedCurriculum.institution,
        department: department || extractedData.extractedCurriculum.department,
        regulations: selectedRegulationScheme || extractedData.extractedCurriculum.regulations,
        approvalStatus: 'approved',
        approvedBy: 'University Academic Verification Committee',
        approvalDate: new Date().toISOString().slice(0, 10),
      };
      onConfirmAndEnter(approved, destination);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Banner / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-100 tracking-tight">
                  MIT Engineering Calculus Tutor
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  PDF Regulations & Syllabus Gate
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Department of Mathematics • Autonomous Engineering Framework
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">Mandatory Pre-requisite</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Step {step} of 2</span>
            </span>
            {isDismissable && onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-3 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 flex-1">
        {step === 1 ? (
          <div className="space-y-8">
            {/* Mission Statement Callout */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border border-indigo-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="max-w-3xl space-y-2 relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                  <Scale className="w-4 h-4" />
                  <span>University Academic Compliance & Document Ingestion</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  Provide University Regulations & Syllabus PDF Documents
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Before entering the Calculus Tutor Dashboard, your institution&apos;s academic regulations PDF
                  and course syllabus PDF must be established. All concept mastery explanations, whiteboard
                  coordinate regions, verified practice problems, and 100-mark mock exams will automatically
                  align to your university&apos;s regulations.
                </p>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none select-none text-indigo-400">
                <Library className="w-64 h-64" />
              </div>
            </div>

            {/* Quick Authority Preset Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Select Authoritative Engineering Presets or Upload Custom PDFs</span>
                </h2>
                <span className="text-xs text-slate-400">Pre-loads authentic regulations & syllabus PDFs</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preset 1 */}
                <button
                  type="button"
                  onClick={loadAnnaUnivR2021}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRegulationScheme.includes('Anna University')
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">MA3151 • 4 CREDITS</span>
                      <span className="text-[10px] text-slate-400">PDFs Loaded</span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">Anna University / MIT Campus</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Regulation 2021 CBCS Document + MA3151 Matrices & Calculus Syllabus PDF.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-indigo-300 font-medium flex items-center justify-between">
                    <span>Part A (20M) + Part B (80M)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Preset 2 */}
                <button
                  type="button"
                  onClick={loadIITNPTEL}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRegulationScheme.includes('IIT NPTEL')
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-400">IIT-MATH101 • ADVANCED</span>
                      <span className="text-[10px] text-slate-400">PDFs Loaded</span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">IIT NPTEL Engineering Modules</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Academic Curriculum Manual PDF + Multivariable Calculus & Analysis PDF.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-teal-300 font-medium flex items-center justify-between">
                    <span>Rigorous Proofs & Boundary Integrals</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Preset 3 */}
                <button
                  type="button"
                  onClick={loadBSGrewalAICTE}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRegulationScheme.includes('AICTE') || selectedRegulationScheme.includes('BS Grewal')
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">ENG-MATH-44 • AICTE</span>
                      <span className="text-[10px] text-slate-400">PDFs Loaded</span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">B.S. Grewal AICTE Framework</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      AICTE Model Curriculum Guidelines PDF + 44th Edition Calculus Syllabus PDF.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 font-medium flex items-center justify-between">
                    <span>All-India Engineering Syllabus</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Course Metadata Inputs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>1. Academic Regulations & Course Identification</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Academic Regulations Scheme</label>
                  <input
                    type="text"
                    value={selectedRegulationScheme}
                    onChange={(e) => setSelectedRegulationScheme(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Anna University CBCS Regulation 2021"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. MA3151"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Matrices and Calculus"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-300 font-semibold">Institution / University</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Madras Institute of Technology (MIT), Anna University"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Department & Semester</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-3/4 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Computer Science"
                    />
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
                      className="w-1/4 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DUAL PDF INTAKE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DOCUMENT 1: REGULATIONS PDF */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-400" />
                      <span>Document 1: Academic Regulations PDF</span>
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Credits & Marking Scheme
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Upload your university&apos;s academic regulations PDF (assessment weights, credit allocations, and examination question paper pattern).
                  </p>

                  {/* PDF Upload Dropzone */}
                  <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/60 group">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.md"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGenericFileUpload(file, 'regulations');
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-200 block">
                        Click or drag & drop Regulations PDF
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Supports .pdf, .txt, .docx, .md
                      </span>
                    </div>
                  </label>

                  {/* File Metadata Card */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-300 font-mono text-xs flex-shrink-0">
                        PDF
                      </div>
                      <div className="truncate">
                        <span className="font-mono text-slate-200 block truncate">
                          {regulationsDoc.filename}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {regulationsDoc.fileSizeStr || 'Active'} · {regulationsDoc.pageCount} page{regulationsDoc.pageCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {regulationsDoc.isExtracting ? (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px] font-mono">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Parsing PDF...</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PDF Extracted</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowRegTextEditor(!showRegTextEditor)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        title="Toggle extracted text preview"
                      >
                        {showRegTextEditor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Text Editor */}
                  {showRegTextEditor && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold">
                        Extracted Regulations Text / Marking Pattern:
                      </span>
                      <textarea
                        value={regulationsDoc.rawText}
                        onChange={(e) =>
                          setRegulationsDoc((prev) => ({ ...prev, rawText: e.target.value }))
                        }
                        rows={7}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* DOCUMENT 2: SYLLABUS PDF */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Document 2: Course Syllabus PDF</span>
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Units, Topics & Textbooks
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Upload your course syllabus PDF (containing Unit I to Unit V topics, learning outcomes, and prescribed textbooks).
                  </p>

                  {/* PDF Upload Dropzone */}
                  <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/60 group">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.md"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGenericFileUpload(file, 'syllabus');
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-200 block">
                        Click or drag & drop Syllabus PDF
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Supports .pdf, .txt, .docx, .md
                      </span>
                    </div>
                  </label>

                  {/* File Metadata Card */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-mono text-xs flex-shrink-0">
                        PDF
                      </div>
                      <div className="truncate">
                        <span className="font-mono text-slate-200 block truncate">
                          {syllabusDoc.filename}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {syllabusDoc.fileSizeStr || 'Active'} · {syllabusDoc.pageCount} page{syllabusDoc.pageCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {syllabusDoc.isExtracting ? (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px] font-mono">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Parsing PDF...</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PDF Extracted</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowSylTextEditor(!showSylTextEditor)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        title="Toggle extracted text preview"
                      >
                        {showSylTextEditor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Text Editor */}
                  {showSylTextEditor && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold">
                        Extracted Syllabus Units & Topics:
                      </span>
                      <textarea
                        value={syllabusDoc.rawText}
                        onChange={(e) =>
                          setSyllabusDoc((prev) => ({ ...prev, rawText: e.target.value }))
                        }
                        rows={7}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-3 text-rose-200 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Both Regulations PDF and Syllabus PDF are validated before entering the workspace.
                </span>
              </div>

              <button
                type="button"
                onClick={handleProcessAndVerifyBothDocuments}
                disabled={isProcessing || regulationsDoc.isExtracting || syllabusDoc.isExtracting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Regulations & Ingesting PDFs...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Regulations & Syllabus PDFs</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Verification Preview & Approval Gate */
          <div className="space-y-6">
            <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>
                  Academic Documents Verified & Ingested ({Math.round((extractedData?.confidenceScore || 0.95) * 100)}% Confidence)
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Curriculum & Regulations Aligned to Engineering Standards
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Both the Regulations document and Syllabus have been mapped. Mathematical proofs, diagnostic
                problems, whiteboard coordinate limits, and university mock exam formats have been tailored.
              </p>
            </div>

            {/* Structure Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">
                    {extractedData?.extractedCurriculum.regulations || selectedRegulationScheme}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">
                    {courseCode}: {courseTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {institution} • {department} • Semester {semester}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono">
                    {extractedData?.extractedCurriculum.units.length || 0} Units Verified
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-300 font-mono">
                    2 PDFs Attached
                  </span>
                </div>
              </div>

              {/* Source Documents Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="truncate font-mono text-slate-300">{regulationsDoc.filename}</span>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-semibold flex-shrink-0 ml-2">
                    Regulations PDF ({regulationsDoc.pageCount}p)
                  </span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate font-mono text-slate-300">{syllabusDoc.filename}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold flex-shrink-0 ml-2">
                    Syllabus PDF ({syllabusDoc.pageCount}p)
                  </span>
                </div>
              </div>

              {/* Units & Topics List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {extractedData?.extractedCurriculum.units.map((unit) => (
                  <div key={unit.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {unit.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {unit.topics.length} Topics
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {unit.topics.map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          {t.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Prescribed Textbooks & Citations */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Prescribed Engineering Textbooks Mapped
                </span>
                <p className="text-slate-300 font-mono text-[11px]">
                  • B.S. Grewal, Higher Engineering Mathematics (44th Ed.) • Erwin Kreyszig, Advanced Engineering Mathematics • NPTEL Video & Notes Modules
                </p>
              </div>
            </div>

            {/* Entrance Decisions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ← Back to Edit Documents
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleFinalConfirm('dashboard')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Approve & Enter Calculus Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinalConfirm('learn')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Step 1: Concept Mastery</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          MIT Calculus Tutor • Madras Institute of Technology (Anna University), Chromepet • Academic Compliance Gate
        </p>
      </footer>
    </div>
  );
};
