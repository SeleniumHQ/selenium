// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Simple image loader, used for preloading.
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.labs.net.image');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.result.SimpleResult');
goog.require('goog.userAgent');


/**
 * Loads a single image.  Useful for preloading images. May be combined with
 * goog.result.combine to preload many images.
 *
 * @param {string} uri URI of the image.
 * @param {(Image|function(): !Image)=} opt_image If present, instead of
 *     creating a new Image instance the function will use the passed Image
 *     instance or the result of calling the Image factory respectively. This
 *     can be used to control exactly how Image instances are created, for
 *     example if they should be created in a particular document element, or
 *     have fields that will trigger CORS image fetches.
 * @return {!goog.result.Result} An asyncronous result that will succeed
 *     if the image successfully loads or error if the image load fails.
 */
goog.labs.net.image.load = function(uri, opt_image) {
  var image;
  if (!goog.isDef(opt_image)) {
    image = new Image();
  } else if (goog.isFunction(opt_image)) {
    image = opt_image();
  } else {
    image = opt_image;
  }

  // IE's load event on images can be buggy.  Instead, we wait for
  // readystatechange events and check if readyState is 'complete'.
  // See:
  // http://msdn.microsoft.com/en-us/library/ie/ms536957(v=vs.85).aspx
  // http://msdn.microsoft.com/en-us/library/ie/ms534359(v=vs.85).aspx
  var loadEvent = goog.userAgent.IE ? goog.net.EventType.READY_STATE_CHANGE :
      goog.events.EventType.LOAD;

  var result = new goog.result.SimpleResult();

  var handler = new goog.events.EventHandler();
  handler.listen(
      image,
      [loadEvent, goog.net.EventType.ABORT, goog.net.EventType.ERROR],
      function(e) {

        // We only registered listeners for READY_STATE_CHANGE for IE.
        // If readyState is now COMPLETE, the image has loaded.
        // See related comment above.
        if (e.type == goog.net.EventType.READY_STATE_CHANGE &&
            image.readyState != goog.net.EventType.COMPLETE) {
          return;
        }

        // At this point, we know whether the image load was successful
        // and no longer care about image events.
        goog.dispose(handler);

        // Whether the image successfully loaded.
        if (e.type == loadEvent) {
          result.setValue(image);
        } else {
          result.setError();
        }
      });

  // Initiate the image request.
  image.src = uri;

  return result;
};
