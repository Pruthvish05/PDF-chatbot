// qa.js
// ─────────────────────────────────────────────────────────────
//  SigmaDoxs — Dashboard / Q&A Logic
//  Handles: file upload flow, document switching,
//           chat UI, API calls, token deduction.
// ─────────────────────────────────────────────────────────────

(function () {

  // ── Auth guard ────────────────────────────────────────────
  const currentUser = requireAuth();

  // ── State ─────────────────────────────────────────────────
  let activeCollection = localStorage.getItem('sd_active_collection') || null;
  let activeFilename   = localStorage.getItem('sd_active_filename')   || null;
  let isBotThinking    = false;

  // Document session history: { collection, filename }[]
  let docHistory = JSON.parse(localStorage.getItem('sd_doc_history_' + currentUser) || '[]');

  // Chat messages per collection: { [collection]: [{role,text}] }
  let chatHistory = JSON.parse(localStorage.getItem('sd_chat_' + currentUser) || '{}');

  // ── DOM refs ──────────────────────────────────────────────
  const userNameEl    = document.getElementById('user-name');
  const tokenDisplay  = document.getElementById('token-display');
  const tokenBar      = document.getElementById('token-bar');
  const uploadZone    = document.getElementById('upload-zone');
  const fileInput     = document.getElementById('file-input');
  const docList       = document.getElementById('doc-list');
  const chatArea      = document.getElementById('chat-area');
  const emptyState    = document.getElementById('empty-state');
  const questionInput = document.getElementById('question-input');
  const sendBtn       = document.getElementById('send-btn');
  const docBadge      = document.getElementById('doc-badge');
  const statusDot     = document.getElementById('status-dot');
  const topbarRight   = document.getElementById('topbar-right');
  const noDocWarn     = document.getElementById('no-doc-warn');
  const toast         = document.getElementById('toast');

  // Suggestion chips shown in empty state
  const CHIPS = [
    'Summarise this document',
    'What are the key findings?',
    'List the main concepts',
    'What methodology was used?',
  ];

  // ── Init ──────────────────────────────────────────────────
  function init() {
    userNameEl.textContent = currentUser;
    renderTokens();
    renderDocList();
    renderChips();

    if (activeCollection && activeFilename) {
      activateDocument(activeCollection, activeFilename, false);
    }

    // If a document was just processed by processing.html, add it to history
    const newCollection = localStorage.getItem('sd_active_collection');
    const newFilename   = localStorage.getItem('sd_active_filename');
    if (newCollection && newFilename) {
      addToHistory(newCollection, newFilename);
    }
  }

  // ── Token UI ──────────────────────────────────────────────
  function renderTokens() {
    const bal = getTokenBalance();
    tokenDisplay.textContent = bal;
    tokenBar.style.width = Math.min(bal, 100) + '%';
  }

  // ── Document history ──────────────────────────────────────
  function addToHistory(collection, filename) {
    const exists = docHistory.find(d => d.collection === collection);
    if (!exists) {
      docHistory.unshift({ collection, filename });
      if (docHistory.length > 20) docHistory.pop(); // cap at 20
      localStorage.setItem('sd_doc_history_' + currentUser, JSON.stringify(docHistory));
      renderDocList();
    }
  }

  function renderDocList() {
    docList.innerHTML = '';
    if (!docHistory.length) {
      docList.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);padding:8px;">No documents yet.</div>`;
      return;
    }
    docHistory.forEach(({ collection, filename }) => {
      const el = document.createElement('div');
      el.className = 'doc-item' + (collection === activeCollection ? ' active' : '');
      el.innerHTML = `
        <div class="doc-icon">📄</div>
        <div>
          <div class="doc-name">${escHtml(filename)}</div>
          <div class="doc-meta">${collection}</div>
        </div>`;
      el.addEventListener('click', () => activateDocument(collection, filename, true));
      docList.appendChild(el);
    });
  }

  function activateDocument(collection, filename, scroll) {
    activeCollection = collection;
    activeFilename   = filename;

    // Update topbar
    docBadge.textContent = filename;
    statusDot.style.background = '#34d399';
    topbarRight.textContent = collection;
    noDocWarn.classList.remove('show');

    // Highlight in sidebar
    document.querySelectorAll('.doc-item').forEach(el => {
      el.classList.toggle('active', el.querySelector('.doc-meta').textContent === collection);
    });

    // Render chat for this collection
    renderChat(collection);
    if (scroll) scrollChat();
  }

  // ── Chip suggestions ──────────────────────────────────────
  function renderChips() {
    const wrap = document.getElementById('chips');
    CHIPS.forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        if (!activeCollection) { showToast('Upload a document first.', true); return; }
        questionInput.value = text;
        sendMessage();
      });
      wrap.appendChild(chip);
    });
  }

  // ── Chat rendering ────────────────────────────────────────
  function renderChat(collection) {
    const msgs = chatHistory[collection] || [];
    // Clear dynamic messages (keep empty state hidden management)
    chatArea.innerHTML = '';

    if (!msgs.length) {
      chatArea.appendChild(emptyState);
      emptyState.style.display = 'flex';
      return;
    }
    emptyState.style.display = 'none';
    msgs.forEach(m => chatArea.appendChild(buildBubble(m.role, m.text)));
    scrollChat();
  }

  function buildBubble(role, text) {
    const wrap  = document.createElement('div');
    wrap.className = `msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'bot' ? 'SD' : currentUser.charAt(0).toUpperCase();

    const body = document.createElement('div');
    body.className = 'msg-body';

    const roleEl = document.createElement('div');
    roleEl.className = 'msg-role';
    roleEl.textContent = role === 'bot' ? 'SigmaDoxs AI' : currentUser;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = renderMarkdownLight(text);

    body.appendChild(roleEl);
    body.appendChild(bubble);
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    return wrap;
  }

  function buildThinking() {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.id = 'thinking-bubble';
    wrap.innerHTML = `
      <div class="msg-avatar">SD</div>
      <div class="msg-body">
        <div class="msg-role">SigmaDoxs AI</div>
        <div class="msg-bubble">
          <div class="thinking"><span></span><span></span><span></span></div>
        </div>
      </div>`;
    return wrap;
  }

  function scrollChat() {
    requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
  }

  // Lightweight markdown: bold, italic, code, newlines
  function renderMarkdownLight(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`(.+?)`/g,       '<code>$1</code>')
      .replace(/\n/g,            '<br/>');
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Upload handling ───────────────────────────────────────
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag'); });
  uploadZone.addEventListener('dragleave',()  => uploadZone.classList.remove('drag'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('drag');
    const f = e.dataTransfer.files[0];
    if (f) handleFileUpload(f);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFileUpload(fileInput.files[0]);
  });

  async function handleFileUpload(file) {
    if (!file.name.endsWith('.pdf')) { showToast('Only PDF files are supported.', true); return; }

    // Check tokens (−5 per upload)
    if (getTokenBalance() < 5) {
      showToast('Insufficient tokens! Need 5 tokens to upload.', true);
      return;
    }
    if (!deductTokens(5)) { showToast('Token deduction failed.', true); return; }
    renderTokens();

    // Hand file off to processing.html via localStorage
    await handoffFileToProcessor(file);
    window.location.href = 'processing.html';
  }

  // ── Send message ──────────────────────────────────────────
  sendBtn.addEventListener('click', sendMessage);
  questionInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  // Auto-grow textarea
  questionInput.addEventListener('input', () => {
    questionInput.style.height = 'auto';
    questionInput.style.height = Math.min(questionInput.scrollHeight, 160) + 'px';
  });

  async function sendMessage() {
    const question = questionInput.value.trim();
    if (!question || isBotThinking) return;

    if (!activeCollection) {
      noDocWarn.classList.add('show');
      showToast('Please select a document first.', true);
      return;
    }

    // Token check (−1 per question)
    if (getTokenBalance() < 1) {
      showToast('Out of tokens! You need at least 1 token to ask a question.', true);
      return;
    }
    deductTokens(1);
    renderTokens();

    // Clear input
    questionInput.value = '';
    questionInput.style.height = 'auto';

    // Hide empty state
    emptyState.style.display = 'none';

    // Add user bubble
    const userBubble = buildBubble('user', question);
    chatArea.appendChild(userBubble);

    // Save to history
    if (!chatHistory[activeCollection]) chatHistory[activeCollection] = [];
    chatHistory[activeCollection].push({ role: 'user', text: question });

    // Show thinking
    isBotThinking = true;
    sendBtn.disabled = true;
    const thinkingEl = buildThinking();
    chatArea.appendChild(thinkingEl);
    scrollChat();

    // API call
    try {
      const response = await fetch(`${SD_API}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_name: activeCollection,
          question: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Server error ${response.status}`);
      }

      // Remove thinking, add bot reply
      thinkingEl.remove();
      const botBubble = buildBubble('bot', data.answer);
      chatArea.appendChild(botBubble);
      chatHistory[activeCollection].push({ role: 'bot', text: data.answer });
      saveChatHistory();
      scrollChat();

    } catch (err) {
      thinkingEl.remove();
      const errText = `⚠ Error: ${err.message}`;
      const errBubble = buildBubble('bot', errText);
      chatArea.appendChild(errBubble);
      showToast(err.message, true);
      scrollChat();
    } finally {
      isBotThinking = false;
      sendBtn.disabled = false;
    }
  }

  function saveChatHistory() {
    try {
      localStorage.setItem('sd_chat_' + currentUser, JSON.stringify(chatHistory));
    } catch (e) {
      // localStorage full — trim oldest messages per collection
      Object.keys(chatHistory).forEach(k => {
        if (chatHistory[k].length > 20) chatHistory[k] = chatHistory[k].slice(-20);
      });
      localStorage.setItem('sd_chat_' + currentUser, JSON.stringify(chatHistory));
    }
  }

  // ── Toast ─────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg, isError = false) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
  }

  // ── Run ───────────────────────────────────────────────────
  init();

})();