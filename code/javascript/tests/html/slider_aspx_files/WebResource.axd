if(!window.oc.common){
window.oc.common={};
}
oc.common.hideSelects=function(_1,_2){
if(!_1){
_1=window.document;
}
var _3=_1.getElementsByTagName("select");
var _4=new Array();
for(var s=0;s<_3.length;s++){
var _6=false;
if(_2){
for(var e=0;e<_2.length;e++){
if(_3[s]==_2[e]){
_6=true;
break;
}
}
}
if((_3[s].style.visibility!="hidden")&&!_6){
_3[s].style.visibility="hidden";
PTFormUtil.setSelectVisibility(_3[s],"hidden");
_4[_4.length]=_3[s];
}
}
return _4;
};
oc.common.showSelects=function(_8){
if(!_8){
return;
}
for(var s=0;s<_8.length;s++){
_8[s].style.visibility="visible";
}
};
oc.common.getElementLeft=function(_a){
if(!_a){
return false;
}
var x=_a.offsetLeft;
var _c=_a.offsetParent;
while(_c!=null){
if(document.all){
if((_c.tagName!="TABLE")&&(_c.tagName!="BODY")){
x+=_c.clientLeft;
}
}else{
if(_c.tagName=="TABLE"){
var _d=parseInt(_c.border);
if(isNaN(_d)){
var _e=_c.getAttribute("frame");
if(_e!=null){
x+=1;
}
}else{
if(_d>0){
x+=_d;
}
}
}
}
x+=_c.offsetLeft;
_c=_c.offsetParent;
}
return x;
};
oc.common.getElementTop=function(_f){
var y=0;
while(_f!=null){
if(document.all){
if((_f.tagName!="TABLE")&&(_f.tagName!="BODY")){
y+=_f.clientTop;
}
}else{
if(_f.tagName=="TABLE"){
var _11=parseInt(_f.border);
if(isNaN(_11)){
var _12=_f.getAttribute("frame");
if(_12!=null){
y+=1;
}
}else{
if(_11>0){
y+=_11;
}
}
}
}
y+=_f.offsetTop;
if(_f.offsetParent&&_f.offsetParent.offsetHeight&&_f.offsetParent.offsetHeight<_f.offsetHeight){
_f=_f.offsetParent.offsetParent;
}else{
_f=_f.offsetParent;
}
}
return y;
};
oc.common.addEventPositioning=function(evt){
if(document.all){
evt.documentX=evt.offsetX+oc.common.getElementLeft(evt.srcElement);
evt.documentY=evt.offsetY+oc.common.getElementTop(evt.srcElement);
}else{
evt.documentX=evt.clientX+window.scrollX;
evt.documentY=evt.clientY+window.scrollY;
}
};
oc.common.getWindowWidth=function(){
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
oc.common.hasVerticalScrollbars=function(){
document.body.scrollHeight>oc.common.getWindowHeight();
};
oc.common.hasHorizontalScrollbars=function(){
documnet.body.scrollWidth>oc.common.getWindowWidth();
};
oc.common.getWindowHeight=function(){
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
oc.common.getScrollWidth=function(){
var _14=window.scrollX?window.scrollX:0;
var _15=window.pageXOffset?window.pageXOffset:0;
var _16=document.documentElement?document.documentElement.scrollLeft:0;
var _17=document.body?document.body.scrollLeft:0;
var rtn=_14;
if(_15>rtn){
rtn=_15;
}
if(_16>rtn){
rtn=_16;
}
if(_17>rtn){
rtn=_17;
}
return rtn;
};
oc.common.getScrollHeight=function(){
var _19=window.scrollY?window.scrollY:0;
var _1a=window.pageYOffset?window.pageYOffset:0;
var _1b=document.documentElement?document.documentElement.scrollTop:0;
var _1c=document.body?document.body.scrollTop:0;
var rtn=_19;
if(_1a>rtn){
rtn=_1a;
}
if(_1b>rtn){
rtn=_1b;
}
if(_1c>rtn){
rtn=_1c;
}
return rtn;
};

