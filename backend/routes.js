// backend/routes.js
const express = require('express');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');
const { SCENARIOS } = require('./scenarios');
const { MUSCLE_REGIONS, computeDashboardState, clampNumber } = require('./demoEngine');

const router = express.Router();

// Strict Rate Limiting for Compute and Mutation endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1200, // generous for live demo interactions while preventing denial of service
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please throttle rapid simulated inputs.'
  }
});

router.use(apiLimiter);

function generateSessionId() {
  return 'DEMO-NML-' + crypto.randomInt(100000, 999999);
}

let currentSession = {
  sessionId: generateSessionId(),
  startedAt: new Date().toISOString(),
  environment: 'Local Demonstration Prototype',
  compliance: 'Non-AI Illustrative Data Prototype (Confidentiality Safe)'
};

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'NEUROMYOLATENT',
    tagline: 'PREDICT BEFORE PAIN',
    version: '1.0.0-prototype',
    serverTime: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /api/scenarios
router.get('/scenarios', (req, res) => {
  res.json({
    success: true,
    count: SCENARIOS.length,
    scenarios: SCENARIOS
  });
});

// GET /api/scenarios/:id
router.get('/scenarios/:id', (req, res) => {
  const safeId = String(req.params.id || '').trim();
  const scenario = SCENARIOS.find(s => s.id === safeId);
  if (!scenario) {
    return res.status(404).json({ success: false, message: 'Scenario not found' });
  }
  res.json({ success: true, scenario });
});

// POST /api/compute - Sanitized & bounded calculation
router.post('/compute', (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { inputs, scenarioId } = body;

    let modifiers = {};
    if (scenarioId && typeof scenarioId === 'string') {
      const safeId = scenarioId.trim();
      const matched = SCENARIOS.find(s => s.id === safeId);
      if (matched && matched.regionModifiers) {
        modifiers = matched.regionModifiers;
      }
    }

    const result = computeDashboardState(inputs, modifiers);
    res.json({
      success: true,
      sessionId: currentSession.sessionId,
      ...result
    });
  } catch (err) {
    console.error('Computation error:', err);
    res.status(500).json({ success: false, message: 'Internal calculation error' });
  }
});

// GET /api/session
router.get('/session', (req, res) => {
  res.json({
    success: true,
    session: currentSession,
    disclaimer: 'DEMO MODE • ILLUSTRATIVE DATA ONLY. Contains no clinical AI model, proprietary features, or patient data.'
  });
});

// POST /api/session/reset
router.post('/session/reset', (req, res) => {
  try {
    currentSession = {
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString(),
      environment: 'Local Demonstration Prototype',
      compliance: 'Non-AI Illustrative Data Prototype'
    };
    const baseline = SCENARIOS[0];
    const state = computeDashboardState(baseline.sliders, baseline.regionModifiers);

    res.json({
      success: true,
      message: 'Session reset to default baseline',
      session: currentSession,
      defaultScenario: baseline,
      state
    });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ success: false, message: 'Error resetting session' });
  }
});

// POST /api/export
router.post('/export', (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { currentState, selectedRegionId } = body;

    const safeSelectedRegionId = typeof selectedRegionId === 'string' ? selectedRegionId.trim() : null;

    const exportPayload = {
      reportTitle: 'NEUROMYOLATENT Demo Session Summary',
      subtitle: 'Confidentiality-Safe Biomechanical Visualization Prototype',
      sessionId: currentSession.sessionId,
      generatedAt: new Date().toISOString(),
      confidentialityNotice: 'ILLUSTRATIVE DEMO DATA ONLY - Not validated for medical diagnosis or clinical decision making.',
      channels: currentState && typeof currentState.inputs === 'object' ? currentState.inputs : {},
      globalStatistics: currentState && typeof currentState.statistics === 'object' ? currentState.statistics : {},
      monitoredRegions: currentState && currentState.regions && typeof currentState.regions === 'object' ? 
        Object.values(currentState.regions).map(r => ({
          name: String(r.name || 'Unknown'),
          view: String(r.view || 'N/A'),
          score: r.score !== null ? Number(r.score) : null,
          category: String(r.category || 'No Data'),
          explanation: String(r.explanation || '')
        })) : [],
      selectedRegion: safeSelectedRegionId && currentState && currentState.regions && currentState.regions[safeSelectedRegionId] ? 
        currentState.regions[safeSelectedRegionId] : null
    };

    res.json({
      success: true,
      exportData: exportPayload
    });
  } catch (err) {
    console.error('Export generation error:', err);
    res.status(500).json({ success: false, message: 'Export generation failed' });
  }
});

// GET /api/stream - Server-Sent Events (SSE)
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let tick = 0;
  const interval = setInterval(() => {
    try {
      tick += 0.2;
      const activityOsc = Math.round(50 + 25 * Math.sin(tick) + 8 * Math.cos(tick * 2.3));
      const movementOsc = Math.round(40 + 20 * Math.sin(tick * 1.5 + 1.2));
      const pressureOsc = Math.round(45 + 18 * Math.cos(tick * 0.9));
      const snr = Math.min(100, Math.max(85, Math.round(95 + 4 * Math.sin(tick * 0.4))));

      const syntheticState = computeDashboardState({
        muscleActivity: activityOsc,
        movementLevel: movementOsc,
        pressureLoad: pressureOsc,
        signalQuality: snr
      });

      res.write(`data: ${JSON.stringify(syntheticState)}\n\n`);
    } catch (e) {
      clearInterval(interval);
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = router;
