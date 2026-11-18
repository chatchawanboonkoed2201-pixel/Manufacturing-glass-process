import React, { useEffect, useRef } from 'react';
import { AnnealingRate } from '../types/simulation';

interface DiagnosticChartsProps {
  annealingRate: AnnealingRate;
  thermalStressNm: number;
}

export const DiagnosticCharts: React.FC<DiagnosticChartsProps> = ({
  annealingRate,
  thermalStressNm,
}) => {
  const annealingRef = useRef<HTMLCanvasElement | null>(null);
  const polariscopeRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const drawAll = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // 1. Annealing Curve Canvas
      const aCanvas = annealingRef.current;
      if (aCanvas && aCanvas.parentElement) {
        const aRect = aCanvas.parentElement.getBoundingClientRect();
        aCanvas.width = Math.max(1, Math.floor(aRect.width * dpr));
        aCanvas.height = Math.max(1, Math.floor(aRect.height * dpr));
        const actx = aCanvas.getContext('2d');
        if (actx) {
          const w = aCanvas.width;
          const h = aCanvas.height;
          actx.clearRect(0, 0, w, h);

          const padL = 48 * (w / 420);
          const padR = 16 * (w / 420);
          const padT = 18 * (h / 175);
          const padB = 26 * (h / 175);
          const plotW = w - padL - padR;
          const plotH = h - padT - padB;

          const tempToY = (t: number) => padT + plotH * (1 - t / 650);
          const y550 = tempToY(550);
          const y500 = tempToY(500);

          // Annealing & Strain Band
          actx.fillStyle = 'rgba(249, 115, 22, 0.12)';
          actx.fillRect(padL, y550, plotW, y500 - y550);

          actx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
          actx.setLineDash([4, 4]);
          actx.lineWidth = 1;
          actx.beginPath();
          actx.moveTo(padL, y550);
          actx.lineTo(padL + plotW, y550);
          actx.stroke();

          actx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
          actx.beginPath();
          actx.moveTo(padL, y500);
          actx.lineTo(padL + plotW, y500);
          actx.stroke();
          actx.setLineDash([]);

          actx.fillStyle = '#94a3b8';
          const fontSize = Math.max(10, Math.round(10 * (w / 420)));
          actx.font = `${fontSize}px "JetBrains Mono", sans-serif`;
          actx.textAlign = 'right';
          actx.fillText('550°C', padL - 6, y550 + 3);
          actx.fillText('500°C', padL - 6, y500 + 3);
          actx.fillText('65°C', padL - 6, tempToY(65) + 3);

          // Ideal Reference Curve
          actx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
          actx.lineWidth = 2;
          actx.setLineDash([5, 5]);
          actx.beginPath();
          actx.moveTo(padL, tempToY(580));
          actx.lineTo(padL + plotW * 0.25, tempToY(550));
          actx.lineTo(padL + plotW * 0.55, tempToY(500));
          actx.lineTo(padL + plotW, tempToY(65));
          actx.stroke();
          actx.setLineDash([]);

          // Active Live Curve
          const curveGrad = actx.createLinearGradient(padL, 0, padL + plotW, 0);
          curveGrad.addColorStop(0, '#f97316');
          curveGrad.addColorStop(0.5, '#fbbf24');
          curveGrad.addColorStop(1, '#06b6d4');

          actx.strokeStyle = annealingRate === 'fast' ? '#f43f5e' : curveGrad;
          actx.lineWidth = 3;
          actx.beginPath();
          actx.moveTo(padL, tempToY(580));

          if (annealingRate === 'standard') {
            actx.lineTo(padL + plotW * 0.25, tempToY(550));
            actx.lineTo(padL + plotW * 0.55, tempToY(500));
            actx.lineTo(padL + plotW, tempToY(65));
          } else if (annealingRate === 'slow') {
            actx.lineTo(padL + plotW * 0.35, tempToY(552));
            actx.lineTo(padL + plotW * 0.72, tempToY(498));
            actx.lineTo(padL + plotW, tempToY(85));
          } else {
            actx.lineTo(padL + plotW * 0.12, tempToY(530));
            actx.lineTo(padL + plotW * 0.28, tempToY(240));
            actx.lineTo(padL + plotW, tempToY(55));
          }
          actx.stroke();

          actx.fillStyle = '#64748b';
          actx.textAlign = 'center';
          actx.fillText('Zone 1 (Heat)', padL + plotW * 0.18, h - 6);
          actx.fillText('Zone 2 (Anneal)', padL + plotW * 0.5, h - 6);
          actx.fillText('Zone 3 (Cool)', padL + plotW * 0.84, h - 6);
        }
      }

      // 2. Polariscope Canvas
      const pCanvas = polariscopeRef.current;
      if (pCanvas && pCanvas.parentElement) {
        const pRect = pCanvas.parentElement.getBoundingClientRect();
        pCanvas.width = Math.max(1, Math.floor(pRect.width * dpr));
        pCanvas.height = Math.max(1, Math.floor(pRect.height * dpr));
        const pctx = pCanvas.getContext('2d');
        if (pctx) {
          const w = pCanvas.width;
          const h = pCanvas.height;
          pctx.clearRect(0, 0, w, h);

          const cx = w / 2;
          const cy = h / 2;
          const scale = Math.min(w, h) / 180;

          pctx.fillStyle = '#090d1a';
          pctx.fillRect(0, 0, w, h);

          // Crosshair Reticle
          pctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          pctx.lineWidth = 1;
          pctx.beginPath();
          pctx.moveTo(cx, 12);
          pctx.lineTo(cx, h - 12);
          pctx.moveTo(12, cy);
          pctx.lineTo(w - 12, cy);
          pctx.stroke();

          pctx.save();
          pctx.translate(cx, cy);
          pctx.scale(scale, scale);

          pctx.beginPath();
          pctx.moveTo(-36, -52);
          pctx.lineTo(-30, 48);
          pctx.lineTo(30, 48);
          pctx.lineTo(36, -52);
          pctx.closePath();

          if (thermalStressNm > 50) {
            const stressGrad = pctx.createLinearGradient(-36, -50, 36, 48);
            stressGrad.addColorStop(0, 'rgba(236, 72, 153, 0.85)');
            stressGrad.addColorStop(0.25, 'rgba(250, 204, 21, 0.85)');
            stressGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.85)');
            stressGrad.addColorStop(0.75, 'rgba(244, 63, 94, 0.85)');
            stressGrad.addColorStop(1, 'rgba(168, 85, 247, 0.85)');
            pctx.fillStyle = stressGrad;
            pctx.fill();

            pctx.strokeStyle = '#fde047';
            pctx.lineWidth = 3;
            pctx.strokeRect(-26, 32, 52, 12);
          } else {
            const calmGrad = pctx.createLinearGradient(0, -50, 0, 48);
            calmGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
            calmGrad.addColorStop(1, 'rgba(99, 102, 241, 0.35)');
            pctx.fillStyle = calmGrad;
            pctx.fill();
          }

          pctx.strokeStyle = '#94a3b8';
          pctx.lineWidth = 2;
          pctx.stroke();
          pctx.restore();

          pctx.fillStyle = thermalStressNm > 50 ? '#fda4af' : '#67e8f9';
          pctx.font = `bold ${Math.max(10, Math.round(11 * scale))}px "JetBrains Mono", sans-serif`;
          pctx.textAlign = 'left';
          pctx.fillText(`RETARDATION: ${thermalStressNm} nm/cm`, 10, h - 10);
        }
      }
    };

    drawAll();
    window.addEventListener('resize', drawAll);
    return () => window.removeEventListener('resize', drawAll);
  }, [annealingRate, thermalStressNm]);

  const isHighStress = thermalStressNm > 50;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Annealing Lehr Temperature Curve */}
      <div className="md:col-span-7 bg-[#0e1525] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              กราฟเส้นโค้งอบลดความเครียด (Annealing Curve)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              เปรียบเทียบอุณหภูมิจริงในเตา Lehr กับจุดวิกฤต 550°C → 500°C
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-orange-400 shrink-0">
            550°C → 65°C
          </span>
        </div>
        <div className="w-full h-[175px] bg-slate-950/90 rounded-lg border border-slate-800/80 p-1 relative">
          <canvas
            ref={annealingRef}
            className="w-full h-full block"
            aria-label="กราฟเส้นโค้งอบลดความเครียดในเตา Annealing Lehr"
          />
        </div>
      </div>

      {/* Polariscope Photoelastic Stress View */}
      <div className="md:col-span-5 bg-[#0e1525] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              กล้องโพลาไรซ์ (Polariscope)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ตรวจแถบสีความเค้นตกค้างในเนื้อแก้ว
            </p>
          </div>
          <span
            className={`text-xs font-mono font-semibold shrink-0 ${
              isHighStress ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isHighStress ? 'HIGH STRESS' : 'GRADE A'}
          </span>
        </div>
        <div className="w-full h-[175px] bg-slate-950/90 rounded-lg border border-slate-800/80 relative overflow-hidden">
          <canvas
            ref={polariscopeRef}
            className="w-full h-full block"
            aria-label="ภาพจำลองการตรวจสอบความเค้นตกค้างด้วยกล้องโพลาไรซ์"
          />
        </div>
      </div>
    </div>
  );
};
