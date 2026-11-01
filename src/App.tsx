import React, { useState, useEffect } from 'react';
import { CourseCurriculum, CalculusProblem, LearnerState } from './types';
import { OFFICIAL_MIT_CALCULUS_CURRICULUM } from './curriculum/mit-syllabus';
import { curriculumManager } from './curriculum/curriculum-manager';
import { teachingEngine } from './learner/learner-model';
import { VERIFIED_STANDARD_PROBLEMS } from './problem-bank/standard-problems';
import { Navigation, ActiveNavTab } from './components/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { TutorWorkspace } from './components/tutor/TutorWorkspace';
import { ProblemGeneratorView } from './components/problems/ProblemGeneratorView';
import { GuidedSolutionView } from './components/guided/GuidedSolutionView';
import { Whiteboard } from './components/whiteboard/Whiteboard';
import { SyllabusManagerView } from './components/curriculum/SyllabusManagerView';
import { SolvedExamplesView } from './components/examples/SolvedExamplesView';
import { MockTestView } from './components/exam/MockTestView';
import { ProgressDashboard } from './components/progress/ProgressDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { SyllabusIntakeModal } from './components/curriculum/SyllabusIntakeModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState<boolean>(false);
  const [curriculum, setCurriculum] = useState<CourseCurriculum>(
    curriculumManager.getActiveCurriculum()
  );
  const [allCurricula, setAllCurricula] = useState<CourseCurriculum[]>(
    curriculumManager.getAllCurricula()
  );
  const [learnerState, setLearnerState] = useState<LearnerState>(
    teachingEngine.getState()
  );
  const [activeProblem, setActiveProblem] = useState<CalculusProblem>(
    VERIFIED_STANDARD_PROBLEMS[0]
  );
  const [activeUnitId, setActiveUnitId] = useState<string>(
    curriculum.units[0]?.id || ''
  );
  const [activeTopicId, setActiveTopicId] = useState<string>(
    curriculum.units[0]?.topics[0]?.id || ''
  );

  // Sync state from engines
  useEffect(() => {
    const activeCurr = curriculumManager.getActiveCurriculum();
    setCurriculum(activeCurr);
    setAllCurricula(curriculumManager.getAllCurricula());
    setLearnerState(teachingEngine.getState());

    if (activeCurr.units[0]) {
      setActiveUnitId(activeCurr.units[0].id);
      if (activeCurr.units[0].topics[0]) {
        setActiveTopicId(activeCurr.units[0].topics[0].id);
      }
    }
  }, []);

  const handleCurriculumUpdated = (newCurr: CourseCurriculum) => {
    curriculumManager.registerCurriculum(newCurr);
    curriculumManager.setActiveCurriculum(newCurr.courseId);
    setCurriculum(newCurr);
    setAllCurricula(curriculumManager.getAllCurricula());

    const firstUnit = newCurr.units[0];
    const firstTopic = firstUnit?.topics[0];
    if (firstUnit && firstTopic) {
      setActiveUnitId(firstUnit.id);
      setActiveTopicId(firstTopic.id);
    }
  };

  const handleSyllabusProcessedAndStartTutoring = (newCurr: CourseCurriculum) => {
    curriculumManager.registerCurriculum(newCurr);
    curriculumManager.setActiveCurriculum(newCurr.courseId);
    setCurriculum(newCurr);
    setAllCurricula(curriculumManager.getAllCurricula());

    // Initialize tutor around the first unit & topic of the user's syllabus
    const firstUnit = newCurr.units[0];
    const firstTopic = firstUnit?.topics[0];
    const firstObj = firstTopic?.learningObjectives[0];

    if (firstUnit && firstTopic) {
      setActiveUnitId(firstUnit.id);
      setActiveTopicId(firstTopic.id);
      if (firstObj) {
        teachingEngine.setTopic(firstUnit.id, firstTopic.id, firstObj.id);
        setLearnerState(teachingEngine.getState());
      }
    }

    // Immediately launch the personalized tutoring process
    setActiveTab('learn');
  };

  const handleSelectLesson = (unitId: string, topicId: string) => {
    setActiveUnitId(unitId);
    setActiveTopicId(topicId);

    const unit = curriculum.units.find((u) => u.id === unitId);
    const topic = unit?.topics.find((t) => t.id === topicId);
    const obj = topic?.learningObjectives[0];

    if (unit && topic && obj) {
      teachingEngine.setTopic(unit.id, topic.id, obj.id);
      setLearnerState(teachingEngine.getState());
    }
  };

  const handleRecordProblemResult = (
    problemId: string,
    objectiveId: string,
    isCorrect: boolean,
    hintsUsed: number
  ) => {
    teachingEngine.recordProblemResult(problemId, objectiveId, isCorrect, hintsUsed);
    setLearnerState(teachingEngine.getState());
  };

  const handleLaunchGuidedProblem = (problem: CalculusProblem) => {
    setActiveProblem(problem);
    setActiveTab('guided');
  };

  const handleResetLearnerState = () => {
    localStorage.removeItem('mit_learner_state');
    const freshEngine = new (teachingEngine.constructor as any)('mit_ma3151_calculus_2021');
    setLearnerState(freshEngine.getState());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Main Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCurriculum={curriculum}
        onOpenSyllabusIntake={() => setIsSyllabusModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            curriculum={curriculum}
            learnerState={learnerState}
            activeUnitId={activeUnitId}
            activeTopicId={activeTopicId}
            onNavigate={setActiveTab}
            onSelectProblem={(id) => {
              const p = VERIFIED_STANDARD_PROBLEMS.find((prob) => prob.id === id);
              if (p) setActiveProblem(p);
            }}
            onSelectLesson={handleSelectLesson}
            onOpenSyllabusIntake={() => setIsSyllabusModalOpen(true)}
          />
        )}

        {activeTab === 'learn' && (
          <TutorWorkspace
            curriculum={curriculum}
            initialUnitId={activeUnitId}
            initialTopicId={activeTopicId}
            onNavigateToGuidedProblem={(topicId) => {
              const matched =
                VERIFIED_STANDARD_PROBLEMS.find((p) => p.topicId === topicId) ||
                VERIFIED_STANDARD_PROBLEMS[0];
              setActiveProblem(matched);
              setActiveTab('guided');
            }}
            onRecordResult={handleRecordProblemResult}
          />
        )}

        {activeTab === 'examples' && (
          <SolvedExamplesView
            curriculum={curriculum}
            onLaunchPracticeProblem={handleLaunchGuidedProblem}
            onNavigateToConcept={(unitId, topicId) => {
              handleSelectLesson(unitId, topicId);
              setActiveTab('learn');
            }}
          />
        )}

        {activeTab === 'generate' && (
          <ProblemGeneratorView
            curriculum={curriculum}
            onLaunchGuidedProblem={handleLaunchGuidedProblem}
          />
        )}

        {activeTab === 'guided' && (
          <GuidedSolutionView
            problem={activeProblem}
            onSelectSimilarProblem={(topicId) => {
              const next = VERIFIED_STANDARD_PROBLEMS.find(
                (p) => p.topicId === topicId && p.id !== activeProblem.id
              ) || VERIFIED_STANDARD_PROBLEMS[0];
              setActiveProblem(next);
            }}
            onRecordResult={handleRecordProblemResult}
          />
        )}

        {activeTab === 'exam' && (
          <MockTestView curriculum={curriculum} />
        )}

        {activeTab === 'whiteboard' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-semibold">
                Mode D: Standalone Whiteboard
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-2">
                Interactive Multiple-Integral Region & Boundary Visualizer
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore vertical strips (dy dx) and horizontal strips (dx dy) with real-time coordinate inspection.
              </p>
            </div>
            <Whiteboard spec={activeProblem.whiteboardSpec} />
          </div>
        )}

        {activeTab === 'syllabus' && (
          <SyllabusManagerView
            currentCurriculum={curriculum}
            allCurricula={allCurricula}
            onCurriculumUpdated={handleCurriculumUpdated}
            onStartTutoringWithCurriculum={handleSyllabusProcessedAndStartTutoring}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            curriculum={curriculum}
            learnerState={learnerState}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            curriculum={curriculum}
            learnerState={learnerState}
            onResetLearnerState={handleResetLearnerState}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          MIT Calculus Tutor • Madras Institute of Technology (Anna University), Chromepet • Department of Mathematics
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Regulation 2021 MA3151: Matrices and Calculus • Verified Symbolic & Quadrature Math Engine
        </p>
      </footer>

      {/* Syllabus Ingestion & Tutoring Launch Modal */}
      <SyllabusIntakeModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onSyllabusProcessedAndStartTutoring={handleSyllabusProcessedAndStartTutoring}
      />
    </div>
  );
}
