import React from 'react';
import { ArrowRight, CheckCircle2, Target } from 'lucide-react';
import { MISSIONS_DATA, STATIONS_DATA } from '../data/glassData';
import { Mission } from '../types/simulation';

interface MissionsViewProps {
  solvedMissions: string[];
  onStartMission: (mission: Mission) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  solvedMissions,
  onStartMission,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <p className="text-xs font-mono text-orange-400">
            การฝึกปฏิบัติแก้ปัญหาเชิงวิศวกรรม (Troubleshooting Lab)
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            ภารกิจจำลองสถานการณ์ในโรงงานผลิตแก้ว
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            เลือกสถานการณ์ปัญหาที่เกิดขึ้นจริงในสายการผลิต ระบบจะตั้งค่าพารามิเตอร์และเหตุขัดข้องลงในห้องจำลอง
            ให้คุณปรับจูนเครื่องจักรจนผ่านเกณฑ์มาตรฐาน
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">ภารกิจที่สำเร็จแล้ว</div>
          <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
            {solvedMissions.length} / {MISSIONS_DATA.length} ภารกิจ
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MISSIONS_DATA.map((mission) => {
          const solved = solvedMissions.includes(mission.id);
          const station = STATIONS_DATA[mission.stationIndex];

          return (
            <div
              key={mission.id}
              className={`bg-[#0e1525] border rounded-xl p-5 flex flex-col justify-between gap-4 transition ${
                solved ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <span className="text-orange-400 font-semibold">
                      ภารกิจ {mission.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{mission.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{station.shortName}</span>
                  </div>
                  {solved && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      สำเร็จแล้ว
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-white">
                  {mission.title}
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {mission.scenario}
                </p>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                    <Target className="w-3.5 h-3.5" />
                    เกณฑ์ความสำเร็จ (Success Criteria)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {mission.objectiveSummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  Temp {mission.initialControls.furnaceTemp}°C · Cullet{' '}
                  {mission.initialControls.culletRatio}% · Gob {mission.initialControls.gobSpeed}
                </span>
                <button
                  onClick={() => onStartMission(mission)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition whitespace-nowrap"
                >
                  {solved ? 'ฝึกซ้ำอีกครั้ง' : 'เริ่มภารกิจ'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
