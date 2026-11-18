import React, { useEffect, useRef } from 'react';
import { STATIONS_DATA } from '../data/glassData';
import { SimControls, SimFaults, SimMetrics } from '../types/simulation';

interface ProcessCanvasProps {
  controls: SimControls;
  faults: SimFaults;
  metrics: SimMetrics;
  isPlaying: boolean;
  speedMultiplier: number;
  selectedStation: number;
  guidedTourActive: boolean;
  onSelectStation: (index: number) => void;
  onTickTime?: (simTimeSec: number) => void;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
}

interface Gob {
  progress: number;
}

interface WareItem {
  x: number;
  y: number;
  shape: 'h28' | 'press' | 'is';
  defect: 'DEFORMED' | 'BLISTER' | 'CRACK' | null;
  scanned: boolean;
  rejected: boolean;
  rejectY: number;
  coatingLevel: number;
}

interface CulletParticle {
  progress: number;
  size: number;
  color: string;
}

const LOGICAL_W = 1400;
const LOGICAL_H = 470;

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function getCulletLoopCoords(t: number) {
  const d1 = 47 / 1434;
  const d2 = (47 + 1080) / 1434;
  if (t < d1) {
    const local = t / d1;
    return { x: 1235, y: 375 + local * 47 };
  }
  if (t < d2) {
    const local = (t - d1) / (d2 - d1);
    return { x: 1235 - local * 1080, y: 422 };
  }
  const local = (t - d2) / (1 - d2);
  return { x: 155, y: 422 - local * 307 };
}

export const ProcessCanvas: React.FC<ProcessCanvasProps> = ({
  controls,
  faults,
  metrics,
  isPlaying,
  speedMultiplier,
  selectedStation,
  guidedTourActive,
  onSelectStation,
  onTickTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Keep latest props in a ref so the animation loop never restarts on slider drag
  const latestRef = useRef({
    controls,
    faults,
    metrics,
    isPlaying,
    speedMultiplier,
    selectedStation,
    guidedTourActive,
    onTickTime,
  });

  useEffect(() => {
    latestRef.current = {
      controls,
      faults,
      metrics,
      isPlaying,
      speedMultiplier,
      selectedStation,
      guidedTourActive,
      onTickTime,
    };
  }, [
    controls,
    faults,
    metrics,
    isPlaying,
    speedMultiplier,
    selectedStation,
    guidedTourActive,
    onTickTime,
  ]);

  // Smoothly scroll the selected station into view during Guided Tour
  useEffect(() => {
    if (!guidedTourActive || !wrapperRef.current) return;
    const st = STATIONS_DATA[selectedStation];
    if (!st) return;
    const wrapper = wrapperRef.current;
    const targetCenter = ((st.x + st.w / 2) / LOGICAL_W) * wrapper.scrollWidth;
    wrapper.scrollTo({
      left: Math.max(0, targetCenter - wrapper.clientWidth / 2),
      behavior: 'smooth',
    });
  }, [selectedStation, guidedTourActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createWareItem = (startX: number): WareItem => {
      const { controls: c, metrics: m } = latestRef.current;
      const hasBlister = Math.random() < m.defectBreakdown.blister;
      const hasDeform = Math.random() < m.defectBreakdown.deformed;
      const hasStressCrack = Math.random() < m.defectBreakdown.stressCrack;

      let defectType: WareItem['defect'] = null;
      if (hasDeform) defectType = 'DEFORMED';
      else if (hasBlister) defectType = 'BLISTER';
      else if (hasStressCrack) defectType = 'CRACK';

      return {
        x: startX,
        y: 256,
        shape: c.formingMode,
        defect: defectType,
        scanned: false,
        rejected: false,
        rejectY: 0,
        coatingLevel: 0,
      };
    };

    // Internal mutable simulation entities
    const entities = {
      time: 0,
      lastTimestamp: 0,
      lastTimeNotify: 0,
      burnerSide: 'left' as 'left' | 'right',
      burnerTimer: 0,
      gobTimer: 0,
      packedBoxes: 0,
      bubbles: Array.from({ length: 18 }, () => ({
        x: 295 + Math.random() * 115,
        y: 235 + Math.random() * 45,
        r: 1.5 + Math.random() * 2.5,
        vy: 8 + Math.random() * 14,
      })) as Bubble[],
      gobs: [] as Gob[],
      wareItems: [690, 750, 820, 890, 960, 1045, 1120, 1205].map((px) =>
        createWareItem(px)
      ),
      culletParticles: Array.from({ length: 14 }, (_, i) => ({
        progress: i / 14,
        size: 3 + Math.random() * 2.5,
        color: Math.random() > 0.3 ? '#38bdf8' : '#34d399',
      })) as CulletParticle[],
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    resize();
    window.addEventListener('resize', resize);

    const drawBurnerFlame = (x: number, y: number, dir: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(dir * scale, scale);
      const grad = ctx.createLinearGradient(0, 0, 58, 0);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.3, '#fbbf24');
      grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(32, -14, 62, 0);
      ctx.quadraticCurveTo(32, 14, 0, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const updateEntities = (dt: number) => {
      const { controls: c, faults: f, metrics: m, speedMultiplier: speed, onTickTime: notify } =
        latestRef.current;

      const effectiveDt = dt * speed;
      entities.time += effectiveDt;

      // Throttle time callback when gasPressure fault oscillates telemetry
      if (f.gasPressure && notify && entities.time - entities.lastTimeNotify > 0.12) {
        entities.lastTimeNotify = entities.time;
        notify(entities.time);
      }

      entities.burnerTimer += effectiveDt;
      if (entities.burnerTimer > 3.5) {
        entities.burnerTimer = 0;
        entities.burnerSide = entities.burnerSide === 'left' ? 'right' : 'left';
      }

      const riseFactor = Math.max(0.35, (m.effectiveTemp - 1380) / 140);
      entities.bubbles.forEach((b) => {
        b.y -= b.vy * riseFactor * effectiveDt;
        b.x += 5 * effectiveDt;
        if (b.y < 216 || b.x > 415) {
          b.x = 285 + Math.random() * 120;
          b.y = 265 + Math.random() * 18;
        }
      });

      const spawnInterval = 34 / c.gobSpeed;
      entities.gobTimer += effectiveDt;
      if (entities.gobTimer >= spawnInterval) {
        entities.gobTimer = 0;
        entities.gobs.push({ progress: 0 });
      }

      for (let i = entities.gobs.length - 1; i >= 0; i--) {
        const g = entities.gobs[i];
        g.progress += effectiveDt * 2.2;
        if (g.progress >= 1) {
          entities.gobs.splice(i, 1);
          entities.wareItems.push(createWareItem(685));
        }
      }

      const conveyorSpeed = 62 + (c.gobSpeed - 20) * 0.45;
      for (let i = entities.wareItems.length - 1; i >= 0; i--) {
        const item = entities.wareItems[i];
        if (!item.rejected) {
          item.x += conveyorSpeed * effectiveDt;
          if (item.x > 1045 && item.coatingLevel < 1) item.coatingLevel = 1;
          if (item.x > 1125 && item.coatingLevel < 2) item.coatingLevel = 2;

          if (item.x >= 1220 && !item.scanned) {
            item.scanned = true;
            if (item.defect !== null) {
              item.rejected = true;
            }
          }

          if (item.x >= 1345) {
            entities.packedBoxes++;
            entities.wareItems.splice(i, 1);
          }
        } else {
          item.rejectY += 130 * effectiveDt;
          item.x += 12 * effectiveDt;
          if (item.rejectY >= 125) {
            entities.wareItems.splice(i, 1);
            entities.culletParticles.push({
              progress: 0,
              size: 3.5 + Math.random() * 2,
              color: '#38bdf8',
            });
          }
        }
      }

      const culletLoopSpeed = 0.08 + (c.culletRatio / 50) * 0.07;
      for (let i = entities.culletParticles.length - 1; i >= 0; i--) {
        const p = entities.culletParticles[i];
        p.progress += culletLoopSpeed * effectiveDt;
        if (p.progress >= 1) {
          if (entities.culletParticles.length > 22) {
            entities.culletParticles.splice(i, 1);
          } else {
            p.progress = 0;
          }
        }
      }
    };

    const render = () => {
      const {
        controls: c,
        faults: f,
        metrics: m,
        selectedStation: selIdx,
        guidedTourActive: tourActive,
      } = latestRef.current;

      const scaleX = canvas.width / LOGICAL_W;
      const scaleY = canvas.height / LOGICAL_H;

      ctx.save();
      ctx.scale(scaleX, scaleY);
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // 1. Cullet Closed-Loop Return Pipe
      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(1235, 375);
      ctx.lineTo(1235, 422);
      ctx.lineTo(155, 422);
      ctx.lineTo(155, 115);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = entities.time * 28;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#0e7490';
      ctx.lineWidth = 1;
      roundRect(ctx, 550, 410, 310, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.font = '600 11px "Noto Sans Thai", "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `CULLET CLOSED-LOOP RECYCLING (${c.culletRatio}% Cullet Mix)`,
        705,
        426
      );

      entities.culletParticles.forEach((p) => {
        const pos = getCulletLoopCoords(p.progress);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 2. Main Conveyor Belt
      ctx.save();
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, 675, 260, 680, 10, 4);
      ctx.fill();
      ctx.fillStyle = '#475569';
      const offset = (entities.time * 40) % 24;
      for (let x = 685 + offset; x < 1345; x += 24) {
        ctx.beginPath();
        ctx.arc(x, 265, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Station 1: Batch House
      ctx.save();
      const silos = [
        { label: 'SiO₂', sub: 'ทราย', x: 32, color: '#eab308' },
        { label: 'Na₂CO₃', sub: 'โซดา', x: 68, color: '#94a3b8' },
        { label: 'CaCO₃', sub: 'หินปูน', x: 104, color: '#cbd5e1' },
        { label: 'Cullet', sub: `${c.culletRatio}%`, x: 140, color: '#06b6d4' },
      ];
      silos.forEach((s) => {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        roundRect(ctx, s.x, 82, 28, 56, 4);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(s.x, 138);
        ctx.lineTo(s.x + 14, 156);
        ctx.lineTo(s.x + 28, 138);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.label, s.x + 14, 104);
        ctx.fillStyle = s.color;
        ctx.font = '9px "Noto Sans Thai", sans-serif';
        ctx.fillText(s.sub, s.x + 14, 122);
      });

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      roundRect(ctx, 48, 172, 104, 48, 8);
      ctx.fill();
      ctx.stroke();

      const angle = entities.time * 4;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        const px = 72 + i * 28 + Math.sin(angle + i) * 7;
        ctx.beginPath();
        ctx.moveTo(px, 178);
        ctx.lineTo(px, 214);
        ctx.stroke();
      }
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 10px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INTENSIVE MIXER', 100, 233);

      ctx.fillStyle = '#334155';
      roundRect(ctx, 135, 244, 72, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      const screwShift = (entities.time * 25) % 12;
      for (let sx = 142 + screwShift; sx < 200; sx += 12) {
        ctx.beginPath();
        ctx.moveTo(sx, 246);
        ctx.lineTo(sx - 5, 260);
        ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "Noto Sans Thai", sans-serif';
      ctx.fillText('Batch Charger', 165, 276);
      ctx.restore();

      // 4. Station 2: Melting Furnace & Forehearth
      ctx.save();
      ctx.fillStyle = '#1e1b18';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      roundRect(ctx, 212, 132, 220, 158, 10);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(215, 155);
      ctx.quadraticCurveTo(322, 112, 429, 155);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.stroke();

      const tempNorm = Math.max(0, Math.min(1, (m.effectiveTemp - 1400) / 200));
      const glassGrad = ctx.createLinearGradient(220, 210, 425, 280);
      if (tempNorm > 0.6) {
        glassGrad.addColorStop(0, '#ff4500');
        glassGrad.addColorStop(0.5, '#ff8c00');
        glassGrad.addColorStop(1, '#fbbf24');
      } else if (tempNorm > 0.3) {
        glassGrad.addColorStop(0, '#dc2626');
        glassGrad.addColorStop(0.6, '#ea580c');
        glassGrad.addColorStop(1, '#f59e0b');
      } else {
        glassGrad.addColorStop(0, '#991b1b');
        glassGrad.addColorStop(1, '#c2410c');
      }

      ctx.fillStyle = glassGrad;
      roundRect(ctx, 220, 212, 204, 70, 6);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(315, 150);
      ctx.lineTo(315, 280);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MELTING', 268, 205);
      ctx.fillText('REFINING', 368, 205);

      const flameFlicker = 1 + Math.sin(entities.time * 24) * 0.14;
      if (entities.burnerSide === 'left') {
        drawBurnerFlame(224, 175, 1, flameFlicker);
      } else {
        drawBurnerFlame(420, 175, -1, flameFlicker);
      }

      entities.bubbles.forEach((b) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = f.gasPressure ? '#ef4444' : '#f97316';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 272, 146, 100, 24, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = f.gasPressure ? '#fda4af' : '#fb923c';
      ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
      ctx.fillText(`${Math.round(m.effectiveTemp)} °C`, 322, 162);

      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2;
      roundRect(ctx, 424, 212, 65, 26, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      roundRect(ctx, 424, 218, 62, 14, 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px "JetBrains Mono", sans-serif';
      ctx.fillText('Forehearth', 456, 204);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('~1,150°C', 456, 250);
      ctx.restore();

      // 5. Station 3: Gob Feeder & Shears
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      roundRect(ctx, 488, 198, 36, 42, 6);
      ctx.fill();
      ctx.stroke();

      const cycle = (entities.gobTimer / (34 / c.gobSpeed)) * Math.PI * 2;
      const plungerOffset = Math.sin(cycle) * 10;

      ctx.fillStyle = '#94a3b8';
      roundRect(ctx, 501, 152 + plungerOffset, 10, 52, 3);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Plunger', 506, 145);

      const shearClose = Math.max(0, Math.sin(cycle - Math.PI * 1.2)) * 8;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(484 + shearClose, 244);
      ctx.lineTo(502 + shearClose, 248);
      ctx.lineTo(484 + shearClose, 252);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(528 - shearClose, 244);
      ctx.lineTo(510 - shearClose, 248);
      ctx.lineTo(528 - shearClose, 252);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px "JetBrains Mono", sans-serif';
      ctx.fillText('Shears', 548, 251);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(506, 256);
      ctx.quadraticCurveTo(512, 305, 610, 295);
      ctx.stroke();
      ctx.restore();

      // 6. Station 4: Forming Machine
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = f.coolingAir ? '#ef4444' : '#334155';
      ctx.lineWidth = 2;
      roundRect(ctx, 600, 142, 155, 165, 10);
      ctx.fill();
      ctx.stroke();

      const moldHeatColor = f.coolingAir ? '#ef4444' : '#475569';
      const pulseY = Math.sin(entities.time * 6) * 8;

      if (c.formingMode === 'h28') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = moldHeatColor;
        ctx.lineWidth = 2.5;
        roundRect(ctx, 622, 215, 42, 46, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        roundRect(ctx, 632, 222, 22, 34, 4);
        ctx.fill();

        ctx.fillStyle = '#64748b';
        roundRect(ctx, 704, 168, 12, 28, 3);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(706, 196);
        ctx.lineTo(710, 222 + Math.sin(entities.time * 30) * 3);
        ctx.lineTo(714, 196);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FIRE POLISH', 712, 160);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Paste Mold', 643, 276);
      } else if (c.formingMode === 'press') {
        ctx.fillStyle = '#334155';
        roundRect(ctx, 635, 154, 34, 24, 4);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        roundRect(ctx, 646, 178 + pulseY, 12, 38, 3);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = moldHeatColor;
        ctx.lineWidth = 3;
        roundRect(ctx, 628, 222, 48, 40, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        roundRect(ctx, 636, 230, 32, 26, 3);
        ctx.fill();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS PLUNGER', 678, 165);
        ctx.fillText('Rotary Table', 652, 276);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = moldHeatColor;
        ctx.lineWidth = 2;
        roundRect(ctx, 616, 212, 34, 48, 5);
        ctx.fill();
        ctx.stroke();
        roundRect(ctx, 668, 212, 38, 48, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
        roundRect(ctx, 682, 180 + pulseY * 0.5, 10, 30, 2);
        ctx.fill();

        ctx.fillStyle = '#fb923c';
        roundRect(ctx, 625, 222, 16, 32, 6);
        ctx.fill();
        roundRect(ctx, 676, 218, 22, 38, 8);
        ctx.fill();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BLANK → BLOW', 662, 165);
        ctx.fillText('IS Section', 662, 276);
      }

      ctx.fillStyle = f.coolingAir ? '#ef4444' : '#22d3ee';
      ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        f.coolingAir ? 'ALARM: COOLING AIR 35%' : 'COOLING AIR OK',
        677,
        296
      );
      ctx.restore();

      // 7. Station 5: Annealing Lehr Tunnel
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      roundRect(ctx, 785, 172, 220, 96, 8);
      ctx.fill();
      ctx.stroke();

      const lehrGrad = ctx.createLinearGradient(792, 0, 998, 0);
      lehrGrad.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
      if (c.annealingRate === 'fast') {
        lehrGrad.addColorStop(0.32, 'rgba(6, 182, 212, 0.35)');
        lehrGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
      } else if (c.annealingRate === 'slow') {
        lehrGrad.addColorStop(0.75, 'rgba(245, 158, 11, 0.35)');
        lehrGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
      } else {
        lehrGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.3)');
        lehrGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
      }
      ctx.fillStyle = lehrGrad;
      roundRect(ctx, 792, 195, 206, 62, 4);
      ctx.fill();

      for (let fx = 820; fx <= 970; fx += 50) {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fx, 165, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const fAngle = entities.time * 8 + fx;
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(fx + Math.cos(fAngle) * 7, 165 + Math.sin(fAngle) * 7);
        ctx.lineTo(fx - Math.cos(fAngle) * 7, 165 - Math.sin(fAngle) * 7);
        ctx.stroke();
      }

      ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
      ctx.fillStyle = '#fb923c';
      ctx.textAlign = 'left';
      ctx.fillText('550°C', 796, 188);
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('ANNEALING LEHR', 895, 188);
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'right';
      ctx.fillText('65°C', 994, 188);
      ctx.restore();

      // 8. Station 6: Surface Coating
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 1032, 185, 46, 34, 5);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#06b6d4';
      roundRect(ctx, 1102, 185, 46, 34, 5);
      ctx.fill();
      ctx.stroke();

      const mistPulse = 0.35 + Math.sin(entities.time * 10) * 0.2;
      ctx.fillStyle = `rgba(251, 191, 36, ${mistPulse})`;
      ctx.beginPath();
      ctx.moveTo(1055, 219);
      ctx.lineTo(1040, 258);
      ctx.lineTo(1070, 258);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(34, 211, 238, ${mistPulse})`;
      ctx.beginPath();
      ctx.moveTo(1125, 219);
      ctx.lineTo(1110, 258);
      ctx.lineTo(1140, 258);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 8.5px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HOT COAT', 1055, 178);
      ctx.fillText('SnCl₄', 1055, 205);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('COLD COAT', 1125, 178);
      ctx.fillText('PE/WAX', 1125, 205);
      ctx.restore();

      // 9. Station 7: Cold-End QC, Packaging & Cullet Crusher
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      roundRect(ctx, 1192, 165, 56, 44, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LASER QC', 1220, 184);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", sans-serif';
      ctx.fillText('100% SCAN', 1220, 198);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.lineWidth = 1.5;
      const scanShift = Math.sin(entities.time * 14) * 10;
      ctx.beginPath();
      ctx.moveTo(1220, 209);
      ctx.lineTo(1220 + scanShift, 258);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(1235, 272);
      ctx.lineTo(1235, 325);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      roundRect(ctx, 1196, 326, 78, 46, 6);
      ctx.fill();
      ctx.stroke();

      const rAngle = entities.time * 6;
      [1220, 1250].forEach((rx, idx) => {
        ctx.strokeStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(rx, 346, 9, 0, Math.PI * 2);
        ctx.stroke();
        const dir = idx === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(rx + Math.cos(rAngle * dir) * 9, 346 + Math.sin(rAngle * dir) * 9);
        ctx.lineTo(rx - Math.cos(rAngle * dir) * 9, 346 - Math.sin(rAngle * dir) * 9);
        ctx.stroke();
      });

      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 8.5px "JetBrains Mono", sans-serif';
      ctx.fillText('CULLET CRUSHER', 1235, 367);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      roundRect(ctx, 1310, 215, 62, 65, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d97706';
      roundRect(ctx, 1318, 254, 20, 16, 2);
      ctx.fill();
      roundRect(ctx, 1342, 254, 20, 16, 2);
      ctx.fill();
      roundRect(ctx, 1328, 235, 24, 16, 2);
      ctx.fill();

      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 8.5px "JetBrains Mono", sans-serif';
      ctx.fillText('PACK & PALLET', 1341, 207);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`BOXES: ${entities.packedBoxes}`, 1341, 294);
      ctx.restore();

      // 10. Falling Gobs
      ctx.save();
      entities.gobs.forEach((g) => {
        const t = g.progress;
        const x = (1 - t) * (1 - t) * 506 + 2 * (1 - t) * t * 512 + t * t * 615;
        const y = (1 - t) * (1 - t) * 246 + 2 * (1 - t) * t * 302 + t * t * 265;
        ctx.fillStyle = '#ff6b00';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 11, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 11. Ware Items along Conveyor
      ctx.save();
      entities.wareItems.forEach((item) => {
        const x = item.x;
        const y = item.y + item.rejectY;

        let fillCol = '#38bdf8';
        let strokeCol = '#bae6fd';
        if (x < 785) {
          fillCol = 'rgba(251, 146, 60, 0.85)';
          strokeCol = '#fed7aa';
        } else if (x < 1005) {
          const t = (x - 785) / 220;
          if (t < 0.45) {
            fillCol = 'rgba(249, 115, 22, 0.7)';
            strokeCol = '#fdba74';
          } else {
            fillCol = 'rgba(56, 189, 248, 0.55)';
            strokeCol = '#bae6fd';
          }
        } else {
          fillCol = item.rejected
            ? 'rgba(244, 63, 94, 0.75)'
            : 'rgba(56, 189, 248, 0.45)';
          strokeCol = item.rejected ? '#fda4af' : '#e0f2fe';
        }

        ctx.fillStyle = fillCol;
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        if (item.defect === 'DEFORMED') {
          ctx.moveTo(x - 7, y);
          ctx.lineTo(x - 3, y - 22);
          ctx.lineTo(x + 10, y - 20);
          ctx.lineTo(x + 6, y);
          ctx.closePath();
        } else if (item.shape === 'h28') {
          ctx.moveTo(x - 6, y);
          ctx.lineTo(x - 7, y - 24);
          ctx.lineTo(x + 7, y - 24);
          ctx.lineTo(x + 6, y);
          ctx.closePath();
        } else if (item.shape === 'press') {
          ctx.moveTo(x - 8, y);
          ctx.lineTo(x - 10, y - 16);
          ctx.lineTo(x + 10, y - 16);
          ctx.lineTo(x + 8, y);
          ctx.closePath();
        } else {
          ctx.moveTo(x - 6, y);
          ctx.lineTo(x - 6, y - 15);
          ctx.lineTo(x - 3, y - 20);
          ctx.lineTo(x - 3, y - 27);
          ctx.lineTo(x + 3, y - 27);
          ctx.lineTo(x + 3, y - 20);
          ctx.lineTo(x + 6, y - 15);
          ctx.lineTo(x + 6, y);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        if (item.defect === 'BLISTER') {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(x, y - 11, 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.defect === 'CRACK') {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 3, y - 16);
          ctx.lineTo(x + 2, y - 10);
          ctx.lineTo(x - 2, y - 4);
          ctx.stroke();
        }

        if (item.rejected && item.defect) {
          ctx.fillStyle = '#e11d48';
          ctx.font = 'bold 8px "JetBrains Mono", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.defect, x, y - 30);
        }
      });
      ctx.restore();

      // 12. Station Overlays & Focus Outlines
      ctx.save();
      STATIONS_DATA.forEach((st, idx) => {
        const isSelected = selIdx === idx;
        if (tourActive && !isSelected) {
          ctx.fillStyle = 'rgba(7, 11, 20, 0.55)';
          roundRect(ctx, st.x, 42, st.w, 336, 10);
          ctx.fill();
        }

        ctx.fillStyle = isSelected ? '#ea580c' : '#1e293b';
        ctx.strokeStyle = isSelected ? '#fdba74' : '#334155';
        ctx.lineWidth = isSelected ? 2 : 1;
        roundRect(ctx, st.x + 4, 46, st.w - 8, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.font = 'bold 10.5px "Noto Sans Thai", "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st.shortName, st.x + st.w / 2, 62);

        if (isSelected) {
          ctx.strokeStyle = tourActive ? '#22d3ee' : 'rgba(249, 115, 22, 0.78)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          roundRect(ctx, st.x, 42, st.w, 336, 10);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      ctx.restore();

      ctx.restore();
    };

    let rafId = 0;
    const loop = (timestamp: number) => {
      if (!entities.lastTimestamp) entities.lastTimestamp = timestamp;
      const dt = Math.min(0.05, (timestamp - entities.lastTimestamp) / 1000);
      entities.lastTimestamp = timestamp;

      if (latestRef.current.isPlaying) {
        updateEntities(dt);
      }
      render();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * LOGICAL_W;
    const clickY = ((e.clientY - rect.top) / rect.height) * LOGICAL_H;

    if (clickY >= 35 && clickY <= 375) {
      for (let i = 0; i < STATIONS_DATA.length; i++) {
        const st = STATIONS_DATA[i];
        if (clickX >= st.x && clickX <= st.x + st.w) {
          onSelectStation(i);
          break;
        }
      }
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-x-auto scada-grid-bg select-none"
    >
      <div className="min-w-[1050px] w-full h-[420px] sm:h-[460px] relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer"
          aria-label="แผนผังสายการผลิตแก้วอุตสาหกรรมแบบโต้ตอบ 7 สถานี"
        />
      </div>
    </div>
  );
};
