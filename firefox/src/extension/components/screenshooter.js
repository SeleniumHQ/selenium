function Screenshooter() {
}

Screenshooter.grab = function(window) {
    var document = window.document;
    var documentElement = document.documentElement;
    var canvas = document.getElementById('fxdriver-screenshot-canvas');
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.id = 'fxdriver-screenshot-canvas';
        canvas.style.display = 'none';
        documentElement.appendChild(canvas);
    }
    var width = Math.max(documentElement.scrollWidth, document.body.scrollWidth);
    var height = Math.max(documentElement.scrollHeight, document.body.scrollHeight);
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    context.drawWindow(window, 0, 0, width, height, 'rgb(0,0,0)');
    return canvas;
};

Screenshooter.save = function(canvas, filepath) {
    var cc = Components.classes;
    var ci = Components.interfaces;
    var dataUrl = canvas.toDataURL('image/png');
    var ioService = cc['@mozilla.org/network/io-service;1'].getService(ci.nsIIOService);
    var dataUri = ioService.newURI(dataUrl, 'UTF-8', null);
    var channel = ioService.newChannelFromURI(dataUri);
    var file = cc['@mozilla.org/file/local;1'].createInstance(ci.nsILocalFile);
    file.initWithPath(filepath);
    var inputStream = channel.open();
    var binaryInputStream = cc['@mozilla.org/binaryinputstream;1'].createInstance(ci.nsIBinaryInputStream);
    binaryInputStream.setInputStream(inputStream);
    var fileOutputStream = cc['@mozilla.org/network/safe-file-output-stream;1'].createInstance(ci.nsIFileOutputStream);
    fileOutputStream.init(file, -1, -1, null);
    var n = binaryInputStream.available();
    var bytes = binaryInputStream.readBytes(n);
    fileOutputStream.write(bytes, n);
    if (fileOutputStream instanceof ci.nsISafeOutputStream) {
        fileOutputStream.finish();
    } else {
        fileOutputStream.close();
    }
};
