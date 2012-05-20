/**
 * @fileoverview Maintains state information about the injected script. This
 * file is used to avoid circular dependencies amongst the other files in the
 * safaridriver.inject namespace.
 */

goog.provide('safaridriver.inject.state');

// DO NOT ADD DEPENDENCIES ON ANYTHING FROM safaridriver.inject !!!
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Whether this script is running in the top-most window.
 * @type {boolean}
 * @const
 */
safaridriver.inject.state.IS_TOP = window === window.top;


/**
 * A unique ID for the frame using this script.
 * @type {string}
 * @const
 */
safaridriver.inject.state.FRAME_ID =
    safaridriver.inject.state.IS_TOP ? 'TOP' : goog.string.getRandomString();


/**
 * @type {boolean}
 * @private
 */
safaridriver.inject.state.isActive_ = safaridriver.inject.state.IS_TOP;


/**
 * @type {Window}
 * @private
 */
safaridriver.inject.state.activeFrame_ = null;


/**
 * Returns whether the window containing this script is active and should
 * respond to commands from the extension's global page.
 *
 * <p>By default, only the top most window is automatically active, as it
 * receives focus first when a new page is loaded. Each sub-frame will be
 * activated in turn as the user switches to them; when a sub-frame is
 * activated, this frame will be deactivated.
 *
 * <p>This is necessary because a window may contain frames that load fully
 * initialize before the top window does. If this happens, the frames will
 * intercept and handle commands from the extension before the appropriate
 * window does.
 *
 * @return {boolean} Whether the context running this script is the active
 *     injected script.
 */
safaridriver.inject.state.isActive = function() {
  return safaridriver.inject.state.isActive_;
};


/**
 * Sets whether the injected script should be active.
 * @param {boolean} active Whether the script should be active.
 */
safaridriver.inject.state.setActive = function(active) {
  safaridriver.inject.state.isActive_ = active;
  if (active && safaridriver.inject.state.IS_TOP) {
    safaridriver.inject.state.setActiveFrame(null);
  }
};


/**
 * Sets which within this frame is active.
 * @param {Window} win The new active frame, or {@code null} if none are
 *     active.
 */
safaridriver.inject.state.setActiveFrame = function(win) {
  goog.asserts.assert(safaridriver.inject.state.IS_TOP,
      'Active frames may only be saved with the top-most frame');
  goog.asserts.assert(goog.isNull(win) || win.top === window,
      'Frame does not belong to this window.');
  safaridriver.inject.state.activeFrame_ = win;
};


/**
 * @return {Window} The active frame for this window, or null if the top-most
 *     frame is active.
 */
safaridriver.inject.state.getActiveFrame = function() {
  return safaridriver.inject.state.activeFrame_;
};
