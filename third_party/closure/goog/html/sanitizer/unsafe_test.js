// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Unit Test for the unsafe API of the HTML Sanitizer.
 */

goog.setTestOnly();

goog.require('goog.html.SafeHtml');
goog.require('goog.html.sanitizer.HtmlSanitizer');
goog.require('goog.html.sanitizer.TagBlacklist');
goog.require('goog.html.sanitizer.unsafe');

goog.require('goog.string.Const');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

/**
 * @return {boolean} Whether the browser is IE8 or below.
 */
function isIE8() {
  return goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(9);
}


/**
 * @return {boolean} Whether the browser is IE9.
 */
function isIE9() {
  return goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(10) && !isIE8();
}


var just = goog.string.Const.from('test');


/**
 * Sanitizes the original HTML and asserts that it is the same as the expected
 * HTML. Supports adding tags and attributes through the unsafe API.
 * @param {string} originalHtml
 * @param {string} expectedHtml
 * @param {?Array<string>=} opt_tags
 * @param {?Array<(string|!goog.html.sanitizer.HtmlSanitizerAttributePolicy)>=}
 *     opt_attrs
 * @param {?goog.html.sanitizer.HtmlSanitizer.Builder=} opt_builder
 */
function assertSanitizedHtml(
    originalHtml, expectedHtml, opt_tags, opt_attrs, opt_builder) {
  var builder = opt_builder || new goog.html.sanitizer.HtmlSanitizer.Builder();
  if (opt_tags)
    builder = goog.html.sanitizer.unsafe.alsoAllowTags(just, builder, opt_tags);
  if (opt_attrs)
    builder = goog.html.sanitizer.unsafe.alsoAllowAttributes(
        just, builder, opt_attrs);
  var sanitizer = builder.build();
  try {
    var sanitized = sanitizer.sanitize(originalHtml);
    if (isIE9()) {
      assertEquals('', goog.html.SafeHtml.unwrap(sanitized));
      return;
    }
    goog.testing.dom.assertHtmlMatches(
        expectedHtml, goog.html.SafeHtml.unwrap(sanitized),
        true /* opt_strictAttributes */);
  } catch (err) {
    if (!isIE8()) {
      throw err;
    }
  }
}


function testAllowEmptyTagList() {
  var input = '<sdf><aaa></aaa></sdf><b></b>';
  var expected = '<span><span></span></span><b></b>';
  assertSanitizedHtml(input, expected, []);
}


function testAllowBlacklistedTag() {
  var input = '<div><script>aaa</script></div>';
  var expected = '<div></div>';
  assertSanitizedHtml(input, expected, ['SCriPT']);
}


function testAllowUnknownTags() {
  var input = '<hello><bye>aaa</bye></hello><zzz></zzz>';
  var expected = '<hello><span>aaa</span></hello><zzz></zzz>';
  assertSanitizedHtml(input, expected, ['HElLO', 'zZZ']);
}


function testAllowAlreadyWhiteListedTag() {
  var input = '<hello><p><zzz></zzz></p></hello>';
  var expected = '<span><p><zzz></zzz></p></span>';
  assertSanitizedHtml(input, expected, ['p', 'ZZZ']);
}


function testAllowEmptyAttrList() {
  var input = '<a href="#" qwe="nope">b</a>';
  var expected = '<a href="#">b</a>';
  assertSanitizedHtml(input, expected, null, []);
}


function testAllowUnknownAttributeSimple() {
  var input = '<qqq zzz="3" nnn="no"></qqq>';
  var expected = '<span zzz="3"></span>';
  assertSanitizedHtml(input, expected, null, ['Zzz']);
}


function testAllowUnknownAttributeWildCard() {
  var input = '<div ab="yes" bb="no"><img ab="yep" bb="no" /></div>';
  var expected = '<div ab="yes"><img ab="yep" /></div>';
  assertSanitizedHtml(
      input, expected, null, [{tagName: '*', attributeName: 'aB'}]);
}


function testAllowUnknownAttributeOnSpecificTag() {
  var input = '<a www="3" zzz="4">fff</a><img www="3" />';
  var expected = '<a www="3">fff</a><img />';
  assertSanitizedHtml(
      input, expected, null, [{tagName: 'a', attributeName: 'WwW'}]);
}


function testAllowUnknownAttributePolicy() {
  var input = '<img ab="yes" /><img ab="no" />';
  var expected = '<img ab="yes" /><img />';
  assertSanitizedHtml(input, expected, null, [{
                        tagName: '*',
                        attributeName: 'aB',
                        policy: function(value, hints) {
                          assertEquals(hints.attributeName, 'ab');
                          return value === 'yes' ? value : null;
                        }
                      }]);
}


function testAllowOverwriteAttrPolicy() {
  var input = '<a href="yes"></a><a href="no"></a>';
  var expected = '<a href="yes"></a><a></a>';
  assertSanitizedHtml(
      input, expected, null, [{
        tagName: 'a',
        attributeName: 'href',
        policy: function(value) { return value === 'yes' ? value : null; }
      }]);
}


function testWhitelistAliasing() {
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  goog.html.sanitizer.unsafe.alsoAllowTags(just, builder, ['QqQ']);
  goog.html.sanitizer.unsafe.alsoAllowAttributes(just, builder, ['QqQ']);
  builder.build();
  assertUndefined(goog.html.sanitizer.TagWhitelist['QQQ']);
  assertUndefined(goog.html.sanitizer.TagWhitelist['QqQ']);
  assertUndefined(goog.html.sanitizer.TagWhitelist['qqq']);
  assertUndefined(goog.html.sanitizer.AttributeWhitelist['* QQQ']);
  assertUndefined(goog.html.sanitizer.AttributeWhitelist['* QqQ']);
  assertUndefined(goog.html.sanitizer.AttributeWhitelist['* qqq']);
}


function testTemplateUnsanitized() {
  if (!goog.html.sanitizer.HTML_SANITIZER_TEMPLATE_SUPPORTED) {
    return;
  }
  var input = '<template><div>a</div><script>qqq</script>' +
      '<template>a</template></template>';
  // TODO(pelizzi): use unblockTag once it's available
  delete goog.html.sanitizer.TagBlacklist['TEMPLATE'];
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  goog.html.sanitizer.unsafe.keepUnsanitizedTemplateContents(just, builder);
  assertSanitizedHtml(input, input, ['TEMPLATE'], null, builder);
  goog.html.sanitizer.TagBlacklist['TEMPLATE'] = true;
}


function testTemplateSanitizedUnsanitizedXSS() {
  if (!goog.html.sanitizer.HTML_SANITIZER_TEMPLATE_SUPPORTED) {
    return;
  }
  var input = '<template><p>a</p><script>aaaa;</script></template>';
  var expected = '<span><p>a</p></span>';
  delete goog.html.sanitizer.TagBlacklist['TEMPLATE'];
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  goog.html.sanitizer.unsafe.keepUnsanitizedTemplateContents(just, builder);
  assertSanitizedHtml(input, expected, null, null, builder);
  goog.html.sanitizer.TagBlacklist['TEMPLATE'] = true;
}


function testTemplateUnsanitizedThrowsIE() {
  if (goog.html.sanitizer.HTML_SANITIZER_TEMPLATE_SUPPORTED) {
    return;
  }
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  assertThrows(function() {
    goog.html.sanitizer.unsafe.keepUnsanitizedTemplateContents(just, builder);
  });
}


function testAllowRelaxExistingAttributePolicyWildcard() {
  var input = '<a href="javascript:alert(1)"></a>';
  // define a tag-specific one, takes precedence
  assertSanitizedHtml(
      input, input, null,
      [{tagName: 'a', attributeName: 'href', policy: goog.functions.identity}]);
  // overwrite the global one
  assertSanitizedHtml(
      input, input, null,
      [{tagName: '*', attributeName: 'href', policy: goog.functions.identity}]);
}


function testAllowRelaxExistingAttributePolicySpecific() {
  var input = '<a target="foo"></a>';
  var expected = '<a></a>';
  // overwrite the global one, the specific one still has precedence
  assertSanitizedHtml(input, expected, null, [
    {tagName: '*', attributeName: 'target', policy: goog.functions.identity}
  ]);
  // overwrite the tag-specific one, this one should take precedence
  assertSanitizedHtml(input, input, null, [
    {tagName: 'a', attributeName: 'target', policy: goog.functions.identity}
  ]);
}
