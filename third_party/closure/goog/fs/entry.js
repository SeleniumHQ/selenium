// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Wrappers for HTML5 Entry objects. These are all in the same
 * file to avoid circular dependency issues.
 *
 * When adding or modifying functionality in this namespace, be sure to update
 * the mock counterparts in goog.testing.fs.
 *
 */

goog.provide('goog.fs.DirectoryEntry');
goog.provide('goog.fs.DirectoryEntry.Behavior');
goog.provide('goog.fs.Entry');
goog.provide('goog.fs.FileEntry');

goog.require('goog.array');
goog.require('goog.async.Deferred');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileWriter');
goog.require('goog.functions');
goog.require('goog.string');



/**
 * The abstract class for entries in the filesystem.
 *
 * @param {!goog.fs.FileSystem} fs The wrapped filesystem.
 * @param {!Entry} entry The underlying Entry object.
 * @constructor
 */
goog.fs.Entry = function(fs, entry) {
  /**
   * The wrapped filesystem.
   *
   * @type {!goog.fs.FileSystem}
   * @private
   */
  this.fs_ = fs;

  /**
   * The underlying Entry object.
   *
   * @type {!Entry}
   * @private
   */
  this.entry_ = entry;
};


/**
 * @return {boolean} Whether or not this entry is a file.
 */
goog.fs.Entry.prototype.isFile = function() {
  return this.entry_.isFile;
};


/**
 * @return {boolean} Whether or not this entry is a directory.
 */
goog.fs.Entry.prototype.isDirectory = function() {
  return this.entry_.isDirectory;
};


/**
 * @return {string} The name of this entry.
 */
goog.fs.Entry.prototype.getName = function() {
  return this.entry_.name;
};


/**
 * @return {string} The full path to this entry.
 */
goog.fs.Entry.prototype.getFullPath = function() {
  return this.entry_.fullPath;
};


/**
 * @return {!goog.fs.FileSystem} The filesystem backing this entry.
 */
goog.fs.Entry.prototype.getFileSystem = function() {
  return this.fs_;
};


/**
 * Retrieves the last modified date for this entry.
 *
 * @return {!goog.async.Deferred} The deferred Date for this entry. If an error
 *     occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.Entry.prototype.getLastModified = function() {
  return this.getMetadata().addCallback(function(metadata) {
    return metadata.modificationTime;
  });
};


/**
 * Retrieves the metadata for this entry.
 *
 * @return {!goog.async.Deferred} The deferred Metadata for this entry. If an
 *     error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.Entry.prototype.getMetadata = function() {
  var d = new goog.async.Deferred();

  this.entry_.getMetadata(
      function(metadata) { d.callback(metadata); },
      goog.bind(function(err) {
        var msg = 'retrieving metadata for ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Move this entry to a new location.
 *
 * @param {!goog.fs.DirectoryEntry} parent The new parent directory.
 * @param {string=} opt_newName The new name of the entry. If omitted, the entry
 *     retains its original name.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileEntry} or
 *     {@link goog.fs.DirectoryEntry} for the new entry. If an error occurs, the
 *     errback is called with a {@link goog.fs.Error}.
 */
goog.fs.Entry.prototype.moveTo = function(parent, opt_newName) {
  var d = new goog.async.Deferred();
  this.entry_.moveTo(
      parent.dir_, opt_newName,
      goog.bind(function(entry) { d.callback(this.wrapEntry(entry)); }, this),
      goog.bind(function(err) {
        var msg = 'moving ' + this.getFullPath() + ' into ' +
            parent.getFullPath() +
            (opt_newName ? ', renaming to ' + opt_newName : '');
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Copy this entry to a new location.
 *
 * @param {!goog.fs.DirectoryEntry} parent The new parent directory.
 * @param {string=} opt_newName The name of the new entry. If omitted, the new
 *     entry has the same name as the original.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileEntry} or
 *     {@link goog.fs.DirectoryEntry} for the new entry. If an error occurs, the
 *     errback is called with a {@link goog.fs.Error}.
 */
goog.fs.Entry.prototype.copyTo = function(parent, opt_newName) {
  var d = new goog.async.Deferred();
  this.entry_.copyTo(
      parent.dir_, opt_newName,
      goog.bind(function(entry) { d.callback(this.wrapEntry(entry)); }, this),
      goog.bind(function(err) {
        var msg = 'copying ' + this.getFullPath() + ' into ' +
            parent.getFullPath() +
            (opt_newName ? ', renaming to ' + opt_newName : '');
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Wrap an HTML5 entry object in an appropriate subclass instance.
 *
 * @param {!Entry} entry The underlying Entry object.
 * @return {!goog.fs.Entry} The appropriate subclass wrapper.
 * @protected
 */
goog.fs.Entry.prototype.wrapEntry = function(entry) {
  return entry.isFile ?
      new goog.fs.FileEntry(this.fs_, /** @type {!FileEntry} */ (entry)) :
      new goog.fs.DirectoryEntry(
          this.fs_, /** @type {!DirectoryEntry} */ (entry));
};


/**
 * Get the URL for this file.
 *
 * @param {string=} opt_mimeType The MIME type that will be served for the URL.
 * @return {string} The URL.
 */
goog.fs.Entry.prototype.toUrl = function(opt_mimeType) {
  return this.entry_.toURL(opt_mimeType);
};


/**
 * Get the URI for this file.
 *
 * @deprecated Use {@link #toUrl} instead.
 * @param {string=} opt_mimeType The MIME type that will be served for the URI.
 * @return {string} The URI.
 */
goog.fs.Entry.prototype.toUri = goog.fs.Entry.prototype.toUrl;


/**
 * Remove this entry.
 *
 * @return {!goog.async.Deferred} A deferred object. If the removal succeeds,
 *     the callback is called with true. If an error occurs, the errback is
 *     called a {@link goog.fs.Error}.
 */
goog.fs.Entry.prototype.remove = function() {
  var d = new goog.async.Deferred();
  this.entry_.remove(
      goog.bind(d.callback, d, true /* result */),
      goog.bind(function(err) {
        var msg = 'removing ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Gets the parent directory.
 *
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.DirectoryEntry}.
 *     If an error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.Entry.prototype.getParent = function() {
  var d = new goog.async.Deferred();
  this.entry_.getParent(
      goog.bind(function(parent) {
        d.callback(new goog.fs.DirectoryEntry(this.fs_, parent));
      }, this),
      goog.bind(function(err) {
        var msg = 'getting parent of ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};



/**
 * A directory in a local FileSystem.
 *
 * This should not be instantiated directly. Instead, it should be accessed via
 * {@link goog.fs.FileSystem#getRoot} or
 * {@link goog.fs.DirectoryEntry#getDirectoryEntry}.
 *
 * @param {!goog.fs.FileSystem} fs The wrapped filesystem.
 * @param {!DirectoryEntry} dir The underlying DirectoryEntry object.
 * @constructor
 * @extends {goog.fs.Entry}
 */
goog.fs.DirectoryEntry = function(fs, dir) {
  goog.base(this, fs, dir);

  /**
   * The underlying DirectoryEntry object.
   *
   * @type {!DirectoryEntry}
   * @private
   */
  this.dir_ = dir;
};
goog.inherits(goog.fs.DirectoryEntry, goog.fs.Entry);


/**
 * Behaviors for getting files and directories.
 * @enum {number}
 */
goog.fs.DirectoryEntry.Behavior = {
  /**
   * Get the file if it exists, error out if it doesn't.
   */
  DEFAULT: 1,
  /**
   * Get the file if it exists, create it if it doesn't.
   */
  CREATE: 2,
  /**
   * Error out if the file exists, create it if it doesn't.
   */
  CREATE_EXCLUSIVE: 3
};


/**
 * Get a file in the directory.
 *
 * @param {string} path The path to the file, relative to this directory.
 * @param {goog.fs.DirectoryEntry.Behavior=} opt_behavior The behavior for
 *     handling an existing file, or the lack thereof.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileEntry}. If an
 *     error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.DirectoryEntry.prototype.getFile = function(path, opt_behavior) {
  var d = new goog.async.Deferred();
  this.dir_.getFile(
      path, this.getOptions_(opt_behavior),
      goog.bind(function(entry) {
        d.callback(new goog.fs.FileEntry(this.fs_, entry));
      }, this),
      goog.bind(function(err) {
        var msg = 'loading file ' + path + ' from ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Get a directory within this directory.
 *
 * @param {string} path The path to the directory, relative to this directory.
 * @param {goog.fs.DirectoryEntry.Behavior=} opt_behavior The behavior for
 *     handling an existing directory, or the lack thereof.
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.DirectoryEntry}.
 *     If an error occurs, the errback is called a {@link goog.fs.Error}.
 */
goog.fs.DirectoryEntry.prototype.getDirectory = function(path, opt_behavior) {
  var d = new goog.async.Deferred();
  this.dir_.getDirectory(
      path, this.getOptions_(opt_behavior),
      goog.bind(function(entry) {
        d.callback(new goog.fs.DirectoryEntry(this.fs_, entry));
      }, this),
      goog.bind(function(err) {
        var msg = 'loading directory ' + path + ' from ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Opens the directory for the specified path, creating the directory and any
 * intermediate directories as necessary.
 *
 * @param {string} path The directory path to create. May be absolute or
 *     relative to the current directory. The parent directory ".." and current
 *     directory "." are supported.
 * @return {!goog.async.Deferred} A deferred {@link goog.fs.DirectoryEntry} for
 *     the requested path. If an error occurs, the errback is called with a
 *     {@link goog.fs.Error}.
 */
goog.fs.DirectoryEntry.prototype.createPath = function(path) {
  // If the path begins at the root, reinvoke createPath on the root directory.
  if (goog.string.startsWith(path, '/')) {
    var root = this.getFileSystem().getRoot();
    if (this.getFullPath() != root.getFullPath()) {
      return root.createPath(path);
    }
  }

  // Filter out any empty path components caused by '//' or a leading slash.
  var parts = goog.array.filter(path.split('/'), goog.functions.identity);
  var existed = [];

  function getNextDirectory(dir) {
    if (!parts.length) {
      return goog.async.Deferred.succeed(dir);
    }

    var def;
    var nextDir = parts.shift();

    if (nextDir == '..') {
      def = dir.getParent();
    } else if (nextDir == '.') {
      def = goog.async.Deferred.succeed(dir);
    } else {
      def = dir.getDirectory(nextDir, goog.fs.DirectoryEntry.Behavior.CREATE);
    }
    return def.addCallback(getNextDirectory);
  }

  return getNextDirectory(this);
};


/**
 * Gets a list of all entries in this directory.
 *
 * @return {!goog.async.Deferred} The deferred list of {@link goog.fs.Entry}
 *     results. If an error occurs, the errback is called with a
 *     {@link goog.fs.Error}.
 */
goog.fs.DirectoryEntry.prototype.listDirectory = function() {
  var d = new goog.async.Deferred();
  var reader = this.dir_.createReader();
  var results = [];

  var errorCallback = goog.bind(function(err) {
    var msg = 'listing directory ' + this.getFullPath();
    d.errback(new goog.fs.Error(err.code, msg));
  }, this);

  var successCallback = goog.bind(function(entries) {
    if (entries.length) {
      for (var i = 0, entry; entry = entries[i]; i++) {
        results.push(this.wrapEntry(entry));
      }
      reader.readEntries(successCallback, errorCallback);
    } else {
      d.callback(results);
    }
  }, this);

  reader.readEntries(successCallback, errorCallback);
  return d;
};


/**
 * Removes this directory and all its contents.
 *
 * @return {!goog.async.Deferred} A deferred object. If the removal succeeds,
 *     the callback is called with true. If an error occurs, the errback is
 *     called a {@link goog.fs.Error}.
 */
goog.fs.DirectoryEntry.prototype.removeRecursively = function() {
  var d = new goog.async.Deferred();
  this.dir_.removeRecursively(
      goog.bind(d.callback, d, true /* result */),
      goog.bind(function(err) {
        var msg = 'removing ' + this.getFullPath() + ' recursively';
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Converts a value in the Behavior enum into an options object expected by the
 * File API.
 *
 * @param {goog.fs.DirectoryEntry.Behavior=} opt_behavior The behavior for
 *     existing files.
 * @return {Object.<boolean>} The options object expected by the File API.
 * @private
 */
goog.fs.DirectoryEntry.prototype.getOptions_ = function(opt_behavior) {
  if (opt_behavior == goog.fs.DirectoryEntry.Behavior.CREATE) {
    return {'create': true};
  } else if (opt_behavior == goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE) {
    return {'create': true, 'exclusive': true};
  } else {
    return {};
  }
};



/**
 * A file in a local filesystem.
 *
 * This should not be instantiated directly. Instead, it should be accessed via
 * {@link goog.fs.DirectoryEntry#getDirectoryEntry}.
 *
 * @param {!goog.fs.FileSystem} fs The wrapped filesystem.
 * @param {!FileEntry} file The underlying FileEntry object.
 * @constructor
 * @extends {goog.fs.Entry}
 */
goog.fs.FileEntry = function(fs, file) {
  goog.base(this, fs, file);

  /**
   * The underlying FileEntry object.
   *
   * @type {!FileEntry}
   * @private
   */
  this.file_ = file;
};
goog.inherits(goog.fs.FileEntry, goog.fs.Entry);


/**
 * Create a writer for writing to the file.
 *
 * @return {!goog.async.Deferred} The deferred {@link goog.fs.FileWriter}. If an
 *     error occurs, the errback is called with a {@link goog.fs.Error}.
 */
goog.fs.FileEntry.prototype.createWriter = function() {
  var d = new goog.async.Deferred();
  this.file_.createWriter(
      function(w) { d.callback(new goog.fs.FileWriter(w)); },
      goog.bind(function(err) {
        var msg = 'creating writer for ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};


/**
 * Get the file contents as a File blob.
 *
 * @return {!goog.async.Deferred} The deferred File. If an error occurs, the
 *     errback is called with a {@link goog.fs.Error}.
 */
goog.fs.FileEntry.prototype.file = function() {
  var d = new goog.async.Deferred();
  this.file_.file(
      function(f) { d.callback(f); },
      goog.bind(function(err) {
        var msg = 'getting file for ' + this.getFullPath();
        d.errback(new goog.fs.Error(err.code, msg));
      }, this));
  return d;
};
