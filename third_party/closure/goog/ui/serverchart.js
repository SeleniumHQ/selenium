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


/**
 * @fileoverview Component for generating chart PNGs using Google Chart Server.
 *
 * @deprecated Google Chart Images service (the server-side component of this
 *     class) has been deprecated. See
 *     https://developers.google.com/chart/ for alternatives.
 *
 * @see ../demos/serverchart.html
 */


/**
 * Namespace for chart functions
 */
goog.provide('goog.ui.ServerChart');
goog.provide('goog.ui.ServerChart.AxisDisplayType');
goog.provide('goog.ui.ServerChart.ChartType');
goog.provide('goog.ui.ServerChart.EncodingType');
goog.provide('goog.ui.ServerChart.Event');
goog.provide('goog.ui.ServerChart.LegendPosition');
goog.provide('goog.ui.ServerChart.MaximumValue');
goog.provide('goog.ui.ServerChart.MultiAxisAlignment');
goog.provide('goog.ui.ServerChart.MultiAxisType');
goog.provide('goog.ui.ServerChart.UriParam');
goog.provide('goog.ui.ServerChart.UriTooLongEvent');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('goog.string');
goog.require('goog.ui.Component');



/**
 * Will construct a chart using Google's chartserver.
 *
 * @param {goog.ui.ServerChart.ChartType} type The chart type.
 * @param {number=} opt_width The width of the chart.
 * @param {number=} opt_height The height of the chart.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM Helper.
 * @param {string=} opt_uri Optional uri used to connect to the chart server, if
 *     different than goog.ui.ServerChart.CHART_SERVER_SCHEME_INDEPENDENT_URI.
 * @constructor
 * @extends {goog.ui.Component}
 *
 * @deprecated Google Chart Server has been deprecated. See
 *     https://developers.google.com/chart/image/ for details.
 */
goog.ui.ServerChart = function(type, opt_width, opt_height, opt_domHelper,
    opt_uri) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Image URI.
   * @type {goog.Uri}
   * @private
   */
  this.uri_ = new goog.Uri(
      opt_uri || goog.ui.ServerChart.CHART_SERVER_SCHEME_INDEPENDENT_URI);

  /**
   * Encoding method for the URI data format.
   * @type {goog.ui.ServerChart.EncodingType}
   * @private
   */
  this.encodingType_ = goog.ui.ServerChart.EncodingType.AUTOMATIC;

  /**
   * Two-dimensional array of the data sets on the chart.
   * @type {Array.<Array.<number>>}
   * @private
   */
  this.dataSets_ = [];

  /**
   * Colors for each data set.
   * @type {Array.<string>}
   * @private
   */
  this.setColors_ = [];

  /**
   * Legend texts for each data set.
   * @type {Array.<string>}
   * @private
   */
  this.setLegendTexts_ = [];

  /**
   * Labels on the X-axis.
   * @type {Array.<string>}
   * @private
   */
  this.xLabels_ = [];

  /**
   * Labels on the left along the Y-axis.
   * @type {Array.<string>}
   * @private
   */
  this.leftLabels_ = [];

  /**
   * Labels on the right along the Y-axis.
   * @type {Array.<string>}
   * @private
   */
  this.rightLabels_ = [];

  /**
   * Axis type for each multi-axis in the chart. The indices into this array
   * also work as the reference index for all other multi-axis properties.
   * @type {Array.<goog.ui.ServerChart.MultiAxisType>}
   * @private
   */
  this.multiAxisType_ = [];

  /**
   * Axis text for each multi-axis in the chart, indexed by the indices from
   * multiAxisType_ in a sparse array.
   * @type {Object}
   * @private
   */
  this.multiAxisLabelText_ = {};


  /**
   * Axis position for each multi-axis in the chart, indexed by the indices
   * from multiAxisType_ in a sparse array.
   * @type {Object}
   * @private
   */
  this.multiAxisLabelPosition_ = {};

  /**
   * Axis range for each multi-axis in the chart, indexed by the indices from
   * multiAxisType_ in a sparse array.
   * @type {Object}
   * @private
   */
  this.multiAxisRange_ = {};

  /**
   * Axis style for each multi-axis in the chart, indexed by the indices from
   * multiAxisType_ in a sparse array.
   * @type {Object}
   * @private
   */
  this.multiAxisLabelStyle_ = {};

  this.setType(type);
  this.setSize(opt_width, opt_height);

  /**
   * Minimum value for the chart (used for normalization). By default,
   * this is set to infinity, and is eventually updated to the lowest given
   * value in the data. The minimum value is then subtracted from all other
   * values. For a pie chart, subtracting the minimum value does not make
   * sense, so minValue_ is set to zero because 0 is the additive identity.
   * @type {number}
   * @private
   */
  this.minValue_ = this.isPieChart() ? 0 : Infinity;
};
goog.inherits(goog.ui.ServerChart, goog.ui.Component);


/**
 * Base scheme-independent URI for the chart renderer.
 * @type {string}
 */
goog.ui.ServerChart.CHART_SERVER_SCHEME_INDEPENDENT_URI =
    '//chart.googleapis.com/chart';


/**
 * Base HTTP URI for the chart renderer.
 * @type {string}
 */
goog.ui.ServerChart.CHART_SERVER_HTTP_URI =
    'http://chart.googleapis.com/chart';


/**
 * Base HTTPS URI for the chart renderer.
 * @type {string}
 */
goog.ui.ServerChart.CHART_SERVER_HTTPS_URI =
    'https://chart.googleapis.com/chart';


/**
 * Base URI for the chart renderer.
 * @type {string}
 * @deprecated Use
 *     {@link goog.ui.ServerChart.CHART_SERVER_SCHEME_INDEPENDENT_URI},
 *     {@link goog.ui.ServerChart.CHART_SERVER_HTTP_URI} or
 *     {@link goog.ui.ServerChart.CHART_SERVER_HTTPS_URI} instead.
 */
goog.ui.ServerChart.CHART_SERVER_URI =
    goog.ui.ServerChart.CHART_SERVER_HTTP_URI;


/**
 * The 0 - 1.0 ("fraction of the range") value to use when getMinValue() ==
 * getMaxValue(). This determines, for example, the vertical position
 * of the line in a flat line-chart.
 * @type {number}
 */
goog.ui.ServerChart.DEFAULT_NORMALIZATION = 0.5;


/**
 * The upper limit on the length of the chart image URI, after encoding.
 * If the URI's length equals or exceeds it, goog.ui.ServerChart.UriTooLongEvent
 * is dispatched on the goog.ui.ServerChart object.
 * @type {number}
 * @private
 */
goog.ui.ServerChart.prototype.uriLengthLimit_ = 2048;


/**
 * Number of gridlines along the X-axis.
 * @type {number}
 * @private
 */
goog.ui.ServerChart.prototype.gridX_ = 0;


/**
 * Number of gridlines along the Y-axis.
 * @type {number}
 * @private
 */
goog.ui.ServerChart.prototype.gridY_ = 0;


/**
 * Maximum value for the chart (used for normalization). The minimum is
 * declared in the constructor.
 * @type {number}
 * @private
 */
goog.ui.ServerChart.prototype.maxValue_ = -Infinity;


/**
 * Chart title.
 * @type {?string}
 * @private
 */
goog.ui.ServerChart.prototype.title_ = null;


/**
 * Chart title size.
 * @type {number}
 * @private
 */
goog.ui.ServerChart.prototype.titleSize_ = 13.5;


/**
 * Chart title color.
 * @type {string}
 * @private
 */
goog.ui.ServerChart.prototype.titleColor_ = '333333';


/**
 * Chart legend.
 * @type {Array.<string>?}
 * @private
 */
goog.ui.ServerChart.prototype.legend_ = null;


/**
 * ChartServer supports using data sets to position markers. A data set
 * that is being used for positioning only can be made "invisible", in other
 * words, the caller can indicate to ChartServer that ordinary chart elements
 * (e.g. bars in a bar chart) should not be drawn on the data points of the
 * invisible data set. Such data sets must be provided at the end of the
 * chd parameter, and if invisible data sets are being used, the chd
 * parameter must indicate the number of visible data sets.
 * @type {?number}
 * @private
 */
goog.ui.ServerChart.prototype.numVisibleDataSets_ = null;


/**
 * Creates the DOM node (image) needed for the Chart
 * @override
 */
goog.ui.ServerChart.prototype.createDom = function() {
  var size = this.getSize();
  this.setElementInternal(this.getDomHelper().createDom(
      'img', {'src': this.getUri(),
        'class': goog.getCssName('goog-serverchart-image'),
        'width': size[0], 'height': size[1]}));
};


/**
 * Decorate an image already in the DOM.
 * Expects the following structure:
 * <pre>
 *   - img
 * </pre>
 *
 * @param {Element} img Image to decorate.
 * @override
 */
goog.ui.ServerChart.prototype.decorateInternal = function(img) {
  img.src = this.getUri();
  this.setElementInternal(img);
};


/**
 * Updates the image if any of the data or settings have changed.
 */
goog.ui.ServerChart.prototype.updateChart = function() {
  if (this.getElement()) {
    this.getElement().src = this.getUri();
  }
};


/**
 * Sets the URI of the chart.
 *
 * @param {goog.Uri} uri The chart URI.
 */
goog.ui.ServerChart.prototype.setUri = function(uri) {
  this.uri_ = uri;
};


/**
 * Returns the URI of the chart.
 *
 * @return {goog.Uri} The chart URI.
 */
goog.ui.ServerChart.prototype.getUri = function() {
  this.computeDataString_();
  return this.uri_;
};


/**
 * Returns the upper limit on the length of the chart image URI, after encoding.
 * If the URI's length equals or exceeds it, goog.ui.ServerChart.UriTooLongEvent
 * is dispatched on the goog.ui.ServerChart object.
 *
 * @return {number} The chart URI length limit.
 */
goog.ui.ServerChart.prototype.getUriLengthLimit = function() {
  return this.uriLengthLimit_;
};


/**
 * Sets the upper limit on the length of the chart image URI, after encoding.
 * If the URI's length equals or exceeds it, goog.ui.ServerChart.UriTooLongEvent
 * is dispatched on the goog.ui.ServerChart object.
 *
 * @param {number} uriLengthLimit The chart URI length limit.
 */
goog.ui.ServerChart.prototype.setUriLengthLimit = function(uriLengthLimit) {
  this.uriLengthLimit_ = uriLengthLimit;
};


/**
 * Sets the 'chg' parameter of the chart Uri.
 * This is used by various types of charts to specify Grids.
 *
 * @param {string} value Value for the 'chg' parameter in the chart Uri.
 */
goog.ui.ServerChart.prototype.setGridParameter = function(value) {
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.GRID, value);
};


/**
 * Returns the 'chg' parameter of the chart Uri.
 * This is used by various types of charts to specify Grids.
 *
 * @return {string|undefined} The 'chg' parameter of the chart Uri.
 */
goog.ui.ServerChart.prototype.getGridParameter = function() {
  return /** @type {string} */ (
      this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.GRID));
};


/**
 * Sets the 'chm' parameter of the chart Uri.
 * This is used by various types of charts to specify Markers.
 *
 * @param {string} value Value for the 'chm' parameter in the chart Uri.
 */
goog.ui.ServerChart.prototype.setMarkerParameter = function(value) {
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MARKERS, value);
};


/**
 * Returns the 'chm' parameter of the chart Uri.
 * This is used by various types of charts to specify Markers.
 *
 * @return {string|undefined} The 'chm' parameter of the chart Uri.
 */
goog.ui.ServerChart.prototype.getMarkerParameter = function() {
  return /** @type {string} */ (
      this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.MARKERS));
};


/**
 * Sets the 'chp' parameter of the chart Uri.
 * This is used by various types of charts to specify certain options.
 * e.g., finance charts use this to designate which line is the 0 axis.
 *
 * @param {string|number} value Value for the 'chp' parameter in the chart Uri.
 */
goog.ui.ServerChart.prototype.setMiscParameter = function(value) {
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MISC_PARAMS,
                              String(value));
};


/**
 * Returns the 'chp' parameter of the chart Uri.
 * This is used by various types of charts to specify certain options.
 * e.g., finance charts use this to designate which line is the 0 axis.
 *
 * @return {string|undefined} The 'chp' parameter of the chart Uri.
 */
goog.ui.ServerChart.prototype.getMiscParameter = function() {
  return /** @type {string} */ (
      this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.MISC_PARAMS));
};


/**
 * Enum of chart data encoding types
 *
 * @enum {string}
 */
goog.ui.ServerChart.EncodingType = {
  AUTOMATIC: '',
  EXTENDED: 'e',
  SIMPLE: 's',
  TEXT: 't'
};


/**
 * Enum of chart types with their short names used by the chartserver.
 *
 * @enum {string}
 */
goog.ui.ServerChart.ChartType = {
  BAR: 'br',
  CLOCK: 'cf',
  CONCENTRIC_PIE: 'pc',
  FILLEDLINE: 'lr',
  FINANCE: 'lfi',
  GOOGLEOMETER: 'gom',
  HORIZONTAL_GROUPED_BAR: 'bhg',
  HORIZONTAL_STACKED_BAR: 'bhs',
  LINE: 'lc',
  MAP: 't',
  MAPUSA: 'tuss',
  MAPWORLD: 'twoc',
  PIE: 'p',
  PIE3D: 'p3',
  RADAR: 'rs',
  SCATTER: 's',
  SPARKLINE: 'ls',
  VENN: 'v',
  VERTICAL_GROUPED_BAR: 'bvg',
  VERTICAL_STACKED_BAR: 'bvs',
  XYLINE: 'lxy'
};


/**
 * Enum of multi-axis types.
 *
 * @enum {string}
 */
goog.ui.ServerChart.MultiAxisType = {
  X_AXIS: 'x',
  LEFT_Y_AXIS: 'y',
  RIGHT_Y_AXIS: 'r',
  TOP_AXIS: 't'
};


/**
 * Enum of multi-axis alignments.
 *
 * @enum {number}
 */
goog.ui.ServerChart.MultiAxisAlignment = {
  ALIGN_LEFT: -1,
  ALIGN_CENTER: 0,
  ALIGN_RIGHT: 1
};


/**
 * Enum of legend positions.
 *
 * @enum {string}
 */
goog.ui.ServerChart.LegendPosition = {
  TOP: 't',
  BOTTOM: 'b',
  LEFT: 'l',
  RIGHT: 'r'
};


/**
 * Enum of line and tick options for an axis.
 *
 * @enum {string}
 */
goog.ui.ServerChart.AxisDisplayType = {
  LINE_AND_TICKS: 'lt',
  LINE: 'l',
  TICKS: 't'
};


/**
 * Enum of chart maximum values in pixels, as listed at:
 * http://code.google.com/apis/chart/basics.html
 *
 * @enum {number}
 */
goog.ui.ServerChart.MaximumValue = {
  WIDTH: 1000,
  HEIGHT: 1000,
  MAP_WIDTH: 440,
  MAP_HEIGHT: 220,
  TOTAL_AREA: 300000
};


/**
 * Enum of ChartServer URI parameters.
 *
 * @enum {string}
 */
goog.ui.ServerChart.UriParam = {
  BACKGROUND_FILL: 'chf',
  BAR_HEIGHT: 'chbh',
  DATA: 'chd',
  DATA_COLORS: 'chco',
  DATA_LABELS: 'chld',
  DATA_SCALING: 'chds',
  DIGITAL_SIGNATURE: 'sig',
  GEOGRAPHICAL_REGION: 'chtm',
  GRID: 'chg',
  LABEL_COLORS: 'chlc',
  LEFT_Y_LABELS: 'chly',
  LEGEND: 'chdl',
  LEGEND_POSITION: 'chdlp',
  LEGEND_TEXTS: 'chdl',
  LINE_STYLES: 'chls',
  MARGINS: 'chma',
  MARKERS: 'chm',
  MISC_PARAMS: 'chp',
  MULTI_AXIS_LABEL_POSITION: 'chxp',
  MULTI_AXIS_LABEL_TEXT: 'chxl',
  MULTI_AXIS_RANGE: 'chxr',
  MULTI_AXIS_STYLE: 'chxs',
  MULTI_AXIS_TYPES: 'chxt',
  RIGHT_LABELS: 'chlr',
  RIGHT_LABEL_POSITIONS: 'chlrp',
  SIZE: 'chs',
  TITLE: 'chtt',
  TITLE_FORMAT: 'chts',
  TYPE: 'cht',
  X_AXIS_STYLE: 'chx',
  X_LABELS: 'chl'
};


/**
 * Sets the background fill.
 *
 * @param {Array.<Object>} fill An array of background fill specification
 *     objects. Each object may have the following properties:
 *     {string} area The area to fill, either 'bg' for background or 'c' for
 *         chart area.  The default is 'bg'.
 *     {string} color (required) The color of the background fill.
 *     // TODO(user): Add support for gradient/stripes, which requires
 *     // a different object structure.
 */
goog.ui.ServerChart.prototype.setBackgroundFill = function(fill) {
  var value = [];
  goog.array.forEach(fill, function(spec) {
    spec.area = spec.area || 'bg';
    spec.effect = spec.effect || 's';
    value.push([spec.area, spec.effect, spec.color].join(','));
  });
  value = value.join('|');
  this.setParameterValue(goog.ui.ServerChart.UriParam.BACKGROUND_FILL, value);
};


/**
 * Returns the background fill.
 *
 * @return {Array.<Object>} An array of background fill specifications.
 *     If the fill specification string is in an unsupported format, the method
 *    returns an empty array.
 */
goog.ui.ServerChart.prototype.getBackgroundFill = function() {
  var value =
      this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.BACKGROUND_FILL);
  var result = [];
  if (goog.isDefAndNotNull(value)) {
    var fillSpecifications = value.split('|');
    var valid = true;
    goog.array.forEach(fillSpecifications, function(spec) {
      var parts = spec.split(',');
      if (valid && parts[1] == 's') {
        result.push({area: parts[0], effect: parts[1], color: parts[2]});
      } else {
        // If the format is unsupported, return an empty array.
        result = [];
        valid = false;
      }
    });
  }
  return result;
};


/**
 * Sets the encoding type.
 *
 * @param {goog.ui.ServerChart.EncodingType} type Desired data encoding type.
 */
goog.ui.ServerChart.prototype.setEncodingType = function(type) {
  this.encodingType_ = type;
};


/**
 * Gets the encoding type.
 *
 * @return {goog.ui.ServerChart.EncodingType} The encoding type.
 */
goog.ui.ServerChart.prototype.getEncodingType = function() {
  return this.encodingType_;
};


/**
 * Sets the chart type.
 *
 * @param {goog.ui.ServerChart.ChartType} type The desired chart type.
 */
goog.ui.ServerChart.prototype.setType = function(type) {
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TYPE, type);
};


/**
 * Returns the chart type.
 *
 * @return {goog.ui.ServerChart.ChartType} The chart type.
 */
goog.ui.ServerChart.prototype.getType = function() {
  return /** @type {goog.ui.ServerChart.ChartType} */ (
      this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.TYPE));
};


/**
 * Sets the chart size.
 *
 * @param {number=} opt_width Optional chart width, defaults to 300.
 * @param {number=} opt_height Optional chart height, defaults to 150.
 */
goog.ui.ServerChart.prototype.setSize = function(opt_width, opt_height) {
  var sizeString = [opt_width || 300, opt_height || 150].join('x');
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.SIZE, sizeString);
};


/**
 * Returns the chart size.
 *
 * @return {Array.<string>} [Width, Height].
 */
goog.ui.ServerChart.prototype.getSize = function() {
  var sizeStr = this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.SIZE);
  return sizeStr.split('x');
};


/**
 * Sets the minimum value of the chart.
 *
 * @param {number} minValue The minimum value of the chart.
 */
goog.ui.ServerChart.prototype.setMinValue = function(minValue) {
  this.minValue_ = minValue;
};


/**
 * @return {number} The minimum value of the chart.
 */
goog.ui.ServerChart.prototype.getMinValue = function() {
  return this.minValue_;
};


/**
 * Sets the maximum value of the chart.
 *
 * @param {number} maxValue The maximum value of the chart.
 */
goog.ui.ServerChart.prototype.setMaxValue = function(maxValue) {
  this.maxValue_ = maxValue;
};


/**
 * @return {number} The maximum value of the chart.
 */
goog.ui.ServerChart.prototype.getMaxValue = function() {
  return this.maxValue_;
};


/**
 * Sets the chart margins.
 *
 * @param {number} leftMargin The size in pixels of the left margin.
 * @param {number} rightMargin The size in pixels of the right margin.
 * @param {number} topMargin The size in pixels of the top margin.
 * @param {number} bottomMargin The size in pixels of the bottom margin.
 */
goog.ui.ServerChart.prototype.setMargins = function(leftMargin, rightMargin,
    topMargin, bottomMargin) {
  var margins = [leftMargin, rightMargin, topMargin, bottomMargin].join(',');
  var UriParam = goog.ui.ServerChart.UriParam;
  this.uri_.setParameterValue(UriParam.MARGINS, margins);
};


/**
 * Sets the number of grid lines along the X-axis.
 *
 * @param {number} gridlines The number of X-axis grid lines.
 */
goog.ui.ServerChart.prototype.setGridX = function(gridlines) {
  // Need data for this to work.
  this.gridX_ = gridlines;
  this.setGrids_(this.gridX_, this.gridY_);
};


/**
 * @return {number} The number of gridlines along the X-axis.
 */
goog.ui.ServerChart.prototype.getGridX = function() {
  return this.gridX_;
};


/**
 * Sets the number of grid lines along the Y-axis.
 *
 * @param {number} gridlines The number of Y-axis grid lines.
 */
goog.ui.ServerChart.prototype.setGridY = function(gridlines) {
  // Need data for this to work.
  this.gridY_ = gridlines;
  this.setGrids_(this.gridX_, this.gridY_);
};


/**
 * @return {number} The number of gridlines along the Y-axis.
 */
goog.ui.ServerChart.prototype.getGridY = function() {
  return this.gridY_;
};


/**
 * Sets the grids for the chart
 *
 * @private
 * @param {number} x The number of grid lines along the x-axis.
 * @param {number} y The number of grid lines along the y-axis.
 */
goog.ui.ServerChart.prototype.setGrids_ = function(x, y) {
  var gridArray = [x == 0 ? 0 : 100 / x,
                   y == 0 ? 0 : 100 / y];
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.GRID,
                              gridArray.join(','));
};


/**
 * Sets the X Labels for the chart.
 *
 * @param {Array.<string>} labels The X Labels for the chart.
 */
goog.ui.ServerChart.prototype.setXLabels = function(labels) {
  this.xLabels_ = labels;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.X_LABELS,
                              this.xLabels_.join('|'));
};


/**
 * @return {Array.<string>} The X Labels for the chart.
 */
goog.ui.ServerChart.prototype.getXLabels = function() {
  return this.xLabels_;
};


/**
 * @return {boolean} Whether the chart is a bar chart.
 */
goog.ui.ServerChart.prototype.isBarChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.BAR ||
      type == goog.ui.ServerChart.ChartType.HORIZONTAL_GROUPED_BAR ||
      type == goog.ui.ServerChart.ChartType.HORIZONTAL_STACKED_BAR ||
      type == goog.ui.ServerChart.ChartType.VERTICAL_GROUPED_BAR ||
      type == goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR;
};


/**
 * @return {boolean} Whether the chart is a pie chart.
 */
goog.ui.ServerChart.prototype.isPieChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.PIE ||
      type == goog.ui.ServerChart.ChartType.PIE3D ||
      type == goog.ui.ServerChart.ChartType.CONCENTRIC_PIE;
};


/**
 * @return {boolean} Whether the chart is a grouped bar chart.
 */
goog.ui.ServerChart.prototype.isGroupedBarChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.HORIZONTAL_GROUPED_BAR ||
      type == goog.ui.ServerChart.ChartType.VERTICAL_GROUPED_BAR;
};


/**
 * @return {boolean} Whether the chart is a horizontal bar chart.
 */
goog.ui.ServerChart.prototype.isHorizontalBarChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.BAR ||
      type == goog.ui.ServerChart.ChartType.HORIZONTAL_GROUPED_BAR ||
      type == goog.ui.ServerChart.ChartType.HORIZONTAL_STACKED_BAR;
};


/**
 * @return {boolean} Whether the chart is a line chart.
 */
goog.ui.ServerChart.prototype.isLineChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.FILLEDLINE ||
      type == goog.ui.ServerChart.ChartType.LINE ||
      type == goog.ui.ServerChart.ChartType.SPARKLINE ||
      type == goog.ui.ServerChart.ChartType.XYLINE;
};


/**
 * @return {boolean} Whether the chart is a map.
 */
goog.ui.ServerChart.prototype.isMap = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.MAP ||
      type == goog.ui.ServerChart.ChartType.MAPUSA ||
      type == goog.ui.ServerChart.ChartType.MAPWORLD;
};


/**
 * @return {boolean} Whether the chart is a stacked bar chart.
 */
goog.ui.ServerChart.prototype.isStackedBarChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.BAR ||
      type == goog.ui.ServerChart.ChartType.HORIZONTAL_STACKED_BAR ||
      type == goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR;
};


/**
 * @return {boolean} Whether the chart is a vertical bar chart.
 */
goog.ui.ServerChart.prototype.isVerticalBarChart = function() {
  var type = this.getType();
  return type == goog.ui.ServerChart.ChartType.VERTICAL_GROUPED_BAR ||
      type == goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR;
};


/**
 * Sets the Left Labels for the chart.
 * NOTE: The array should start with the lowest value, and then
 *       move progessively up the axis. So if you want labels
 *       from 0 to 100 with 0 at bottom of the graph, then you would
 *       want to pass something like [0,25,50,75,100].
 *
 * @param {Array.<string>} labels The Left Labels for the chart.
 */
goog.ui.ServerChart.prototype.setLeftLabels = function(labels) {
  this.leftLabels_ = labels;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEFT_Y_LABELS,
                              this.leftLabels_.reverse().join('|'));
};


/**
 * @return {Array.<string>} The Left Labels for the chart.
 */
goog.ui.ServerChart.prototype.getLeftLabels = function() {
  return this.leftLabels_;
};


/**
 * Sets the given ChartServer parameter.
 *
 * @param {goog.ui.ServerChart.UriParam} key The ChartServer parameter to set.
 * @param {string} value The value to set for the ChartServer parameter.
 */
goog.ui.ServerChart.prototype.setParameterValue = function(key, value) {
  this.uri_.setParameterValue(key, value);
};


/**
 * Removes the given ChartServer parameter.
 *
 * @param {goog.ui.ServerChart.UriParam} key The ChartServer parameter to
 *     remove.
 */
goog.ui.ServerChart.prototype.removeParameter = function(key) {
  this.uri_.removeParameter(key);
};


/**
 * Sets the Right Labels for the chart.
 * NOTE: The array should start with the lowest value, and then
 *       move progessively up the axis. So if you want labels
 *       from 0 to 100 with 0 at bottom of the graph, then you would
 *       want to pass something like [0,25,50,75,100].
 *
 * @param {Array.<string>} labels The Right Labels for the chart.
 */
goog.ui.ServerChart.prototype.setRightLabels = function(labels) {
  this.rightLabels_ = labels;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.RIGHT_LABELS,
                              this.rightLabels_.reverse().join('|'));
};


/**
 * @return {Array.<string>} The Right Labels for the chart.
 */
goog.ui.ServerChart.prototype.getRightLabels = function() {
  return this.rightLabels_;
};


/**
 * Sets the position relative to the chart where the legend is to be displayed.
 *
 * @param {goog.ui.ServerChart.LegendPosition} value Legend position.
 */
goog.ui.ServerChart.prototype.setLegendPosition = function(value) {
  this.uri_.setParameterValue(
      goog.ui.ServerChart.UriParam.LEGEND_POSITION, value);
};


/**
 * Returns the position relative to the chart where the legend is to be
 * displayed.
 *
 * @return {goog.ui.ServerChart.LegendPosition} Legend position.
 */
goog.ui.ServerChart.prototype.getLegendPosition = function() {
  return /** @type {goog.ui.ServerChart.LegendPosition} */ (
      this.uri_.getParameterValue(
          goog.ui.ServerChart.UriParam.LEGEND_POSITION));
};


/**
 * Sets the number of "visible" data sets. All data sets that come after
 * the visible data set are not drawn as part of the chart. Instead, they
 * are available for positioning markers.

 * @param {?number} n The number of visible data sets, or null if all data
 * sets are to be visible.
 */
goog.ui.ServerChart.prototype.setNumVisibleDataSets = function(n) {
  this.numVisibleDataSets_ = n;
};


/**
 * Returns the number of "visible" data sets. All data sets that come after
 * the visible data set are not drawn as part of the chart. Instead, they
 * are available for positioning markers.
 *
 * @return {?number} The number of visible data sets, or null if all data
 * sets are visible.
 */
goog.ui.ServerChart.prototype.getNumVisibleDataSets = function() {
  return this.numVisibleDataSets_;
};


/**
 * Sets the weight function for a Venn Diagram along with the associated
 *     colors and legend text. Weights are assigned as follows:
 *     weights[0] is relative area of circle A.
 *     weights[1] is relative area of circle B.
 *     weights[2] is relative area of circle C.
 *     weights[3] is relative area of overlap of circles A and B.
 *     weights[4] is relative area of overlap of circles A and C.
 *     weights[5] is relative area of overlap of circles B and C.
 *     weights[6] is relative area of overlap of circles A, B and C.
 * For a two circle Venn Diagram the weights are assigned as follows:
 *     weights[0] is relative area of circle A.
 *     weights[1] is relative area of circle B.
 *     weights[2] is relative area of overlap of circles A and B.
 *
 * @param {Array.<number>} weights The relative weights of the circles.
 * @param {Array.<string>=} opt_legendText The legend labels for the circles.
 * @param {Array.<string>=} opt_colors The colors for the circles.
 */
goog.ui.ServerChart.prototype.setVennSeries = function(
    weights, opt_legendText, opt_colors) {
  if (this.getType() != goog.ui.ServerChart.ChartType.VENN) {
    throw Error('Can only set a weight function for a Venn diagram.');
  }
  var dataMin = this.arrayMin_(weights);
  if (dataMin < this.minValue_) {
    this.minValue_ = dataMin;
  }
  var dataMax = this.arrayMax_(weights);
  if (dataMax > this.maxValue_) {
    this.maxValue_ = dataMax;
  }
  if (goog.isDef(opt_legendText)) {
    goog.array.forEach(
        opt_legendText,
        goog.bind(function(legend) {
          this.setLegendTexts_.push(legend);
        }, this));
    this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND_TEXTS,
                                this.setLegendTexts_.join('|'));
  }
  // If the caller only gave three weights, then they wanted a two circle
  // Venn Diagram. Create a 3 circle weight function where circle C has
  // area zero.
  if (weights.length == 3) {
    weights[3] = weights[2];
    weights[2] = 0.0;
  }
  this.dataSets_.push(weights);
  if (goog.isDef(opt_colors)) {
    goog.array.forEach(opt_colors, goog.bind(function(color) {
      this.setColors_.push(color);
    }, this));
    this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA_COLORS,
                                this.setColors_.join(','));
  }
};


/**
 * Sets the title of the chart.
 *
 * @param {string} title The chart title.
 */
goog.ui.ServerChart.prototype.setTitle = function(title) {
  this.title_ = title;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TITLE,
                              this.title_.replace(/\n/g, '|'));
};


/**
 * Sets the size of the chart title.
 *
 * @param {number} size The title size, in points.
 */
goog.ui.ServerChart.prototype.setTitleSize = function(size) {
  this.titleSize_ = size;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TITLE_FORMAT,
                              this.titleColor_ + ',' + this.titleSize_);
};


/**
 * @return {number} size The title size, in points.
 */
goog.ui.ServerChart.prototype.getTitleSize = function() {
  return this.titleSize_;
};


/**
 * Sets the color of the chart title.
 *
 * NOTE: The color string should NOT have a '#' at the beginning of it.
 *
 * @param {string} color The hex value for the title color.
 */
goog.ui.ServerChart.prototype.setTitleColor = function(color) {
  this.titleColor_ = color;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TITLE_FORMAT,
                              this.titleColor_ + ',' + this.titleSize_);
};


/**
 * @return {string} color The hex value for the title color.
 */
goog.ui.ServerChart.prototype.getTitleColor = function() {
  return this.titleColor_;
};


/**
 * Adds a legend to the chart.
 *
 * @param {Array.<string>} legend The legend to add.
 */
goog.ui.ServerChart.prototype.setLegend = function(legend) {
  this.legend_ = legend;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND,
                              this.legend_.join('|'));
};


/**
 * Sets the data scaling.
 * NOTE: This also changes the encoding type because data scaling will
 *     only work with {@code goog.ui.ServerChart.EncodingType.TEXT}
 *     encoding.
 * @param {number} minimum The lowest number to apply to the data.
 * @param {number} maximum The highest number to apply to the data.
 */
goog.ui.ServerChart.prototype.setDataScaling = function(minimum, maximum) {
  this.encodingType_ = goog.ui.ServerChart.EncodingType.TEXT;
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA_SCALING,
                              minimum + ',' + maximum);
};


/**
 * Sets the widths of the bars and the spaces between the bars in a bar
 * chart.
 * NOTE: If the space between groups is specified but the space between
 *     bars is left undefined, the space between groups will be interpreted
 *     as the space between bars because this is the behavior exposed
 *     in the external developers guide.
 * @param {number} barWidth The width of a bar in pixels.
 * @param {number=} opt_spaceBars The width of the space between
 *     bars in a group in pixels.
 * @param {number=} opt_spaceGroups The width of the space between
 *     groups.
 */
goog.ui.ServerChart.prototype.setBarSpaceWidths = function(barWidth,
                                                           opt_spaceBars,
                                                           opt_spaceGroups) {
  var widths = [barWidth];
  if (goog.isDef(opt_spaceBars)) {
    widths.push(opt_spaceBars);
  }
  if (goog.isDef(opt_spaceGroups)) {
    widths.push(opt_spaceGroups);
  }
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.BAR_HEIGHT,
                              widths.join(','));
};


/**
 * Specifies that the bar width in a bar chart should be calculated
 * automatically given the space available in the chart, while optionally
 * setting the spaces between the bars.
 * NOTE: If the space between groups is specified but the space between
 *     bars is left undefined, the space between groups will be interpreted
 *     as the space between bars because this is the behavior exposed
 *     in the external developers guide.
 * @param {number=} opt_spaceBars The width of the space between
 *     bars in a group in pixels.
 * @param {number=} opt_spaceGroups The width of the space between
 *     groups.
 */
goog.ui.ServerChart.prototype.setAutomaticBarWidth = function(opt_spaceBars,
                                                              opt_spaceGroups) {
  var widths = ['a'];
  if (goog.isDef(opt_spaceBars)) {
    widths.push(opt_spaceBars);
  }
  if (goog.isDef(opt_spaceGroups)) {
    widths.push(opt_spaceGroups);
  }
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.BAR_HEIGHT,
                              widths.join(','));
};


/**
 * Adds a multi-axis to the chart, and sets its type. Multiple axes of the same
 * type can be added.
 *
 * @param {goog.ui.ServerChart.MultiAxisType} axisType The desired axis type.
 * @return {number} The index of the newly inserted axis, suitable for feeding
 *     to the setMultiAxis*() functions.
 */
goog.ui.ServerChart.prototype.addMultiAxis = function(axisType) {
  this.multiAxisType_.push(axisType);
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_TYPES,
                              this.multiAxisType_.join(','));
  return this.multiAxisType_.length - 1;
};


/**
 * Returns the axis type for the given axis, or all of them in an array if the
 * axis number is not given.
 *
 * @param {number=} opt_axisNumber The axis index, as returned by addMultiAxis.
 * @return {goog.ui.ServerChart.MultiAxisType|
 *     Array.<goog.ui.ServerChart.MultiAxisType>}
 *     The axis type for the given axis, or all of them in an array if the
 *     axis number is not given.
 */
goog.ui.ServerChart.prototype.getMultiAxisType = function(opt_axisNumber) {
  if (goog.isDef(opt_axisNumber)) {
    return this.multiAxisType_[opt_axisNumber];
  }
  return this.multiAxisType_;
};


/**
 * Sets the label text (usually multiple values) for a given axis, overwriting
 * any existing values.
 *
 * @param {number} axisNumber The axis index, as returned by addMultiAxis.
 * @param {Array.<string>} labelText The actual label text to be added.
 */
goog.ui.ServerChart.prototype.setMultiAxisLabelText = function(axisNumber,
                                                               labelText) {
  this.multiAxisLabelText_[axisNumber] = labelText;

  var axisString = this.computeMultiAxisDataString_(this.multiAxisLabelText_,
                                                    ':|',
                                                    '|',
                                                    '|');
  this.uri_.setParameterValue(
      goog.ui.ServerChart.UriParam.MULTI_AXIS_LABEL_TEXT,
      axisString);
};


/**
 * Returns the label text, or all of them in a two-dimensional array if the
 * axis number is not given.
 *
 * @param {number=} opt_axisNumber The axis index, as returned by addMultiAxis.
 * @return {Object|Array.<string>} The label text, or all of them in a
 *     two-dimensional array if the axis number is not given.
 */
goog.ui.ServerChart.prototype.getMultiAxisLabelText = function(opt_axisNumber) {
  if (goog.isDef(opt_axisNumber)) {
    return this.multiAxisLabelText_[opt_axisNumber];
  }
  return this.multiAxisLabelText_;
};


/**
 * Sets the label positions for a given axis, overwriting any existing values.
 * The label positions are assumed to be floating-point numbers within the
 * range of the axis.
 *
 * @param {number} axisNumber The axis index, as returned by addMultiAxis.
 * @param {Array.<number>} labelPosition The actual label positions to be added.
 */
goog.ui.ServerChart.prototype.setMultiAxisLabelPosition = function(
    axisNumber, labelPosition) {
  this.multiAxisLabelPosition_[axisNumber] = labelPosition;

  var positionString = this.computeMultiAxisDataString_(
      this.multiAxisLabelPosition_,
      ',',
      ',',
      '|');
  this.uri_.setParameterValue(
      goog.ui.ServerChart.UriParam.MULTI_AXIS_LABEL_POSITION,
      positionString);
};


/**
 * Returns the label positions for a given axis number, or all of them in a
 * two-dimensional array if the axis number is not given.
 *
 * @param {number=} opt_axisNumber The axis index, as returned by addMultiAxis.
 * @return {Object|Array.<number>} The label positions for a given axis number,
 *     or all of them in a two-dimensional array if the axis number is not
 *     given.
 */
goog.ui.ServerChart.prototype.getMultiAxisLabelPosition =
    function(opt_axisNumber) {
  if (goog.isDef(opt_axisNumber)) {
    return this.multiAxisLabelPosition_[opt_axisNumber];
  }
  return this.multiAxisLabelPosition_;
};


/**
 * Sets the label range for a given axis, overwriting any existing range.
 * The default range is from 0 to 100. If the start value is larger than the
 * end value, the axis direction is reversed.  rangeStart and rangeEnd must
 * be two different finite numbers.
 *
 * @param {number} axisNumber The axis index, as returned by addMultiAxis.
 * @param {number} rangeStart The new start of the range.
 * @param {number} rangeEnd The new end of the range.
 * @param {number=} opt_interval The interval between axis labels.
 */
goog.ui.ServerChart.prototype.setMultiAxisRange = function(axisNumber,
                                                           rangeStart,
                                                           rangeEnd,
                                                           opt_interval) {
  goog.asserts.assert(rangeStart != rangeEnd,
      'Range start and end cannot be the same value.');
  goog.asserts.assert(isFinite(rangeStart) && isFinite(rangeEnd),
      'Range start and end must be finite numbers.');
  this.multiAxisRange_[axisNumber] = [rangeStart, rangeEnd];
  if (goog.isDef(opt_interval)) {
    this.multiAxisRange_[axisNumber].push(opt_interval);
  }
  var rangeString = this.computeMultiAxisDataString_(this.multiAxisRange_,
      ',', ',', '|');
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_RANGE,
      rangeString);
};


/**
 * Returns the label range for a given axis number as a two-element array of
 * (range start, range end), or all of them in a two-dimensional array if the
 * axis number is not given.
 *
 * @param {number=} opt_axisNumber The axis index, as returned by addMultiAxis.
 * @return {Object|Array.<number>} The label range for a given axis number as a
 *     two-element array of (range start, range end), or all of them in a
 *     two-dimensional array if the axis number is not given.
 */
goog.ui.ServerChart.prototype.getMultiAxisRange = function(opt_axisNumber) {
  if (goog.isDef(opt_axisNumber)) {
    return this.multiAxisRange_[opt_axisNumber];
  }
  return this.multiAxisRange_;
};


/**
 * Sets the label style for a given axis, overwriting any existing style.
 * The default style is as follows: Default is x-axis labels are centered, left
 * hand y-axis labels are right aligned, right hand y-axis labels are left
 * aligned. The font size and alignment are optional parameters.
 *
 * NOTE: The color string should NOT have a '#' at the beginning of it.
 *
 * @param {number} axisNumber The axis index, as returned by addMultiAxis.
 * @param {string} color The hex value for this label's color.
 * @param {number=} opt_fontSize The label font size, in pixels.
 * @param {goog.ui.ServerChart.MultiAxisAlignment=} opt_alignment The label
 *     alignment.
 * @param {goog.ui.ServerChart.AxisDisplayType=} opt_axisDisplay The axis
 *     line and ticks.
 */
goog.ui.ServerChart.prototype.setMultiAxisLabelStyle = function(
    axisNumber, color, opt_fontSize, opt_alignment, opt_axisDisplay) {
  var style = [color];
  if (goog.isDef(opt_fontSize) || goog.isDef(opt_alignment)) {
    style.push(opt_fontSize || '');
  }
  if (goog.isDef(opt_alignment)) {
    style.push(opt_alignment);
  }
  if (opt_axisDisplay) {
    style.push(opt_axisDisplay);
  }
  this.multiAxisLabelStyle_[axisNumber] = style;
  var styleString = this.computeMultiAxisDataString_(this.multiAxisLabelStyle_,
                                                     ',',
                                                     ',',
                                                     '|');
  this.uri_.setParameterValue(
      goog.ui.ServerChart.UriParam.MULTI_AXIS_STYLE,
      styleString);
};


/**
 * Returns the label style for a given axis number as a one- to three-element
 * array, or all of them in a two-dimensional array if the axis number is not
 * given.
 *
 * @param {number=} opt_axisNumber The axis index, as returned by addMultiAxis.
 * @return {Object|Array.<number>} The label style for a given axis number as a
 *     one- to three-element array, or all of them in a two-dimensional array if
 *     the axis number is not given.
 */
goog.ui.ServerChart.prototype.getMultiAxisLabelStyle =
    function(opt_axisNumber) {
  if (goog.isDef(opt_axisNumber)) {
    return this.multiAxisLabelStyle_[opt_axisNumber];
  }
  return this.multiAxisLabelStyle_;
};


/**
 * Adds a data set.
 * NOTE: The color string should NOT have a '#' at the beginning of it.
 *
 * @param {Array.<number|null>} data An array of numbers (values can be
 *     NaN or null).
 * @param {string} color The hex value for this data set's color.
 * @param {string=} opt_legendText The legend text, if any, for this data
 *     series. NOTE: If specified, all previously added data sets must also
 *     have a legend text.
 */
goog.ui.ServerChart.prototype.addDataSet = function(data,
                                                    color,
                                                    opt_legendText) {
  var dataMin = this.arrayMin_(data);
  if (dataMin < this.minValue_) {
    this.minValue_ = dataMin;
  }

  var dataMax = this.arrayMax_(data);
  if (dataMax > this.maxValue_) {
    this.maxValue_ = dataMax;
  }

  if (goog.isDef(opt_legendText)) {
    if (this.setLegendTexts_.length < this.dataSets_.length) {
      throw Error('Cannot start adding legends text after first element.');
    }
    this.setLegendTexts_.push(opt_legendText);
    this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND_TEXTS,
                                this.setLegendTexts_.join('|'));
  }

  this.dataSets_.push(data);
  this.setColors_.push(color);

  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA_COLORS,
                              this.setColors_.join(','));
};


/**
 * Clears the data sets from the graph. All data, including the colors and
 * legend text, is cleared.
 */
goog.ui.ServerChart.prototype.clearDataSets = function() {
  var queryData = this.uri_.getQueryData();
  queryData.remove(goog.ui.ServerChart.UriParam.LEGEND_TEXTS);
  queryData.remove(goog.ui.ServerChart.UriParam.DATA_COLORS);
  queryData.remove(goog.ui.ServerChart.UriParam.DATA);
  this.setLegendTexts_.length = 0;
  this.setColors_.length = 0;
  this.dataSets_.length = 0;
};


/**
 * Returns the given data set or all of them in a two-dimensional array if
 * the set number is not given.
 *
 * @param {number=} opt_setNumber Optional data set number to get.
 * @return {Array} The given data set or all of them in a two-dimensional array
 *     if the set number is not given.
 */
goog.ui.ServerChart.prototype.getData = function(opt_setNumber) {
  if (goog.isDef(opt_setNumber)) {
    return this.dataSets_[opt_setNumber];
  }
  return this.dataSets_;
};


/**
 * Computes the data string using the data in this.dataSets_ and sets
 * the object's URI accordingly. If the URI's length equals or exceeds the
 * limit, goog.ui.ServerChart.UriTooLongEvent is dispatched on the
 * goog.ui.ServerChart object.
 * @private
 */
goog.ui.ServerChart.prototype.computeDataString_ = function() {
  var ok;
  if (this.encodingType_ != goog.ui.ServerChart.EncodingType.AUTOMATIC) {
    ok = this.computeDataStringForEncoding_(this.encodingType_);
  } else {
    ok = this.computeDataStringForEncoding_(
        goog.ui.ServerChart.EncodingType.EXTENDED);
    if (!ok) {
      ok = this.computeDataStringForEncoding_(
          goog.ui.ServerChart.EncodingType.SIMPLE);
    }
  }
  if (!ok) {
    this.dispatchEvent(
        new goog.ui.ServerChart.UriTooLongEvent(this.uri_.toString()));
  }
};


/**
 * Computes the data string using the data in this.dataSets_ and the encoding
 * specified by the encoding parameter, which must not be AUTOMATIC, and sets
 * the object's URI accordingly.
 * @param {goog.ui.ServerChart.EncodingType} encoding The data encoding to use;
 *     must not be AUTOMATIC.
 * @return {boolean} False if the resulting URI is too long.
 * @private
 */
goog.ui.ServerChart.prototype.computeDataStringForEncoding_ = function(
    encoding) {
  var dataStrings = [];
  for (var i = 0, setLen = this.dataSets_.length; i < setLen; ++i) {
    dataStrings[i] = this.getChartServerValues_(this.dataSets_[i],
                                                this.minValue_,
                                                this.maxValue_,
                                                encoding);
  }
  var delimiter = encoding == goog.ui.ServerChart.EncodingType.TEXT ? '|' : ',';
  dataStrings = dataStrings.join(delimiter);
  var data;
  if (this.numVisibleDataSets_ == null) {
    data = goog.string.buildString(encoding, ':', dataStrings);
  } else {
    data = goog.string.buildString(encoding, this.numVisibleDataSets_, ':',
        dataStrings);
  }
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA, data);
  return this.uri_.toString().length < this.uriLengthLimit_;
};


/**
 * Computes a multi-axis data string from the given data and separators. The
 * general data format for each index/element in the array will be
 * "<arrayIndex><indexSeparator><arrayElement.join(elementSeparator)>", with
 * axisSeparator used between multiple elements.
 * @param {Object} data The data to compute the data string for, as a
 *     sparse array of arrays. NOTE: The function uses the length of
 *     multiAxisType_ to determine the upper bound for the outer array.
 * @param {string} indexSeparator The separator string inserted between each
 *     index and the data itself, commonly a comma (,).
 * @param {string} elementSeparator The separator string inserted between each
 *     element inside each sub-array in the data, if there are more than one;
 *     commonly a comma (,).
 * @param {string} axisSeparator The separator string inserted between each
 *     axis specification, if there are more than one; usually a pipe sign (|).
 * @return {string} The multi-axis data string.
 * @private
 */
goog.ui.ServerChart.prototype.computeMultiAxisDataString_ = function(
    data,
    indexSeparator,
    elementSeparator,
    axisSeparator) {
  var elementStrings = [];
  for (var i = 0, setLen = this.multiAxisType_.length; i < setLen; ++i) {
    if (data[i]) {
      elementStrings.push(i + indexSeparator + data[i].join(elementSeparator));
    }
  }
  return elementStrings.join(axisSeparator);
};


/**
 * Array of possible ChartServer data values
 * @type {string}
 */
goog.ui.ServerChart.CHART_VALUES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                                   'abcdefghijklmnopqrstuvwxyz' +
                                   '0123456789';


/**
 * Array of extended ChartServer data values
 * @type {string}
 */
goog.ui.ServerChart.CHART_VALUES_EXTENDED = goog.ui.ServerChart.CHART_VALUES +
                                            '-.';


/**
 * Upper bound for extended values
 */
goog.ui.ServerChart.EXTENDED_UPPER_BOUND =
    Math.pow(goog.ui.ServerChart.CHART_VALUES_EXTENDED.length, 2) - 1;


/**
 * Converts a single number to an encoded data value suitable for ChartServer.
 * The TEXT encoding is the number in decimal; the SIMPLE encoding is a single
 * character, and the EXTENDED encoding is two characters.  See
 * http://code.google.com/apis/chart/docs/data_formats.html for the detailed
 * specification of these encoding formats.
 *
 * @private
 * @param {?number} value The value to convert (null for a missing data point).
 * @param {number} minValue The minimum value (used for normalization).
 * @param {number} maxValue The maximum value (used for normalization).
 * @param {goog.ui.ServerChart.EncodingType} encoding The data encoding to use;
 *     must not be AUTOMATIC.
 * @return {string} The encoded data value.
 */
goog.ui.ServerChart.prototype.getConvertedValue_ = function(value,
                                                            minValue,
                                                            maxValue,
                                                            encoding) {
  goog.asserts.assert(minValue <= maxValue,
      'minValue should be less than or equal to maxValue');
  var isExtended = (encoding == goog.ui.ServerChart.EncodingType.EXTENDED);

  if (goog.isNull(value) || !goog.isDef(value) || isNaN(value) ||
      value < minValue || value > maxValue) {
    return isExtended ? '__' : '_';
  }

  if (encoding == goog.ui.ServerChart.EncodingType.TEXT) {
    return String(value);
  }

  var frac = goog.ui.ServerChart.DEFAULT_NORMALIZATION;
  if (maxValue > minValue) {
    frac = (value - minValue) / (maxValue - minValue);
    // Previous checks of value ensure that 0 <= frac <= 1 at this point.
  }

  if (isExtended) {
    var maxIndex = goog.ui.ServerChart.CHART_VALUES_EXTENDED.length;
    var upperBound = goog.ui.ServerChart.EXTENDED_UPPER_BOUND;
    var index1 = Math.floor(frac * upperBound / maxIndex);
    var index2 = Math.floor((frac * upperBound) % maxIndex);
    var extendedVals = goog.ui.ServerChart.CHART_VALUES_EXTENDED;
    return extendedVals.charAt(index1) + extendedVals.charAt(index2);
  }

  var index = Math.round(frac * (goog.ui.ServerChart.CHART_VALUES.length - 1));
  return goog.ui.ServerChart.CHART_VALUES.charAt(index);
};


/**
 * Creates the chd string for chartserver.
 *
 * @private
 * @param {Array.<number>} values An array of numbers to graph.
 * @param {number} minValue The minimum value (used for normalization).
 * @param {number} maxValue The maximum value (used for normalization).
 * @param {goog.ui.ServerChart.EncodingType} encoding The data encoding to use;
 *     must not be AUTOMATIC.
 * @return {string} The chd string for chartserver.
 */
goog.ui.ServerChart.prototype.getChartServerValues_ = function(values,
                                                               minValue,
                                                               maxValue,
                                                               encoding) {
  var s = [];
  for (var i = 0, valuesLen = values.length; i < valuesLen; ++i) {
    s.push(this.getConvertedValue_(values[i], minValue,
                                   maxValue, encoding));
  }
  return s.join(
      this.encodingType_ == goog.ui.ServerChart.EncodingType.TEXT ? ',' : '');
};


/**
 * Finds the minimum value in an array and returns it.
 * Needed because Math.min does not handle sparse arrays the way we want.
 *
 * @param {Array.<number?>} ary An array of values.
 * @return {number} The minimum value.
 * @private
 */
goog.ui.ServerChart.prototype.arrayMin_ = function(ary) {
  var min = Infinity;
  for (var i = 0, aryLen = ary.length; i < aryLen; ++i) {
    var value = ary[i];
    if (value != null && value < min) {
      min = value;
    }
  }
  return min;
};


/**
 * Finds the maximum value in an array and returns it.
 * Needed because Math.max does not handle sparse arrays the way we want.
 *
 * @param {Array.<number?>} ary An array of values.
 * @return {number} The maximum value.
 * @private
 */
goog.ui.ServerChart.prototype.arrayMax_ = function(ary) {
  var max = -Infinity;
  for (var i = 0, aryLen = ary.length; i < aryLen; ++i) {
    var value = ary[i];
    if (value != null && value > max) {
      max = value;
    }
  }
  return max;
};


/** @override */
goog.ui.ServerChart.prototype.disposeInternal = function() {
  goog.ui.ServerChart.superClass_.disposeInternal.call(this);
  delete this.xLabels_;
  delete this.leftLabels_;
  delete this.rightLabels_;
  delete this.gridX_;
  delete this.gridY_;
  delete this.setColors_;
  delete this.setLegendTexts_;
  delete this.dataSets_;
  this.uri_ = null;
  delete this.minValue_;
  delete this.maxValue_;
  this.title_ = null;
  delete this.multiAxisType_;
  delete this.multiAxisLabelText_;
  delete this.multiAxisLabelPosition_;
  delete this.multiAxisRange_;
  delete this.multiAxisLabelStyle_;
  this.legend_ = null;
};


/**
 * Event types dispatched by the ServerChart object
 * @enum {string}
 */
goog.ui.ServerChart.Event = {
  /**
   * Dispatched when the resulting URI reaches or exceeds the URI length limit.
   */
  URI_TOO_LONG: 'uritoolong'
};



/**
 * Class for the event dispatched on the ServerChart when the resulting URI
 * exceeds the URI length limit.
 * @constructor
 * @param {string} uri The overly-long URI string.
 * @extends {goog.events.Event}
 */
goog.ui.ServerChart.UriTooLongEvent = function(uri) {
  goog.events.Event.call(this, goog.ui.ServerChart.Event.URI_TOO_LONG);

  /**
   * The overly-long URI string.
   * @type {string}
   */
  this.uri = uri;
};
goog.inherits(goog.ui.ServerChart.UriTooLongEvent, goog.events.Event);
