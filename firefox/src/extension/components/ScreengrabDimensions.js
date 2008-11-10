/*
Copyright (C) 2004-2007  Andy Mutton

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

Contact: andy@5263.org
*/
var ScreengrabDimensions = {

    Box : function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    },

    FrameDimensions : function(window) {
        this.doc = window.document;
    }
}

ScreengrabDimensions.Box.prototype = {

    getX : function() {
        return this.x;
    },

    getY : function() {
        return this.y;
    },

    getWidth : function() {
        return this.width;
    },

    getHeight : function() {
        return this.height;
    }
}

ScreengrabDimensions.FrameDimensions.prototype = {

    getFrameHeight : function() {
        if (this.doc.compatMode == "CSS1Compat") {
            // standards mode
            return this.doc.documentElement.clientHeight;
        } else {
            // quirks mode
            return this.doc.body.clientHeight;
        }
    },

    getFrameWidth : function() {
        if (this.doc.compatMode == "CSS1Compat") {
            // standards mode
            return this.doc.documentElement.clientWidth;
        } else {
            // quirks mode
            return this.doc.body.clientWidth;
        }
    },

    getDocumentHeight : function() {
        return this.doc.documentElement.scrollHeight;
    },

    getDocumentWidth : function() {
        if (this.doc.compatMode == "CSS1Compat") {
            // standards mode
            return this.doc.documentElement.scrollWidth;
        } else {
            // quirks mode
            return this.doc.body.scrollWidth;
        }
    }
}