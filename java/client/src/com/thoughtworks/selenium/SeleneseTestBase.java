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


import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Method;
import java.util.regex.Pattern;

/**
 * Provides a base class that implements some handy functionality for Selenium testing (you are
 * <i>not</i> required to extend this class).
 *
 * <p>
 * This class adds a number of "verify" commands, which are like "assert" commands, but they don't
 * stop the test when they fail. Instead, verification errors are all thrown at once during
 * tearDown.
 * </p>
 *
 * @author Nelson Sproul (nsproul@bea.com) Mar 13-06
 * @deprecated The RC interface will be removed in Selenium 3.0. Please migrate to using WebDriver.
 */
@Deprecated
@SuppressWarnings("JavaDoc")
public class SeleneseTestBase {

  private static final boolean THIS_IS_WINDOWS = File.pathSeparator.equals(";");

  private boolean captureScreenShotOnFailure = false;

  /** Use this object to run all of your selenium tests */
  protected Selenium selenium;

  protected StringBuffer verificationErrors = new StringBuffer();

  public SeleneseTestBase() {
    super();
  }

  /**
   * Calls this.setUp(null)
   *
   * @see #setUp(String)
   * @throws Exception because why not
   */
  public void setUp() throws Exception {
    this.setUp(null);
  }


  /**
   * Calls this.setUp with the specified url and a default browser. On Windows, the default browser
   * is *iexplore; otherwise, the default browser is *firefox.
   *
   * @see #setUp(String, String)
   * @param url the baseUrl to use for your Selenium tests
   * @throws Exception just in case
   *
   */
  public void setUp(String url) throws Exception {
    setUp(url, runtimeBrowserString());
  }

  protected String runtimeBrowserString() {
    String defaultBrowser = System.getProperty("selenium.defaultBrowser");
    if (null != defaultBrowser && defaultBrowser.startsWith("${")) {
      defaultBrowser = null;
    }
    if (defaultBrowser == null) {
      if (THIS_IS_WINDOWS) {
        defaultBrowser = "*iexplore";
      } else {
        defaultBrowser = "*firefox";
      }
    }
    return defaultBrowser;
  }

  /**
   * Creates a new DefaultSelenium object and starts it using the specified baseUrl and browser
   * string. The port is selected as follows: if the server package's RemoteControlConfiguration
   * class is on the classpath, that class' default port is used. Otherwise, if the "server.port"
   * system property is specified, that is used - failing that, the default of 4444 is used.
   *
   * @see #setUp(String, String, int)
   * @param url the baseUrl for your tests
   * @param browserString the browser to use, e.g. *firefox
   * @throws Exception throws them all!
   */
  public void setUp(String url, String browserString) throws Exception {
    setUp(url, browserString, getDefaultPort());
  }

  protected int getDefaultPort() {
    try {
      Class<?> c = Class.forName("org.openqa.selenium.server.RemoteControlConfiguration");
      Method getDefaultPort = c.getMethod("getDefaultPort");
      Integer portNumber = (Integer) getDefaultPort.invoke(null);
      return portNumber.intValue();
    } catch (Exception e) {
      return Integer.getInteger("selenium.port", 4444).intValue();
    }
  }

  /**
   * Creates a new DefaultSelenium object and starts it using the specified baseUrl and browser
   * string. The port is selected as follows: if the server package's RemoteControlConfiguration
   * class is on the classpath, that class' default port is used. Otherwise, if the "server.port"
   * system property is specified, that is used - failing that, the default of 4444 is used.
   *
   * @see #setUp(String, String, int)
   * @param url the baseUrl for your tests
   * @param browserString the browser to use, e.g. *firefox
   * @param port the port that you want to run your tests on
   * @throws Exception exception all the things!
   */
  public void setUp(String url, String browserString, int port) throws Exception {
    if (url == null) {
      url = "http://localhost:" + port;
    }
    selenium = new DefaultSelenium("localhost", port, browserString, url);
    selenium.start();
  }

  /** Like assertTrue, but fails at the end of the test (during tearDown)
   * @param b boolean to verify is true
   */
  public void verifyTrue(boolean b) {
    try {
      assertTrue(b);
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertFalse, but fails at the end of the test (during tearDown)
   * @param b boolean to verify is false
   */
  public void verifyFalse(boolean b) {
    try {
      assertFalse(b);
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** @return  the body text of the current page */
  public String getText() {
    return selenium.getEval("this.page().bodyText()");
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown)
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public void verifyEquals(Object expected, Object actual) {
    try {
      assertEquals(expected, actual);
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown)
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public void verifyEquals(boolean expected, boolean actual) {
    try {
      assertEquals(Boolean.valueOf(expected), Boolean.valueOf(actual));
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like JUnit's Assert.assertEquals, but knows how to compare string arrays
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public static void assertEquals(Object expected, Object actual) {
    if (expected == null) {
      assertTrue("Expected \"" + expected + "\" but saw \"" + actual + "\" instead", actual == null);
    } else if (expected instanceof String && actual instanceof String) {
      assertEquals((String) expected, (String) actual);
    } else if (expected instanceof String && actual instanceof String[]) {
      assertEquals((String) expected, (String[]) actual);
    } else if (expected instanceof String && actual instanceof Number) {
      assertEquals((String) expected, actual.toString());
    } else if (expected instanceof Number && actual instanceof String) {
      assertEquals(expected.toString(), (String) actual);
    } else if (expected instanceof String[] && actual instanceof String[]) {
      assertEquals((String[]) expected, (String[]) actual);
    } else {
      assertTrue("Expected \"" + expected + "\" but saw \"" + actual + "\" instead",
          expected.equals(actual));
    }
  }

  /** Like JUnit's Assert.assertEquals, but handles "regexp:" strings like HTML Selenese
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public static void assertEquals(String expected, String actual) {
    assertTrue("Expected \"" + expected + "\" but saw \"" + actual + "\" instead",
        seleniumEquals(expected, actual));
  }

  /**
   * Like JUnit's Assert.assertEquals, but joins the string array with commas, and handles "regexp:"
   * strings like HTML Selenese
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public static void assertEquals(String expected, String[] actual) {
    assertEquals(expected, join(actual, ','));
  }

  /**
   * Compares two strings, but handles "regexp:" strings like HTML Selenese
   *
   * @param expectedPattern expression of expected
   * @param actual expression of actual
   * @return true if actual matches the expectedPattern, or false otherwise
   */
  public static boolean seleniumEquals(String expectedPattern, String actual) {
    if (expectedPattern == null || actual == null) {
      return expectedPattern == null && actual == null;
    }
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
    b = handleRegex("regexpi:", expectedPattern, actual, Pattern.CASE_INSENSITIVE);
    if (b != null) {
      return b.booleanValue();
    }
    b = handleRegex("regexi:", expectedPattern, actual, Pattern.CASE_INSENSITIVE);
    if (b != null) {
      return b.booleanValue();
    }

    if (expectedPattern.startsWith("exact:")) {
      String expectedExact = expectedPattern.replaceFirst("exact:", "");
      if (!expectedExact.equals(actual)) {
        System.out.println("expected " + actual + " to match " + expectedPattern);
        return false;
      }
      return true;
    }

    String expectedGlob = expectedPattern.replaceFirst("glob:", "");
    expectedGlob = expectedGlob.replaceAll("([\\]\\[\\\\{\\}$\\(\\)\\|\\^\\+.])", "\\\\$1");

    expectedGlob = expectedGlob.replaceAll("\\*", ".*");
    expectedGlob = expectedGlob.replaceAll("\\?", ".");
    if (!Pattern.compile(expectedGlob, Pattern.DOTALL).matcher(actual).matches()) {
      System.out.println("expected \"" + actual + "\" to match glob \"" + expectedPattern
          + "\" (had transformed the glob into regexp \"" + expectedGlob + "\"");
      return false;
    }
    return true;
  }

  private static Boolean handleRegex(String prefix, String expectedPattern, String actual, int flags) {
    if (expectedPattern.startsWith(prefix)) {
      String expectedRegEx = expectedPattern.replaceFirst(prefix, ".*") + ".*";
      Pattern p = Pattern.compile(expectedRegEx, flags);
      if (!p.matcher(actual).matches()) {
        System.out.println("expected " + actual + " to match regexp " + expectedPattern);
        return Boolean.FALSE;
      }
      return Boolean.TRUE;
    }
    return null;
  }

  /**
   * Compares two objects, but handles "regexp:" strings like HTML Selenese
   *
   * @see #seleniumEquals(String, String)
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   * @return true if actual matches the expectedPattern, or false otherwise
   */
  public static boolean seleniumEquals(Object expected, Object actual) {
    if (expected == null) {
      return actual == null;
    }
    if (expected instanceof String && actual instanceof String) {
      return seleniumEquals((String) expected, (String) actual);
    }
    return expected.equals(actual);
  }

  /** Asserts that two string arrays have identical string contents
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public static void assertEquals(String[] expected, String[] actual) {
    String comparisonDumpIfNotEqual = verifyEqualsAndReturnComparisonDumpIfNot(expected, actual);
    if (comparisonDumpIfNotEqual != null) {
      throw new AssertionError(comparisonDumpIfNotEqual);
    }
  }

  /**
   * Asserts that two string arrays have identical string contents (fails at the end of the test,
   * during tearDown)
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public void verifyEquals(String[] expected, String[] actual) {
    String comparisonDumpIfNotEqual = verifyEqualsAndReturnComparisonDumpIfNot(expected, actual);
    if (comparisonDumpIfNotEqual != null) {
      verificationErrors.append(comparisonDumpIfNotEqual);
    }
  }

  private static String verifyEqualsAndReturnComparisonDumpIfNot(String[] expected, String[] actual) {
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

  private static String throwableToString(Throwable t) {
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    t.printStackTrace(pw);
    return sw.toString();
  }

  public static String join(String[] sa, char c) {
    StringBuffer sb = new StringBuffer();
    for (int j = 0; j < sa.length; j++) {
      sb.append(sa[j]);
      if (j < sa.length - 1) {
        sb.append(c);
      }
    }
    return sb.toString();
  }

  /** Like assertNotEquals, but fails at the end of the test (during tearDown)
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public void verifyNotEquals(Object expected, Object actual) {
    try {
      assertNotEquals(expected, actual);
    } catch (AssertionError e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertNotEquals, but fails at the end of the test (during tearDown)
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public void verifyNotEquals(boolean expected, boolean actual) {
    try {
      assertNotEquals(Boolean.valueOf(expected), Boolean.valueOf(actual));
    } catch (AssertionError e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Asserts that two objects are not the same (compares using .equals())
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public static void assertNotEquals(Object expected, Object actual) {
    if (expected == null) {
      assertFalse("did not expect null to be null", actual == null);
    } else if (expected.equals(actual)) {
      fail("did not expect (" + actual + ") to be equal to (" + expected + ")");
    }
  }

  public static void fail(String message) {
    throw new AssertionError(message);
  }

  static public void assertTrue(String message, boolean condition) {
    if (!condition) fail(message);
  }

  static public void assertTrue(boolean condition) {
    assertTrue(null, condition);
  }

  static public void assertFalse(String message, boolean condition) {
    assertTrue(message, !condition);
  }

  static public void assertFalse(boolean condition) {
    assertTrue(null, !condition);
  }

  /** Asserts that two booleans are not the same
   * @param actual the actual object expected
   * @param expected object that you want to compare to actual
   */
  public static void assertNotEquals(boolean expected, boolean actual) {
    assertNotEquals(Boolean.valueOf(expected), Boolean.valueOf(actual));
  }

  /** Sleeps for the specified number of milliseconds
   * @param millisecs number of
   */
  public void pause(int millisecs) {
    try {
      Thread.sleep(millisecs);
    } catch (InterruptedException e) {}
  }

  /**
   * Asserts that there were no verification errors during the current test, failing immediately if
   * any are found
   */
  public void checkForVerificationErrors() {
    String verificationErrorString = verificationErrors.toString();
    clearVerificationErrors();
    if (!"".equals(verificationErrorString)) {
      fail(verificationErrorString);
    }
  }

  /** Clears out the list of verification errors */
  public void clearVerificationErrors() {
    verificationErrors = new StringBuffer();
  }

  /** checks for verification errors and stops the browser
   * @throws Exception actually, just AssertionError, but someone was lazy?
   */
  public void tearDown() throws Exception {
    try {
      checkForVerificationErrors();
    } finally {
      if (selenium != null) {
        selenium.stop();
        selenium = null;
      }
    }
  }

  protected boolean isCaptureScreenShotOnFailure() {
    return captureScreenShotOnFailure;
  }

  protected void setCaptureScreenShotOnFailure(boolean captureScreenShotOnFailure) {
    this.captureScreenShotOnFailure = captureScreenShotOnFailure;
  }
}
