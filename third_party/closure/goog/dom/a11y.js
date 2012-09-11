// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities for adding, removing and setting ARIA roles
 * as defined by W3C ARIA Working Draft:
 *     http://www.w3.org/TR/2010/WD-wai-aria-20100916/
 * All modern browsers have some form of ARIA support, so no browser checks are
 * performed when adding ARIA to components.
 *
 */
goog.provide('goog.dom.a11y');
goog.provide('goog.dom.a11y.Announcer');
goog.provide('goog.dom.a11y.LivePriority');
goog.provide('goog.dom.a11y.Role');
goog.provide('goog.dom.a11y.State');

goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.object');


/**
 * Enumeration of ARIA states and properties.
 * @enum {string}
 */
goog.dom.a11y.State = {
  // ARIA property for setting the currently active descendant of an element,
  // for example the selected item in a list box. Value: ID of an element.
  ACTIVEDESCENDANT: 'activedescendant',

  // ARIA property that, if true, indicates that all of a changed region should
  // be presented, instead of only parts. Value: one of {true, false}.
  ATOMIC: 'atomic',

  // ARIA property to specify that input completion is provided. Value:
  // one of {'inline', 'list', 'both', 'none'}.
  AUTOCOMPLETE: 'autocomplete',

  // ARIA state to indicate that an element and its subtree are being updated.
  // Value: one of {true, false}.
  BUSY: 'busy',

  // ARIA state for a checked item. Value: one of {'true', 'false', 'mixed',
  // undefined}.
  CHECKED: 'checked',

  // ARIA property that identifies the element or elements whose contents or
  // presence are controlled by this element. Value: space-separated IDs of
  // other elements.
  CONTROLS: 'controls',

  // ARIA property that identifies the element or elements that describe
  // this element. Value: space-separated IDs of other elements.
  DESCRIBEDBY: 'describedby',

  // ARIA state for a disabled item. Value: one of {true, false}.
  DISABLED: 'disabled',

  // ARIA property that indicates what functions can be performed when a
  // dragged object is released on the drop target.  Value: one of
  // {'copy', 'move', 'link', 'execute', 'popup', 'none'}.
  DROPEFFECT: 'dropeffect',

  // ARIA state for setting whether the element like a tree node is expanded.
  // Value: one of {true, false, undefined}.
  EXPANDED: 'expanded',

  // ARIA property that identifies the next element (or elements) in the
  // recommended reading order of content. Value: space-separated ids of
  // elements to flow to.
  FLOWTO: 'flowto',

  // ARIA state that indicates an element's "grabbed" state in drag-and-drop.
  // Value: one of {true, false, undefined}.
  GRABBED: 'grabbed',

  // ARIA property indicating whether the element has a popup. Value: one of
  // {true, false}.
  HASPOPUP: 'haspopup',

  // ARIA state indicating that the element is not visible or perceivable
  // to any user. Value: one of {true, false}.
  HIDDEN: 'hidden',

  // ARIA state indicating that the entered value does not conform. Value:
  // one of {false, true, 'grammar', 'spelling'}
  INVALID: 'invalid',

  // ARIA property that provides a label to override any other text, value, or
  // contents used to describe this element. Value: string.
  LABEL: 'label',

  // ARIA property for setting the element which labels another element.
  // Value: space-separated IDs of elements.
  LABELLEDBY: 'labelledby',

  // ARIA property for setting the level of an element in the hierarchy.
  // Value: integer.
  LEVEL: 'level',

  // ARIA property indicating that an element will be updated, and
  // describes the types of updates the user agents, assistive technologies,
  // and user can expect from the live region. Value: one of {'off', 'polite',
  // 'assertive'}.
  LIVE: 'live',

  // ARIA property indicating whether a text box can accept multiline input.
  // Value: one of {true, false}.
  MULTILINE: 'multiline',

  // ARIA property indicating if the user may select more than one item.
  // Value: one of {true, false}.
  MULTISELECTABLE: 'multiselectable',

  // ARIA property indicating if the element is horizontal or vertical.
  // Value: one of {'vertical', 'horizontal'}.
  ORIENTATION: 'orientation',

  // ARIA property creating a visual, functional, or contextual parent/child
  // relationship when the DOM hierarchy can't be used to represent it.
  // Value: Space-separated IDs of elements.
  OWNS: 'owns',

  // ARIA property that defines an element's number of position in a list.
  // Value: integer.
  POSINSET: 'posinset',

  // ARIA state for a pressed item. Value: one of {true, false, undefined,
  // 'mixed'}.
  PRESSED: 'pressed',

  // ARIA property indicating that an element is not editable.  Value:
  // one of {true, false}.
  READONLY: 'readonly',

  // ARIA property indicating that change notifications within this subtree
  // of a live region should be announced. Value: one of {'additions',
  // 'removals', 'text', 'all', 'additions text'}.
  RELEVANT: 'relevant',

  // ARIA property indicating that user input is required on this element
  // before a form may be submitted. Value: one of {true, false}.
  REQUIRED: 'required',

  // ARIA state for setting the currently selected item in the list.
  // Value: one of {true, false, undefined}.
  SELECTED: 'selected',

  // ARIA property defining the number of items in a list. Value: integer.
  SETSIZE: 'setsize',

  // ARIA property indicating if items are sorted. Value: one of {'ascending',
  // 'descending', 'none', 'other'}.
  SORT: 'sort',

  // ARIA property for slider maximum value. Value: number.
  VALUEMAX: 'valuemax',

  // ARIA property for slider minimum value. Value: number.
  VALUEMIN: 'valuemin',

  // ARIA property for slider active value. Value: number.
  VALUENOW: 'valuenow',

  // ARIA property for slider active value represented as text. Value: string.
  VALUETEXT: 'valuetext'
};


/**
 * Enumeration of ARIA roles.
 * @enum {string}
 */
goog.dom.a11y.Role = {
  // ARIA role for an alert element that doesn't need to be explicitly closed.
  ALERT: 'alert',

  // ARIA role for an alert dialog element that takes focus and must be closed.
  ALERTDIALOG: 'alertdialog',

  // ARIA role for an application that implements its own keyboard navigation.
  APPLICATION: 'application',

  // ARIA role for an article.
  ARTICLE: 'article',

  // ARIA role for a banner containing mostly site content, not page content.
  BANNER: 'banner',

  // ARIA role for a button element.
  BUTTON: 'button',

  // ARIA role for a checkbox button element; use with the CHECKED state.
  CHECKBOX: 'checkbox',

  // ARIA role for a column header of a table or grid.
  COLUMNHEADER: 'columnheader',

  // ARIA role for a combo box element.
  COMBOBOX: 'combobox',

  // ARIA role for a supporting section of the document.
  COMPLEMENTARY: 'complementary',

  // ARIA role for a dialog, some descendant must take initial focus.
  DIALOG: 'dialog',

  // ARIA role for a directory, like a table of contents.
  DIRECTORY: 'directory',

  // ARIA role for a part of a page that's a document, not a web application.
  DOCUMENT: 'document',

  // ARIA role for a landmark region logically considered one form.
  FORM: 'form',

  // ARIA role for an interactive control of tabular data.
  GRID: 'grid',

  // ARIA role for a cell in a grid.
  GRIDCELL: 'gridcell',

  // ARIA role for a group of related elements like tree item siblings.
  GROUP: 'group',

  // ARIA role for a heading element.
  HEADING: 'heading',

  // ARIA role for a container of elements that together comprise one image.
  IMG: 'img',

  // ARIA role for a link.
  LINK: 'link',

  // ARIA role for a list of non-interactive list items.
  LIST: 'list',

  // ARIA role for a listbox.
  LISTBOX: 'listbox',

  // ARIA role for a list item.
  LISTITEM: 'listitem',

  // ARIA role for a live region where new information is added.
  LOG: 'log',

  // ARIA landmark role for the main content in a document. Use only once.
  MAIN: 'main',

  // ARIA role for a live region of non-essential information that changes.
  MARQUEE: 'marquee',

  // ARIA role for a mathematical expression.
  MATH: 'math',

  // ARIA role for a popup menu.
  MENU: 'menu',

  // ARIA role for a menubar element containing menu elements.
  MENUBAR: 'menubar',

  // ARIA role for menu item elements.
  MENU_ITEM: 'menuitem',

  // ARIA role for a checkbox box element inside a menu.
  MENU_ITEM_CHECKBOX: 'menuitemcheckbox',

  // ARIA role for a radio button element inside a menu.
  MENU_ITEM_RADIO: 'menuitemradio',

  // ARIA landmark role for a collection of navigation links.
  NAVIGATION: 'navigation',

  // ARIA role for a section ancillary to the main content.
  NOTE: 'note',

  // ARIA role for option items that are  children of combobox, listbox, menu,
  // radiogroup, or tree elements.
  OPTION: 'option',

  // ARIA role for ignorable cosmetic elements with no semantic significance.
  PRESENTATION: 'presentation',

  // ARIA role for a progress bar element.
  PROGRESSBAR: 'progressbar',

  // ARIA role for a radio button element.
  RADIO: 'radio',

  // ARIA role for a group of connected radio button elements.
  RADIOGROUP: 'radiogroup',

  // ARIA role for an important region of the page.
  REGION: 'region',

  // ARIA role for a row of cells in a grid.
  ROW: 'row',

  // ARIA role for a group of one or more rows in a grid.
  ROWGROUP: 'rowgroup',

  // ARIA role for a row header of a table or grid.
  ROWHEADER: 'rowheader',

  // ARIA role for a scrollbar element.
  SCROLLBAR: 'scrollbar',

  // ARIA landmark role for a part of the page providing search functionality.
  SEARCH: 'search',

  // ARIA role for a menu separator.
  SEPARATOR: 'separator',

  // ARIA role for a slider.
  SLIDER: 'slider',

  // ARIA role for a spin button.
  SPINBUTTON: 'spinbutton',

  // ARIA role for a live region with advisory info less severe than an alert.
  STATUS: 'status',

  // ARIA role for a tab button.
  TAB: 'tab',

  // ARIA role for a tab bar (i.e. a list of tab buttons).
  TAB_LIST: 'tablist',

  // ARIA role for a tab page (i.e. the element holding tab contents).
  TAB_PANEL: 'tabpanel',

  // ARIA role for a textbox element.
  TEXTBOX: 'textbox',

  // ARIA role for an element displaying elapsed time or time remaining.
  TIMER: 'timer',

  // ARIA role for a toolbar element.
  TOOLBAR: 'toolbar',

  // ARIA role for a tooltip element.
  TOOLTIP: 'tooltip',

  // ARIA role for a tree.
  TREE: 'tree',

  // ARIA role for a grid whose rows can be expanded and collapsed like a tree.
  TREEGRID: 'treegrid',

  // ARIA role for a tree item that sometimes may be expanded or collapsed.
  TREEITEM: 'treeitem'
};


/**
 * Enumeration of ARIA state values for live regions.
 *
 * See http://www.w3.org/TR/wai-aria/states_and_properties#aria-live
 * for more information.
 * @enum {string}
 */
goog.dom.a11y.LivePriority = {
  /**
   * Default value.  Used for live regions that should never be spoken.
   */
  OFF: 'off',
  /**
   * Spoke only when the user is idle.  Best option in most cases.
   */
  POLITE: 'polite',
  /**
   * Spoken as soon as possible, which means that the information has a
   * higher priority than normal, but does not necessarily interrupt
   * immediately.
   */
  ASSERTIVE: 'assertive'
};


/**
 * Sets the role of an element.
 * @param {Element} element DOM node to set role of.
 * @param {string} roleName role name(s).
 */
goog.dom.a11y.setRole = function(element, roleName) {
  element.setAttribute('role', roleName);
};


/**
 * Gets role of an element.
 * @param {Element} element DOM node to get role of.
 * @return {string} rolename.
 */
goog.dom.a11y.getRole = function(element) {
  return element.getAttribute('role') || '';
};


/**
 * Sets the state or property of an element.
 * @param {Element} element DOM node where we set state.
 * @param {string} state State attribute being set. Automatically adds prefix
 *     'aria-' to the state name.
 * @param {string|boolean|number} value Value for the state attribute.
 */
goog.dom.a11y.setState = function(element, state, value) {
  element.setAttribute('aria-' + state, value);
};


/**
 * Gets value of specified state or property.
 * @param {Element} element DOM node to get state from.
 * @param {string} stateName State name.
 * @return {string} Value of the state attribute.
 */
goog.dom.a11y.getState = function(element, stateName) {
  var attrb =
      /** @type {string|number|boolean} */(element.getAttribute('aria-' +
          stateName));
  // Check for multiple representations -  attrb might
  // be a boolean or a string
  if ((attrb === true) || (attrb === false)) {
    return attrb ? 'true' : 'false';
  } else if (!attrb) {
    return '';
  } else {
    return String(attrb);
  }
};


/**
 * Gets the activedescendant of the given element.
 * @param {Element} element DOM node to get activedescendant from.
 * @return {Element} DOM node of the activedescendant.
 */
goog.dom.a11y.getActiveDescendant = function(element) {
  var id = goog.dom.a11y.getState(
      element, goog.dom.a11y.State.ACTIVEDESCENDANT);
  return goog.dom.getOwnerDocument(element).getElementById(id);
};


/**
 * Sets the activedescendant value for an element.
 * @param {Element} element DOM node to set activedescendant to.
 * @param {Element} activeElement DOM node being set as activedescendant.
 */
goog.dom.a11y.setActiveDescendant = function(element, activeElement) {
  goog.dom.a11y.setState(element, goog.dom.a11y.State.ACTIVEDESCENDANT,
      activeElement ? activeElement.id : '');
};



/**
 * Class that allows messages to be spoken by assistive technologies that the
 * user may have active.
 *
 * @param {goog.dom.DomHelper} domHelper DOM helper.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.dom.a11y.Announcer = function(domHelper) {
  goog.base(this);

  /**
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.domHelper_ = domHelper;

  /**
   * Map of priority to live region elements to use for communicating updates.
   * Elements are created on demand.
   * @type {Object.<goog.dom.a11y.LivePriority, Element>}
   * @private
   */
  this.liveRegions_ = {};
};
goog.inherits(goog.dom.a11y.Announcer, goog.Disposable);


/** @override */
goog.dom.a11y.Announcer.prototype.disposeInternal = function() {
  goog.object.forEach(
      this.liveRegions_, this.domHelper_.removeNode, this.domHelper_);
  this.liveRegions_ = null;
  this.domHelper_ = null;
  goog.base(this, 'disposeInternal');
};


/**
 * Announce a message to be read by any assistive technologies the user may
 * have active.
 * @param {string} message The message to announce to screen readers.
 * @param {goog.dom.a11y.LivePriority=} opt_priority The priority of the
 *     message. Defaults to POLITE.
 */
goog.dom.a11y.Announcer.prototype.say = function(message, opt_priority) {
  goog.dom.setTextContent(this.getLiveRegion_(
      opt_priority || goog.dom.a11y.LivePriority.POLITE), message);
};


/**
 * Returns an aria-live region that can be used to communicate announcements.
 * @param {goog.dom.a11y.LivePriority} priority The required priority.
 * @return {Element} A live region of the requested priority.
 * @private
 */
goog.dom.a11y.Announcer.prototype.getLiveRegion_ = function(priority) {
  if (this.liveRegions_[priority]) {
    return this.liveRegions_[priority];
  }
  var liveRegion;
  liveRegion = this.domHelper_.createElement('div');
  liveRegion.style.position = 'absolute';
  liveRegion.style.top = '-1000px';
  goog.dom.a11y.setState(liveRegion, 'live', priority);
  goog.dom.a11y.setState(liveRegion, 'atomic', 'true');
  this.domHelper_.getDocument().body.appendChild(liveRegion);
  this.liveRegions_[priority] = liveRegion;
  return liveRegion;
};
