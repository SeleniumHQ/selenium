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

import org.openqa.selenium.WebDriverException;

/**
 * @deprecated Web SQL has been deprecated, see
 *     http://dev.w3.org/html5/webdatabase/
 */
@Deprecated
public interface DatabaseStorage {

  /**
   * Executes an SQL statement on the given database name.
   * 
   * @param databaseName The database name
   * @param query The SQL query
   * @param args Optional arguments to the SQL query
   * @return A {@link ResultSet} containing the result of the executed query
   * @throws WebDriverException
   */
  ResultSet executeSQL(String databaseName, String query, Object... args) throws WebDriverException;
}
