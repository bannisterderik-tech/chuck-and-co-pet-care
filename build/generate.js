// Run via run_script: concatenates content.js + this file. Writes site/**.
const YEAR = 2026;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const H = Object.fromEntries(HOODS.map(h=>[h.slug,h]));
const S = Object.fromEntries(SERVICES.map(s=>[s.slug,s]));
const seed = str => [...str].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const pick = (arr,k,n=1) => { const out=[]; for(let i=0;i<n;i++) out.push(arr[(k+i*3)%arr.length]); return n===1?out[0]:out; };
const pages = [];

const P = { home:'index.html', about:'about.html', services:'services.html', hoods:'neighborhoods.html', guides:'guides.html', faq:'faq.html', book:'book.html', thanks:'thank-you.html', privacy:'privacy.html', map:'sitemap.html', chuck:'in-memory-of-chuck.html',
  svc:s=>`services/${s}.html`, hood:h=>`eugene/${h}/index.html`, combo:(h,s)=>`eugene/${h}/${s}.html`, guide:g=>`guides/${g}.html` };
const clean = p => '/' + p.replace(/index\.html$/,'').replace(/\.html$/,'');

const ORG = {'@type':'LocalBusiness','@id':SITE+'/#business',name:BRAND,url:SITE+'/',description:'Locally owned dog walking and pet sitting in Eugene, Oregon.',
  address:{'@type':'PostalAddress',addressLocality:'Eugene',addressRegion:'OR',addressCountry:'US'},areaServed:{'@type':'City',name:'Eugene, Oregon'},priceRange:'$$'};
const faqLd = faqs => ({'@type':'FAQPage',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
const crumbLd = c => ({'@type':'BreadcrumbList',itemListElement:c.map(([n,p],i)=>({'@type':'ListItem',position:i+1,name:n,item:SITE+clean(p)}))});

// Mobile floating tab bar (phones only). Center button books; it jumps to the page's own form when there is one.
const TB_IC = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  services:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 11c-3 0-6 4.5-6 7.2 0 1.7 1.3 2.8 3 2.8 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.7 0 3-1.1 3-2.8C18 15.5 15 11 12 11Z"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/></svg>',
  areas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  guides:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h6a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H4Z"/><path d="M20 4.5h-6a2 2 0 0 0-2 2V20a1.5 1.5 0 0 1 1.5-1.5H20Z"/></svg>'};
function tabbar(L,path){
  const sec = path===P.home?'home':path===P.book?'book':path===P.services||path.startsWith('services/')?'services':path===P.hoods||path.startsWith('eugene/')?'areas':path===P.guides||path.startsWith('guides/')?'guides':'';
  const hasForm = ![P.faq,P.thanks,P.privacy,P.map,P.chuck].includes(path);
  const item = (k,href,label,mid=false) => `<a class="tb${mid?' tb-mid':''}${sec===k?' on':''}" href="${href}"${sec===k?' aria-current="page"':''}><span class="tb-ic">${TB_IC[k]}</span><span class="tb-l">${label}</span></a>`;
  return `<nav class="tabbar" aria-label="Quick navigation">${item('home',L(P.home),'Home')}${item('services',L(P.services),'Services')}${item('book',hasForm&&path!==P.book?'#book':L(P.book),'Book',true)}${item('areas',L(P.hoods),'Areas')}${item('guides',L(P.guides),'Guides')}</nav>`;
}

function layout({path,title,desc,body,ld=[],noindex=false,crumbs}){
  const r = '../'.repeat(path.split('/').length-1);
  const L = p => r+p;
  const graph = {'@context':'https://schema.org','@graph':[ORG,...ld,...(crumbs?[crumbLd(crumbs)]:[])]};
  const crumbHtml = crumbs ? `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${crumbs.map(([n,p],i)=>i===crumbs.length-1?`<li aria-current="page">${esc(n)}</li>`:`<li><a href="${L(p)}">${esc(n)}</a></li>`).join('')}</ol></nav>` : '';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${clean(path)}">${noindex?'<meta name="robots" content="noindex">':''}
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${clean(path)}"><meta property="og:site_name" content="${esc(BRAND)}"><meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="US-OR"><meta name="geo.placename" content="Eugene">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${L('assets/style.css')}">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="site"><div class="wrap nav">
<a class="brand" href="${L(P.home)}" aria-label="${esc(BRAND)} home"><span class="brand-mark">C&amp;Co</span><span>Chuck &amp; Co.<small>Pet Care · Eugene</small></span></a>
<button class="menu-toggle" aria-expanded="false" aria-controls="menu">Menu</button>
<ul class="menu" id="menu">
<li><a href="${L(P.services)}">Services</a></li><li><a href="${L(P.hoods)}">Neighborhoods</a></li><li><a href="${L(P.guides)}">Guides</a></li><li><a href="${L(P.about)}">About</a></li><li><a href="${L(P.faq)}">FAQ</a></li>
<li><a class="btn btn-primary btn-sm" href="${L(P.book)}">Book a meet &amp; greet</a></li></ul>
</div></header>
${crumbHtml}
<main id="main">
${body(L)}
</main>
<footer class="site"><div class="wrap">
<div class="fgrid">
<div><a class="brand" href="${L(P.home)}"><span class="brand-mark">C&amp;Co</span><span>Chuck &amp; Co.<small>Pet Care · Eugene</small></span></a>
<p style="margin-top:18px;max-width:34ch">Locally owned dog walking and pet sitting for Eugene, Oregon. Rain or shine, one familiar face.</p>
<a class="btn btn-light btn-sm" href="${L(P.book)}">Request a meet &amp; greet</a></div>
<div><h4>Services</h4><ul>${SERVICES.map(s=>`<li><a href="${L(P.svc(s.slug))}">${esc(s.name)}</a></li>`).join('')}</ul></div>
<div><h4>Neighborhoods</h4><ul>${HOODS.slice(0,8).map(h=>`<li><a href="${L(P.hood(h.slug))}">${esc(h.name)}</a></li>`).join('')}<li><a href="${L(P.hoods)}">All neighborhoods →</a></li></ul></div>
<div><h4>Guides</h4><ul>${GUIDES.slice(0,6).map(g=>`<li><a href="${L(P.guide(g.slug))}">${esc(g.title.split(':')[0])}</a></li>`).join('')}<li><a href="${L(P.guides)}">All guides →</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="${L(P.about)}">About</a></li><li><a href="${L(P.chuck)}">Chuck’s story</a></li><li><a href="${L(P.faq)}">FAQ</a></li><li><a href="${L(P.book)}">Book</a></li><li><a href="${L(P.map)}">Sitemap</a></li><li><a href="${L(P.privacy)}">Privacy</a></li></ul></div>
</div>
<div class="legal"><span>© ${YEAR} ${esc(BRAND)} · Eugene, Oregon</span><span>Serving Eugene ZIP codes 97401, 97402, 97403, 97404, 97405 and 97408</span></div>
</div></footer>
${tabbar(L,path)}
<script src="${L('assets/site.js')}"></script>
</body></html>`;
  pages.push({path,title,noindex,html});
}

function form(L,{service='',hood='',heading='Request a free meet & greet',sub='Tell us about your dog and what you need. We reply within one business day.'}={}){
  const opt=(v,sel)=>`<option${v===sel?' selected':''}>${esc(v)}</option>`;
  return `<div class="lead" id="book">
<div><span class="eyebrow">Get started</span><h2>${esc(heading)}</h2><p>${esc(sub)}</p>
<ul class="check"><li>Free, no-obligation meet &amp; greet</li><li>Locally owned in Eugene</li><li>Photo updates after every visit</li></ul></div>
<form class="lead-form" data-thanks="${L(P.thanks)}" novalidate>
<input type="hidden" name="Page" value=""><input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="field"><label for="f-name">Your name</label><input id="f-name" name="Name" autocomplete="name" required></div>
<div class="field"><label for="f-email">Email</label><input id="f-email" type="email" name="Email" autocomplete="email" required></div>
<div class="field"><label for="f-phone">Phone</label><input id="f-phone" type="tel" name="Phone" autocomplete="tel" required></div>
<div class="field"><label for="f-dog">Dog’s name &amp; breed</label><input id="f-dog" name="Dog" placeholder="Biscuit, Lab mix"></div>
<div class="field"><label for="f-svc">Service</label><select id="f-svc" name="Service" required><option value="">Choose a service</option>${SERVICES.map(s=>opt(s.name,service)).join('')}<option>Not sure yet</option></select></div>
<div class="field"><label for="f-hood">Neighborhood / ZIP</label><select id="f-hood" name="Neighborhood"><option value="">Choose your area</option>${HOODS.map(h=>`<option${h.name===hood?' selected':''}>${esc(h.name)} (${h.zip})</option>`).join('')}<option>Other Eugene area</option></select></div>
<div class="field"><label for="f-start">Start date</label><input id="f-start" type="date" name="Start date"></div>
<div class="field"><label for="f-end">End date (if a trip)</label><input id="f-end" type="date" name="End date"></div>
<div class="field full"><label for="f-notes">Notes</label><textarea id="f-notes" name="Notes" placeholder="Schedule, temperament, medications, anything we should know"></textarea></div>
<p class="form-status" role="status" aria-live="polite"></p>
<div class="form-foot"><p class="form-note">We only use your details to reply to this request.</p><button class="btn btn-primary" type="submit">Request a meet &amp; greet</button></div>
</form></div>`;
}
const faqHtml = faqs => `<div class="faq">${faqs.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const list = items => `<ul class="check">${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`;
const svcCards = (L,href,hoodName) => `<div class="grid g3">${SERVICES.map((s,i)=>`<a class="card has-img" href="${L(href(s.slug))}">${img(L,s.slug,SVC_ALT[s.slug],'card-img')}<span class="num">0${i+1}</span><h3>${esc(s.name)}${hoodName?` <span style="font-weight:600;color:var(--muted)">in ${esc(hoodName)}</span>`:''}</h3><p>${esc(s.short)}</p><span class="more">Learn more →</span></a>`).join('')}</div>`;
const hoodChips = (L,slugs,href) => `<ul class="chips">${slugs.map(h=>`<li><a class="chip" href="${L(href(h))}">${esc(H[h].name)} <small>${H[h].zip}</small></a></li>`).join('')}</ul>`;
// Stock photography (Unsplash License), stored in assets/img.
const SVC_ALT = {'dog-walking':'Golden retriever on a leash walk along a sidewalk','drop-in-visits':'Dog waiting at the front door of a house','overnight-pet-sitting':'Dog resting in its own bed at home','puppy-visits':'Curly-coated puppy on a leash in the grass','pet-taxi':'Spaniel looking out a car window on a ride','adventure-hikes':'Hiker and dog on a forest trail'};
const GUIDE_IMG = {'off-leash-dog-areas-eugene':'g-trail','dog-friendly-hikes-near-eugene':'g-river','eugene-dog-licensing-and-leash-rules':'g-path','walking-your-dog-in-eugene-rain':'g-rain','wildfire-smoke-and-dogs':'g-home','summer-heat-safety-for-dogs':'g-river','foxtails-and-grass-seeds':'g-puppy','ticks-and-dogs-willamette-valley':'adventure-hikes','what-to-expect-meet-and-greet':'meet','preparing-for-an-overnight-pet-sitter':'overnight-pet-sitting','puppy-potty-break-schedule':'puppy-visits','how-often-should-you-walk-your-dog':'dog-walking','questions-to-ask-a-dog-walker':'g-path','separation-anxiety-in-dogs':'g-home','fireworks-and-noise-anxiety':'overnight-pet-sitting','holiday-pet-sitting-eugene':'drop-in-visits'};
const GUIDE_ALT = {'g-trail':'Woman walking a golden retriever on a tree-lined path','g-river':'Hiker and dog beside a forested river','g-path':'Person walking a dog on a park path','g-rain':'Dog in a rain jacket on a wet street','g-home':'Beagle relaxing on the couch at home','g-puppy':'Spaniel bounding through grass with a ball','meet':'Two people on a couch meeting their dogs','overnight-pet-sitting':'Dog resting in its own bed at home','puppy-visits':'Curly-coated puppy on a leash in the grass','dog-walking':'Golden retriever on a leash walk','adventure-hikes':'Hiker and dog on a forest trail','drop-in-visits':'Dog waiting at the front door of a house'};
const img = (L,name,alt,cls='',eager=false) => `<img class="${cls}" src="${L('assets/img/'+name+'.jpg')}" alt="${esc(alt)}" width="1200" height="800"${eager?' fetchpriority="high"':' loading="lazy"'} decoding="async">`;
const ph = (L,name,label,cls='',eager=false) => `<figure class="ph photo ${cls}">${img(L,name,label,'',eager)}</figure>`;
const team = L => `<div class="team">${CAREGIVERS.map(c=>`<article class="team-card"><figure><img src="${L('assets/img/team/'+c.photo)}" alt="${esc(c.alt)}" loading="lazy" decoding="async"></figure><div class="team-body"><span class="eyebrow">${esc(c.role)}</span><h3>${esc(c.name)}</h3>${c.bio.map(p=>`<p>${esc(p)}</p>`).join('')}${c.link?`<a class="more" href="${L(P.chuck)}">Read Chuck’s story →</a>`:''}</div></article>`).join('')}</div>`;
const storyPara = p => p.startsWith('>') ? `<blockquote class="pull">${esc(p.slice(1))}</blockquote>` : `<p>${esc(p)}</p>`;
const STEPS = `<div class="steps"><div class="step"><h3>Request</h3><p>Tell us about your dog and schedule using the form. We reply within one business day.</p></div><div class="step"><h3>Meet &amp; greet</h3><p>A free visit in your home to meet your dog, learn the routine and set up keys.</p></div><div class="step"><h3>Ongoing care</h3><p>The same familiar face, plus a photo and note after every visit.</p></div></div>`;

// HOME
layout({path:P.home,title:`Dog Walking & Pet Sitting in Eugene, OR | ${BRAND}`,desc:'Locally owned dog walking, drop-in visits, overnight pet sitting, puppy visits, pet taxi and adventure hikes in Eugene, Oregon. Book a free meet & greet.',ld:[faqLd(SITE_FAQS.slice(0,6))],body:L=>`
<section class="hero"><div class="wrap hero-grid"><div>
<span class="eyebrow">Eugene, Oregon · Locally owned</span>
<h1>Dog walking &amp; pet sitting for <em>Eugene</em> dogs.</h1>
<p class="lede">Chuck &amp; Co. Pet Care gives your dog a familiar face, a real walk and a routine that holds up to Eugene weather. Walks, drop-ins, overnights, puppy care, rides and trail days.</p>
<div class="actions"><a class="btn btn-primary" href="${L(P.book)}">Book a free meet &amp; greet</a><a class="btn btn-ghost" href="${L(P.services)}">See services</a></div>
<ul class="facts"><li>Locally owned</li><li>Rain or shine</li><li>Photo updates every visit</li></ul>
</div><div class="hero-art">${ph(L,'g-trail','Woman walking a golden retriever on a tree-lined path','',true)}</div></div></section>
<section class="section tint"><div class="wrap"><div class="head-row"><div class="head"><span class="eyebrow">Services</span><h2>Care that fits your dog’s day</h2><p>Six services, one standard: reliable, attentive and local.</p></div><a class="btn btn-ghost btn-sm" href="${L(P.services)}">All services</a></div>${svcCards(L,P.svc)}</div></section>
<section class="section"><div class="wrap split"><div>${ph(L,'meet','Meet & greet with dogs on the couch at home','wide')}</div><div><span class="eyebrow">How it works</span><h2>Simple to start. Easy to keep.</h2><p class="lede" style="margin-bottom:32px">No apps to learn and no strangers at the door. Just a local team that gets to know your dog.</p>${STEPS.replace('class="steps"','class="steps" style="grid-template-columns:1fr"')}</div></div></section>
<section class="section tint"><div class="wrap split"><div><figure class="ph photo memorial-photo"><img src="${L('assets/img/chuck/chuck-graduation.jpg')}" style="object-position:30% 12%" alt="McKenna in her graduation cap and gown holding Chuck’s paw" loading="lazy" decoding="async"></figure></div><div><span class="eyebrow">Our story</span><h2>Named for Chuck.</h2><p class="lede">Chuck &amp; Co. is run by co-founders McKenna and Nora, and named for Chuck Norris, McKenna’s best friend and the runt of the litter who turned out to have the biggest place in her heart.</p><blockquote class="pull small">Through this business, I hope to give other dogs the same love and care I gave Chuck.<cite>McKenna, co-founder</cite></blockquote><div class="actions"><a class="btn btn-primary" href="${L(P.chuck)}">Read Chuck’s story</a><a class="btn btn-ghost" href="${L(P.about)}#team">Meet McKenna &amp; Nora</a></div></div></div></section>
<section class="section dark"><div class="wrap"><div class="head"><span class="eyebrow">Why Chuck &amp; Co.</span><h2>The details that make care feel easy</h2></div><div class="grid g3">${WHY.map(([t,d])=>`<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap"><div class="head-row"><div class="head"><span class="eyebrow">Neighborhoods</span><h2>Across Eugene, block by block</h2><p>From Santa Clara to Fox Hollow, find care in your neighborhood.</p></div><a class="btn btn-ghost btn-sm" href="${L(P.hoods)}">All neighborhoods</a></div>${hoodChips(L,HOODS.map(h=>h.slug),P.hood)}</div></section>
<section class="section tint"><div class="wrap"><div class="head-row"><div class="head"><span class="eyebrow">Local guides</span><h2>Answers for Eugene dog owners</h2></div><a class="btn btn-ghost btn-sm" href="${L(P.guides)}">All guides</a></div><div class="grid g3">${GUIDES.slice(0,3).map(g=>`<a class="card" href="${L(P.guide(g.slug))}"><h3>${esc(g.title)}</h3><p>${esc(g.desc)}</p><span class="more">Read guide →</span></a>`).join('')}</div></div></section>
<section class="section"><div class="wrap two"><div><span class="eyebrow">FAQ</span><h2>Common questions</h2>${faqHtml(SITE_FAQS.slice(0,6))}<p style="margin-top:24px"><a href="${L(P.faq)}">More questions →</a></p></div><aside class="sticky"><div class="side-card"><h3>Ready when you are</h3><p>Start with a free meet &amp; greet. No obligation.</p><a class="btn btn-light" href="${L(P.book)}">Book now</a></div></aside></div></section>
<section class="section tight"><div class="wrap">${form(L)}</div></section>`});

// ABOUT
layout({path:P.about,title:`About Us: Meet McKenna & Nora | ${BRAND}, Eugene OR`,desc:'Chuck & Co. Pet Care is a locally owned dog walking and pet sitting business in Eugene, Oregon, founded by McKenna and Nora and named for McKenna’s dog, Chuck Norris.',crumbs:[['Home',P.home],['About',P.about]],
ld:[{'@type':'AboutPage',name:'About Chuck & Co. Pet Care',about:{'@id':SITE+'/#business'}}],body:L=>`
<section class="page-hero"><div class="wrap page-hero-grid"><div><span class="eyebrow">About</span><h1>The story behind Chuck &amp; Co.</h1><p class="lede">Chuck &amp; Co. Pet Care is locally owned in Eugene and run by co-founders McKenna and Nora. It is named for Chuck Norris, McKenna’s best friend, and built on the love he taught her.</p><div class="actions"><a class="btn btn-primary" href="${L(P.chuck)}">Read Chuck’s story</a><a class="btn btn-ghost" href="#team">Meet your caregivers</a></div></div><figure class="ph photo sq"><img src="${L('assets/img/chuck/chuck-stairs.jpg')}" alt="McKenna laughing on the stairs as Chuck gives her a kiss" fetchpriority="high" decoding="async"></figure></div></section>
<section class="section" id="team"><div class="wrap"><div class="head"><span class="eyebrow">Meet your caregivers</span><h2>The people who’ll care for your dog</h2><p>Chuck &amp; Co. is run by its two co-founders, McKenna and Nora.</p></div>${team(L)}</div></section>
<section class="section dark"><div class="wrap memorial-band"><span class="eyebrow">In loving memory 🐾❤️</span><h2>This business is for you, Chuck.</h2><p>${esc(CHUCK.paras[0])}</p><a class="btn btn-light" href="${L(P.chuck)}">Read Chuck’s story</a></div></section>
<section class="section"><div class="wrap"><div class="head"><span class="eyebrow">What we believe</span><h2>Our standards</h2></div><div class="grid g3">${WHY.map(([t,d])=>`<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div></section>
<section class="section tint"><div class="wrap"><div class="head"><span class="eyebrow">How it works</span><h2>Getting started</h2></div>${STEPS}</div></section>
<section class="section tight"><div class="wrap">${form(L)}</div></section>`});

// IN MEMORY OF CHUCK
layout({path:P.chuck,title:`In Loving Memory of Chuck Norris | ${BRAND}`,desc:'The story of Chuck Norris, the runt of the litter who inspired Chuck & Co. Pet Care in Eugene, Oregon, told by co-founder McKenna.',crumbs:[['Home',P.home],['About',P.about],['In memory of Chuck',P.chuck]],
ld:[{'@type':'Article',headline:'In Loving Memory of Chuck Norris',description:'The story behind Chuck & Co. Pet Care.',author:{'@type':'Person',name:'McKenna'},publisher:{'@id':SITE+'/#business'},datePublished:'2026-10-08'}],body:L=>`
<section class="memorial-hero"><div class="wrap memorial-grid"><div><span class="eyebrow">In loving memory 🐾❤️</span><h1>Chuck Norris</h1><p class="lede">The runt of Luna’s litter, McKenna’s best friend, and the reason Chuck &amp; Co. exists. His story, in her words.</p></div><figure class="ph photo memorial-photo"><img src="${L('assets/img/chuck/'+CHUCK.photos[0].src)}" alt="${esc(CHUCK.photos[0].alt)}" fetchpriority="high" decoding="async"></figure></div></section>
<section class="section"><div class="wrap"><article class="prose story"><h2>The story behind my business</h2>${CHUCK.paras.slice(0,4).map(storyPara).join('')}</article>
${CHUCK.photos.length?`<div class="gallery" aria-label="Photos of Chuck">${CHUCK.photos.map(p=>`<figure><img src="${L('assets/img/chuck/'+p.src)}"${p.pos?` style="object-position:${p.pos}"`:''} alt="${esc(p.alt)}" loading="lazy" decoding="async">${p.caption?`<figcaption>${esc(p.caption)}</figcaption>`:''}</figure>`).join('')}</div>`:''}
<article class="prose story">${CHUCK.paras.slice(4).map(storyPara).join('')}<p class="sig">— McKenna, co-founder</p></article></div></section>
<section class="section dark"><div class="wrap closing"><p>${CHUCK.closing.map(esc).join('<br>')}</p><span>In loving memory of Chuck Norris. 🐾❤️</span></div></section>
<section class="section"><div class="wrap" style="text-align:center;max-width:680px"><h2>Every walk is for Chuck</h2><p class="lede" style="margin:0 auto 28px">We’d love to meet your dog.</p><div class="actions" style="justify-content:center"><a class="btn btn-primary" href="${L(P.book)}">Book a free meet &amp; greet</a><a class="btn btn-ghost" href="${L(P.about)}#team">Meet McKenna &amp; Nora</a></div></div></section>`});

// SERVICES HUB
layout({path:P.services,title:`Dog Walking & Pet Sitting Services in Eugene | ${BRAND}`,desc:'Dog walking, drop-in visits, overnight pet sitting, puppy visits, pet taxi and adventure hikes in Eugene, Oregon.',crumbs:[['Home',P.home],['Services',P.services]],ld:[{'@type':'ItemList',itemListElement:SERVICES.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:SITE+clean(P.svc(s.slug))}))}],body:L=>`
<section class="page-hero"><div class="wrap"><div style="max-width:760px;margin-top:28px"><span class="eyebrow">Services</span><h1>Pet care services in Eugene, Oregon</h1><p class="lede">Every service starts with a free meet &amp; greet and includes photo updates after each visit.</p></div></div></section>
<section class="section"><div class="wrap">${svcCards(L,P.svc)}</div></section>
<section class="section tint"><div class="wrap"><div class="head"><span class="eyebrow">How it works</span><h2>From request to routine</h2></div>${STEPS}</div></section>
<section class="section tight"><div class="wrap">${form(L)}</div></section>`});

// SERVICE PAGES
SERVICES.forEach(s=>{
  layout({path:P.svc(s.slug),title:`${s.name} in Eugene, OR | ${BRAND}`,desc:`${s.short} Locally owned ${s.lower} in Eugene, Oregon. Free meet & greet.`,crumbs:[['Home',P.home],['Services',P.services],[s.name,P.svc(s.slug)]],
  ld:[{'@type':'Service',name:`${s.name} in Eugene, OR`,serviceType:s.name,description:s.desc,provider:{'@id':SITE+'/#business'},areaServed:{'@type':'City',name:'Eugene, Oregon'}},faqLd(s.faqs)],body:L=>`
<section class="page-hero"><div class="wrap page-hero-grid"><div><span class="eyebrow">Service · Eugene, OR</span><h1>${esc(s.name)} in Eugene</h1><p class="lede">${esc(s.desc)}</p></div>
<div class="glance"><h2>At a glance</h2><dl><dt>Length</dt><dd>${esc(s.duration)}</dd><dt>Area</dt><dd>All Eugene neighborhoods</dd><dt>Updates</dt><dd>Photo + note every visit</dd><dt>Start</dt><dd>Free meet &amp; greet</dd></dl><a class="btn btn-primary" href="#book">Request ${esc(s.lower)}</a></div></div></section>
<section class="section"><div class="wrap two"><div class="prose"><figure class="photo-inline">${img(L,s.slug,SVC_ALT[s.slug])}</figure><h2>What’s included</h2>${list(s.includes)}<h2>A great fit for</h2>${list(s.ideal)}<h2>Questions about ${esc(s.lower)}</h2>${faqHtml(s.faqs)}</div>
<aside class="sticky"><div class="side-list"><h3>Other services</h3><ul>${SERVICES.filter(x=>x!==s).map(x=>`<li><a href="${L(P.svc(x.slug))}">${esc(x.name)}</a></li>`).join('')}</ul></div><div class="side-card"><h3>Start with a meet &amp; greet</h3><p>Free, in your home, no obligation.</p><a class="btn btn-light" href="#book">Book now</a></div></aside></div></section>
<section class="section tint"><div class="wrap"><div class="head"><span class="eyebrow">Near you</span><h2>${esc(s.name)} by neighborhood</h2><p>Local details for every corner of Eugene.</p></div>${hoodChips(L,HOODS.map(h=>h.slug),h=>P.combo(h,s.slug))}</div></section>
<section class="section tight"><div class="wrap">${form(L,{service:s.name,heading:`Request ${s.lower}`})}</div></section>`});
});

// NEIGHBORHOODS HUB
layout({path:P.hoods,title:`Eugene Neighborhoods We Serve | ${BRAND}`,desc:'Dog walking and pet sitting across 24 Eugene, Oregon neighborhoods and ZIP codes 97401–97405 and 97408.',crumbs:[['Home',P.home],['Neighborhoods',P.hoods]],body:L=>`
<section class="page-hero"><div class="wrap"><div style="max-width:760px;margin-top:28px"><span class="eyebrow">Service area</span><h1>Every corner of Eugene</h1><p class="lede">We serve ${HOODS.length} Eugene neighborhoods. Find yours for local routes, parks and services.</p></div></div></section>
<section class="section"><div class="wrap"><div class="grid g4">${HOODS.map(h=>`<a class="card" href="${L(P.hood(h.slug))}"><span class="num">${h.zip}</span><h3>${esc(h.name)}</h3><p>${esc(h.vibe)}</p><span class="more">View area →</span></a>`).join('')}</div></div></section>
<section class="section tint"><div class="wrap"><div class="head"><span class="eyebrow">By ZIP code</span><h2>ZIP codes we cover</h2></div><table class="zip-table"><thead><tr><th>ZIP</th><th>Neighborhoods</th></tr></thead><tbody>${[...new Set(HOODS.map(h=>h.zip))].sort().map(z=>`<tr><td><strong>${z}</strong></td><td>${HOODS.filter(h=>h.zip===z).map(h=>`<a href="${L(P.hood(h.slug))}">${esc(h.name)}</a>`).join(', ')}</td></tr>`).join('')}<tr><td><strong>97408</strong></td><td>North Eugene areas near <a href="${L(P.hood('willakenzie'))}">Willakenzie</a> and <a href="${L(P.hood('cal-young'))}">Cal Young</a></td></tr></tbody></table></div></section>
<section class="section tight"><div class="wrap">${form(L)}</div></section>`});

// NEIGHBORHOOD + COMBO PAGES
HOODS.forEach(n=>{
  const near = n.nearby.split(',');
  const nf = [[`Do you serve ${n.name}?`,`Yes. ${n.name} (${n.zip}) is part of our regular Eugene service area for all six services.`],
    [`Where do you walk dogs in ${n.name}?`,`Common choices include ${n.parks.join(' and ')}. ${n.routes}`],
    [`Anything special about pet care in ${n.name}?`,n.notes]];
  layout({path:P.hood(n.slug),title:`Dog Walking & Pet Sitting in ${n.name}, Eugene OR | ${BRAND}`,desc:`Locally owned dog walking, drop-ins and overnight pet sitting in ${n.name}, Eugene (${n.zip}). Walks near ${n.parks[0]}. Free meet & greet.`,
  crumbs:[['Home',P.home],['Neighborhoods',P.hoods],[n.name,P.hood(n.slug)]],ld:[{'@type':'Place',name:`${n.name}, Eugene, Oregon`,address:{'@type':'PostalAddress',addressLocality:'Eugene',addressRegion:'OR',postalCode:n.zip}},faqLd(nf)],body:L=>`
<section class="page-hero"><div class="wrap page-hero-grid"><div><span class="eyebrow">${esc(n.name)} · Eugene, OR ${n.zip}</span><h1>Dog walking &amp; pet sitting in ${esc(n.name)}</h1><p class="lede">${esc(n.vibe)} Chuck &amp; Co. helps ${esc(n.name)} dogs stay active, settled and cared for while you are busy or away.</p></div>
<div class="glance"><h2>${esc(n.name)} at a glance</h2><dl><dt>ZIP</dt><dd>${n.zip}</dd><dt>Favorite spots</dt><dd>${esc(n.parks.join(', '))}</dd><dt>Trail days</dt><dd>${esc(n.trail)}</dd><dt>Start</dt><dd>Free meet &amp; greet</dd></dl><a class="btn btn-primary" href="#book">Book in ${esc(n.name)}</a></div></div></section>
<section class="section"><div class="wrap two"><div class="prose">${(h=>`<figure class="photo-inline">${img(L,h,GUIDE_ALT[h])}</figure>`)(["g-trail","g-path","dog-walking","g-river"][seed(n.slug)%4])}<h2>Walking dogs in ${esc(n.name)}</h2><p>${esc(n.routes)} ${esc(n.notes)}</p><p>Whether your dog needs a midday walk, a puppy break or company overnight, we tailor every visit to your dog and your block.</p><h2>Questions from ${esc(n.name)} neighbors</h2>${faqHtml(nf)}</div>
<aside class="sticky"><div class="side-list"><h3>Nearby neighborhoods</h3><ul>${near.map(h=>`<li><a href="${L(P.hood(h))}">${esc(H[h].name)}</a></li>`).join('')}</ul></div></aside></div></section>
<section class="section tint"><div class="wrap"><div class="head"><span class="eyebrow">Services in ${esc(n.name)}</span><h2>Choose your care</h2></div>${svcCards(L,s=>P.combo(n.slug,s),n.name)}</div></section>
<section class="section tight"><div class="wrap">${form(L,{hood:n.name,heading:`Request care in ${n.name}`})}</div></section>`});

  SERVICES.forEach(s=>{
    const k = seed(n.slug+s.slug);
    const why = pick(WHY,k,3);
    const intro = pick([
      `Looking for ${s.lower} in ${n.name}? ${s.short} ${n.vibe}`,
      `${s.short} We bring the same care to ${n.name} that Eugene families count on. ${n.vibe}`,
      `${n.vibe} Our ${s.lower} gives ${n.name} dogs reliable, local care. ${s.short}`
    ],k);
    const lf = [[`Do you offer ${s.lower} in ${n.name} (${n.zip})?`,`Yes. ${s.name} is available throughout ${n.name} and nearby ${near.slice(0,2).map(h=>H[h].name).join(' and ')}.`],
      [`Where do you ${s.verb} with dogs in ${n.name}?`,s.local(n)], ...s.faqs.slice(0,2)];
    layout({path:P.combo(n.slug,s.slug),title:`${s.name} in ${n.name}, Eugene OR | ${BRAND}`,desc:`${s.name} in ${n.name}, Eugene (${n.zip}). ${s.short} Locally owned. Free meet & greet.`,
    crumbs:[['Home',P.home],['Neighborhoods',P.hoods],[n.name,P.hood(n.slug)],[s.name,P.combo(n.slug,s.slug)]],
    ld:[{'@type':'Service',name:`${s.name} in ${n.name}, Eugene`,serviceType:s.name,description:s.desc,provider:{'@id':SITE+'/#business'},areaServed:{'@type':'Place',name:`${n.name}, Eugene, OR ${n.zip}`}},faqLd(lf)],body:L=>`
<section class="page-hero"><div class="wrap page-hero-grid"><div><span class="eyebrow">${esc(n.name)} · Eugene, OR ${n.zip}</span><h1>${esc(s.name)} in ${esc(n.name)}</h1><p class="lede">${esc(intro)}</p></div>
<div class="glance"><h2>At a glance</h2><dl><dt>Service</dt><dd>${esc(s.name)}</dd><dt>Length</dt><dd>${esc(s.duration)}</dd><dt>Area</dt><dd>${esc(n.name)}, ${n.zip}</dd><dt>Start</dt><dd>Free meet &amp; greet</dd></dl><a class="btn btn-primary" href="#book">Request ${esc(s.lower)}</a></div></div></section>
<section class="section"><div class="wrap two"><div class="prose">
<figure class="photo-inline">${img(L,s.slug,SVC_ALT[s.slug])}</figure>
<h2>${esc(s.name)} in ${esc(n.name)}: what to expect</h2><p>${esc(s.desc)}</p><p>${esc(s.local(n))}</p>
<h2>What’s included</h2>${list(s.includes)}
<h2>A great fit for ${esc(n.name)} homes with</h2>${list(pick(s.ideal,k,3).filter((v,i,a)=>a.indexOf(v)===i))}
<h2>${esc(s.name)} FAQ for ${esc(n.name)}</h2>${faqHtml(lf)}</div>
<aside class="sticky"><div class="side-list"><h3>More in ${esc(n.name)}</h3><ul>${SERVICES.filter(x=>x!==s).map(x=>`<li><a href="${L(P.combo(n.slug,x.slug))}">${esc(x.name)}</a></li>`).join('')}<li><a href="${L(P.hood(n.slug))}">${esc(n.name)} overview</a></li></ul></div>
<div class="side-list"><h3>${esc(s.name)} nearby</h3><ul>${near.map(h=>`<li><a href="${L(P.combo(h,s.slug))}">${esc(s.name)} in ${esc(H[h].name)}</a></li>`).join('')}<li><a href="${L(P.svc(s.slug))}">${esc(s.name)} in Eugene</a></li></ul></div></aside></div></section>
<section class="section dark"><div class="wrap"><div class="head"><span class="eyebrow">Why ${esc(n.name)} chooses us</span><h2>Local, consistent, easy</h2></div><div class="grid g3">${why.map(([t,d])=>`<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div></section>
<section class="section tight"><div class="wrap">${form(L,{service:s.name,hood:n.name,heading:`Request ${s.lower} in ${n.name}`})}</div></section>`});
  });
});

// GUIDES
layout({path:P.guides,title:`Eugene Dog Owner Guides | ${BRAND}`,desc:'Local guides for Eugene, Oregon dog owners: trails, off-leash areas, rain, smoke, heat, puppies and more.',crumbs:[['Home',P.home],['Guides',P.guides]],body:L=>`
<section class="page-hero"><div class="wrap"><div style="max-width:760px;margin-top:28px"><span class="eyebrow">Guides</span><h1>Guides for Eugene dog owners</h1><p class="lede">Straight answers on local trails, seasons, safety and care.</p></div></div></section>
<section class="section"><div class="wrap"><div class="grid g3">${GUIDES.map(g=>`<a class="card" href="${L(P.guide(g.slug))}"><h3>${esc(g.title)}</h3><p>${esc(g.desc)}</p><span class="more">Read guide →</span></a>`).join('')}</div></div></section>
<section class="section tight"><div class="wrap">${form(L)}</div></section>`});
GUIDES.forEach((g,gi)=>{
  const rel = [1,2,3].map(o=>GUIDES[(gi+o)%GUIDES.length]);
  layout({path:P.guide(g.slug),title:`${g.title} | ${BRAND}`,desc:g.desc,crumbs:[['Home',P.home],['Guides',P.guides],[g.title.split(':')[0],P.guide(g.slug)]],
  ld:[{'@type':'Article',headline:g.title,description:g.desc,author:{'@id':SITE+'/#business'},publisher:{'@id':SITE+'/#business'},datePublished:'2026-10-08',dateModified:'2026-10-08',about:'Dog care in Eugene, Oregon'},faqLd(g.faqs)],body:L=>`
<section class="page-hero"><div class="wrap"><div style="max-width:820px;margin-top:28px"><span class="eyebrow">Guide · Eugene, OR</span><h1>${esc(g.title)}</h1><p class="lede">${esc(g.desc)}</p></div></div></section>
<section class="section"><div class="wrap two"><article class="prose"><figure class="photo-inline">${img(L,GUIDE_IMG[g.slug]||'g-path',GUIDE_ALT[GUIDE_IMG[g.slug]||'g-path'])}</figure><div class="answer"><strong class="k">Short answer</strong><p>${esc(g.answer)}</p></div>
${g.sections.map(([h,ps,li])=>`<h2>${esc(h)}</h2>${ps.map(p=>`<p>${esc(p)}</p>`).join('')}${li?list(li):''}`).join('')}
<h2>FAQ</h2>${faqHtml(g.faqs)}<p style="margin-top:28px;font-size:.88rem;color:var(--muted)">General information for Eugene dog owners, not veterinary or legal advice. Always check with your vet and official sources.</p></article>
<aside class="sticky"><div class="side-card"><h3>Need a hand?</h3><p>Local walks, drop-ins and overnight care across Eugene.</p><a class="btn btn-light" href="#book">Book a meet &amp; greet</a></div><div class="side-list"><h3>Related guides</h3><ul>${rel.map(r=>`<li><a href="${L(P.guide(r.slug))}">${esc(r.title)}</a></li>`).join('')}</ul></div><div class="side-list"><h3>Services</h3><ul>${SERVICES.map(s=>`<li><a href="${L(P.svc(s.slug))}">${esc(s.name)}</a></li>`).join('')}</ul></div></aside></div></section>
<section class="section tight"><div class="wrap">${form(L)}</div></section>`});
});

// FAQ, BOOK, THANKS, PRIVACY, SITEMAP
const ALLFAQ = [...SITE_FAQS, ...SERVICES.map(s=>s.faqs[0])];
layout({path:P.faq,title:`FAQ: Dog Walking & Pet Sitting in Eugene | ${BRAND}`,desc:'Answers to common questions about dog walking and pet sitting with Chuck & Co. Pet Care in Eugene, Oregon.',crumbs:[['Home',P.home],['FAQ',P.faq]],ld:[faqLd(ALLFAQ)],body:L=>`
<section class="page-hero"><div class="wrap"><div style="max-width:760px;margin-top:28px"><span class="eyebrow">FAQ</span><h1>Frequently asked questions</h1><p class="lede">Everything you need to know before your meet &amp; greet.</p></div></div></section>
<section class="section"><div class="wrap two"><div>${faqHtml(ALLFAQ)}</div><aside class="sticky"><div class="side-card"><h3>Still have questions?</h3><p>Send a note and we will get back to you within one business day.</p><a class="btn btn-light" href="${L(P.book)}">Contact us</a></div></aside></div></section>`});
layout({path:P.book,title:`Book a Free Meet & Greet | ${BRAND}, Eugene OR`,desc:'Request a free meet & greet for dog walking or pet sitting in Eugene, Oregon.',crumbs:[['Home',P.home],['Book',P.book]],body:L=>`
<section class="section tight"><div class="wrap">${form(L,{heading:'Book a free meet & greet'})}</div></section>
<section class="section tint"><div class="wrap"><div class="head"><span class="eyebrow">What happens next</span><h2>After you send your request</h2></div>${STEPS}</div></section>`});
layout({path:P.thanks,noindex:true,title:`Thank You | ${BRAND}`,desc:'Your request has been received.',body:L=>`
<section class="section"><div class="wrap" style="max-width:720px;text-align:center"><span class="eyebrow">Request received</span><h1>Thank you! We’ll be in touch soon.</h1><p class="lede" style="margin:0 auto">We reply to every request within one business day to schedule your free meet &amp; greet.</p><div class="actions" style="justify-content:center"><a class="btn btn-primary" href="${L(P.guides)}">Browse local guides</a><a class="btn btn-ghost" href="${L(P.home)}">Back home</a></div></div></section>`});
layout({path:P.privacy,title:`Privacy Policy | ${BRAND}`,desc:'How Chuck & Co. Pet Care handles information submitted through this website.',crumbs:[['Home',P.home],['Privacy',P.privacy]],body:L=>`
<section class="section"><div class="wrap prose"><h1>Privacy policy</h1><p>When you submit a request through this website, we receive the details you provide, such as your name, contact information and information about your pet. We use this information only to respond to your request and provide services.</p><p>Form submissions are delivered to us by email through a third-party form service. We do not sell or share your information for marketing.</p><p>To ask about or delete your information, contact us through the <a href="${L(P.book)}">contact form</a>.</p></div></section>`});
const rest = () => layout({path:P.map,title:`Sitemap | ${BRAND}`,desc:'All pages on the Chuck & Co. Pet Care website.',crumbs:[['Home',P.home],['Sitemap',P.map]],body:L=>`
<section class="section"><div class="wrap"><h1>Sitemap</h1>
<h2 style="margin-top:40px">Main</h2><ul class="cols">${[[P.home,'Home'],[P.about,'About'],[P.chuck,'In memory of Chuck'],[P.services,'Services'],[P.hoods,'Neighborhoods'],[P.guides,'Guides'],[P.faq,'FAQ'],[P.book,'Book']].map(([p,t])=>`<li><a href="${L(p)}">${t}</a></li>`).join('')}</ul>
<h2 style="margin-top:40px">Services</h2><ul class="cols">${SERVICES.map(s=>`<li><a href="${L(P.svc(s.slug))}">${esc(s.name)}</a></li>`).join('')}</ul>
${HOODS.map(n=>`<h2 style="margin-top:40px;font-size:1.3rem"><a href="${L(P.hood(n.slug))}">${esc(n.name)}</a></h2><ul class="cols">${SERVICES.map(s=>`<li><a href="${L(P.combo(n.slug,s.slug))}">${esc(s.name)} in ${esc(n.name)}</a></li>`).join('')}</ul>`).join('')}
<h2 style="margin-top:40px">Guides</h2><ul class="cols">${GUIDES.map(g=>`<li><a href="${L(P.guide(g.slug))}">${esc(g.title)}</a></li>`).join('')}</ul></div></section>`});
rest();

// write
for (const p of pages) await saveFile('site/'+p.path, p.html);
const idx = pages.filter(p=>!p.noindex);
await saveFile('site/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${idx.map(p=>`<url><loc>${SITE}${clean(p.path)}</loc><lastmod>2026-10-08</lastmod></url>`).join('\n')}\n</urlset>`);
await saveFile('site/robots.txt', `User-agent: *\nAllow: /\nDisallow: /thank-you\n\nSitemap: ${SITE}/sitemap.xml\n`);
await saveFile('site/llms.txt', `# ${BRAND}\n\n> Locally owned dog walking and pet sitting in Eugene, Oregon.\n\nServices: ${SERVICES.map(s=>s.name).join(', ')}.\nService area: ${HOODS.map(h=>h.name).join(', ')} (Eugene, OR ZIPs 97401-97405, 97408).\nBooking: free meet & greet via ${SITE}/book\n\n## Services\n${SERVICES.map(s=>`- [${s.name}](${SITE}${clean(P.svc(s.slug))}): ${s.short}`).join('\n')}\n\n## Guides\n${GUIDES.map(g=>`- [${g.title}](${SITE}${clean(P.guide(g.slug))}): ${g.answer}`).join('\n')}\n`);
await saveFile('site/pages.json', JSON.stringify(pages.map(p=>({path:p.path,title:p.title.split(' | ')[0],type:p.path.startsWith('eugene/')?(p.path.endsWith('index.html')?'Neighborhood':'Service × Neighborhood'):p.path.startsWith('guides/')?'Guide':p.path.startsWith('services/')?'Service':'Core'}))));
log('pages', pages.length);
