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
 * @fileoverview WARNING: DEPRECATED.  Use Mat4 instead.
 * Implements 4x4 matrices and their related functions which are
 * compatible with WebGL. The API is structured to avoid unnecessary memory
 * allocations.  The last parameter will typically be the output vector and
 * an object can be both an input and output parameter to all methods except
 * where noted. Matrix operations follow the mathematical form when multiplying
 * vectors as follows: resultVec = matrix * vec.
 *
 */
goog.provide('goog.vec.Matrix4');

goog.require('goog.vec');
goog.require('goog.vec.Vec3');
goog.require('goog.vec.Vec4');


/**
 * @typedef {goog.vec.ArrayType}
 */
goog.vec.Matrix4.Type;


/**
 * Creates the array representation of a 4x4 matrix. The use of the array
 * directly eliminates any overhead associated with the class representation
 * defined above. The returned matrix is cleared to all zeros.
 *
 * @return {goog.vec.Matrix4.Type} The new, sixteen element array.
 */
goog.vec.Matrix4.create = function() {
  return new Float32Array(16);
};


/**
 * Creates the array representation of a 4x4 matrix. The use of the array
 * directly eliminates any overhead associated with the class representation
 * defined above. The returned matrix is initialized with the identity
 *
 * @return {goog.vec.Matrix4.Type} The new, sixteen element array.
 */
goog.vec.Matrix4.createIdentity = function() {
  var mat = goog.vec.Matrix4.create();
  mat[0] = mat[5] = mat[10] = mat[15] = 1;
  return mat;
};


/**
 * Creates a 4x4 matrix initialized from the given array.
 *
 * @param {goog.vec.ArrayType} matrix The array containing the
 *     matrix values in column major order.
 * @return {goog.vec.Matrix4.Type} The new, 16 element array.
 */
goog.vec.Matrix4.createFromArray = function(matrix) {
  var newMatrix = goog.vec.Matrix4.create();
  goog.vec.Matrix4.setFromArray(newMatrix, matrix);
  return newMatrix;
};


/**
 * Creates a 4x4 matrix initialized from the given values.
 *
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
 * @return {goog.vec.Matrix4.Type} The new, 16 element array.
 */
goog.vec.Matrix4.createFromValues = function(
    v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32,
    v03, v13, v23, v33) {
  var newMatrix = goog.vec.Matrix4.create();
  goog.vec.Matrix4.setFromValues(
      newMatrix, v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32,
      v03, v13, v23, v33);
  return newMatrix;
};


/**
 * Creates a clone of a 4x4 matrix.
 *
 * @param {goog.vec.Matrix4.Type} matrix The source 4x4 matrix.
 * @return {goog.vec.Matrix4.Type} The new, 16 element matrix.
 */
goog.vec.Matrix4.clone =
    goog.vec.Matrix4.createFromArray;


/**
 * Retrieves the element at the requested row and column.
 *
 * @param {goog.vec.ArrayType} mat The matrix containing the
 *     value to retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @return {number} The element value at the requested row, column indices.
 */
goog.vec.Matrix4.getElement = function(mat, row, column) {
  return mat[row + column * 4];
};


/**
 * Sets the element at the requested row and column.
 *
 * @param {goog.vec.ArrayType} mat The matrix containing the
 *     value to retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @param {number} value The value to set at the requested row, column.
 */
goog.vec.Matrix4.setElement = function(mat, row, column, value) {
  mat[row + column * 4] = value;
};


/**
 * Initializes the matrix from the set of values. Note the values supplied are
 * in column major order.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
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
 */
goog.vec.Matrix4.setFromValues = function(
    mat, v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32,
    v03, v13, v23, v33) {
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
};


/**
 * Sets the matrix from the array of values stored in column major order.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} values The column major ordered
 *     array of values to store in the matrix.
 */
goog.vec.Matrix4.setFromArray = function(mat, values) {
  mat[0] = values[0];
  mat[1] = values[1];
  mat[2] = values[2];
  mat[3] = values[3];
  mat[4] = values[4];
  mat[5] = values[5];
  mat[6] = values[6];
  mat[7] = values[7];
  mat[8] = values[8];
  mat[9] = values[9];
  mat[10] = values[10];
  mat[11] = values[11];
  mat[12] = values[12];
  mat[13] = values[13];
  mat[14] = values[14];
  mat[15] = values[15];
};


/**
 * Sets the matrix from the array of values stored in row major order.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} values The row major ordered array of
 *     values to store in the matrix.
 */
goog.vec.Matrix4.setFromRowMajorArray = function(mat, values) {
  mat[0] = values[0];
  mat[1] = values[4];
  mat[2] = values[8];
  mat[3] = values[12];

  mat[4] = values[1];
  mat[5] = values[5];
  mat[6] = values[9];
  mat[7] = values[13];

  mat[8] = values[2];
  mat[9] = values[6];
  mat[10] = values[10];
  mat[11] = values[14];

  mat[12] = values[3];
  mat[13] = values[7];
  mat[14] = values[11];
  mat[15] = values[15];
};


/**
 * Sets the diagonal values of the matrix from the given values.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {number} v00 The values for (0, 0).
 * @param {number} v11 The values for (1, 1).
 * @param {number} v22 The values for (2, 2).
 * @param {number} v33 The values for (3, 3).
 */
goog.vec.Matrix4.setDiagonalValues = function(
    mat, v00, v11, v22, v33) {
  mat[0] = v00;
  mat[5] = v11;
  mat[10] = v22;
  mat[15] = v33;
};


/**
 * Sets the diagonal values of the matrix from the given vector.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} vec The vector containing the
 *     values.
 */
goog.vec.Matrix4.setDiagonal = function(mat, vec) {
  mat[0] = vec[0];
  mat[5] = vec[1];
  mat[10] = vec[2];
  mat[15] = vec[3];
};


/**
 * Sets the specified column with the supplied values.
 *
 * @param {goog.vec.ArrayType} mat The matrix to recieve the
 *     values.
 * @param {number} column The column index to set the values on.
 * @param {number} v0 The value for row 0.
 * @param {number} v1 The value for row 1.
 * @param {number} v2 The value for row 2.
 * @param {number} v3 The value for row 3.
 */
goog.vec.Matrix4.setColumnValues = function(
    mat, column, v0, v1, v2, v3) {
  var i = column * 4;
  mat[i] = v0;
  mat[i + 1] = v1;
  mat[i + 2] = v2;
  mat[i + 3] = v3;
};


/**
 * Sets the specified column with the value from the supplied array.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {number} column The column index to set the values on.
 * @param {goog.vec.ArrayType} vec The vector of elements for the
 *     column.
 */
goog.vec.Matrix4.setColumn = function(mat, column, vec) {
  var i = column * 4;
  mat[i] = vec[0];
  mat[i + 1] = vec[1];
  mat[i + 2] = vec[2];
  mat[i + 3] = vec[3];
};


/**
 * Retrieves the specified column from the matrix into the given vector
 * array.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     values.
 * @param {number} column The column to get the values from.
 * @param {goog.vec.ArrayType} vec The vector of elements to
 *     receive the column.
 */
goog.vec.Matrix4.getColumn = function(mat, column, vec) {
  var i = column * 4;
  vec[0] = mat[i];
  vec[1] = mat[i + 1];
  vec[2] = mat[i + 2];
  vec[3] = mat[i + 3];
};


/**
 * Sets the columns of the matrix from the set of vector elements.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} vec0 The values for column 0.
 * @param {goog.vec.ArrayType} vec1 The values for column 1.
 * @param {goog.vec.ArrayType} vec2 The values for column 2.
 * @param {goog.vec.ArrayType} vec3 The values for column 3.
 */
goog.vec.Matrix4.setColumns = function(
    mat, vec0, vec1, vec2, vec3) {
  goog.vec.Matrix4.setColumn(mat, 0, vec0);
  goog.vec.Matrix4.setColumn(mat, 1, vec1);
  goog.vec.Matrix4.setColumn(mat, 2, vec2);
  goog.vec.Matrix4.setColumn(mat, 3, vec3);
};


/**
 * Retrieves the column values from the given matrix into the given vector
 * elements.
 *
 * @param {goog.vec.ArrayType} mat The matrix containing the
 *     columns to retrieve.
 * @param {goog.vec.ArrayType} vec0 The vector elements to receive
 *     column 0.
 * @param {goog.vec.ArrayType} vec1 The vector elements to receive
 *     column 1.
 * @param {goog.vec.ArrayType} vec2 The vector elements to receive
 *     column 2.
 * @param {goog.vec.ArrayType} vec3 The vector elements to receive
 *     column 3.
 */
goog.vec.Matrix4.getColumns = function(
    mat, vec0, vec1, vec2, vec3) {
  goog.vec.Matrix4.getColumn(mat, 0, vec0);
  goog.vec.Matrix4.getColumn(mat, 1, vec1);
  goog.vec.Matrix4.getColumn(mat, 2, vec2);
  goog.vec.Matrix4.getColumn(mat, 3, vec3);
};


/**
 * Sets the row values from the supplied values.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {number} row The index of the row to receive the values.
 * @param {number} v0 The value for column 0.
 * @param {number} v1 The value for column 1.
 * @param {number} v2 The value for column 2.
 * @param {number} v3 The value for column 3.
 */
goog.vec.Matrix4.setRowValues = function(mat, row, v0, v1, v2, v3) {
  mat[row] = v0;
  mat[row + 4] = v1;
  mat[row + 8] = v2;
  mat[row + 12] = v3;
};


/**
 * Sets the row values from the supplied vector.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     row values.
 * @param {number} row The index of the row.
 * @param {goog.vec.ArrayType} vec The vector containing the
 *     values.
 */
goog.vec.Matrix4.setRow = function(mat, row, vec) {
  mat[row] = vec[0];
  mat[row + 4] = vec[1];
  mat[row + 8] = vec[2];
  mat[row + 12] = vec[3];
};


/**
 * Retrieves the row values into the given vector.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     values.
 * @param {number} row The index of the row supplying the values.
 * @param {goog.vec.ArrayType} vec The vector to receive the
 *     row.
 */
goog.vec.Matrix4.getRow = function(mat, row, vec) {
  vec[0] = mat[row];
  vec[1] = mat[row + 4];
  vec[2] = mat[row + 8];
  vec[3] = mat[row + 12];
};


/**
 * Sets the rows of the matrix from the supplied vectors.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} vec0 The values for row 0.
 * @param {goog.vec.ArrayType} vec1 The values for row 1.
 * @param {goog.vec.ArrayType} vec2 The values for row 2.
 * @param {goog.vec.ArrayType} vec3 The values for row 3.
 */
goog.vec.Matrix4.setRows = function(
    mat, vec0, vec1, vec2, vec3) {
  goog.vec.Matrix4.setRow(mat, 0, vec0);
  goog.vec.Matrix4.setRow(mat, 1, vec1);
  goog.vec.Matrix4.setRow(mat, 2, vec2);
  goog.vec.Matrix4.setRow(mat, 3, vec3);
};


/**
 * Retrieves the rows of the matrix into the supplied vectors.
 *
 * @param {goog.vec.ArrayType} mat The matrix to supply the
 *     values.
 * @param {goog.vec.ArrayType} vec0 The vector to receive row 0.
 * @param {goog.vec.ArrayType} vec1 The vector to receive row 1.
 * @param {goog.vec.ArrayType} vec2 The vector to receive row 2.
 * @param {goog.vec.ArrayType} vec3 The vector to receive row 3.
 */
goog.vec.Matrix4.getRows = function(
    mat, vec0, vec1, vec2, vec3) {
  goog.vec.Matrix4.getRow(mat, 0, vec0);
  goog.vec.Matrix4.getRow(mat, 1, vec1);
  goog.vec.Matrix4.getRow(mat, 2, vec2);
  goog.vec.Matrix4.getRow(mat, 3, vec3);
};


/**
 * Clears the given matrix to zero.
 *
 * @param {goog.vec.ArrayType} mat The matrix to clear.
 */
goog.vec.Matrix4.setZero = function(mat) {
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
};


/**
 * Sets the given matrix to the identity matrix.
 *
 * @param {goog.vec.ArrayType} mat The matrix to set.
 */
goog.vec.Matrix4.setIdentity = function(mat) {
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
};


/**
 * Performs a per-component addition of the matrix mat0 and mat1, storing
 * the result into resultMat.
 *
 * @param {goog.vec.ArrayType} mat0 The first addend.
 * @param {goog.vec.ArrayType} mat1 The second addend.
 * @param {goog.vec.ArrayType} resultMat The matrix to
 *     receive the results (may be either mat0 or mat1).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.add = function(mat0, mat1, resultMat) {
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
 * @param {goog.vec.ArrayType} mat0 The minuend.
 * @param {goog.vec.ArrayType} mat1 The subtrahend.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.subtract = function(mat0, mat1, resultMat) {
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
 * Performs a component-wise multiplication of mat0 with the given scalar
 * storing the result into resultMat.
 *
 * @param {goog.vec.ArrayType} mat0 The matrix to scale.
 * @param {number} scalar The scalar value to multiple to each element of mat0.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the results (may be mat0).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.scale = function(mat0, scalar, resultMat) {
  resultMat[0] = mat0[0] * scalar;
  resultMat[1] = mat0[1] * scalar;
  resultMat[2] = mat0[2] * scalar;
  resultMat[3] = mat0[3] * scalar;
  resultMat[4] = mat0[4] * scalar;
  resultMat[5] = mat0[5] * scalar;
  resultMat[6] = mat0[6] * scalar;
  resultMat[7] = mat0[7] * scalar;
  resultMat[8] = mat0[8] * scalar;
  resultMat[9] = mat0[9] * scalar;
  resultMat[10] = mat0[10] * scalar;
  resultMat[11] = mat0[11] * scalar;
  resultMat[12] = mat0[12] * scalar;
  resultMat[13] = mat0[13] * scalar;
  resultMat[14] = mat0[14] * scalar;
  resultMat[15] = mat0[15] * scalar;
  return resultMat;
};


/**
 * Multiplies the two matrices mat0 and mat1 using matrix multiplication,
 * storing the result into resultMat.
 *
 * @param {goog.vec.ArrayType} mat0 The first (left hand) matrix.
 * @param {goog.vec.ArrayType} mat1 The second (right hand)
 *     matrix.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multMat = function(mat0, mat1, resultMat) {
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
 * @param {goog.vec.ArrayType} mat The matrix to transpose.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the results (may be mat).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.transpose = function(mat, resultMat) {
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
 * @param {goog.vec.ArrayType} mat The matrix to compute the
 *     matrix for.
 * @return {number} The determinant of the matrix.
 */
goog.vec.Matrix4.determinant = function(mat) {
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
 * @param {goog.vec.ArrayType} mat The matrix to invert.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the result (may be mat).
 * @return {boolean} True if the inverse is defined. If false is returned,
 *     resultMat is not modified.
 */
goog.vec.Matrix4.invert = function(mat, resultMat) {
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
 * @param {goog.vec.ArrayType} mat0 The first matrix.
 * @param {goog.vec.ArrayType} mat1 The second matrix.
 * @return {boolean} True if the the two matrices are equivalent.
 */
goog.vec.Matrix4.equals = function(mat0, mat1) {
  return mat0.length == mat1.length &&
      mat0[0] == mat1[0] &&
      mat0[1] == mat1[1] &&
      mat0[2] == mat1[2] &&
      mat0[3] == mat1[3] &&
      mat0[4] == mat1[4] &&
      mat0[5] == mat1[5] &&
      mat0[6] == mat1[6] &&
      mat0[7] == mat1[7] &&
      mat0[8] == mat1[8] &&
      mat0[9] == mat1[9] &&
      mat0[10] == mat1[10] &&
      mat0[11] == mat1[11] &&
      mat0[12] == mat1[12] &&
      mat0[13] == mat1[13] &&
      mat0[14] == mat1[14] &&
      mat0[15] == mat1[15];
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec. The input vector is multiplied against the
 * upper 3x4 matrix omitting the projective component.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The 3 element vector to
 *     transform.
 * @param {goog.vec.ArrayType} resultVec The 3 element vector to
 *     receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multVec3 = function(mat, vec, resultVec) {
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
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The 3 element vector to
 *     transform.
 * @param {goog.vec.ArrayType} resultVec The 3 element vector to
 *     receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multVec3NoTranslate = function(
    mat, vec, resultVec) {
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
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The 3 element vector to
 *     transform.
 * @param {goog.vec.ArrayType} resultVec The 3 element vector
 *     to receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multVec3Projective = function(
    mat, vec, resultVec) {
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
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The vector to transform.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multVec4 = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
  resultVec[0] = x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12];
  resultVec[1] = x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13];
  resultVec[2] = x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14];
  resultVec[3] = x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15];
  return resultVec;
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec. The input matrix is multiplied against the
 * upper 3x4 matrix omitting the projective component.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The 3 element vector to
 *     transform.
 * @param {goog.vec.ArrayType} resultVec The 3 element vector to
 *     receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multVec3ToArray = function(mat, vec, resultVec) {
  goog.vec.Matrix4.multVec3(
      mat, vec, /** @type {goog.vec.ArrayType} */ (resultVec));
  return resultVec;
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed vector into resultVec.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The vector to transform.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix4.multVec4ToArray = function(mat, vec, resultVec) {
  goog.vec.Matrix4.multVec4(
      mat, vec, /** @type {goog.vec.ArrayType} */ (resultVec));
  return resultVec;
};


/**
 * Initializes the given 4x4 matrix as a translation matrix with x, y and z
 * translation factors.
 * @param {goog.vec.ArrayType} mat The 4x4 (16-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} x The translation along the x axis.
 * @param {number} y The translation along the y axis.
 * @param {number} z The translation along the z axis.
 */
goog.vec.Matrix4.makeTranslate = function(mat, x, y, z) {
  goog.vec.Matrix4.setIdentity(mat);
  goog.vec.Matrix4.setColumnValues(mat, 3, x, y, z, 1);
};


/**
 * Initializes the given 4x4 matrix as a scale matrix with x, y and z scale
 * factors.
 * @param {goog.vec.ArrayType} mat The 4x4 (16-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} x The scale along the x axis.
 * @param {number} y The scale along the y axis.
 * @param {number} z The scale along the z axis.
 */
goog.vec.Matrix4.makeScale = function(mat, x, y, z) {
  goog.vec.Matrix4.setIdentity(mat);
  goog.vec.Matrix4.setDiagonalValues(mat, x, y, z, 1);
};


/**
 * Initializes the given 4x4 matrix as a rotation matrix with the given rotation
 * angle about the axis defined by the vector (ax, ay, az).
 * @param {goog.vec.ArrayType} mat The 4x4 (16-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} angle The rotation angle in radians.
 * @param {number} ax The x component of the rotation axis.
 * @param {number} ay The y component of the rotation axis.
 * @param {number} az The z component of the rotation axis.
 */
goog.vec.Matrix4.makeAxisAngleRotate = function(
    mat, angle, ax, ay, az) {
  var c = Math.cos(angle);
  var d = 1 - c;
  var s = Math.sin(angle);

  goog.vec.Matrix4.setFromValues(mat,
      ax * ax * d + c,
      ax * ay * d + az * s,
      ax * az * d - ay * s,
      0,

      ax * ay * d - az * s,
      ay * ay * d + c,
      ay * az * d + ax * s,
      0,

      ax * az * d + ay * s,
      ay * az * d - ax * s,
      az * az * d + c,
      0,

      0, 0, 0, 1);
};


/**
 * Initializes the given 4x4 matrix as a perspective projection matrix.
 * @param {goog.vec.ArrayType} mat The 4x4 (16-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} left The coordinate of the left clipping plane.
 * @param {number} right The coordinate of the right clipping plane.
 * @param {number} bottom The coordinate of the bottom clipping plane.
 * @param {number} top The coordinate of the top clipping plane.
 * @param {number} near The distance to the near clipping plane.
 * @param {number} far The distance to the far clipping plane.
 */
goog.vec.Matrix4.makeFrustum = function(
    mat, left, right, bottom, top, near, far) {
  var x = (2 * near) / (right - left);
  var y = (2 * near) / (top - bottom);
  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);
  var d = -(2 * far * near) / (far - near);

  goog.vec.Matrix4.setFromValues(mat,
      x, 0, 0, 0,
      0, y, 0, 0,
      a, b, c, -1,
      0, 0, d, 0
  );
};


/**
 * Initializes the given 4x4 matrix as a perspective projection matrix given a
 * field of view and aspect ratio.
 * @param {goog.vec.ArrayType} mat The 4x4 (16-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} fovy The field of view along the y (vertical) axis in
 *     radians.
 * @param {number} aspect The x (width) to y (height) aspect ratio.
 * @param {number} near The distance to the near clipping plane.
 * @param {number} far The distance to the far clipping plane.
 */
goog.vec.Matrix4.makePerspective = function(
    mat, fovy, aspect, near, far) {
  var angle = fovy / 2;
  var dz = far - near;
  var sinAngle = Math.sin(angle);
  if (dz == 0 || sinAngle == 0 || aspect == 0) return;

  var cot = Math.cos(angle) / sinAngle;
  goog.vec.Matrix4.setFromValues(mat,
      cot / aspect, 0, 0, 0,
      0, cot, 0, 0,
      0, 0, -(far + near) / dz, -1,
      0, 0, -(2 * near * far) / dz, 0
  );
};


/**
 * Initializes the given 4x4 matrix as an orthographic projection matrix.
 * @param {goog.vec.ArrayType} mat The 4x4 (16-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} left The coordinate of the left clipping plane.
 * @param {number} right The coordinate of the right clipping plane.
 * @param {number} bottom The coordinate of the bottom clipping plane.
 * @param {number} top The coordinate of the top clipping plane.
 * @param {number} near The distance to the near clipping plane.
 * @param {number} far The distance to the far clipping plane.
 */
goog.vec.Matrix4.makeOrtho = function(
    mat, left, right, bottom, top, near, far) {
  var x = 2 / (right - left);
  var y = 2 / (top - bottom);
  var z = -2 / (far - near);
  var a = -(right + left) / (right - left);
  var b = -(top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);

  goog.vec.Matrix4.setFromValues(mat,
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      a, b, c, 1
  );
};


/**
 * Updates a matrix representing the modelview matrix of a camera so that
 * the camera is 'looking at' the given center point.
 * @param {goog.vec.ArrayType} viewMatrix The matrix.
 * @param {goog.vec.ArrayType} eyePt The position of the eye point
 *     (camera origin).
 * @param {goog.vec.ArrayType} centerPt The point to aim the camera
 *     at.
 * @param {goog.vec.ArrayType} worldUpVec The vector that
 *     identifies the up direction for the camera.
 */
goog.vec.Matrix4.lookAt = function(
    viewMatrix, eyePt, centerPt, worldUpVec) {
  // Compute the direction vector from the eye point to the center point and
  // normalize.
  var fwdVec = goog.vec.Matrix4.tmpVec4_[0];
  goog.vec.Vec3.subtract(centerPt, eyePt, fwdVec);
  goog.vec.Vec3.normalize(fwdVec, fwdVec);
  fwdVec[3] = 0;

  // Compute the side vector from the forward vector and the input up vector.
  var sideVec = goog.vec.Matrix4.tmpVec4_[1];
  goog.vec.Vec3.cross(fwdVec, worldUpVec, sideVec);
  goog.vec.Vec3.normalize(sideVec, sideVec);
  sideVec[3] = 0;

  // Now the up vector to form the orthonormal basis.
  var upVec = goog.vec.Matrix4.tmpVec4_[2];
  goog.vec.Vec3.cross(sideVec, fwdVec, upVec);
  goog.vec.Vec3.normalize(upVec, upVec);
  upVec[3] = 0;

  // Update the view matrix with the new orthonormal basis and position the
  // camera at the given eye point.
  goog.vec.Vec3.negate(fwdVec, fwdVec);
  goog.vec.Matrix4.setRow(viewMatrix, 0, sideVec);
  goog.vec.Matrix4.setRow(viewMatrix, 1, upVec);
  goog.vec.Matrix4.setRow(viewMatrix, 2, fwdVec);
  goog.vec.Matrix4.setRowValues(viewMatrix, 3, 0, 0, 0, 1);
  goog.vec.Matrix4.applyTranslate(
      viewMatrix, -eyePt[0], -eyePt[1], -eyePt[2]);
};


/**
 * Decomposes a matrix into the lookAt vectors eyePt, fwdVec and worldUpVec.
 * The matrix represents the modelview matrix of a camera. It is the inverse
 * of lookAt except for the output of the fwdVec instead of centerPt.
 * The centerPt itself cannot be recovered from a modelview matrix.
 * @param {goog.vec.ArrayType} viewMatrix The matrix.
 * @param {goog.vec.ArrayType} eyePt The position of the eye point
 *     (camera origin).
 * @param {goog.vec.ArrayType} fwdVec The vector describing where
 *     the camera points to.
 * @param {goog.vec.ArrayType} worldUpVec The vector that
 *     identifies the up direction for the camera.
 * @return {boolean} True if the method succeeds, false otherwise.
 *     The method can only fail if the inverse of viewMatrix is not defined.
 */
goog.vec.Matrix4.toLookAt = function(
    viewMatrix, eyePt, fwdVec, worldUpVec) {
  // Get eye of the camera.
  var viewMatrixInverse = goog.vec.Matrix4.tmpMatrix4_[0];
  if (!goog.vec.Matrix4.invert(viewMatrix, viewMatrixInverse)) {
    // The input matrix does not have a valid inverse.
    return false;
  }

  if (eyePt) {
    eyePt[0] = viewMatrixInverse[12];
    eyePt[1] = viewMatrixInverse[13];
    eyePt[2] = viewMatrixInverse[14];
  }

  // Get forward vector from the definition of lookAt.
  if (fwdVec || worldUpVec) {
    if (!fwdVec) {
      fwdVec = goog.vec.Matrix4.tmpVec3_[0];
    }
    fwdVec[0] = -viewMatrix[2];
    fwdVec[1] = -viewMatrix[6];
    fwdVec[2] = -viewMatrix[10];
    // Normalize forward vector.
    goog.vec.Vec3.normalize(fwdVec, fwdVec);
  }

  if (worldUpVec) {
    // Get side vector from the definition of gluLookAt.
    var side = goog.vec.Matrix4.tmpVec3_[1];
    side[0] = viewMatrix[0];
    side[1] = viewMatrix[4];
    side[2] = viewMatrix[8];
    // Compute up vector as a up = side x forward.
    goog.vec.Vec3.cross(side, fwdVec, worldUpVec);
    // Normalize up vector.
    goog.vec.Vec3.normalize(worldUpVec, worldUpVec);
  }
  return true;
};


/**
 * Constructs a rotation matrix from its Euler angles using the ZXZ convention.
 * Given the euler angles [theta1, theta2, theta3], the rotation is defined as
 * rotation = rotation_z(theta1) * rotation_x(theta2) * rotation_z(theta3),
 * where rotation_x(theta) means rotation around the X axis of theta radians.
 * @param {goog.vec.ArrayType} matrix The rotation matrix.
 * @param {number} theta1 The angle of rotation around the Z axis in radians.
 * @param {number} theta2 The angle of rotation around the X axis in radians.
 * @param {number} theta3 The angle of rotation around the Z axis in radians.
 */
goog.vec.Matrix4.fromEulerZXZ = function(
    matrix, theta1, theta2, theta3) {
  var c1 = Math.cos(theta1);
  var s1 = Math.sin(theta1);

  var c2 = Math.cos(theta2);
  var s2 = Math.sin(theta2);

  var c3 = Math.cos(theta3);
  var s3 = Math.sin(theta3);

  matrix[0] = c1 * c3 - c2 * s1 * s3;
  matrix[1] = c2 * c1 * s3 + c3 * s1;
  matrix[2] = s3 * s2;
  matrix[3] = 0;

  matrix[4] = -c1 * s3 - c3 * c2 * s1;
  matrix[5] = c1 * c2 * c3 - s1 * s3;
  matrix[6] = c3 * s2;
  matrix[7] = 0;

  matrix[8] = s2 * s1;
  matrix[9] = -c1 * s2;
  matrix[10] = c2;
  matrix[11] = 0;

  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  matrix[15] = 1;
};


/**
 * Decomposes a rotation matrix into Euler angles using the ZXZ convention.
 * @param {goog.vec.ArrayType} matrix The rotation matrix.
 * @param {goog.vec.ArrayType} euler The ZXZ Euler angles in
 *     radians. euler = [roll, tilt, pan].
 */
goog.vec.Matrix4.toEulerZXZ = function(matrix, euler) {
  var s2 = Math.sqrt(matrix[2] * matrix[2] + matrix[6] * matrix[6]);

  // There is an ambiguity in the sign of s2. We assume the tilt value
  // is between [-pi/2, 0], so s2 is always negative.
  if (s2 > goog.vec.EPSILON) {
    euler[2] = Math.atan2(-matrix[2], -matrix[6]);
    euler[1] = Math.atan2(-s2, matrix[10]);
    euler[0] = Math.atan2(-matrix[8], matrix[9]);
  } else {
    // There is also an arbitrary choice for roll = 0 or pan = 0 in this case.
    // We assume roll = 0 as some applications do not allow the camera to roll.
    euler[0] = 0;
    euler[1] = Math.atan2(-s2, matrix[10]);
    euler[2] = Math.atan2(matrix[1], matrix[0]);
  }
};


/**
 * Applies a translation by x,y,z to the given matrix.
 *
 * @param {goog.vec.ArrayType} mat The matrix.
 * @param {number} x The translation along the x axis.
 * @param {number} y The translation along the y axis.
 * @param {number} z The translation along the z axis.
 */
goog.vec.Matrix4.applyTranslate = function(mat, x, y, z) {
  goog.vec.Matrix4.setColumnValues(
      mat, 3,
      mat[0] * x + mat[4] * y + mat[8] * z + mat[12],
      mat[1] * x + mat[5] * y + mat[9] * z + mat[13],
      mat[2] * x + mat[6] * y + mat[10] * z + mat[14],
      mat[3] * x + mat[7] * y + mat[11] * z + mat[15]);
};


/**
 * Applies an x,y,z scale to the given matrix.
 *
 * @param {goog.vec.ArrayType} mat The matrix.
 * @param {number} x The x scale factor.
 * @param {number} y The y scale factor.
 * @param {number} z The z scale factor.
 */
goog.vec.Matrix4.applyScale = function(mat, x, y, z) {
  goog.vec.Matrix4.setFromValues(
      mat,
      mat[0] * x, mat[1] * x, mat[2] * x, mat[3] * x,
      mat[4] * y, mat[5] * y, mat[6] * y, mat[7] * y,
      mat[8] * z, mat[9] * z, mat[10] * z, mat[11] * z,
      mat[12], mat[13], mat[14], mat[15]);
};


/**
 * Applies a rotation by angle about the x,y,z axis to the given matrix.
 *
 * @param {goog.vec.ArrayType} mat The matrix.
 * @param {number} angle The angle in radians.
 * @param {number} x The x component of the rotation axis.
 * @param {number} y The y component of the rotation axis.
 * @param {number} z The z component of the rotation axis.
 */
goog.vec.Matrix4.applyRotate = function(mat, angle, x, y, z) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];
  var m03 = mat[12], m13 = mat[13], m23 = mat[14], m33 = mat[15];

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

  goog.vec.Matrix4.setFromValues(
      mat,
      m00 * r00 + m01 * r10 + m02 * r20,
      m10 * r00 + m11 * r10 + m12 * r20,
      m20 * r00 + m21 * r10 + m22 * r20,
      m30 * r00 + m31 * r10 + m32 * r20,

      m00 * r01 + m01 * r11 + m02 * r21,
      m10 * r01 + m11 * r11 + m12 * r21,
      m20 * r01 + m21 * r11 + m22 * r21,
      m30 * r01 + m31 * r11 + m32 * r21,

      m00 * r02 + m01 * r12 + m02 * r22,
      m10 * r02 + m11 * r12 + m12 * r22,
      m20 * r02 + m21 * r12 + m22 * r22,
      m30 * r02 + m31 * r12 + m32 * r22,

      m03, m13, m23, m33);
};


/**
 * @type {!Array<!goog.vec.Vec3.Type>}
 * @private
 */
goog.vec.Matrix4.tmpVec3_ = [
  goog.vec.Vec3.createNumber(),
  goog.vec.Vec3.createNumber()
];


/**
 * @type {!Array<!goog.vec.Vec4.Type>}
 * @private
 */
goog.vec.Matrix4.tmpVec4_ = [
  goog.vec.Vec4.createNumber(),
  goog.vec.Vec4.createNumber(),
  goog.vec.Vec4.createNumber()
];


/**
 * @type {Array<goog.vec.Matrix4.Type>}
 * @private
 */
goog.vec.Matrix4.tmpMatrix4_ = [
  goog.vec.Matrix4.create()
];
