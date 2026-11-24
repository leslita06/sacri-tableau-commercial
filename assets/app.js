(function(){
"use strict";
var D=window.DATA, ICO=window.ICO, T=D.today;
var $=function(id){return document.getElementById(id);};
var ENC=["Envoyé","Relancé","En négociation"];
var nf=new Intl.NumberFormat("fr-FR");
function fm(n){return nf.format(Math.round(n)).replace(/\u202f|\u00a0/g,"\u00a0");}
function M(n){return fm(n)+" FCFA";}
function Mc(n){if(n>=1e6){var v=Math.round(n/1e5)/10;return v.toString().replace(".",",")+" M";}if(n>=1e3)return Math.round(n/1e3)+" k";return fm(n);}
function pct(x){return Math.round(x*100)+" %";}
function dobj(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function isoD(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function addD(s,n){var d=dobj(s);d.setDate(d.getDate()+n);return isoD(d);}
function days(a,b){return Math.round((dobj(b)-dobj(a))/864e5);}
function dd(s){var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];}
function ds(s){var p=s.split("-");return p[2]+"/"+p[1];}
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],MC=["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."],JRS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function longD(s){var d=dobj(s);return JRS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();}
function shortD(s){var d=dobj(s);return JRS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()];}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function ic(n,c){return '<svg class="i'+(c?" "+c:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+"</svg>";}
function sum(a,f){return a.reduce(function(s,x){return s+(f?f(x):x);},0);}
function mt(d){return d.mt;}
function pl(n,s,p){return n+" "+(n>1?(p||(/s$/.test(s)?s:s+"s")):s);}

var LOGO={"SACRI":"logo-sacri.png","Trans-Roulements":"logo-trans.png","SAFIR":"logo-safir.png","PST-CI":"logo-pst.png","DEFI":"logo-defi.png"};
var SICO={"SACRI":"trees","Trans-Roulements":"cog","SAFIR":"axe","PST-CI":"gauge","DEFI":"factory"};
function lgt(s){return '<span class="lgt" title="'+esc(s)+'">'+ic(SICO[s]||"building-2")+'</span>';}
var OBJ={"SACRI":12000000,"Trans-Roulements":3000000,"SAFIR":4000000,"PST-CI":4000000,"DEFI":7000000};
var COMS=D.commerciaux;
function ini(n){return n.replace(/\./g,"").split(" ").map(function(x){return x.charAt(0);}).join("").toUpperCase();}
function av(n,sm){var k=COMS.indexOf(n);return '<span class="av c'+((k<0?0:k)%4+1)+(sm?" sm":"")+'">'+ini(n)+"</span>";}
function cini(n){var w=n.replace(/[’']/g," ").split(/[\s-]+/).filter(function(x){return x&&!/^(du|des|de|d|la|le|l|et|en|au|aux)$/i.test(x);});return ((w[0]||"").charAt(0)+((w[1]||w[0]||"").charAt(w[1]?0:1))).toUpperCase();}
function famille(g){
  if(/STIHL/.test(g))return "STIHL, forêt et espaces verts";
  if(/coupe/i.test(g))return "Scies et outils de coupe";
  if(/NTN|Optibelt/.test(g))return "Roulements et transmission";
  if(/Parker|Hi-Force|Danfoss|Pneumatique/.test(g))return "Hydraulique et pneumatique";
  if(/métallique|Tuyauterie|chaudronnerie/i.test(g))return "Construction métallique";
  return "Outillage et lubrifiants";
}
var STB={"Brouillon":"n","Envoyé":"n","Relancé":"a","En négociation":"b","Gagné":"g","Perdu":"r"};
function stp(s){return '<span class="pill '+(STB[s]||"n")+'"><span class="dot"></span>'+s+"</span>";}

/* ---------- état ---------- */
var CAP=!!window.__CAPTURE;
var state={v:"jour",soc:"Tous",com:"Tous",qr:"",qd:"",fr:"Tous",fd:"EC",more:false};
function socOK(s){return state.soc==="Tous"||s===state.soc;}
function comOK(c){return state.com==="Tous"||c===state.com;}
function devis(){return D.devis.filter(function(d){return socOK(d.soc)&&comOK(d.com);});}
function aos(){return D.ao.filter(function(a){return socOK(a.soc)&&comOK(a.resp);});}
function parcs(){return D.parc.filter(function(m){return socOK(m.soc)&&comOK(m.com);});}
function enCours(l){return l.filter(function(d){return ENC.indexOf(d.st)>=0;});}
function dues(l,at){at=at||T;return enCours(l).filter(function(d){return d.prev&&d.prev<=at&&d.date<=at;}).sort(function(a,b){return a.prev<b.prev?-1:a.prev>b.prev?1:b.mt-a.mt;});}
function aoSoon(l){return l.filter(function(a){var k=days(T,a.lim);return (a.st==="À étudier"||a.st==="En préparation")&&k>=0&&k<=7;}).sort(function(a,b){return a.lim<b.lim?-1:1;});}
function parcDue(l){return l.filter(function(m){return m.due;}).sort(function(a,b){return a.next<b.next?-1:1;});}
function won(l){return l.filter(function(d){return d.st==="Gagné";});}
function lost(l){return l.filter(function(d){return d.st==="Perdu";});}
function taux(l){var g=sum(won(l),mt),p=sum(lost(l),mt);return g+p?g/(g+p):null;}
function late(d){return days(d.prev,T);}

/* ---------- petits graphiques ---------- */
function spark(vals,opt){opt=opt||{};var w=92,h=36,n=vals.length,mx=Math.max.apply(null,vals.concat([1])),mn=opt.zero?0:Math.min.apply(null,vals);if(mx===mn)mx=mn+1;
  var pts=vals.map(function(v,i){return [(i/(n-1))*w,h-3-((v-mn)/(mx-mn))*(h-8)];});
  var d=pts.map(function(p,i){return (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1);}).join(" ");
  var col=opt.col||"#A3A3A0",last=pts[n-1];
  return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><path d="'+d+' L'+w+' '+h+' L0 '+h+' Z" fill="'+col+'" fill-opacity=".08" stroke="none"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="2.6" fill="'+(opt.dot||col)+'"/></svg>';}
function bars(vals,hot){var mx=Math.max.apply(null,vals.concat([1]));return '<svg viewBox="0 0 92 36" preserveAspectRatio="none">'+vals.map(function(v,i){var bw=92/vals.length,hh=Math.max(2,v/mx*32);return '<rect x="'+(i*bw+1.5).toFixed(1)+'" y="'+(36-hh).toFixed(1)+'" width="'+(bw-3).toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="1.5" fill="'+(i===vals.length-1?(hot||"#E95B0F"):"#D4D4D0")+'"/>';}).join("")+"</svg>";}
function dl(v,cls,txt){return '<span class="dl '+cls+'">'+v+"</span>"+(txt?" "+txt:"");}
function kc(o){var tag=o.go?'button type="button" data-goto="'+o.go+'"':"div";return "<"+tag+' class="kc'+(o.key?" key":"")+'"><p class="l">'+ic(o.ico)+o.l+'</p><div class="vr"><p class="v">'+o.v+(o.u?"<small>"+o.u+"</small>":"")+"</p>"+(o.sp?'<div class="sp">'+o.sp+"</div>":"")+'</div><div class="s">'+o.s+"</div></"+(o.go?"button":"div")+">";}

/* ---------- navigation ---------- */
var VIEWS={jour:"Aujourd'hui",relances:"Relances",devis:"Devis",ventes:"Ventes",echeances:"Échéances"};
function go(v,noScroll){if(!VIEWS[v])v="jour";state.v=v;
  [].forEach.call(document.querySelectorAll(".view"),function(e){e.classList.toggle("on",e.id==="v-"+v);});
  [].forEach.call(document.querySelectorAll("[data-v]"),function(e){e.classList.toggle("on",e.getAttribute("data-v")===v);});
  $("crumb-v").textContent=VIEWS[v];
  if(location.hash.slice(1)!==v)history.replaceState(null,"","#"+v);
  render();if(!noScroll)window.scrollTo(0,0);}

/* ---------- filtres ---------- */
function socMenu(){var all=["Tous"].concat(D.societes),dv=D.devis.filter(function(d){return comOK(d.com);});
  $("soc-m").innerHTML=all.map(function(s,i){var ec=enCours(s==="Tous"?dv:dv.filter(function(d){return d.soc===s;}));
    return (i===1?'<div class="msep"></div>':"")+'<button class="mi'+(state.soc===s?" on":"")+'" data-soc="'+esc(s)+'">'+(s==="Tous"?'<span class="lgt">'+ic("building-2")+"</span>":lgt(s))+"<span>"+(s==="Tous"?"Toutes les sociétés":esc(s))+"<small>"+pl(ec.length,"devis")+" en cours · "+Mc(sum(ec,mt))+"</small></span>"+ic("check","ck")+"</button>";}).join("");
  $("soc-l").textContent=state.soc==="Tous"?"Toutes les sociétés":state.soc;
  $("soc-t").innerHTML=state.soc==="Tous"?"":lgt(state.soc);
  $("soc-b").classList.toggle("on",state.soc!=="Tous");
  var dvs=D.devis.filter(function(d){return socOK(d.soc);});
  $("side-socs").innerHTML=D.societes.map(function(s){var du=dues(dvs.filter(function(d){return d.soc===s&&comOK(d.com);})),lt=du.filter(function(d){return late(d)>0;}).length;
    return '<button class="ni'+(state.soc===s?" on":"")+'" data-soc="'+esc(s)+'">'+lgt(s)+esc(s)+'<span class="sd '+(lt?"r":du.length?"a":"g")+'"></span></button>';}).join("");}
function comMenu(){var all=["Tous"].concat(COMS),dv=D.devis.filter(function(d){return socOK(d.soc);});
  $("com-m").innerHTML=all.map(function(c,i){var du=dues(c==="Tous"?dv:dv.filter(function(d){return d.com===c;}));
    return (i===1?'<div class="msep"></div>':"")+'<button class="mi'+(state.com===c?" on":"")+'" data-com="'+esc(c)+'">'+(c==="Tous"?'<span class="lgt">'+ic("users")+"</span>":av(c))+"<span>"+(c==="Tous"?"Tous les commerciaux":esc(c))+"<small>"+(du.length?pl(du.length,"relance")+" à faire":"aucune relance due")+"</small></span>"+ic("check","ck")+"</button>";}).join("");
  $("com-l").textContent=state.com==="Tous"?"Tous les commerciaux":state.com;
  $("com-b").classList.toggle("on",state.com!=="Tous");}
function setSoc(s){state.soc=s;state.more=false;closeMenus();render();}
function setCom(c){state.com=c;state.more=false;closeMenus();render();}
function closeMenus(){$("soc-m").classList.remove("on");$("com-m").classList.remove("on");}

/* ---------- AUJOURD'HUI ---------- */
function renderJour(){
  var dv=devis(),ec=enCours(dv),du=dues(dv),lt=du.filter(function(d){return late(d)>0;}),ao=aoSoon(aos()),pd=parcDue(parcs()),t=taux(dv);
  var duM=sum(du,mt);
  var who=state.soc==="Tous"?"":" chez "+state.soc;
  $("lede").innerHTML=du.length?
    "Sur un catalogue de plusieurs milliers de références, un devis qui n'est pas relancé est une vente qui part ailleurs. Aujourd'hui"+esc(who)+" : <b>"+pl(du.length,"devis")+" à relancer pour "+Mc(duM)+" FCFA HT</b>"+(lt.length?', dont <span class="r">'+lt.length+" en retard</span>":"")+", sur <b>"+fm(sum(ec,mt))+" FCFA HT</b> de devis en cours."
    :"Aucune relance due aujourd'hui pour cette sélection : "+pl(ec.length,"devis")+" en cours pour "+fm(sum(ec,mt))+" FCFA HT.";
  /* séries */
  var wk=[];for(var i=13;i>=0;i--)wk.push(addD(T,-i));
  var bk=wk.map(function(x){return dues(dv,x).length;});
  var b7=dues(dv,addD(T,-7)).length,dv7=du.length-b7;
  var weeks=[];for(var k=11;k>=0;k--){var a=addD(T,-7*k-6),b=addD(T,-7*k);weeks.push(sum(dv.filter(function(d){return d.st!=="Brouillon"&&d.date>=a&&d.date<=b;}),mt));}
  var mNow=T.slice(0,8)+"01",prevStart=isoD(new Date(dobj(T).getFullYear(),dobj(T).getMonth()-1,1)),prevEnd=isoD(new Date(dobj(T).getFullYear(),dobj(T).getMonth()-1,dobj(T).getDate()));
  var emN=sum(dv.filter(function(d){return d.st!=="Brouillon"&&d.date>=mNow&&d.date<=T;}),mt),emP=sum(dv.filter(function(d){return d.st!=="Brouillon"&&d.date>=prevStart&&d.date<=prevEnd;}),mt);
  var evo=emP?(emN-emP)/emP:null;
  var tc=[];for(var j=11;j>=0;j--){var lim=addD(T,-7*j);var x=taux(dv.filter(function(d){return d.date<=lim;}));if(x!==null)tc.push(x);}
  if(tc.length<2)tc=[0,0];
  var eos=isoD(new Date(dobj(T).getFullYear(),dobj(T).getMonth()-1,0)),tPrev=taux(dv.filter(function(d){return d.date<=eos&&d.date.slice(0,7)===eos.slice(0,7);}));
  var w7='<div class="wk7">'+[0,1,2,3,4,5,6,7].map(function(n){var day=addD(T,n),c=ao.filter(function(a){return a.lim===day;}).length;return '<i class="'+(c?(n<=3?"hot":"on"):"")+'" style="height:'+(c?14+c*10:6)+'px"></i>';}).join("")+"</div>";
  $("kpis").innerHTML=
    kc({go:"relances",ico:"bell-ring",l:"Relances à faire",v:du.length,sp:spark(bk,{col:"#8F8F8B",dot:lt.length?"#C8352B":"#8F8F8B",zero:true}),
      s:(lt.length?dl(lt.length+" en retard","bad"):dl("à jour","up"))+" "+(dv7?dl((dv7>0?"▲ +":"▼ ")+dv7,dv7>0?"dn":"up","vs il y a 7 jours"):"stable sur 7 jours")})+
    kc({go:"devis",key:1,ico:"file-text",l:"Devis en cours",v:fm(sum(ec,mt)),u:"FCFA HT",sp:bars(weeks),
      s:(evo===null?"":dl((evo>=0?"▲ +":"▼ ")+Math.round(Math.abs(evo)*100)+" %",evo>=0?"up":"dn","émis ce mois vs octobre, même date"))+" · "+pl(ec.length,"devis")})+
    kc({go:"ventes",ico:"target",l:"Transformés, en montant",v:t===null?"–":pct(t),sp:spark(tc,{col:"#8F8F8B"}),
      s:(t!==null&&tPrev!==null?dl((t>=tPrev?"▲ +":"▼ ")+Math.round(Math.abs(t-tPrev)*100)+" pts",t>=tPrev?"up":"dn","vs les devis de "+MOIS[dobj(eos).getMonth()]):"aucun devis tranché")})+
    kc({go:"echeances",ico:"landmark",l:"Appels d'offres sous 7 jours",v:ao.length,sp:w7,
      s:ao.length?dl(Mc(sum(ao,function(a){return a.mt;}))+" FCFA","nt","estimés, le premier "+ds(ao[0].lim)):"aucune échéance proche"});
  /* relances prioritaires */
  var top=du.slice(0,6);
  $("j-rel").innerHTML=top.length?top.map(function(d){var k=late(d);
    return '<div class="li" data-open="rel" data-n="'+d.n+'"><div class="who"><span class="av cl">'+cini(d.client)+'</span><div><p class="nm">'+esc(d.client)+'</p><p class="mt2">'+esc(d.objet)+'</p><div class="tags">'+(k>0?'<span class="pill r">'+k+" j de retard</span>":'<span class="pill o">aujourd\'hui</span>')+'<span class="pill n">'+d.n+"</span></div></div></div>"+
      '<div class="rr">'+av(d.com,1)+'<span class="amt">'+Mc(d.mt)+'</span><span class="rowact"><button class="ib" title="Préparer la relance" data-act="msg" data-n="'+d.n+'">'+ic("send")+"</button></span></div></div>";}).join("")+(du.length>6?'<button class="more" data-goto="relances">Voir les '+(du.length-6)+" autres relances</button>":""):'<p class="empty">Aucune relance due pour cette sélection.</p>';
  /* appels d'offres */
  $("j-ao").innerHTML=ao.length?ao.map(function(a){var k=days(T,a.lim),miss=a.exig-a.pretes;
    return '<div class="li" data-open="ao" data-n="'+a.n+'"><div class="who">'+lgt(a.soc)+'<div><p class="nm">'+esc(a.objet)+'</p><p class="mt2">'+esc(a.ach)+"</p></div></div>"+
      '<div class="rr"><span class="pill '+(k<=3?"r":"n")+'">'+(k?"J-"+k:"aujourd'hui")+"</span></div></div>";}).join(""):'<p class="empty">Aucun appel d\'offres à rendre sous 7 jours.</p>';
  $("j-parc").innerHTML='<button class="mini-h" data-goto="echeances" style="width:100%"><span class="ic">'+ic("wrench")+'</span><span><p class="t">Machines à réviser ce mois</p><p class="s">'+(pd.length?"chez "+pl(new Set(pd.map(function(m){return m.client;})).size,"client")+", "+pd.filter(function(m){return m.next<T;}).length+" révisions déjà dépassées":"aucune révision due")+'</p></span><span class="n">'+pd.length+"</span></button>";
  /* par commercial */
  var all=D.devis.filter(function(d){return socOK(d.soc);});
  var rows=COMS.map(function(c){var d=all.filter(function(x){return x.com===c;}),e=enCours(d),u=dues(d);return {c:c,e:sum(e,mt),n:e.length,du:u.length,lt:u.filter(function(x){return late(x)>0;}).length,g:sum(won(d),mt),t:taux(d),ao:aoSoon(D.ao.filter(function(a){return socOK(a.soc)&&a.resp===c;})).length};}).sort(function(a,b){return b.du-a.du||b.e-a.e;});
  $("t-coms").innerHTML='<thead><tr><th>Commercial</th><th class="r">À relancer</th><th class="r">Devis en cours</th><th class="r">Gagné depuis sept.</th><th class="r hm">Transformé</th><th class="r hm">Appels d\'offres</th></tr></thead><tbody>'+
    rows.map(function(r){return '<tr data-com="'+esc(r.c)+'"'+(state.com===r.c?' class="on"':"")+'><td class="w"><span class="com">'+av(r.c)+"<b>"+esc(r.c)+'</b></span></td><td class="r" data-l="À relancer">'+(r.du?'<span class="pill '+(r.lt?"r":"o")+'">'+r.du+(r.lt?" dont "+r.lt+" en retard":"")+"</span>":'<span class="zero">aucune</span>')+'</td><td class="num" data-l="En cours">'+Mc(r.e)+"<small>"+pl(r.n,"devis")+'</small></td><td class="num" data-l="Gagné">'+(r.g?Mc(r.g):'<span class="zero">–</span>')+'</td><td class="r hm" data-l="Transformé">'+(r.t===null?'<span class="zero">–</span>':pct(r.t))+'</td><td class="r hm" data-l="Appels d\'offres">'+(r.ao||'<span class="zero">–</span>')+"</td></tr>";}).join("")+"</tbody>";
}

/* ---------- RELANCES ---------- */
function renderRel(){
  var du=dues(devis()),lt=du.filter(function(d){return late(d)>0;}),td=du.filter(function(d){return late(d)===0;}),gros=du.filter(function(d){return d.mt>=5e6;});
  $("lede-rel").innerHTML=du.length?pl(du.length,"devis")+" à relancer pour <b>"+M(sum(du,mt))+" HT</b>. Les plus en retard d'abord, puis les plus gros. Chaque ligne ouvre le message prêt à copier, rédigé avec le numéro de devis, l'objet et la validité.":"Aucune relance due pour cette sélection.";
  var segs=[["Tous","Toutes",du.length],["late","En retard",lt.length],["today","Aujourd'hui",td.length],["big","5 M et plus",gros.length]];
  $("seg-rel").innerHTML=segs.map(function(s){return '<button data-fr="'+s[0]+'" class="'+(state.fr===s[0]?"on":"")+'">'+s[1]+' <span class="c">'+s[2]+"</span></button>";}).join("");
  var l=state.fr==="late"?lt:state.fr==="today"?td:state.fr==="big"?gros:du;
  if(state.qr)l=l.filter(function(d){return (d.n+" "+d.client+" "+d.objet+" "+d.gamme+" "+d.ville+" "+d.contact).toLowerCase().indexOf(state.qr)>=0;});
  $("t-rel").innerHTML=l.length?'<thead><tr><th>Client</th><th>Devis</th><th class="r">Montant HT</th><th>Retard</th><th class="hm">Relances faites</th><th>Commercial</th><th></th></tr></thead><tbody>'+
    l.map(function(d){var k=late(d);return '<tr data-open="rel" data-n="'+d.n+'"><td class="w"><div class="who"><span class="av cl">'+cini(d.client)+'</span><div><p class="nm">'+esc(d.client)+'</p><p class="mt2">'+d.civ+" "+esc(d.contact)+" · "+esc(d.ville)+'</p></div></div></td><td class="obj w" data-l="Devis"><b>'+esc(d.objet)+"</b><small>"+d.n+" du "+ds(d.date)+" · "+esc(famille(d.gamme))+'</small></td><td class="num" data-l="Montant HT">'+Mc(d.mt)+'</td><td data-l="Retard">'+(k>0?'<span class="pill r">'+k+" j</span>":'<span class="pill o">aujourd\'hui</span>')+'</td><td class="hm" data-l="Relances faites"><span class="stp"><span class="steps">'+[1,2,3].map(function(s){return '<i class="'+(s<=d.nbr?"on":"")+'"></i>';}).join("")+"</span>"+(d.nbr?d.nbr+" / 3":"jamais")+'</span></td><td data-l="Commercial"><span class="com">'+av(d.com,1)+esc(d.com)+'</span></td><td class="act"><span class="rowact"><button class="ib" title="Appeler" data-act="call" data-n="'+d.n+'">'+ic("phone")+'</button><button class="ib" title="Copier la relance" data-act="msg" data-n="'+d.n+'">'+ic("copy")+"</button></span></td></tr>";}).join("")+"</tbody>":'<tbody><tr><td><p class="empty">Aucune relance pour ce filtre.</p></td></tr></tbody>';
}

/* ---------- DEVIS ---------- */
function renderDev(){
  var dv=devis(),ec=enCours(dv),g=won(dv);
  var env=dv.filter(function(d){return d.st!=="Brouillon";}),rel=env.filter(function(d){return d.nbr>0;}),ng=env.filter(function(d){return d.st==="En négociation"||d.st==="Gagné";});
  $("lede-dev").innerHTML=pl(env.length,"devis")+" envoyés depuis le 1er septembre pour "+Mc(sum(env,mt))+" FCFA HT. <b>"+pl(ec.length,"devis")+" en cours pour "+fm(sum(ec,mt))+" FCFA HT</b>, répartis sur "+new Set(ec.map(function(d){return famille(d.gamme);})).size+" gammes du catalogue.";
  var st=[["Envoyés",env],["Relancés au moins une fois",rel],["En négociation ou gagnés",ng],["Gagnés",g]],mx=Math.max(env.length,1);
  $("fun").innerHTML=st.map(function(s,i){var w=Math.max(8,s[1].length/mx*100),inside=w>45;
    return '<div class="fr'+(i===3?" win":"")+'"><div class="fl">'+s[0]+"<small>"+(i?pct(env.length?s[1].length/env.length:0)+" des envoyés":"base")+'</small></div><div class="ft"><i style="width:'+w+'%"></i><span style="'+(inside?"left:12px":"left:calc("+w+"% + 10px)")+(inside&&i===3?";color:#fff":"")+'">'+s[1].length+"<em"+(inside&&i===3?' style="color:#FBE3D6"':"")+">"+Mc(sum(s[1],mt))+"</em></span></div></div>";}).join("");
  var br=dv.filter(function(d){return d.st==="Brouillon";});
  $("fun-n").innerHTML=br.length?"<b>"+pl(br.length,"brouillon")+"</b> pas encore "+(br.length>1?"envoyés":"envoyé")+" ("+Mc(sum(br,mt))+" FCFA HT).":"Aucun brouillon en attente d'envoi.";
  var fam={};ec.forEach(function(d){var f=famille(d.gamme);fam[f]=(fam[f]||0)+d.mt;});
  var fl=Object.keys(fam).sort(function(a,b){return fam[b]-fam[a];}),fx=fl.length?fam[fl[0]]:1,tot=sum(ec,mt);
  $("gam").innerHTML=fl.length?fl.map(function(f,i){return '<div class="r'+(i===0?" top":"")+'"><span class="n">'+f+'</span><span class="t"><i style="width:'+(fam[f]/fx*100)+'%"></i></span><span class="v">'+Mc(fam[f])+"</span></div>";}).join(""):'<p class="empty">Aucun devis en cours.</p>';
  $("gam-n").innerHTML=fl.length?"<b>"+fl[0]+"</b> : "+pct(fam[fl[0]]/tot)+" du montant en cours.":"";
  var cnt=function(f){return dv.filter(f).length;};
  var segs=[["EC","En cours",ec.length],["Tous","Tous",dv.length],["Gagné","Gagnés",g.length],["Perdu","Perdus",lost(dv).length],["Brouillon","Brouillons",br.length]];
  $("seg-dev").innerHTML=segs.map(function(s){return '<button data-fd="'+s[0]+'" class="'+(state.fd===s[0]?"on":"")+'">'+s[1]+' <span class="c">'+s[2]+"</span></button>";}).join("");
  var l=dv.filter(function(d){if(state.fd==="EC")return ENC.indexOf(d.st)>=0;if(state.fd==="Tous")return true;return d.st===state.fd;});
  if(state.qd)l=l.filter(function(d){return (d.n+" "+d.client+" "+d.objet+" "+d.gamme+" "+d.ville+" "+d.com).toLowerCase().indexOf(state.qd)>=0;});
  l.sort(function(a,b){return a.date<b.date?1:-1;});
  var lim=state.more?l.length:Math.min(l.length,window.innerWidth<700?8:12);
  $("t-dev").innerHTML=l.length?'<thead><tr><th>Client</th><th>Objet</th><th class="hm">Société</th><th>Commercial</th><th class="r">Montant HT</th><th>Statut</th><th class="r hm">Émis le</th></tr></thead><tbody>'+
    l.slice(0,lim).map(function(d){return '<tr data-open="dev" data-n="'+d.n+'"><td class="w"><div class="who"><span class="av cl">'+cini(d.client)+'</span><div><p class="nm">'+esc(d.client)+'</p><p class="mt2">'+d.n+" · "+esc(d.ville)+'</p></div></div></td><td class="obj w" data-l="Objet"><b>'+esc(d.objet)+"</b><small>"+esc(famille(d.gamme))+'</small></td><td class="hm" data-l="Société">'+esc(d.soc)+'</td><td data-l="Commercial"><span class="com">'+av(d.com,1)+esc(d.com)+'</span></td><td class="num" data-l="Montant HT">'+Mc(d.mt)+'</td><td data-l="Statut">'+stp(d.st)+'</td><td class="r hm" data-l="Émis le">'+ds(d.date)+"</td></tr>";}).join("")+"</tbody>":'<tbody><tr><td><p class="empty">Aucun devis pour ce filtre.</p></td></tr></tbody>';
  $("more-dev").innerHTML=l.length>lim?'<button class="more" data-more="1">Voir les '+(l.length-lim)+" autres devis</button>":"";
}

/* ---------- VENTES ---------- */
var chart=null;
function renderVen(){
  var dv=devis(),g=won(dv),l=lost(dv),ec=enCours(dv),t=taux(dv),tr=g.length+l.length;
  $("lede-ven").innerHTML=g.length?"<b>"+M(sum(g,mt))+" HT</b> gagnés sur les devis émis depuis le 1er septembre, soit "+(t===null?"–":pct(t))+" du montant des devis tranchés.":"Aucun devis gagné pour cette sélection depuis le 1er septembre.";
  var months=["2026-09","2026-10","2026-11"],cm=T.slice(0,7);
  var real=months.map(function(m){return sum(g.filter(function(d){return d.date.slice(0,7)===m;}),mt);});
  var pend=months.map(function(m){return m===cm?sum(ec.filter(function(d){return d.date.slice(0,7)===m;}),mt):0;});
  var obj=state.com==="Tous"?sum(D.societes.filter(socOK),function(s){return OBJ[s];}):null;
  var gS=real[0],gO=real[1];
  $("kpis-v").innerHTML=
    kc({key:1,ico:"trending-up",l:"Gagné depuis septembre",v:fm(sum(g,mt)),u:"FCFA HT",sp:spark((function(){var o=[],cum=0,w=[];for(var k=11;k>=0;k--){var lim=addD(T,-7*k);o.push(sum(g.filter(function(d){return d.date<=lim;}),mt));}return o;})(),{col:"#8F8F8B",dot:"#E95B0F",zero:true}),s:dl(pl(g.length,"devis")+" gagné"+(g.length>1?"s":""),"nt")+(gS&&gO?" "+dl((gO>=gS?"▲ +":"▼ ")+Math.round(Math.abs(gO-gS)/gS*100)+" %",gO>=gS?"up":"dn","octobre vs septembre"):"")})+
    kc({ico:"target",l:"Transformés, en montant",v:t===null?"–":pct(t),sp:spark((function(){var o=[];for(var k=11;k>=0;k--){var lim=addD(T,-7*k),x=taux(dv.filter(function(d){return d.date<=lim;}));if(x!==null)o.push(x);}return o.length>1?o:[0,0];})(),{col:"#8F8F8B"}),s:tr?"<b>"+g.length+" gagnés</b> sur "+pl(tr,"devis")+" tranchés":"aucun devis tranché"})+
    kc({ico:"x",l:"Perdus",v:l.length?Mc(sum(l,mt)):"–",u:l.length?"FCFA HT":"",s:l.length?pl(l.length,"devis")+" · motif principal : "+(function(){var c={};l.forEach(function(d){var m=(d.motif||"non noté").toLowerCase();c[m]=(c[m]||0)+d.mt;});return Object.keys(c).sort(function(a,b){return c[b]-c[a];})[0];})():"aucun devis perdu"});
  if(chart){chart.destroy();chart=null;}
  var lbl=months.map(function(m){var k=+m.slice(5)-1;return MC[k]+(m===cm?" (en cours)":"");});
  chart=new Chart($("c-obj"),{type:"bar",data:{labels:lbl,datasets:[
      {label:"Gagné",data:real,backgroundColor:"#E95B0F",borderRadius:6,maxBarThickness:56,stack:"s"},
      {label:"En cours",data:pend,backgroundColor:"#E2E2DF",borderRadius:6,maxBarThickness:56,stack:"s"}]},
    options:{maintainAspectRatio:false,animation:false,layout:{padding:{top:28}},plugins:{legend:{display:false},tooltip:{backgroundColor:"#111",padding:10,cornerRadius:8,displayColors:false,callbacks:{label:function(c){return c.dataset.label+" : "+M(c.raw)+" HT";}}}},
      scales:{y:{stacked:true,beginAtZero:true,suggestedMax:obj?obj*1.2:undefined,ticks:{callback:function(x){return Mc(x);},maxTicksLimit:5,color:"#A3A3A0",font:{size:11}},grid:{color:"#F1F1EF"},border:{display:false}},x:{stacked:true,grid:{display:false},border:{display:false},ticks:{color:"#3D3D3D",font:{weight:"500",size:12},maxRotation:0}}}},
    plugins:[{id:"lb",afterDatasetsDraw:function(ch){var c=ch.ctx,m0=ch.getDatasetMeta(0),m1=ch.getDatasetMeta(1),ca=ch.chartArea;c.save();
      if(obj){var y=ch.scales.y.getPixelForValue(obj);c.setLineDash([5,5]);c.strokeStyle="#111";c.lineWidth=1.2;c.beginPath();c.moveTo(ca.left,y);c.lineTo(ca.right,y);c.stroke();c.setLineDash([]);c.font='500 11px "Inter",sans-serif';c.fillStyle="#111";c.textAlign="left";c.fillText("Objectif "+Mc(obj),ca.left+4,y-6);}
      c.textAlign="center";
      m0.data.forEach(function(b,i){var topY=pend[i]?m1.data[i].y:b.y;
        if(real[i]){c.font='600 12px "Inter",sans-serif';c.fillStyle="#fff";if(b.base-b.y>22)c.fillText(Mc(real[i]),b.x,b.y+18);if(obj&&b.base-b.y>44){c.font='400 11px "Inter",sans-serif';c.fillStyle="#FDE3D3";c.fillText(pct(real[i]/obj),b.x,b.y+34);}}
        if(pend[i]){c.font='600 12px "Inter",sans-serif';c.fillStyle="#3D3D3D";var mid=(m1.data[i].y+m1.data[i].base)/2;c.fillText(Mc(pend[i]),b.x,mid+2);c.font='400 11px "Inter",sans-serif';c.fillStyle="#6B6B6B";c.fillText("en cours",b.x,mid+16);}
      });
      c.restore();}}]});
  $("obj-leg").innerHTML='<span><i style="background:#E95B0F"></i>Gagné</span><span><i style="background:#E2E2DF"></i>Devis du mois encore en cours</span>'+(obj?'<span><i class="ln"></i>Objectif mensuel indicatif (% atteint dans la barre)</span>':'<span>L\'objectif est fixé par société, pas par commercial.</span>');
  var ls=l.slice().sort(function(a,b){return b.mt-a.mt;});
  $("lost").innerHTML=ls.length?ls.map(function(d){return '<div class="lost"><div class="who"><span class="av cl">'+cini(d.client)+'</span><div><p class="nm">'+esc(d.client)+'</p><p class="mt2">'+esc(d.objet)+'</p></div></div><div style="text-align:right"><p class="amt">'+Mc(d.mt)+'</p><p style="margin-top:6px"><span class="pill n">'+esc(d.motif||"motif non noté")+"</span></p></div></div>";}).join(""):'<p class="empty">Aucun devis perdu pour cette sélection.</p>';
}

/* ---------- ÉCHÉANCES ---------- */
function mach(m){return (m.type+" "+(m.marque!=="À préciser"?m.marque:"")+" "+(m.modele!=="À préciser"?m.modele:"")).replace(/\s+/g," ").trim();}
function renderEch(){
  var ao=aoSoon(aos()),pd=parcDue(parcs());
  $("lede-ech").innerHTML=(ao.length?"<b>"+pl(ao.length,"appel")+" d'offres</b> à rendre sous 7 jours pour "+Mc(sum(ao,function(a){return a.mt;}))+" FCFA HT estimés":"Aucun appel d'offres à rendre sous 7 jours")+", et <b>"+pl(pd.length,"machine")+" à réviser</b> ce mois : chaque révision est l'occasion d'un devis de pièces.";
  $("t-ao").innerHTML=ao.length?'<thead><tr><th>Appel d\'offres</th><th>Reste</th><th>Dossier</th><th class="r">Montant estimé</th><th class="hm">Société</th><th>Responsable</th><th></th></tr></thead><tbody>'+
    ao.map(function(a){var k=days(T,a.lim),p=a.pretes/a.exig;return '<tr data-open="ao" data-n="'+a.n+'"><td class="obj w"><b>'+esc(a.objet)+"</b><small>"+esc(a.ach)+" · "+(a.type==="Public"?"marché public":"client privé")+'</small></td><td data-l="Reste"><span class="cd'+(k<=3?" bad":"")+'">'+k+"<small>j · "+ds(a.lim)+", "+a.h+'</small></span></td><td data-l="Dossier"><span class="prog"><span class="tr"><i class="'+(k<=3&&p<1?"bad":"")+'" style="width:'+p*100+'%"></i></span>'+a.pretes+" / "+a.exig+'</span></td><td class="num" data-l="Montant estimé">'+Mc(a.mt)+'</td><td class="hm" data-l="Société">'+esc(a.soc)+'</td><td data-l="Responsable"><span class="com">'+av(a.resp,1)+esc(a.resp)+'</span></td><td class="act"><span class="rowact"><button class="ib" title="Relancer l\'équipe" data-act="aomsg" data-n="'+a.n+'">'+ic("send")+"</button></span></td></tr>";}).join("")+"</tbody>":'<tbody><tr><td><p class="empty">Aucun appel d\'offres à rendre sous 7 jours.</p></td></tr></tbody>';
  $("t-parc").innerHTML=pd.length?'<thead><tr><th>Machine</th><th>Client</th><th>Révision</th><th class="hm">Dernière révision</th><th>Commercial</th><th></th></tr></thead><tbody>'+
    pd.map(function(m){var lt=m.next<T;return '<tr data-open="parc" data-n="'+m.n+'"><td class="w"><div class="who"><span class="av cl">'+ic(/Tronçonneuse|Scie|Débroussailleuse/.test(m.type)?"axe":/Atomiseur|Souffleur/.test(m.type)?"fan":/hydraulique/i.test(m.type)?"droplet":"cog")+'</span><div><p class="nm">'+esc(mach(m))+'</p><p class="mt2">Série '+esc(m.serie)+'</p></div></div></td><td class="obj" data-l="Client"><b>'+esc(m.client)+"</b><small>"+esc(m.ville)+'</small></td><td data-l="Révision">'+(lt?'<span class="pill r">dépassée · '+ds(m.next)+"</span>":'<span class="pill a">'+ds(m.next)+"</span>")+'</td><td class="hm" data-l="Dernière">'+(m.rev?dd(m.rev):'<span class="zero">jamais</span>')+'</td><td data-l="Commercial"><span class="com">'+av(m.com,1)+esc(m.com)+'</span></td><td class="act"><span class="rowact"><button class="ib" title="Préparer le rappel" data-act="pmsg" data-n="'+m.n+'">'+ic("send")+"</button></span></td></tr>";}).join("")+"</tbody>":'<tbody><tr><td><p class="empty">Aucune machine à réviser ce mois.</p></td></tr></tbody>';
}

/* ---------- messages ---------- */
function validite(d){return d.valid>=T?"valable jusqu'au "+dd(d.valid):"arrivé à échéance le "+dd(d.valid)+" (nous pouvons le mettre à jour)";}
function msgDevis(d){
  if(d.canal==="E-mail")return "Objet : Votre devis "+d.n+" : "+d.objet+"\n\nBonjour "+d.civ+" "+d.contact+",\n\nJe reviens vers vous au sujet de notre devis "+d.n+" du "+dd(d.date)+" pour : "+d.objet+", d'un montant de "+fm(d.mt)+" FCFA HT. Ce devis est "+validite(d)+".\n\nAvez-vous pu l'examiner ? Je peux revoir les quantités ou les références avec vous, organiser une démonstration ou vous mettre en relation avec notre atelier pour toute question technique.\n\nBien cordialement,\n"+d.com+"\n"+d.soc;
  return "Bonjour "+d.civ+" "+d.contact+", c'est "+d.com+" de "+d.soc+". Avez-vous pu regarder notre devis "+d.n+" pour : "+d.objet+" ("+fm(d.mt)+" FCFA HT, devis "+validite(d)+") ? Je reste disponible pour en parler quand cela vous arrange.";}
function msgParc(m){var x=mach(m),lt=m.next<T;return "Bonjour "+m.civ+" "+m.contact+", c'est l'atelier "+m.soc+". Votre "+x.charAt(0).toLowerCase()+x.slice(1)+" (n° de série "+m.serie+") "+(lt?"a dépassé sa date de révision, prévue le ":"arrive à sa date de révision, prévue le ")+dd(m.next)+". Une révision à temps évite les arrêts imprévus sur vos chantiers. Quel jour vous conviendrait pour la passer à l'atelier ?";}
function msgAo(o){return "Bonjour "+o.resp+", pour l'appel d'offres "+o.n+" ("+o.objet+"), à rendre le "+shortD(o.lim)+" à "+o.h+", il manque encore : "+(o.manq.length?o.manq.join(", ").toLowerCase():"aucune pièce")+". Peux-tu me dire quand ces pièces seront prêtes ?";}

/* ---------- volet ---------- */
var lastMsg="";
function find(arr,n){for(var i=0;i<arr.length;i++)if(arr[i].n===n)return arr[i];return null;}
function openDr(k,html){$("dr-k").innerHTML=k;$("dr-b").innerHTML=html;$("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeDr(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove("on");},2600);}
var NOTE='<p class="dnote">Rien ne part depuis ce tableau : le message se copie, puis s\'envoie depuis le téléphone ou la boîte du commercial.</p>';
function drDevis(d,focus){var k=d.prev?late(d):null,due=d.prev&&d.prev<=T&&ENC.indexOf(d.st)>=0,tva=Math.round(d.mt*.18);lastMsg=msgDevis(d);
  openDr(ic("file-text")+"Devis "+d.n,'<div class="tags">'+stp(d.st)+(due?(k>0?'<span class="pill r">'+k+" j de retard</span>":'<span class="pill o">à relancer aujourd\'hui</span>'):"")+'</div><h3>'+esc(d.client)+'</h3><p class="why">'+esc(d.objet)+'</p>'+
    '<dl class="props"><dt>Contact</dt><dd>'+d.civ+" "+esc(d.contact)+", "+esc(d.fct)+'</dd><dt>Ville</dt><dd>'+esc(d.ville)+'</dd><dt>Gamme</dt><dd>'+esc(d.gamme)+'</dd><dt>Montant HT</dt><dd>'+M(d.mt)+'</dd><dt>Total TTC</dt><dd>'+M(d.mt+tva)+' (TVA 18 %)</dd><dt>Émis le</dt><dd>'+dd(d.date)+" par "+esc(d.com)+" ("+esc(d.soc)+')</dd><dt>Validité</dt><dd>'+(d.valid>=T?"jusqu'au "+dd(d.valid):"échue le "+dd(d.valid))+'</dd><dt>Relances</dt><dd>'+(d.nbr?d.nbr+", la dernière le "+dd(d.der):"aucune")+'</dd></dl>'+
    (ENC.indexOf(d.st)>=0?'<p class="lbl">Relance prête, par '+(d.canal==="E-mail"?"e-mail":"WhatsApp")+'</p><div class="msg">'+esc(lastMsg)+'</div><div class="acts"><button class="btn pri" data-copy="1">'+ic("copy")+'Copier le message</button><button class="btn" data-done="Appel noté pour '+esc(d.client)+'">'+ic("phone")+"Noter un appel fait</button></div>"+NOTE:""));}
function drAo(o){lastMsg=msgAo(o);var k=days(T,o.lim);
  openDr(ic("landmark")+"Appel d'offres "+o.n,'<div class="tags"><span class="pill '+(k<=3?"r":"a")+'">'+k+" j · "+shortD(o.lim)+", "+o.h+'</span><span class="pill n">'+(o.type==="Public"?"Marché public":"Client privé")+'</span></div><h3>'+esc(o.objet)+'</h3><p class="why">'+esc(o.ach)+'</p>'+
    '<dl class="props"><dt>Société</dt><dd>'+esc(o.soc)+'</dd><dt>Montant estimé</dt><dd>'+M(o.mt)+' HT</dd><dt>Dossier</dt><dd>'+o.pretes+" pièces prêtes sur "+o.exig+'</dd><dt>Il manque</dt><dd>'+(o.manq.length?o.manq.map(esc).join("<br>"):"rien")+'</dd><dt>Responsable</dt><dd>'+esc(o.resp)+'</dd></dl><p class="lbl">Message à l\'équipe</p><div class="msg">'+esc(lastMsg)+'</div><div class="acts"><button class="btn pri" data-copy="1">'+ic("copy")+'Copier le message</button></div><p class="dnote">Le bordereau des prix se prépare dans le classeur « SACRI · Vendre » et se valide par la direction avant dépôt.</p>');}
function drParc(m){lastMsg=msgParc(m);var lt=m.next<T;
  openDr(ic("wrench")+"Révision "+m.n,'<div class="tags">'+(lt?'<span class="pill r">dépassée depuis le '+dd(m.next)+"</span>":'<span class="pill a">prévue le '+dd(m.next)+"</span>")+'</div><h3>'+esc(mach(m))+'</h3><p class="why">'+esc(m.client)+", "+esc(m.ville)+'</p>'+
    '<dl class="props"><dt>Contact</dt><dd>'+m.civ+" "+esc(m.contact)+", "+esc(m.fct)+'</dd><dt>Série</dt><dd>'+esc(m.serie)+'</dd><dt>Achetée le</dt><dd>'+dd(m.achat)+'</dd><dt>Dernière révision</dt><dd>'+(m.rev?dd(m.rev):"aucune")+'</dd><dt>Commercial</dt><dd>'+esc(m.com)+'</dd></dl><p class="lbl">Rappel prêt, par '+(m.canal==="E-mail"?"e-mail":"WhatsApp")+'</p><div class="msg">'+esc(lastMsg)+'</div><div class="acts"><button class="btn pri" data-copy="1">'+ic("copy")+'Copier le message</button></div><p class="dnote">Le prix de la révision et des pièces se chiffre avec l\'atelier : aucun tarif n\'est affiché ici.</p>');}
function drCall(d){openDr(ic("phone")+"Appeler",'<h3>'+d.civ+" "+esc(d.contact)+'</h3><p class="why">'+esc(d.fct)+", "+esc(d.client)+'</p><dl class="props"><dt>Devis</dt><dd>'+d.n+" · "+M(d.mt)+' HT</dd><dt>Objet</dt><dd>'+esc(d.objet)+'</dd></dl><p class="lbl">Ce qu\'il faut obtenir pendant l\'appel</p><ul><li>Le devis a-t-il été reçu et lu ?</li><li>Qui décide, et pour quand ?</li><li>Faut-il ajuster les quantités, les références ou le délai ?</li><li>Une date de décision ou de visite.</li></ul><div class="acts"><button class="btn pri" data-done="Appel noté pour '+esc(d.client)+'">'+ic("check")+"Noter l'appel comme fait</button></div>");}

/* ---------- événements ---------- */
document.addEventListener("click",function(e){
  var t;
  if((t=e.target.closest("[data-copy]"))){var ok=function(){toast("Message copié : à coller dans WhatsApp ou dans l'e-mail");};if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(lastMsg).then(ok,ok);else ok();return;}
  if((t=e.target.closest("[data-done]"))){closeDr();toast(t.getAttribute("data-done"));return;}
  if((t=e.target.closest("[data-act]"))){e.stopPropagation();var a=t.getAttribute("data-act"),n=t.getAttribute("data-n");
    if(a==="msg")drDevis(find(D.devis,n));if(a==="call")drCall(find(D.devis,n));if(a==="aomsg")drAo(find(D.ao,n));if(a==="pmsg")drParc(find(D.parc,n));return;}
  if((t=e.target.closest("[data-open]"))){var k=t.getAttribute("data-open"),nn=t.getAttribute("data-n");
    if(k==="rel"||k==="dev")drDevis(find(D.devis,nn));if(k==="ao")drAo(find(D.ao,nn));if(k==="parc")drParc(find(D.parc,nn));return;}
  if((t=e.target.closest("[data-goto]"))){go(t.getAttribute("data-goto"));return;}
  if((t=e.target.closest("[data-v]"))){go(t.getAttribute("data-v"));return;}
  if((t=e.target.closest("[data-soc]"))){var s=t.getAttribute("data-soc");setSoc(t.classList.contains("ni")&&state.soc===s?"Tous":s);return;}
  if((t=e.target.closest("tr[data-com],[data-com]"))){var c=t.getAttribute("data-com");setCom(t.tagName==="TR"&&state.com===c?"Tous":c);return;}
  if((t=e.target.closest("[data-fr]"))){state.fr=t.getAttribute("data-fr");renderRel();return;}
  if((t=e.target.closest("[data-fd]"))){state.fd=t.getAttribute("data-fd");state.more=false;renderDev();return;}
  if(e.target.closest("[data-more]")){state.more=true;renderDev();return;}
  if(e.target.closest("#soc-b")){$("com-m").classList.remove("on");$("soc-m").classList.toggle("on");return;}
  if(e.target.closest("#com-b")){$("soc-m").classList.remove("on");$("com-m").classList.toggle("on");return;}
  if(e.target.id==="scrim"||e.target.closest("#dr-x"))closeDr();
  if(!e.target.closest(".sel"))closeMenus();
});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeDr();closeMenus();}});
$("q-rel").addEventListener("input",function(){state.qr=this.value.trim().toLowerCase();renderRel();});
$("q-dev").addEventListener("input",function(){state.qd=this.value.trim().toLowerCase();state.more=false;renderDev();});
window.addEventListener("hashchange",function(){var h=location.hash.slice(1);if(h!==state.v&&VIEWS[h])go(h);});

/* ---------- rendu ---------- */
function counters(){var du=dues(devis()),lt=du.filter(function(d){return late(d)>0;}).length,ao=aoSoon(aos()).length;
  $("k-rel").textContent=du.length||"";$("m-rel").textContent=du.length||"";$("k-rel").className="k"+(lt?" red":"");
  $("k-dev").textContent=enCours(devis()).length||"";$("k-ech").textContent=ao||"";$("m-ech").textContent=ao||"";}
function render(){socMenu();comMenu();counters();
  if(state.v==="jour")renderJour();if(state.v==="relances")renderRel();if(state.v==="devis")renderDev();if(state.v==="ventes")renderVen();if(state.v==="echeances")renderEch();}
[].forEach.call(document.querySelectorAll("i[data-i]"),function(el){var w=document.createElement("span");w.innerHTML=ic(el.getAttribute("data-i"));var sv=w.firstChild;if(el.className)sv.setAttribute("class","i "+el.className);el.replaceWith(sv);});
Chart.defaults.font.family='"Inter",system-ui,sans-serif';Chart.defaults.font.size=12;Chart.defaults.color="#6B6B6B";
$("date").textContent=longD(T);
var p=new URLSearchParams(location.search);if(p.get("soc")&&D.societes.indexOf(p.get("soc"))>=0)state.soc=p.get("soc");
var resize;window.addEventListener("resize",function(){clearTimeout(resize);resize=setTimeout(render,150);});
go(location.hash.slice(1)||"jour",true);
})();
