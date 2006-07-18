PTBrowserInfo=function(){
return this;
};
PTBrowserInfo.VERSION="214238";
PTBrowserInfo.init=function(){
PTBrowserInfo.USER_AGENT=navigator.userAgent;
PTBrowserInfo.MSIE_VERSION=PTBrowserInfo.getIEVersion();
PTBrowserInfo.NETSCAPE_VERSION=PTBrowserInfo.getNNVersion();
PTBrowserInfo.IS_DOM=(document.getElementById);
PTBrowserInfo.IS_OPERA=(/opera [56789]|opera\/[56789]/i.test(PTBrowserInfo.USER_AGENT));
PTBrowserInfo.IS_SAFARI=(/safari/i.test(PTBrowserInfo.USER_AGENT));
PTBrowserInfo.IS_MSIE=(PTBrowserInfo.MSIE_VERSION&&document.all&&!PTBrowserInfo.IS_OPERA);
PTBrowserInfo.IS_MSIE_4=(PTBrowserInfo.MSIE_VERSION<5);
PTBrowserInfo.IS_MSIE_5=((PTBrowserInfo.MSIE_VERSION>=5)&&(PTBrowserInfo.MSIE_VERSION<5.5));
PTBrowserInfo.IS_MSIE_5_5=((PTBrowserInfo.MSIE_VERSION>=5.5)&&(PTBrowserInfo.MSIE_VERSION<6));
PTBrowserInfo.IS_MSIE_6=((PTBrowserInfo.MSIE_VERSION>=6)&&(PTBrowserInfo.MSIE_VERSION<6.5));
PTBrowserInfo.IS_NETSCAPE_4=((PTBrowserInfo.NETSCAPE_VERSION>0)&&(PTBrowserInfo.NETSCAPE_VERSION<5));
PTBrowserInfo.IS_NETSCAPE_6=((PTBrowserInfo.NETSCAPE_VERSION>=5)&&(PTBrowserInfo.NETSCAPE_VERSION<7));
PTBrowserInfo.IS_NETSCAPE_7=(PTBrowserInfo.NETSCAPE_VERSION>=7);
PTBrowserInfo.IS_MOZILLA=((!PTBrowserInfo.IS_OPERA)&&(/gecko/i.test(PTBrowserInfo.USER_AGENT)));
PTBrowserInfo.IS_NETSCAPE_DOM=(PTBrowserInfo.IS_MOZILLA||(PTBrowserInfo.NETSCAPE_VERSION>=5));
PTBrowserInfo.IS_HTTPS=(document.location.protocol.indexOf("https:")>-1);
PTBrowserInfo.IS_XP_SP2=(window.navigator.userAgent.indexOf("SV1")>-1);
PTBrowserInfo.IS_NT4=(window.navigator.userAgent.indexOf("Windows NT 4.0")>-1);
PTBrowserInfo.isInitialized=true;
};
PTBrowserInfo.getIEVersion=function(){
var _1=0;
var ua=new String(navigator.userAgent);
if(ua.indexOf("MSIE ")>-1){
_1=parseFloat(ua.substr(ua.indexOf("MSIE ")+5));
}
return _1;
};
PTBrowserInfo.getNNVersion=function(){
var _3=0;
if(navigator.appName=="Netscape"){
_3=parseFloat(navigator.appVersion);
if(_3>=5){
if(typeof navigator.vendorSub!="undefined"){
_3=parseFloat(navigator.vendorSub);
}
}
}
return _3;
};
if(!PTBrowserInfo.isInitialized){
PTBrowserInfo.init();
}
PTCommonUtil=function(){
return this;
};
PTCommonUtil.VERSION="214238";
PTCommonUtil.getIEVersion=function(){
return PTBrowserInfo.getIEVersion();
};
PTCommonUtil.getNNVersion=function(){
return PTBrowserInfo.getNNVersion();
};
PTCommonUtil.getElementById=function(id){
return PTDOMUtil.getElementById(id);
};
PTCommonUtil.copyObject=function(_5,_6){
if(!_6){
if(_5.constructor){
_6=_5.constructor();
}else{
_6=new Object();
}
}
var t=typeof _5;
var _8=false;
if(t=="string"){
_8=true;
}else{
if(t=="number"){
_8=true;
}else{
if(t=="boolean"){
_8=true;
}
}
}
if(_8){
_6=_5;
}else{
if(_5&&_5.slice&&_5.sort&&_5.length){
var _9=_5.length;
for(var a=0;a<_9;a++){
_6[a]=_5[a];
}
}else{
for(var i in _5){
if(_5.Class&&(_5.Class=="Array")&&(typeof _5[i]=="function")){
continue;
}
var t=typeof _5[i];
var _8=false;
if(t=="string"){
_8=true;
}else{
if(t=="number"){
_8=true;
}else{
if(t=="boolean"){
_8=true;
}
}
}
if(_8){
_6[i]=_5[i];
}else{
_6[i]=PTCommonUtil.copyObject(_5[i]);
}
}
}
}
return _6;
};
PTCommonUtil.getServerFromURL=function(_c){
var _d=document.createElement("A");
_d.href=_c;
return _d.hostname;
};
PTCommonUtil.isDefined=function(_e){
var _f=typeof (_e);
return (!(_f=="unknown")&&!(_f=="undefined"));
};
PTCommonUtil.sortHashByKeys=function(_10,_11,_12,_13){
var _14=new Array();
var _15=new Object();
var _16;
var _17=false;
for(var key in _10){
_16=key;
break;
}
var _19=new String(_16);
if(!isNaN(parseInt(_19.charAt(0)))){
_17=true;
}
for(var key in _10){
_14[_14.length]=key;
}
var _1a;
if(_17){
_1a=_14.sort(PTCommonUtil.sortNumeric);
_11=false;
}else{
if(_13){
if(_12){
_1a=_14.sort(PTCommonUtil.sortReverseCaseInsensitive);
}else{
_1a=_14.sort(PTCommonUtil.sortReverse);
}
}else{
if(_12){
_1a=_14.sort(PTCommonUtil.sortCaseInsensitive);
}else{
_1a=_14.sort(PTCommonUtil.sortForward);
}
}
}
if(_11){
_15[_16]=_10[_16];
}
for(var i=0;i<_1a.length;i++){
if(_11&&(_1a[i]==_16)){
continue;
}
_15[_1a[i]]=_10[_1a[i]];
}
return _15;
};
PTCommonUtil.sortNumeric=function(a,b){
var _1e=parseInt(a);
var _1f=parseInt(b);
if(!isNaN(_1e)&&!isNaN(_1f)){
return _1e-_1f;
}else{
return -1;
}
};
PTCommonUtil.sortCaseInsensitive=function(aa,bb){
var a=(new String(aa)).toLowerCase();
var b=(new String(bb)).toLowerCase();
if(a.valueOf()==b.valueOf()){
return 0;
}
var _24=(a.length>b.length)?b.length:a.length;
var _25=0;
while((_25<_24)&&(a.charCodeAt(_25)==b.charCodeAt(_25))){
_25++;
}
var ac=a.charCodeAt(_25);
var bc=b.charCodeAt(_25);
if(isNaN(ac)){
return -1;
}else{
if(isNaN(bc)){
return 1;
}else{
return ac-bc;
}
}
};
PTCommonUtil.sortReverseCaseInsensitive=function(aa,bb){
var a=(new String(aa)).toLowerCase();
var b=(new String(bb)).toLowerCase();
if(a.valueOf()==b.valueOf()){
return 0;
}
var _2c=(a.length>b.length)?b.length:a.length;
var _2d=0;
while((_2d<_2c)&&(a.charCodeAt(_2d)==b.charCodeAt(_2d))){
_2d++;
}
var ac=a.charCodeAt(_2d);
var bc=b.charCodeAt(_2d);
if(isNaN(ac)){
return 1;
}else{
if(isNaN(bc)){
return -1;
}else{
return bc-ac;
}
}
};
PTCommonUtil.sortReverse=function(aa,bb){
var a=new String(aa);
var b=new String(bb);
if(a.valueOf()==b.valueOf()){
return 0;
}
var _34=(a.length>b.length)?b.length:a.length;
var _35=0;
while((_35<_34)&&(a.charCodeAt(_35)==b.charCodeAt(_35))){
_35++;
}
var _36=b.charCodeAt(_35)-a.charCodeAt(_35);
if(isNaN(_36)){
return 0;
}else{
return _36;
}
};
PTCommonUtil.sortForward=function(aa,bb){
var a=new String(aa);
var b=new String(bb);
if(a.valueOf()==b.valueOf()){
return 0;
}
var _3b=(a.length>b.length)?b.length:a.length;
var _3c=0;
while((_3c<_3b)&&(a.charCodeAt(_3c)==b.charCodeAt(_3c))){
_3c++;
}
var _3d=a.charCodeAt(_3c)-b.charCodeAt(_3c);
if(isNaN(_3d)){
return 0;
}else{
return _3d;
}
};
PTCommonUtil.getValueForStyleAttribute=function(s,_3f){
var s=new String(s);
var _3f=new String(_3f);
var _40=s.indexOf(_3f);
if(_40==-1){
return;
}
var s=s.substr(_40+_3f.length+1);
while((s.charAt(0)==" ")||(s.charAt(0)==":")){
s=s.substr(1);
}
var _41=s.indexOf(";");
if(_41==-1){
_41=(s.length-1);
}
s=s.substr(0,(_41));
return s;
};
PTCommonUtil.getRelativePosition=function(_42,_43,_44){
var pos=new Object();
pos.x=0;
pos.y=0;
if(!_42){
return pos;
}
if(!_43){
_43=document.body;
}
while(1){
if(_42==_43){
break;
}
pos.x-=parseInt(_42.scrollLeft);
pos.y-=parseInt(_42.scrollTop);
var bbw=parseInt(_42.style.borderBottomWidth);
var ot=_42.offsetTop;
pos.y+=ot+((bbw&&!_44)?bbw:0);
var blw=parseInt(_42.style.borderLeftWidth);
var ol=_42.offsetLeft;
pos.x+=ol+((blw&&!_44)?blw:0);
if(_42.offsetParent){
_42=_42.offsetParent;
}else{
break;
}
}
return pos;
};
PTCommonUtil.scrollDivIntoView=function(_4a,_4b){
if(!_4a){
return;
}
if(!_4b){
_4b=document.body;
}
var pos=PTCommonUtil.getRelativePosition(_4a,_4b,true);
_4b.scrollTop=pos.y;
};
if(!PTCommonUtil.CSSClassCache){
PTCommonUtil.CSSClassCache=new Object();
}
PTCommonUtil.getCSSClassStyles=function(_4d){
var _4e=PTCommonUtil.CSSClassCache[_4d];
if(!_4e){
var _4f=document.createElement("span");
_4f.style.visibility="hidden";
_4f.style.display="none";
_4f.className=_4d;
document.body.appendChild(_4f);
if(document.all){
PTCommonUtil.CSSClassCache[_4d]=_4f.currentStyle;
}else{
if(document.getElementById&&!document.all){
PTCommonUtil.CSSClassCache[_4d]=document.defaultView.getComputedStyle(_4f,"");
}
}
}
return PTCommonUtil.CSSClassCache[_4d];
};
PTCommonUtil.getCSSClassStyleProperty=function(_50,_51){
var _52=PTCommonUtil.getCSSClassStyles(_50);
if(_52){
if(PTBrowserInfo.IS_NETSCAPE_DOM&&PTBrowserInfo.NETSCAPE_VERSION<7.1){
var _53=_51.replace(/([a-z])([A-Z])/,"$1-$2").toLowerCase();
return _52.getPropertyValue(_53);
}else{
return _52[_51];
}
}
return null;
};
PTCommonUtil.getStyleClassFromDocument=function(doc,_55){
var re=new RegExp("\\."+_55+"$","gi");
if(doc.all){
for(var s=0;s<doc.styleSheets.length;s++){
for(var r=0;r<doc.styleSheets[s].rules.length;r++){
if(doc.styleSheets[s].rules[r].selectorText.search(re)!=-1){
return doc.styleSheets[s].rules[r].style;
}
}
}
}else{
if(doc.getElementById){
for(var s=0;s<doc.styleSheets.length;s++){
for(var r=0;r<doc.styleSheets[s].cssRules.length;r++){
if(doc.styleSheets[s].cssRules[r].selectorText.search(re)!=-1){
doc.styleSheets[s].cssRules[r].sheetIndex=s;
doc.styleSheets[s].cssRules[r].ruleIndex=s;
return doc.styleSheets[s].cssRules[r].style;
}
}
}
}else{
if(doc.layers){
return doc.classes[_55].all;
}else{
return false;
}
}
}
};
PTCommonUtil.getStyleClass=function(_59){
return PTCommonUtil.getStyleClassFromDocument(document,_59);
};
PTCommonUtil.getStyleClassProperty=function(_5a,_5b){
var _5c=PTCommonUtil.getStyleClass(_5a);
return (_5c)?_5c[_5b]:"";
};
PTCommonUtil.getRemoteStyleClassProperty=function(doc,_5e,_5f){
var _60=PTCommonUtil.getStyleClassFromDocument(doc,_5e);
return (_60)?_60[_5f]:"";
};
PTCommonUtil.parseGet=function(url){
var _62=new Object();
var _63=",";
var _64;
if(url){
_64=url;
}else{
_64=""+top.document.location.href;
}
_64=_64.substring((_64.indexOf("?"))+1);
if(_64.length<1){
return false;
}
var _65=new Object();
var _66=1;
while(_64.indexOf("&")>-1){
_65[_66]=_64.substring(0,_64.indexOf("&"));
_64=_64.substring((_64.indexOf("&"))+1);
_66++;
}
_65[_66]=_64;
for(var i in _65){
var _68=_65[i].substring(0,_65[i].indexOf("="));
var _69=_65[i].substring((_65[i].indexOf("="))+1);
while(_69.indexOf("+")>-1){
_69=_69.substring(0,_69.indexOf("+"))+" "+_69.substring(_69.indexOf("+")+1);
}
_69=unescape(_69);
if(_62[_68]){
_62[_68]=_62[_68]+_63+_69;
}else{
_62[_68]=_69;
}
}
return _62;
};
PTCommonUtil.wait=function(ms){
var _6b=new Date().valueOf();
while((new Date().valueOf()-_6b)<ms){
}
};
PTCommonUtil.alertVersion=function(){
var str="";
var _6d=new Array("PTCalendarControl","PTTableControl","PTTreeControl","PTTabularLayoutManager","PTCalendarManager");
var _6e=false;
for(var i=0;i<_6d.length;i++){
if(window[_6d[i]]){
_6e=_6d[i];
break;
}else{
if(window[""+_6d[i]]){
_6e=""+_6d[i];
break;
}
}
}
if(_6e){
var _70=eval(_6e);
if(_70.VERSION){
var _71=_70.VERSION;
str+="PTControls  (v. "+_71+")\n";
if(window.PTControls){
for(var obj in window.PTControls){
if(obj=="properties"){
continue;
}
var o=window.PTControls[obj];
if(o&&o.objName&&o.className){
var _74=" ("+o.className+")";
str+="    "+o.objName+_74+"\n";
}
}
}else{
if(window.PTControls){
for(var obj in window.PTControls){
if(obj=="properties"){
continue;
}
var o=window.PTControls[obj];
if(o&&o.objName&&o.className){
var _74=" ("+o.className+")";
str+="    "+o.objName+_74+"\n";
}
}
}
}
}
}
if(typeof PTDatepicker!="undefined"){
if(PTDatepicker.VERSION){
str+="PTDatepicker  (v. "+PTDatepicker.VERSION+")\n";
}
}else{
if(typeof PTDatepicker!="undefined"){
if(PTDatepicker.VERSION){
str+="PTDatepicker  (v. "+PTDatepicker.VERSION+")\n";
}
}
}
if(typeof PTXMLWrapper!="undefined"){
if(PTXMLWrapper.VERSION){
str+="PTXML (v. "+PTXMLWrapper.VERSION+")\n";
}
}else{
if(typeof PTXMLWrapper!="undefined"){
if(PTXMLWrapper.VERSION){
str+="PTXML (v. "+PTXMLWrapper.VERSION+")\n";
}
}
}
str+="PTUtil  (v. "+PTCommonUtil.VERSION+")\n";
str+="\n\xa92002-2004 Plumtree Software Inc., All Rights Reserved    \n";
if(PTCommonUtil.isDefined(window.PT_DEBUG)){
str+="\nDo you want to inspect an object?\n";
var _75=confirm(str);
if(_75){
var obj=prompt("Enter the name of the object you wish to inspect: \n","");
if(obj){
var o=eval(obj);
if(o){
}else{
}
}
}
}else{
alert(str);
}
};
PTCommonUtil.versions=function(){
if(document.all){
if(window.event.altKey&&window.event.ctrlKey&&window.event.shiftKey){
PTCommonUtil.alertVersion();
return false;
}
}
};
PTCommonUtil.setUpVersions=function(){
if((typeof document!="undefined")&&(PTCommonUtil.getIEVersion()>=5.5)){
if(document.all){
if(document.body){
document.body.onmouseleave=PTCommonUtil.versions;
}else{
window.setTimeout("PTCommonUtil.setUpVersions()",500);
}
}
}
};
PTCommonUtil.setUpVersions();
PTCommonUtil.getScripts=function(){
if(!document.scripts){
document.scripts=new Array();
PTCommonUtil.addScripts(document.childNodes);
}
return document.scripts;
};
PTCommonUtil.addScripts=function(_76){
for(var i=0;i<_76.length;i++){
if(_76[i].tagName){
if(_76[i].tagName.toLowerCase()=="script"){
document.scripts[document.scripts.length]=_76[i];
}
PTCommonUtil.addScripts(_76[i].childNodes);
}
}
};
PTCommonUtil.JSON=function(){
var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},s={"boolean":function(x){
return String(x);
},number:function(x){
return isFinite(x)?String(x):"null";
},string:function(x){
if(/["\\\x00-\x1f]/.test(x)){
x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){
var c=m[b];
if(c){
return c;
}
c=b.charCodeAt();
return "\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16);
});
}
return "\""+x+"\"";
},object:function(x){
if(x){
var a=[],b,f,i,l,v;
if(x instanceof Array){
a[0]="[";
l=x.length;
for(i=0;i<l;i+=1){
v=x[i];
f=s[typeof v];
if(f){
v=f(v);
if(typeof v=="string"){
if(b){
a[a.length]=",";
}
a[a.length]=v;
b=true;
}
}
}
a[a.length]="]";
}else{
if(x instanceof Object){
a[0]="{";
for(i in x){
v=x[i];
f=s[typeof v];
if(f){
v=f(v);
if(typeof v=="string"){
if(b){
a[a.length]=",";
}
a.push(s.string(i),":",v);
b=true;
}
}
}
a[a.length]="}";
}else{
return;
}
}
return a.join("");
}
return "null";
}};
return {copyright:"(c)2005 JSON.org",license:"http://www.crockford.com/JSON/license.html",stringify:function(v){
var f=s[typeof v];
if(f){
v=f(v);
if(typeof v=="string"){
return v;
}
}
return null;
},parse:function(_83){
try{
return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(_83.replace(/"(\\.|[^"\\])*"/g,"")))&&eval("("+_83+")");
}
catch(e){
return false;
}
}};
}();
PTArrayUtil=function(){
return this;
};
PTArrayUtil.VERSION="214238";
PTArrayUtil.push=function(arr,_85){
if(!PTArrayUtil.isArrayLike(arr)){
return;
}
if(PTArrayUtil.isArrayLike(_85)){
for(var i=0;i<_85.length;i++){
arr[arr.length]=_85[i];
}
}else{
arr[arr.length]=_85;
}
return arr.length;
};
PTArrayUtil.shift=function(arr){
if(!PTArrayUtil.isArrayLike(arr)){
return;
}
var _88=arr[0];
for(var i=0;i<(arr.length-1);i++){
arr[i]=arr[i+1];
}
delete arr[arr.length-1];
arr.length--;
return _88;
};
PTArrayUtil.splice=function(arr,_8b,_8c,_8d){
if(!PTArrayUtil.isArrayLike(arr)){
return;
}
if(!PTNumberUtil.isInteger(_8b)||(_8b<0)||(_8b>=arr.length)){
return;
}
if(!PTNumberUtil.isInteger(_8c)||(_8c<0)||(_8c>arr.length)){
return;
}
var _8e=new Array();
var _8f=arr.length;
var _90=arguments.length-3;
var _91=_90-_8c;
for(var i=0;i<_8c;i++){
var _93=_8b+i;
_8e[_8e.length]=arr[_93];
delete arr[_93];
}
if(_91!=0){
if(_91<0){
var _94=_8b+_8c;
var _95=_8f-1;
for(var i=_94;i<=_95;i++){
arr[i+_91]=arr[i];
delete arr[i];
}
arr.length=arr.length+_91;
}else{
if(_91>0){
var _94=_8f-1;
var _95=_8b+_8c;
for(var i=_94;i>=_95;i--){
arr[i+_91]=arr[i];
delete arr[i];
}
}
}
}
for(var i=0;i<_90;i++){
arr[_8b+i]=arguments[i+3];
}
return _8e;
};
PTArrayUtil.removeElementAt=function(arr,_97){
if(!PTArrayUtil.isArrayLike(arr)){
return;
}
return PTArrayUtil.splice(arr,_97,1);
};
PTArrayUtil.moveElement=function(arr,_99,_9a){
if(!PTArrayUtil.isArrayLike(arr)){
return;
}
var elm=arr[_99];
PTArrayUtil.removeElementAt(arr,_99);
var len=arr.length;
for(var i=(len-1);i>=_9a;i--){
arr[i+1]=arr[i];
}
arr[_9a]=elm;
};
PTArrayUtil.isArrayLike=function(arr){
var _9f=(arr&&arr.join&&PTNumberUtil.isInteger(arr.length)&&(parseInt(arr.length)>=0));
return (_9f==true);
};
PTCookie=function(){
return this;
};
PTCookie.VERSION="214238";
PTCookie.set=function(_a0,_a1,_a2){
document.cookie=_a0+"="+escape(_a1)+";path=/"+((!_a2)?"":";expires="+_a2.toGMTString());
return;
};
PTCookie.get=function(_a3){
var _a4=_a3+"=";
if(document.cookie.length>0){
begin=document.cookie.indexOf(_a4);
if(begin!=-1){
begin+=_a4.length;
end=document.cookie.indexOf(";",begin);
if(end==-1){
end=document.cookie.length;
}
return unescape(document.cookie.substring(begin,end));
}
}else{
return;
}
};
PTCookie.expire=function(_a5){
document.cookie=_a5+"=; expires=Thu, 01-Jan-70 00:00:01 GMT"+";path=/";
return;
};
PTCookie.daysAway=function(_a6){
var exp=new Date();
var _a8=(1000*60*60*24);
return new Date(exp.setTime(exp.getTime()+(_a8*_a6)));
};
PTCookie.INT_30_DAYS=PTCookie.daysAway(30);
PTDOMUtil=function(){
return this;
};
PTDOMUtil.VERSION="214238";
PTDOMUtil.getElementById=function(id){
if(!document.all){
return document.getElementById(id);
}
var _aa=PTDOMUtil.ElementCache[id];
if(!_aa||!_aa.innerHTML){
PTDOMUtil.ElementCache[id]=document.getElementById(id);
}
return PTDOMUtil.ElementCache[id];
};
if(!window.PTDOMUtil.ElementCache){
PTDOMUtil.ElementCache=new Object();
}
PTDOMUtil.elementContains=function(_ab,_ac){
if(document.all){
return _ab.contains(_ac);
}
if(!PTDOMUtil.ElementContainsCache[_ab]){
PTDOMUtil.ElementContainsCache[_ab]=new Object();
}
if(PTDOMUtil.ElementContainsCache[_ab][_ac]){
return (PTDOMUtil.ElementContainsCache[_ab][_ac]=="true"?true:false);
}
if(_ac==_ab){
PTDOMUtil.ElementContainsCache[_ab][_ac]="true";
return true;
}
if(_ac==null){
PTDOMUtil.ElementContainsCache[_ab][_ac]="false";
return false;
}
if(!_ab.hasChildNodes){
PTDOMUtil.ElementContainsCache[_ab][_ac]="false";
return false;
}
var _ad=_ab.childNodes;
var _ae=_ad.length;
for(var i=0;i<_ae;i++){
var _b0=_ad[i];
if(PTDOMUtil.elementContains(_b0,_ac)){
PTDOMUtil.ElementContainsCache[_ab][_ac]="true";
return true;
}
}
PTDOMUtil.ElementContainsCache[_ab][_ac]="false";
return false;
};
if(!window.PTDOMUtil.ElementContainsCache){
PTDOMUtil.ElementContainsCache=new Object();
}
PTDOMUtil.insertAdjacentElement=function(_b1,_b2,_b3){
if(document.all){
_b1.insertAdjacentElement(_b2,_b3);
}else{
switch(_b2){
case "beforeBegin":
_b1.parentNode.insertBefore(_b3,_b1);
break;
case "afterBegin":
_b1.insertBefore(_b3,_b1.firstChild);
break;
case "beforeEnd":
_b1.appendChild(_b3);
break;
case "afterEnd":
if(_b1.nextSibling){
_b1.parentNode.insertBefore(_b3,_b1.nextSibling);
}else{
_b1.parentNode.appendChild(_b3);
}
break;
}
}
};
PTDOMUtil.getOuterHTML=function(_b4,_b5,_b6){
var sb=new PTStringBuffer();
return PTDOMUtil.getHTML(sb,_b4,true,((_b5)?0:-1),_b6);
};
PTDOMUtil.getInnerHTML=function(_b8,_b9,_ba){
var sb=new PTStringBuffer();
var _bc=PTDOMUtil.getHTML(sb,_b8,false,(((_b9)?0:-1)),_ba);
return _bc;
};
PTDOMUtil.getHTML=function(sb,_be,_bf,_c0,map){
switch(_be.nodeType){
case 1:
case 11:
var _c2;
var i;
if(_bf){
if(map&&_be.id&&map[_be.id]){
sb.append(map[_be.id]);
return sb.toString();
}
_c2=(!(_be.hasChildNodes()||PTDOMUtil.isClosingTag(_be)));
if((_c0>=0)&&!PTDOMUtil.isTextEnclosingTag(_be)){
sb.append("\n");
for(i=0;i<_c0;i++){
sb.append("\t");
}
}
sb.append("<"+_be.tagName.toLowerCase());
var _c4=_be.attributes;
for(i=0;i<_c4.length;++i){
var a=_c4.item(i);
if(!a.specified){
continue;
}
var _c6=a.nodeName.toLowerCase();
if(/moz/.test(_c6)){
continue;
}
var _c7;
if(PTBrowserInfo.IS_NETSCAPE_7||_c6!="style"){
if((PTBrowserInfo.IS_MSIE)&&PTCommonUtil.isDefined(_be[a.nodeName])){
_c7=_be[a.nodeName];
}else{
_c7=a.nodeValue;
}
}else{
_c7=PTDOMUtil.cleanCSSText(_be.style.cssText);
}
if(/moz/.test(_c7)){
continue;
}
sb.append(" "+_c6.toLowerCase()+"=\""+_c7+"\"");
}
sb.append((_c2?" />":">"));
}
var _c8=(!_bf&&(_c0==0))?0:((_c0>=0)?(_c0+1):-1);
for(i=_be.firstChild;i;i=i.nextSibling){
PTDOMUtil.getHTML(sb,i,true,_c8,map);
}
if(_bf&&!_c2){
if((_c0>=0)&&!PTDOMUtil.isTextEnclosingTag(_be)){
sb.append("\n");
for(i=0;i<_c0;i++){
sb.append("\t");
}
}
sb.append("</"+_be.tagName.toLowerCase()+">");
}
break;
case 3:
sb.append(PTDOMUtil.escapeHTML(_be.data));
break;
case 8:
sb.append("<!--"+_be.data+"-->");
break;
}
var _c9=sb.toString();
if((_c9.length>0)&&(_c9.substring(0,1)=="\n")){
_c9=_c9.substring(1);
}
return _c9;
};
PTDOMUtil.escapeHTML=function(str){
str=PTStringUtil.escapeHTML(str);
var sb=new PTStringBuffer();
for(var i=0;i<str.length;i++){
if(str.charCodeAt(i)==160){
sb.append("&nbsp;");
}else{
sb.append(str.charAt(i));
}
}
return sb.toString();
};
PTDOMUtil.isClosingTag=function(el){
var _ce=" h1 h2 h3 h4 h5 h6 script style div span tr td tbody table em strong font a ";
var _cf=(_ce.indexOf(" "+el.tagName.toLowerCase()+" ")!=-1);
return _cf;
};
PTDOMUtil.isTextEnclosingTag=function(el){
var _d1=" th td span em font strong u a ";
var _d2=(_d1.indexOf(" "+el.tagName.toLowerCase()+" ")!=-1);
return _d2;
};
PTDOMUtil.cleanCSSText=function(css){
var _d4={};
var _d5=css.split(";");
for(var i=0;i<_d5.length;i++){
var _d7=_d5[i].split(":");
if(_d7.length==2){
var _d8=PTStringUtil.trimWhitespace(_d7[0].toLowerCase(),true,true);
var _d9=PTStringUtil.trimWhitespace(_d7[1].toLowerCase(),true,true);
_d4[_d8]=_d9;
}
}
if((_d4["border-right"]==_d4["border-left"])&&(_d4["border-top"]==_d4["border-bottom"])&&(_d4["border-left"]==_d4["border-bottom"])){
_d4["border"]=_d4["border-right"];
_d4["border-right"]="";
_d4["border-left"]="";
_d4["border-top"]="";
_d4["border-bottom"]="";
}
var _da="";
for(n in _d4){
_d9=_d4[n];
if(_d9){
_da+=n+": "+_d9+";";
}
}
return _da;
};
PTDOMUtil.getElementLeft=function(elm){
if(!elm){
return false;
}
var x=elm.offsetLeft;
var _dd=elm.offsetParent;
while(_dd!=null){
if(PTBrowserInfo.IS_MSIE){
if((_dd.tagName!="TABLE")&&(_dd.tagName!="BODY")){
x+=_dd.clientLeft;
}
}else{
if(_dd.tagName=="TABLE"){
var _de=parseInt(_dd.border);
if(isNaN(_de)){
var _df=_dd.getAttribute("frame");
if(_df!=null){
x+=1;
}
}else{
if(_de>0){
x+=_de;
}
}
}
}
x+=_dd.offsetLeft;
_dd=_dd.offsetParent;
}
return x;
};
PTDOMUtil.getElementTop=function(elm){
var y=0;
while(elm!=null){
if(PTBrowserInfo.IS_MSIE){
if((elm.tagName!="TABLE")&&(elm.tagName!="BODY")){
y+=elm.clientTop;
}
}else{
if(elm.tagName=="TABLE"){
var _e2=parseInt(elm.border);
if(isNaN(_e2)){
var _e3=elm.getAttribute("frame");
if(_e3!=null){
y+=1;
}
}else{
if(_e2>0){
y+=_e2;
}
}
}
}
y+=elm.offsetTop;
if(elm.offsetParent&&elm.offsetParent.offsetHeight&&elm.offsetParent.offsetHeight<elm.offsetHeight){
elm=elm.offsetParent.offsetParent;
}else{
elm=elm.offsetParent;
}
}
return y;
};
PTDOMUtil.getElementWidth=function(elm){
if(!elm){
return 0;
}
var w1=elm.offsetWidth;
var w2=0;
if(window.getComputedStyle){
var _e7=window.getComputedStyle(elm,null).getPropertyValue("width");
_e7=PTStringUtil.substituteChars(_e7,{"px":""});
w2=parseInt(_e7);
}
return Math.max(w1,w2);
};
PTDOMUtil.getElementHeight=function(elm){
if(!elm){
return 0;
}
var h1=elm.offsetHeight;
var h2=0;
if(window.getComputedStyle){
var _eb=window.getComputedStyle(elm,null).getPropertyValue("height");
_eb=PTStringUtil.substituteChars(_eb,{"px":""});
h2=parseInt(_eb);
}
return Math.max(h1,h2);
};
PTDOMUtil.getWindowWidth=function(){
if(self.innerHeight){
return self.innerWidth;
}else{
if(document.documentElement&&document.documentElement.clientHeight){
return document.documentElement.clientWidth;
}else{
if(document.body){
return document.body.clientWidth;
}
}
}
};
PTDOMUtil.getWindowHeight=function(){
if(self.innerHeight){
return self.innerHeight;
}else{
if(document.documentElement&&document.documentElement.clientHeight){
return document.documentElement.clientHeight;
}else{
if(document.body){
return document.body.clientHeight;
}
}
}
};
PTDOMUtil.setElementOpacity=function(_ec,_ed){
if(!_ec||!_ec.style){
return false;
}
if(isNaN(_ed)){
return false;
}
_ed=parseInt(_ed);
if((_ed<0)||(_ed>100)){
return false;
}
if(document.all){
if(PTBrowserInfo.IS_NT4){
return false;
}else{
if(_ec.filters&&_ec.filters.alpha&&_ec.filters.alpha.opacity){
_ec.filters.alpha.opacity=_ed;
return true;
}else{
if(typeof _ec.style.filter=="string"){
_ec.style.filter="progid:DXImageTransform.Microsoft.Alpha(opacity="+_ed+")";
return true;
}else{
return false;
}
}
}
}else{
if(typeof _ec.style.MozOpacity=="string"){
var dec=_ed/100;
_ec.style.MozOpacity=""+dec;
return true;
}else{
return false;
}
}
};
PTDOMUtil.toggleVisibility=function(id){
var elm=PTDOMUtil.getElementById(id);
if(elm.style.display=="none"){
if(PTDOMUtil._elmDisplayCache[id]||PTDOMUtil._elmDisplayCache[id]==""){
elm.style.display=PTDOMUtil._elmDisplayCache[id];
}else{
elm.style.display="block";
}
}else{
PTDOMUtil._elmDisplayCache[id]=elm.style.display;
elm.style.display="none";
}
};
PTDOMUtil._elmDisplayCache={};
PTDate=function(_f1,_f2,_f3,_f4){
this.datestring=(_f1)?_f1:"";
this.date=(_f2)?_f2:new Date();
this.language=(_f3)?_f3:false;
this.dateFormat=(_f4)?_f4:PTDate.defaultDateFormat;
return this;
};
PTDate.VERSION="214238";
PTDate.TIME_POLICY_ALLOW_TIMES=0;
PTDate.TIME_POLICY_REQUIRE_TIMES=1;
PTDate.TIME_POLICY_FORBID_TIMES=2;
PTDate.FORMAT_DEFAULT=0;
PTDate.FORMAT_SHORT=1;
PTDate.FORMAT_MEDIUM=2;
PTDate.FORMAT_LONG=3;
PTDate.FORMAT_FULL=4;
PTDate.PIVOT_DATE=50;
PTDate.defaultLanguage="en";
PTDate.defaultDateFormat=new String("EEE MMM d HH:mm:ss yyyy");
PTDate.DEFAULT_LOCALE="en";
PTDate.EnglishStrings=new Object();
PTDate.EnglishStrings.monthsLong=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
PTDate.EnglishStrings.monthsShort=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
PTDate.EnglishStrings.daysLong=new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
PTDate.EnglishStrings.daysShort=new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
PTDate.EnglishStrings.daysInitial=new Array("S","M","T","W","T","F","S");
PTDate.EnglishStrings.ampm=new Array("am","pm");
PTDate.formatDate=function(_f5,_f6,_f7){
var d=new PTDate("",_f5,_f7,_f6);
return d.format(_f6,d.language);
};
PTDate.validateDate=function(_f9,_fa,_fb,_fc,_fd){
return PTDateValidator.validateDate(_f9,_fa,_fb,_fc,_fd);
};
PTDate.validateAndFormatDate=function(_fe,_ff,_100,_101,_102,_103){
if(!_fe){
return false;
}
if(!_ff){
_ff=PTDate.defaultDateFormat;
}
var _104=PTDateValidator.validateDate(_fe,_100,_101,_102,_103);
if(!_104){
return false;
}
var _105=PTDate.formatDate(_104,_ff);
return _105;
};
PTDate.getNumberOfDaysInMonth=function(date){
var m=date.getMonth();
if((m==3)||(m==5)||(m==8)||(m==10)){
return 30;
}else{
if(m==1){
var y=date.getFullYear();
if((!(y%4)&&(y%100))||!(y%400)){
return 29;
}else{
return 28;
}
}else{
return 31;
}
}
};
PTDate.get2DigitYear=function(date){
var y=date.getFullYear()%100;
if(y<10){
y="0"+y;
}
return ""+y;
};
PTDate.get2DigitMonth=function(date){
var m=date.getMonth()+1;
if(m<10){
m="0"+m;
}
return ""+m;
};
PTDate.get1DigitMonth=function(date){
var m=date.getMonth()+1;
return ""+m;
};
PTDate.get2DigitDayOfMonth=function(date){
var d=date.getDate();
if(d<10){
d="0"+d;
}
return ""+d;
};
PTDate.get1DigitDayOfMonth=function(date){
var d=date.getDate();
return ""+d;
};
PTDate.get2Digit1To12Hour=function(date){
var h=date.getHours();
h=h%12;
if(h==0){
h="12";
}else{
if(h<10){
h="0"+h;
}
}
return ""+h;
};
PTDate.get1Digit1To12Hour=function(date){
var h=date.getHours();
h=h%12;
if(h==0){
h="12";
}
return ""+h;
};
PTDate.get2Digit0To23Hour=function(date){
var h=date.getHours();
if(h<10){
h="0"+h;
}
return ""+h;
};
PTDate.get2Digit0To11Hour=function(date){
var h=date.getHours();
h=h%12;
if(h<10){
h="0"+h;
}
return ""+h;
};
PTDate.get1Digit0To11Hour=function(date){
var h=date.getHours();
h=h%12;
return ""+h;
};
PTDate.get2Digit1To24Hour=function(date){
var h=date.getHours()+1;
if(h<10){
h="0"+h;
}
return ""+h;
};
PTDate.get1Digit1To24Hour=function(date){
var h=date.getHours()+1;
return ""+h;
};
PTDate.get2DigitMinutes=function(date){
var m=date.getMinutes();
if(m<10){
m="0"+m;
}
return ""+m;
};
PTDate.get1DigitMinutes=function(date){
var m=date.getMinutes();
return ""+m;
};
PTDate.get2DigitSeconds=function(date){
var s=date.getSeconds();
if(s<10){
s="0"+s;
}
return ""+s;
};
PTDate.get1DigitSeconds=function(date){
var s=date.getSeconds();
return ""+s;
};
PTDate.get3DigitMilliseconds=function(date){
var m=date.getMilliseconds();
if(m<10){
m="00"+m;
}else{
if(m<100){
m="0"+m;
}
}
return ""+m;
};
PTDate.getAMPM=function(date,_12c){
if(!_12c){
_12c=PTDate.defaultLanguage;
}
var h=date.getHours();
var STR=PTDateStrings;
if(_12c=="en"){
STR=PTDate.EnglishStrings;
}
var ampm=STR.ampm[0];
if(h>=12){
ampm=STR.ampm[1];
}
return ampm;
};
PTDate.convert2DigitTo4DigitYear=function(year){
if(year<=PTDate.PIVOT_DATE){
year+=100;
}
year+=1900;
return year;
};
PTDate.isLeapYear=function(year){
if(year&&year.getFullYear){
var y=year.getFullYear();
}else{
var y=parseInt(year);
}
return (((y%4==0)&&(y%100!=0))||(y%400==0));
};
PTDate.getFormatListForLocale=function(_133,_134){
_133=new String(_133);
if((_133.indexOf("-")==2)&&(_133.length==5)){
_133=(_133.substr(0,2)).toLowerCase()+"_"+(_133.substr(3,2)).toUpperCase();
}
if(PTDate.formats[_133]){
return PTDate.formats[_133];
}
if(_134){
return false;
}
var _135=_133.substring(0,2);
if(PTDate.formats[_135]){
return PTDate.formats[_135];
}
for(var loc in PTDate.formats){
if(loc.indexOf(_135)>-1){
return PTDate.formats[loc];
}
}
return PTDate.formats[PTDate.DEFAULT_LOCALE];
};
PTDate.stripTimesFromFormat=function(_137){
_137=_137.replace(/a.*$/,"");
_137=_137.replace(/h.*$/i,"");
return _137;
};
PTDate.prototype.format=function(_138,_139){
_138=(_138)?new String(_138):this.dateFormat;
_139=(_139)?_139:false;
var date=this.date;
var STR=PTDateStrings;
if(_139=="en"){
STR=PTDate.EnglishStrings;
}
var _13c={"yyyy":date.getFullYear(),"yy":PTDate.get2DigitYear(date),"MMMMM":STR.monthsLong[date.getMonth()],"MMMM":STR.monthsLong[date.getMonth()],"MMM":STR.monthsShort[date.getMonth()],"MM":PTDate.get2DigitMonth(date),"M":PTDate.get1DigitMonth(date),"EEEE":STR.daysLong[date.getDay()],"EEE":STR.daysShort[date.getDay()],"EE":STR.daysShort[date.getDay()],"E":STR.daysInitial[date.getDay()],"dd":PTDate.get2DigitDayOfMonth(date),"d":PTDate.get1DigitDayOfMonth(date),"hh":PTDate.get2Digit1To12Hour(date),"h":PTDate.get1Digit1To12Hour(date),"HH":PTDate.get2Digit0To23Hour(date),"H":date.getHours(),"KK":PTDate.get2Digit0To11Hour(date),"K":PTDate.get1Digit0To11Hour(date),"kk":PTDate.get2Digit1To24Hour(date),"k":PTDate.get1Digit1To24Hour(date),"mm":PTDate.get2DigitMinutes(date),"m":PTDate.get1DigitMinutes(date),"ss":PTDate.get2DigitSeconds(date),"s":PTDate.get1DigitSeconds(date),"SSS":PTDate.get3DigitMilliseconds(date),"a":PTDate.getAMPM(date,_139),"z":""};
var ph=new Array();
var f=_138;
while(f.indexOf("'")!=f.lastIndexOf("'")){
var re=new RegExp("('[^']*')");
var res=re.exec(f);
var _141=RegExp.$1;
var _142=f.indexOf(_141);
var pEnd=_142+_141.length;
var _144="";
for(var i=0;i<_141.length;i++){
_144+="-";
}
f=f.substring(0,_142)+_144+f.substr(pEnd);
}
for(var _146 in _13c){
while(f.indexOf(_146)>-1){
var _142=f.indexOf(_146);
var pEnd=_142+_146.length;
ph[_142]=new Object();
ph[_142].string=_13c[_146];
ph[_142].end=pEnd;
var _144="";
for(var i=0;i<_146.length;i++){
_144+="-";
}
f=f.substring(0,_142)+_144+f.substr(pEnd);
}
}
var _147=new String("");
var i=0;
while(i<_138.length){
if(ph[i]){
_147+=ph[i].string;
i=ph[i].end;
}else{
if(_138.charAt(i)=="'"){
if(_138.charAt(i+1)=="'"){
_147+="'";
i=i+2;
}else{
i++;
}
continue;
}
_147+=_138.charAt(i);
i++;
}
}
return PTStringUtil.trimWhitespace(_147,true,true);
};
PTDate.prototype.hasTime=function(){
return (this.datestring.indexOf(":")>-1);
};
PTDate.prototype.incrementMonth=function(){
var date=this.date;
var _149=date.getMonth();
if(_149<11){
date.setMonth(_149+1);
}else{
date.setMonth(0);
date.setFullYear(date.getFullYear()+1);
}
};
PTDate.prototype.incrementWeek=function(){
var date=this.date;
var _14b=date.getHours();
date.setHours(12);
var week=1000*60*60*24*7;
date.setTime(date.getTime()+week);
date.setHours(_14b);
};
PTDate.prototype.incrementDay=function(){
var date=this.date;
var _14e=date.getHours();
date.setHours(12);
var day=1000*60*60*24;
date.setTime(date.getTime()+day);
date.setHours(_14e);
};
PTDate.prototype.clone=function(){
return new PTDate(this.datestring,new Date(this.date.getTime()),this.language,this.dateFormat);
};
PTDate.prototype.getNumberOfDaysInThisMonth=function(){
return PTDate.getNumberOfDaysInMonth(this.date);
};
PTDate.prototype.getTime=function(){
return this.date.getTime();
};
if(!PTDate.formats){
PTDate.formats=new Object();
}
PTDate.formats["en"]=new Array("MMM d, yyyy h:mm:ss a","M/d/yyyy h:mm a","MMM d, yyyy h:mm:ss a","MMMM d, yyyy h:mm:ss a z","EEEE, MMMM d, yyyy h:mm:ss a z");
PTDate.formats["da"]=new Array("dd-MM-yy HH:mm:ss","dd-MM-yy HH:mm","dd-MM-yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy HH:mm:ss z");
PTDate.formats["da_DK"]=new Array("dd-MM-yy HH:mm:ss","dd-MM-yy HH:mm","dd-MM-yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy HH:mm:ss z");
PTDate.formats["fi"]=new Array("d.M.yy HH:mm:ss","d.M.yy HH:mm","d.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy HH:mm:ss z");
PTDate.formats["fi_FI"]=new Array("dd-MM-yy HH:mm:ss","dd-MM-yy HH:mm","dd-MM-yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy HH:mm:ss z");
PTDate.formats["no"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["no_NO"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["nb"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["nb_NO"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["nn"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["nn_NO"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","d. MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["sv"]=new Array("yyyy-MM-dd HH:mm:ss","yyyy-MM-dd HH:mm","yyyy-MM-dd HH:mm:ss","'den ' d MMMM yyyy HH:mm:ss z","'den ' d MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["sv_SE"]=new Array("yyyy-MM-dd HH:mm:ss","yyyy-MM-dd HH:mm","yyyy-MM-dd HH:mm:ss","'den ' d MMMM yyyy HH:mm:ss z","'den ' d MMMM yyyy 'kl ' HH:mm z");
PTDate.formats["tr"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","dd MMMM yyyy EEEE HH:mm:ss z","dd MMMM yyyy EEEE HH:mm:ss z");
PTDate.formats["tr_TR"]=new Array("dd.MM.yy HH:mm:ss","dd.MM.yy HH:mm","dd.MMM.yyyy HH:mm:ss","dd MMMM yyyy EEEE HH:mm:ss z","dd MMMM yyyy EEEE HH:mm:ss z");
PTDate.formats["de"]=new Array("dd.MM.yyyy HH:mm:ss","dd.MM.yyyy HH:mm","dd.MM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","EEEE, d. MMMM yyyy H.mm' Uhr 'z");
PTDate.formats["de_AT"]=new Array("dd.MM.yyyy HH:mm:ss","dd.MM.yyyy HH:mm","dd.MM.yyyy HH:mm:ss","dd. MMMM yyyy HH:mm:ss z","EEEE, dd. MMMM yyyy HH.mm' Uhr 'z");
PTDate.formats["de_CH"]=new Array("dd.MM.yyyy HH:mm:ss","dd.MM.yyyy HH:mm","dd.MM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","EEEE, d. MMMM yyyy H.mm' Uhr 'z");
PTDate.formats["de_DE"]=new Array("dd.MM.yyyy HH:mm:ss","dd.MM.yyyy HH:mm","dd.MM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","EEEE, d. MMMM yyyy H.mm' Uhr 'z");
PTDate.formats["de_LU"]=new Array("dd.MM.yyyy HH:mm:ss","dd.MM.yyyy HH:mm","dd.MM.yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","EEEE, d. MMMM yyyy H.mm' Uhr 'z");
PTDate.formats["en_AU"]=new Array("d/MM/yyyy HH:mm:ss","d/MM/yyyy HH:mm","d/MM/yyyy HH:mm:ss","d MMMM yyyy H:mm:ss","EEEE, d MMMM yyyy hh:mm:ss a z");
PTDate.formats["en_CA"]=new Array("d-MMM-yyyy h:mm:ss a","dd/MM/yyyy h:mm a","d-MMM-yyyy h:mm:ss a","MMMM d, yyyy h:mm:ss z a","EEEE, MMMM d, yyyy h:mm:ss 'o''clock' a z");
PTDate.formats["en_GB"]=new Array("dd-MMM-yyyy HH:mm:ss","dd/MM/yyyy HH:mm","dd-MMM-yyyy HH:mm:ss","dd MMMM yyyy HH:mm:ss z","dd MMMM yyyy HH:mm:ss 'o''clock' z");
PTDate.formats["en_IE"]=new Array("dd-MMM-yyyy HH:mm:ss","dd/MM/yyyy HH:mm","dd-MMM-yyyy HH:mm:ss","dd MMMM yyyy HH:mm:ss z","dd MMMM yyyy HH:mm:ss 'o''clock' z");
PTDate.formats["en_NZ"]=new Array("d/MM/yyyy HH:mm:ss","d/MM/yyyy HH:mm","d/MM/yyyy HH:mm:ss","d MMMM yyyy H:mm:ss","EEEE, d MMMM yyyy hh:mm:ss a z");
PTDate.formats["en_US"]=new Array("MMM d, yyyy h:mm:ss a","M/d/yyyy h:mm a","MMM d, yyyy h:mm:ss a","MMMM d, yyyy h:mm:ss a z","EEEE, MMMM d, yyyy h:mm:ss a z");
PTDate.formats["en_ZA"]=new Array("yyyy/MM/dd hh:mm:ss","yyyy/MM/dd hh:mm","yyyy/MM/dd hh:mm:ss","dd MMMM yyyy hh:mm:ss","dd MMMM yyyy hh:mm:ss a");
PTDate.formats["es"]=new Array("dd-MMM-yyyy H:mm:ss","d/MM/yyyy H:mm","dd-MMM-yyyy H:mm:ss","d' de 'MMMM' de 'yyyy H:mm:ss z","EEEE d' de 'MMMM' de 'yyyy HH'H'mm'' z");
PTDate.formats["es_AR"]=new Array("dd/MM/yyyy HH:mm:ss","dd/MM/yyyy HH:mm","dd/MM/yyyy HH:mm:ss","d' de 'MMMM' de 'yyyy H:mm:ss z","EEEE d' de 'MMMM' de 'yyyy HH'h'''mm z");
PTDate.formats["es_BO"]=new Array("dd-MM-yyyy hh:mm:ss a","dd-MM-yyyy hh:mm a","dd-MM-yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_CL"]=new Array("dd-MM-yyyy hh:mm:ss a","dd-MM-yyyy hh:mm a","dd-MM-yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_CO"]=new Array("d/MM/yyyy hh:mm:ss a","d/MM/yyyy hh:mm a","d/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_CR"]=new Array("dd/MM/yyyy hh:mm:ss a","dd/MM/yyyy hh:mm a","dd/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_DO"]=new Array("MM/dd/yyyy hh:mm:ss a","MM/dd/yyyy hh:mm a","MM/dd/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_EC"]=new Array("dd/MM/yyyy hh:mm:ss a","dd/MM/yyyy hh:mm a","dd/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_GT"]=new Array("d/MM/yyyy hh:mm:ss a","d/MM/yyyy hh:mm a","d/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_HN"]=new Array("MM-dd-yyyy hh:mm:ss a","MM-dd-yyyy hh:mm a","MM-dd-yyyy hh:mm:ss a","dd' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE dd' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_MX"]=new Array("d/MM/yyyy hh:mm:ss a","d/MM/yyyy hh:mm a","d/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_NI"]=new Array("MM-dd-yyyy hh:mm:ss a","MM-dd-yyyy hh:mm a","MM-dd-yyyy hh:mm:ss a","dd' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE dd' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_PA"]=new Array("MM/dd/yyyy hh:mm:ss a","MM/dd/yyyy hh:mm a","MM/dd/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_PE"]=new Array("dd/MM/yyyy hh:mm:ss a","dd/MM/yyyy hh:mm a","dd/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_PR"]=new Array("MM-dd-yyyy hh:mm:ss a","MM-dd-yyyy hh:mm a","MM-dd-yyyy hh:mm:ss a","dd' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE dd' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_PY"]=new Array("dd/MM/yyyy hh:mm:ss a","dd/MM/yyyy hh:mm a","dd/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_SV"]=new Array("MM-dd-yyyy hh:mm:ss a","MM-dd-yyyy hh:mm a","MM-dd-yyyy hh:mm:ss a","dd' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE dd' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_UY"]=new Array("dd/MM/yyyy hh:mm:ss a","dd/MM/yyyy hh:mm a","dd/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["es_VE"]=new Array("dd/MM/yyyy hh:mm:ss a","dd/MM/yyyy hh:mm a","dd/MM/yyyy hh:mm:ss a","d' de 'MMMM' de 'yyyy hh:mm:ss a z","EEEE d' de 'MMMM' de 'yyyy hh:mm:ss a z");
PTDate.formats["fr"]=new Array("d MMM yyyy HH:mm:ss","dd/MM/yyyy HH:mm","d MMM yyyy HH:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy HH' h 'mm z");
PTDate.formats["fr_BE"]=new Array("dd-MMM-yyyy H:mm:ss","d/MM/yyyy H:mm","dd-MMM-yyyy H:mm:ss","d MMMM yyyy H:mm:ss z","EEEE d MMMM yyyy H' h 'mm' min 'ss' s 'z");
PTDate.formats["fr_CA"]=new Array("yyyy-MM-dd HH:mm:ss","yyyy-MM-dd HH:mm","yyyy-MM-dd HH:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy H' h 'mm z");
PTDate.formats["fr_CH"]=new Array("d MMM yyyy HH:mm:ss","dd.MM.yyyy HH:mm","d MMM yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","EEEE, d. MMMM yyyy HH.mm.' h' z");
PTDate.formats["fr_FR"]=new Array("d MMM yyyy HH:mm:ss","dd/MM/yyyy HH:mm","d MMM yyyy HH:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy HH' h 'mm z");
PTDate.formats["fr_LU"]=new Array("d MMM yyyy HH:mm:ss","dd/MM/yyyy HH:mm","d MMM yyyy HH:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy HH' h 'mm z");
PTDate.formats["it"]=new Array("d-MMM-yyyy H.mm.ss","dd/MM/yyyy H.mm","d-MMM-yyyy H.mm.ss","d MMMM yyyy H.mm.ss z","EEEE d MMMM yyyy H.mm.ss z");
PTDate.formats["it_CH"]=new Array("d-MMM-yyyy HH:mm:ss","dd.MM.yyyy HH:mm","d-MMM-yyyy HH:mm:ss","d. MMMM yyyy HH:mm:ss z","EEEE, d. MMMM yyyy H.mm' h' z");
PTDate.formats["it_IT"]=new Array("d-MMM-yyyy H.mm.ss","dd/MM/yyyy H.mm","d-MMM-yyyy H.mm.ss","d MMMM yyyy H.mm.ss z","EEEE d MMMM yyyy H.mm.ss z");
PTDate.formats["ja"]=new Array("yyyy/MM/dd H:mm:ss","yyyy/MM/dd H:mm","yyyy/MM/dd H:mm:ss","yyyy/MM/dd H:mm:ss z","yyyy'\u5e74'M'\u6708'd'\u65e5' H'\u6642'mm'\u5206'ss'\u79d2'z");
PTDate.formats["ja_JP"]=new Array("yyyy/MM/dd H:mm:ss","yyyy/MM/dd H:mm","yyyy/MM/dd H:mm:ss","yyyy/MM/dd H:mm:ss z","yyyy'\u5e74'M'\u6708'd'\u65e5' H'\u6642'mm'\u5206'ss'\u79d2'z");
PTDate.formats["ko"]=new Array("yyyy-MM-dd a h:mm:ss","yyyy-MM-dd a h:mm","yyyy-MM-dd a h:mm:ss","yyyy'\ub144' M'\uc6d4' d'\uc77c' EE a hh'\uc2dc'mm'\ubd84'ss'\ucd08'","yyyy'\ub144' M'\uc6d4' d'\uc77c' EEEE a hh'\uc2dc'mm'\ubd84'ss'\ucd08' z");
PTDate.formats["ko_KR"]=new Array("yyyy-MM-dd a h:mm:ss","yyyy-MM-dd a h:mm","yyyy-MM-dd a h:mm:ss","yyyy'\ub144' M'\uc6d4' d'\uc77c' EE a hh'\uc2dc'mm'\ubd84'ss'\ucd08'","yyyy'\ub144' M'\uc6d4' d'\uc77c' EEEE a hh'\uc2dc'mm'\ubd84'ss'\ucd08' z");
PTDate.formats["nl"]=new Array("d-MMM-yyyy HH:mm:ss","d-M-yy H:mm","d-MMM-yyyy H:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy H.mm' uur  'z");
PTDate.formats["nl_BE"]=new Array("d-MMM-yyyy HH:mm:ss","d/MM/yy H:mm","d-MMM-yyyy H:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy H.mm' uur  'z");
PTDate.formats["nl_NL"]=new Array("d-MMM-yyyy HH:mm:ss","d-M-yy H:mm","d-MMM-yyyy H:mm:ss","d MMMM yyyy HH:mm:ss z","EEEE d MMMM yyyy H.mm' uur  'z");
PTDate.formats["pt"]=new Array("d/MMM/yyyy H:mm:ss","dd-MM-yyyy H:mm","d/MMM/yyyy H:mm:ss","d' de 'MMMM' de 'yyyy H:mm:ss z","EEEE, d' de 'MMMM' de 'yyyy HH'H'mm'm' z");
PTDate.formats["pt_BR"]=new Array("dd/MM/yyyy HH:mm:ss","dd/MM/yyyy HH:mm","dd/MM/yyyy HH:mm:ss","d' de 'MMMM' de 'yyyy H'h'm'min's's' z","EEEE, d' de 'MMMM' de 'yyyy HH'h'mm'min'ss's' z");
PTDate.formats["pt_PT"]=new Array("d/MMM/yyyy H:mm:ss","dd-MM-yyyy H:mm","d/MMM/yyyy H:mm:ss","d' de 'MMMM' de 'yyyy H:mm:ss z","EEEE, d' de 'MMMM' de 'yyyy HH'H'mm'm' z");
PTDate.formats["zh"]=new Array("yyyy-M-d H:mm:ss","yyyy-M-d ah:mm","yyyy-M-d H:mm:ss","yyyy'\u5e74'M'\u6708'd'\u65e5' ahh'\u65f6'mm'\u5206'ss'\u79d2'","yyyy'\u5e74'M'\u6708'd'\u65e5' HH'\u65f6'mm'\u5206'ss'\u79d2' z");
PTDate.formats["zh_CN"]=new Array("yyyy-M-d H:mm:ss","yyyy-M-d ah:mm","yyyy-M-d H:mm:ss","yyyy'\u5e74'M'\u6708'd'\u65e5' ahh'\u65f6'mm'\u5206'ss'\u79d2'","yyyy'\u5e74'M'\u6708'd'\u65e5' HH'\u65f6'mm'\u5206'ss'\u79d2' z");
PTDate.formats["zh_HK"]=new Array("yyyy'\u5e74'M'\u6708'd'\u65e5' ahh:mm:ss","yyyy'\u5e74'M'\u6708'd'\u65e5' ah:mm","yyyy'\u5e74'M'\u6708'd'\u65e5' ahh:mm:ss","yyyy'\u5e74'MM'\u6708'dd'\u65e5' EEEE ahh'\u6642'mm'\u5206'ss'\u79d2'","yyyy'\u5e74'MM'\u6708'dd'\u65e5' EEEE ahh'\u6642'mm'\u5206'ss'\u79d2' z");
PTDate.formats["zh_TW"]=new Array("yyyy/M/d a hh:mm:ss","yyyy/M/d a h:mm","yyyy/M/d a hh:mm:ss","yyyy'\u5e74'M'\u6708'd'\u65e5' ahh'\u6642'mm'\u5206'ss'\u79d2'","yyyy'\u5e74'M'\u6708'd'\u65e5' ahh'\u6642'mm'\u5206'ss'\u79d2' z");
PTDateUtil=function(){
return this;
};
PTDateUtil.VERSION="214238";
PTDateUtil.isSameDay=function(_150,_151){
if(isNaN(_150)||isNaN(_151)){
return false;
}
if((_150.getFullYear()==_151.getFullYear())&&(_150.getMonth()==_151.getMonth())&&(_150.getDate()==_151.getDate())){
return true;
}else{
return false;
}
};
PTDateUtil.getDaysBetweenDates=function(_152,_153){
if(isNaN(_152)||isNaN(_153)){
return 0;
}
_152.setHours(12);
_153.setHours(12);
var _154=Math.abs(_153.getTime()-_152.getTime());
return Math.round(_154/(1000*60*60*24));
};
PTDateUtil.formatTime=function(_155,_156){
var err=false;
var _158=/\b\d\d?\b|\b\d\d?\B|\B\d\d?\b|\B\d\d?\B/g;
var _159=new RegExp("AM|am|Am|aM|PM|pm|Pm|pM|p.m.|p.m|P.M.|a.m.|a.m|A.M.");
if(_155==""){
return false;
}
if((_155.match(/\d\d?:\d/)==null)||(_155.match(/:/)==null)){
return false;
}
var _15a=_155.match(_158);
var _15b=_155.match(_159);
if(!_15a[1]){
_15a[1]=0;
}
if(!_15a[2]){
_15a[2]=0;
}
if((_15a[0]>23)||(_15a[1]>59)||(_15a[2]>59)||(_15a[0]==null)||(_15a[0]<0)||(_15a[1]<0)||(_15a[2]<0)){
err=true;
}
var _15c;
if(_156==0){
if((_15b=="PM")&&(_15a[0]<12)){
_15a[0]+=12;
}else{
if((_15b=="AM")&&(_15a[0]==12)){
_15a[0]=0;
}
}
}else{
if(!_15b){
_15b="AM";
if(_15a[0]>12){
_15a[0]=_15a[0]-12;
_15b="PM";
}else{
if(_15a[0]==0){
_15a[0]=12;
_15b="AM";
}
}
}
}
for(i=0;i<3;i++){
_15c="0"+_15a[i];
if(_15c.length==2){
_15a[i]=_15c;
}
}
if(err){
alert(PTS_STR["PTU-Date-TimeFormatError"]);
return false;
}else{
_155=_15a[0]+":"+_15a[1]+":"+_15a[2];
if(_156==1){
_155+=" "+_15b;
}
return _155;
}
};
PTDateUtil.validateDate=function(_15d,_15e,_15f){
var _160=_15d+" "+_15e+" "+_15f;
var _161=new Date(_160);
var _162=_161.toGMTString();
var _163=_162.split(" ");
return (_163[2]!=_15e);
};
PTDateValidator=function(){
return this;
};
PTDateValidator.VERSION="214238";
PTDateValidator.TIME_POLICY_ALLOW_TIMES=0;
PTDateValidator.TIME_POLICY_REQUIRE_TIMES=1;
PTDateValidator.TIME_POLICY_FORBID_TIMES=2;
PTDateValidator.formatTokens=new Array("a","d","E","h","H","k","K","m","M","s","S","y");
PTDateValidator.punctuation=new Array(",","/",":","-",".");
PTDateValidator.closeSubstitutes={"\xe1":"a","\xe4":"a","\xe7":"c","\xe9":"e","\xec":"i","\xfb":"u","\u2013":"-","\u2212":"-"};
PTDateValidator.validateDate=function(_164,_165,_166,_167,_168){
if(!_164){
return false;
}
if(!_165){
_165=PTDate.DEFAULT_LOCALE;
}
if(!_167){
_167=PTDateValidator.TIME_POLICY_ALLOW_TIMES;
}
if(!_168){
_168=PTDate.getFormatListForLocale(_165);
}
var _169=false;
var _16a=_168.length;
var _16b=false;
var hash=PTDateValidator.getPunctuationHash();
for(var f=0;f<_16a;f++){
var _16e=_168[f];
_16b=PTDateValidator.parseDateStringAgainstFormat(_164,_16e,hash,_165);
if(_16b!=false){
if(PTNumberUtil.isInteger(_16b.day)&&PTNumberUtil.isInteger(_16b.month)&&PTNumberUtil.isInteger(_16b.year)){
break;
}
}
}
var date;
var _169=false;
if(_16b!=false){
if(_16b.ampm&&(_16b.ampm=="pm")){
if((_16b.hour>0)&&(_16b.hour<12)){
_16b.hour+=12;
}
}
date=new Date(_16b.year,_16b.month,_16b.day,_16b.hour,_16b.minutes,_16b.seconds);
if((_16b.day==date.getDate())&&(_16b.month==date.getMonth())&&(_16b.year==date.getFullYear())){
_169=true;
}
}
if(!_169){
_166=PTDateValidator.alertOnFailure(_166,_168,_167);
}
var _170=false;
if(_167==PTDateValidator.TIME_POLICY_ALLOW_TIMES){
if((PTNumberUtil.isInteger(_16b.hour)&&PTNumberUtil.isInteger(_16b.minutes))||(!PTNumberUtil.isInteger(_16b.hour)&&!PTNumberUtil.isInteger(_16b.minutes))){
_170=true;
}else{
_166=PTDateValidator.alertTimeFormatProblem(_166,_168,_167);
}
}else{
if(_167==PTDateValidator.TIME_POLICY_REQUIRE_TIMES){
if(PTNumberUtil.isInteger(_16b.hour)&&PTNumberUtil.isInteger(_16b.minutes)){
_170=true;
}else{
_166=PTDateValidator.alertTimeRequired(_166,_168,_167);
}
}else{
if(_167==PTDateValidator.TIME_POLICY_FORBID_TIMES){
if(!PTNumberUtil.isInteger(_16b.hour)&&!PTNumberUtil.isInteger(_16b.minutes)){
_170=true;
}else{
_166=PTDateValidator.alertTimeForbidden(_166,_168,_167);
}
}
}
}
if(_167!=PTDateValidator.TIME_POLICY_FORBID_TIMES){
if((_16b.hour<0)||(_16b.hour>23)){
_170=false;
_166=PTDateValidator.alertTimeFormatProblem(_166,_168,_167);
}else{
if((_16b.minutes<0)||(_16b.minutes>59)){
_170=false;
_166=PTDateValidator.alertTimeFormatProblem(_166,_168,_167);
}else{
if((_16b.seconds<0)||(_16b.seconds>59)){
_170=false;
_166=PTDateValidator.alertTimeFormatProblem(_166,_168,_167);
}
}
}
}
var _171=false;
if(_169&&_170){
_171=date;
}
return _171;
};
PTDateValidator.parseDateStringAgainstFormat=function(_172,_173,hash,_175){
_172=(new String(_172)).replace(/\'/g,"");
_173=_173.replace(/\'\'/g,"");
while(1){
var s=_173.indexOf("'");
if(s==-1){
break;
}
var e=_173.substr(s+1).indexOf("'");
if(e==-1){
break;
}
e+=s+1;
var _178=_173.substring(s+1,e);
var _179=parseInt(((s/_173.length)*100),10);
var _17a=PTDateValidator.findAllMatches(_178,_172,_175);
var _17b=false;
var _17c=100;
for(var m=0;m<_17a.length;m++){
var _17e=_17a[m];
var dist=Math.abs(_179-_17e.pct);
if(dist<_17c){
_17b=_17e;
}
}
if(_17b){
var _180=_17b.loc;
var end=_180+_178.length;
_172=_172.substring(0,_180)+" "+_172.substr(end);
}
_173=_173.substring(0,s)+" "+_173.substr(e+1);
}
_172=PTStringUtil.substituteChars(_172,hash);
_173=PTStringUtil.substituteChars(_173,hash);
_172=PTStringUtil.trimWhitespace(_172,true,true);
_173=PTStringUtil.trimWhitespace(_173,true,true);
var i=_172.split(/\s+/);
var f=_173.split(/\s+/);
var _184=new _dateData();
var _185=Math.min(i.length,f.length);
for(var w=0;w<_185;w++){
var _187=f[w];
var word=i[w];
_184=PTDateValidator.validateWordByTokenType(word,_187,_184,_175);
if(_184==false){
return false;
}
}
return _184;
};
PTDateValidator.validateWordByTokenType=function(word,_18a,_18b,_18c){
word=word.toLowerCase();
var _18d=false;
var STR=PTDateStrings;
if(_18c.indexOf("en")==0){
STR=PTDate.EnglishStrings;
}
if(_18a.indexOf("a")>-1){
var _18f=STR.ampm.length;
for(var s=0;s<_18f;s++){
var _191=STR.ampm[s];
var idx=word.indexOf(_191.toLowerCase());
if(idx>-1){
_18b.ampm=(s)?"pm":"am";
word=word.substring(0,idx)+word.substr(_191.length);
while(_18a.indexOf("a")>-1){
var pos=_18a.indexOf("a");
_18a=_18a.substring(0,pos)+_18a.substr(pos+1);
}
_18d=true;
break;
}
}
}
if(_18a.charAt(0)=="d"){
if(!PTNumberUtil.isInteger(word)){
return false;
}
var n=word;
if(parseInt(n,10)==0){
n=parseInt(n,10);
}else{
n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
}
if(isNaN(n)){
return false;
}
_18b.day=n;
return _18b;
}else{
if(_18a=="E"){
if(PTDateValidator.isWordLike(word,STR.daysInitial,7)){
return _18b;
}
}else{
if(_18a.substring(0,2)=="EE"){
if(PTDateValidator.isWordLike(word,STR.daysLong.concat(STR.daysShort),7)){
return _18b;
}
}else{
if(_18a.charAt(0).toLowerCase()=="h"){
if(!PTNumberUtil.isInteger(word)){
return false;
}
var n=word;
if(parseInt(n,10)==0){
n=parseInt(n,10);
}else{
n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
}
if(isNaN(n)){
return false;
}
_18b.hour=n;
return _18b;
}else{
if(_18a.charAt(0).toLowerCase()=="k"){
if(!PTNumberUtil.isInteger(word)){
return false;
}
var n=word;
if(parseInt(n,10)==0){
n=parseInt(n,10);
}else{
n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
}
if(isNaN(n)){
return false;
}
_18b.hour=n;
return _18b;
}else{
if(_18a.charAt(0)=="m"){
if(!PTNumberUtil.isInteger(word)){
return false;
}
var n=word;
if(parseInt(n,10)==0){
n=parseInt(n,10);
}else{
n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
}
if(isNaN(n)){
return false;
}
_18b.minutes=n;
return _18b;
}else{
if((_18a=="M")||(_18a=="MM")){
if(!PTNumberUtil.isInteger(word)){
return false;
}
var n=word;
if(parseInt(n,10)==0){
n=parseInt(n,10);
}else{
n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
}
if(isNaN(n)){
return false;
}
n-=1;
_18b.month=n;
return _18b;
}else{
if(_18a.substring(0,3)=="MMM"){
var m=PTDateValidator.isWordLike(word,STR.monthsLong.concat(STR.monthsShort),12);
if(m){
if(parseInt(m,10)==0){
_18b.month=0;
}else{
_18b.month=parseInt(PTNumberUtil.trimLeadingZeros(m),10);
}
return _18b;
}
}else{
if(_18a.charAt(0)=="s"){
var n=word;
if(parseInt(n,10)==0){
n=parseInt(n,10);
}else{
n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
}
if(isNaN(n)){
_18b.seconds=0;
}else{
_18b.seconds=n;
}
return _18b;
}else{
if(_18a.charAt(0)=="S"){
return _18b;
}else{
if(_18a.indexOf("yy")>-1){
if(!PTNumberUtil.isInteger(word)){
return false;
}
var n=parseInt(PTNumberUtil.trimLeadingZeros(word),10);
if(isNaN(n)){
return false;
}
if(n<100){
n=PTDate.convert2DigitTo4DigitYear(n);
}
_18b.year=n;
return _18b;
}else{
if(_18a.charAt(0)=="z"){
return _18b;
}
}
}
}
}
}
}
}
}
}
}
}
if(_18d){
return _18b;
}else{
return false;
}
};
PTDateValidator.isWordLike=function(word,_197,_198){
word=word+"";
var len=_197.length;
for(var a=0;a<len;a++){
var m=(new String(_197[a])).toLowerCase()+"";
if(m==word){
return new String(a%_198);
}
if((word.length>=3)&&(m.indexOf(word.substring(0,3))==0)){
return new String(a%_198);
}
m=PTStringUtil.substituteChars(m,PTDateValidator.closeSubstitutes);
if(m==word){
return new String(a%_198);
}
if((word.length>=3)&&(m.indexOf(word)==0)){
return new String(a%_198);
}
}
return false;
};
PTDateValidator.findAllMatches=function(_19c,_19d,_19e){
var _19f=new Array();
var _1a0=new String(_19d);
var _1a1=0;
var STR=PTDateStrings;
if(_19e.indexOf("en")==0){
STR=PTDate.EnglishStrings;
}
while(_1a0.indexOf(_19c)>-1){
var loc=_1a0.indexOf(_19c);
var pos=loc+_1a1;
var _1a5=false;
var _1a6=(_1a0.substr(_1a0.indexOf(_19c))).replace(/\s.*$/,"");
if(_1a6.length>1){
for(var i=0;i<STR.monthsLong.length;i++){
if(STR.monthsLong[i].indexOf(_1a6)>-1){
_1a5=true;
break;
}
}
}
if(!_1a5){
var r=_19f[_19f.length]=new Object();
r.loc=pos;
r.pct=Math.round((pos/_19d.length)*100);
}
_1a0=_1a0.substr(loc+1);
_1a1+=(loc+1);
}
return _19f;
};
PTDateValidator.alertOnFailure=function(_1a9,_1aa,_1ab){
if(_1a9){
var sb=new PTStringBuffer();
sb.append(PTS_STR["PTU-DateV-DateFormatError"]+"\n\n");
sb.append(PTS_STR["PTU-DateV-ExampleFormats"]+"\n\n");
var m=new Array();
var d=new Date();
var _1af=0;
if(_1aa[0]==_1aa[2]){
_1af=1;
}
for(var f=_1af;f<_1aa.length;f++){
var _1b1=_1aa[f];
if(_1ab==PTDateValidator.TIME_POLICY_FORBID_TIMES){
_1b1=PTDate.stripTimesFromFormat(_1b1);
}
var _1b2=PTDate.formatDate(d,_1b1);
if(m[_1b2]){
continue;
}else{
m[_1b2]=true;
}
sb.append("      "+_1b2+"\n");
}
sb.append("\n");
alert(sb.toString());
}
return false;
};
PTDateValidator.alertTimeFormatProblem=function(_1b3,_1b4,_1b5){
if(_1b3){
alert(PTS_STR["PTU-DateV-TimeFormatError"]);
return false;
}
return _1b3;
};
PTDateValidator.alertTimeRequired=function(_1b6,_1b7,_1b8){
if(_1b6){
alert(PTS_STR["PTU-DateV-TimeRequired"]);
return false;
}
return _1b6;
};
PTDateValidator.alertTimeForbidden=function(_1b9,_1ba,_1bb){
if(_1b9){
alert(PTS_STR["PTU-DateV-TimeForbidden"]);
return false;
}
return _1b9;
};
PTDateValidator.getPunctuationHash=function(){
var hash=new Array();
var _1bd=PTStringUtil.whitespaceChars.concat(PTDateValidator.punctuation);
var len=_1bd.length;
for(var c=0;c<len;c++){
hash[_1bd[c]]=" ";
}
return hash;
};
function _dateData(){
this.day=false;
this.month=false;
this.year=false;
this.hour=false;
this.minutes=false;
this.seconds=false;
this.ampm=false;
return this;
}
PTEventUtil=function(){
return this;
};
PTEventUtil.VERSION="214238";
PTEventUtil.SRC_BUTTON_LEFT="left";
PTEventUtil.SRC_BUTTON_RIGHT="right";
PTEventUtil.SRC_BUTTON_MIDDLE="middle";
PTEventUtil.stopBubbling=function(e){
if(!e){
var e=window.event;
}
if(!e){
return;
}
e.cancelBubble=true;
if(e.stopPropagation){
e.stopPropagation();
}
};
PTEventUtil.attachEventListener=function(_1c1,_1c2,_1c3){
if(document.all){
if(_1c2.substring(0,2)!="on"){
_1c2="on"+_1c2;
}
_1c1.attachEvent(_1c2,_1c3);
}else{
if(_1c2.substring(0,2)=="on"){
_1c2=_1c2.substring(2,_1c2.length);
}
_1c1.addEventListener(_1c2,_1c3,false);
}
};
PTEventUtil.detachEventListener=function(_1c4,_1c5,_1c6){
if(document.all){
if(_1c5.substring(0,2)!="on"){
_1c5="on"+_1c5;
}
_1c4.detachEvent(_1c5,_1c6);
}else{
if(_1c5.substring(0,2)=="on"){
_1c5=_1c5.substring(2,_1c5.length);
}
_1c4.removeEventListener(_1c5,_1c6,false);
}
};
PTEventUtil.getSrcElement=function(e){
if(document.all){
return e.srcElement;
}else{
return e.target;
}
};
PTEventUtil.getButtonClicked=function(e){
if(!e){
return false;
}
if(document.all){
if(e.button==1){
return PTEventUtil.SRC_BUTTON_LEFT;
}else{
if(e.button==4){
return PTEventUtil.SRC_BUTTON_MIDDLE;
}else{
if(e.button==2){
return PTEventUtil.SRC_BUTTON_RIGHT;
}else{
return false;
}
}
}
}else{
if(e.button==0){
return PTEventUtil.SRC_BUTTON_LEFT;
}else{
if(e.button==1){
return PTEventUtil.SRC_BUTTON_MIDDLE;
}else{
if(e.button==2){
return PTEventUtil.SRC_BUTTON_RIGHT;
}else{
return false;
}
}
}
}
};
PTEventUtil.getMouseOverFromElement=function(e){
if(!e){
return false;
}
if(document.all){
return e.fromElement;
}else{
return e.relatedTarget;
}
};
PTEventUtil.getMouseOutFromElement=function(e){
if(!e){
return false;
}
if(document.all){
return e.fromElement;
}else{
return e.target;
}
};
PTEventUtil.getMouseOverToElement=function(e){
if(!e){
return false;
}
if(document.all){
return e.toElement;
}else{
return e.target;
}
};
PTEventUtil.getMouseOutToElement=function(e){
if(!e){
return false;
}
if(document.all){
return e.toElement;
}else{
return e.relatedTarget;
}
};
PTEventUtil.clickElement=function(elm){
if(elm.click){
elm.click();
}else{
if(elm.dispatchEvent){
var evt=document.createEvent("MouseEvents");
evt.initMouseEvent("click",true,true,window,1,0,0,0,0,false,false,false,false,0,null);
elm.dispatchEvent(evt);
}
}
};
PTEventUtil.getMouseX=function(e){
var posx=0;
if(!e){
var e=window.event;
}
if(e.pageX){
posx=e.pageX;
}else{
if(e.clientX){
posx=e.clientX;
posy=e.clientY;
if(PTBrowserInfo.IS_MSIE){
posx+=document.body.scrollLeft;
}
}
}
return posx;
};
PTEventUtil.getMouseY=function(e){
var posy=0;
if(!e){
var e=window.event;
}
if(e.pageY){
posy=e.pageY;
}else{
if(e.clientY){
posy=e.clientY;
if(PTBrowserInfo.IS_MSIE){
posy+=document.body.scrollTop;
}
}
}
return posy;
};
PTFormUtil=function(){
};
PTFormUtil.VERSION="214238";
PTFormUtil.getRadioValue=function(rads){
if(!rads){
return;
}
var val;
if(rads.length>1){
for(var i=0;i<rads.length;i++){
if(rads[i].checked){
val=rads[i].value;
break;
}
}
}else{
val=rads.value;
}
return val;
};
PTFormUtil.setRadioValue=function(rads,val){
if(!rads){
return false;
}
var _1d8=false;
if(rads.length>1){
for(var i=0;i<rads.length;i++){
if(rads[i].value==val){
_1d8=true;
break;
}
}
if(_1d8){
for(var i=0;i<rads.length;i++){
if(rads[i].value==val){
rads[i].checked=true;
}else{
rads[i].checked=false;
}
}
}
}else{
_1d8=(rads.checked=true);
}
return _1d8;
};
PTFormUtil.setSelectValue=function(sel,val){
var _1dc=false;
if(!sel){
return _1dc;
}
if(sel.options.length<1){
return _1dc;
}
for(var i=0;i<sel.options.length;i++){
var opt=sel.options[i];
if(opt.value&&opt.value==val){
sel.selectedIndex=i;
_1dc=true;
break;
}
}
return _1dc;
};
PTFormUtil.fillSelect=function(sel,_1e0){
if(!sel){
return;
}
if(!_1e0){
return;
}
if(!_1e0.length){
return;
}
var _1e1=sel.options.length;
var _1e2=_1e0.length;
for(var i=0;i<_1e2;i++){
if(!_1e0[i]){
continue;
}
var _1e4=_1e0[i];
var _1e5=_1e4.text;
var _1e6=_1e4.value;
var _1e7=_1e1+i;
sel.options[_1e7]=new Option(_1e5,_1e6);
}
};
PTFormUtil.clearSelect=function(sel){
if(!sel){
return;
}
var _1e9=sel.options.length;
if(_1e9==0){
return;
}
for(var i=(_1e9-1);i>=0;i--){
sel.options[i]=null;
}
};
PTFormUtil.addItemToSelect=function(sel,val,txt,idx){
if((!idx&&(idx!=0))||(idx==-1)){
idx=sel.options.length;
sel.options[idx]=new Option(txt,val);
}else{
var opts=sel.options;
var len=opts.length;
for(var i=len;i>idx;i--){
if(!opts[i]){
opts[i]=new Option(opts[i-1].text,opts[i-1].value);
}else{
opts[i].text=opts[i-1].text;
opts[i].value=opts[i-1].value;
}
}
opts[idx].text=txt;
opts[idx].value=val;
}
return idx;
};
PTFormUtil.selectMoveItemUp=function(sel){
idx=sel.selectedIndex;
if(idx==-1){
return;
}
if(idx<1){
return;
}
var _1f3=sel.options[idx-1].text;
var _1f4=sel.options[idx-1].value;
sel.options[idx-1].text=sel.options[idx].text;
sel.options[idx-1].value=sel.options[idx].value;
sel.options[idx].text=_1f3;
sel.options[idx].value=_1f4;
sel.selectedIndex=idx-1;
};
PTFormUtil.selectMoveItemDown=function(sel){
idx=sel.selectedIndex;
if(idx==-1){
return;
}
if(idx>=(sel.options.length-1)){
return;
}
var _1f6=sel.options[idx+1].text;
var _1f7=sel.options[idx+1].value;
sel.options[idx+1].text=sel.options[idx].text;
sel.options[idx+1].value=sel.options[idx].value;
sel.options[idx].text=_1f6;
sel.options[idx].value=_1f7;
sel.selectedIndex=idx+1;
};
PTFormUtil.focusAndSelectText=function(_1f8){
if(!_1f8||!_1f8.focus||!_1f8.select){
return;
}
_1f8.focus();
_1f8.select();
};
PTFormUtil.focusFormFieldByName=function(_1f9){
var _1fa=eval(_1f9);
if(_1fa&&_1fa.focus){
_1fa.focus();
}
};
PTFormUtil.hideAllSelects=function(elem){
if(!elem){
elem=window.document;
}
var _1fc=elem.getElementsByTagName("select");
var _1fd=new Array();
for(var s=0;s<_1fc.length;s++){
if(_1fc[s].style.visibility!="hidden"){
PTFormUtil.setSelectVisibility(_1fc[s],"hidden");
_1fd[_1fd.length]=_1fc[s];
}
}
return _1fd;
};
PTFormUtil.hideSelects=function(_1ff){
if(!_1ff){
return;
}
for(var s=0;s<_1ff.length;s++){
PTFormUtil.setSelectVisibility(_1ff[s],"hidden");
}
};
PTFormUtil.showAllSelects=function(elem){
if(!elem){
elem=window.document;
}
var _202=elem.getElementsByTagName("select");
var _203=new Array();
for(var s=0;s<_202.length;s++){
if(_202[s].style.visibility=="hidden"){
PTFormUtil.setSelectVisibility(_202[s],"visible");
_203[_203.length]=_202[s];
}
}
return _203;
};
PTFormUtil.showSelects=function(_205){
if(!_205){
return;
}
for(var s=0;s<_205.length;s++){
PTFormUtil.setSelectVisibility(_205[s],"visible");
}
};
PTFormUtil.disableAllSelects=function(elem){
if(!elem){
elem=window.document;
}
var _208=elem.getElementsByTagName("select");
if(!window._selectStateCache){
window._selectStateCache=new Object();
}
for(var s=0;s<_208.length;s++){
var sel=_208[s];
if(sel.id){
if(sel.disabled===true){
window._selectStateCache[sel.id]=true;
}else{
window._selectStateCache[sel.id]=false;
}
}
sel.disabled=true;
}
};
PTFormUtil.enableAllSelects=function(elem,_20c){
if(!elem){
elem=window.document;
}
var _20d=elem.getElementsByTagName("select");
for(var s=0;s<_20d.length;s++){
var sel=_20d[s];
if(_20c&&window._selectStateCache&&window._selectStateCache[sel.id]){
continue;
}
_20d[s].disabled=false;
}
};
PTFormUtil.setSelectVisibility=function(_210,vis){
if(!_210){
return false;
}
_210.style.visibility=vis;
};
PTHashtable=function(){
this._keys=new Array();
this._values=new Object();
this._enumKeyIndex=-1;
return this;
};
PTHashtable.VERSION="214238";
PTHashtable.prototype.className="PTHashtable";
PTHashtable.prototype.clear=function(){
this._keys=new Array();
this._values=new Object();
this._enumKeyIndex=-1;
};
PTHashtable.prototype.clone=function(){
var _212=new PTHashtable();
var _213=this._keys.length;
for(var i=0;i<_213;i++){
var key=this._keys[i];
_212._keys[i]=key;
_212._values[key]=this._values[key];
}
return _212;
};
PTHashtable.prototype.contains=function(obj){
return this.containsValue(obj);
};
PTHashtable.prototype.containsKey=function(key){
var _218=this._keys.length;
for(var i=0;i<_218;i++){
if(this._keys[i]==key){
return true;
}
}
return false;
};
PTHashtable.prototype.containsValue=function(obj){
var _21b=this._keys.length;
for(var i=0;i<_21b;i++){
var key=this._keys[i];
if(this._values[key]==obj){
return true;
}
}
return false;
};
PTHashtable.prototype.equals=function(obj){
if(!obj){
return false;
}
if(!obj.className){
return false;
}
if(obj.className!="PTHashtable"){
return false;
}
if(!obj._keys){
return false;
}
if(!PTArrayUtil.isArrayLike(obj._keys)){
return false;
}
if(obj._keys.length!=this._keys.length){
return false;
}
var _21f=this._keys.length;
for(var i=0;i<_21f;i++){
var key=this._keys[i];
if(key!=obj._keys[i]){
return false;
}
if(this._values[key]!=obj._values[key]){
return false;
}
}
return true;
};
PTHashtable.prototype.get=function(key){
return this._values[key];
};
PTHashtable.prototype.hasNext=function(){
var _223=this._enumKeyIndex+1;
return (this._keys.length>_223)?true:false;
};
PTHashtable.prototype.isEmpty=function(){
return (this.size()==0)?true:false;
};
PTHashtable.prototype.keys=function(){
var arr=new Array();
var _225=this._keys.length;
for(var i=0;i<_225;i++){
arr[i]=this._keys[i];
}
return arr;
};
PTHashtable.prototype.next=function(){
this._enumKeyIndex++;
if(!this.hasNext()){
return;
}else{
return this._values[this._keys[this._enumKeyIndex]];
}
};
PTHashtable.prototype.put=function(key,_228){
var _229=this._values[key];
if(!this.containsKey(key)){
this._keys.push(key);
}
this._values[key]=_228;
return _229;
};
PTHashtable.prototype.remove=function(key){
var _22b=this._values[key];
var _22c=-1;
var _22d=this._keys.length;
for(var i=0;i<_22d;i++){
if(this._keys[i]==key){
_22c=i;
break;
}
}
if(_22c==-1){
return;
}
this._keys.splice(_22c,1);
return _22b;
};
PTHashtable.prototype.resetIterator=function(){
this._enumKeyIndex=-1;
};
PTHashtable.prototype.size=function(){
return this._keys.length;
};
PTHashtable.prototype.toArray=function(){
var arr=new Array();
var _230=this._keys.length;
for(var i=0;i<_230;i++){
var key=this._keys[i];
var _233=this._values[key];
var obj=new Object();
obj.key=key;
obj.value=_233;
arr[i]=obj;
}
return arr;
};
PTHashtable.prototype.toString=function(){
var sb=new PTStringBuffer();
sb.append("{ ");
var _236=this._keys.length;
for(var i=0;i<_236;i++){
var key=this._keys[i];
var _239=this._values[key];
sb.append("'"+PTStringUtil.escapeJS(key)+"'");
sb.append(" : ");
sb.append("'"+PTStringUtil.escapeJS(_239)+"'");
if(i!=(_236-1)){
sb.append(", ");
}
}
sb.append(" }");
return sb.toString();
};
PTHashtable.prototype.values=function(){
var arr=new Array();
var _23b=this._keys.length;
for(var i=0;i<_23b;i++){
var key=this._keys[i];
arr[i]=this._values[key];
}
return arr;
};
PTNumberFormatter=function(num){
this.num=(num)?num:0;
this.isGrouping=true;
this.isCurrency=false;
this.currencySymbol="";
this.currencySymbolBefore=true;
this.groupingSeparator=",";
this.decimalSeparator=".";
this.decimalPlaces=-1;
this.negativePrefix="-";
this.negativeSuffix="";
};
PTNumberFormatter.VERSION="214238";
PTNumberFormatter.prototype.INVALID="INVALID";
PTNumberFormatter.prototype.formatValue=function(num){
if(num!=null){
this.num=num;
}
if((this.num==null)||(this.num=="")||(this.num.toString().length==0)){
return "";
}
if(this.isCurrency==true){
var _240=new RegExp(this.currencySymbol,"gi");
this.num=this.num.toString().replace(_240,"");
var _241=new RegExp("\\"+this.currencySymbol,"gi");
this.num=this.num.toString().replace(_241,"");
}
var gsRe=new RegExp("\\"+this.groupingSeparator,"g");
this.num=this.num.toString().replace(gsRe,"");
if((this.num.toString().indexOf("(")>-1)&&(this.num.toString().indexOf(")")>-1)){
if(this.num.toString().indexOf(")")!=this.num.toString().lastIndexOf(")")){
return this.invalidNumber();
}
if(this.num.toString().indexOf("(")!=this.num.toString().lastIndexOf("(")){
return this.invalidNumber();
}
if(this.num.toString().indexOf(")")<this.num.toString().lastIndexOf("(")){
return this.invalidNumber();
}
var _243=new RegExp("\\(","g");
this.num=this.num.toString().replace(_243,"");
var _244=new RegExp("\\)","g");
this.num=this.num.toString().replace(_244,"");
if(this.num.toString().indexOf("-")==-1){
this.num="-"+this.num.toString();
}
}
if(this.num.toString().indexOf("-")!=this.num.toString().lastIndexOf("-")){
return this.invalidNumber();
}
var _245=new RegExp("\\d\\D*-\\D*\\d","g");
if(_245.test(this.num.toString())){
return this.invalidNumber();
}
if(this.num.toString().indexOf("-")!=-1){
var msRe=new RegExp("-","g");
this.num=this.num.toString().replace(msRe,"");
this.num="-"+this.num.toString();
}
dsRe=new RegExp("\\"+this.decimalSeparator,"g");
this.num=this.num.toString().replace(dsRe,".");
if(isNaN(this.num)){
return this.invalidNumber();
}
var pos;
var nNum=this.num;
var nStr;
var _24a=this.num;
if(_24a.toString().indexOf("-")==0){
_24a=_24a.substring(1);
}
nNum=this.getRounded(nNum);
nStr=this.preserveZeros(_24a);
dotRe=new RegExp("\\.","g");
nStr=nStr.replace(dotRe,this.decimalSeparator);
if(this.isGrouping){
pos=nStr.indexOf(this.decimalSeparator);
if(pos==-1){
pos=nStr.length;
}
while(pos>0){
pos-=3;
if(pos<=0){
break;
}
nStr=nStr.substring(0,pos)+this.groupingSeparator+nStr.substring(pos,nStr.length);
}
}
if(this.isCurrency){
if(this.currencySymbolBefore){
nStr=this.currencySymbol+nStr;
}else{
nStr=nStr+this.currencySymbol;
}
}
nStr=(nNum<0)?this.negativePrefix+nStr+this.negativeSuffix:nStr;
return (nStr);
};
PTNumberFormatter.prototype.setNumber=function(num){
this.num=num;
};
PTNumberFormatter.prototype.toUnformatted=function(){
return (this.num);
};
PTNumberFormatter.prototype.setGrouping=function(_24c){
this.isGrouping=_24c;
};
PTNumberFormatter.prototype.setGroupingSeparator=function(_24d){
this.groupingSeparator=_24d;
};
PTNumberFormatter.prototype.setDecimalSeparator=function(_24e){
this.decimalSeparator=_24e;
};
PTNumberFormatter.prototype.setCurrency=function(_24f){
this.isCurrency=_24f;
};
PTNumberFormatter.prototype.setCurrencySymbol=function(_250){
this.currencySymbol=_250;
};
PTNumberFormatter.prototype.setCurrencySymbolBefore=function(_251){
this.currencySymbolBefore=_251;
};
PTNumberFormatter.prototype.setDecimalPlaces=function(_252){
this.decimalPlaces=_252;
};
PTNumberFormatter.prototype.setNegativePrefix=function(_253){
this.negativePrefix=_253;
};
PTNumberFormatter.prototype.setNegativeSuffix=function(_254){
this.negativeSuffix=_254;
};
PTNumberFormatter.prototype.formatField=function(_255){
var _256=this.formatValue(_255.value);
if(_256==this.INVALID){
_255.value="";
_255.focus();
}else{
_255.value=_256;
}
};
PTNumberFormatter.prototype.validateValue=function(_257){
var _258=this.formatValue(_257);
if(_258==this.INVALID){
return false;
}else{
return true;
}
};
PTNumberFormatter.prototype.getRounded=function(val){
if(this.decimalPlaces<0){
return val;
}
var _25a;
var i;
_25a=1;
for(i=0;i<this.decimalPlaces;i++){
_25a*=10;
}
val*=_25a;
val=Math.round(val);
val/=_25a;
return (val);
};
PTNumberFormatter.prototype.preserveZeros=function(val){
var i;
val=val+"";
if(this.decimalPlaces<0){
return val;
}
var _25e=val.indexOf(".");
if(_25e==-1&&this.decimalPlaces>0){
val+=this.decimalSeparator;
for(i=0;i<this.decimalPlaces;i++){
val+="0";
}
}else{
var _25f=(val.length-1)-_25e;
var _260=this.decimalPlaces-_25f;
for(i=0;i<_260;i++){
val+="0";
}
}
return val;
};
PTNumberFormatter.prototype.invalidNumber=function(){
alert(PTS_STR["PTU-Number-AlertInvNumber"]);
return this.INVALID;
};
PTNumberFormatter.prototype.toFormatted=function(_261){
return this.formatValue(_261);
};
PTNumberUtil=function(){
};
PTNumberUtil.VERSION="214238";
PTNumberUtil.isInteger=function(_262){
_262=PTNumberUtil.trimLeadingZeros(_262);
if(_262.length==0){
return true;
}
var _263=new String(_262);
var _264=new String(parseInt(new String(_262)));
return (_263.valueOf()==_264.valueOf());
};
PTNumberUtil.isPositiveInteger=function(_265){
if(!PTNumberUtil.isInteger(_265)){
return false;
}
return (parseInt(_265)>0);
};
PTNumberUtil.trimLeadingZeros=function(_266){
_266=new String(_266);
while(_266.charAt(0)=="0"){
_266=_266.substr(1);
}
return _266;
};
PTStringBuffer=function(str){
this.i=0;
this.s=new Array();
if(str&&str.length&&(str.length>0)){
this.s[this.i++]=str;
}
return this;
};
PTStringBuffer.VERSION="214238";
PTStringBuffer.prototype.append=function(str){
if(this.i>=1000&&this.i%1000==0){
var tmp=this.s.join("");
this.s=new Array();
this.s[0]=tmp;
this.i=1;
}
this.s[this.i++]=str;
};
PTStringBuffer.prototype.toString=function(){
return this.s.join("");
};
PTStringUtil=function(){
};
PTStringUtil.VERSION="214238";
PTStringUtil.isString=function(obj){
if(obj==""){
return true;
}else{
if(typeof obj=="string"){
return true;
}else{
if(typeof obj=="object"){
if(obj.fixed&&obj.link&&obj.blink&&obj.toUpperCase){
return true;
}else{
return false;
}
}else{
return false;
}
}
}
};
PTStringUtil.isValidHTTPString=function(str){
var _26c=str.substring(0,7);
var _26d=str.substring(0,8);
if((_26c!="http://")&&(_26d!="https://")){
return false;
}
if(str.length<8){
return false;
}
if(PTStringUtil.containsWhitespace(str)){
return false;
}
return true;
};
PTStringUtil.isValidUNCString=function(str,_26f){
if(!str){
return false;
}
if(_26f&&(str=="")){
return true;
}
if(str==""){
return false;
}
var _270=str.substring(0,2);
if(_270!="\\\\"){
return false;
}
if(str.length<3){
return false;
}
return true;
};
PTStringUtil.containsAngleBrackets=function(str){
var _272=/[<>]/;
return (_272.test(str));
};
PTStringUtil.containsWhitespace=function(str){
var _274=PTStringUtil.whitespaceChars;
str=new String(str);
for(var i=0;i<str.length;i++){
var _276=str.charAt(i);
for(var j=0;j<_274.length;j++){
var _278=_274[j];
if(_276==_278){
return true;
}
}
}
return false;
};
PTStringUtil.isAllWhitespace=function(str){
var _27a=PTStringUtil.whitespaceChars;
str=new String(str);
STRING:
for(var i=0;i<str.length;i++){
var _27c=str.charAt(i);
for(var j=0;j<_27a.length;j++){
var _27e=_27a[j];
if(_27c==_27e){
continue STRING;
}
}
return false;
}
return true;
};
PTStringUtil.UCFirst=function(str){
var _280=(new String(str)).substring(0,1);
if(!_280){
return str;
}else{
var _281=(new String(str)).substring(1);
if(!_281){
_281="";
}
var _282=_280.toUpperCase()+_281;
return _282;
}
};
PTStringUtil.stripChars=function(str,_284){
if(!_284||(_284.length<1)){
return str;
}
str=new String(str);
var _285=new String();
STRING:
for(var i=0;i<str.length;i++){
var _287=str.charAt(i);
for(var j=0;j<_284.length;j++){
var _289=_284[j];
if(_287==_289){
continue STRING;
}
}
_285+=_287;
}
return _285;
};
PTStringUtil.whitespaceChars=new Array(" ","\n","\r","\t","\xa0");
PTStringUtil.trimWhitespace=function(str,_28b,_28c){
if(!str){
return str;
}
str=new String(str);
var _28d=PTStringUtil.whitespaceChars;
if(_28b){
var _28e=true;
while(_28e){
var _28f=false;
for(var w=0;w<_28d.length;w++){
var c=_28d[w];
if(c==str.charAt(0)){
_28f=true;
break;
}
}
if(_28f){
str=str.substr(1);
}else{
_28e=false;
}
}
}
if(_28c){
var _28e=true;
while(_28e){
var _28f=false;
for(var w=0;w<_28d.length;w++){
var c=_28d[w];
if(c==str.charAt(str.length-1)){
_28f=true;
break;
}
}
if(_28f){
str=str.substring(0,(str.length-1));
}else{
_28e=false;
}
}
}
return str;
};
PTStringUtil.escapeHTML=function(str,_293,_294){
str=new String(str);
if(document.getElementById){
var _295=new RegExp("\"","g");
str=str.replace(_295,"&quot;");
var _295=new RegExp("<","g");
str=str.replace(_295,"&lt;");
var _295=new RegExp(">","g");
str=str.replace(_295,"&gt;");
if(_293){
var _295=new RegExp("\n","g");
str=str.replace(_295,"<br>");
}
if(_294){
var _295=new RegExp("\\s","g");
str=str.replace(_295,"&nbsp;");
}
var _296=str;
}else{
var _297={"\"":"&quot;","<":"&lt;",">":"&gt;"};
var _296=new String();
STRING:
for(var i=0;i<str.length;i++){
var _299=str.charAt(i);
for(var j in _297){
var esc=_297[j];
if(_299==j){
_296+=esc;
continue STRING;
}
}
_296+=_299;
}
}
return _296;
};
PTStringUtil.unescapeHTML=function(str){
str=new String(str);
var _29d=new RegExp("&quot;","gi");
str=str.replace(_29d,"\"");
var _29e=new RegExp("&lt;","gi");
str=str.replace(_29e,"<");
var _29e=new RegExp("&gt;","gi");
str=str.replace(_29e,">");
return str;
};
PTStringUtil.removeHTML=function(str){
str=new String(str);
str=str.replace(new RegExp("&nbsp;","g")," ");
while((str.indexOf("<")>-1)&&(str.indexOf(">")>str.indexOf("<"))){
var _2a0=str.indexOf("<");
var end=str.indexOf(">");
str=str.substr(0,_2a0)+str.substring(end+1,str.length);
}
return str;
};
PTStringUtil.getInnerText=function(elem){
var str;
if(PTBrowserInfo.IS_MSIE){
str=elem.innerText;
}else{
str=PTStringUtil.removeHTML(elem.innerHTML);
}
return str;
};
PTStringUtil.escapeJS=function(str){
str=new String(str);
if(document.getElementById){
var _2a5=new RegExp("\\\\","g");
str=str.replace(_2a5,"\\\\");
var _2a5=new RegExp("\n","g");
str=str.replace(_2a5,"\\n");
var _2a5=new RegExp("'","g");
str=str.replace(_2a5,"\\'");
var _2a6=str;
}else{
var _2a7={"\n":"\\n","'":"\\'","\\":"\\\\"};
var _2a6=new String("");
STRING:
for(var i=0;i<str.length;i++){
var _2a9=str.charAt(i);
for(var j in _2a7){
var esc=_2a7[j];
if(_2a9==j){
_2a6+=esc;
continue STRING;
}
}
_2a6+=_2a9;
}
}
return _2a6;
};
PTStringUtil.encodeURL=function(str,_2ad){
if(str==null){
return null;
}
if(PTBrowserInfo.IS_NETSCAPE_DOM||PTBrowserInfo.IS_SAFARI||(PTBrowserInfo.IS_MSIE&&PTBrowserInfo.MSIE_VERSION>=5.5)){
var _2ae=encodeURIComponent(str);
if(_2ad){
_2ae=_2ae.replace(/\'/g,"%27");
}
return _2ae;
}
var _2af=new String(str);
var _2ae=new PTStringBuffer();
for(var i=0;i<_2af.length;i++){
var _2b1=_2af.charAt(i);
var _2b2=_2b1.charCodeAt(0);
if(((_2b2>47)&&(_2b2<58))||((_2b2>64)&&(_2b2<91))||((_2b2>96)&&(_2b2<123))){
_2ae.append(String.fromCharCode(_2b2));
}else{
if((_2b2<=47)||((_2b2>=58)&&(_2b2<=64))||((_2b2>=91)&&(_2b2<=96))||((_2b2>=123)&&(_2b2<=127))){
var hex=_2b2.toString(16);
var len=hex.length;
switch(len){
case 0:
hex="00";
break;
case 1:
hex="0"+hex;
case 2:
break;
defalt:
hex=hex.substring((len-2),len);
break;
}
_2ae.append("%"+hex);
}else{
if((_2b2>127)&&(_2b2<2048)){
_2ae.append("%"+((_2b2>>6)|192).toString(16).toUpperCase());
_2ae.append("%"+((_2b2&63)|128).toString(16).toUpperCase());
}else{
var c1=(_2b2>>12)|224;
var c2=((_2b2>>6)&63)|128;
var c3=(_2b2&63)|128;
_2ae.append("%"+((_2b2>>12)|224).toString(16).toUpperCase());
_2ae.append("%"+(((_2b2>>6)&63)|128).toString(16).toUpperCase());
_2ae.append("%"+((_2b2&63)|128).toString(16).toUpperCase());
}
}
}
}
var _2b8=_2ae.toString();
if(_2ad){
_2b8=_2b8.replace(/\'/g,"%27");
}
return _2b8;
};
PTStringUtil.substituteChars=function(str,hash){
str=new String(str);
var _2bb=new String();
STRING:
for(var i=0;i<str.length;i++){
var _2bd=str.charAt(i);
for(var h in hash){
var subs=hash[h];
if(_2bd==h){
_2bb+=subs;
continue STRING;
}
}
_2bb+=_2bd;
}
return _2bb;
};
PTStringUtil.lineBreakToBR=function(str){
str=new String(str);
var br=/\n/g;
str=str.replace(br,"<br>");
return str;
};
PTWindowUtil=function(){
return this;
};
PTWindowUtil.VERSION="214238";
PTWindowUtil.defaultWidth=650;
PTWindowUtil.defaultHeight=450;
PTWindowUtil.helpWindowName="PTRoboHelp";
PTWindowUtil.openWindow=function(URL,name,_2c4,_2c5,_2c6){
var _2c7=(document.layers);
if(!name){
name="PTWindow"+(new Date()).getTime();
}
var _2c8=(_2c5)?_2c5:PTWindowUtil.defaultWidth;
var _2c9=(_2c4)?_2c4:PTWindowUtil.defaultHeight;
var _2ca=(_2c7)?screen.width:screen.availWidth;
var _2cb=(_2c7)?screen.height:screen.availHeight;
var _2cc=parseInt(_2ca/2)-parseInt(_2c8/2);
var _2cd=parseInt(_2cb/2)-parseInt(_2c9/2);
var _2ce=(_2c7)?"screenX="+_2cc:"left="+_2cc;
var _2cf=(_2c7)?"screenY="+_2cd:"top="+_2cd;
var _2d0="width="+_2c8+",height="+_2c9+","+_2ce+","+_2cf+",resizable=1";
if(PTNumberUtil.isInteger(_2c6)){
if(_2c6==1){
_2d0+=",scrollbars=1,status=0,toolbar=0,menubar=0,location=0";
}
}else{
if(_2c6==true){
_2d0+=",scrollbars=1,status=1,toolbar=1,menubar=1,location=1";
}else{
_2d0+=",scrollbars=0,status=0,toolbar=0,menubar=0,location=0";
}
}
var _2d1=window.open(URL,name,_2d0);
_2d1.focus();
return _2d1;
};
PTWindowUtil.openHelpWindow=function(URL,_2d3,_2d4,_2d5){
return PTWindowUtil.openWindow(URL,PTWindowUtil.helpWindowName,_2d3,_2d4,_2d5);
};
function OpenSizedWindow(URL,name,_2d8,_2d9,_2da){
return PTWindowUtil.openWindow(URL,name,_2d8,_2d9,_2da);
}

