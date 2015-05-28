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

import com.google.gson.JsonObject;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.concurrent.atomic.AtomicBoolean;

public class RemoteWebDriverTest extends JUnit4TestBase {
  private boolean stopClientCalled = false;
  private boolean quitCalled = false;

  @Test
  public void testStopsClientIfStartClientFails() {
    if (!(driver instanceof RemoteWebDriver)) {
      System.out.println("Skipping test: driver is not a remote webdriver");
      return;
    }

    RemoteWebDriver remote = (RemoteWebDriver) driver;
    boolean exceptionThrown = false;
    AtomicBoolean stopCalled = new AtomicBoolean(false);

    try {
      new BadStartClientRemoteWebDriver(remote.getCommandExecutor(),
                                        remote.getCapabilities(),
                                        remote.getCapabilities(),
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
    if (!(driver instanceof RemoteWebDriver)) {
      System.out.println("Skipping test: driver is not a remote webdriver");
      return;
    }

    RemoteWebDriver remote = (RemoteWebDriver) driver;
    boolean exceptionThrown = false;

    try {
      new BadStartSessionRemoteWebDriver(remote.getCommandExecutor(),
                                        remote.getCapabilities(),
                                        remote.getCapabilities());
    } catch (RuntimeException e) {
      assertTrue(e.getMessage().contains("Stub session that should fail"));

      exceptionThrown = true;
    }

    assertTrue(exceptionThrown);
    assertTrue(quitCalled);
  }

  private static void assertHasKeys(JsonObject object, String... keys) {
    for (String key : keys) {
      assertTrue("Object does not contain expected key: " + key + " (" + object + ")",
          object.has(key));
    }
  }

  private class BadStartClientRemoteWebDriver extends RemoteWebDriver {
    public BadStartClientRemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities,
                                         Capabilities requiredCapabilities, AtomicBoolean stopCalled) {
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
}
