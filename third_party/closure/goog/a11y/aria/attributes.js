/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview The file contains generated enumerations for ARIA states
 * and properties as defined by W3C ARIA standard:
 * http://www.w3.org/TR/wai-aria/.
 *
 * This is auto-generated code. Do not manually edit! For more details
 * about how to edit it via the generator check go/closure-ariagen.
 */

goog.provide('goog.a11y.aria.AutoCompleteValues');
goog.provide('goog.a11y.aria.CheckedValues');
goog.provide('goog.a11y.aria.DropEffectValues');
goog.provide('goog.a11y.aria.ExpandedValues');
goog.provide('goog.a11y.aria.GrabbedValues');
goog.provide('goog.a11y.aria.InvalidValues');
goog.provide('goog.a11y.aria.LivePriority');
goog.provide('goog.a11y.aria.OrientationValues');
goog.provide('goog.a11y.aria.PressedValues');
goog.provide('goog.a11y.aria.RelevantValues');
goog.provide('goog.a11y.aria.SelectedValues');
goog.provide('goog.a11y.aria.SortValues');
goog.provide('goog.a11y.aria.State');


/**
 * ARIA states and properties.
 * @enum {string}
 */
goog.a11y.aria.State = {
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

  // ARIA state that defines an element's column index or position with respect
  // to the total number of columns within a table, grid, or treegrid.
  // Value: number.
  COLINDEX: 'colindex',

  // ARIA property that identifies the element or elements whose contents or
  // presence are controlled by this element.
  // Value: space-separated IDs of other elements.
  CONTROLS: 'controls',

  // ARIA property that identifies the element that represents the current
  // item within a container or set of related elements.
  // Value: one of {'page', 'step', 'location', 'date', 'time', true, false}.
  CURRENT: 'current',

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

  // ARIA property indicating whether the element has a popup.
  // Value: one of {true, false}.
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

  // ARIA state for a pressed item.
  // Value: one of {true, false, undefined, 'mixed'}.
  PRESSED: 'pressed',

  // ARIA property indicating that an element is not editable.
  // Value: one of {true, false}.
  READONLY: 'readonly',

  // ARIA property indicating that change notifications within this subtree
  // of a live region should be announced. Value: one of {'additions',
  // 'removals', 'text', 'all', 'additions text'}.
  RELEVANT: 'relevant',

  // ARIA property indicating that user input is required on this element
  // before a form may be submitted. Value: one of {true, false}.
  REQUIRED: 'required',

  // ARIA state that defines an element's row index or position with respect
  // to the total number of rows within a table, grid, or treegrid.
  // Value: number.
  ROWINDEX: 'rowindex',

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

  // ARIA property for slider active value represented as text.
  // Value: string.
  VALUETEXT: 'valuetext'
};


/**
 * ARIA state values for AutoCompleteValues.
 * @enum {string}
 */
goog.a11y.aria.AutoCompleteValues = {
  // The system provides text after the caret as a suggestion
  // for how to complete the field.
  INLINE: 'inline',
  // A list of choices appears from which the user can choose,
  // but the edit box retains focus.
  LIST: 'list',
  // A list of choices appears and the currently selected suggestion
  // also appears inline.
  BOTH: 'both',
  // No input completion suggestions are provided.
  NONE: 'none'
};


/**
 * ARIA state values for DropEffectValues.
 * @enum {string}
 */
goog.a11y.aria.DropEffectValues = {
  // A duplicate of the source object will be dropped into the target.
  COPY: 'copy',
  // The source object will be removed from its current location
  // and dropped into the target.
  MOVE: 'move',
  // A reference or shortcut to the dragged object
  // will be created in the target object.
  LINK: 'link',
  // A function supported by the drop target is
  // executed, using the drag source as an input.
  EXECUTE: 'execute',
  // There is a popup menu or dialog that allows the user to choose
  // one of the drag operations (copy, move, link, execute) and any other
  // drag functionality, such as cancel.
  POPUP: 'popup',
  // No operation can be performed; effectively
  // cancels the drag operation if an attempt is made to drop on this object.
  NONE: 'none'
};


/**
 * ARIA state values for LivePriority.
 * @enum {string}
 */
goog.a11y.aria.LivePriority = {
  // Updates to the region will not be presented to the user
  // unless the assitive technology is currently focused on that region.
  OFF: 'off',
  // (Background change) Assistive technologies SHOULD announce
  // updates at the next graceful opportunity, such as at the end of
  // speaking the current sentence or when the user pauses typing.
  POLITE: 'polite',
  // This information has the highest priority and assistive
  // technologies SHOULD notify the user immediately.
  // Because an interruption may disorient users or cause them to not complete
  // their current task, authors SHOULD NOT use the assertive value unless the
  // interruption is imperative.
  ASSERTIVE: 'assertive'
};


/**
 * ARIA state values for OrientationValues.
 * @enum {string}
 */
goog.a11y.aria.OrientationValues = {
  // The element is oriented vertically.
  VERTICAL: 'vertical',
  // The element is oriented horizontally.
  HORIZONTAL: 'horizontal'
};


/**
 * ARIA state values for RelevantValues.
 * @enum {string}
 */
goog.a11y.aria.RelevantValues = {
  // Element nodes are added to the DOM within the live region.
  ADDITIONS: 'additions',
  // Text or element nodes within the live region are removed from the DOM.
  REMOVALS: 'removals',
  // Text is added to any DOM descendant nodes of the live region.
  TEXT: 'text',
  // Equivalent to the combination of all values, "additions removals text".
  ALL: 'all'
};


/**
 * ARIA state values for SortValues.
 * @enum {string}
 */
goog.a11y.aria.SortValues = {
  // Items are sorted in ascending order by this column.
  ASCENDING: 'ascending',
  // Items are sorted in descending order by this column.
  DESCENDING: 'descending',
  // There is no defined sort applied to the column.
  NONE: 'none',
  // A sort algorithm other than ascending or descending has been applied.
  OTHER: 'other'
};


/**
 * ARIA state values for CheckedValues.
 * @enum {string}
 */
goog.a11y.aria.CheckedValues = {
  // The selectable element is checked.
  TRUE: 'true',
  // The selectable element is not checked.
  FALSE: 'false',
  // Indicates a mixed mode value for a tri-state
  // checkbox or menuitemcheckbox.
  MIXED: 'mixed',
  // The element does not support being checked.
  UNDEFINED: 'undefined'
};


/**
 * ARIA state values for ExpandedValues.
 * @enum {string}
 */
goog.a11y.aria.ExpandedValues = {
  // The element, or another grouping element it controls, is expanded.
  TRUE: 'true',
  // The element, or another grouping element it controls, is collapsed.
  FALSE: 'false',
  // The element, or another grouping element
  // it controls, is neither expandable nor collapsible; all its
  // child elements are shown or there are no child elements.
  UNDEFINED: 'undefined'
};


/**
 * ARIA state values for GrabbedValues.
 * @enum {string}
 */
goog.a11y.aria.GrabbedValues = {
  // Indicates that the element has been "grabbed" for dragging.
  TRUE: 'true',
  // Indicates that the element supports being dragged.
  FALSE: 'false',
  // Indicates that the element does not support being dragged.
  UNDEFINED: 'undefined'
};


/**
 * ARIA state values for InvalidValues.
 * @enum {string}
 */
goog.a11y.aria.InvalidValues = {
  // There are no detected errors in the value.
  FALSE: 'false',
  // The value entered by the user has failed validation.
  TRUE: 'true',
  // A grammatical error was detected.
  GRAMMAR: 'grammar',
  // A spelling error was detected.
  SPELLING: 'spelling'
};


/**
 * ARIA state values for PressedValues.
 * @enum {string}
 */
goog.a11y.aria.PressedValues = {
  // The element is pressed.
  TRUE: 'true',
  // The element supports being pressed but is not currently pressed.
  FALSE: 'false',
  // Indicates a mixed mode value for a tri-state toggle button.
  MIXED: 'mixed',
  // The element does not support being pressed.
  UNDEFINED: 'undefined'
};


/**
 * ARIA state values for SelectedValues.
 * @enum {string}
 */
goog.a11y.aria.SelectedValues = {
  // The selectable element is selected.
  TRUE: 'true',
  // The selectable element is not selected.
  FALSE: 'false',
  // The element is not selectable.
  UNDEFINED: 'undefined'
};
