// backend/demoEngine.js
// Transparent, non-confidential illustrative calculation rules for the NEUROMYOLATENT demo.

const MUSCLE_REGIONS = [
  // --- ANTERIOR (FRONT) ---
  {
    id: 'neck_anterior',
    name: 'Cervical / Sternocleidomastoid',
    view: 'anterior',
    side: 'midline',
    weights: { activity: 0.5, movement: 0.2, pressure: 0.3 },
    baseSensitivity: 0.9,
    description: 'Anterior cervical flexors and stabilizing neck musculature.'
  },
  {
    id: 'chest_pectoral',
    name: 'Pectoralis Major',
    view: 'anterior',
    side: 'bilateral',
    weights: { activity: 0.5, movement: 0.3, pressure: 0.2 },
    baseSensitivity: 0.85,
    description: 'Upper torso anterior chain responsible for humerus adduction and internal rotation.'
  },
  {
    id: 'deltoid_anterior_l',
    name: 'Anterior Deltoid (Left)',
    view: 'anterior',
    side: 'left',
    weights: { activity: 0.45, movement: 0.4, pressure: 0.15 },
    baseSensitivity: 0.9,
    description: 'Left shoulder anterior head involved in forward arm flexion.'
  },
  {
    id: 'deltoid_anterior_r',
    name: 'Anterior Deltoid (Right)',
    view: 'anterior',
    side: 'right',
    weights: { activity: 0.45, movement: 0.4, pressure: 0.15 },
    baseSensitivity: 0.9,
    description: 'Right shoulder anterior head involved in forward arm flexion.'
  },
  {
    id: 'biceps_l',
    name: 'Biceps Brachii (Left)',
    view: 'anterior',
    side: 'left',
    weights: { activity: 0.6, movement: 0.3, pressure: 0.1 },
    baseSensitivity: 0.88,
    description: 'Left elbow flexor and forearm supinator.'
  },
  {
    id: 'biceps_r',
    name: 'Biceps Brachii (Right)',
    view: 'anterior',
    side: 'right',
    weights: { activity: 0.6, movement: 0.3, pressure: 0.1 },
    baseSensitivity: 0.88,
    description: 'Right elbow flexor and forearm supinator.'
  },
  {
    id: 'abdominals',
    name: 'Rectus Abdominis / Core',
    view: 'anterior',
    side: 'midline',
    weights: { activity: 0.4, movement: 0.35, pressure: 0.25 },
    baseSensitivity: 0.95,
    description: 'Central lumbo-pelvic stabilizer and trunk flexor.'
  },
  {
    id: 'quadriceps_l',
    name: 'Quadriceps Femoris (Left)',
    view: 'anterior',
    side: 'left',
    weights: { activity: 0.45, movement: 0.25, pressure: 0.3 },
    baseSensitivity: 1.05,
    description: 'Left knee extensor bearing primary weight and kinetic deceleration.'
  },
  {
    id: 'quadriceps_r',
    name: 'Quadriceps Femoris (Right)',
    view: 'anterior',
    side: 'right',
    weights: { activity: 0.45, movement: 0.25, pressure: 0.3 },
    baseSensitivity: 1.05,
    description: 'Right knee extensor bearing primary weight and kinetic deceleration.'
  },
  {
    id: 'tibialis_l',
    name: 'Tibialis Anterior (Left)',
    view: 'anterior',
    side: 'left',
    weights: { activity: 0.4, movement: 0.45, pressure: 0.15 },
    baseSensitivity: 0.85,
    description: 'Left ankle dorsiflexor essential for foot clearance during gait.'
  },
  {
    id: 'tibialis_r',
    name: 'Tibialis Anterior (Right)',
    view: 'anterior',
    side: 'right',
    weights: { activity: 0.4, movement: 0.45, pressure: 0.15 },
    baseSensitivity: 0.85,
    description: 'Right ankle dorsiflexor essential for foot clearance during gait.'
  },

  // --- POSTERIOR (BACK) ---
  {
    id: 'trapezius_upper',
    name: 'Upper Trapezius / Cervical Spinae',
    view: 'posterior',
    side: 'midline',
    weights: { activity: 0.55, movement: 0.2, pressure: 0.25 },
    baseSensitivity: 1.1,
    description: 'Scapular elevator and cervical stabilizer prone to postural hypertension.'
  },
  {
    id: 'deltoid_posterior_l',
    name: 'Posterior Deltoid (Left)',
    view: 'posterior',
    side: 'left',
    weights: { activity: 0.5, movement: 0.35, pressure: 0.15 },
    baseSensitivity: 0.88,
    description: 'Left posterior shoulder head providing horizontal arm abduction.'
  },
  {
    id: 'deltoid_posterior_r',
    name: 'Posterior Deltoid (Right)',
    view: 'posterior',
    side: 'right',
    weights: { activity: 0.5, movement: 0.35, pressure: 0.15 },
    baseSensitivity: 0.88,
    description: 'Right posterior shoulder head providing horizontal arm abduction.'
  },
  {
    id: 'triceps_l',
    name: 'Triceps Brachii (Left)',
    view: 'posterior',
    side: 'left',
    weights: { activity: 0.55, movement: 0.3, pressure: 0.15 },
    baseSensitivity: 0.85,
    description: 'Left elbow extensor.'
  },
  {
    id: 'triceps_r',
    name: 'Triceps Brachii (Right)',
    view: 'posterior',
    side: 'right',
    weights: { activity: 0.55, movement: 0.3, pressure: 0.15 },
    baseSensitivity: 0.85,
    description: 'Right elbow extensor.'
  },
  {
    id: 'latissimus',
    name: 'Latissimus Dorsi / Thoracic Back',
    view: 'posterior',
    side: 'bilateral',
    weights: { activity: 0.45, movement: 0.35, pressure: 0.2 },
    baseSensitivity: 0.92,
    description: 'Broad back muscle responsible for pull and spinal extension.'
  },
  {
    id: 'lumbar_erectors',
    name: 'Lumbar Erector Spinae (Lower Back)',
    view: 'posterior',
    side: 'midline',
    weights: { activity: 0.4, movement: 0.25, pressure: 0.35 },
    baseSensitivity: 1.15,
    description: 'Deep lumbar stabilizers subjected to heavy compressive and shear loading.'
  },
  {
    id: 'gluteus_l',
    name: 'Gluteus Maximus (Left)',
    view: 'posterior',
    side: 'left',
    weights: { activity: 0.45, movement: 0.25, pressure: 0.3 },
    baseSensitivity: 1.0,
    description: 'Left primary hip extensor and pelvic power generator.'
  },
  {
    id: 'gluteus_r',
    name: 'Gluteus Maximus (Right)',
    view: 'posterior',
    side: 'right',
    weights: { activity: 0.45, movement: 0.25, pressure: 0.3 },
    baseSensitivity: 1.0,
    description: 'Right primary hip extensor and pelvic power generator.'
  },
  {
    id: 'hamstrings_l',
    name: 'Hamstrings (Left)',
    view: 'posterior',
    side: 'left',
    weights: { activity: 0.5, movement: 0.3, pressure: 0.2 },
    baseSensitivity: 1.02,
    description: 'Left posterior thigh knee flexor and hip extensor.'
  },
  {
    id: 'hamstrings_r',
    name: 'Hamstrings (Right)',
    view: 'posterior',
    side: 'right',
    weights: { activity: 0.5, movement: 0.3, pressure: 0.2 },
    baseSensitivity: 1.02,
    description: 'Right posterior thigh knee flexor and hip extensor.'
  },
  {
    id: 'gastrocnemius_l',
    name: 'Gastrocnemius / Calf (Left)',
    view: 'posterior',
    side: 'left',
    weights: { activity: 0.45, movement: 0.35, pressure: 0.2 },
    baseSensitivity: 0.95,
    description: 'Left calf muscle driving ankle plantarflexion and propulsion.'
  },
  {
    id: 'gastrocnemius_r',
    name: 'Gastrocnemius / Calf (Right)',
    view: 'posterior',
    side: 'right',
    weights: { activity: 0.45, movement: 0.35, pressure: 0.2 },
    baseSensitivity: 0.95,
    description: 'Right calf muscle driving ankle plantarflexion and propulsion.'
  }
];

const CATEGORY_COLORS = Object.freeze({
  'Low': '#00c2cb',       // Cyan / Cool medical tone
  'Moderate': '#f59e0b',  // Warm Amber / Alert
  'Elevated': '#ef4444',  // Coral Red / Warning
  'No Data': '#64748b'    // Slate Grey / Inactive
});

function clampNumber(val, min = 0, max = 100, defaultVal = 0) {
  const num = Number(val);
  if (!Number.isFinite(num) || Number.isNaN(num)) return defaultVal;
  return Math.min(max, Math.max(min, num));
}

function computeDashboardState(inputs = {}, scenarioModifiers = {}) {
  // Input sanitization & security clamping
  const safeInputs = inputs && typeof inputs === 'object' ? inputs : {};
  const safeModifiers = scenarioModifiers && typeof scenarioModifiers === 'object' ? scenarioModifiers : {};

  const muscleActivity = clampNumber(safeInputs.muscleActivity, 0, 100, 25);
  const movementLevel = clampNumber(safeInputs.movementLevel, 0, 100, 15);
  const pressureLoad = clampNumber(safeInputs.pressureLoad, 0, 100, 20);
  const signalQuality = clampNumber(safeInputs.signalQuality, 0, 100, 95);

  const isLowSignalGlobally = signalQuality < 35;

  const calculatedRegions = {};
  const validScores = [];
  const categoryCounts = { 'Low': 0, 'Moderate': 0, 'Elevated': 0, 'No Data': 0 };

  MUSCLE_REGIONS.forEach((region) => {
    let modifier = 1.0;
    if (Object.prototype.hasOwnProperty.call(safeModifiers, region.id)) {
      const rawMod = Number(safeModifiers[region.id]);
      if (Number.isFinite(rawMod) && rawMod > 0 && rawMod <= 3.0) {
        modifier = rawMod;
      }
    }

    const isDegraded = isLowSignalGlobally || (
      Array.isArray(safeInputs.degradedChannels) && safeInputs.degradedChannels.includes(region.id)
    );

    if (isDegraded) {
      calculatedRegions[region.id] = {
        id: region.id,
        name: region.name,
        view: region.view,
        side: region.side,
        description: region.description,
        score: null,
        activityReading: 0,
        movementReading: 0,
        pressureReading: 0,
        signalQuality: Math.round(signalQuality * 0.3),
        category: 'No Data',
        color: CATEGORY_COLORS['No Data'],
        explanation: 'Electrode signal dropped or SNR below 35%. Illustrative channel offline or artifact detected.'
      };
      categoryCounts['No Data']++;
      return;
    }

    // Transparent illustrative formula
    const { activity, movement, pressure } = region.weights;
    const rawWeighted = (muscleActivity * activity) + (movementLevel * movement) + (pressureLoad * pressure);
    const scaledScore = rawWeighted * region.baseSensitivity * modifier;
    const finalScore = Math.min(100, Math.max(0, Math.round(scaledScore)));

    let category = 'Low';
    let explanation = 'Simulated recruitment remains within comfortable resting / light postural boundaries.';

    if (finalScore >= 70) {
      category = 'Elevated';
      explanation = 'High simulated muscle recruitment and kinetic stress relative to baseline. Highlights high-demand zone.';
    } else if (finalScore >= 40) {
      category = 'Moderate';
      explanation = 'Sub-maximal exertion observed. Normal kinetic compensation during movement or stabilizing effort.';
    }

    categoryCounts[category]++;
    validScores.push(finalScore);

    calculatedRegions[region.id] = {
      id: region.id,
      name: region.name,
      view: region.view,
      side: region.side,
      description: region.description,
      score: finalScore,
      activityReading: Math.round(muscleActivity * modifier * 0.95),
      movementReading: Math.round(movementLevel * 0.9),
      pressureReading: Math.round(pressureLoad * region.baseSensitivity),
      signalQuality: Math.round(signalQuality),
      category,
      color: CATEGORY_COLORS[category],
      explanation
    };
  });

  const min = validScores.length > 0 ? Math.min(...validScores) : 0;
  const max = validScores.length > 0 ? Math.max(...validScores) : 0;
  const mean = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  // Find peak region safely
  let peakRegion = null;
  let highestScore = -1;
  Object.values(calculatedRegions).forEach(r => {
    if (r.score !== null && r.score > highestScore) {
      highestScore = r.score;
      peakRegion = { id: r.id, name: r.name, score: r.score, category: r.category };
    }
  });

  return {
    inputs: {
      muscleActivity,
      movementLevel,
      pressureLoad,
      signalQuality
    },
    statistics: {
      min,
      max,
      mean,
      activeRegionsCount: validScores.length,
      totalRegionsCount: MUSCLE_REGIONS.length,
      categoryCounts,
      peakRegion
    },
    regions: calculatedRegions,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  MUSCLE_REGIONS,
  CATEGORY_COLORS,
  computeDashboardState,
  clampNumber
};
