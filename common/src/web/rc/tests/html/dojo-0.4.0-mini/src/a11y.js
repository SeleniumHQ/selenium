/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.a11y");

dojo.require("dojo.uri.*");
dojo.require("dojo.html.common");

dojo.a11y = {
	// imgPath: String path to the test image for determining if images are displayed or not
	// doAccessibleCheck: Boolean if true will perform check for need to create accessible widgets
	// accessible: Boolean uninitialized when null (accessible check has not been performed)
	//   if true generate accessible widgets
	imgPath:dojo.uri.dojoUri("src/widget/templates/images"),
	doAccessibleCheck: true,
	accessible: null,		

	checkAccessible: function(){ 
	// summary: 
	//		perform check for accessibility if accessibility checking is turned
	//		on and the accessibility test has not been performed yet
		if(this.accessible === null){ 
			this.accessible = false; //default
			if(this.doAccessibleCheck == true){ 
				this.accessible = this.testAccessible();
			}
		}
		return this.accessible; /* Boolean */
	},
	
	testAccessible: function(){
	// summary: 
	//		Always perform the accessibility check to determine if high 
	//		contrast mode is on or display of images are turned off. Currently only checks 
	//		in IE and Mozilla. 
		this.accessible = false; //default
		if (dojo.render.html.ie || dojo.render.html.mozilla){
			var div = document.createElement("div");
			//div.style.color="rgb(153,204,204)";
			div.style.backgroundImage = "url(\"" + this.imgPath + "/tab_close.gif\")";
			// must add to hierarchy before can view currentStyle below
			dojo.body().appendChild(div);
			// in FF and IE the value for the current background style of the added div
			// will be "none" in high contrast mode
			// in FF the return value will be url(invalid-url:) when running over http 
			var bkImg = null;
			if (window.getComputedStyle  ) {
				var cStyle = getComputedStyle(div, ""); 
				bkImg = cStyle.getPropertyValue("background-image");
			}else{
				bkImg = div.currentStyle.backgroundImage;
			}
			var bUseImgElem = false;
			if (bkImg != null && (bkImg == "none" || bkImg == "url(invalid-url:)" )) {
				this.accessible = true;
			}
			/*
			if(this.accessible == false && document.images){
				// test if images are off in IE
				var testImg = new Image();
				if(testImg.fileSize) {
					testImg.src = this.imgPath + "/tab_close.gif";
					if(testImg.fileSize < 0){ 
						this.accessible = true;
					}
				}	
			}*/
			dojo.body().removeChild(div);
		}
		return this.accessible; /* Boolean */
	},
	
	setCheckAccessible: function(/* Boolean */ bTest){ 
	// summary: 
	//		Set whether or not to check for accessibility mode.  Default value
	//		of module is true - perform check for accessibility modes. 
	//		bTest: Boolean - true to check; false to turn off checking
		this.doAccessibleCheck = bTest;
	},

	setAccessibleMode: function(){
	// summary:
	//		perform the accessibility check and sets the correct mode to load 
	//		a11y widgets. Only runs if test for accessiiblity has not been performed yet. 
	//		Call testAccessible() to force the test.
		if (this.accessible === null){
			if (this.checkAccessible()){
				dojo.render.html.prefixes.unshift("a11y");
			}
		}
		return this.accessible; /* Boolean */
	}
};

//dojo.hostenv.modulesLoadedListeners.unshift(function() { dojo.a11y.setAccessibleMode(); });
//dojo.event.connect("before", dojo.hostenv, "makeWidgets", dojo.a11y, "setAccessibleMode");
