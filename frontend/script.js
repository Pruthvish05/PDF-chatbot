pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const elements = {
    hero: document.getElementById("heroView"),
    dash: document.getElementById("dashboardView"),
    nav: document.getElementById("mainNav"),
    pdfInput: document.getElementById("pdfUpload"),
    pdfPreview: document.getElementById("pdfPreview")
};

/* VIEW SWITCHER */
function showDashboard() {
    elements.hero.style.display = "none";
    elements.nav.style.display = "none";
    elements.dash.style.display = "flex";
    
    // Load data into dash
    document.getElementById("documentName").innerText = localStorage.getItem("uploadedFileName") || "No File";
    if(localStorage.getItem("uploadedPDF")) elements.pdfPreview.src = localStorage.getItem("uploadedPDF");
}

function showLanding() {
    elements.hero.style.display = "grid";
    elements.nav.style.display = "flex";
    elements.dash.style.display = "none";
}

/* UPLOAD LOGIC */
document.getElementById("uploadBtn")?.addEventListener("click", () => {
    if(!localStorage.getItem("currentUser")) return alert("Login first");
    elements.pdfInput.click();
});

elements.pdfInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        // Save for the SPA session
        localStorage.setItem("uploadedPDF", this.result);
        localStorage.setItem("uploadedFileName", file.name);
        
        // PDF Text Extraction
        const typedArray = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let text = "";
        for(let i=1; i<=pdf.numPages; i++){
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(s => s.str).join(" ");
        }
        localStorage.setItem("pdfText", text);
        
        showDashboard(); // Instant switch!
    };
    reader.readAsDataURL(file);
});

/* AUTH & INITIALIZE */
document.getElementById("loginBtn")?.addEventListener("click", () => {
    const user = document.getElementById("username").value;
    localStorage.setItem("currentUser", user);
    localStorage.setItem(`tokens_${user}`, 100);
    location.reload();
});

document.getElementById("dashLogout")?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
});

// Cursor
document.addEventListener("mousemove", (e) => {
    gsap.to(".cursor", { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(".cursor-blur", { x: e.clientX, y: e.clientY, duration: 0.3 });
});

// Auto-check session on load
if(localStorage.getItem("uploadedPDF")) {
    showDashboard();
} else {
    showLanding();
}