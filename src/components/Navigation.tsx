import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  BarChart2,
  Settings,
  ShieldCheck,
  Layers,
  Activity,
  Mic,
  UploadCloud,
} from 'lucide-react';
import { CourseCurriculum } from '../types';

export type ActiveNavTab =
  | 'dashboard'
  | 'learn'
  | 'generate'
  | 'guided'
  | 'whiteboard'
  | 'syllabus'
  | 'progress'
  | 'settings';

interface NavigationProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  activeCurriculum: CourseCurriculum;
  onOpenSyllabusIntake?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  activeCurriculum,
  onOpenSyllabusIntake,
}) => {
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'learn', label: '1. Learn Concept', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'generate', label: '2. Generate Problems', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'guided', label: '3. Guided Solutions', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'whiteboard', label: '4. Whiteboard', icon: <Layers className="w-4 h-4" /> },
    { id: 'syllabus', label: 'Syllabus Manager', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 tracking-tight">
                  MIT Calculus Tutor
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 hidden sm:inline-block">
                  AI Engineering Tutor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                {activeCurriculum.institution} • {activeCurriculum.code}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Course Badge & Status & Syllabus Intake Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyllabusIntake}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Provide Syllabus</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-mono text-[11px]">
                {activeCurriculum.code} ({activeCurriculum.syllabusVersion})
              </span>
            </div>

            <button
              onClick={() => onTabChange('learn')}
              className="md:hidden p-2 rounded-lg bg-indigo-600 text-white"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu for smaller screens */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap cursor-pointer ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
