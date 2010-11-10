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

var FileUtils = {
    getProfileDir: function() {
        return Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties)
        .get("ProfD", Components.interfaces.nsILocalFile);
    },
	
    getTempDir: function() {
        return Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties)
        .get("TmpD", Components.interfaces.nsILocalFile);
    },
	
    getUnicodeConverter: function(encoding) {
        var unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        try {
            unicodeConverter.charset = encoding;
        } catch (error) {
            throw "setting encoding failed: " + encoding;
        }
        return unicodeConverter;
    },
	
    openFileOutputStream: function(file) {
        var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        stream.init(file, 0x02 | 0x08 | 0x20, 420, 0);
        return stream;
    },

    openFileInputStream: function(file) {
        var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        stream.init(file, 0x01, 00004, 0);
        var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
        sis.init(stream);
        return sis;
    },

    openURLInputStream: function(url) {
        const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
        var stream = ioService.newChannelFromURI(ioService.newURI(url, null, null)).open();
        var sis = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
        sis.init(stream);
        return sis;
    },

    readFile: function(file) {
        var stream = this.openFileInputStream(file);
        var content = stream.read(stream.available());
        stream.close();
        return content;
    },

    readURL: function(url) {
        var stream = this.openURLInputStream(url);
        var content = stream.read(stream.available());
        stream.close();
        return content;
    },

    getFile: function(path) {
        var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(path);
        return file;
    },

    fileURI: function(file) {
        return Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).
        newFileURI(file).spec;
    },

    splitPath: function(file) {
        var max = 100;
        var result = [];
        var i = 0;
        while (i < max && file && 
            file.path != "/" &&
            !file.path.match(/^[a-z]:$/i)) {
            result.unshift(file.leafName);
            if ("." == file.leafName || ".." == file.leafName) {
                break;
            }
            file = file.parent;
            i++;
        }
        return result;
    },

    //Samit: Enh: Guess the file separator
    getFileSeperator: function(localFile) {
        if (Components.interfaces.nsILocalFileWin && localFile instanceof Components.interfaces.nsILocalFileWin) {
            return '\\';
        }
        return '/';
    },

    //Samit: Enh: Work around the nsILocalFile.appendRelativePath() restriction of not being able to use relative paths with ".." and "."
    appendRelativePath: function(file, relativePath) {
        var up = 0;
        var cleanPath = [];
        var fileSep = this.getFileSeperator(file);
        var relPath = relativePath.split(fileSep);
        while (relPath.length > 0) {
            var f = relPath.shift();
            if (f == '..') {
                if (cleanPath.length > 0) {
                    cleanPath.pop();
                }else {
                    up++;
                }
            }else if (f != '.') {
                cleanPath.push(f);
            }
        }
        while (up-- > 0 && file.parent) {

            file = file.parent;
        }
        var mergedFile = this.getFile(file.path);
        mergedFile.appendRelativePath(cleanPath.join(fileSep));
        return mergedFile;
    }
}
