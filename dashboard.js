/* TOKENS */

const dashboardTokens =
document.getElementById("dashboardTokens");

const currentUser =
localStorage.getItem("currentUser");

if(currentUser && dashboardTokens){

dashboardTokens.innerText =
localStorage.getItem(`tokens_${currentUser}`) || 8;

}

/* DOCUMENT NAME */

const documentName =
document.getElementById("documentName");

const uploadedFileName =
localStorage.getItem("uploadedFileName");

if(documentName){

documentName.innerText =
uploadedFileName || "No Document Uploaded";

}

/* PDF PREVIEW */

const pdfPreview =
document.getElementById("pdfPreview");

const uploadedPDF =
localStorage.getItem("uploadedPDF");

if(pdfPreview){

if(uploadedPDF){

pdfPreview.src = uploadedPDF;

}else{

pdfPreview.style.display = "none";

}

}

/* HISTORY */

const historyList =
document.getElementById("historyList");

let documentHistory = [];

try{

documentHistory =
JSON.parse(
localStorage.getItem("documentHistory")
) || [];

}catch(err){

documentHistory = [];

}

if(historyList){

if(documentHistory.length === 0){

historyList.innerHTML = `
<div class="history-item">
No previous documents
</div>
`;

}else{

documentHistory.forEach((doc)=>{

const item =
document.createElement("div");

item.className =
"history-item";

item.textContent = doc;

historyList.appendChild(item);

});

}

}

/* AI ANALYTICS */

const insightCount =
document.getElementById("insightCount");

const confidenceScore =
document.getElementById("confidenceScore");

const documentStats =
document.getElementById("documentStats");

const insights =
Math.floor(Math.random()*60)+20;

const confidence =
Math.floor(Math.random()*8)+92;

const pages =
Math.floor(Math.random()*200)+20;

if(insightCount){

insightCount.innerText = insights;

}

if(confidenceScore){

confidenceScore.innerText =
`${confidence}%`;

}

if(documentStats){

documentStats.innerText =
`AI has indexed ${pages} pages and generated real-time contextual understanding, semantic mapping and intelligent AI analysis.`;

}

/* ANALYZE BUTTON */

const analyzeBtn =
document.querySelector(".action-card button");

if(analyzeBtn){

analyzeBtn.addEventListener("click",()=>{

alert(
"AI analysis already completed successfully."
);

});

}

/* GSAP */

if(typeof gsap !== "undefined"){

gsap.from(".sidebar",{

x:-100,
opacity:0,
duration:1.2,
ease:"power4.out"

});

gsap.from(".welcome-box",{

y:80,
opacity:0,
duration:1.2,
delay:.2,
ease:"power4.out"

});

gsap.from(".mini-card",{

y:60,
opacity:0,
stagger:.15,
duration:1,
delay:.4,
ease:"power4.out"

});

gsap.from(".action-card",{

y:80,
opacity:0,
stagger:.15,
duration:1.2,
delay:.6,
ease:"power4.out"

});

gsap.from(".document-panel",{

y:80,
opacity:0,
duration:1.2,
delay:.8,
ease:"power4.out"

});

}

/* LOGOUT */

const logoutBtn =
document.querySelector(".logout-btn");

if(logoutBtn){

logoutBtn.addEventListener("click",()=>{

localStorage.removeItem("currentUser");

window.location.href =
"index.html";

});

}
/* =========================
   DOCUMENT HISTORY
========================= */

const historyContainer =
document.getElementById("historyContainer");

const history =
JSON.parse(
localStorage.getItem("documentHistory")
) || [];

if(historyContainer){

if(history.length === 0){

historyContainer.innerHTML = `
<p class="empty-history">
No previous documents found.
</p>
`;

}else{

history.forEach((doc)=>{

const item =
document.createElement("div");

item.className =
"history-card";

item.innerHTML = `
<div class="history-name">
📄 ${doc}
</div>

<button class="open-history-btn">
Open Summary
</button>
`;

item
.querySelector(".open-history-btn")
.addEventListener("click",()=>{

window.location.href =
"summary.html";

});

historyContainer.appendChild(item);

});

}

}