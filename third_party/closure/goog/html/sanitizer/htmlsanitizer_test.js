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
 * @fileoverview Unit tests for HTML Sanitizer
 */

goog.setTestOnly();

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.sanitizer.HtmlSanitizer');
goog.require('goog.html.sanitizer.HtmlSanitizer.Builder');
goog.require('goog.html.sanitizer.TagWhitelist');
goog.require('goog.html.sanitizer.unsafe');
goog.require('goog.html.testing');
goog.require('goog.object');
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


/**
 * Sanitizes the original HTML and asserts that it is the same as the expected
 * HTML. If present the config is passed through to the sanitizer.
 * @param {string} originalHtml
 * @param {string} expectedHtml
 * @param {?goog.html.sanitizer.HtmlSanitizer=} opt_sanitizer
 */
function assertSanitizedHtml(originalHtml, expectedHtml, opt_sanitizer) {
  var sanitizer =
      opt_sanitizer || new goog.html.sanitizer.HtmlSanitizer.Builder().build();
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
  if (!opt_sanitizer) {
    // Retry with raw sanitizer created without the builder.
    assertSanitizedHtml(
        originalHtml, expectedHtml, new goog.html.sanitizer.HtmlSanitizer());
    // Retry with an explicitly passed in Builder.
    var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
    assertSanitizedHtml(
        originalHtml, expectedHtml,
        new goog.html.sanitizer.HtmlSanitizer(builder));
  }
}


/**
 * @param {!goog.html.SafeHtml} safeHtml Sanitized HTML which contains a style.
 * @return {string} cssText contained within SafeHtml.
 */
function getStyle(safeHtml) {
  var tmpElement = goog.dom.safeHtmlToNode(safeHtml);
  return tmpElement.style ? tmpElement.style.cssText : '';
}


function testHtmlSanitizeSafeHtml() {
  var html;
  html = 'hello world';
  assertSanitizedHtml(html, html);

  html = '<b>hello world</b>';
  assertSanitizedHtml(html, html);

  html = '<i>hello world</i>';
  assertSanitizedHtml(html, html);

  html = '<u>hello world</u>';
  assertSanitizedHtml(html, html);

  // NOTE(user): original did not have tbody
  html = '<table><tbody><tr><td>hello world</td></tr></tbody></table>';
  assertSanitizedHtml(html, html);

  html = '<h1>hello world</h1>';
  assertSanitizedHtml(html, html);

  html = '<div>hello world</div>';
  assertSanitizedHtml(html, html);

  html = '<a>hello world</a>';
  assertSanitizedHtml(html, html);

  html = '<div><span>hello world</span></div>';
  assertSanitizedHtml(html, html);

  html = '<div><a target=\'_blank\'>hello world</a></div>';
  assertSanitizedHtml(html, html);
}


// TODO(pelizzi): name of test does not make sense
function testDefaultCssSanitizeImage() {
  var html = '<div></div>';
  assertSanitizedHtml(html, html);
}


function testBuilderCanOnlyBeUsedOnce() {
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  var sanitizer = builder.build();
  assertThrows(function() {
    builder.build();
  });
  assertThrows(function() {
    new goog.html.sanitizer.HtmlSanitizer(builder);
  });
}


function testAllowedCssSanitizeImage() {
  var testUrl = 'http://www.example.com/image3.jpg';
  var html = '<div style="background: url(' + testUrl + ');"></div>';

  var sanitizer =
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .allowCssStyles()
          .withCustomNetworkRequestUrlPolicy(goog.html.SafeUrl.sanitize)
          .build();

  try {
    var sanitizedHtml = sanitizer.sanitize(html);
    if (isIE9()) {
      assertEquals('', goog.html.SafeHtml.unwrap(sanitizedHtml));
      return;
    }
    assertRegExp(
        /background(?:-image)?:.*url\(.?http:\/\/www.example.com\/image3.jpg.?\)/,
        getStyle(sanitizedHtml));
  } catch (err) {
    if (!isIE8()) {
      throw err;
    }
  }
}


function testHtmlSanitizeXSS() {
  // NOTE(user): xss cheat sheet found on http://ha.ckers.org/xss.html
  var safeHtml, xssHtml;
  // Inserting <script> tags is unsafe
  // Browser Support [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<SCRIPT SRC=xss.js><\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);
  // removes strings like javascript:, alert, etc
  // Image XSS using the javascript directive
  // Browser Support [IE6.0|IE8.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="javascript:xss=true;">';
  assertSanitizedHtml(xssHtml, safeHtml);

  safeHtml = '<div><a>hello world</a></div>';
  xssHtml = '<div><a target=\'_xss\'>hello world</a></div>';
  assertSanitizedHtml(xssHtml, safeHtml);

  safeHtml = '';
  xssHtml = '<IFRAME SRC="javascript:xss=true;">';
  assertSanitizedHtml(xssHtml, safeHtml);

  safeHtml = '';
  xssHtml = '<iframe src=" javascript:xss=true;">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // no quotes and no semicolon
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=javascript:alert("XSS")>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // case insensitive xss attack
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=JaVaScRiPt:alert("XSS")>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // HTML Entities
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=javascript:alert(&quot;XSS&quot;)>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Grave accent obfuscation (If you need to use both double and single quotes
  // you can use a grave accent to encapsulate the JavaScript string)
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=`javascript:alert("foo \'bar\'")`>';
  assertSanitizedHtml(xssHtml, safeHtml);

  safeHtml = '<img />';
  xssHtml = '<IMG data-xxx=`yyy`>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Malformed IMG tags
  // http://www.begeek.it/2006/03/18/esclusivo-vulnerabilita-xss-in-firefox/#more-300
  // Browser Support [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '<img />"&gt;';
  xssHtml = '<IMG """><SCRIPT defer>exploited = true;<\/SCRIPT>">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // UTF-8 Unicode encoding
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;' +
      '&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;' +
      '&#41;>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Long UTF-8 Unicode encoding without semicolons (this is often effective
  // in XSS that attempts to look for "&#XX;", since most people don't know
  // about padding - up to 7 numeric characters total). This is also useful
  // against people who decode against strings like
  // $tmp_string =~ s/.*\&#(\d+);.*/$1/; which incorrectly assumes a semicolon
  // is required to terminate a html encoded string:
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099' +
      '&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108' +
      '&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083' +
      '&#0000083&#0000039&#0000041>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Hex encoding without semicolons (this is also a viable XSS attack against
  // the above string $tmp_string =~ s/.*\&#(\d+);.*/$1/; which assumes that
  // there is a numeric character following the pound symbol - which is not true
  // with hex HTML characters). Use the XSS calculator for more information:
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A' +
      '&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Embedded tab
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="jav\tascript:xss=true;">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Embedded encoded tab
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="jav&#x09;ascript:xss=true;">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Embeded newline to break up XSS. Some websites claim that any of the chars
  // 09-13 (decimal) will work for this attack. That is incorrect. Only 09
  // (horizontal tab), 10 (newline) and 13 (carriage return) work. See the ascii
  // chart for more details. The following four XSS examples illustrate this
  // vector:
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="jav&#x0A;ascript:xss=true;">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Multiline Injected JavaScript using ASCII carriage returns (same as above
  // only a more extreme example of this XSS vector) these are not spaces just
  // one of the three characters as described above:
  // Browser Support [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG\nSRC\n=\n"\nj\na\nv\na\ns\nc\nr\ni\np\nt\n:\na\nl\ne\nr\nt' +
      '\n(\n"\nX\nS\nS\n"\n)\n"\n>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Null breaks up JavaScript directive. Okay, I lied, null chars also work as
  // XSS vectors but not like above, you need to inject them directly using
  // something like Burp Proxy or use %00 in the URL string or if you want to
  // write your own injection tool you can either use vim (^V^@ will produce a
  // null) or the following program to generate it into a text file. Okay, I
  // lied again, older versions of Opera (circa 7.11 on Windows) were vulnerable
  // to one additional char 173 (the soft hypen control char). But the null
  // char %00 is much more useful and helped me bypass certain real world
  // filters with a variation on this example:
  // Browser Support [IE6.0|IE7.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=java\0script:alert("hey");>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // On IE9, the null character actually causes us to only see <SCR. The
  // sanitizer on IE9 doesn't "recover as well" as other browsers but the
  // result is safe.
  safeHtml = isIE9() ? '' : '<span>alert("XSS")</span>';
  xssHtml = '<SCR\0IPT>alert(\"XSS\")</SCR\0IPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Spaces and meta chars before the JavaScript in images for XSS (this is
  // useful if the pattern match doesn't take into account spaces in the word
  // "javascript:" -which is correct since that won't render- and makes the
  // false assumption that you can't have a space between the quote and the
  // "javascript:" keyword. The actual reality is you can have any char from
  // 1-32 in decimal):
  // Browser Support [IE7.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=" &#14;  javascript:alert(window);">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Non-alpha-non-digit XSS. While I was reading the Firefox HTML parser I
  // found that it assumes a non-alpha-non-digit is not valid after an HTML
  // keyword and therefor considers it to be a whitespace or non-valid token
  // after an HTML tag. The problem is that some XSS filters assume that the
  // tag they are looking for is broken up by whitespace.
  // Browser Support [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"><\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Non-alpha-non-digit part 2 XSS. yawnmoth brought my attention to this
  // vector, based on the same idea as above, however, I expanded on it, using
  // my fuzzer. The Gecko rendering engine allows for any character other than
  // letters, numbers or encapsulation chars (like quotes, angle brackets,
  // etc...) between the event handler and the equals sign, making it easier
  // to bypass cross site scripting blocks. Note that this also applies to the
  // grave accent char as seen here:
  // Browser support: [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<BODY onload!#$%&()*~+-_.,:;?@[/|\]^`=alert("XSS")>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Non-alpha-non-digit part 3 XSS. Yair Amit brought this to my attention
  // that there is slightly different behavior between the IE and Gecko
  // rendering engines that allows just a slash between the tag and the
  // parameter with no spaces. This could be useful if the system does not
  // allow spaces.
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<SCRIPT/SRC="http://ha.ckers.org/xss.js"><\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Extraneous open brackets. Submitted by Franz Sedlmaier, this XSS vector
  // could defeat certain detection engines that work by first using matching
  // pairs of open and close angle brackets and then by doing a comparison of
  // the tag inside, instead of a more efficient algorythm like Boyer-Moore that
  // looks for entire string matches of the open angle bracket and associated
  // tag (post de-obfuscation, of course). The double slash comments out the
  // ending extraneous bracket to supress a JavaScript error:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '&lt;';
  xssHtml = '<<SCRIPT>xss=true;//<<\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // No closing script tags. In Firefox and Netscape 8.1 in the Gecko rendering
  // engine mode you don't actually need the "><\/SCRIPT>" portion of this Cross
  // Site Scripting vector. Firefox assumes it's safe to close the HTML tag and
  // add closing tags for you. How thoughtful! Unlike the next one, which
  // doesn't effect Firefox, this does not require any additional HTML below it.
  // You can add quotes if you need to, but they're not needed generally,
  // although beware, I have no idea what the HTML will end up looking like once
  // this is injected:
  // Browser support: [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<SCRIPT SRC=http://ha.ckers.org/xss.js?<B>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Protocol resolution in script tags. This particular variant was submitted
  // by Lukasz Pilorz and was based partially off of Ozh's protocol resolution
  // bypass below. This cross site scripting example works in IE, Netscape in
  // IE rendering mode and Opera if you add in a <\/SCRIPT> tag at the end.
  // However, this is especially useful where space is an issue, and of course,
  // the shorter your domain, the better. The ".j" is valid, regardless of the
  // encoding type because the browser knows it in context of a SCRIPT tag.
  // Browser support: [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<SCRIPT SRC=//ha.ckers.org/.j>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Half open HTML/JavaScript XSS vector. Unlike Firefox the IE rendering
  // engine doesn't add extra data to your page, but it does allow the
  // javascript: directive in images. This is useful as a vector because it
  // doesn't require a close angle bracket. This assumes there is any HTML tag
  // below where you are injecting this cross site scripting vector. Even though
  // there is no close ">" tag the tags below it will close it. A note: this
  // does mess up the HTML, depending on what HTML is beneath it. It gets around
  // the following NIDS regex: /((\%3D)|(=))[^\n]*((\%3C)|<)[^\n]+((\%3E)|>)/
  // because it doesn't require the end ">". As a side note, this was also
  // affective against a real world XSS filter I came across using an open
  // ended <IFRAME tag instead of an <IMG tag:
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = isIE9() ? '<img>' : '';
  xssHtml = '<IMG SRC="javascript:alert(this)"';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Double open angle brackets. This is an odd one that Steven Christey
  // brought to my attention. At first I misclassified this as the same XSS
  // vector as above but it's surprisingly different. Using an open angle
  // bracket at the end of the vector instead of a close angle bracket causes
  // different behavior in Netscape Gecko rendering. Without it, Firefox will
  // work but Netscape won't:
  // Browser support: [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<iframe src=http://ha.ckers.org/scriptlet.html <';
  assertSanitizedHtml(xssHtml, safeHtml);

  // End title tag. This is a simple XSS vector that closes <TITLE> tags,
  // which can encapsulate the malicious cross site scripting attack:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '</TITLE><SCRIPT>alert(window);<\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Input Image.
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '<input type="IMAGE" />';
  xssHtml = '<INPUT TYPE="IMAGE" SRC="javascript:alert(window);">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Body image.
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '';
  xssHtml = '<BODY BACKGROUND="javascript:alert(window)">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // BODY tag (I like this method because it doesn't require using any variants
  // of "javascript:" or "<SCRIPT..." to accomplish the XSS attack).
  // Dan Crowley additionally noted that you can put a space before the equals
  // sign ("onload=" != "onload ="):
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  safeHtml = '';
  xssHtml = '<BODY ONLOAD=alert(window)>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // IMG SYNSRC.
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG DYNSRC="javascript:alert(window)">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // IMG LOWSRC.
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG LOWSRC="javascript:alert(window)">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // BGSOUND
  safeHtml = '';
  xssHtml = '<BGSOUND SRC="javascript:alert(window);">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // & Javascript includes
  // Browser support: netscape 4
  safeHtml = '<br size="&amp;{alert(window)}" />';
  xssHtml = '<BR SIZE="&{alert(window)}">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Layer
  // Browser support: netscape 4
  safeHtml = '';
  xssHtml = '<LAYER SRC="http://ha.ckers.org/scriptlet.html"></LAYER>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // STYLE sheet
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '';
  xssHtml = '<LINK REL="stylesheet" HREF="javascript:alert(window);">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // List-style-image. Fairly esoteric issue dealing with embedding images for
  // bulleted lists. This will only work in the IE rendering engine because of
  // the JavaScript directive. Not a particularly useful cross site scripting
  // vector:
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '<ul><li>XSS</li></ul>';
  xssHtml = '<STYLE>li {list-style-image: url("javascript:alert(window)");}' +
      '</STYLE><UL><LI>XSS';
  assertSanitizedHtml(xssHtml, safeHtml);

  // VBscript in an image:
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC=\'vbscript:msgbox("XSS")\'>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Mock in an image:
  // Browser support: [NS4]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="mocha:[code]">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Livescript in an image:
  // Browser support: [NS4]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="livescript:[code]">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // META (the odd thing about meta refresh is that it doesn't send a referrer
  // in the header - so it can be used for certain types of attacks where you
  // need to get rid of referring URLs):
  // Browser support: [IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<META HTTP-EQUIV="refresh" CONTENT="0;url=' +
      'javascript:alert(window);">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // META using data: directive URL scheme. This is nice because it also doesnt
  // have anything visibly that has the word SCRIPT or the JavaScript directive
  // in it, because it utilizes base64 encoding. Please see RFC 2397 for more
  // details or go here or here to encode your own. You can also use the XSS
  // calculator below if you just want to encode raw HTML or JavaScript as it
  // has a Base64 encoding method:
  // Browser support: [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<META HTTP-EQUIV="refresh" CONTENT="0;url=data:text/html;base64,' +
      'PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // META with additional URL parameter. If the target website attempts to see
  // if the URL contains "http://" at the beginning you can evade it with the
  // following technique (Submitted by Moritz Naumann):
  safeHtml = '';
  xssHtml = '<META HTTP-EQUIV="refresh" CONTENT="0; URL=http://;URL=' +
      'javascript:alert(window);">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // IFRAME (if iframes are allowed there are a lot of other XSS problems as
  // well):
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<IFRAME SRC="javascript:alert(window);"></IFRAME>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // FRAME (frames have the same sorts of XSS problems as iframes):
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<FRAMESET><FRAME SRC="javascript:alert(window);"></FRAMESET>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // TABLE (who would have thought tables were XSS targets... except me, of
  // course):
  // Browser support: [IE6.0|NS8.1-IE] [O9.02]
  safeHtml = isIE9() ? '<table><div></div></table>' : '<table></table>';
  xssHtml = '<TABLE BACKGROUND="javascript:alert(window)">';
  // TODO(danesh): Investigate why this is different for IE9.
  assertSanitizedHtml(xssHtml, safeHtml);

  // TD (just like above, TD's are vulnerable to BACKGROUNDs containing
  // JavaScript XSS vectors):
  // Browser support: [IE6.0|NS8.1-IE] [O9.02]
  // NOTE(user): original lacked tbody tags
  safeHtml = '<table><tbody><tr><td></td></tr></tbody></table>';
  xssHtml = '<TABLE><TD BACKGROUND="javascript:alert(window)">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // TD (just like above, TD's are vulnerable to BACKGROUNDs containing
  // JavaScript XSS vectors):
  // Browser support: [IE6.0|NS8.1-IE] [O9.02]
  safeHtml = '<div></div>';
  xssHtml = '<DIV STYLE="background-image: url(javascript:alert(window))">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // DIV background-image plus extra characters. I built a quick XSS fuzzer to
  // detect any erroneous characters that are allowed after the open parenthesis
  // but before the JavaScript directive in IE and Netscape 8.1 in secure site
  // mode. These are in decimal but you can include hex and add padding of
  // course. (Any of the following chars can be used: 1-32, 34, 39, 160,
  // 8192-8.13, 12288, 65279):
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '<div></div>';
  xssHtml = '<DIV STYLE="background-image: url(&#1;javascript:alert(window))">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // DIV expression - a variant of this was effective against a real world
  // cross site scripting filter using a newline between the colon and
  // "expression":
  // Browser support: [IE7.0|IE6.0|NS8.1-IE]
  safeHtml = '<div></div>';
  xssHtml = '<DIV STYLE="width: expression(alert(window));">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // STYLE tags with broken up JavaScript for XSS (this XSS at times sends IE
  // into an infinite loop of alerts):
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '';
  xssHtml = '<STYLE>@im\port\'\ja\vasc\ript:alert(window)\';</STYLE>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // STYLE attribute using a comment to break up expression (Thanks to Roman
  // Ivanov for this one):
  // Browser support: [IE7.0|IE6.0|NS8.1-IE]
  safeHtml = '<img />';
  xssHtml = '<IMG STYLE="xss:expr/*XSS*/ession(alert(window))">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Anonymous HTML with STYLE attribute (IE6.0 and Netscape 8.1+ in IE
  // rendering engine mode don't really care if the HTML tag you build exists
  // or not, as long as it starts with an open angle bracket and a letter):
  safeHtml = '<span></span>';
  xssHtml = '<XSS STYLE="xss:expression(alert(window))">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // IMG STYLE with expression (this is really a hybrid of the above XSS
  // vectors, but it really does show how hard STYLE tags can be to parse apart,
  // like above this can send IE into a loop):
  // Browser support: [IE7.0|IE6.0|NS8.1-IE]
  safeHtml = isIE9() ? 'undefined' : 'exp/*<a></a>';
  xssHtml = 'exp/*<A STYLE="no\\xss:noxss("*//*");xss:&#101;x&#x2F;*XSS*//*' +
      '/*/pression(alert(window))">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // STYLE tag (Older versions of Netscape only):
  // Browser support: [NS4]
  safeHtml = '';
  xssHtml = '<STYLE TYPE="text/javascript">xss=true;</STYLE>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // STYLE tag using background-image:
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = isIE9() ? 'undefined' : '<a></a>';
  xssHtml = '<STYLE>.XSS{background-image:url("javascript:alert("XSS")");}' +
      '</STYLE><A CLASS=XSS></A>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // BASE tag. Works in IE and Netscape 8.1 in safe mode. You need the // to
  // comment out the next characters so you won't get a JavaScript error and
  // your XSS tag will render. Also, this relies on the fact that the website
  // uses dynamically placed images like "images/image.jpg" rather than full
  // paths. If the path includes a leading forward slash like
  // "/images/image.jpg" you can remove one slash from this vector (as long as
  // there are two to begin the comment this will work):
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = '';
  xssHtml = '<BASE HREF="javascript:xss=true;//">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // OBJECT tag (if they allow objects, you can also inject virus payloads to
  // infect the users, etc. and same with the APPLET tag). The linked file is
  // actually an HTML file that can contain your XSS:
  // Browser support: [O9.02]
  safeHtml = '';
  xssHtml = '<OBJECT TYPE="text/x-scriptlet" ' +
      'DATA="http://ha.ckers.org/scriptlet.html"></OBJECT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // Using an EMBED tag you can embed a Flash movie that contains XSS. Click
  // here for a demo. If you add the attributes allowScriptAccess="never" and
  // allownetworking="internal" it can mitigate this risk (thank you to Jonathan
  // Vanasco for the info).:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<EMBED SRC="http://ha.ckers.org/xss.swf" ' +
      'AllowScriptAccess="always"></EMBED>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // You can EMBED SVG which can contain your XSS vector. This example only
  // works in Firefox, but it's better than the above vector in Firefox because
  // it does not require the user to have Flash turned on or installed. Thanks
  // to nEUrOO for this one.
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<EMBED SRC="data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dH' +
      ' A6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv Mj' +
      'AwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs aW5rIiB' +
      '2ZXJzaW9uPSIxLjAiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOTQiIGhlaWdodD0iMjAw IiBp' +
      'ZD0ieHNzIj48c2NyaXB0IHR5cGU9InRleHQvZWNtYXNjcmlwdCI+YWxlcnQoIlh TUyIpO' +
      'zwvc2NyaXB0Pjwvc3ZnPg==" type="image/svg+xml" ' +
      'AllowScriptAccess="always"></EMBED>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // XML namespace. The htc file must be located on the same server as your XSS
  // vector:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE]
  safeHtml = '<span>XSS</span>';
  xssHtml = '<HTML xmlns:xss>' +
      '<?import namespace="xss" implementation="http://ha.ckers.org/xss.htc">' +
      '<xss:xss>XSS</xss:xss>' +
      '</HTML>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // XML data island with CDATA obfuscation (this XSS attack works only in IE
  // and Netscape 8.1 in IE rendering engine mode) - vector found by Sec Consult
  // while auditing Yahoo:
  // Browser support: [IE6.0|NS8.1-IE]
  safeHtml = isIE9() ? '<span><span></span></span>' :
                       '<span><span><span>]]&gt;</span></span></span>' +
          '<span></span>';
  xssHtml = '<XML ID=I><X><C><![CDATA[<IMG SRC="javas]]>' +
      '<![CDATA[cript:xss=true;">]]>' +
      '</C></X></xml><SPAN DATASRC=#I DATAFLD=C DATAFORMATAS=HTML></SPAN>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // HTML+TIME in XML. This is how Grey Magic hacked Hotmail and Yahoo!. This
  // only works in Internet Explorer and Netscape 8.1 in IE rendering engine
  // mode and remember that you need to be between HTML and BODY tags for this
  // to work:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE]
  safeHtml = '<span></span>';
  xssHtml = '<HTML><BODY>' +
      '<?xml:namespace prefix="t" ns="urn:schemas-microsoft-com:time">' +
      '<?import namespace="t" implementation="#default#time2">' +
      '<t:set attributeName="innerHTML" to="XSS&lt;SCRIPT DEFER&gt;' +
      'alert(&quot;XSS&quot;)&lt;/SCRIPT&gt;">' +
      '</BODY></HTML>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // IMG Embedded commands - this works when the webpage where this is injected
  // (like a web-board) is behind password protection and that password
  // protection works with other commands on the same domain. This can be used
  // to delete users, add users (if the user who visits the page is an
  // administrator), send credentials elsewhere, etc.... This is one of the
  // lesser used but more useful XSS vectors:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '<img />';
  xssHtml = '<IMG SRC="http://www.thesiteyouareon.com/somecommand.php?' +
      'somevariables=maliciouscode">';
  assertSanitizedHtml(xssHtml, safeHtml);

  // This was tested in IE, your mileage may vary. For performing XSS on sites
  // that allow "<SCRIPT>" but don't allow "<SCRIPT SRC..." by way of a regex
  // filter "/<script[^>]+src/i":
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = '';
  xssHtml = '<SCRIPT a=">" SRC="http://ha.ckers.org/xss.js"><\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  safeHtml = '';
  xssHtml = '<SCRIPT =">" SRC="http://ha.ckers.org/xss.js"><\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // This XSS still worries me, as it would be nearly impossible to stop this
  // without blocking all active content:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0] [O9.02]
  safeHtml = 'PT SRC="http://ha.ckers.org/xss.js"&gt;';
  xssHtml = '<SCRIPT>document.write("<SCRI");<\/SCRIPT>PT ' +
      'SRC="http://ha.ckers.org/xss.js"><\/SCRIPT>';
  assertSanitizedHtml(xssHtml, safeHtml);

  // US-ASCII encoding (found by Kurt Huwig). This uses malformed ASCII encoding
  // with 7 bits instead of 8. This XSS may bypass many content filters but
  // only works if the host transmits in US-ASCII encoding, or if you set the
  // encoding yourself. This is more useful against web application firewall
  // cross site scripting evasion than it is server side filter evasion. Apache
  // Tomcat is the only known server that transmits in US-ASCII encoding. I
  // highly suggest anyone interested in alternate encoding issues look at my
  // charsets issues page:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE]
  // NOTE(danesh): We'd sanitize this if we received the (mis-)appropriately
  // encoded version of this.
  // safeHtml = ' script alert( XSS ) /script ';
  // xssHtml = '¼script¾alert(¢XSS¢)¼/script¾';
  // assertSanitizedHtml(xssHtml, safeHtml);

  // Escaping JavaScript escapes. When the application is written to output some
  // user information inside of a JavaScript like the following:
  // <SCRIPT>var a="$ENV{QUERY_STRING}";<\/SCRIPT> and you want to inject your
  // own JavaScript into it but the server side application escapes certain
  // quotes you can circumvent that by escaping their escape character. When
  // this is gets injected it will read
  // <SCRIPT>var a="\\";alert('XSS');//";<\/SCRIPT> which ends up un-escaping
  // the double quote and causing the Cross Site Scripting vector to fire.
  // The XSS locator uses this method.:
  // Browser support: [IE7.0|IE6.0|NS8.1-IE] [NS8.1-G|FF2.0]
  // NOTE(danesh): We expect this to fail. More of a JS sanitizer check or a
  // server-side template vulnerability test.
  // safeHtml = '';
  // xssHtml = '\";alert(window);//';
  // assertSanitizedHtml(xssHtml, safeHtml);
}


function testDataAttributes() {
  var html = '<div data-xyz="test">Testing</div>';
  var safeHtml = '<div>Testing</div>';
  assertSanitizedHtml(html, safeHtml);

  html = '<div data-goomoji="test" data-other="xyz">Testing</div>';
  var expectedHtml = '<div data-goomoji="test">Testing</div>';
  assertSanitizedHtml(
      html, expectedHtml, new goog.html.sanitizer.HtmlSanitizer.Builder()
                              .allowCssStyles()
                              .allowDataAttributes(['data-goomoji'])
                              .build());
}


function testDisallowedDataWhitelistingAttributes() {
  assertThrows(function() {
    new goog.html.sanitizer.HtmlSanitizer.Builder()
        .allowDataAttributes(['datai'])
        .build();
  });

  // Disallow internal attribute used by html sanitizer
  assertThrows(function() {
    new goog.html.sanitizer.HtmlSanitizer.Builder()
        .allowDataAttributes(['data-i', 'data-sanitizer-safe'])
        .build();
  });
}


function testFormBody() {
  var safeHtml = '<form>stuff</form>';
  var formHtml = '<form name="body">stuff</form>';
  assertSanitizedHtml(
      formHtml, safeHtml,
      new goog.html.sanitizer.HtmlSanitizer.Builder().allowFormTag().build());
}


function testStyleTag() {
  var safeHtml = '';
  var xssHtml = '<STYLE>P.special {color : green;border: solid red;}</STYLE>';
  assertSanitizedHtml(xssHtml, safeHtml);
}


function testOnlyAllowTags() {
  var result = '<div><span></span>' +
      '<a href="http://www.google.com">hi</a>' +
      '<br>Test.<span></span><div align="right">Test</div></div>';
  // If we were mimicing goog.labs.html.sanitizer, our output would be
  // '<div><a>hi</a><br>Test.<div>Test</div></div>';
  assertSanitizedHtml(
      '<div><img id="bar" name=foo class="c d" ' +
          'src="http://wherever.com">' +
          '<a href=" http://www.google.com">hi</a>' +
          '<br>Test.<hr><div align="right">Test</div></div>',
      result, new goog.html.sanitizer.HtmlSanitizer.Builder()
                  .onlyAllowTags(['bR', 'a', 'DIV'])
                  .build());
}


function testDisallowNonWhitelistedTags() {
  assertThrows('Should error on elements not whitelisted', function() {
    new goog.html.sanitizer.HtmlSanitizer.Builder().onlyAllowTags(['x']);
  });
}


function testDefaultPoliciesAreApplied() {
  var result = '<img /><a href="http://www.google.com">hi</a>' +
      '<a href="ftp://whatever.com">another</a>';
  assertSanitizedHtml(
      '<img id="bar" name=foo class="c d" ' +
          'src="http://wherever.com">' +
          '<a href=" http://www.google.com">hi</a>' +
          '<a href=ftp://whatever.com>another</a>',
      result);
}


function testCustomNamePolicyIsApplied() {
  var result = '<img name="myOwnPrefix-foo" />' +
      '<a href="http://www.google.com">hi</a>' +
      '<a href="ftp://whatever.com">another</a>';
  assertSanitizedHtml(
      '<img id="bar" name=foo class="c d" ' +
          'src="http://wherever.com"><a href=" http://www.google.com">hi</a>' +
          '<a href=ftp://whatever.com>another</a>',
      result, new goog.html.sanitizer.HtmlSanitizer.Builder()
                  .withCustomNamePolicy(function(name) {
                    return 'myOwnPrefix-' + name;
                  })
                  .build());
}


function testCustomTokenPolicyIsApplied() {
  var result = '<img id="myOwnPrefix-bar" ' +
      'class="myOwnPrefix-c myOwnPrefix-d" />' +
      '<a href="http://www.google.com">hi</a>' +
      '<a href="ftp://whatever.com">another</a>';
  assertSanitizedHtml(
      '<img id="bar" name=foo class="c d" ' +
          'src="http://wherever.com"><a href=" http://www.google.com">hi</a>' +
          '<a href=ftp://whatever.com>another</a>',
      result, new goog.html.sanitizer.HtmlSanitizer.Builder()
                  .withCustomTokenPolicy(function(name) {
                    return 'myOwnPrefix-' + name;
                  })
                  .build());
}


function testMultipleCustomPoliciesAreApplied() {
  var result = '<img id="plarpalarp-bar" name="larlarlar-foo" ' +
      'class="plarpalarp-c plarpalarp-d" />' +
      '<a href="http://www.google.com">hi</a>' +
      '<a href="ftp://whatever.com">another</a>';
  assertSanitizedHtml(
      '<img id="bar" name=foo class="c d" ' +
          'src="http://wherever.com"><a href=" http://www.google.com">hi</a>' +
          '<a href=ftp://whatever.com>another</a>',
      result,
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .withCustomTokenPolicy(function(token) {
            return 'plarpalarp-' + token;
          })
          .withCustomNamePolicy(function(name) { return 'larlarlar-' + name; })
          .build());
}


function testNonTrivialCustomPolicy() {
  var result = '<img /><a href="http://www.google.com" name="Alacrity">hi</a>' +
      '<a href="ftp://whatever.com">another</a>';
  assertSanitizedHtml(
      '<img id="bar" name=foo class="c d" src="http://wherever.com">' +
          '<a href=" http://www.google.com" name=Alacrity>hi</a>' +
          '<a href=ftp://whatever.com>another</a>',
      result,
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .withCustomNamePolicy(function testNamesMustBeginWithTheLetterA(
              name) { return name.charAt(0) != 'A' ? null : name; })
          .build());
}


function testNetworkRequestUrlsAllowed() {
  var result = '<img src="http://wherever.com" />' +
      '<img src="https://secure.wherever.com" />' +
      '<img alt="test" src="//wherever.com" />' +
      '<a href="http://www.google.com">hi</a>' +
      '<a href="ftp://whatever.com">another</a>';
  assertSanitizedHtml(
      '<img id="bar" name=foo class="c d" src="http://wherever.com">' +
          '<img src="https://secure.wherever.com">' +
          '<img alt="test" src="//wherever.com">' +
          '<a href=" http://www.google.com">hi</a>' +
          '<a href=ftp://whatever.com>another</a>',
      result, new goog.html.sanitizer.HtmlSanitizer.Builder()
                  .withCustomNetworkRequestUrlPolicy(goog.html.SafeUrl.sanitize)
                  .build());
}


function testCustomNRUrlPolicyMustNotContainParameters() {
  var result = '<img src="http://wherever.com" /><img />';
  assertSanitizedHtml(
      '<img id="bar" class="c d" src="http://wherever.com">' +
          '<img src="https://www.bank.com/withdraw?amount=onebeeeelion">',
      result, new goog.html.sanitizer.HtmlSanitizer.Builder()
                  .withCustomNetworkRequestUrlPolicy(function(url) {
                    return url.match(/\?/) ? null :
                        goog.html.testing.newSafeUrlForTest(url);
                  })
                  .build());
}


function testPolicyHints() {
  var sanitizer =
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .allowFormTag()
          .withCustomNetworkRequestUrlPolicy(function(url, policyHints) {
            if ((policyHints.tagName == 'img' &&
                 policyHints.attributeName == 'src') ||
                (policyHints.tagName == 'input' &&
                 policyHints.attributeName == 'src')) {
              return goog.html.testing.newSafeUrlForTest(
                  'https://imageproxy/?' + url);
            } else {
              return null;
            }
          })
          .withCustomUrlPolicy(function(url, policyHints) {
            if (policyHints.tagName == 'a' &&
                policyHints.attributeName == 'href') {
              return goog.html.testing.newSafeUrlForTest(
                  'https://linkproxy/?' + url);
            }
            return goog.html.SafeUrl.sanitize(url);
          })
          .build();

  // TODO(user): update this test to include a stylesheet once they're
  //   supported (in order to view both branches of the NRUrlPolicy).
  var result = '<img src="https://imageproxy/?http://image" /> ' +
      '<input type="image" src="https://imageproxy/?http://another" />' +
      '<a href="https://linkproxy/?http://link">a link</a>' +
      '<form action="http://formaction"></form>';
  assertSanitizedHtml(
      '<img src="http://image"> <input type="image" ' +
          'src="http://another"><a href="http://link">a link</a>' +
          '<form action="http://formaction"></form>',
      result, sanitizer);
}


function testNRUrlPolicyAffectsCssSanitization() {
  var sanitizer =
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .allowCssStyles()
          .withCustomNetworkRequestUrlPolicy(function(url, policyHints) {
            // Network request URLs may only be over https.
            if (!/^https:\/\//i.test(url)) {
              return null;
            }
            // CSS background URLs may only come from google.com.
            if (policyHints.cssProperty === 'background-image') {
              if (!/^https:\/\/www\.google\.com\//i.test(url)) {
                return null;
              }
            }
            return goog.html.SafeUrl.sanitize(url);
          })
          .build();

  var sanitizedHtml;
  try {
    sanitizedHtml = sanitizer.sanitize(
        '<div style="background: url(\'https://www.google.com/i.png\')"></div>');
    if (isIE9()) {
      assertEquals('', goog.html.SafeHtml.unwrap(sanitizedHtml));
      return;
    }
    assertRegExp(
        /background(?:-image)?:.*url\(.?https:\/\/www.google.com\/i.png.?\)/,
        getStyle(sanitizedHtml));
  } catch (err) {
    if (!isIE8()) {
      throw err;
    }
  }

  try {
    sanitizedHtml = sanitizer.sanitize(
        '<div style="background: url(\'https://wherever/\')"></div>');
    assertNotContains(
        'https://wherever/', goog.html.SafeHtml.unwrap(sanitizedHtml));
  } catch (err) {
    if (!isIE8()) {
      throw err;
    }
  }

  sanitizedHtml = '<img src="https://www.google.com/i.png">';
  assertSanitizedHtml(sanitizedHtml, sanitizedHtml, sanitizer);

  sanitizedHtml = '<img src="https://wherever/">';
  assertSanitizedHtml(sanitizedHtml, sanitizedHtml, sanitizer);
}


function testAllowOnlyHttpAndHttpsAndFtpForNRUP() {
  var input = '<img src="http://whatever">' +
      '<img src="https://whatever">' +
      '<img src="ftp://nope">' +
      '<img src="garbage:nope">' +
      '<img src="data:yep">';
  var expected = '<img src="http://whatever" />' +
      '<img src="https://whatever" />' +
      '<img src="ftp://nope">' +
      '<img />' +
      '<img />';
  assertSanitizedHtml(
      input, expected,
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .withCustomNetworkRequestUrlPolicy(goog.html.SafeUrl.sanitize)
          .build());
}


function testUriSchemesOnNonNetworkRequestUrls() {
  var input = '<a href="ftp://yep">something</a>' +
      '<a href="gopher://yep">something</a>' +
      '<a href="gopher:nope">something</a>' +
      '<a href="http://yep">something</a>' +
      '<a href="https://yep">something</a>' +
      '<a href="garbage://nope">something</a>' +
      '<a href="relative/yup">something</a>' +
      '<a href="nope">something</a>' +
      '<a>lol</a>';
  var expected = '<a href="ftp://yep">something</a>' +
      '<a>something</a>' +
      '<a>something</a>' +
      '<a href="http://yep">something</a>' +
      '<a href="https://yep">something</a>' +
      '<a>something</a>' +
      '<a href="relative/yup">something</a>' +
      '<a href="nope">something</a>' +
      '<a>lol</a>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .withCustomUrlPolicy(goog.html.SafeUrl.sanitize)
                           .build());
}


function testOverridingGetOrSetAttribute() {
  var input = '<form>' +
      '<input name=setAttribute />' +
      '<input name=getAttribute />' +
      '</form>';
  var expected = '<form><input><input></form>';
  assertSanitizedHtml(
      input, expected,
      new goog.html.sanitizer.HtmlSanitizer.Builder().allowFormTag().build());
}


function testOverridingBookkeepingAttribute() {
  var input = '<div data-sanitizer-foo="1" alt="b">Hello</div>';
  var expected = '<div alt="b">Hello</div>';
  assertSanitizedHtml(
      input, expected,
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .withCustomTokenPolicy(function(token) { return token; })
          .build());
}


function testTemplateRemoved() {
  var input = '<div><template><h1>boo</h1></template></div>';
  var expected = '<div></div>';
  assertSanitizedHtml(input, expected);
}


/**
 * Shorthand for sanitized tags
 * @param {string} tag
 * @return {string}
 */
function otag(tag) {
  return 'data-sanitizer-original-tag="' + tag + '"';
}


function testOriginalTag() {
  var input = '<p>Line1<magic></magic></p>';
  var expected = '<p>Line1<span ' + otag('magic') + '></span></p>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .addOriginalTagNames()
                           .build());
}


function testOriginalTagOverwrite() {
  var input = '<div id="qqq">hello' +
      '<a:b id="hi" class="hnn a" boo="3">qqq</a:b></div>';
  var expected = '<div>hello<span ' + otag('a:b') + ' id="HI" class="hnn a">' +
      'qqq</span></div>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .addOriginalTagNames()
                           .withCustomTokenPolicy(function(token, hints) {
                             var an = hints.attributeName;
                             if (an === 'id' && token === 'hi') {
                               return 'HI';
                             } else if (an === 'class') {
                               return token;
                             }
                             return null;
                           })
                           .build());
}


function testOriginalTagClobber() {
  var input = '<a:b data-sanitizer-original-tag="xss"></a:b>';
  var expected = '<span ' + otag('a:b') + '></span>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .addOriginalTagNames()
                           .build());
}


// the tests below investigate how <span> behaves when it is unknowingly put
// as child or parent of other elements due to sanitization. <div> had even more
// problems (e.g. cannot be a child of <p>)


/**
 * Sanitize content, let the browser apply its own HTML tree correction by
 * attaching the content to the document, and then assert it matches the
 * expected value.
 * @param {string} expected
 * @param {string} input
 */
function assertAfterInsertionEquals(expected, input) {
  var sanitizer =
      new goog.html.sanitizer.HtmlSanitizer.Builder().allowFormTag().build();
  input = goog.html.SafeHtml.unwrap(sanitizer.sanitize(input));
  var div = document.createElement('div');
  document.body.appendChild(div);
  div.innerHTML = input;
  goog.testing.dom.assertHtmlMatches(
      expected, div.innerHTML, true /* opt_strictAttributes */);
  div.parentNode.removeChild(div);
}


function testSpanNotCorrectedByBrowsersOuter() {
  if (isIE8() || isIE9()) {
    return;
  }
  goog.array.forEach(
      goog.object.getKeys(goog.html.sanitizer.TagWhitelist), function(tag) {
        if (goog.array.contains(
                [
                  'BR', 'IMG', 'AREA', 'COL', 'COLGROUP', 'HR', 'INPUT',
                  'SOURCE', 'WBR'
                ],
                tag)) {
          return;  // empty elements, ok
        }
        if (goog.array.contains(['CAPTION'], tag)) {
          return;  // potential problems
        }
        if (goog.array.contains(['NOSCRIPT'], tag)) {
          return;  // weird/not important
        }
        if (goog.array.contains(
                [
                  'SELECT', 'TABLE', 'TBODY', 'TD', 'TR', 'TEXTAREA', 'TFOOT',
                  'THEAD', 'TH'
                ],
                tag)) {
          return;  // consistent in whitelist, ok
        }
        var input = '<' + tag.toLowerCase() + '>a<span></span>a</' +
            tag.toLowerCase() + '>';
        assertAfterInsertionEquals(input, input);
      });
}


function testSpanNotCorrectedByBrowsersInner() {
  if (isIE8() || isIE9()) {
    return;
  }
  goog.array.forEach(
      goog.object.getKeys(goog.html.sanitizer.TagWhitelist), function(tag) {
        if (goog.array.contains(
                [
                  'CAPTION', 'TABLE', 'TBODY', 'TD', 'TR', 'TEXTAREA', 'TFOOT',
                  'THEAD', 'TH'
                ],
                tag)) {
          return;  // consistent in whitelist, ok
        }
        if (goog.array.contains(['COL', 'COLGROUP'], tag)) {
          return;  // potential problems
        }
        // TODO(pelizzi): Skip testing for FORM tags on Chrome until b/32550695
        // is fixed.
        if (tag == 'FORM' && goog.userAgent.WEBKIT) {
          return;
        }
        var input;
        if (goog.array.contains(
                [
                  'BR', 'IMG', 'AREA', 'COL', 'COLGROUP', 'HR', 'INPUT',
                  'SOURCE', 'WBR'  // empty elements, ok
                ],
                tag)) {
          input = '<span>a<' + tag.toLowerCase() + '>a</span>';
        } else {
          input = '<span>a<' + tag.toLowerCase() + '>a</' + tag.toLowerCase() +
              '>a</span>';
        }
        assertAfterInsertionEquals(input, input);
      });
}


function testTemplateTagToSpan() {
  var input = '<template alt="yes"><p>q</p></template>';
  var expected = '<span alt="yes"><p>q</p></span>';
  // TODO(pelizzi): use unblockTag once it's available
  delete goog.html.sanitizer.TagBlacklist['TEMPLATE'];
  assertSanitizedHtml(input, expected);
  goog.html.sanitizer.TagBlacklist['TEMPLATE'] = true;
}


var just = goog.string.Const.from('test');


function testTemplateTagWhitelisted() {
  var input = '<div><template alt="yes"><p>q</p></template></div>';
  // TODO(pelizzi): use unblockTag once it's available
  delete goog.html.sanitizer.TagBlacklist['TEMPLATE'];
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  goog.html.sanitizer.unsafe.alsoAllowTags(just, builder, ['TEMPLATE']);
  assertSanitizedHtml(input, input, builder.build());
  goog.html.sanitizer.TagBlacklist['TEMPLATE'] = true;
}


function testTemplateTagFake() {
  var input = '<template data-sanitizer-original-tag="template">a</template>';
  var expected = '';
  assertSanitizedHtml(input, expected);
}


function testTemplateNested() {
  var input = '<template><p>a</p><zzz alt="a"/><script>z</script><template>' +
      '<p>a</p><zzz alt="a"/><script>z</script></template></template>';
  var expected = '<template><p>a</p><span alt="a"></span><template>' +
      '<p>a</p><span alt="a"></span></template></template>';
  // TODO(pelizzi): use unblockTag once it's available
  delete goog.html.sanitizer.TagBlacklist['TEMPLATE'];
  var builder = new goog.html.sanitizer.HtmlSanitizer.Builder();
  goog.html.sanitizer.unsafe.alsoAllowTags(just, builder, ['TEMPLATE']);
  assertSanitizedHtml(input, expected, builder.build());
  goog.html.sanitizer.TagBlacklist['TEMPLATE'] = true;
}


function testOnlyAllowEmptyAttrList() {
  var input = '<p alt="nope" aria-checked="true" zzz="1">b</p>' +
      '<a target="_blank">c</a>';
  var expected = '<p>b</p><a>c</a>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .onlyAllowAttributes([])
                           .build());
}


function testOnlyAllowUnWhitelistedAttr() {
  assertThrows(function() {
    new goog.html.sanitizer.HtmlSanitizer.Builder().onlyAllowAttributes(
        ['alt', 'zzz']);
  });
}


function testOnlyAllowAttributeWildCard() {
  var input =
      '<div alt="yes" aria-checked="true"><img alt="yep" avbb="no" /></div>';
  var expected = '<div alt="yes"><img alt="yep" /></div>';
  assertSanitizedHtml(
      input, expected,
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .onlyAllowAttributes([{tagName: '*', attributeName: 'alt'}])
          .build());
}


function testOnlyAllowAttributeLabelForA() {
  var input = '<a label="3" aria-checked="4">fff</a><img label="3" />';
  var expected = '<a label="3">fff</a><img />';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .onlyAllowAttributes([{
                             tagName: '*',
                             attributeName: 'label',
                             policy: function(value, hints) {
                               if (hints.tagName !== 'a') {
                                 return null;
                               }
                               return value;
                             }
                           }])
                           .build());
}


function testOnlyAllowAttributePolicy() {
  var input = '<img alt="yes" /><img alt="no" />';
  var expected = '<img alt="yes" /><img />';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .onlyAllowAttributes([{
                             tagName: '*',
                             attributeName: 'alt',
                             policy: function(value, hints) {
                               assertEquals(hints.attributeName, 'alt');
                               return value === 'yes' ? value : null;
                             }
                           }])
                           .build());
}


function testOnlyAllowAttributePolicyPipe1() {
  var input = '<a target="hello">b</a>';
  var expected = '<a target="_blank">b</a>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .onlyAllowAttributes([{
                             tagName: 'a',
                             attributeName: 'target',
                             policy: function(value, hints) {
                               assertEquals(hints.attributeName, 'target');
                               return '_blank';
                             }
                           }])
                           .build());
}


function testOnlyAllowAttributePolicyPipe2() {
  var input = '<a target="hello">b</a>';
  var expected = '<a>b</a>';
  assertSanitizedHtml(
      input, expected, new goog.html.sanitizer.HtmlSanitizer.Builder()
                           .onlyAllowAttributes([{
                             tagName: 'a',
                             attributeName: 'target',
                             policy: function(value, hints) {
                               assertEquals(hints.attributeName, 'target');
                               return 'nope';
                             }
                           }])
                           .build());
}


function testOnlyAllowAttributeSpecificPolicyThrows() {
  assertThrows(function() {
    new goog.html.sanitizer.HtmlSanitizer.Builder().onlyAllowAttributes([
      {tagName: 'img', attributeName: 'src', policy: goog.functions.identity}
    ]);
  });
}


function testOnlyAllowAttributeGenericPolicyThrows() {
  assertThrows(function() {
    new goog.html.sanitizer.HtmlSanitizer.Builder().onlyAllowAttributes([{
      tagName: '*',
      attributeName: 'target',
      policy: goog.functions.identity
    }]);
  });
}


function testOnlyAllowAttributeRefineThrows() {
  var builder =
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .onlyAllowAttributes(
              ['aria-checked', {tagName: 'LINK', attributeName: 'HREF'}])
          .onlyAllowAttributes(['aria-checked']);
  assertThrows(function() {
    builder.onlyAllowAttributes(['alt']);
  });
}


function testUrlWithCredentials() {
  if (isIE8() || isIE9()) {
    return;
  }
  // IE has trouble getting and setting URL attributes with credentials. Both
  // HTMLSanitizer and assertHtmlMatches are affected by the bug, hence the use
  // of plain string matching.
  var url = 'http://foo:bar@example.com';
  var input = '<div style="background-image: url(\'' + url + '\');">' +
      '<img src="' + url + '" /></div>';
  var expectedIE = '<div style="background-image: url(&quot;' + url +
      '&quot;);"><img src="' + url + '" /></div>';
  var sanitizer =
      new goog.html.sanitizer.HtmlSanitizer.Builder()
          .withCustomNetworkRequestUrlPolicy(goog.html.SafeUrl.sanitize)
          .allowCssStyles()
          .build();
  if (goog.userAgent.EDGE_OR_IE) {
    assertEquals(
        expectedIE, goog.html.SafeHtml.unwrap(sanitizer.sanitize(input)));
  } else {
    assertSanitizedHtml(input, input, sanitizer);
  }
}
