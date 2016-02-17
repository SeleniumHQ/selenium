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
// Any edits to this file must be applied to mat4f.js by running:            //
//   swap_type.sh mat4d.js > mat4f.js                                        //
//                                                                           //
////////////////////////// NOTE ABOUT EDITING THIS FILE ///////////////////////


/**
 * @fileoverview Provides functions for operating on 4x4 double (64bit)
 * matrices.  The matrices are stored in column-major order.
 *
 * The last parameter will typically be the output matrix and an
 * object can be both an input and output parameter to all methods except
 * where noted.
 *
 * See the README for notes about the design and structure of the API
 * (especially related to performance).
 *
 */
goog.provide('goog.vec.mat4d');
goog.provide('goog.vec.mat4d.Type');

goog.require('goog.vec');
/** @suppress {extraRequire} */
goog.require('goog.vec.Quaternion');
goog.require('goog.vec.vec3d');
goog.require('goog.vec.vec4d');


/** @typedef {goog.vec.Float64} */ goog.vec.mat4d.Type;


/**
 * Creates a mat4d with all elements initialized to zero.
 *
 * @return {!goog.vec.mat4d.Type} The new mat4d.
 */
goog.vec.mat4d.create = function() {
  return new Float64Array(16);
};


/**
 * Creates a mat4d identity matrix.
 *
 * @return {!goog.vec.mat4d.Type} The new mat4d.
 */
goog.vec.mat4d.createIdentity = function() {
  var mat = goog.vec.mat4d.create();
  mat[0] = mat[5] = mat[10] = mat[15] = 1;
  return mat;
};


/**
 * Initializes the matrix from the set of values. Note the values supplied are
 * in column major order.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the
 *     values.
 * @param {number} v00 The values at (0, 0).
 * @param {number} v10 The values at (1, 0).
 * @param {number} v20 The values at (2, 0).
 * @param {number} v30 The values at (3, 0).
 * @param {number} v01 The values at (0, 1).
 * @param {number} v11 The values at (1, 1).
 * @param {number} v21 The values at (2, 1).
 * @param {number} v31 The values at (3, 1).
 * @param {number} v02 The values at (0, 2).
 * @param {number} v12 The values at (1, 2).
 * @param {number} v22 The values at (2, 2).
 * @param {number} v32 The values at (3, 2).
 * @param {number} v03 The values at (0, 3).
 * @param {number} v13 The values at (1, 3).
 * @param {number} v23 The values at (2, 3).
 * @param {number} v33 The values at (3, 3).
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setFromValues = function(
    mat, v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13,
    v23, v33) {
  mat[0] = v00;
  mat[1] = v10;
  mat[2] = v20;
  mat[3] = v30;
  mat[4] = v01;
  mat[5] = v11;
  mat[6] = v21;
  mat[7] = v31;
  mat[8] = v02;
  mat[9] = v12;
  mat[10] = v22;
  mat[11] = v32;
  mat[12] = v03;
  mat[13] = v13;
  mat[14] = v23;
  mat[15] = v33;
  return mat;
};


/**
 * Initializes mat4d mat from mat4d src.
 *
 * @param {!goog.vec.mat4d.Type} mat The destination matrix.
 * @param {!goog.vec.mat4d.Type} src The source matrix.
 * @return {!goog.vec.mat4d.Type} Return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setFromMat4d = function(mat, src) {
  mat[0] = src[0];
  mat[1] = src[1];
  mat[2] = src[2];
  mat[3] = src[3];
  mat[4] = src[4];
  mat[5] = src[5];
  mat[6] = src[6];
  mat[7] = src[7];
  mat[8] = src[8];
  mat[9] = src[9];
  mat[10] = src[10];
  mat[11] = src[11];
  mat[12] = src[12];
  mat[13] = src[13];
  mat[14] = src[14];
  mat[15] = src[15];
  return mat;
};


/**
 * Initializes mat4d mat from mat4f src (typed as a Float32Array to
 * avoid circular goog.requires).
 *
 * @param {!goog.vec.mat4d.Type} mat The destination matrix.
 * @param {Float32Array} src The source matrix.
 * @return {!goog.vec.mat4d.Type} Return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setFromMat4f = function(mat, src) {
  mat[0] = src[0];
  mat[1] = src[1];
  mat[2] = src[2];
  mat[3] = src[3];
  mat[4] = src[4];
  mat[5] = src[5];
  mat[6] = src[6];
  mat[7] = src[7];
  mat[8] = src[8];
  mat[9] = src[9];
  mat[10] = src[10];
  mat[11] = src[11];
  mat[12] = src[12];
  mat[13] = src[13];
  mat[14] = src[14];
  mat[15] = src[15];
  return mat;
};


/**
 * Initializes mat4d mat from Array src.
 *
 * @param {!goog.vec.mat4d.Type} mat The destination matrix.
 * @param {Array<number>} src The source matrix.
 * @return {!goog.vec.mat4d.Type} Return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setFromArray = function(mat, src) {
  mat[0] = src[0];
  mat[1] = src[1];
  mat[2] = src[2];
  mat[3] = src[3];
  mat[4] = src[4];
  mat[5] = src[5];
  mat[6] = src[6];
  mat[7] = src[7];
  mat[8] = src[8];
  mat[9] = src[9];
  mat[10] = src[10];
  mat[11] = src[11];
  mat[12] = src[12];
  mat[13] = src[13];
  mat[14] = src[14];
  mat[15] = src[15];
  return mat;
};


/**
 * Retrieves the element at the requested row and column.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix containing the value to
 *     retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @return {number} The element value at the requested row, column indices.
 */
goog.vec.mat4d.getElement = function(mat, row, column) {
  return mat[row + column * 4];
};


/**
 * Sets the element at the requested row and column.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix containing the value to
 *     retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @param {number} value The value to set at the requested row, column.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setElement = function(mat, row, column, value) {
  mat[row + column * 4] = value;
  return mat;
};


/**
 * Sets the diagonal values of the matrix from the given values.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the values.
 * @param {number} v00 The values for (0, 0).
 * @param {number} v11 The values for (1, 1).
 * @param {number} v22 The values for (2, 2).
 * @param {number} v33 The values for (3, 3).
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setDiagonalValues = function(mat, v00, v11, v22, v33) {
  mat[0] = v00;
  mat[5] = v11;
  mat[10] = v22;
  mat[15] = v33;
  return mat;
};


/**
 * Sets the diagonal values of the matrix from the given vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the values.
 * @param {!goog.vec.vec4d.Type} vec The vector containing the values.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setDiagonal = function(mat, vec) {
  mat[0] = vec[0];
  mat[5] = vec[1];
  mat[10] = vec[2];
  mat[15] = vec[3];
  return mat;
};


/**
 * Gets the diagonal values of the matrix into the given vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix containing the values.
 * @param {!goog.vec.vec4d.Type} vec The vector to receive the values.
 * @param {number=} opt_diagonal Which diagonal to get. A value of 0 selects the
 *     main diagonal, a positive number selects a super diagonal and a negative
 *     number selects a sub diagonal.
 * @return {!goog.vec.vec4d.Type} return vec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.getDiagonal = function(mat, vec, opt_diagonal) {
  if (!opt_diagonal) {
    // This is the most common case, so we avoid the for loop.
    vec[0] = mat[0];
    vec[1] = mat[5];
    vec[2] = mat[10];
    vec[3] = mat[15];
  } else {
    var offset = opt_diagonal > 0 ? 4 * opt_diagonal : -opt_diagonal;
    for (var i = 0; i < 4 - Math.abs(opt_diagonal); i++) {
      vec[i] = mat[offset + 5 * i];
    }
  }
  return vec;
};


/**
 * Sets the specified column with the supplied values.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to recieve the values.
 * @param {number} column The column index to set the values on.
 * @param {number} v0 The value for row 0.
 * @param {number} v1 The value for row 1.
 * @param {number} v2 The value for row 2.
 * @param {number} v3 The value for row 3.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setColumnValues = function(mat, column, v0, v1, v2, v3) {
  var i = column * 4;
  mat[i] = v0;
  mat[i + 1] = v1;
  mat[i + 2] = v2;
  mat[i + 3] = v3;
  return mat;
};


/**
 * Sets the specified column with the value from the supplied vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the values.
 * @param {number} column The column index to set the values on.
 * @param {!goog.vec.vec4d.Type} vec The vector of elements for the column.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setColumn = function(mat, column, vec) {
  var i = column * 4;
  mat[i] = vec[0];
  mat[i + 1] = vec[1];
  mat[i + 2] = vec[2];
  mat[i + 3] = vec[3];
  return mat;
};


/**
 * Retrieves the specified column from the matrix into the given vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the values.
 * @param {number} column The column to get the values from.
 * @param {!goog.vec.vec4d.Type} vec The vector of elements to
 *     receive the column.
 * @return {!goog.vec.vec4d.Type} return vec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.getColumn = function(mat, column, vec) {
  var i = column * 4;
  vec[0] = mat[i];
  vec[1] = mat[i + 1];
  vec[2] = mat[i + 2];
  vec[3] = mat[i + 3];
  return vec;
};


/**
 * Sets the columns of the matrix from the given vectors.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the values.
 * @param {!goog.vec.vec4d.Type} vec0 The values for column 0.
 * @param {!goog.vec.vec4d.Type} vec1 The values for column 1.
 * @param {!goog.vec.vec4d.Type} vec2 The values for column 2.
 * @param {!goog.vec.vec4d.Type} vec3 The values for column 3.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setColumns = function(mat, vec0, vec1, vec2, vec3) {
  mat[0] = vec0[0];
  mat[1] = vec0[1];
  mat[2] = vec0[2];
  mat[3] = vec0[3];
  mat[4] = vec1[0];
  mat[5] = vec1[1];
  mat[6] = vec1[2];
  mat[7] = vec1[3];
  mat[8] = vec2[0];
  mat[9] = vec2[1];
  mat[10] = vec2[2];
  mat[11] = vec2[3];
  mat[12] = vec3[0];
  mat[13] = vec3[1];
  mat[14] = vec3[2];
  mat[15] = vec3[3];
  return mat;
};


/**
 * Retrieves the column values from the given matrix into the given vectors.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the columns.
 * @param {!goog.vec.vec4d.Type} vec0 The vector to receive column 0.
 * @param {!goog.vec.vec4d.Type} vec1 The vector to receive column 1.
 * @param {!goog.vec.vec4d.Type} vec2 The vector to receive column 2.
 * @param {!goog.vec.vec4d.Type} vec3 The vector to receive column 3.
 */
goog.vec.mat4d.getColumns = function(mat, vec0, vec1, vec2, vec3) {
  vec0[0] = mat[0];
  vec0[1] = mat[1];
  vec0[2] = mat[2];
  vec0[3] = mat[3];
  vec1[0] = mat[4];
  vec1[1] = mat[5];
  vec1[2] = mat[6];
  vec1[3] = mat[7];
  vec2[0] = mat[8];
  vec2[1] = mat[9];
  vec2[2] = mat[10];
  vec2[3] = mat[11];
  vec3[0] = mat[12];
  vec3[1] = mat[13];
  vec3[2] = mat[14];
  vec3[3] = mat[15];
};


/**
 * Sets the row values from the supplied values.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the values.
 * @param {number} row The index of the row to receive the values.
 * @param {number} v0 The value for column 0.
 * @param {number} v1 The value for column 1.
 * @param {number} v2 The value for column 2.
 * @param {number} v3 The value for column 3.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setRowValues = function(mat, row, v0, v1, v2, v3) {
  mat[row] = v0;
  mat[row + 4] = v1;
  mat[row + 8] = v2;
  mat[row + 12] = v3;
  return mat;
};


/**
 * Sets the row values from the supplied vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the row values.
 * @param {number} row The index of the row.
 * @param {!goog.vec.vec4d.Type} vec The vector containing the values.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setRow = function(mat, row, vec) {
  mat[row] = vec[0];
  mat[row + 4] = vec[1];
  mat[row + 8] = vec[2];
  mat[row + 12] = vec[3];
  return mat;
};


/**
 * Retrieves the row values into the given vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the values.
 * @param {number} row The index of the row supplying the values.
 * @param {!goog.vec.vec4d.Type} vec The vector to receive the row.
 * @return {!goog.vec.vec4d.Type} return vec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.getRow = function(mat, row, vec) {
  vec[0] = mat[row];
  vec[1] = mat[row + 4];
  vec[2] = mat[row + 8];
  vec[3] = mat[row + 12];
  return vec;
};


/**
 * Sets the rows of the matrix from the supplied vectors.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to receive the values.
 * @param {!goog.vec.vec4d.Type} vec0 The values for row 0.
 * @param {!goog.vec.vec4d.Type} vec1 The values for row 1.
 * @param {!goog.vec.vec4d.Type} vec2 The values for row 2.
 * @param {!goog.vec.vec4d.Type} vec3 The values for row 3.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.setRows = function(mat, vec0, vec1, vec2, vec3) {
  mat[0] = vec0[0];
  mat[1] = vec1[0];
  mat[2] = vec2[0];
  mat[3] = vec3[0];
  mat[4] = vec0[1];
  mat[5] = vec1[1];
  mat[6] = vec2[1];
  mat[7] = vec3[1];
  mat[8] = vec0[2];
  mat[9] = vec1[2];
  mat[10] = vec2[2];
  mat[11] = vec3[2];
  mat[12] = vec0[3];
  mat[13] = vec1[3];
  mat[14] = vec2[3];
  mat[15] = vec3[3];
  return mat;
};


/**
 * Retrieves the rows of the matrix into the supplied vectors.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to supply the values.
 * @param {!goog.vec.vec4d.Type} vec0 The vector to receive row 0.
 * @param {!goog.vec.vec4d.Type} vec1 The vector to receive row 1.
 * @param {!goog.vec.vec4d.Type} vec2 The vector to receive row 2.
 * @param {!goog.vec.vec4d.Type} vec3 The vector to receive row 3.
 */
goog.vec.mat4d.getRows = function(mat, vec0, vec1, vec2, vec3) {
  vec0[0] = mat[0];
  vec1[0] = mat[1];
  vec2[0] = mat[2];
  vec3[0] = mat[3];
  vec0[1] = mat[4];
  vec1[1] = mat[5];
  vec2[1] = mat[6];
  vec3[1] = mat[7];
  vec0[2] = mat[8];
  vec1[2] = mat[9];
  vec2[2] = mat[10];
  vec3[2] = mat[11];
  vec0[3] = mat[12];
  vec1[3] = mat[13];
  vec2[3] = mat[14];
  vec3[3] = mat[15];
};


/**
 * Makes the given 4x4 matrix the zero matrix.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @return {!goog.vec.mat4d.Type} return mat so operations can be chained.
 */
goog.vec.mat4d.makeZero = function(mat) {
  mat[0] = 0;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = 0;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 0;
  return mat;
};


/**
 * Makes the given 4x4 matrix the identity matrix.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @return {!goog.vec.mat4d.Type} return mat so operations can be chained.
 */
goog.vec.mat4d.makeIdentity = function(mat) {
  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = 1;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = 1;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;
  return mat;
};


/**
 * Performs a per-component addition of the matrix mat0 and mat1, storing
 * the result into resultMat.
 *
 * @param {!goog.vec.mat4d.Type} mat0 The first addend.
 * @param {!goog.vec.mat4d.Type} mat1 The second addend.
 * @param {!goog.vec.mat4d.Type} resultMat The matrix to
 *     receive the results (may be either mat0 or mat1).
 * @return {!goog.vec.mat4d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.addMat = function(mat0, mat1, resultMat) {
  resultMat[0] = mat0[0] + mat1[0];
  resultMat[1] = mat0[1] + mat1[1];
  resultMat[2] = mat0[2] + mat1[2];
  resultMat[3] = mat0[3] + mat1[3];
  resultMat[4] = mat0[4] + mat1[4];
  resultMat[5] = mat0[5] + mat1[5];
  resultMat[6] = mat0[6] + mat1[6];
  resultMat[7] = mat0[7] + mat1[7];
  resultMat[8] = mat0[8] + mat1[8];
  resultMat[9] = mat0[9] + mat1[9];
  resultMat[10] = mat0[10] + mat1[10];
  resultMat[11] = mat0[11] + mat1[11];
  resultMat[12] = mat0[12] + mat1[12];
  resultMat[13] = mat0[13] + mat1[13];
  resultMat[14] = mat0[14] + mat1[14];
  resultMat[15] = mat0[15] + mat1[15];
  return resultMat;
};


/**
 * Performs a per-component subtraction of the matrix mat0 and mat1,
 * storing the result into resultMat.
 *
 * @param {!goog.vec.mat4d.Type} mat0 The minuend.
 * @param {!goog.vec.mat4d.Type} mat1 The subtrahend.
 * @param {!goog.vec.mat4d.Type} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {!goog.vec.mat4d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.subMat = function(mat0, mat1, resultMat) {
  resultMat[0] = mat0[0] - mat1[0];
  resultMat[1] = mat0[1] - mat1[1];
  resultMat[2] = mat0[2] - mat1[2];
  resultMat[3] = mat0[3] - mat1[3];
  resultMat[4] = mat0[4] - mat1[4];
  resultMat[5] = mat0[5] - mat1[5];
  resultMat[6] = mat0[6] - mat1[6];
  resultMat[7] = mat0[7] - mat1[7];
  resultMat[8] = mat0[8] - mat1[8];
  resultMat[9] = mat0[9] - mat1[9];
  resultMat[10] = mat0[10] - mat1[10];
  resultMat[11] = mat0[11] - mat1[11];
  resultMat[12] = mat0[12] - mat1[12];
  resultMat[13] = mat0[13] - mat1[13];
  resultMat[14] = mat0[14] - mat1[14];
  resultMat[15] = mat0[15] - mat1[15];
  return resultMat;
};


/**
 * Multiplies matrix mat with the given scalar, storing the result
 * into resultMat.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} scalar The scalar value to multiply to each element of mat.
 * @param {!goog.vec.mat4d.Type} resultMat The matrix to receive
 *     the results (may be mat).
 * @return {!goog.vec.mat4d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.multScalar = function(mat, scalar, resultMat) {
  resultMat[0] = mat[0] * scalar;
  resultMat[1] = mat[1] * scalar;
  resultMat[2] = mat[2] * scalar;
  resultMat[3] = mat[3] * scalar;
  resultMat[4] = mat[4] * scalar;
  resultMat[5] = mat[5] * scalar;
  resultMat[6] = mat[6] * scalar;
  resultMat[7] = mat[7] * scalar;
  resultMat[8] = mat[8] * scalar;
  resultMat[9] = mat[9] * scalar;
  resultMat[10] = mat[10] * scalar;
  resultMat[11] = mat[11] * scalar;
  resultMat[12] = mat[12] * scalar;
  resultMat[13] = mat[13] * scalar;
  resultMat[14] = mat[14] * scalar;
  resultMat[15] = mat[15] * scalar;
  return resultMat;
};


/**
 * Multiplies the two matrices mat0 and mat1 using matrix multiplication,
 * storing the result into resultMat.
 *
 * @param {!goog.vec.mat4d.Type} mat0 The first (left hand) matrix.
 * @param {!goog.vec.mat4d.Type} mat1 The second (right hand) matrix.
 * @param {!goog.vec.mat4d.Type} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {!goog.vec.mat4d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.multMat = function(mat0, mat1, resultMat) {
  var a00 = mat0[0], a10 = mat0[1], a20 = mat0[2], a30 = mat0[3];
  var a01 = mat0[4], a11 = mat0[5], a21 = mat0[6], a31 = mat0[7];
  var a02 = mat0[8], a12 = mat0[9], a22 = mat0[10], a32 = mat0[11];
  var a03 = mat0[12], a13 = mat0[13], a23 = mat0[14], a33 = mat0[15];

  var b00 = mat1[0], b10 = mat1[1], b20 = mat1[2], b30 = mat1[3];
  var b01 = mat1[4], b11 = mat1[5], b21 = mat1[6], b31 = mat1[7];
  var b02 = mat1[8], b12 = mat1[9], b22 = mat1[10], b32 = mat1[11];
  var b03 = mat1[12], b13 = mat1[13], b23 = mat1[14], b33 = mat1[15];

  resultMat[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
  resultMat[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
  resultMat[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
  resultMat[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;

  resultMat[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
  resultMat[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
  resultMat[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
  resultMat[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;

  resultMat[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
  resultMat[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
  resultMat[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
  resultMat[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;

  resultMat[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
  resultMat[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
  resultMat[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
  resultMat[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
  return resultMat;
};


/**
 * Transposes the given matrix mat storing the result into resultMat.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to transpose.
 * @param {!goog.vec.mat4d.Type} resultMat The matrix to receive
 *     the results (may be mat).
 * @return {!goog.vec.mat4d.Type} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.mat4d.transpose = function(mat, resultMat) {
  if (resultMat == mat) {
    var a10 = mat[1], a20 = mat[2], a30 = mat[3];
    var a21 = mat[6], a31 = mat[7];
    var a32 = mat[11];
    resultMat[1] = mat[4];
    resultMat[2] = mat[8];
    resultMat[3] = mat[12];
    resultMat[4] = a10;
    resultMat[6] = mat[9];
    resultMat[7] = mat[13];
    resultMat[8] = a20;
    resultMat[9] = a21;
    resultMat[11] = mat[14];
    resultMat[12] = a30;
    resultMat[13] = a31;
    resultMat[14] = a32;
  } else {
    resultMat[0] = mat[0];
    resultMat[1] = mat[4];
    resultMat[2] = mat[8];
    resultMat[3] = mat[12];

    resultMat[4] = mat[1];
    resultMat[5] = mat[5];
    resultMat[6] = mat[9];
    resultMat[7] = mat[13];

    resultMat[8] = mat[2];
    resultMat[9] = mat[6];
    resultMat[10] = mat[10];
    resultMat[11] = mat[14];

    resultMat[12] = mat[3];
    resultMat[13] = mat[7];
    resultMat[14] = mat[11];
    resultMat[15] = mat[15];
  }
  return resultMat;
};


/**
 * Computes the determinant of the matrix.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to compute the matrix for.
 * @return {number} The determinant of the matrix.
 */
goog.vec.mat4d.determinant = function(mat) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];
  var m03 = mat[12], m13 = mat[13], m23 = mat[14], m33 = mat[15];

  var a0 = m00 * m11 - m10 * m01;
  var a1 = m00 * m21 - m20 * m01;
  var a2 = m00 * m31 - m30 * m01;
  var a3 = m10 * m21 - m20 * m11;
  var a4 = m10 * m31 - m30 * m11;
  var a5 = m20 * m31 - m30 * m21;
  var b0 = m02 * m13 - m12 * m03;
  var b1 = m02 * m23 - m22 * m03;
  var b2 = m02 * m33 - m32 * m03;
  var b3 = m12 * m23 - m22 * m13;
  var b4 = m12 * m33 - m32 * m13;
  var b5 = m22 * m33 - m32 * m23;

  return a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
};


/**
 * Computes the inverse of mat storing the result into resultMat. If the
 * inverse is defined, this function returns true, false otherwise.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix to invert.
 * @param {!goog.vec.mat4d.Type} resultMat The matrix to receive
 *     the result (may be mat).
 * @return {boolean} True if the inverse is defined. If false is returned,
 *     resultMat is not modified.
 */
goog.vec.mat4d.invert = function(mat, resultMat) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];
  var m03 = mat[12], m13 = mat[13], m23 = mat[14], m33 = mat[15];

  var a0 = m00 * m11 - m10 * m01;
  var a1 = m00 * m21 - m20 * m01;
  var a2 = m00 * m31 - m30 * m01;
  var a3 = m10 * m21 - m20 * m11;
  var a4 = m10 * m31 - m30 * m11;
  var a5 = m20 * m31 - m30 * m21;
  var b0 = m02 * m13 - m12 * m03;
  var b1 = m02 * m23 - m22 * m03;
  var b2 = m02 * m33 - m32 * m03;
  var b3 = m12 * m23 - m22 * m13;
  var b4 = m12 * m33 - m32 * m13;
  var b5 = m22 * m33 - m32 * m23;

  var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
  if (det == 0) {
    return false;
  }

  var idet = 1.0 / det;
  resultMat[0] = (m11 * b5 - m21 * b4 + m31 * b3) * idet;
  resultMat[1] = (-m10 * b5 + m20 * b4 - m30 * b3) * idet;
  resultMat[2] = (m13 * a5 - m23 * a4 + m33 * a3) * idet;
  resultMat[3] = (-m12 * a5 + m22 * a4 - m32 * a3) * idet;
  resultMat[4] = (-m01 * b5 + m21 * b2 - m31 * b1) * idet;
  resultMat[5] = (m00 * b5 - m20 * b2 + m30 * b1) * idet;
  resultMat[6] = (-m03 * a5 + m23 * a2 - m33 * a1) * idet;
  resultMat[7] = (m02 * a5 - m22 * a2 + m32 * a1) * idet;
  resultMat[8] = (m01 * b4 - m11 * b2 + m31 * b0) * idet;
  resultMat[9] = (-m00 * b4 + m10 * b2 - m30 * b0) * idet;
  resultMat[10] = (m03 * a4 - m13 * a2 + m33 * a0) * idet;
  resultMat[11] = (-m02 * a4 + m12 * a2 - m32 * a0) * idet;
  resultMat[12] = (-m01 * b3 + m11 * b1 - m21 * b0) * idet;
  resultMat[13] = (m00 * b3 - m10 * b1 + m20 * b0) * idet;
  resultMat[14] = (-m03 * a3 + m13 * a1 - m23 * a0) * idet;
  resultMat[15] = (m02 * a3 - m12 * a1 + m22 * a0) * idet;
  return true;
};


/**
 * Returns true if the components of mat0 are equal to the components of mat1.
 *
 * @param {!goog.vec.mat4d.Type} mat0 The first matrix.
 * @param {!goog.vec.mat4d.Type} mat1 The second matrix.
 * @return {boolean} True if the the two matrices are equivalent.
 */
goog.vec.mat4d.equals = function(mat0, mat1) {
  return mat0.length == mat1.length && mat0[0] == mat1[0] &&
      mat0[1] == mat1[1] && mat0[2] == mat1[2] && mat0[3] == mat1[3] &&
      mat0[4] == mat1[4] && mat0[5] == mat1[5] && mat0[6] == mat1[6] &&
      mat0[7] == mat1[7] && mat0[8] == mat1[8] && mat0[9] == mat1[9] &&
      mat0[10] == mat1[10] && mat0[11] == mat1[11] && mat0[12] == mat1[12] &&
      mat0[13] == mat1[13] && mat0[14] == mat1[14] && mat0[15] == mat1[15];
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec. The input vector is multiplied against the
 * upper 3x4 matrix omitting the projective component.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the transformation.
 * @param {!goog.vec.vec3d.Type} vec The 3 element vector to transform.
 * @param {!goog.vec.vec3d.Type} resultVec The 3 element vector to
 *     receive the results (may be vec).
 * @return {!goog.vec.vec3d.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.multVec3 = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2];
  resultVec[0] = x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
  resultVec[1] = x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
  resultVec[2] = x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
  return resultVec;
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec. The input vector is multiplied against the
 * upper 3x3 matrix omitting the projective component and translation
 * components.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the transformation.
 * @param {!goog.vec.vec3d.Type} vec The 3 element vector to transform.
 * @param {!goog.vec.vec3d.Type} resultVec The 3 element vector to
 *     receive the results (may be vec).
 * @return {!goog.vec.vec3d.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.multVec3NoTranslate = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2];
  resultVec[0] = x * mat[0] + y * mat[4] + z * mat[8];
  resultVec[1] = x * mat[1] + y * mat[5] + z * mat[9];
  resultVec[2] = x * mat[2] + y * mat[6] + z * mat[10];
  return resultVec;
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec. The input vector is multiplied against the
 * full 4x4 matrix with the homogeneous divide applied to reduce the 4 element
 * vector to a 3 element vector.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the transformation.
 * @param {!goog.vec.vec3d.Type} vec The 3 element vector to transform.
 * @param {!goog.vec.vec3d.Type} resultVec The 3 element vector
 *     to receive the results (may be vec).
 * @return {!goog.vec.vec3d.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.multVec3Projective = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2];
  var invw = 1 / (x * mat[3] + y * mat[7] + z * mat[11] + mat[15]);
  resultVec[0] = (x * mat[0] + y * mat[4] + z * mat[8] + mat[12]) * invw;
  resultVec[1] = (x * mat[1] + y * mat[5] + z * mat[9] + mat[13]) * invw;
  resultVec[2] = (x * mat[2] + y * mat[6] + z * mat[10] + mat[14]) * invw;
  return resultVec;
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix supplying the transformation.
 * @param {!goog.vec.vec4d.Type} vec The vector to transform.
 * @param {!goog.vec.vec4d.Type} resultVec The vector to
 *     receive the results (may be vec).
 * @return {!goog.vec.vec4d.Type} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.mat4d.multVec4 = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
  resultVec[0] = x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12];
  resultVec[1] = x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13];
  resultVec[2] = x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14];
  resultVec[3] = x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15];
  return resultVec;
};


/**
 * Makes the given 4x4 matrix a translation matrix with x, y and z
 * translation factors.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} x The translation along the x axis.
 * @param {number} y The translation along the y axis.
 * @param {number} z The translation along the z axis.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeTranslate = function(mat, x, y, z) {
  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = 1;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = 1;
  mat[11] = 0;
  mat[12] = x;
  mat[13] = y;
  mat[14] = z;
  mat[15] = 1;
  return mat;
};


/**
 * Makes the given 4x4 matrix as a scale matrix with x, y and z scale factors.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} x The scale along the x axis.
 * @param {number} y The scale along the y axis.
 * @param {number} z The scale along the z axis.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeScale = function(mat, x, y, z) {
  mat[0] = x;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = y;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = z;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;
  return mat;
};


/**
 * Makes the given 4x4 matrix a rotation matrix with the given rotation
 * angle about the axis defined by the vector (ax, ay, az).
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @param {number} ax The x component of the rotation axis.
 * @param {number} ay The y component of the rotation axis.
 * @param {number} az The z component of the rotation axis.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotate = function(mat, angle, ax, ay, az) {
  var c = Math.cos(angle);
  var d = 1 - c;
  var s = Math.sin(angle);

  mat[0] = ax * ax * d + c;
  mat[1] = ax * ay * d + az * s;
  mat[2] = ax * az * d - ay * s;
  mat[3] = 0;
  mat[4] = ax * ay * d - az * s;
  mat[5] = ay * ay * d + c;
  mat[6] = ay * az * d + ax * s;
  mat[7] = 0;
  mat[8] = ax * az * d + ay * s;
  mat[9] = ay * az * d - ax * s;
  mat[10] = az * az * d + c;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;

  return mat;
};


/**
 * Makes the given 4x4 matrix a rotation matrix with the given rotation
 * angle about the X axis.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotateX = function(mat, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = c;
  mat[6] = s;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = -s;
  mat[10] = c;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;

  return mat;
};


/**
 * Makes the given 4x4 matrix a rotation matrix with the given rotation
 * angle about the Y axis.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotateY = function(mat, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = c;
  mat[1] = 0;
  mat[2] = -s;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = 1;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = s;
  mat[9] = 0;
  mat[10] = c;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;

  return mat;
};


/**
 * Makes the given 4x4 matrix a rotation matrix with the given rotation
 * angle about the Z axis.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The rotation angle in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotateZ = function(mat, angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = c;
  mat[1] = s;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = -s;
  mat[5] = c;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = 1;
  mat[11] = 0;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;

  return mat;
};


/**
 * Creates a matrix from a quaternion rotation and vector translation.
 *
 * This is a specialization of makeRotationTranslationScaleOrigin.
 *
 * This is equivalent to, but faster than:
 *     goog.vec.mat4d.makeIdentity(m);
 *     goog.vec.mat4d.translate(m, tx, ty, tz);
 *     goog.vec.mat4d.rotate(m, theta, rx, ry, rz);
 * and:
 *     goog.vec.Quaternion.toRotationMatrix4(rotation, mat);
 *     mat[12] = translation[0];
 *     mat[13] = translation[1];
 *     mat[14] = translation[2];
 * See http://jsperf.com/goog-vec-makerotationtranslation2 .
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {!goog.vec.Quaternion.AnyType} rotation The quaternion rotation.
 *     Note: this quaternion is assumed to already be normalized.
 * @param {!goog.vec.vec3d.Type} translation The vector translation.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotationTranslation = function(mat, rotation, translation) {
  // Quaternion math
  var x = rotation[0], y = rotation[1], z = rotation[2], w = rotation[3];
  var x2 = 2 * x, y2 = 2 * y, z2 = 2 * z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;

  mat[0] = 1 - (yy + zz);
  mat[1] = xy + wz;
  mat[2] = xz - wy;
  mat[3] = 0;
  mat[4] = xy - wz;
  mat[5] = 1 - (xx + zz);
  mat[6] = yz + wx;
  mat[7] = 0;
  mat[8] = xz + wy;
  mat[9] = yz - wx;
  mat[10] = 1 - (xx + yy);
  mat[11] = 0;
  mat[12] = translation[0];
  mat[13] = translation[1];
  mat[14] = translation[2];
  mat[15] = 1;
  return mat;
};


/**
 * Creates a matrix from a quaternion rotation, vector translation, and
 * vector scale.
 *
 * This is a specialization of makeRotationTranslationScaleOrigin.
 *
 * This is equivalent to, but faster than:
 *     goog.vec.mat4d.makeIdentity(m);
 *     goog.vec.mat4d.translate(m, tx, ty, tz);
 *     goog.vec.mat4d.rotate(m, theta, rx, ry, rz);
 *     goog.vec.mat4d.scale(m, sx, sy, sz);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {!goog.vec.Quaternion.AnyType} rotation The quaternion rotation.
 *     Note: this quaternion is assumed to already be normalized.
 * @param {!goog.vec.vec3d.Type} translation The vector translation.
 * @param {!goog.vec.vec3d.Type} scale The vector scale.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotationTranslationScale = function(
    mat, rotation, translation, scale) {
  // Quaternion math
  var x = rotation[0], y = rotation[1], z = rotation[2], w = rotation[3];
  var x2 = 2 * x, y2 = 2 * y, z2 = 2 * z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = scale[0];
  var sy = scale[1];
  var sz = scale[2];

  mat[0] = (1 - (yy + zz)) * sx;
  mat[1] = (xy + wz) * sx;
  mat[2] = (xz - wy) * sx;
  mat[3] = 0;
  mat[4] = (xy - wz) * sy;
  mat[5] = (1 - (xx + zz)) * sy;
  mat[6] = (yz + wx) * sy;
  mat[7] = 0;
  mat[8] = (xz + wy) * sz;
  mat[9] = (yz - wx) * sz;
  mat[10] = (1 - (xx + yy)) * sz;
  mat[11] = 0;
  mat[12] = translation[0];
  mat[13] = translation[1];
  mat[14] = translation[2];
  mat[15] = 1;
  return mat;
};


/**
 * Creates a matrix from a quaternion rotation, vector translation, and
 * vector scale, rotating and scaling about the given origin.
 *
 * This is equivalent to, but faster than:
 *     goog.vec.mat4d.makeIdentity(m);
 *     goog.vec.mat4d.translate(m, tx, ty, tz);
 *     goog.vec.mat4d.translate(m, ox, oy, oz);
 *     goog.vec.mat4d.rotate(m, theta, rx, ry, rz);
 *     goog.vec.mat4d.scale(m, sx, sy, sz);
 *     goog.vec.mat4d.translate(m, -ox, -oy, -oz);
 * See http://jsperf.com/glmatrix-matrix-variant-test/3 for performance
 * results of a similar function in the glmatrix library.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {!goog.vec.Quaternion.AnyType} rotation The quaternion rotation.
 *     Note: this quaternion is assumed to already be normalized.
 * @param {!goog.vec.vec3d.Type} translation The vector translation.
 * @param {!goog.vec.vec3d.Type} scale The vector scale.
 * @param {!goog.vec.vec3d.Type} origin The origin about which to scale and
 *     rotate.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeRotationTranslationScaleOrigin = function(
    mat, rotation, translation, scale, origin) {
  // Quaternion math
  var x = rotation[0], y = rotation[1], z = rotation[2], w = rotation[3];
  var x2 = 2 * x, y2 = 2 * y, z2 = 2 * z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = scale[0];
  var sy = scale[1];
  var sz = scale[2];
  var ox = origin[0];
  var oy = origin[1];
  var oz = origin[2];

  mat[0] = (1 - (yy + zz)) * sx;
  mat[1] = (xy + wz) * sx;
  mat[2] = (xz - wy) * sx;
  mat[3] = 0;
  mat[4] = (xy - wz) * sy;
  mat[5] = (1 - (xx + zz)) * sy;
  mat[6] = (yz + wx) * sy;
  mat[7] = 0;
  mat[8] = (xz + wy) * sz;
  mat[9] = (yz - wx) * sz;
  mat[10] = (1 - (xx + yy)) * sz;
  mat[11] = 0;
  mat[12] = translation[0] + ox - (mat[0] * ox + mat[4] * oy + mat[8] * oz);
  mat[13] = translation[1] + oy - (mat[1] * ox + mat[5] * oy + mat[9] * oz);
  mat[14] = translation[2] + oz - (mat[2] * ox + mat[6] * oy + mat[10] * oz);
  mat[15] = 1;
  return mat;
};


/**
 * Makes the given 4x4 matrix a perspective projection matrix.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} left The coordinate of the left clipping plane.
 * @param {number} right The coordinate of the right clipping plane.
 * @param {number} bottom The coordinate of the bottom clipping plane.
 * @param {number} top The coordinate of the top clipping plane.
 * @param {number} near The distance to the near clipping plane.
 * @param {number} far The distance to the far clipping plane.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeFrustum = function(
    mat, left, right, bottom, top, near, far) {
  var x = (2 * near) / (right - left);
  var y = (2 * near) / (top - bottom);
  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);
  var d = -(2 * far * near) / (far - near);

  mat[0] = x;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = y;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = a;
  mat[9] = b;
  mat[10] = c;
  mat[11] = -1;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = d;
  mat[15] = 0;

  return mat;
};


/**
 * Makse the given 4x4 matrix  perspective projection matrix given a
 * field of view and aspect ratio.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} fovy The field of view along the y (vertical) axis in
 *     radians.
 * @param {number} aspect The x (width) to y (height) aspect ratio.
 * @param {number} near The distance to the near clipping plane.
 * @param {number} far The distance to the far clipping plane.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makePerspective = function(mat, fovy, aspect, near, far) {
  var angle = fovy / 2;
  var dz = far - near;
  var sinAngle = Math.sin(angle);
  if (dz == 0 || sinAngle == 0 || aspect == 0) {
    return mat;
  }

  var cot = Math.cos(angle) / sinAngle;

  mat[0] = cot / aspect;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = cot;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = -(far + near) / dz;
  mat[11] = -1;
  mat[12] = 0;
  mat[13] = 0;
  mat[14] = -(2 * near * far) / dz;
  mat[15] = 0;

  return mat;
};


/**
 * Makes the given 4x4 matrix an orthographic projection matrix.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} left The coordinate of the left clipping plane.
 * @param {number} right The coordinate of the right clipping plane.
 * @param {number} bottom The coordinate of the bottom clipping plane.
 * @param {number} top The coordinate of the top clipping plane.
 * @param {number} near The distance to the near clipping plane.
 * @param {number} far The distance to the far clipping plane.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeOrtho = function(mat, left, right, bottom, top, near, far) {
  var x = 2 / (right - left);
  var y = 2 / (top - bottom);
  var z = -2 / (far - near);
  var a = -(right + left) / (right - left);
  var b = -(top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);

  mat[0] = x;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = y;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
  mat[9] = 0;
  mat[10] = z;
  mat[11] = 0;
  mat[12] = a;
  mat[13] = b;
  mat[14] = c;
  mat[15] = 1;

  return mat;
};


/**
 * Makes the given 4x4 matrix a modelview matrix of a camera so that
 * the camera is 'looking at' the given center point.
 *
 * Note that unlike most other goog.vec functions where we inline
 * everything, this function does not inline various goog.vec
 * functions.  This makes the code more readable, but somewhat
 * less efficient.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {!goog.vec.vec3d.Type} eyePt The position of the eye point
 *     (camera origin).
 * @param {!goog.vec.vec3d.Type} centerPt The point to aim the camera at.
 * @param {!goog.vec.vec3d.Type} worldUpVec The vector that identifies
 *     the up direction for the camera.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeLookAt = function(mat, eyePt, centerPt, worldUpVec) {
  // Compute the direction vector from the eye point to the center point and
  // normalize.
  var fwdVec = goog.vec.mat4d.tmpvec4d_[0];
  goog.vec.vec3d.subtract(centerPt, eyePt, fwdVec);
  goog.vec.vec3d.normalize(fwdVec, fwdVec);
  fwdVec[3] = 0;

  // Compute the side vector from the forward vector and the input up vector.
  var sideVec = goog.vec.mat4d.tmpvec4d_[1];
  goog.vec.vec3d.cross(fwdVec, worldUpVec, sideVec);
  goog.vec.vec3d.normalize(sideVec, sideVec);
  sideVec[3] = 0;

  // Now the up vector to form the orthonormal basis.
  var upVec = goog.vec.mat4d.tmpvec4d_[2];
  goog.vec.vec3d.cross(sideVec, fwdVec, upVec);
  goog.vec.vec3d.normalize(upVec, upVec);
  upVec[3] = 0;

  // Update the view matrix with the new orthonormal basis and position the
  // camera at the given eye point.
  goog.vec.vec3d.negate(fwdVec, fwdVec);
  goog.vec.mat4d.setRow(mat, 0, sideVec);
  goog.vec.mat4d.setRow(mat, 1, upVec);
  goog.vec.mat4d.setRow(mat, 2, fwdVec);
  goog.vec.mat4d.setRowValues(mat, 3, 0, 0, 0, 1);
  goog.vec.mat4d.translate(mat, -eyePt[0], -eyePt[1], -eyePt[2]);

  return mat;
};


/**
 * Decomposes a matrix into the lookAt vectors eyePt, fwdVec and worldUpVec.
 * The matrix represents the modelview matrix of a camera. It is the inverse
 * of lookAt except for the output of the fwdVec instead of centerPt.
 * The centerPt itself cannot be recovered from a modelview matrix.
 *
 * Note that unlike most other goog.vec functions where we inline
 * everything, this function does not inline various goog.vec
 * functions.  This makes the code more readable, but somewhat
 * less efficient.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {!goog.vec.vec3d.Type} eyePt The position of the eye point
 *     (camera origin).
 * @param {!goog.vec.vec3d.Type} fwdVec The vector describing where
 *     the camera points to.
 * @param {!goog.vec.vec3d.Type} worldUpVec The vector that
 *     identifies the up direction for the camera.
 * @return {boolean} True if the method succeeds, false otherwise.
 *     The method can only fail if the inverse of viewMatrix is not defined.
 */
goog.vec.mat4d.toLookAt = function(mat, eyePt, fwdVec, worldUpVec) {
  // Get eye of the camera.
  var matInverse = goog.vec.mat4d.tmpmat4d_[0];
  if (!goog.vec.mat4d.invert(mat, matInverse)) {
    // The input matrix does not have a valid inverse.
    return false;
  }

  if (eyePt) {
    eyePt[0] = matInverse[12];
    eyePt[1] = matInverse[13];
    eyePt[2] = matInverse[14];
  }

  // Get forward vector from the definition of lookAt.
  if (fwdVec || worldUpVec) {
    if (!fwdVec) {
      fwdVec = goog.vec.mat4d.tmpvec3d_[0];
    }
    fwdVec[0] = -mat[2];
    fwdVec[1] = -mat[6];
    fwdVec[2] = -mat[10];
    // Normalize forward vector.
    goog.vec.vec3d.normalize(fwdVec, fwdVec);
  }

  if (worldUpVec) {
    // Get side vector from the definition of gluLookAt.
    var side = goog.vec.mat4d.tmpvec3d_[1];
    side[0] = mat[0];
    side[1] = mat[4];
    side[2] = mat[8];
    // Compute up vector as a up = side x forward.
    goog.vec.vec3d.cross(side, fwdVec, worldUpVec);
    // Normalize up vector.
    goog.vec.vec3d.normalize(worldUpVec, worldUpVec);
  }
  return true;
};


/**
 * Makes the given 4x4 matrix a rotation matrix given Euler angles using
 * the ZXZ convention.
 * Given the euler angles [theta1, theta2, theta3], the rotation is defined as
 * rotation = rotation_z(theta1) * rotation_x(theta2) * rotation_z(theta3),
 * with theta1 in [0, 2 * pi], theta2 in [0, pi] and theta3 in [0, 2 * pi].
 * rotation_x(theta) means rotation around the X axis of theta radians,
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} theta1 The angle of rotation around the Z axis in radians.
 * @param {number} theta2 The angle of rotation around the X axis in radians.
 * @param {number} theta3 The angle of rotation around the Z axis in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.makeEulerZXZ = function(mat, theta1, theta2, theta3) {
  var c1 = Math.cos(theta1);
  var s1 = Math.sin(theta1);

  var c2 = Math.cos(theta2);
  var s2 = Math.sin(theta2);

  var c3 = Math.cos(theta3);
  var s3 = Math.sin(theta3);

  mat[0] = c1 * c3 - c2 * s1 * s3;
  mat[1] = c2 * c1 * s3 + c3 * s1;
  mat[2] = s3 * s2;
  mat[3] = 0;

  mat[4] = -c1 * s3 - c3 * c2 * s1;
  mat[5] = c1 * c2 * c3 - s1 * s3;
  mat[6] = c3 * s2;
  mat[7] = 0;

  mat[8] = s2 * s1;
  mat[9] = -c1 * s2;
  mat[10] = c2;
  mat[11] = 0;

  mat[12] = 0;
  mat[13] = 0;
  mat[14] = 0;
  mat[15] = 1;

  return mat;
};


/**
 * Decomposes a rotation matrix into Euler angles using the ZXZ convention so
 * that rotation = rotation_z(theta1) * rotation_x(theta2) * rotation_z(theta3),
 * with theta1 in [0, 2 * pi], theta2 in [0, pi] and theta3 in [0, 2 * pi].
 * rotation_x(theta) means rotation around the X axis of theta radians.
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {!goog.vec.vec3d.Type} euler The ZXZ Euler angles in
 *     radians as [theta1, theta2, theta3].
 * @param {boolean=} opt_theta2IsNegative Whether theta2 is in [-pi, 0] instead
 *     of the default [0, pi].
 * @return {!goog.vec.vec4d.Type} return euler so that operations can be
 *     chained together.
 */
goog.vec.mat4d.toEulerZXZ = function(mat, euler, opt_theta2IsNegative) {
  // There is an ambiguity in the sign of sinTheta2 because of the sqrt.
  var sinTheta2 = Math.sqrt(mat[2] * mat[2] + mat[6] * mat[6]);

  // By default we explicitely constrain theta2 to be in [0, pi],
  // so sinTheta2 is always positive. We can change the behavior and specify
  // theta2 to be negative in [-pi, 0] with opt_Theta2IsNegative.
  var signTheta2 = opt_theta2IsNegative ? -1 : 1;

  if (sinTheta2 > goog.vec.EPSILON) {
    euler[2] = Math.atan2(mat[2] * signTheta2, mat[6] * signTheta2);
    euler[1] = Math.atan2(sinTheta2 * signTheta2, mat[10]);
    euler[0] = Math.atan2(mat[8] * signTheta2, -mat[9] * signTheta2);
  } else {
    // There is also an arbitrary choice for theta1 = 0 or theta2 = 0 here.
    // We assume theta1 = 0 as some applications do not allow the camera to roll
    // (i.e. have theta1 != 0).
    euler[0] = 0;
    euler[1] = Math.atan2(sinTheta2 * signTheta2, mat[10]);
    euler[2] = Math.atan2(mat[1], mat[0]);
  }

  // Atan2 outputs angles in [-pi, pi] so we bring them back to [0, 2 * pi].
  euler[0] = (euler[0] + Math.PI * 2) % (Math.PI * 2);
  euler[2] = (euler[2] + Math.PI * 2) % (Math.PI * 2);
  // For theta2 we want the angle to be in [0, pi] or [-pi, 0] depending on
  // signTheta2.
  euler[1] =
      ((euler[1] * signTheta2 + Math.PI * 2) % (Math.PI * 2)) * signTheta2;

  return euler;
};


/**
 * Translates the given matrix by x,y,z.  Equvialent to:
 * goog.vec.mat4d.multMat(
 *     mat,
 *     goog.vec.mat4d.makeTranslate(goog.vec.mat4d.create(), x, y, z),
 *     mat);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} x The translation along the x axis.
 * @param {number} y The translation along the y axis.
 * @param {number} z The translation along the z axis.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.translate = function(mat, x, y, z) {
  mat[12] += mat[0] * x + mat[4] * y + mat[8] * z;
  mat[13] += mat[1] * x + mat[5] * y + mat[9] * z;
  mat[14] += mat[2] * x + mat[6] * y + mat[10] * z;
  mat[15] += mat[3] * x + mat[7] * y + mat[11] * z;

  return mat;
};


/**
 * Scales the given matrix by x,y,z.  Equivalent to:
 * goog.vec.mat4d.multMat(
 *     mat,
 *     goog.vec.mat4d.makeScale(goog.vec.mat4d.create(), x, y, z),
 *     mat);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} x The x scale factor.
 * @param {number} y The y scale factor.
 * @param {number} z The z scale factor.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.scale = function(mat, x, y, z) {
  mat[0] = mat[0] * x;
  mat[1] = mat[1] * x;
  mat[2] = mat[2] * x;
  mat[3] = mat[3] * x;
  mat[4] = mat[4] * y;
  mat[5] = mat[5] * y;
  mat[6] = mat[6] * y;
  mat[7] = mat[7] * y;
  mat[8] = mat[8] * z;
  mat[9] = mat[9] * z;
  mat[10] = mat[10] * z;
  mat[11] = mat[11] * z;
  mat[12] = mat[12];
  mat[13] = mat[13];
  mat[14] = mat[14];
  mat[15] = mat[15];

  return mat;
};


/**
 * Rotate the given matrix by angle about the x,y,z axis.  Equivalent to:
 * goog.vec.mat4d.multMat(
 *     mat,
 *     goog.vec.mat4d.makeRotate(goog.vec.mat4d.create(), angle, x, y, z),
 *     mat);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @param {number} x The x component of the rotation axis.
 * @param {number} y The y component of the rotation axis.
 * @param {number} z The z component of the rotation axis.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.rotate = function(mat, angle, x, y, z) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];

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
  mat[3] = m30 * r00 + m31 * r10 + m32 * r20;
  mat[4] = m00 * r01 + m01 * r11 + m02 * r21;
  mat[5] = m10 * r01 + m11 * r11 + m12 * r21;
  mat[6] = m20 * r01 + m21 * r11 + m22 * r21;
  mat[7] = m30 * r01 + m31 * r11 + m32 * r21;
  mat[8] = m00 * r02 + m01 * r12 + m02 * r22;
  mat[9] = m10 * r02 + m11 * r12 + m12 * r22;
  mat[10] = m20 * r02 + m21 * r12 + m22 * r22;
  mat[11] = m30 * r02 + m31 * r12 + m32 * r22;

  return mat;
};


/**
 * Rotate the given matrix by angle about the x axis.  Equivalent to:
 * goog.vec.mat4d.multMat(
 *     mat,
 *     goog.vec.mat4d.makeRotateX(goog.vec.mat4d.create(), angle),
 *     mat);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.rotateX = function(mat, angle) {
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];

  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[4] = m01 * c + m02 * s;
  mat[5] = m11 * c + m12 * s;
  mat[6] = m21 * c + m22 * s;
  mat[7] = m31 * c + m32 * s;
  mat[8] = m01 * -s + m02 * c;
  mat[9] = m11 * -s + m12 * c;
  mat[10] = m21 * -s + m22 * c;
  mat[11] = m31 * -s + m32 * c;

  return mat;
};


/**
 * Rotate the given matrix by angle about the y axis.  Equivalent to:
 * goog.vec.mat4d.multMat(
 *     mat,
 *     goog.vec.mat4d.makeRotateY(goog.vec.mat4d.create(), angle),
 *     mat);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.rotateY = function(mat, angle) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];

  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = m00 * c + m02 * -s;
  mat[1] = m10 * c + m12 * -s;
  mat[2] = m20 * c + m22 * -s;
  mat[3] = m30 * c + m32 * -s;
  mat[8] = m00 * s + m02 * c;
  mat[9] = m10 * s + m12 * c;
  mat[10] = m20 * s + m22 * c;
  mat[11] = m30 * s + m32 * c;

  return mat;
};


/**
 * Rotate the given matrix by angle about the z axis.  Equivalent to:
 * goog.vec.mat4d.multMat(
 *     mat,
 *     goog.vec.mat4d.makeRotateZ(goog.vec.mat4d.create(), angle),
 *     mat);
 *
 * @param {!goog.vec.mat4d.Type} mat The matrix.
 * @param {number} angle The angle in radians.
 * @return {!goog.vec.mat4d.Type} return mat so that operations can be
 *     chained.
 */
goog.vec.mat4d.rotateZ = function(mat, angle) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];

  var c = Math.cos(angle);
  var s = Math.sin(angle);

  mat[0] = m00 * c + m01 * s;
  mat[1] = m10 * c + m11 * s;
  mat[2] = m20 * c + m21 * s;
  mat[3] = m30 * c + m31 * s;
  mat[4] = m00 * -s + m01 * c;
  mat[5] = m10 * -s + m11 * c;
  mat[6] = m20 * -s + m21 * c;
  mat[7] = m30 * -s + m31 * c;

  return mat;
};


/**
 * Retrieves the translation component of the transformation matrix.
 *
 * @param {!goog.vec.mat4d.Type} mat The transformation matrix.
 * @param {!goog.vec.vec3d.Type} translation The vector for storing the
 *     result.
 * @return {!goog.vec.vec3d.Type} return translation so that operations can be
 *     chained.
 */
goog.vec.mat4d.getTranslation = function(mat, translation) {
  translation[0] = mat[12];
  translation[1] = mat[13];
  translation[2] = mat[14];
  return translation;
};


/**
 * @type {Array<goog.vec.vec3d.Type>}
 * @private
 */
goog.vec.mat4d.tmpvec3d_ = [goog.vec.vec3d.create(), goog.vec.vec3d.create()];


/**
 * @type {Array<goog.vec.vec4d.Type>}
 * @private
 */
goog.vec.mat4d.tmpvec4d_ =
    [goog.vec.vec4d.create(), goog.vec.vec4d.create(), goog.vec.vec4d.create()];


/**
 * @type {Array<goog.vec.mat4d.Type>}
 * @private
 */
goog.vec.mat4d.tmpmat4d_ = [goog.vec.mat4d.create()];
