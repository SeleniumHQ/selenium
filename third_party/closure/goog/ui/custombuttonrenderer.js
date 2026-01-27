/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A custom button renderer that uses CSS voodoo to render a
 * button-like object with fake rounded corners.
 */

goog.provide('goog.ui.CustomButtonRenderer');

goog.require('goog.a11y.aria.Role');
goog.require('goog.asserts');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.string');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.requireType('goog.dom.DomHelper');
goog.requireType('goog.ui.Button');
goog.requireType('goog.ui.Control');
goog.requireType('goog.ui.ControlContent');



/**
 * Custom renderer for {@link goog.ui.Button}s.  Custom buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 *
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
goog.ui.CustomButtonRenderer = function() {
  'use strict';
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.CustomButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(goog.ui.CustomButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.CustomButtonRenderer.CSS_CLASS = goog.getCssName('goog-custom-button');


/**
 * Returns the button's contents wrapped in the following DOM structure:
 *
 *    <div class="goog-inline-block goog-custom-button">
 *      <div class="goog-inline-block goog-custom-button-outer-box">
 *        <div class="goog-inline-block goog-custom-button-inner-box">
 *          Contents...
 *        </div>
 *      </div>
 *    </div>
 *
 * Overrides {@link goog.ui.ButtonRenderer#createDom}.
 * @param {goog.ui.Control} control goog.ui.Button to render.
 * @return {!Element} Root element for the button.
 * @override
 */
goog.ui.CustomButtonRenderer.prototype.createDom = function(control) {
  'use strict';
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var buttonElement = button.getDomHelper().createDom(
      goog.dom.TagName.DIV,
      goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' '),
      this.createButton(button.getContent(), button.getDomHelper()));
  this.setTooltip(buttonElement, /** @type {string}*/ (button.getTooltip()));

  return buttonElement;
};


/**
 * Returns the ARIA role to be applied to custom buttons.
 * @return {goog.a11y.aria.Role|undefined} ARIA role.
 * @override
 */
goog.ui.CustomButtonRenderer.prototype.getAriaRole = function() {
  'use strict';
  return goog.a11y.aria.Role.BUTTON;
};


/**
 * Takes the button's root element and returns the parent element of the
 * button's contents.  Overrides the superclass implementation by taking
 * the nested DIV structure of custom buttons into account.
 * @param {Element} element Root element of the button whose content
 *     element is to be returned.
 * @return {Element} The button's content element (if any).
 * @override
 */
goog.ui.CustomButtonRenderer.prototype.getContentElement = function(element) {
  'use strict';
  return element && element.firstChild &&
      /** @type {Element} */ (element.firstChild.firstChild);
};


/**
 * Takes a text caption or existing DOM structure, and returns the content
 * wrapped in a pseudo-rounded-corner box.  Creates the following DOM structure:
 *
 *    <div class="goog-inline-block goog-custom-button-outer-box">
 *      <div class="goog-inline-block goog-custom-button-inner-box">
 *        Contents...
 *      </div>
 *    </div>
 *
 * Used by both {@link #createDom} and {@link #decorate}.  To be overridden
 * by subclasses.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to wrap
 *     in a box.
 * @param {goog.dom.DomHelper} dom DOM helper, used for document interaction.
 * @return {!Element} Pseudo-rounded-corner box containing the content.
 */
goog.ui.CustomButtonRenderer.prototype.createButton = function(content, dom) {
  'use strict';
  return dom.createDom(
      goog.dom.TagName.DIV,
      goog.ui.INLINE_BLOCK_CLASSNAME + ' ' +
          goog.getCssName(this.getCssClass(), 'outer-box'),
      dom.createDom(
          goog.dom.TagName.DIV,
          goog.ui.INLINE_BLOCK_CLASSNAME + ' ' +
              goog.getCssName(this.getCssClass(), 'inner-box'),
          content));
};


/**
 * Returns true if this renderer can decorate the element.  Overrides
 * {@link goog.ui.ButtonRenderer#canDecorate} by returning true if the
 * element is a DIV, false otherwise.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.CustomButtonRenderer.prototype.canDecorate = function(element) {
  'use strict';
  return element.tagName == goog.dom.TagName.DIV;
};


/**
 * Check if the button's element has a box structure.
 * @param {goog.ui.Button} button Button instance whose structure is being
 *     checked.
 * @param {Element} element Element of the button.
 * @return {boolean} Whether the element has a box structure.
 * @protected
 */
goog.ui.CustomButtonRenderer.prototype.hasBoxStructure = function(
    button, element) {
  'use strict';
  var outer = button.getDomHelper().getFirstElementChild(element);
  var outerClassName = goog.getCssName(this.getCssClass(), 'outer-box');
  if (outer && goog.dom.classlist.contains(outer, outerClassName)) {
    var inner = button.getDomHelper().getFirstElementChild(outer);
    var innerClassName = goog.getCssName(this.getCssClass(), 'inner-box');
    if (inner && goog.dom.classlist.contains(inner, innerClassName)) {
      // We have a proper box structure.
      return true;
    }
  }
  return false;
};


/**
 * Takes an existing element and decorates it with the custom button control.
 * Initializes the control's ID, content, tooltip, value, and state based
 * on the ID of the element, its child nodes, and its CSS classes, respectively.
 * Returns the element.  Overrides {@link goog.ui.ButtonRenderer#decorate}.
 * @param {goog.ui.Control} control Button instance to decorate the element.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 * @override
 */
goog.ui.CustomButtonRenderer.prototype.decorate = function(control, element) {
  'use strict';
  goog.asserts.assert(element);

  var button = /** @type {goog.ui.Button} */ (control);
  // Trim text nodes in the element's child node list; otherwise madness
  // ensues (i.e. on Gecko, buttons will flicker and shift when moused over).
  goog.ui.CustomButtonRenderer.trimTextNodes_(element, true);
  goog.ui.CustomButtonRenderer.trimTextNodes_(element, false);

  // Create the buttom dom if it has not been created.
  if (!this.hasBoxStructure(button, element)) {
    element.appendChild(
        /** @type {!Node} */ (
            this.createButton(element.childNodes, button.getDomHelper())));
  }

  goog.dom.classlist.addAll(
      element, [goog.ui.INLINE_BLOCK_CLASSNAME, this.getCssClass()]);
  return goog.ui.CustomButtonRenderer.superClass_.decorate.call(
      this, button, element);
};


/**
 * Returns the CSS class to be applied to the root element of components
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
goog.ui.CustomButtonRenderer.prototype.getCssClass = function() {
  'use strict';
  return goog.ui.CustomButtonRenderer.CSS_CLASS;
};


/**
 * Takes an element and removes leading or trailing whitespace from the start
 * or the end of its list of child nodes.  The Boolean argument determines
 * whether to trim from the start or the end of the node list.  Empty text
 * nodes are removed, and the first non-empty text node is trimmed from the
 * left or the right as appropriate.  For example,
 *
 *    <div class="goog-inline-block">
 *      #text ""
 *      #text "\n    Hello "
 *      <span>...</span>
 *      #text " World!    \n"
 *      #text ""
 *    </div>
 *
 * becomes
 *
 *    <div class="goog-inline-block">
 *      #text "Hello "
 *      <span>...</span>
 *      #text " World!"
 *    </div>
 *
 * This is essential for Gecko, where leading/trailing whitespace messes with
 * the layout of elements with -moz-inline-box (used in goog-inline-block), and
 * optional but harmless for non-Gecko.
 *
 * @param {Element} element Element whose child node list is to be trimmed.
 * @param {boolean} fromStart Whether to trim from the start or from the end.
 * @private
 */
goog.ui.CustomButtonRenderer.trimTextNodes_ = function(element, fromStart) {
  'use strict';
  if (element) {
    var node = fromStart ? element.firstChild : element.lastChild, next;
    // Tag soup HTML may result in a DOM where siblings have different parents.
    while (node && node.parentNode == element) {
      // Get the next/previous sibling here, since the node may be removed.
      next = fromStart ? node.nextSibling : node.previousSibling;
      if (node.nodeType == goog.dom.NodeType.TEXT) {
        // Found a text node.
        var text = node.nodeValue;
        if (goog.string.trim(text) == '') {
          // Found an empty text node; remove it.
          element.removeChild(node);
        } else {
          // Found a non-empty text node; trim from the start/end, then exit.
          node.nodeValue = fromStart ? goog.string.trimLeft(text) :
                                       goog.string.trimRight(text);
          break;
        }
      } else {
        // Found a non-text node; done.
        break;
      }
      node = next;
    }
  }
};
