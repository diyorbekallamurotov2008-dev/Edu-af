export type SM2State = { repetitions: number; intervalDays: number; easeFactor: number };

export function nextSm2(state: SM2State, quality: number): SM2State {
  let { repetitions, intervalDays, easeFactor } = state;
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
  }
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, Number(easeFactor.toFixed(2)));
  return { repetitions, intervalDays, easeFactor };
}
