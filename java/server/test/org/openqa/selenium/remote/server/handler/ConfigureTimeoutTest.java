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

package org.openqa.selenium.remote.server.handler;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.DefaultSession;
import org.openqa.selenium.remote.server.DriverFactory;
import org.openqa.selenium.remote.server.Session;

import java.io.File;
import java.util.Map;
import java.util.function.BiFunction;

@RunWith(JUnit4.class)
public class ConfigureTimeoutTest {

  @Rule
  public ExpectedException expectedEx = ExpectedException.none();

  private DriverFactory driverFactory;
  private TemporaryFilesystem tempFs;
  private File tempDir;
  private DesiredCapabilities caps;

  @Before
  public void setUp() {
    driverFactory = mock(DriverFactory.class);
    WebDriver.Timeouts timeouts = mock(WebDriver.Timeouts.class);
    WebDriver.Options options = mock(WebDriver.Options.class);
    WebDriver driver = mock(WebDriver.class);
    when(driverFactory.newInstance(any(Capabilities.class))).thenReturn(driver);
    when(driver.manage()).thenReturn(options);
    when(driver.manage().timeouts()).thenReturn(timeouts);
    tempDir = Files.createTempDir();
    tempFs = TemporaryFilesystem.getTmpFsBasedOn(tempDir);
    caps = DesiredCapabilities.firefox();
  }

  @After
  public void cleanUp() {
    tempFs.deleteTemporaryFiles();
    tempDir.delete();
  }

  @Test
  public void shouldAcceptW3cCompliantPayLoadForTimeouts() throws Exception {
    runAssertions(ImmutableMap::of, 100);
  }

  @Test
  public void shouldAcceptJsonWireProtocolCompliantPayLoadForTimeouts() throws Exception {
    runAssertions((type, timeout) -> ImmutableMap.of("type", type, "ms", timeout), 200);
  }

  @Test
  public void shouldThrowExceptionWhenIncorrectTimeoutTypeSpecifiedForJsonSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Unknown wait type: unknown");
    runAssertion((type, timeout) -> ImmutableMap.of("type", type, "ms", timeout), "unknown");
  }

  @Test
  public void shouldThrowExceptionWhenIncorrectTimeoutTypeSpecifiedForW3CSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Unknown wait type");
    runAssertion(ImmutableMap::of, "unknown");
  }

  @Test
  public void shouldThrowExceptionWhenInvalidTimeoutValueSpecifiedForJsonSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Illegal (non-numeric) timeout value passed: timeout");
    runAssertion((type, timeout) -> ImmutableMap.of("type", type, "ms", "timeout"), "implicit");
  }

  @Test
  public void shouldThrowExceptionWhenInvalidTimeoutValueSpecifiedForW3CSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Illegal (non-numeric) timeout value passed: timeout");
    runAssertion((type, timeout)-> ImmutableMap.of(type, "timeout"), "implicit");
  }

  private void runAssertions(BiFunction<String, Integer, Map<String, Object>> map, int timeout)
      throws Exception {
    String[] timeoutTypes = new String[]{"implicit", "page load", "script"};
    Session session = DefaultSession.createSession(driverFactory, tempFs, caps);
    for (String timeoutType : timeoutTypes) {
      runAssertion(session, map, timeoutType, timeout);
    }
  }

  private void runAssertion(BiFunction<String, Integer, Map<String, Object>> map,
                            String timeoutType) throws Exception {
    Session session = DefaultSession.createSession(driverFactory, tempFs, caps);
    runAssertion(session, map, timeoutType, 100);
  }

  private void runAssertion(Session session, BiFunction<String, Integer, Map<String, Object>> map,
                            String timeoutType, int timeout) throws Exception {
    ConfigureTimeout configureTimeout = new ConfigureTimeout(session);
    Map<String, Object> args = map.apply(timeoutType, timeout);
    configureTimeout.setJsonParameters(args);
    configureTimeout.call();
    String expected = String.format("[%s wait: %d]", timeoutType, timeout);
    Assert.assertEquals(expected, configureTimeout.toString());
  }
}
