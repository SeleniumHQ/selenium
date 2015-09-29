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
 * @fileoverview A class for downloading remote files and storing them
 * locally using the HTML5 FileSystem API.
 *
 * The directory structure is of the form /HASH/URL/BASENAME:
 *
 * The HASH portion is a three-character slice of the hash of the URL. Since the
 * filesystem has a limit of about 5000 files per directory, this should divide
 * the downloads roughly evenly among about 5000 directories, thus allowing for
 * at most 5000^2 downloads.
 *
 * The URL portion is the (sanitized) full URL used for downloading the file.
 * This is used to ensure that each file ends up in a different location, even
 * if the HASH and BASENAME are the same.
 *
 * The BASENAME portion is the basename of the URL. It's used for the filename
 * proper so that the local filesystem: URL will be downloaded to a file with a
 * recognizable name.
 *
 */

goog.provide('goog.net.FileDownloader');
goog.provide('goog.net.FileDownloader.Error');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.async.Deferred');
goog.require('goog.crypt.hash32');
goog.require('goog.debug.Error');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.fs');
goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileSaver');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrIoPool');
goog.require('goog.object');



/**
 * A class for downloading remote files and storing them locally using the
 * HTML5 filesystem API.
 *
 * @param {!goog.fs.DirectoryEntry} dir The directory in which the downloaded
 *     files are stored. This directory should be solely managed by
 *     FileDownloader.
 * @param {goog.net.XhrIoPool=} opt_pool The pool of XhrIo objects to use for
 *     downloading files.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.net.FileDownloader = function(dir, opt_pool) {
  goog.net.FileDownloader.base(this, 'constructor');

  /**
   * The directory in which the downloaded files are stored.
   * @type {!goog.fs.DirectoryEntry}
   * @private
   */
  this.dir_ = dir;

  /**
   * The pool of XHRs to use for capturing.
   * @type {!goog.net.XhrIoPool}
   * @private
   */
  this.pool_ = opt_pool || new goog.net.XhrIoPool();

  /**
   * A map from URLs to active downloads running for those URLs.
   * @type {!Object<!goog.net.FileDownloader.Download_>}
   * @private
   */
  this.downloads_ = {};

  /**
   * The handler for URL capturing events.
   * @type {!goog.events.EventHandler<!goog.net.FileDownloader>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.net.FileDownloader, goog.Disposable);


/**
 * Download a remote file and save its contents to the filesystem. A given file
 * is uniquely identified by its URL string; this means that the relative and
 * absolute URLs for a single file are considered different for the purposes of
 * the FileDownloader.
 *
 * Returns a Deferred that will contain the downloaded blob. If there's an error
 * while downloading the URL, this Deferred will be passed the
 * {@link goog.net.FileDownloader.Error} object as an errback.
 *
 * If a download is already in progress for the given URL, this will return the
 * deferred blob for that download. If the URL has already been downloaded, this
 * will fail once it tries to save the downloaded blob.
 *
 * When a download is in progress, all Deferreds returned for that download will
 * be branches of a single parent. If all such branches are cancelled, or if one
 * is cancelled with opt_deepCancel set, then the download will be cancelled as
 * well.
 *
 * @param {string} url The URL of the file to download.
 * @return {!goog.async.Deferred} The deferred result blob.
 */
goog.net.FileDownloader.prototype.download = function(url) {
  if (this.isDownloading(url)) {
    return this.downloads_[url].deferred.branch(true /* opt_propagateCancel */);
  }

  var download = new goog.net.FileDownloader.Download_(url, this);
  this.downloads_[url] = download;
  this.pool_.getObject(goog.bind(this.gotXhr_, this, download));
  return download.deferred.branch(true /* opt_propagateCancel */);
};


/**
 * Return a Deferred that will fire once no download is active for a given URL.
 * If there's no download active for that URL when this is called, the deferred
 * will fire immediately; otherwise, it will fire once the download is complete,
 * whether or not it succeeds.
 *
 * @param {string} url The URL of the download to wait for.
 * @return {!goog.async.Deferred} The Deferred that will fire when the download
 *     is complete.
 */
goog.net.FileDownloader.prototype.waitForDownload = function(url) {
  var deferred = new goog.async.Deferred();
  if (this.isDownloading(url)) {
    this.downloads_[url].deferred.addBoth(function() {
      deferred.callback(null);
    }, this);
  } else {
    deferred.callback(null);
  }
  return deferred;
};


/**
 * Returns whether or not there is an active download for a given URL.
 *
 * @param {string} url The URL of the download to check.
 * @return {boolean} Whether or not there is an active download for the URL.
 */
goog.net.FileDownloader.prototype.isDownloading = function(url) {
  return url in this.downloads_;
};


/**
 * Load a downloaded blob from the filesystem. Will fire a deferred error if the
 * given URL has not yet been downloaded.
 *
 * @param {string} url The URL of the blob to load.
 * @return {!goog.async.Deferred} The deferred Blob object. The callback will be
 *     passed the blob. If a file API error occurs while loading the blob, that
 *     error will be passed to the errback.
 */
goog.net.FileDownloader.prototype.getDownloadedBlob = function(url) {
  return this.getFile_(url).
      addCallback(function(fileEntry) { return fileEntry.file(); });
};


/**
 * Get the local filesystem: URL for a downloaded file. This is different from
 * the blob: URL that's available from getDownloadedBlob(). If the end user
 * accesses the filesystem: URL, the resulting file's name will be determined by
 * the download filename as opposed to an arbitrary GUID. In addition, the
 * filesystem: URL is connected to a filesystem location, so if the download is
 * removed then that URL will become invalid.
 *
 * Warning: in Chrome 12, some filesystem: URLs are opened inline. This means
 * that e.g. HTML pages given to the user via filesystem: URLs will be opened
 * and processed by the browser.
 *
 * @param {string} url The URL of the file to get the URL of.
 * @return {!goog.async.Deferred} The deferred filesystem: URL. The callback
 *     will be passed the URL. If a file API error occurs while loading the
 *     blob, that error will be passed to the errback.
 */
goog.net.FileDownloader.prototype.getLocalUrl = function(url) {
  return this.getFile_(url).
      addCallback(function(fileEntry) { return fileEntry.toUrl(); });
};


/**
 * Return (deferred) whether or not a URL has been downloaded. Will fire a
 * deferred error if something goes wrong when determining this.
 *
 * @param {string} url The URL to check.
 * @return {!goog.async.Deferred} The deferred boolean. The callback will be
 *     passed the boolean. If a file API error occurs while checking the
 *     existence of the downloaded URL, that error will be passed to the
 *     errback.
 */
goog.net.FileDownloader.prototype.isDownloaded = function(url) {
  var deferred = new goog.async.Deferred();
  var blobDeferred = this.getDownloadedBlob(url);
  blobDeferred.addCallback(function() {
    deferred.callback(true);
  });
  blobDeferred.addErrback(function(err) {
    if (err.name == goog.fs.Error.ErrorName.NOT_FOUND) {
      deferred.callback(false);
    } else {
      deferred.errback(err);
    }
  });
  return deferred;
};


/**
 * Remove a URL from the FileDownloader.
 *
 * This returns a Deferred. If the removal is completed successfully, its
 * callback will be called without any value. If the removal fails, its errback
 * will be called with the {@link goog.fs.Error}.
 *
 * @param {string} url The URL to remove.
 * @return {!goog.async.Deferred} The deferred used for registering callbacks on
 *     success or on error.
 */
goog.net.FileDownloader.prototype.remove = function(url) {
  return this.getDir_(url, goog.fs.DirectoryEntry.Behavior.DEFAULT).
      addCallback(function(dir) { return dir.removeRecursively(); });
};


/**
 * Save a blob for a given URL. This works just as through the blob were
 * downloaded form that URL, except you specify the blob and no HTTP request is
 * made.
 *
 * If the URL is currently being downloaded, it's indeterminate whether the blob
 * being set or the blob being downloaded will end up in the filesystem.
 * Whichever one doesn't get saved will have an error. To ensure that one or the
 * other takes precedence, use {@link #waitForDownload} to allow the download to
 * complete before setting the blob.
 *
 * @param {string} url The URL at which to set the blob.
 * @param {!Blob} blob The blob to set.
 * @param {string=} opt_name The name of the file. If this isn't given, it's
 *     determined from the URL.
 * @return {!goog.async.Deferred} The deferred used for registering callbacks on
 *     success or on error. This can be cancelled just like a {@link #download}
 *     Deferred. The objects passed to the errback will be
 *     {@link goog.net.FileDownloader.Error}s.
 */
goog.net.FileDownloader.prototype.setBlob = function(url, blob, opt_name) {
  var name = this.sanitize_(opt_name || this.urlToName_(url));
  var download = new goog.net.FileDownloader.Download_(url, this);
  this.downloads_[url] = download;
  download.blob = blob;
  this.getDir_(download.url, goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE).
      addCallback(function(dir) {
        return dir.getFile(
            name, goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE);
      }).
      addCallback(goog.bind(this.fileSuccess_, this, download)).
      addErrback(goog.bind(this.error_, this, download));
  return download.deferred.branch(true /* opt_propagateCancel */);
};


/**
 * The callback called when an XHR becomes available from the XHR pool.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     this download.
 * @param {!goog.net.XhrIo} xhr The XhrIo object for downloading the page.
 * @private
 */
goog.net.FileDownloader.prototype.gotXhr_ = function(download, xhr) {
  if (download.cancelled) {
    this.freeXhr_(xhr);
    return;
  }

  this.eventHandler_.listen(
      xhr, goog.net.EventType.SUCCESS,
      goog.bind(this.xhrSuccess_, this, download));
  this.eventHandler_.listen(
      xhr, [goog.net.EventType.ERROR, goog.net.EventType.ABORT],
      goog.bind(this.error_, this, download));
  this.eventHandler_.listen(
      xhr, goog.net.EventType.READY,
      goog.bind(this.freeXhr_, this, xhr));

  download.xhr = xhr;
  xhr.setResponseType(goog.net.XhrIo.ResponseType.ARRAY_BUFFER);
  xhr.send(download.url);
};


/**
 * The callback called when an XHR succeeds in downloading a remote file.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     this download.
 * @private
 */
goog.net.FileDownloader.prototype.xhrSuccess_ = function(download) {
  if (download.cancelled) {
    return;
  }

  var name = this.sanitize_(this.getName_(
      /** @type {!goog.net.XhrIo} */ (download.xhr)));
  var resp = /** @type {ArrayBuffer} */ (download.xhr.getResponse());
  if (!resp) {
    // This should never happen - it indicates the XHR hasn't completed, has
    // failed or has been cleaned up.  If it does happen (eg. due to a bug
    // somewhere) we don't want to pass null to getBlob - it's not valid and
    // triggers a bug in some versions of WebKit causing it to crash.
    this.error_(download);
    return;
  }

  download.blob = goog.fs.getBlob(resp);
  delete download.xhr;

  this.getDir_(download.url, goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE).
      addCallback(function(dir) {
        return dir.getFile(
            name, goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE);
      }).
      addCallback(goog.bind(this.fileSuccess_, this, download)).
      addErrback(goog.bind(this.error_, this, download));
};


/**
 * The callback called when a file that will be used for saving a file is
 * successfully opened.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     this download.
 * @param {!goog.fs.FileEntry} file The newly-opened file object.
 * @private
 */
goog.net.FileDownloader.prototype.fileSuccess_ = function(download, file) {
  if (download.cancelled) {
    file.remove();
    return;
  }

  download.file = file;
  file.createWriter().
      addCallback(goog.bind(this.fileWriterSuccess_, this, download)).
      addErrback(goog.bind(this.error_, this, download));
};


/**
 * The callback called when a file writer is succesfully created for writing a
 * file to the filesystem.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     this download.
 * @param {!goog.fs.FileWriter} writer The newly-created file writer object.
 * @private
 */
goog.net.FileDownloader.prototype.fileWriterSuccess_ = function(
    download, writer) {
  if (download.cancelled) {
    download.file.remove();
    return;
  }

  download.writer = writer;
  writer.write(/** @type {!Blob} */ (download.blob));
  this.eventHandler_.listenOnce(
      writer,
      goog.fs.FileSaver.EventType.WRITE_END,
      goog.bind(this.writeEnd_, this, download));
};


/**
 * The callback called when file writing ends, whether or not it's successful.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     this download.
 * @private
 */
goog.net.FileDownloader.prototype.writeEnd_ = function(download) {
  if (download.cancelled || download.writer.getError()) {
    this.error_(download, download.writer.getError());
    return;
  }

  delete this.downloads_[download.url];
  download.deferred.callback(download.blob);
};


/**
 * The error callback for all asynchronous operations. Ensures that all stages
 * of a given download are cleaned up, and emits the error event.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     this download.
 * @param {goog.fs.Error=} opt_err The file error object. Only defined if the
 *     error was raised by the file API.
 * @private
 */
goog.net.FileDownloader.prototype.error_ = function(download, opt_err) {
  if (download.file) {
    download.file.remove();
  }

  if (download.cancelled) {
    return;
  }

  delete this.downloads_[download.url];
  download.deferred.errback(
      new goog.net.FileDownloader.Error(download, opt_err));
};


/**
 * Abort the download of the given URL.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download to abort.
 * @private
 */
goog.net.FileDownloader.prototype.cancel_ = function(download) {
  goog.dispose(download);
  delete this.downloads_[download.url];
};


/**
 * Get the directory for a given URL. If the directory already exists when this
 * is called, it will contain exactly one file: the downloaded file.
 *
 * This not only calls the FileSystem API's getFile method, but attempts to
 * distribute the files so that they don't overload the filesystem. The spec
 * says directories can't contain more than 5000 files
 * (http://www.w3.org/TR/file-system-api/#directories), so this ensures that
 * each file is put into a subdirectory based on its SHA1 hash.
 *
 * All parameters are the same as in the FileSystem API's Entry#getFile method.
 *
 * @param {string} url The URL corresponding to the directory to get.
 * @param {goog.fs.DirectoryEntry.Behavior} behavior The behavior to pass to the
 *     underlying method.
 * @return {!goog.async.Deferred} The deferred DirectoryEntry object.
 * @private
 */
goog.net.FileDownloader.prototype.getDir_ = function(url, behavior) {
  // 3 hex digits provide 16**3 = 4096 different possible dirnames, which is
  // less than the maximum of 5000 entries. Downloaded files should be
  // distributed roughly evenly throughout the directories due to the hash
  // function, allowing many more than 5000 files to be downloaded.
  //
  // The leading ` ensures that no illegal dirnames are accidentally used. % was
  // previously used, but Chrome has a bug (as of 12.0.725.0 dev) where
  // filenames are URL-decoded before checking their validity, so filenames
  // containing e.g. '%3f' (the URL-encoding of :, an invalid character) are
  // rejected.
  var dirname = '`' + Math.abs(goog.crypt.hash32.encodeString(url)).
      toString(16).substring(0, 3);

  return this.dir_.
      getDirectory(dirname, goog.fs.DirectoryEntry.Behavior.CREATE).
      addCallback(function(dir) {
        return dir.getDirectory(this.sanitize_(url), behavior);
      }, this);
};


/**
 * Get the file for a given URL. This will only retrieve files that have already
 * been saved; it shouldn't be used for creating the file in the first place.
 * This is because the filename isn't necessarily determined by the URL, but by
 * the headers of the XHR response.
 *
 * @param {string} url The URL corresponding to the file to get.
 * @return {!goog.async.Deferred} The deferred FileEntry object.
 * @private
 */
goog.net.FileDownloader.prototype.getFile_ = function(url) {
  return this.getDir_(url, goog.fs.DirectoryEntry.Behavior.DEFAULT).
      addCallback(function(dir) {
        return dir.listDirectory().addCallback(function(files) {
          goog.asserts.assert(files.length == 1);
          // If the filesystem somehow gets corrupted and we end up with an
          // empty directory here, it makes sense to just return the normal
          // file-not-found error.
          return files[0] || dir.getFile('file');
        });
      });
};


/**
 * Sanitize a string so it can be safely used as a file or directory name for
 * the FileSystem API.
 *
 * @param {string} str The string to sanitize.
 * @return {string} The sanitized string.
 * @private
 */
goog.net.FileDownloader.prototype.sanitize_ = function(str) {
  // Add a prefix, since certain prefixes are disallowed for paths. None of the
  // disallowed prefixes start with '`'. We use ` rather than % for escaping the
  // filename due to a Chrome bug (as of 12.0.725.0 dev) where filenames are
  // URL-decoded before checking their validity, so filenames containing e.g.
  // '%3f' (the URL-encoding of :, an invalid character) are rejected.
  return '`' + str.replace(/[\/\\<>:?*"|%`]/g, encodeURIComponent).
      replace(/%/g, '`');
};


/**
 * Gets the filename specified by the XHR. This first attempts to parse the
 * Content-Disposition header for a filename and, failing that, falls back on
 * deriving the filename from the URL.
 *
 * @param {!goog.net.XhrIo} xhr The XHR containing the response headers.
 * @return {string} The filename.
 * @private
 */
goog.net.FileDownloader.prototype.getName_ = function(xhr) {
  var disposition = xhr.getResponseHeader('Content-Disposition');
  var match = disposition &&
      disposition.match(/^attachment *; *filename="(.*)"$/i);
  if (match) {
    // The Content-Disposition header allows for arbitrary backslash-escaped
    // characters (usually " and \). We want to unescape them before using them
    // in the filename.
    return match[1].replace(/\\(.)/g, '$1');
  }

  return this.urlToName_(xhr.getLastUri());
};


/**
 * Extracts the basename from a URL.
 *
 * @param {string} url The URL.
 * @return {string} The basename.
 * @private
 */
goog.net.FileDownloader.prototype.urlToName_ = function(url) {
  var segments = url.split('/');
  return segments[segments.length - 1];
};


/**
 * Remove all event listeners for an XHR and release it back into the pool.
 *
 * @param {!goog.net.XhrIo} xhr The XHR to free.
 * @private
 */
goog.net.FileDownloader.prototype.freeXhr_ = function(xhr) {
  goog.events.removeAll(xhr);
  this.pool_.addFreeObject(xhr);
};


/** @override */
goog.net.FileDownloader.prototype.disposeInternal = function() {
  delete this.dir_;
  goog.dispose(this.eventHandler_);
  delete this.eventHandler_;
  goog.object.forEach(this.downloads_, function(download) {
    download.deferred.cancel();
  }, this);
  delete this.downloads_;
  goog.dispose(this.pool_);
  delete this.pool_;

  goog.net.FileDownloader.base(this, 'disposeInternal');
};



/**
 * The error object for FileDownloader download errors.
 *
 * @param {!goog.net.FileDownloader.Download_} download The download object for
 *     the download in question.
 * @param {goog.fs.Error=} opt_fsErr The file error object, if this was a file
 *     error.
 *
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.net.FileDownloader.Error = function(download, opt_fsErr) {
  goog.net.FileDownloader.Error.base(
      this, 'constructor', 'Error capturing URL ' + download.url);

  /**
   * The URL the event relates to.
   * @type {string}
   */
  this.url = download.url;

  if (download.xhr) {
    this.xhrStatus = download.xhr.getStatus();
    this.xhrErrorCode = download.xhr.getLastErrorCode();
    this.message += ': XHR failed with status ' + this.xhrStatus +
        ' (error code ' + this.xhrErrorCode + ')';
  } else if (opt_fsErr) {
    this.fileError = opt_fsErr;
    this.message += ': file API failed (' + opt_fsErr.message + ')';
  }
};
goog.inherits(goog.net.FileDownloader.Error, goog.debug.Error);


/**
 * The status of the XHR. Only set if the error was caused by an XHR failure.
 * @type {number|undefined}
 */
goog.net.FileDownloader.Error.prototype.xhrStatus;


/**
 * The error code of the XHR. Only set if the error was caused by an XHR
 * failure.
 * @type {goog.net.ErrorCode|undefined}
 */
goog.net.FileDownloader.Error.prototype.xhrErrorCode;


/**
 * The file API error. Only set if the error was caused by the file API.
 * @type {goog.fs.Error|undefined}
 */
goog.net.FileDownloader.Error.prototype.fileError;



/**
 * A struct containing the data for a single download.
 *
 * @param {string} url The URL for the file being downloaded.
 * @param {!goog.net.FileDownloader} downloader The parent FileDownloader.
 * @extends {goog.Disposable}
 * @constructor
 * @private
 */
goog.net.FileDownloader.Download_ = function(url, downloader) {
  goog.net.FileDownloader.Download_.base(this, 'constructor');

  /**
   * The URL for the file being downloaded.
   * @type {string}
   */
  this.url = url;

  /**
   * The Deferred that will be fired when the download is complete.
   * @type {!goog.async.Deferred}
   */
  this.deferred = new goog.async.Deferred(
      goog.bind(downloader.cancel_, downloader, this));

  /**
   * Whether this download has been cancelled by the user.
   * @type {boolean}
   */
  this.cancelled = false;

  /**
   * The XhrIo object for downloading the file. Only set once it's been
   * retrieved from the pool.
   * @type {goog.net.XhrIo}
   */
  this.xhr = null;

  /**
   * The name of the blob being downloaded. Only sey once the XHR has completed,
   * if it completed successfully.
   * @type {?string}
   */
  this.name = null;

  /**
   * The downloaded blob. Only set once the XHR has completed, if it completed
   * successfully.
   * @type {Blob}
   */
  this.blob = null;

  /**
   * The file entry where the blob is to be stored. Only set once it's been
   * loaded from the filesystem.
   * @type {goog.fs.FileEntry}
   */
  this.file = null;

  /**
   * The file writer for writing the blob to the filesystem. Only set once it's
   * been loaded from the filesystem.
   * @type {goog.fs.FileWriter}
   */
  this.writer = null;
};
goog.inherits(goog.net.FileDownloader.Download_, goog.Disposable);


/** @override */
goog.net.FileDownloader.Download_.prototype.disposeInternal = function() {
  this.cancelled = true;
  if (this.xhr) {
    this.xhr.abort();
  } else if (this.writer && this.writer.getReadyState() ==
             goog.fs.FileSaver.ReadyState.WRITING) {
    this.writer.abort();
  }

  goog.net.FileDownloader.Download_.base(this, 'disposeInternal');
};
