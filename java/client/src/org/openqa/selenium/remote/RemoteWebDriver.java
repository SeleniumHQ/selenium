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
import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Pdf;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.PrintsPage;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Interactive;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.print.PrintOptions;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;
import org.openqa.selenium.remote.tracing.TracedHttpClient;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.remote.tracing.opentelemetry.OpenTelemetryTracer;
import org.openqa.selenium.virtualauthenticator.Credential;
import org.openqa.selenium.virtualauthenticator.HasVirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.Base64;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.BiFunction;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Collections.singleton;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.remote.CapabilityType.LOGGING_PREFS;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_JAVASCRIPT;

@Augmentable
public class RemoteWebDriver implements WebDriver,
  JavascriptExecutor,
  HasInputDevices,
  HasCapabilities,
  HasVirtualAuthenticator,
  Interactive,
  PrintsPage,
  TakesScreenshot {

  // TODO: This static logger should be unified with the per-instance localLogs
  private static final Logger logger = Logger.getLogger(RemoteWebDriver.class.getName());
  private Level level = Level.FINE;
  private final ElementLocation elementLocation = new ElementLocation();

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
    this.capabilities = init(new ImmutableCapabilities());
  }

  private static URL getDefaultServerURL() {
    try {
      return new URL(System.getProperty("webdriver.remote.server", "http://localhost:4444/"));
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }
  }

  public RemoteWebDriver(Capabilities capabilities) {
    this(getDefaultServerURL(),
         Require.nonNull("Capabilities", capabilities));
  }

  public RemoteWebDriver(URL remoteAddress, Capabilities capabilities) {
    this(createTracedExecutorWithTracedHttpClient(Require.nonNull("Server URL", remoteAddress)),
         Require.nonNull("Capabilities", capabilities));
  }

  private static CommandExecutor createTracedExecutorWithTracedHttpClient(URL remoteAddress) {
    Tracer tracer = OpenTelemetryTracer.getInstance();
    CommandExecutor executor = new HttpCommandExecutor(
      Collections.emptyMap(),
      ClientConfig.defaultConfig().baseUrl(remoteAddress),
      new TracedHttpClient.Factory(tracer, HttpClient.Factory.createDefault()));
    return new TracedCommandExecutor(executor, tracer);
  }

  public RemoteWebDriver(CommandExecutor executor, Capabilities capabilities) {
    this.executor = Require.nonNull("Command executor", executor);
    capabilities = init(capabilities);

    if (executor instanceof NeedsLocalLogs) {
      ((NeedsLocalLogs) executor).setLocalLogs(localLogs);
    }

    try {
      startSession(capabilities);
    } catch (RuntimeException e) {
      try {
        quit();
      } catch (Exception ignored) {
        // Ignore the clean-up exception. We'll propagate the original failure.
      }

      throw e;
    }
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return new RemoteWebDriverBuilder();
  }

  private Capabilities init(Capabilities capabilities) {
    capabilities = capabilities == null ? new ImmutableCapabilities() : capabilities;

    logger.addHandler(LoggingHandler.getInstance());

    converter = new JsonToWebElementConverter(this);
    executeMethod = new RemoteExecuteMethod(this);
    keyboard = new RemoteKeyboard(executeMethod);
    mouse = new RemoteMouse(executeMethod);

    ImmutableSet.Builder<String> builder = new ImmutableSet.Builder<>();

    boolean isProfilingEnabled = capabilities.is(CapabilityType.ENABLE_PROFILING_CAPABILITY);
    if (isProfilingEnabled) {
      builder.add(LogType.PROFILER);
    }

    LoggingPreferences mergedLoggingPrefs = new LoggingPreferences();
    mergedLoggingPrefs.addPreferences((LoggingPreferences) capabilities.getCapability(LOGGING_PREFS));

    if (!mergedLoggingPrefs.getEnabledLogTypes().contains(LogType.CLIENT) ||
        mergedLoggingPrefs.getLevel(LogType.CLIENT) != Level.OFF) {
      builder.add(LogType.CLIENT);
    }

    Set<String> logTypesToInclude = builder.build();

    LocalLogs performanceLogger = LocalLogs.getStoringLoggerInstance(logTypesToInclude);
    LocalLogs clientLogs = LocalLogs.getHandlerBasedLoggerInstance(
      LoggingHandler.getInstance(), logTypesToInclude);
    localLogs = LocalLogs.getCombinedLogsHolder(clientLogs, performanceLogger);
    remoteLogs = new RemoteLogs(executeMethod, localLogs);

    return capabilities;
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

  protected void startSession(Capabilities capabilities) {
    Response response = execute(DriverCommand.NEW_SESSION(singleton(capabilities)));

    if (response == null) {
      throw new SessionNotCreatedException(
        "The underlying command executor returned a null response.");
    }

    Object responseValue = response.getValue();

    if (responseValue == null) {
      throw new SessionNotCreatedException(
        "The underlying command executor returned a response without payload: " +
        response.toString());
    }

    if (!(responseValue instanceof Map)) {
      throw new SessionNotCreatedException(
        "The underlying command executor returned a response with a non well formed payload: " +
        response.toString());
    }

    @SuppressWarnings("unchecked") Map<String, Object> rawCapabilities = (Map<String, Object>) responseValue;
    MutableCapabilities returnedCapabilities = new MutableCapabilities(rawCapabilities);
    String platformString = (String) rawCapabilities.getOrDefault(
      PLATFORM,
      rawCapabilities.get(PLATFORM_NAME));
    Platform platform;
    try {
      if (platformString == null || "".equals(platformString)) {
        platform = Platform.ANY;
      } else {
        platform = Platform.fromString(platformString);
      }
    } catch (WebDriverException e) {
      // The server probably responded with a name matching the os.name
      // system property. Try to recover and parse this.
      platform = Platform.extractFromSysProperty(platformString);
    }
    returnedCapabilities.setCapability(PLATFORM, platform);
    returnedCapabilities.setCapability(PLATFORM_NAME, platform);

    if (rawCapabilities.containsKey(SUPPORTS_JAVASCRIPT)) {
      Object raw = rawCapabilities.get(SUPPORTS_JAVASCRIPT);
      if (raw instanceof String) {
        returnedCapabilities.setCapability(SUPPORTS_JAVASCRIPT, Boolean.parseBoolean((String) raw));
      } else if (raw instanceof Boolean) {
        returnedCapabilities.setCapability(SUPPORTS_JAVASCRIPT, ((Boolean) raw).booleanValue());
      }
    } else {
      returnedCapabilities.setCapability(SUPPORTS_JAVASCRIPT, true);
    }

    this.capabilities = returnedCapabilities;
    sessionId = new SessionId(response.getSessionId());
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

  @Override
  public Capabilities getCapabilities() {
    if(capabilities == null){
      return new ImmutableCapabilities();
    }
    return capabilities;
  }

  @Override
  public void get(String url) {
    execute(DriverCommand.GET(url));
  }

  @Override
  public String getTitle() {
    Response response = execute(DriverCommand.GET_TITLE);
    Object value = response.getValue();
    return value == null ? "" : value.toString();
  }

  @Override
  public String getCurrentUrl() {
    Response response = execute(DriverCommand.GET_CURRENT_URL);
    if (response == null || response.getValue() == null) {
      throw new WebDriverException("Remote browser did not respond to getCurrentUrl");
    }
    return response.getValue().toString();
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    Response response = execute(DriverCommand.SCREENSHOT);
    Object result = response.getValue();
    if (result instanceof String) {
      String base64EncodedPng = (String) result;
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else if (result instanceof byte[]) {
      return outputType.convertFromPngBytes((byte[]) result);
    } else {
      throw new RuntimeException(String.format("Unexpected result for %s command: %s",
          DriverCommand.SCREENSHOT,
          result == null ? "null" : result.getClass().getName() + " instance"));
    }
  }

  @Override
  public Pdf print(PrintOptions printOptions) throws WebDriverException {
    Response response = execute(DriverCommand.PRINT_PAGE(printOptions));

    Object result = response.getValue();
    return new Pdf((String) result);
  }

  @Override
  public WebElement findElement(By locator) {
    Require.nonNull("Locator", locator);

    return findElement(this, DriverCommand::FIND_ELEMENT, locator);
  }

  WebElement findElement(
    SearchContext context,
    BiFunction<String, Object, CommandPayload> findCommand,
    By locator) {

    return elementLocation.findElement(this, context, findCommand, locator);
  }

  @Override
  public List<WebElement> findElements(By locator) {
    Require.nonNull("Locator", locator);

    return findElements(this, DriverCommand::FIND_ELEMENTS, locator);
  }

  public List<WebElement> findElements(
    SearchContext context,
    BiFunction<String, Object, CommandPayload> findCommand,
    By locator) {

    return elementLocation.findElements(this, context, findCommand, locator);
  }

  /**
   * @deprecated Rely on using {@link By.Remotable} instead
   */
  @Deprecated
  protected WebElement findElement(String by, String using) {
    throw new UnsupportedOperationException("`findElement` has been replaced by usages of " + By.Remotable.class);
  }

  /**
   * @deprecated Rely on using {@link By.Remotable} instead
   */
  @Deprecated
  protected List<WebElement> findElements(String by, String using) {
    throw new UnsupportedOperationException("`findElement` has been replaced by usages of " + By.Remotable.class);
  }

  protected void setFoundBy(SearchContext context, WebElement element, String by, String using) {
    if (element instanceof RemoteWebElement) {
      RemoteWebElement remoteElement = (RemoteWebElement) element;
      remoteElement.setFoundBy(context, by, using);
      remoteElement.setFileDetector(getFileDetector());
    }
  }

  // Misc

  @Override
  public String getPageSource() {
    return (String) execute(DriverCommand.GET_PAGE_SOURCE).getValue();
  }

  @Override
  public void close() {
    execute(DriverCommand.CLOSE);
  }

  @Override
  public void quit() {
    // no-op if session id is null. We're only going to make ourselves unhappy
    if (sessionId == null) {
      return;
    }

    try {
      execute(DriverCommand.QUIT);
    } finally {
      sessionId = null;
    }
  }

  @Override
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

  @Override
  public String getWindowHandle() {
    return String.valueOf(execute(DriverCommand.GET_CURRENT_WINDOW_HANDLE).getValue());
  }

  @Override
  public Object executeScript(String script, Object... args) {
    if (!isJavascriptEnabled()) {
      throw new UnsupportedOperationException(
          "You must be using an underlying instance of WebDriver that supports executing javascript");
    }

    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    List<Object> convertedArgs = Stream.of(args).map(new WebElementToJsonConverter()).collect(
        Collectors.toList());

    return execute(DriverCommand.EXECUTE_SCRIPT(script, convertedArgs)).getValue();
  }

  @Override
  public Object executeAsyncScript(String script, Object... args) {
    if (!isJavascriptEnabled()) {
      throw new UnsupportedOperationException("You must be using an underlying instance of " +
          "WebDriver that supports executing javascript");
    }

    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    List<Object> convertedArgs = Stream.of(args).map(new WebElementToJsonConverter()).collect(
        Collectors.toList());

    return execute(DriverCommand.EXECUTE_ASYNC_SCRIPT(script, convertedArgs)).getValue();
  }

  private boolean isJavascriptEnabled() {
    return getCapabilities().is(SUPPORTS_JAVASCRIPT);
  }

  @Override
  public TargetLocator switchTo() {
    return new RemoteTargetLocator();
  }

  @Override
  public Navigation navigate() {
    return new RemoteNavigation();
  }

  @Override
  public Options manage() {
    return new RemoteWebDriverOptions();
  }

  protected void setElementConverter(JsonToWebElementConverter converter) {
    this.converter = Require.nonNull("Element converter", converter);
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
    logger.setLevel(level);
  }

  protected Response execute(CommandPayload payload) {
    Command command = new Command(sessionId, payload);
    Response response;

    long start = System.currentTimeMillis();
    String currentName = Thread.currentThread().getName();
    Thread.currentThread().setName(
      String.format("Forwarding %s on session %s to remote", command.getName(), sessionId));
    try {
      log(sessionId, command.getName(), command, When.BEFORE);
      response = executor.execute(command);
      log(sessionId, command.getName(), response, When.AFTER);

      if (response == null) {
        return null;
      }

      // Unwrap the response value by converting any JSON objects of the form
      // {"ELEMENT": id} to RemoteWebElements.
      Object value = getElementConverter().apply(response.getValue());
      response.setValue(value);
    } catch (Throwable e) {
      log(sessionId, command.getName(), command, When.EXCEPTION);
      WebDriverException toThrow;
      if (command.getName().equals(DriverCommand.NEW_SESSION)) {
        if (e instanceof SessionNotCreatedException) {
          toThrow = (WebDriverException) e;
        } else {
          toThrow = new SessionNotCreatedException(
            "Possible causes are invalid address of the remote server or browser start-up failure.", e);
        }
      } else if (e instanceof WebDriverException) {
        toThrow = (WebDriverException) e;
      } else {
        toThrow = new UnreachableBrowserException(
          "Error communicating with the remote browser. It may have died.", e);
      }
      populateWebDriverException(toThrow);
      toThrow.addInfo("Command", command.toString());
      throw toThrow;
    } finally {
      Thread.currentThread().setName(currentName);
    }

    try {
      errorHandler.throwIfResponseFailed(response, System.currentTimeMillis() - start);
    } catch (WebDriverException ex) {
      populateWebDriverException(ex);
      ex.addInfo("Command", command.toString());
      throw ex;
    }
    return response;
  }

  private void populateWebDriverException(WebDriverException ex) {
    ex.addInfo(WebDriverException.DRIVER_INFO, this.getClass().getName());
    if (getSessionId() != null) {
      ex.addInfo(WebDriverException.SESSION_ID, getSessionId().toString());
    }
    if (getCapabilities() != null) {
      ex.addInfo("Capabilities", getCapabilities().toString());
    }
  }

  protected Response execute(String driverCommand, Map<String, ?> parameters) {
    return execute(new CommandPayload(driverCommand, parameters));
  }

  protected Response execute(String command) {
    return execute(command, ImmutableMap.of());
  }

  protected ExecuteMethod getExecuteMethod() {
    return executeMethod;
  }

  @Override
  public void perform(Collection<Sequence> actions) {
    execute(DriverCommand.ACTIONS(actions));
  }

  @Override
  public void resetInputState() {
    execute(DriverCommand.CLEAR_ACTIONS_STATE);
  }

  @Override
  public Keyboard getKeyboard() {
    return keyboard;
  }

  @Override
  public Mouse getMouse() {
    return mouse;
  }

  @Override
  public VirtualAuthenticator addVirtualAuthenticator(VirtualAuthenticatorOptions options) {
    String authenticatorId = (String)
        execute(DriverCommand.ADD_VIRTUAL_AUTHENTICATOR, options.toMap()).getValue();
    return new RemoteVirtualAuthenticator(authenticatorId);
  }

  @Override
  public void removeVirtualAuthenticator(VirtualAuthenticator authenticator) {
    execute(DriverCommand.REMOVE_VIRTUAL_AUTHENTICATOR,
        ImmutableMap.of("authenticatorId", authenticator.getId()));
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
    if (!logger.isLoggable(level)) {
      return;
    }
    String text = String.valueOf(toLog);
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

    @Override
    @Beta
    public Logs logs() {
      return remoteLogs;
    }

    @Override
    public void addCookie(Cookie cookie) {
      cookie.validate();
      execute(DriverCommand.ADD_COOKIE(cookie));
    }

    @Override
    public void deleteCookieNamed(String name) {
      execute(DriverCommand.DELETE_COOKIE(name));
    }

    @Override
    public void deleteCookie(Cookie cookie) {
      deleteCookieNamed(cookie.getName());
    }

    @Override
    public void deleteAllCookies() {
      execute(DriverCommand.DELETE_ALL_COOKIES);
    }

    @Override
    @SuppressWarnings({"unchecked"})
    public Set<Cookie> getCookies() {
      Object returned = execute(DriverCommand.GET_ALL_COOKIES).getValue();

      Set<Cookie> toReturn = new HashSet<>();

      if (!(returned instanceof Collection)) {
        return toReturn;
      }

      ((Collection<?>) returned).stream()
          .map(o -> (Map<String, Object>) o)
          .map(rawCookie -> {
            // JSON object keys are defined in
            // https://w3c.github.io/webdriver/#dfn-table-for-cookie-conversion.
            Cookie.Builder builder =
                new Cookie.Builder((String) rawCookie.get("name"), (String) rawCookie.get("value"))
                    .path((String) rawCookie.get("path"))
                    .domain((String) rawCookie.get("domain"))
                    .isSecure(rawCookie.containsKey("secure") && (Boolean) rawCookie.get("secure"))
                    .isHttpOnly(
                        rawCookie.containsKey("httpOnly") && (Boolean) rawCookie.get("httpOnly"))
                    .sameSite((String) rawCookie.get("sameSite"));

            Number expiryNum = (Number) rawCookie.get("expiry");
            builder.expiresOn(expiryNum == null ? null : new Date(SECONDS.toMillis(expiryNum.longValue())));
            return builder.build();
          })
          .forEach(toReturn::add);

      return toReturn;
    }

    @Override
    public Cookie getCookieNamed(String name) {
      Set<Cookie> allCookies = getCookies();
      for (Cookie cookie : allCookies) {
        if (cookie.getName().equals(name)) {
          return cookie;
        }
      }
      return null;
    }

    @Override
    public Timeouts timeouts() {
      return new RemoteTimeouts();
    }

    @Override
    public ImeHandler ime() {
      return new RemoteInputMethodManager();
    }

    @Override
    @Beta
    public Window window() {
      return new RemoteWindow();
    }

    protected class RemoteInputMethodManager implements WebDriver.ImeHandler {

      @Override
      @SuppressWarnings("unchecked")
      public List<String> getAvailableEngines() {
        Response response = execute(DriverCommand.IME_GET_AVAILABLE_ENGINES);
        return (List<String>) response.getValue();
      }

      @Override
      public String getActiveEngine() {
        Response response = execute(DriverCommand.IME_GET_ACTIVE_ENGINE);
        return (String) response.getValue();
      }

      @Override
      public boolean isActivated() {
        Response response = execute(DriverCommand.IME_IS_ACTIVATED);
        return (Boolean) response.getValue();
      }

      @Override
      public void deactivate() {
        execute(DriverCommand.IME_DEACTIVATE);
      }

      @Override
      public void activateEngine(String engine) {
        execute(DriverCommand.IME_ACTIVATE_ENGINE(engine));
      }
    } // RemoteInputMethodManager class

    protected class RemoteTimeouts implements Timeouts {

      @Deprecated
      @Override
      public Timeouts implicitlyWait(long time, TimeUnit unit) {
        return implicitlyWait(Duration.ofMillis(unit.toMillis(time)));
      }

      @Override
      public Timeouts implicitlyWait(Duration duration) {
        execute(DriverCommand.SET_IMPLICIT_WAIT_TIMEOUT(duration));
        return this;
      }

      @Override
      public Duration getImplicitWaitTimeout() {
        Response response = execute(DriverCommand.GET_TIMEOUTS);
        Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
        long timeout = ((Number) rawSize.get("implicit")).longValue();
        return Duration.ofMillis(timeout);
      }

      @Deprecated
      @Override
      public Timeouts setScriptTimeout(long time, TimeUnit unit) {
        return setScriptTimeout(Duration.ofMillis(unit.toMillis(time)));
      }

      @Override
      public Timeouts setScriptTimeout(Duration duration) {
        return scriptTimeout(duration);
      }

      @Override
      public Timeouts scriptTimeout(Duration duration) {
        execute(DriverCommand.SET_SCRIPT_TIMEOUT(duration));
        return this;
      }

      @Override
      public Duration getScriptTimeout() {
        Response response = execute(DriverCommand.GET_TIMEOUTS);
        Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
        long timeout = ((Number) rawSize.get("script")).longValue();
        return Duration.ofMillis(timeout);
      }

      @Deprecated
      @Override
      public Timeouts pageLoadTimeout(long time, TimeUnit unit) {
        return pageLoadTimeout(Duration.ofMillis(unit.toMillis(time)));
      }

      @Override
      public Timeouts pageLoadTimeout(Duration duration) {
        execute(DriverCommand.SET_PAGE_LOAD_TIMEOUT(duration));
        return this;
      }

      @Override
      public Duration getPageLoadTimeout() {
        Response response = execute(DriverCommand.GET_TIMEOUTS);
        Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
        long timeout = ((Number) rawSize.get("pageLoad")).longValue();
        return Duration.ofMillis(timeout);
      }
    } // timeouts class.

    @Beta
    protected class RemoteWindow implements Window {

      @Override
      public void setSize(Dimension targetSize) {
        execute(DriverCommand.SET_CURRENT_WINDOW_SIZE(targetSize));
      }

      @Override
      public void setPosition(Point targetPosition) {
        execute(DriverCommand.SET_CURRENT_WINDOW_POSITION(targetPosition));
      }

      @Override
      @SuppressWarnings({"unchecked"})
      public Dimension getSize() {
        Response response = execute(DriverCommand.GET_CURRENT_WINDOW_SIZE);

        Map<String, Object> rawSize = (Map<String, Object>) response.getValue();

        int width = ((Number) rawSize.get("width")).intValue();
        int height = ((Number) rawSize.get("height")).intValue();

        return new Dimension(width, height);
      }

      Map<String, Object> rawPoint;
      @Override
      @SuppressWarnings("unchecked")
      public Point getPosition() {
        Response response = execute(DriverCommand.GET_CURRENT_WINDOW_POSITION());
        rawPoint = (Map<String, Object>) response.getValue();

        int x = ((Number) rawPoint.get("x")).intValue();
        int y = ((Number) rawPoint.get("y")).intValue();

        return new Point(x, y);
      }

      @Override
      public void maximize() {
        execute(DriverCommand.MAXIMIZE_CURRENT_WINDOW);
      }

      @Override
      public void minimize() {
        execute(DriverCommand.MINIMIZE_CURRENT_WINDOW);
      }

      @Override
      public void fullscreen() {
        execute(DriverCommand.FULLSCREEN_CURRENT_WINDOW);
      }
    }
  }

  private class RemoteNavigation implements Navigation {

    @Override
    public void back() {
      execute(DriverCommand.GO_BACK);
    }

    @Override
    public void forward() {
      execute(DriverCommand.GO_FORWARD);
    }

    @Override
    public void to(String url) {
      get(url);
    }

    @Override
    public void to(URL url) {
      get(String.valueOf(url));
    }

    @Override
    public void refresh() {
      execute(DriverCommand.REFRESH);
    }
  }

  protected class RemoteTargetLocator implements TargetLocator {

    @Override
    public WebDriver frame(int frameIndex) {
      execute(DriverCommand.SWITCH_TO_FRAME(frameIndex));
      return RemoteWebDriver.this;
    }

    @Override
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

    @Override
    public WebDriver frame(WebElement frameElement) {
      Object elementAsJson = new WebElementToJsonConverter().apply(frameElement);
      execute(DriverCommand.SWITCH_TO_FRAME(elementAsJson));
      return RemoteWebDriver.this;
    }

    @Override
    public WebDriver parentFrame() {
      execute(DriverCommand.SWITCH_TO_PARENT_FRAME);
      return RemoteWebDriver.this;
    }

    @Override
    public WebDriver window(String windowHandleOrName) {
      try {
        execute(DriverCommand.SWITCH_TO_WINDOW(windowHandleOrName));
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

    @Override
    public WebDriver newWindow(WindowType typeHint) {
      String original = getWindowHandle();
      try {
        Response response = execute(DriverCommand.SWITCH_TO_NEW_WINDOW(typeHint));
        String newWindowHandle = ((Map<String, Object>) response.getValue()).get("handle").toString();
        switchTo().window(newWindowHandle);
        return RemoteWebDriver.this;
      } catch (WebDriverException ex) {
        switchTo().window(original);
        throw ex;
      }
    }

    @Override
    public WebDriver defaultContent() {
      execute(DriverCommand.SWITCH_TO_FRAME(null));
      return RemoteWebDriver.this;
    }

    @Override
    public WebElement activeElement() {
      Response response = execute(DriverCommand.GET_ACTIVE_ELEMENT);
      return (WebElement) response.getValue();
    }

    @Override
    public Alert alert() {
      execute(DriverCommand.GET_ALERT_TEXT);
      return new RemoteAlert();
    }
  }

  private class RemoteAlert implements Alert {

    public RemoteAlert() {
    }

    @Override
    public void dismiss() {
      execute(DriverCommand.DISMISS_ALERT);
    }

    @Override
    public void accept() {
      execute(DriverCommand.ACCEPT_ALERT);
    }

    @Override
    public String getText() {
      return (String) execute(DriverCommand.GET_ALERT_TEXT).getValue();
    }

    /**
     * @param keysToSend character sequence to send to the alert
     *
     * @throws IllegalArgumentException if keysToSend is null
     */
    @Override
    public void sendKeys(String keysToSend) {
      if(keysToSend==null) {
        throw new IllegalArgumentException("Keys to send should be a not null CharSequence");
      }
      execute(DriverCommand.SET_ALERT_VALUE(keysToSend));
    }
  }

  private class RemoteVirtualAuthenticator implements VirtualAuthenticator {
    private final String id;

    public RemoteVirtualAuthenticator(final String id) {
      this.id = Require.nonNull("Id", id);
    }

    @Override
    public String getId() {
      return id;
    }

    @Override
    public void addCredential(Credential credential) {
      execute(DriverCommand.ADD_CREDENTIAL,
          new ImmutableMap.Builder<String, Object>()
            .putAll(credential.toMap())
            .put("authenticatorId", id)
            .build());
    }

    @Override
    public List<Credential> getCredentials() {
      List<Map<String, Object>> response = (List<Map<String, Object>>)
        execute(DriverCommand.GET_CREDENTIALS, ImmutableMap.of("authenticatorId", id)).getValue();
      return response.stream().map(Credential::fromMap).collect(Collectors.toList());
    }

    @Override
    public void removeCredential(byte[] credentialId) {
      removeCredential(Base64.getUrlEncoder().encodeToString(credentialId));
    }

    @Override
    public void removeCredential(String credentialId) {
      execute(DriverCommand.REMOVE_CREDENTIAL,
          ImmutableMap.of("authenticatorId", id, "credentialId", credentialId));
    }

    @Override
    public void removeAllCredentials() {
      execute(DriverCommand.REMOVE_ALL_CREDENTIALS, ImmutableMap.of("authenticatorId", id));
    }

    @Override
    public void setUserVerified(boolean verified) {
      execute(DriverCommand.SET_USER_VERIFIED,
          ImmutableMap.of("authenticatorId", id, "isUserVerified", verified));
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

    // w3c name first
    Object platform = caps.getCapability(PLATFORM_NAME);
    if (!(platform instanceof String)) {
      platform = caps.getCapability(PLATFORM);
    }
    if (platform == null) {
      platform = "unknown";
    }

    return String.format(
        "%s: %s on %s (%s)",
        getClass().getSimpleName(),
        caps.getBrowserName(),
        platform,
        getSessionId());
  }
}
