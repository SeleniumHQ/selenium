/*
 * Copyright 2008 Shinya Kasatani
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

function StoredHistory(id, max) {
    this.id = id;
    this.max = max || 5;
}

StoredHistory.prototype = {
    clear: function() {
        Preferences.setArray(this.id, []);
    },
    
    list: function() {
	    return Preferences.getArray(this.id);
    },
    
    add: function(item) {
	    if (item.trim().length == 0) return;
	    var list = this.list();
        list.delete(item);
	    list.unshift(item);
	    if (list.length > this.max) {
	        list.pop();
	    }
	    Preferences.setArray(this.id, list);
    },
    
    mapMenuItem: function(callback) {
	    var list = this.list();
	    for (var i = 0; i < list.length; i++) {
            var file = FileUtils.getFile(list[i]);
            shortenPath(file);
	        callback.call(this, {
                label: shortenPath(file),
                value: file.path
	        });
	    }
        
	    function shortenPath(file) {
            var nodes = FileUtils.splitPath(file.parent);
            if (nodes.length > 2) {
		        nodes.splice(0, nodes.length - 2);
		        nodes.unshift("...");
            }
            return file.leafName + " [" + nodes.join("/") + "]";
	    }
    },

    populateMenu: function(e) {
	    XulUtils.clearChildren(e);
	    this.mapMenuItem(function(item) {
            XulUtils.appendMenuItem(e, item);
        });
    }
}
