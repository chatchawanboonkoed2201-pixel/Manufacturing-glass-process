export type AnnealingRate = 'slow' | 'standard' | 'fast';
export type FormingMode = 'h28' | 'press' | 'is';
export type AppTab = 'simulator' | 'lessons' | 'missions' | 'quiz';

export interface SimControls {
  furnaceTemp: number;      // 1400 - 1600 °C
  culletRatio: number;      // 0 - 50 %
  gobSpeed: number;         // 20 - 80 cuts/min
  annealingRate: AnnealingRate;
  formingMode: FormingMode;
}

export interface SimFaults {
  coolingAir: boolean;
  gasPressure: boolean;
}

export interface DefectBreakdown {
  blister: number;
  deformed: number;
  stressCrack: number;
}

export interface SimMetrics {
  effectiveTemp: number;
  viscosityLogPoise: number;
  thermalStressNm: number;
  specificEnergyGJ: number;
  co2SavePct: number;
  efficiencyPct: number;
  goodRatePcs: number;
  rejectRatePcs: number;
  defectBreakdown: DefectBreakdown;
}

export interface StationSpec {
  label: string;
  val: string;
}

export interface StationDefect {
  name: string;
  cause: string;
  remedy: string;
}

export interface StationData {
  id: number;
  code: string;
  shortName: string;
  title: string;
  subtitle: string;
  principle: string;
  keyTakeaway: string;
  formula?: {
    expression: string;
    caption: string;
  };
  specs: StationSpec[];
  pmCheckpoints: string[];
  commonDefects: StationDefect[];
  presetControls?: Partial<SimControls>;
  presetFaults?: Partial<SimFaults>;
  x: number;
  w: number;
}

export interface Mission {
  id: string;
  number: string;
  title: string;
  difficulty: 'ระดับพื้นฐาน' | 'ระดับกลาง' | 'ระดับสูง';
  stationIndex: number;
  scenario: string;
  objectiveSummary: string;
  hint: string;
  explanation: string;
  initialControls: SimControls;
  initialFaults: SimFaults;
  checkSuccess: (metrics: SimMetrics, controls: SimControls, faults: SimFaults) => boolean;
}

export interface QuizQuestion {
  id: number;
  stationName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningProgress {
  completedLessons: number[];
  solvedMissions: string[];
  bestQuizScore: number | null;
}
