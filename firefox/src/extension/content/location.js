function Location(deriveFrom) {
    var bits = deriveFrom.split(" ");
    this.window = bits[0] - 0;
    this.frame = bits[1] - 0;
}

Location.prototype.toString = function() {
    return this.window + " " + this.frame;
}