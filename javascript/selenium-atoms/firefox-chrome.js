// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('core.firefox');

/**
 * @return {boolean} Whether the firefox instance needs elements to be
 * unwrapped.
 */
core.firefox.isUsingUnwrapping_ = function() {
    try {
        var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
                getService(Components.interfaces.nsIXULAppInfo);
        var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].
                getService(Components.interfaces.nsIVersionComparator);

        return (versionChecker.compare(appInfo.version, '4.0') >= 0);
    } catch (e) {
        // like when its not Firefox
        return false;
    }
};

core.firefox.isUsingUnwrapping_ = core.firefox.isUsingUnwrapping_();

// This method closely follows unwrapNode() from mozmill-tests
/**
 * Unwraps a something which is wrapped into a XPCNativeWrapper or XrayWrapper.
 *
 * @param {!Object} thing The "something" to unwrap.
 * @return {!Object} The object, unwrapped if possible.
 */
core.firefox.unwrap = function(thing) {
    if (!core.firefox.isUsingUnwrapping_) {
        return thing;
    }

    if (!goog.isDefAndNotNull(thing)) {
        return thing;
    }

    // If we've already unwrapped the object, don't unwrap it again.
    // TODO: see whether XPCWrapper->IsSecurityWrapper is available in JS
    try {
        if (thing.__fxdriver_unwrapped) {
            return thing;
        }
    } catch (ignored) {
        // We have a dead object. Just return it. Calling sites know what to do.
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
    } catch (e) {
        // Unwrapping will fail for JS literals - numbers, for example. Catch
        // the exception and proceed, it will eventually be returned as-is.
    }

    return thing;
};
