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

import java.util.List;
import java.util.Map;

public class ResultSetRows {
  private final List<Map<String, Object>> rows;

  public ResultSetRows(List<Map<String, Object>> rows) {
    this.rows = rows;
  }

  /**
   * Returns the row at the given index. The Map<ColumnName, Object> represents a mapping between
   * the column and the value of the cell as returned by the database.
   * 
   * @param index
   * @return A Map<ColumnName, Object> representing the row at the given index. If there is no such
   *         row, this returns null
   */
  public Map<String, Object> item(int index) {
    return rows.get(index);
  }

  /**
   * The number of rows returned by the database.
   * 
   * @return An integer representing the number of rows contained in the {@link ResultSetRows}
   */
  public int size() {
    return rows.size();
  }

  @Override
  public String toString() {
    StringBuilder strBuilder = new StringBuilder();
    strBuilder.append("[");
    for (int i = 0; i < rows.size(); i++) {
      strBuilder.append(rows.get(i).toString());
      if (i < rows.size() - 1) {
        strBuilder.append(", ");
      }
    }
    strBuilder.append("]");
    return strBuilder.toString();
  }
}
