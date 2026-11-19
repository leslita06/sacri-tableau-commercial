(function(){
"use strict";
var D = window.DATA, $ = function(id){return document.getElementById(id);};
var ENC = ["Envoyé","Relancé","En négociation"];
var nf = new Intl.NumberFormat("fr-FR");
var fm = function(n){return nf.format(Math.round(n)).replace(/\u202f|\u00a0/g," ");};
var M = function(n){return fm(n)+" FCFA";};
var Mc = function(n){ if(n>=1e6){ var v=(n/1e6); return (Math.round(v*10)/10).toString().replace(".",",")+" M"; } if(n>=1e3) return Math.round(n/1e3)+" k"; return fm(n); };
var pct = function(x){return Math.round(x*100)+" %";};
var dd = function(s){ var p=s.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; };
var dobj = function(s){ var p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); };
var days = function(a,b){ return Math.round((dobj(b)-dobj(a))/864e5); };
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var MC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
var JOURSL=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var longDate=function(s){var d=dobj(s);return JOURSL[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();};
var shortDate=function(s){var d=dobj(s);return JOURSL[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()];};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
var T = D.today;
var state = {soc:"Tous", com:"Tous", q:"", st:"Tous", more:{}};

/* Objectif mensuel de devis gagnés, FCFA HT, par société : indicatif, à fixer par la direction */
var OBJ = {"SACRI":12000000,"Trans-Roulements":3000000,"SAFIR":4000000,"PST-CI":4000000,"DEFI":7000000};
var LOGO = {"SACRI":"logo-sacri.png","Trans-Roulements":"logo-trans.png","SAFIR":"logo-safir.png","PST-CI":"logo-pst.png","DEFI":"logo-defi.png"};

var P = {
 money:'<path d="M3 7h18v10H3z"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',
 rate:'<path d="M4 20 20 4"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 tool:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
 phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
 send:'<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
 doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
 copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
 check:'<path d="M5 12l5 5L20 7"/>',
 saw:'<path d="M3 15h11l4-4h3v6h-3l-2-2H3z"/><path d="M5 15v2M8 15v2M11 15v2"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
 drop:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
 fan:'<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s2 5-2 7M14 12c4 0 7 1 7 4s-5 2-7-2M12 14c0 4-1 7-4 7s-2-5 2-7M10 12c-4 0-7-1-7-4s5-2 7 2"/>'
};
var I = function(k,c){ return '<svg class="i'+(c?" "+c:"")+'" viewBox="0 0 24 24">'+P[k]+'</svg>'; };

function socOK(s){ return state.soc==="Tous" || s===state.soc; }
function comOK(c){ return state.com==="Tous" || c===state.com; }
function devis(){ return D.devis.filter(function(d){return socOK(d.soc)&&comOK(d.com);}); }
function aos(){ return D.ao.filter(function(a){return socOK(a.soc)&&comOK(a.resp);}); }
function parc(){ return D.parc.filter(function(m){return socOK(m.soc)&&comOK(m.com);}); }
function sum(a,f){ return a.reduce(function(s,x){return s+f(x);},0); }
function mt(d){ return d.mt; }
function enCours(l){ return l.filter(function(d){return ENC.indexOf(d.st)>=0;}); }
function dues(l){ return enCours(l).filter(function(d){return d.prev<=T;}).sort(function(a,b){return a.prev<b.prev?-1:a.prev>b.prev?1:b.mt-a.mt;}); }
function aoSoon(l){ return l.filter(function(a){ var k=days(T,a.lim); return (a.st==="À étudier"||a.st==="En préparation") && k>=0 && k<=7; }).sort(function(a,b){return a.lim<b.lim?-1:1;}); }
function parcDue(l){ return l.filter(function(m){return m.due;}).sort(function(a,b){return a.next<b.next?-1:1;}); }
function won(l){ return l.filter(function(d){return d.st==="Gagné";}); }
function lost(l){ return l.filter(function(d){return d.st==="Perdu";}); }
function taux(l){ var g=sum(won(l),mt), p=sum(lost(l),mt); return g+p? g/(g+p) : null; }
function famille(g){
  if(/STIHL/.test(g)) return "STIHL : forêt et espaces verts";
  if(/coupe/i.test(g)) return "Scies et outils de coupe";
  if(/NTN|Optibelt/.test(g)) return "Roulements et transmission";
  if(/Parker|Hi-Force|Danfoss|Pneumatique/.test(g)) return "Hydraulique et pneumatique";
  if(/métallique|Tuyauterie|chaudronnerie/i.test(g)) return "Construction métallique";
  return "Outillage et lubrifiants";
}
var FAM = ["STIHL : forêt et espaces verts","Construction métallique","Scies et outils de coupe","Roulements et transmission","Hydraulique et pneumatique","Outillage et lubrifiants"];
var FCOL = ["#E95B0F","#1F1D1B","#F4A06F","#878480","#2F6F8F","#C4C1BD"];
var FIMG = {"STIHL : forêt et espaces verts":"img/stihl.jpg","Hydraulique et pneumatique":"img/flexibles.jpg"};
var ini = function(n){ return n.split(" ").map(function(x){return x.charAt(0);}).join("").replace(".",""); };

/* ---------- filtres ---------- */
function setSoc(s){ state.soc=s; state.more={}; $("socs").querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x.getAttribute("data-s")===s);}); render(); }
function buildFilters(){
  var s=$("socs"); var all=["Tous"].concat(D.societes);
  s.innerHTML = all.map(function(x){return '<button type="button" data-s="'+esc(x)+'"'+(x===state.soc?' class="on"':'')+'>'+(x==="Tous"?"Tout le groupe":esc(x))+'</button>';}).join("");
  s.onclick=function(e){ var b=e.target.closest("button"); if(b) setSoc(b.getAttribute("data-s")); };
  var c=$("f-com"); c.innerHTML = '<option value="Tous">Tous</option>'+D.commerciaux.map(function(x){return '<option>'+esc(x)+'</option>';}).join("");
  c.onchange=function(){ state.com=c.value; state.more={}; render(); };
  var st=$("f-st"); st.innerHTML = '<option value="Tous">Tous les statuts</option><option value="EC">En cours (envoyé, relancé, en négociation)</option>'+["Brouillon","Envoyé","Relancé","En négociation","Gagné","Perdu"].map(function(x){return '<option>'+x+'</option>';}).join("");
  st.onchange=function(){ state.st=st.value; renderTable(); };
  $("q").oninput=function(){ state.q=this.value.trim().toLowerCase(); renderTable(); };
}

/* ---------- chiffres de tête ---------- */
function kpi(ico,v,unit,l,s,cls,href){ return '<a class="kpi'+(cls?' '+cls:'')+'" href="'+href+'"><div class="k-top"><div class="k-ico">'+I(ico)+'</div></div><div class="v">'+v+(unit?'<small>'+unit+'</small>':'')+'</div><div class="l">'+l+'</div><div class="s">'+s+'</div></a>'; }
function renderKpis(){
  var dv=devis(), ec=enCours(dv), t=taux(dv), g=won(dv), tr=dv.filter(function(d){return d.st==="Gagné"||d.st==="Perdu";});
  var du=dues(dv), ao=aoSoon(aos()), pd=parcDue(parc());
  $("kpis").innerHTML =
    kpi("money", fm(sum(ec,mt)), "FCFA HT", "Montant des devis en cours", ec.length+" devis envoyés, relancés ou en négociation", "main", "#ventes")+
    kpi("rate", t===null?"–":pct(t), "", "Devis transformés, en montant", tr.length? g.length+" gagnés sur "+tr.length+" devis tranchés" : "aucun devis tranché", "", "#ventes")+
    kpi("bell", du.length, "", "Relances à faire aujourd'hui", du.length? "dont "+du.filter(function(d){return d.prev<T;}).length+" en retard" : "rien à relancer", "", "#h-rel")+
    kpi("cal", ao.length, "", "Appels d'offres à rendre sous 7 jours", ao.length? Mc(sum(ao,function(a){return a.mt;}))+" FCFA estimés" : "aucune échéance proche", "", "#h-ao")+
    kpi("tool", pd.length, "", "Machines à réviser ce mois", pd.length? "chez "+new Set(pd.map(function(m){return m.client;})).size+" clients, rappel à envoyer" : "aucune révision due", "", "#h-parc");
}

/* ---------- ventes ---------- */
var charts={};
Chart.defaults.font.family='"Inter",system-ui,sans-serif'; Chart.defaults.font.size=12; Chart.defaults.color="#5A5853";
function mk(id,cfg){ if(charts[id]) charts[id].destroy(); charts[id]=new Chart($(id),cfg); }
var tip={backgroundColor:"#1F1D1B",padding:10,cornerRadius:8,displayColors:false};

function ring(v){
  var r=40, c=2*Math.PI*r, p=v===null?0:v;
  return '<div class="rg"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="'+r+'" fill="none" stroke="#F3F2F0" stroke-width="10"/><circle cx="48" cy="48" r="'+r+'" fill="none" stroke="#E95B0F" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+(c*p)+' '+c+'"/></svg><div class="rv"><b>'+(v===null?"–":pct(v))+'</b></div></div><span class="rl">transformé<br>en montant</span>';
}
function renderVentes(){
  var dv=devis(), g=won(dv), l=lost(dv), ec=enCours(dv);
  $("v-gagne").innerHTML = fm(sum(g,mt))+'<small>FCFA HT</small>';
  $("v-gagne-s").textContent = g.length+" devis gagnés · "+l.length+" perdus ("+Mc(sum(l,mt))+" FCFA)";
  $("ring-taux").innerHTML = ring(taux(dv));

  /* objectif contre réalisé */
  var months=["2026-09","2026-10","2026-11"], cm=T.slice(0,7);
  var obj = state.com==="Tous" ? sum(D.societes.filter(socOK),function(s){return OBJ[s];}) : null;
  var real = months.map(function(m){ return sum(g.filter(function(d){return d.date.slice(0,7)===m;}),mt); });
  var neg = months.map(function(m){ return m===cm ? sum(ec.filter(function(d){return d.st==="En négociation";}),mt) : 0; });
  var ds=[{label:"Gagné",data:real,backgroundColor:"#E95B0F",borderRadius:6,maxBarThickness:58,stack:"s",order:2},
          {label:"En négociation",data:neg,backgroundColor:"#F8C9AC",borderRadius:6,maxBarThickness:58,stack:"s",order:2}];
  mk("c-obj",{type:"bar",data:{labels:months.map(function(m){var k=+m.slice(5)-1; return MC[k].charAt(0).toUpperCase()+MC[k].slice(1)+(m===cm?" (en cours)":"");}),datasets:ds},
    options:{maintainAspectRatio:false,animation:false,layout:{padding:{top:24}},plugins:{legend:{display:false},tooltip:Object.assign({callbacks:{label:function(c){return c.dataset.label+" : "+M(c.raw)+" HT";}}},tip)},
      scales:{y:{stacked:true,beginAtZero:true,suggestedMax:obj?obj*1.15:undefined,ticks:{callback:function(x){return Mc(x);},maxTicksLimit:5},grid:{color:"#F0EEEB"},border:{display:false}},x:{stacked:true,grid:{display:false},border:{display:false},ticks:{font:{weight:"600"}}}}},
    plugins:[{id:"pc",afterDatasetsDraw:function(ch){ var c=ch.ctx, m0=ch.getDatasetMeta(0), m1=ch.getDatasetMeta(1), ca=ch.chartArea; c.save();
      if(obj){ var y=ch.scales.y.getPixelForValue(obj); c.setLineDash([6,5]); c.strokeStyle="#1F1D1B"; c.lineWidth=1.6; c.beginPath(); c.moveTo(ca.left,y); c.lineTo(ca.right,y); c.stroke(); c.setLineDash([]);
        c.font='600 11px "Inter",sans-serif'; c.fillStyle="#1F1D1B"; c.textAlign="right"; c.fillText("Objectif "+Mc(obj),ca.right,y-6); }
      c.textAlign="center";
      m0.data.forEach(function(b,i){
        if(real[i]){ c.font='700 12px "Inter",sans-serif'; c.fillStyle="#fff"; c.fillText(Mc(real[i]),b.x,b.y+18); if(obj){ c.font='600 11px "Inter",sans-serif'; c.fillText(pct(real[i]/obj),b.x,b.y+33); } }
        if(neg[i]){ c.font='600 11px "Inter",sans-serif'; c.fillStyle="#B8460A"; var mid=(m1.data[i].y+m1.data[i].base)/2; c.fillText("+"+Mc(neg[i]),b.x,mid); c.fillText("en négo.",b.x,mid+14); }
        if(!real[i]){ c.font='600 11px "Inter",sans-serif'; c.fillStyle="#878480"; c.fillText("0 gagné",b.x,(neg[i]?m1.data[i].y:b.base)-8); } }); c.restore(); }}]});
  $("obj-note").textContent = obj ? "devis gagnés par mois d'émission, FCFA HT · objectif indicatif "+Mc(obj)+" FCFA par mois" : "devis gagnés par mois d'émission, FCFA HT · l'objectif est fixé par société, pas par commercial";
  $("obj-leg").innerHTML = '<span><i style="background:#E95B0F"></i>Gagné</span><span><i style="background:#F8C9AC"></i>En négociation ce mois</span>'+(obj?'<span><i class="line"></i>Objectif mensuel indicatif</span>':'');

  /* entonnoir */
  var env=dv.filter(function(d){return d.st!=="Brouillon";}), rel=env.filter(function(d){return d.nbr>0;}), ng=env.filter(function(d){return d.st==="En négociation"||d.st==="Gagné";});
  var st=[["Devis envoyés",env,"#F4A06F"],["Relancés au moins une fois",rel,"#EE7A3A"],["En négociation ou gagnés",ng,"#D9560D"],["Gagnés",g,"#B8460A"]];
  var mx=Math.max(env.length,1), h="";
  st.forEach(function(s,i){ var w=Math.max(46,s[1].length/mx*100);
    if(i) h+='<div class="fconv">'+I("arrow")+pct(env.length? s[1].length/env.length:0)+' des devis envoyés</div>';
    h+='<div class="fs" style="width:'+w+'%;background:'+s[2]+'"><div><div class="ft">'+s[0]+'</div><div class="fm">'+Mc(sum(s[1],mt))+' FCFA HT</div></div><div class="fr"><div class="fn">'+s[1].length+'</div></div></div>'; });
  $("funnel").innerHTML=h;
  var br=dv.filter(function(d){return d.st==="Brouillon";});
  $("funnel-note").textContent = (br.length? br.length+" brouillon"+(br.length>1?"s":"")+" pas encore envoyé"+(br.length>1?"s":"")+" ("+Mc(sum(br,mt))+" FCFA). ":"")+(l.length? "Perdus : "+l.map(function(d){return d.client+" ("+(d.motif||"motif non noté").toLowerCase()+")";}).join(", ")+".":"");

  /* gammes */
  var vals=FAM.map(function(f){return sum(ec.filter(function(d){return famille(d.gamme)===f;}),mt);});
  var idx=FAM.map(function(f,i){return i;}).filter(function(i){return vals[i]>0;}).sort(function(a,b){return vals[b]-vals[a];});
  var tot=sum(ec,mt);
  mk("c-gamme",{type:"doughnut",data:{labels:idx.map(function(i){return FAM[i];}),datasets:[{data:idx.map(function(i){return vals[i];}),backgroundColor:idx.map(function(i){return FCOL[i];}),borderColor:"#fff",borderWidth:3}]},
    options:{maintainAspectRatio:false,animation:false,cutout:"66%",plugins:{legend:{display:false},tooltip:Object.assign({callbacks:{label:function(c){return c.label+" : "+M(c.raw)+" HT";}}},tip)}}});
  $("donut-c").innerHTML = '<b>'+Mc(tot)+'</b><span>FCFA HT<br>en cours</span>';
  $("gamme-leg").innerHTML = idx.length? idx.map(function(i){ return '<li><i style="background:'+FCOL[i]+'"></i><span>'+FAM[i]+'</span><b>'+Mc(vals[i])+'<em>'+pct(vals[i]/tot)+'</em></b></li>'; }).join("") : '<li>Aucun devis en cours.</li>';
  var fi=idx.filter(function(i){return FIMG[FAM[i]];})[0], top=fi===undefined? null : FAM[fi], img=top && FIMG[top];
  $("feat").style.display = img? "" : "none";
  if(img){ var dl=ec.filter(function(d){return famille(d.gamme)===top;});
    $("feat").innerHTML='<img src="assets/'+img+'?v=20261119a" alt="'+esc(top)+'" loading="lazy"><p><b>'+esc(top.split(" :")[0])+' : '+dl.length+' devis en cours</b><br>'+M(vals[fi])+' HT, soit '+pct(vals[fi]/tot)+' du montant en cours'+(idx.indexOf(fi)===0?', première gamme':'')+'.</p>'; }

  /* commerciaux */
  var coms=D.commerciaux.filter(comOK);
  var data=coms.map(function(c){ var d=dv.filter(function(x){return x.com===c;}); return {c:c, ec:sum(enCours(d),mt), g:sum(won(d),mt), n:enCours(d).length, du:dues(d).length, t:taux(d)}; }).sort(function(a,b){return (b.ec+b.g)-(a.ec+a.g);});
  var mxv=Math.max.apply(null,data.map(function(x){return Math.max(x.ec,x.g);}).concat([1]));
  $("coms").innerHTML = data.map(function(x){
    return '<div class="cm"><div class="av">'+ini(x.c)+'</div><div><div class="cm-h"><b>'+esc(x.c)+'</b><span>'+(x.t===null?"aucun devis tranché":pct(x.t)+" transformé")+'</span></div>'+
      '<div class="bars"><div class="bar"><i style="width:'+(x.ec/mxv*100)+'%;background:#E95B0F"></i></div><div class="bar"><i style="width:'+(x.g/mxv*100)+'%;background:#C4C1BD"></i></div></div>'+
      '<div class="cm-f"><span>En cours <b style="color:#1F1D1B">'+Mc(x.ec)+'</b> ('+x.n+')</span><span>Gagné <b style="color:#1F1D1B">'+Mc(x.g)+'</b></span>'+(x.du?'<span class="b o">'+x.du+' relance'+(x.du>1?'s':'')+' aujourd\'hui</span>':'')+'</div></div></div>'; }).join("") || '<p class="empty">Aucun commercial pour cette sélection.</p>';
}

/* ---------- affaires du jour ---------- */
function validite(d){ return d.valid>=T ? "valable jusqu'au "+dd(d.valid) : "arrivé à échéance le "+dd(d.valid)+" (nous pouvons le mettre à jour)"; }
function msgDevis(d){
  if(d.canal==="E-mail") return "Objet : Votre devis "+d.n+" : "+d.objet+"\n\nBonjour "+d.civ+" "+d.contact+",\n\nJe reviens vers vous au sujet de notre devis "+d.n+" du "+dd(d.date)+" pour : "+d.objet+", d'un montant de "+fm(d.mt)+" FCFA HT. Ce devis est "+validite(d)+".\n\nAvez-vous pu l'examiner ? Je peux revoir les quantités avec vous, organiser une démonstration ou vous mettre en relation avec notre atelier pour toute question technique.\n\nBien cordialement,\n"+d.com+"\n"+d.soc;
  return "Bonjour "+d.civ+" "+d.contact+", c'est "+d.com+" de "+d.soc+". Avez-vous pu regarder notre devis "+d.n+" pour : "+d.objet+" ("+fm(d.mt)+" FCFA HT, devis "+validite(d)+") ? Je reste disponible pour en parler quand cela vous arrange.";
}
function mach(m){ return (m.type+" "+(m.marque!=="À préciser"?m.marque:"")+" "+(m.modele!=="À préciser"?m.modele:"")).replace(/\s+/g," ").trim(); }
function msgParc(m){ var x=mach(m), late=m.next<T;
  return "Bonjour "+m.civ+" "+m.contact+", c'est l'atelier "+m.soc+". Votre "+x.charAt(0).toLowerCase()+x.slice(1)+" (n° de série "+m.serie+") "+(late?"a dépassé sa date de révision, prévue le ":"arrive à sa date de révision, prévue le ")+dd(m.next)+". Une révision à temps évite les arrêts imprévus sur vos chantiers. Quel jour vous conviendrait pour la passer à l'atelier ?"; }
function btns(kind,i,labels){ return '<div class="btns">'+
  '<button type="button" data-a="call" data-k="'+kind+'" data-i="'+i+'">'+I("phone")+(labels&&labels[0]||"Appeler")+'</button>'+
  '<button type="button" class="pri" data-a="relance" data-k="'+kind+'" data-i="'+i+'">'+I("send")+(labels&&labels[1]||"Relancer")+'</button>'+
  '<button type="button" data-a="devis" data-k="'+kind+'" data-i="'+i+'">'+I("doc")+(labels&&labels[2]||"Devis")+'</button></div>'; }
function moreBtn(key,n,shown){ return n>shown? '<button type="button" class="more" data-more="'+key+'">Voir les '+(n-shown)+' autres</button>' : ''; }
var LIM={rel:6,ao:6,parc:6,tab:12};
function lim(k){ return window.innerWidth<640 ? ({rel:3,ao:4,parc:3,tab:8})[k] : LIM[k]; }
var CUR={rel:[],ao:[],parc:[]};

function renderJour(){
  var du=dues(devis()), ao=aoSoon(aos()), pd=parcDue(parc());
  CUR.rel=du; CUR.ao=ao; CUR.parc=pd;
  var late=du.filter(function(d){return d.prev<T;}).length;
  $("jour-s").textContent = longDate(T);
  $("tri").innerHTML =
    '<a class="tr" href="#h-rel"><span class="ico">'+I("bell")+'</span><div><div class="tn">'+du.length+'</div><div class="tl">devis à relancer</div><div class="ts">'+Mc(sum(du,mt))+' FCFA en jeu · '+late+' en retard</div></div><span class="go">'+I("arrow")+'</span></a>'+
    '<a class="tr" href="#h-ao"><span class="ico">'+I("cal")+'</span><div><div class="tn">'+ao.length+'</div><div class="tl">appels d\'offres à rendre</div><div class="ts">'+(ao.length? "le premier "+shortDate(ao[0].lim)+", "+ao[0].h : "aucune échéance sous 7 jours")+'</div></div><span class="go">'+I("arrow")+'</span></a>'+
    '<a class="tr" href="#h-parc"><span class="ico">'+I("tool")+'</span><div><div class="tn">'+pd.length+'</div><div class="tl">machines à réviser</div><div class="ts">'+pd.filter(function(m){return m.next<T;}).length+' révision(s) déjà dépassée(s)</div></div><span class="go">'+I("arrow")+'</span></a>';

  /* relances */
  $("n-rel").textContent=du.length;
  var nr=state.more.rel? du.length : Math.min(du.length,lim("rel"));
  $("relances").innerHTML = du.length? du.slice(0,nr).map(function(d,i){ var k=days(d.prev,T), cls=k>0?"late":"today";
    var steps=[1,2,3].map(function(s){return '<span class="'+(s<=d.nbr?"on":"")+'"></span>';}).join("");
    return '<article class="ac '+cls+'"><div class="ac-b"><div class="ac-top"><div><div class="who">'+esc(d.client)+'</div><div class="ctc">'+d.civ+' '+esc(d.contact)+' · '+esc(d.fct)+' · '+esc(d.ville)+'</div></div><div class="amt"><b>'+Mc(d.mt)+'</b><span>FCFA HT</span></div></div>'+
      '<div class="obj">'+esc(d.objet)+'</div><div class="meta">'+d.n+' du '+dd(d.date)+' · '+esc(d.com)+' · '+esc(d.soc)+'</div>'+
      '<div class="badges">'+(k>0?'<span class="b red">'+k+' j de retard</span>':'<span class="b o">à relancer aujourd\'hui</span>')+'<span class="b '+(d.st==="En négociation"?"blue":"")+'">'+d.st+'</span>'+(d.mt>=5000000?'<span class="b dark">gros devis</span>':'')+(d.valid<T?'<span class="b red nodot">validité échue</span>':'')+'</div>'+
      '<div class="steps">'+steps+'</div><div class="steps-l"><span>'+(d.nbr? (d.nbr===1?"1 relance faite":d.nbr+" relances faites")+", la dernière le "+dd(d.der) : "envoyé le "+dd(d.date)+", jamais relancé")+'</span><span>par '+(d.canal==="E-mail"?"e-mail":"WhatsApp")+'</span></div></div>'+
      btns("rel",i)+'</article>'; }).join("")+moreBtn("rel",du.length,nr)
    : '<p class="empty">Aucune relance due pour cette sélection.</p>';

  /* appels d'offres */
  $("n-ao").textContent=ao.length;
  $("ao").innerHTML = ao.length? ao.map(function(a,i){ var k=days(T,a.lim), cls=k<=3?"late":"soon";
    return '<article class="ac '+cls+'"><div class="ac-b"><div class="ac-top"><div class="cd'+(k<=3?" red":"")+'"><b>'+k+'</b><span>jour'+(k>1?"s":"")+'</span></div><div class="amt"><b>'+Mc(a.mt)+'</b><span>FCFA HT estimés</span></div></div>'+
      '<div class="who" style="margin-top:12px">'+esc(a.objet)+'</div><div class="ctc">'+esc(a.ach)+'</div>'+
      '<div class="meta">'+a.n+' · '+esc(a.soc)+' · '+esc(a.resp)+' · à rendre le '+shortDate(a.lim)+', '+a.h+'</div>'+
      '<div class="badges"><span class="b '+(a.st==="En préparation"?"o":"")+'">'+a.st+'</span><span class="b nodot">'+(a.type==="Public"?"Marché public":"Client privé")+'</span></div>'+
      '<div class="prog"><div class="pl"><span>Dossier</span><b>'+a.pretes+' pièces prêtes sur '+a.exig+'</b></div><div class="pb"><i style="width:'+(a.pretes/a.exig*100)+'%"></i></div></div>'+
      (a.manq.length?'<div class="miss">'+a.manq.map(function(x){return '<span class="b nodot">'+esc(x)+'</span>';}).join("")+'</div>':'')+
      '</div>'+btns("ao",i,["Acheteur","Relancer l'équipe","Offre"])+'</article>'; }).join("")
    : '<p class="empty">Aucun appel d\'offres à rendre dans les 7 jours pour cette sélection.</p>';

  /* parcs */
  $("n-parc").textContent=pd.length;
  var np=state.more.parc? pd.length : Math.min(pd.length,lim("parc"));
  $("parc").innerHTML = pd.length? pd.slice(0,np).map(function(m,i){ var late=m.next<T;
    var ic=/Tronçonneuse|Scie/.test(m.type)?"saw":/Atomiseur|Souffleur/.test(m.type)?"fan":/hydraulique/i.test(m.type)?"drop":"gear";
    return '<article class="ac '+(late?"late":"soon")+'"><div class="ac-b"><div class="ac-top"><div style="display:flex;gap:12px;align-items:center"><div class="mico">'+I(ic)+'</div><div><div class="who">'+esc(mach(m))+'</div><div class="ctc">Série '+m.serie+'</div></div></div></div>'+
      '<div class="obj">'+esc(m.client)+'</div><div class="meta">'+m.civ+' '+esc(m.contact)+' · '+esc(m.ville)+' · '+esc(m.com)+'</div>'+
      '<div class="badges">'+(late?'<span class="b red">révision dépassée depuis le '+dd(m.next)+'</span>':'<span class="b o">révision le '+dd(m.next)+'</span>')+'<span class="b nodot">'+(m.rev? "révisée le "+dd(m.rev) : "jamais révisée")+'</span></div></div>'+
      btns("parc",i,["Appeler","Rappel","Devis atelier"])+'</article>'; }).join("")+moreBtn("parc",pd.length,np)
    : '<p class="empty">Aucune machine à réviser ce mois pour cette sélection.</p>';
}

/* ---------- volet d'action ---------- */
var lastMsg="";
function openPanel(ico,title,body){ $("pn-ico").innerHTML=I(ico); $("pn-t").textContent=title; $("pn-b").innerHTML=body; $("ov").classList.add("on"); }
function closePanel(){ $("ov").classList.remove("on"); }
function toast(t){ var e=$("toast"); e.textContent=t; e.classList.add("on"); clearTimeout(e._t); e._t=setTimeout(function(){e.classList.remove("on");},2600); }
var NOTE='<p class="note">Rien ne part depuis ce tableau : le message s\'envoie depuis le téléphone ou la boîte du commercial.</p>';
function action(a,k,i){
  if(k==="rel"){ var d=CUR.rel[+i];
    if(a==="call") openPanel("phone","Appeler "+d.civ+" "+d.contact,'<dl><dt>Client</dt><dd>'+esc(d.client)+', '+esc(d.ville)+'</dd><dt>Fonction</dt><dd>'+esc(d.fct)+'</dd><dt>Devis</dt><dd>'+d.n+' · '+M(d.mt)+' HT</dd><dt>Commercial</dt><dd>'+esc(d.com)+'</dd></dl><p style="margin:14px 0 6px;font-weight:650">Ce qu\'il faut obtenir pendant l\'appel</p><ul><li>Le devis a-t-il été reçu et lu ?</li><li>Qui décide, et pour quand ?</li><li>Faut-il ajuster les quantités, le délai ou les conditions ?</li><li>Une date de décision ou de visite.</li></ul>'+'<div class="pn-a"><button class="pri" data-done="Appel noté pour '+esc(d.client)+'">'+I("check")+'Noter l\'appel comme fait</button></div>');
    if(a==="relance"){ lastMsg=msgDevis(d); openPanel("send","Relancer par "+(d.canal==="E-mail"?"e-mail":"WhatsApp"),'<div class="msg">'+esc(lastMsg)+'</div><div class="pn-a"><button class="pri" data-copy="1">'+I("copy")+'Copier le message</button></div>'+NOTE); }
    if(a==="devis"){ var tva=Math.round(d.mt*0.18); openPanel("doc","Devis "+d.n,'<dl><dt>Client</dt><dd>'+esc(d.client)+'</dd><dt>Objet</dt><dd>'+esc(d.objet)+'</dd><dt>Gamme</dt><dd>'+esc(d.gamme)+'</dd><dt>Émis le</dt><dd>'+dd(d.date)+' par '+esc(d.com)+' ('+esc(d.soc)+')</dd><dt>Montant HT</dt><dd>'+M(d.mt)+'</dd><dt>TVA 18 %</dt><dd>'+M(tva)+'</dd><dt>Total TTC</dt><dd>'+M(d.mt+tva)+'</dd><dt>Validité</dt><dd>'+(d.valid>=T?"jusqu'au "+dd(d.valid):"échue le "+dd(d.valid)+", à mettre à jour")+'</dd><dt>Statut</dt><dd>'+d.st+'</dd></dl>'); }
  }
  if(k==="ao"){ var o=CUR.ao[+i];
    if(a==="call") openPanel("phone","Appeler l'acheteur",'<dl><dt>Acheteur</dt><dd>'+esc(o.ach)+'</dd><dt>Objet</dt><dd>'+esc(o.objet)+'</dd><dt>Date limite</dt><dd>'+longDate(o.lim)+', '+o.h+'</dd></dl><p style="margin:14px 0 6px;font-weight:650">Questions à poser</p><ul><li>Confirmer la date et l\'heure de dépôt.</li><li>Faire préciser les pièces exigées et leur forme.</li>'+(o.manq.length?'<li>Vérifier ce qui est attendu pour : '+o.manq.map(function(x){return x.toLowerCase();}).join(", ")+'.</li>':'')+'</ul>');
    if(a==="relance"){ lastMsg="Bonjour "+o.resp+", pour l'appel d'offres "+o.n+" ("+o.objet+"), à rendre le "+shortDate(o.lim)+" à "+o.h+", il manque encore : "+(o.manq.length?o.manq.join(", ").toLowerCase():"aucune pièce")+". Peux-tu me dire quand ces pièces seront prêtes ?"; openPanel("send","Relancer l'équipe sur le dossier",'<div class="msg">'+esc(lastMsg)+'</div><div class="pn-a"><button class="pri" data-copy="1">'+I("copy")+'Copier le message</button></div><p class="note">Message interne : il reste dans l\'équipe.</p>'); }
    if(a==="devis") openPanel("doc","Offre "+o.n,'<dl><dt>Objet</dt><dd>'+esc(o.objet)+'</dd><dt>Société</dt><dd>'+esc(o.soc)+'</dd><dt>Montant estimé</dt><dd>'+M(o.mt)+' HT</dd><dt>Dossier</dt><dd>'+o.pretes+' pièces prêtes sur '+o.exig+'</dd><dt>Responsable</dt><dd>'+esc(o.resp)+'</dd></dl><p class="note">Le bordereau des prix se prépare dans le classeur « SACRI · Vendre » et se valide par la direction avant dépôt.</p>');
  }
  if(k==="parc"){ var m=CUR.parc[+i];
    if(a==="call") openPanel("phone","Appeler "+m.civ+" "+m.contact,'<dl><dt>Client</dt><dd>'+esc(m.client)+', '+esc(m.ville)+'</dd><dt>Fonction</dt><dd>'+esc(m.fct)+'</dd><dt>Machine</dt><dd>'+esc(mach(m))+' · série '+m.serie+'</dd><dt>Révision</dt><dd>'+(m.next<T?"dépassée depuis le ":"prévue le ")+dd(m.next)+'</dd></dl><div class="pn-a"><button class="pri" data-done="Rendez-vous atelier à noter pour '+esc(m.client)+'">'+I("check")+'Noter le rendez-vous</button></div>');
    if(a==="relance"){ lastMsg=msgParc(m); openPanel("send","Rappel de révision par "+(m.canal==="E-mail"?"e-mail":"WhatsApp"),'<div class="msg">'+esc(lastMsg)+'</div><div class="pn-a"><button class="pri" data-copy="1">'+I("copy")+'Copier le message</button></div>'+NOTE); }
    if(a==="devis") openPanel("doc","Devis de révision",'<dl><dt>Client</dt><dd>'+esc(m.client)+'</dd><dt>Machine</dt><dd>'+esc(mach(m))+' · série '+m.serie+'</dd><dt>Achetée le</dt><dd>'+dd(m.achat)+'</dd><dt>Dernière révision</dt><dd>'+(m.rev?dd(m.rev):"aucune")+'</dd></dl><p class="note">Le prix de la révision et des pièces se chiffre avec l\'atelier : aucun tarif n\'est affiché ici.</p>');
  }
}
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-a]"); if(b){ action(b.getAttribute("data-a"),b.getAttribute("data-k"),b.getAttribute("data-i")); return; }
  var mo=e.target.closest("[data-more]"); if(mo){ state.more[mo.getAttribute("data-more")]=true; if(mo.getAttribute("data-more")==="tab") renderTable(); else renderJour(); return; }
  if(e.target.closest("[data-copy]")){ var ok=function(){toast("Message copié : à coller dans WhatsApp ou dans l'e-mail");}; if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(lastMsg).then(ok,ok);} else ok(); return; }
  var dn=e.target.closest("[data-done]"); if(dn){ closePanel(); toast(dn.getAttribute("data-done")); return; }
  if(e.target.id==="ov"||e.target.closest("#pn-x")) closePanel();
  var sc=e.target.closest("[data-soc]"); if(sc){ var s=sc.getAttribute("data-soc"); setSoc(state.soc===s?"Tous":s); document.getElementById("titre").scrollIntoView({behavior:"smooth"}); }
});
document.addEventListener("keydown",function(e){ if(e.key==="Escape") closePanel(); });

/* ---------- sociétés ---------- */
function renderSocs(){
  var all=D.devis.filter(function(d){return comOK(d.com);}), mx=1;
  var rows=D.societes.map(function(s){ var d=all.filter(function(x){return x.soc===s;}), ec=enCours(d);
    var ao=D.ao.filter(function(a){return a.soc===s&&comOK(a.resp)&&(a.st==="À étudier"||a.st==="En préparation");}).length;
    var pr=D.parc.filter(function(m){return m.soc===s&&comOK(m.com)&&m.due;}).length;
    var r={s:s,ec:sum(ec,mt),n:ec.length,g:sum(won(d),mt),t:taux(d),du:dues(d).length,ao:ao,pr:pr}; mx=Math.max(mx,r.ec); return r; });
  $("socg").innerHTML = rows.map(function(r){
    return '<button type="button" class="sc'+(state.soc===r.s?" on":"")+'" data-soc="'+esc(r.s)+'"><div class="lg"><img src="assets/'+LOGO[r.s]+'?v=20261119a" alt="'+esc(r.s)+'"></div><div class="sv">'+Mc(r.ec)+'</div><div class="sl">en cours · '+r.n+' devis · gagné '+Mc(r.g)+'</div><div class="bar"><i style="width:'+(r.ec/mx*100)+'%;background:#E95B0F"></i></div>'+
      '<div class="sr">'+(r.t===null?'<span class="b nodot">aucun devis tranché</span>':'<span class="b '+(r.t>=0.5?"ok":"red")+'">'+pct(r.t)+' transformé</span>')+(r.du?'<span class="b o">'+r.du+' relance'+(r.du>1?'s':'')+'</span>':'')+(r.ao?'<span class="b blue">'+r.ao+' AO actif'+(r.ao>1?'s':'')+'</span>':'')+(r.pr?'<span class="b nodot">'+r.pr+' révision'+(r.pr>1?'s':'')+'</span>':'')+'</div></button>'; }).join("");
}

/* ---------- tableau des devis ---------- */
function renderTable(){
  var l=devis().filter(function(d){
    if(state.st==="EC" && ENC.indexOf(d.st)<0) return false;
    if(state.st!=="Tous" && state.st!=="EC" && d.st!==state.st) return false;
    if(state.q){ var h=(d.n+" "+d.client+" "+d.objet+" "+d.gamme+" "+d.ville+" "+d.com).toLowerCase(); if(h.indexOf(state.q)<0) return false; }
    return true; }).sort(function(a,b){return a.date<b.date?1:-1;});
  var cls={"Gagné":"ok","Perdu":"red","En négociation":"blue","Relancé":"o","Envoyé":"o"};
  $("t-devis").innerHTML='<thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Objet</th><th>Société</th><th>Commercial</th><th class="n">Montant HT</th><th>Statut</th><th>Prochaine relance</th></tr></thead><tbody>'+
    l.slice(0,state.more.tab?l.length:lim("tab")).map(function(d){ return '<tr><td data-l="N°">'+d.n+'</td><td data-l="Date">'+dd(d.date)+'</td><td data-l="Client">'+esc(d.client)+'<div class="sub">'+esc(d.ville)+'</div></td><td data-l="Objet">'+esc(d.objet)+'</td><td data-l="Société">'+esc(d.soc)+'</td><td data-l="Commercial">'+esc(d.com)+'</td><td class="n" data-l="Montant HT">'+M(d.mt)+'</td><td data-l="Statut"><span class="b '+(cls[d.st]||"")+'">'+d.st+(d.motif?" · "+d.motif.toLowerCase():"")+'</span></td><td data-l="Prochaine relance">'+(d.prev? (d.prev<=T?'<b style="color:#C0392B">'+dd(d.prev)+'</b>':dd(d.prev)) : "–")+'</td></tr>'; }).join("")+'</tbody>';
  var sh=state.more.tab?l.length:Math.min(l.length,lim("tab"));
  $("t-count").innerHTML=l.length+" devis"+" · "+M(sum(l,mt))+" HT au total"+(sh<l.length?' · '+sh+' affichés <button type="button" class="more" style="margin-left:8px" data-more="tab">Afficher les '+(l.length-sh)+' autres</button>':'');
}

function render(){
  $("titre").textContent = state.soc==="Tous" ? "Groupe SACRI" : state.soc;
  $("metier").textContent = state.soc==="Tous" ? "Ventes, affaires du jour, appels d'offres et entretien des parcs pour les cinq sociétés du groupe : SACRI, Trans-Roulements, SAFIR, PST-CI et DEFI." : D.metiers[state.soc];
  renderKpis(); renderVentes(); renderJour(); renderSocs(); renderTable();
}
$("today").textContent = longDate(T);
buildFilters(); render();
})();
