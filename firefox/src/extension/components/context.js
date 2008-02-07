function Context(windowId, frameId) {
    this.windowId = (windowId !== undefined ? windowId - 0 : 1) || 0;

    if (frameId) {
		if (frameId.match(/^\d+$/g)) {
        	this.frameId = frameId - 0;
		} else {
			this.frameId = frameId;
		}
	}
}

Context.fromString = function(text) {
    var bits = text.split(" ");
    return new Context(bits[0], bits[1]);
}

Context.prototype.toString = function() {
    return this.windowId + " " + (this.frameId !== undefined ? this.frameId : "");
}