// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Factories for common path types.
 * @author nicksantos@google.com (Nick Santos)
 */


goog.provide('goog.math.paths');

goog.require('goog.math.Coordinate');
goog.require('goog.math.Path');


/**
 * Defines a regular n-gon by specifing the center, a vertex, and the total
 * number of vertices.
 * @param {goog.math.Coordinate} center The center point.
 * @param {goog.math.Coordinate} vertex The vertex, which implicitly defines
 *     a radius as well.
 * @param {number} n The number of vertices.
 * @return {!goog.math.Path} The path.
 */
goog.math.paths.createRegularNGon = function(center, vertex, n) {
  var path = new goog.math.Path();
  path.moveTo(vertex.x, vertex.y);

  var startAngle = Math.atan2(vertex.y - center.y, vertex.x - center.x);
  var radius = goog.math.Coordinate.distance(center, vertex);
  for (var i = 1; i < n; i++) {
    var angle = startAngle + 2 * Math.PI * (i / n);
    path.lineTo(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle));
  }
  path.close();
  return path;
};


/**
 * Defines an arrow.
 * @param {goog.math.Coordinate} a Point A.
 * @param {goog.math.Coordinate} b Point B.
 * @param {?number} aHead The size of the arrow head at point A.
 *     0 omits the head.
 * @param {?number} bHead The size of the arrow head at point B.
 *     0 omits the head.
 * @return {!goog.math.Path} The path.
 */
goog.math.paths.createArrow = function(a, b, aHead, bHead) {
  var path = new goog.math.Path();
  path.moveTo(a.x, a.y);
  path.lineTo(b.x, b.y);

  var angle = Math.atan2(b.y - a.y, b.x - a.x);
  if (aHead) {
    path.appendPath(
        goog.math.paths.createRegularNGon(
            new goog.math.Coordinate(
                a.x + aHead * Math.cos(angle), a.y + aHead * Math.sin(angle)),
            a, 3));
  }
  if (bHead) {
    path.appendPath(
        goog.math.paths.createRegularNGon(
            new goog.math.Coordinate(
                b.x + bHead * Math.cos(angle + Math.PI),
                b.y + bHead * Math.sin(angle + Math.PI)),
            b, 3));
  }
  return path;
};
