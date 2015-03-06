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
 * @fileoverview WARNING: DEPRECATED.  Use Mat3 instead.
 * Implements 3x3 matrices and their related functions which are
 * compatible with WebGL. The API is structured to avoid unnecessary memory
 * allocations.  The last parameter will typically be the output vector and
 * an object can be both an input and output parameter to all methods except
 * where noted. Matrix operations follow the mathematical form when multiplying
 * vectors as follows: resultVec = matrix * vec.
 *
 */
goog.provide('goog.vec.Matrix3');


/**
 * @typedef {goog.vec.ArrayType}
 */
goog.vec.Matrix3.Type;


/**
 * Creates the array representation of a 3x3 matrix. The use of the array
 * directly eliminates any overhead associated with the class representation
 * defined above. The returned matrix is cleared to all zeros.
 *
 * @return {goog.vec.Matrix3.Type} The new, nine element array.
 */
goog.vec.Matrix3.create = function() {
  return new Float32Array(9);
};


/**
 * Creates the array representation of a 3x3 matrix. The use of the array
 * directly eliminates any overhead associated with the class representation
 * defined above. The returned matrix is initialized with the identity.
 *
 * @return {goog.vec.Matrix3.Type} The new, nine element array.
 */
goog.vec.Matrix3.createIdentity = function() {
  var mat = goog.vec.Matrix3.create();
  mat[0] = mat[4] = mat[8] = 1;
  return mat;
};


/**
 * Creates a 3x3 matrix initialized from the given array.
 *
 * @param {goog.vec.ArrayType} matrix The array containing the
 *     matrix values in column major order.
 * @return {goog.vec.Matrix3.Type} The new, nine element array.
 */
goog.vec.Matrix3.createFromArray = function(matrix) {
  var newMatrix = goog.vec.Matrix3.create();
  goog.vec.Matrix3.setFromArray(newMatrix, matrix);
  return newMatrix;
};


/**
 * Creates a 3x3 matrix initialized from the given values.
 *
 * @param {number} v00 The values at (0, 0).
 * @param {number} v10 The values at (1, 0).
 * @param {number} v20 The values at (2, 0).
 * @param {number} v01 The values at (0, 1).
 * @param {number} v11 The values at (1, 1).
 * @param {number} v21 The values at (2, 1).
 * @param {number} v02 The values at (0, 2).
 * @param {number} v12 The values at (1, 2).
 * @param {number} v22 The values at (2, 2).
 * @return {goog.vec.Matrix3.Type} The new, nine element array.
 */
goog.vec.Matrix3.createFromValues = function(
    v00, v10, v20, v01, v11, v21, v02, v12, v22) {
  var newMatrix = goog.vec.Matrix3.create();
  goog.vec.Matrix3.setFromValues(
      newMatrix, v00, v10, v20, v01, v11, v21, v02, v12, v22);
  return newMatrix;
};


/**
 * Creates a clone of a 3x3 matrix.
 *
 * @param {goog.vec.Matrix3.Type} matrix The source 3x3 matrix.
 * @return {goog.vec.Matrix3.Type} The new 3x3 element matrix.
 */
goog.vec.Matrix3.clone =
    goog.vec.Matrix3.createFromArray;


/**
 * Retrieves the element at the requested row and column.
 *
 * @param {goog.vec.ArrayType} mat The matrix containing the
 *     value to retrieve.
 * @param {number} row The row index.
 * @param {number} column The column index.
 * @return {number} The element value at the requested row, column indices.
 */
goog.vec.Matrix3.getElement = function(mat, row, column) {
  return mat[row + column * 3];
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
goog.vec.Matrix3.setElement = function(mat, row, column, value) {
  mat[row + column * 3] = value;
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
 * @param {number} v01 The values at (0, 1).
 * @param {number} v11 The values at (1, 1).
 * @param {number} v21 The values at (2, 1).
 * @param {number} v02 The values at (0, 2).
 * @param {number} v12 The values at (1, 2).
 * @param {number} v22 The values at (2, 2).
 */
goog.vec.Matrix3.setFromValues = function(
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
};


/**
 * Sets the matrix from the array of values stored in column major order.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} values The column major ordered
 *     array of values to store in the matrix.
 */
goog.vec.Matrix3.setFromArray = function(mat, values) {
  mat[0] = values[0];
  mat[1] = values[1];
  mat[2] = values[2];
  mat[3] = values[3];
  mat[4] = values[4];
  mat[5] = values[5];
  mat[6] = values[6];
  mat[7] = values[7];
  mat[8] = values[8];
};


/**
 * Sets the matrix from the array of values stored in row major order.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} values The row major ordered array
 *     of values to store in the matrix.
 */
goog.vec.Matrix3.setFromRowMajorArray = function(mat, values) {
  mat[0] = values[0];
  mat[1] = values[3];
  mat[2] = values[6];
  mat[3] = values[1];
  mat[4] = values[4];
  mat[5] = values[7];
  mat[6] = values[2];
  mat[7] = values[5];
  mat[8] = values[8];
};


/**
 * Sets the diagonal values of the matrix from the given values.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {number} v00 The values for (0, 0).
 * @param {number} v11 The values for (1, 1).
 * @param {number} v22 The values for (2, 2).
 */
goog.vec.Matrix3.setDiagonalValues = function(mat, v00, v11, v22) {
  mat[0] = v00;
  mat[4] = v11;
  mat[8] = v22;
};


/**
 * Sets the diagonal values of the matrix from the given vector.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} vec The vector containing the
 *     values.
 */
goog.vec.Matrix3.setDiagonal = function(mat, vec) {
  mat[0] = vec[0];
  mat[4] = vec[1];
  mat[8] = vec[2];
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
 */
goog.vec.Matrix3.setColumnValues = function(
    mat, column, v0, v1, v2) {
  var i = column * 3;
  mat[i] = v0;
  mat[i + 1] = v1;
  mat[i + 2] = v2;
};


/**
 * Sets the specified column with the value from the supplied array.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {number} column The column index to set the values on.
 * @param {goog.vec.ArrayType} vec The vector elements for the
 *     column.
 */
goog.vec.Matrix3.setColumn = function(mat, column, vec) {
  var i = column * 3;
  mat[i] = vec[0];
  mat[i + 1] = vec[1];
  mat[i + 2] = vec[2];
};


/**
 * Retrieves the specified column from the matrix into the given vector
 * array.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     values.
 * @param {number} column The column to get the values from.
 * @param {goog.vec.ArrayType} vec The vector elements to receive
 *     the column.
 */
goog.vec.Matrix3.getColumn = function(mat, column, vec) {
  var i = column * 3;
  vec[0] = mat[i];
  vec[1] = mat[i + 1];
  vec[2] = mat[i + 2];
};


/**
 * Sets the columns of the matrix from the set of vector elements.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} vec0 The values for column 0.
 * @param {goog.vec.ArrayType} vec1 The values for column 1.
 * @param {goog.vec.ArrayType} vec2 The values for column 2.
 */
goog.vec.Matrix3.setColumns = function(
    mat, vec0, vec1, vec2) {
  goog.vec.Matrix3.setColumn(mat, 0, vec0);
  goog.vec.Matrix3.setColumn(mat, 1, vec1);
  goog.vec.Matrix3.setColumn(mat, 2, vec2);
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
 */
goog.vec.Matrix3.getColumns = function(
    mat, vec0, vec1, vec2) {
  goog.vec.Matrix3.getColumn(mat, 0, vec0);
  goog.vec.Matrix3.getColumn(mat, 1, vec1);
  goog.vec.Matrix3.getColumn(mat, 2, vec2);
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
 */
goog.vec.Matrix3.setRowValues = function(mat, row, v0, v1, v2) {
  mat[row] = v0;
  mat[row + 3] = v1;
  mat[row + 6] = v2;
};


/**
 * Sets the row values from the supplied vector.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     row values.
 * @param {number} row The index of the row.
 * @param {goog.vec.ArrayType} vec The vector containing the values.
 */
goog.vec.Matrix3.setRow = function(mat, row, vec) {
  mat[row] = vec[0];
  mat[row + 3] = vec[1];
  mat[row + 6] = vec[2];
};


/**
 * Retrieves the row values into the given vector.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     values.
 * @param {number} row The index of the row supplying the values.
 * @param {goog.vec.ArrayType} vec The vector to receive the row.
 */
goog.vec.Matrix3.getRow = function(mat, row, vec) {
  vec[0] = mat[row];
  vec[1] = mat[row + 3];
  vec[2] = mat[row + 6];
};


/**
 * Sets the rows of the matrix from the supplied vectors.
 *
 * @param {goog.vec.ArrayType} mat The matrix to receive the
 *     values.
 * @param {goog.vec.ArrayType} vec0 The values for row 0.
 * @param {goog.vec.ArrayType} vec1 The values for row 1.
 * @param {goog.vec.ArrayType} vec2 The values for row 2.
 */
goog.vec.Matrix3.setRows = function(
    mat, vec0, vec1, vec2) {
  goog.vec.Matrix3.setRow(mat, 0, vec0);
  goog.vec.Matrix3.setRow(mat, 1, vec1);
  goog.vec.Matrix3.setRow(mat, 2, vec2);
};


/**
 * Retrieves the rows of the matrix into the supplied vectors.
 *
 * @param {goog.vec.ArrayType} mat The matrix to supplying
 *     the values.
 * @param {goog.vec.ArrayType} vec0 The vector to receive row 0.
 * @param {goog.vec.ArrayType} vec1 The vector to receive row 1.
 * @param {goog.vec.ArrayType} vec2 The vector to receive row 2.
 */
goog.vec.Matrix3.getRows = function(
    mat, vec0, vec1, vec2) {
  goog.vec.Matrix3.getRow(mat, 0, vec0);
  goog.vec.Matrix3.getRow(mat, 1, vec1);
  goog.vec.Matrix3.getRow(mat, 2, vec2);
};


/**
 * Clears the given matrix to zero.
 *
 * @param {goog.vec.ArrayType} mat The matrix to clear.
 */
goog.vec.Matrix3.setZero = function(mat) {
  mat[0] = 0;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 0;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 0;
};


/**
 * Sets the given matrix to the identity matrix.
 *
 * @param {goog.vec.ArrayType} mat The matrix to set.
 */
goog.vec.Matrix3.setIdentity = function(mat) {
  mat[0] = 1;
  mat[1] = 0;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = 1;
  mat[5] = 0;
  mat[6] = 0;
  mat[7] = 0;
  mat[8] = 1;
};


/**
 * Performs a per-component addition of the matrices mat0 and mat1, storing
 * the result into resultMat.
 *
 * @param {goog.vec.ArrayType} mat0 The first addend.
 * @param {goog.vec.ArrayType} mat1 The second addend.
 * @param {goog.vec.ArrayType} resultMat The matrix to
 *     receive the results (may be either mat0 or mat1).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix3.add = function(mat0, mat1, resultMat) {
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
 * @param {goog.vec.ArrayType} mat0 The minuend.
 * @param {goog.vec.ArrayType} mat1 The subtrahend.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the results (may be either mat0 or mat1).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix3.subtract = function(mat0, mat1, resultMat) {
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
goog.vec.Matrix3.scale = function(mat0, scalar, resultMat) {
  resultMat[0] = mat0[0] * scalar;
  resultMat[1] = mat0[1] * scalar;
  resultMat[2] = mat0[2] * scalar;
  resultMat[3] = mat0[3] * scalar;
  resultMat[4] = mat0[4] * scalar;
  resultMat[5] = mat0[5] * scalar;
  resultMat[6] = mat0[6] * scalar;
  resultMat[7] = mat0[7] * scalar;
  resultMat[8] = mat0[8] * scalar;
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
goog.vec.Matrix3.multMat = function(mat0, mat1, resultMat) {
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
 * @param {goog.vec.ArrayType} mat The matrix to transpose.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the results (may be mat).
 * @return {goog.vec.ArrayType} return resultMat so that operations can be
 *     chained together.
 */
goog.vec.Matrix3.transpose = function(mat, resultMat) {
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
 * @param {goog.vec.ArrayType} mat0 The matrix to invert.
 * @param {goog.vec.ArrayType} resultMat The matrix to receive
 *     the result (may be mat0).
 * @return {boolean} True if the inverse is defined. If false is returned,
 *     resultMat is not modified.
 */
goog.vec.Matrix3.invert = function(mat0, resultMat) {
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
 * @param {goog.vec.ArrayType} mat0 The first matrix.
 * @param {goog.vec.ArrayType} mat1 The second matrix.
 * @return {boolean} True if the the two matrices are equivalent.
 */
goog.vec.Matrix3.equals = function(mat0, mat1) {
  return mat0.length == mat1.length &&
      mat0[0] == mat1[0] && mat0[1] == mat1[1] && mat0[2] == mat1[2] &&
      mat0[3] == mat1[3] && mat0[4] == mat1[4] && mat0[5] == mat1[5] &&
      mat0[6] == mat1[6] && mat0[7] == mat1[7] && mat0[8] == mat1[8];
};


/**
 * Transforms the given vector with the given matrix storing the resulting,
 * transformed matrix into resultVec.
 *
 * @param {goog.vec.ArrayType} mat The matrix supplying the
 *     transformation.
 * @param {goog.vec.ArrayType} vec The vector to transform.
 * @param {goog.vec.ArrayType} resultVec The vector to
 *     receive the results (may be vec).
 * @return {goog.vec.ArrayType} return resultVec so that operations can be
 *     chained together.
 */
goog.vec.Matrix3.multVec3 = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2];
  resultVec[0] = x * mat[0] + y * mat[3] + z * mat[6];
  resultVec[1] = x * mat[1] + y * mat[4] + z * mat[7];
  resultVec[2] = x * mat[2] + y * mat[5] + z * mat[8];
  return resultVec;
};


/**
 * Initializes the given 3x3 matrix as a translation matrix with x and y
 * translation values.
 *
 * @param {goog.vec.ArrayType} mat The 3x3 (9-element) matrix
 *     array to receive the new translation matrix.
 * @param {number} x The translation along the x axis.
 * @param {number} y The translation along the y axis.
 */
goog.vec.Matrix3.makeTranslate = function(mat, x, y) {
  goog.vec.Matrix3.setIdentity(mat);
  goog.vec.Matrix3.setColumnValues(mat, 2, x, y, 1);
};


/**
 * Initializes the given 3x3 matrix as a scale matrix with x, y and z scale
 * factors.
 * @param {goog.vec.ArrayType} mat The 3x3 (9-element) matrix
 *     array to receive the new scale matrix.
 * @param {number} x The scale along the x axis.
 * @param {number} y The scale along the y axis.
 * @param {number} z The scale along the z axis.
 */
goog.vec.Matrix3.makeScale = function(mat, x, y, z) {
  goog.vec.Matrix3.setIdentity(mat);
  goog.vec.Matrix3.setDiagonalValues(mat, x, y, z);
};


/**
 * Initializes the given 3x3 matrix as a rotation matrix with the given rotation
 * angle about the axis defined by the vector (ax, ay, az).
 * @param {goog.vec.ArrayType} mat The 3x3 (9-element) matrix
 *     array to receive the new scale matrix.
 * @param {number} angle The rotation angle in radians.
 * @param {number} ax The x component of the rotation axis.
 * @param {number} ay The y component of the rotation axis.
 * @param {number} az The z component of the rotation axis.
 */
goog.vec.Matrix3.makeAxisAngleRotate = function(
    mat, angle, ax, ay, az) {
  var c = Math.cos(angle);
  var d = 1 - c;
  var s = Math.sin(angle);

  goog.vec.Matrix3.setFromValues(mat,
      ax * ax * d + c,
      ax * ay * d + az * s,
      ax * az * d - ay * s,

      ax * ay * d - az * s,
      ay * ay * d + c,
      ay * az * d + ax * s,

      ax * az * d + ay * s,
      ay * az * d - ax * s,
      az * az * d + c);
};
