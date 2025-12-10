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

import java.util.Map;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.internal.Require;

public class Emulation {
  private final BiDi bidi;

  public Emulation(WebDriver driver) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver must implement BiDi interface");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
  }

  public void setGeolocationOverride(SetGeolocationOverrideParameters parameters) {
    Require.nonNull("SetGeolocationOverride parameters", parameters);

    bidi.send(new Command<>("emulation.setGeolocationOverride", parameters.toMap(), Map.class));
  }

  public void setTimezoneOverride(SetTimezoneOverrideParameters parameters) {
    Require.nonNull("SetTimezoneOverride parameters", parameters);

    bidi.send(new Command<>("emulation.setTimezoneOverride", parameters.toMap(), Map.class));
  }

  public void setScriptingEnabled(SetScriptingEnabledParameters parameters) {
    Require.nonNull("SetScriptingEnabled parameters", parameters);

    bidi.send(new Command<>("emulation.setScriptingEnabled", parameters.toMap(), Map.class));
  }

  public void setUserAgentOverride(SetUserAgentOverrideParameters parameters) {
    Require.nonNull("SetUserAgentOverride parameters", parameters);

    bidi.send(new Command<>("emulation.setUserAgentOverride", parameters.toMap(), Map.class));
  }

  public void setScreenOrientationOverride(SetScreenOrientationOverrideParameters parameters) {
    Require.nonNull("SetScreenOrientationOverride parameters", parameters);

    bidi.send(
        new Command<>("emulation.setScreenOrientationOverride", parameters.toMap(), Map.class));
  }
}
