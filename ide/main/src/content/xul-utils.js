/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var XulUtils = {
    clearChildren: function(e) {
        var i;
        for (i = e.childNodes.length - 1; i >= 0; i--) {
            e.removeChild(e.childNodes[i]);
        }
    },

    appendMenuItem: function(e, attributes) {
		var menuitem = document.createElement("menuitem");
        for (var key in attributes) {
            if (attributes[key] != null) {
                menuitem.setAttribute(key, attributes[key]);
            }
        }
		e.appendChild(menuitem);
    },
    
    toXPCOMArray: function(data) {
        var array = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
        for (var i = 0; i < data.length; i++) {
            array.AppendElement(this.toXPCOMString(data[i]));
        }
        return array;
    },

    toXPCOMString: function(data) {
        var string = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        string.data = data;
        return string;
    },

	atomService: Components.classes["@mozilla.org/atom-service;1"].
		getService(Components.interfaces.nsIAtomService)
};

XulUtils.TreeViewHelper = classCreate();
objectExtend(XulUtils.TreeViewHelper.prototype, {
    initialize: function(tree) {
        tree.view = this;
        this.tree = tree;
    },

    scrollToRow: function(index) {
        this.treebox.ensureRowIsVisible(index);
    },

    rowUpdated: function(index) {
        this.treebox.invalidateRow(index);
    },

    //Samit: Enh: allow a range of rows to be updated
    rowsUpdated: function(startIndex, toIndex) {
        if (startIndex < toIndex) {
            this.treebox.invalidateRange(startIndex, toIndex);
        }else {
            this.treebox.invalidateRange(toIndex, startIndex);
        }
    },
    //
    // nsITreeView interfaces
    //
    setTree: function(treebox) {
        this.log.debug("setTree: treebox=" + treebox);
        this.treebox = treebox;
    },
    isContainer: function(row) {
        return false;
    },
    isSeparator: function(row) {
        return false;
    },
    isSorted: function(row) {
        return false;
    },
    getLevel: function(row) {
        return 0;
    },
    getImageSrc: function(row,col) {
        return null;
    },
    getColumnProperties: function(colid, col, props) {},
    cycleHeader: function(colID, elt) {}
});
