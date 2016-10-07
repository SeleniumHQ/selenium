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

package org.openqa.selenium.testing.drivers;

import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

public class Firebug {

  public static void addTo(FirefoxProfile profile) throws IOException {
    Path firebug = InProject.locate("third_party/firebug/firebug-1.5.0-fx.xpi");
    profile.addExtension(firebug.toFile());
    profile.setPreference("extensions.firebug.addonBarOpened", true);
    profile.setPreference("extensions.firebug.allPagesActivation", "on");
    profile.setPreference("extensions.firebug.console.enableSites", true);
    profile.setPreference("extensions.firebug.defaultPanelName", "console");
    profile.setPreference("extensions.firebug.net.enableSites", true);
    profile.setPreference("extensions.firebug.openInWindow", false);
    profile.setPreference("extensions.firebug.script.enableSites", true);
    profile.setPreference("extensions.firebug.showErrorCount", true);
    profile.setPreference("extensions.firebug.showJSErrors", true);
    profile.setPreference("extensions.firefox.toolbarCustomizationDone", true);

    // Prevent the first run page being displayed
    profile.setPreference("extensions.firebug.currentVersion", "1.7.3");
  }

}
