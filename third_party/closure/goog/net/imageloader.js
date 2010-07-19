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
*
*
 */

goog.provide('goog.net.ImageLoader');

goog.require('goog.dom');
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
 * @param {Element=} opt_parent An optional parent element whose document object
 *     should be used to load images.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.ImageLoader = function(opt_parent) {
  goog.events.EventTarget.call(this);
  this.images_ = {};
  this.handler_ = new goog.events.EventHandler(this);
  this.parent_ = opt_parent;
};
goog.inherits(goog.net.ImageLoader, goog.events.EventTarget);


/**
 * Map of image IDs to images src, used to keep track of the images to load.
 * @private
 * @type {Object.<string, string>}
 */
goog.net.ImageLoader.prototype.images_;


/**
 * Event handler object, used to keep track of onload and onreadystatechange
 * listeners.
 * @private
 * @type {goog.events.EventHandler}
 */
goog.net.ImageLoader.prototype.handler_;


/**
 * The parent element whose document object will be used to load images.
 * Useful if you want to load the images from a window other than the current
 * window in order to control the Referer header sent when the image is loaded.
 * @type {(Element|undefined)}
 * @private
 */
goog.net.ImageLoader.prototype.parent_;


/**
 * Adds an image to the image loader, and associates it with the given ID
 * string.  If an image with that ID already exists, it is silently replaced.
 * When the image in question is loaded, the target of the LOAD event will be
 * an {@code Image} object with {@code id} and {@code src} attributes based on
 * these arguments.
 * @param {string} id The ID of the image to load.
 * @param {string|Image} image Either the source URL of the image or the HTML
 *     image element itself (or any object with a {@code src} property, really).
 */
goog.net.ImageLoader.prototype.addImage = function(id, image) {
  var src = goog.isString(image) ? image : image.src;
  if (src) {
    // For now, we just store the source URL for the image.
    this.images_[id] = src;
  }
};


/**
 * Removes the image associated with the given ID string from the image loader.
 * @param {string} id The ID of the image to remove.
 */
goog.net.ImageLoader.prototype.removeImage = function(id) {
  goog.object.remove(this.images_, id);
};


/**
 * Starts loading all images in the image loader in parallel.  Raises a LOAD
 * event each time an image finishes loading, and a COMPLETE event after all
 * images have finished loading.
 */
goog.net.ImageLoader.prototype.start = function() {
  goog.object.forEach(this.images_, this.loadImage_, this);
};


/**
 * Creates an {@code Image} object with the specified ID and source URL, and
 * listens for network events raised as the image is loaded.
 * @private
 * @param {string} src The image source URL.
 * @param {string} id The unique ID of the image to load.
 */
goog.net.ImageLoader.prototype.loadImage_ = function(src, id) {
  var image;
  if (this.parent_) {
    var dom = goog.dom.getDomHelper(this.parent_);
    image = dom.createDom('img');
  } else {
    image = new Image();
  }

  // Internet Explorer doesn't reliably raise LOAD events on images, so we must
  // use READY_STATE_CHANGE (thanks, Jeff!).
  // If the image is cached locally, IE won't fire the LOAD event while the
  // onreadystate event is fired always. On the other hand, the ERROR event
  // is always fired whenever the image is not loaded successfully no matter
  // whether it's cached or not.

  var loadEvent = goog.userAgent.IE ? goog.net.EventType.READY_STATE_CHANGE :
      goog.events.EventType.LOAD;
  this.handler_.listen(image, [
    loadEvent, goog.net.EventType.ABORT, goog.net.EventType.ERROR
  ], this.onNetworkEvent_);

  image.id = id;
  image.src = src;
};


/**
 * Handles net events (READY_STATE_CHANGE, LOAD, ABORT, and ERROR).
 * @private
 * @param {goog.events.Event} evt The network event to handle.
 */
goog.net.ImageLoader.prototype.onNetworkEvent_ = function(evt) {
  var image = evt.currentTarget;

  if (!image) {
    return;
  }

  if (evt.type == goog.net.EventType.READY_STATE_CHANGE) {
    // This implies that the user agent is IE; see loadImage()_.
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
      image.naturalWidth = image.width
      image.naturalHeight = image.height;
    } else {
      // This implies that the image fails to be loaded.
      image.naturalWidth = 0;
      image.naturalHeight = 0;
    }
  }

  // Redispatch the event on behalf of the image.
  this.dispatchEvent({type: evt.type, target: image});

  // Remove the image from the map.
  goog.object.remove(this.images_, image.id);

  // If this was the last image, raise a COMPLETE event.
  if (goog.object.isEmpty(this.images_)) {
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    // Unlisten for all network events.
    if (this.handler_) {
      this.handler_.removeAll();
    }
  }
};


/**
 * Disposes of the image loader.
 */
goog.net.ImageLoader.prototype.disposeInternal = function() {
  if (this.images_) {
    delete this.images_;
  }
  if (this.handler_) {
    this.handler_.dispose();
    this.handler_ = null;
  }
  goog.net.ImageLoader.superClass_.disposeInternal.call(this);
};
