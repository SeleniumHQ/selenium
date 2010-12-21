/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class SeleneseBackedWebDriver extends RemoteWebDriver {
  public SeleneseBackedWebDriver() throws Exception {
    super(newCommandExecutor(getSeleniumServerUrl(), describeBrowser()),
        describeBrowser());
  }

  private static CommandExecutor newCommandExecutor(URL remoteAddress, Capabilities capabilities)
      throws MalformedURLException {
    return new SeleneseCommandExecutor(getSeleniumServerUrl(), remoteAddress, capabilities);
  }

  private static URL getSeleniumServerUrl() throws MalformedURLException {
    String port = System.getProperty("webdriver.selenium.server.port", "5555");
    return new URL("http://localhost:" + port);
  }

  private static Capabilities describeBrowser() {
    return DesiredCapabilities.firefox();
  }
}
