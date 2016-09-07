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

package org.openqa.selenium.safari;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

import java.io.IOException;

import java.util.Map;

import com.google.common.collect.ImmutableMap;

/**
 * A WebDriver implementation that controls Safari using a browser extension
 * (consequently, only Safari 5.1+ is supported).
 *
 * This driver can be configured using the {@link SafariOptions} class.
 */
public class SafariDriver extends RemoteWebDriver {

  private SafariDriverService service;

  // Legacy Window API
  protected final static String SET_WINDOW_SIZE = "setWindowSize";
  protected final static String SET_WINDOW_POSITION = "setWindowPosition";
  protected final static String GET_WINDOW_SIZE = "getWindowSize";
  protected final static String GET_WINDOW_POSITION = "getWindowPosition";
  protected final static String MAXIMIZE_WINDOW = "maximizeWindow";

  /**
   * Initializes a new SafariDriver} class with default {@link SafariOptions}.
   */
  public SafariDriver() {
    this(new SafariOptions());
  }

  /**
   * Converts the specified {@link DesiredCapabilities} to a {@link SafariOptions}
   * instance and initializes a new SafariDriver using these options.
   * @see SafariOptions#fromCapabilities(org.openqa.selenium.Capabilities)
   *
   * @param desiredCapabilities capabilities requested of the driver
   */
  public SafariDriver(Capabilities desiredCapabilities) {
    this(SafariOptions.fromCapabilities(desiredCapabilities));
  }

  /**
   * Initializes a new SafariDriver using the specified {@link SafariOptions}.
   *
   * @param safariOptions safari specific options / capabilities for the driver
   */
  public SafariDriver(SafariOptions safariOptions) {
    super(getExecutor(safariOptions), safariOptions.toCapabilities(), requiredCapabilities(safariOptions));

    if (this.getCommandExecutor() instanceof SafariDriverCommandExecutor) {
      this.setElementConverter(new LegacyJsonToWebElementConverter(this));
    }
  }

  /**
   * Ensure the new safaridriver receives non null required capabilities.
   */
  private static Capabilities requiredCapabilities(SafariOptions options) {
    if (isLegacy(options)) {
      return null;
    }
    return new DesiredCapabilities();
  }

  private static CommandExecutor getExecutor(SafariOptions options) {
    SafariDriverService service = SafariDriverService.createDefaultService(options);
    if (! isLegacy(options) && service != null) {
      return new DriverCommandExecutor(service);
    }
    return new SafariDriverCommandExecutor(options);
  }

  private static boolean isLegacy(SafariOptions options) {
    return options.getUseLegacyDriver();
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  @Override
  protected void startClient() {
    CommandExecutor commandExecutor = this.getCommandExecutor();
    if (commandExecutor instanceof SafariDriverCommandExecutor) {
      try {
        ((SafariDriverCommandExecutor)commandExecutor).start();
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else {
      super.startClient();
    }
  }

  @Override
  protected void stopClient() {
    CommandExecutor commandExecutor = this.getCommandExecutor();
    if (commandExecutor instanceof SafariDriverCommandExecutor) {
      ((SafariDriverCommandExecutor)commandExecutor).stop();
    } else {
      super.stopClient();
    }
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  @Override
  public TargetLocator switchTo() {
    if (this.getCommandExecutor() instanceof SafariDriverCommandExecutor) {
      return new LegacyRemoteTargetLocator();
    }

    return super.switchTo();
  }

  @Override
  public Options manage() {
    if (this.getCommandExecutor() instanceof SafariDriverCommandExecutor) {
      return new LegacyRemoteWebDriverOptions();
    }

    return super.manage();
  }


  protected class LegacyRemoteTargetLocator extends RemoteTargetLocator {

    @Override
    public WebDriver window(String windowHandleOrName) {
      execute(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("name", windowHandleOrName));
      return SafariDriver.this;
    }

  }

  protected class LegacyRemoteWebDriverOptions extends RemoteWebDriverOptions {

    @Override
    public Window window() {
      return new LegacyRemoteWindow();
    }

    protected class LegacyRemoteWindow extends RemoteWindow {

      @Override
      public void setSize(Dimension targetSize) {
        execute(SET_WINDOW_SIZE,
            ImmutableMap.of("windowHandle", "current",
                "width", targetSize.width, "height", targetSize.height));
      }

      @Override
      public void setPosition(Point targetPosition) {
        execute(SET_WINDOW_POSITION,
            ImmutableMap.of("windowHandle", "current",
                "x", targetPosition.x, "y", targetPosition.y));
      }

      @SuppressWarnings("unchecked")
      @Override
      public Dimension getSize()
      {
        Response response =  execute(GET_WINDOW_SIZE, ImmutableMap.of("windowHandle", "current"));

        Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
        int width = ((Number) rawSize.get("width")).intValue();
        int height = ((Number) rawSize.get("height")).intValue();

        return new Dimension(width, height);
      }

      @SuppressWarnings("unchecked")
      @Override
      public Point getPosition()
      {
        Response response = execute(GET_WINDOW_POSITION, ImmutableMap.of("windowHandle", "current"));
        Map<String, Object> rawPoint = (Map<String, Object>) response.getValue();

        int x = ((Number) rawPoint.get("x")).intValue();
        int y = ((Number) rawPoint.get("y")).intValue();

        return new Point(x, y);
      }

      @Override
      public void maximize()
      {
        execute(MAXIMIZE_WINDOW, ImmutableMap.of("windowHandle", "current"));
      }

    }

  }

  protected static class LegacyJsonToWebElementConverter extends JsonToWebElementConverter {

    RemoteWebDriver driver;

    public LegacyJsonToWebElementConverter(RemoteWebDriver driver)
    {
      super(driver);
      this.driver = driver;
    }

    @Override
    protected RemoteWebElement newRemoteWebElement()
    {
      RemoteWebElement toReturn = new LegacyRemoteWebElement();
      toReturn.setParent(driver);
      return toReturn;
    }

  }

  protected static class LegacyRemoteWebElement extends RemoteWebElement {

    @SuppressWarnings("unchecked")
    @Override
    public Point getLocation() {
      Response response = execute(DriverCommand.GET_ELEMENT_LOCATION, ImmutableMap.of("id", id));

      Map<String, Object> rawPoint = (Map<String, Object>) response.getValue();
      int x = ((Number) rawPoint.get("x")).intValue();
      int y = ((Number) rawPoint.get("y")).intValue();
      return new Point(x, y);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Dimension getSize() {
      Response response = execute(DriverCommand.GET_ELEMENT_SIZE, ImmutableMap.of("id", id));

      Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
      int width = ((Number) rawSize.get("width")).intValue();
      int height = ((Number) rawSize.get("height")).intValue();
      return new Dimension(width, height);
    }

  }
}
