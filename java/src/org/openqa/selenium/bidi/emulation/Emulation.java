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

package org.openqa.selenium.bidi.emulation;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.internal.Require;

public class Emulation {
  private final HasBiDi driver;

  public Emulation(WebDriver driver) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver must implement BiDi interface");
    }

    this.driver = (HasBiDi) driver;
  }

  public void setGeolocationOverride(SetGeolocationOverrideParameters parameters) {
    send("emulation.setGeolocationOverride", parameters);
  }

  public void setTimezoneOverride(SetTimezoneOverrideParameters parameters) {
    send("emulation.setTimezoneOverride", parameters);
  }

  public void setScriptingEnabled(SetScriptingEnabledParameters parameters) {
    send("emulation.setScriptingEnabled", parameters);
  }

  public void setUserAgentOverride(SetUserAgentOverrideParameters parameters) {
    send("emulation.setUserAgentOverride", parameters);
  }

  public void setScreenOrientationOverride(SetScreenOrientationOverrideParameters parameters) {
    send("emulation.setScreenOrientationOverride", parameters);
  }

  public void setNetworkConditions(SetNetworkConditionsParameters parameters) {
    send("emulation.setNetworkConditions", parameters);
  }

  public void setScreenSettingsOverride(SetScreenSettingsOverrideParameters parameters) {
    send("emulation.setScreenSettingsOverride", parameters);
  }

  private void send(String command, OverrideParameters parameters) {
    Require.nonNull("Parameters", parameters);
    driver.getBiDi().send(new Command<>(command, parameters.toMap()));
  }
}
