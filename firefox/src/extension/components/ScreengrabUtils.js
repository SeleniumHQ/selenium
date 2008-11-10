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
var ScreengrabUtils = {

    dataUrlToBinaryInputStream : function(dataUrl) {
        var nsIoService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var channel = nsIoService.newChannelFromURI(nsIoService.newURI(dataUrl, null, null));
        var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
        binaryInputStream.setInputStream(channel.open());
        return binaryInputStream;
    },

    newFileOutputStream : function(path) {
        var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(path);
        var fileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        var ioFlags = 0x02; // write only
        if (file.exists()) {
            ioFlags |= 0x20; // truncate
        } else {
            ioFlags |= 0x08; // create
        }
        fileOutputStream.init(file, ioFlags, 0664, null);
        return fileOutputStream;
    },

    writeBinaryInputStreamToFileOutputStream : function(binaryInputStream, fileOutputStream) {
        var numBytes = binaryInputStream.available();
        var bytes = binaryInputStream.readBytes(numBytes);
        fileOutputStream.write(bytes, numBytes);
    }
}