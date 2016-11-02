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

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.internal.BuildInfo;

import java.util.Properties;

/**
 * Small test for name extraction
 */
@RunWith(JUnit4.class)
public class WebDriverExceptionTest {
  @Test
  public void testExtractsADriverName() {
    StackTraceElement[] stackTrace = new StackTraceElement[2];
    stackTrace[0] = new StackTraceElement("SomeClass", "someMethod", "SomeClass.java", 5);
    stackTrace[1] = new StackTraceElement("TestDriver", "someMethod", "TestDriver.java", 5);

    String gotName = WebDriverException.getDriverName(stackTrace);

    assertEquals("TestDriver", gotName);
  }

  @Test
  public void testExtractsMostSpecificDriverName() {
    StackTraceElement[] stackTrace = new StackTraceElement[3];
    stackTrace[0] = new StackTraceElement("SomeClass", "someMethod", "SomeClass.java", 5);
    stackTrace[1] =
        new StackTraceElement("RemoteWebDriver", "someMethod", "RemoteWebDriver.java", 5);
    stackTrace[2] = new StackTraceElement("FirefoxDriver", "someMethod", "FirefoxDriver.java", 5);

    String gotName = WebDriverException.getDriverName(stackTrace);

    assertEquals("FirefoxDriver", gotName);

  }

  @Test
  public void testDefaultsToUnknownDriverName() {
    StackTraceElement[] stackTrace = new StackTraceElement[2];
    stackTrace[0] = new StackTraceElement("SomeClass", "someMethod", "SomeClass.java", 5);
    stackTrace[1] = new StackTraceElement("SomeOtherClass", "someMethod", "SomeOtherClass.java", 5);

    String gotName = WebDriverException.getDriverName(stackTrace);

    assertEquals("unknown", gotName);
  }

  @Test
  public void appendsSystemInformationToErrorMessage() {
    WebDriverException exception = spy(new WebDriverException());
    BuildInfo buildInfo = mock(BuildInfo.class);
    when(buildInfo.toString()).thenReturn("Build info: nope");
    doReturn(buildInfo).when(exception).getBuildInformation();
    doReturn("System info: nope").when(exception).getSystemInformation();

    assertEquals("Build info: nope\n"
                 + "System info: nope\n"
                 + "Driver info: driver.version: unknown", exception.getMessage());
  }

  @Test
  public void systemInformation() {
    Properties systemProperties = new Properties();
    systemProperties.setProperty("os.name", "win");
    systemProperties.setProperty("os.arch", "x86_64");
    systemProperties.setProperty("os.version", "95");
    systemProperties.setProperty("java.version", "1.2");

    String systemInformation = new WebDriverException("ups").getSystemInformation(systemProperties);

    assertThat(systemInformation, startsWith("System info: host: '"));
    assertThat(systemInformation, endsWith(
      "', os.name: 'win', os.arch: 'x86_64', os.version: '95', java.version: '1.2'"));
  }
}
