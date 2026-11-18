import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Target,
  X,
} from 'lucide-react';
import { STATIONS_DATA } from '../data/glassData';
import {
  AnnealingRate,
  FormingMode,
  Mission,
  SimControls,
  SimFaults,
  SimMetrics,
} from '../types/simulation';
import { DiagnosticCharts } from './DiagnosticCharts';
import { ProcessCanvas } from './ProcessCanvas';

interface SimulatorViewProps {
  controls: SimControls;
  faults: SimFaults;
  metrics: SimMetrics;
  isPlaying: boolean;
  speedMultiplier: number;
  selectedStation: number;
  guidedTourActive: boolean;
  activeMission: Mission | null;
  missionSolved: boolean;
  onUpdateControls: (patch: Partial<SimControls>) => void;
  onToggleFault: (key: keyof SimFaults) => void;
  onClearFaults: () => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: 1 | 2) => void;
  onResetAll: () => void;
  onSelectStation: (index: number) => void;
  onToggleGuidedTour: () => void;
  onExitMission: () => void;
  onOpenLesson: (stationIdx: number) => void;
  onTickTime: (t: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  controls,
  faults,
  metrics,
  isPlaying,
  speedMultiplier,
  selectedStation,
  guidedTourActive,
  activeMission,
  missionSolved,
  onUpdateControls,
  onToggleFault,
  onClearFaults,
  onTogglePlay,
  onSetSpeed,
  onResetAll,
  onSelectStation,
  onToggleGuidedTour,
  onExitMission,
  onOpenLesson,
  onTickTime,
}) => {
  const [showMissionHint, setShowMissionHint] = useState(false);

  const station = STATIONS_DATA[selectedStation];
  const hasFault = faults.coolingAir || faults.gasPressure;
  const isDegraded = metrics.efficiencyPct < 82;
  const showAlarm = hasFault || isDegraded;

  const alarmMessage =
    faults.coolingAir && faults.gasPressure
      ? 'วิกฤต: ลมหล่อเย็นแม่พิมพ์ตก (35%) และความดันก๊าซหัวเผาแกว่ง — อัตราของเสียพุ่งสูง'
      : faults.coolingAir
        ? 'แจ้งเตือน: แรงดันลมหล่อเย็นแม่พิมพ์ตกเหลือ 35% ส่งผลให้แม่พิมพ์ร้อนจัดและแก้วเสียรูปทรง'
        : faults.gasPressure
          ? 'แจ้งเตือน: ความดันก๊าซเชื้อเพลิงหัวเผาแกว่ง ทำให้อุณหภูมิเตาหลอมไม่เสถียรและเกิดฟองอากาศ'
          : 'แจ้งเตือนวิศวกรรม: อัตราของเสียสูงกว่าเกณฑ์ โปรดตรวจสอบอุณหภูมิเตาหลอม ความเร็วตัด Gob หรืออัตราการเย็นตัวในเตา Lehr';

  const getInspectorLiveMetric = () => {
    if (selectedStation === 1) {
      return `อุณหภูมิเตาหลอม ${Math.round(metrics.effectiveTemp).toLocaleString()} °C`;
    }
    if (selectedStation === 2) {
      return `ความเร็วตัด ${controls.gobSpeed} cuts/min`;
    }
    if (selectedStation === 3) {
      const modeMap: Record<FormingMode, string> = {
        h28: 'H-28 Paste Mold',
        press: 'Rotary Press',
        is: 'IS Blow & Blow',
      };
      return `โหมดเครื่อง ${modeMap[controls.formingMode]}`;
    }
    if (selectedStation === 4) {
      return `ความเค้นสะสม ${metrics.thermalStressNm} nm/cm`;
    }
    if (selectedStation === 6) {
      return `ประสิทธิภาพ ${metrics.efficiencyPct.toFixed(1)}%`;
    }
    return 'กำลังทำงานปกติ';
  };

  const nextTourStep = () => onSelectStation((selectedStation + 1) % STATIONS_DATA.length);
  const prevTourStep = () =>
    onSelectStation((selectedStation - 1 + STATIONS_DATA.length) % STATIONS_DATA.length);

  return (
    <div className="space-y-4">
      {/* Active Mission HUD Banner */}
      {activeMission && (
        <div
          className={`rounded-xl border p-4 transition-colors ${
            missionSolved
              ? 'bg-emerald-950/50 border-emerald-500/50'
              : 'bg-cyan-950/40 border-cyan-500/40'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-medium">
                {missionSolved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <span className={missionSolved ? 'text-emerald-300' : 'text-cyan-300'}>
                  {missionSolved
                    ? `ภารกิจที่ ${activeMission.number} สำเร็จแล้ว`
                    : `กำลังปฏิบัติภารกิจที่ ${activeMission.number} · ${activeMission.difficulty}`}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white">
                {activeMission.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {missionSolved ? activeMission.explanation : activeMission.objectiveSummary}
              </p>
              {showMissionHint && !missionSolved && (
                <p className="text-xs text-amber-300 pt-1">
                  คำใบ้: {activeMission.hint}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!missionSolved && (
                <button
                  onClick={() => setShowMissionHint((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 transition whitespace-nowrap"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showMissionHint ? 'ซ่อนคำใบ้' : 'ดูคำใบ้'}
                </button>
              )}
              <button
                onClick={onExitMission}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                ออกจากภารกิจ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Alarm Banner */}
      {showAlarm && (
        <div
          role="alert"
          className="rounded-xl bg-rose-950/75 border border-rose-500/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-rose-100">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono font-bold text-rose-300 shrink-0">ALARM</span>
            <span aria-hidden="true" className="text-rose-500">·</span>
            <span>{alarmMessage}</span>
          </div>
          {hasFault && (
            <button
              onClick={onClearFaults}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition whitespace-nowrap shrink-0"
            >
              รีเซ็ตระบบสาธารณูปโภค
            </button>
          )}
        </div>
      )}

      {/* 1. LIVE KPI TELEMETRY STRIP */}
      <section
        aria-label="ค่าชี้วัดสายการผลิตแบบเรียลไทม์"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
      >
        {/* KPI 1: Pack-to-Melt Efficiency */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 gap-1">
            <span className="truncate">Pack-to-Melt Eff.</span>
            <span className="font-mono text-[11px] text-slate-400 shrink-0">เป้า ≥92%</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span
              className={`text-2xl font-mono font-bold tabular-nums ${
                metrics.efficiencyPct >= 90
                  ? 'text-emerald-400'
                  : metrics.efficiencyPct >= 80
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}
            >
              {metrics.efficiencyPct.toFixed(1)}%
            </span>
            <span
              className={`text-[11px] font-mono font-semibold ${
                metrics.efficiencyPct >= 90
                  ? 'text-emerald-400'
                  : metrics.efficiencyPct >= 80
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}
            >
              {metrics.efficiencyPct >= 90
                ? 'OPTIMAL'
                : metrics.efficiencyPct >= 80
                  ? 'WARNING'
                  : 'LOW YIELD'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                metrics.efficiencyPct >= 90
                  ? 'bg-emerald-500'
                  : metrics.efficiencyPct >= 80
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
              }`}
              style={{ width: `${metrics.efficiencyPct}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Good vs Reject Output */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">ของดี / ของเสีย</span>
            <span className="font-mono text-[11px] text-cyan-400">pcs/min</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5 font-mono tabular-nums">
            <span className="text-2xl font-bold text-white">
              {metrics.goodRatePcs.toFixed(1)}
            </span>
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-base font-bold text-rose-400">
              {metrics.rejectRatePcs.toFixed(1)}
            </span>
          </div>
          <div className="flex gap-1 h-1.5 mt-2.5 rounded-full overflow-hidden bg-slate-800">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${metrics.efficiencyPct}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${100 - metrics.efficiencyPct}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Glass Viscosity */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">ความหนืดน้ำแก้ว</span>
            <span className="font-mono text-[11px] text-slate-400">log₁₀ η</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span
              className={`text-2xl font-mono font-bold tabular-nums ${
                metrics.viscosityLogPoise > 3.35
                  ? 'text-rose-400'
                  : metrics.viscosityLogPoise < 2.92
                    ? 'text-amber-400'
                    : 'text-orange-400'
              }`}
            >
              {metrics.viscosityLogPoise.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">Poise</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 truncate">
            {metrics.viscosityLogPoise > 3.35
              ? 'หนืดเกินไป ฟองอากาศลอยยาก'
              : metrics.viscosityLogPoise < 2.92
                ? 'เหลวมาก ก้อน Gob เสียทรงง่าย'
                : 'ความหนืดเหมาะต่อการตัด Gob'}
          </p>
        </div>

        {/* KPI 4: Residual Thermal Stress */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">ความเค้นสะสม</span>
            <span className="font-mono text-[11px] text-slate-400">&lt;50 nm/cm</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span
              className={`text-2xl font-mono font-bold tabular-nums ${
                metrics.thermalStressNm > 50 ? 'text-rose-400' : 'text-cyan-400'
              }`}
            >
              {metrics.thermalStressNm}
            </span>
            <span className="text-xs font-mono text-slate-400">nm/cm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 truncate">
            {metrics.thermalStressNm > 50
              ? 'ความเค้นเกินเกณฑ์ เสี่ยงแตกร้าว'
              : 'โครงสร้างโมเลกุลคลายตัวสมบูรณ์'}
          </p>
        </div>

        {/* KPI 5: Specific Energy Consumption */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">พลังงานจำเพาะ</span>
            <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
              -{metrics.co2SavePct.toFixed(1)}% CO₂
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold tabular-nums text-amber-400">
              {metrics.specificEnergyGJ.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">GJ/ton</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 truncate">
            Cullet {controls.culletRatio}% ช่วยลดเชื้อเพลิงเตา
          </p>
        </div>

        {/* KPI 6: Utilities Status */}
        <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">สาธารณูปโภค</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                hasFault ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {hasFault ? 'FAULT' : 'NOMINAL'}
            </span>
          </div>
          <div className="mt-1.5 space-y-1 text-[11px] font-mono tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GAS:</span>
              <span className={faults.gasPressure ? 'text-rose-400 font-semibold' : 'text-amber-300'}>
                {faults.gasPressure ? 'UNSTABLE' : '2.4 bar OK'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">COOL AIR:</span>
              <span className={faults.coolingAir ? 'text-rose-400 font-semibold' : 'text-cyan-300'}>
                {faults.coolingAir ? '35% LOW' : '100% OK'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">COMP AIR:</span>
              <span className="text-emerald-300">6.5 bar</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE PROCESS FLOW VIEWPORT */}
      <section className="bg-[#0e1525] border border-slate-800 rounded-xl overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="px-4 py-3 bg-[#0b1120] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-semibold text-white">
              แผนผังสายการผลิตแบบเรียลไทม์ (7 Stations & Cullet Loop)
            </h2>
            <span className="hidden xl:inline text-xs text-slate-400">
              คลิกที่สถานีบนแผนผังเพื่อศึกษาหลักการทำงานและจุดบำรุงรักษา
            </span>
          </div>

          {/* Simulation Controls: Forming Mode + Playback + Speed + Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="เลือกเครื่องขึ้นรูป"
              className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs"
            >
              {(
                [
                  { id: 'h28', label: 'H-28 Paste Mold' },
                  { id: 'press', label: 'Rotary Press' },
                  { id: 'is', label: 'IS Machine' },
                ] as { id: FormingMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => onUpdateControls({ formingMode: m.id })}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                    controls.formingMode === m.id
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={onTogglePlay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
            </button>

            <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => onSetSpeed(1)}
                className={`px-2 py-1 rounded-md font-semibold transition ${
                  speedMultiplier === 1 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => onSetSpeed(2)}
                className={`px-2 py-1 rounded-md font-semibold transition ${
                  speedMultiplier === 2 ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2x
              </button>
            </div>

            <button
              onClick={onResetAll}
              title="รีเซ็ตค่าทั้งหมดกลับสู่มาตรฐาน"
              aria-label="รีเซ็ตค่าทั้งหมด"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ต
            </button>
          </div>
        </div>

        {/* Guided Tour Bar */}
        {guidedTourActive && (
          <div className="bg-cyan-950/60 border-b border-cyan-500/40 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3 max-w-3xl">
                <span className="font-mono text-xs font-bold text-cyan-300 pt-0.5 shrink-0">
                  ขั้นตอนที่ {selectedStation + 1}/7
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{station.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {station.principle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={prevTourStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  ก่อนหน้า
                </button>
                <button
                  onClick={nextTourStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition whitespace-nowrap"
                >
                  ถัดไป
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onToggleGuidedTour}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-700 transition whitespace-nowrap"
                >
                  ปิดทัวร์
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive HiDPI Canvas */}
        <ProcessCanvas
          controls={controls}
          faults={faults}
          metrics={metrics}
          isPlaying={isPlaying}
          speedMultiplier={speedMultiplier}
          selectedStation={selectedStation}
          guidedTourActive={guidedTourActive}
          onSelectStation={onSelectStation}
          onTickTime={onTickTime}
        />

        {/* Station Selector Bar */}
        <div className="px-4 py-2.5 bg-[#0b1120] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 mr-1 shrink-0">เลือกสถานี:</span>
          {STATIONS_DATA.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => onSelectStation(idx)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedStation === idx
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {st.shortName}
            </button>
          ))}
        </div>
      </section>

      {/* 3. BOTTOM WORKSPACE: CONTROLS (5 COLS) + CHARTS & INSPECTOR (7 COLS) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Engineering Parameters & Utility Faults */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-white">
                  แผงควบคุมพารามิเตอร์ทางวิศวกรรม
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Process Control</span>
            </div>

            {/* Control 1: Furnace Temp */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="sliderTemp" className="text-xs font-medium text-slate-200">
                  1. อุณหภูมิเตาหลอม (Furnace Temp)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-orange-400">
                  {controls.furnaceTemp.toLocaleString()} °C
                </span>
              </div>
              <input
                id="sliderTemp"
                type="range"
                min={1400}
                max={1600}
                step={5}
                value={controls.furnaceTemp}
                onChange={(e) =>
                  onUpdateControls({ furnaceTemp: parseInt(e.target.value, 10) })
                }
                className="w-full scada-slider"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1,400°C (หนืด/ฟองสูง)</span>
                <span className="text-emerald-400">1,510–1,540°C เหมาะสม</span>
                <span>1,600°C (เปลืองไฟ)</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3.5 space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="sliderCullet" className="text-xs font-medium text-slate-200">
                  2. สัดส่วนเศษแก้วรีไซเคิล (Cullet Ratio)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-cyan-400">
                  {controls.culletRatio} %
                </span>
              </div>
              <input
                id="sliderCullet"
                type="range"
                min={0}
                max={50}
                step={5}
                value={controls.culletRatio}
                onChange={(e) =>
                  onUpdateControls({ culletRatio: parseInt(e.target.value, 10) })
                }
                className="w-full scada-slider cyan-slider"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0% (Virgin Batch)</span>
                <span className="text-cyan-400">ยิ่งสูงยิ่งลดเชื้อเพลิงเตาหลอม</span>
                <span>50%</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3.5 space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="sliderGobSpeed" className="text-xs font-medium text-slate-200">
                  3. ความเร็วตัดก้อนน้ำแก้ว (Gob Speed)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-amber-400">
                  {controls.gobSpeed} cuts/min
                </span>
              </div>
              <input
                id="sliderGobSpeed"
                type="range"
                min={20}
                max={80}
                step={5}
                value={controls.gobSpeed}
                onChange={(e) =>
                  onUpdateControls({ gobSpeed: parseInt(e.target.value, 10) })
                }
                className="w-full scada-slider"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>20 cuts/m</span>
                <span className="text-amber-400">40–55 สมดุลแม่พิมพ์</span>
                <span>80 (เสี่ยงเสียทรง)</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-200">
                  4. อัตราการเย็นตัวในเตาอบ (Annealing Rate)
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    controls.annealingRate === 'fast'
                      ? 'text-rose-400'
                      : controls.annealingRate === 'slow'
                        ? 'text-cyan-400'
                        : 'text-emerald-400'
                  }`}
                >
                  {controls.annealingRate === 'slow'
                    ? 'SLOW'
                    : controls.annealingRate === 'standard'
                      ? 'STANDARD'
                      : 'TOO FAST'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'slow', label: 'ช้า (Slow)' },
                    { id: 'standard', label: 'มาตรฐาน (Std)' },
                    { id: 'fast', label: 'เร็วเกินไป (Fast)' },
                  ] as { id: AnnealingRate; label: string }[]
                ).map((r) => {
                  const active = controls.annealingRate === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onUpdateControls({ annealingRate: r.id })}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                        active
                          ? r.id === 'fast'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Utility Fault Simulation Card */}
          <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">
                  จำลองเหตุขัดข้อง (Utility Faults)
                </h3>
              </div>
              <button
                onClick={onClearFaults}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
              >
                ล้างเหตุขัดข้อง
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onToggleFault('coolingAir')}
                className={`p-3 rounded-lg border text-left transition ${
                  faults.coolingAir
                    ? 'bg-rose-950/60 border-rose-500/70'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">ลมหล่อเย็นแม่พิมพ์ตก</span>
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      faults.coolingAir ? 'text-rose-400' : 'text-slate-500'
                    }`}
                  >
                    {faults.coolingAir ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Cooling Air Drop (-65%)
                </p>
              </button>

              <button
                onClick={() => onToggleFault('gasPressure')}
                className={`p-3 rounded-lg border text-left transition ${
                  faults.gasPressure
                    ? 'bg-rose-950/60 border-rose-500/70'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">ความดันก๊าซหัวเผาแกว่ง</span>
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      faults.gasPressure ? 'text-rose-400' : 'text-slate-500'
                    }`}
                  >
                    {faults.gasPressure ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Burner Gas Fluctuation
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Diagnostic Charts + Station Deep-Dive Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <DiagnosticCharts
            annealingRate={controls.annealingRate}
            thermalStressNm={metrics.thermalStressNm}
          />

          {/* Station Deep-Dive Inspector */}
          <div className="bg-[#0e1525] border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="text-orange-400 font-semibold">{station.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{station.subtitle}</span>
                </div>
                <h3 className="text-base font-semibold text-white mt-1">
                  {station.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-emerald-400">
                  {getInspectorLiveMetric()}
                </span>
                <button
                  onClick={() => onOpenLesson(selectedStation)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  อ่านบทเรียนเต็ม
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-sm">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-cyan-400 mb-1.5">
                    หลักการทำงานทางวิศวกรรม
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[13px]">
                    {station.principle}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">
                    ค่าพารามิเตอร์มาตรฐาน (Standard Operating Specs)
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {station.specs.map((sp) => (
                      <div
                        key={sp.label}
                        className="bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/80"
                      >
                        <div className="text-[11px] text-slate-400">{sp.label}</div>
                        <div className="text-xs font-mono font-semibold text-slate-100 mt-0.5 tabular-nums">
                          {sp.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-5">
                <h4 className="text-xs font-semibold text-amber-400 mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  จุดตรวจสอบบำรุงรักษา (PM Checkpoints)
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                  {station.pmCheckpoints.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-amber-400 font-mono mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
