/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.IOException;

public class SafariFileBasedLauncher extends SafariCustomProfileLauncher {

  public SafariFileBasedLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration,
      String sessionId,
      String browserLaunchLocation) {
    super(browserOptions, configuration, sessionId, browserLaunchLocation);
  }

  @Override
  protected void launch(String url) {
    final String fileUrl;
    String query;

    query = LauncherUtils.getQueryString(url);
    query += "&driverUrl=http://localhost:" + getPort() + "/selenium-server/driver/";
    try {
      if (browserConfigurationOptions.is(
          CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION)) {
        ensureCleanSession();
      }
      fileUrl = createExtractedFiles().toURI().toURL() + "?" + query;

      launchSafari(fileUrl);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private File createExtractedFiles() {
    final File userExtensionsJavascriptFile;
    final File userExtensions;
    final File coreDir;

    coreDir = new File(customProfileDir, "core");
    try {
      coreDir.mkdirs();
      ResourceExtractor.extractResourcePath(SafariFileBasedLauncher.class, "/core", coreDir);
      // custom user-extensions
      userExtensions = BrowserOptions.getFile(browserConfigurationOptions, "userExtensions");
      if (userExtensions != null) {
        userExtensionsJavascriptFile = new File(coreDir, "scripts/user-extensions.js");
        FileHandler.copy(userExtensions, userExtensionsJavascriptFile);
      }
      return new File(coreDir, "RemoteRunner.html");
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

}
