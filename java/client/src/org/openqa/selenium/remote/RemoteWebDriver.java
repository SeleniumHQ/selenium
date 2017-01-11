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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Interactive;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;
import org.openqa.selenium.security.Credentials;
import org.openqa.selenium.security.UserAndPassword;

import java.net.URL;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

@Augmentable
public class RemoteWebDriver implements WebDriver, JavascriptExecutor,
      FindsById, FindsByClassName, FindsByLinkText, FindsByName,
      FindsByCssSelector, FindsByTagName, FindsByXPath,
      HasInputDevices, HasCapabilities, Interactive, TakesScreenshot {

  // TODO(dawagner): This static logger should be unified with the per-instance localLogs
  private static final Logger logger = Logger.getLogger(RemoteWebDriver.class.getName());
  private Level level = Level.FINE;

  private ErrorHandler errorHandler = new ErrorHandler();
  private CommandExecutor executor;
  private Capabilities capabilities;
  private SessionId sessionId;
  private FileDetector fileDetector = new UselessFileDetector();
  private ExecuteMethod executeMethod;

  private JsonToWebElementConverter converter;

  private RemoteKeyboard keyboard;
  private RemoteMouse mouse;
  private Logs remoteLogs;
  private LocalLogs localLogs;

  // For cglib
  protected RemoteWebDriver() {
    init(new DesiredCapabilities(), null);
  }

  public RemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this.executor = executor;

    init(desiredCapabilities, requiredCapabilities);

    if (executor instanceof NeedsLocalLogs) {
      ((NeedsLocalLogs)executor).setLocalLogs(localLogs);
    }

    try {
      startClient(desiredCapabilities, requiredCapabilities);
    } catch (RuntimeException e) {
      try {
        stopClient(desiredCapabilities, requiredCapabilities);
      } catch (Exception ignored) {
        // Ignore the clean-up exception. We'll propagate the original failure.
      }

      throw e;
    }

    try {
      startSession(desiredCapabilities, requiredCapabilities);
    } catch (RuntimeException e) {
      try {
        quit();
      } catch (Exception ignored) {
        // Ignore the clean-up exception. We'll propagate the original failure.
      }

      throw e;
    }
  }

  public RemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities) {
    this(executor, desiredCapabilities, null);
  }

  public RemoteWebDriver(Capabilities desiredCapabilities) {
    this((URL) null, desiredCapabilities);
  }

  public RemoteWebDriver(URL remoteAddress, Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this(new HttpCommandExecutor(remoteAddress), desiredCapabilities,
        requiredCapabilities);
  }

  public RemoteWebDriver(URL remoteAddress, Capabilities desiredCapabilities) {
    this(new HttpCommandExecutor(remoteAddress), desiredCapabilities, null);
  }

  private void init(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    logger.addHandler(LoggingHandler.getInstance());

    converter = new JsonToWebElementConverter(this);
    executeMethod = new RemoteExecuteMethod(this);
    keyboard = new RemoteKeyboard(executeMethod);
    mouse = new RemoteMouse(executeMethod);

    ImmutableSet.Builder<String> builder = new ImmutableSet.Builder<>();

    boolean isProfilingEnabled = desiredCapabilities != null &&
        desiredCapabilities.is(CapabilityType.ENABLE_PROFILING_CAPABILITY);
    if (requiredCapabilities != null && requiredCapabilities.getCapability(
        CapabilityType.ENABLE_PROFILING_CAPABILITY) != null) {
      isProfilingEnabled = requiredCapabilities.is(CapabilityType.ENABLE_PROFILING_CAPABILITY);
    }
    if (isProfilingEnabled) {
      builder.add(LogType.PROFILER);
    }

    LoggingPreferences mergedLoggingPrefs = new LoggingPreferences();
    if (desiredCapabilities != null) {
      mergedLoggingPrefs.addPreferences((LoggingPreferences)desiredCapabilities.getCapability(
          CapabilityType.LOGGING_PREFS));
    }
    if (requiredCapabilities != null) {
      mergedLoggingPrefs.addPreferences((LoggingPreferences)requiredCapabilities.getCapability(
          CapabilityType.LOGGING_PREFS));
    }
    if ((mergedLoggingPrefs.getEnabledLogTypes().contains(LogType.CLIENT) &&
        mergedLoggingPrefs.getLevel(LogType.CLIENT) != Level.OFF) ||
        !mergedLoggingPrefs.getEnabledLogTypes().contains(LogType.CLIENT)) {
      builder.add(LogType.CLIENT);
    }

    Set<String> logTypesToInclude = builder.build();

    LocalLogs performanceLogger = LocalLogs.getStoringLoggerInstance(logTypesToInclude);
    LocalLogs clientLogs = LocalLogs.getHandlerBasedLoggerInstance(LoggingHandler.getInstance(),
        logTypesToInclude);
    localLogs = LocalLogs.getCombinedLogsHolder(clientLogs, performanceLogger);
    remoteLogs = new RemoteLogs(executeMethod, localLogs);
  }

  /**
   * Set the file detector to be used when sending keyboard input. By default, this is set to a file
   * detector that does nothing.
   *
   * @param detector The detector to use. Must not be null.
   * @see FileDetector
   * @see LocalFileDetector
   * @see UselessFileDetector
   */
  public void setFileDetector(FileDetector detector) {
    if (detector == null) {
      throw new WebDriverException("You may not set a file detector that is null");
    }
    fileDetector = detector;
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  protected void setSessionId(String opaqueKey) {
    sessionId = new SessionId(opaqueKey);
  }

  protected void startSession(Capabilities desiredCapabilities) {
    startSession(desiredCapabilities, null);
  }

  @SuppressWarnings({"unchecked"})
  protected void startSession(Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    ImmutableMap.Builder<String, Capabilities> paramBuilder =
        new ImmutableMap.Builder<>();
    paramBuilder.put("desiredCapabilities", desiredCapabilities);
    if (requiredCapabilities != null) {
      paramBuilder.put("requiredCapabilities", requiredCapabilities);
    }
    Map<String, ?> parameters = paramBuilder.build();

    Response response = execute(DriverCommand.NEW_SESSION, parameters);

    Map<String, Object> rawCapabilities = (Map<String, Object>) response.getValue();
    DesiredCapabilities returnedCapabilities = new DesiredCapabilities();
    for (Map.Entry<String, Object> entry : rawCapabilities.entrySet()) {
      // Handle the platform later
      if (CapabilityType.PLATFORM.equals(entry.getKey())) {
        continue;
      }
      returnedCapabilities.setCapability(entry.getKey(), entry.getValue());
    }
    String platformString = (String) rawCapabilities.get(CapabilityType.PLATFORM);
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
   * Method called before {@link #startSession(Capabilities) starting a new session}. The default
   * implementation is a no-op, but subtypes should override this method to define custom behavior.
   */
  protected void startClient() {
  }

  /**
   * Method called before {@link #startSession(Capabilities) starting a new session}. The default
   * implementation is a no-op, but subtypes should override this method to define custom behavior.
   */
  protected void startClient(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    startClient();
  }

  /**
   * Method called after executing a {@link #quit()} command. The default implementation is a no-op,
   * but subtypes should override this method to define custom behavior.
   */
  protected void stopClient() {
  }

  /**
   * Method called after executing a {@link #quit()} command. The default implementation is a no-op,
   * but subtypes should override this method to define custom behavior.
   */
  protected void stopClient(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    stopClient();
  }

  public ErrorHandler getErrorHandler() {
    return errorHandler;
  }

  public void setErrorHandler(ErrorHandler handler) {
    this.errorHandler = handler;
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
    Response response = execute(DriverCommand.GET_CURRENT_URL);
    if (response == null || response.getValue() == null) {
      throw new WebDriverException("Remote browser did not respond to getCurrentUrl");
    }
    return response.getValue().toString();
  }

  public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    Response response = execute(DriverCommand.SCREENSHOT);
    Object result = response.getValue();
    if (result instanceof String) {
      String base64EncodedPng = (String) result;
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else if (result instanceof byte[]) {
      String base64EncodedPng = new String((byte[]) result);
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else {
      throw new RuntimeException(String.format("Unexpected result for %s command: %s",
          DriverCommand.SCREENSHOT,
          result == null ? "null" : result.getClass().getName() + " instance"));
    }
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
    Object value = response.getValue();
    WebElement element;
    try {
      element = (WebElement) value;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to WebElement: " + value, ex);
    }
    setFoundBy(this, element, by, using);
    return element;
  }

  protected void setFoundBy(SearchContext context, WebElement element, String by, String using) {
    if (element instanceof RemoteWebElement) {
      ((RemoteWebElement) element).setFoundBy(context, by, using);
    }
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String by, String using) {
    if (using == null) {
      throw new IllegalArgumentException("Cannot find elements when the selector is null.");
    }

    Response response = execute(DriverCommand.FIND_ELEMENTS,
        ImmutableMap.of("using", by, "value", using));
    Object value = response.getValue();
    List<WebElement> allElements;
    try {
      allElements = (List<WebElement>) value;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to List<WebElement>: " + value, ex);
    }
    for (WebElement element : allElements) {
      setFoundBy(this, element, by, using);
    }
    return allElements;
  }

  static String cssEscape(String using) {
    using = using.replaceAll("(['\"\\\\#.:;,!?+<>=~*^$|%&@`{}\\-\\/\\[\\]\\(\\)])", "\\\\$1");
    if (using.length() > 0 && Character.isDigit(using.charAt(0))) {
      using = "\\" + Integer.toString(30 + Integer.parseInt(using.substring(0,1))) + " " + using.substring(1);
    }
    return using;
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
    // no-op if session id is null. We're only going to make ourselves unhappy
    if (sessionId == null) {
      return;
    }

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
    Object value = response.getValue();
    try {
      List<String> returnedValues = (List<String>) value;
      return new LinkedHashSet<>(returnedValues);
    } catch (ClassCastException ex) {
      throw new WebDriverException(
        "Returned value cannot be converted to List<String>: " + value, ex);
    }
  }

  public String getWindowHandle() {
    return String.valueOf(execute(DriverCommand.GET_CURRENT_WINDOW_HANDLE).getValue());
  }

  public Object executeScript(String script, Object... args) {
    if (!capabilities.isJavascriptEnabled()) {
      throw new UnsupportedOperationException(
          "You must be using an underlying instance of WebDriver that supports executing javascript");
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

  protected void setElementConverter(JsonToWebElementConverter converter) {
    this.converter = converter;
  }

  protected JsonToWebElementConverter getElementConverter() {
    return converter;
  }

  /**
   * Sets the RemoteWebDriver's client log level.
   *
   * @param level The log level to use.
   */
  public void setLogLevel(Level level) {
    this.level = level;
  }

  protected Response execute(String driverCommand, Map<String, ?> parameters) {
    Command command = new Command(sessionId, driverCommand, parameters);
    Response response;

    long start = System.currentTimeMillis();
    String currentName = Thread.currentThread().getName();
    Thread.currentThread().setName(
        String.format("Forwarding %s on session %s to remote", driverCommand, sessionId));
    try {
      log(sessionId, command.getName(), command, When.BEFORE);
      response = executor.execute(command);
      log(sessionId, command.getName(), command, When.AFTER);

      if (response == null) {
        return null;
      }

      // Unwrap the response value by converting any JSON objects of the form
      // {"ELEMENT": id} to RemoteWebElements.
      Object value = converter.apply(response.getValue());
      response.setValue(value);
    } catch (WebDriverException e) {
      throw e;
    } catch (Exception e) {
      log(sessionId, command.getName(), command, When.EXCEPTION);
      String errorMessage = "Error communicating with the remote browser. " +
          "It may have died.";
      if (driverCommand.equals(DriverCommand.NEW_SESSION)) {
        errorMessage = "Could not start a new session. Possible causes are " +
            "invalid address of the remote server or browser start-up failure.";
      }
      UnreachableBrowserException ube = new UnreachableBrowserException(errorMessage, e);
      if (getSessionId() != null) {
        ube.addInfo(WebDriverException.SESSION_ID, getSessionId().toString());
      }
      if (getCapabilities() != null) {
        ube.addInfo("Capabilities", getCapabilities().toString());
      }
      throw ube;
    } finally {
      Thread.currentThread().setName(currentName);
    }

    try {
      errorHandler.throwIfResponseFailed(response, System.currentTimeMillis() - start);
    } catch (WebDriverException ex) {
      if (parameters != null && parameters.containsKey("using") && parameters.containsKey("value")) {
        ex.addInfo(
            "*** Element info",
            String.format(
                "{Using=%s, value=%s}",
                parameters.get("using"),
                parameters.get("value")));
      }
      ex.addInfo(WebDriverException.DRIVER_INFO, this.getClass().getName());
      if (getSessionId() != null) {
        ex.addInfo(WebDriverException.SESSION_ID, getSessionId().toString());
      }
      if (getCapabilities() != null) {
        ex.addInfo("Capabilities", getCapabilities().toString());
      }
      throw ex;
    }
    return response;
  }

  protected Response execute(String command) {
    return execute(command, ImmutableMap.<String, Object>of());
  }

  protected ExecuteMethod getExecuteMethod() {
    return executeMethod;
  }

  @Override
  public void perform(Collection<Sequence> actions) {
    execute(DriverCommand.ACTIONS, ImmutableMap.of("actions", actions));
  }

  @Override
  public void resetInputState() {
    execute(DriverCommand.CLEAR_ACTIONS_STATE);
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
   * @param sessionId   the session id.
   * @param commandName the command that is being executed.
   * @param toLog       any data that might be interesting.
   * @param when        verb tense of "Execute" to prefix message
   */
  protected void log(SessionId sessionId, String commandName, Object toLog, When when) {
    String text = "" + toLog;
    if (commandName.equals(DriverCommand.EXECUTE_SCRIPT)
        || commandName.equals(DriverCommand.EXECUTE_ASYNC_SCRIPT)) {
      if (text.length() > 100 && Boolean.getBoolean("webdriver.remote.shorten_log_messages")) {
        text = text.substring(0, 100) + "...";
      }
    }
    switch(when) {
      case BEFORE:
        logger.log(level, "Executing: " + commandName + " " + text);
        break;
      case AFTER:
        logger.log(level, "Executed: " + text);
        break;
      case EXCEPTION:
        logger.log(level, "Exception: " + text);
        break;
      default:
        logger.log(level, text);
        break;
    }
  }

  public FileDetector getFileDetector() {
    return fileDetector;
  }

  protected class RemoteWebDriverOptions implements Options {

    @Beta
    public Logs logs() {
      return remoteLogs;
    }

    public void addCookie(Cookie cookie) {
      cookie.validate();
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

      Set<Cookie> toReturn = new HashSet<>();

      List<Map<String, Object>> cookies =
          new JsonToBeanConverter().convert(List.class, returned);
      if (cookies == null) {
        return toReturn;
      }

      for (Map<String, Object> rawCookie : cookies) {
        String name = (String) rawCookie.get("name");
        String value = (String) rawCookie.get("value");
        String path = (String) rawCookie.get("path");
        String domain = (String) rawCookie.get("domain");
        boolean secure = rawCookie.containsKey("secure") && (Boolean) rawCookie.get("secure");
        boolean httpOnly = rawCookie.containsKey("httpOnly") && (Boolean) rawCookie.get("httpOnly");

        Number expiryNum = (Number) rawCookie.get("expiry");
        Date expiry = expiryNum == null ? null : new Date(
            TimeUnit.SECONDS.toMillis(expiryNum.longValue()));

        toReturn.add(new Cookie.Builder(name, value)
            .path(path)
            .domain(domain)
            .isSecure(secure)
            .isHttpOnly(httpOnly)
            .expiresOn(expiry)
            .build());
      }

      return toReturn;
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

    @Beta
    public Window window() {
      return new RemoteWindow();
    }

    protected class RemoteInputMethodManager implements WebDriver.ImeHandler {

      @SuppressWarnings("unchecked")
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
        execute(DriverCommand.SET_TIMEOUT, ImmutableMap.of(
            "type", "implicit",
            "ms", TimeUnit.MILLISECONDS.convert(time, unit)));
        return this;
      }

      public Timeouts setScriptTimeout(long time, TimeUnit unit) {
        execute(DriverCommand.SET_TIMEOUT, ImmutableMap.of(
            "type", "script",
            "ms", TimeUnit.MILLISECONDS.convert(time, unit)));
        return this;
      }

      public Timeouts pageLoadTimeout(long time, TimeUnit unit) {
        execute(DriverCommand.SET_TIMEOUT, ImmutableMap.of(
            "type", "page load",
            "ms", TimeUnit.MILLISECONDS.convert(time, unit)));
        return this;
      }
    } // timeouts class.

    @Beta
    protected class RemoteWindow implements Window {

      public void setSize(Dimension targetSize) {
        execute(DriverCommand.SET_CURRENT_WINDOW_SIZE,
                ImmutableMap.of("width", targetSize.width, "height", targetSize.height));
      }

      public void setPosition(Point targetPosition) {
        execute(DriverCommand.SET_CURRENT_WINDOW_POSITION,
                ImmutableMap.of("x", targetPosition.x, "y", targetPosition.y));
      }

      @SuppressWarnings({"unchecked"})
      public Dimension getSize() {
        Response response = execute(DriverCommand.GET_CURRENT_WINDOW_SIZE);

        Map<String, Object> rawSize = (Map<String, Object>) response.getValue();

        int width = ((Number) rawSize.get("width")).intValue();
        int height = ((Number) rawSize.get("height")).intValue();

        return new Dimension(width, height);
      }

      @SuppressWarnings({"unchecked"})
      Map<String, Object> rawPoint;
      public Point getPosition() {
        Response response = execute(DriverCommand.GET_CURRENT_WINDOW_POSITION,
                                    ImmutableMap.of("windowHandle", "current"));
        rawPoint = (Map<String, Object>) response.getValue();

        int x = ((Number) rawPoint.get("x")).intValue();
        int y = ((Number) rawPoint.get("y")).intValue();

        return new Point(x, y);
      }

      public void maximize() {
        execute(DriverCommand.MAXIMIZE_CURRENT_WINDOW);
      }

      public void fullscreen() {
        execute(DriverCommand.FULLSCREEN_CURRENT_WINDOW);
      }
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
      String name = frameName.replaceAll("(['\"\\\\#.:;,!?+<>=~*^$|%&@`{}\\-/\\[\\]\\(\\)])", "\\\\$1");
      List<WebElement> frameElements = RemoteWebDriver.this.findElements(
          By.cssSelector("frame[name='" + name + "'],iframe[name='" + name + "']"));
      if (frameElements.size() == 0) {
        frameElements = RemoteWebDriver.this.findElements(
            By.cssSelector("frame#" + name + ",iframe#" + name));
      }
      if (frameElements.size() == 0) {
        throw new NoSuchFrameException("No frame element found by name or id " + frameName);
      }
      return frame(frameElements.get(0));
    }

    public WebDriver frame(WebElement frameElement) {
      Object elementAsJson = new WebElementToJsonConverter().apply(frameElement);
      execute(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of("id", elementAsJson));
      return RemoteWebDriver.this;
    }

    public WebDriver parentFrame() {
      execute(DriverCommand.SWITCH_TO_PARENT_FRAME);
      return RemoteWebDriver.this;
    }

    public WebDriver window(String windowHandleOrName) {
      try {
        execute(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("handle", windowHandleOrName));
        return RemoteWebDriver.this;
      } catch (NoSuchWindowException nsw) {
        // simulate search by name
        String original = getWindowHandle();
        for (String handle : getWindowHandles()) {
          switchTo().window(handle);
          if (windowHandleOrName.equals(executeScript("return window.name"))) {
            return RemoteWebDriver.this; // found by name
          }
        }
        switchTo().window(original);
        throw nsw;
      }
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
      execute(DriverCommand.GET_ALERT_TEXT);
      return new RemoteAlert();
    }
  }

  private class RemoteAlert implements Alert {

    public RemoteAlert() {
    }

    public void dismiss() {
      execute(DriverCommand.DISMISS_ALERT);
    }

    public void accept() {
      execute(DriverCommand.ACCEPT_ALERT);
    }

    public String getText() {
      return (String) execute(DriverCommand.GET_ALERT_TEXT).getValue();
    }

    public void sendKeys(String keysToSend) {
      execute(DriverCommand.SET_ALERT_VALUE, ImmutableMap.of("text", keysToSend));
    }

    @Beta
    public void setCredentials(Credentials credentials) {
      if (!(credentials instanceof UserAndPassword)) {
        throw new RuntimeException("Unsupported credentials: " + credentials);
      }

      UserAndPassword userAndPassword = (UserAndPassword) credentials;
      execute(
        DriverCommand.SET_ALERT_CREDENTIALS,
        ImmutableMap.of(
          "username", userAndPassword.getUsername(),
          "password", userAndPassword.getPassword()));
    }

    /**
     * Authenticate an HTTP Basic Auth dialog.
     * Implicitly 'clicks ok'
     *
     * Usage: driver.switchTo().alert().authenticateUsing(new UsernamePasswordCredentials("cheese",
     *        "secretGouda"));
     * @param credentials credentials to pass to Auth prompt
     */
    @Beta
    public void authenticateUsing(Credentials credentials) {
      this.setCredentials(credentials);
      this.accept();
    }
  }

  public enum When {
    BEFORE,
    AFTER,
    EXCEPTION
  }

  @Override
  public String toString() {
    Capabilities caps = getCapabilities();
    if (caps == null) {
      return super.toString();
    }
    return String.format("%s: %s on %s (%s)", getClass().getSimpleName(),
        caps.getBrowserName(), caps.getPlatform(), getSessionId());
  }
}
