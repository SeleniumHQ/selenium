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

import static org.openqa.selenium.OutputType.FILE;
import static org.openqa.selenium.browserlaunchers.CapabilityType.PROXY;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.openqa.selenium.Alert;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.firefox.internal.Lock;
import org.openqa.selenium.firefox.internal.NewProfileExtensionConnection;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.firefox.internal.SocketLock;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.Response;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;


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
  public static final String BINARY = "firefox_binary";
  public static final String PROFILE = "firefox_profile";

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
  private final Set<String> alertWhiteListedCommands = new HashSet<String>() {{
    add(DriverCommand.DISMISS_ALERT);
  }};

  private FirefoxAlert currentAlert;

  protected FirefoxBinary binary;
  protected FirefoxProfile profile;

  public FirefoxDriver() {
    this(new FirefoxBinary(), null);
  }

  public FirefoxDriver(FirefoxProfile profile) {
    this(new FirefoxBinary(), profile);
  }

  public FirefoxDriver(Capabilities capabilities) {
    this(getBinary(capabilities), extractProfile(capabilities));
  }

  private static FirefoxProfile extractProfile(Capabilities capabilities) {
    FirefoxProfile profile = new FirefoxProfile();

    if (capabilities.getCapability(PROFILE) != null) {
      Object raw = capabilities.getCapability(PROFILE);
      if (raw instanceof FirefoxProfile) {
        profile = (FirefoxProfile) raw;
      } else if (raw instanceof String) {
        try {
          profile = FirefoxProfile.fromJson((String) raw);
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
    }

    if (capabilities.getCapability(PROXY) != null) {
      Proxy proxy = Proxies.extractProxy(capabilities);
      profile.setProxyPreferences(proxy);
    }

    return profile;
  }

  private static FirefoxBinary getBinary(Capabilities capabilities) {
    if (capabilities.getCapability(BINARY) != null) {
      File file = new File((String) capabilities.getCapability(BINARY));
      new FirefoxBinary(file);
    }
    return new FirefoxBinary();
  }

  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile) {
    super(new LazyCommandExecutor(binary, profile), DesiredCapabilities.firefox());
    this.binary = binary;
    this.profile = profile;
    setElementConverter(new JsonToWebElementConverter(this) {
      @Override
      protected RemoteWebElement newRemoteWebElement() {
        return new FirefoxWebElement(FirefoxDriver.this);
      }
    });
  }

  @Override
  protected void startClient() {
    LazyCommandExecutor exe = (LazyCommandExecutor) getCommandExecutor();
    FirefoxProfile profileToUse = getProfile(exe.profile);
    profileToUse.addWebDriverExtensionIfNeeded(false);

    // TODO(simon): Make this not sinfully ugly
    ExtensionConnection connection = connectTo(exe.binary, profileToUse, "localhost");
    exe.setConnection(connection);

    try {
      connection.start();
    } catch (IOException e) {
      throw new WebDriverException("An error occurred while connecting to Firefox", e);
    }
  }

  private FirefoxProfile getProfile(FirefoxProfile profile) {
    FirefoxProfile profileToUse = profile;
    String suggestedProfile = System.getProperty("webdriver.firefox.profile");
    if (profileToUse == null && suggestedProfile != null) {
      profileToUse = new ProfilesIni().getProfile(suggestedProfile);
    } else if (profileToUse == null) {
      profileToUse = new FirefoxProfile();
    }
    return profileToUse;
  }

  protected ExtensionConnection connectTo(FirefoxBinary binary, FirefoxProfile profile,
                                          String host) {
    int profilePort = profile.getPort() == 0 ? DEFAULT_PORT : profile.getPort();
    Lock lock = new SocketLock(profilePort - 1);
    try {
      FirefoxBinary bin = binary == null ? new FirefoxBinary() : binary;
      

      return new NewProfileExtensionConnection(lock, bin, profile, host);
    } catch (Exception e) {
      throw new WebDriverException(e);
    } finally {
      lock.unlock();
    }
  }

  @Override
  protected void stopClient() {
    ((LazyCommandExecutor) this.getCommandExecutor()).quit();
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
  protected Response execute(String driverCommand, Map<String, ?> parameters) {
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

  private static class LazyCommandExecutor implements CommandExecutor {
    private ExtensionConnection connection;
    private final FirefoxBinary binary;
    private final FirefoxProfile profile;

    private LazyCommandExecutor(FirefoxBinary binary, FirefoxProfile profile) {
      this.binary = binary;
      this.profile = profile;
    }

    public void setConnection(ExtensionConnection connection) {
      this.connection = connection;
    }

    public void quit() {
      connection.quit();
    }

    public Response execute(Command command) throws Exception {
      return connection.execute(command);
    }
  }
}
