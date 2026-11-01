import React, { useState, useEffect } from 'react';
import {
  Unit,
  Topic,
  LearningObjective,
  CourseCurriculum,
  TutorMessage,
  WhiteboardVisualSpec,
  TeachingAction,
} from '../../types';
import { requestTutorTurn } from '../../services/api';
import { generateTopicPedagogy } from '../../curriculum/topic-pedagogy';
import { MathView } from '../MathView';
import { Whiteboard } from '../whiteboard/Whiteboard';
import { LiveVoiceController } from '../voice/LiveVoiceController';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Send,
  Sparkles,
  Lightbulb,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  GraduationCap,
} from 'lucide-react';

interface TutorWorkspaceProps {
  curriculum: CourseCurriculum;
  initialUnitId?: string;
  initialTopicId?: string;
  onNavigateToGuidedProblem?: (topicId: string) => void;
  onRecordResult?: (problemId: string, objectiveId: string, isCorrect: boolean, hintsUsed: number) => void;
}

export const TutorWorkspace: React.FC<TutorWorkspaceProps> = ({
  curriculum,
  initialUnitId,
  initialTopicId,
  onNavigateToGuidedProblem,
  onRecordResult,
}) => {
  // Determine initial unit and topic
  const initialUnit =
    (initialUnitId && curriculum.units.find((u) => u.id === initialUnitId)) ||
    curriculum.units[0];
  const initialTopic =
    (initialTopicId && initialUnit?.topics.find((t) => t.id === initialTopicId)) ||
    initialUnit?.topics[0];
  const initialObj = initialTopic?.learningObjectives[0];

  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnit?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic?.id || '');
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(initialObj?.id || '');

  const activeUnit = curriculum.units.find((u) => u.id === selectedUnitId) || curriculum.units[0];
  const activeTopic = activeUnit?.topics.find((t) => t.id === selectedTopicId) || activeUnit?.topics[0];
  const activeObjective =
    activeTopic?.learningObjectives.find((o) => o.id === selectedObjectiveId) ||
    activeTopic?.learningObjectives[0];

  const initialPedagogy = generateTopicPedagogy(activeTopic, activeUnit);

  const [studentInput, setStudentInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showVoicePanel, setShowVoicePanel] = useState<boolean>(false);

  // Synchronized Whiteboard Spec
  const [currentWhiteboardSpec, setCurrentWhiteboardSpec] = useState<WhiteboardVisualSpec>(
    initialPedagogy.whiteboardSpec
  );

  // Conversation history
  const [messages, setMessages] = useState<TutorMessage[]>([
    initialPedagogy.initialMessage,
  ]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<string | null>(null);

  // Sync state whenever curriculum or initial lesson props change
  useEffect(() => {
    const targetUnit =
      (initialUnitId && curriculum.units.find((u) => u.id === initialUnitId)) ||
      curriculum.units.find((u) => u.id === selectedUnitId) ||
      curriculum.units[0];

    const targetTopic =
      (initialTopicId && targetUnit?.topics.find((t) => t.id === initialTopicId)) ||
      targetUnit?.topics.find((t) => t.id === selectedTopicId) ||
      targetUnit?.topics[0];

    const targetObj = targetTopic?.learningObjectives[0];

    if (targetUnit) setSelectedUnitId(targetUnit.id);
    if (targetTopic) setSelectedTopicId(targetTopic.id);
    if (targetObj) setSelectedObjectiveId(targetObj.id);

    if (targetTopic && targetUnit) {
      const pedagogy = generateTopicPedagogy(targetTopic, targetUnit);
      setMessages([pedagogy.initialMessage]);
      setCurrentWhiteboardSpec(pedagogy.whiteboardSpec);
      setSelectedOption(null);
      setDiagnosticFeedback(null);
    }
  }, [curriculum.courseId, initialUnitId, initialTopicId]);

  // Handler for clicking a topic in the hierarchy
  const handleSelectTopic = (topic: Topic, unit: Unit) => {
    setSelectedUnitId(unit.id);
    setSelectedTopicId(topic.id);
    const obj = topic.learningObjectives[0];
    if (obj) setSelectedObjectiveId(obj.id);

    const pedagogy = generateTopicPedagogy(topic, unit);
    setMessages([pedagogy.initialMessage]);
    setCurrentWhiteboardSpec(pedagogy.whiteboardSpec);
    setSelectedOption(null);
    setDiagnosticFeedback(null);
  };

  // Send student prompt to tutor
  const handleSendMessage = async (customMessage?: string, action: TeachingAction = 'explain_concept') => {
    const textToSend = customMessage || studentInput;
    if (!textToSend.trim() && !customMessage) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setStudentInput('');
    setIsProcessing(true);

    try {
      const response = await requestTutorTurn({
        topicTitle: activeTopic?.title || 'Multiple Integrals',
        objectiveTitle: activeObjective?.title || 'Reversing Order of Integration',
        action,
        studentMessage: textToSend,
      });

      const tutorReply: TutorMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.explanation,
        actionTaken: response.teachingAction || action,
        diagnosticQuestion: response.nextQuestion
          ? {
              question: response.nextQuestion,
              options: [
                'Express the boundaries as functions x = h(y)',
                'Simply swap the numerical limits from outer to inner',
                'Differentiate the integrand with respect to both variables',
                'Integrate over the entire xy-plane',
              ],
              correctIndex: 0,
              explanation: 'Exact! To set up horizontal strips dx dy, we must express x as a function of y.',
            }
          : undefined,
      };

      setMessages((prev) => [...prev, tutorReply]);
      setSelectedOption(null);
      setDiagnosticFeedback(null);
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-err-${Date.now()}`,
          sender: 'tutor',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Let's break down this transformation: when we observe the whiteboard, the region is bounded between $y = x^2$ and $y = 2x$. Inverting these equations yields $x = \\sqrt{y}$ and $x = y/2$.`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectOption = (idx: number, correctIdx: number, explanation: string) => {
    setSelectedOption(idx);
    if (idx === correctIdx) {
      setDiagnosticFeedback(`✓ ${explanation}`);
    } else {
      setDiagnosticFeedback('Not quite. Review the boundary curves plotted on the whiteboard.');
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      {/* Voice Toggle Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Mode A: Concept Mastery Workspace</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {curriculum.code} • {activeTopic?.title}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Prerequisite diagnosis, intuitive mathematical explanations, and synchronized geometric visualization.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowVoicePanel(!showVoicePanel)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            showVoicePanel
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{showVoicePanel ? 'Hide Voice Tutor' : 'Enable Voice Tutor'}</span>
        </button>
      </div>

      {/* Voice Tutor Panel if toggled */}
      {showVoicePanel && (
        <LiveVoiceController
          currentTopic={activeTopic?.title || 'Calculus'}
          onStudentSpeech={(speech) => handleSendMessage(speech, 'explain_concept')}
          lastTutorExplanation={messages[messages.length - 1]?.text}
        />
      )}

      {/* 3-Panel Flexible Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Syllabus & Objectives (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4 max-h-[750px] overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Curriculum Hierarchy</span>
          </div>

          <div className="space-y-3">
            {curriculum.units.map((unit) => (
              <div key={unit.id} className="space-y-1">
                <button
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedUnitId === unit.id
                      ? 'bg-slate-800 text-indigo-300'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{unit.title}</span>
                  {selectedUnitId === unit.id ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>

                {selectedUnitId === unit.id && (
                  <div className="pl-2 space-y-1 border-l-2 border-slate-800 ml-2">
                    {unit.topics.map((topic) => (
                      <div key={topic.id} className="space-y-0.5">
                        <button
                          onClick={() => handleSelectTopic(topic, unit)}
                          className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                            selectedTopicId === topic.id
                              ? 'bg-indigo-950/80 text-indigo-200 font-medium border border-indigo-800'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="truncate">{topic.title}</div>
                        </button>

                        {selectedTopicId === topic.id && (
                          <div className="pl-3 py-1 space-y-1">
                            {topic.learningObjectives.map((obj) => (
                              <button
                                key={obj.id}
                                onClick={() => setSelectedObjectiveId(obj.id)}
                                className={`w-full text-left text-[11px] px-1.5 py-0.5 rounded transition-colors flex items-center justify-between ${
                                  selectedObjectiveId === obj.id
                                    ? 'text-emerald-300 font-medium'
                                    : 'text-slate-500 hover:text-slate-400'
                                }`}
                              >
                                <span className="truncate">{obj.code}: {obj.title}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 ml-1 flex-shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Problem Launch */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => onNavigateToGuidedProblem?.(selectedTopicId)}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Launch Guided Problem</span>
            </button>
          </div>
        </div>

        {/* Center Panel: Interactive Concept Tutor Conversation (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-[750px]">
          {/* Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">{activeTopic?.title || 'Calculus Lesson'}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Objective: {activeObjective?.title || `Master ${activeTopic?.title || 'Core Calculus'}`}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900">
              Adaptive Policy
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                  <span>{m.sender === 'tutor' ? 'MIT AI Calculus Tutor' : 'You (Student)'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-xl max-w-[94%] leading-relaxed ${
                    m.sender === 'student'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800/80 shadow-inner'
                  }`}
                >
                  <MathView text={m.text} />

                  {/* Diagnostic question if included */}
                  {m.diagnosticQuestion && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      <p className="font-semibold text-amber-300">
                        {m.diagnosticQuestion.question}
                      </p>
                      <div className="space-y-1.5">
                        {m.diagnosticQuestion.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleSelectOption(
                                idx,
                                m.diagnosticQuestion!.correctIndex,
                                m.diagnosticQuestion!.explanation
                              )
                            }
                            className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                              selectedOption === idx
                                ? idx === m.diagnosticQuestion!.correctIndex
                                  ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200'
                                  : 'bg-rose-950/70 border-rose-600 text-rose-200'
                                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {diagnosticFeedback && (
                        <p className="text-[11px] text-emerald-300 bg-emerald-950/50 p-2 rounded border border-emerald-800/60 mt-2">
                          {diagnosticFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 bg-slate-950 p-3 rounded-xl border border-slate-800 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Formulating conceptual breakdown and geometric reasoning...</span>
              </div>
            )}
          </div>

          {/* Quick Concept Actions */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5 pb-2">
            <button
              onClick={() => handleSendMessage('Can you explain why this transformation works geometrically?', 'explain_concept')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] transition-colors cursor-pointer"
            >
              Explain Why
            </button>
            <button
              onClick={() => handleSendMessage('Give me an intuitive physical example of this concept.', 'give_intuitive_example')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] transition-colors cursor-pointer"
            >
              Intuitive Example
            </button>
            <button
              onClick={() => handleSendMessage('Show me the visual region and boundary curves.', 'show_graph_representation')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] transition-colors cursor-pointer"
            >
              Visual Breakdown
            </button>
            <button
              onClick={() => handleSendMessage('Give me a diagnostic question to test my understanding.', 'ask_diagnostic_question')}
              className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-md text-[11px] transition-colors cursor-pointer"
            >
              Test My Reasoning
            </button>
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question or explain your reasoning in your own words..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isProcessing || !studentInput.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Panel: Synchronized Whiteboard (4 cols) */}
        <div className="lg:col-span-4 sticky top-4 space-y-4">
          <Whiteboard spec={currentWhiteboardSpec} />

          {/* Prerequisite & Concept Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5 shadow-md">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span>Prerequisites for this Objective:</span>
              <span className="text-[10px] text-indigo-400 font-mono">MIT MA3151</span>
            </div>
            <div className="space-y-1.5">
              {activeTopic?.prerequisites?.map((pr, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{pr}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
              Source: <span className="text-slate-300 italic">{activeTopic?.sourceReferences[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
