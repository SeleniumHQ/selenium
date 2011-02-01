/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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


package org.openqa.selenium.support.testing;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.regex.Pattern;

public class Assertions {
  /**
   * Like JUnit's Assert.assertEquals, but handles "regexp:" strings like HTML
   * Selenese
   */
  public static void assertEquals(String expected, String actual) {
    assertTrue("Expected \"" + expected + "\" but saw \"" + actual + "\" instead",
        seleniumEquals(expected, actual));
  }

  /**
   * Like JUnit's Assert.assertEquals, but joins the string array with commas,
   * and handles "regexp:" strings like HTML Selenese
   */
  public static void assertEquals(String expected, String[] actual) {
    assertEquals(expected, join(actual, ','));
  }

  private static String join(String[] sa, char c) {
    StringBuilder sb = new StringBuilder();
    for (int j = 0; j < sa.length; j++) {
      sb.append(sa[j]);
      if (j < sa.length - 1) {
        sb.append(c);
      }
    }
    return sb.toString();
  }

  /**
   * Compares two objects, but handles "regexp:" strings like HTML Selenese
   *
   * @return true if actual matches the expectedPattern, or false otherwise
   * @see #seleniumEquals(String, String)
   */
  public static boolean seleniumEquals(Object expected, Object actual) {
    if (expected instanceof String && actual instanceof String) {
      return seleniumEquals((String) expected, (String) actual);
    }
    return expected.equals(actual);
  }

  /**
   * Compares two strings, but handles "regexp:" strings like HTML Selenese
   *
   * @param expectedPattern
   * @param actual
   * @return true if actual matches the expectedPattern, or false otherwise
   */
  private static boolean seleniumEquals(String expectedPattern, String actual) {
    if (actual.startsWith("regexp:") || actual.startsWith("regex:")
        || actual.startsWith("regexpi:") || actual.startsWith("regexi:")) {
      // swap 'em
      String tmp = actual;
      actual = expectedPattern;
      expectedPattern = tmp;
    }
    Boolean b;
    b = handleRegex("regexp:", expectedPattern, actual, 0);
    if (b != null) {
      return b.booleanValue();
    }
    b = handleRegex("regex:", expectedPattern, actual, 0);
    if (b != null) {
      return b.booleanValue();
    }
    b = handleRegex("regexpi:", expectedPattern, actual,
        Pattern.CASE_INSENSITIVE);
    if (b != null) {
      return b.booleanValue();
    }
    b = handleRegex("regexi:", expectedPattern, actual,
        Pattern.CASE_INSENSITIVE);
    if (b != null) {
      return b.booleanValue();
    }

    if (expectedPattern.startsWith("exact:")) {
      String expectedExact = expectedPattern.replaceFirst("exact:", "");
      if (!expectedExact.equals(actual)) {
        System.out.println("expected " + actual + " to match "
                           + expectedPattern);
        return false;
      }
      return true;
    }

    String expectedGlob = expectedPattern.replaceFirst("glob:", "");
    expectedGlob = expectedGlob.replaceAll(
        "([\\]\\[\\\\{\\}$\\(\\)\\|\\^\\+.])", "\\\\$1");

    expectedGlob = expectedGlob.replaceAll("\\*", ".*");
    expectedGlob = expectedGlob.replaceAll("\\?", ".");
    if (!Pattern.compile(expectedGlob, Pattern.DOTALL).matcher(actual)
        .matches()) {
      System.out.println("expected \"" + actual + "\" to match glob \""
                         + expectedPattern + "\" (had transformed the glob into regexp \""
                         + expectedGlob + "\"");
      return false;
    }
    return true;
  }

  private static Boolean handleRegex(String prefix, String expectedPattern,
                                     String actual, int flags) {
    if (expectedPattern.startsWith(prefix)) {
      String expectedRegEx = expectedPattern.replaceFirst(prefix, ".*") + ".*";
      Pattern p = Pattern.compile(expectedRegEx, flags);
      if (!p.matcher(actual).matches()) {
        System.out.println("expected " + actual + " to match regexp "
                           + expectedPattern);
        return Boolean.FALSE;
      }
      return Boolean.TRUE;
    }
    return null;
  }


  protected static String verifyEqualsAndReturnComparisonDumpIfNot(String[] expected,
                                                                   String[] actual) {
    boolean misMatch = false;
    if (expected.length != actual.length) {
      misMatch = true;
    }
    for (int j = 0; j < expected.length; j++) {
      if (!seleniumEquals(expected[j], actual[j])) {
        misMatch = true;
        break;
      }
    }
    if (misMatch) {
      return "Expected " + stringArrayToString(expected) + " but saw "
             + stringArrayToString(actual);
    }
    return null;
  }

  private static String stringArrayToString(String[] sa) {
    StringBuffer sb = new StringBuffer("{");
    for (int j = 0; j < sa.length; j++) {
      sb.append(" ").append("\"").append(sa[j]).append("\"");
    }
    sb.append(" }");
    return sb.toString();
  }

  /**
   * Asserts that two objects are not the same (compares using .equals())
   */
  public static void assertNotEquals(Object expected, Object actual) {
    if (expected.equals(actual)) {
      fail("did not expect values to be equal (" + expected.toString() + ")");
    }
  }
}
