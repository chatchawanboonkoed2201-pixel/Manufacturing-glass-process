import { SimControls, SimFaults, SimMetrics } from '../types/simulation';

export const DEFAULT_CONTROLS: SimControls = {
  furnaceTemp: 1520,
  culletRatio: 25,
  gobSpeed: 45,
  annealingRate: 'standard',
  formingMode: 'h28',
};

export const DEFAULT_FAULTS: SimFaults = {
  coolingAir: false,
  gasPressure: false,
};

/**
 * Computes real-time Soda-Lime glass manufacturing physics and KPIs
 * from furnace temperature, cullet ratio, gob cutting speed, annealing rate, and utility faults.
 */
export function computeEngineeringMetrics(
  controls: SimControls,
  faults: SimFaults,
  timeSec: number = 0
): SimMetrics {
  const gasFluctuation = faults.gasPressure
    ? Math.sin(timeSec * 4.5) * 42 - 25
    : 0;

  const effectiveTemp = controls.furnaceTemp + gasFluctuation;

  // 1. Glass Viscosity at Gob Feeder (Arrhenius-like inverse relation to temp)
  const visc = 3.12 - (effectiveTemp - 1520) * 0.0042;
  const viscosityLogPoise = Math.max(2.5, Math.min(3.9, visc));

  // 2. Ideal Melting Temperature shifts slightly lower with higher Cullet Ratio
  const idealTemp = 1520 - controls.culletRatio * 0.6;

  // 3. Seed/Blister Defect Probability
  let blisterProb = 0.012;
  if (effectiveTemp < idealTemp - 15) {
    blisterProb += Math.pow((idealTemp - 15 - effectiveTemp) / 45, 1.7) * 0.24;
  }
  if (faults.gasPressure) {
    blisterProb += 0.085;
  }

  // 4. Forming Deformation Probability
  let deformProb = 0.014;
  if (controls.gobSpeed > 55) {
    deformProb += Math.pow((controls.gobSpeed - 55) / 25, 1.5) * 0.18;
  }
  if (effectiveTemp > 1570) {
    deformProb += ((effectiveTemp - 1570) / 30) * 0.12;
  }
  if (faults.coolingAir) {
    deformProb += 0.22;
  }

  // 5. Residual Thermal Stress & Crack Probability
  let baseStress = 24;
  let stressCrackProb = 0.012;
  if (controls.annealingRate === 'slow') {
    baseStress = 12;
    stressCrackProb = 0.005;
  } else if (controls.annealingRate === 'standard') {
    baseStress = 24;
    stressCrackProb = 0.014;
  } else {
    baseStress = 132;
    stressCrackProb = 0.21;
  }
  if (effectiveTemp > 1565) {
    baseStress += (effectiveTemp - 1565) * 0.45;
  }
  const thermalStressNm = Math.round(baseStress);

  const defectBreakdown = {
    blister: Math.min(0.45, blisterProb),
    deformed: Math.min(0.45, deformProb),
    stressCrack: Math.min(0.45, stressCrackProb),
  };

  const totalRejectProb = Math.min(
    0.72,
    defectBreakdown.blister + defectBreakdown.deformed + defectBreakdown.stressCrack
  );

  const efficiencyPct = Math.max(25, (1 - totalRejectProb) * 100);
  const goodRatePcs = controls.gobSpeed * (efficiencyPct / 100);
  const rejectRatePcs = controls.gobSpeed - goodRatePcs;

  // 6. Specific Energy Consumption (GJ/ton)
  const culletSavingsFactor = 1 - controls.culletRatio * 0.0026;
  const tempPenalty = 1 + (controls.furnaceTemp - 1520) * 0.0014;
  const annealFactor =
    controls.annealingRate === 'slow'
      ? 1.03
      : controls.annealingRate === 'fast'
        ? 0.98
        : 1.0;

  const specificEnergyGJ = 4.65 * culletSavingsFactor * tempPenalty * annealFactor;
  const co2SavePct = controls.culletRatio * 0.3;

  return {
    effectiveTemp,
    viscosityLogPoise,
    thermalStressNm,
    specificEnergyGJ,
    co2SavePct,
    efficiencyPct,
    goodRatePcs,
    rejectRatePcs,
    defectBreakdown,
  };
}
