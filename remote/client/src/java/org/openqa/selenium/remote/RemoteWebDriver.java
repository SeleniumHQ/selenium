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

import org.openqa.selenium.By;
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
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.ReturnedCookie;
import org.openqa.selenium.internal.FindsByTagName;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

import java.lang.reflect.Constructor;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class RemoteWebDriver implements WebDriver, JavascriptExecutor,
    FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByTagName, FindsByXPath {

  private CommandExecutor executor;
  private Capabilities capabilities;
  private SessionId sessionId;
  
  protected Process clientProcess;

  public RemoteWebDriver(CommandExecutor executor, Capabilities desiredCapabilities) {
    this.executor = executor;
    startClient();
    startSession(desiredCapabilities);
  }

  public RemoteWebDriver(Capabilities desiredCapabilities) throws Exception {
    this((URL) null, desiredCapabilities);
  }

  public RemoteWebDriver(URL remoteAddress, Capabilities desiredCapabilities) throws Exception {
    this(new HttpCommandExecutor(remoteAddress), desiredCapabilities);
  }

  @SuppressWarnings({"unchecked"})
  protected void startSession(Capabilities desiredCapabilities) {
    Response response = execute(DriverCommand.NEW_SESSION, desiredCapabilities);

    Map<String, Object> rawCapabilities = (Map<String, Object>) response.getValue();
    String browser = (String) rawCapabilities.get("browserName");
    String version = (String) rawCapabilities.get("version");
    Platform platform;
    if (rawCapabilities.containsKey("operatingSystem")) {
      platform = Platform.valueOf((String) rawCapabilities.get("operatingSystem"));
    } else {
      platform = Platform.valueOf((String) rawCapabilities.get("platform"));
    }


    DesiredCapabilities returnedCapabilities = new DesiredCapabilities(browser, version, platform);
    returnedCapabilities.setJavascriptEnabled((Boolean) rawCapabilities.get("javascriptEnabled"));
    capabilities = returnedCapabilities;
    sessionId = new SessionId(response.getSessionId());
  }

  protected void startClient() {
    
  }
  
  protected void stopClient() {

  }
  
  public Capabilities getCapabilities() {
    return capabilities;
  }

  public void get(String url) {
    execute(DriverCommand.GET, url);
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


  public WebElement findElementById(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "id", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsById(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "id", using);
    return getElementsFrom(response);
  }


  public WebElement findElementByLinkText(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "link text", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "link text", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByPartialLinkText(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "partial link text", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "partial link text", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByTagName(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "tag name", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByTagName(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "tag name", using);
    return getElementsFrom(response);

  }

  public WebElement findElementByName(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "name", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByName(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "name", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByClassName(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "class name", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByClassName(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "class name", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByXPath(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENT, "xpath", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByXPath(String using) {
    Response response = execute(DriverCommand.FIND_ELEMENTS, "xpath", using);
    return getElementsFrom(response);
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
    return (String) execute(DriverCommand.GET_CURRENT_WINDOW_HANDLE).getValue();
  }

  public Object executeScript(String script, Object... args) {
    if (!capabilities.isJavascriptEnabled()) {
      throw new UnsupportedOperationException("You must be using an underlying instance of WebDriver that supports executing javascript");
    }

    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    Object[] convertedArgs = convertToJsObjects(args);

    Command command;
    if (convertedArgs != null && convertedArgs.length > 0)
      command = new Command(
          sessionId, new Context("foo"), DriverCommand.EXECUTE_SCRIPT, script, convertedArgs);
    else
      command = new Command(sessionId, new Context("foo"), DriverCommand.EXECUTE_SCRIPT, script);
    Response response;
    try {
      response = executor.execute(command);
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
    if (response.isError())
      throwIfResponseFailed(response);

    Map<String, Object> result = (Map<String, Object>) response.getValue();

    String type = (String) result.get("type");
    if ("NULL".equals(type))
      return null;

    if ("ELEMENT".equals(type)) {
      String[] parts = ((String) result.get("value")).split("/");
      RemoteWebElement element = newRemoteWebElement();
      element.setId(parts[parts.length - 1]);
      return element;
    } else if (result.get("value") instanceof Number) {
      if (result.get("value") instanceof Float || result.get("value") instanceof Double) {
        return ((Number) result.get("value")).doubleValue();
      }
      return ((Number) result.get("value")).longValue();
    }

    return result.get("value");
  }

  public boolean isJavascriptEnabled() {
    return capabilities.isJavascriptEnabled();
  }

  private Object[] convertToJsObjects(Object[] args) {
    if (args.length == 0)
      return null;

    Object[] converted = new Object[args.length];
    for (int i = 0; i < args.length; i++) {
      converted[i] = convertToJsObject(args[i]);
    }

    return converted;
  }

  private Object convertToJsObject(Object arg) {
    Map<String, Object> converted = new HashMap<String, Object>();

    if (arg instanceof String) {
      converted.put("type", "STRING");
      converted.put("value", arg);
    } else if (arg instanceof Number) {
      converted.put("type", "NUMBER");
      if (arg instanceof Float || arg instanceof Double) {
        converted.put("value", ((Number) arg).doubleValue());
      } else {
        converted.put("value", ((Number) arg).longValue());
      }
    } else if (arg instanceof Boolean) {
      converted.put("type", "BOOLEAN");
      converted.put("value", ((Boolean) arg).booleanValue());
    } else if (arg.getClass() == boolean.class) {
      converted.put("type", "BOOLEAN");
      converted.put("value", arg);
    } else if (arg instanceof RemoteWebElement) {
      converted.put("type", "ELEMENT");
      converted.put("value", ((RemoteWebElement) arg).getId());
    } else if (arg instanceof Collection<?>) {
      Collection<?> args = ((Collection<?>)arg);
      Object[] list = new Object[args.size()];
      int i = 0;
      for (Object o : args) {
        list[i] = convertToJsObject(o);
        i++;
      }
      return list;
    } else {
      throw new IllegalArgumentException("Argument is of an illegal type: " + arg);
    }

    return converted;
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

  protected WebElement getElementFrom(Response response) {
    List<WebElement> elements = getElementsFrom(response);
    return elements.get(0);
  }

  private RemoteWebElement newRemoteWebElement() {
    RemoteWebElement toReturn;
    if (capabilities.isJavascriptEnabled()) {
      toReturn = new RenderedRemoteWebElement();
    } else {
      toReturn = new RemoteWebElement();
    }
    toReturn.setParent(this);
    return toReturn;
  }

  @SuppressWarnings({"unchecked"})
  protected List<WebElement> getElementsFrom(Response response) {
    List<WebElement> toReturn = new ArrayList<WebElement>();
    List<String> urls = (List<String>) response.getValue();
    for (String url : urls) {
      // We cheat here, because we know that the URL for an element ends with its ID.
      // This is lazy and bad. We should, instead, go to each of the URLs in turn.
      String[] parts = url.split("/");
      RemoteWebElement element = newRemoteWebElement();
      element.setId(parts[parts.length - 1]);
      toReturn.add(element);
    }

    return toReturn;
  }

  @SuppressWarnings({"unchecked"})
  protected Response execute(DriverCommand driverCommand, Object... parameters) {
    Command command = new Command(sessionId, new Context("foo"), driverCommand, parameters);

    Response response = new Response();

    try {
      response = executor.execute(command);
      amendElementValueIfNecessary(response);
    } catch (Exception e) {
      response.setError(true);
      response.setValue(e.getStackTrace());
    }

    if (response.isError()) {
      return throwIfResponseFailed(response);
    }

    return response;
  }

  private void amendElementValueIfNecessary(Response response) {
    if (!(response.getValue() instanceof RemoteWebElement))
      return;

    // Ensure that the parent is set properly
    RemoteWebElement existingElement = (RemoteWebElement) response.getValue();
    existingElement.setParent(this);

    if (!getCapabilities().isJavascriptEnabled())
      return;

    if (response.getValue() instanceof RenderedRemoteWebElement)
      return;  // Good, nothing to do

    RenderedRemoteWebElement replacement = new RenderedRemoteWebElement();
    replacement.setId(existingElement.getId());
    replacement.setParent(this);

    response.setValue(replacement);
  }

  private Response throwIfResponseFailed(Response response) {
    if (response.getValue() instanceof StackTraceElement[]) {
      WebDriverException runtimeException = new WebDriverException();
      runtimeException.setStackTrace((StackTraceElement[]) response.getValue());
      throw runtimeException;
    }

    Map rawException;
    try {
      rawException = (Map) response.getValue();
    } catch (ClassCastException e) {
      throw new RuntimeException(String.valueOf(response.getValue()));
    }

    RuntimeException toThrow = null;
    try {
      String screenGrab = (String) rawException.get("screen");
      String message = (String) rawException.get("message");
      String className = (String) rawException.get("class");

      Class<?> aClass;
      try {
        aClass = Class.forName(className);
        if (!RuntimeException.class.isAssignableFrom(aClass)) {
          aClass = WebDriverException.class;
        }
      } catch (ClassNotFoundException e) {
        aClass = WebDriverException.class;
      }

      if (screenGrab != null) {
        try {
          Constructor<? extends RuntimeException> constructor =
              (Constructor<? extends RuntimeException>) aClass
                  .getConstructor(String.class, Throwable.class);
          toThrow = constructor.newInstance(message, new ScreenshotException(screenGrab));
        } catch (NoSuchMethodException e) {
          // Fine. Fall through
        } catch (OutOfMemoryError e) {
          // It can happens sometimes. Fall through
        }
      }

      if (toThrow == null) {
      try {
        Constructor<? extends RuntimeException> constructor =
            (Constructor<? extends RuntimeException>) aClass.getConstructor(String.class);
        toThrow = constructor.newInstance(message);
      } catch (NoSuchMethodException e) {
        toThrow = (WebDriverException) aClass.newInstance();
      }
      }

      List<Map> elements = (List<Map>) rawException.get("stackTrace");
      if (elements != null) {
        StackTraceElement[] trace = new StackTraceElement[elements.size()];
  
        int lastInsert = 0;
        for (Map values : elements) {
          // I'm so sorry.
          Long lineNumber = (Long) values.get("lineNumber");
          if (lineNumber == null) {
            continue;
          }
  
          trace[lastInsert++] = new StackTraceElement((String) values.get("className"),
                  (String) values.get("methodName"),
                  (String) values.get("fileName"),
                  lineNumber.intValue());
          }
  
          if (lastInsert == elements.size()) {
          toThrow.setStackTrace(trace);
        }
      }
    } catch (Exception e) {
      toThrow = new WebDriverException(e);
    }

    throw toThrow;
  }

  private class RemoteWebDriverOptions implements Options {

    public void addCookie(Cookie cookie) {
      execute(DriverCommand.ADD_COOKIE, cookie);
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
          toReturn.add(new ReturnedCookie(name, value, domain, path, null, secure));
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
      execute(DriverCommand.SET_SPEED, speed);
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

  private class RemoteTargetLocator implements TargetLocator {

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
      return getElementFrom(response);
    }
  }
}
