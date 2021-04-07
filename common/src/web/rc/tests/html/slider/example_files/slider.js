
function drawSliderByVal(slider) {
	var knob=slider.getElementsByTagName('img')[0];
	var p=(slider.val-slider.min)/(slider.max-slider.min);
	var x=(slider.scrollWidth-30)*p;
	knob.style.left=x+"px";
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function setSliderByClientX(slider, clientX) {
	var p=(clientX-slider.offsetLeft-15)/(slider.scrollWidth-30);
	slider.val=(slider.max-slider.min)*p + slider.min;
	if (slider.val>slider.max) slider.val=slider.max;
	if (slider.val<slider.min) slider.val=slider.min;

	drawSliderByVal(slider);
	slider.onchange(slider.val, slider.num);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function sliderClick(e) {
	var el=sliderFromEvent(e);
	if (!el) return;

	setSliderByClientX(el, e.clientX);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function sliderMouseMove(e) {
	var el=sliderFromEvent(e);
	if (!el) return;
	if (activeSlider<0) return;

	setSliderByClientX(el, e.clientX);
	stopEvent(e);
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function sliderFromEvent(e) {
	if (!e && window.event) e=window.event;
	if (!e) return false;
    if (!isLeftButton(e)) return false;

    var el;
	if (e.target) el=e.target;
	if (e.srcElement) el=e.srcElement;

	if (!el.id || !el.id.match(/slider\d+/)) el=el.parentNode;
	if (!el) return false;
	if (!el.id || !el.id.match(/slider\d+/)) return false;

	return el;
}

function isLeftButton(e) {
    return (((e.which) && (e.which == 1)) || ((e.button) && (e.button == 1)));
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function attachSliderEvents() {
	var divs=document.getElementsByTagName('div');
	var divNum;
	for(var i=0; i<divs.length; i++) {
		if (divNum=divs[i].id.match(/\bslider(\d+)\b/)) {
			divNum=parseInt(divNum[1]);
			divs[i].min=slider[divNum].min;
			divs[i].max=slider[divNum].max;
			divs[i].val=slider[divNum].val;
			divs[i].onchange=slider[divNum].onchange;
			divs[i].num=divNum;
			addAnEvent(divs[i], 'mousedown', function(e){
				sliderClick(e);
				var el=sliderFromEvent(e);
				if (!el) return;
				activeSlider=el.num;
				stopEvent(e);
			});
                        
                        
                        // to prove that http://jira.openqa.org/browse/SEL-280 is in fact fixed, assign directly to onmouseup 
                        // (instead of using the addAnEvent code below; this used to cause trouble because the global event var was not getting set)
                        	divs[i].onmouseup = function(e){
                        
                        		if (e==null) e = event;	// only needed when we do direct assignment to onmouseup
                                        
				activeSlider=-1;
				stopEvent(e);
			};
			//addAnEvent(divs[i], 'mouseup', function(e){
			//	activeSlider=-1;
			//	stopEvent(e);
			//});
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
		}
	}
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function stopEvent(event) {
	if (event.preventDefault) {
		event.preventDefault();
		event.stopPropagation();
	} else {
		event.returnValue=false;
		event.cancelBubble=true;
	}
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
addAnEvent(window, 'load', attachSliderEvents);



addAnEvent(document, 'mousemove', sliderMouseMove);
//document.onmousemove = sliderMouseMove;



var activeSlider=-1;
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
