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

package org.openqa.selenium.remote;

import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;

import java.util.concurrent.atomic.AtomicBoolean;

@RunWith(JUnit4.class)
public class RemoteWebDriverInitializationTest {
  private boolean stopClientCalled = false;
  private boolean quitCalled = false;

  @Test
  public void testStopsClientIfStartClientFails() {
    RemoteWebDriver driver = mock(RemoteWebDriver.class);
    doThrow(new RuntimeException("Stub client that should fail")).when(driver).startClient();
    boolean exceptionThrown = false;
    AtomicBoolean stopCalled = new AtomicBoolean(false);

    try {
      new BadStartClientRemoteWebDriver(mock(CommandExecutor.class),
                                        new DesiredCapabilities(),
                                        stopCalled);
    } catch (RuntimeException e) {
      assertTrue(e.getMessage().contains("Stub client that should fail"));

      exceptionThrown = true;
    }

    assertTrue(exceptionThrown);
    assertTrue(stopClientCalled);
  }

  @Test
  public void testQuitsIfStartSessionFails() {
    boolean exceptionThrown = false;

    try {
      new BadStartSessionRemoteWebDriver(mock(CommandExecutor.class),
                                         new DesiredCapabilities());
    } catch (RuntimeException e) {
      assertTrue(e.getMessage().contains("Stub session that should fail"));

      exceptionThrown = true;
    }

    assertTrue(exceptionThrown);
    assertTrue(quitCalled);
  }

  private class BadStartClientRemoteWebDriver extends RemoteWebDriver {
    public BadStartClientRemoteWebDriver(CommandExecutor executor,
                                         Capabilities desiredCapabilities,
                                         AtomicBoolean stopCalled) {
      super(executor, desiredCapabilities);
    }

    @Override
    protected void startClient() {
      throw new RuntimeException("Stub client that should fail");
    }

    @Override
    protected void stopClient() {
      stopClientCalled = true;
    }
  }

  private class BadStartSessionRemoteWebDriver extends RemoteWebDriver {
    public BadStartSessionRemoteWebDriver(CommandExecutor executor,
                                          Capabilities desiredCapabilities) {
      super(executor, desiredCapabilities);
    }

    @Override
    protected void startSession(Capabilities desiredCapabilities) {
      throw new RuntimeException("Stub session that should fail");
    }

    @Override
    public void quit() {
      quitCalled = true;
    }
  }
}
