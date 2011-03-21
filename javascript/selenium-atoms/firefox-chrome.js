
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

  // If we've already unwrapped the object, don't unwrap it again.
  // TODO(simon): see whether XPCWrapper->IsSecurityWrapper is available in JS
  if (thing.__fxdriver_unwrapped) {
    return thing;
  }

  if (thing['wrappedJSObject']) {
    thing.wrappedJSObject.__fxdriver_unwrapped = true;
    return thing.wrappedJSObject;
  }

  // unwrap is not available on older branches (3.5 and 3.6) - Bug 533596
  try {
    var isWrapper = thing == XPCNativeWrapper(thing);
    if (isWrapper) {
      var unwrapped = XPCNativeWrapper.unwrap(thing);
      var toReturn = !!unwrapped ? unwrapped : thing;
      toReturn.__fxdriver_unwrapped = true;
      return toReturn;
    }
  } catch(e) {
    // Unwrapping will fail for JS literals - numbers, for example. Catch
    // the exception and proceed, it will eventually be returned as-is.
    alert(e);
  }

  return thing;
};