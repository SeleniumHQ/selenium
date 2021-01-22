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
package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.testing.UnitTests;

/**
 * Small test for name extraction
 */
@Category(UnitTests.class)
public class WebDriverExceptionTest {
  @Test
  public void testExtractsADriverName() {
    StackTraceElement[] stackTrace = new StackTraceElement[2];
    stackTrace[0] = new StackTraceElement("SomeClass", "someMethod", "SomeClass.java", 5);
    stackTrace[1] = new StackTraceElement("TestDriver", "someMethod", "TestDriver.java", 5);

    String gotName = WebDriverException.getDriverName(stackTrace);

    assertThat(gotName).isEqualTo("TestDriver");
  }

  @Test
  public void testExtractsMostSpecificDriverName() {
    StackTraceElement[] stackTrace = new StackTraceElement[3];
    stackTrace[0] = new StackTraceElement("SomeClass", "someMethod", "SomeClass.java", 5);
    stackTrace[1] =
        new StackTraceElement("RemoteWebDriver", "someMethod", "RemoteWebDriver.java", 5);
    stackTrace[2] = new StackTraceElement("FirefoxDriver", "someMethod", "FirefoxDriver.java", 5);

    String gotName = WebDriverException.getDriverName(stackTrace);

    assertThat(gotName).isEqualTo("FirefoxDriver");
  }

  @Test
  public void testDefaultsToUnknownDriverName() {
    StackTraceElement[] stackTrace = new StackTraceElement[2];
    stackTrace[0] = new StackTraceElement("SomeClass", "someMethod", "SomeClass.java", 5);
    stackTrace[1] = new StackTraceElement("SomeOtherClass", "someMethod", "SomeOtherClass.java", 5);

    String gotName = WebDriverException.getDriverName(stackTrace);

    assertThat(gotName).isEqualTo("unknown");
  }

  @Test
  public void shouldBeAbleToGetMessageWithoutAdditionalInfo() {
    String message = "Oops!";
    WebDriverException ex = new WebDriverException(message);
    assertThat(ex.getRawMessage()).isEqualTo(message);
  }

  @Test
  public void shouldContainMessageAndAdditionalInfo() {
    String message = "Oops!";
    WebDriverException ex = new WebDriverException(message);
    assertThat(ex.getMessage())
        .contains(message, "Build info:", "System info:", "Driver info: driver.version: unknown");
  }

  @Test
  public void shouldInheritMessageFromParentException() {
    String message = "Oops!";
    WebDriverException parent = new WebDriverException(message);
    WebDriverException ex = new WebDriverException(parent);
    assertThat(ex.getMessage()).contains(message);
  }

  @Test
  public void shouldNotInheritMessageFromParentExceptionIfHasItsOwnOne() {
    String parentMessage = "Oops!";
    String myMessage = "My message";
    WebDriverException parent = new WebDriverException(parentMessage);
    WebDriverException ex = new WebDriverException(myMessage, parent);
    assertThat(ex.getMessage())
        .contains(myMessage)
        .doesNotContain(parentMessage);
  }

  @Test
  public void canContainAdditionalInformation() {
    WebDriverException ex = new WebDriverException();
    ex.addInfo("date", "today");
    ex.addInfo("time", "time unknown");
    assertThat(ex.getMessage())
        .contains("date: today", "time unknown")
        .doesNotContain("time: time unknown");
  }

}
