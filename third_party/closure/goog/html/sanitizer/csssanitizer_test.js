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

/** @fileoverview testcases for CSS Sanitizer.*/

goog.setTestOnly();

goog.require('goog.array');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.sanitizer.CssSanitizer');
goog.require('goog.html.testing');
goog.require('goog.string');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');


/**
 * @return {boolean} Returns if the browser is IE8.
 * @private
 */
function isIE8() {
  return goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(9);
}


/**
 * @return {boolean} Returns if the browser is Safari.
 * @private
 */
function isSafari() {
  return goog.userAgent.product.SAFARI;
}


/**
 * @param {string} cssText CSS text usually associated with an inline style.
 * @return {!CSSStyleDeclaration} A styleSheet object.
 */
function getStyleFromCssText(cssText) {
  var styleDecleration = document.createElement('div').style;
  styleDecleration.cssText = cssText || '';
  return styleDecleration;
}


/**
 * Asserts that the expected CSS text is equal to the actual CSS text.
 * @param {string} expectedCssText Expected CSS text.
 * @param {string} actualCssText Actual CSS text.
 */
function assertCSSTextEquals(expectedCssText, actualCssText) {
  if (isIE8()) {
    // We get a bunch of default values set in IE8 because of the way we iterate
    // over the CSSStyleDecleration keys.
    // TODO(danesh): Fix IE8 or remove this hack. It will be problematic for
    // tests which have an extra semi-colon in the value (even if quoted).
    var actualCssArry = actualCssText.split(/\s*;\s*/);
    var ie8StyleString = 'WIDTH: 0px; BOTTOM: 0px; HEIGHT: 0px; TOP: 0px; ' +
        'RIGHT: 0px; TEXT-DECORATION: none underline overline line-through; ' +
        'LEFT: 0px; TEXT-DECORATION: underline line-through;';
    goog.array.forEach(ie8StyleString.split(/\s*;\s*/), function(ie8Css) {
      goog.array.remove(actualCssArry, ie8Css);
    });
    actualCssText = actualCssArry.join('; ');
  }
  assertEquals(
      getStyleFromCssText(expectedCssText).cssText,
      getStyleFromCssText(actualCssText).cssText);
}

/**
 * Gets sanitized inline style.
 * @param {string} sourceCss CSS to be sanitized.
 * @param {function (string, string):?goog.html.SafeUrl=} opt_urlRewrite URL
 *     rewriter that only returns a goog.html.SafeUrl.
 * @return {string} Sanitized inline style.
 * @private
 */
function getSanitizedInlineStyle(sourceCss, opt_urlRewrite) {
  try {
    return goog.html.SafeStyle.unwrap(
               goog.html.sanitizer.CssSanitizer.sanitizeInlineStyle(
                   getStyleFromCssText(sourceCss), opt_urlRewrite)) ||
        '';
  } catch (err) {
    // IE8 doesn't like setting invalid properties. It throws an "Invalid
    // Argument" exception.
    if (!isIE8()) {
      throw err;
    }
    return '';
  }
}


function testValidCss() {
  var actualCSS = 'font-family: inherit';
  var expectedCSS = 'font-family: inherit';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  // .1 -> 0.1; 1.0 -> 1
  actualCSS = 'padding: 1pt .1pt 1pt 1.0em';
  expectedCSS = 'padding: 1pt 0.1pt 1pt 1em';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  // Negative margins are allowed.
  actualCSS = 'margin:    -7px -.5px -23px -1.25px';
  expectedCSS = 'margin: -7px -0.5px -23px -1.25px';
  if (isIE8()) {
    // IE8 doesn't like sub-pixels
    // https://blogs.msdn.microsoft.com/ie/2010/11/03/sub-pixel-fonts-in-ie9/
    expectedCSS = expectedCSS.replace('-0.5px', '0px');
    expectedCSS = expectedCSS.replace('-1.25px', '-1px');
  }
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  actualCSS = 'quotes: "{" "}" "<" ">"';
  expectedCSS = 'quotes: "{" "}" "<" ">";';
  if (isSafari()) {
    // TODO(danesh): Figure out what is wrong with WebKit (Safari).
    expectedCSS = 'quotes: \'{\';';
  }
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));
}


function testInvalidCssRemoved() {
  var actualCSS;

  // Tests all have null results.
  var expectedCSS = '';

  actualCSS = 'font: Arial Black,monospace,Helvetica,#88ff88';
  // Hash values are not allowed so are dropped.
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  // Negative numbers for border not allowed.
  actualCSS = 'border : -7px -0.5px -23px -1.25px';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  // Negative numbers converted to empty.
  actualCSS = 'padding: -0 -.0 -0. -0.0 ';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  // Invalid values not allowed.
  actualCSS = 'padding : #123 - 5 "5"';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  // Font-family does not allow quantities at all.
  actualCSS = 'font-family: 7 .5 23 1.25 -7 -.5 -23 -1.25 +7 +.5 +23 +1.25 ' +
      '7cm .5em 23.mm 1.25px -7cm -.5em -23.mm -1.25px ' +
      '+7cm +.5em +23.mm +1.25px 0 .0 -0+00.0 /';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));

  actualCSS = 'background: bogus url("foo.png") transparent';
  assertCSSTextEquals(
      expectedCSS,
      getSanitizedInlineStyle(actualCSS, goog.html.SafeUrl.sanitize));

  // expression(...) is not allowed for font so is rejected wholesale -- the
  // internal string "pwned" is not passed through.
  actualCSS = 'font-family: Arial Black,monospace,expression(return "pwned"),' +
      'Helvetica,#88ff88';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));
}


function testCssBackground() {
  var actualCSS, expectedCSS;

  function proxyUrl(url) {
    return goog.html.testing.newSafeUrlForTest(
        'https://goo.gl/proxy?url=' + url);
  }

  // Don't require the URL sanitizer to protect string boundaries.
  actualCSS = 'background-image: url("javascript:evil(1337)")';
  expectedCSS = '';
  assertCSSTextEquals(
      expectedCSS,
      getSanitizedInlineStyle(actualCSS, goog.html.SafeUrl.sanitize));

  actualCSS = 'background-image: url("http://goo.gl/foo.png")';
  expectedCSS =
      'background-image: url(https://goo.gl/proxy?url=http://goo.gl/foo.png)';
  assertCSSTextEquals(
      expectedCSS, getSanitizedInlineStyle(actualCSS, proxyUrl));

  // Without any URL sanitizer.
  actualCSS = 'background: transparent url("Bar.png")';
  var sanitizedCss = getSanitizedInlineStyle(actualCSS);
  assertFalse(goog.string.contains(sanitizedCss, 'background-image'));
  assertFalse(goog.string.contains(sanitizedCss, 'Bar.png'));
}

function testVendorPrefixed() {
  var actualCSS = '-webkit-text-stroke: 1px red';
  var expectedCSS = '';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));
}

function testDisallowedFunction() {
  var actualCSS = 'border-width: calc(10px + 20px)';
  var expectedCSS = '';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));
}

function testColor() {
  var colors = [
    'red', 'Red', 'RED', 'Gray', 'grey', '#abc', '#123', '#ABC123',
    'rgb( 127, 64 , 255 )'
  ];
  var notcolors = [
    // Finding words that are not X11 colors is harder than you think.
    'killitwithfire', 'invisible', 'expression(red=blue)', '#aa-1bb',
    '#expression', '#doevil'
    // 'rgb(0, 0, 100%)' // Invalid in all browsers
    // 'rgba(128,255,128,50%)', // Invalid in all browsers
  ];

  for (var i = 0; i < colors.length; ++i) {
    var validColorValue = 'color: ' + colors[i];
    assertCSSTextEquals(
        validColorValue, getSanitizedInlineStyle(validColorValue));
  }

  for (var i = 0; i < notcolors.length; ++i) {
    var invalidColorValue = 'color: ' + notcolors[i];
    assertCSSTextEquals('', getSanitizedInlineStyle(invalidColorValue));
  }
}


function testCustomVariablesSanitized() {
  var actualCSS = '\\2d-leak: leakTest; background: var(--leak);';
  assertCSSTextEquals('', getSanitizedInlineStyle(actualCSS));
}


function testExpressionsPreserved() {
  if (isIE8()) {
    // Disable this test as IE8 doesn't support expressions.
    // https://msdn.microsoft.com/en-us/library/ms537634(v=VS.85).aspx
    return;
  }

  var actualCSS, expectedCSS;
  actualCSS = 'background-image: linear-gradient(to bottom right, red, blue)';
  expectedCSS = 'background-image: linear-gradient(to right bottom, red, blue)';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));
}


function testMultipleInlineStyles() {
  var actualCSS = 'margin: 1px ; padding: 0';
  var expectedCSS = 'margin: 1px; padding: 0px;';
  assertCSSTextEquals(expectedCSS, getSanitizedInlineStyle(actualCSS));
}


function testSanitizeInlineStyleString() {
  var tests = [
    {
      // empty string
      inputCss: '',
      sanitizedCss: ''
    },
    {
      // one rule
      inputCss: 'color: red',
      sanitizedCss: 'color: red;'
    },
    {
      // two rules
      inputCss: 'color: green; padding: 10px',
      sanitizedCss: 'color: green; padding: 10px;'
    },
    {
      // malicious rule
      inputCss: 'color: expression("pwned")',
      sanitizedCss: ''
    },
    {
      // disallowed URL
      inputCss: 'background-image: url("http://example.com")',
      sanitizedCss: ''
    },
    {
      // disallowed URL
      inputCss: 'background-image: url("http://example.com")',
      sanitizedCss: '',
      uriRewriter: function(uri) {
        return null;
      }
    },
    {
      // allowed URL
      inputCss: 'background-image: url("http://example.com")',
      sanitizedCss: 'background-image: url("http://example.com");',
      uriRewriter: goog.html.SafeUrl.sanitize
    },
    {
      // preserves case
      inputCss: 'font-family: Roboto, sans-serif',
      sanitizedCss: 'font-family: Roboto, sans-serif'
    }
  ];

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];

    var expectedOutput = test.sanitizedCss;
    if (goog.userAgent.IE && document.documentMode < 10) {
      expectedOutput = '';
    }

    var safeStyle = goog.html.sanitizer.CssSanitizer.sanitizeInlineStyleString(
        test.inputCss, test.uriRewriter);
    var output = goog.html.SafeStyle.unwrap(safeStyle);
    assertCSSTextEquals(expectedOutput, output);
  }
}


/**
 * @suppress {accessControls}
 */
function testInertDocument() {
  if (!document.implementation.createHTMLDocument) {
    return;  // skip test
  }

  window.xssFiredInertDocument = false;
  var doc = goog.html.sanitizer.CssSanitizer.createInertDocument_();
  try {
    doc.write('<script> window.xssFiredInertDocument = true; </script>');
  } catch (e) {
    // ignore
  }
  assertFalse(window.xssFiredInertDocument);
}


/**
 * @suppress {accessControls}
 */
function testInertCustomElements() {
  if (typeof HTMLTemplateElement != 'function' || !document.registerElement) {
    return;  // skip test
  }

  var inertDoc = goog.html.sanitizer.CssSanitizer.createInertDocument_();
  var xFooConstructor = document.registerElement('x-foo');
  var xFooElem =
      document.implementation.createHTMLDocument('').createElement('x-foo');
  assertTrue(xFooElem instanceof xFooConstructor);  // sanity check

  var inertXFooElem = inertDoc.createElement('x-foo');
  assertFalse(inertXFooElem instanceof xFooConstructor);
}
