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

public class ConfigureTimeoutTest {

//  private WebDriver.Timeouts timeouts;
//  private TemporaryFilesystem tempFs;
//  private File tempDir;
//  private Session session;
//
//  private String[] timeoutTypes = new String[]{"implicit", "page load", "script"};
//
//  @Before
//  public void setUp() {
//    DriverFactory driverFactory = mock(DriverFactory.class);
//    timeouts = mock(WebDriver.Timeouts.class);
//    WebDriver.Options options = mock(WebDriver.Options.class);
//    WebDriver driver = mock(WebDriver.class);
//    when(driverFactory.newInstance(any(Capabilities.class))).thenReturn(driver);
//    when(driver.manage()).thenReturn(options);
//    when(driver.manage().timeouts()).thenReturn(timeouts);
//    tempDir = Files.createTempDir();
//    tempFs = TemporaryFilesystem.getTmpFsBasedOn(tempDir);
//    Capabilities caps = new DesiredCapabilities(BrowserType.FIREFOX, "10", Platform.ANY);
//    session = DefaultSession.createSession(driverFactory, tempFs, caps);
//  }
//
//  @After
//  public void cleanUp() {
//    tempFs.deleteTemporaryFiles();
//    tempDir.delete();
//  }
//
//  @Test
//  public void shouldAcceptW3CCompliantPayLoadForTimeouts() throws Exception {
//    for (String timeoutType : timeoutTypes) {
//      runW3CAssertion(ImmutableMap.of(timeoutType, 100));
//    }
//    verify(timeouts).implicitlyWait(Duration.ofMillis(100));
//    verify(timeouts).pageLoadTimeout(Duration.ofMillis(100));
//    verify(timeouts).setScriptTimeout(Duration.ofMillis(100));
//    verifyNoMoreInteractions(timeouts);
//  }
//
//  @Test
//  public void shouldAcceptW3CCompliantPayLoadWithMultipleTimeouts() throws Exception {
//    runW3CAssertion(ImmutableMap.of("implicit", 100, "page load", 100, "script", 100));
//    verify(timeouts).implicitlyWait(Duration.ofMillis(100));
//    verify(timeouts).pageLoadTimeout(Duration.ofMillis(100));
//    verify(timeouts).setScriptTimeout(Duration.ofMillis(100));
//    verifyNoMoreInteractions(timeouts);
//  }
//
//  @Test
//  public void shouldAcceptJsonWireProtocolCompliantPayLoadForTimeouts() throws Exception {
//    for (String timeoutType : timeoutTypes) {
//      runOSSAssertion(timeoutType, 100);
//    }
//    verify(timeouts).implicitlyWait(Duration.ofMillis(100));
//    verify(timeouts).pageLoadTimeout(Duration.ofMillis(100));
//    verify(timeouts).setScriptTimeout(Duration.ofMillis(100));
//    verifyNoMoreInteractions(timeouts);
//  }
//
//  @Test
//  public void shouldThrowExceptionWhenIncorrectTimeoutTypeSpecifiedForJsonSpec() {
//    assertThatExceptionOfType(WebDriverException.class)
//        .isThrownBy(() -> runOSSAssertion("unknown", 100))
//        .withMessageStartingWith("Unknown wait type: unknown");
//  }
//
//  @Test
//  public void shouldThrowExceptionWhenIncorrectTimeoutTypeSpecifiedForW3CSpec() {
//    assertThatExceptionOfType(WebDriverException.class)
//        .isThrownBy(() -> runW3CAssertion(ImmutableMap.of("unknown", 100)))
//        .withMessageStartingWith("Unknown wait type");
//  }
//
//  @Test
//  public void shouldThrowExceptionWhenInvalidTimeoutValueSpecifiedForJsonSpec() {
//    assertThatExceptionOfType(WebDriverException.class)
//        .isThrownBy(() -> runOSSAssertion("implicit", "timeout"))
//        .withMessageStartingWith("Illegal (non-numeric) timeout value passed: timeout");
//  }
//
//  @Test
//  public void shouldThrowExceptionWhenInvalidTimeoutValueSpecifiedForW3CSpec() {
//    assertThatExceptionOfType(WebDriverException.class)
//        .isThrownBy(() -> runW3CAssertion(ImmutableMap.of("implicit", "timeout")))
//        .withMessageStartingWith("Illegal (non-numeric) timeout value passed: timeout");
//  }
//
//  private void runW3CAssertion(Map<String, Object> args) throws Exception {
//    ConfigureTimeout configureTimeout = new ConfigureTimeout(session);
//    configureTimeout.setJsonParameters(args);
//    configureTimeout.call();
//  }
//
//  private void runOSSAssertion(String type, Object timeout) throws Exception {
//    ConfigureTimeout configureTimeout = new ConfigureTimeout(session);
//    configureTimeout.setJsonParameters(ImmutableMap.of("type", type, "ms", timeout));
//    configureTimeout.call();
//  }
}
