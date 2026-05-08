
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ELEMENTS */
const loginModal = document.getElementById("loginModal");
const signinBtn = document.querySelector(".signin-btn");
const loginBtn = document.getElementById("loginBtn");
const uploadBtn = document.getElementById("uploadBtn");
const pdfUpload = document.getElementById("pdfUpload");
const tokenCount = document.getElementById("tokenCount");

/* AUTH LOGIC */
const updateTokenDisplay = () => {
    const user = localStorage.getItem("currentUser");
    if (user && tokenCount) {
        tokenCount.innerText = localStorage.getItem(`tokens_${user}`) || 8;
    }
};

if (signinBtn) {
    signinBtn.addEventListener("click", () => loginModal.style.display = "flex");
}

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value.trim();
        if (!username) return alert("Enter username");
        
        localStorage.setItem("currentUser", username);
        if (!localStorage.getItem(`tokens_${username}`)) {
            localStorage.setItem(`tokens_${username}`, 8);
        }
        updateTokenDisplay();
        loginModal.style.display = "none";
    });
}

/* THE HANDOFF: PDF UPLOAD */
if (uploadBtn && pdfUpload) {
    uploadBtn.addEventListener("click", () => {
        if (!localStorage.getItem("currentUser")) return alert("Please login first");
        pdfUpload.click();
    });

    pdfUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== "application/pdf") return alert("Upload a valid PDF");

        // 1. Deduct Tokens
        const user = localStorage.getItem("currentUser");
        let tokens = parseInt(localStorage.getItem(`tokens_${user}`) || 8);
        localStorage.setItem(`tokens_${user}`, Math.max(0, tokens - 5));

        // 2. Save Metadata
        localStorage.setItem("uploadedFileName", file.name);

        // 3. Convert to Base64 to pass to the next page
        const reader = new FileReader();
        reader.onload = function(ev) {
            localStorage.setItem("temp_pdf_data", ev.target.result);
            window.location.href = "processing.html";
        };
        reader.readAsDataURL(file);
    });
}

/* CURSOR & GSAP (Keep your existing cursor/GSAP code here) */
updateTokenDisplay();
/* CURSOR */

const cursor =
document.querySelector(".cursor");

const cursorBlur =
document.querySelector(".cursor-blur");

if(cursor && cursorBlur){

document.addEventListener("mousemove",(e)=>{

cursor.style.left =
e.clientX + "px";

cursor.style.top =
e.clientY + "px";

cursorBlur.style.left =
e.clientX + "px";

cursorBlur.style.top =
e.clientY + "px";

});

document.querySelectorAll(
"button,a,.glass-card,.metric-card,.showcase-small"
).forEach((el)=>{

el.addEventListener("mouseenter",()=>{

cursor.style.width = "40px";
cursor.style.height = "40px";

cursor.style.background =
"radial-gradient(circle,#ffffff,#8a2be2)";

});

el.addEventListener("mouseleave",()=>{

cursor.style.width = "22px";
cursor.style.height = "22px";

cursor.style.background =
"radial-gradient(circle,#ffffff,#00bfff)";

});

});

}

/* GSAP ANIMATIONS */

if(typeof gsap !== "undefined"){

gsap.from(".hero-left",{

x:-80,
opacity:0,
duration:1.2,
ease:"power4.out"

});

gsap.from(".hero-right",{

x:80,
opacity:0,
duration:1.2,
delay:.2,
ease:"power4.out"

});

gsap.from(".glass-card",{

y:60,
opacity:0,
stagger:.15,
duration:1,
delay:.4,
ease:"power4.out"

});

gsap.from(".metric-card",{

y:60,
opacity:0,
stagger:.1,
duration:1,
ease:"power4.out",

scrollTrigger:{

trigger:".metrics-section",
start:"top 80%"

}

});

}
/* SIGN OUT */

const signoutBtn =
document.getElementById("signoutBtn");

if(signoutBtn){

signoutBtn.addEventListener("click",()=>{

/* REMOVE USER */

localStorage.removeItem("currentUser");

/* =========================
   REAL TIME TOKEN SYSTEM
========================= */

const tokenCount =
document.getElementById("tokenCount");

const currentUser =
localStorage.getItem("currentUser");

/* INITIAL TOKENS */

if(currentUser){

if(
!localStorage.getItem(`tokens_${currentUser}`)
){

localStorage.setItem(
`tokens_${currentUser}`,
100
);

}

updateTokenDisplay();

}

/* UPDATE TOKEN UI */

function updateTokenDisplay(){

const activeUser =
localStorage.getItem("currentUser");

if(!activeUser || !tokenCount) return;

const tokens =
localStorage.getItem(`tokens_${activeUser}`) || 0;

tokenCount.innerText = tokens;

}

/* ADD TOKENS */

function addTokens(amount){

const activeUser =
localStorage.getItem("currentUser");

if(!activeUser) return;

let currentTokens =
parseInt(
localStorage.getItem(`tokens_${activeUser}`) || 0
);

currentTokens += amount;

localStorage.setItem(
`tokens_${activeUser}`,
currentTokens
);

updateTokenDisplay();

}

/* REMOVE TOKENS */

function removeTokens(amount){

const activeUser =
localStorage.getItem("currentUser");

if(!activeUser) return;

let currentTokens =
parseInt(
localStorage.getItem(`tokens_${activeUser}`) || 0
);

currentTokens -= amount;

if(currentTokens < 0){

currentTokens = 0;

}

localStorage.setItem(
`tokens_${activeUser}`,
currentTokens
);

updateTokenDisplay();

}

/* =========================
   PDF UPLOAD TOKENS
========================= */

const uploadBtn =
document.getElementById("uploadBtn");

const pdfUpload =
document.getElementById("pdfUpload");

if(uploadBtn && pdfUpload){

uploadBtn.addEventListener("click",()=>{

pdfUpload.click();

});

pdfUpload.addEventListener("change",(e)=>{

const file =
e.target.files[0];

if(!file) return;

if(file.type !== "application/pdf"){

alert("Please upload a PDF file.");

return;

}

/* REMOVE TOKENS ON UPLOAD */

removeTokens(5);

/* SAVE FILE NAME */

localStorage.setItem(
"uploadedFileName",
file.name
);

/* SAVE HISTORY */

let history = [];

try{

history =
JSON.parse(
localStorage.getItem("documentHistory")
) || [];

}catch(err){

history = [];

}

history.unshift(file.name);

history =
[...new Set(history)].slice(0,10);

localStorage.setItem(
"documentHistory",
JSON.stringify(history)
);

/* READ FILE */

const reader =
new FileReader();

reader.onload = function(ev){

localStorage.setItem(
"uploadedPDF",
ev.target.result
);

window.location.href =
"processing.html";

};

reader.readAsDataURL(file);

});

}

/* =========================
   TOKEN AUTO REFRESH
========================= */

setInterval(()=>{

updateTokenDisplay();

},500);
/* OPTIONAL CLEAR LOGIN INPUTS */

const username =
document.getElementById("username");

const password =
document.getElementById("password");

if(username) username.value = "";
if(password) password.value = "";

/* SHOW LOGIN MODAL AGAIN */

const loginModal =
document.getElementById("loginModal");

if(loginModal){

loginModal.style.display = "flex";

}

});

}