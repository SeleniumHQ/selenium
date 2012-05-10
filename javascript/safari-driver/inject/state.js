/**
 * @fileoverview Maintains state information about the injected script. This
 * file is used to avoid circular dependencies amongst the other files in the
 * safaridriver.inject namespace.
 */

goog.provide('safaridriver.inject.state');

// DO NOT ADD DEPENDENCIES ON ANYTHING FROM safaridriver.inject !!!


/**
 * Whether this script is running in the top-most window.
 * @type {boolean}
 * @const
 */
safaridriver.inject.state.IS_TOP = window === window.top;


/**
 * @type {boolean}
 * @private
 */
safaridriver.inject.state.isActive_ = safaridriver.inject.state.IS_TOP;


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
};
