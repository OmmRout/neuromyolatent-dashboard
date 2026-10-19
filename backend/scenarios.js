// backend/scenarios.js
// Predefined repeatable sample scenarios for the NEUROMYOLATENT Demo Dashboard

const SCENARIOS = [
  {
    id: 'baseline_rest',
    name: 'Resting Baseline (Equilibrium)',
    description: 'Minimal resting tone across all anatomical chains. Balanced bilateral load with optimal sensor SNR.',
    sliders: {
      muscleActivity: 22,
      movementLevel: 10,
      pressureLoad: 18,
      signalQuality: 98
    },
    regionModifiers: {
      trapezius_upper: 1.0,
      lumbar_erectors: 1.0,
      quadriceps_l: 1.0,
      quadriceps_r: 1.0
    },
    notes: 'Demonstrates baseline homeostasis. All monitored channels in Low illustrative status.'
  },
  {
    id: 'lumbar_overload',
    name: 'Asymmetric Lumbar & Spine Load',
    description: 'Heavy ergonomic strain during forward bending and repetitive lifting with trunk rotation.',
    sliders: {
      muscleActivity: 78,
      movementLevel: 65,
      pressureLoad: 88,
      signalQuality: 95
    },
    regionModifiers: {
      lumbar_erectors: 1.35,
      abdominals: 1.15,
      gluteus_l: 1.1,
      gluteus_r: 0.9,
      hamstrings_l: 1.25,
      hamstrings_r: 1.05
    },
    notes: 'Demonstrates elevated lower-back and posterior-chain recruitment under load.'
  },
  {
    id: 'cervical_trapezius',
    name: 'Cervical & Upper Trapezius Strain',
    description: 'Postural fatigue from prolonged screen ergonomics, forward head posture, and scapular elevation.',
    sliders: {
      muscleActivity: 84,
      movementLevel: 25,
      pressureLoad: 55,
      signalQuality: 96
    },
    regionModifiers: {
      neck_anterior: 1.3,
      trapezius_upper: 1.4,
      deltoid_anterior_l: 1.2,
      deltoid_anterior_r: 1.2,
      deltoid_posterior_l: 1.15,
      deltoid_posterior_r: 1.15,
      lumbar_erectors: 0.85,
      quadriceps_l: 0.7,
      quadriceps_r: 0.7
    },
    notes: 'Highlights localized upper-quadrant stress with low lower-extremity demand.'
  },
  {
    id: 'quadriceps_fatigue',
    name: 'Post-Rehabilitation Quadriceps Fatigue',
    description: 'Simulates progressive eccentric loading and muscular fatigue following repetitive squat trials.',
    sliders: {
      muscleActivity: 82,
      movementLevel: 74,
      pressureLoad: 80,
      signalQuality: 92
    },
    regionModifiers: {
      quadriceps_l: 1.38,
      quadriceps_r: 1.32,
      hamstrings_l: 1.15,
      hamstrings_r: 1.1,
      gluteus_l: 1.2,
      gluteus_r: 1.2,
      tibialis_l: 1.1,
      tibialis_r: 1.1,
      trapezius_upper: 0.65
    },
    notes: 'Exemplifies lower-limb focus: elevated bilateral quad & calf activity with resting upper body.'
  },
  {
    id: 'dynamic_sprint',
    name: 'High-Velocity Dynamic Gait & Sprint',
    description: 'High-tempo kinetic chain engagement with dynamic acceleration, impact forces, and rapid recruitment.',
    sliders: {
      muscleActivity: 92,
      movementLevel: 94,
      pressureLoad: 85,
      signalQuality: 90
    },
    regionModifiers: {
      gluteus_l: 1.3,
      gluteus_r: 1.3,
      quadriceps_l: 1.28,
      quadriceps_r: 1.28,
      hamstrings_l: 1.35,
      hamstrings_r: 1.35,
      gastrocnemius_l: 1.32,
      gastrocnemius_r: 1.32,
      abdominals: 1.2
    },
    notes: 'Global elevated readings across dynamic locomotion groups.'
  },
  {
    id: 'sensor_dropout',
    name: 'Signal Degradation / Artifact Demo',
    description: 'Demonstrates system handling of electrode detachment, motion artifacts, or low SNR (< 35%).',
    sliders: {
      muscleActivity: 60,
      movementLevel: 70,
      pressureLoad: 50,
      signalQuality: 22
    },
    regionModifiers: {
      quadriceps_r: 0.2,
      hamstrings_r: 0.2,
      gastrocnemius_r: 0.15
    },
    notes: 'Demonstrates robust "No Data / Degraded" visualization and fail-safe alerts.'
  }
];

module.exports = { SCENARIOS };
