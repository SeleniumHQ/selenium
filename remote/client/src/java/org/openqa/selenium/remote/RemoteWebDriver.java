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

package org.openqa.selenium.remote;

import java.net.URL;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Speed;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.ReturnedCookie;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class RemoteWebDriver implements WebDriver, JavascriptExecutor,
    FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByTagName, FindsByXPath {

  private final ErrorHandler errorHandler = new ErrorHandler();

  private CommandExecutor executor;
  private Capabilities capabilities;
  private SessionId sessionId;

  protected Process clientProcess;
  private JsonToWebElementConverter converter;

  // For cglib
  protected RemoteWebDriver() {
    converter = new JsonToWebElementConverter(this);
  }

  public RemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities) {
    this.executor = executor;
    converter = new JsonToWebElementConverter(this);
    startClient();
    startSession(desiredCapabilities);
  }

  public RemoteWebDriver(Capabilities desiredCapabilities) {
    this((URL) null, desiredCapabilities);
  }

  public RemoteWebDriver(URL remoteAddress, Capabilities desiredCapabilities) {
    this(new HttpCommandExecutor(remoteAddress), desiredCapabilities);
  }

  @SuppressWarnings({"unchecked"})
  protected void startSession(Capabilities desiredCapabilities) {
    Response response = execute(DriverCommand.NEW_SESSION,
        ImmutableMap.of("desiredCapabilities", desiredCapabilities));

    Map<String, Object> rawCapabilities = (Map<String, Object>) response.getValue();
    DesiredCapabilities returnedCapabilities = new DesiredCapabilities();
    for (Map.Entry<String, Object> entry : rawCapabilities.entrySet()) {
      // Handle the platform later
      if ("platform".equals(entry.getKey())) {
        continue;
      }
      returnedCapabilities.setCapability(entry.getKey(), entry.getValue());
    }
    String platformString = (String) rawCapabilities.get("platform");
    Platform platform;
    try {
      if (platformString == null || "".equals(platformString)) {
        platform = Platform.ANY;
      } else {
        platform = Platform.valueOf(platformString);
      }
    } catch (IllegalArgumentException e) {
      // The server probably responded with a name matching the os.name
      // system property. Try to recover and parse this.
      platform = Platform.extractFromSysProperty(platformString);
    }
    returnedCapabilities.setPlatform(platform);

    capabilities = returnedCapabilities;
    sessionId = new SessionId(response.getSessionId());
  }

  /**
   * Method called before
   * {@link #startSession(Capabilities) starting a new session}.  The default
   * implementation is a no-op, but subtypes should override this method to
   * define custom behavior.
   */
  protected void startClient() {
  }

  /**
   * Method called after executing a {@link #quit()} command. Subtypes
   */
  protected void stopClient() {
  }

  public ErrorHandler getErrorHandler() {
    return errorHandler;
  }

  public CommandExecutor getCommandExecutor() {
    return executor;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public void get(String url) {
    execute(DriverCommand.GET, ImmutableMap.of("url", url));
  }

  public String getTitle() {
    Response response = execute(DriverCommand.GET_TITLE);
    return response.getValue().toString();
  }

  public String getCurrentUrl() {
    return execute(DriverCommand.GET_CURRENT_URL).getValue().toString();
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  protected WebElement findElement(String by, String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT,
        ImmutableMap.of("using", by, "value", using));
    return (WebElement) response.getValue();
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String by, String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS,
        ImmutableMap.of("using", by, "value", using));
    return (List<WebElement>) response.getValue();
  }

  public WebElement findElementById(String using) {
    return findElement("id", using);
  }

  public List<WebElement> findElementsById(String using) {
    return findElements("id", using);
  }

  public WebElement findElementByLinkText(String using) {
    return findElement("link text", using);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return findElements("link text", using);
  }

  public WebElement findElementByPartialLinkText(String using) {
    return findElement("partial link text", using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return findElements("partial link text", using);
  }

  public WebElement findElementByTagName(String using) {
    return findElement("tag name", using);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return findElements("tag name", using);
  }

  public WebElement findElementByName(String using) {
    return findElement("name", using);
  }

  public List<WebElement> findElementsByName(String using) {
    return findElements("name", using);
  }

  public WebElement findElementByClassName(String using) {
    return findElement("class name", using);
  }

  public List<WebElement> findElementsByClassName(String using) {
    return findElements("class name", using);
  }

  public WebElement findElementByXPath(String using) {
    return findElement("xpath", using);
  }

  public List<WebElement> findElementsByXPath(String using) {
    return findElements("xpath", using);
  }

  // Misc

  public String getPageSource() {
    return (String) execute(DriverCommand.GET_PAGE_SOURCE).getValue();
  }

  public void close() {
    execute(DriverCommand.CLOSE);
  }

  public void quit() {
    try {
      execute(DriverCommand.QUIT);
    } finally {
      sessionId = null;
      stopClient();
    }
  }

  @SuppressWarnings({"unchecked"})
  public Set<String> getWindowHandles() {
    Response response = execute(DriverCommand.GET_WINDOW_HANDLES);
    List<String> returnedValues = (List<String>) response.getValue();

    return new LinkedHashSet<String>(returnedValues);
  }

  public String getWindowHandle() {
    return String.valueOf(execute(DriverCommand.GET_CURRENT_WINDOW_HANDLE).getValue());
  }

  public Object executeScript(String script, Object... args) {
    if (!capabilities.isJavascriptEnabled()) {
      throw new UnsupportedOperationException("You must be using an underlying instance of WebDriver that supports executing javascript");
    }

    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    Iterable<Object> convertedArgs = Iterables.transform(
        Lists.newArrayList(args), new WebElementToJsonConverter());

    Map<String, ?> params = ImmutableMap.of(
        "script", script,
        "args", Lists.newArrayList(convertedArgs));

    return execute(DriverCommand.EXECUTE_SCRIPT, params).getValue();
  }

  public boolean isJavascriptEnabled() {
    return capabilities.isJavascriptEnabled();
  }

  public TargetLocator switchTo() {
    return new RemoteTargetLocator();
  }

  public Navigation navigate() {
    return new RemoteNavigation();
  }

  public Options manage() {
    return new RemoteWebDriverOptions();
  }

  /**
   * Creates a new {@link RemoteWebElement} that is a child of this instance.
   * Subtypes should override this method to customize the type of
   * RemoteWebElement returned.
   *
   * @return A new RemoteWebElement that is a child of this instance.
   */
  @Deprecated
  protected RemoteWebElement newRemoteWebElement() {
    RemoteWebElement toReturn;
    if (capabilities.isJavascriptEnabled()) {
      toReturn = new RenderedRemoteWebElement();
    } else {
      toReturn = new RemoteWebElement();
    }
    toReturn.setParent(this);
    return toReturn;
  }

  protected void setElementConverter(JsonToWebElementConverter converter) {
    this.converter = converter;
  }

  protected Response execute(String driverCommand, Map<String, ?> parameters) {
    Command command = new Command(sessionId, driverCommand, parameters);

    Response response;

    try {
      response = executor.execute(command);

      // Unwrap the response value by converting any JSON objects of the form
      // {"ELEMENT": id} to RemoteWebElements.
      Object value = converter.apply(response.getValue());
      response.setValue(value);
    } catch (RuntimeException e) {
      throw e;
    } catch (Exception e) {
      throw new WebDriverException(e);
    }

    return errorHandler.throwIfResponseFailed(response);
  }

  protected Response execute(String command) {
    return execute(command, ImmutableMap.<String, Object>of());
  }

  private class RemoteWebDriverOptions implements Options {

    public void addCookie(Cookie cookie) {
      execute(DriverCommand.ADD_COOKIE, ImmutableMap.of("cookie", cookie));
    }

    public void deleteCookieNamed(String name) {
      execute(DriverCommand.DELETE_COOKIE, ImmutableMap.of("name", name));
    }

    public void deleteCookie(Cookie cookie) {
      deleteCookieNamed(cookie.getName());
    }

    public void deleteAllCookies() {
      execute(DriverCommand.DELETE_ALL_COOKIES);
    }

    @SuppressWarnings({"unchecked"})
    public Set<Cookie> getCookies() {
      Object returned = execute(DriverCommand.GET_ALL_COOKIES).getValue();

      try {
        List<Map<String, Object>> cookies =
            new JsonToBeanConverter().convert(List.class, returned);
        Set<Cookie> toReturn = new HashSet<Cookie>();
        for (Map<String, Object> rawCookie : cookies) {
          String name = (String) rawCookie.get("name");
          String value = (String) rawCookie.get("value");
          String path = (String) rawCookie.get("path");
          String domain = (String) rawCookie.get("domain");
          Boolean secure = (Boolean) rawCookie.get("secure");
          toReturn.add(
              new ReturnedCookie(name, value, domain, path, null, secure, getCurrentUrl()));
        }

        return toReturn;
      } catch (Exception e) {
        throw new WebDriverException(e);
      }

    }

    public Cookie getCookieNamed(String name) {
      Set<Cookie> allCookies = getCookies();
      for (Cookie cookie : allCookies) {
        if (cookie.getName().equals(name)) {
          return cookie;
        }
      }
      return null;
    }

    public Speed getSpeed() {
      Response response = execute(DriverCommand.GET_SPEED);

      return Speed.valueOf((String) response.getValue());
    }

    public void setSpeed(Speed speed) {
      execute(DriverCommand.SET_SPEED, ImmutableMap.of("speed", speed));
    }

    public Timeouts timeouts() {
      return new RemoteTimeouts();
    }
  }

  protected class RemoteTimeouts implements Timeouts {

    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      execute(DriverCommand.IMPLICITLY_WAIT, ImmutableMap.of("ms",
          TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit)));
      return this;
    }
  }

  private class RemoteNavigation implements Navigation {

    public void back() {
      execute(DriverCommand.GO_BACK);
    }

    public void forward() {
      execute(DriverCommand.GO_FORWARD);
    }

    public void to(String url) {
      get(url);
    }

    public void to(URL url) {
      get(String.valueOf(url));
    }

    public void refresh() {
      execute(DriverCommand.REFRESH);
    }
  }

  protected class RemoteTargetLocator implements TargetLocator {

    public WebDriver frame(int frameIndex) {
      execute(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of("id", frameIndex));
      return RemoteWebDriver.this;
    }

    public WebDriver frame(String frameName) {
      execute(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of("id", frameName));
      return RemoteWebDriver.this;
    }

    public WebDriver window(String windowName) {
      execute(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("name", windowName));
      return RemoteWebDriver.this;
    }

    public WebDriver defaultContent() {
      Map<String, Object> frameId = Maps.newHashMap();
      frameId.put("id", null);
      execute(DriverCommand.SWITCH_TO_FRAME, frameId);
      return RemoteWebDriver.this;
    }

    public WebElement activeElement() {
      Response response = execute(DriverCommand.GET_ACTIVE_ELEMENT);
      return (WebElement) response.getValue();
    }
  }
}
