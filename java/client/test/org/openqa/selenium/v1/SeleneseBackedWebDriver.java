/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.v1;

import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.SeleneseCommandExecutor;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class SeleneseBackedWebDriver extends RemoteWebDriver
    implements TakesScreenshot {
  public SeleneseBackedWebDriver(Capabilities capabilities) throws Exception {
    super(newCommandExecutor(getSeleniumServerUrl(capabilities), capabilities), capabilities);
  }
  
  private static CommandExecutor newCommandExecutor(URL remoteAddress, Capabilities capabilities)
      throws MalformedURLException {
    return new SeleneseCommandExecutor(getSeleniumServerUrl(capabilities), remoteAddress, capabilities);
  }

  private static URL getSeleniumServerUrl(Capabilities caps) throws MalformedURLException {
    String serverUrl = (String) caps.getCapability("selenium.server.url");
    return new URL(serverUrl);
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    return target.convertFromBase64Png(base64);
  }

  public Selenium getWrappedSelenium() {
    return ((SeleneseCommandExecutor) getCommandExecutor()).getWrappedSelenium();
  }
}
