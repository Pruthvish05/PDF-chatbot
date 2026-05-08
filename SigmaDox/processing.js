const progressFill=
document.getElementById("progressFill");

const progressPercent=
document.getElementById("progressPercent");

const processingTitle=
document.getElementById("processingTitle");

const processingText=
document.getElementById("processingText");

const steps=
document.querySelectorAll(".step");

/* STAGES */

const stages=[

{
title:"Initializing AI Engine...",
text:"Preparing semantic understanding pipeline"
},

{
title:"Analyzing Document Structure...",
text:"Extracting metadata and page hierarchy"
},

{
title:"Building Contextual Understanding...",
text:"Mapping semantic relationships"
},

{
title:"Generating AI Insights...",
text:"Producing summaries and analytics"
},

{
title:"Finalizing Workspace...",
text:"Preparing intelligent dashboard"
}

];

let progress=0;

const interval=setInterval(()=>{

progress++;

progressFill.style.width=
`${progress}%`;

progressPercent.innerText=
`${progress}%`;

/* STAGES */

if(progress<20){

updateStage(0);

}

else if(progress<40){

updateStage(1);

steps[0].classList.add("active-step");

}

else if(progress<65){

updateStage(2);

steps[1].classList.add("active-step");

}

else if(progress<90){

updateStage(3);

steps[2].classList.add("active-step");

}

else{

updateStage(4);

steps[3].classList.add("active-step");

}

/* COMPLETE */

if(progress>=100){

clearInterval(interval);

setTimeout(()=>{

window.location.href=
"dashboard.html";

},1000);

}

},55);

/* UPDATE */

function updateStage(index){

processingTitle.innerText=
stages[index].title;

processingText.innerText=
stages[index].text;

}