if(!window.oc.controls){
window.oc.controls={};
}
if(!window.oc.controls.form){
window.oc.controls.form={};
}
oc.controls.form.SuggestionInput=function(_1,_2,_3){
this.uid=_1;
this.inputId=_2;
this.platform=_3;
this.textId=_2+"Text";
this.listId=_2+"List";
this.selIndex=-1;
this.suggestions=[];
this.hidden=true;
this.ignoreClose=false;
oc.PopupRegistry[this.uid]=this;
this.open=function(){
var _4=document.getElementById(this.inputId);
if(this.hidden&&(this.suggestions.length>0)){
var _5=document.getElementById(this.listId);
this.selIndex=0;
_5.style.display="block";
if(_4.offsetWidth){
_5.style.width=(_4.offsetWidth-2)+"px";
}
var x=oc.common.getElementLeft(_4);
var y=oc.common.getElementTop(_4)+_4.offsetHeight;
_5.style.left=x+"px";
_5.style.top=y+"px";
this.hoverItem(0);
this.hidden=false;
if(document.all&&(navigator.appVersion.indexOf("MSIE 7.0")==-1)){
this.hiddenSelects=oc.common.hideSelects(document.body);
}
}
};
this.close=function(_8){
if(!this.hidden&&!this.ignoreClose){
var _9=document.getElementById(this.listId);
for(var i=0;i<this.suggestions.length;i++){
this.exitItem(i);
}
this.selIndex=-1;
this.hidden=true;
_9.style.display="none";
if(document.all&&(navigator.appVersion.indexOf("MSIE 7.0")==-1)){
oc.common.showSelects(this.hiddenSelects);
}
}
};
this.selectItem=function(_b){
var _c=document.getElementById(this.inputId);
_c.value=this.suggestions[_b];
this.selIndex=-1;
this.close();
var _d="&"+this.uid+"="+_c.value+"&activate=true";
oc.ajax[this.platform].doCallback(_c,this.uid,false,false,_d);
return false;
};
this.hoverItem=function(_e){
if(_e!=this.selIndex){
this.exitItem(this.selIndex);
}
var _f=document.getElementById(this.listId);
var _10=_f.getElementsByTagName("div");
if(_10&&(_10.length>_e)){
_10[_e].style.backgroundColor="#000099";
_10[_e].style.color="white";
this.selIndex=_e;
}
};
this.exitItem=function(_11){
var div=document.getElementById(this.listId);
var _13=div.getElementsByTagName("div");
if(_13&&(_13.length>_11)){
_13[_11].style.backgroundColor="white";
_13[_11].style.color="black";
}
};
this.keyDown=function(evt){
this.ignoreClose=true;
evt=(evt)?evt:window.event;
var _15=(evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0);
if(this.suggestions.length>0){
if((_15==13)&&(this.selIndex!=-1)){
if(this.hidden){
this.ignoreClose=false;
return true;
}else{
this.ignoreClose=false;
this.selectItem(this.selIndex);
return false;
}
}
if(_15==40){
if(this.hidden){
this.open();
}
var idx=((this.selIndex+1)<this.suggestions.length)?this.selIndex+1:0;
this.hoverItem(idx);
this.ignoreClose=false;
return false;
}else{
if(_15==38){
if(this.hidden){
this.open();
}
var idx=(this.selIndex>0)?this.selIndex-1:this.suggestions.length-1;
this.hoverItem(idx);
this.ignoreClose=false;
return false;
}
}
}
this.ignoreClose=false;
return true;
};
this.keyUp=function(evt){
evt=(evt)?evt:window.event;
var _18=(evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0);
if((_18==13)||(_18==40)||(_18==38)){
return false;
}
if(_18==27){
this.close();
return true;
}
var _19=document.getElementById(this.inputId);
oc.ajax[this.platform].doLightweightCallback(_19,this.uid);
return true;
};
this.refresh=function(){
var div=document.getElementById(this.listId);
var _1b=document.getElementById(this.inputId).style.fontSize;
if(this.suggestions.length==0){
div.innerHTML="";
if(this.selIndex>=0){
this.exitItem(this.selIndex);
}
this.selIndex=-1;
if(!this.hidden){
this.close(true);
}
}else{
var sb="";
var obj="oc.Page['"+this.inputId+"']";
for(var i=0;i<this.suggestions.length;i++){
sb+="<a href=\"#\" onclick=\"return false\" style=\"text-decoration:none;color:#000000\">";
sb+="<div class=\"SuggestionInput-Item\" onmousedown=\""+obj+".selectItem("+i+")\"";
sb+=((document.all)?" onselectstart=\"return false;\"":" unselectable=\"yes\"");
sb+=((_1b)?" style=\"font-size:"+_1b+"\"":"");
sb+=" onmouseover=\""+obj+".hoverItem("+i+")\">"+this.suggestions[i]+"</div>";
sb+="</a>\n";
}
div.innerHTML=sb;
this.selIndex=0;
this.hoverItem(0);
if(this.hidden){
this.open();
}
}
};
};
oc.controls.form.DatePicker=function(_1f,_20,_21,_22,_23,_24,_25){
this.uid=_1f;
this.inputId=_20;
this.platform=_21;
this.monthSelectId=_20+"MonthSelect";
this.yearSelectId=_20+"YearSelect";
this.hourSelectId=_20+"HourSelect";
this.minuteSelectId=_20+"MinuteSelect";
this.ampmSelectId=_20+"AMPMSelect";
this.clickableId=_20+"Clickable";
this.calendarId=_20+"Calendar";
this.buttonId=_20+"Button";
this.currDate=_22;
this.dispDate=_22;
this.hidden=true;
this.displayTop=_23;
this.displayLeft=_24;
this.isPopup=(_25)?true:false;
var btn=document.getElementById(this.buttonId);
if(btn){
this.btnUpImg=btn.src;
}
if(this.isPopup){
oc.PopupRegistry[this.uid]=this;
}
this.setDisplayFromDate=function(_27,_28){
if(!_27){
return false;
}else{
var _29=this.getInput();
this.rollbackInput=_29.value;
var _2a=this.getTextBox();
if(_2a){
this.rollbackText=this.getTextBox().value;
}
this.currDate=_27;
this.dispDate=_27;
_29.value=(this.currDate)?this.currDate.getTime():"";
if(!_28){
this.refreshCalendar(this.dispDate,true);
}
return true;
}
};
this.clearDay=function(){
this.getInput().value="";
this.getTextBox().value="";
this.currDate=new Date();
this.dispDate=this.currDate;
this.refreshCalendar(this.dispDate);
};
this.rollbackDate=function(){
var _2b=this.getTextBox();
if(_2b){
_2b.value=this.rollbackText;
}
if(this.rollbackInput){
setDate(new Date(parseInt(this.rollbackInput)));
}
};
this.refreshCalendar=function(_2c,_2d){
var _2e=this.getInput();
var _2f="&refreshdate="+_2c.getTime();
if(_2d){
_2f+="&refreshtext=true";
}
if(this.currDate){
_2f+="&currdate="+this.currDate.getTime();
}
oc.ajax[this.platform].doLightweightCallback(_2e,this.uid,false,false,_2f);
if(_2d){
this.close(true);
}
};
this.changeText=function(){
var _30=this.getInput();
var _31=this.getTextBox();
var _32="&refreshtext="+_31.value;
if(this.currDate){
_32+="&currdate="+this.currDate.getTime();
}
oc.ajax[this.platform].doLightweightCallback(_30,this.uid,false,false,_32);
};
this.setDate=function(_33){
this.currDate=_33;
this.dispDate=_33;
this.rollbackInput=_33.getTime();
};
this.focus=function(){
var _34=this.getTextBox();
if(_34){
this.getTextBox().focus();
}
};
this.changeDay=function(day){
var m=this.dispDate.getMonth();
var y=this.dispDate.getFullYear();
if(day<0){
day=Math.abs(day);
if(m==0){
m=11;
y--;
}else{
m-=1;
}
}else{
if(day>100){
day-=100;
if(m==11){
m=0;
y++;
}else{
m+=1;
}
}
}
var _38=new Date(y,m,day);
_38.setHours(this.dispDate.getHours());
_38.setMinutes(this.dispDate.getMinutes());
_38.setSeconds(0);
_38.setMilliseconds(0);
this.setDisplayFromDate(_38);
};
this.getInput=function(){
return document.getElementById(this.inputId);
};
this.getTextBox=function(){
return document.getElementById(this.inputId+"Text");
};
this.hidePopups=function(evt){
oc.hidePopups(this);
};
this.open=function(){
if(!this.isPopup){
return;
}
oc.hidePopups(this);
if(window.event){
window.event.cancelBubble=true;
}
if(document.all){
oc._bodyOnClick=document.body.onclick;
document.body.onclick=oc.hidePopups;
oc._bodyOnContextMenu=document.body.oncontextmenu;
document.body.oncontextmenu=oc.hidePopups;
}
if(!this.hidden){
this.close(true);
}else{
var div=document.getElementById(this.calendarId);
var _3b=document.getElementById(this.clickableId);
var x=oc.common.getElementLeft(_3b);
if(this.displayLeft){
x+=_3b.offsetWidth-194;
}
var y=oc.common.getElementTop(_3b);
if(this.displayTop){
y-=((document.all)?132:138);
}else{
y+=_3b.offsetHeight+((document.all)?1:3);
}
div.style.display="block";
div.style.left=x+"px";
div.style.top=y+"px";
this.hidden=false;
if(document.all&&(navigator.appVersion.indexOf("MSIE 7.0")==-1)){
var _3e=[document.getElementById(this.yearSelectId),document.getElementById(this.monthSelectId)];
this.hiddenSelects=oc.common.hideSelects(document.body,_3e);
}
}
};
this.close=function(_3f){
if(!this.isPopup){
return;
}
var div=document.getElementById(this.calendarId);
div.style.display="none";
this.hidden=true;
if(this.btnUpImg){
this.swapImg(this.btnUpImg,"up");
}
if(document.all){
if(oc._bodyOnClick){
document.body.onclick=oc._bodyOnClick;
}
oc._bodyOnClick=false;
if(oc._bodyOnContextMenu){
document.body.oncontextmenu=oc._bodyOnContextMenu;
}
oc._bodyOnContextMenu=false;
}
if(this.refreshTime){
this.changeTime();
this.refreshTime=false;
}
if(document.all&&(navigator.appVersion.indexOf("MSIE 7.0")==-1)){
oc.common.showSelects(this.hiddenSelects);
}
};
this.prevMonth=function(){
var m=this.dispDate.getMonth();
var y=this.dispDate.getFullYear();
if(m==0){
m=11;
y-=1;
}else{
m-=1;
}
var _43=new Date(y,m,1,this.dispDate.getHours(),this.dispDate.getMinutes());
this.refreshCalendar(_43);
this.dispDate=_43;
};
this.nextMonth=function(){
var m=this.dispDate.getMonth();
var y=this.dispDate.getFullYear();
if(m==11){
m=0;
y+=1;
}else{
m+=1;
}
var _46=new Date(y,m,1,this.dispDate.getHours(),this.dispDate.getMinutes());
this.refreshCalendar(_46);
this.dispDate=_46;
};
this.changeMonth=function(){
var sel=document.getElementById(this.monthSelectId);
var _48=sel.selectedIndex;
var _49=this.currDate.getDate();
if(_49>oc.controls.form.DatePicker.DaysInMonth[_48]){
_49=oc.controls.form.DatePicker.DaysInMonth[_48];
}
var _4a=new Date(this.dispDate.getFullYear(),_48,_49,this.dispDate.getHours(),this.dispDate.getMinutes());
this.refreshCalendar(_4a);
this.dispDate=_4a;
};
this.changeYear=function(){
var sel=document.getElementById(this.yearSelectId);
var _4c=parseInt(sel.options[sel.selectedIndex].value);
var _4d=this.currDate.getDate();
if((this.currDate.getMonth()==1)&&(_4d==29)){
_4d=28;
}
var _4e=new Date(_4c,this.dispDate.getMonth(),_4d,this.dispDate.getHours(),this.dispDate.getMinutes());
this.refreshCalendar(_4e);
this.dispDate=_4e;
};
this.changeTime=function(){
var _4f=document.getElementById(this.hourSelectId);
if(!_4f){
return;
}
var _50=document.getElementById(this.ampmSelectId);
var _51=document.getElementById(this.minuteSelectId);
var _52=parseInt(_4f.options[_4f.selectedIndex].value);
var _53=(_51)?parseInt(_51.options[_51.selectedIndex].value):0;
if(_50){
_52+=12*parseInt(_50.options[_50.selectedIndex].value);
}
var dt=new Date(this.dispDate.getFullYear(),this.dispDate.getMonth(),this.dispDate.getDate(),_52,_53);
this.setDisplayFromDate(dt,true);
var _55=this.getInput();
var _56="&refreshtime="+dt.getTime()+"&refreshtext=true";
if(this.currDate){
_56+="&currdate="+this.currDate.getTime();
}
oc.ajax[this.platform].doLightweightCallback(_55,this.uid,false,false,_56);
};
this.swapImg=function(_57,evt){
if(evt&&!this.hidden&&("down"!=evt)){
return;
}
var btn=document.getElementById(this.buttonId);
if(btn){
btn.src=_57;
}
};
};
oc.controls.form.DatePicker.DaysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];
oc.controls.form.Slider=function(_5a,_5b,_5c,_5d,_5e,min,max,_61,_62,_63){
this.uid=_5a;
this.inputId=_5b;
this.platform=_5c;
this.vertical=_5d;
this.sliderStyle=_61;
this.amount=_5e;
this.min=min;
this.max=max;
this.format=_62;
this.onslide=_63;
this.handle=document.getElementById(this.inputId+"_Handle");
this.overlay=document.getElementById(this.inputId+"_Overlay");
this.slider=document.getElementById(this.inputId+"_Slider");
this.minGroove=document.getElementById(this.inputId+"_MinGroove");
this.groove=document.getElementById(this.inputId+"_Groove");
this.alive=false;
this.init=function(){
this.handleXOffset=(this.sliderStyle.toLowerCase()=="scrollbar")?0:Math.round(parseInt(this.handle.offsetWidth)/2);
this.handleYOffset=(this.sliderStyle.toLowerCase()=="scrollbar")?0:Math.round(parseInt(this.handle.offsetHeight)/2);
var _64=(this.amount-this.min)/(this.max-this.min);
var _65=oc.common.getElementLeft(this.groove);
var top=oc.common.getElementTop(this.groove);
if(this.vertical){
var _67=(this.sliderStyle=="scrollbar")?(parseInt(this.handle.offsetHeight)+2):0;
var y=parseInt((this.groove.offsetHeight-_67)*(1-_64))+parseInt(top)-this.handleYOffset;
var x=parseInt(_65);
if(this.sliderStyle.toLowerCase()=="scrollbar"){
this.handle.style.top=y+1;
this.handle.style.left=x+1;
}else{
if(this.sliderStyle.toLowerCase()=="volume"){
this.handle.style.top=y;
this.handle.style.left=x;
}else{
this.handle.style.top=y;
this.handle.style.left=Math.round(x-1-((parseInt(this.handle.offsetWidth)-parseInt(this.groove.offsetWidth))/2));
}
}
}else{
var _67=(this.sliderStyle=="scrollbar")?(parseInt(this.handle.offsetWidth)+2):0;
var x=parseInt((this.groove.offsetWidth-_67)*_64)+parseInt(_65)-this.handleXOffset;
var y=parseInt(top);
if(this.sliderStyle.toLowerCase()=="scrollbar"){
this.handle.style.top=y+1;
this.handle.style.left=x+1;
}else{
if(this.sliderStyle.toLowerCase()=="volume"){
this.handle.style.top=y+parseInt(this.groove.offsetHeight)-parseInt(this.handle.offsetHeight);
this.handle.style.left=x;
}else{
this.handle.style.top=Math.round(y-1-((parseInt(this.handle.offsetHeight)-parseInt(this.groove.offsetHeight))/2));
this.handle.style.left=x;
}
}
}
var _6a=(this.vertical)?parseInt(oc.common.getElementTop(this.slider)):parseInt(oc.common.getElementTop(this.handle));
var _6b=(this.vertical)?parseInt(oc.common.getElementLeft(this.handle)):parseInt(oc.common.getElementLeft(this.slider));
var _6c=(this.vertical)?parseInt(this.slider.offsetHeight):parseInt(this.handle.offsetHeight);
var _6d=(this.vertical)?parseInt(this.handle.offsetWidth):parseInt(this.slider.offsetWidth);
_6a-=(this.vertical)?this.handleYOffset:5;
_6b-=(this.vertical)?5:this.handleXOffset;
_6c+=(this.vertical)?(2*this.handleYOffset):10;
_6d+=(this.vertical)?10:(2*this.handleXOffset);
this.overlay.style.top=_6a;
this.overlay.style.left=_6b;
this.overlay.style.height=_6c;
this.overlay.style.width=_6d;
this.handle.style.visibility="visible";
if(this.onslide){
eval(this.onslide+"("+this.amount+")");
}
};
this.getMinPosition=function(){
var val=0;
if(this.vertical){
val=parseInt(oc.common.getElementTop(this.groove));
}else{
val=parseInt(oc.common.getElementLeft(this.groove));
}
if(this.sliderStyle.toLowerCase()=="scrollbar"){
val+=1;
}
return val;
};
this.getMaxPosition=function(){
var val=0;
if(this.vertical){
val=parseInt(oc.common.getElementTop(this.groove))+this.groove.offsetHeight;
if(this.sliderStyle.toLowerCase()=="scrollbar"){
val-=this.handle.offsetHeight+1;
}
}else{
val=parseInt(oc.common.getElementLeft(this.groove))+this.groove.offsetWidth;
if(this.sliderStyle.toLowerCase()=="scrollbar"){
val-=this.handle.offsetWidth+1;
}
}
return val;
};
this.textChange=function(evt){
var _71=document.getElementById(this.inputId+"_Text");
var txt=_71.value;
if(!txt){
txt="0";
}
txt=txt.replace(/[^0-9\.\-]/,"");
var _73=0;
if(this.format=="integer"){
_73=parseInt(txt);
var _74=false;
if(_73<this.min){
_73=parseInt(this.min);
tnewStr=_73;
}else{
if(_73>this.max){
_73=parseInt(this.max);
_74=_73;
}
}
if(_74){
_71.value=_74;
}
document.getElementById(this.inputId).value=_73;
}else{
_73=parseFloat(txt);
if(this.format=="percent"){
_73=_73/100;
}
var _75=false;
if(_73<this.min){
_73=this.min;
_75=true;
}else{
if(_73>this.max){
_73=this.max;
_75=true;
}
}
if(_75){
if(this.format=="percent"){
_71.value=parseInt(_73*100)+"%";
}else{
var s=Math.round(_73*100)/100;
s=""+s;
var idx=s.indexOf(".");
if(idx==-1){
s+=".00";
}else{
if(idx==(s.length-2)){
_73+="0";
}
}
if(idx==0){
s="0"+s;
}
_71.value=s;
}
}
document.getElementById(this.inputId).value=_73;
}
this.amount=_73;
this.init();
};
this.startSlide=function(evt){
evt=(evt)?evt:window.event;
oc.common.addEventPositioning(evt);
var x=evt.documentX;
var y=evt.documentY;
var _7b=parseInt(oc.common.getElementLeft(this.handle));
var top=parseInt(oc.common.getElementTop(this.handle));
this.alive=true;
if((x>=_7b)&&(x<=(_7b+this.handle.offsetWidth))&&(y>=top)&&(y<=(top+this.handle.offsetHeight))){
this.dragOffset=parseInt((this.vertical)?y:x);
this.dragOffset-=parseInt((this.vertical)?oc.common.getElementTop(this.handle):oc.common.getElementLeft(this.handle));
}else{
if(this.vertical){
this.dragOffset=Math.round(parseInt(this.handle.offsetHeight)/2);
}else{
this.dragOffset=Math.round(parseInt(this.handle.offsetWidth)/2);
}
this.slide(evt);
}
};
this.slide=function(evt){
if(!this.alive){
return;
}
if(this.processing){
return;
}
this.processing=true;
evt=(evt)?evt:window.event;
oc.common.(evt);
var min=this.getMinPosition();
var max=this.getMaxPosition();
var _80=parseInt((this.vertical)?evt.documentY:evt.documentX);
var amt=_80-this.dragOffset+((this.vertical)?this.handleYOffset:this.handleXOffset);
if(amt<min){
amt=min;
_80=min+this.dragOffset-((this.vertical)?this.handleYOffset:this.handleXOffset);
}
if(amt>max){
amt=max;
_80=max+this.dragOffset-((this.vertical)?this.handleYOffset:this.handleXOffset);
}
var _82=Math.round(((amt-min)/(max-min))*100);
if(this.vertical){
_82=100-_82;
}
if(_82<=0){
_82=1;
}
if(this.vertical){
this.handle.style.top=_80-this.dragOffset;
if(this.minGroove){
this.minGroove.style.height=_82+"%";
}
}else{
this.handle.style.left=_80-this.dragOffset;
if(this.minGroove){
this.minGroove.width=_82+"%";
}
}
var _83=((amt-min)/(max-min));
if(this.vertical){
_83=1-_83;
}
var _84=(_83*(this.max-this.min))+this.min;
var _85=document.getElementById(this.inputId+"_Text");
if(this.format=="integer"){
_84=Math.round(_84);
document.getElementById(this.inputId).value=_84;
if(_85){
_85.value=_84;
}
}else{
if(this.format=="percent"){
var _84=Math.round(_84*100);
document.getElementById(this.inputId).value=_84/100;
if(_85){
_85.value=_84+"%";
}
}else{
_84=Math.round(_84*100)/100;
_84=""+_84;
var idx=_84.indexOf(".");
if(idx==-1){
_84+=".00";
}else{
if(idx==(_84.length-2)){
_84+="0";
}
}
if(idx==0){
_84="0"+_84;
}
document.getElementById(this.inputId).value=_84;
if(_85){
_85.value=_84;
}
}
}
this.amount=parseFloat(_84);
if(this.onslide){
eval(this.onslide+"("+this.amount+")");
}
this.processing=false;
};
this.endSlide=function(evt){
var _88=this.alive;
this.alive=false;
return _88;
};
};

