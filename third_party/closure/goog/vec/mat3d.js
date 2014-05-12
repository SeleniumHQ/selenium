// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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


////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////
//                                                                           //
// Any edits to this file must be applied to mat3f.js by running:            //
//   swap_type.sh mat3d.js > mat3f.js                                        //
//                                                                           //
////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////


/**
 * @fileoverview Provides functions for operating on 3x3 double (64bit)
 * matrices.  The matrices are stored in column-major order.
 *
 * The last parameter will typically be the output object and an object
 * can be both an input and output parameter to all methods except where
 * noted.
 *
 * See the README for notes about the design and structure of the API
 * (especially related to performance).
 *
 */
goog.provide('goog.vec.mat3d');
goog.provide('goog.vec.mat3d.Type');

goog.require('goog.vec');


/** @typedef {goog.vec.Float64} */ goog.vec.mat3d.Type;


/**
 * Creates a mat3d with all elements initialized to zero.
 *
 * @return {!goog.vec.mat3d.Type} The new mat3d.
 */
goog.vec.mat3d.create = function() {
  return new Float64Array(9);
};


/**
 * Initializes the matrix from the set of values. Note the values supplied are
 * in column major order.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the
 *     values.
 * @param {number} v00 The values at (0, 0).
 * @param {number} v10 The values at (1, 0).
 * @param {number} v20 The values at (2, 0).
 * @param {number} v01 The values at (0, 1).
 * @param {number} v11 The values at (1, 1).
 * @param {number} v21 The values at (2, 1).
 * @param {number} v02 The values at (0, 2).
 * @param {number} v12 The values at (1, 2).
 * @param {number} v22 The values at (2, 2).
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setFromValues = function(
    mat, v00, v10, v20, v01, v11, v21, v02, v12, v22) {
  mat[0] = v00;
  mat[1] = v10;
  mat[2] = v20;
  mat[3] = v01;
  mat[4] = v11;
  mat[5] = v21;
  mat[6] = v02;
  mat[7] = v12;
  mat[8] = v22;
  return mat;
};


/**
 * Initializes mat3d mat from mat3d src.
 *
 * @param {goog.vec.mat3d.Type} mat The destination matrix.
 * @param {goog.vec.mat3d.Type} src The source matrix.
 * @return {!goog.vec.mat3d.Type} Return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setFromMat3d = function(mat, src) {
  mat[0] = src[0];
  mat[1] = src[1];
  mat[2] = src[2];
  mat[3] = src[3];
  mat[4] = src[4];
  mat[5] = src[5];
  mat[6] = src[6];
  mat[7] = src[7];
  mat[8] = src[8];
  return mat;
};


/**
 * Initializes mat3d mat from mat3f src (typed as a Float32Array to
 * avoid circular goog.requires).
 *
 * @param {goog.vec.mat3d.Type} mat The destination matrix.
 * @param {Float32Array} src The source matrix.
 * @return {!goog.vec.mat3d.Type} Return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setFromMat3f = function(mat, src) {
  mat[0] = src[0];
  mat[1] = src[1];
  mat[2] = src[2];
  mat[3] = src[3];
  mat[4] = src[4];
  mat[5] = src[5];
  mat[6] = src[6];
  mat[7] = src[7];
  mat[8] = src[8];
  return mat;
};


/**
 * Initializes mat3d mat from Array src.
 *
 * @param {goog.vec.mat3d.Type} mat The destination matrix.
 * @param {Array.<number>} src The source matrix.
 * @return {!goog.vec.mat3d.Type} Return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setFromArray = function(mat, src) {
  mat[0] = src[0];
  mat[1] = src[1];
  mat[2] = src[2];
  mat[3] = src[3];
  mat[4] = src[4];
  mat[5] = src[5];
  mat[6] = src[6];
  mat[7] = src[7];
  mat[8] = src[8];
  return mat;
};


/**
 * Retrieves the element at the requested row and column.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix containing the value to
 *     retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @return {number} The element value at the requested row, column indices.
 */
goog.vec.mat3d.getElement = function(mat, row, column) {
  return mat[row + column * 3];
};


/**
 * Sets the element at the requested row and column.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix containing the value to
 *     retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @param {number} value The value to set at the requested row, column.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setElement = function(mat, row, column, value) {
  mat[row + column * 3] = value;
  return mat;
};


/**
 * Sets the diagonal values of the matrix from the given values.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the values.
 * @param {number} v00 The values for (0, 0).
 * @param {number} v11 The values for (1, 1).
 * @param {number} v22 The values for (2, 2).
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setDiagonalValues = function(mat, v00, v11, v22) {
  mat[0] = v00;
  mat[4] = v11;
  mat[8] = v22;
  return mat;
};


/**
 * Sets the diagonal values of the matrix from the given vector.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the values.
 * @param {goog.vec.vec3d.Type} vec The vector containing the values.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setDiagonal = function(mat, vec) {
  mat[0] = vec[0];
  mat[4] = vec[1];
  mat[8] = vec[2];
  return mat;
};


/**
 * Sets the specified column with the supplied values.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to recieve the values.
 * @param {number} column The column index to set the values on.
 * @param {number} v0 The value for row 0.
 * @param {number} v1 The value for row 1.
 * @param {number} v2 The value for row 2.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setColumnValues = function(mat, column, v0, v1, v2) {
  var i = column * 3;
  mat[i] = v0;
  mat[i + 1] = v1;
  mat[i + 2] = v2;
  return mat;
};


/**
 * Sets the specified column with the value from the supplied array.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the values.
 * @param {number} column The column index to set the values on.
 * @param {goog.vec.vec3d.Type} vec The vector elements for the column.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setColumn = function(mat, column, vec) {
  var i = column * 3;
  mat[i] = vec[0];
  mat[i + 1] = vec[1];
  mat[i + 2] = vec[2];
  return mat;
};


/**
 * Retrieves the specified column from the matrix into the given vector
 * array.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix supplying the values.
 * @param {number} column The column to get the values from.
 * @param {goog.vec.vec3d.Type} vec The vector elements to receive the
 *     column.
 * @return {!goog.vec.vec3d.Type} return vec so that operations can be
 *     chained together.
 */
goog.vec.mat3d.getColumn = function(mat, column, vec) {
  var i = column * 3;
  vec[0] = mat[i];
  vec[1] = mat[i + 1];
  vec[2] = mat[i + 2];
  return vec;
};


/**
 * Sets the columns of the matrix from the set of vector elements.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the values.
 * @param {goog.vec.vec3d.Type} vec0 The values for column 0.
 * @param {goog.vec.vec3d.Type} vec1 The values for column 1.
 * @param {goog.vec.vec3d.Type} vec2 The values for column 2.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setColumns = function(mat, vec0, vec1, vec2) {
  goog.vec.mat3d.setColumn(mat, 0, vec0);
  goog.vec.mat3d.setColumn(mat, 1, vec1);
  goog.vec.mat3d.setColumn(mat, 2, vec2);
  return /** @type {!goog.vec.mat3d.Type} */(mat);
};


/**
 * Retrieves the column values from the given matrix into the given vector
 * elements.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix supplying the columns.
 * @param {goog.vec.vec3d.Type} vec0 The vector to receive column 0.
 * @param {goog.vec.vec3d.Type} vec1 The vector to receive column 1.
 * @param {goog.vec.vec3d.Type} vec2 The vector to receive column 2.
 */
goog.vec.mat3d.getColumns = function(mat, vec0, vec1, vec2) {
  goog.vec.mat3d.getColumn(mat, 0, vec0);
  goog.vec.mat3d.getColumn(mat, 1, vec1);
  goog.vec.mat3d.getColumn(mat, 2, vec2);
};


/**
 * Sets the row values from the supplied values.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the values.
 * @param {number} row The index of the row to receive the values.
 * @param {number} v0 The value for column 0.
 * @param {number} v1 The value for column 1.
 * @param {number} v2 The value for column 2.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setRowValues = function(mat, row, v0, v1, v2) {
  mat[row] = v0;
  mat[row + 3] = v1;
  mat[row + 6] = v2;
  return mat;
};


/**
 * Sets the row values from the supplied vector.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the row values.
 * @param {number} row The index of the row.
 * @param {goog.vec.vec3d.Type} vec The vector containing the values.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setRow = function(mat, row, vec) {
  mat[row] = vec[0];
  mat[row + 3] = vec[1];
  mat[row + 6] = vec[2];
  return mat;
};


/**
 * Retrieves the row values into the given vector.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix supplying the values.
 * @param {number} row The index of the row supplying the values.
 * @param {goog.vec.vec3d.Type} vec The vector to receive the row.
 * @return {!goog.vec.vec3d.Type} return vec so that operations can be
 *     chained together.
 */
goog.vec.mat3d.getRow = function(mat, row, vec) {
  vec[0] = mat[row];
  vec[1] = mat[row + 3];
  vec[2] = mat[row + 6];
  return vec;
};


/**
 * Sets the rows of the matrix from the supplied vectors.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to receive the values.
 * @param {goog.vec.vec3d.Type} vec0 The values for row 0.
 * @param {goog.vec.vec3d.Type} vec1 The values for row 1.
 * @param {goog.vec.vec3d.Type} vec2 The values for row 2.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.setRows = function(mat, vec0, vec1, vec2) {
  goog.vec.mat3d.setRow(mat, 0, vec0);
  goog.vec.mat3d.setRow(mat, 1, vec1);
  goog.vec.mat3d.setRow(mat, 2, vec2);
  return /** @type {!goog.vec.mat3d.Type} */(mat);
};


/**
 * Retrieves the rows of the matrix into the supplied vectors.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to supplying the values.
 * @param {goog.vec.vec3d.Type} vec0 The vector to receive row 0.
 * @param {goog.vec.vec3d.Type} vec1 The vector to receive row 1.
 * @param {goog.vec.vec3d.Type} vec2 The vector to receive row 2.
 */
goog.vec.mat3d.getRows = function(mat, vec0, vec1, vec2) {
  goog.vec.mat3d.getRow(mat, 0, vec0);
  goog.vec.mat3d.getRow(mat, 1, vec1);
  goog.vec.mat3d.getRow(mat, 2, vec2);
};


/**
 * Makes the given 3x3 matrix the zero matrix.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @return {!goog.vec.mat3d.Type} return mat so operations can be chained.
 */
goog.vec.mat3d.makeZero = function(mat) {
  mat[0] = 0;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  return mat;
};


/**
 * Makes the given 3x3 matrix the identity matrix.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @return {!goog.vec.mat3d.Type} return mat so operations can be chained.
 */
goog.vec.mat3d.makeIdentity = function(mat) {
  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 1;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 1;
  return mat;
};


/**
 * Performs a per-component addition of the matrices mat0 and mat1, storing
 * the result into resultMat.
 *
 * @param {goog.vec.mat3d.Type} mat0 The first addend.
 * @param {goog.vec.mat3d.Type} mat1 The second addend.
 * @param {goog.vec.mat3d.Type} resultMat The matrix to
 *     receive the results (may be either mat0 or mat1).
 * @return {!goog.vec.mat3d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.addMat = function(mat0, mat1, resultMat) {
  resultMat[0] = mat0[0] + mat1[0];
  resultMat[1] = mat0[1] + mat1[1];
  resultMat[2] = mat0[2] + mat1[2];
  resultMat[3] = mat0[3] + mat1[3];
  resultMat[4] = mat0[4] + mat1[4];
  resultMat[5] = mat0[5] + mat1[5];
  resultMat[6] = mat0[6] + mat1[6];
  resultMat[7] = mat0[7] + mat1[7];
  resultMat[8] = mat0[8] + mat1[8];
  return resultMat;
};


/**
 * Performs a per-component subtraction of the matrices mat0 and mat1,
 * storing the result into resultMat.
 *
 * @param {goog.vec.mat3d.Type} mat0 The minuend.
 * @param {goog.vec.mat3d.Type} mat1 The subtrahend.
 * @param {goog.vec.mat3d.Type} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {!goog.vec.mat3d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.subMat = function(mat0, mat1, resultMat) {
  resultMat[0] = mat0[0] - mat1[0];
  resultMat[1] = mat0[1] - mat1[1];
  resultMat[2] = mat0[2] - mat1[2];
  resultMat[3] = mat0[3] - mat1[3];
  resultMat[4] = mat0[4] - mat1[4];
  resultMat[5] = mat0[5] - mat1[5];
  resultMat[6] = mat0[6] - mat1[6];
  resultMat[7] = mat0[7] - mat1[7];
  resultMat[8] = mat0[8] - mat1[8];
  return resultMat;
};


/**
 * Multiplies matrix mat0 with the given scalar, storing the result
 * into resultMat.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} scalar The scalar value to multiple to each element of mat.
 * @param {goog.vec.mat3d.Type} resultMat The matrix to receive
 *     the results (may be mat).
 * @return {!goog.vec.mat3d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.multScalar = function(mat, scalar, resultMat) {
  resultMat[0] = mat[0] * scalar;
  resultMat[1] = mat[1] * scalar;
  resultMat[2] = mat[2] * scalar;
  resultMat[3] = mat[3] * scalar;
  resultMat[4] = mat[4] * scalar;
  resultMat[5] = mat[5] * scalar;
  resultMat[6] = mat[6] * scalar;
  resultMat[7] = mat[7] * scalar;
  resultMat[8] = mat[8] * scalar;
  return resultMat;
};


/**
 * Multiplies the two matrices mat0 and mat1 using matrix multiplication,
 * storing the result into resultMat.
 *
 * @param {goog.vec.mat3d.Type} mat0 The first (left hand) matrix.
 * @param {goog.vec.mat3d.Type} mat1 The second (right hand) matrix.
 * @param {goog.vec.mat3d.Type} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {!goog.vec.mat3d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.multMat = function(mat0, mat1, resultMat) {
  var a00 = mat0[0], a10 = mat0[1], a20 = mat0[2];
  var a01 = mat0[3], a11 = mat0[4], a21 = mat0[5];
  var a02 = mat0[6], a12 = mat0[7], a22 = mat0[8];

  var b00 = mat1[0], b10 = mat1[1], b20 = mat1[2];
  var b01 = mat1[3], b11 = mat1[4], b21 = mat1[5];
  var b02 = mat1[6], b12 = mat1[7], b22 = mat1[8];

  resultMat[0] = a00 * b00 + a01 * b10 + a02 * b20;
  resultMat[1] = a10 * b00 + a11 * b10 + a12 * b20;
  resultMat[2] = a20 * b00 + a21 * b10 + a22 * b20;
  resultMat[3] = a00 * b01 + a01 * b11 + a02 * b21;
  resultMat[4] = a10 * b01 + a11 * b11 + a12 * b21;
  resultMat[5] = a20 * b01 + a21 * b11 + a22 * b21;
  resultMat[6] = a00 * b02 + a01 * b12 + a02 * b22;
  resultMat[7] = a10 * b02 + a11 * b12 + a12 * b22;
  resultMat[8] = a20 * b02 + a21 * b12 + a22 * b22;
  return resultMat;
};


/**
 * Transposes the given matrix mat storing the result into resultMat.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix to transpose.
 * @param {goog.vec.mat3d.Type} resultMat The matrix to receive
 *     the results (may be mat).
 * @return {!goog.vec.mat3d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat3d.transpose = function(mat, resultMat) {
  if (resultMat == mat) {
    var a10 = mat[1], a20 = mat[2], a21 = mat[5];
    resultMat[1] = mat[3];
    resultMat[2] = mat[6];
    resultMat[3] = a10;
    resultMat[5] = mat[7];
    resultMat[6] = a20;
    resultMat[7] = a21;
  } else {
    resultMat[0] = mat[0];
    resultMat[1] = mat[3];
    resultMat[2] = mat[6];
    resultMat[3] = mat[1];
    resultMat[4] = mat[4];
    resultMat[5] = mat[7];
    resultMat[6] = mat[2];
    resultMat[7] = mat[5];
    resultMat[8] = mat[8];
  }
  return resultMat;
};


/**
 * Computes the inverse of mat0 storing the result into resultMat. If the
 * inverse is defined, this function returns true, false otherwise.
 *
 * @param {goog.vec.mat3d.Type} mat0 The matrix to invert.
 * @param {goog.vec.mat3d.Type} resultMat The matrix to receive
 *     the result (may be mat0).
 * @return {boolean} True if the inverse is defined. If false is returned,
 *     resultMat is not modified.
 */
goog.vec.mat3d.invert = function(mat0, resultMat) {
  var a00 = mat0[0], a10 = mat0[1], a20 = mat0[2];
  var a01 = mat0[3], a11 = mat0[4], a21 = mat0[5];
  var a02 = mat0[6], a12 = mat0[7], a22 = mat0[8];

  var t00 = a11 * a22 - a12 * a21;
  var t10 = a12 * a20 - a10 * a22;
  var t20 = a10 * a21 - a11 * a20;
  var det = a00 * t00 + a01 * t10 + a02 * t20;
  if (det == 0) {
    return false;
  }

  var idet = 1 / det;
  resultMat[0] = t00 * idet;
  resultMat[3] = (a02 * a21 - a01 * a22) * idet;
  resultMat[6] = (a01 * a12 - a02 * a11) * idet;

  resultMat[1] = t10 * idet;
  resultMat[4] = (a00 * a22 - a02 * a20) * idet;
  resultMat[7] = (a02 * a10 - a00 * a12) * idet;

  resultMat[2] = t20 * idet;
  resultMat[5] = (a01 * a20 - a00 * a21) * idet;
  resultMat[8] = (a00 * a11 - a01 * a10) * idet;
  return true;
};


/**
 * Returns true if the components of mat0 are equal to the components of mat1.
 *
 * @param {goog.vec.mat3d.Type} mat0 The first matrix.
 * @param {goog.vec.mat3d.Type} mat1 The second matrix.
 * @return {boolean} True if the the two matrices are equivalent.
 */
goog.vec.mat3d.equals = function(mat0, mat1) {
  return mat0.length == mat1.length &&
      mat0[0] == mat1[0] && mat0[1] == mat1[1] && mat0[2] == mat1[2] &&
      mat0[3] == mat1[3] && mat0[4] == mat1[4] && mat0[5] == mat1[5] &&
      mat0[6] == mat1[6] && mat0[7] == mat1[7] && mat0[8] == mat1[8];
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed matrix into resultVec.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix supplying the transformation.
 * @param {goog.vec.vec3d.Type} vec The vector to transform.
 * @param {goog.vec.vec3d.Type} resultVec The vector to
 *     receive the results (may be vec).
 * @return {!goog.vec.vec3d.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.mat3d.multVec3 = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2];
  resultVec[0] = x * mat[0] + y * mat[3] + z * mat[6];
  resultVec[1] = x * mat[1] + y * mat[4] + z * mat[7];
  resultVec[2] = x * mat[2] + y * mat[5] + z * mat[8];
  return resultVec;
};


/**
 * Makes the given 3x3 matrix a translation matrix with x and y
 * translation values.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} x The translation along the x axis.
 * @param {number} y The translation along the y axis.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeTranslate = function(mat, x, y) {
  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 1;
  mat[5] = 0;
  mat[6] = x;
  mat[7] = y;
  mat[8] = 1;
  return mat;
};


/**
 * Makes the given 3x3 matrix a scale matrix with x, y, and z scale factors.
 *
 * @param {goog.vec.mat3d.Type} mat The 3x3 (9-element) matrix
 *     array to receive the new scale matrix.
 * @param {number} x The scale along the x axis.
 * @param {number} y The scale along the y axis.
 * @param {number} z The scale along the z axis.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeScale = function(mat, x, y, z) {
  mat[0] = x;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = y;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = z;
  return mat;
};


/**
 * Makes the given 3x3 matrix a rotation matrix with the given rotation
 * angle about the axis defined by the vector (ax, ay, az).
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @param {number} ax The x component of the rotation axis.
 * @param {number} ay The y component of the rotation axis.
 * @param {number} az The z component of the rotation axis.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeRotate = function(mat, angle, ax, ay, az) {
  var c = Math.cos(angle);
  var d = 1 - c;
  var s = Math.sin(angle);

  mat[0] = ax * ax * d + c;
  mat[1] = ax * ay * d + az * s;
  mat[2] = ax * az * d - ay * s;
  mat[3] = ax * ay * d - az * s;
  mat[4] = ay * ay * d + c;
  mat[5] = ay * az * d + ax * s;
  mat[6] = ax * az * d + ay * s;
  mat[7] = ay * az * d - ax * s;
  mat[8] = az * az * d + c;

  return mat;
};


/**
 * Makes the given 3x3 matrix a rotation matrix with the given rotation
 * angle about the X axis.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeRotateX = function(mat, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = c;
  mat[5] = s;
  mat[6] = 0;
  mat[7] = -s;
  mat[8] = c;

  return mat;
};


/**
 * Makes the given 3x3 matrix a rotation matrix with the given rotation
 * angle about the Y axis.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeRotateY = function(mat, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = c;
  mat[1] = 0;
  mat[2] = -s;
  mat[3] = 0;
  mat[4] = 1;
  mat[5] = 0;
  mat[6] = s;
  mat[7] = 0;
  mat[8] = c;

  return mat;
};


/**
 * Makes the given 3x3 matrix a rotation matrix with the given rotation
 * angle about the Z axis.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeRotateZ = function(mat, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = c;
  mat[1] = s;
  mat[2] = 0;
  mat[3] = -s;
  mat[4] = c;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 1;

  return mat;
};


/**
 * Rotate the given matrix by angle about the x,y,z axis.  Equivalent to:
 * goog.vec.mat3d.multMat(
 *     mat,
 *     goog.vec.mat3d.makeRotate(goog.vec.mat3d.create(), angle, x, y, z),
 *     mat);
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @param {number} x The x component of the rotation axis.
 * @param {number} y The y component of the rotation axis.
 * @param {number} z The z component of the rotation axis.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.rotate = function(mat, angle, x, y, z) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2];
  var m01 = mat[3], m11 = mat[4], m21 = mat[5];
  var m02 = mat[6], m12 = mat[7], m22 = mat[8];

  var cosAngle = Math.cos(angle);
  var sinAngle = Math.sin(angle);
  var diffCosAngle = 1 - cosAngle;
  var r00 = x * x * diffCosAngle + cosAngle;
  var r10 = x * y * diffCosAngle + z * sinAngle;
  var r20 = x * z * diffCosAngle - y * sinAngle;

  var r01 = x * y * diffCosAngle - z * sinAngle;
  var r11 = y * y * diffCosAngle + cosAngle;
  var r21 = y * z * diffCosAngle + x * sinAngle;

  var r02 = x * z * diffCosAngle + y * sinAngle;
  var r12 = y * z * diffCosAngle - x * sinAngle;
  var r22 = z * z * diffCosAngle + cosAngle;

  mat[0] = m00 * r00 + m01 * r10 + m02 * r20;
  mat[1] = m10 * r00 + m11 * r10 + m12 * r20;
  mat[2] = m20 * r00 + m21 * r10 + m22 * r20;
  mat[3] = m00 * r01 + m01 * r11 + m02 * r21;
  mat[4] = m10 * r01 + m11 * r11 + m12 * r21;
  mat[5] = m20 * r01 + m21 * r11 + m22 * r21;
  mat[6] = m00 * r02 + m01 * r12 + m02 * r22;
  mat[7] = m10 * r02 + m11 * r12 + m12 * r22;
  mat[8] = m20 * r02 + m21 * r12 + m22 * r22;

  return mat;
};


/**
 * Rotate the given matrix by angle about the x axis.  Equivalent to:
 * goog.vec.mat3d.multMat(
 *     mat,
 *     goog.vec.mat3d.makeRotateX(goog.vec.mat3d.create(), angle),
 *     mat);
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.rotateX = function(mat, angle) {
  var m01 = mat[3], m11 = mat[4], m21 = mat[5];
  var m02 = mat[6], m12 = mat[7], m22 = mat[8];

  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[3] = m01 * c + m02 * s;
  mat[4] = m11 * c + m12 * s;
  mat[5] = m21 * c + m22 * s;
  mat[6] = m01 * -s + m02 * c;
  mat[7] = m11 * -s + m12 * c;
  mat[8] = m21 * -s + m22 * c;

  return mat;
};


/**
 * Rotate the given matrix by angle about the y axis.  Equivalent to:
 * goog.vec.mat3d.multMat(
 *     mat,
 *     goog.vec.mat3d.makeRotateY(goog.vec.mat3d.create(), angle),
 *     mat);
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.rotateY = function(mat, angle) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2];
  var m02 = mat[6], m12 = mat[7], m22 = mat[8];

  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = m00 * c + m02 * -s;
  mat[1] = m10 * c + m12 * -s;
  mat[2] = m20 * c + m22 * -s;
  mat[6] = m00 * s + m02 * c;
  mat[7] = m10 * s + m12 * c;
  mat[8] = m20 * s + m22 * c;

  return mat;
};


/**
 * Rotate the given matrix by angle about the z axis.  Equivalent to:
 * goog.vec.mat3d.multMat(
 *     mat,
 *     goog.vec.mat3d.makeRotateZ(goog.vec.mat3d.create(), angle),
 *     mat);
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.rotateZ = function(mat, angle) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2];
  var m01 = mat[3], m11 = mat[4], m21 = mat[5];

  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = m00 * c + m01 * s;
  mat[1] = m10 * c + m11 * s;
  mat[2] = m20 * c + m21 * s;
  mat[3] = m00 * -s + m01 * c;
  mat[4] = m10 * -s + m11 * c;
  mat[5] = m20 * -s + m21 * c;

  return mat;
};


/**
 * Makes the given 3x3 matrix a rotation matrix given Euler angles using
 * the ZXZ convention.
 * Given the euler angles [theta1, theta2, theta3], the rotation is defined as
 * rotation = rotation_z(theta1) * rotation_x(theta2) * rotation_z(theta3),
 * with theta1 in [0, 2 * pi], theta2 in [0, pi] and theta3 in [0, 2 * pi].
 * rotation_x(theta) means rotation around the X axis of theta radians.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {number} theta1 The angle of rotation around the Z axis in radians.
 * @param {number} theta2 The angle of rotation around the X axis in radians.
 * @param {number} theta3 The angle of rotation around the Z axis in radians.
 * @return {!goog.vec.mat3d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat3d.makeEulerZXZ = function(mat, theta1, theta2, theta3) {
  var c1 = Math.cos(theta1);
  var s1 = Math.sin(theta1);

  var c2 = Math.cos(theta2);
  var s2 = Math.sin(theta2);

  var c3 = Math.cos(theta3);
  var s3 = Math.sin(theta3);

  mat[0] = c1 * c3 - c2 * s1 * s3;
  mat[1] = c2 * c1 * s3 + c3 * s1;
  mat[2] = s3 * s2;

  mat[3] = -c1 * s3 - c3 * c2 * s1;
  mat[4] = c1 * c2 * c3 - s1 * s3;
  mat[5] = c3 * s2;

  mat[6] = s2 * s1;
  mat[7] = -c1 * s2;
  mat[8] = c2;

  return mat;
};


/**
 * Decomposes a rotation matrix into Euler angles using the ZXZ convention so
 * that rotation = rotation_z(theta1) * rotation_x(theta2) * rotation_z(theta3),
 * with theta1 in [0, 2 * pi], theta2 in [0, pi] and theta3 in [0, 2 * pi].
 * rotation_x(theta) means rotation around the X axis of theta radians.
 *
 * @param {goog.vec.mat3d.Type} mat The matrix.
 * @param {goog.vec.vec3d.Type} euler The ZXZ Euler angles in
 *     radians as [theta1, theta2, theta3].
 * @param {boolean=} opt_theta2IsNegative Whether theta2 is in [-pi, 0] instead
 *     of the default [0, pi].
 * @return {!goog.vec.vec3d.Type} return euler so that operations can be
 *     chained together.
 */
goog.vec.mat3d.toEulerZXZ = function(mat, euler, opt_theta2IsNegative) {
  // There is an ambiguity in the sign of sinTheta2 because of the sqrt.
  var sinTheta2 = Math.sqrt(mat[2] * mat[2] + mat[5] * mat[5]);

  // By default we explicitely constrain theta2 to be in [0, pi],
  // so sinTheta2 is always positive. We can change the behavior and specify
  // theta2 to be negative in [-pi, 0] with opt_Theta2IsNegative.
  var signTheta2 = opt_theta2IsNegative ? -1 : 1;

  if (sinTheta2 > goog.vec.EPSILON) {
    euler[2] = Math.atan2(mat[2] * signTheta2, mat[5] * signTheta2);
    euler[1] = Math.atan2(sinTheta2 * signTheta2, mat[8]);
    euler[0] = Math.atan2(mat[6] * signTheta2, -mat[7] * signTheta2);
  } else {
    // There is also an arbitrary choice for theta1 = 0 or theta2 = 0 here.
    // We assume theta1 = 0 as some applications do not allow the camera to roll
    // (i.e. have theta1 != 0).
    euler[0] = 0;
    euler[1] = Math.atan2(sinTheta2 * signTheta2, mat[8]);
    euler[2] = Math.atan2(mat[1], mat[0]);
  }

  // Atan2 outputs angles in [-pi, pi] so we bring them back to [0, 2 * pi].
  euler[0] = (euler[0] + Math.PI * 2) % (Math.PI * 2);
  euler[2] = (euler[2] + Math.PI * 2) % (Math.PI * 2);
  // For theta2 we want the angle to be in [0, pi] or [-pi, 0] depending on
  // signTheta2.
  euler[1] = ((euler[1] * signTheta2 + Math.PI * 2) % (Math.PI * 2)) *
      signTheta2;

  return euler;
};
