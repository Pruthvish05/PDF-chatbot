/* ELEMENTS */
const chatContainer = document.getElementById("chatContainer");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

/**
 * APPEND MESSAGE TO UI
 * @param {string} role - 'user' or 'bot'
 * @param {string} text - The message content
 */
function appendMessage(role, text) {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = `message-wrapper ${role}-wrapper`;

    const messageBox = document.createElement("div");
    messageBox.className = `message-box ${role}-box`;
    
    // Use innerText for security, or innerHTML if you want to support markdown later
    messageBox.innerText = text;

    messageWrapper.appendChild(messageBox);
    chatContainer.appendChild(messageWrapper);

    // Smooth scroll to bottom
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
    });

    return messageBox; // Return reference to update "thinking" state later
}

/**
 * SEND MESSAGE TO BACKEND
 */
async function handleSendMessage() {
    const question = chatInput.value.trim();
    const filename = localStorage.getItem("uploadedFileName");

    if (!question) return;
    if (!filename) {
        alert("No active document found. Please upload a PDF first.");
        return;
    }

    // 1. Clear input and show user message
    chatInput.value = "";
    appendMessage("user", question);

    // 2. Show "Thinking" placeholder for the bot
    const botMessageElement = appendMessage("bot", "SigmaDoxs is thinking...");
    botMessageElement.classList.add("typing-effect");

    try {
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question,
                filename: filename
            })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        // 3. Update the bot message with real response
        botMessageElement.classList.remove("typing-effect");
        botMessageElement.innerText = data.response;

        // 4. Deduct a token for the chat (optional business logic)
        deductChatToken();

    } catch (error) {
        console.error("Chat Error:", error);
        botMessageElement.innerText = "Connection lost. Please ensure the Python backend is running.";
        botMessageElement.style.color = "#ff4d4d";
    }
}

/**
 * TOKEN DEDUCTION (Internal)
 */
function deductChatToken() {
    const user = localStorage.getItem("currentUser");
    if (user) {
        let tokens = parseInt(localStorage.getItem(`tokens_${user}`) || 0);
        if (tokens > 0) {
            localStorage.setItem(`tokens_${user}`, tokens - 1);
            // Dispatch event so dashboard.js updates the UI
            window.dispatchEvent(new Event('storage'));
        }
    }
}

/* EVENT LISTENERS */

// Click Send
if (sendBtn) {
    sendBtn.addEventListener("click", handleSendMessage);
}

// Press Enter
if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });
}

// Initial Greeting
document.addEventListener("DOMContentLoaded", () => {
    const fileName = localStorage.getItem("uploadedFileName");
    if (fileName) {
        appendMessage("bot", `I've analyzed "${fileName}". What would you like to know?`);
    }
});