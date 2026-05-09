// frontend/js/qa.js
async function send() {
    const input = document.getElementById('queryInput');
    const win = document.getElementById('chat-window');
    const filename = localStorage.getItem('pending_name');
    const question = input.value.trim();

    if (!question || !filename) return;

    // 1. Display User Message
    win.innerHTML += `<div class="user-msg msg">${question}</div>`;
    input.value = '';
    win.scrollTop = win.scrollHeight;

    // 2. Create the "Thinking" Bubble
    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'bot-msg msg';
    botMsgDiv.innerText = 'Analyzing Source...'; // Initial state
    win.appendChild(botMsgDiv);
    win.scrollTop = win.scrollHeight;

    try {
        TokenManager.deduct(1); // Deduct credit[cite: 4]
        
        // 3. Fetch from Backend
        const data = await SigmaAPI.queryDoc(filename, question);

        // 4. THE FIX: Overwrite the bubble with the Gemini response
        if (data.answer) {
            botMsgDiv.innerText = data.answer; 
        } else {
            botMsgDiv.innerText = "The neural link returned no data.";
        }
    } catch (e) {
        botMsgDiv.innerText = "Connection lost to SigmaDoxs backend.";
        botMsgDiv.style.color = "#ff4444";
        console.error("QA execution failed:", e);
    }

    win.scrollTop = win.scrollHeight;
}