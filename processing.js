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
    processingTitle.innerText = stages[index].title;
    processingText.innerText = stages[index].text;
    // Activate the corresponding step dot in the UI
    if (steps[index - 1]) steps[index - 1].classList.add("active-step");
}

// THIS IS THE MAIN FUNCTION CALLED FROM SCRIPT.JS
async function processDocument(file) {
    let progress = 0;
    
    // 1. Start a fake progress creep (so the user sees movement immediately)
    const interval = setInterval(() => {
        if (progress < 90) { // Hang at 90 until backend finishes
            progress++;
            progressFill.style.width = `${progress}%`;
            progressPercent.innerText = `${progress}%`;
            
            // Logic to update text based on progress
            if (progress < 20) updateStage(0);
            else if (progress < 40) updateStage(1);
            else if (progress < 65) updateStage(2);
            else if (progress < 90) updateStage(3);
        }
    }, 100);

    // 2. The Actual Backend Call
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Backend Success:", result);

            // 3. Force completion once backend is done
            clearInterval(interval);
            progress = 100;
            progressFill.style.width = `100%`;
            progressPercent.innerText = `100%`;
            updateStage(4);

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);
            
        } else {
            throw new Error("Backend failed to process");
        }
    } catch (error) {
        clearInterval(interval);
        alert("Error connecting to Python backend: " + error.message);
        window.location.href = "index.html"; // Send back to try again
    }
}

// In script.js, you would call: processDocument(uploadedFile);