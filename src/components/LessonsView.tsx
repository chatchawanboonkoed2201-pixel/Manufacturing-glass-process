import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FlaskConical,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { STATIONS_DATA } from '../data/glassData';
import { StationData } from '../types/simulation';

interface LessonsViewProps {
  selectedLessonIdx: number;
  completedLessons: number[];
  onSelectLesson: (idx: number) => void;
  onToggleComplete: (stationId: number) => void;
  onLaunchInSimulator: (station: StationData) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  selectedLessonIdx,
  completedLessons,
  onSelectLesson,
  onToggleComplete,
  onLaunchInSimulator,
}) => {
  const station = STATIONS_DATA[selectedLessonIdx];
  const isCompleted = completedLessons.includes(station.id);
  const progressPct = Math.round((completedLessons.length / STATIONS_DATA.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Progress Overview */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <p className="text-xs font-mono text-cyan-400">
            หลักสูตรวิศวกรรมกระบวนการผลิตแก้วโซดาไลม์
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            บทเรียนครบทั้ง 7 สถานีการผลิต
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">ความคืบหน้าการเรียนรู้</div>
            <div className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
              {completedLessons.length} / {STATIONS_DATA.length} บทเรียน ({progressPct}%)
            </div>
          </div>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Curriculum Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: 7-Station Index */}
        <aside className="lg:col-span-4 bg-[#0e1525] border border-slate-800 rounded-xl p-3 space-y-1">
          {STATIONS_DATA.map((st, idx) => {
            const done = completedLessons.includes(st.id);
            const active = selectedLessonIdx === idx;
            return (
              <button
                key={st.id}
                onClick={() => onSelectLesson(idx)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg text-left transition ${
                  active
                    ? 'bg-orange-600/15 text-white border border-orange-500/40'
                    : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-slate-400">
                    บทที่ 0{idx + 1} · {st.code}
                  </div>
                  <div className="text-sm font-medium truncate mt-0.5">
                    {st.shortName}
                  </div>
                </div>
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content: Detailed Lesson Article */}
        <article className="lg:col-span-8 bg-[#0e1525] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono text-orange-400">
                บทที่ 0{selectedLessonIdx + 1} · {station.subtitle}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{station.title}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleComplete(station.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'เรียนจบบทนี้แล้ว' : 'ทำเครื่องหมายว่าเรียนจบ'}
              </button>

              <button
                onClick={() => onLaunchInSimulator(station)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition whitespace-nowrap"
              >
                ทดลองในห้องจำลอง
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Core Working Principle */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-cyan-400">
              หลักการทำงานทางวิศวกรรม
            </h3>
            <p className="text-sm text-slate-200 leading-7">{station.principle}</p>
          </div>

          {/* Key Engineering Takeaway */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-semibold text-orange-400">
              ประเด็นสำคัญที่วิศวกรต้องรู้
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {station.keyTakeaway}
            </p>
          </div>

          {/* Chemical / Physical Formula */}
          {station.formula && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span>{station.formula.caption}</span>
              </div>
              <div className="font-mono text-sm text-cyan-300 overflow-x-auto py-1">
                {station.formula.expression}
              </div>
            </div>
          )}

          {/* Standard Operating Specs Grid */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white">
              ค่าพารามิเตอร์มาตรฐาน (Standard Operating Parameters)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {station.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-slate-950/70 border border-slate-800 rounded-lg p-3"
                >
                  <div className="text-xs text-slate-400">{spec.label}</div>
                  <div className="text-sm font-mono font-semibold text-white mt-1 tabular-nums">
                    {spec.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Defects Table */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              การวิเคราะห์ปัญหาและวิธีแก้ไข (Defect Root-Cause Matrix)
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">ลักษณะของเสีย</th>
                    <th className="px-4 py-2.5 font-medium">สาเหตุหลัก</th>
                    <th className="px-4 py-2.5 font-medium">แนวทางแก้ไข</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {station.commonDefects.map((d) => (
                    <tr key={d.name}>
                      <td className="px-4 py-3 font-medium text-rose-300 whitespace-nowrap">
                        {d.name}
                      </td>
                      <td className="px-4 py-3">{d.cause}</td>
                      <td className="px-4 py-3 text-emerald-300">{d.remedy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preventive Maintenance Checklist */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              รายการตรวจสอบบำรุงรักษาเชิงป้องกัน (PM Checkpoints)
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {station.pmCheckpoints.map((pm) => (
                <li key={pm} className="flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono mt-0.5">•</span>
                  <span>{pm}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prev / Next Lesson Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={selectedLessonIdx === 0}
              onClick={() => onSelectLesson(selectedLessonIdx - 1)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← บทเรียนก่อนหน้า
            </button>
            <button
              disabled={selectedLessonIdx === STATIONS_DATA.length - 1}
              onClick={() => onSelectLesson(selectedLessonIdx + 1)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              บทเรียนถัดไป →
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
