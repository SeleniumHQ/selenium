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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;

import org.junit.After;
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
import java.util.concurrent.TimeUnit;

@RunWith(JUnit4.class)
public class ConfigureTimeoutTest {

  @Rule
  public ExpectedException expectedEx = ExpectedException.none();

  private WebDriver.Timeouts timeouts;
  private TemporaryFilesystem tempFs;
  private File tempDir;
  private Session session;

  private String[] timeoutTypes = new String[]{"implicit", "page load", "script"};

  @Before
  public void setUp() throws Exception {
    DriverFactory driverFactory = mock(DriverFactory.class);
    timeouts = mock(WebDriver.Timeouts.class);
    WebDriver.Options options = mock(WebDriver.Options.class);
    WebDriver driver = mock(WebDriver.class);
    when(driverFactory.newInstance(any(Capabilities.class))).thenReturn(driver);
    when(driver.manage()).thenReturn(options);
    when(driver.manage().timeouts()).thenReturn(timeouts);
    tempDir = Files.createTempDir();
    tempFs = TemporaryFilesystem.getTmpFsBasedOn(tempDir);
    DesiredCapabilities caps = DesiredCapabilities.firefox();
    session = DefaultSession.createSession(driverFactory, tempFs, caps);
  }

  @After
  public void cleanUp() {
    tempFs.deleteTemporaryFiles();
    tempDir.delete();
  }

  @Test
  public void shouldAcceptW3CCompliantPayLoadForTimeouts() throws Exception {
    for (String timeoutType : timeoutTypes) {
      runW3CAssertion(ImmutableMap.of(timeoutType, 100));
    }
    verify(timeouts).implicitlyWait(100, TimeUnit.MILLISECONDS);
    verify(timeouts).pageLoadTimeout(100, TimeUnit.MILLISECONDS);
    verify(timeouts).setScriptTimeout(100, TimeUnit.MILLISECONDS);
    verifyNoMoreInteractions(timeouts);
  }

  @Test
  public void shouldAcceptW3CCompliantPayLoadWithMultipleTimeouts() throws Exception {
    runW3CAssertion(ImmutableMap.of("implicit", 100, "page load", 100, "script", 100));
    verify(timeouts).implicitlyWait(100, TimeUnit.MILLISECONDS);
    verify(timeouts).pageLoadTimeout(100, TimeUnit.MILLISECONDS);
    verify(timeouts).setScriptTimeout(100, TimeUnit.MILLISECONDS);
    verifyNoMoreInteractions(timeouts);
  }

  @Test
  public void shouldAcceptJsonWireProtocolCompliantPayLoadForTimeouts() throws Exception {
    for (String timeoutType : timeoutTypes) {
      runOSSAssertion(timeoutType, 100);
    }
    verify(timeouts).implicitlyWait(100, TimeUnit.MILLISECONDS);
    verify(timeouts).pageLoadTimeout(100, TimeUnit.MILLISECONDS);
    verify(timeouts).setScriptTimeout(100, TimeUnit.MILLISECONDS);
    verifyNoMoreInteractions(timeouts);
  }

  @Test
  public void shouldThrowExceptionWhenIncorrectTimeoutTypeSpecifiedForJsonSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Unknown wait type: unknown");
    runOSSAssertion("unknown", 100);
  }

  @Test
  public void shouldThrowExceptionWhenIncorrectTimeoutTypeSpecifiedForW3CSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Unknown wait type");
    runW3CAssertion(ImmutableMap.of("unknown", 100));
  }

  @Test
  public void shouldThrowExceptionWhenInvalidTimeoutValueSpecifiedForJsonSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Illegal (non-numeric) timeout value passed: timeout");
    runOSSAssertion("implicit", "timeout");
  }

  @Test
  public void shouldThrowExceptionWhenInvalidTimeoutValueSpecifiedForW3CSpec() throws Exception {
    expectedEx.expect(WebDriverException.class);
    expectedEx.expectMessage("Illegal (non-numeric) timeout value passed: timeout");
    runW3CAssertion(ImmutableMap.of("implicit", "timeout"));
  }

  private void runW3CAssertion(Map<String, Object> args) throws Exception {
    ConfigureTimeout configureTimeout = new ConfigureTimeout(session);
    configureTimeout.setJsonParameters(args);
    configureTimeout.call();
  }

  private void runOSSAssertion(String type, Object timeout) throws Exception {
    ConfigureTimeout configureTimeout = new ConfigureTimeout(session);
    configureTimeout.setJsonParameters(ImmutableMap.of("type", type, "ms", timeout));
    configureTimeout.call();
  }
}
