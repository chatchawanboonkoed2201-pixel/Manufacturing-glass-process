import React, { useEffect, useMemo, useState } from 'react';
import { LessonsView } from './components/LessonsView';
import { MissionsView } from './components/MissionsView';
import { QuizView } from './components/QuizView';
import { SimulatorView } from './components/SimulatorView';
import {
  AppTab,
  LearningProgress,
  Mission,
  SimControls,
  SimFaults,
  StationData,
} from './types/simulation';
import {
  computeEngineeringMetrics,
  DEFAULT_CONTROLS,
  DEFAULT_FAULTS,
} from './utils/physics';

const PROGRESS_STORAGE_KEY = 'glassline_academy_progress_v1';

function loadProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LearningProgress;
      return {
        completedLessons: Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [],
        solvedMissions: Array.isArray(parsed.solvedMissions)
          ? parsed.solvedMissions
          : [],
        bestQuizScore:
          typeof parsed.bestQuizScore === 'number' ? parsed.bestQuizScore : null,
      };
    }
  } catch {
    // Fallback to clean progress if localStorage is unavailable
  }
  return { completedLessons: [], solvedMissions: [], bestQuizScore: null };
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('simulator');
  const [controls, setControls] = useState<SimControls>(DEFAULT_CONTROLS);
  const [faults, setFaults] = useState<SimFaults>(DEFAULT_FAULTS);
  const [simTime, setSimTime] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [selectedStation, setSelectedStation] = useState(1);
  const [guidedTourActive, setGuidedTourActive] = useState(false);

  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);

  // Persist learning progress
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  // Compute live engineering KPIs
  const metrics = useMemo(
    () => computeEngineeringMetrics(controls, faults, simTime),
    [controls, faults, simTime]
  );

  // Evaluate active mission completion in real time
  const missionSolved = useMemo(() => {
    if (!activeMission) return false;
    return activeMission.checkSuccess(metrics, controls, faults);
  }, [activeMission, metrics, controls, faults]);

  useEffect(() => {
    if (activeMission && missionSolved) {
      setProgress((prev) =>
        prev.solvedMissions.includes(activeMission.id)
          ? prev
          : { ...prev, solvedMissions: [...prev.solvedMissions, activeMission.id] }
      );
    }
  }, [activeMission, missionSolved]);

  const handleUpdateControls = (patch: Partial<SimControls>) => {
    setControls((prev) => ({ ...prev, ...patch }));
  };

  const handleToggleFault = (key: keyof SimFaults) => {
    setFaults((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearFaults = () => {
    setFaults(DEFAULT_FAULTS);
  };

  const handleResetAll = () => {
    setControls(DEFAULT_CONTROLS);
    setFaults(DEFAULT_FAULTS);
    setSpeedMultiplier(1);
    setIsPlaying(true);
    setActiveMission(null);
  };

  const handleToggleGuidedTour = () => {
    setActiveTab('simulator');
    setGuidedTourActive((prev) => {
      const next = !prev;
      if (next) setSelectedStation(0);
      return next;
    });
  };

  const handleLaunchLessonInSimulator = (station: StationData) => {
    setActiveMission(null);
    setControls({
      ...DEFAULT_CONTROLS,
      ...(station.presetControls ?? {}),
    });
    setFaults({
      ...DEFAULT_FAULTS,
      ...(station.presetFaults ?? {}),
    });
    setSelectedStation(station.id);
    setGuidedTourActive(false);
    setActiveTab('simulator');
  };

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    setControls(mission.initialControls);
    setFaults(mission.initialFaults);
    setSelectedStation(mission.stationIndex);
    setGuidedTourActive(false);
    setIsPlaying(true);
    setActiveTab('simulator');
  };

  const handleToggleLessonComplete = (stationId: number) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(stationId);
      return {
        ...prev,
        completedLessons: exists
          ? prev.completedLessons.filter((id) => id !== stationId)
          : [...prev.completedLessons, stationId],
      };
    });
  };

  const handleFinishQuiz = (score: number) => {
    setProgress((prev) => ({
      ...prev,
      bestQuizScore:
        prev.bestQuizScore === null ? score : Math.max(prev.bestQuizScore, score),
    }));
  };

  const navItems: { id: AppTab; label: string }[] = [
    { id: 'simulator', label: 'ห้องจำลอง' },
    { id: 'lessons', label: 'บทเรียน 7 สถานี' },
    { id: 'missions', label: 'ภารกิจฝึกปฏิบัติ' },
    { id: 'quiz', label: 'แบบทดสอบ' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            onClick={() => setActiveTab('simulator')}
            className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-orange-400 transition-colors"
          >
            GlassLine Academy
          </button>

          {/* Zone 2: 4 Concise Single-Line Nav Links */}
          <nav
            aria-label="เมนูหลัก"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    active
                      ? 'text-white border-orange-500'
                      : 'text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleToggleGuidedTour}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                guidedTourActive && activeTab === 'simulator'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
            >
              {guidedTourActive && activeTab === 'simulator'
                ? 'กำลังนำชม (Tour)'
                : 'แนะนำทีละขั้นตอน'}
            </button>
          </div>
        </div>

        {/* Mobile Compact Nav Row */}
        <nav
          aria-label="เมนูมือถือ"
          className="flex md:hidden items-center gap-4 px-4 py-2 border-t border-slate-800/80 overflow-x-auto text-xs font-medium"
        >
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  active
                    ? 'text-white border-orange-500'
                    : 'text-slate-400 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 py-5">
        {activeTab === 'simulator' && (
          <SimulatorView
            controls={controls}
            faults={faults}
            metrics={metrics}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
            selectedStation={selectedStation}
            guidedTourActive={guidedTourActive}
            activeMission={activeMission}
            missionSolved={missionSolved}
            onUpdateControls={handleUpdateControls}
            onToggleFault={handleToggleFault}
            onClearFaults={handleClearFaults}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onSetSpeed={setSpeedMultiplier}
            onResetAll={handleResetAll}
            onSelectStation={setSelectedStation}
            onToggleGuidedTour={handleToggleGuidedTour}
            onExitMission={() => setActiveMission(null)}
            onOpenLesson={(idx) => {
              setSelectedStation(idx);
              setActiveTab('lessons');
            }}
            onTickTime={setSimTime}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsView
            selectedLessonIdx={selectedStation}
            completedLessons={progress.completedLessons}
            onSelectLesson={setSelectedStation}
            onToggleComplete={handleToggleLessonComplete}
            onLaunchInSimulator={handleLaunchLessonInSimulator}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsView
            solvedMissions={progress.solvedMissions}
            onStartMission={handleStartMission}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            bestScore={progress.bestQuizScore}
            onFinishQuiz={handleFinishQuiz}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 sm:px-6 mt-6">
        <div className="max-w-[1520px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>GlassLine Academy · ระบบการเรียนรู้วิศวกรรมกระบวนการผลิตแก้วโซดาไลม์</span>
          <span className="font-mono tabular-nums">
            บทเรียน {progress.completedLessons.length}/7 · ภารกิจ {progress.solvedMissions.length}/4
            {progress.bestQuizScore !== null ? ` · แบบทดสอบ ${progress.bestQuizScore}/10` : ''}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
