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
var state={v:"jour",soc:"Tous",com:"Tous",qr:"",qd:"",fr:"Tous",fd:"EC",more:false,zmore:false,zone:"Tous",tc:"Ange K.",tj:"Tous"};
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
var VIEWS={jour:"Aujourd'hui",relances:"Relances",devis:"Devis",ventes:"Ventes",echeances:"Échéances",terrain:"Terrain"};
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
    if(k==="rel"||k==="dev")drDevis(find(D.devis,nn));if(k==="ao")drAo(find(D.ao,nn));if(k==="parc")drParc(find(D.parc,nn));if(k==="vis")drVis(TR.visites.filter(function(v){return v.id===nn;})[0]);if(k==="nv")drNv(TR.portefeuille.filter(function(p){return p.client===nn;})[0]);return;}
  if((t=e.target.closest("[data-goto]"))){go(t.getAttribute("data-goto"));return;}
  if((t=e.target.closest("[data-v]"))){go(t.getAttribute("data-v"));return;}
  if((t=e.target.closest("[data-soc]"))){var s=t.getAttribute("data-soc");setSoc(t.classList.contains("ni")&&state.soc===s?"Tous":s);return;}
  if((t=e.target.closest("tr[data-com],[data-com]"))){var c=t.getAttribute("data-com");setCom(t.tagName==="TR"&&state.com===c?"Tous":c);return;}
  if((t=e.target.closest("[data-tc]"))){state.tc=t.getAttribute("data-tc");renderRapport();return;}
  if(e.target.closest("[data-zmore]")){state.zmore=true;renderTer();return;}
  if((t=e.target.closest("[data-tj]"))){state.tj=t.getAttribute("data-tj");renderTer();return;}
  if((t=e.target.closest("tr[data-zone]"))){var z=t.getAttribute("data-zone");state.zone=state.zone===z?"Tous":z;renderTer();return;}
  if((t=e.target.closest("[data-fr]"))){state.fr=t.getAttribute("data-fr");renderRel();return;}
  if((t=e.target.closest("[data-fd]"))){state.fd=t.getAttribute("data-fd");state.more=false;renderDev();return;}
  if(e.target.closest("[data-more]")){state.more=true;renderDev();return;}
  if(e.target.closest("#soc-b")){$("com-m").classList.remove("on");$("soc-m").classList.toggle("on");return;}
  if(e.target.closest("#com-b")){$("soc-m").classList.remove("on");$("com-m").classList.toggle("on");return;}
  if(e.target.id==="scrim"||e.target.closest("#dr-x"))closeDr();
  if(!e.target.closest(".sel"))closeMenus();
});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeDr();closeMenus();}});
$("zone-f").addEventListener("change",function(){state.zone=this.value;state.zmore=false;renderTer();});
$("com-f").addEventListener("change",function(){setCom(this.value);});
$("q-rel").addEventListener("input",function(){state.qr=this.value.trim().toLowerCase();renderRel();});
$("q-dev").addEventListener("input",function(){state.qd=this.value.trim().toLowerCase();state.more=false;renderDev();});
window.addEventListener("hashchange",function(){var h=location.hash.slice(1);if(h!==state.v&&VIEWS[h])go(h);});

/* ---------- TERRAIN ---------- */
var TR=window.TERRAIN||{visites:[],portefeuille:[],messages:{},sujets:[],args:[],communes:[],civ:[],villes:{},semaine:[]};
var SUJ={},ARG={};TR.sujets.forEach(function(s){SUJ[s[0]]=s[1];});TR.args.forEach(function(a){ARG[a[0]]=a[1];});
var ABJ={};TR.communes.forEach(function(c){ABJ[c.nom]=1;});
function zoneOK(z){var f=state.zone;return f==="Tous"||(f==="Abidjan"&&ABJ[z])||(f==="Intérieur"&&!ABJ[z])||f===z;}
function tVis(){return TR.visites.filter(function(v){return socOK(v.soc)&&comOK(v.com)&&zoneOK(v.zone);});}
function tPort(){return TR.portefeuille.filter(function(p){return socOK(p.soc)&&comOK(p.com)&&zoneOK(p.zone);});}
function since(s){return s?days(s,T):null;}
function nonVus(l){return l.filter(function(p){var k=since(p.lv);return k===null||k>30;}).sort(function(a,b){var x=since(a.lv),y=since(b.lv);return (y===null?1e4:y)-(x===null?1e4:x);});}
function scoreOf(l){var s=l.filter(function(v){return v.sc!=null;});return s.length?sum(s,function(v){return v.sc;})/s.length:null;}
function f1(x){return (Math.round(x*10)/10).toString().replace(".",",");}
function scCls(x){return x==null?"n":x>=7?"g":x>=5?"a":"r";}
var PTL={ok:"Présence pointée",loin:"Pointé hors du site",non:"Non pointé"};
function ptPill(v){return v.pt==="ok"?'<span class="pill g"><span class="dot"></span>Pointé chez le client</span>':v.pt==="loin"?'<span class="pill a"><span class="dot"></span>Pointé à '+String(v.d).replace(".",",")+" km</span>":'<span class="pill r"><span class="dot"></span>Non pointé</span>';}
function zoneMenu(){var zs=[];TR.portefeuille.forEach(function(p){if(zs.indexOf(p.zone)<0)zs.push(p.zone);});
  var ab=zs.filter(function(z){return ABJ[z];}).sort(),it=zs.filter(function(z){return !ABJ[z];}).sort();
  var opt=function(z,l){return '<option value="'+esc(z)+'"'+(state.zone===z?" selected":"")+">"+esc(l||z)+"</option>";};
  $("zone-f").innerHTML=opt("Tous","Toutes les zones")+opt("Abidjan","Abidjan, toutes communes")+opt("Intérieur","Intérieur du pays")+'<optgroup label="Communes d\'Abidjan">'+ab.map(function(z){return opt(z);}).join("")+'</optgroup><optgroup label="Villes de l\'intérieur">'+it.map(function(z){return opt(z);}).join("")+"</optgroup>";}
function renderTer(){
  zoneMenu();$("com-f").innerHTML=["Tous"].concat(COMS).map(function(c){return '<option value="'+esc(c)+'"'+(state.com===c?" selected":"")+">"+(c==="Tous"?"Tous les commerciaux":esc(c))+"</option>";}).join("");
  var vs=tVis(),pf=tPort(),nv=nonVus(pf),td=vs.filter(function(v){return v.j===TR.jour;}),pok=vs.filter(function(v){return v.pt==="ok";});
  var tdr=td.filter(function(v){return !v.abs;}),ab=sum(tdr,function(v){return v.ab.length;}),at=sum(tdr,function(v){return v.ab.length+v.na.length;});
  var sc=scoreOf(td);
  $("lede-ter").innerHTML=vs.length?"Cette semaine, <b>"+pl(vs.length,"visite")+"</b> chez "+pl(new Set(vs.map(function(v){return v.client;})).size,"client")+", dont "+pok.length+" avec la présence pointée chez le client. Le rapport du jour est tiré des messages de fin de journée : ce qui a été dit, ce qui manque, et la prochaine étape.":"Aucune visite cette semaine pour cette sélection.";
  var perDay=TR.semaine.map(function(j){return vs.filter(function(v){return v.j===j;}).length;});
  $("kpis-t").innerHTML=
    kc({ico:"map-pin",l:"Visites cette semaine",v:vs.length,sp:bars(perDay),s:"<span>dont <b>"+td.length+"</b> aujourd'hui, du lundi au jeudi</span>"})+
    kc({ico:"circle-check-big",l:"Présence pointée",v:vs.length?pct(pok.length/vs.length):"–",s:vs.length?"<span><b>"+pok.length+"</b> sur "+vs.length+"</span>"+(vs.length-pok.length?dl((vs.length-pok.length)+" à vérifier","bad"):""):"aucune visite"})+
    kc({ico:"list-checks",l:"Sujets attendus abordés",v:at?pct(ab/at):"–",s:at?"<span><b>"+ab+"</b> sur "+at+" aujourd'hui</span>"+(sc!=null?dl("échange "+f1(sc)+" / 10",sc>=7?"up":sc>=5?"nt":"dn"):""):"aucun rapport aujourd'hui"})+
    kc({ico:"user-round",l:"Clients non vus depuis 30 jours",v:nv.length,s:"<span>sur "+pl(pf.length,"client")+" du portefeuille</span>"});
  renderRapport();renderNonVus(nv,pf);renderCarte(vs);}
function renderRapport(){
  var coms=COMS.filter(comOK);if(coms.indexOf(state.tc)<0)state.tc=coms[0];
  var allTd=TR.visites.filter(function(v){return v.j===TR.jour;});
  $("seg-tc").innerHTML=coms.map(function(c){var s=scoreOf(allTd.filter(function(v){return v.com===c;}));return '<button data-tc="'+esc(c)+'" class="'+(state.tc===c?"on":"")+'">'+av(c,1)+esc(c)+(s!=null?' <span class="c">'+f1(s)+"</span>":"")+"</button>";}).join("");
  var c=state.tc,ms=TR.messages[c]||[];
  $("chat").innerHTML='<div class="chat-h"><span class="ic">'+ic("message-circle")+'</span><div><p class="t">Groupe « Commerciaux terrain »</p><p class="s">Messages de '+esc(c)+", "+shortD(TR.jour)+'</p></div></div><div class="chat-b"><p class="chat-d">'+shortD(TR.jour)+"</p>"+ms.map(function(m){return '<div class="bub"><p class="au">'+esc(c)+"</p><p>"+esc(m[1])+'</p><span class="tm">'+m[0].replace(":"," h ")+"</span></div>";}).join("")+"</div>";
  var vd=allTd.filter(function(v){return v.com===c;}),vf=vd.filter(function(v){return socOK(v.soc)&&zoneOK(v.zone);}),s=scoreOf(vf);
  var head='<div class="rep-h"><div><p class="t">Rapport du jour, tiré automatiquement</p><p class="s">'+pl(vf.length,"visite")+(vf.length<vd.length?" sur "+vd.length+" (filtre)":"")+" · "+esc(c)+'</p></div><div class="score '+scCls(s)+'"><b>'+(s==null?"–":f1(s))+"</b><small>/ 10</small></div></div>";
  $("rep").innerHTML=head+(vf.length?vf.map(function(v,i){
    return '<div class="rv" data-open="vis" data-n="'+v.id+'"><div class="rv-t"><span class="rv-n">'+(i+1)+'</span><div class="rv-m"><p class="nm">'+esc(v.client)+'</p><p class="mt2">'+esc(v.zone)+" · "+v.h1.replace(":"," h ")+" à "+v.h2.replace(":"," h ")+" · "+esc(v.soc)+'</p></div><span class="score sm '+scCls(v.sc)+'">'+(v.sc==null?"–":v.sc)+"<small>/10</small></span></div>"+
      '<div class="rv-g"><p class="k">Pointage</p><div>'+ptPill(v)+(v.abs?' <span class="pill n">Interlocuteur absent</span>':"")+'</div>'+
      (v.abs?'<p class="k">Échange</p><div class="nx">'+ic("triangle-alert")+'Interlocuteur absent : catalogue laissé sur place, échange à refaire. Non noté.</div>':'<p class="k">Sujets abordés</p><div class="chips">'+(v.ab.length?v.ab.map(function(x){return '<span class="pill n">'+SUJ[x]+"</span>";}).join(""):'<span class="zero">aucun</span>')+"</div>"+
      '<p class="k bad">Attendus, non abordés</p><div class="chips">'+(v.na.length?v.na.map(function(x){return '<span class="pill r">'+SUJ[x]+"</span>";}).join(""):'<span class="pill g">tout a été abordé</span>')+"</div>"+
      '<p class="k">Arguments omis</p><div class="chips">'+(v.om.length?v.om.map(function(x){return '<span class="pill a">'+ARG[x]+"</span>";}).join(""):'<span class="pill g">aucun</span>')+"</div>"+
      '')+'<p class="k">Prochaine étape</p><div class="nx">'+ic("arrow-right")+esc(v.next||"à préciser")+"</div></div></div>";}).join(""):'<p class="empty">Aucune visite de '+esc(c)+" aujourd'hui pour ce filtre. Les messages restent visibles à gauche.</p>");}
function renderNonVus(nv,pf){
  var byC=COMS.filter(comOK).map(function(c){return [c,nv.filter(function(p){return p.com===c;}).length,pf.filter(function(p){return p.com===c;}).length];});
  $("nv-sum").innerHTML=byC.map(function(r){return '<button class="nvc'+(state.com===r[0]?" on":"")+'" data-com="'+esc(r[0])+'">'+av(r[0],1)+'<span><b>'+esc(r[0])+"</b><small>"+r[1]+" non vu"+(r[1]>1?"s":"")+" sur "+r[2]+'</small></span><span class="n '+(r[1]?"r":"")+'">'+r[1]+"</span></button>";}).join("");
  $("t-nv").innerHTML=nv.length?'<thead><tr><th>Client</th><th>Zone</th><th>Commercial</th><th>Dernière visite</th><th>Dernier contact</th><th class="hm">Société</th></tr></thead><tbody>'+nv.map(function(p){var k=since(p.lv),kc_=since(p.cd);
    return '<tr data-open="nv" data-n="'+esc(p.client)+'"><td class="w"><div class="who"><span class="av cl">'+cini(p.client)+'</span><div><p class="nm">'+esc(p.client)+'</p><p class="mt2">'+esc(p.seg)+'</p></div></div></td><td data-l="Zone">'+esc(p.zone)+'<small class="sub">'+(ABJ[p.zone]?"Abidjan":"Intérieur")+'</small></td><td data-l="Commercial"><span class="com">'+av(p.com,1)+esc(p.com)+'</span></td><td data-l="Dernière visite">'+(k===null?'<span class="pill r">jamais visité</span>':'<span class="pill r">il y a '+k+" j</span>")+'</td><td data-l="Dernier contact">'+(p.cd?esc(p.ct)+'<small class="sub">'+dd(p.cd)+" · il y a "+kc_+" j</small>":'<span class="zero">aucun</span>')+'</td><td class="hm" data-l="Société">'+esc(p.soc)+"</td></tr>";}).join("")+"</tbody>":'<tbody><tr><td><p class="empty">Tous les clients de cette sélection ont été vus depuis moins de 30 jours.</p></td></tr></tbody>';}
/* carte */
function proj(b,W,H,pad){var lat0=(b[1]+b[3])/2,k=Math.cos(lat0*Math.PI/180),sx=(W-2*pad)/((b[2]-b[0])*k),sy=(H-2*pad)/(b[3]-b[1]),s=Math.min(sx,sy),ox=(W-(b[2]-b[0])*k*s)/2,oy=(H-(b[3]-b[1])*s)/2;
  return function(p){return [(ox+(p[0]-b[0])*k*s).toFixed(1),(oy+(b[3]-p[1])*s).toFixed(1)];};}
function bbox(pts){var b=[1e9,1e9,-1e9,-1e9];pts.forEach(function(p){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1]);});return b;}
function path(r,pr){return "M"+r.map(function(p){return pr(p).join(" ");}).join("L")+"Z";}
var PTC={ok:"#18794E",loin:"#D99A1E",non:"#C8352B"};var VOFF={"Grand-Bassam":[0,16,"middle"],"Alépé":[8,-4,"start"],"Daloa":[-8,-4,"end"],"Bouaflé":[8,-6,"start"],"Soubré":[-8,4,"end"]};var LBLDY={"Attécoubé":-12,"Cocody":-12,"Abobo":-12,"Anyama":-12,"Songon":-12,"Bingerville":-12,"Yopougon":20};
function dots(l,pr,rad){var seen={};return l.map(function(v){var p=TR.portefeuille.filter(function(x){return x.client===v.client;})[0];if(!p)return "";var k=v.client,n=seen[k]=(seen[k]||0)+1,a=n*2.1,xy=pr(p.pt),x=+xy[0]+(n>1?Math.cos(a)*rad*1.6:0),y=+xy[1]+(n>1?Math.sin(a)*rad*1.6:0);
  return '<circle class="pt" data-open="vis" data-n="'+v.id+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+rad+'" fill="'+PTC[v.pt]+'"><title>'+esc(v.client+" · "+v.com+" · "+shortD(v.j)+" · "+PTL[v.pt])+"</title></circle>";}).join("");}
function renderCarte(all){
  var dsel=state.tj,vs=all.filter(function(v){return dsel==="Tous"||v.j===dsel;});
  $("seg-tj").innerHTML=[["Tous","Semaine",all.length]].concat(TR.semaine.map(function(j){var d=dobj(j);return [j,JRS[d.getDay()].charAt(0).toUpperCase()+JRS[d.getDay()].slice(1,3)+". "+d.getDate(),all.filter(function(v){return v.j===j;}).length];})).map(function(s){return '<button data-tj="'+s[0]+'" class="'+(dsel===s[0]?"on":"")+'">'+s[1]+' <span class="c">'+s[2]+"</span></button>";}).join("");
  var ab=vs.filter(function(v){return ABJ[v.zone];}),it=vs.filter(function(v){return !ABJ[v.zone];});
  /* pays */
  var W=420,H=440,allc=[];TR.civ.forEach(function(r){allc=allc.concat(r);});var b=bbox(allc),pr=proj(b,W,H,14);
  var abPts=[];TR.communes.forEach(function(c){abPts=abPts.concat(c.ring);});var ab_b=bbox(abPts),a0=pr([ab_b[0],ab_b[3]]),a1=pr([ab_b[2],ab_b[1]]);
  var vl=Object.keys(TR.villes).map(function(n){var xy=pr(TR.villes[n]),has=it.some(function(v){return v.zone===n;});var o=VOFF[n]||[7,-6,"start"];return has?'<text class="vlab" text-anchor="'+o[2]+'" x="'+(+xy[0]+o[0])+'" y="'+(+xy[1]+o[1])+'">'+esc(n)+"</text>":"";}).join("");
  var svg1='<svg viewBox="0 0 '+W+" "+H+'" class="map" role="img" aria-label="Carte de la Côte d\'Ivoire, visites de la semaine">'+TR.civ.map(function(r){return '<path d="'+path(r,pr)+'" class="land"/>';}).join("")+''+
    '<rect x="'+(+a0[0]-5)+'" y="'+(+a0[1]-5)+'" width="'+(a1[0]-a0[0]+10)+'" height="'+(a1[1]-a0[1]+10)+'" rx="4" class="abx"/><text class="vlab b" x="'+(+a1[0]+8)+'" y="'+(+a1[1]+4)+'">Abidjan · '+ab.length+"</text>"+vl+dots(it,pr,5.5)+"</svg>";
  /* Abidjan */
  var W2=420,H2=340,pr2=proj(ab_b,W2,H2-46,10),BOT=["Adjamé","Plateau","Treichville","Marcory","Koumassi","Port-Bouët"],lb="";
  var cen={};TR.communes.forEach(function(c){var xs=0,ys=0;c.ring.forEach(function(p){xs+=p[0];ys+=p[1];});cen[c.nom]=pr2([xs/c.ring.length,ys/c.ring.length]);});
  BOT.forEach(function(n,i){var x=70+i*(W2-140)/(BOT.length-1),y=H2-10,on=ab.some(function(v){return v.zone===n;}),c=cen[n];
    lb+='<path d="M'+c[0]+" "+c[1]+"L"+x.toFixed(1)+" "+(y-13)+'" class="lead"/><text class="clab'+(on?" on":"")+'" x="'+x.toFixed(1)+'" y="'+y+'">'+esc(n)+"</text>";});
  var svg2='<svg viewBox="0 0 '+W2+" "+H2+'" class="map" role="img" aria-label="Carte des communes d\'Abidjan, visites de la semaine">'+TR.communes.map(function(c){var on=ab.some(function(v){return v.zone===c.nom;});return '<path d="'+path(c.ring,pr2)+'" class="com'+(on?" on":"")+'"><title>'+esc(c.nom)+"</title></path>";}).join("")+lb+
    TR.communes.filter(function(c){return BOT.indexOf(c.nom)<0;}).map(function(c){var xy=cen[c.nom],on=ab.some(function(v){return v.zone===c.nom;});return '<text class="clab'+(on?" on":"")+'" x="'+xy[0]+'" y="'+(+xy[1]+(LBLDY[c.nom]||0))+'">'+esc(c.nom)+"</text>";}).join("")+dots(ab,pr2,5.5)+"</svg>";
  $("map-ci").innerHTML=svg1;$("map-ab").innerHTML=svg2;
  $("map-leg").innerHTML='<span><i style="background:'+PTC.ok+'"></i>Présence pointée chez le client</span><span><i style="background:'+PTC.loin+'"></i>Pointé hors du site</span><span><i style="background:'+PTC.non+'"></i>Non pointé</span>';
  var zs={};vs.forEach(function(v){var z=zs[v.zone]=zs[v.zone]||{n:0,ok:0,c:[]};z.n++;if(v.pt==="ok")z.ok++;if(z.c.indexOf(v.com)<0)z.c.push(v.com);});
  var zl=Object.keys(zs).sort(function(a,b){return zs[b].n-zs[a].n||(a<b?-1:1);}),zall=zl.length;if(!state.zmore)zl=zl.slice(0,8);
  $("t-zone").innerHTML=zl.length?'<thead><tr><th>Zone</th><th class="r">Visites</th><th>Pointage</th><th class="hm">Commerciaux</th></tr></thead><tbody>'+zl.map(function(z){var o=zs[z],bad=o.n-o.ok;return '<tr data-zone="'+esc(z)+'"><td class="w"><b>'+esc(z)+'</b><small class="sub">'+(ABJ[z]?"Abidjan":"Intérieur")+'</small></td><td class="num" data-l="Visites">'+o.n+'</td><td data-l="Pointage">'+(bad?'<span class="pill a">'+o.ok+" / "+o.n+" pointées</span>":'<span class="pill g">'+o.ok+" / "+o.n+" pointées</span>")+'</td><td class="hm" data-l="Commerciaux"><span class="avs">'+o.c.map(function(c){return av(c,1);}).join("")+"</span></td></tr>";}).join("")+"</tbody>":'<tbody><tr><td><p class="empty">Aucune visite pour ce jour et cette sélection.</p></td></tr></tbody>';
  $("zone-more").innerHTML=zall>zl.length?'<button class="more" data-zmore="1">Voir les '+(zall-zl.length)+" autres zones</button>":"";
  var bad=vs.filter(function(v){return v.pt!=="ok";});
  $("map-n").innerHTML=bad.length?"<b>"+pl(bad.length,"visite")+" à vérifier</b> : "+bad.map(function(v){return esc(v.com)+" chez "+esc(v.client)+" ("+(v.pt==="loin"?"pointé à "+String(v.d).replace(".",",")+" km":"non pointé")+", "+shortD(v.j)+")";}).join(" ; ")+".":"Toutes les visites de cette sélection sont pointées chez le client.";}
function drVis(v){var p=TR.portefeuille.filter(function(x){return x.client===v.client;})[0]||{};
  var rep=v.msg!=null;
  openDr(ic("map-pin")+"Visite du "+dd(v.j),'<div class="tags">'+ptPill(v)+(rep&&v.sc!=null?'<span class="score sm '+scCls(v.sc)+'">'+v.sc+"<small>/10</small></span>":"")+'</div><h3>'+esc(v.client)+'</h3><p class="why">'+esc(v.zone)+", "+esc(p.seg||"")+'</p>'+
  '<dl class="props"><dt>Commercial</dt><dd>'+esc(v.com)+" ("+esc(v.soc)+')</dd><dt>Contact</dt><dd>'+(p.civ||"")+" "+esc(p.contact||"")+'</dd><dt>Sur place</dt><dd>'+v.h1.replace(":"," h ")+" à "+v.h2.replace(":"," h ")+'</dd><dt>Pointage</dt><dd>'+(v.pt==="ok"?"chez le client, à "+v.d+" m de l'adresse":v.pt==="loin"?"à "+String(v.d).replace(".",",")+" km de l'adresse du client":"aucun pointage ce jour-là")+"</dd></dl>"+
  (rep?'<p class="lbl">Ce qu\'il faut aborder à la prochaine visite</p><ul>'+v.na.map(function(x){return "<li>"+SUJ[x]+"</li>";}).join("")+v.om.map(function(x){return "<li>Argument : "+ARG[x].charAt(0).toLowerCase()+ARG[x].slice(1)+"</li>";}).join("")+(v.na.length+v.om.length?"":"<li>Rien de plus : l'échange a couvert ce qui était attendu.</li>")+'</ul><p class="lbl">Prochaine étape notée</p><div class="msg">'+esc(v.next)+"</div>":'<p class="dnote">Le rapport détaillé est disponible pour les messages du jour. Les visites des jours précédents gardent leur pointage.</p>'));}
function drNv(p){var k=since(p.lv);
  openDr(ic("user-round")+"Client non vu",'<div class="tags"><span class="pill r">'+(k===null?"jamais visité":"non vu depuis "+k+" jours")+'</span></div><h3>'+esc(p.client)+'</h3><p class="why">'+esc(p.zone)+", "+esc(p.seg)+'</p><dl class="props"><dt>Commercial</dt><dd>'+esc(p.com)+" ("+esc(p.soc)+')</dd><dt>Contact</dt><dd>'+p.civ+" "+esc(p.contact)+'</dd><dt>Dernière visite</dt><dd>'+(p.lv?dd(p.lv):"aucune")+'</dd><dt>Dernier contact</dt><dd>'+(p.cd?esc(p.ct)+", le "+dd(p.cd):"aucun")+'</dd></dl><p class="lbl">À faire</p><ul><li>Prévoir une visite dans la tournée de '+esc(p.com)+" la semaine prochaine.</li><li>À défaut, un appel pour reprendre contact et noter le besoin.</li></ul>");}

/* ---------- rendu ---------- */
function counters(){var du=dues(devis()),lt=du.filter(function(d){return late(d)>0;}).length,ao=aoSoon(aos()).length;
  $("k-rel").textContent=du.length||"";$("m-rel").textContent=du.length||"";$("k-rel").className="k"+(lt?" red":"");
  $("k-dev").textContent=enCours(devis()).length||"";$("k-ech").textContent=ao||"";$("m-ech").textContent=ao||"";var nv=nonVus(tPort()).length;$("k-ter").textContent=nv||"";$("m-ter").textContent=nv||"";}
function render(){socMenu();comMenu();counters();
  if(state.v==="jour")renderJour();if(state.v==="relances")renderRel();if(state.v==="devis")renderDev();if(state.v==="ventes")renderVen();if(state.v==="echeances")renderEch();if(state.v==="terrain")renderTer();}
[].forEach.call(document.querySelectorAll("i[data-i]"),function(el){var w=document.createElement("span");w.innerHTML=ic(el.getAttribute("data-i"));var sv=w.firstChild;if(el.className)sv.setAttribute("class","i "+el.className);el.replaceWith(sv);});
Chart.defaults.font.family='"Inter",system-ui,sans-serif';Chart.defaults.font.size=12;Chart.defaults.color="#6B6B6B";
$("date").textContent=longD(T);
var p=new URLSearchParams(location.search);if(p.get("soc")&&D.societes.indexOf(p.get("soc"))>=0)state.soc=p.get("soc");
var resize;window.addEventListener("resize",function(){clearTimeout(resize);resize=setTimeout(render,150);});
go(location.hash.slice(1)||"jour",true);
})();
