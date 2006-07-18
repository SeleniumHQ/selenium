window.oc={};
oc.VERSION="1.0.227288";
oc.IncludeRegistry={};
oc.PopupRegistry={};
oc.Page={};
oc.require=function(_1,_2,_3){
var _4=oc.IncludeRegistry[_1];
var _5=typeof (_4);
var _6=false;
var _6=(_5=="unknown")||(_5=="undefined");
if(!_6){
var _7=oc.getBranch(_4);
var _8=oc.getBuild(_4);
var _9=oc.getBranch(_3);
var _a=oc.getBuild(_3);
if(_9>_7){
_6=true;
}else{
if((_9==_7)&&(_a>_8)){
_6=true;
}
}
}
if(_6){
document.write("\n<scr"+"ipt type=\"text/javascript\" src=\""+_2+"\"></scr"+"ipt>");
oc.IncludeRegistry[_1]=_3;
}
};
oc.ajaxRequire=function(_b,_c,_d){
var _e=oc.IncludeRegistry[_b];
var _f=typeof (_e);
var _10=false;
var _10=(_f=="unknown")||(_f=="undefined");
if(!_10){
var _11=oc.getBranch(_e);
var _12=oc.getBuild(_e);
var _13=oc.getBranch(_d);
var _14=oc.getBuild(_d);
if(_13>_11){
_10=true;
}else{
if((_13==_11)&&(_14>_12)){
_10=true;
}
}
}
if(_10){
var _15=new PTHTTPGETRequest(_c,false,PTHTTPTransport.CCMODE_SYNC);
var _16=_15.invoke();
if(_16.status==200){
eval(_16.responseText);
}
oc.IncludeRegistry[_b]=_d;
}
};
oc.cssRequire=function(url,_18){
var _19=document.createElement("link");
_19.type="text/css";
_19.rel="stylesheet";
_19.lang=_18;
_19.href=url;
var _1a=document.getElementsByTagName("head");
if(_1a.length>0){
_1a[0].appendChild(_19);
}else{
document.body.appendChild(_19);
}
};
oc.getBranch=function(_1b){
var _1c=_1b.indexOf(".");
var _1d=_1b.lastIndexOf(".");
if(_1d==-1){
return 1;
}
while(_1c!=_1d){
_1b=_1b.substring(0,_1d);
_1c=_1b.indexOf(".");
_1d=_1b.lastIndexOf(".");
}
return new Number(_1b);
};
oc.getBuild=function(_1e){
var idx=_1e.lastIndexOf(".");
if(idx==-1){
return new Number(_1e);
}
var _20=_1e.substring(idx+1);
return new Number(_20);
};
oc.getForm=function(_21){
while(_21&&(_21.nodeType==1)&&(_21.tagName.toLowerCase()!="form")&&(_21.tagName.toLowerCase()!="body")){
_21=_21.parentNode;
}
if(_21&&(_21.nodeType==1)&&(_21.tagName.toLowerCase()=="form")){
return _21;
}
return false;
};
oc.hidePopups=function(_22){
for(var n in oc.PopupRegistry){
var obj=oc.PopupRegistry[n];
if(obj==_22){
continue;
}
if(obj&&obj.close){
obj.close();
}
}
};
oc.isString=function(obj){
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
}
}
}
return false;
};

