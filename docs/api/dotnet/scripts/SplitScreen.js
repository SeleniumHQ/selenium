
	function SplitScreen (nonScrollingRegionId, scrollingRegionId) {

		// store references to the two regions
		this.nonScrollingRegion = document.getElementById(nonScrollingRegionId);
		this.scrollingRegion = document.getElementById(scrollingRegionId);

		// set the scrolling settings
		this.scrollingRegion.parentElement.style.margin = "0px";
		this.scrollingRegion.parentElement.style.overflow = "hidden";
		this.scrollingRegion.style.overflow = "auto";

		// fix the size of the scrolling region
		this.resize(null);

		// add an event handler to resize the scrolling region when the window is resized		
		registerEventHandler(window, 'resize', getInstanceDelegate(this, "resize"));

	}

	SplitScreen.prototype.resize = function(e) {
		var height = document.body.clientHeight - this.nonScrollingRegion.offsetHeight;
		if (height > 0) {
			this.scrollingRegion.style.height = height;
		} else {
			this.scrollingRegion.style.height = 0;
		}
		this.scrollingRegion.style.width = this.scrollingRegion.parentElement.clientWidth;
	}
