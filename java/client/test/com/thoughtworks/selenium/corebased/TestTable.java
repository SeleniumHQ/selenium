/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy.

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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Ignore;
import org.junit.Test;

public class TestTable extends InternalSelenseTestBase {
  /* See http://code.google.com/p/selenium/issues/detail?id=2286 */
  @Test @Ignore
  public void getValueFramTableTwiceInARowShouldWork() throws Exception {
    selenium.open("../tests/html/test_table.html");

    String value1 = selenium.getTable("test_table.0.0");
    String value2 = selenium.getTable("test_table.0.0");
    assertEquals("cell 1", value1);
    assertEquals(value1, value2);
  }
}
