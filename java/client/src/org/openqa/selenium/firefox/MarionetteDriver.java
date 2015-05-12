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

package org.openqa.selenium.firefox;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.MarionetteConnection;
import org.openqa.selenium.interactions.ActionChainExecutor;
import org.openqa.selenium.interactions.CanPerformActionChain;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.remote.RemoteActionChainExecutor;
import org.openqa.selenium.remote.RemoteExecuteMethod;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox using Marionette interface.
 */
@Beta
public class MarionetteDriver extends FirefoxDriver implements CanPerformActionChain {

  public MarionetteDriver() {
    this(new FirefoxBinary(), null);
  }

  public MarionetteDriver(FirefoxProfile profile) {
    super(profile);
  }

  public MarionetteDriver(Capabilities desiredCapabilities) {
    super(desiredCapabilities);
  }

  public MarionetteDriver(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    super(desiredCapabilities, requiredCapabilities);
  }

  public MarionetteDriver(FirefoxBinary binary, FirefoxProfile profile) {
    super(binary, profile);
  }

  public MarionetteDriver(FirefoxBinary binary, FirefoxProfile profile, Capabilities capabilities) {
    super(binary, profile, capabilities);
  }

  public MarionetteDriver(FirefoxBinary binary, FirefoxProfile profile,
                          Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    super(binary, profile, desiredCapabilities, requiredCapabilities);
  }

  protected ExtensionConnection connectTo(FirefoxBinary binary, FirefoxProfile profile,
      String host) {
    Lock lock = obtainLock(profile);
    try {
      FirefoxBinary bin = binary == null ? new FirefoxBinary() : binary;

      return new MarionetteConnection(lock, bin, profile, host);
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
  }

  public ActionChainExecutor getActionChainExecutor() {
    return new RemoteActionChainExecutor(new RemoteExecuteMethod(this));
  }
}
