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

goog.provide('core.filters');
goog.provide('core.filters.Strategy');

goog.require('bot.dom');
goog.require('core.Error');
goog.require('goog.array');



/**
 * @param {string} name The expected name value to match against.
 * @param {!IArrayLike.<!Element>} elements The list to filter.
 * @return {!Array.<!Element>} The filtered list of elements.
 * @private
 */
core.filters.name_ = function(name, elements) {
  return goog.array.filter(elements, function(element, index, array) {
    return bot.dom.getProperty(element, 'name') == name;
  });
};


/**
 * @param {string} value The expected value to match against.
 * @param {!IArrayLike.<!Element>} elements The list to filter.
 * @return {!Array.<!Element>} The filtered list of elements.
 * @private
 */
core.filters.value_ = function(value, elements) {
  return goog.array.filter(elements, function(element, index, array) {
    return bot.dom.getProperty(element, 'value') === value;
  });
};


/**
 * @param {string} index The index to select.
 * @param {!IArrayLike.<!Element>} elements The list to filter.
 * @return {!Array.<!Element>} The filtered list of elements.
 * @private
 */
core.filters.index_ = function(index, elements) {
  var idx = Number(index);
  if (isNaN(idx) || idx < 0) {
    throw new core.Error('Illegal Index: ' + index);
  }
  if (elements.length <= idx) {
    throw new core.Error('Index out of range: ' + index);
  }
  return [elements[idx]];
};


/**
 * @typedef {function(string,
 *     !IArrayLike.<!Element>):!Array.<Element>}
 */
core.filters.Strategy;


/**
 * Known element list filtering strategies.
 *
 * @const
 * @private {!Object.<string,core.filters.Strategy>}
 */
core.filters.Filters_ = {
  'index': core.filters.index_,
  'name': core.filters.name_,
  'value': core.filters.value_
};


/**
 * Refine a list of elements using a filter.
 *
 * @param {string} filterType The type of filter to use.
 * @param {string} filter The value to pass to the filter function.
 * @param {!IArrayLike.<!Element>} elements The list of elements to
 *     filter.
 * @return {!Array.<!Element>} The filtered list of elements.
 * @private
 */
core.filters.selectElementsBy_ = function(filterType, filter, elements) {
  var filterFunction = core.filters.Filters_[filterType];
  if (!filterFunction) {
    throw new core.Error("Unrecognised element-filter type: '" +
        filterType + "'");
  }

  return filterFunction(filter, elements);
};


/**
 * Refine a list of elements using a filter.
 *
 * @param {string} filterExpr The type of filter to use.
 * @param {!IArrayLike.<!Element>} elements The list of elements to
 *     filter.
 * @param {string} defaultFilterType The default type of filter to use.
 * @return {!Array.<!Element>} The filtered list of elements.
 */
core.filters.selectElements = function(filterExpr, elements,
    defaultFilterType) {
  var filterType = defaultFilterType || 'value';

  // If there is a filter prefix, use the specified strategy
  var result = filterExpr.match(/^([A-Za-z]+)=(.+)/);
  if (result) {
    filterType = result[1].toLowerCase();
    filterExpr = result[2];
  }

  return core.filters.selectElementsBy_(filterType, filterExpr, elements);
};
