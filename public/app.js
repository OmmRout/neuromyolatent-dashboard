// public/app.js - NEUROMYOLATENT Physiotherapy Dashboard Client Logic

(function() {
  'use strict';

  // --- STATE ---
  let state = {
    sessionId: 'DEMO-NML-894210',
    selectedScenarioId: 'baseline_rest',
    selectedRegionId: 'lumbar_erectors',
    activeView: 'both',
    isStreaming: false,
    eventSource: null,
    inputs: {
      muscleActivity: 25,
      movementLevel: 15,
      pressureLoad: 20,
      signalQuality: 95
    },
    degradedDropped: false,
    computed: null,
    baselineComputed: null,
    trendHistory: [],
    maxTrendPoints: 24,
    scenariosList: []
  };

  // --- DOM REFERENCES ---
  const dom = {
    // Header
    clockDisplay: document.getElementById('clockDisplay'),
    sessionDisplay: document.getElementById('sessionDisplay'),
    streamToggleBtn: document.getElementById('streamToggleBtn'),
    streamIcon: document.getElementById('streamIcon'),
    streamBtnText: document.getElementById('streamBtnText'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),

    // Left Panel
    scenarioSelect: document.getElementById('scenarioSelect'),
    scenarioDesc: document.getElementById('scenarioDesc'),
    sliderActivity: document.getElementById('sliderActivity'),
    sliderMovement: document.getElementById('sliderMovement'),
    sliderPressure: document.getElementById('sliderPressure'),
    sliderSignal: document.getElementById('sliderSignal'),
    valActivity: document.getElementById('valActivity'),
    valMovement: document.getElementById('valMovement'),
    valPressure: document.getElementById('valPressure'),
    valSignal: document.getElementById('valSignal'),
    toggleDegradedBtn: document.getElementById('toggleDegradedBtn'),
    randomizeBtn: document.getElementById('randomizeBtn'),
    defaultRestBtn: document.getElementById('defaultRestBtn'),

    // Center Panel
    viewBothBtn: document.getElementById('viewBothBtn'),
    viewAnteriorBtn: document.getElementById('viewAnteriorBtn'),
    viewPosteriorBtn: document.getElementById('viewPosteriorBtn'),
    anteriorWrapper: document.getElementById('anteriorWrapper'),
    posteriorWrapper: document.getElementById('posteriorWrapper'),
    mapViewport: document.getElementById('mapViewport'),
    mapTooltip: document.getElementById('mapTooltip'),
    tooltipTitle: document.getElementById('tooltipTitle'),
    tooltipScore: document.getElementById('tooltipScore'),
    tooltipBadge: document.getElementById('tooltipBadge'),
    countLow: document.getElementById('countLow'),
    countModerate: document.getElementById('countModerate'),
    countElevated: document.getElementById('countElevated'),
    countNoData: document.getElementById('countNoData'),

    // Right Panel
    detailRegionView: document.getElementById('detailRegionView'),
    detailRegionName: document.getElementById('detailRegionName'),
    detailStatusPill: document.getElementById('detailStatusPill'),
    detailScoreNumber: document.getElementById('detailScoreNumber'),
    radialProgressCircle: document.getElementById('radialProgressCircle'),
    detailActivityVal: document.getElementById('detailActivityVal'),
    detailMovementVal: document.getElementById('detailMovementVal'),
    detailPressureVal: document.getElementById('detailPressureVal'),
    detailSignalVal: document.getElementById('detailSignalVal'),
    detailExplanation: document.getElementById('detailExplanation'),
    statMean: document.getElementById('statMean'),
    statPeak: document.getElementById('statPeak'),
    statPeakScore: document.getElementById('statPeakScore'),
    statMonitored: document.getElementById('statMonitored'),
    statQuality: document.getElementById('statQuality'),
    segLow: document.getElementById('segLow'),
    segModerate: document.getElementById('segModerate'),
    segElevated: document.getElementById('segElevated'),
    segNoData: document.getElementById('segNoData'),
    lblPctLow: document.getElementById('lblPctLow'),
    lblPctMod: document.getElementById('lblPctMod'),
    lblPctEle: document.getElementById('lblPctEle'),

    // Bottom Panel
    barChartCanvas: document.getElementById('barChart'),
    trendChartCanvas: document.getElementById('trendChart'),
    trendTargetName: document.getElementById('trendTargetName'),
    comparisonBody: document.getElementById('comparisonBody'),

    // Export Modal
    exportModal: document.getElementById('exportModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalDoneBtn: document.getElementById('modalDoneBtn'),
    modalPrintBtn: document.getElementById('modalPrintBtn'),
    reportSessionId: document.getElementById('reportSessionId'),
    reportTimestamp: document.getElementById('reportTimestamp'),
    reportScenario: document.getElementById('reportScenario'),
    repActVal: document.getElementById('repActVal'),
    repMovVal: document.getElementById('repMovVal'),
    repPrsVal: document.getElementById('repPrsVal'),
    repMeanVal: document.getElementById('repMeanVal'),
    repPeakVal: document.getElementById('repPeakVal'),
    repActiveVal: document.getElementById('repActiveVal'),
    repSnrVal: document.getElementById('repSnrVal'),
    reportTableBody: document.getElementById('reportTableBody')
  };

  // --- CHART INSTANCES ---
  let barChart = null;
  let trendChart = null;

  // --- INITIALIZATION ---
  async function init() {
    setupClock();
    setupEventListeners();

    // Responsive mobile default
    if (window.innerWidth <= 768) {
      setAnatomicalView('anterior');
    }

    await fetchSessionInfo();
    await fetchScenarios();
    await initBaseline();
    initCharts();
    await computeState();
  }

  // --- REAL-TIME CLOCK ---
  function setupClock() {
    function update() {
      const now = new Date();
      dom.clockDisplay.textContent = now.toTimeString().split(' ')[0];
    }
    update();
    setInterval(update, 1000);
  }

  // --- API CALLS ---
  async function fetchSessionInfo() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.success && data.session) {
        state.sessionId = data.session.sessionId;
        dom.sessionDisplay.textContent = state.sessionId;
      }
    } catch (err) {
      console.warn('Using local session ID fallback:', err);
    }
  }

  async function fetchScenarios() {
    try {
      const res = await fetch('/api/scenarios');
      const data = await res.json();
      if (data.success && data.scenarios) {
        state.scenariosList = data.scenarios;
        dom.scenarioSelect.innerHTML = '';
        data.scenarios.forEach((sc, idx) => {
          const opt = document.createElement('option');
          opt.value = sc.id;
          opt.textContent = `${idx + 1}. ${sc.name}`;
          dom.scenarioSelect.appendChild(opt);
        });
        dom.scenarioSelect.value = state.selectedScenarioId;
      }
    } catch (err) {
      console.warn('Scenarios endpoint error:', err);
    }
  }

  async function initBaseline() {
    try {
      const res = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: { muscleActivity: 22, movementLevel: 10, pressureLoad: 18, signalQuality: 98 },
          scenarioId: 'baseline_rest'
        })
      });
      const data = await res.json();
      if (data.success) {
        state.baselineComputed = data;
      }
    } catch (err) {
      console.warn('Baseline init error:', err);
    }
  }

  async function computeState() {
    try {
      const payload = {
        inputs: state.inputs,
        scenarioId: state.selectedScenarioId
      };

      const res = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        state.computed = data;
        updateUI();
      }
    } catch (err) {
      console.error('Compute error:', err);
    }
  }

  // --- UI UPDATE ROUTINE ---
  function updateUI() {
    if (!state.computed) return;

    // 1. Update Map Colors & Statuses
    updateMapMuscles();

    // 2. Update Legend Counters
    updateLegendCounts();

    // 3. Update Selected Region Detail
    updateSelectedRegionDetail();

    // 4. Update Summary Statistics Grid
    updateSummaryStats();

    // 5. Update Charts
    updateCharts();

    // 6. Update Scenario Delta Comparison
    updateComparisonDelta();
  }

  // --- UPDATE MAP MUSCLES ---
  function updateMapMuscles() {
    const regions = state.computed.regions;
    if (!regions) return;

    Object.values(regions).forEach(region => {
      const svgEls = document.querySelectorAll(`[data-region="${region.id}"]`);
      svgEls.forEach(el => {
        if (region.category === 'No Data') {
          // Use pattern fill
          const isAnterior = region.view === 'anterior';
          el.setAttribute('fill', isAnterior ? 'url(#hatchPatternAnterior)' : 'url(#hatchPatternPosterior)');
        } else {
          el.setAttribute('fill', region.color);
        }

        // Highlight if selected
        if (region.id === state.selectedRegionId) {
          el.classList.add('selected-region');
        } else {
          el.classList.remove('selected-region');
        }
      });
    });
  }

  // --- UPDATE LEGEND COUNTS ---
  function updateLegendCounts() {
    const counts = state.computed.statistics.categoryCounts || {};
    dom.countLow.textContent = `${counts['Low'] || 0} regions`;
    dom.countModerate.textContent = `${counts['Moderate'] || 0} regions`;
    dom.countElevated.textContent = `${counts['Elevated'] || 0} regions`;
    dom.countNoData.textContent = `${counts['No Data'] || 0} regions`;

    // Stacked Distribution Bar
    const total = state.computed.statistics.totalRegionsCount || 22;
    const lowPct = Math.round(((counts['Low'] || 0) / total) * 100);
    const modPct = Math.round(((counts['Moderate'] || 0) / total) * 100);
    const elePct = Math.round(((counts['Elevated'] || 0) / total) * 100);
    const noPct = Math.round(((counts['No Data'] || 0) / total) * 100);

    dom.segLow.style.width = `${lowPct}%`;
    dom.segModerate.style.width = `${modPct}%`;
    dom.segElevated.style.width = `${elePct}%`;
    dom.segNoData.style.width = `${noPct}%`;

    dom.lblPctLow.textContent = `${lowPct}%`;
    dom.lblPctMod.textContent = `${modPct}%`;
    dom.lblPctEle.textContent = `${elePct}%`;
  }

  // --- UPDATE SELECTED REGION DETAIL ---
  function updateSelectedRegionDetail() {
    const region = state.computed.regions[state.selectedRegionId];
    if (!region) return;

    dom.detailRegionName.textContent = region.name;
    dom.detailRegionView.textContent = `${region.view.toUpperCase()} ASPECT &bull; ${region.side.toUpperCase()}`;
    
    // Status pill
    dom.detailStatusPill.className = 'status-pill';
    const catClass = 'status-' + region.category.toLowerCase().replace(/\s+/g, '');
    dom.detailStatusPill.classList.add(catClass);
    dom.detailStatusPill.textContent = region.category;

    // Score radial gauge
    const scoreVal = region.score !== null ? region.score : '--';
    dom.detailScoreNumber.textContent = scoreVal;

    // SVG radial progress circle (r=50, circumference = 2 * PI * 50 = ~314)
    const circum = 314;
    const pct = region.score !== null ? region.score / 100 : 0;
    const offset = circum - (pct * circum);
    dom.radialProgressCircle.style.strokeDashoffset = offset;
    dom.radialProgressCircle.style.stroke = region.color;

    // Sub metrics
    dom.detailActivityVal.textContent = `${region.activityReading} %`;
    dom.detailMovementVal.textContent = `${region.movementReading} a.u.`;
    dom.detailPressureVal.textContent = `${region.pressureReading} N/cm²`;
    dom.detailSignalVal.textContent = `${region.signalQuality} %`;

    // Explanation
    dom.detailExplanation.textContent = region.explanation;

    // Update target name on trend chart
    dom.trendTargetName.textContent = region.name;

    // Add to trend history
    recordTrendHistory(region);
  }

  // --- UPDATE SUMMARY STATS ---
  function updateSummaryStats() {
    const stats = state.computed.statistics;
    dom.statMean.textContent = `${stats.mean} / 100`;

    if (stats.peakRegion) {
      dom.statPeak.textContent = stats.peakRegion.name;
      dom.statPeakScore.textContent = `Score: ${stats.peakRegion.score} (${stats.peakRegion.category})`;
    } else {
      dom.statPeak.textContent = 'None';
      dom.statPeakScore.textContent = '--';
    }

    dom.statMonitored.textContent = `${stats.activeRegionsCount} / ${stats.totalRegionsCount}`;
    dom.statQuality.textContent = `${state.inputs.signalQuality}%`;
  }

  // --- RECORD TREND HISTORY ---
  function recordTrendHistory(region) {
    const now = new Date();
    const timeLabel = now.toTimeString().split(' ')[0];
    const score = region.score !== null ? region.score : 0;

    state.trendHistory.push({ time: timeLabel, score, category: region.category });
    if (state.trendHistory.length > state.maxTrendPoints) {
      state.trendHistory.shift();
    }
  }

  // --- CHART INITIALIZATION ---
  function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // 1. Regional Comparison Bar Chart
    const barCtx = dom.barChartCanvas.getContext('2d');
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Trapezius', 'Pectorals', 'Biceps', 'Abs/Core', 'Lumbar', 'Glutes', 'Quads', 'Calves'],
        datasets: [{
          label: 'Composite Metric (Illustrative)',
          data: [25, 20, 22, 28, 45, 30, 35, 26],
          backgroundColor: '#00c2cb',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#38e1ea',
            borderColor: 'rgba(0, 194, 203, 0.4)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => `Illustrative Score: ${context.parsed.y} / 100`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { stepSize: 25, font: { size: 10 } }
          }
        }
      }
    });

    // 2. Trend Line Chart
    const trendCtx = dom.trendChartCanvas.getContext('2d');
    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Live Trajectory',
          data: [],
          borderColor: '#00c2cb',
          backgroundColor: 'rgba(0, 194, 203, 0.12)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#00f2fe'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(0, 194, 203, 0.4)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 9 }, maxTicksLimit: 6 }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { stepSize: 25, font: { size: 10 } }
          }
        }
      }
    });
  }

  // --- UPDATE CHARTS ---
  function updateCharts() {
    if (!state.computed || !barChart || !trendChart) return;

    // Update Bar Chart
    const keyRegionIds = [
      'trapezius_upper', 'chest_pectoral', 'biceps_l', 'abdominals',
      'lumbar_erectors', 'gluteus_l', 'quadriceps_l', 'gastrocnemius_l'
    ];

    const barData = [];
    const barColors = [];

    keyRegionIds.forEach(id => {
      const r = state.computed.regions[id];
      if (r) {
        barData.push(r.score !== null ? r.score : 0);
        barColors.push(r.color);
      } else {
        barData.push(0);
        barColors.push('#64748b');
      }
    });

    barChart.data.datasets[0].data = barData;
    barChart.data.datasets[0].backgroundColor = barColors;
    barChart.update('none');

    // Update Trend Chart
    trendChart.data.labels = state.trendHistory.map(h => h.time);
    trendChart.data.datasets[0].data = state.trendHistory.map(h => h.score);

    // Dynamic color matching region
    const currentReg = state.computed.regions[state.selectedRegionId];
    if (currentReg) {
      trendChart.data.datasets[0].borderColor = currentReg.color;
      trendChart.data.datasets[0].pointBackgroundColor = currentReg.color;
    }
    trendChart.update('none');
  }

  // --- UPDATE COMPARISON DELTA ---
  function updateComparisonDelta() {
    if (!state.computed || !state.baselineComputed) return;

    const sampleRegions = [
      { id: 'lumbar_erectors', name: 'Lumbar Erector Spinae' },
      { id: 'trapezius_upper', name: 'Upper Trapezius' },
      { id: 'quadriceps_l', name: 'Quadriceps (Left)' },
      { id: 'abdominals', name: 'Rectus Abdominis' },
      { id: 'gastrocnemius_l', name: 'Gastrocnemius (Calf)' }
    ];

    dom.comparisonBody.innerHTML = '';

    sampleRegions.forEach(item => {
      const current = state.computed.regions[item.id];
      const baseline = state.baselineComputed.regions[item.id];

      const curScore = current && current.score !== null ? current.score : 0;
      const baseScore = baseline && baseline.score !== null ? baseline.score : 0;
      const delta = curScore - baseScore;

      const row = document.createElement('div');
      row.className = 'delta-row';

      let badgeClass = 'badge-neu';
      let deltaStr = `${delta >= 0 ? '+' : ''}${delta}`;

      if (delta > 5) {
        badgeClass = 'badge-pos';
      } else if (delta < -5) {
        badgeClass = 'badge-neg';
      }

      row.innerHTML = `
        <span class="delta-name" title="${item.name}">${item.name}</span>
        <span class="delta-baseline mono">${baseScore} &rarr; ${curScore}</span>
        <span class="delta-badge ${badgeClass}">${deltaStr}</span>
      `;
      dom.comparisonBody.appendChild(row);
    });
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // 1. Slider inputs
    setupSlider(dom.sliderActivity, dom.valActivity, 'muscleActivity');
    setupSlider(dom.sliderMovement, dom.valMovement, 'movementLevel');
    setupSlider(dom.sliderPressure, dom.valPressure, 'pressureLoad');
    setupSlider(dom.sliderSignal, dom.valSignal, 'signalQuality');

    // 2. Scenario selector
    dom.scenarioSelect.addEventListener('change', onScenarioChange);

    // 3. Drop Signal button
    dom.toggleDegradedBtn.addEventListener('click', toggleDroppedSignal);

    // 4. Randomize & Rest buttons
    dom.randomizeBtn.addEventListener('click', randomizeInputs);
    dom.defaultRestBtn.addEventListener('click', setRestingTone);

    // 5. View Switcher
    dom.viewBothBtn.addEventListener('click', () => setAnatomicalView('both'));
    dom.viewAnteriorBtn.addEventListener('click', () => setAnatomicalView('anterior'));
    dom.viewPosteriorBtn.addEventListener('click', () => setAnatomicalView('posterior'));

    // 6. Muscle Click & Hover delegation on SVGs
    setupSvgInteraction(document.getElementById('svgAnterior'));
    setupSvgInteraction(document.getElementById('svgPosterior'));

    // 7. Live Stream Simulation Toggle
    dom.streamToggleBtn.addEventListener('click', toggleLiveStream);

    // 8. Reset button
    dom.resetBtn.addEventListener('click', resetSession);

    // 9. Export Report Modal
    dom.exportBtn.addEventListener('click', openExportModal);
    dom.modalCloseBtn.addEventListener('click', closeExportModal);
    dom.modalDoneBtn.addEventListener('click', closeExportModal);
    dom.modalPrintBtn.addEventListener('click', () => window.print());
  }

  function setupSlider(sliderEl, labelEl, stateKey) {
    sliderEl.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      labelEl.textContent = val;
      state.inputs[stateKey] = val;

      // If user is manually sliding, turn off dropped signal flag
      if (stateKey === 'signalQuality') {
        state.degradedDropped = val < 35;
        updateDropBtnStyle();
      }

      debouncedCompute();
    });
  }

  let debounceTimer = null;
  function debouncedCompute() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      computeState();
    }, 60);
  }

  function onScenarioChange(e) {
    const scId = e.target.value;
    state.selectedScenarioId = scId;

    const matched = state.scenariosList.find(s => s.id === scId);
    if (matched) {
      dom.scenarioDesc.textContent = matched.description;
      // Load preset sliders
      if (matched.sliders) {
        setSliders(matched.sliders);
      }
    }
    computeState();
  }

  function setSliders(values) {
    if (values.muscleActivity !== undefined) {
      state.inputs.muscleActivity = values.muscleActivity;
      dom.sliderActivity.value = values.muscleActivity;
      dom.valActivity.textContent = values.muscleActivity;
    }
    if (values.movementLevel !== undefined) {
      state.inputs.movementLevel = values.movementLevel;
      dom.sliderMovement.value = values.movementLevel;
      dom.valMovement.textContent = values.movementLevel;
    }
    if (values.pressureLoad !== undefined) {
      state.inputs.pressureLoad = values.pressureLoad;
      dom.sliderPressure.value = values.pressureLoad;
      dom.valPressure.textContent = values.pressureLoad;
    }
    if (values.signalQuality !== undefined) {
      state.inputs.signalQuality = values.signalQuality;
      dom.sliderSignal.value = values.signalQuality;
      dom.valSignal.textContent = values.signalQuality;
      state.degradedDropped = values.signalQuality < 35;
      updateDropBtnStyle();
    }
  }

  function toggleDroppedSignal() {
    state.degradedDropped = !state.degradedDropped;
    if (state.degradedDropped) {
      setSliders({ signalQuality: 20 });
    } else {
      setSliders({ signalQuality: 96 });
    }
    updateDropBtnStyle();
    computeState();
  }

  function updateDropBtnStyle() {
    if (state.degradedDropped) {
      dom.toggleDegradedBtn.classList.add('active-dropped');
      dom.toggleDegradedBtn.textContent = 'Restore Signal';
    } else {
      dom.toggleDegradedBtn.classList.remove('active-dropped');
      dom.toggleDegradedBtn.textContent = 'Drop Signal';
    }
  }

  function randomizeInputs() {
    const randomAct = Math.floor(20 + Math.random() * 75);
    const randomMov = Math.floor(10 + Math.random() * 85);
    const randomPrs = Math.floor(15 + Math.random() * 80);
    const randomSnr = Math.floor(85 + Math.random() * 15);

    setSliders({
      muscleActivity: randomAct,
      movementLevel: randomMov,
      pressureLoad: randomPrs,
      signalQuality: randomSnr
    });
    computeState();
  }

  function setRestingTone() {
    setSliders({
      muscleActivity: 20,
      movementLevel: 8,
      pressureLoad: 15,
      signalQuality: 98
    });
    state.selectedScenarioId = 'baseline_rest';
    dom.scenarioSelect.value = 'baseline_rest';
    dom.scenarioDesc.textContent = 'Minimal resting tone across all anatomical chains. Balanced bilateral load with optimal sensor SNR.';
    computeState();
  }

  // --- ANATOMICAL VIEW TOGGLING ---
  function setAnatomicalView(viewMode) {
    state.activeView = viewMode;
    dom.viewBothBtn.classList.toggle('active', viewMode === 'both');
    dom.viewAnteriorBtn.classList.toggle('active', viewMode === 'anterior');
    dom.viewPosteriorBtn.classList.toggle('active', viewMode === 'posterior');

    if (viewMode === 'both') {
      dom.anteriorWrapper.style.display = 'flex';
      dom.posteriorWrapper.style.display = 'flex';
    } else if (viewMode === 'anterior') {
      dom.anteriorWrapper.style.display = 'flex';
      dom.posteriorWrapper.style.display = 'none';
    } else {
      dom.anteriorWrapper.style.display = 'none';
      dom.posteriorWrapper.style.display = 'flex';
    }
  }

  // --- SVG INTERACTION & TOOLTIP (MOUSE + TOUCH FRIENDLY) ---
  function setupSvgInteraction(svgEl) {
    if (!svgEl) return;

    // Click for desktop
    svgEl.addEventListener('click', (e) => {
      const regionEl = e.target.closest('.muscle-region');
      if (regionEl) {
        const regId = regionEl.getAttribute('data-region');
        selectRegion(regId);
      }
    });

    // Touch support for mobile devices
    svgEl.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const regionEl = target ? target.closest('.muscle-region') : null;
      if (regionEl && state.computed) {
        const regId = regionEl.getAttribute('data-region');
        selectRegion(regId);
        const reg = state.computed.regions[regId];
        if (reg) {
          showTooltip(touch, reg);
        }
      }
    }, { passive: true });

    svgEl.addEventListener('mousemove', (e) => {
      const regionEl = e.target.closest('.muscle-region');
      if (regionEl && state.computed) {
        const regId = regionEl.getAttribute('data-region');
        const reg = state.computed.regions[regId];
        if (reg) {
          showTooltip(e, reg);
          return;
        }
      }
      hideTooltip();
    });

    svgEl.addEventListener('mouseleave', () => {
      hideTooltip();
    });

    window.addEventListener('scroll', () => {
      hideTooltip();
    }, { passive: true });
  }

  function selectRegion(regId) {
    state.selectedRegionId = regId;
    updateMapMuscles();
    updateSelectedRegionDetail();
    updateCharts();
  }

  function showTooltip(e, region) {
    const rect = dom.mapViewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    dom.tooltipTitle.textContent = region.name;
    dom.tooltipScore.textContent = region.score !== null ? `Score: ${region.score}` : 'No Signal';
    dom.tooltipBadge.textContent = region.category;
    dom.tooltipBadge.style.backgroundColor = region.color;
    dom.tooltipBadge.style.color = region.category === 'Moderate' ? '#000' : '#fff';

    dom.mapTooltip.style.left = `${x}px`;
    dom.mapTooltip.style.top = `${y}px`;
    dom.mapTooltip.classList.add('show');
  }

  function hideTooltip() {
    dom.mapTooltip.classList.remove('show');
  }

  // --- LIVE STREAM SIMULATION ---
  function toggleLiveStream() {
    state.isStreaming = !state.isStreaming;

    if (state.isStreaming) {
      dom.streamToggleBtn.classList.add('active-streaming');
      dom.streamIcon.innerHTML = '&#9632;'; // Stop square
      dom.streamBtnText.textContent = 'Streaming Live';

      // Connect SSE
      state.eventSource = new EventSource('/api/stream');
      state.eventSource.onmessage = (event) => {
        try {
          const liveData = JSON.parse(event.data);
          state.computed = liveData;
          // Synchronize slider handles with incoming stream
          dom.sliderActivity.value = liveData.inputs.muscleActivity;
          dom.valActivity.textContent = liveData.inputs.muscleActivity;
          dom.sliderMovement.value = liveData.inputs.movementLevel;
          dom.valMovement.textContent = liveData.inputs.movementLevel;
          dom.sliderPressure.value = liveData.inputs.pressureLoad;
          dom.valPressure.textContent = liveData.inputs.pressureLoad;
          dom.sliderSignal.value = liveData.inputs.signalQuality;
          dom.valSignal.textContent = liveData.inputs.signalQuality;
          state.inputs = liveData.inputs;

          updateUI();
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };

      state.eventSource.onerror = (err) => {
        console.warn('SSE connection closed:', err);
        toggleLiveStream();
      };
    } else {
      dom.streamToggleBtn.classList.remove('active-streaming');
      dom.streamIcon.innerHTML = '&#9658;'; // Play triangle
      dom.streamBtnText.textContent = 'Live Stream';

      if (state.eventSource) {
        state.eventSource.close();
        state.eventSource = null;
      }
    }
  }

  // --- RESET SESSION ---
  async function resetSession() {
    try {
      if (state.isStreaming) toggleLiveStream();

      const res = await fetch('/api/session/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        state.sessionId = data.session.sessionId;
        dom.sessionDisplay.textContent = state.sessionId;
        state.selectedScenarioId = 'baseline_rest';
        dom.scenarioSelect.value = 'baseline_rest';
        dom.scenarioDesc.textContent = data.defaultScenario.description;
        setSliders(data.defaultScenario.sliders);
        state.computed = data.state;
        state.baselineComputed = data.state;
        state.trendHistory = [];
        updateUI();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  }

  // --- EXPORT REPORT MODAL ---
  function openExportModal() {
    if (!state.computed) return;

    dom.reportSessionId.textContent = state.sessionId;
    dom.reportTimestamp.textContent = new Date().toISOString();
    const sc = state.scenariosList.find(s => s.id === state.selectedScenarioId);
    dom.reportScenario.textContent = sc ? sc.name : 'Custom Parameters';

    dom.repActVal.textContent = `${state.inputs.muscleActivity} % RMS`;
    dom.repMovVal.textContent = `${state.inputs.movementLevel} a.u.`;
    dom.repPrsVal.textContent = `${state.inputs.pressureLoad} N/cm²`;

    const stats = state.computed.statistics;
    dom.repMeanVal.textContent = `${stats.mean} / 100`;
    dom.repPeakVal.textContent = stats.peakRegion ? stats.peakRegion.name : 'None';
    dom.repActiveVal.textContent = `${stats.activeRegionsCount} / ${stats.totalRegionsCount}`;
    dom.repSnrVal.textContent = `${state.inputs.signalQuality} %`;

    // Table of regions
    dom.reportTableBody.innerHTML = '';
    Object.values(state.computed.regions).forEach(reg => {
      const tr = document.createElement('tr');
      const scoreStr = reg.score !== null ? `${reg.score} / 100` : 'No Signal';
      tr.innerHTML = `
        <td><strong>${reg.name}</strong></td>
        <td>${reg.view.toUpperCase()}</td>
        <td class="mono">${scoreStr}</td>
        <td><span class="status-pill status-${reg.category.toLowerCase().replace(/\s+/g, '')}">${reg.category}</span></td>
        <td style="font-size: 0.7rem; color: #94a3b8;">${reg.explanation}</td>
      `;
      dom.reportTableBody.appendChild(tr);
    });

    dom.exportModal.classList.add('open');
  }

  function closeExportModal() {
    dom.exportModal.classList.remove('open');
  }

  // Start app when DOM is ready
  document.addEventListener('DOMContentLoaded', init);

})();
