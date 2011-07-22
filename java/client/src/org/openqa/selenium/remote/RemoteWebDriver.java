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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import java.net.URL;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class RemoteWebDriver implements WebDriver, JavascriptExecutor,
    FindsById, FindsByClassName, FindsByLinkText, FindsByName,
    FindsByCssSelector, FindsByTagName, FindsByXPath,
    HasInputDevices, HasCapabilities {

  private final ErrorHandler errorHandler = new ErrorHandler();

  private CommandExecutor executor;
  private Capabilities capabilities;
  private SessionId sessionId;
  private ExecuteMethod executeMethod;

  private JsonToWebElementConverter converter;

  private final RemoteKeyboard keyboard = new RemoteKeyboard();
  private final RemoteMouse mouse = new RemoteMouse();

  // For cglib
  protected RemoteWebDriver() {
    converter = new JsonToWebElementConverter(this);
    executeMethod = new ExecuteMethod(this);
  }

  public RemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities) {
    this.executor = executor;
    converter = new JsonToWebElementConverter(this);
    executeMethod = new ExecuteMethod(this);
    startClient();
    startSession(desiredCapabilities);
  }

  public RemoteWebDriver(Capabilities desiredCapabilities) {
    this((URL) null, desiredCapabilities);
  }

  public RemoteWebDriver(URL remoteAddress, Capabilities desiredCapabilities) {
    this(new HttpCommandExecutor(remoteAddress), desiredCapabilities);
  }

  public SessionId getSessionId() {
    return sessionId;
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

  protected void setCommandExecutor(CommandExecutor executor) {
    this.executor = executor;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public void get(String url) {
    execute(DriverCommand.GET, ImmutableMap.of("url", url));
  }

  public String getTitle() {
    Response response = execute(DriverCommand.GET_TITLE);
    Object value = response.getValue();
    return value == null ? "" : value.toString();
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
    if (using == null) {
      throw new IllegalArgumentException("Cannot find elements when the selector is null.");
    }

    Response response = execute(DriverCommand.FIND_ELEMENT,
        ImmutableMap.of("using", by, "value", using));
    return (WebElement) response.getValue();
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String by, String using) {
    if (using == null) {
      throw new IllegalArgumentException("Cannot find elements when the selector is null.");
    }

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

  public WebElement findElementByCssSelector(String using) {
    return findElement("css selector", using);
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    return findElements("css selector", using);
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

  public Object executeAsyncScript(String script, Object... args) {
    if (!isJavascriptEnabled()) {
      throw new UnsupportedOperationException("You must be using an underlying instance of " +
          "WebDriver that supports executing javascript");
    }

    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    Iterable<Object> convertedArgs = Iterables.transform(
        Lists.newArrayList(args), new WebElementToJsonConverter());

    Map<String, ?> params = ImmutableMap.of(
        "script", script, "args", Lists.newArrayList(convertedArgs));

    return execute(DriverCommand.EXECUTE_ASYNC_SCRIPT, params).getValue();
  }

  private boolean isJavascriptEnabled() {
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
    RemoteWebElement toReturn = new RemoteWebElement();
    toReturn.setParent(this);
    return toReturn;
  }

  protected void setElementConverter(JsonToWebElementConverter converter) {
    this.converter = converter;
  }

  protected JsonToWebElementConverter getElementConverter() {
    return converter;
  }

  protected Response execute(String driverCommand, Map<String, ?> parameters) {
    Command command = new Command(sessionId, driverCommand, parameters);

    Response response;

    try {
      log(sessionId, command.getName(), command);
      response = executor.execute(command);

      if (response == null) {
        log(sessionId, command.getName(), response);
        return null;
      }

      // Unwrap the response value by converting any JSON objects of the form
      // {"ELEMENT": id} to RemoteWebElements.
      Object value = converter.apply(response.getValue());
      response.setValue(value);
      log(sessionId, command.getName(), response);
    } catch (RuntimeException e) {
      log(sessionId, command.getName(), e);
      throw e;
    } catch (Exception e) {
      log(sessionId, command.getName(), e);
      throw new WebDriverException(e);
    }

    return errorHandler.throwIfResponseFailed(response);
  }

  protected Response execute(String command) {
    return execute(command, ImmutableMap.<String, Object>of());
  }

  public ExecuteMethod getExecuteMethod() {
    return executeMethod;
  }

  public Keyboard getKeyboard() {
    return keyboard;
  }

  public Mouse getMouse() {
    return mouse;
  }

  /**
   * Override this to be notified at key points in the execution of a command.
   *
   * @param sessionId the session id.
   * @param commandName the command that is being executed.
   * @param toLog any data that might be interesting.
   */
  protected void log(SessionId sessionId, String commandName, Object toLog) {
    // By default do nothing
  }

  protected class RemoteWebDriverOptions implements Options {

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

          Number expiryNum = (Number) rawCookie.get("expiry");
          Date expiry = expiryNum == null ? null : new Date(
              TimeUnit.SECONDS.toMillis(expiryNum.longValue()));

          toReturn.add(new Cookie.Builder(name, value)
              .path(path)
              .domain(domain)
              .isSecure(secure)
              .expiresOn(expiry)
              .build());
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

    public Timeouts timeouts() {
      return new RemoteTimeouts();
    }

    public ImeHandler ime() {
      return new RemoteInputMethodManager();
    }

    protected class RemoteInputMethodManager implements WebDriver.ImeHandler {
      public List<String> getAvailableEngines() {
        Response response = execute(DriverCommand.IME_GET_AVAILABLE_ENGINES);
        return (List<String>) response.getValue();
      }

      public String getActiveEngine() {
        Response response = execute(DriverCommand.IME_GET_ACTIVE_ENGINE);
        return (String) response.getValue();
      }

      public boolean isActivated() {
        Response response = execute(DriverCommand.IME_IS_ACTIVATED);
        return (Boolean) response.getValue();
      }

      public void deactivate() {
        execute(DriverCommand.IME_DEACTIVATE);
      }

      public void activateEngine(String engine) {
        execute(DriverCommand.IME_ACTIVATE_ENGINE, ImmutableMap.of("engine", engine));
      }
    } // RemoteInputMethodManager class

    protected class RemoteTimeouts implements Timeouts {

      public Timeouts implicitlyWait(long time, TimeUnit unit) {
        execute(DriverCommand.IMPLICITLY_WAIT, ImmutableMap.of("ms",
            TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit)));
        return this;
      }

      public Timeouts setScriptTimeout(long time, TimeUnit unit) {
        execute(DriverCommand.SET_SCRIPT_TIMEOUT,
            ImmutableMap.of("ms", TimeUnit.MILLISECONDS.convert(time, unit)));
        return this;
      }
    } // timeouts class.
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

    public WebDriver frame(WebElement frameElement) {
      Object elementAsJson = new WebElementToJsonConverter().apply(frameElement);
      execute(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of("id", elementAsJson));
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

    public Alert alert() {
      return new RemoteAlert();
    }
  }

  private class RemoteAlert implements Alert {
    public void dismiss() {
      execute(DriverCommand.DISMISS_ALERT);
    }

    public void accept() {
      execute(DriverCommand.ACCEPT_ALERT);
    }

    public String getText() {
      Response response = execute(DriverCommand.GET_ALERT_TEXT);
      return response.getValue().toString();
    }

    public void sendKeys(String keysToSend) {
      execute(DriverCommand.SET_ALERT_VALUE, ImmutableMap.of("text", keysToSend));
    }
  }

  private class RemoteKeyboard implements Keyboard {
    public void sendKeys(CharSequence... keysToSend) {
      switchTo().activeElement().sendKeys(keysToSend);
    }

    public void pressKey(Keys keyToPress) {
      execute(DriverCommand.SEND_MODIFIER_KEY_TO_ACTIVE_ELEMENT,
          ImmutableMap.of("value", keyToPress, "isdown", true));
      }

    public void releaseKey(Keys keyToRelease) {
      execute(DriverCommand.SEND_MODIFIER_KEY_TO_ACTIVE_ELEMENT,
          ImmutableMap.of("value", keyToRelease, "isdown", false));

    }
  }

  public class RemoteMouse implements Mouse {
    private Map<String, Object> paramsFromCoordinates(Coordinates where) {
      Map<String, Object> params = Maps.newHashMap();

      if (where != null) {
        String id = (String) where.getAuxiliry();
        params.put("element", id);
      }

      return params;
    }

    private void moveIfNeeded(Coordinates where) {
      if (where != null) {
        mouseMove(where);
      }
    }

    public void click(Coordinates where) {
      moveIfNeeded(where);

      execute(DriverCommand.CLICK, ImmutableMap.of("button", 0));
    }

    public void contextClick(Coordinates where) {
      moveIfNeeded(where);

      execute(DriverCommand.CLICK, ImmutableMap.of("button", 2));
    }

    public void doubleClick(Coordinates where) {
      moveIfNeeded(where);

      execute(DriverCommand.DOUBLE_CLICK);
    }

    public void mouseDown(Coordinates where) {
      moveIfNeeded(where);

      execute(DriverCommand.MOUSE_DOWN);
    }

    public void mouseUp(Coordinates where) {
      moveIfNeeded(where);

      execute(DriverCommand.MOUSE_UP);
    }

    public void mouseMove(Coordinates where) {
      Map<String, Object> moveParams = paramsFromCoordinates(where);

      execute(DriverCommand.MOVE_TO, moveParams);
    }

    public void mouseMove(Coordinates where, long xOffset, long yOffset) {
      Map<String, Object> moveParams = paramsFromCoordinates(where);
      moveParams.put("xoffset", xOffset);
      moveParams.put("yoffset", yOffset);

      execute(DriverCommand.MOVE_TO, moveParams);
    }

  }
}
