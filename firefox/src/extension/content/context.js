function Context(windowId, frameId) {
    this.windowId = windowId - 0 || 0;
    this.frameId  = frameId - 0 || 0;
}

Context.fromString = function(text) {
    var bits = text.split(" ");
    return new Context(bits[0], bits[1]);
}

Context.prototype.toString = function() {
    return this.windowId + " " + this.frameId;
}