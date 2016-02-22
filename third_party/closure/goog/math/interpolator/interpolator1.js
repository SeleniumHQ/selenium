// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The base interface for one-dimensional data interpolation.
 *
 */

goog.provide('goog.math.interpolator.Interpolator1');



/**
 * An interface for one dimensional data interpolation.
 * @interface
 */
goog.math.interpolator.Interpolator1 = function() {
};


/**
 * Sets the data to be interpolated. Note that the data points are expected
 * to be sorted according to their abscissa values and not have duplicate
 * values. E.g. calling setData([0, 0, 1], [1, 1, 3]) may give undefined
 * results, the correct call should be setData([0, 1], [1, 3]).
 * Calling setData multiple times does not merge the data samples. The last
 * call to setData is the one used when computing the interpolation.
 * @param {!Array<number>} x The abscissa of the data points.
 * @param {!Array<number>} y The ordinate of the data points.
 */
goog.math.interpolator.Interpolator1.prototype.setData;


/**
 * Computes the interpolated value at abscissa x. If x is outside the range
 * of the data points passed in setData, the value is extrapolated.
 * @param {number} x The abscissa to sample at.
 * @return {number} The interpolated value at abscissa x.
 */
goog.math.interpolator.Interpolator1.prototype.interpolate;


/**
 * Computes the inverse interpolator. That is, it returns invInterp s.t.
 * this.interpolate(invInterp.interpolate(t))) = t. Note that the inverse
 * interpolator is only well defined if the data being interpolated is
 * 'invertible', i.e. it represents a bijective function.
 * In addition, the returned interpolator is only guaranteed to give the exact
 * inverse at the input data passed in getData.
 * If 'this' has no data, the returned Interpolator will be empty as well.
 * @return {!goog.math.interpolator.Interpolator1} The inverse interpolator.
 */
goog.math.interpolator.Interpolator1.prototype.getInverse;
