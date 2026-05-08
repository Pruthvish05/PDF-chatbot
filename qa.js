/* TOKENS */

const qaTokens =
document.getElementById("qaTokens");

const currentUser =
localStorage.getItem("currentUser");

if(currentUser && qaTokens){

qaTokens.innerText =
localStorage.getItem(`tokens_${currentUser}`) || 8;

}

/* DOCUMENT NAME */

const chatDocName =
document.getElementById("chatDocName");

const uploadedFileName =
localStorage.getItem("uploadedFileName");

if(chatDocName){

chatDocName.innerText =
uploadedFileName || "No Document Uploaded";

}

/* PDF TEXT */

const pdfText =
localStorage.getItem("pdfText") || "";

/* GSAP */

if(typeof gsap !== "undefined"){

gsap.from(".qa-sidebar",{
x:-100,
opacity:0,
duration:1.2,
ease:"power4.out"
});

gsap.from(".chat-header",{
y:80,
opacity:0,
duration:1.2,
delay:.2,
ease:"power4.out"
});

gsap.from(".message",{
y:40,
opacity:0,
stagger:.15,
duration:1,
delay:.4,
ease:"power4.out"
});

}

/* CHAT ELEMENTS */

const sendBtn =
document.getElementById("sendBtn");

const chatInput =
document.getElementById("chatInput");

const chatContainer =
document.getElementById("chatContainer");

/* SEND EVENTS */

if(sendBtn){

sendBtn.addEventListener(
"click",
sendMessage
);

}

if(chatInput){

chatInput.addEventListener(
"keypress",
(e)=>{

if(e.key === "Enter"){

sendMessage();

}

}
);

}

/* SEND MESSAGE */

function sendMessage(){

if(!chatInput || !chatContainer) return;

const text =
chatInput.value.trim();

if(text === "") return;

/* DISABLE BUTTON */

sendBtn.disabled = true;

/* USER MESSAGE */

const userMessage =
document.createElement("div");

userMessage.className =
"message user-message";

const userContent =
document.createElement("div");

userContent.className =
"message-content";

userContent.innerText = text;

userMessage.appendChild(userContent);

chatContainer.appendChild(userMessage);

chatInput.value = "";

scrollChat();

/* TYPING */

const typing =
document.createElement("div");

typing.className =
"message ai-message";

typing.innerHTML = `
<div class="message-avatar">
🤖
</div>

<div class="message-content typing-msg">

Analyzing document...

</div>
`;

chatContainer.appendChild(typing);

scrollChat();

/* AI RESPONSE */

setTimeout(()=>{

typing.remove();

const response =
generatePDFAnswer(text);

const aiMessage =
document.createElement("div");

aiMessage.className =
"message ai-message";

aiMessage.innerHTML = `
<div class="message-avatar">
🤖
</div>

<div class="message-content ai-generated">
</div>
`;

chatContainer.appendChild(aiMessage);

const target =
aiMessage.querySelector(".ai-generated");

typeEffect(target,response);

sendBtn.disabled = false;

scrollChat();

},1000);

}

/* TYPE EFFECT */

function typeEffect(element,text){

if(!element) return;

let index = 0;

const safeText =
text.substring(0,2000);

const interval =
setInterval(()=>{

element.innerText +=
safeText.charAt(index);

index++;

scrollChat();

if(index >= safeText.length){

clearInterval(interval);

}

},12);

}

/* SCROLL */

function scrollChat(){

if(chatContainer){

chatContainer.scrollTop =
chatContainer.scrollHeight;

}

}

/* AI SEARCH */

function generatePDFAnswer(question){

if(!pdfText){

return `
No PDF content found.

Please upload a document first from the homepage.
`;

}

const cleanQuestion =
question.toLowerCase();

const questionWords =
cleanQuestion
.split(/\s+/)
.filter(word=>word.length > 2);

const sentences =
pdfText.match(/[^.!?]+[.!?]+/g) || [];

let bestSentence = "";
let bestScore = 0;

sentences.forEach((sentence)=>{

const lower =
sentence.toLowerCase();

let score = 0;

questionWords.forEach((word)=>{

if(lower.includes(word)){

score++;

}

});

if(score > bestScore){

bestScore = score;
bestSentence = sentence;

}

});

/* EXACT RESULT */

if(bestSentence && bestScore > 0){

return bestSentence.trim();

}

/* FALLBACK */

return `
I could not find an exact answer inside the uploaded PDF.

However, the document mainly discusses:

${pdfText.substring(0,400)}...
`;

}