const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const processingTitle = document.getElementById("processingTitle");
const processingText = document.getElementById("processingText");
const steps = document.querySelectorAll(".step");

const stages = [
    { title: "Initializing AI Engine...", text: "Preparing semantic understanding pipeline" },
    { title: "Analyzing Document Structure...", text: "Extracting metadata and page hierarchy" },
    { title: "Building Contextual Understanding...", text: "Mapping semantic relationships" },
    { title: "Generating AI Insights...", text: "Producing summaries and analytics" },
    { title: "Finalizing Workspace...", text: "Preparing intelligent dashboard" }
];

function updateStage(index) {
    if (!stages[index]) return;
    processingTitle.innerText = stages[index].title;
    processingText.innerText = stages[index].text;
    if (steps[index]) steps[index].classList.add("active-step");
}

async function startBackendProcessing() {
    const base64Data = localStorage.getItem("temp_pdf_data");
    const fileName = localStorage.getItem("uploadedFileName");

    if (!base64Data) {
        alert("No file found to process.");
        window.location.href = "index.html";
        return;
    }

    // 1. Visual Progress Creep (Fake it till you make it)
    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 92) { // Hold at 92% until backend responds
            progress += 1;
            progressFill.style.width = `${progress}%`;
            progressPercent.innerText = `${progress}%`;
            
            if (progress === 20) updateStage(1);
            if (progress === 50) updateStage(2);
            if (progress === 80) updateStage(3);
        }
    }, 80);

    // 2. Real Backend Call
    try {
        // Convert base64 back to Blob
        const byteString = atob(base64Data.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const fileBlob = new Blob([ab], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append("file", fileBlob, fileName);

        const response = await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            clearInterval(interval);
            // 3. Complete visual flow
            progressFill.style.width = "100%";
            progressPercent.innerText = "100%";
            updateStage(4);

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            throw new Error("Server error");
        }
    } catch (err) {
        clearInterval(interval);
        alert("Connection to Backend failed. Ensure Python is running!");
        window.location.href = "index.html";
    }
}

// Start immediately on page load
document.addEventListener("DOMContentLoaded", startBackendProcessing);