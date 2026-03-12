/* =============================================================================
   main.js — Six Sigma BB Statistical Reference for Beverage Industry
   Author  : Matteo Ferrini
   LinkedIn: https://www.linkedin.com/in/matteo-ferrini-beverage/
   =============================================================================
   Sections:
     1. Tab Navigation
     2. About Modal
     3. Accordion
     4. Chart.js Helpers & Constants
     5. Charts 1–17 (each in its own IIFE for isolated scope)
   ============================================================================= */

// ── TAB NAVIGATION ───────────────────────────────────────────────────
// On tab button click (.tn):
//   1. Remove .act from all buttons and panels (state reset)
//   2. Add .act to the clicked button → orange CSS highlight
//   3. Add .act to the matching panel → display:block
//   4. window.scrollTo(0,0) scrolls the page back to the top
// Button→panel link: data-t="name" on <button>
// + id="tp-name" on <section>. No separate map needed.
document.querySelectorAll('.tn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tn').forEach(x => x.classList.remove('act'));
    document.querySelectorAll('.tp').forEach(x => x.classList.remove('act'));
    b.classList.add('act');
    document.getElementById('tp-'+b.dataset.t).classList.add('act');
    window.scrollTo(0, 0);
  });
});

// ── MODAL ────────────────────────────────────────────────────────────
// Three ways to close the modal:
//   · Click the ✕ button (#modal-x)
//   · Click the semi-transparent overlay outside the panel
//     (e.target === overlay verifies the click is on the overlay
//      and NOT on a child element like the modal text)
//   · Press Esc (global keydown listener on the document)
const overlay = document.getElementById('modal-overlay');
document.getElementById('aboutBtn').addEventListener('click', () => overlay.classList.add('show'));
document.getElementById('modal-x').addEventListener('click', () => overlay.classList.remove('show'));
overlay.addEventListener('click', e => { if(e.target === overlay) overlay.classList.remove('show'); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') overlay.classList.remove('show'); });

// ── ACCORDION ────────────────────────────────────────────────────────
// On click: body = b.nextElementSibling (the <div> right after the button).
// isOpen reads the current state; classList.toggle() applies/removes .op.
// CSS: when .acc-btn has .op, the .chv arrow rotates 180° via transform.
document.querySelectorAll('.acc-btn').forEach(b => {
  b.addEventListener('click', () => {
    const body = b.nextElementSibling;
    const isOpen = body.classList.contains('op');
    b.classList.toggle('op', !isOpen);
    body.classList.toggle('op', !isOpen);
  });
});

// ══════════════════════════════════════════════════════════════════
// HELPER E COSTANTI PER I GRAFICI CHART.JS
// ──────────────────────────────────────────────────────────────────
// C         : palette colori condivisa tra tutti i grafici
//             (corrisponde alle CSS custom properties nel :root)
// dfont     : font IBM Plex Sans per tutti gli assi e label
// tickCfg   : configurazione colore/font comune per gli assi
// gridCfg   : griglia semitrasparente comune a tutti i grafici
// noLegend  : scorciatoia per {display:false} sulla legenda
//
// gaussY(x, mu, sig)
//   Calcola l'ordinata della distribuzione normale:
//   e^(-0.5·((x-μ)/σ)²) / (σ·√(2π))
//   Usata per disegnare curve Cpk, t-test, ANOVA.
//
// linspace(a, b, n)
//   Genera n valori equispaziati tra a e b
//   (equivalente di np.linspace / MATLAB linspace).
//   Usata per costruire i vettori X dei grafici a curva continua.
// ══════════════════════════════════════════════════════════════════
const C = {
  bg:'rgba(0,0,0,0)',grid:'rgba(255,255,255,0.06)',tick:'#4e677e',
  orange:'#e8a020',orange2:'rgba(232,160,32,0.15)',
  blue:'#2d8fdd',blue2:'rgba(45,143,221,0.15)',
  green:'#27a876',green2:'rgba(39,168,118,0.15)',
  red:'#d94f4f',red2:'rgba(217,79,79,0.15)',
  purple:'#8b5cf6',purple2:'rgba(139,92,246,0.15)',
};
const dfont = {family:"'IBM Plex Sans',sans-serif",size:11};
const tickCfg = {color:C.tick,font:dfont};
const gridCfg = {color:C.grid};
const noLegend = {display:false};

function gaussY(x, mu, sig) {
  return Math.exp(-0.5*((x-mu)/sig)**2) / (sig * Math.sqrt(2*Math.PI));
}
function linspace(a, b, n) {
  const arr = [];
  for(let i=0;i<n;i++) arr.push(a + (b-a)*i/(n-1));
  return arr;
}

// CHART 1 — Sigma vs DPMO (bar chart, logarithmic Y axis)
// Log scale: allows displaying 691,462 (1σ) and 3.4 (6σ) on the same
// axis without the high values crushing the low ones.
// Bar colours: red → amber → green → blue following the sigma scale.
// 1) SIGMA CHART
(function(){
  const ctx = document.getElementById('ch-sigma').getContext('2d');
  const labels = ['1σ','2σ','3σ','4σ','5σ','6σ'];
  const dpmo = [691462,308538,66807,6210,233,3.4];
  new Chart(ctx, {
    type:'bar',
    data:{
      labels,
      datasets:[{
        label:'DPMO',data:dpmo,
        backgroundColor:['#d94f4f88','#d94f4f66','#e8a02088','#27a87666','#2d8fdd66','#8b5cf666'],
        borderColor:['#d94f4f','#d94f4f','#e8a020','#27a876','#2d8fdd','#8b5cf6'],
        borderWidth:1,borderRadius:4
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:noLegend,tooltip:{callbacks:{label:v=>`DPMO: ${v.raw.toLocaleString()}`}}},
      scales:{
        x:{ticks:tickCfg,grid:gridCfg},
        y:{type:'logarithmic',ticks:{...tickCfg,callback:v=>v.toLocaleString()},grid:gridCfg}
      }
    }
  });
})();

// CHART 2 — Normal distributions for 4 Cpk levels
// Each dataset is a Gaussian curve computed with gaussY().
// σ is derived from Cpk: for a centred process, σ = tolerance/(6·Cpk).
// The area under each curve represents the proportion of product
// within LSL-USL specifications.
// 2) CPK DISTRIBUTIONS
(function(){
  const ctx = document.getElementById('ch-cpk').getContext('2d');
  const xs = linspace(488, 512, 200);
  const lsl = 496, usl = 504, target = 500;
  const cases = [
    {cpk:0.70, sig:500/0.70/3, color:'#d94f4f'},  // cpk=0.70 → sig = (USL-target)/3cpk... 
    // Actually: cpk = min(usl-mu, mu-lsl)/3sig → for centred: cpk=tol/6sig → sig=tol/(6cpk)
    {cpk:1.00, sig:8/(6*1.00), color:'#e8a020'},
    {cpk:1.33, sig:8/(6*1.33), color:'#27a876'},
    {cpk:1.67, sig:8/(6*1.67), color:'#2d8fdd'},
  ];
  const datasets = cases.map(c => ({
    label:`Cpk ${c.cpk}`,
    data: xs.map(x => ({x, y: gaussY(x, target, c.sig)})),
    borderColor: c.color,
    backgroundColor: c.color.replace(')', ',0.08)').replace('rgb','rgba'),
    borderWidth: 2,
    pointRadius: 0, fill: false, tension: 0.4
  }));
  // Add spec lines
  new Chart(ctx, {
    type:'line',
    data:{datasets},
    options:{
      responsive:true,
      plugins:{
        legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}},
        annotation:{annotations:{
          lsl:{type:'line',xMin:lsl,xMax:lsl,borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],label:{display:true,content:'LSL',color:'#d94f4f',font:dfont}},
          usl:{type:'line',xMin:usl,xMax:usl,borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],label:{display:true,content:'USL',color:'#d94f4f',font:dfont}},
        }}
      },
      scales:{
        x:{type:'linear',min:488,max:512,title:{display:true,text:'Fill Volume (mL)',color:C.tick,font:dfont},ticks:{...tickCfg,stepSize:4},grid:gridCfg},
        y:{display:false}
      }
    }
  });
})();

// CHART 3 — Fill volume histogram CSD 500 mL (simulated)
// Not a native Chart.js histogram, but a bar chart with manual bins.
// Bars outside LSL/USL are coloured red.
// 3) FILL VOLUME HISTOGRAM CHART
(function(){
  const ctx = document.getElementById('ch-fillvol').getContext('2d');
  // Simulate histogram-like bar chart for normal dist centred at 500.6
  const bins = [496,497,498,499,500,501,502,503,504,505];
  const mu=500.6, sig=0.795;
  const freqs = bins.map(b => Math.round(gaussY(b,mu,sig)*500));
  const colors = bins.map(b => (b<496||b>504)?'#d94f4f88':'#2d8fdd88');
  const borders = bins.map(b => (b<496||b>504)?'#d94f4f':'#2d8fdd');
  new Chart(ctx, {
    type:'bar',
    data:{labels:bins.map(b=>b+' mL'),datasets:[{data:freqs,backgroundColor:colors,borderColor:borders,borderWidth:1,borderRadius:3}]},
    options:{
      responsive:true,
      plugins:{legend:noLegend,annotation:{annotations:{
        lsl:{type:'line',xMin:-0.5,xMax:-0.5,borderColor:'#d94f4f',borderWidth:2,label:{display:true,content:'LSL 496',color:'#d94f4f',font:dfont}},
        usl:{type:'line',xMin:8.5,xMax:8.5,borderColor:'#d94f4f',borderWidth:2,label:{display:true,content:'USL 504',color:'#d94f4f',font:dfont}},
      }}},
      scales:{x:{ticks:tickCfg,grid:gridCfg},y:{ticks:tickCfg,grid:gridCfg,title:{display:true,text:'Frequency',color:C.tick,font:dfont}}}
    }
  });
})();

// CHART 4 — I-MR chart: juice Brix (20 days, simulated data)
// pointBackgroundColor as an array colours only out-of-control points
// red (Brix > UCL or < LCL), with no extra logic needed.
// UCL/CL/LCL: flat datasets with borderDash for dashed lines.
// Day 17: simulated spike (12.21 > UCL 12.00) — special cause.
// 4) I-MR CHART (simulated juice Brix)
(function(){
  const ctx = document.getElementById('ch-imr').getContext('2d');
  const days = Array.from({length:20},(_,i)=>i+1);
  const mu=11.52, ucl=12.00, lcl=11.04;
  // Simulated values with one spike
  const vals = [11.48,11.55,11.51,11.49,11.53,11.58,11.47,11.52,11.54,11.50,11.53,11.49,11.51,11.56,11.48,11.52,12.21,11.50,11.53,11.49];
  const colors = vals.map(v => (v>ucl||v<lcl)?'#d94f4f':'#2d8fdd');
  new Chart(ctx, {
    type:'line',
    data:{labels:days.map(d=>'Day '+d),datasets:[
      {label:'Brix (°Bx)',data:vals,borderColor:'#2d8fdd',backgroundColor:'rgba(45,143,221,0.05)',pointBackgroundColor:colors,pointRadius:5,fill:true,tension:0.3},
      {label:'UCL',data:Array(20).fill(ucl),borderColor:'#d94f4f',borderWidth:1,borderDash:[5,5],pointRadius:0,fill:false},
      {label:'CL',data:Array(20).fill(mu),borderColor:'#27a876',borderWidth:1,borderDash:[3,3],pointRadius:0,fill:false},
      {label:'LCL',data:Array(20).fill(lcl),borderColor:'#d94f4f',borderWidth:1,borderDash:[5,5],pointRadius:0,fill:false},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:10},grid:gridCfg},
        y:{min:10.7,max:12.5,ticks:tickCfg,grid:gridCfg,title:{display:true,text:'Brix (°Bx)',color:C.tick,font:dfont}}
      }
    }
  });
})();

// CHART 5 — X-bar R chart: beer filling line fill volume
// Dual Y axis (yAxisID 'y' and 'y2'): X-bar means on the left,
// R range on the right — different scales on the same canvas.
// SG18: R=6.4 > UCL_R=5.9 (variability spike) and mean > UCL_Xbar.
// Legend filter shows only X-bar and R (not the 4 limit lines).
// 5) X-BAR R CHART
(function(){
  const ctx = document.getElementById('ch-xbarr').getContext('2d');
  const sgs = Array.from({length:25},(_,i)=>i+1);
  const xbar_mean = 330.4, xbar_ucl = 332.0, xbar_lcl = 328.8;
  const r_mean = 2.8, r_ucl = 5.9;
  const xbars = [330.2,330.8,329.9,330.5,331.1,330.3,330.7,329.8,330.4,330.9,330.2,330.6,329.9,330.4,330.8,330.1,330.5,332.3,330.0,330.4,330.7,329.9,330.5,330.3,330.6];
  const rs = [2.1,3.2,2.8,3.0,2.5,2.9,3.1,2.4,2.7,3.3,2.6,3.0,2.8,2.5,3.1,2.9,2.7,6.4,2.8,3.0,2.6,2.9,3.2,2.7,2.8];
  const xColors = xbars.map(v => (v>xbar_ucl||v<xbar_lcl)?'#d94f4f':'#2d8fdd');
  const rColors = rs.map(v => v>r_ucl?'#d94f4f':'#27a876');
  new Chart(ctx, {
    type:'line',
    data:{labels:sgs.map(s=>'SG'+s),datasets:[
      {label:'X-bar',data:xbars,borderColor:'#2d8fdd',pointBackgroundColor:xColors,pointRadius:4,fill:false,tension:0.3,yAxisID:'y'},
      {label:'UCL/LCL (X)',data:Array(25).fill(xbar_ucl),borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],pointRadius:0,fill:false,yAxisID:'y'},
      {label:'CL',data:Array(25).fill(xbar_mean),borderColor:'#27a876',borderWidth:1,borderDash:[3,3],pointRadius:0,fill:false,yAxisID:'y'},
      {label:'LCL X',data:Array(25).fill(xbar_lcl),borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],pointRadius:0,fill:false,yAxisID:'y'},
      {label:'R',data:rs,borderColor:'#e8a020',pointBackgroundColor:rColors,pointRadius:4,fill:false,tension:0.3,yAxisID:'y2'},
      {label:'UCL(R)',data:Array(25).fill(r_ucl),borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],pointRadius:0,fill:false,yAxisID:'y2'},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:12,filter:i=>[0,4].includes(i.datasetIndex)}}},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:13},grid:gridCfg},
        y:{min:328,max:333.5,ticks:tickCfg,grid:gridCfg,title:{display:true,text:'X-bar (mL)',color:C.tick,font:dfont}},
        y2:{position:'right',min:0,max:8,ticks:tickCfg,grid:{display:false},title:{display:true,text:'Range R (mL)',color:C.tick,font:dfont}}
      }
    }
  });
})();

// CHART 6 — P-chart: proportion defective over 30 label deliveries
// UCL and LCL vary at each point because n_i changes per delivery
// → control band is not flat.
// Day 22: p=0.0024 > UCL → red point → reject delivery.
// p values are multiplied ×100 to show the Y axis as a percentage.
// 6) P-CHART
(function(){
  const ctx = document.getElementById('ch-pchart').getContext('2d');
  const n_arr = [8000,5000,7000,9000,6000,8000,10000,7000,8000,5000,9000,6000,8000,7000,9000,5000,8000,10000,7000,6000,8000,9000,5000,7000,8000,6000,9000,8000,7000,9000];
  const pbar = 0.00138;
  const defectives = [12,8,9,14,8,11,14,10,11,7,13,8,12,9,13,7,11,15,9,9,12,12,7,10,11,8,12,11,10,12];
  const ps = defectives.map((d,i)=>d/n_arr[i]);
  const ucls = n_arr.map(n => pbar + 3*Math.sqrt(pbar*(1-pbar)/n));
  const lcls = n_arr.map(n => Math.max(0, pbar - 3*Math.sqrt(pbar*(1-pbar)/n)));
  const outColors = ps.map((p,i)=>p>ucls[i]?'#d94f4f':'#2d8fdd');
  const days = Array.from({length:30},(_,i)=>i+1);
  new Chart(ctx, {
    type:'line',
    data:{labels:days.map(d=>'D'+d),datasets:[
      {label:'p (proportion)',data:ps.map(v=>+(v*100).toFixed(4)),borderColor:'#2d8fdd',pointBackgroundColor:outColors,pointRadius:4,fill:false,tension:0.3},
      {label:'UCL',data:ucls.map(v=>+(v*100).toFixed(4)),borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],pointRadius:0,fill:false},
      {label:'p-bar',data:Array(30).fill(+(pbar*100).toFixed(4)),borderColor:'#27a876',borderWidth:1,borderDash:[3,3],pointRadius:0,fill:false},
      {label:'LCL',data:lcls.map(v=>+(v*100).toFixed(4)),borderColor:'#d94f4f',borderWidth:1,borderDash:[4,4],pointRadius:0,fill:false},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:12,filter:i=>[0,1,2].includes(i.datasetIndex)}}},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:15},grid:gridCfg},
        y:{ticks:{...tickCfg,callback:v=>v+'%'},grid:gridCfg,title:{display:true,text:'Proportion defective (%)',color:C.tick,font:dfont}}
      }
    }
  });
})();

// CHART 7 — Doughnut: Gauge R&R variation breakdown
// Green  = Part-to-Part (real process variation)
// Blue   = Repeatability EV (equipment error)
// Orange = Reproducibility AV (operator-to-operator difference)
// %GRR = EV+AV = 19.2% → marginal, but ndc=7.2 (≥5 → acceptable).
// 7) GRR PIE/BAR
(function(){
  const ctx = document.getElementById('ch-grr').getContext('2d');
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Part-to-Part Variation','Repeatability (EV)','Reproducibility (AV)'],
      datasets:[{
        data:[96.2-19.2, 14.2, 5.0],
        backgroundColor:['rgba(39,168,118,0.6)','rgba(45,143,221,0.6)','rgba(232,160,32,0.6)'],
        borderColor:['#27a876','#2d8fdd','#e8a020'],
        borderWidth:2
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{display:true,labels:{color:'#8aa4c0',font:dfont}},
        tooltip:{callbacks:{label:v=>`${v.label}: ${v.raw.toFixed(1)}%`}}
      }
    }
  });
})();

// CHART 8 — 1-sample t-test: H₀ vs observed distribution
// Green: expected distribution under H₀ (μ=5.0% declared ABV)
// Red: estimated distribution from sample data (μ=4.87%)
// The leftward shift of the red curve visually explains
// why H₀ is rejected (t=-2.80, p=0.007, one-tailed).
// 8) 1-sample t-test visual
(function(){
  const ctx = document.getElementById('ch-ttest1').getContext('2d');
  const xs = linspace(4.2, 5.6, 200);
  const mu_h0 = 5.0, mu_actual = 4.87, sig = 0.18;
  const h0_dist = xs.map(x => gaussY(x, mu_h0, sig));
  const actual_dist = xs.map(x => gaussY(x, mu_actual, sig));
  new Chart(ctx, {
    type:'line',
    data:{labels:xs.map(x=>x.toFixed(2)),datasets:[
      {label:'H₀ distribution (μ=5.0%)',data:h0_dist,borderColor:'#27a876',backgroundColor:'rgba(39,168,118,0.08)',pointRadius:0,fill:true,tension:0.4},
      {label:'Actual data distribution (μ=4.87%)',data:actual_dist,borderColor:'#d94f4f',backgroundColor:'rgba(217,79,79,0.08)',pointRadius:0,fill:true,tension:0.4},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:8,callback:(v,i,arr)=>{const val=parseFloat(xs[i]);return val%0.2<0.01?val.toFixed(1)+' %':''}},grid:gridCfg,title:{display:true,text:'ABV (%)',color:C.tick,font:dfont}},
        y:{display:false}
      }
    }
  });
})();

// CHART 9 — 2-sample t-test: Line A vs Line B (fill volume)
// Two partially overlapping Gaussian curves: ranges touch
// but centres (331.2 vs 333.7 mL) are clearly separated.
// The visual separation mirrors the result: p<0.0001,
// Line B overfills by +2.5 mL → estimated cost $18K/year.
// 9) 2-sample t-test visual
(function(){
  const ctx = document.getElementById('ch-ttest2').getContext('2d');
  const xs = linspace(325, 340, 200);
  const lineA = xs.map(x => gaussY(x, 331.2, 1.8));
  const lineB = xs.map(x => gaussY(x, 333.7, 2.1));
  new Chart(ctx, {
    type:'line',
    data:{labels:xs.map(x=>x.toFixed(1)),datasets:[
      {label:'Line A (μ=331.2 mL)',data:lineA,borderColor:'#2d8fdd',backgroundColor:'rgba(45,143,221,0.08)',pointRadius:0,fill:true,tension:0.4},
      {label:'Line B (μ=333.7 mL)',data:lineB,borderColor:'#d94f4f',backgroundColor:'rgba(217,79,79,0.08)',pointRadius:0,fill:true,tension:0.4},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:8,callback:(v,i)=>{const val=parseFloat(xs[i]);return val%2<0.1?val.toFixed(0)+' mL':''}},grid:gridCfg,title:{display:true,text:'Fill Volume (mL)',color:C.tick,font:dfont}},
        y:{display:false}
      }
    }
  });
})();

// CHART 10 — ANOVA: Brix distributions for 3 production shifts
// Three Gaussian curves with different mean and σ per shift.
// Shift 3 (red) is shifted right (μ=11.67, σ=0.19)
// vs shifts 1 and 2 → F=14.3, p<0.001, Tukey confirms
// Shift 3 is significantly different from the other two.
// 10) ANOVA box-like chart (simulated distributions per shift)
(function(){
  const ctx = document.getElementById('ch-anova').getContext('2d');
  const xs = linspace(11.0, 12.2, 200);
  const s1 = xs.map(x => gaussY(x, 11.48, 0.12));
  const s2 = xs.map(x => gaussY(x, 11.51, 0.13));
  const s3 = xs.map(x => gaussY(x, 11.67, 0.19));
  new Chart(ctx, {
    type:'line',
    data:{labels:xs.map(x=>x.toFixed(2)),datasets:[
      {label:'Shift 1 (μ=11.48)',data:s1,borderColor:'#2d8fdd',backgroundColor:'rgba(45,143,221,0.07)',pointRadius:0,fill:true,tension:0.4},
      {label:'Shift 2 (μ=11.51)',data:s2,borderColor:'#27a876',backgroundColor:'rgba(39,168,118,0.07)',pointRadius:0,fill:true,tension:0.4},
      {label:'Shift 3 (μ=11.67) ★',data:s3,borderColor:'#d94f4f',backgroundColor:'rgba(217,79,79,0.1)',pointRadius:0,fill:true,tension:0.4},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:7,callback:(v,i)=>{const val=parseFloat(xs[i]);return val%0.2<0.01?val.toFixed(1)+' °Bx':''}},grid:gridCfg},
        y:{display:false}
      }
    }
  });
})();

// CHART 11 — Chi-square: defects by type and line (stacked bar)
// Each bar = total defects on one line, split by type.
// The anomalously high 'Label defect' share on Line B is immediately
// obvious (orange segment far taller than other lines)
// → high standardised residual → main driver of χ²=12.84.
// 11) CHI-SQUARE stacked bar
(function(){
  const ctx = document.getElementById('ch-chisq').getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{
      labels:['Line A','Line B','Line C'],
      datasets:[
        {label:'Fill defect',data:[45,38,41],backgroundColor:'rgba(45,143,221,0.7)',borderColor:'#2d8fdd',borderWidth:1},
        {label:'Label defect',data:[12,31,15],backgroundColor:'rgba(232,160,32,0.7)',borderColor:'#e8a020',borderWidth:1},
        {label:'Cap defect',data:[8,6,9],backgroundColor:'rgba(39,168,118,0.7)',borderColor:'#27a876',borderWidth:1},
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{stacked:true,ticks:tickCfg,grid:gridCfg},
        y:{stacked:true,ticks:tickCfg,grid:gridCfg,title:{display:true,text:'Count of defects',color:C.tick,font:dfont}}
      }
    }
  });
})();

// CHART 12 — Scatter + OLS line: tank temperature vs CO₂ volume
// Scatter points generated with Math.random() + manually imposed
// correlation (r≈-0.88). The regression line is computed in JS
// using standard OLS formulas: b1=Σ(xi-X̄)(yi-Ȳ)/Σ(xi-X̄)², b0=Ȳ-b1·X̄.
// 12) SCATTER PLOT regression
(function(){
  const ctx = document.getElementById('ch-scatter').getContext('2d');
  // Generate correlated data: temp (2-10°C), CO2 (negative correlation)
  const temps = [2,3,2.5,4,3.5,5,4.5,6,5.5,7,6.5,8,7.5,9,8.5,10,3,5,7,4,6,8,2.5,4.5,6.5,5,7,9,3.5,8.5,6,4,7.5,9,5.5];
  const co2 = temps.map(t => 3.1 - 0.07*t + (Math.random()-0.5)*0.15);
  // Regression line
  const avgT = temps.reduce((a,b)=>a+b)/temps.length;
  const avgC = co2.reduce((a,b)=>a+b)/co2.length;
  const b1 = temps.reduce((s,t,i)=>s+(t-avgT)*(co2[i]-avgC),0)/temps.reduce((s,t)=>s+(t-avgT)**2,0);
  const b0 = avgC - b1*avgT;
  const regX = [2,10], regY = regX.map(x=>b0+b1*x);
  new Chart(ctx, {
    type:'scatter',
    data:{
      datasets:[
        {label:'Batches',data:temps.map((t,i)=>({x:t,y:co2[i]})),backgroundColor:'rgba(45,143,221,0.6)',borderColor:'#2d8fdd',pointRadius:5},
        {label:'Regression line',data:regX.map((x,i)=>({x,y:regY[i]})),type:'line',borderColor:'#e8a020',pointRadius:0,fill:false,borderWidth:2},
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:12}}},
      scales:{
        x:{title:{display:true,text:'Tank Temperature (°C)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg},
        y:{title:{display:true,text:'CO₂ Volume (vol)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg}
      }
    }
  });
})();

// CHART 13 — Scatter + line: syrup temperature vs Brix deviation
// The regression line is a 'line' type dataset overlaid on the scatter —
// standard Chart.js technique for mixing scatter and line on one canvas.
// Model: Ŷ = 0.04 + 0.012·T (R²=61%, p=0.001 for β₁).
// 13) REGRESSION CHART (syrup temp vs Brix deviation)
(function(){
  const ctx = document.getElementById('ch-regr').getContext('2d');
  const temps = Array.from({length:40},()=>10+Math.random()*20);
  const brixDev = temps.map(t => 0.04 + 0.012*t + (Math.random()-0.5)*0.08);
  const regLine = linspace(10,30,2).map(t=>({x:t,y:0.04+0.012*t}));
  new Chart(ctx, {
    type:'scatter',
    data:{datasets:[
      {label:'Batches',data:temps.map((t,i)=>({x:t,y:brixDev[i]})),backgroundColor:'rgba(45,143,221,0.5)',borderColor:'#2d8fdd',pointRadius:5},
      {label:'Ŷ = 0.04 + 0.012×Temp',data:regLine,type:'line',borderColor:'#e8a020',pointRadius:0,fill:false,borderWidth:2.5},
    ]},
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:12}}},
      scales:{
        x:{title:{display:true,text:'Syrup Inlet Temperature (°C)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg},
        y:{title:{display:true,text:'Brix Deviation (|ΔBx|)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg}
      }
    }
  });
})();

// CHART 14 — DOE interaction plot: CO₂ pressure × temperature
// Two lines = two temperature levels (low and high).
// NON-parallel lines → AB interaction present:
// the effect of pressure on carbonation DEPENDS on temperature.
// OFAT would never have detected this interaction.
// 14) INTERACTION PLOT
(function(){
  const ctx = document.getElementById('ch-interaction').getContext('2d');
  new Chart(ctx, {
    type:'line',
    data:{
      labels:['Low CO₂ Pressure (2.8 bar)','High CO₂ Pressure (3.4 bar)'],
      datasets:[
        {label:'Low Temp (2°C)',data:[2.41,2.74],borderColor:'#2d8fdd',backgroundColor:'rgba(45,143,221,0.1)',pointRadius:6,pointBackgroundColor:'#2d8fdd',fill:false,borderWidth:2.5},
        {label:'High Temp (8°C)',data:[2.28,2.56],borderColor:'#d94f4f',backgroundColor:'rgba(217,79,79,0.1)',pointRadius:6,pointBackgroundColor:'#d94f4f',fill:false,borderWidth:2.5},
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{ticks:tickCfg,grid:gridCfg},
        y:{min:2.1,max:2.9,title:{display:true,text:'CO₂ Volume (vol)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg}
      }
    }
  });
})();

// CHART 15 — Main effects plot: DOE 2³ main effects
// Horizontal bar chart (indexAxis:'y') for at-a-glance comparison
// of the three main effects:
//   A (pressure)     = +0.30 vol CO₂ → dominant positive effect
//   B (temperature)  = -0.155        → relevant negative effect
//   C (velocity)     = +0.005        → negligible
// 15) MAIN EFFECTS PLOT
(function(){
  const ctx = document.getElementById('ch-maineff').getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{
      labels:['A: Pressure\n(Low→High)','B: Temperature\n(Low→High)','C: Velocity\n(Low→High)'],
      datasets:[
        {label:'Main Effect (Δ vol CO₂)',
         data:[0.30, -0.155, 0.005],
         backgroundColor:['rgba(39,168,118,0.6)','rgba(217,79,79,0.6)','rgba(45,143,221,0.4)'],
         borderColor:['#27a876','#d94f4f','#2d8fdd'],
         borderWidth:1.5,borderRadius:4}
      ]
    },
    options:{
      responsive:true,
      indexAxis:'y',
      plugins:{legend:noLegend},
      scales:{
        x:{title:{display:true,text:'Effect on CO₂ Volume (vol)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg},
        y:{ticks:tickCfg,grid:gridCfg}
      }
    }
  });
})();

// CHART 16 — OC Curve (Operating Characteristic): n=125, Ac=3
// binomCDF(n, p, k): computes the binomial CDF iteratively
// (no math library): P(accept) = Σ C(n,i)·pⁱ·(1-p)^(n-i), i=0..Ac
// At AQL=1%: acceptance probability ≈95% (supplier risk α≈5%).
// Curve drops sharply beyond AQL → discriminating power of the plan.
// 16) OC CURVE
(function(){
  const ctx = document.getElementById('ch-oc').getContext('2d');
  const pcts = linspace(0,8,80);
  // Binomial approx for n=125, Ac=3
  function binomCDF(n,p,k){
    let s=0;
    for(let i=0;i<=k;i++){
      let c=1;for(let j=0;j<i;j++) c=c*(n-j)/(j+1);
      s+=c*Math.pow(p,i)*Math.pow(1-p,n-i);
    }
    return s;
  }
  const probs = pcts.map(p => binomCDF(125, p/100, 3)*100);
  new Chart(ctx, {
    type:'line',
    data:{labels:pcts.map(p=>p.toFixed(1)+'%'),datasets:[
      {label:'P(Accept)',data:probs,borderColor:'#2d8fdd',backgroundColor:'rgba(45,143,221,0.1)',pointRadius:0,fill:true,tension:0.4}
    ]},
    options:{
      responsive:true,
      plugins:{legend:noLegend},
      scales:{
        x:{ticks:{...tickCfg,maxTicksLimit:9},grid:gridCfg,title:{display:true,text:'True % Defective in Lot',color:C.tick,font:dfont}},
        y:{min:0,max:100,ticks:{...tickCfg,callback:v=>v+'%'},grid:gridCfg,title:{display:true,text:'Probability of Acceptance',color:C.tick,font:dfont}}
      }
    }
  });
})();

// CHART 17 — Bar chart: sensory scores for 2 label designs
// Displays the 15 individual scores per group (A=blue, B=red).
// Not a technical box plot, but clearly shows the distribution:
// Design A (median=7) >> Design B (median=5)
// → Mann-Whitney U=31 < U_critical=72 → p<0.05, Design A preferred.
// 17) MANN-WHITNEY BOX CHART
(function(){
  const ctx = document.getElementById('ch-mw').getContext('2d');
  const a_scores = [5,7,8,6,7,8,9,6,7,8,5,7,8,9,7];
  const b_scores = [4,5,6,5,7,5,6,4,6,5,7,5,6,4,5];
  const a_avg = a_scores.reduce((s,x)=>s+x)/a_scores.length;
  const b_avg = b_scores.reduce((s,x)=>s+x)/b_scores.length;
  new Chart(ctx, {
    type:'bar',
    data:{
      labels:['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'],
      datasets:[
        {label:`Design A (median=7, avg=${a_avg.toFixed(1)})`,data:a_scores,backgroundColor:'rgba(45,143,221,0.6)',borderColor:'#2d8fdd',borderWidth:1,borderRadius:3},
        {label:`Design B (median=5, avg=${b_avg.toFixed(1)})`,data:b_scores,backgroundColor:'rgba(217,79,79,0.5)',borderColor:'#d94f4f',borderWidth:1,borderRadius:3},
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:true,labels:{color:'#8aa4c0',font:dfont,boxWidth:14}}},
      scales:{
        x:{title:{display:true,text:'Consumer (n=15 per group)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg},
        y:{min:0,max:10,title:{display:true,text:'Liking Score (1–10)',color:C.tick,font:dfont},ticks:tickCfg,grid:gridCfg}
      }
    }
  });
})();
