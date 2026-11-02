var $=function(i){return document.getElementById(i)};
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var custom=store.get("br_custom",[]),saved=store.get("br_saved",[]),seen=store.get("br_seen",[]);
var tag=null,onlySaved=false;
var n=store.get("br_hits",0)+1;store.set("br_hits",n);$("ctr").textContent=String(n).padStart(6,"0");
function all(){return BASE.concat(custom)}
function host(u){return u.replace(/^https?:\/\//,"").replace(/\/$/,"")}
function toks(q){return q.toLowerCase().split(/\s+/).filter(Boolean)}
function score(s,t){var n=0;for(var i=0;i<t.length;i++){var w=t[i],p=0;
if(s[1].toLowerCase().indexOf(w)>-1)p+=3;if(s[3].toLowerCase().indexOf(w)>-1)p+=2;
if(s[2].toLowerCase().indexOf(w)>-1)p+=1;if(s[0].toLowerCase().indexOf(w)>-1)p+=1;
if(!p)return 0;n+=p}return n}
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function hl(parent,text,t){if(!t.length){parent.appendChild(document.createTextNode(text));return}
var rx=new RegExp("("+t.map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("|")+")","ig");
text.split(rx).forEach(function(part,i){if(i%2){parent.appendChild(el("mark",null,part))}else if(part){parent.appendChild(document.createTextNode(part))}})}
function status(a,u){a.addEventListener("mouseover",function(){$("st").textContent=u});a.addEventListener("focus",function(){$("st").textContent=u});a.addEventListener("mouseout",function(){$("st").textContent="Done"});a.addEventListener("blur",function(){$("st").textContent="Done"})}
var URLRX=/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
function fix(q){return /^https?:/i.test(q)?q:"https://"+q}
function visit(u){if(seen.indexOf(u)<0){seen.push(u);store.set("br_seen",seen)}}
function toggleSave(u){var i=saved.indexOf(u);if(i<0)saved.push(u);else saved.splice(i,1);store.set("br_saved",saved);render()}
function openSite(u){visit(u);window.open(u,"_blank","noopener,noreferrer");render()}
function renderTags(){var c={};all().forEach(function(s){s[3].split(",").forEach(function(g){g=g.trim();if(g)c[g]=1})});
var box=$("tags");box.textContent="";Object.keys(c).sort().forEach(function(g){var b=el("button","b s",g);b.setAttribute("aria-pressed",String(tag===g));
b.onclick=function(){tag=tag===g?null:g;render()};box.appendChild(b)})}
function render(){
var q=$("q").value.trim(),t=toks(q),list=$("list");list.textContent="";
var op=$("open");op.textContent="";
if(q&&URLRX.test(q)){var u=fix(q),d=el("div","open");d.appendChild(document.createTextNode("Jump straight to: "));
var a=el("a",null,u);a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.onclick=function(){visit(u)};status(a,u);d.appendChild(a);op.appendChild(d)}
var rows=all().map(function(s){return{s:s,n:t.length?score(s,t):1}}).filter(function(r){return r.n>0});
if(tag)rows=rows.filter(function(r){return r.s[3].split(",").indexOf(tag)>-1});
if(onlySaved)rows=rows.filter(function(r){return saved.indexOf(r.s[0])>-1});
rows.sort(function(a,b){return b.n-a.n||a.s[1].localeCompare(b.s[1])});
$("savedBtn").textContent="★ Saved ("+saved.length+")";$("savedBtn").setAttribute("aria-pressed",String(onlySaved));
$("meta").textContent="Found "+rows.length+" site"+(rows.length===1?"":"s")+(q?" matching “"+q+"”":"")+(tag?" tagged "+tag:"")+(onlySaved?" in your bookmarks":"")+".";
if(!rows.length)list.appendChild(el("li","empty",onlySaved?"No bookmarks yet. Click the star next to a site to keep it here.":"Nothing found. Try fewer words, clear the tag filter, or submit the site below."));
rows.forEach(function(r){var s=r.s,li=el("li","r");
var a=el("a","t"+(seen.indexOf(s[0])>-1?" seen":""));a.href=s[0];a.target="_blank";a.rel="noopener noreferrer";a.onclick=function(){visit(s[0])};status(a,s[0]);hl(a,s[1],t);li.appendChild(a);
var st=el("button","star",saved.indexOf(s[0])>-1?"★":"☆");st.setAttribute("aria-label",(saved.indexOf(s[0])>-1?"Remove bookmark for ":"Bookmark ")+s[1]);st.onclick=function(){toggleSave(s[0])};li.appendChild(st);
li.appendChild(el("div","u",host(s[0])));
var p=el("p","d");hl(p,s[2],t);li.appendChild(p);
var tg=el("div","tg");s[3].split(",").forEach(function(g){g=g.trim();var b=el("button",null,"["+g+"]");b.onclick=function(){tag=g;render();window.scrollTo(0,0)};tg.appendChild(b)});li.appendChild(tg);
list.appendChild(li)});
renderTags()}
$("q").addEventListener("input",render);
$("q").addEventListener("keydown",function(e){if(e.key==="Enter"){var q=this.value.trim();if(URLRX.test(q))openSite(fix(q))}});
$("go").onclick=function(){var q=$("q").value.trim();if(URLRX.test(q))openSite(fix(q));else render()};
$("wander").onclick=function(){var a=all();openSite(a[Math.floor(Math.random()*a.length)][0])};
$("savedBtn").onclick=function(){onlySaved=!onlySaved;render()};
$("theme").onclick=function(){var r=document.documentElement,d=r.getAttribute("data-theme")==="dark"||(!r.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme:dark)").matches);r.setAttribute("data-theme",d?"light":"dark")};
$("add").onclick=function(){var u=$("nu").value.trim(),nm=$("nt").value.trim(),m=$("msg");
if(!URLRX.test(u)||!nm){m.textContent="Enter a valid web address and a site name.";return}
u=fix(u);
if(all().some(function(s){return s[0]===u})){m.textContent="That site is already in the index.";return}
custom.push([u,nm,$("nd").value.trim()||"Added by you.",$("ng").value.trim()||"added"]);store.set("br_custom",custom);
["nu","nt","nd","ng"].forEach(function(i){$(i).value=""});m.textContent="Added "+nm+".";render()};
render();
