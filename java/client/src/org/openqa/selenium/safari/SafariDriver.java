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

package org.openqa.selenium.safari;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.IOException;

/**
 * A WebDriver implementation that controls Safari using a browser extension
 * (consequently, only Safari 5.1+ is supported).
 */
@Beta
public class SafariDriver extends RemoteWebDriver
    implements TakesScreenshot {

  /**
   * A boolean capability that instructs the SafariDriver to delete all existing
   * session data when starting a new session. This includes browser history,
   * cache, cookies, HTML5 local storage, and HTML5 databases.
   *
   * <p><strong>Warning:</strong> Since Safari uses a single profile for the
   * current user, enabling this capability will permanently erase any existing
   * session data.
   */
  public static final String CLEAN_SESSION_CAPABILITY = "safari.cleanSession";

  public SafariDriver() {
    this(DesiredCapabilities.safari());
  }

  public SafariDriver(Capabilities desiredCapabilities) {
    super(new SafariDriverCommandExecutor(0, desiredCapabilities.is(CLEAN_SESSION_CAPABILITY)),
        desiredCapabilities);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  @Override
  protected void startClient() {
    SafariDriverCommandExecutor executor = (SafariDriverCommandExecutor) this.getCommandExecutor();
    try {
      executor.start();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  @Override
  protected void stopClient() {
    SafariDriverCommandExecutor executor = (SafariDriverCommandExecutor) this.getCommandExecutor();
    executor.stop();
  }

  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }
}
