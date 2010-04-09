/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

package org.openqa.selenium.firefox;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Alert;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.internal.ExtensionConnectionFactory;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;

import static org.openqa.selenium.OutputType.FILE;


/**
 * An implementation of the {#link WebDriver} interface that drives Firefox. This works through a firefox extension,
 * which gets installed automatically if necessary. Important system variables are:
 * <ul>
 * <li><b>webdriver.firefox.bin</b> - Which firefox binary to use (normally "firefox" on the PATH).</li>
 * <li><b>webdriver.firefox.profile</b> - The name of the profile to use (normally "WebDriver").</li>
 * </ul>
 * <p/>
 * When the driver starts, it will make a copy of the profile it is using, rather than using that profile directly.
 * This allows multiple instances of firefox to be started.
 */
public class FirefoxDriver extends RemoteWebDriver implements TakesScreenshot, FindsByCssSelector {

  public static final int DEFAULT_PORT = 7055;
  // For now, only enable native events on Windows
  public static final boolean DEFAULT_ENABLE_NATIVE_EVENTS =
      Platform.getCurrent()
          .is(Platform.WINDOWS);
  // Accept untrusted SSL certificates.
  public static final boolean ACCEPT_UNTRUSTED_CERTIFICATES = true;
  // Assume that the untrusted certificates will come from untrusted issuers
  // or will be self signed.
  public static final boolean ASSUME_UNTRUSTED_ISSUER = true;

  // Commands we can execute with needing to dismiss an active alert
  private final Set<DriverCommand> alertWhiteListedCommands = new HashSet<DriverCommand>() {{
    add(DriverCommand.DISMISS_ALERT);
  }};

  private FirefoxAlert currentAlert;

  public FirefoxDriver() {
    this(new FirefoxBinary(), null);
  }

  public FirefoxDriver(FirefoxProfile profile) {
    this(new FirefoxBinary(), profile);
  }

  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile) {
    super(createExtensionConnection(binary, profile), DesiredCapabilities.firefox());
  }

  /**
   * Establishes a connection to the Firefox extension.
   *
   * @param binary  The binary to use for launching Firefox.
   * @param profile The profile template to launch Firefox with.
   * @return The established extension connection.
   */
  private static ExtensionConnection createExtensionConnection(FirefoxBinary binary,
                                                               FirefoxProfile profile) {
    FirefoxProfile profileToUse = profile;
    String suggestedProfile = System.getProperty("webdriver.firefox.profile");
    if (profileToUse == null && suggestedProfile != null) {
      profileToUse = new ProfilesIni().getProfile(suggestedProfile);
    } else if (profileToUse == null) {
      profileToUse = new FirefoxProfile();
    }
    profileToUse.addWebDriverExtensionIfNeeded(false);

    return ExtensionConnectionFactory.connectTo(binary, profileToUse, "localhost");
  }

  @Override
  protected void startClient() {
    try {
      ((ExtensionConnection) this.getCommandExecutor()).start();
    } catch (IOException e) {
      throw new WebDriverException("An error occurred while connecting to Firefox", e);
    }
  }

  @Override
  protected void stopClient() {
    ((ExtensionConnection) this.getCommandExecutor()).quit();
  }

  @Override
  protected FirefoxWebElement newRemoteWebElement() {
    return new FirefoxWebElement(this);
  }

  public WebElement findElementByCssSelector(String using) {
    if (using == null) {
      throw new IllegalArgumentException("Cannot find elements when the css selector is null.");
    }

    return findElement("css selector", using);
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    if (using == null) {
      throw new IllegalArgumentException("Cannot find elements when the css selector is null.");
    }

    return findElements("css selector", using);
  }

  @Override
  public TargetLocator switchTo() {
    return new FirefoxTargetLocator();
  }

  @Override
  protected Response execute(DriverCommand driverCommand, Map<String, ?> parameters) {
    if (currentAlert != null) {
      if (!alertWhiteListedCommands.contains(driverCommand)) {
        ((FirefoxTargetLocator) switchTo()).alert()
            .dismiss();
        throw new UnhandledAlertException(driverCommand.toString());
      }
    }

    Response response = super.execute(driverCommand, parameters);

    Object rawResponse = response.getValue();
    if (rawResponse instanceof Map) {
      Map map = (Map) rawResponse;
      if (map.containsKey("__webdriverType")) {
        // Looks like have an alert. construct it
        currentAlert = new FirefoxAlert((String) map.get("text"));
        response.setValue(null);
      }
    }

    return response;
  }

  @Override
  public boolean isJavascriptEnabled() {
    return true;
  }

  private class FirefoxTargetLocator extends RemoteTargetLocator {
    // TODO: this needs to be on an interface

    public Alert alert() {
      if (currentAlert != null) {
        return currentAlert;
      }

      throw new NoAlertPresentException();
    }
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = execute(DriverCommand.SCREENSHOT).getValue().toString();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  /**
   * Saves a screenshot of the current page into the given file.
   *
   * @deprecated Use getScreenshotAs(file), which returns a temporary file.
   */
  @Deprecated
  public void saveScreenshot(File pngFile) {
    if (pngFile == null) {
      throw new IllegalArgumentException("Method parameter pngFile must not be null");
    }

    File tmpfile = getScreenshotAs(FILE);

    File dir = pngFile.getParentFile();
    if (dir != null && !dir.exists() && !dir.mkdirs()) {
      throw new WebDriverException("Could not create directory " + dir.getAbsolutePath());
    }

    try {
      FileHandler.copy(tmpfile, pngFile);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private class FirefoxAlert implements Alert {
    private String text;

    public FirefoxAlert(String text) {
      this.text = text;
    }

    public void dismiss() {
      execute(DriverCommand.DISMISS_ALERT, ImmutableMap.of("text", text));
      currentAlert = null;
    }

    public void accept() {
    }

    public String getText() {
      return text;
    }
  }
}
