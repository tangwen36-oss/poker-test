import { resultsData } from '../data/results';

const MAIN_ARCHETYPES = ['NIT', 'TAG', 'LAG', 'CALLING', 'LAG_FISH'];

export function getRawScores(answers: Record<string, number>[]) {
  const rawScores: Record<string, number> = {
    NIT: 0, TAG: 0, LAG: 0, CALLING: 0, LAG_FISH: 0, TILT: 0
  };
  answers.forEach(ans => {
    Object.entries(ans).forEach(([type, score]) => {
      if (rawScores[type] !== undefined) {
        rawScores[type] += score;
      } else {
        rawScores[type] = score;
      }
    });
  });
  return rawScores;
}

export function getMaxPossibleScores(questions: any[]) {
  const maxScores: Record<string, number> = {
    NIT: 0, TAG: 0, LAG: 0, CALLING: 0, LAG_FISH: 0, TILT: 0
  };
  questions.forEach(q => {
    const qMax: Record<string, number> = {};
    q.options.forEach((opt: any) => {
      Object.entries(opt.scores).forEach(([type, score]) => {
        const numScore = score as number;
        if (!qMax[type] || numScore > qMax[type]) {
          qMax[type] = numScore;
        }
      });
    });
    Object.entries(qMax).forEach(([type, max]) => {
      if (maxScores[type] !== undefined) {
        maxScores[type] += max;
      } else {
        maxScores[type] = max;
      }
    });
  });
  return maxScores;
}

export function getNormalizedScores(rawScores: Record<string, number>, maxScores: Record<string, number>) {
  const normalized: Record<string, number> = {};
  Object.keys(maxScores).forEach(type => {
    if (maxScores[type] > 0) {
      normalized[type] = (rawScores[type] || 0) / maxScores[type];
    } else {
      normalized[type] = 0;
    }
  });
  return normalized;
}

export function getFinalResult(answers: Record<string, number>[], questions: any[]) {
  const rawScores = getRawScores(answers);
  const maxPossibleScores = getMaxPossibleScores(questions);
  const normalizedScores = getNormalizedScores(rawScores, maxPossibleScores);

  const sortedMain = MAIN_ARCHETYPES.map(type => ({
    type,
    raw: rawScores[type] || 0,
    norm: normalizedScores[type] || 0
  })).sort((a, b) => b.norm - a.norm);

  let finalType = sortedMain[0].type;
  for (const cand of sortedMain) {
    if (cand.raw >= 2) {
      finalType = cand.type;
      break;
    }
  }

  const tiltFlag = (normalizedScores['TILT'] || 0) >= 0.6;

  const result = {
    rawScores,
    maxPossibleScores,
    normalizedScores,
    finalType,
    tiltFlag
  };

  console.log("=== Scoring Debug ===");
  console.log("Raw Scores:", rawScores);
  console.log("Max Possible:", maxPossibleScores);
  console.log("Normalized:", normalizedScores);
  console.log("Sorted Main Candidates:", sortedMain);
  console.log("Final Type:", finalType);
  console.log("Tilt Flag:", tiltFlag);
  console.log("=====================");

  return result;
}
