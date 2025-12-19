// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides a files drag and drop event detector. It works on
 * HTML5 browsers.
 *
 * @see ../demos/filedrophandler.html
 */

goog.provide('goog.events.FileDropHandler');
goog.provide('goog.events.FileDropHandler.EventType');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.log');
goog.require('goog.log.Level');



/**
 * A files drag and drop event detector. Gets an `element` as parameter
 * and fires `goog.events.FileDropHandler.EventType.DROP` event when files
 * are dropped in the `element`.
 *
 * @param {Element|Document} element The element or document to listen on.
 * @param {boolean=} opt_preventDropOutside Whether to prevent a drop on the
 *     area outside the `element`. Default false.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @final
 */
goog.events.FileDropHandler = function(element, opt_preventDropOutside) {
  goog.events.EventTarget.call(this);

  /**
   * Handler for drag/drop events.
   * @type {!goog.events.EventHandler<!goog.events.FileDropHandler>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  var doc = element;
  if (opt_preventDropOutside) {
    doc = goog.dom.getOwnerDocument(element);
  }

  // Add dragenter listener to the owner document of the element.
  this.eventHandler_.listen(
      doc, goog.events.EventType.DRAGENTER, this.onDocDragEnter_);

  // Add dragover listener to the owner document of the element only if the
  // document is not the element itself.
  if (doc != element) {
    this.eventHandler_.listen(
        doc, goog.events.EventType.DRAGOVER, this.onDocDragOver_);
  }

  // Add dragover and drop listeners to the element.
  this.eventHandler_.listen(
      element, goog.events.EventType.DRAGOVER, this.onElemDragOver_);
  this.eventHandler_.listen(
      element, goog.events.EventType.DROP, this.onElemDrop_);
};
goog.inherits(goog.events.FileDropHandler, goog.events.EventTarget);


/**
 * Whether the drag event contains files. It is initialized only in the
 * dragenter event. It is used in all the drag events to prevent default actions
 * only if the drag contains files. Preventing default actions is necessary to
 * go from dragenter to dragover and from dragover to drop. However we do not
 * always want to prevent default actions, e.g. when the user drags text or
 * links on a text area we should not prevent the browser default action that
 * inserts the text in the text area. It is also necessary to stop propagation
 * when handling drag events on the element to prevent them from propagating
 * to the document.
 * @private
 * @type {boolean}
 */
goog.events.FileDropHandler.prototype.dndContainsFiles_ = false;


/**
 * A logger, used to help us debug the algorithm.
 * @type {goog.log.Logger}
 * @private
 */
goog.events.FileDropHandler.prototype.logger_ =
    goog.log.getLogger('goog.events.FileDropHandler');


/**
 * The types of events fired by this class.
 * @enum {string}
 */
goog.events.FileDropHandler.EventType = {
  DROP: goog.events.EventType.DROP
};


/** @override */
goog.events.FileDropHandler.prototype.disposeInternal = function() {
  goog.events.FileDropHandler.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
};


/**
 * Dispatches the DROP event.
 * @param {goog.events.BrowserEvent} e The underlying browser event.
 * @private
 */
goog.events.FileDropHandler.prototype.dispatch_ = function(e) {
  goog.log.fine(this.logger_, 'Firing DROP event...');
  var event = new goog.events.BrowserEvent(e.getBrowserEvent());
  event.type = goog.events.FileDropHandler.EventType.DROP;
  this.dispatchEvent(event);
};


/**
 * Handles dragenter on the document.
 * @param {goog.events.BrowserEvent} e The dragenter event.
 * @private
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.events.FileDropHandler.prototype.onDocDragEnter_ = function(e) {
  goog.log.log(
      this.logger_, goog.log.Level.FINER,
      '"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type);
  var dt = e.getBrowserEvent().dataTransfer;
  // Check whether the drag event contains files.
  this.dndContainsFiles_ = !!(
      dt && ((dt.types && (goog.array.contains(dt.types, 'Files') ||
                           goog.array.contains(dt.types, 'public.file-url'))) ||
             (dt.files && dt.files.length > 0)));
  // If it does
  if (this.dndContainsFiles_) {
    // Prevent default actions.
    e.preventDefault();
  }
  goog.log.log(
      this.logger_, goog.log.Level.FINER,
      'dndContainsFiles_: ' + this.dndContainsFiles_);
};


/**
 * Handles dragging something over the document.
 * @param {goog.events.BrowserEvent} e The dragover event.
 * @private
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.events.FileDropHandler.prototype.onDocDragOver_ = function(e) {
  goog.log.log(
      this.logger_, goog.log.Level.FINEST,
      '"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type);
  if (this.dndContainsFiles_) {
    // Prevent default actions.
    e.preventDefault();
    // Disable the drop on the document outside the drop zone.
    var dt = e.getBrowserEvent().dataTransfer;
    dt.dropEffect = 'none';
  }
};


/**
 * Handles dragging something over the element (drop zone).
 * @param {goog.events.BrowserEvent} e The dragover event.
 * @private
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.events.FileDropHandler.prototype.onElemDragOver_ = function(e) {
  goog.log.log(
      this.logger_, goog.log.Level.FINEST,
      '"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type);
  if (this.dndContainsFiles_) {
    // Prevent default actions and stop the event from propagating further to
    // the document. Both lines are needed! (See comment above).
    e.preventDefault();
    e.stopPropagation();
    // Allow the drop on the drop zone.
    var dt = e.getBrowserEvent().dataTransfer;

    // IE bug #811625 (https://goo.gl/UWuxX0) will throw error SCRIPT65535
    // when attempting to set property effectAllowed on IE10+.
    // See more: https://github.com/google/closure-library/issues/485.
    try {
      dt.effectAllowed = 'all';
    } catch (err) {
    }
    dt.dropEffect = 'copy';
  }
};


/**
 * Handles dropping something onto the element (drop zone).
 * @param {goog.events.BrowserEvent} e The drop event.
 * @private
 * @suppress {strictMissingProperties} Part of the go/strict_warnings_migration
 */
goog.events.FileDropHandler.prototype.onElemDrop_ = function(e) {
  goog.log.log(
      this.logger_, goog.log.Level.FINER,
      '"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type);
  // If the drag and drop event contains files.
  if (this.dndContainsFiles_) {
    // Prevent default actions and stop the event from propagating further to
    // the document. Both lines are needed! (See comment above).
    e.preventDefault();
    e.stopPropagation();
    // Dispatch DROP event.
    this.dispatch_(e);
  }
};
