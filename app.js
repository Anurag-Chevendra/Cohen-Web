/* ══════════════════════════════════════════════════════════════
   COHEN · site script
   One file for every page. Every block guards on the element it
   needs, so a page without a chart simply skips that block.
   Loaded by all pages via <script src="app.js" defer></script>
   ══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   PRICING CONFIG: edit here, nowhere else.
   Annual figures are the per-month equivalent when billed yearly.
   ══════════════════════════════════════════════════════════════ */
const PRICING = {
  scanner: [
    { name:'FREE', who:'Gate an install without running anything.',
      monthly:0, annual:0, per:'forever', sub:'no card, no expiry',
      cta:'Get a key', href:'https://console.snappyfeet.org/', feat:false, inherits:null,
      items:[
        {t:'Binary verdicts: review or clean', key:true},
        {t:'Cohen database, OSV and npm security holdings'},
        {t:'Mantis, with 100 lookups per day'},
        {t:'No deep analyses, no evidence'},
        {t:'Community support'}
      ]},
    { name:'INDIVIDUAL', who:'For one developer who wants to see the trace, not just the answer.',
      monthly:14, annual:12, per:'per month', sub:'one user',
      cta:'Start free', href:'https://console.snappyfeet.org/', feat:false, inherits:'Everything in Free, plus',
      items:[
        {t:'150 deep analyses per month', key:true},
        {t:'Mantis, with unlimited verdict lookups'},
        {t:'Dynamic and static engines'},
        {t:'Full evidence: trace, process tree, hashes, entropy'},
        {t:'90 day history'},
        {t:'Stops at the limit, never bills a surprise'}
      ]},
    { name:'TEAM', who:'For a team of up to ten, billed flat rather than per head.',
      monthly:349, annual:291, per:'per month', sub:'flat rate, up to 10 users',
      cta:'Join the waitlist', href:'contact.html?topic=team', feat:true, inherits:'Everything in Individual, plus',
      items:[
        {t:'2,000 deep analyses per month, pooled', key:true},
        {t:'Up to 10 users included', key:true},
        {t:'Mantis on every machine, for package scanning', key:true},
        {t:'Private and scoped package analysis'},
        {t:'CI gate, webhooks and policy'},
        {t:'12 month history and audit trail'},
        {t:'Priority queue'},
        {t:'$0.02 per analysis over the limit'}
      ]},
    { name:'ENTERPRISE', who:'For scale, compliance, or a sandbox that has to run inside your own network.',
      monthly:null, annual:null, per:'', sub:'negotiated volume',
      cta:'Talk to us', href:'contact.html?topic=enterprise', feat:false, inherits:'Everything in Team, plus',
      items:[
        {t:'Self hosted sandbox or VPC deployment', key:true},
        {t:'More than 10 users, negotiated analysis volume', key:true},
        {t:'Dedicated run capacity and SLA'},
        {t:'SSO and role based access control'},
        {t:'Custom retention and evidence export'},
        {t:'SIEM and EDR push'},
        {t:'Data residency scoped in contract'}
      ]}
  ],
  intel: [
    { name:'RESEARCH', who:'For academics, journalists and open source maintainers.',
      monthly:0, annual:0, per:'forever', sub:'noncommercial use only',
      cta:'Apply', href:'mailto:contact@snappyfeet.org?subject=Research%20access', feat:false, inherits:null,
      items:[
        {t:'Full feed, delayed 30 days', key:true},
        {t:'1,000 requests per month'},
        {t:'Attribution required'}
      ]},
    { name:'BUILDER', who:'For a product that needs verdicts inside its own workflow.',
      monthly:99, annual:82, per:'per month', sub:'',
      cta:'Get a key', href:'mailto:contact@snappyfeet.org?subject=Observatory%20Builder', feat:false, inherits:null,
      items:[
        {t:'Real time verdicts, no delay', key:true},
        {t:'25,000 requests per month'},
        {t:'Webhook push on new findings'},
        {t:'Commercial use, single product'}
      ]},
    { name:'COMMERCIAL', who:'For a security team feeding its own detections.',
      monthly:999, annual:832, per:'per month', sub:'',
      cta:'Talk to us', href:'contact.html?topic=observatory', feat:true, inherits:'Everything in Builder, plus',
      items:[
        {t:'Full IOC export: C2, hashes, artifacts', key:true},
        {t:'Complete historical archive', key:true},
        {t:'Unlimited queries'},
        {t:'STIX and TAXII, SIEM connectors'},
        {t:'Bulk and incremental sync'}
      ]},
    { name:'OEM',
      who:'For redistributing Observatory verdicts inside your own product.',
      monthly:null, annual:null, per:'', sub:'redistribution licence',
      cta:'Talk to us', href:'contact.html?topic=observatory', feat:false, inherits:null,
      items:[
        {t:'Redistribution rights', key:true},
        {t:'White label verdicts'},
        {t:'Negotiated volume and SLA'},
        {t:'Direct line to the research team'}
      ]}
  ]
};

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* package names, used by the hero radar HUD */
const FEED=[
  ['polymarket-stake-mathss@3.5.2','credentials read, then archived',1],
  ['slugify-fast@2.1.0','nothing notable observed',0],
  ['node-metrics-agentt@1.4.7','host details encoded in DNS queries',1],
  ['tiny-emitter-x@1.0.2','nothing notable observed',0],
  ['@corp/build-tools@0.0.1-security','registry placeholder, nothing to observe',1],
  ['pathnorm@3.0.4','nothing notable observed',0],
  ['aws-sdk-helperr@2.9.1','payload dropped and executed',1],
  ['ms-parse@1.1.0','nothing notable observed',0]
];

const NS='http://www.w3.org/2000/svg';
const el=(n,a)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e};

/* ── nav ── */
const nav=document.getElementById('nav'),burger=document.getElementById('burger'),links=document.getElementById('navlinks');
addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>40),{passive:true});
burger.addEventListener('click',()=>burger.setAttribute('aria-expanded',links.classList.toggle('open')));
links.addEventListener('click',e=>{if(e.target.tagName==='A'){links.classList.remove('open');burger.setAttribute('aria-expanded','false')}});

/* ── signed in hint ──
   The console sets cohen_signed_in=1 on .snappyfeet.org at login. Not a
   credential: it holds one character, identifies nobody and grants nothing.
   It exists so a page served by GitHub Pages can pick the right label with
   no API call and no CORS. */
(function(){
  if(document.cookie.split('; ').indexOf('cohen_signed_in=1') === -1) return;
  document.querySelectorAll('a.nav-cta').forEach(a=>{
    a.textContent='Dashboard';
    a.href='https://console.snappyfeet.org/keys';
  });
})();

/* ── product dropdown ──
   mouseleave gets a grace timer so a fast diagonal toward the panel
   does not close it. The transparent padding on .drop-m handles the
   rest by keeping the pointer inside #dropW the whole way down. */
const dw=document.getElementById('dropW'),dt=document.getElementById('dropT'),dm=document.getElementById('dropM');
if(dw&&dt&&dm){
  let grace;
  const wide=()=>innerWidth>960;
  const set=v=>{clearTimeout(grace);dt.setAttribute('aria-expanded',v);dm.classList.toggle('open',v)};
  dt.addEventListener('click',e=>{e.stopPropagation();set(dt.getAttribute('aria-expanded')!=='true')});
  dw.addEventListener('mouseenter',()=>{if(wide())set(true)});
  dw.addEventListener('mouseleave',()=>{if(wide()){clearTimeout(grace);grace=setTimeout(()=>set(false),150)}});
  dw.addEventListener('focusout',e=>{if(wide()&&!dw.contains(e.relatedTarget))set(false)});
  document.addEventListener('click',e=>{if(!dw.contains(e.target))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'){set(false);dt.blur()}});
}

/* ── pricing render ── */
let period='monthly';
function money(n){ return '$'+n.toLocaleString('en-US'); }
function renderTiers(target, list){
  target.innerHTML = list.map(t=>{
    const amount = t[period];
    const priceBlock = amount===null
      ? `<div class="price"><span class="amt">Custom</span></div>`
      : `<div class="price"><span class="amt">${money(amount)}</span><span class="per">${t.per}</span></div>`;
    const sub = period==='annual' && amount ? 'billed annually' : (t.sub||'');
    return `<div class="tier ${t.feat?'feat':''}">
      <p class="tn">${t.name}</p>
      <p class="who">${t.who}</p>
      ${priceBlock}
      <p class="price-sub">${sub}</p>
      <a class="cta" href="${t.href || 'https://console.snappyfeet.org/'}">${t.cta}</a>
      ${t.inherits?`<p class="inh">${t.inherits}</p>`:''}
      <ul>${t.items.map(i=>`<li class="${i.key?'key':''}">${i.t}</li>`).join('')}</ul>
    </div>`;
  }).join('');
}
function renderAll(){
  const a=document.getElementById('tiers'), b=document.getElementById('intelTiers');
  if(a) renderTiers(a, PRICING.scanner);
  if(b) renderTiers(b, PRICING.intel);
}
renderAll();
const tM=document.getElementById('tMonthly'), tA=document.getElementById('tAnnual');
if(tM&&tA){
  tM.addEventListener('click',()=>{period='monthly';tM.classList.add('on');tA.classList.remove('on');renderAll()});
  tA.addEventListener('click',()=>{period='annual';tA.classList.add('on');tM.classList.remove('on');renderAll()});
}

/* ── timeline plot ── */
(function(){
  const svg=document.getElementById('plot');
  if(!svg) return;
  const X0=92,X1=988,DUR=10.5;
  const TOP=26,BOT=126;
  const mono='ui-monospace,monospace';
  const lanes=[{y:44,l:'FILESYSTEM'},{y:78,l:'PROCESS'},{y:112,l:'NETWORK'}];
  const E=[
    [0.00,0.06,1,1],[0.04,0.09,0,0],
    [0.31,0.36,0,1],[0.52,0.57,0,1],[0.88,0.93,0,1],[1.15,1.20,0,1],[1.60,1.66,0,1],
    [2.04,2.38,1,1],[2.41,2.90,1,1],
    [3.02,3.10,0,1],[3.55,3.62,0,1],[4.10,4.14,0,0],
    [6.72,9.90,2,1],[9.98,10.50,2,1]
  ];
  const px=t=>X0+(t/DUR)*(X1-X0);

  /* the empty stretch is the finding, so it is labelled rather than left blank */
  const IA=4.20,IB=6.66;
  svg.appendChild(el('rect',{x:px(IA),y:TOP,width:px(IB)-px(IA),height:BOT-TOP,fill:'rgba(255,255,255,.022)'}));
  [IA,IB].forEach(t=>svg.appendChild(el('line',{x1:px(t),y1:TOP,x2:px(t),y2:BOT,
    stroke:'rgba(255,255,255,.13)','stroke-dasharray':'2 3'})));
  const il=el('text',{x:(px(IA)+px(IB))/2,y:19,fill:'#5C626A','font-size':9.5,'font-family':mono,
    'text-anchor':'middle','letter-spacing':'1.1'});
  il.textContent='IDLE 2.5s'; svg.appendChild(il);

  for(let t=0;t<=10;t+=2){
    svg.appendChild(el('line',{x1:px(t),y1:TOP,x2:px(t),y2:BOT,stroke:'rgba(255,255,255,.05)'}));
    if(t===10) continue;
    const lb=el('text',{x:px(t),y:BOT+16,fill:'#3A3F45','font-size':9.5,'font-family':mono,'text-anchor':'middle'});
    lb.textContent=t+'s'; svg.appendChild(lb);
  }
  const last=el('text',{x:px(10.5),y:BOT+16,fill:'#3A3F45','font-size':9.5,'font-family':mono,'text-anchor':'end'});
  last.textContent='10.5s'; svg.appendChild(last);

  lanes.forEach(L=>{
    svg.appendChild(el('line',{x1:X0,y1:L.y,x2:X1,y2:L.y,stroke:'rgba(255,255,255,.10)'}));
    const t=el('text',{x:0,y:L.y+3.5,fill:'#5C626A','font-size':9.5,'font-family':mono,'letter-spacing':'1.1'});
    t.textContent=L.l; svg.appendChild(t);
  });
  E.forEach(([a,b,lane,sig],i)=>{
    const x=px(a), w=Math.max(4,px(b)-px(a)), y=lanes[lane].y;
    const r=el('rect',{x,y:y-6,width:w,height:12,rx:2,fill:sig?'#FF2D1F':'#3A3F45',opacity:sig?0.92:0.55});
    if(!REDUCE){
      r.setAttribute('opacity','0');
      r.appendChild(el('animate',{attributeName:'opacity',from:0,to:sig?0.92:0.55,dur:'.35s',begin:(0.25+i*0.09)+'s',fill:'freeze'}));
    }
    svg.appendChild(r);
  });
  const P=[[0.31,1.66,'reads credentials'],[2.04,3.62,'compresses each one'],[3.62,6.72,'waits'],[6.72,10.5,'opens outbound connections']];
  P.forEach(([a,b,label])=>{
    const xa=px(a),xb=px(b),y=160;
    svg.appendChild(el('line',{x1:xa,y1:y,x2:xb,y2:y,stroke:'rgba(255,255,255,.16)'}));
    svg.appendChild(el('line',{x1:xa,y1:y-4,x2:xa,y2:y+4,stroke:'rgba(255,255,255,.16)'}));
    svg.appendChild(el('line',{x1:xb,y1:y-4,x2:xb,y2:y+4,stroke:'rgba(255,255,255,.16)'}));
    const t=el('text',{x:(xa+xb)/2,y:y+17,fill:'#5C626A','font-size':10,'font-family':mono,'text-anchor':'middle'});
    t.textContent=label; svg.appendChild(t);
  });
})();

/* ── correlated pairs ── */
(function(){
  const svg=document.getElementById('pairs');
  if(!svg) return;
  const mono='ui-monospace,monospace',LX=152,RX=248;
  [['read secret','archive named after it'],['chmod +x','execve same path']].forEach((p,i)=>{
    const y=24+i*30;
    svg.appendChild(el('path',{d:`M${LX} ${y} C ${LX+30} ${y-13}, ${RX-30} ${y-13}, ${RX} ${y}`,
      fill:'none',stroke:'#FF2D1F','stroke-width':1,opacity:.8}));
    svg.appendChild(el('circle',{cx:LX,cy:y,r:2.8,fill:'#3A3F45'}));
    svg.appendChild(el('circle',{cx:RX,cy:y,r:2.8,fill:'#FF2D1F',opacity:.9}));
    const a=el('text',{x:LX-10,y:y+3.5,fill:'#5C626A','font-size':10,'font-family':mono,'text-anchor':'end'});
    a.textContent=p[0];
    const b=el('text',{x:RX+10,y:y+3.5,fill:'#99A0A9','font-size':10,'font-family':mono});
    b.textContent=p[1];
    svg.appendChild(a);svg.appendChild(b);
  });
})();

/* ── entropy ── */
(function(){
  const svg=document.getElementById('entropy');
  if(!svg) return;
  const vals=[4.1,3.8,4.4,4.0,3.6,4.2,3.9,4.5,4.0,3.7,4.3,3.9,4.1,7.94,4.0,3.8,4.2,4.4,3.9,4.1];
  const W=420,H=48,BASE=56,MAX=8.6,mono='ui-monospace,monospace';
  const bw=W/vals.length, yOf=v=>BASE-(v/MAX)*H;
  svg.appendChild(el('line',{x1:0,y1:yOf(7),x2:W,y2:yOf(7),stroke:'rgba(255,255,255,.14)','stroke-dasharray':'2 3'}));
  const th=el('text',{x:0,y:yOf(7)-5,fill:'#3A3F45','font-size':9,'font-family':mono});
  th.textContent='7.0 THRESHOLD'; svg.appendChild(th);
  svg.appendChild(el('line',{x1:0,y1:BASE,x2:W,y2:BASE,stroke:'rgba(255,255,255,.10)'}));
  vals.forEach((v,i)=>{
    const y=yOf(v), hot=v>7;
    svg.appendChild(el('rect',{x:i*bw+2,y,width:bw-4,height:BASE-y,rx:1,fill:hot?'#FF2D1F':'#2A2F35'}));
    if(hot){
      const t=el('text',{x:i*bw+bw/2,y:y-6,fill:'#FF2D1F','font-size':9.5,'font-family':mono,'text-anchor':'middle'});
      t.textContent='7.94 PACKED'; svg.appendChild(t);
    }
  });
})();

/* ── hero horizon + radar ──
   One geometry drives everything: the arc, inner ring, sight line and
   point (SVG), and the sweep and stars (canvas). The arc is the radar's
   rim, so the beam turns about the arc's own centre, which sits below the
   fold. That is why the torch only crosses the screen part of each turn.
   The frame is centred and capped at 1760px, so on very wide screens the
   arc stays near the copy instead of drifting to the far edge. */
(function(){
  const wrap=document.querySelector('.horizon'),c=document.getElementById('radar');
  if(!wrap||!c) return;
  const svg=wrap.querySelector('.hz-svg'),x=c.getContext('2d');
  const q=s=>svg.querySelector(s);
  const NAMES=FEED.map(f=>f[0]),hud=document.getElementById('hudpkg');
  /* tuning: raise or lower these to taste */
  const STARS=26,STARS_MOBILE=12,BEAM=.05,SPEED=.0025;
  let w,h,cx,cy,R,REACH,dots=[],ang=-Math.PI*.9,running=true,raf;

  function layout(){
    const d=Math.min(devicePixelRatio||1,2);
    w=wrap.clientWidth;h=wrap.clientHeight;
    c.width=w*d;c.height=h*d;x.setTransform(d,0,0,d,0,0);
    const F=Math.min(w,1760),fx=(w-F)/2,k=Math.max(F/1440,h/900);
    const ox=fx+F-1440*k,oy=(h-900*k)/2;
    cx=ox+1380*k;cy=oy+1014*k;R=675*k;
    const ly=oy+560*k,px=cx-Math.sqrt(Math.max(0,R*R-(cy-ly)*(cy-ly))),ri=556*k;
    REACH=R; /* the beam stays inside the rim */
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.removeAttribute('preserveAspectRatio');
    const set=(el,a)=>{for(const n in a) el.setAttribute(n,a[n])};
    set(q('.hz-sight'),{x1:0,y1:ly,x2:px,y2:ly});
    set(q('.hz-rest'),{x1:px,y1:ly,x2:w,y2:ly});
    set(q('.hz-inner'),{d:`M ${cx-ri} ${cy} A ${ri} ${ri} 0 0 1 ${cx+ri} ${cy}`});
    set(q('.hz-arc'),{d:`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`,'stroke-width':Math.max(3,7*k)});
    set(q('.hz-inner'),{'stroke-width':Math.max(1.5,3.5*k)});
    set(q('.hz-dot'),{cx:px,cy:ly,r:Math.max(7,15*k)});
  }
  function seed(){
    dots=[];const n=w<700?STARS_MOBILE:STARS;
    for(let i=0,tries=0;i<n&&tries<4000;tries++){
      const px=Math.random()*w,py=Math.random()*h;
      if(Math.hypot(px-cx,py-cy)>R*.97) continue; /* stars only inside the rim */
      i++;const hot=Math.random()<.08;
      dots.push({a:Math.atan2(py-cy,px-cx),r:Math.hypot(px-cx,py-cy),hot,
        name:hot?NAMES[Math.floor(Math.random()*NAMES.length)]:null});
    }
  }
  function frame(){
    x.clearRect(0,0,w,h);x.lineWidth=1;
    // the torch
    if(!REDUCE){
      x.save();x.translate(cx,cy);x.rotate(ang);
      const g=x.createLinearGradient(0,0,REACH,0);
      g.addColorStop(0,`rgba(255,255,255,${BEAM})`);g.addColorStop(.6,`rgba(255,255,255,${BEAM/2})`);g.addColorStop(1,'rgba(255,255,255,0)');
      x.beginPath();x.moveTo(0,0);x.arc(0,0,REACH,-.32,0);x.closePath();x.fillStyle=g;x.fill();x.restore();
    }
    // stars, lit as the beam passes
    let nearest=null,best=0;
    dots.forEach(d=>{
      const px=cx+Math.cos(d.a)*d.r,py=cy+Math.sin(d.a)*d.r;
      let lit=0;
      if(!REDUCE){let df=(ang-d.a)%(Math.PI*2);if(df<0)df+=Math.PI*2;lit=df<.8?1-df/.8:0}
      const alpha=Math.min(1,(d.hot?.16:.06)+lit*(d.hot?.6:.4));
      x.beginPath();x.arc(px,py,d.hot?2:1.15,0,Math.PI*2);
      x.fillStyle=d.hot?`rgba(255,45,31,${alpha})`:`rgba(255,255,255,${alpha})`;x.fill();
      if(d.hot&&lit>.2){
        const s=5+8*(1-lit);
        x.strokeStyle=`rgba(255,45,31,${.3*lit})`;x.lineWidth=1;
        x.beginPath();x.moveTo(px-s,py);x.lineTo(px-s*.45,py);x.moveTo(px+s*.45,py);x.lineTo(px+s,py);
        x.moveTo(px,py-s);x.lineTo(px,py-s*.45);x.moveTo(px,py+s*.45);x.lineTo(px,py+s);x.stroke();
        if(lit>best){best=lit;nearest=d.name}
      }
    });
    if(hud&&nearest&&hud.dataset.n!==nearest){hud.dataset.n=nearest;hud.textContent='OBSERVING · '+nearest.toUpperCase()}
    if(!REDUCE&&running){ang+=SPEED;raf=requestAnimationFrame(frame)}
  }
  layout();seed();frame();
  let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>{layout();seed();if(REDUCE||!running)frame()},60)},{passive:true});
  new IntersectionObserver(e=>{running=e[0].isIntersecting;
    if(running&&!REDUCE){cancelAnimationFrame(raf);frame()}},{threshold:0}).observe(wrap);
})();

/* ── hero HUD ticker ──
   The radar used to feed the HUD. The horizon hero has no radar, so the
   package names cycle on their own. One name only under reduced motion. */
(function(){
  const hud=document.getElementById('hudpkg');
  if(!hud||document.getElementById('radar')) return;
  const names=FEED.map(f=>f[0]);let i=0;
  const show=()=>{hud.textContent='OBSERVING · '+names[i%names.length].toUpperCase();i++};
  show();
  if(!REDUCE) setInterval(show,2600);
})();

/* ── hero text guard ──
   Draws a soft cutout of the hero copy (each text line and each button)
   and hands it to CSS as --hzmask, so the horizon fades only where it
   actually sits behind text. */
(function(){
  const hero=document.querySelector('.hero'),w=hero&&hero.querySelector('.w');
  if(!hero||!hero.querySelector('.horizon')) return;
  const PAD=18,BLUR=22;
  function measure(){
    const h=hero.querySelector('.horizon').getBoundingClientRect(),W=Math.round(h.width),H=Math.round(h.height);
    const boxes=[];
    w.querySelectorAll('.kicker,.title,.dek').forEach(el=>{
      const r=document.createRange();r.selectNodeContents(el);
      [...r.getClientRects()].forEach(b=>boxes.push(b));
    });
    w.querySelectorAll('.btns a').forEach(a=>boxes.push(a.getBoundingClientRect()));
    const rects=boxes.filter(b=>b.width&&b.height).map(b=>
      `<rect x="${Math.round(b.left-h.left-PAD)}" y="${Math.round(b.top-h.top-PAD)}" width="${Math.round(b.width+PAD*2)}" height="${Math.round(b.height+PAD*2)}"/>`).join('');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`+
      `<defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${BLUR}"/></filter>`+
      `<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>`+
      `<g filter="url(#b)" fill="#1a1a1a">${rects}</g></mask></defs>`+
      `<rect width="${W}" height="${H}" fill="#fff" mask="url(#m)"/></svg>`;
    hero.style.setProperty('--hzmask',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }
  let t;const later=()=>{clearTimeout(t);t=setTimeout(measure,80)};
  measure();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('resize',later,{passive:true});
})();

/* ── contact form ──
   The site is static, so a send composes the message and opens the
   visitor's email client, addressed to the team. To post to a form
   service instead, replace the mailto block in send() with a fetch().
   ?topic=enterprise | team | observatory | mantis | api preselects a box. */
(function(){
  const f=document.getElementById('contactForm');
  if(!f) return;
  const TO='contact@snappyfeet.org';
  const box=f.querySelector('#cfTopics'),err=document.getElementById('cfErr');
  const map={team:'Team plan',enterprise:'Enterprise or self hosted sandbox',mantis:'Mantis',
    observatory:'Observatory threat intel',api:'Feed API'};
  const want=new URLSearchParams(location.search).get('topic');
  if(want&&map[want]){const c=f.querySelector(`input[value="${map[want]}"]`);if(c)c.checked=true}
  const topics=()=>[...f.querySelectorAll('input[name=topic]:checked')].map(c=>c.value);
  f.addEventListener('change',()=>{if(f.classList.contains('tried'))check()});
  function check(){
    const ok=f.checkValidity(),t=topics().length>0;
    box.classList.toggle('bad',!t);err.hidden=ok&&t;return ok&&t;
  }
  f.addEventListener('submit',e=>{
    e.preventDefault();f.classList.add('tried');
    if(!check()){const bad=f.querySelector(':invalid')||box;bad.focus&&bad.focus();
      if(bad===box)box.querySelector('input').focus();return}
    const v=n=>f.elements[n].value.trim();
    const subject=`${topics()[0]} · ${v('company')}`;
    const body=[`Name: ${v('first')} ${v('last')}`,`Email: ${v('email')}`,`Company: ${v('company')}`,
      `Company size: ${v('size')}`,`Job title: ${v('role')}`,`Interested in: ${topics().join(', ')}`,'',v('message')].join('\n');
    location.href=`mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    f.outerHTML=`<div class="cform-done" role="status"><h2>Your message is ready to send</h2>
      <p>Your email client should have opened with everything filled in. If it didn't, write to
      <a class="ext" href="mailto:${TO}">${TO}</a> and we'll pick it up from there.</p></div>`;
  });
})();