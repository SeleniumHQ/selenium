PTHTTPTransport=function(){
};
PTHTTPTransport.VERSION="214238";
PTHTTPTransport.CCMODE_QUEUE="queue";
PTHTTPTransport.CCMODE_ASYNC="async";
PTHTTPTransport.CCMODE_SYNC="sync";
PTHTTPTransport.TRANSPORT_TYPE_MSXML="MSXML";
PTHTTPTransport.TRANSPORT_TYPE_XMLHTTPREQUEST="XMLHttpRequest";
PTHTTPTransport.TRANSPORT_TYPE_IFRAME="iframe";
PTHTTPTransport.transportType=false;
PTHTTPTransport.transportTypeMSIE="";
PTHTTPTransport._requestInProcess=false;
PTHTTPTransport._requestQueue=new Array();
PTHTTPTransport._timers=new Object();
PTHTTPTransport._commentsStartRegExp=new RegExp("<!--","gm");
PTHTTPTransport._commentsEndRegExp=new RegExp("-->","gm");
PTHTTPTransport._cdataStartRegExp=new RegExp("<!\\[CDATA\\[","gm");
PTHTTPTransport._cdataEndRegExp=new RegExp("\\]\\]>","gm");
PTHTTPTransport.getVehicle=function(){
if(PTHTTPTransport.transportType==PTHTTPTransport.TRANSPORT_TYPE_MSXML){
return new ActiveXObject(PTHTTPTransport.transportTypeMSIE);
}else{
if(PTHTTPTransport.transportType==PTHTTPTransport.TRANSPORT_TYPE_XMLHTTPREQUEST){
return new XMLHttpRequest();
}else{
if(PTHTTPTransport.transportType==PTHTTPTransport.TRANSPORT_TYPE_IFRAME){
return PTHTTPTransport._iFrameVehicle;
}
}
}
};
PTHTTPTransport.invokeRequest=function(_1){
if(!_1||!_1.url||_1.url==""){
return false;
}
if(_1.concurrencyMode==PTHTTPTransport.CCMODE_QUEUE&&PTHTTPTransport._requestInProcess){
PTArrayUtil.push(PTHTTPTransport._requestQueue,_1);
return;
}
if(_1.concurrencyMode==PTHTTPTransport.CCMODE_QUEUE){
PTHTTPTransport._requestInProcess=true;
}
if(window.PT_DEBUG&&(PT_DEBUG>=2)){
var _2=(new Date()).getTime();
_1.properties.timerID="timer_"+_2;
PTHTTPTransport._timers[_1.properties.timerID]=new Object();
PTHTTPTransport._timers[_1.properties.timerID].start=_2;
}
var _3=(_1.className=="PTHTTPPOSTRequest")?"POST":"GET";
if(PTHTTPTransport.transportType!=PTHTTPTransport.TRANSPORT_TYPE_IFRAME){
var _4=(_1.concurrencyMode==PTHTTPTransport.CCMODE_SYNC)?false:true;
var _5=PTHTTPTransport.getVehicle();
PTHTTPTransport.vehicle=_5;
_5.open(_3,_1.url,_4);
_5.setRequestHeader(PTHTTPRequest.REQUEST_TYPE_HEADER,_1.type);
_5.setRequestHeader("Referer",window.location);
for(var _6 in _1.requestHeaders){
if(typeof _1.requestHeaders[_6]=="string"||typeof _1.requestHeaders[_6]=="number"||typeof _1.requestHeaders[_6]=="boolean"){
_5.setRequestHeader(_6,_1.requestHeaders[_6]);
}
}
if(_3=="POST"){
_5.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
}
if(_4){
_5.onreadystatechange=function(){
if(_5.readyState==4){
PTHTTPTransport.handleResponse(_5,_1);
}
};
}
if(_3=="POST"){
_5.send(_1.formDataSet);
}else{
_5.send(null);
}
if(!_4){
var _7=PTHTTPTransport.handleResponse(_5,_1);
return _7;
}
}else{
if(_3=="POST"){
PTHTTPTransport._iFrameVehicle.document.write(_1.submitFormHTML);
PTHTTPTransport._iFrameVehicle.document.close();
PTHTTPTransport._iFrameVehicle.document.forms[0].submit();
}else{
PTHTTPTransport._vehicle.document.location.replace(_1.url);
}
var _8=10000;
var _2=new Date();
var _9=0;
while(PTHTTPTransport._iFrameVehicle.readyState=="loading"||PTHTTPTransport._iFrameVehicle.readyState=="loaded"||PTHTTPTransport._iFrameVehicle.readyState=="interactive"){
var _a=new Date();
_9=_a-_2;
if(_9>_8){
break;
}
}
if(!(PTHTTPTransport._iFrameVehicle.readyState=="loading"||PTHTTPTransport._iFrameVehicle.readyState=="loaded"||PTHTTPTransport._iFrameVehicle.readyState=="interactive")){
var _7=PTHTTPTransport.handleResponse(null,_1);
return _7;
}
}
};
PTHTTPTransport.handleResponse=function(_b,_c){
var _d;
var _e=false;
if(PTHTTPTransport.transportType!=PTHTTPTransport.TRANSPORT_TYPE_IFRAME){
var _f;
_e=false;
try{
_f=_b.status;
}
catch(e){
if(e.name=="NS_ERROR_NOT_AVAILABLE"){
_d=new PTHTTPResponse(_c,"",false,false,PTHTTPResponse.RESPONSE_TYPE_NO_RESPONSE);
_e=true;
}
}
if(_f==12029){
_d=new PTHTTPResponse(_c,"",false,false,PTHTTPResponse.RESPONSE_TYPE_NO_RESPONSE);
_e=true;
}
if(!_e){
_d=new PTHTTPResponse(_c,_b.responseText,_b.responseXML,_b.status,false,_b.getAllResponseHeaders());
_d._contentType=_b.getResponseHeader("Content-Type");
if(window.PT_DEBUG&&(PT_DEBUG>=2)){
var end=(new Date()).getTime();
if(_c&&_c.properties&&_c.properties.timerID){
PTHTTPTransport._timers[_c.properties.timerID].end=end;
var _11=end-PTHTTPTransport._timers[_c.properties.timerID].start;
}
}
}
}
if(PTHTTPTransport.transportType==PTHTTPTransport.TRANSPORT_TYPE_IFRAME){
_d=new PTHTTPResponse(_c,PTHTTPTransport._iFrameVehicle.document.body.innerText);
}
if(_c.responsePreProcHandler&&typeof _c.responsePreProcHandler=="function"){
try{
var _12=_c.responsePreProcHandler(_d);
}
catch(e){
_12=false;
}
if(_12===false){
if(_c.targetElement){
_c.targetElement.style.cursor=_c._targetElementCursorStyle;
}
if(_c.concurrencyMode==PTHTTPTransport.CCMODE_QUEUE){
PTHTTPTransport._requestInProcess=false;
window.setTimeout("PTHTTPTransport._invokeNextRequest()",1);
}
return _d;
}
}
if(_d.type==PTHTTPResponse.RESPONSE_TYPE_SESSION_EXPIRED){
PTHTTPTransport._requestInProcess=false;
var _13=_d.getResponseHeaders()[PTHTTPResponse.PT_LOGIN_URL_HEADER];
if(_13){
window.location=_13;
return;
}else{
window.location.reload();
return;
}
}
if(_d.type==PTHTTPResponse.RESPONSE_TYPE_REDIRECT){
var _14=_d.getResponseHeaders()["Location"];
_c.url=_14;
PTHTTPTransport._requestInProcess=false;
return _c.invoke();
}
if(_c.callback){
if(typeof _c.callback=="string"){
if(eval(_c.callback)){
eval(_c.callback+"(response)");
}
}else{
if(typeof _c.callback=="function"){
_c.callback(_d);
}
}
}else{
if(_c.targetElement&&_d._contentType.indexOf("text")!=0){
_c.targetElement.style.cursor=_c._targetElementCursorStyle;
window.location=_c.url;
}else{
if(_c.targetElement){
var _15=_c.targetElement;
var _16=_d.responseText;
PTHTTPTransport.refreshTargetElement(_15,_16,_c._targetElementCursorStyle);
}else{
}
}
}
if(_c.responsePostProcHandler&&typeof _c.responsePostProcHandler=="function"){
try{
_c.responsePostProcHandler(_d);
}
catch(e){
}
}
if(_c.concurrencyMode==PTHTTPTransport.CCMODE_QUEUE){
PTHTTPTransport._requestInProcess=false;
window.setTimeout("PTHTTPTransport._invokeNextRequest()",1);
}
return _d;
};
PTHTTPTransport.refreshTargetElement=function(_17,_18,_19){
_17.innerHTML="";
if(PTBrowserInfo.IS_SAFARI){
_18=_18.replace(new RegExp("(<style)","gi"),"<!-- $1");
_18=_18.replace(new RegExp("(</style>)","gi"),"$1 -->");
_18=_18.replace(new RegExp("(<link.*?>)","gi"),"<!-- $1 -->");
}
_17.innerHTML="<input type=\"hidden\"/>"+_18;
if(!_19){
_19="auto";
}
_17.style.cursor=_19;
var _1a=_17.getElementsByTagName("SCRIPT");
if(_1a&&_1a.length>0){
try{
PTHTTPTransport._jsToEval="";
for(var i=0;i<_1a.length;i++){
var _1c=_1a[i];
if(_1c.defer&&PTBrowserInfo.IS_MSIE&&PTBrowserInfo.MSIE_VERSION>=5.5){
continue;
}
if(_1c.src){
if(PTHTTPTransport.transportType!=PTHTTPTransport.TRANSPORT_TYPE_IFRAME){
var _1d=new PTHTTPGETRequest(_1c.src,false,PTHTTPTransport.CCMODE_SYNC);
var _1e=_1d.invoke();
if(_1e.status==200){
PTHTTPTransport._jsToEval+=_1e.responseText+"\n";
}
}
}else{
if(_1c.innerHTML){
var _1f=_1c.innerHTML.split("\n");
for(var j=0;j<_1f.length;j++){
if(_1f[j].indexOf("document.write")!=-1){
_1f[j]="";
}
}
var _21=_1f.join("\n")+"\n";
if(_21.search(PTHTTPTransport._commentsStartRegExp)!=-1){
_21=_21.replace(PTHTTPTransport._commentsStartRegExp,"");
}
if(_21.search(PTHTTPTransport._commentsEndRegExp)!=-1){
_21=_21.replace(PTHTTPTransport._commentsEndRegExp,"");
}
if(_21.search(PTHTTPTransport._cdataStartRegExp)!=-1){
_21=_21.replace(PTHTTPTransport._cdataStartRegExp,"");
}
if(_21.search(PTHTTPTransport._cdataEndRegExp)!=-1){
_21=_21.replace(PTHTTPTransport._cdataEndRegExp,"");
}
PTHTTPTransport._jsToEval+=_21;
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
}
}
};
PTHTTPTransport._invokeNextRequest=function(){
if(PTHTTPTransport._requestQueue.length>0){
var _22=PTHTTPTransport._requestQueue.shift();
PTHTTPTransport.invokeRequest(_22);
}
};
PTHTTPTransport.init=function(){
if(PTBrowserInfo.IS_MSIE&&PTBrowserInfo.MSIE_VERSION>=5){
PTHTTPTransport._setTransportTypeMSIE();
}
if(!PTHTTPTransport.transportType){
try{
var _23=new XMLHttpRequest();
PTHTTPTransport.transportType=PTHTTPTransport.TRANSPORT_TYPE_XMLHTTPREQUEST;
}
catch(e){
}
}
if(!PTHTTPTransport.transportType){
if(!document.body){
window.setTimeout("PTHTTPTransport.init()",200);
return;
}
if(document.createElement&&!document.frames["_ptHttpTransportIFrame"]){
if(PTBrowserInfo.IS_OPERA){
PTHTTPTransport._iFrameVehicle=document.createElement("iframe");
PTHTTPTransport._iFrameVehicle.setAttribute("id","_ptHttpTransportIFrame");
PTHTTPTransport._iFrameVehicle.style.border="0px";
PTHTTPTransport._iFrameVehicle.style.width="0px";
PTHTTPTransport._iFrameVehicle.style.height="0px";
document.body.appendChild(PTHTTPTransport._iFrameVehicle);
}else{
var _24=document.createElement("iframe");
_24.setAttribute("id","_ptHttpTransportIFrame");
_24.style.border="0px";
_24.style.width="0px";
_24.style.height="0px";
document.body.appendChild(_24);
PTHTTPTransport._iFrameVehicle=document.frames["_ptHttpTransportIFrame"];
}
PTHTTPTransport.transportType=PTHTTPTransport.TRANSPORT_TYPE_IFRAME;
}
}
};
PTHTTPTransport._setTransportTypeMSIE=function(){
var _25=new Array("Msxml2.XMLHTTP.5.0","Msxml2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP");
var _26=false;
TEST:
for(var t=0;t<_25.length;t++){
var _28=_25[t];
var _29;
try{
_29=new ActiveXObject(_28);
}
catch(e){
continue TEST;
}
PTHTTPTransport.transportType=PTHTTPTransport.TRANSPORT_TYPE_MSXML;
PTHTTPTransport.transportTypeMSIE=_28;
return true;
}
return false;
};
PTHTTPTransport.init();
PTHTTPRequest=function(){
};
PTHTTPRequest.VERSION="214238";
PTHTTPRequest.REQUEST_TYPE_HEADER="PT-HTTPRequest-Type";
PTHTTPRequest.REQUEST_TYPE_CLIENT_SIDE="CLIENT_SIDE";
PTHTTPRequest.REQUEST_TYPE_PORTLET_REFRESH="PORTLET_REFRESH";
PTHTTPRequest.prototype.url=null;
PTHTTPRequest.prototype.type=PTHTTPRequest.REQUEST_TYPE_CLIENT_SIDE;
PTHTTPRequest.prototype.callback=null;
PTHTTPRequest.prototype.targetElement=null;
PTHTTPRequest.prototype.responsePreProcHandler=null;
PTHTTPRequest.prototype.responsePostProcHandler=null;
PTHTTPRequest.prototype.concurrencyMode=PTHTTPTransport.CCMODE_QUEUE;
PTHTTPRequest.prototype.requestHeaders={};
PTHTTPRequest.prototype.properties={};
PTHTTPRequest.prototype._requestForm=null;
PTHTTPRequest.prototype.formDataSet=null;
PTHTTPRequest.prototype._setFormURLEncodedDataFromNVPairs=function(_2a){
if(!_2a){
return null;
}
var _2b="";
for(theName in _2a){
_2b+=PTStringUtil.encodeURL(theName)+"="+PTStringUtil.encodeURL(_2a[theName])+"&";
}
if(_2b.length>0){
this.formDataSet=_2b.substring(0,_2b.length-1);
}
};
PTHTTPRequest.prototype._setFormURLEncodedDataFromForm=function(_2c){
this._requestForm=PTHTTPRequest._resolveFormReference(_2c);
if(!this._requestForm){
return null;
}
var _2d="";
var _2e=this._requestForm.elements;
for(var i=0;i<_2e.length;i++){
var _30=_2e[i];
if(_30.tagName=="BUTTON"){
var _31=PTStringUtil.encodeURL(_30.name);
var _32=PTStringUtil.encodeURL(PTStringUtil.getInnerText(_30));
_2d+=_31+"="+_32+"&";
}else{
if(_30.tagName=="SELECT"){
var _31=PTStringUtil.encodeURL(_30.name);
for(var j=0;j<_30.options.length;j++){
if(_30.options[j].selected){
var _34=(_30.options[j].value)?_30.options[j].value:_30.options[j].text;
var _32=PTStringUtil.encodeURL(_34);
_2d+=_31+"="+_32+"&";
}
}
}else{
if(_30.tagName=="TEXTAREA"){
var _31=PTStringUtil.encodeURL(_30.name);
var _32=PTStringUtil.encodeURL(_30.value);
_2d+=_31+"="+_32+"&";
}else{
if(_30.tagName=="INPUT"&&_30.name){
if(_30.type=="button"||_30.type=="file"||_30.type=="image"||_30.type=="submit"){
continue;
}else{
if(_30.type=="checkbox"||_30.type=="radio"){
if(_30.checked){
var _31=PTStringUtil.encodeURL(_30.name);
var _32=PTStringUtil.encodeURL(_30.value);
_2d+=_31+"="+_32+"&";
}
}else{
var _31=PTStringUtil.encodeURL(_30.name);
var _32=PTStringUtil.encodeURL(_30.value);
_2d+=_31+"="+_32+"&";
}
}
}
}
}
}
}
if(_2d.length>0){
this.formDataSet=_2d.substring(0,_2d.length-1);
}
};
PTHTTPRequest.prototype.setResponseHandler=function(_35){
if(typeof _35=="string"||typeof _35=="function"){
this.callback=_35;
}else{
if(_35&&_35.tagName){
this.targetElement=_35;
}
}
};
PTHTTPRequest.prototype.setFormContent=function(_36){
if(!_36){
return;
}
if((_36.tagName&&_36.tagName=="FORM")||typeof _36=="string"){
this._setFormURLEncodedDataFromForm(_36);
}else{
if(typeof _36=="object"){
this._setFormURLEncodedDataFromNVPairs(_36);
}
}
};
PTHTTPRequest.prototype.setRequestHeader=function(_37,_38){
if(!_37){
return;
}
this.requestHeaders[_37]=_38;
};
PTHTTPRequest.prototype.invoke=function(_39){
var _3a=false;
if(!this.url&&this._requestForm){
this.url=this._requestForm.action;
_3a=true;
}
if(!this.url){
return;
}
if(this.className=="PTHTTPGETRequest"&&this.formDataSet){
this.url+="?"+this.formDataSet;
}
var _3b=false;
var _3c=arguments.callee.caller;
var _3d=0;
while(_3c&&++_3d<100){
if(this._requestForm&&this._requestForm.onsubmit&&_3c==this._requestForm.onsubmit){
_3b=true;
break;
}
_3c=_3c.arguments.callee.caller;
}
if(this._requestForm&&this._requestForm.onsubmit&&this._requestForm.onsubmit.toString().indexOf("PTValidate_")==-1&&!_3b){
var _3e=this._requestForm.onsubmit();
if(!_3e){
return;
}
if(_3a){
this.url=this._requestForm.action;
}
}
if(this.callback){
}else{
if(this.targetElement){
this._targetElementCursorStyle=this.targetElement.style.cursor;
this.targetElement.style.cursor="wait";
}
}
if(_39&&(_39=new String(_39))){
if(_39.lastIndexOf(")")!=(_39.length-1)){
_39+="(true)";
}
try{
eval(_39);
}
catch(e){
}
}
return PTHTTPTransport.invokeRequest(this);
};
PTHTTPRequest._resolveFormReference=function(_3f){
if(!_3f){
return null;
}
var _40=null;
if(_3f.tagName&&(_3f.tagName=="FORM")){
_40=_3f;
}else{
if(typeof _3f=="string"){
if(document[_3f]){
_40=document[_3f];
}else{
if(document.getElementById(_3f)){
_40=document.getElementById(_3f);
}
}
}
}
return _40;
};
PTHTTPGETRequest=function(url,_42,_43,_44){
if(url){
this.url=url;
}
this.setResponseHandler(_42);
if(_43){
this.concurrencyMode=_43;
}
if(_44){
for(var p in _44){
this.properties[p]=_44[p];
}
}
this.requestHeaders["Referer"]=window.location;
return this;
};
PTHTTPGETRequest.prototype=new PTHTTPRequest();
PTHTTPGETRequest.prototype.constructor=PTHTTPGETRequest;
PTHTTPGETRequest.prototype._superClass=PTHTTPRequest;
PTHTTPGETRequest.VERSION="214238";
PTHTTPGETRequest.prototype.className="PTHTTPGETRequest";
PTHTTPPOSTRequest=function(url,_47,_48,_49,_4a){
if(url){
this.url=url;
}
this.setFormContent(_47);
this.setResponseHandler(_48);
if(_49){
this.concurrencyMode=_49;
}
if(_4a){
for(var p in _4a){
this.properties[p]=_4a[p];
}
}
return this;
};
PTHTTPPOSTRequest.prototype=new PTHTTPRequest();
PTHTTPPOSTRequest.prototype.constructor=PTHTTPPOSTRequest;
PTHTTPPOSTRequest.prototype._superClass=PTHTTPRequest;
PTHTTPPOSTRequest.VERSION="214238";
PTHTTPPOSTRequest.prototype.className="PTHTTPPOSTRequest";
PTHTTPPOSTRequest.prototype.setFormContent=function(_4c){
if(PTHTTPTransport.transportType=="iframe"){
if(_4c&&_4c.tagName&&_4c.tagName=="FORM"){
this._submitFormHTML=PTHTTPPOSTRequest._genSubmitFormHTMLFromForm(_4c,this.url);
}else{
if(_4c&&typeof _4c=="object"){
this._submitFormHTML=PTHTTPPOSTRequest._genSubmitFormHTMLFromNVPairs(_4c,this.url);
}
}
}else{
if(!this._super_setFormContent){
this._super_setFormContent=this._superClass.prototype.setFormContent;
}
this._super_setFormContent(_4c);
}
};
PTHTTPPOSTRequest._genSubmitFormHTMLFromNVPairs=function(_4d,url){
var _4f="<form name=\"submitForm\" method=\"POST\" action=\""+url+"\">\n";
for(prop in _4d){
_4f+="<input type=\"hidden\" ";
_4f+="name=\""+PTStringUtil.escapeHTML(prop)+"\" ";
_4f+="value=\""+PTStringUtil.escapeHTML(_4d[prop])+"\">\n";
}
_4f+="</form>";
return _4f;
};
PTHTTPPOSTRequest._genSubmitFormHTMLFromForm=function(_50,url){
var _52="<form name=\"submitForm\" method=\"POST\" action=\""+url+"\">\n";
var _53=_50.elements;
for(var i=0;i<_53.length;i++){
var _55=_53[i];
if(_55.tagName=="BUTTON"){
var _56=PTStringUtil.escapeHTML(_55.name);
var _57=PTStringUtil.escapeHTML(_55.innerText);
_52+="<input type=\"hidden\" ";
_52+="name=\""+_56+"\" ";
_52+="value=\""+_57+"\">\n";
}else{
if(_55.tagName=="SELECT"){
var _56=PTStringUtil.escapeHTML(_55.name);
for(var j=0;j<_55.options.length;j++){
if(_55.options[j].selected){
var _59=(_55.options[j].value)?_55.options[j].value:_55.options[j].text;
var _57=PTStringUtil.escapeHTML(_59);
_52+="name=\""+_56+"\" ";
_52+="value=\""+_57+"\">\n";
}
}
}else{
if(_55.tagName=="TEXTAREA"){
var _56=PTStringUtil.escapeHTML(_55.name);
var _57=PTStringUtil.escapeHTML(_55.value);
_52+="name=\""+_56+"\" ";
_52+="value=\""+_57+"\">\n";
}else{
if(_55.tagName=="INPUT"&&_55.name){
if(_55.type=="file"||_55.type=="image"){
continue;
}else{
if(_55.type=="checkbox"||_55.type=="radio"){
if(_55.checked){
var _56=PTStringUtil.escapeHTML(_55.name);
var _57=PTStringUtil.escapeHTML(_55.value);
_52+="name=\""+_56+"\" ";
_52+="value=\""+_57+"\">\n";
}
}else{
var _5a=PTStringUtil.encodeURL(_55.name);
var _5b=PTStringUtil.encodeURL(_55.value);
_52+="name=\""+_56+"\" ";
_52+="value=\""+_57+"\">\n";
}
}
}
}
}
}
}
_52+="</form>";
return _52;
};
PTHTTPResponse=function(_5c,_5d,_5e,_5f,_60,_61){
this.request=(_5c)?_5c:new Object();
this.responseText=(_5d)?_5d:"";
this.responseXML=(_5e)?_5e:false;
this.status=(_5f)?parseInt(_5f):false;
this.type=(_60)?_60:null;
this._responseHeaders=false;
this._responseHeadersString=_61;
if(!_60&&this.status){
var _62=(_61.toLowerCase().indexOf(PTHTTPResponse.PT_RESPONSE_TYPE_HEADER.toLowerCase())>-1)?true:false;
if(this.status==200&&!_62){
this.type=PTHTTPResponse.RESPONSE_TYPE_OK;
}else{
if(this.status==204||this.status==1223){
this.type=PTHTTPResponse.RESPONSE_TYPE_EMPTY_RESPONSE;
}else{
if(this.status>=400&&this.status<600){
this.type=PTHTTPResponse.RESPONSE_TYPE_SERVER_ERROR;
}else{
this.type=this._getResponseTypeFromHeaders(this.status);
}
}
}
}
this.className="PTHTTPResponse";
return this;
};
PTHTTPResponse.VERSION="214238";
PTHTTPResponse.RESPONSE_TYPE_OK="ok";
PTHTTPResponse.RESPONSE_TYPE_REDIRECT="redirect";
PTHTTPResponse.RESPONSE_TYPE_SESSION_EXPIRED="session_expired";
PTHTTPResponse.RESPONSE_TYPE_PORTLET_ERROR="portlet_error";
PTHTTPResponse.RESPONSE_TYPE_PORTLET_TIMEOUT="portlet_timeout";
PTHTTPResponse.RESPONSE_TYPE_SERVER_ERROR="server_error";
PTHTTPResponse.RESPONSE_TYPE_EMPTY_RESPONSE="empty_response";
PTHTTPResponse.RESPONSE_TYPE_NO_RESPONSE="no_response";
PTHTTPResponse.PT_RESPONSE_TYPE_HEADER="PT-HTTPResponse-Type";
PTHTTPResponse.PT_RESPONSE_TYPE_HEADER_SAFARI="Pt-Httpresponse-Type";
PTHTTPResponse.PT_RESPONSE_TYPE_PORTLET_ERROR="PORTLET_ERROR";
PTHTTPResponse.PT_RESPONSE_TYPE_PORTLET_TIMEOUT="PORTLET_TIMEOUT";
PTHTTPResponse.PT_RESPONSE_TYPE_SESSION_TIMEOUT="SESSION_TIMEOUT";
PTHTTPResponse.PT_LOGIN_URL_HEADER="PT-Login-URL";
PTHTTPResponse.prototype._getResponseTypeFromHeaders=function(_63){
var _64=this.getResponseHeaders();
var _65=(PTBrowserInfo.IS_SAFARI)?PTHTTPResponse.PT_RESPONSE_TYPE_HEADER_SAFARI:PTHTTPResponse.PT_RESPONSE_TYPE_HEADER;
if(_64[_65]==PTHTTPResponse.PT_RESPONSE_TYPE_PORTLET_ERROR){
return PTHTTPResponse.RESPONSE_TYPE_PORTLET_ERROR;
}else{
if(_64[_65]==PTHTTPResponse.PT_RESPONSE_TYPE_PORTLET_TIMEOUT){
return PTHTTPResponse.RESPONSE_TYPE_PORTLET_TIMEOUT;
}else{
if(_64[_65]==PTHTTPResponse.PT_RESPONSE_TYPE_SESSION_TIMEOUT){
return PTHTTPResponse.RESPONSE_TYPE_SESSION_EXPIRED;
}else{
if(_63==302){
return PTHTTPResponse.RESPONSE_TYPE_REDIRECT;
}
}
}
}
};
PTHTTPResponse.prototype.getResponseHeaders=function(){
if(this._responseHeaders){
return this._responseHeaders;
}else{
this._responseHeaders=new Object();
if(this._responseHeadersString){
var _66=this._responseHeadersString.split("\n");
for(var i=0;i<_66.length;i++){
var _68=_66[i];
var _69=_68.split(": ");
if(_69[0]&&_69[1]){
var _6a=PTStringUtil.trimWhitespace(_69[0],true,true);
var _6b=PTStringUtil.trimWhitespace(_69[1],true,true);
this._responseHeaders[_6a]=_6b;
}
}
}
return this._responseHeaders;
}
};
PTHTTPResponse.isValid=function(_6c){
return (_6c&&_6c.responseText&&(_6c.responseText.length>0)&&!PTStringUtil.isAllWhitespace(_6c.responseText));
};
function PTXMLCompositor(){
return this;
}
PTXMLCompositor.VERSION="214238";
PTXMLCompositor.VALUE_AUTOSET="VALUE_AUTOSET";
PTXMLCompositor.nextUID=(new Date()).getTime();
PTXMLCompositor.URLNodes={"baseURL":true,"imgSrc":true,"URL":true,"srcURL":true,"defaultPageURL":true,"relativeBaseURL":true};
PTXMLCompositor.expandFromXML=function(xml,w,obj){
var _70=w.getAttribute(xml,"class");
if(!_70){
return;
}
if(!obj){
obj=PTXMLCompositor.inflateObject(_70,xml,w);
}
var _71="finishcompositor"+ ++PTXMLCompositor.nextUID;
obj=PTXMLCompositor.inflateNode(xml,obj,w,null,_71);
var evt=new Object();
evt.type=_71;
document.PCC.RaiseWindowEvent(evt);
return obj;
};
PTXMLCompositor.inflateObject=function(_73,_74,w,_76,obj){
try{
var _78=null;
if((_73=="Number")&&_74){
var _79=new String(w.getNodeValue(_74));
if(isNaN(_79)){
throw "";
}
if(_79.indexOf(".")>-1){
_78=parseFloat(_79);
}else{
_78=parseInt(_79);
}
}else{
if((_73=="Boolean")&&_74){
if((w.getNodeValue(_74)=="false")||(w.getNodeValue(_74)=="0")){
_78=false;
}else{
_78=true;
}
}else{
if(_73=="Date"){
var _7a=w.getNodeValue(_74);
try{
_78=new Date(_7a);
}
catch(e){
_78=new Date("'"+_7a+"'");
}
if(!_78){
throw "";
}
}else{
if(_73=="PTDate"){
_78=new PTDate(w.getNodeValue(_74));
_78.date=new Date(w.getNodeValue(_74));
}else{
if((_73=="Hash")||(_73=="Array")){
if(_76&&(_76=="merge")&&obj){
_78=obj;
}else{
_78=new Array();
}
}else{
if(_73=="PTSimpleMenuItem"){
_78=new PTMenuItem();
_78.type=PTMenuItem.SIMPLE_MENU_ITEM;
}else{
if(_73=="PTDividerMenuItem"){
_78=new PTMenuItem();
_78.type=PTMenuItem.DIVIDER_MENU_ITEM;
}else{
if(_73=="PTRadioMenuItem"){
_78=new PTMenuItem();
_78.type=PTMenuItem.RADIO_MENU_ITEM;
}else{
if(_73=="PTCheckboxMenuItem"){
_78=new PTMenuItem();
_78.type=PTMenuItem.CHECKBOX_MENU_ITEM;
}else{
if(_73=="PTCascadingMenuItem"){
_78=new PTMenuItem();
_78.type=PTMenuItem.CASCADING_MENU_ITEM;
}else{
if(_73=="PTAntiMatter"){
_78=null;
}else{
if(_73=="null"){
_78=null;
}else{
_78=new window[_73]();
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
return _78;
}
catch(e){
var _7b="PTXMLCompositor: Failed to create new "+_73+".";
if((_73=="Number")&&_74&&w){
if(isNaN(w.getNodeValue(_74))){
_7b+="\n\nInvalid numeric value:  ";
_7b+=w.getNodeValue(_74);
}
}else{
if(e.message){
_7b+="\n\n"+e.message;
}
}
return;
}
};
PTXMLCompositor.inflateNode=function(_7c,obj,w,_7f,_80){
if(!_7c){
return;
}
var c=_7c.childNodes;
var _82=c.length;
for(var i=0;i<_82;i++){
var _84=c[i];
var _85=new String(w.getNodeName(_84));
if(_85=="#text"||_85=="#comment"){
continue;
}
try{
var _86=w.getAttribute(_84,"index");
var key=w.getAttribute(_84,"key");
var _88=w.getAttribute(_84,"class");
var mod=w.getAttribute(_84,"mod");
var _8a=w.getAttribute(_84,"mode");
}
catch(e){
continue;
}
if(_85=="component"){
var _8b=PTXMLCompositor.expandComponent(_7c,_84,w);
if(_8b){
obj[_85]=_8b;
}else{
obj[_85]=PTXMLCompositor.inflateObject(_88,_84,w,_8a,obj[_85]);
obj[_85]=PTXMLCompositor.inflateNode(_84,obj[_85],w,obj,_80);
}
}else{
if((_88=="PTPanelSet")&&(_86!=null)){
var _8b=PTXMLCompositor.expandComponent(_7c,_84,w);
var _8c=parseInt(_86);
if(_8b){
obj[_8c]=_8b;
}else{
obj[_8c]=PTXMLCompositor.inflateObject(_88,_84,w,_8a,obj[_8c]);
obj[_8c]=PTXMLCompositor.inflateNode(_84,obj[_8c],w,obj,_80);
}
}else{
if(_85=="javascript"){
eval(w.getNodeValue(_84));
}else{
if(_86&&_88){
var _8c=parseInt(_86);
obj[_8c]=PTXMLCompositor.inflateObject(_88,_84,w,_8a,obj[_8c]);
obj[_8c]=PTXMLCompositor.inflateNode(_84,obj[_8c],w,obj,_80);
}else{
if(_86){
var _8c=parseInt(_86);
obj[_8c]=w.getNodeValue(_84);
}else{
if(key){
if(_88){
obj[key]=PTXMLCompositor.inflateObject(_88,_84,w,_8a,obj[key]);
obj[key]=PTXMLCompositor.inflateNode(_84,obj[key],w,obj,_80);
}
obj[key]=w.getNodeValue(_84);
}else{
if(_85=="rows"&&obj.className=="PTTableControl"){
obj.rowNodes=new Array();
for(var j=0;j<_84.childNodes.length;j++){
var _8e=_84.childNodes[j];
var _8f=new String(w.getNodeName(_8e));
if(_8f=="#text"||_8f=="#comment"){
continue;
}
var _90=parseInt(w.getAttribute(_8e,"index"));
obj.rowNodes[_90]=_8e;
}
obj.rows=new Array(obj.rowNodes.length);
}else{
if(_88){
obj[_85]=PTXMLCompositor.inflateObject(_88,_84,w,_8a,obj[_85]);
obj[_85]=PTXMLCompositor.inflateNode(_84,obj[_85],w,obj,_80);
}else{
var _91=new String(w.getNodeValue(_84));
if((_85=="js")&&(_91.indexOf("<script>")>-1)){
var _92=_91.indexOf("</script>");
var js=_91.substring(_91.indexOf("<script>")+8,_92);
obj[_85]=js;
}else{
if(_91.indexOf("<html-frag>")>-1){
var _92=_91.indexOf("</html-frag>");
var _94=_91.substring(_91.indexOf("<html-frag>")+11,_92);
obj[_85]=_94;
}else{
var _95=PTXMLCompositor.URLNodes[_85]?true:false;
if(_95&&(_91.indexOf("<a href=\"")>-1)){
var _92=_91.indexOf("\"></a>");
var _96=_91.substring(_91.indexOf("<a href=\"")+9,_92);
obj[_85]=_96;
}else{
obj[_85]=w.getNodeValue(_84);
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
if((_85=="srcURL")&&obj.className&&(obj.className=="PTHTMLPanel")){
var _97="PTXMLCompositor_PanelLoadPointer_"+ ++PTXMLCompositor.nextUID;
window[_97]=obj;
document.PCC.RegisterForWindowEvent("on"+_80,_97+".loadSrcURL");
}
if(obj[_85]&&obj[_85].parent&&(obj[_85].parent==PTXMLCompositor.VALUE_AUTOSET)){
obj[_85].parent=obj;
}else{
if(_86){
var _8c=parseInt(_86);
if(obj[_8c]&&obj[_8c].parent&&(obj[_8c].parent==PTXMLCompositor.VALUE_AUTOSET)){
obj[_8c].parent=_7f;
}
}
}
if(obj[_85]&&obj[_85].uid&&(obj[_85].uid==PTXMLCompositor.VALUE_AUTOSET)){
obj[_85].uid=++PTXMLCompositor.nextUID;
}else{
if(_86){
var _8c=parseInt(_86);
if(obj[_8c]&&obj[_8c].uid&&(obj[_8c].uid==PTXMLCompositor.VALUE_AUTOSET)){
obj[_8c].uid=++PTXMLCompositor.nextUID;
}
}
}
if(_86){
var _8c=parseInt(_86);
if(obj[_8c]&&obj[_8c].index&&(obj[_8c].index==PTXMLCompositor.VALUE_AUTOSET)){
obj[_8c].index=_8c;
}
}
if(_85=="objName"){
var _98=w.getNodeValue(_84);
if(_98&&(_98.length>0)){
PTControls.makeGlobalObject(obj,_98);
}
}
}
return obj;
};
PTXMLCompositor.expandComponent=function(_99,_9a,w){
if(!_9a){
return false;
}
var _9c=false;
try{
var cls=w.getAttribute(_9a,"class");
}
catch(e){
return false;
}
var _9e=window[cls];
if(!_9e){
return false;
}
var _9f=false;
try{
_9f=w.getAttribute(_9a,"mode");
}
catch(e){
}
var _a0=w.selectSingleNode(_9a,"objName");
if(!_a0){
return false;
}
var _a1=w.getNodeValue(_a0);
try{
if(_9f&&(_9f=="merge")){
window[_a1]=window[cls].createFromNode(_9a,w,_a1);
return window[_a1];
}else{
if(_99){
_9c=window[cls].createFromXML(_99,w);
}
}
}
catch(e){
return false;
}
if(!_9c){
try{
_9c=window[cls].createFromNode(_9a,w);
}
catch(e){
return false;
}
}
if(!_9c){
}
PTControls.makeGlobalObject(_9c,_a1,true);
return _9c;
};
PTXMLCompositor.unescapeTokens=function(str){
return str;
};
PTXMLDocument=function(doc){
if(doc){
this._doc=doc;
}else{
var msg="No document to wrap. To create a new document, use the PTXMLDocumentBuilder class.";
throw msg;
}
};
PTXMLDocument.VERSION="214238";
PTXMLDocument.ELEMENT_NODE=1;
PTXMLDocument.ATTRIBUTE_NODE=2;
PTXMLDocument.TEXT_NODE=3;
PTXMLDocument.CDATA_SECTION_NODE=4;
PTXMLDocument.ENTITY_REFERENCE_NODE=5;
PTXMLDocument.ENTITY_NODE=6;
PTXMLDocument.PROCESSING_INSTRUCTION_NODE=7;
PTXMLDocument.COMMENT_NODE=8;
PTXMLDocument.DOCUMENT_NODE=9;
PTXMLDocument.DOCUMENT_TYPE_NODE=10;
PTXMLDocument.DOCUMENT_FRAGMENT_NODE=11;
PTXMLDocument.NOTATION_NODE=12;
PTXMLDocument.prototype.getUnderlyingObject=function(){
return this._doc;
};
PTXMLDocument.prototype.loadFromString=function(str){
var _a6=PTXMLDocumentBuilder.createFromString(str);
this._doc=_a6._doc;
};
PTXMLDocument.prototype.serializeToString=function(){
if(!this._doc){
return "";
}
if(this._doc.xml){
return this._doc.xml;
}else{
if(window.XMLSerializer){
var xml=(new XMLSerializer()).serializeToString(this._doc);
return xml;
}else{
return "";
}
}
};
PTXMLDocument.prototype.getDocumentElement=function(){
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_PTXML){
return this._doc;
}else{
return this._doc.documentElement;
}
};
PTXMLDocument.prototype.createElement=function(_a8){
return this._doc.createElement(_a8);
};
PTXMLDocument.prototype.appendChild=function(_a9){
return this._doc.appendChild(_a9);
};
PTXMLDocument.prototype.getElementsByTagName=function(_aa){
return this._doc.getElementsByTagName(_aa);
};
PTXMLDocument.prototype.importNode=function(_ab,_ac){
return this._doc.importNode(_ab,_ac);
};
PTXMLDocument.selectSingleNode=function(_ad,_ae){
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_MSXML){
return _ad.selectSingleNode(_ae);
}else{
var _af=_ad.childNodes;
if(_af){
var len=_af.length;
for(var n=0;n<len;n++){
var cn=_af.item(n);
if(cn.nodeName==_ae){
return _af.item(n);
}
}
}
}
};
PTXMLDocument.prototype.selectSingleNode=function(_b3){
return PTXMLDocument.selectSingleNode(this._doc,_b3);
};
PTXMLDocument.getAttributeValue=function(_b4,_b5){
if(!_b4){
return null;
}
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_MSXML){
return _b4.getAttribute(_b5);
}else{
if(_b4.attributes&&_b4.attributes.getNamedItem){
var ni=_b4.attributes.getNamedItem(_b5);
if(ni){
return ni.nodeValue;
}
}
}
return null;
};
PTXMLDocument.prototype.getAttributeValue=function(_b7,_b8){
return PTXMLDocument.getAttributeValue(_b7,_b8);
};
PTXMLDocument.getNodeValue=function(_b9){
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_MSXML){
var v=_b9.nodeValue;
if(v){
return v;
}else{
if(_b9.text){
return _b9.text;
}else{
return null;
}
}
}else{
if(_b9.childNodes&&_b9.childNodes[1]&&(_b9.childNodes[1].nodeType==PTXMLDocument.CDATA_SECTION_NODE)){
return _b9.childNodes[1].nodeValue;
}else{
if(_b9.firstChild){
return _b9.firstChild.nodeValue;
}else{
return null;
}
}
}
};
PTXMLDocument.prototype.getNodeValue=function(_bb){
return PTXMLDocument.getNodeValue(_bb);
};
PTXMLDocumentBuilder=function(){
};
PTXMLDocumentBuilder.VERSION="214238";
PTXMLDocumentBuilder.PARSER_TYPE_MSXML="MSXML";
PTXMLDocumentBuilder.PARSER_TYPE_MOZDP="MOZDP";
PTXMLDocumentBuilder.PARSER_TYPE_PTXML="PTXML";
PTXMLDocumentBuilder.parserType=false;
PTXMLDocumentBuilder.parserTypeMSIE=false;
PTXMLDocumentBuilder._testXMLString="<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<root>test</root>\n";
PTXMLDocumentBuilder._getParserTypeMSIE=function(){
var _bc=new Array("MSXML2.DOMDocument.5.0","MSXML2.DOMDocument.4.0","MSXML2.DOMDocument.3.0","MSXML2.DOMDocument.2.6","MSXML2.DOMDocument","MSXML.DOMDocument","Microsoft.XMLDOM");
var _bd=false;
TEST:
for(var p=0;p<_bc.length;p++){
var _bf=_bc[p];
try{
object=new ActiveXObject(_bf);
object.async=false;
object.loadXML(PTXMLDocumentBuilder._testXMLString);
while(object.readyState!=4){
if(object.parseError.errorCode!=0){
continue TEST;
}
}
var doc=object.documentElement;
if(!doc){
continue TEST;
}
var _c1=object.selectSingleNode("root");
if(!_c1){
continue TEST;
}
var _c2=object.createElement("newnode");
if(!_c2){
continue TEST;
}
}
catch(e){
continue TEST;
}
_bd=_bf;
break;
}
return _bd;
};
PTXMLDocumentBuilder.init=function(){
if(PTBrowserInfo.IS_MSIE&&PTBrowserInfo.MSIE_VERSION>=5){
var _c3=PTXMLDocumentBuilder._getParserTypeMSIE();
if(_c3){
PTXMLDocumentBuilder.parserType=PTXMLDocumentBuilder.PARSER_TYPE_MSXML;
PTXMLDocumentBuilder.parserTypeMSIE=_c3;
return;
}
}
if(PTBrowserInfo.IS_MOZILLA&&window.DOMParser){
try{
(new DOMParser()).parseFromString(PTXMLDocumentBuilder._testXMLString,"text/xml");
PTXMLDocumentBuilder.parserType=PTXMLDocumentBuilder.PARSER_TYPE_MOZDP;
return;
}
catch(e){
}
}
PTXMLDocumentBuilder.parserType=PTXMLDocumentBuilder.PARSER_TYPE_PTXML;
};
PTXMLDocumentBuilder.init();
PTXMLDocumentBuilder._unescapeCDATAs=function(str){
var _c5=/&lt;!\[CDATA\[/g;
str=str.replace(_c5,"<![CDATA[");
var _c6=/\]\]&gt;/g;
str=str.replace(_c6,"]]>");
return str;
};
PTXMLDocumentBuilder._stripPreXML=function(str){
if(str.indexOf("<?xml")>-1){
return str.substr(str.indexOf("<?xml"));
}else{
return str;
}
};
PTXMLDocumentBuilder.createFromString=function(str){
str=PTXMLDocumentBuilder._stripPreXML(str);
str=PTXMLDocumentBuilder._unescapeCDATAs(str);
var doc;
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_MSXML){
if(str.indexOf("<?xml")==-1){
str="<?xml version=\"1.0\"?>\n"+str;
}
doc=new ActiveXObject(PTXMLDocumentBuilder.parserTypeMSIE);
doc.async=false;
doc.loadXML(str);
try{
doc.setProperty("NewParser",true);
}
catch(e){
}
while(doc.readyState!=4){
}
}else{
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_MOZDP){
var _ca=new DOMParser();
if(str.indexOf("<?xml")==-1){
str="<?xml version=\"1.0\"?>\n"+str;
}
try{
doc=_ca.parseFromString(str,"text/xml");
if(doc.documentElement.tagName=="parsererror"){
}
}
catch(e){
}
}else{
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_PTXML){
doc=PTXMLParser.parseFromString(str);
}
}
}
return new PTXMLDocument(doc);
};
PTXMLDocumentBuilder.createFromURI=function(uri){
var _cc=new PTHTTPGETRequest(uri,false,PTHTTPTransport.CCMODE_SYNC);
var _cd=_cc.invoke();
if(_cd&&_cd.responseXML){
return new PTXMLDocument(_cd.responseXML);
}else{
if(_cd&&_cd.responseText){
return PTXMLDocumentBuilder.createFromString(_cd.responseText);
}else{
}
}
};
PTXMLDocumentBuilder.create=function(){
var doc;
if(PTXMLDocumentBuilder.parserType==PTXMLDocumentBuilder.PARSER_TYPE_MSXML){
doc=new ActiveXObject(PTXMLDocumentBuilder.parserTypeMSIE);
}else{
if(document.implementation&&document.implementation.createDocument){
doc=document.implementation.createDocument("","",null);
}
}
return new PTXMLDocument(doc);
};
PTXMLParser=function(){
return this;
};
PTXMLParser.VERSION="214238";
PTXMLParser.parseFromString=function(str){
var doc;
if(document.implementation&&document.implementation.createDocument){
doc=document.implementation.createDocument("","",null);
}else{
return false;
}
var _d1=new _PTXMLParserFrag(doc);
_d1.str=PTXMLUtil.stripProlog(str);
PTXMLParser._recurseAndParse(_d1);
for(var i=0;i<_d1.childNodes.length;i++){
var _d3=_d1.childNodes[i];
if(_d3.nodeType==1){
doc.appendChild(_d3);
}
}
return doc;
};
_PTXMLParserFrag=function(_d4){
this.parentNode=_d4;
this.str=new String();
this.childNodes=new Array();
this.end=new String();
};
PTXMLParser._getDoc=function(_d5){
if(_d5.parentNode.nodeType==9){
return _d5.parentNode;
}else{
return _d5.parentNode.ownerDocument;
}
};
PTXMLParser._recurseAndParse=function(_d6){
while(1){
if(_d6.str.length==0){
return;
}
var _d7=_d6.str.indexOf("<");
if(_d7!=0){
var _d8=_d6.childNodes.length;
_d6.childNodes[_d8]=PTXMLParser._getDoc(_d6).createTextNode("");
if(_d7==-1){
_d6.childNodes[_d8].nodeValue=PTXMLUtil.unescapeEntities(_d6.str);
_d6.str="";
}else{
_d6.childNodes[_d8].nodeValue=PTXMLUtil.unescapeEntities(_d6.str.substring(0,_d7));
_d6.str=_d6.str.substring(_d7,_d6.str.length);
}
}else{
if(_d6.str.substring(1,2)=="?"){
PTXMLParser._processPI(_d6);
}else{
if(_d6.str.substring(1,4)=="!--"){
PTXMLParser._processComment(_d6);
}else{
if(_d6.str.substring(1,9)=="![CDATA["){
PTXMLParser._processCDATA(_d6);
}else{
if(_d6.str.substring(1,_d6.end.length+3)=="/"+_d6.end+">"||PTXMLUtil.stripWhitespace(_d6.str.substring(1,_d6.end.length+3))=="/"+_d6.end){
_d6.str=_d6.str.substring(_d6.end.length+3,_d6.str.length);
_d6.end="";
return;
}else{
PTXMLParser._processElement(_d6);
}
}
}
}
}
}
};
PTXMLParser._processElement=function(_d9){
var _da=_d9.str.indexOf(">");
var _db=(_d9.str.substring(_da-1,_da)=="/");
if(_db){
_da-=1;
}
var _dc=PTXMLUtil.normalizeWhitespace(_d9.str.substring(1,_da));
var _dd=_dc.indexOf(" ");
var _de=new String();
var _df=new String();
if(_dd!=-1){
_df=_dc.substring(0,_dd);
_de=_dc.substring(_dd+1,_dc.length);
}else{
_df=_dc;
}
var _e0=_d9.childNodes.length;
var _e1=PTXMLUtil.stripWhitespace(_df);
_d9.childNodes[_e0]=PTXMLParser._getDoc(_d9).createElement(_e1);
if(_de.length>0){
PTXMLParser._processAttributes(_d9.childNodes[_e0],_de);
}
if(!_db){
var _e2=new _PTXMLParserFrag(_d9.parentNode);
_e2.str=_d9.str.substring(_da+1,_d9.str.length);
_e2.end=_df;
PTXMLParser._recurseAndParse(_e2);
for(var i=0;i<_e2.childNodes.length;i++){
_d9.childNodes[_e0].appendChild(_e2.childNodes[i]);
}
_d9.str=_e2.str;
}else{
_d9.str=_d9.str.substring(_da+2,_d9.str.length);
}
};
PTXMLParser._processPI=function(_e4){
var _e5=_e4.str.indexOf("?>");
var val=_e4.str.substring(2,_e5);
var _e7=_e4.childNodes.length;
_e4.childNodes[_e7]=PTXMLParser._getDoc(_e4).createProcessingInstruction();
_e4.childNodes[_e7].nodeValue=val;
_e4.str=_e4.str.substring(_e5+2,_e4.str.length);
};
PTXMLParser._processComment=function(_e8){
var _e9=_e8.str.indexOf("-->");
var val=_e8.str.substring(4,_e9);
var _eb=_e8.childNodes.length;
_e8.childNodes[_eb]=PTXMLParser._getDoc(_e8).createComment();
_e8.childNodes[_eb].nodeValue=val;
_e8.str=_e8.str.substring(_e9+3,_e8.str.length);
};
PTXMLParser._processCDATA=function(_ec){
var _ed=_ec.str.indexOf("]]>");
var val=_ec.str.substring(9,_ed);
var _ef=_ec.childNodes.length;
_ec.childNodes[_ef]=PTXMLParser._getDoc(_ec).createCDATASection();
_ec.childNodes[_ef].nodeValue=val;
_ec.str=_ec.str.substring(_ed+3,_ec.str.length);
};
PTXMLParser._processAttributes=function(_f0,str){
while(1){
var eq=str.indexOf("=");
if(str.length==0||eq==-1){
return;
}
var id1=str.indexOf("'");
var id2=str.indexOf("\"");
var ids=new Number();
var id=new String();
if((id1<id2&&id1!=-1)||id2==-1){
ids=id1;
id="'";
}
if((id2<id1||id1==-1)&&id2!=-1){
ids=id2;
id="\"";
}
var _f7=str.indexOf(id,ids+1);
var val=str.substring(ids+1,_f7);
var _f9=PTXMLUtil.stripWhitespace(str.substring(0,eq));
_f0.setAttribute(_f9,val);
str=str.substring(_f7+1,str.length);
}
};
PTXMLUtil=function(){
};
PTXMLUtil.VERSION="214238";
PTXMLUtil.stripProlog=function(str){
var a=new Array();
a=str.split("\r\n");
str=a.join("\n");
a=str.split("\r");
str=a.join("\n");
var _fc=str.indexOf("<");
if(str.substring(_fc,_fc+3)=="<?x"||str.substring(_fc,_fc+3)=="<?X"){
var _fd=str.indexOf("?>");
str=str.substring(_fd+2,str.length);
}
var _fc=str.indexOf("<!DOCTYPE");
if(_fc!=-1){
var _fd=str.indexOf(">",_fc)+1;
var dp=str.indexOf("[",_fc);
if(dp<_fd&&dp!=-1){
_fd=str.indexOf("]>",_fc)+2;
}
str=str.substring(_fd,str.length);
}
return str;
};
PTXMLUtil.stripWhitespace=function(str){
var a=new Array();
a=str.split("\n");
str=a.join("");
a=str.split(" ");
str=a.join("");
a=str.split("\t");
str=a.join("");
return str;
};
PTXMLUtil.normalizeWhitespace=function(str){
var a=new Array();
a=str.split("\n");
str=a.join(" ");
a=str.split("\t");
str=a.join(" ");
return str;
};
PTXMLUtil.unescapeEntities=function(str){
var a=new Array();
a=str.split("&lt;");
str=a.join("<");
a=str.split("&gt;");
str=a.join(">");
a=str.split("&quot;");
str=a.join("\"");
a=str.split("&apos;");
str=a.join("'");
a=str.split("&amp;");
str=a.join("&");
return str;
};
PTXMLUtil.unescapeCDATAs=function(str){
var _106=/&lt;!\[CDATA\[/g;
str=str.replace(_106,"<![CDATA[");
var _107=/\]\]&gt;/g;
str=str.replace(_107,"]]>");
return str;
};
PTXMLUtil.stripPreXML=function(str){
if(str.indexOf("<?xml")>-1){
return str.substr(str.indexOf("<?xml"));
}else{
return str;
}
};
PTXMLWrapper=function(){
this.parser="PTXML";
this.parserString="";
this.uidIndex=1;
return this;
};
PTXMLWrapper.VERSION="214238";
PTXMLWrapper.NODE_ELEMENT=1;
PTXMLWrapper.NODE_ATTRIBUTE=2;
PTXMLWrapper.NODE_TEXT=3;
PTXMLWrapper.NODE_CDATA_SECTION=4;
PTXMLWrapper.NODE_ENTITY_REFERENCE=5;
PTXMLWrapper.NODE_ENTITY=6;
PTXMLWrapper.NODE_PROCESSING_INSTRUCTION=7;
PTXMLWrapper.NODE_COMMENT=8;
PTXMLWrapper.NODE_DOCUMENT=9;
PTXMLWrapper.NODE_DOCUMENT_TYPE=10;
PTXMLWrapper.NODE_DOCUMENT_FRAGMENT=11;
PTXMLWrapper.NODE_NOTATION=12;
PTXMLWrapper.unescapeCDATAs=function(str){
var _10a=/&lt;!\[CDATA\[/g;
str=str.replace(_10a,"<![CDATA[");
var _10b=/\]\]&gt;/g;
str=str.replace(_10b,"]]>");
return str;
};
PTXMLWrapper.stripPreXML=function(str){
if(str.indexOf("<?xml")>-1){
return str.substr(str.indexOf("<?xml"));
}else{
return str;
}
};
PTXMLWrapper.prototype.defaultPreferredParsers=new Array("MSXML","NS6","PTXML");
PTXMLWrapper.prototype.xmlTestString="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<pts:cjb xmlns:pts=\"http://pts.plumtree.com/\">Blah</pts:cjb>\n";
PTXMLWrapper.prototype.init=function(pref,_10e,_10f){
if(!pref){
pref=this.defaultPreferredParsers;
}
var ua=new String(navigator.userAgent);
PARSER:
for(var p=0;p<pref.length;p++){
var _112=pref[p];
if(_112=="MSXML"){
var _113=this.checkMSIEParsers(_10e,_10f);
if(_113){
this.parser="MSXML";
break;
}else{
continue;
}
}else{
if(_112=="NS6"){
try{
var DP=new DOMParser();
var xml=DP.parseFromString(this.xmlTestString,"text/xml");
this.parser="NS6";
break PARSER;
}
catch(e){
continue;
}
}else{
if(_112=="PTXML"){
this.parser="PTXML";
break PARSER;
}
}
}
}
var brk="";
if(this.parser=="MSXML"){
this.getNodeValue=_ptxmlw_getNodeValue_MSXML;
this.getNodeName=_ptxmlw_getNodeName_MSXML_NS6;
this.getAttribute=_ptxmlw_getAttribute_MSXML_PTXML;
}else{
if(this.parser=="NS6"){
this.getNodeValue=_ptxmlw_getNodeValue_NS6;
this.getNodeName=_ptxmlw_getNodeName_MSXML_NS6;
this.getAttribute=_ptxmlw_getAttribute_Other;
}else{
if(this.parser=="PTXML"){
this.getNodeValue=_ptxmlw_getNodeValue_Other;
this.getNodeName=_ptxmlw_getNodeName_Other;
this.getAttribute=_ptxmlw_getAttribute_MSXML_PTXML;
}
}
}
};
PTXMLWrapper.prototype.checkMSIEParsers=function(_117,_118){
var _119=(_117)?"":" encoding=\"UTF-8\"";
var xml="<?xml version=\"1.0\""+_119+"?>\n<root>Test Text.</root>\n";
var _11b="<?xml version=\"1.0\""+_119+"?>\n<ns:root xmlns:ns=\"http://pts.plumtree.com/\">Namespace Test Text.</ns:root>\n";
var xsl="<?xml version=\"1.0\""+_119+"?><xsl:stylesheet version=\"1.0\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\"><xsl:template match=\"pagina\"><xsl:processing-instruction name=\"cocoon-format\">type=\"text/html\"</xsl:processing-instruction><html><head><title><xsl:value-of select=\"titulus\"/></title></head> <body bgcolor=\"#ffffff\"> <xsl:apply-templates/> </body> </html> </xsl:template><xsl:template match=\"titulus\"><h1 align=\"center\"><font color=\"darkgreen\"><xsl:apply-templates/></font></h1></xsl:template><xsl:template match=\"auctor\"><h1 align=\"center\"><xsl:apply-templates/></h1> </xsl:template><xsl:template match=\"versus\"><p align=\"center\"><tt><xsl:apply-templates/></tt> </p></xsl:template></xsl:stylesheet>";
var _11d=new Array("MSXML2.DOMDocument.4.0","MSXML2.DOMDocument.3.0","MSXML2.DOMDocument.2.6","MSXML2.DOMDocument","MSXML.DOMDocument","Microsoft.XMLDOM");
var _11e=false;
TEST:
for(var p=0;p<_11d.length;p++){
var _120=_11d[p];
try{
object=new ActiveXObject(_120);
object.async=false;
object.loadXML(xml);
while(object.readyState!=4){
if(object.parseError.errorCode!=0){
continue TEST;
}
}
var doc=object.documentElement;
if(!doc){
continue TEST;
}
var _122=object.selectSingleNode("root");
if(!_122){
continue TEST;
}
var _123=object.createElement("newnode");
if(!_123){
continue TEST;
}
if(!_117){
var _124=new ActiveXObject(_120);
_124.async=false;
_124.loadXML(_11b);
if(!_124){
continue TEST;
}
var _125=_124.selectSingleNode("ns:root");
if(!_125){
continue TEST;
}
}
if(_118){
var _126=new ActiveXObject(_120);
_126.async=false;
_126.loadXML(xsl);
if(!_126){
continue TEST;
}
var _127=object.transformNode(_126);
if(!_127){
continue TEST;
}
}
}
catch(e){
continue TEST;
}
_11e=true;
this.parserString=_120;
break;
}
return _11e;
};
PTXMLWrapper.prototype.newXMLFromString=function(str){
str=PTXMLWrapper.stripPreXML(str);
str=PTXMLWrapper.unescapeCDATAs(str);
var _129;
if(this.parser=="MSXML"){
if(str.indexOf("<?xml")==-1){
str="<?xml version=\"1.0\"?>\n"+str;
}
_129=new ActiveXObject(this.parserString);
_129.async=false;
_129.loadXML(str);
try{
_129.setProperty("NewParser",true);
}
catch(e){
}
while(_129.readyState!=4){
}
}else{
if(this.parser=="NS6"){
var DP=new DOMParser();
if(str.indexOf("<?xml")==-1){
str="<?xml version=\"1.0\"?>\n"+str;
}
try{
_129=DP.parseFromString(str,"text/xml");
parserErrorNode=this.selectSingleNode(_129,"parsererror");
if(parserErrorNode){
}
}
catch(e){
}
}else{
if(this.parser=="PTXML"){
_129=new PTXMLParser(str);
}
}
}
while(!_129){
var _12b=new Date().valueOf();
while((new Date().valueOf()-_12b)<1000){
}
}
return _129;
};
PTXMLWrapper.prototype.createNode=function(node,name,val){
if((this.parser=="MSXML")||(this.parser=="NS6")){
var _12f=node.ownerDocument.createElement(name);
if(val||(val==0)||(val==false)){
_12f.text=new String(val);
}
node.appendChild(_12f);
return _12f;
}else{
var _12f=node.createNode(name,val);
return _12f;
}
};
PTXMLWrapper.prototype.cloneNode=function(node){
if((this.parser=="MSXML")||(this.parser=="NS6")){
var _131=node.cloneNode(true);
if(node.parentNode){
node.parentNode.appendChild(_131);
}else{
node.ownerDocument.documentElement.appendChild(_131);
}
_131=this.createNewNodeUIDs(_131);
return _131;
}else{
return node.parentNode.cloneNode(node);
}
};
PTXMLWrapper.prototype.createNewNodeUIDs=function(node){
if(!node){
return;
}
var node=this.recurseAndCreateNewNodeUIDs(node);
return node;
};
PTXMLWrapper.prototype.recurseAndCreateNewNodeUIDs=function(node){
node.removeAttribute("uid");
this.getUID(node);
if(node&&node.childNodes&&node.childNodes.length){
for(var i=0;i<node.childNodes.length;i++){
try{
var itm=node.childNodes.item(i);
itm.removeAttribute("uid");
this.getUID(node.childNodes.item(i));
node.replaceChild(this.recurseAndCreateNewNodeUIDs(node.childNodes.item(i)),node.childNodes.item(i));
}
catch(e){
}
}
}
return node;
};
PTXMLWrapper.prototype.deleteNode=function(node){
if((this.parser=="MSXML")||(this.parser=="NS6")){
if(node.parentNode){
node.parentNode.removeChild(node);
}else{
delete node;
}
}else{
node.deleteNode();
}
};
PTXMLWrapper.prototype.selectSingleNode=function(node,val){
if((this.parser=="MSXML")||(this.parser=="PTXML")){
return node.selectSingleNode(val);
}else{
if(this.parser=="NS6"){
var _139=node.childNodes;
if(_139){
var len=_139.length;
for(var n=0;n<len;n++){
var cn=_139.item(n);
if(cn.nodeName==val){
return _139.item(n);
}
}
}
}
}
};
PTXMLWrapper.prototype.getElementsByTagName=function(node,_13e){
if(this.parser=="PTXML"){
return node.selectNodes(_13e);
}else{
return node.getElementsByTagName(_13e);
}
};
PTXMLWrapper.prototype.getNodeValue=function(node){
if(this.parser=="MSXML"){
var v=node.nodeValue;
if(v){
return v;
}else{
if(node.text){
return node.text;
}else{
return "";
}
}
}else{
if(this.parser=="NS6"){
var v="";
if(node.firstChild){
v=node.firstChild.nodeValue;
}
return v;
}else{
if(node.getNodeValue){
return node.getNodeValue();
}else{
return node.value;
}
}
}
};
_ptxmlw_getNodeValue_MSXML=function(node){
var v=node.nodeValue;
if(v){
return v;
}else{
if(node.text){
return node.text;
}else{
return "";
}
}
};
_ptxmlw_getNodeValue_NS6=function(node){
var v="";
if(node.childNodes&&node.childNodes[1]&&(node.childNodes[1].nodeType==PTXMLWrapper.NODE_CDATA_SECTION)){
return node.childNodes[1].nodeValue;
}
if(node.firstChild){
v=node.firstChild.nodeValue;
}
return v;
};
_ptxmlw_getNodeValue_Other=function(node){
if(node.getNodeValue){
return node.getNodeValue();
}else{
return node.value;
}
};
PTXMLWrapper.prototype.setNodeValue=function(node,val){
if((this.parser=="MSXML")||(this.parser=="NS6")){
node.text=new String(val);
}else{
node.setNodeValue(val);
}
};
PTXMLWrapper.prototype.getNodeName=function(node){
if((this.parser=="MSXML")||(this.parser=="NS6")){
return node.nodeName;
}else{
return node.name;
}
};
_ptxmlw_getNodeName_MSXML_NS6=function(node){
return node.nodeName;
};
_ptxmlw_getNodeName_Other=function(node){
return node.name;
};
PTXMLWrapper.prototype.getAttribute=function(node,val){
if((this.parser=="MSXML")||(this.parser=="PTXML")){
return node.getAttribute(val);
}else{
if(!node){
return;
}
var ni=node.attributes.getNamedItem(val);
if(ni){
return ni.nodeValue;
}
}
};
_ptxmlw_getAttribute_MSXML_PTXML=function(node,val){
return node.getAttribute(val);
};
_ptxmlw_getAttribute_Other=function(node,val){
if(!node){
return;
}
var ni=node.attributes.getNamedItem(val);
if(ni){
return ni.nodeValue;
}
};
PTXMLWrapper.prototype.getUID=function(node){
if((this.parser=="MSXML")||(this.parser=="NS6")){
var _154=this.getAttribute(node,"uid");
if(_154){
return _154;
}else{
var _155=this.uidIndex++;
node.setAttribute("uid",_155);
return _155;
}
}else{
return node.uid;
}
};
PTXMLWrapper.prototype.getNodeByUID=function(uid,node){
if(!node){
return;
}
var node=this.recurseAndFindNodeByUID(node,uid);
return node;
};
PTXMLWrapper.prototype.recurseAndFindNodeByUID=function(node,uid){
if(!node||!node.childNodes||!node.childNodes.length){
return;
}
var _15a;
for(var i=0;i<node.childNodes.length;i++){
if((this.parser=="MSXML")||(this.parser=="NS6")){
var itm=node.childNodes.item(i);
if(itm.nodeTypeString=="element"){
if(parseInt(this.getAttribute(itm,"uid"))==parseInt(uid)){
_15a=itm;
return itm;
}
_15a=this.recurseAndFindNodeByUID(itm,uid);
if(_15a){
return _15a;
}
}
}else{
var itm=node.childNodes[i];
if(!itm){
continue;
}
if(itm.nodeTypeString=="element"){
if(parseInt(itm.uid)==parseInt(uid)){
_15a=itm;
return itm;
}
_15a=this.recurseAndFindNodeByUID(itm,uid);
if(_15a){
return _15a;
}
}
}
}
return _15a;
};
PTXMLWrapper.prototype.genXML=function(_15d){
if(this.parser=="MSXML"){
return _15d.xml;
}else{
if(this.parser=="NS6"){
return (new XMLSerializer()).serializeToString(_15d);
}else{
return _15d.genXML();
}
}
};
PTXMLWrapper.prototype.deleteNodeByUID=function(_15e,uid){
var root;
if((this.parser=="MSXML")||(this.parser=="NS6")){
root=_15e.documentElement;
}else{
root=_15e;
}
var node=this.getNodeByUID(uid,root);
if(node){
this.deleteNode(node);
}
};
var XMLW=new PTXMLWrapper();

