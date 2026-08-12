(() => {
  "use strict";

  const APP_VERSION = "4.1.0";
  const STORAGE_KEY = "405-south-transfer-command-v4";
  const GRADE_POINTS = {"A":4,"A-":3.7,"B+":3.3,"B":3,"B-":2.7,"C+":2.3,"C":2,"C-":1.7,"D+":1.3,"D":1,"D-":0.7,"F":0};
  const PASS_GE = g => g && g !== "W" && g !== "P" ? (GRADE_POINTS[g] ?? -1) >= 2 : g === "P";
  const ACTIVE = c => !["dropped","withdrawn"].includes(c.status);
  const esc = s => String(s ?? "").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
  const deep = x => JSON.parse(JSON.stringify(x));
  const byId = id => document.getElementById(id);

  const TERMS = [
    {id:"sum26",label:"Summer 2026",short:"SU26",start:"2026-06-22",end:"2026-08-09",kind:"summer"},
    {id:"fall26",label:"Fall 2026",short:"FA26",start:"2026-08-31",end:"2026-12-22",kind:"regular",locked:true},
    {id:"win27",label:"Winter 2027",short:"WI27",start:"2027-01-04",end:"2027-02-11",kind:"winter"},
    {id:"spr27",label:"Spring 2027",short:"SP27",start:"2027-02-16",end:"2027-06-16",kind:"regular"},
    {id:"sum27",label:"Summer 2027",short:"SU27",start:"2027-06-21",end:"2027-08-13",kind:"summer"},
    {id:"fall27",label:"Fall 2027",short:"FA27",start:"2027-08-30",end:"2027-12-21",kind:"regular"},
    {id:"win28",label:"Winter 2028",short:"WI28",start:"2028-01-04",end:"2028-02-10",kind:"winter"},
    {id:"spr28",label:"Spring 2028",short:"SP28",start:"2028-02-14",end:"2028-06-13",kind:"regular"}
  ];

  const COURSES = [
    {id:"bus1",code:"BUS 1",title:"Introduction to Business",units:3,term:"sum26",status:"completed",grade:"C",category:"elective",uc:true,required:[],geTargets:[],discipline:"business",locked:true,why:"Completed transferable elective. UCI lists it as an additional approved course for the major, but it is not one of the required admission-prep courses.",source:"UC TCA 2025–26 · UCI Bus Admin ASSIST 2025–26"},
    {id:"acctg1",code:"ACCTG 1",title:"Introduction to Financial Accounting",units:5,term:"fall26",status:"enrolled",grade:null,category:"major",uc:true,required:["uci","ucla"],geTargets:[],discipline:"accounting",locked:true,section:"1005",days:"Tue / Thu",time:"12:45–3:10 PM",location:"Main Campus · CPC 104",modality:"On Ground",instructor:"Knight R B",dates:"Sep 1 – Dec 22",deadlines:{refund:"2026-09-13",avoidW:"2026-09-27",drop:"2026-11-22",pnp:"2026-12-22"},why:"Required major preparation for both UCI Business Administration and UCLA Business Economics.",source:"UCI Bus Admin ASSIST 2025–26 · UCLA Bus Econ ASSIST 2025–26"},
    {id:"ahis11",code:"AHIS 11",title:"Art Appreciation: Introduction to Global Visual Culture",units:3,term:"fall26",status:"enrolled",grade:null,category:"ge",uc:true,required:[],geTargets:["3A"],discipline:"art-history",locked:true,section:"1072",days:"Flexible",time:"Arrange · 3 hrs",location:"Online",modality:"Flexible Online",instructor:"Ahmadpour A",dates:"Aug 31 – Dec 22",deadlines:{refund:"2026-09-13",avoidW:"2026-09-27",drop:"2026-11-22",pnp:"2026-12-22"},why:"Covers Cal-GETC Area 3A (Arts) and adds 3 UC-transferable units.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"},
    {id:"econ1",code:"ECON C2001",title:"Principles of Microeconomics",units:3,term:"fall26",status:"enrolled",grade:null,category:"major",uc:true,required:["uci","ucla"],geTargets:["4"],discipline:"economics",locked:true,section:"1877",days:"Flexible",time:"Arrange · 3 hrs",location:"Online",modality:"Flexible Online",instructor:"Su B C",dates:"Aug 31 – Dec 22",deadlines:{refund:"2026-09-13",avoidW:"2026-09-27",drop:"2026-11-22",pnp:"2026-12-22"},why:"Required by UCI and UCLA. Also supplies one of the two Area 4 courses; the second Area 4 course must come from another discipline.",source:"Cal-GETC 2026–27 · UCI/UCLA ASSIST 2025–26"},
    {id:"engl1",code:"ENGL C1000",title:"Academic Reading and Writing",units:3,term:"fall26",status:"enrolled",grade:null,category:"english",uc:true,required:[],admissionCore:true,geTargets:["1A"],discipline:"english",locked:true,section:"1984",days:"Mon / Wed",time:"9:30–10:50 AM",location:"Online",modality:"Scheduled Online",instructor:"Stirling M S",dates:"Aug 31 – Dec 22",deadlines:{refund:"2026-09-13",avoidW:"2026-09-27",drop:"2026-11-22",pnp:"2026-12-21"},why:"Covers Cal-GETC Area 1A and the first transferable English composition requirement.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"},
    {id:"math2",code:"MATH 2",title:"Precalculus",units:5,term:"win27",status:"planned",grade:null,category:"gateway",uc:true,required:[],geTargets:[],discipline:"mathematics",why:"Your preferred Winter math course. It is UC-transferable and can satisfy Area 2, but it does not replace the MATH 7/MATH 8 calculus sequence required by UCI/UCLA. Keep it if placement or prerequisite rules require it.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"},
    {id:"math7",code:"MATH 7",title:"Calculus 1",units:5,term:"spr27",status:"planned",grade:null,category:"major",uc:true,required:["uci","ucla"],geTargets:["2"],discipline:"mathematics",why:"Required by both target majors and the first half of the calculus chain. Also covers Cal-GETC Area 2.",source:"UCI/UCLA ASSIST 2025–26 · Cal-GETC 2026–27"},
    {id:"acctg2",code:"ACCTG 2",title:"Corporate Financial and Managerial Accounting",units:5,term:"spr27",status:"planned",grade:null,category:"major",uc:true,required:["uci","ucla"],geTargets:[],discipline:"accounting",why:"Required by both target majors. Best kept after ACCTG 1 and before the application cycle.",source:"UCI/UCLA ASSIST 2025–26"},
    {id:"econ2",code:"ECON C2002",title:"Principles of Macroeconomics",units:3,term:"spr27",status:"planned",grade:null,category:"major",uc:true,required:["uci","ucla"],geTargets:[],discipline:"economics",why:"Required by both target majors. Do not use it as the second Area 4 course because it is the same discipline group as ECON C2001.",source:"UCI/UCLA ASSIST 2025–26 · Cal-GETC 2026–27"},
    {id:"engl2",code:"ENGL C1001",title:"Critical Thinking and Writing",units:3,term:"sum27",status:"planned",grade:null,category:"english",uc:true,required:[],admissionCore:true,geTargets:["1B"],discipline:"english",why:"Covers Cal-GETC Area 1B and the second transferable English course. It is also listed under 3B through Fall 2027, but the plan assigns it to 1B only.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"},
    {id:"comm",code:"COMM C1000",title:"Introduction to Public Speaking",units:3,term:"sum27",status:"planned",grade:null,category:"ge",uc:true,required:[],geTargets:["1C"],discipline:"communication",why:"Closes Cal-GETC Area 1C and is useful for pitching, client calls, and presentations.",source:"Cal-GETC 2026–27"},
    {id:"math8",code:"MATH 8",title:"Calculus 2",units:5,term:"fall27",status:"planned",grade:null,category:"major",uc:true,required:["uci","ucla"],geTargets:[],discipline:"mathematics",why:"Required by both target majors and completes the calculus sequence. Keeping it in Fall 2027 means it is visible as in progress when you apply and reported in the January TAU.",source:"UCI/UCLA ASSIST 2025–26 · UC TCA 2025–26"},
    {id:"stat",code:"STAT C1000",title:"Introduction to Statistics",units:4,term:"fall27",status:"planned",grade:null,category:"major",uc:true,required:["uci"],geTargets:[],discipline:"statistics",why:"Required for UCI Business Administration. UCLA Business Economics does not list this among the articulated lower-division prep courses you supplied.",source:"UCI Bus Admin ASSIST 2025–26 · Cal-GETC 2026–27"},
    {id:"eth",code:"ETH ST 1",title:"Introduction to Ethnic Studies",units:3,term:"fall27",status:"planned",grade:null,category:"ge",uc:true,required:[],geTargets:["6"],discipline:"ethnic-studies",why:"Assigned to Cal-GETC Area 6. Although the course is also listed in Area 4, this plan does not double-use it there.",source:"Cal-GETC 2026–27"},
    {id:"media",code:"MEDIA 1",title:"Survey of Mass Media Communications",units:3,term:"fall27",status:"planned",grade:null,category:"ge",uc:true,required:[],geTargets:["4"],discipline:"media",why:"Provides the second Area 4 course from a discipline different from economics, while also fitting your business/media work.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"},
    {id:"hist",code:"HIST C1002",title:"United States History since 1865",units:3,term:"win28",status:"planned",grade:null,category:"ge",uc:true,required:[],geTargets:["3B"],discipline:"history",why:"Current Fall 2026 numbering for the course formerly called HIST 12. Assigned to Cal-GETC Area 3B.",source:"Cal-GETC 2026–27"},
    {id:"astron",code:"ASTRON 1",title:"Stellar Astronomy",units:3,term:"spr28",status:"planned",grade:null,category:"ge",uc:true,required:[],geTargets:["5A"],discipline:"astronomy",why:"A 3-unit physical science course covering Cal-GETC Area 5A. The lab requirement is handled by BIOL 3 on the biological-science side.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"},
    {id:"biol",code:"BIOL 3",title:"Fundamentals of Biology",units:4,term:"spr28",status:"planned",grade:null,category:"ge",uc:true,required:[],geTargets:["5B","5C"],discipline:"biology",why:"Lecture with lab. One course closes biological science Area 5B and the laboratory Area 5C together.",source:"Cal-GETC 2026–27 · UC TCA 2025–26"}
  ];

  const SCHOOLS = {
    uci:{name:"UC Irvine",short:"UCI",major:"Business Administration, B.A.",role:"Primary",req:["math7","math8","econ1","econ2","stat","acctg1","acctg2"],note:"Competitive major. UCI Business Administration does not participate in TAG for this cycle. Preference goes to junior-level applicants with the strongest overall grades who complete the required lower-division preparation.",source:"ASSIST · SMC → UCI Business Administration · 2025–26"},
    ucla:{name:"UCLA",short:"UCLA",major:"Business Economics, B.A.",role:"High target",req:["math7","math8","econ1","econ2","acctg1","acctg2"],note:"Highly selective. The supplied agreement says all listed preparation must be completed by spring before transfer and strongly encourages completion by the prior fall. All prep must be taken for a letter grade.",source:"ASSIST · SMC → UCLA Business Economics · 2025–26"}
  };

  const GE_AREAS = [
    {id:"1A",name:"English Composition",need:1}, {id:"1B",name:"Critical Thinking",need:1}, {id:"1C",name:"Oral Communication",need:1},
    {id:"2",name:"Math / Quantitative Reasoning",need:1}, {id:"3A",name:"Arts",need:1}, {id:"3B",name:"Humanities",need:1},
    {id:"4",name:"Social & Behavioral Sciences",need:2,differentDisciplines:true}, {id:"5A",name:"Physical Science",need:1},
    {id:"5B",name:"Biological Science",need:1}, {id:"5C",name:"Laboratory",need:1}, {id:"6",name:"Ethnic Studies",need:1}
  ];

  const GE_ALTS = {
    "1C":[["COMM C1000","Introduction to Public Speaking",3],["COM ST 21","Argumentation",3]],
    "3B":[["HIST C1002","United States History since 1865",3],["ENGL C1002","Introduction to Literature",3],["FILM 5","Film and Society",3]],
    "4":[["MEDIA 1","Survey of Mass Media Communications",3],["SOCIOL 1","Introduction to Sociology",3],["PSYCH C1000","Introduction to Psychology",3]],
    "5A":[["ASTRON 1","Stellar Astronomy",3],["GEOL 1","Physical Geology without Laboratory",3],["PHYSCS 12","Introductory Physics — Non-Laboratory",3]],
    "5B":[["BIOL 3","Fundamentals of Biology with Lab",4],["ANTHRO 5","Biological Anthropology with Laboratory",4],["BOTANY 1","General Botany with Lab",4]],
    "5C":[["BIOL 3","Fundamentals of Biology with Lab",4],["ANTHRO 5","Biological Anthropology with Laboratory",4],["BOTANY 1","General Botany with Lab",4]],
    "6":[["ETH ST 1","Introduction to Ethnic Studies",3],["ETH ST 7","Introduction to African American and Black Studies",3]]
  };

  const SOURCES = [
    {title:"UCI Business Administration articulation",year:"2025–26",status:"Working source",detail:"Required: MATH 7, MATH 8, ECON C2001, ECON C2002, STAT C1000, ACCTG 1, ACCTG 2. BUS 1 is additional approved coursework."},
    {title:"UCLA Business Economics articulation",year:"2025–26",status:"Working source",detail:"Required: micro, macro, MATH 7, MATH 8, ACCTG 1, ACCTG 2. Highly selective; letter grades required for major prep."},
    {title:"SMC Cal-GETC course list",year:"2026–27",status:"Current",detail:"Used for all GE area assignments and current course numbering, including ECON C2001/C2002 and HIST C1002."},
    {title:"SMC UC Transfer Course Agreement",year:"2025–26",status:"Working source",detail:"Used as the UC-transferability/unit-credit database. Source year is stored without cluttering every course card."}
  ];

  const MILESTONES = [
    {id:"fall-start",date:"2026-08-31",kind:"school",title:"Fall 2026 begins",note:"AHIS 11, ECON C2001 and ENGL C1000 begin. ACCTG 1 begins Sep 1."},
    {id:"refund",date:"2026-09-13",kind:"hard",title:"Fall refund deadline",note:"From your actual Fall 2026 registration record."},
    {id:"avoid-w",date:"2026-09-27",kind:"hard",title:"Last day to drop without a W",note:"From your actual Fall 2026 registration record."},
    {id:"scholars-open",date:"2026-10-12",kind:"program",title:"SMC Scholars application window opens",note:"Track early if you want UCLA TAP. Reconfirm the cycle before submitting.",confirm:true},
    {id:"math-decision",date:"2026-10-15",kind:"decision",title:"Confirm MATH 2 → MATH 7 path",note:"Confirm placement/prerequisite and Winter offering before registration."},
    {id:"drop-w",date:"2026-11-22",kind:"hard",title:"Last day to drop with a W",note:"From your Fall 2026 registration record."},
    {id:"fall-finals",date:"2026-12-15",kind:"school",title:"Fall finals begin",note:"Fall term ends Dec 22."},
    {id:"winter-start",date:"2027-01-04",kind:"school",title:"Winter 2027 starts",note:"Preferred plan: MATH 2, if available and required by placement/prerequisite."},
    {id:"spring-start",date:"2027-02-16",kind:"school",title:"Spring 2027 starts",note:"MATH 7 + ACCTG 2 + ECON C2002 in the current route."},
    {id:"uc-open",date:"2027-08-01",kind:"apply",title:"UC application opens",note:"Start activities and PIQ work early."},
    {id:"uc-submit-open",date:"2027-10-01",kind:"apply",title:"UC submission window opens",note:"Do not wait for the deadline."},
    {id:"uc-deadline",date:"2027-11-30",kind:"hard",title:"UC application deadline",note:"Target an internal mid-November submission date."},
    {id:"tau",date:"2028-01-31",kind:"hard",title:"UC Transfer Academic Update due",note:"Report Fall 2027 grades and confirm Spring 2028 courses."},
    {id:"aid",date:"2028-03-02",kind:"apply",title:"Financial-aid priority deadline",note:"Confirm the exact 2028 FAFSA/Cal Grant date before filing.",confirm:true},
    {id:"decisions",date:"2028-04-30",kind:"apply",title:"UC decisions expected by late April",note:"Timing varies by campus.",confirm:true},
    {id:"sir",date:"2028-06-01",kind:"hard",title:"Statement of Intent to Register",note:"Confirm the exact campus deadline in your admission offer.",confirm:true},
    {id:"finish",date:"2028-06-13",kind:"hard",title:"Spring 2028 ends",note:"60 UC-transferable units and all planned requirements must be complete."},
    {id:"certify",date:"2028-07-01",kind:"hard",title:"Request Cal-GETC certification + final transcripts",note:"Certification is not automatic. Reconfirm the process with SMC."}
  ];

  const PLAYBOOK = [
    {id:"grades",title:"Grades",sub:"Protect the academic record",tips:["Treat transferable GPA and major-prep grades as the first constraint before adding activities.","Finish as much major preparation as possible by the fall term in which you apply.","Check ASSIST before registration, not after finishing the course.","Use grade-distribution data and instructor reviews as signals, not guarantees.","One C is recoverable arithmetic. Use the GPA engine to see the exact recovery path."]},
    {id:"counseling",title:"Counseling",sub:"Verify the route repeatedly",tips:["Meet an SMC counselor before every registration window and during active terms.","Bring the current ASSIST agreement, Cal-GETC list and transcript to the meeting.","Ask directly about Scholars, TAP, UCLA CCCP, priority registration, scholarships and university-representative visits.","Record the counselor name, date, advice and anything that still needs verification."]},
    {id:"calgetc",title:"Cal-GETC",sub:"Track GE separately from major prep",tips:["Use Cal-GETC, not the older IGETC pathway, for this start year.","Do not assume a course listed in two areas can be certified in both.","Area 4 needs two courses from different discipline groups; ECON C2001 + ECON C2002 do not solve it together.","Request certification; graduation does not automatically certify Cal-GETC."]},
    {id:"programs",title:"Programs and odds",sub:"Official data before anecdotes",tips:["Use official major-level transfer data when judging selectivity; campus-wide rates are not major-specific odds.","UCI Business Administration is a competitive application, not a TAG route.","UCLA TAP is priority consideration through SMC Scholars, not guaranteed admission.","Add backup campuses only if you would actually attend and the cost/major access works."]},
    {id:"activities",title:"Extracurriculars",sub:"Depth and proof",tips:["A paid job counts. Running SMMZolo counts. Quantify real work and real outcomes.","Depth beats filler. One sustained business can say more than a list of inactive memberships.","Connect activities to decisions, actions and measurable results instead of generic titles."]},
    {id:"piqs",title:"PIQs",sub:"Evidence over adjectives",tips:["Build the activities list first, then choose PIQ stories that add depth instead of repeating it.","Use plain language, active voice and specific actions/results.","If the business is the strongest unusual experience, give it enough room to show problem → action → impact → change.","Proofread on separate days and have a human reader check clarity."]},
    {id:"reality",title:"Reality checks",sub:"No magical feeder-school thinking",tips:["SMC students do transfer to selective universities; individual stories prove possibility, not probability.","The UC minimum establishes eligibility, not competitiveness for a selective major.","Extra units are not automatically useful; protect GPA and prerequisite timing.","A rejection does not erase completed transferable units or the ability to use another admitted option or application cycle."]}
  ];

  function defaultState(){
    return {
      version:APP_VERSION,
      courses:deep(COURSES),
      settings:{targetGpa:3.70,primarySchool:"uci",mathPath:"math2-first",theme:"system"},
      ui:{screen:"today",planMode:"route",reqMode:"schools",applyMode:"timeline",openPlaybook:"grades",openGeAlts:null},
      milestoneStatus:{}, tau:{grades:false,spring:false,changes:false,submitted:false},
      decisions:{math:"MATH 2 first",scholars:"Undecided"},
      counselorLogs:[], snapshots:[], undo:null, sourceReview:"2026-08-11"
    };
  }

  let state = loadState();
  let courseSheetId = null;

  function loadState(){
    try{
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(!raw || !raw.courses) return defaultState();
      const base = defaultState();
      return {...base,...raw,settings:{...base.settings,...raw.settings},ui:{...base.ui,...raw.ui},tau:{...base.tau,...raw.tau},decisions:{...base.decisions,...raw.decisions}};
    }catch{return defaultState()}
  }
  function save(){ state.version=APP_VERSION; localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
  function rememberUndo(label){ state.undo={label,at:new Date().toISOString(),courses:deep(state.courses),settings:deep(state.settings),decisions:deep(state.decisions)}; }
  function undo(){ if(!state.undo)return toast("Nothing to undo"); const u=state.undo; state.courses=u.courses;state.settings=u.settings;state.decisions=u.decisions;state.undo=null;save();renderAll();toast(`Undid: ${u.label}`); }
  function termIndex(id){return TERMS.findIndex(t=>t.id===id)}
  function course(id){return state.courses.find(c=>c.id===id)}
  function fmtDate(s,opts={month:"short",day:"numeric",year:"numeric"}){return new Intl.DateTimeFormat("en-US",opts).format(new Date(s+"T12:00:00"))}
  function daysUntil(s){const now=new Date();now.setHours(0,0,0,0);const d=new Date(s+"T00:00:00");return Math.ceil((d-now)/86400000)}
  function currentTerm(){const now=new Date();return TERMS.find(t=>now>=new Date(t.start+"T00:00:00")&&now<=new Date(t.end+"T23:59:59")) || null}
  function courseUnits(filter){return state.courses.filter(c=>c.uc&&ACTIVE(c)&&filter(c)).reduce((n,c)=>n+c.units,0)}
  function completedUnits(){return courseUnits(c=>c.status==="completed")}
  function enrolledUnits(){return courseUnits(c=>c.status==="enrolled")}
  function plannedUnits(){return courseUnits(c=>c.status==="planned"||c.status==="considering")}
  function projectedUnits(){return completedUnits()+enrolledUnits()+plannedUnits()}
  function afterFallUnits(){return courseUnits(c=>c.status==="completed" || c.term==="fall26")}
  function gpaData(){
    let pts=0,units=0,prepPts=0,prepUnits=0;
    state.courses.forEach(c=>{ if(c.status!=="completed"||!(c.grade in GRADE_POINTS)||!c.uc)return; pts+=GRADE_POINTS[c.grade]*c.units;units+=c.units;if(c.required?.length){prepPts+=GRADE_POINTS[c.grade]*c.units;prepUnits+=c.units;} });
    return {gpa:units?pts/units:null,units,pts,prepGpa:prepUnits?prepPts/prepUnits:null,prepUnits};
  }
  function targetNeeded(){const d=gpaData(),total=projectedUnits();if(!d.units||total<=d.units)return null;return (state.settings.targetGpa*total-d.pts)/(total-d.units)}
  function requirementStatus(schoolId){
    const req=SCHOOLS[schoolId].req; let mapped=0,done=0;
    req.forEach(id=>{const c=course(id);if(c&&ACTIVE(c)){mapped++;if(c.status==="completed"&&c.grade in GRADE_POINTS&&GRADE_POINTS[c.grade]>=2)done++;}});
    return {mapped,done,total:req.length};
  }
  function geAssignments(area){return state.courses.filter(c=>ACTIVE(c)&&c.geTargets?.includes(area.id))}
  function geStatus(area){
    const rows=geAssignments(area);
    let mapped=false,completed=false,detail="";
    if(area.id==="4"){
      const disciplines=[...new Set(rows.map(c=>c.discipline))]; mapped=rows.length>=2&&disciplines.length>=2;
      const doneRows=rows.filter(c=>c.status==="completed"&&PASS_GE(c.grade)); const doneDisc=[...new Set(doneRows.map(c=>c.discipline))]; completed=doneRows.length>=2&&doneDisc.length>=2;
      detail=`${rows.length}/2 assigned · ${disciplines.length} disciplines`;
    }else{
      mapped=rows.length>=1; completed=rows.some(c=>c.status==="completed"&&PASS_GE(c.grade)); detail=rows.length?rows.map(c=>c.code).join(" + "):"Open";
    }
    return {rows,mapped,completed,detail};
  }
  function geSummary(){const statuses=GE_AREAS.map(a=>geStatus(a));return {mapped:statuses.filter(x=>x.mapped).length,completed:statuses.filter(x=>x.completed).length,total:GE_AREAS.length}}
  function planHealth(){
    const uci=requirementStatus("uci"),ucla=requirementStatus("ucla"),ge=geSummary(),total=projectedUnits();
    const chainOk=termIndex(course("math2")?.term)<termIndex(course("math7")?.term)&&termIndex(course("math7")?.term)<termIndex(course("math8")?.term);
    return [
      {label:"60 UC-transferable units",ok:total>=60,meta:`Projected ${total} · buffer ${total>=60?"+"+(total-60):total-60}`},
      {label:"UCI Business Administration prep",ok:uci.mapped===uci.total,meta:`${uci.mapped}/${uci.total} required courses mapped`},
      {label:"UCLA Business Economics prep",ok:ucla.mapped===ucla.total,meta:`${ucla.mapped}/${ucla.total} required courses mapped`},
      {label:"Cal-GETC coverage",ok:ge.mapped===ge.total,meta:`${ge.mapped}/${ge.total} areas assigned · ${ge.completed} complete`},
      {label:"Math prerequisite chain",ok:chainOk,meta:chainOk?"MATH 2 → MATH 7 → MATH 8":"Course order needs attention"}
    ];
  }
  function nextMilestone(hardOnly=false){const now=new Date();return MILESTONES.filter(m=>(!hardOnly||m.kind==="hard")&&new Date(m.date+"T23:59:59")>=now&&state.milestoneStatus[m.id]!=="handled").sort((a,b)=>a.date.localeCompare(b.date))[0]}
  function termLoad(termId){return state.courses.filter(c=>c.term===termId&&ACTIVE(c)).reduce((n,c)=>n+c.units,0)}
  function courseValue(c){const schoolJobs=(c.required||[]).length;const geJobs=(c.geTargets||[]).length;return schoolJobs*2+geJobs+(c.uc?0.5:0)}
  function valueLabel(c){const v=courseValue(c);if(v>=4)return "HIGH VALUE";if(v>=2.5)return "MULTI-USE";if(v>=1.5)return "REQUIRED";if(v>=1)return "GE";return "UNIT CREDIT"}

  function renderHeader(){
    const primary=SCHOOLS[state.settings.primarySchool];byId("destinationName").textContent=primary.name.toUpperCase();byId("destinationMajor").textContent=`${primary.major.replace(", B.A.","")} · Fall 2028`;byId("remainingAfterFall").textContent=Math.max(0,60-afterFallUnits());
  }

  function renderToday(){
    const hard=nextMilestone(true), next=nextMilestone(false), total=projectedUnits(), ge=geSummary(), uci=requirementStatus("uci"),ucla=requirementStatus("ucla"),g=gpaData(),needed=targetNeeded();
    const fallDays=daysUntil("2026-08-31");
    const actions=[];
    if(fallDays>=0&&fallDays<=21)actions.push({t:`Fall 2026 begins in ${fallDays} day${fallDays===1?"":"s"}`,d:"Your 14-unit paid schedule is locked in the planner. Check each course site before the first meeting."});
    if(state.decisions.math!=="Confirmed with counselor")actions.push({t:"Confirm the Winter math prerequisite",d:"Your saved preference is MATH 2 in Winter 2027, then MATH 7 in Spring and MATH 8 in Fall."});
    if(state.decisions.scholars==="Undecided")actions.push({t:"Decide whether UCLA TAP is worth pursuing",d:"Track SMC Scholars early enough to meet its multi-term requirements; UCI remains the primary target."});
    if(!actions.length)actions.push({t:"Nothing urgent beyond the next deadline",d:"Protect the grades and keep the plan verified."});
    const schedule=state.courses.filter(c=>c.term==="fall26"&&c.status==="enrolled");
    byId("todayContent").innerHTML=`
      <div class="hero-status">
        <span class="micro">NEXT HARD DEADLINE</span>
        <div class="hero-main"><strong>${hard?esc(hard.title):"No open hard deadline"}</strong><div class="deadline-count">${hard?Math.max(0,daysUntil(hard.date))+"D":"—"}</div></div>
        <div class="hero-sub">${hard?fmtDate(hard.date)+" · "+esc(hard.note):"All tracked hard deadlines are handled."}</div>
      </div>
      <div class="unit-strip">
        <div class="unit-cell primary"><strong>${completedUnits()}</strong><span>Completed</span></div>
        <div class="unit-cell"><strong>${enrolledUnits()}</strong><span>Enrolled</span></div>
        <div class="unit-cell"><strong>${plannedUnits()}</strong><span>Planned</span></div>
        <div class="unit-cell"><strong>${total}</strong><span>Projected</span></div>
      </div>
      <div class="card accent">
        <div class="card-title-row"><div><span class="section-kicker">PLAN HEALTH</span><h2>${total>=60&&ge.mapped===ge.total&&uci.mapped===uci.total?"On track for the current route":"Route needs attention"}</h2></div><span class="status-pill ${total>=60?"ok":"watch"}">${total}/60 UNITS</span></div>
        <p>${total>=60?`The saved plan reaches ${total} UC-transferable units by Spring 2028, a +${total-60} unit buffer.`:`The saved plan is ${60-total} units short.`}</p>
        <div class="spacer-12"></div><div class="health-list">${planHealth().map(h=>`<div class="health-row"><div><div class="health-label">${esc(h.label)}</div><div class="health-meta">${esc(h.meta)}</div></div><span class="status-pill ${h.ok?"ok":"watch"}">${h.ok?"ON TRACK":"CHECK"}</span></div>`).join("")}</div>
      </div>
      <div class="card">
        <div class="card-title-row"><div><span class="section-kicker">NEXT ACTIONS</span><h2>What matters now</h2></div>${next?`<span class="tag amber">${Math.max(0,daysUntil(next.date))}D</span>`:""}</div>
        <div class="spacer-8"></div><div class="action-list">${actions.slice(0,3).map((a,i)=>`<div class="action-row"><div class="action-index">0${i+1}</div><div class="action-body"><strong>${esc(a.t)}</strong><span>${esc(a.d)}</span></div></div>`).join("")}</div>
      </div>
      <div class="card">
        <div class="card-title-row"><div><span class="section-kicker">FALL 2026</span><h2>Your paid schedule</h2></div><span class="status-pill info">14 UNITS · LOCKED</span></div>
        <p>Scheduled classes first; flexible online classes stay separated so the week is easier to scan.</p>
        <div class="spacer-8"></div>
        ${schedule.map(c=>`<div class="course-row" data-course="${c.id}"><div class="course-main"><div class="course-code">${esc(c.code)}</div><div class="course-title">${esc(c.days)} · ${esc(c.time)}${c.location?" · "+esc(c.location):""}</div></div><div class="course-side"><strong>${c.units}U</strong><span>${esc(c.modality)}</span></div></div>`).join("")}
      </div>
      <div class="card">
        <div class="card-title-row"><div><span class="section-kicker">GPA</span><h2>${g.gpa===null?"No graded UC work yet":g.gpa.toFixed(2)+" current UC-transferable GPA"}</h2></div><span class="tag">TARGET ${state.settings.targetGpa.toFixed(2)}</span></div>
        <p>${needed===null?"Enter final grades as courses finish.":needed>4?`${state.settings.targetGpa.toFixed(2)} is not reachable if every remaining planned unit is graded on a 4.0 scale.`:`With BUS 1 at C, you need about a ${needed.toFixed(2)} average across the remaining mapped graded units to finish at ${state.settings.targetGpa.toFixed(2)}.`}</p>
      </div>`;
  }

  function renderPlan(){
    const mode=state.ui.planMode;document.querySelectorAll("#planMode button").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    if(mode==="route") renderRoute(); else if(mode==="matrix") renderMatrix(); else renderCritical();
  }
  function renderRoute(){
    const now=new Date();
    byId("planContent").innerHTML=`<div class="route">${TERMS.map(t=>{
      const list=state.courses.filter(c=>c.term===t.id&&ACTIVE(c)); if(!list.length)return "";
      const end=new Date(t.end+"T23:59:59"),start=new Date(t.start+"T00:00:00"); const cls=end<now?"done":start<=now&&end>=now?"current":"future";
      return `<article class="term ${cls}"><div class="term-node"></div><div class="term-card"><div class="term-head"><div><h3>${t.label}</h3><div class="term-meta">${fmtDate(t.start,{month:"short",day:"numeric"})} – ${fmtDate(t.end,{month:"short",day:"numeric",year:"numeric"})}</div></div><div class="term-right"><div class="term-units">${termLoad(t.id)} UNITS</div><div class="term-status">${t.locked?"Enrolled · locked":cls==="done"?"Done":"Planned"}</div></div></div><div class="term-body">${list.map(courseRow).join("")}</div></div></article>`;
    }).join("")}<div class="term future"><div class="term-node"></div><div class="term-card"><div class="term-head"><div><h3>UC Irvine</h3><div class="term-meta">Fall 2028 destination</div></div><div class="term-right"><div class="term-units">${projectedUnits()} / 60</div><div class="term-status">PROJECTED</div></div></div></div></div></div>`;
  }
  function courseRow(c){return `<div class="course-row" data-course="${c.id}"><div class="course-main"><div class="course-code">${esc(c.code)}${c.locked?` <svg class="lock-icon" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`:""}</div><div class="course-title">${esc(c.title)}</div><div class="course-tags"><span class="tag ${c.required?.length?"blue":""}">${valueLabel(c)}</span>${c.geTargets?.map(a=>`<span class="tag">GE ${a}</span>`).join("")||""}</div></div><div class="course-side"><strong>${c.units}U</strong><span>${c.status.toUpperCase()}</span></div></div>`}
  function renderMatrix(){
    const rows=state.courses.filter(c=>ACTIVE(c));
    byId("planContent").innerHTML=`<div class="card"><div class="card-title-row"><div><span class="section-kicker">REQUIREMENT MATRIX</span><h2>One class, every job</h2></div><span class="tag green">${projectedUnits()} PROJECTED</span></div><p>School requirements, Cal-GETC assignments and UC unit credit are kept separate.</p></div><div class="matrix-wrap"><table class="matrix"><thead><tr><th>Course</th><th>Term</th><th>UCI Bus Admin</th><th>UCLA Bus Econ</th><th>Cal-GETC</th><th>UC units</th></tr></thead><tbody>${rows.map(c=>`<tr data-course="${c.id}"><td><b>${esc(c.code)}</b><br><span class="muted">${c.units} units</span></td><td>${TERMS.find(t=>t.id===c.term)?.short||"—"}</td><td class="center">${c.required?.includes("uci")?'<span class="check">Required</span>':'<span class="dash">—</span>'}</td><td class="center">${c.required?.includes("ucla")?'<span class="check">Required</span>':'<span class="dash">—</span>'}</td><td>${c.geTargets?.length?c.geTargets.join(", "):"—"}</td><td class="center">${c.uc?'<span class="check">Yes</span>':'No'}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function renderCritical(){
    const chain=["math2","math7","math8"].map(course).filter(Boolean);
    const req=["acctg1","econ1","engl1","math2","math7","acctg2","econ2","engl2","math8","stat"].map(course).filter(Boolean);
    byId("planContent").innerHTML=`<div class="card"><div class="card-title-row"><div><span class="section-kicker">CRITICAL PATH</span><h2>Courses that can delay the route</h2></div></div><p>GE electives matter, but these prerequisite/admission courses control more of the timeline.</p><div class="spacer-12"></div><div class="critical-chain">${chain.map(c=>`<div class="critical-node" data-course="${c.id}"><strong>${esc(c.code)}</strong><span>${TERMS.find(t=>t.id===c.term).label}</span><span>${c.units} units · ${c.status}</span></div>`).join("")}</div></div><div class="card">${req.map(c=>`<div class="course-row" data-course="${c.id}"><div class="course-main"><div class="course-code">${esc(c.code)}</div><div class="course-title">${esc(c.why)}</div></div><div class="course-side"><strong>${TERMS.find(t=>t.id===c.term).short}</strong><span>${c.required?.length?c.required.map(x=>SCHOOLS[x].short).join(" + "):"UC CORE"}</span></div></div>`).join("")}</div>`;
  }

  function renderRequirements(){
    const mode=state.ui.reqMode;document.querySelectorAll("#reqMode button").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    if(mode==="schools")renderSchools();else if(mode==="ge")renderGE();else renderSources();
  }
  function renderSchools(){
    byId("requirementsContent").innerHTML=`<div class="school-grid">${Object.entries(SCHOOLS).map(([id,s])=>{
      const x=requirementStatus(id); const primary=id===state.settings.primarySchool;
      return `<article class="school-card ${primary?"primary":""}"><div class="school-top"><div><div class="school-name">${esc(s.name)}</div><div class="school-major">${esc(s.major)} · ${primary?"PRIMARY":esc(s.role)}</div></div><div class="school-summary">${x.mapped}/${x.total}<br>MAPPED</div></div><div class="school-body">${s.req.map(cid=>{const c=course(cid);const done=c?.status==="completed"&&c.grade in GRADE_POINTS&&GRADE_POINTS[c.grade]>=2;return `<div class="req-row" data-course="${cid}"><div><strong>${esc(c?.code||cid)}</strong><br><span>${esc(c?.title||"")}</span></div><span class="status-pill ${done?"ok":c&&ACTIVE(c)?"info":"watch"}">${done?"DONE":c&&ACTIVE(c)?TERMS.find(t=>t.id===c.term).short:"MISSING"}</span></div>`}).join("")}<div class="note">${esc(s.note)}</div><div class="source-meta">${esc(s.source)}</div></div></article>`}).join("")}</div>`;
  }
  function renderGE(){
    const summary=geSummary();
    byId("requirementsContent").innerHTML=`<div class="ge-summary"><div class="ge-number"><strong>${summary.mapped}/11</strong><span>areas assigned in the saved plan</span></div><div class="ge-number"><strong>${summary.completed}/11</strong><span>areas completed with passing grades</span></div></div><div class="note">Area 4 is only counted as covered when two assigned courses come from two different discipline groups. BIOL 3 is intentionally allowed to satisfy 5B + 5C as a lecture-with-lab course.</div><div class="spacer-12"></div><div class="ge-list">${GE_AREAS.map(a=>{
      const x=geStatus(a), open=state.ui.openGeAlts===a.id;
      return `<div class="ge-row"><div class="ge-code">${a.id}</div><div><strong>${esc(a.name)}</strong><small>${esc(x.detail)}</small>${GE_ALTS[a.id]?`<button data-ge-alts="${a.id}">${open?"Hide":"View"} verified alternatives</button>${open?`<div class="spacer-8"></div>${GE_ALTS[a.id].map(v=>`<div class="source-meta">${esc(v[0])} · ${v[2]}u · ${esc(v[1])}</div>`).join("")}`:""}`:""}</div><div class="ge-status"><b>${x.completed?"COMPLETE":x.mapped?"ASSIGNED":"OPEN"}</b><span>${x.rows.map(c=>c.code).join(" + ")||"No course"}</span></div></div>`
    }).join("")}</div>`;
  }
  function renderSources(){
    byId("requirementsContent").innerHTML=`<div class="card"><div class="card-title-row"><div><span class="section-kicker">SOURCE VAULT</span><h2>Plan reviewed ${fmtDate(state.sourceReview)}</h2></div><span class="tag green">4 SOURCES</span></div><p>The app stores source years quietly. A warning should appear only when a later source changes something that affects the actual route.</p></div><div class="source-grid">${SOURCES.map(s=>`<div class="source-card"><h3>${esc(s.title)}</h3><div class="source-meta">${esc(s.year)} · ${esc(s.status)}</div><p>${esc(s.detail)}</p></div>`).join("")}</div>`;
  }

  function renderApply(){
    const mode=state.ui.applyMode;document.querySelectorAll("#applyMode button").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    if(mode==="timeline")renderTimeline();else if(mode==="campuses")renderCampusApply();else renderTAU();
  }
  function renderTimeline(){
    const now=new Date();const next=nextMilestone(false);
    byId("applyContent").innerHTML=`<div class="card"><div class="card-title-row"><div><span class="section-kicker">RUNWAY</span><h2>${next?esc(next.title):"No open milestone"}</h2></div>${next?`<span class="tag amber">${Math.max(0,daysUntil(next.date))} DAYS</span>`:""}</div><p>${next?fmtDate(next.date)+" · "+esc(next.note):"All tracked items are handled."}</p></div><div class="timeline">${MILESTONES.map(m=>{const d=new Date(m.date+"T23:59:59"),status=state.milestoneStatus[m.id],cls=status==="handled"||d<now?"done":next?.id===m.id?"next":"";return `<div class="timeline-item ${cls}"><div class="timeline-dot"></div><div class="timeline-date">${fmtDate(m.date)} ${m.confirm?"· CONFIRM":""}</div><div class="timeline-title">${esc(m.title)}</div><div class="timeline-note">${esc(m.note)}</div><div class="timeline-controls"><button data-milestone="${m.id}" data-status="handled">Handled</button><button data-milestone="${m.id}" data-status="open">Reopen</button></div></div>`}).join("")}</div>`;
  }
  function renderCampusApply(){
    byId("applyContent").innerHTML=`<div class="school-grid">${Object.entries(SCHOOLS).map(([id,s])=>{const x=requirementStatus(id);const open=SCHOOLS[id].req.filter(cid=>{const c=course(cid);return !(c?.status==="completed"&&c.grade in GRADE_POINTS&&GRADE_POINTS[c.grade]>=2)});return `<div class="school-card ${id===state.settings.primarySchool?"primary":""}"><div class="school-top"><div><div class="school-name">${esc(s.name)}</div><div class="school-major">${esc(s.major)}</div></div><div class="school-summary">${x.done}/${x.total}<br>DONE</div></div><div class="school-body"><div class="req-row"><div><strong>Mapped before transfer</strong><br><span>${x.mapped}/${x.total} required courses are in the saved route</span></div><span class="status-pill ${x.mapped===x.total?"ok":"watch"}">${x.mapped===x.total?"ON TRACK":"CHECK"}</span></div><div class="req-row"><div><strong>Still to complete</strong><br><span>${open.map(cid=>course(cid)?.code).join(", ")||"None"}</span></div><span class="status-pill info">${open.length}</span></div><div class="note">${esc(s.note)}</div></div></div>`}).join("")}</div><div class="card"><span class="section-kicker">APPLICATION POSITIONING</span><h2>SMMZolo belongs in the evidence bank</h2><p>Keep business activity details factual: role, hours, duration, customer/revenue scale when accurate, what you built, decisions you made and measurable outcomes. The app does not convert activities into a fake admissions score.</p></div>`;
  }
  function renderTAU(){
    const items=[["grades","Enter every Fall 2027 final grade","Match the transcript exactly."],["spring","Confirm Spring 2028 courses","Report the actual registered schedule, not an old plan."],["changes","Review changes since application","Check dropped/added courses and any schedule shifts."],["submitted","Mark TAU submitted","Save the submission date/confirmation outside the app too."]];
    byId("applyContent").innerHTML=`<div class="tau-box"><span class="section-kicker" style="color:#d7bf8b">JANUARY 2028</span><h3>Transfer Academic Update mode</h3><p>This stays quiet until the application is submitted. Then it becomes the checklist for reporting Fall grades and Spring coursework.</p>${items.map(i=>`<label class="tau-check"><input type="checkbox" data-tau="${i[0]}" ${state.tau[i[0]]?"checked":""}><span><strong>${esc(i[1])}</strong><span>${esc(i[2])}</span></span></label>`).join("")}</div>`;
  }

  function renderPlaybook(){
    const logs=[...state.counselorLogs].sort((a,b)=>b.date.localeCompare(a.date));
    byId("playbookContent").innerHTML=`${PLAYBOOK.map(ch=>`<div class="accordion ${state.ui.openPlaybook===ch.id?"open":""}" data-chapter="${ch.id}"><button class="accordion-head" data-open-chapter="${ch.id}"><span class="accordion-copy"><strong>${esc(ch.title)}</strong><small>${esc(ch.sub)}</small></span><span class="accordion-state">${state.ui.openPlaybook===ch.id?"CLOSE":"OPEN"}</span></button><div class="accordion-body">${ch.tips.map(t=>`<div class="play-tip">${esc(t)}</div>`).join("")}</div></div>`).join("")}
      <div class="card"><div class="card-title-row"><div><span class="section-kicker">COUNSELOR LOG</span><h2>${logs.length?`${logs.length} visit${logs.length===1?"":"s"} logged`:"No visits logged"}</h2></div><button class="subtle-button" id="addLogBtn">Add visit</button></div><p>${logs.length?`Last visit: ${fmtDate(logs[0].date)}.`:"The first entry should capture the counselor name, what was confirmed and what still needs verification."}</p><div class="spacer-8"></div><div class="counselor-log">${logs.map(l=>`<div class="log-row"><strong>${fmtDate(l.date)} · ${esc(l.name||"Counselor")}</strong><p>${esc(l.notes)}</p></div>`).join("")}</div><div id="logForm" hidden><div class="spacer-12"></div><div class="form-row"><div class="field"><label>Date</label><input id="logDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Counselor</label><input id="logName" placeholder="Name"></div></div><div class="field"><label>What was confirmed / still open</label><textarea id="logNotes" placeholder="What did they confirm? What still needs checking?"></textarea></div><button class="primary-button" id="saveLogBtn">Save visit</button></div></div>`;
  }

  function renderSettings(){
    byId("settingsContent").innerHTML=`
      <div class="sheet-section"><h3>Academic controls</h3><div class="form-row"><div class="field"><label>Primary campus</label><select id="primarySchoolSelect">${Object.entries(SCHOOLS).map(([id,s])=>`<option value="${id}" ${id===state.settings.primarySchool?"selected":""}>${esc(s.name)} · ${esc(s.major.replace(", B.A.",""))}</option>`).join("")}</select></div><div class="field"><label>Target GPA</label><input id="targetGpaInput" type="number" min="2" max="4" step="0.01" value="${state.settings.targetGpa.toFixed(2)}"></div></div><div class="field"><label>Math route</label><select id="mathPathSelect"><option value="math2-first" ${state.settings.mathPath==="math2-first"?"selected":""}>MATH 2 Winter → MATH 7 Spring → MATH 8 Fall</option><option value="direct-math7" ${state.settings.mathPath==="direct-math7"?"selected":""}>Placement clears MATH 7 (alternate preview)</option></select></div><button class="primary-button" id="saveSettingsBtn">Save settings</button></div>
      <div class="sheet-section"><h3>Appearance</h3><div class="field"><label>Theme</label><select id="themeSelect"><option value="system" ${state.settings.theme==="system"?"selected":""}>Match iPhone</option><option value="light" ${state.settings.theme==="light"?"selected":""}>Light</option><option value="dark" ${state.settings.theme==="dark"?"selected":""}>Dark</option></select></div><div class="source-meta">The header theme button switches Light / Dark instantly. “Match iPhone” follows your system appearance.</div></div>
      <div class="sheet-section"><h3>Decisions</h3><div class="form-row"><div class="field"><label>Math prerequisite</label><select id="mathDecision"><option ${state.decisions.math==="MATH 2 first"?"selected":""}>MATH 2 first</option><option ${state.decisions.math==="Confirmed with counselor"?"selected":""}>Confirmed with counselor</option><option ${state.decisions.math==="Placement clears MATH 7"?"selected":""}>Placement clears MATH 7</option></select></div><div class="field"><label>SMC Scholars / UCLA TAP</label><select id="scholarsDecision"><option ${state.decisions.scholars==="Undecided"?"selected":""}>Undecided</option><option ${state.decisions.scholars==="Applying"?"selected":""}>Applying</option><option ${state.decisions.scholars==="Skipping"?"selected":""}>Skipping</option></select></div></div><button class="secondary-button" id="saveDecisionsBtn">Save decisions</button></div>
      <div class="sheet-section"><h3>Data vault</h3><div class="button-row"><button class="secondary-button" id="exportJsonBtn">Export JSON</button><button class="secondary-button" id="importJsonBtn">Import JSON</button><button class="secondary-button" id="undoBtn" ${state.undo?"":"disabled"}>${state.undo?`Undo: ${esc(state.undo.label)}`:"Nothing to undo"}</button></div><div class="spacer-8"></div><button class="danger-button" id="resetBtn">Reset to verified v4 plan</button></div>
      <div class="sheet-section"><h3>App</h3><div class="source-meta">405 South Transfer Command v${APP_VERSION} · Source review ${state.sourceReview}</div></div>`;
  }

  function renderCourseSheet(){
    const c=course(courseSheetId);if(!c)return;const t=TERMS.find(x=>x.id===c.term);const g=gpaData();const locked=c.locked||c.status==="completed";const canMove=!locked;
    const gradeOptions=["","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F","W","P"].map(x=>`<option value="${x}" ${c.grade===x?"selected":""}>${x||"No grade"}</option>`).join("");
    byId("courseSheetContent").innerHTML=`<div class="sheet-head"><div><span class="section-kicker">COURSE DETAIL</span><h2 class="detail-title" id="courseSheetTitle">${esc(c.code)}</h2><div class="detail-sub">${esc(c.title)}</div></div><button class="icon-button light" data-close="courseOverlay" aria-label="Close">×</button></div>
      <div class="detail-grid"><div class="detail-cell"><span>Units</span><strong>${c.units} UC units</strong></div><div class="detail-cell"><span>Term</span><strong>${esc(t.label)}</strong></div><div class="detail-cell"><span>Status</span><strong>${esc(c.status)}</strong></div><div class="detail-cell"><span>Value</span><strong>${valueLabel(c)}</strong></div></div>
      <div class="sheet-section"><h3>Why this course is here</h3><div class="note">${esc(c.why)}</div><div class="course-tags" style="margin-top:9px">${c.required?.map(x=>`<span class="tag blue">${SCHOOLS[x].short} REQUIRED</span>`).join("")||""}${c.geTargets?.map(a=>`<span class="tag green">CAL-GETC ${a}</span>`).join("")||""}${c.uc?'<span class="tag">UC TRANSFERABLE</span>':''}</div></div>
      ${c.section?`<div class="sheet-section"><h3>Actual Fall 2026 registration</h3><div class="detail-grid"><div class="detail-cell"><span>Section</span><strong>${esc(c.section)}</strong></div><div class="detail-cell"><span>When</span><strong>${esc(c.days)} · ${esc(c.time)}</strong></div><div class="detail-cell"><span>Instructor</span><strong>${esc(c.instructor)}</strong></div><div class="detail-cell"><span>Location</span><strong>${esc(c.location)}</strong></div></div>${c.deadlines?`<div class="spacer-8"></div><div class="source-meta">Refund ${fmtDate(c.deadlines.refund)} · Avoid W ${fmtDate(c.deadlines.avoidW)} · Drop ${fmtDate(c.deadlines.drop)} · P/NP ${fmtDate(c.deadlines.pnp)}</div>`:""}</div>`:""}
      <div class="sheet-section"><h3>Plan controls</h3>${locked?`<div class="note">${c.status==="completed"?"Completed courses are protected from accidental moves.":"Fall 2026 is locked because it is your real paid schedule. Change it only by intentionally changing status/grade."}</div>`:`<div class="form-row"><div class="field"><label>Move to term</label><select id="moveTermSelect">${TERMS.filter(x=>termIndex(x.id)>=1).map(x=>`<option value="${x.id}" ${x.id===c.term?"selected":""}>${x.label}</option>`).join("")}</select></div><div class="field"><label>Status</label><select id="courseStatusSelect">${["planned","considering","enrolled","completed","dropped","withdrawn"].map(x=>`<option value="${x}" ${c.status===x?"selected":""}>${x}</option>`).join("")}</select></div></div><button class="primary-button" id="applyCourseChangeBtn">Apply change</button>`}</div>
      <div class="sheet-section"><h3>Grade</h3><div class="form-row"><div class="field"><label>Final grade</label><select id="courseGradeSelect">${gradeOptions}</select></div><div class="field"><label>Current / projected grade</label><select id="simGradeSelect"><option value="">Not set</option>${["A","A-","B+","B","B-","C+","C"].map(x=>`<option>${x}</option>`).join("")}</select></div></div><div id="gradeSimOut" class="source-meta">Current saved GPA: ${g.gpa===null?"—":g.gpa.toFixed(2)}</div><div class="button-row"><button class="secondary-button" id="saveGradeBtn">Save final grade</button></div></div>
      <div class="sheet-section"><div class="source-meta">Source: ${esc(c.source)}</div></div>`;
    bindCourseSheet(c);
  }

  function validateMove(c,newTerm){
    const idx=termIndex(newTerm);if(idx<0)return "Unknown term.";
    const temp=deep(state.courses);temp.find(x=>x.id===c.id).term=newTerm;const get=id=>temp.find(x=>x.id===id);const ti=id=>termIndex(get(id)?.term);
    if(state.settings.mathPath==="math2-first" && ti("math7")<=ti("math2"))return "MATH 7 must stay after MATH 2 while the saved math route is MATH 2 first.";
    if(ti("math8")<=ti("math7"))return "MATH 8 must stay after MATH 7.";
    if(ti("acctg2")<=ti("acctg1"))return "ACCTG 2 should stay after ACCTG 1.";
    if(ti("engl2")<=ti("engl1"))return "ENGL C1001 should stay after ENGL C1000.";
    const term=TERMS.find(t=>t.id===newTerm);const units=temp.filter(x=>x.term===newTerm&&ACTIVE(x)).reduce((n,x)=>n+x.units,0);if(term.kind==="winter"&&units>6)return `That would put ${units} units into the compressed Winter session.`;if(term.kind==="regular"&&units>16)return `That would put ${units} units into a regular term.`;
    return null;
  }
  function bindCourseSheet(c){
    byId("applyCourseChangeBtn")?.addEventListener("click",()=>{const newTerm=byId("moveTermSelect").value,newStatus=byId("courseStatusSelect").value;const err=validateMove(c,newTerm);if(err)return toast(err);rememberUndo(`move ${c.code}`);c.term=newTerm;c.status=newStatus;save();renderAll();renderCourseSheet();toast(`${c.code} updated`)});
    byId("saveGradeBtn")?.addEventListener("click",()=>{const grade=byId("courseGradeSelect").value||null;rememberUndo(`grade ${c.code}`);c.grade=grade;if(grade&&grade!=="W")c.status="completed";if(grade==="W")c.status="withdrawn";save();renderAll();renderCourseSheet();toast(`${c.code} grade saved`)});
    byId("simGradeSelect")?.addEventListener("change",e=>{const grade=e.target.value;if(!grade){byId("gradeSimOut").textContent=`Current saved GPA: ${gpaData().gpa?.toFixed(2)||"—"}`;return}const d=gpaData();const pts=d.pts+GRADE_POINTS[grade]*c.units,units=d.units+c.units;byId("gradeSimOut").textContent=`If ${c.code} finishes ${grade}: ${(pts/units).toFixed(2)} UC-transferable GPA across ${units} graded units.`});
  }

  function renderOptimizer(){
    const total=projectedUnits(),health=planHealth(),issues=[];
    TERMS.forEach(t=>{const u=termLoad(t.id);if(t.kind==="winter"&&u>6)issues.push(`${t.label} is ${u} units in a compressed session.`);if(t.kind==="regular"&&u>16)issues.push(`${t.label} is ${u} units.`)});
    if(!health.every(h=>h.ok))issues.push(...health.filter(h=>!h.ok).map(h=>h.label+": "+h.meta));
    const altTotal=total-(course("math2")&&ACTIVE(course("math2"))?course("math2").units:0);
    byId("optimizerContent").innerHTML=`<div class="card accent"><span class="section-kicker">CURRENT ROUTE</span><h2>${issues.length?"Changes need attention":"No structural break found"}</h2><p>The saved route maps ${total} UC-transferable units, all UCI/UCLA major-prep courses, and all 11 Cal-GETC areas. It preserves your MATH 2 Winter preference.</p></div>${issues.length?`<div class="card"><h3>Flags</h3>${issues.map(x=>`<div class="play-tip">${esc(x)}</div>`).join("")}</div>`:`<div class="card"><h3>Why the optimizer is not deleting classes</h3><p>The +${total-60} unit buffer is doing real work: the plan includes MATH 2 before the required calculus sequence plus complete Cal-GETC coverage. Removing courses just to hit exactly 60 can break a requirement.</p></div>`}<div class="card"><span class="section-kicker">ALTERNATE</span><h2>If placement clears MATH 7</h2><p>Removing MATH 2 would reduce the route to about ${altTotal} mapped units. That becomes the leaner path only after SMC confirms you can start Calculus 1 without MATH 2.</p></div><div class="button-row"><button class="secondary-button" data-close="optimizerOverlay">Keep current route</button><button class="primary-button" id="openMathCourseBtn">Open MATH 2</button></div>`;
    byId("openMathCourseBtn")?.addEventListener("click",()=>{closeOverlay("optimizerOverlay",false);openCourse("math2")});
  }

  function buildCommandIndex(q=""){
    const items=[];state.courses.forEach(c=>items.push({title:`${c.code} — ${c.title}`,sub:`${TERMS.find(t=>t.id===c.term).label} · ${c.units} units · ${valueLabel(c)}`,kind:"COURSE",run:()=>{closeOverlay("commandOverlay",false);openCourse(c.id)},text:`${c.code} ${c.title} ${c.why} ${c.geTargets.join(" ")} ${c.required.join(" ")}`.toLowerCase()}));
    Object.entries(SCHOOLS).forEach(([id,s])=>items.push({title:`${s.name} — ${s.major}`,sub:`${requirementStatus(id).mapped}/${s.req.length} major-prep courses mapped`,kind:"CAMPUS",run:()=>{closeOverlay("commandOverlay");state.ui.reqMode="schools";save();go("requirements");renderRequirements();bindDynamic()},text:`${s.name} ${s.major} ${s.note}`.toLowerCase()}));
    GE_AREAS.forEach(a=>items.push({title:`Cal-GETC ${a.id} — ${a.name}`,sub:geStatus(a).detail,kind:"GE",run:()=>{closeOverlay("commandOverlay");state.ui.reqMode="ge";save();go("requirements");renderRequirements();bindDynamic()},text:`${a.id} ${a.name}`.toLowerCase()}));
    items.push({title:"Optimize saved plan",sub:"Check units, prerequisites, load and alternate math route",kind:"COMMAND",run:()=>{closeOverlay("commandOverlay");openOptimizer()},text:"optimize plan what if math"},{title:"Export plan JSON",sub:"Create a device-change backup",kind:"COMMAND",run:()=>{closeOverlay("commandOverlay");exportJSON()},text:"export backup json"},{title:"Open settings",sub:"Primary campus, GPA target, decisions and data vault",kind:"COMMAND",run:()=>{closeOverlay("commandOverlay");openSettings()},text:"settings primary gpa"});
    const needle=q.trim().toLowerCase();
    const filtered=needle?items.filter(i=>i.text.includes(needle)||i.title.toLowerCase().includes(needle)):items;
    if(needle)filtered.sort((a,b)=>{const at=a.title.toLowerCase(),bt=b.title.toLowerCase();const score=t=>t.startsWith(needle)?0:t.includes(needle)?1:2;return score(at)-score(bt)||at.localeCompare(bt)});
    return filtered.slice(0,14);
  }
  function renderCommand(q=""){
    const items=buildCommandIndex(q);const out=byId("commandResults");out.innerHTML=items.length?items.map((i,n)=>`<button class="command-result" data-command="${n}"><span><strong>${esc(i.title)}</strong><span>${esc(i.sub)}</span></span><em>${i.kind}</em></button>`).join(""):`<div class="empty">No match. Try a course code, campus or Cal-GETC area.</div>`;out.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>{byId("commandInput")?.blur();items[+b.dataset.command].run()});
  }

  let lockedScrollY=0;
  function effectiveTheme(){
    if(state.settings.theme==="light"||state.settings.theme==="dark")return state.settings.theme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light";
  }
  function applyTheme(){
    const mode=state.settings.theme||"system",effective=effectiveTheme();
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.effectiveTheme=effective;
    const b=byId("themeToggleBtn");if(b){b.setAttribute("aria-label",effective==="dark"?"Switch to light mode":"Switch to dark mode");b.title=effective==="dark"?"Light mode":"Dark mode"}
  }
  function toggleTheme(){state.settings.theme=effectiveTheme()==="dark"?"light":"dark";save();applyTheme();toast(state.settings.theme==="dark"?"Dark mode":"Light mode")}
  function syncVisualViewport(){
    const vv=window.visualViewport;const h=vv?.height||window.innerHeight;const top=vv?.offsetTop||0;
    document.documentElement.style.setProperty("--vvh",`${Math.round(h)}px`);document.documentElement.style.setProperty("--vvtop",`${Math.round(top)}px`);
    const keyboard=!!vv && (window.innerHeight-vv.height>120);document.body.classList.toggle("keyboard-open",keyboard);
  }
  function lockPage(){if(document.body.classList.contains("overlay-locked"))return;lockedScrollY=window.scrollY;document.body.style.top=`-${lockedScrollY}px`;document.body.classList.add("overlay-locked")}
  function unlockPage(){if(document.querySelector(".overlay.open"))return;const y=lockedScrollY;document.body.classList.remove("overlay-locked","keyboard-open");document.body.style.top="";window.scrollTo(0,y)}
  function openCourse(id){courseSheetId=id;renderCourseSheet();openOverlay("courseOverlay")}
  function openSettings(){renderSettings();openOverlay("settingsOverlay");bindSettings()}
  function openOptimizer(){renderOptimizer();openOverlay("optimizerOverlay")}
  function openOverlay(id){
    const x=byId(id);if(!x)return;
    document.querySelectorAll(".overlay.open").forEach(o=>{if(o!==x){o.classList.remove("open");o.setAttribute("aria-hidden","true")}});
    lockPage();x.classList.add("open");x.setAttribute("aria-hidden","false");
    const scroll=x.querySelector(".sheet,.command-results");if(scroll)scroll.scrollTop=0;syncVisualViewport();
  }
  function closeOverlay(id,restore=true){
    const x=byId(id);if(!x)return;const active=document.activeElement;if(active&&x.contains(active)&&active.blur)active.blur();x.classList.remove("open");x.setAttribute("aria-hidden","true");if(restore)unlockPage()
  }
  function toast(msg){const x=byId("toast");x.textContent=msg;x.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove("show"),2600)}

  function bindSettings(){
    byId("saveSettingsBtn").onclick=()=>{rememberUndo("settings");state.settings.primarySchool=byId("primarySchoolSelect").value;state.settings.targetGpa=Math.max(2,Math.min(4,parseFloat(byId("targetGpaInput").value)||3.7));state.settings.mathPath=byId("mathPathSelect").value;state.settings.theme=byId("themeSelect").value;save();applyTheme();renderAll();closeOverlay("settingsOverlay");toast("Settings saved")};
    byId("saveDecisionsBtn").onclick=()=>{state.decisions.math=byId("mathDecision").value;state.decisions.scholars=byId("scholarsDecision").value;save();renderAll();toast("Decisions saved")};
    byId("exportJsonBtn").onclick=exportJSON;byId("importJsonBtn").onclick=()=>byId("importFile").click();byId("undoBtn").onclick=undo;
    byId("resetBtn").onclick=()=>{if(!confirm("Reset the app to the verified v4 plan? Your saved grades, moves, notes and logs will be replaced."))return;localStorage.removeItem(STORAGE_KEY);state=defaultState();save();applyTheme();renderAll();closeOverlay("settingsOverlay");toast("Reset to v4.1 plan")};
  }

  function exportJSON(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});downloadBlob(blob,`405-south-backup-${new Date().toISOString().slice(0,10)}.json`);toast("Backup exported")}
  function importJSON(file){const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data.courses))throw new Error();rememberUndo("import");const base=defaultState();state={...base,...data,settings:{...base.settings,...(data.settings||{})},ui:{...base.ui,...(data.ui||{})},decisions:{...base.decisions,...(data.decisions||{})},tau:{...base.tau,...(data.tau||{})}};save();applyTheme();renderAll();toast("Backup imported")}catch{toast("That file is not a valid 405 South backup")}};r.readAsText(file)}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}

  function exportICS(){
    const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z");const events=MILESTONES.map(m=>{const dt=m.date.replace(/-/g,"");const uid=`${m.id}-${m.date}@405south`;const next=new Date(m.date+"T12:00:00");next.setDate(next.getDate()+1);const end=next.toISOString().slice(0,10).replace(/-/g,"");return [`BEGIN:VEVENT`,`UID:${uid}`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${ics(m.title)}`,`DESCRIPTION:${ics(m.note)}`,`BEGIN:VALARM`,`TRIGGER:-P2D`,`ACTION:DISPLAY`,`DESCRIPTION:${ics("Reminder: "+m.title)}`,`END:VALARM`,`END:VEVENT`].join("\r\n")}).join("\r\n");downloadBlob(new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//405 South//Transfer Command//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR\r\n`],{type:"text/calendar"}),"405-south-transfer-dates.ics");toast("Calendar file exported")}
  function ics(s){return String(s).replace(/\\/g,"\\\\").replace(/,/g,"\\,").replace(/;/g,"\\;").replace(/\n/g,"\\n")}

  function counselorReportData(){
    const uci=requirementStatus("uci"),ucla=requirementStatus("ucla"),ge=geSummary(),g=gpaData();
    const fall=state.courses.filter(c=>c.term==="fall26"&&ACTIVE(c));
    const route=TERMS.flatMap(t=>state.courses.filter(c=>c.term===t.id&&ACTIVE(c)).map(c=>({...c,termLabel:t.label})));
    const openMajor=SCHOOLS.uci.req.filter(id=>{const c=course(id);return !(c?.status==="completed"&&c.grade in GRADE_POINTS&&GRADE_POINTS[c.grade]>=2)}).map(id=>course(id)?.code||id);
    return {uci,ucla,ge,g,fall,route,openMajor};
  }
  function renderCounselorReport(){
    const d=counselorReportData();
    byId("reportContent").innerHTML=`
      <div class="report-section"><span class="section-kicker">CURRENT RECORD</span><div class="report-kpis"><div class="report-kpi"><span>Completed</span><strong>${completedUnits()} UC units</strong></div><div class="report-kpi"><span>Fall enrolled</span><strong>${enrolledUnits()} units</strong></div><div class="report-kpi"><span>Projected</span><strong>${projectedUnits()}/60</strong></div><div class="report-kpi"><span>UC GPA</span><strong>${d.g.gpa?.toFixed(2)||"—"}</strong></div></div></div>
      <div class="report-section"><h3>Fall 2026 paid schedule</h3><div class="report-table-wrap"><table class="report-table"><thead><tr><th>Course</th><th>Units</th><th>Meeting</th><th>Instructor</th></tr></thead><tbody>${d.fall.map(c=>`<tr><td><b>${esc(c.code)}</b><br>${esc(c.title)}</td><td>${c.units}</td><td>${esc(c.days)}<br>${esc(c.time)}</td><td>${esc(c.instructor)}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="report-section"><h3>Requirement position</h3><div class="report-kpis"><div class="report-kpi"><span>UCI prep mapped</span><strong>${d.uci.mapped}/${d.uci.total}</strong></div><div class="report-kpi"><span>UCLA prep mapped</span><strong>${d.ucla.mapped}/${d.ucla.total}</strong></div><div class="report-kpi"><span>Cal-GETC assigned</span><strong>${d.ge.mapped}/11</strong></div><div class="report-kpi"><span>Still to finish for UCI</span><strong>${d.openMajor.length}</strong></div></div><p>${d.openMajor.length?`Open major prep: ${esc(d.openMajor.join(", "))}.`:"All UCI major-prep courses are completed."}</p></div>
      <div class="report-section"><h3>Questions to confirm</h3><ol><li>Does the current prerequisite/placement record require MATH 2 before MATH 7?</li><li>Is MATH 2 expected to be offered in Winter 2027, and is the compressed format advisable?</li><li>Does the saved plan satisfy the applicable UCI Business Administration and UCLA Business Economics agreements?</li><li>Is ECON C2001 + MEDIA 1 valid for Area 4 as two different disciplines?</li><li>Is SMC Scholars/TAP still realistically attainable for the Fall 2028 UCLA cycle?</li><li>Are the planned future courses expected to be offered in the terms shown?</li></ol></div>
      <div class="report-section"><h3>Source note</h3><p>Working sources: UCI/UCLA ASSIST 2025–26 major agreements, SMC Cal-GETC 2026–27, and SMC UC TCA 2025–26. Recheck the newest agreement before registration.</p></div>`;
  }
  function counselorReportText(){
    const d=counselorReportData();
    return [
      "405 South — Counselor Report",
      `Generated ${new Date().toLocaleString()} · Primary: UCI Business Administration · Fall 2028`,
      "",
      "CURRENT RECORD",
      `Completed UC-transferable units: ${completedUnits()}`,
      `Fall 2026 enrolled: ${enrolledUnits()} units`,
      `Projected: ${projectedUnits()}/60`,
      `Current UC-transferable GPA: ${d.g.gpa?.toFixed(2)||"—"}`,
      "",
      "FALL 2026 PAID SCHEDULE",
      ...d.fall.map(c=>`${c.code} — ${c.title} · ${c.units}u · ${c.days} ${c.time} · ${c.instructor}`),
      "",
      "REQUIREMENT POSITION",
      `UCI prep mapped: ${d.uci.mapped}/${d.uci.total}`,
      `UCLA prep mapped: ${d.ucla.mapped}/${d.ucla.total}`,
      `Cal-GETC assigned: ${d.ge.mapped}/11`,
      `UCI prep still to complete: ${d.openMajor.join(", ")||"None"}`,
      "",
      "QUESTIONS TO CONFIRM",
      "1. Does the current prerequisite/placement record require MATH 2 before MATH 7?",
      "2. Is MATH 2 expected to be offered in Winter 2027, and is the compressed format advisable?",
      "3. Does the saved plan satisfy the applicable UCI Business Administration and UCLA Business Economics agreements?",
      "4. Is ECON C2001 + MEDIA 1 valid for Area 4 as two different disciplines?",
      "5. Is SMC Scholars/TAP still realistically attainable for the Fall 2028 UCLA cycle?",
      "6. Are the planned future courses expected to be offered in the terms shown?",
      "",
      "SOURCES",
      "UCI/UCLA ASSIST 2025–26 · SMC Cal-GETC 2026–27 · SMC UC TCA 2025–26"
    ].join("\n");
  }
  function printableCounselorReport(){
    const d=counselorReportData();
    return `<h1>405 South — Counselor Report</h1><div class="print-meta">Generated ${new Date().toLocaleString()} · Primary: UCI Business Administration · Fall 2028</div><h2>Current record</h2><p>Completed UC-transferable units: <b>${completedUnits()}</b> · Fall 2026 enrolled: <b>${enrolledUnits()}</b> · Projected: <b>${projectedUnits()}/60</b> · UC GPA: <b>${d.g.gpa?.toFixed(2)||"—"}</b></p><h2>Fall 2026 paid schedule</h2><table><tr><th>Course</th><th>Units</th><th>Meeting</th><th>Instructor</th></tr>${d.fall.map(c=>`<tr><td>${esc(c.code)} — ${esc(c.title)}</td><td>${c.units}</td><td>${esc(c.days)} ${esc(c.time)}</td><td>${esc(c.instructor)}</td></tr>`).join("")}</table><h2>Requirement position</h2><p>UCI prep mapped: <b>${d.uci.mapped}/${d.uci.total}</b> · UCLA prep mapped: <b>${d.ucla.mapped}/${d.ucla.total}</b> · Cal-GETC assigned: <b>${d.ge.mapped}/11</b>.</p><p>UCI major-prep still to complete: ${esc(d.openMajor.join(", ")||"None")}.</p><h2>Current route</h2><table><tr><th>Term</th><th>Course</th><th>Units</th><th>Job</th></tr>${d.route.map(c=>`<tr><td>${esc(c.termLabel)}</td><td>${esc(c.code)} — ${esc(c.title)}</td><td>${c.units}</td><td>${esc(valueLabel(c))}${c.geTargets.length?" · GE "+esc(c.geTargets.join(", ")):""}</td></tr>`).join("")}</table><h2>Questions to confirm</h2><ol><li>Does the current prerequisite/placement record require MATH 2 before MATH 7?</li><li>Is MATH 2 expected to be offered in Winter 2027, and is the compressed format advisable?</li><li>Does the saved plan satisfy the applicable UCI Business Administration and UCLA Business Economics agreements?</li><li>Is ECON C2001 + MEDIA 1 valid for Area 4 as two different disciplines?</li><li>Is SMC Scholars/TAP still realistically attainable for the Fall 2028 UCLA cycle?</li><li>Are the planned future courses expected to be offered in the terms shown?</li></ol><h2>Source note</h2><p>UCI/UCLA ASSIST 2025–26 · SMC Cal-GETC 2026–27 · SMC UC TCA 2025–26. Recheck the newest agreement before registration.</p>`;
  }
  function counselorReport(){renderCounselorReport();openOverlay("reportOverlay")}
  async function copyCounselorReport(){
    const text=counselorReportText();
    try{await navigator.clipboard.writeText(text);toast("Counselor report copied")}
    catch{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Counselor report copied")}
  }
  function printCounselorReport(){byId("printReport").innerHTML=printableCounselorReport();closeOverlay("reportOverlay");setTimeout(()=>window.print(),120)}

  function saveSnapshot(){const name=prompt("Snapshot name",new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" plan");if(!name)return;state.snapshots.unshift({id:Date.now(),name,at:new Date().toISOString(),courses:deep(state.courses),settings:deep(state.settings)});state.snapshots=state.snapshots.slice(0,10);save();toast("Plan snapshot saved")}

  function go(screen){state.ui.screen=screen;save();document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===screen));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.target===screen));window.scrollTo({top:0,behavior:"smooth"})}
  function renderAll(){renderHeader();renderToday();renderPlan();renderRequirements();renderApply();renderPlaybook();go(state.ui.screen||"today");bindDynamic()}

  function bindDynamic(){
    document.querySelectorAll("[data-course]").forEach(el=>el.onclick=()=>openCourse(el.dataset.course));
    document.querySelectorAll("[data-ge-alts]").forEach(b=>b.onclick=()=>{state.ui.openGeAlts=state.ui.openGeAlts===b.dataset.geAlts?null:b.dataset.geAlts;save();renderGE();bindDynamic()});
    document.querySelectorAll("[data-milestone]").forEach(b=>b.onclick=()=>{state.milestoneStatus[b.dataset.milestone]=b.dataset.status;save();renderApply();renderToday();bindDynamic()});
    document.querySelectorAll("[data-tau]").forEach(x=>x.onchange=()=>{state.tau[x.dataset.tau]=x.checked;save()});
    document.querySelectorAll("[data-open-chapter]").forEach(b=>b.onclick=()=>{state.ui.openPlaybook=state.ui.openPlaybook===b.dataset.openChapter?null:b.dataset.openChapter;save();renderPlaybook();bindDynamic()});
    const add=byId("addLogBtn");if(add)add.onclick=()=>{const form=byId("logForm"),notes=byId("logNotes");form.hidden=false;requestAnimationFrame(()=>{form.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>notes.focus({preventScroll:true}),180)})};const saveLog=byId("saveLogBtn");if(saveLog)saveLog.onclick=()=>{const notes=byId("logNotes").value.trim();if(!notes)return toast("Add the counselor notes first");state.counselorLogs.push({date:byId("logDate").value,name:byId("logName").value.trim(),notes});save();renderPlaybook();bindDynamic();toast("Counselor visit saved")};
  }

  function bindStatic(){
    document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>go(b.dataset.target));byId("brandBtn").onclick=()=>go("today");
    document.querySelectorAll("#planMode button").forEach(b=>b.onclick=()=>{state.ui.planMode=b.dataset.mode;save();renderPlan();bindDynamic()});
    document.querySelectorAll("#reqMode button").forEach(b=>b.onclick=()=>{state.ui.reqMode=b.dataset.mode;save();renderRequirements();bindDynamic()});
    document.querySelectorAll("#applyMode button").forEach(b=>b.onclick=()=>{state.ui.applyMode=b.dataset.mode;save();renderApply();bindDynamic()});
    byId("settingsBtn").onclick=openSettings;byId("themeToggleBtn").onclick=toggleTheme;
    byId("searchBtn").onclick=()=>{renderCommand();openOverlay("commandOverlay");setTimeout(()=>{const input=byId("commandInput");input.value="";input.focus({preventScroll:true})},80)};byId("commandInput").oninput=e=>renderCommand(e.target.value);
    byId("calendarExportBtn").onclick=exportICS;byId("optimizeBtn").onclick=openOptimizer;byId("snapshotBtn").onclick=saveSnapshot;byId("counselorReportBtn").onclick=counselorReport;
    byId("copyReportBtn").onclick=copyCounselorReport;byId("printReportBtn").onclick=printCounselorReport;
    document.addEventListener("click",e=>{const b=e.target.closest("[data-close]");if(b){e.preventDefault();closeOverlay(b.dataset.close)}});
    document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o)closeOverlay(o.id)}));
    byId("importFile").onchange=e=>{const f=e.target.files[0];if(f)importJSON(f);e.target.value=""};
    window.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".overlay.open").forEach(o=>closeOverlay(o.id));if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();byId("searchBtn").click()}});
    window.addEventListener("resize",syncVisualViewport,{passive:true});
    if(window.visualViewport){window.visualViewport.addEventListener("resize",syncVisualViewport,{passive:true});window.visualViewport.addEventListener("scroll",syncVisualViewport,{passive:true})}
    const mq=window.matchMedia?.("(prefers-color-scheme: dark)");mq?.addEventListener?.("change",()=>{if(state.settings.theme==="system")applyTheme()});
    byId("reloadAppBtn").onclick=()=>location.reload();
  }

  async function registerSW(){
    if(!("serviceWorker" in navigator)||location.protocol==="file:")return;
    try{const reg=await navigator.serviceWorker.register("./sw.js");if(reg.waiting)showUpdate();reg.addEventListener("updatefound",()=>{const w=reg.installing;if(!w)return;w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)showUpdate()})})}catch(e){console.warn("SW",e)}
  }
  function showUpdate(){byId("updateBanner").hidden=false}

  applyTheme();syncVisualViewport();bindStatic();renderAll();registerSW();
})();
