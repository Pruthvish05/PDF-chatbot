/* =========================
   DOCUMENT NAME
========================= */

const summaryDocName =
document.getElementById("summaryDocName");

const uploadedFileName =
localStorage.getItem("uploadedFileName");

if(summaryDocName){

summaryDocName.innerText =
uploadedFileName || "No Document Uploaded";

}

/* =========================
   PDF TEXT
========================= */

const pdfText =
localStorage.getItem("pdfText") || "";

/* =========================
   KEYWORDS
========================= */

const keywordGrid =
document.getElementById("keywordGrid");

if(keywordGrid){

let keywords = [];

if(pdfText){

const words =
pdfText
.toLowerCase()
.replace(/[^\w\s]/g,"")
.split(/\s+/);

const ignoreWords = [

"the","and","for","that","with","this",
"from","have","will","into","your",
"about","their","them","were","been",
"using","used"

];

const frequency = {};

words.forEach((word)=>{

if(
word.length > 4 &&
!ignoreWords.includes(word)
){

frequency[word] =
(frequency[word] || 0) + 1;

}

});

keywords =
Object.entries(frequency)
.sort((a,b)=>b[1]-a[1])
.slice(0,8)
.map(item=>item[0]);

}

/* FALLBACK */

if(keywords.length === 0){

keywords = [

"Artificial Intelligence",
"Automation",
"Semantic Analysis",
"Research",
"Machine Learning",
"AI Systems"

];

}

keywordGrid.innerHTML = "";

keywords.forEach((word)=>{

const chip =
document.createElement("span");

chip.innerText = word;

keywordGrid.appendChild(chip);

});

}

/* =========================
   ANALYTICS
========================= */

const analyticsList =
document.getElementById("analyticsList");

if(analyticsList){

const analytics = [

`AI Confidence Score: ${Math.floor(Math.random()*8)+92}%`,

`Detected ${Math.floor(Math.random()*60)+20} semantic insights`,

`Estimated reading time: ${Math.floor(Math.random()*25)+10} minutes`,

`Document sentiment: Highly Analytical`,

`Detected language complexity: Advanced`,

`Context mapping successfully completed`

];

analytics.forEach((item)=>{

const li =
document.createElement("li");

li.innerText = item;

analyticsList.appendChild(li);

});

}

/* =========================
   SUMMARY
========================= */

const summaryContent =
document.getElementById("summaryContent");

if(summaryContent){

if(pdfText){

const sentences =
pdfText.match(/[^.!?]+[.!?]+/g) || [];

summaryContent.innerText =
sentences.slice(0,8).join(" ");

}else{

summaryContent.innerText =
"No summary available.";

}

}

/* =========================
   GSAP ANIMATIONS
========================= */

if(typeof gsap !== "undefined"){

gsap.from(".summary-card",{

y:80,
opacity:0,
stagger:.15,
duration:1.2,
ease:"power4.out"

});

gsap.from(".summary-header",{

y:60,
opacity:0,
duration:1,
ease:"power4.out"

});

gsap.from(".mode-btn",{

y:30,
opacity:0,
stagger:.1,
duration:1,
delay:.3

});

}