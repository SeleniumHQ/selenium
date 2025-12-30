/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Enum for button side constants. In its own file so as to not
 * cause a circular dependency with {@link goog.ui.ButtonRenderer}.
 */

goog.provide('goog.ui.ButtonSide');


/**
 * Constants for button sides, see {@link goog.ui.Button.prototype.setCollapsed}
 * for details.
 * @enum {number}
 */
goog.ui.ButtonSide = {
  /** Neither side. */
  NONE: 0,
  /** Left for LTR, right for RTL. */
  START: 1,
  /** Right for LTR, left for RTL. */
  END: 2,
  /** Both sides. */
  BOTH: 3
};
