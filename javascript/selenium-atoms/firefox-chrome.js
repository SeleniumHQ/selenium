
goog.provide('core.firefox');

// This method closely follows unwrapNode() from mozmill-tests
/**
 * Unwraps a something which is wrapped into a XPCNativeWrapper or XrayWrapper.
 *
 * @param {!Object} thing The "something" to unwrap.
 * @returns {!Object} The object, unwrapped if possible.
 */
core.firefox.unwrap = function(thing) {
  if (!goog.isDefAndNotNull(thing)) {
    return thing;
  }

  // unwrap is not available on older branches (3.5 and 3.6) - Bug 533596
  if (XPCNativeWrapper && "unwrap" in XPCNativeWrapper) {
    try {
      return XPCNativeWrapper.unwrap(thing);
    } catch(e) {
      //Unwrapping will fail for JS literals - numbers, for example. Catch
      // the exception and proceed, it will eventually be returend as-is.
    }

  }

  if (thing['wrappedJSObject']) {
    return thing.wrappedJSObject;
  }

  return thing;
};