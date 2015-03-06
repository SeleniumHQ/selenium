// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The Tridiagonal matrix algorithm solver solves a special
 * version of a sparse linear system Ax = b where A is tridiagonal.
 *
 * See http://en.wikipedia.org/wiki/Tridiagonal_matrix_algorithm
 *
 */

goog.provide('goog.math.tdma');


/**
 * Solves a linear system where the matrix is square tri-diagonal. That is,
 * given a system of equations:
 *
 * A * result = vecRight,
 *
 * this class computes result = inv(A) * vecRight, where A has the special form
 * of a tri-diagonal matrix:
 *
 *    |dia(0) sup(0)   0    0     ...   0|
 *    |sub(0) dia(1) sup(1) 0     ...   0|
 * A =|                ...               |
 *    |0 ... 0 sub(n-2) dia(n-1) sup(n-1)|
 *    |0 ... 0    0     sub(n-1)   dia(n)|
 *
 * @param {!Array<number>} subDiag The sub diagonal of the matrix.
 * @param {!Array<number>} mainDiag The main diagonal of the matrix.
 * @param {!Array<number>} supDiag The super diagonal of the matrix.
 * @param {!Array<number>} vecRight The right vector of the system
 *     of equations.
 * @param {Array<number>=} opt_result The optional array to store the result.
 * @return {!Array<number>} The vector that is the solution to the system.
 */
goog.math.tdma.solve = function(
    subDiag, mainDiag, supDiag, vecRight, opt_result) {
  // Make a local copy of the main diagonal and the right vector.
  mainDiag = mainDiag.slice();
  vecRight = vecRight.slice();

  // The dimension of the matrix.
  var nDim = mainDiag.length;

  // Construct a modified linear system of equations with the same solution
  // as the input one.
  for (var i = 1; i < nDim; ++i) {
    var m = subDiag[i - 1] / mainDiag[i - 1];
    mainDiag[i] = mainDiag[i] - m * supDiag[i - 1];
    vecRight[i] = vecRight[i] - m * vecRight[i - 1];
  }

  // Solve the new system of equations by simple back-substitution.
  var result = opt_result || new Array(vecRight.length);
  result[nDim - 1] = vecRight[nDim - 1] / mainDiag[nDim - 1];
  for (i = nDim - 2; i >= 0; --i) {
    result[i] = (vecRight[i] - supDiag[i] * result[i + 1]) / mainDiag[i];
  }
  return result;
};
