if(!window.oc.ajax){
window.oc.ajax={};
}
oc.ajax.REQUEST_TYPE_HEADER="ALUI_REQUEST_TYPE";
oc.ajax.AJAX_CONTROLS_HEADER="ALUI_AJAX_CONTROLS";
oc.ajax.REFRESH_CONTROLS_HEADER="ALUI_REFRESHABLE_CONTROLS";
oc.ajax.PAGE_EVENTS_HEADER="ALUI_PAGE_EVENTS";
oc.ajax.PROCESSING_INSTRUCTIONS_HEADER="ALUI_PROCESSING_INSTRUCTIONS";
oc.ajax.handleResponse=function(_1){
var _2=false;
if(oc.isString(_1)){
_2=_1;
}else{
if(_1.responseText){
_2=_1.responseText;
}
}
if(!_2){
return;
}
if(_2.indexOf("<!--starthtml-->")!=-1){
var _3=0;
while((_3=_2.indexOf("<!--startrefresh-->",_3))!=-1){
_3+=19;
var _4=_2.indexOf("<!--target=",_3);
if(_4==-1){
break;
}
_3=_4+11;
var _5=_2.indexOf("-->",_3);
if(_5==-1){
break;
}
var _6=_2.substring(_3,_5);
_3=_5+3;
var _7=_2.indexOf("<!--endrefresh-->",_3);
if(_7==-1){
break;
}
var _8=_2.substring(_3,_7);
var _9=document.getElementById(_6);
if(_9){
var _a=_9.style.cursor;
oc.ajax.refreshTargetElement(_9,_8,_a);
}
}
_3=_2.indexOf("<!--startxml-->",_3);
_3+=15;
var _b=_2.indexOf("</body>",_3);
if(_b==-1){
_b=_2.length;
}
_2=_2.substring(_3,_b);
}
var _c=PTXMLDocumentBuilder.createFromString(_2);
if(!_c){
return;
}
var _d=_c.getDocumentElement();
if(!_d||!_d.hasChildNodes()){
return;
}
var _e=false;
for(var i=0;i<_d.childNodes.length;i++){
var _10=_d.childNodes.item(i);
if(_10.nodeType!=1){
continue;
}
var _11=_10.nodeName;
if(!_11&&(PTXMLDocumentBuilder.parserType!=PTXMLDocumentBuilder.PARSER_TYPE_MSXML)){
_11=_10.name;
}
if(_11=="refresh"){
var _8=PTXMLDocument.getNodeValue(_10);
var _12=PTXMLDocument.getAttributeValue(_10,"target");
if(_12){
var _9=document.getElementById(_12);
if(_9){
var _a=_9.style.cursor;
oc.ajax.refreshTargetElement(_9,_8,_a);
}else{
eval(_12+"(htmlUpdate)");
}
}
}else{
if((_11=="javascript")||(_11=="portletRefresh")){
var js=PTXMLDocument.getNodeValue(_10);
if(js){
if(PTBrowserInfo.IS_MSIE){
window.execScript(js);
}else{
window.eval(js);
}
}
}else{
if(_11=="alert"){
var msg=PTXMLDocument.getNodeValue(_10);
if(msg){
if(PTBrowserInfo.IS_MSIE){
window.execScript(msg);
}else{
window.eval(msg);
}
}
}else{
if(_11=="postback"){
var _12=PTXMLDocument.getAttributeValue(_10,"form");
var _15=document.getElementById(_12);
if(_15&&_15.submit){
_15.submit();
}
}else{
if(_11=="navigate"){
var url=PTXMLDocument.getAttributeValue(_10,"url");
if(url){
document.location=url;
}
}else{
if(_11=="event"){
if(document.PCC){
var _17=PTXMLDocument.getAttributeValue(_10,"name");
var ns=PTXMLDocument.getAttributeValue(_10,"namespace");
var _19=PTXMLDocument.getAttributeValue(_10,"type");
var _1a=null;
var _1b=_10.childNodes;
if(_1b&&(_1b.length>0)){
_1a=oc.ajax.parseEventObject(_10,_19);
}
document.PCC.RaiseEvent(ns,_17,_1a);
}
}else{
if(_11=="forms"){
_e=PTXMLDocument.getAttributeValue(_10,"names");
}else{
if((_11=="state")&&_e){
var nm=PTXMLDocument.getAttributeValue(_10,"name");
if(nm){
var _1d=document.getElementsByName(nm);
for(var j=0;j<_1d.length;j++){
var _15=getForm(_1d[j]);
if(_15&&(_e.indexOf(_15.name)>=0)){
var val=PTXMLDocument.getNodeValue(_10);
_1d[j].value=val;
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
};
oc.ajax.parseEventObject=function(_20,_21){
var _22=_20.childNodes;
var obj=((_21=="hash")?{}:(_21=="array")?[]:PTXMLDocument.getNodeValue(_22.item(0)));
for(var i=0;i<_22.length;i++){
var _25=_22.item(i);
if(_21=="hash"){
var _26=_25.childNodes;
var key=false;
var val=false;
for(var j=0;j<_26.length;j++){
var _2a=_26.item(j);
if(_2a.nodeName=="key"){
key=PTXMLDocument.getNodeValue(_2a);
}else{
if((_2a.nodeName=="value")&&key){
obj[key]=val;
key=false;
val=false;
}
}
}
}else{
if(_21=="array"){
var val=PTXMLDocument.getNodeValue(_25.childNodes.item(0));
obj[obj.length]=val;
}
}
}
return obj;
};
oc.ajax.refreshTargetElement=function(_2b,_2c,_2d){
_2b.innerHTML="";
if(PTBrowserInfo.IS_SAFARI){
_2c=_2c.replace(new RegExp("(<style)","gi"),"<!-- $1");
_2c=_2c.replace(new RegExp("(</style>)","gi"),"$1 -->");
_2c=_2c.replace(new RegExp("(<link.*?>)","gi"),"<!-- $1 -->");
}
_2b.innerHTML="<input type=\"hidden\"/>"+_2c;
if(!_2d){
_2d="auto";
}
_2b.style.cursor=_2d;
var _2e=_2b.getElementsByTagName("SCRIPT");
if(_2e&&_2e.length>0){
try{
PTHTTPTransport._jsToEval="";
for(var i=0;i<_2e.length;i++){
var _30=_2e[i];
if(_30.defer&&PTBrowserInfo.IS_MSIE&&PTBrowserInfo.MSIE_VERSION>=5.5){
continue;
}
if(_30.src){
if(PTHTTPTransport.transportType!=PTHTTPTransport.TRANSPORT_TYPE_IFRAME){
var _31=new PTHTTPGETRequest(_30.src,false,PTHTTPTransport.CCMODE_SYNC);
var _32=_31.invoke();
if(_32.status==200){
PTHTTPTransport._jsToEval+=_32.responseText+"\n";
}
}
}else{
if(_30.innerHTML){
var _33=_30.innerHTML.split("\n");
for(var j=0;j<_33.length;j++){
if(_33[j].indexOf("document.write")!=-1){
_33[j]="";
}
}
var _35=_33.join("\n")+"\n";
if(_35.search(PTHTTPTransport._commentsStartRegExp)!=-1){
_35=_35.replace(PTHTTPTransport._commentsStartRegExp,"");
}
if(_35.search(PTHTTPTransport._commentsEndRegExp)!=-1){
_35=_35.replace(PTHTTPTransport._commentsEndRegExp,"");
}
if(_35.search(PTHTTPTransport._cdataStartRegExp)!=-1){
_35=_35.replace(PTHTTPTransport._cdataStartRegExp,"");
}
if(_35.search(PTHTTPTransport._cdataEndRegExp)!=-1){
_35=_35.replace(PTHTTPTransport._cdataEndRegExp,"");
}
PTHTTPTransport._jsToEval+=_35;
}
}
}
if(PTBrowserInfo.IS_MSIE){
window.setTimeout("window.execScript(PTHTTPTransport._jsToEval)",10);
}else{
if(PTBrowserInfo.IS_SAFARI){
window.setTimeout("window.eval(PTHTTPTransport._jsToEval)",10);
}else{
window.eval(PTHTTPTransport._jsToEval);
}
}
}
catch(e){
alert("oc.ajax.refreshTargetElement: Error processing response script:\n\n"+e.message);
}
}
};
if(!window.oc.ajax.jsf){
window.oc.ajax.jsf={};
}
oc.ajax.jsf.doCallback=function(_36,_37,_38,_39,_3a,_3b,_3c,_3d,_3e){
if(!_36){
return false;
}
var _3f=false;
if(_36.tagName){
_3f=oc.getForm(_36);
}else{
if(oc.isString(_36)){
_3f=oc.getForm(document.getElementById(_36));
}
}
if(!_3f){
return false;
}
var req=new PTHTTPPOSTRequest(_3f.action,_3f,oc.ajax.handleResponse);
req.requestHeaders[oc.ajax.REQUEST_TYPE_HEADER]="AJAX_CALLBACK";
if(_37){
req.requestHeaders[oc.ajax.AJAX_CONTROLS_HEADER]=_37;
}
if(_38){
req.requestHeaders[oc.ajax.REFRESH_CONTROLS_HEADER]=_38;
}
if(_39){
req.requestHeaders[oc.ajax.EVENTS_HEADER]=_39;
}
if(_3e){
req.requestHeaders[oc.ajax.PROCESSING_INSTRUCTIONS_HEADER]=_3e;
}
if(_3b){
if(oc.isString(_3b)){
var _41=_3b.split("&");
for(var i=0;i<_41.length;i++){
var _43=_41[i].split("=");
if(_43.length==1){
_43[1]="true";
}
req.requestHeaders[_43[0]]=_43[1];
}
}else{
for(header in _3b){
req.requestHeaders[header]=_3b[header];
}
}
}
if(_3a){
var str="";
if(oc.isString(_3a)){
str=_3a;
}else{
for(param in _3a){
str+="&"+encodeURIComponent(param)+"="+encodeURIComponent(_3a[param]);
}
}
if(_3a.indexOf("&")!=0){
_3a="&"+_3a;
}
if(!req.formDataSet){
req.formDataSet=str.subsring(1);
}else{
if(req.formDataSet.substring(req.formDataSet.length-1)=="="){
req.formDataSet=req.formDataSet.substring(0,req.formDataSet.length-1);
}
req.formDataSet+=str;
}
}
if(_3c){
request.responsePreProcHandler=_3c;
}
if(_3d){
request.responsePostProcHandler=_3d;
}
req.invoke();
};
oc.ajax.jsf.doLightweightCallback=function(_45,_46,_47,_48,_49,_4a,_4b,_4c,_4d){
oc.ajax.jsf.doCallback(_45,_46,_47,_48,_49,_4a,_4b,_4c,_4d);
};
oc.ajax.jsf.doPostBack=function(_4e,_4f,_50){
if(!_4e){
return false;
}
var _51=false;
if(_4e.tagName){
_51=oc.getForm(_4e);
}else{
if(oc.isString(_4e)){
_51=oc.getForm(document.getElementById(_4e));
}
}
if(!_51){
return false;
}
if(_4e.value&&_4f){
_4e.value=_4f;
}
if(oc.isString(_50)){
_50=document.getElementById(_50);
}
if(!_50){
_51.submit();
}else{
var req=new PTHTTPPOSTRequest(_51.action,_51,_50);
req.requestHeaders[oc.ajax.REQUEST_TYPE_HEADER]="AJAX_POSTBACK";
req.invoke();
}
};
if(!window.oc.ajax.dotnet){
window.oc.ajax.dotnet={};
}
oc.ajax.dotnet.doCallback=function(_53,_54,_55,_56,_57,_58,_59,_5a,_5b){
if(!_53){
return false;
}
var _5c=false;
if(_53.tagName){
_5c=oc.getForm(_53);
}else{
if(oc.isString(_53)){
_5c=oc.getForm(document.getElementById(_53));
}
}
if(!_5c){
return false;
}
var req=new PTHTTPPOSTRequest(_5c.action,_5c,oc.ajax.handleResponse);
var _5e=(req.className=="PTHTTPPOSTRequest")?"POST":"GET";
req.requestHeaders[oc.ajax.REQUEST_TYPE_HEADER]="AJAX_CALLBACK";
if(_54){
req.requestHeaders[oc.ajax.AJAX_CONTROLS_HEADER]=_54;
}
if(_55){
req.requestHeaders[oc.ajax.REFRESH_CONTROLS_HEADER]=_55;
}
if(_56){
req.requestHeaders[oc.ajax.EVENTS_HEADER]=_56;
}
if(_5b){
req.requestHeaders[oc.ajax.PROCESSING_INSTRUCTIONS_HEADER]=_5b;
}
if(_58){
if(oc.isString(_58)){
var _5f=_58.split("&");
for(var i=0;i<_5f.length;i++){
var _61=_5f[i].split("=");
if(_61.length==1){
_61[1]="true";
}
req.requestHeaders[_61[0]]=_61[1];
}
}else{
for(header in _58){
req.requestHeaders[header]=_58[header];
}
}
}
var _62=false;
if(_54){
_62=_54.split(",")[0];
}
if(_55){
_62=_55.split(",")[0];
}
if(!_62){
return;
}
var str="&__CALLBACKID="+_62+"&__CALLBACKPARAM=heavyweight";
if(_57){
if(oc.isString(_57)){
if(_57.indexOf("&")!=0){
_57="&"+_57;
}
str+=_57;
}else{
for(param in _57){
str+="&"+encodeURIComponent(param)+"="+encodeURIComponent(_57[param]);
}
}
}
if(!req.formDataSet){
req.formDataSet=str.subsring(1);
}else{
if(req.formDataSet.substring(req.formDataSet.length-1)=="="){
req.formDataSet=req.formDataSet.substring(0,req.formDataSet.length-1);
}
req.formDataSet+=str;
}
if(_59){
request.responsePreProcHandler=_59;
}
if(_5a){
request.responsePostProcHandler=_5a;
}
req.invoke();
};
oc.ajax.dotnet.doLightweightCallback=function(_64,_65,_66,_67,_68,_69,_6a,_6b,_6c){
if(!_65&&!_66){
return;
}
if(!window["WebForm_DoCallback"]){
return;
}
var _6d=false;
var sb=new PTStringBuffer();
sb.append("<req>");
if(_65){
sb.append("<ace>"+_65+"</ace>");
_6d=_65.split(",")[0];
}
if(_66){
sb.append("<rce>"+_66+"</rce>");
if(!_6d){
_6d=_66.split(",")[0];
}
}
if(!_6d){
return;
}
if(_67){
sb.append("<pge><![CDATA["+_67+"]]></pge>");
}
if(_68){
sb.append("<p><![CDATA[");
if(oc.isString(_68)){
if(_68.indexOf("&")!=0){
_68="&"+_68;
}
sb.append(_68);
}else{
for(var key in _68){
sb.append("&"+key+"="+_68[key]);
}
}
sb.append("]]></p>");
}
if(_69){
sb.append("<h><![CDATA[");
if(oc.isString(_69)){
if(_69.indexOf("&")!=0){
_69="&"+_69;
}
sb.append(_69);
}else{
for(var key in _69){
sb.append("&"+key+"="+_69[key]);
}
}
sb.append("]]></h>");
}
if(_6a){
sb.append("<pre><![CDATA["+preResposne+"]]></pre>");
}
if(_6b){
sb.append("<post><![CDATA["+_6b+"]]></post>");
}
if(_6c){
sb.append("<proc>"+_6c+"</proc>");
}
sb.append("</req>");
if(!_6a){
_6a=null;
}
WebForm_DoCallback(_6d,sb.toString(),oc.ajax.handleResponse,_6a,null,true);
};
oc.ajax.dotnet.doPostBack=function(_70,_71,_72){
if(!_70){
return false;
}
var _73=false;
var _74=false;
if(_70.tagName){
_74=_70.id;
_73=oc.getForm(_70);
}else{
if(oc.isString(_70)){
_74=_70;
_73=oc.getForm(document.getElementById(_70));
}
}
if(!_73){
return false;
}
if(_73.__EVENTTARGET){
_73.__EVENTTARGET.value=_74.split("$").join(":");
}
if(_73.__EVENTARGUMENT){
_73.__EVENTARGUMENT.value=_71;
}
if(oc.isString(_72)){
_72=document.getElementById(_72);
}
if(!_72){
_73.submit();
}else{
var req=new PTHTTPPOSTRequest(_73.action,_73,_72);
req.requestHeaders[oc.ajax.REQUEST_TYPE_HEADER]="AJAX_POSTBACK";
req.invoke();
}
};

