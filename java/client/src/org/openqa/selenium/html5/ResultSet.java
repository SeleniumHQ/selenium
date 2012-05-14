/*
Copyright 2007-2010 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.html5;

/**
 * Represents database result set for SQL transactions and queries.
 */
public class ResultSet {

  private final int insertId;
  private final int rowsAffected;
  private final ResultSetRows rows;

  public ResultSet(int insertId, int rowsAffected, ResultSetRows rows) {
    this.insertId = insertId;
    this.rowsAffected = rowsAffected;
    this.rows = rows;
  }

  /**
   * Gets the row ID of the inserted row if the statement inserted a row. If multiple rows were
   * inserted, this returns the row ID of the last row inserted. If the statement did not insert a
   * row this returns -1.
   * 
   * @return An integer representing the index of the last row inserted if any, returns -1 otherwise
   */
  public int getLastInsertedRowId() {
    return insertId;
  }

  /**
   * Gets the number of rows that were changed by the SQL statement. If the statement did not affect
   * any rows then this returns zero.
   * 
   * @return an integer representing the number of rows changed
   */
  public int getNumberOfRowsAffected() {
    return rowsAffected;
  }

  /**
   * Returns the rows returned by the statement executed in the order returned by the database. If
   * no rows were returned then the returned object will be empty.
   * 
   * @return A {@link ResultSetRows} containing the database results as returned by the database.
   *         Returns am empty {@link ResultSetRows} if no results were returned (i.e.
   *         ResultSetRowList.size() = 0)
   */
  public ResultSetRows rows() {
    return rows;
  }

  @Override
  public String toString() {
    return "[insertId: " + insertId + ", rowsAffected: " + rowsAffected + ", "
        + " rows: " + rows.toString() + "]";
  }
}
