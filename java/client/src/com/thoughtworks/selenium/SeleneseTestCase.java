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

import junit.framework.TestCase;

/**
 * Provides a JUnit TestCase base class that implements some handy functionality for Selenium
 * testing (you are <i>not</i> required to extend this class).
 *
 * <p>
 * This class adds a number of "verify" commands, which are like "assert" commands, but they don't
 * stop the test when they fail. Instead, verification errors are all thrown at once during
 * tearDown.
 * </p>
 *
 * @author Nelson Sproul (nsproul@bea.com) Mar 13-06
 * @deprecated Please consider updating to junit 4 or above
 */
@Deprecated
@SuppressWarnings("JavaDoc")
public class SeleneseTestCase extends TestCase {

  private SeleneseTestBase stb = new SeleneseTestBase();

  /** Use this object to run all of your selenium tests */
  protected Selenium selenium;

  public SeleneseTestCase() {
    super();
  }


  public SeleneseTestCase(String name) {
    super(name);
  }

  /**
   * Asserts that there were no verification errors during the current test, failing immediately if
   * any are found
   */
  public void checkForVerificationErrors() {
    stb.checkForVerificationErrors();
  }

  /** Clears out the list of verification errors */
  public void clearVerificationErrors() {
    stb.clearVerificationErrors();
  }

  /** @return  the body text of the current page */
  public String getText() {
    return stb.getText();
  }

  /** Sleeps for the specified number of milliseconds
   * @param millisecs number of
   */
  public void pause(int millisecs) {
    stb.pause(millisecs);
  }

  /**
   * Calls this.setUp(null)
   *
   * @see #setUp(String)
   */
  @Override
  public void setUp() throws Exception {
    stb.setUp();
    selenium = stb.selenium;
  }

  /**
   * Calls this.setUp with the specified url and a default browser. On Windows, the default browser
   * is *iexplore; otherwise, the default browser is *firefox.
   *
   * @see #setUp(String, String)
   * @param url the baseUrl to use for your Selenium tests
   * @throws Exception yep, generic Exception
   *
   */
  public void setUp(String url) throws Exception {
    stb.setUp(url);
    selenium = stb.selenium;
  }

  /**
   * Creates a new DefaultSelenium object and starts it using the specified baseUrl and browser
   * string
   *
   * @param url the baseUrl for your tests
   * @param browserString the browser to use, e.g. *firefox
   * @throws Exception yep, generic Exception
   */
  public void setUp(String url, String browserString) throws Exception {
    stb.setUp(url, browserString);
    selenium = stb.selenium;
  }

  /**
   * Creates a new DefaultSelenium object and starts it using the specified baseURL, browser string
   * and port
   *
   * @param url the baseUrl for your tests
   * @param browserString the browser to use, e.g. *firefox
   * @param port the port of Selenium RC
   * @throws Exception yep, generic Exception
   */
  public void setUp(String url, String browserString, int port) throws Exception {
    stb.setUp(url, browserString, port);
    selenium = stb.selenium;
  }

  /** checks for verification errors and stops the browser */
  @Override
  public void tearDown() throws Exception {
    stb.tearDown();
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown)
   * @param arg1 to compare to arg2
   * @param arg2 to compare to arg1
   */
  public void verifyEquals(boolean arg1, boolean arg2) {
    stb.verifyEquals(arg1, arg2);
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown)
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public void verifyEquals(Object s1, Object s2) {
    stb.verifyEquals(s1, s2);
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown)
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public void verifyEquals(String[] s1, String[] s2) {
    stb.verifyEquals(s1, s2);
  }

  /** Like assertFalse, but fails at the end of the test (during tearDown)
   * @param b boolean to check is false
   */
  public void verifyFalse(boolean b) {
    stb.verifyFalse(b);
  }

  /** Like assertNotEquals, but fails at the end of the test (during tearDown)
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public void verifyNotEquals(boolean s1, boolean s2) {
    stb.verifyNotEquals(s1, s2);
  }

  /** Like assertNotEquals, but fails at the end of the test (during tearDown)
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public void verifyNotEquals(Object s1, Object s2) {
    stb.verifyNotEquals(s1, s2);
  }

  /** Like assertTrue, but fails at the end of the test (during tearDown)
   * @param b boolean to verify is true
   */
  public void verifyTrue(boolean b) {
    stb.verifyTrue(b);
  }

  /** Like JUnit's Assert.assertEquals, but knows how to compare string arrays
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public static void assertEquals(Object s1, Object s2) {
    SeleneseTestBase.assertEquals(s1, s2);
  }

  /** Like JUnit's Assert.assertEquals, but handles "regexp:" strings like HTML Selenese
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public static void assertEquals(String s1, String s2) {
    SeleneseTestBase.assertEquals(s1, s2);
  }

  /**
   * Like JUnit's Assert.assertEquals, but joins the string array with commas, and handles "regexp:"
   * strings like HTML Selenese
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public static void assertEquals(String s1, String[] s2) {
    SeleneseTestBase.assertEquals(s1, s2);
  }

  /** Asserts that two string arrays have identical string contents
   * @param s1 to compare to s2
   * @param s2 to compare to s1
   */
  public static void assertEquals(String[] s1, String[] s2) {
    SeleneseTestBase.assertEquals(s1, s2);
  }

  /** Asserts that two booleans are not the same
   * @param b1 to compare to b2
   * @param b2 to compare to b1
   */
  public static void assertNotEquals(boolean b1, boolean b2) {
    SeleneseTestBase.assertNotEquals(b1, b2);
  }

  /** Asserts that two objects are not the same (compares using .equals())
   * @param obj1 to compare to obj2
   * @param obj2 to compare to obj1
   */
  public static void assertNotEquals(Object obj1, Object obj2) {
    SeleneseTestBase.assertNotEquals(obj1, obj2);
  }

  /**
   * Compares two objects, but handles "regexp:" strings like HTML Selenese
   *
   * @see #seleniumEquals(String, String)
   * @param expected expression of expected
   * @param actual expression of actual
   * @return true if actual matches the expectedPattern, or false otherwise
   */
  public static boolean seleniumEquals(Object expected, Object actual) {
    return SeleneseTestBase.seleniumEquals(expected, actual);
  }

  /**
   * Compares two strings, but handles "regexp:" strings like HTML Selenese
   *
   * @param expected expression of expected
   * @param actual expression of actual
   * @return true if actual matches the expectedPattern, or false otherwise
   */
  public static boolean seleniumEquals(String expected, String actual) {
    return SeleneseTestBase.seleniumEquals(expected, actual);
  }

  protected boolean isCaptureScreenShotOnFailure() {
    return stb.isCaptureScreenShotOnFailure();
  }

  protected String runtimeBrowserString() {
    return stb.runtimeBrowserString();
  }

  protected void setCaptureScreenShotOnFailure(boolean b) {
    stb.setCaptureScreenShotOnFailure(b);
  }

  protected void setTestContext() {
    selenium.setContext(this.getClass().getSimpleName() + "." + getName());
  }

  /**
   * Runs the bare test sequence, capturing a screenshot if a test fails
   *
   * @exception Throwable if any exception is thrown
   */
  // @Override
  @Override
  public void runBare() throws Throwable {
    if (!isCaptureScreenShotOnFailure()) {
      super.runBare();
      return;
    }
    setUp();
    try {
      runTest();
    } catch (Throwable t) {
      if (selenium != null) {
        String filename = getName() + ".png";
        try {
          selenium.captureScreenshot(filename);
          System.err.println("Saved screenshot " + filename);
        } catch (Exception e) {
          System.err.println("Couldn't save screenshot " + filename + ": " + e.getMessage());
          e.printStackTrace();
        }
        throw t;
      }
    } finally {
      tearDown();
    }
  }

  public String join(String[] array, char c) {
    return SeleneseTestBase.join(array, c);
  }

}
