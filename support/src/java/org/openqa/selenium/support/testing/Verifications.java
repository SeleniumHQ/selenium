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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.support.testing.Assertions.assertNotEquals;
import static org.openqa.selenium.support.testing.Assertions.verifyEqualsAndReturnComparisonDumpIfNot;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.rules.Verifier;

public class Verifications extends Verifier {
  protected StringBuilder verificationErrors = new StringBuilder();

  @Override
  protected void verify() throws Throwable {
    String verificationErrorString = verificationErrors.toString();
    clearVerificationErrors();
    if (!"".equals(verificationErrorString)) {
      fail(verificationErrorString);
    }
  }
  
   /** Clears out the list of verification errors */
  public void clearVerificationErrors() {
    verificationErrors = new StringBuilder();
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown) */
  public void verifyEquals(Object s1, Object s2) {
    try {
      assertEquals(s1, s2);
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertEquals, but fails at the end of the test (during tearDown) */
  public void verifyEquals(boolean s1, boolean s2) {
    try {
      assertEquals(new Boolean(s1), new Boolean(s2));
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertTrue, but fails at the end of the test (during tearDown) */
  public void verifyTrue(boolean b) {
    try {
      assertTrue(b);
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertFalse, but fails at the end of the test (during tearDown) */
  public void verifyFalse(boolean b) {
    try {
      assertFalse(b);
    } catch (Error e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /**
   * Asserts that two string arrays have identical string contents (fails at the
   * end of the test, during tearDown)
   */
  public void verifyEquals(String[] s1, String[] s2) {
    String comparisonDumpIfNotEqual = verifyEqualsAndReturnComparisonDumpIfNot(
        s1, s2);
    if (comparisonDumpIfNotEqual != null) {
      verificationErrors.append(comparisonDumpIfNotEqual);
    }
  }

  /** Like assertNotEquals, but fails at the end of the test (during tearDown) */
  public void verifyNotEquals(Object s1, Object s2) {
    try {
      assertNotEquals(s1, s2);
    } catch (AssertionError e) {
      verificationErrors.append(throwableToString(e));
    }
  }

  /** Like assertNotEquals, but fails at the end of the test (during tearDown) */
  public void verifyNotEquals(boolean s1, boolean s2) {
    try {
      assertNotEquals(new Boolean(s1), new Boolean(s2));
    } catch (AssertionError e) {
      verificationErrors.append(throwableToString(e));
    }
  }
  
  protected String throwableToString(Throwable t) {
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    t.printStackTrace(pw);
    return sw.toString();
  }
}
