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

package org.openqa.selenium.bidi.webextension;

import java.util.Map;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.internal.Require;

public class WebExtension {
  private final BiDi bidi;

  public WebExtension(WebDriver driver) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
  }

  public Map<String, Object> install(InstallExtensionParameters parameters) {
    Require.nonNull("Install parameters", parameters);
    return bidi.send(
        new Command<>("webExtension.install", parameters.getExtensionData().toMap(), Map.class));
  }

  public Map<String, Object> uninstall(UninstallExtensionParameters parameters) {
    Require.nonNull("Uninstall parameters", parameters);
    return bidi.send(new Command<>("webExtension.uninstall", parameters.extension, Map.class));
  }
}
