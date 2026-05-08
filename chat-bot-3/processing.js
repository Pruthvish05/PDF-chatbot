// processing.js
// ─────────────────────────────────────────────────────────────
//  SigmaDoxs — Processing Page Logic
//  5-stage progress bar that creeps to 90%, then jumps to 100%
//  only when the FastAPI /upload endpoint returns 200 OK.
// ─────────────────────────────────────────────────────────────

(function () {
  // ── Require auth ─────────────────────────────────────────
  requireAuth();

  // ── DOM refs ──────────────────────────────────────────────
  const barEl      = document.getElementById('bar');
  const pctEl      = document.getElementById('pct');
  const fileNameEl = document.getElementById('file-name');
  const stageEls   = document.querySelectorAll('.stage');
  const errorBox   = document.getElementById('error-box');
  const errorMsg   = document.getElementById('error-msg');

  // ── Stage definitions (cumulative target % after each stage)
  const STAGES = [
    { label: 'Reading PDF file',                target: 15  },
    { label: 'Extracting text with PyMuPDF',    target: 35  },
    { label: 'Chunking into semantic segments', target: 55  },
    { label: 'Generating embeddings',           target: 75  },
    { label: 'Writing index to ChromaDB',       target: 90  },
  ];

  let currentProgress = 0;
  let creepTimer      = null;
  let currentStage    = 0;

  // ── Progress updater ──────────────────────────────────────
  function setProgress(pct) {
    pct = Math.min(Math.max(pct, 0), 100);
    currentProgress = pct;
    barEl.style.width = pct + '%';
    pctEl.textContent = Math.round(pct) + '%';
  }

  function activateStage(idx) {
    stageEls.forEach((el, i) => {
      if (i < idx)  { el.classList.remove('active'); el.classList.add('done'); }
      if (i === idx){ el.classList.add('active');    el.classList.remove('done'); }
      if (i > idx)  { el.classList.remove('active', 'done'); }
    });
  }

  // ── Creep animation: slowly move toward stage targets ─────
  //  We advance one stage every ~600ms, crawling to 90%.
  function startCreep() {
    const STAGE_INTERVAL = 700; // ms between stage transitions

    let stageIdx = 0;
    activateStage(0);
    setProgress(0);

    creepTimer = setInterval(() => {
      if (stageIdx >= STAGES.length - 1) {
        // Halt at stage 4 (90%) — wait for API response
        clearInterval(creepTimer);
        activateStage(STAGES.length - 1);
        creepTo(STAGES[STAGES.length - 1].target);
        return;
      }
      stageIdx++;
      currentStage = stageIdx;
      activateStage(stageIdx);
      creepTo(STAGES[stageIdx].target);
    }, STAGE_INTERVAL);
  }

  // Smoothly animate progress to a target value
  function creepTo(target) {
    const step = () => {
      if (currentProgress < target) {
        setProgress(currentProgress + 0.8);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  // ── Jump to 100% and redirect ─────────────────────────────
  function completeProgress(collectionName, filename) {
    stageEls.forEach(el => { el.classList.remove('active'); el.classList.add('done'); });
    setProgress(100);
    setTimeout(() => {
      localStorage.setItem('sd_active_collection', collectionName);
      localStorage.setItem('sd_active_filename',   filename);
      window.location.href = 'dashboard.html';
    }, 800);
  }

  function showError(msg) {
    clearInterval(creepTimer);
    errorBox.style.display = 'block';
    errorMsg.textContent   = msg;
    pctEl.style.setProperty('-webkit-text-fill-color', '#f87171');
  }

  // ── Main: read file from localStorage, call /upload ───────
  async function run() {
    const b64  = localStorage.getItem('sd_pending_file_b64');
    const name = localStorage.getItem('sd_pending_file_name');

    if (!b64 || !name) {
      // Nothing queued — go back to dashboard
      window.location.href = 'dashboard.html';
      return;
    }

    fileNameEl.textContent = name;

    // Convert base64 data URL back to a Blob/File
    const res    = await fetch(b64);
    const blob   = await res.blob();
    const file   = new File([blob], name, { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', file);

    // Start creep animation immediately
    startCreep();

    // Call FastAPI /upload — response arrives after full indexing
    try {
      const response = await fetch(`${SD_API}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error.' }));
        showError(err.detail || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      // Clean up localStorage handoff keys
      localStorage.removeItem('sd_pending_file_b64');
      localStorage.removeItem('sd_pending_file_name');
      localStorage.removeItem('sd_pending_file_size');

      completeProgress(data.collection_name, data.filename);

    } catch (err) {
      showError(
        err.message.includes('fetch')
          ? 'Cannot reach the SigmaDoxs API. Is the server running on port 8000?'
          : err.message
      );
    }
  }

  // Kick off on page load
  run();
})();