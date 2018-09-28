"use strict";

module.exports = function(tagname, parent, val) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};//child tags
    this.attrsMap = {};//attributes map
    this.val = val;//text only
    this.addChild = function(child) {
        if (this.child[child.tagname]) {//already presents
            this.child[child.tagname].push(child);
        } else {
            this.child[child.tagname] = [child];
        }
    };
};
