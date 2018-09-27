// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Image loader utility class.  Useful when an application needs
 * to preload multiple images, for example so they can be sized.
 *
 * @author attila@google.com (Attila Bodis)
 */

goog.provide('goog.net.ImageLoader');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.object');
goog.require('goog.userAgent');



/**
 * Image loader utility class.  Raises a {@link goog.events.EventType.LOAD}
 * event for each image loaded, with an {@link Image} object as the target of
 * the event, normalized to have {@code naturalHeight} and {@code naturalWidth}
 * attributes.
 *
 * To use this class, run:
 *
 * <pre>
 *   var imageLoader = new goog.net.ImageLoader();
 *   goog.events.listen(imageLoader, goog.net.EventType.COMPLETE,
 *       function(e) { ... });
 *   imageLoader.addImage("image_id", "http://path/to/image.gif");
 *   imageLoader.start();
 * </pre>
 *
 * The start() method must be called to start image loading.  Images can be
 * added and removed after loading has started, but only those images added
 * before start() was called will be loaded until start() is called again.
 * A goog.net.EventType.COMPLETE event will be dispatched only once all
 * outstanding images have completed uploading.
 *
 * @param {Element=} opt_parent An optional parent element whose document object
 *     should be used to load images.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.net.ImageLoader = function(opt_parent) {
  goog.events.EventTarget.call(this);

  /**
   * Map of image IDs to their request including their image src, used to keep
   * track of the images to load.  Once images have started loading, they're
   * removed from this map.
   * @type {!Object<!goog.net.ImageLoader.ImageRequest_>}
   * @private
   */
  this.imageIdToRequestMap_ = {};

  /**
   * Map of image IDs to their image element, used only for images that are in
   * the process of loading.  Used to clean-up event listeners and to know
   * when we've completed loading images.
   * @type {!Object<string, !Element>}
   * @private
   */
  this.imageIdToImageMap_ = {};

  /**
   * Event handler object, used to keep track of onload and onreadystatechange
   * listeners.
   * @type {!goog.events.EventHandler<!goog.net.ImageLoader>}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);

  /**
   * The parent element whose document object will be used to load images.
   * Useful if you want to load the images from a window other than the current
   * window in order to control the Referer header sent when the image is
   * loaded.
   * @type {Element|undefined}
   * @private
   */
  this.parent_ = opt_parent;
};
goog.inherits(goog.net.ImageLoader, goog.events.EventTarget);


/**
 * The type of image request to dispatch, if this is a CORS-enabled image
 * request. CORS-enabled images can be reused in canvas elements without them
 * being tainted. The server hosting the image should include the appropriate
 * CORS header.
 * @see https://developer.mozilla.org/en-US/docs/HTML/CORS_Enabled_Image
 * @enum {string}
 */
goog.net.ImageLoader.CorsRequestType = {
  ANONYMOUS: 'anonymous',
  USE_CREDENTIALS: 'use-credentials'
};


/**
 * Describes a request for an image. This includes its URL and its CORS-request
 * type, if any.
 * @typedef {{
 *   src: string,
 *   corsRequestType: ?goog.net.ImageLoader.CorsRequestType
 * }}
 * @private
 */
goog.net.ImageLoader.ImageRequest_;


/**
 * An array of event types to listen to on images.  This is browser dependent.
 *
 * For IE 10 and below, Internet Explorer doesn't reliably raise LOAD events
 * on images, so we must use READY_STATE_CHANGE.  Since the image is cached
 * locally, IE won't fire the LOAD event while the onreadystate event is fired
 * always. On the other hand, the ERROR event is always fired whenever the image
 * is not loaded successfully no matter whether it's cached or not.
 *
 * In IE 11, onreadystatechange is removed and replaced with onload:
 *
 * http://msdn.microsoft.com/en-us/library/ie/ms536957(v=vs.85).aspx
 * http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.85).aspx
 *
 * @type {!Array<string>}
 * @private
 */
goog.net.ImageLoader.IMAGE_LOAD_EVENTS_ = [
  goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('11') ?
      goog.net.EventType.READY_STATE_CHANGE :
      goog.events.EventType.LOAD,
  goog.net.EventType.ABORT, goog.net.EventType.ERROR
];


/**
 * Adds an image to the image loader, and associates it with the given ID
 * string.  If an image with that ID already exists, it is silently replaced.
 * When the image in question is loaded, the target of the LOAD event will be
 * an {@code Image} object with {@code id} and {@code src} attributes based on
 * these arguments.
 * @param {string} id The ID of the image to load.
 * @param {string|Image} image Either the source URL of the image or the HTML
 *     image element itself (or any object with a {@code src} property, really).
 * @param {!goog.net.ImageLoader.CorsRequestType=} opt_corsRequestType The type
 *     of CORS request to use, if any.
 */
goog.net.ImageLoader.prototype.addImage = function(
    id, image, opt_corsRequestType) {
  var src = goog.isString(image) ? image : image.src;
  if (src) {
    // For now, we just store the source URL for the image.
    this.imageIdToRequestMap_[id] = {
      src: src,
      corsRequestType: goog.isDef(opt_corsRequestType) ? opt_corsRequestType :
                                                         null
    };
  }
};


/**
 * Removes the image associated with the given ID string from the image loader.
 * If the image was previously loading, removes any listeners for its events
 * and dispatches a COMPLETE event if all remaining images have now completed.
 * @param {string} id The ID of the image to remove.
 */
goog.net.ImageLoader.prototype.removeImage = function(id) {
  delete this.imageIdToRequestMap_[id];

  var image = this.imageIdToImageMap_[id];
  if (image) {
    delete this.imageIdToImageMap_[id];

    // Stop listening for events on the image.
    this.handler_.unlisten(
        image, goog.net.ImageLoader.IMAGE_LOAD_EVENTS_, this.onNetworkEvent_);

    // If this was the last image, raise a COMPLETE event.
    if (goog.object.isEmpty(this.imageIdToImageMap_) &&
        goog.object.isEmpty(this.imageIdToRequestMap_)) {
      this.dispatchEvent(goog.net.EventType.COMPLETE);
    }
  }
};


/**
 * Starts loading all images in the image loader in parallel.  Raises a LOAD
 * event each time an image finishes loading, and a COMPLETE event after all
 * images have finished loading.
 */
goog.net.ImageLoader.prototype.start = function() {
  // Iterate over the keys, rather than the full object, to essentially clone
  // the initial queued images in case any event handlers decide to add more
  // images before this loop has finished executing.
  var imageIdToRequestMap = this.imageIdToRequestMap_;
  goog.array.forEach(goog.object.getKeys(imageIdToRequestMap), function(id) {
    var imageRequest = imageIdToRequestMap[id];
    if (imageRequest) {
      delete imageIdToRequestMap[id];
      this.loadImage_(imageRequest, id);
    }
  }, this);
};


/**
 * Creates an {@code Image} object with the specified ID and source URL, and
 * listens for network events raised as the image is loaded.
 * @param {!goog.net.ImageLoader.ImageRequest_} imageRequest The request data.
 * @param {string} id The unique ID of the image to load.
 * @private
 */
goog.net.ImageLoader.prototype.loadImage_ = function(imageRequest, id) {
  if (this.isDisposed()) {
    // When loading an image in IE7 (and maybe IE8), the error handler
    // may fire before we yield JS control. If the error handler
    // dispose the ImageLoader, this method will throw exception.
    return;
  }

  var image;
  if (this.parent_) {
    var dom = goog.dom.getDomHelper(this.parent_);
    image = dom.createDom(goog.dom.TagName.IMG);
  } else {
    image = new Image();
  }

  if (imageRequest.corsRequestType) {
    image.crossOrigin = imageRequest.corsRequestType;
  }

  this.handler_.listen(
      image, goog.net.ImageLoader.IMAGE_LOAD_EVENTS_, this.onNetworkEvent_);
  this.imageIdToImageMap_[id] = image;

  image.id = id;
  image.src = imageRequest.src;
};


/**
 * Handles net events (READY_STATE_CHANGE, LOAD, ABORT, and ERROR).
 * @param {goog.events.Event} evt The network event to handle.
 * @private
 */
goog.net.ImageLoader.prototype.onNetworkEvent_ = function(evt) {
  var image = /** @type {Element} */ (evt.currentTarget);

  if (!image) {
    return;
  }

  if (evt.type == goog.net.EventType.READY_STATE_CHANGE) {
    // This implies that the user agent is IE; see loadImage_().
    // Noe that this block is used to check whether the image is ready to
    // dispatch the COMPLETE event.
    if (image.readyState == goog.net.EventType.COMPLETE) {
      // This is the IE equivalent of a LOAD event.
      evt.type = goog.events.EventType.LOAD;
    } else {
      // This may imply that the load failed.
      // Note that the image has only the following states:
      //   * uninitialized
      //   * loading
      //   * complete
      // When the ERROR or the ABORT event is fired, the readyState
      // will be either uninitialized or loading and we'd ignore those states
      // since they will be handled separately (eg: evt.type = 'ERROR').

      // Notes from MSDN : The states through which an object passes are
      // determined by that object. An object can skip certain states
      // (for example, interactive) if the state does not apply to that object.
      // see http://msdn.microsoft.com/en-us/library/ms534359(VS.85).aspx

      // The image is not loaded, ignore.
      return;
    }
  }

  // Add natural width/height properties for non-Gecko browsers.
  if (typeof image.naturalWidth == 'undefined') {
    if (evt.type == goog.events.EventType.LOAD) {
      image.naturalWidth = image.width;
      image.naturalHeight = image.height;
    } else {
      // This implies that the image fails to be loaded.
      image.naturalWidth = 0;
      image.naturalHeight = 0;
    }
  }

  // Redispatch the event on behalf of the image. Note that the external
  // listener may dispose this instance.
  this.dispatchEvent({type: evt.type, target: image});

  if (this.isDisposed()) {
    // If instance was disposed by listener, exit this function.
    return;
  }

  this.removeImage(image.id);
};


/** @override */
goog.net.ImageLoader.prototype.disposeInternal = function() {
  delete this.imageIdToRequestMap_;
  delete this.imageIdToImageMap_;
  goog.dispose(this.handler_);

  goog.net.ImageLoader.superClass_.disposeInternal.call(this);
};
