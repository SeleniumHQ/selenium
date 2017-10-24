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

  getFile: function(path) {
    var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(path);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        file.append(arguments[i]);
      }
    }
    return file;
  },

  fileExists: function(path) {
    return path !== null && path.length > 0 && this.getFile(path).exists();
  },

  createFolder: function(folder) {
    if (folder && !folder.exists()) {
      folder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
    }
    return folder;
  },

  getSeleniumIDEFolder: function(relativePath, create) {
    var folder = this.getProfileDir();
    folder.append("selenium-ide");
    if (relativePath) {
      folder.appendRelativePath(relativePath);
    }
    return create ? this.createFolder(folder) : folder;
  },

  getStoredFile: function(relativePath, prefix, suffix) {
    var folder = this.getSeleniumIDEFolder(relativePath, true);
    var filename = (prefix || '') + (suffix || '');
    if (filename.length > 0) {
      folder.append(filename);
    }
    return folder;
  },

  _pad2: function(num) {
    return num < 10 ? '0' + num : num;
  },

  getTimeStamp: function() {
    var d = new Date();
    return d.getFullYear() +
           '-' + this._pad2( d.getMonth() + 1 ) +
           '-' + this._pad2( d.getDate() ) +
           '_' + this._pad2( d.getHours() ) +
           '-' + this._pad2( d.getMinutes() ) +
           '-' + this._pad2( d.getSeconds() );
  },

  getStoredTimeStampedFile: function(relativePath, prefix, suffix) {
    return this.getStoredFile(relativePath, (prefix || '') + this.getTimeStamp(), suffix);
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

  openUTF8FileOutputStream: function(file) {
    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
    converter.init(this.openFileOutputStream(file), "UTF-8", 0, 0);
    return converter;
  },

  writeUTF8nsIFile: function(file, data) {
    this.createFolder(file.parent);
    var converter = this.openUTF8FileOutputStream(file);
    converter.writeString(data);
    converter.close();
    return file.path;
  },

  writeUTF8File: function(filename, data) {
    return this.writeUTF8nsIFile(this.getFile(filename), data);
  },

  writeStoredFile: function(filename, data) {
    //StoredFiles are stored in the selenium ide folder under the Firefox profile
    return this.writeUTF8nsIFile(this.getSeleniumIDEFolder(filename), data);
  },

  writeJSONStoredFile: function(filename, data) {
    //StoredFiles are stored in the selenium ide folder under the Firefox profile
    return this.writeStoredFile(filename, JSON.stringify(data));
  },

    openURLInputStream: function(url) {
        const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
        var stream = ioService.newChannelFromURI(ioService.newURI(url, null, null)).open();
        var sis = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
        sis.init(stream);
        return sis;
    },

  readURL: function(url) {
    var stream = this.openURLInputStream(url);
    var content = stream.read(stream.available());
    stream.close();
    return content;
  },

  openFileInputStream: function(file) {
    var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    stream.init(file, 0x01, 00004, 0);
    var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    sis.init(stream);
    return sis;
  },

    readFile: function(file) {
        var stream = this.openFileInputStream(file);
        var content = stream.read(stream.available());
        stream.close();
        return content;
    },

  readStoredFile: function(filename, defaultData) {
    //StoredFiles are stored in the selenium ide folder under the Firefox profile
    var file = this.getSeleniumIDEFolder(filename);
    if (file.exists()) {
      var conv = this.getUnicodeConverter("UTF-8");
      return conv.ConvertToUnicode(this.readFile(file));
    }
    return defaultData;
  },

  readJSONStoredFile: function(filename, defaultData) {
    //StoredFiles are stored in the selenium ide folder under the Firefox profile
    var data = this.readStoredFile(filename);
    return data ? JSON.parse(data) : defaultData;
  },

    fileURI: function(file) {
        return Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).
        newFileURI(file).spec;
    },

  getSafeFilename: function(filename) {
    return filename ? filename.replace(/[^ _~,.0-9A-Za-z-]/g, '-') : '';
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
};
