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


package org.openqa.selenium.browserlaunchers.locators;

/**
 * Encapsulate useful settings of a browser installation discovered with a
 * {@link org.openqa.selenium.browserlaunchers.locators.BrowserLocator}
 */
public class BrowserInstallation {

  private final String launcherFilePath;
  private final String libraryPath;

  public BrowserInstallation(String launcherFilePath, String libraryPath) {
    this.launcherFilePath = launcherFilePath;
    this.libraryPath = libraryPath;
  }

  public String launcherFilePath() {
    return launcherFilePath;
  }

  public String libraryPath() {
    return libraryPath;
  }

}
