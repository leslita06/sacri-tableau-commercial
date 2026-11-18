(function(){
"use strict";
var D = window.DATA, $ = function(id){return document.getElementById(id);};
var ENC = ["Envoyé","Relancé","En négociation"];
var nf = new Intl.NumberFormat("fr-FR");
var fm = function(n){return nf.format(Math.round(n)).replace(/\u202f|\u00a0/g," ");};
var M = function(n){return fm(n)+" FCFA";};
var Mc = function(n){ if(n>=1e6){ var v=(n/1e6); return (Math.round(v*10)/10).toString().replace(".",",")+" M"; } return fm(n); };
var pct = function(x){return Math.round(x*100)+" %";};
var dd = function(s){ var p=s.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; };
var dobj = function(s){ var p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); };
var days = function(a,b){ return Math.round((dobj(b)-dobj(a))/864e5); };
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var JOURS=["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
var JOURSL=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var longDate=function(s){var d=dobj(s);return JOURSL[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
var T = D.today;
var state = {soc:"Tous", com:"Tous", q:"", st:"Tous"};

var ICO = {
 money:'<path d="M3 7h18v10H3z"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',
 rate:'<path d="M4 20 20 4"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 tool:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'
};

function socOK(s){ return state.soc==="Tous" || s===state.soc; }
function comOK(c){ return state.com==="Tous" || c===state.com; }
function devis(){ return D.devis.filter(function(d){return socOK(d.soc)&&comOK(d.com);}); }
function aos(){ return D.ao.filter(function(a){return socOK(a.soc)&&comOK(a.resp);}); }
function parc(){ return D.parc.filter(function(m){return socOK(m.soc)&&comOK(m.com);}); }
function sum(a,f){ return a.reduce(function(s,x){return s+f(x);},0); }
function enCours(l){ return l.filter(function(d){return ENC.indexOf(d.st)>=0;}); }
function dues(l){ return enCours(l).filter(function(d){return d.prev<=T;}).sort(function(a,b){return a.prev<b.prev?-1:a.prev>b.prev?1:b.mt-a.mt;}); }
function aoSoon(l){ return l.filter(function(a){ var k=days(T,a.lim); return (a.st==="À étudier"||a.st==="En préparation") && k>=0 && k<=7; }).sort(function(a,b){return a.lim<b.lim?-1:1;}); }
function parcDue(l){ return l.filter(function(m){return m.due;}).sort(function(a,b){return a.next<b.next?-1:1;}); }
function taux(l){ var g=sum(l.filter(function(d){return d.st==="Gagné";}),function(d){return d.mt;}), p=sum(l.filter(function(d){return d.st==="Perdu";}),function(d){return d.mt;}); return g+p? g/(g+p) : null; }

/* ---------- filtres ---------- */
function buildFilters(){
  var s=$("socs"); var all=["Tous"].concat(D.societes);
  s.innerHTML = all.map(function(x){return '<button type="button" data-s="'+esc(x)+'"'+(x===state.soc?' class="on"':'')+'>'+(x==="Tous"?"Tout le groupe":esc(x))+'</button>';}).join("");
  s.onclick=function(e){ var b=e.target.closest("button"); if(!b) return; state.soc=b.getAttribute("data-s"); s.querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x===b);}); render(); };
  var c=$("f-com"); c.innerHTML = '<option value="Tous">Tous</option>'+D.commerciaux.map(function(x){return '<option>'+esc(x)+'</option>';}).join("");
  c.onchange=function(){ state.com=c.value; render(); };
  var st=$("f-st"); st.innerHTML = '<option value="Tous">Tous les statuts</option><option value="EC">En cours (envoyé, relancé, en négociation)</option>'+["Brouillon","Envoyé","Relancé","En négociation","Gagné","Perdu"].map(function(x){return '<option>'+x+'</option>';}).join("");
  st.onchange=function(){ state.st=st.value; renderTable(); };
  $("q").oninput=function(){ state.q=this.value.trim().toLowerCase(); renderTable(); };
}

/* ---------- chiffres de tête ---------- */
function kpi(ico,v,unit,l,s,main){ return '<div class="kpi'+(main?' main':'')+'"><div class="k-ico"><svg viewBox="0 0 24 24">'+ICO[ico]+'</svg></div><div class="v">'+v+(unit?'<small>'+unit+'</small>':'')+'</div><div class="l">'+l+'</div><div class="s">'+s+'</div></div>'; }
function renderKpis(){
  var dv=devis(), ec=enCours(dv), t=taux(dv), g=dv.filter(function(d){return d.st==="Gagné";}), tr=dv.filter(function(d){return d.st==="Gagné"||d.st==="Perdu";});
  var du=dues(dv), ao=aoSoon(aos()), pd=parcDue(parc());
  $("kpis").innerHTML =
    kpi("money", fm(sum(ec,function(d){return d.mt;})), "FCFA HT", "Montant des devis en cours", ec.length+" devis envoyés, relancés ou en négociation", true)+
    kpi("rate", t===null?"–":pct(t), "", "Devis transformés, en montant", tr.length? g.length+" gagnés sur "+tr.length+" devis tranchés" : "aucun devis tranché")+
    kpi("bell", du.length, "", "Relances à faire aujourd'hui", du.length? "dont "+du.filter(function(d){return d.prev<T;}).length+" en retard" : "rien à relancer")+
    kpi("cal", ao.length, "", "Appels d'offres à rendre sous 7 jours", ao.length? Mc(sum(ao,function(a){return a.mt;}))+" FCFA estimés" : "aucune échéance proche")+
    kpi("tool", pd.length, "", "Machines à réviser ce mois", pd.length? "chez "+new Set(pd.map(function(m){return m.client;})).size+" clients, rappel à envoyer" : "aucune révision due");
}

/* ---------- graphiques ---------- */
var charts={};
Chart.defaults.font.family='"Inter",system-ui,sans-serif'; Chart.defaults.font.size=12; Chart.defaults.color="#5A5853";
function mk(id,cfg){ if(charts[id]) charts[id].destroy(); charts[id]=new Chart($(id),cfg); }
var tip={backgroundColor:"#222",padding:10,cornerRadius:8,displayColors:false};
function renderCharts(){
  var dv=devis();
  var env=dv.filter(function(d){return d.st!=="Brouillon";}), rel=env.filter(function(d){return d.nbr>0;}), gag=env.filter(function(d){return d.st==="Gagné";});
  mk("c-funnel",{type:"bar",data:{labels:["Envoyés","Relancés","Gagnés"],datasets:[{data:[env.length,rel.length,gag.length],backgroundColor:["#F4A06F","#EE7A3A","#E95B0F"],borderRadius:6,barThickness:34}]},
    options:{indexAxis:"y",maintainAspectRatio:false,animation:false,layout:{padding:{right:30}},plugins:{legend:{display:false},tooltip:Object.assign({callbacks:{label:function(c){return c.raw+" devis";}}},tip)},
      scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:"#F0EEEB"},border:{display:false}},y:{grid:{display:false},border:{display:false},ticks:{font:{weight:"500"}}}}},
    plugins:[valLabels(function(v){return v;})]});
  $("funnel-note").textContent = env.length? gag.length+" devis gagnés sur "+env.length+" envoyés ("+pct(gag.length/env.length)+"). "+dv.filter(function(d){return d.st==="Brouillon";}).length+" brouillon(s) non encore envoyé(s)." : "Aucun devis envoyé.";
  var ec=enCours(dv), et=["Envoyé","Relancé","En négociation"], v=et.map(function(s){return sum(ec.filter(function(d){return d.st===s;}),function(d){return d.mt;});}), n=et.map(function(s){return ec.filter(function(d){return d.st===s;}).length;});
  mk("c-etapes",{type:"bar",data:{labels:et.map(function(s,i){return [s, n[i]+" devis"];}),datasets:[{data:v,backgroundColor:["#C4C1BD","#F4A06F","#E95B0F"],borderRadius:6,maxBarThickness:70}]},
    options:{maintainAspectRatio:false,animation:false,layout:{padding:{top:22}},plugins:{legend:{display:false},tooltip:Object.assign({callbacks:{label:function(c){return M(c.raw)+" HT";}}},tip)},
      scales:{y:{beginAtZero:true,ticks:{callback:function(x){return Mc(x);}},grid:{color:"#F0EEEB"},border:{display:false}},x:{grid:{display:false},border:{display:false},ticks:{font:{weight:"500"}}}}},
    plugins:[valLabels(function(x){return x?Mc(x):"";},true)]});
  var neg=ec.filter(function(d){return d.st==="En négociation";});
  $("etapes-note").textContent = neg.length? "En négociation : "+neg.map(function(d){return d.client+" ("+Mc(d.mt)+" FCFA)";}).join(", ")+"." : "Aucun devis en négociation.";
  var coms=D.commerciaux.filter(function(c){return comOK(c);});
  mk("c-com",{type:"bar",data:{labels:coms,datasets:[
      {label:"En cours",data:coms.map(function(c){return sum(ec.filter(function(d){return d.com===c;}),function(d){return d.mt;});}),backgroundColor:"#E95B0F",borderRadius:4,maxBarThickness:22},
      {label:"Gagné depuis septembre",data:coms.map(function(c){return sum(dv.filter(function(d){return d.com===c&&d.st==="Gagné";}),function(d){return d.mt;});}),backgroundColor:"#C4C1BD",borderRadius:4,maxBarThickness:22}]},
    options:{indexAxis:"y",maintainAspectRatio:false,animation:false,plugins:{legend:{position:"bottom",labels:{boxWidth:10,boxHeight:10,padding:12}},tooltip:Object.assign({callbacks:{label:function(c){return c.dataset.label+" : "+M(c.raw);}}},tip)},
      scales:{x:{beginAtZero:true,ticks:{callback:function(x){return Mc(x);},maxTicksLimit:5},grid:{color:"#F0EEEB"},border:{display:false}},y:{grid:{display:false},border:{display:false}}}}});
}
function valLabels(fmt,top){ return {id:"vl",afterDatasetsDraw:function(ch){ var c=ch.ctx; c.save(); c.font='600 12px "Inter",sans-serif'; c.fillStyle="#222";
  ch.getDatasetMeta(0).data.forEach(function(b,i){ var t=fmt(ch.data.datasets[0].data[i]); if(t==="") return; if(top){c.textAlign="center";c.fillText(t,b.x,b.y-7);} else {c.textAlign="left";c.textBaseline="middle";c.fillText(t,b.x+8,b.y);} }); c.restore(); }}; }

/* ---------- relances ---------- */
function validite(d){ return d.valid>=T ? "valable jusqu'au "+dd(d.valid) : "arrivé à échéance le "+dd(d.valid)+" (nous pouvons le mettre à jour)"; }
function msgDevis(d){
  if(d.canal==="E-mail") return "<b>Objet : Votre devis "+d.n+" : "+esc(d.objet)+"</b><br><br>Bonjour "+d.civ+" "+esc(d.contact)+",<br><br>Je reviens vers vous au sujet de notre devis "+d.n+" du "+dd(d.date)+" pour : "+esc(d.objet)+", d'un montant de "+fm(d.mt)+" FCFA HT. Ce devis est "+validite(d)+".<br><br>Avez-vous pu l'examiner ? Je peux revoir les quantités avec vous, organiser une démonstration ou vous mettre en relation avec notre atelier pour toute question technique.<br><br>Bien cordialement,<br>"+esc(d.com)+"<br>"+esc(d.soc);
  return "Bonjour "+d.civ+" "+esc(d.contact)+", c'est "+esc(d.com)+" de "+esc(d.soc)+". Avez-vous pu regarder notre devis "+d.n+" pour : "+esc(d.objet)+" ("+fm(d.mt)+" FCFA HT, devis "+validite(d)+") ? Je reste disponible pour en parler quand cela vous arrange.";
}
function renderRelances(){
  var l=dues(devis()); $("n-rel").textContent=l.length;
  $("relances").innerHTML = l.length? l.map(function(d){ var k=days(d.prev,T);
    return '<li><div><div class="t">'+esc(d.client)+'</div><div class="d">'+d.n+' · '+esc(d.objet)+'</div><div class="d">'+esc(d.com)+' · '+esc(d.soc)+' · '+(d.nbr? (d.nbr===1?"1 relance":d.nbr+" relances")+", la dernière le "+dd(d.der) : "envoyé le "+dd(d.date)+", jamais relancé")+'</div>'+
      '<details class="msg"><summary>Voir le message '+(d.canal==="E-mail"?"e-mail":"WhatsApp")+' prêt</summary><p>'+msgDevis(d)+'</p></details></div>'+
      '<div class="r"><div class="m">'+Mc(d.mt)+' F</div>'+(k>0?'<span class="tag late">'+k+' j de retard</span>':'<span class="tag o">aujourd\'hui</span>')+'<br><span class="tag">'+d.canal+'</span></div></li>'; }).join("")
    : '<li class="empty">Aucune relance due pour cette sélection.</li>';
}

/* ---------- appels d'offres ---------- */
function renderAO(){
  var l=aoSoon(aos()); $("n-ao").textContent=l.length;
  var f=$("frise"), h='<div class="axis"></div>';
  for(var i=0;i<=7;i++){ var dt=dobj(T); dt.setDate(dt.getDate()+i); var x=(i/7*100);
    h+='<div class="tick" style="left:'+x+'%"></div><div class="day" style="left:'+x+'%">'+(i===0?"aujourd'hui":JOURS[dt.getDay()]+"<br>"+dt.getDate())+'</div>'; }
  l.forEach(function(a){ var x=days(T,a.lim)/7*100; h+='<div class="pt" style="left:'+x+'%"><b>'+a.n.replace("AO-0","AO ")+'</b><i></i></div>'; });
  f.innerHTML=h;
  $("ao").innerHTML = l.length? l.map(function(a){ var k=days(T,a.lim);
    return '<li><div><div class="t">'+esc(a.objet)+'</div><div class="d">'+a.n+' · '+esc(a.ach)+' ('+a.type.toLowerCase()+') · '+esc(a.soc)+' · '+esc(a.resp)+'</div>'+
      '<div class="d">Dossier : '+a.pretes+' pièces prêtes sur '+a.exig+(a.manq.length? '. À fournir : '+a.manq.map(function(x){return x.charAt(0).toLowerCase()+x.slice(1);}).join(", ")+'.':'.')+'</div></div>'+
      '<div class="r"><div class="m">'+Mc(a.mt)+' F</div><span class="tag '+(k<=3?"late":"o")+'">'+longDate(a.lim).split(" ").slice(0,3).join(" ")+', '+a.h+'</span><br><span class="tag">'+a.st+'</span></div></li>'; }).join("")
    : '<li class="empty">Aucun appel d\'offres à rendre dans les 7 jours pour cette sélection.</li>';
}

/* ---------- parcs ---------- */
function renderParc(){
  var l=parcDue(parc()); $("n-parc").textContent=l.length;
  $("parc").innerHTML = l.length? l.map(function(m){ var late=m.next<T;
    var mach=(m.type+" "+(m.marque!=="À préciser"?m.marque:"")+" "+(m.modele!=="À préciser"?m.modele:"")).replace(/\s+/g," ").trim();
    var ech= late? "a dépassé sa date de révision, prévue le "+dd(m.next) : "arrive à sa date de révision, prévue le "+dd(m.next);
    var msg="Bonjour "+m.civ+" "+esc(m.contact)+", c'est l'atelier "+esc(m.soc)+". Votre "+esc(mach.charAt(0).toLowerCase()+mach.slice(1))+" (n° de série "+m.serie+") "+ech+". Une révision à temps évite les arrêts imprévus sur vos chantiers. Quel jour vous conviendrait pour la passer à l'atelier ?";
    return '<div class="mc"><div class="t">'+esc(mach)+'</div><div class="d">'+esc(m.client)+' · '+esc(m.ville)+'</div><div class="d">Série '+m.serie+' · '+(m.rev? "révisée le "+dd(m.rev) : "achetée le "+dd(m.achat)+", jamais révisée")+'</div>'+
      '<span class="tag '+(late?"late":"o")+'">'+(late? "révision dépassée depuis le "+dd(m.next) : "révision le "+dd(m.next))+'</span> <span class="tag">'+esc(m.com)+'</span>'+
      '<details class="msg"><summary>Voir le rappel '+(m.canal==="E-mail"?"e-mail":"WhatsApp")+' prêt</summary><p>'+msg+'</p></details></div>'; }).join("")
    : '<p class="empty">Aucune machine à réviser ce mois pour cette sélection.</p>';
}

/* ---------- synthèses ---------- */
function rowsFor(keys,keyOfD,keyOfA,keyOfM){
  var dv=devis(), ao=aos(), pk=parc();
  var head='<thead><tr><th></th><th class="n">En cours</th><th class="n">Montant en cours</th><th class="n">Gagné</th><th class="n">Transfo.</th><th class="n">AO actifs</th><th class="n">Révisions</th></tr></thead>';
  function line(lbl,d,a,p,cls){ var ec=enCours(d), t=taux(d);
    return '<tr'+(cls?' class="'+cls+'"':'')+'><td>'+lbl+'</td><td class="n">'+ec.length+'</td><td class="n">'+fm(sum(ec,function(x){return x.mt;}))+'</td><td class="n">'+fm(sum(d.filter(function(x){return x.st==="Gagné";}),function(x){return x.mt;}))+'</td><td class="n">'+(t===null?"–":pct(t))+'</td><td class="n">'+a.filter(function(x){return x.st==="À étudier"||x.st==="En préparation";}).length+'</td><td class="n">'+p.filter(function(x){return x.due;}).length+'</td></tr>'; }
  var body=keys.map(function(k){ return line(esc(k),dv.filter(function(d){return keyOfD(d)===k;}),ao.filter(function(a){return keyOfA(a)===k;}),pk.filter(function(m){return keyOfM(m)===k;})); }).join("");
  return head+'<tbody>'+body+line("Total",dv,ao,pk,"tot")+'</tbody>';
}
function renderSums(){
  $("t-soc").innerHTML=rowsFor(D.societes.filter(socOK),function(d){return d.soc;},function(a){return a.soc;},function(m){return m.soc;});
  $("t-com").innerHTML=rowsFor(D.commerciaux.filter(comOK),function(d){return d.com;},function(a){return a.resp;},function(m){return m.com;});
}

/* ---------- tableau des devis ---------- */
function renderTable(){
  var l=devis().filter(function(d){
    if(state.st==="EC" && ENC.indexOf(d.st)<0) return false;
    if(state.st!=="Tous" && state.st!=="EC" && d.st!==state.st) return false;
    if(state.q){ var h=(d.n+" "+d.client+" "+d.objet+" "+d.gamme+" "+d.ville+" "+d.com).toLowerCase(); if(h.indexOf(state.q)<0) return false; }
    return true; }).sort(function(a,b){return a.date<b.date?1:-1;});
  var cls={"Gagné":"ok","Perdu":"late","En négociation":"o","Relancé":"o"};
  $("t-devis").innerHTML='<thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Objet</th><th>Société</th><th>Commercial</th><th class="n">Montant HT</th><th>Statut</th><th>Prochaine relance</th></tr></thead><tbody>'+
    l.map(function(d){ return '<tr><td data-l="N°">'+d.n+'</td><td data-l="Date">'+dd(d.date)+'</td><td data-l="Client">'+esc(d.client)+'<div class="sub">'+esc(d.ville)+'</div></td><td data-l="Objet">'+esc(d.objet)+'</td><td data-l="Société">'+esc(d.soc)+'</td><td data-l="Commercial">'+esc(d.com)+'</td><td class="n" data-l="Montant HT">'+M(d.mt)+'</td><td data-l="Statut"><span class="tag '+(cls[d.st]||"")+'">'+d.st+(d.motif?" · "+d.motif.toLowerCase():"")+'</span></td><td data-l="Prochaine relance">'+(d.prev? (d.prev<=T?'<b style="color:#C0392B">'+dd(d.prev)+'</b>':dd(d.prev)) : "–")+'</td></tr>'; }).join("")+'</tbody>';
  $("t-count").textContent=l.length+" devis affiché"+(l.length>1?"s":"")+" · "+M(sum(l,function(d){return d.mt;}))+" HT au total";
}

function render(){
  $("titre").textContent = state.soc==="Tous" ? "Groupe SACRI" : state.soc;
  $("metier").textContent = state.soc==="Tous" ? "Devis, appels d'offres et entretien des parcs pour les cinq sociétés du groupe : SACRI, Trans-Roulements, SAFIR, PST-CI et DEFI." : D.metiers[state.soc];
  renderKpis(); renderCharts(); renderRelances(); renderAO(); renderParc(); renderSums(); renderTable();
}
$("today").textContent = longDate(T);
buildFilters(); render();
})();
