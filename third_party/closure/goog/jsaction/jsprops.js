// Copyright 2011 The Closure Library Authors. All Rights Reserved
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
 * @fileoverview Functions to access/set properties serialized into
 * an attribute on DOM nodes. Their main purpose is to provide a mechanism
 * to pass parameters to jsaction handlers. However, these functions are
 * standalone and might be useful for other purposes as well.
 *
 * We use attribute 'jsprops' to store these properties. It contains a
 * dictionary from property name to value (serialized as JSON). Hence, data
 * that needs to made available to jsaction handler can be embeded in the
 * markup at rendering time. The handler then can use
 * goog.jsaction.jsprops.get and goog.jsaction.jsprops.set to retrieve
 * and modify properties.
 *
 * Example:
 *
 * <a jsaction="lightbox.showPhoto" jsprops="{id:'93kcgn9w7'}">Show pic</a>
 *
 * Then, the corresponding action can retrieve the value like this:
 *
 * function(context) {
 *   var photoId = goog.jsaction.jsprops.get(context.getElement(), 'id');
 *   // Proceed to actually show image...
 * }
 *
 */


goog.provide('goog.jsaction.jsprops');

goog.require('goog.json');


/**
 * Constant for name of the 'jsprops'-attribute.
 * @type {string}
 * @private
 */
goog.jsaction.jsprops.ATTRIBUTE_NAME_JSPROPS_ = 'jsprops';


/**
 * Constant for the name of the property attached to DOM nodes which
 * contains an object holding properties. This serves as cache to avoid
 * repeatedly accessing the DOM attribute and parsing its content.
 * @type {string}
 * @private
 */
goog.jsaction.jsprops.PROPERTY_KEY_JSPROPS_ = '__jsprops';


/**
 * Retrieves a property from an element.
 * @param {!Element} elem The element.
 * @param {string} name The property name.
 * @return {*} The property value.
 */
goog.jsaction.jsprops.get = function(elem, name) {
  return goog.jsaction.jsprops.getPropertiesObject_(elem)[name];
};


/**
 * Stores a property on an element.
 * @param {!Element} elem The element.
 * @param {string} name The property name.
 * @param {*} value The value to set. Objects must be JSON serializable if
 *     they are to be reflected back into the 'jsprops' attribute.
 * @param {boolean=} opt_updateAttribute Whether to update the attribute value
 *     (see updateAttribute() for details). Default is false.
 */
goog.jsaction.jsprops.set = function(elem, name, value, opt_updateAttribute) {
  goog.jsaction.jsprops.getPropertiesObject_(elem)[name] = value;
  if (opt_updateAttribute) {
    goog.jsaction.jsprops.updateAttribute(elem);
  }
};


/**
 * Writes all properties back into the 'jsprops' attribute. Call this method
 * if you need values to persist when the element is subsequently cloned,
 * as attributes are copied when cloning an element, but properties added to
 * the corresponding JS object are not.
 * @param {!Element} elem The element.
 */
goog.jsaction.jsprops.updateAttribute = function(elem) {
  elem.setAttribute(
      goog.jsaction.jsprops.ATTRIBUTE_NAME_JSPROPS_,
      goog.json.serialize(goog.jsaction.jsprops.getPropertiesObject_(elem)));
};


/**
 * Parses the 'jsprops' attribute and returns them as dictionary.
 * @param {!Element} elem The element.
 * @return {Object} The properies object.
 * @private
 */
goog.jsaction.jsprops.getPropertiesObject_ = function(elem) {
  var props = elem[goog.jsaction.jsprops.PROPERTY_KEY_JSPROPS_];
  if (!props) {
    // If the property isn't set, we parse the attribute (if present) and
    // remember it.
    var attrVal = elem.getAttribute(
        goog.jsaction.jsprops.ATTRIBUTE_NAME_JSPROPS_);
    if (attrVal) {
      props = goog.json.unsafeParse(attrVal);
    } else {
      props = {};
    }
    elem[goog.jsaction.jsprops.PROPERTY_KEY_JSPROPS_] = props;
  }
  return props;
};
