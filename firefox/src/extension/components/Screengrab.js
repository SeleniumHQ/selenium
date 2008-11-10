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
var Screengrab = {

    prepareCanvas : function(document, width, height) {
        var styleWidth = width + 'px';
        var styleHeight = height + 'px';
        var grabCanvas = document.getElementById('fxdriver-screenshot-canvas');
        if (grabCanvas == null) {
            grabCanvas = document.createElement('canvas');
            grabCanvas.id = 'fxdriver-screenshot-canvas';
            grabCanvas.style.display = 'none';
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(grabCanvas);
        }
        grabCanvas.width = width;
        grabCanvas.style.width = styleWidth;
        grabCanvas.style.maxWidth = styleWidth;
        grabCanvas.height = height;
        grabCanvas.style.height = styleHeight;
        grabCanvas.style.maxHeight = styleHeight;
        return grabCanvas;
    },

    prepareContext : function(canvas, box) {
        var context = canvas.getContext('2d');
        context.clearRect(box.getX(), box.getY(), box.getWidth(), box.getHeight());
        context.save();
        return context;
    },

    grab : function(window) {
        var frameDim = new ScreengrabDimensions.FrameDimensions(window);
        var width = frameDim.getDocumentWidth();
        var height = frameDim.getDocumentHeight();
        if (frameDim.getFrameWidth() > width) width = frameDim.getFrameWidth();
        if (frameDim.getFrameHeight() > height) height = frameDim.getFrameHeight();
        var box = new ScreengrabDimensions.Box(0, 0, width, height);
        var canvas = this.prepareCanvas(window.document, box.getWidth(), box.getHeight());
        var context = this.prepareContext(canvas, box);
        context.drawWindow(window, box.getX(), box.getY(), box.getWidth(), box.getHeight(), 'rgba(0,0,0,0)');
        context.restore();
        return canvas.toDataURL('image/png');
    },

    save : function(dataUrl, file) {
        var binaryInputStream = ScreengrabUtils.dataUrlToBinaryInputStream(dataUrl);
        var fileOutputStream = ScreengrabUtils.newFileOutputStream(file);
        ScreengrabUtils.writeBinaryInputStreamToFileOutputStream(binaryInputStream, fileOutputStream);
        fileOutputStream.close();
    }
}