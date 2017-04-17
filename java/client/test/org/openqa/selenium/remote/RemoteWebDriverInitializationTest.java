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

import java.util.Map;

@RunWith(JUnit4.class)
public class RemoteWebDriverInitializationTest {
  private boolean stopClientCalled = false;
  private boolean quitCalled = false;
  private boolean executeQuitCalled = false;

  @Test
  public void testStopsClientIfStartClientFails() {
    RemoteWebDriver driver = mock(RemoteWebDriver.class);
    doThrow(new RuntimeException("Stub client that should fail")).when(driver).startClient();
    boolean exceptionThrown = false;

    try {
      new BadStartClientRemoteWebDriver(mock(CommandExecutor.class),
                                        new DesiredCapabilities(),
                                        new DesiredCapabilities());
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
                                         new DesiredCapabilities(),
                                         new DesiredCapabilities());
    } catch (RuntimeException e) {
      assertTrue(e.getMessage().contains("Stub session that should fail"));

      exceptionThrown = true;
    }

    assertTrue(exceptionThrown);
    assertTrue(quitCalled);
  }

  @Test
  public void testIgnoresIfQuitFails() {
    RemoteWebDriver badExecuteQuit = new BadExecuteQuitRemoteWebDriver(mock(CommandExecutor.class),
                                       new DesiredCapabilities(),
                                       new DesiredCapabilities());
    badExecuteQuit.quit();
    assertTrue(executeQuitCalled);
  }

  private class BadStartClientRemoteWebDriver extends RemoteWebDriver {
    public BadStartClientRemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities,
                                         Capabilities requiredCapabilities) {
      super(executor, desiredCapabilities, requiredCapabilities);
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
    public BadStartSessionRemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities,
                                         Capabilities requiredCapabilities) {
      super(executor, desiredCapabilities, requiredCapabilities);
    }

    @Override
    protected void startSession(Capabilities desiredCapabilities,
                                Capabilities requiredCapabilities) {
      throw new RuntimeException("Stub session that should fail");
    }

    @Override
    public void quit() {
      quitCalled = true;
    }
  }

  private class BadExecuteQuitRemoteWebDriver extends RemoteWebDriver {
    public BadExecuteQuitRemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities,
                                         Capabilities requiredCapabilities) {
      super(executor, desiredCapabilities, requiredCapabilities);
    }

    @Override
    protected Response execute(String driverCommand, Map<String, ?> parameters) {
      if (driverCommand.equals(DriverCommand.QUIT)) {
        executeQuitCalled = true;
        throw new UnreachableBrowserException("Browser died before reporting its termination");
      } else if (driverCommand.equals(DriverCommand.NEW_SESSION)) {
        Response response = new Response(new SessionId("foo"));
        DesiredCapabilities capabilities = new DesiredCapabilities();
        response.setValue(capabilities.asMap());
        return response;
      }
      return null;
    }
  }
}
