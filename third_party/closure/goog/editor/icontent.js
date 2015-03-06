// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
// All Rights Reserved.

/**
 * @fileoverview Static functions for writing the contents of an iframe-based
 * editable field. These vary significantly from browser to browser. Uses
 * strings and document.write instead of DOM manipulation, because
 * iframe-loading is a performance bottleneck.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.icontent');
goog.provide('goog.editor.icontent.FieldFormatInfo');
goog.provide('goog.editor.icontent.FieldStyleInfo');

goog.require('goog.dom');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * A data structure for storing simple rendering info about a field.
 *
 * @param {string} fieldId The id of the field.
 * @param {boolean} standards Whether the field should be rendered in
 *     standards mode.
 * @param {boolean} blended Whether the field is in blended mode.
 * @param {boolean} fixedHeight Whether the field is in fixedHeight mode.
 * @param {Object=} opt_extraStyles Other style attributes for the field,
 *     represented as a map of strings.
 * @constructor
 * @final
 */
goog.editor.icontent.FieldFormatInfo = function(fieldId, standards, blended,
    fixedHeight, opt_extraStyles) {
  this.fieldId_ = fieldId;
  this.standards_ = standards;
  this.blended_ = blended;
  this.fixedHeight_ = fixedHeight;
  this.extraStyles_ = opt_extraStyles || {};
};



/**
 * A data structure for storing simple info about the styles of a field.
 * Only needed in Firefox/Blended mode.
 * @param {Element} wrapper The wrapper div around a field.
 * @param {string} css The css for a field.
 * @constructor
 * @final
 */
goog.editor.icontent.FieldStyleInfo = function(wrapper, css) {
  this.wrapper_ = wrapper;
  this.css_ = css;
};


/**
 * Whether to always use standards-mode iframes.
 * @type {boolean}
 * @private
 */
goog.editor.icontent.useStandardsModeIframes_ = false;


/**
 * Sets up goog.editor.icontent to always use standards-mode iframes.
 */
goog.editor.icontent.forceStandardsModeIframes = function() {
  goog.editor.icontent.useStandardsModeIframes_ = true;
};


/**
 * Generate the initial iframe content.
 * @param {goog.editor.icontent.FieldFormatInfo} info Formatting info about
 *     the field.
 * @param {string} bodyHtml The HTML to insert as the iframe body.
 * @param {goog.editor.icontent.FieldStyleInfo?} style Style info about
 *     the field, if needed.
 * @return {string} The initial IFRAME content HTML.
 * @private
 */
goog.editor.icontent.getInitialIframeContent_ =
    function(info, bodyHtml, style) {
  var html = [];

  if (info.blended_ && info.standards_ ||
      goog.editor.icontent.useStandardsModeIframes_) {
    html.push('<!DOCTYPE HTML>');
  }

  // <HTML>
  // NOTE(user): Override min-widths that may be set for all
  // HTML/BODY nodes. A similar workaround is below for the <body> tag. This
  // can happen if the host page includes a rule like this in its CSS:
  //
  // html, body {min-width: 500px}
  //
  // In this case, the iframe's <html> and/or <body> may be affected. This was
  // part of the problem observed in http://b/5674613. (The other part of that
  // problem had to do with the presence of a spurious horizontal scrollbar,
  // which caused the editor height to be computed incorrectly.)
  html.push('<html style="background:none transparent;min-width:0;');

  // Make sure that the HTML element's height has the
  // correct value as the body element's percentage height is made relative
  // to the HTML element's height.
  // For fixed-height it should be 100% since we want the body to fill the
  // whole height. For growing fields it should be auto since we want the
  // body to size to its content.
  if (info.blended_) {
    html.push('height:', info.fixedHeight_ ? '100%' : 'auto');
  }
  html.push('">');

  // <HEAD><STYLE>

  // IE/Safari whitebox need styles set only iff the client specifically
  // requested them.
  html.push('<head><style>');
  if (style && style.css_) {
    html.push(style.css_);
  }

  // Firefox blended needs to inherit all the css from the original page.
  // Firefox standards mode needs to set extra style for images.
  if (goog.userAgent.GECKO && info.standards_) {
    // Standards mode will collapse broken images.  This means that they
    // can never be removed from the field.  This style forces the images
    // to render as a broken image icon, sized based on the width and height
    // of the image.
    // TODO(user): Make sure we move this into a contentEditable code
    // path if there ever is one for FF.
    html.push(' img {-moz-force-broken-image-icon: 1;}');
  }

  html.push('</style></head>');

  // <BODY>
  // Hidefocus is needed to ensure that IE7 doesn't show the dotted, focus
  // border when you tab into the field.
  html.push('<body g_editable="true" hidefocus="true" ');
  if (goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) {
    html.push('contentEditable ');
  }

  html.push('class="editable ');

  // TODO: put the field's original ID on the body and stop using ID as a
  // way of getting the pointer to the field in the iframe now that it's
  // always the body.
  html.push('" id="', info.fieldId_, '" style="min-width:0;');

  if (goog.userAgent.GECKO && info.blended_) {
    // IMPORTANT: Apply the css from the body then all of the clearing
    // CSS to make sure the clearing CSS overrides (e.g. if the body
    // has a 3px margin, we want to make sure to override it with 0px.
    html.push(

        // margin should not be applied to blended mode because the margin is
        // outside the iframe
        // In whitebox mode, we want to leave the margin to the default so
        // there is a nice margin around the text.
        ';width:100%;border:0;margin:0;background:none transparent;',

        // In standards-mode, height 100% makes the body size to its
        // parent html element, but in quirks mode, we want auto because
        // 100% makes it size to the containing window even if the html
        // element is smaller.
        // TODO: Fixed height, standards mode, CSS_WRITING, with margins on the
        // paragraphs has a scrollbar when it doesn't need it.  Putting the
        // height to auto seems to fix it.  Figure out if we should always
        // just use auto?
        ';height:', info.standards_ ? '100%' : 'auto');

    // Only do this for mozilla. IE6 standards mode has a rendering bug when
    // there are scrollbars and the body's overflow property is auto
    if (info.fixedHeight_) {
      html.push(';overflow:auto');
    } else {
      html.push(';overflow-y:hidden;overflow-x:auto');
    }
  }

  // Hide the native focus rect in Opera.
  if (goog.userAgent.OPERA) {
    html.push(';outline:hidden');
  }

  for (var key in info.extraStyles_) {
    html.push(';' + key + ':' + info.extraStyles_[key]);
  }

  html.push('">', bodyHtml, '</body></html>');

  return html.join('');
};


/**
 * Write the initial iframe content in normal mode.
 * @param {goog.editor.icontent.FieldFormatInfo} info Formatting info about
 *     the field.
 * @param {string} bodyHtml The HTML to insert as the iframe body.
 * @param {goog.editor.icontent.FieldStyleInfo?} style Style info about
 *     the field, if needed.
 * @param {HTMLIFrameElement} iframe The iframe.
 */
goog.editor.icontent.writeNormalInitialBlendedIframe =
    function(info, bodyHtml, style, iframe) {
  // Firefox blended needs to inherit all the css from the original page.
  // Firefox standards mode needs to set extra style for images.
  if (info.blended_) {
    var field = style.wrapper_;
    // If there is padding on the original field, then the iFrame will be
    // positioned inside the padding by default.  We don't want this, as it
    // causes the contents to appear to shift, and also causes the
    // scrollbars to appear inside the padding.
    //
    // To compensate, we set the iframe margins to offset the padding.
    var paddingBox = goog.style.getPaddingBox(field);
    if (paddingBox.top || paddingBox.left ||
        paddingBox.right || paddingBox.bottom) {
      goog.style.setStyle(iframe, 'margin',
          (-paddingBox.top) + 'px ' +
          (-paddingBox.right) + 'px ' +
          (-paddingBox.bottom) + 'px ' +
          (-paddingBox.left) + 'px');
    }
  }

  goog.editor.icontent.writeNormalInitialIframe(
      info, bodyHtml, style, iframe);
};


/**
 * Write the initial iframe content in normal mode.
 * @param {goog.editor.icontent.FieldFormatInfo} info Formatting info about
 *     the field.
 * @param {string} bodyHtml The HTML to insert as the iframe body.
 * @param {goog.editor.icontent.FieldStyleInfo?} style Style info about
 *     the field, if needed.
 * @param {HTMLIFrameElement} iframe The iframe.
 */
goog.editor.icontent.writeNormalInitialIframe =
    function(info, bodyHtml, style, iframe) {

  var html = goog.editor.icontent.getInitialIframeContent_(
      info, bodyHtml, style);

  var doc = goog.dom.getFrameContentDocument(iframe);
  doc.open();
  doc.write(html);
  doc.close();
};


/**
 * Write the initial iframe content in IE/HTTPS mode.
 * @param {goog.editor.icontent.FieldFormatInfo} info Formatting info about
 *     the field.
 * @param {Document} doc The iframe document.
 * @param {string} bodyHtml The HTML to insert as the iframe body.
 */
goog.editor.icontent.writeHttpsInitialIframe = function(info, doc, bodyHtml) {
  var body = doc.body;

  // For HTTPS we already have a document with a doc type and a body element
  // and don't want to create a new history entry which can cause data loss if
  // the user clicks the back button.
  if (goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) {
    body.contentEditable = true;
  }
  body.className = 'editable';
  body.setAttribute('g_editable', true);
  body.hideFocus = true;
  body.id = info.fieldId_;

  goog.style.setStyle(body, info.extraStyles_);
  body.innerHTML = bodyHtml;
};

