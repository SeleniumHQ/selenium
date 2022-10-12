// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package com.thoughtworks.selenium;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Arrays;

class CSVTest {

  private Method CSV;

  @BeforeEach
  public void setUp() {
    Method[] methods = HttpCommandProcessor.class.getDeclaredMethods();
    for (Method method : methods) {
      if ("parseCSV".equals(method.getName())) {
        method.setAccessible(true);
        CSV = method;
        break;
      }
    }
  }

  private String[] parseCSV(String input, String[] expected) {
    System.out.print(input + ": ");
    String[] output;
    try {
      output = (String[]) CSV.invoke(null, input);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    System.out.println(Arrays.asList(output));
    compareStringArrays(expected, output);
    return output;
  }

  @Test
  void testSimple() {
    final String input = "1,2,3";
    String[] expected = new String[]{"1", "2", "3"};
    parseCSV(input, expected);
  }

  @Test
  void testBackSlash() {
    final String input = "1,2\\,3,4"; // Java-escaped, but not CSV-escaped
    String[] expected = new String[]{"1", "2,3", "4"}; // backslash should disappear in output
    parseCSV(input, expected);
  }

  @Test
  void testRandomSingleBackSlash() {
    final String input = "1,\\2,3"; // Java-escaped, but not CSV-escaped
    String[] expected = new String[]{"1", "2", "3"}; // backslash should disappear
    parseCSV(input, expected);
  }

  @Test
  void testDoubleBackSlashBeforeComma() {
    final String input = "1,2\\\\,3"; // Java-escaped and CSV-escaped
    String[] expected = new String[]{"1", "2\\", "3"}; // one backslash should disappear in output
    parseCSV(input, expected);
  }

  @Test
  void testRandomDoubleBackSlash() {
    final String input = "1,\\\\2,3"; // Java-escaped, and CSV-escaped
    String[] expected = new String[]{"1", "\\2", "3"}; // one backslash should disappear in output
    parseCSV(input, expected);
  }

  @Test
  void testTripleBackSlashBeforeComma() {
    final String input = "1,2\\\\\\,3,4"; // Java-escaped, and CSV-escaped
    String[] expected = new String[]{"1", "2\\,3", "4"}; // one backslash should disappear in
    // output
    parseCSV(input, expected);
  }

  @Test
  void test4BackSlashesBeforeComma() {
    final String input = "1,2\\\\\\\\,3"; // Java-escaped, and CSV-escaped
    String[] expected = new String[]{"1", "2\\\\", "3"}; // two backslashes should disappear in
    // output
    parseCSV(input, expected);
  }

  private void compareStringArrays(String[] expected, String[] actual) {
    assertEquals(expected.length, actual.length, "Wrong number of elements");
    for (int i = 0; i < expected.length; i++) {
      assertEquals(expected[i], actual[i]);
    }
  }

}
