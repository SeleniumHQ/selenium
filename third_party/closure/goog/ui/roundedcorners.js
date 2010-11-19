// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the RoundedCorners class. This depends on the
 * GSE servlet: http://go/roundedcornerservlet.java
 * The sevlet provides the images for that this class depends on for generating
 * the rounded corners. See com.google.javascript.closure.RoundedCornerServlet
 * for sample usage.
 *
 */

goog.provide('goog.ui.RoundedCorners');
goog.provide('goog.ui.RoundedCorners.Corners');

goog.require('goog.Uri');
goog.require('goog.color');
goog.require('goog.dom');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * Class for constructing the HTML for a rounded corner border based on the
 * RoundedCornerServlet server class.
 *
 * @constructor
 * @param {goog.Uri|string} servletUri The uri to the RoundedCornerServlet for
 * fetching the rounded corner images.
 */
goog.ui.RoundedCorners = function(servletUri) {
  this.servletUri_ = servletUri;

  /**
   * Size of the border corners
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = new goog.math.Size(8, 8);

  /**
   * Which corners to show.
   * @type {number}
   * @private
   */
  this.cornersToShow_ = goog.ui.RoundedCorners.Corners.ALL;
};


/**
 * A convenience method to round the corners of a given element.
 * To achieve the rounding, the rounded corners div replaces the element in its
 * parent.  The element is added as the content of the rounded corners div.
 *
 * @param {Element} element The element to provide with rounded corners.
 * @param {string} servletUri The uri to the RoundedCornerServlet for
 * fetching the rounded corner images.
 * @param {goog.math.Size=} opt_borderThickness The rounded corners border
 * see setBorderThickness().  If no value is supplied, (5, 5) will be used.
 * @param {number=} opt_corners The corners to round.  A bitwise integer.  If no
 * corners are specified, goog.ui.RoundedCorners.Corners.ALL will be used.
 */
goog.ui.RoundedCorners.roundElement = function(
    element, servletUri, opt_borderThickness, opt_corners) {

  var roundedCorners = new goog.ui.RoundedCorners(servletUri);

  roundedCorners.setColor(goog.style.getBackgroundColor(element));

  // Look to the parent for a background color.
  var backgroundColor;
  var parent = /** @type {Element} */ (element.parentNode);
  backgroundColor = goog.style.getBackgroundColor(parent);

  // Default to white if the color is invalid.
  /** @preserveTry */
  try {
    goog.color.parse(backgroundColor);
  } catch (ex) {
    backgroundColor = 'white';
  }

  roundedCorners.setBackgroundColor(backgroundColor);

  if (!goog.isDef(opt_corners)) {
    opt_corners = goog.ui.RoundedCorners.Corners.ALL;
  }
  roundedCorners.setCornersToShow(opt_corners);

  if (!goog.isDef(opt_borderThickness)) {
    opt_borderThickness = new goog.math.Size(5, 5);
  }
  roundedCorners.setBorderThickness(opt_borderThickness);

  var roundedContainer = goog.dom.htmlToDocumentFragment(
      roundedCorners.getBackgroundHtml());

  parent.replaceChild(roundedContainer, element);

  // Remove the content element, replace it with the element to round.
  goog.dom.removeNode(goog.dom.getLastElementChild(roundedContainer));
  goog.dom.appendChild(roundedContainer, element);
};


/**
 * Foreground color of the rounded corners
 * @type {string}
 * @private
 */
goog.ui.RoundedCorners.prototype.color_ = '#ff0000';


/**
 * Background color of the rounded corners
 * @type {string}
 * @private
 */
goog.ui.RoundedCorners.prototype.bgColor_ = '';


/**
 * Inner color of the rounded corners
 * @type {string}
 * @private
 */
goog.ui.RoundedCorners.prototype.inColor_ = '';


/**
 * HTML content that goes inside the template
 * @type {string}
 * @private
 */
goog.ui.RoundedCorners.prototype.content_ = '';


/**
 * Padding style for the internal content
 * @type {string}
 * @private
 */
goog.ui.RoundedCorners.prototype.padding_ = '';


/**
 * An explicit height for the HTML. If null, no height is specified
 * @type {?string}
 * @private
 */
goog.ui.RoundedCorners.prototype.height_ = null;


/**
 * The format of the image. Either PNG or GIF
 * @type {string}
 * @private
 */
goog.ui.RoundedCorners.prototype.imageFormat_ = 'png';


/**
 * The width of the border line. If 0, width == corner radius
 * @type {number}
 * @private
 */
goog.ui.RoundedCorners.prototype.lineWidth_ = 0;


/**
 * Enum for specifying which corners to include.
 * @enum {number}
 */
goog.ui.RoundedCorners.Corners = {
  /**
   * Include just the top-left corner.
   */
  TOP_LEFT: 1,

  /**
   * Include just the top-right corner.
   */
  TOP_RIGHT: 2,

  /**
   * Include just the bottom-left corner.
   */
  BOTTOM_LEFT: 4,

  /**
   * Include just the bottom-right corner.
   */
  BOTTOM_RIGHT: 8,

  /**
   * Include just the left corners.
   */
  LEFT: 5, // TOP_LEFT | BOTTOM_LEFT

  /**
   * Include just the right corners.
   */
  RIGHT: 10, // TOP_RIGHT | BOTTOM_RIGHT

  /**
   * Include just the top corners.
   */
  TOP: 3, // TOP_LEFT | TOP_RIGHT

  /**
   * Include just the bottom corners.
   */
  BOTTOM: 12, // BOTTOM_LEFT | BOTTOM_RIGHT

  /**
   * Include all corners.
   */
  ALL: 15 // TOP |  BOTTOM
};


/**
 * Returns the foreground color
 * @return {string} The color in hex format.
 */
goog.ui.RoundedCorners.prototype.getColor = function() {
  return this.color_;
};


/**
 * Sets the foreground color.
 * @param {string} color The color in a format parsable by goog.color.parse().
 */
goog.ui.RoundedCorners.prototype.setColor = function(color) {
  this.color_ = goog.color.parse(color).hex;
};


/**
 * Returns the background color
 * @return {string} The color in hex format or null for transparent.
 */
goog.ui.RoundedCorners.prototype.getBackgroundColor = function() {
  return this.bgColor_;
};


/**
 * Sets the background color.
 * @param {string} bgColor The color in a format parsable by goog.color.parse()
 * or empty string if transparent.
 */
goog.ui.RoundedCorners.prototype.setBackgroundColor = function(bgColor) {
  if (goog.string.isEmpty(bgColor)) {
    this.bgColor_ = '';
  } else {
    this.bgColor_ = goog.color.parse(bgColor).hex;
  }
};


/**
 * Returns the inner color
 * @return {string} The color in hex format or null for transparent.
 */
goog.ui.RoundedCorners.prototype.getInnerColor = function() {
  return this.inColor_;
};


/**
 * Sets the inner color.
 * @param {string} inColor The color in a format parsable by goog.color.parse()
 * or empty string if transparent.
 */
goog.ui.RoundedCorners.prototype.setInnerColor = function(inColor) {
  if (goog.string.isEmpty(inColor)) {
    this.inColor_ = '';
  } else {
    this.inColor_ = goog.color.parse(inColor).hex;
  }
};


/**
 * Returns the border thickness. The height and width specifies the width and
 * height of the corner images that form the arcs. The height dictates the
 * thickness of the top and bottom borders and width dicates the thickness of
 * the left and right borders.
 *
 * @return {goog.math.Size} The border size.
 */
goog.ui.RoundedCorners.prototype.getBorderThickness = function() {
  return this.size_;
};


/**
 * Sets the border thickness. The height and width specifies the width and
 * height of the corner images that form the arcs. The height dictates the
 * thickness of the top and bottom borders and width dicates the thickness of
 * the left and right borders.
 *
 * @param {goog.math.Size} size The border size.
 */
goog.ui.RoundedCorners.prototype.setBorderThickness = function(size) {
  this.size_ = size;
};


/**
 * Returns the explicit height of the element creating the border or
 * background.
 * For the #getBorderHtml case, this usually isn't necessary to set as it will
 * size to content. For the #getBackgroundHtml case, this may be necessary to
 * set in certain cases in IE because of an off-by-1 bug in IE's bottom
 * positioning code.
 *
 * @return {?string} The height as a style string (e.g. '2px' or '3em').
 */
goog.ui.RoundedCorners.prototype.getExplicitHeight = function() {
  return this.height_;
};


/**
 * Sets the explicit height of the element creating the border or background.
 * For the #getBorderHtml case, this usually isn't necessary to set as it will
 * size to content. For the #getBackgroundHtml case, this may be necessary to
 * set in certain cases in IE because of an off-by-1 bug in IE's bottom
 * positioning code.
 *
 * @param {string} height The height as a style string (e.g. '2px' or '3em').
 */
goog.ui.RoundedCorners.prototype.setExplicitHeight = function(height) {
  this.height_ = height;
};


/**
 * Returns the padding of the rounded corner border.
 *
 * @return {string} The padding as a style string (e.g. '2px 4px').
 */
goog.ui.RoundedCorners.prototype.getPadding = function() {
  return this.padding_;
};


/**
 * Sets the padding of the rounded corner border.
 *
 * @param {string} padding The padding as a style string (e.g. '2px 4px').
 */
goog.ui.RoundedCorners.prototype.setPadding = function(padding) {
  this.padding_ = padding;
};


/**
 * Returns the width of the border line. If 0, border is width/height
 * of corners
 *
 * @return {number} The width.
 */
goog.ui.RoundedCorners.prototype.getLineWidth = function() {
  return this.lineWidth_;
};


/**
 * Sets the width of the border line. If 0, border is width/height
 * of corners
 *
 * @param {number} lineWidth The width.
 */
goog.ui.RoundedCorners.prototype.setLineWidth = function(lineWidth) {
  this.lineWidth_ = lineWidth;
};


/**
 * Returns which corners to show
 *
 * @return {number} The corners to show.
 */
goog.ui.RoundedCorners.prototype.getCornersToShow = function() {
  return this.cornersToShow_;
};


/**
 * Sets which corners to show
 *
 * @param {number} cornersToShow The corners to show.
 */
goog.ui.RoundedCorners.prototype.setCornersToShow = function(cornersToShow) {
  this.cornersToShow_ = cornersToShow;
};


/**
 * Returns the image format. Currently, only png  and gif are supported.
 *
 * @return {string} The image format.
 */
goog.ui.RoundedCorners.prototype.getImageFormat = function() {
  return this.imageFormat_;
};


/**
 * Sets the image format. Currently, only png and gif are supported.
 *
 * @param {string} imageFormat The image format.
 */
goog.ui.RoundedCorners.prototype.setImageFormat = function(imageFormat) {
  if (imageFormat != 'png' && imageFormat != 'gif') {
    throw Error('Image format must be \'png\' or \'gif\'');
  }
  this.imageFormat_ = imageFormat;
};


/**
 * Returns the content of the borders
 *
 * @return {string} The content of the borders.
 */
goog.ui.RoundedCorners.prototype.getContent = function() {
  return this.content_;
};


/**
 * Sets the content of the borders
 *
 * @param {string} html The content of the borders.
 */
goog.ui.RoundedCorners.prototype.setContent = function(html) {
  this.content_ = html;
};


/**
 * Returns the HTML of a 9-cell table (when all corners are needed) that uses
 * transparent images in the corners, a solid color on the sides, and the
 * content in the middle cell.
 *
 * @return {string} The html of the table.
 */
goog.ui.RoundedCorners.prototype.getBorderHtml = function() {
  // TODO(user): convert to client-side template mechanism when one exists
  // the html is built like a template so that this can later be
  // converted easily to a templating mechanism like JST.
  var sb = [];
  sb.push('<table border=0 style="empty-cells:show;' +
          'border-collapse:{{%collapse}};' +
          'table-layout:fixed;width:100%;margin:0;padding:0;' +
          'height:{{%heightStyle}}" cellspacing=0 cellpadding=0>');
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT ||
        this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) {
      sb.push('<col width="{{%w}}">');
    }
    sb.push('<col>');
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT ||
        this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) {
      sb.push('<col width="{{%w}}">');
    }
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT ||
        this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT) {
      sb.push('<tr>');
        if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT) {
          sb.push('<td style="{{%tlStyle}}; width:{{%w}}px; height:{{%h}}px">' +
                  '</td>');
        }
        sb.push('<td style="{{%tmColor}}"></td>');
        if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT) {
          sb.push('<td style="{{%trStyle}}; width:{{%w}}px; height:{{%h}}px">' +
                  '</td>');
        }
      sb.push('</tr>');
    }
    sb.push('<tr>');
      if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT ||
          this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) {
        sb.push('<td style="{{%mlStyle}};{{%mlColor}};width:{{%w}}px;"></td>');
      }
      sb.push('<td style="padding: {{%p}}">{{%content}}</td>');
      if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT ||
          this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) {
        sb.push('<td style="{{%mrStyle}}; {{%mrColor}};width:{{%w}}px;"></td>');
      }
    sb.push('</tr>');
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT ||
        this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) {
      sb.push('<tr>');
        if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) {
          sb.push('<td style="{{%blStyle}} width:{{%w}}px; height:{{%h}}px;">' +
                  '</td>');
        }
        sb.push('<td style="{{%bmColor}}"></td>');
        if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) {
          sb.push('<td style="{{%brStyle}};width:{{%w}}px; height:{{%h}}px">' +
                  '</td>');
        }
      sb.push('</tr>');
    }
  sb.push('</table>');

  return this.performTemplateSubstitutions_(sb.join(''));
};


/**
 * Returns the HTML for a relatively positioned DIV that includes four
 * absolutely positioned DIVs for the corner images and a DIV for the content.
 *
 * @return {string} The html of the table.
 */
goog.ui.RoundedCorners.prototype.getBackgroundHtml = function() {
  // TODO(user): convert to client-side template mechanism when one exists
  // the html is built like a template so that this can later be converted
  // easily to a templating mechanism like JST.
  var sb = [];
  sb.push('<div style="position:relative;padding:{{%p}};' +
          'background-color:{{%color}};height:{{%heightStyle}}">');
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT) {
      sb.push('<div style="{{%tlStyle}};width:{{%w}}px; height:{{%h}}px;' +
              'position:absolute;top:0;left:0;font-size:0"></div>');
    }
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) {
      sb.push('<div style="{{%blStyle}};width:{{%w}}px; height:{{%h}}px;' +
              'position:absolute;bottom:0px;left:0;font-size:0"></div>');
    }
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) {
      sb.push('<div style="{{%brStyle}};width:{{%w}}px; height:{{%h}}px;' +
              'position:absolute;bottom:0px;right:0;font-size:0"></div>');
    }
    if (this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT) {
      sb.push('<div style="{{%trStyle}};width:{{%w}}px; height:{{%h}}px;' +
              'position:absolute;top:0;right:0;font-size:0"></div>');
    }
    sb.push('<div>{{%content}}</div>');
  sb.push('</div>');

  return this.performTemplateSubstitutions_(sb.join(''));
};


/**
 * Performs the substitutions in the templates to values determined at runtime.
 * @param {string} htmlTemplate The template to use.
 * @return {string} The template with the substitutions.
 * @private
 */
goog.ui.RoundedCorners.prototype.performTemplateSubstitutions_ =
    function(htmlTemplate) {
  var html = htmlTemplate;
  var ctx = this.getCtx_();
  for (var key in ctx) {
    var regex = new RegExp('{{%' + key + '}}', 'g');
    html = html.replace(regex, ctx[key]);
  }
  return html;
};


/**
 * Returns the context object used by the template mechanism
 * @return {Object} The context object.
 * @private
 */
goog.ui.RoundedCorners.prototype.getCtx_ = function() {
  var colorHex = this.color_.substring(1);
  var ctx = {};
  ctx['tlStyle'] = this.getCornerStyle_('tl');
  ctx['trStyle'] = this.getCornerStyle_('tr');
  ctx['mlStyle'] = '';
  ctx['mrStyle'] = '';
  ctx['blStyle'] = this.getCornerStyle_('bl');
  ctx['brStyle'] = this.getCornerStyle_('br');
  if (this.cornersToShow_ == goog.ui.RoundedCorners.Corners.RIGHT) {
    ctx['tlStyle'] = ctx['mlStyle'] = ctx['blStyle'] = 'display:none';
  } else if (this.cornersToShow_ == goog.ui.RoundedCorners.Corners.LEFT) {
    ctx['trStyle'] = ctx['mrStyle'] = ctx['brStyle'] = 'display:none';
  }

  if (this.height_ != null) {
    ctx['heightStyle'] = this.height_;
  } else {
    ctx['heightStyle'] = goog.userAgent.IE && goog.userAgent.VERSION < 7 ?
                            '0px;' : 'auto;';
  }

  ctx['color'] = this.color_;
  ctx['mlColor'] = this.colorStyleFor_('left');
  ctx['mrColor'] = this.colorStyleFor_('right');
  ctx['tmColor'] = this.colorStyleFor_('top');
  ctx['bmColor'] = this.colorStyleFor_('bottom');
  ctx['collapse'] = this.lineWidth_ ? (goog.userAgent.IE ? 'collapse' : '') :
      'collapse';
  ctx['w'] = this.size_.width;
  ctx['h'] = this.size_.height;
  ctx['p'] = this.padding_;
  ctx['content'] = this.content_;
  return ctx;
};


/**
 * Get the CSS style for a given side with the current diplay parameters.
 * Will return either a background or border color
 * @param {string} side The side: left|top|right|bottom.
 * @return {string} The style.
 * @private
 */
goog.ui.RoundedCorners.prototype.colorStyleFor_ = function(side) {
  return this.lineWidth_ ? 'border-' + side + ': ' +
      this.lineWidth_ + 'px solid ' + this.color_ :
      'background-color:' + this.color_;
};


/**
 * Returns the background image style string that uses AlphaImageLoader for IE6
 * and background-images for other browsers
 * @param {string} corner The corner of the image.
 * @return {string} The style string.
 * @private
 */
goog.ui.RoundedCorners.prototype.getCornerStyle_ = function(corner) {
  var uri = this.createUri_(corner);
  if ((goog.string.isEmpty(this.color_) ||
       goog.string.isEmpty(this.bgColor_) ||
       goog.string.isEmpty(this.inColor_)) && goog.userAgent.IE &&
       goog.userAgent.VERSION > 5.5 && goog.userAgent.VERSION < 7) {
    // if need transparency, must do this in < IE7
    return 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' +
           uri + '\', sizingMethod=\'crop\')';
  } else {
    return 'background: url(' + uri + ') no-repeat top left;';
  }
};


/**
 * Returns the image Uri for a specific corner image.
 * @param {string} corner The corner of the image.
 * @return {goog.Uri} The uri.
 * @private
 */
goog.ui.RoundedCorners.prototype.createUri_ = function(corner) {
  // e.g. rc?a=tl&c=#aaa&w=8&h=8
  var uri = new goog.Uri(this.servletUri_);
  uri.setParameterValue('a', corner);
  uri.setParameterValue('c', this.removeHash_(this.color_));
  uri.setParameterValue('bc', this.removeHash_(this.bgColor_));
  uri.setParameterValue('ic', this.removeHash_(this.inColor_));
  uri.setParameterValue('w', String(this.size_.width));
  uri.setParameterValue('h', String(this.size_.height));
  uri.setParameterValue('lw', String(this.lineWidth_));
  uri.setParameterValue('m', this.imageFormat_);
  return uri;
};


/**
 * Helper function to remove hash from the color string
 * @param {string} s The string to remove the has from.
 * @return {string} The color name without the hash.
 * @private
 */
goog.ui.RoundedCorners.prototype.removeHash_ = function(s) {
  if (goog.string.startsWith(s, '#')) {
    return s.substring(1);
  }
  return s;
};
