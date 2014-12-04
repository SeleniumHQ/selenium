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
 * @fileoverview Creates a string of a JSON object, properly indented for
 * display.
 *
 */

goog.provide('goog.format.JsonPrettyPrinter');
goog.provide('goog.format.JsonPrettyPrinter.HtmlDelimiters');
goog.provide('goog.format.JsonPrettyPrinter.TextDelimiters');

goog.require('goog.json');
goog.require('goog.json.Serializer');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.string.format');



/**
 * Formats a JSON object as a string, properly indented for display.  Supports
 * displaying the string as text or html.  Users can also specify their own
 * set of delimiters for different environments.  For example, the JSON object:
 *
 * <code>{"a": 1, "b": {"c": null, "d": true, "e": [1, 2]}}</code>
 *
 * Will be displayed like this:
 *
 * <code>{
 *   "a": 1,
 *   "b": {
 *     "c": null,
 *     "d": true,
 *     "e": [
 *       1,
 *       2
 *     ]
 *   }
 * }</code>
 * @param {goog.format.JsonPrettyPrinter.TextDelimiters} delimiters Container
 *     for the various strings to use to delimit objects, arrays, newlines, and
 *     other pieces of the output.
 * @constructor
 */
goog.format.JsonPrettyPrinter = function(delimiters) {

  /**
   * The set of characters to use as delimiters.
   * @type {goog.format.JsonPrettyPrinter.TextDelimiters}
   * @private
   */
  this.delimiters_ = delimiters ||
      new goog.format.JsonPrettyPrinter.TextDelimiters();

  /**
   * Used to serialize property names and values.
   * @type {goog.json.Serializer}
   * @private
   */
  this.jsonSerializer_ = new goog.json.Serializer();
};


/**
 * Formats a JSON object as a string, properly indented for display.
 * @param {*} json The object to pretty print. It could be a JSON object, a
 *     string representing a JSON object, or any other type.
 * @return {string} Returns a string of the JSON object, properly indented for
 *     display.
 */
goog.format.JsonPrettyPrinter.prototype.format = function(json) {
  // If input is undefined, null, or empty, return an empty string.
  if (!goog.isDefAndNotNull(json)) {
    return '';
  }
  if (goog.isString(json)) {
    if (goog.string.isEmptyOrWhitespace(json)) {
      return '';
    }
    // Try to coerce a string into a JSON object.
    json = goog.json.parse(json);
  }
  var outputBuffer = new goog.string.StringBuffer();
  this.printObject_(json, outputBuffer, 0);
  return outputBuffer.toString();
};


/**
 * Formats a property value based on the type of the propery.
 * @param {*} val The object to format.
 * @param {goog.string.StringBuffer} outputBuffer The buffer to write the
 *     response to.
 * @param {number} indent The number of spaces to indent each line of the
 *     output.
 * @private
 */
goog.format.JsonPrettyPrinter.prototype.printObject_ = function(val,
    outputBuffer, indent) {
  var typeOf = goog.typeOf(val);
  switch (typeOf) {
    case 'null':
    case 'boolean':
    case 'number':
    case 'string':
      // "null", "boolean", "number" and "string" properties are printed
      // directly to the output.
      this.printValue_(
          /** @type {null|string|boolean|number} */ (val),
          typeOf, outputBuffer);
      break;
    case 'array':
      // Example of how an array looks when formatted
      // (using the default delimiters):
      // [
      //   1,
      //   2,
      //   3
      // ]
      outputBuffer.append(this.delimiters_.arrayStart);
      var i = 0;
      // Iterate through the array and format each element.
      for (i = 0; i < val.length; i++) {
        if (i > 0) {
          // There are multiple elements, add a comma to separate them.
          outputBuffer.append(this.delimiters_.propertySeparator);
        }
        outputBuffer.append(this.delimiters_.lineBreak);
        this.printSpaces_(indent + this.delimiters_.indent, outputBuffer);
        this.printObject_(val[i], outputBuffer,
            indent + this.delimiters_.indent);
      }
      // If there are no properties in this object, don't put a line break
      // between the beginning "[" and ending "]", so the output of an empty
      // array looks like <code>[]</code>.
      if (i > 0) {
        outputBuffer.append(this.delimiters_.lineBreak);
        this.printSpaces_(indent, outputBuffer);
      }
      outputBuffer.append(this.delimiters_.arrayEnd);
      break;
    case 'object':
      // Example of how an object looks when formatted
      // (using the default delimiters):
      // {
      //   "a": 1,
      //   "b": 2,
      //   "c": "3"
      // }
      outputBuffer.append(this.delimiters_.objectStart);
      var propertyCount = 0;
      // Iterate through the object and display each property.
      for (var name in val) {
        if (!val.hasOwnProperty(name)) {
          continue;
        }
        if (propertyCount > 0) {
          // There are multiple properties, add a comma to separate them.
          outputBuffer.append(this.delimiters_.propertySeparator);
        }
        outputBuffer.append(this.delimiters_.lineBreak);
        this.printSpaces_(indent + this.delimiters_.indent, outputBuffer);
        this.printName_(name, outputBuffer);
        outputBuffer.append(this.delimiters_.nameValueSeparator,
            this.delimiters_.space);
        this.printObject_(val[name], outputBuffer,
            indent + this.delimiters_.indent);
        propertyCount++;
      }
      // If there are no properties in this object, don't put a line break
      // between the beginning "{" and ending "}", so the output of an empty
      // object looks like <code>{}</code>.
      if (propertyCount > 0) {
        outputBuffer.append(this.delimiters_.lineBreak);
        this.printSpaces_(indent, outputBuffer);
      }
      outputBuffer.append(this.delimiters_.objectEnd);
      break;
    // Other types, such as "function", aren't expected in JSON, and their
    // behavior is undefined.  In these cases, just print an empty string to the
    // output buffer.  This allows the pretty printer to continue while still
    // outputing well-formed JSON.
    default:
      this.printValue_('', 'unknown', outputBuffer);
  }
};


/**
 * Prints a property name to the output.
 * @param {string} name The property name.
 * @param {goog.string.StringBuffer} outputBuffer The buffer to write the
 *     response to.
 * @private
 */
goog.format.JsonPrettyPrinter.prototype.printName_ = function(name,
    outputBuffer) {
  outputBuffer.append(this.delimiters_.preName,
      this.jsonSerializer_.serialize(name), this.delimiters_.postName);
};


/**
 * Prints a property name to the output.
 * @param {string|boolean|number|null} val The property value.
 * @param {string} typeOf The type of the value.  Used to customize
 *     value-specific css in the display.  This allows clients to distinguish
 *     between different types in css.  For example, the client may define two
 *     classes: "goog-jsonprettyprinter-propertyvalue-string" and
 *     "goog-jsonprettyprinter-propertyvalue-number" to assign a different color
 *     to string and number values.
 * @param {goog.string.StringBuffer} outputBuffer The buffer to write the
 *     response to.
 * @private
 */
goog.format.JsonPrettyPrinter.prototype.printValue_ = function(val,
    typeOf, outputBuffer) {
  outputBuffer.append(goog.string.format(this.delimiters_.preValue, typeOf),
      this.jsonSerializer_.serialize(val),
      goog.string.format(this.delimiters_.postValue, typeOf));
};


/**
 * Print a number of space characters to the output.
 * @param {number} indent The number of spaces to indent the line.
 * @param {goog.string.StringBuffer} outputBuffer The buffer to write the
 *     response to.
 * @private
 */
goog.format.JsonPrettyPrinter.prototype.printSpaces_ = function(indent,
    outputBuffer) {
  outputBuffer.append(goog.string.repeat(this.delimiters_.space, indent));
};



/**
 * A container for the delimiting characters used to display the JSON string
 * to a text display.  Each delimiter is a publicly accessible property of
 * the object, which makes it easy to tweak delimiters to specific environments.
 * @constructor
 */
goog.format.JsonPrettyPrinter.TextDelimiters = function() {
};


/**
 * Represents a space character in the output.  Used to indent properties a
 * certain number of spaces, and to separate property names from property
 * values.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.space = ' ';


/**
 * Represents a newline character in the output.  Used to begin a new line.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.lineBreak = '\n';


/**
 * Represents the start of an object in the output.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.objectStart = '{';


/**
 * Represents the end of an object in the output.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.objectEnd = '}';


/**
 * Represents the start of an array in the output.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.arrayStart = '[';


/**
 * Represents the end of an array in the output.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.arrayEnd = ']';


/**
 * Represents the string used to separate properties in the output.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.propertySeparator = ',';


/**
 * Represents the string used to separate property names from property values in
 * the output.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.nameValueSeparator = ':';


/**
 * A string that's placed before a property name in the output.  Useful for
 * wrapping a property name in an html tag.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.preName = '';


/**
 * A string that's placed after a property name in the output.  Useful for
 * wrapping a property name in an html tag.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.postName = '';


/**
 * A string that's placed before a property value in the output.  Useful for
 * wrapping a property value in an html tag.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.preValue = '';


/**
 * A string that's placed after a property value in the output.  Useful for
 * wrapping a property value in an html tag.
 * @type {string}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.postValue = '';


/**
 * Represents the number of spaces to indent each sub-property of the JSON.
 * @type {number}
 */
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.indent = 2;



/**
 * A container for the delimiting characters used to display the JSON string
 * to an HTML <code>&lt;pre&gt;</code> or <code>&lt;code&gt;</code> element.
 * @constructor
 * @extends {goog.format.JsonPrettyPrinter.TextDelimiters}
 * @final
 */
goog.format.JsonPrettyPrinter.HtmlDelimiters = function() {
  goog.format.JsonPrettyPrinter.TextDelimiters.call(this);
};
goog.inherits(goog.format.JsonPrettyPrinter.HtmlDelimiters,
    goog.format.JsonPrettyPrinter.TextDelimiters);


/**
 * A <code>span</code> tag thats placed before a property name.  Used to style
 * property names with CSS.
 * @type {string}
 * @override
 */
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.preName =
    '<span class="' +
    goog.getCssName('goog-jsonprettyprinter-propertyname') +
    '">';


/**
 * A closing <code>span</code> tag that's placed after a property name.
 * @type {string}
 * @override
 */
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.postName = '</span>';


/**
 * A <code>span</code> tag thats placed before a property value.  Used to style
 * property value with CSS.  The span tag's class is in the format
 * goog-jsonprettyprinter-propertyvalue-{TYPE}, where {TYPE} is the JavaScript
 * type of the object (the {TYPE} parameter is obtained from goog.typeOf).  This
 * can be used to style different value types.
 * @type {string}
 * @override
 */
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.preValue =
    '<span class="' +
    goog.getCssName('goog-jsonprettyprinter-propertyvalue') +
    '-%s">';


/**
 * A closing <code>span</code> tag that's placed after a property value.
 * @type {string}
 * @override
 */
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.postValue = '</span>';
