package org.openqa.selenium.remote;

import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Speed;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.OperatingSystem;
import org.openqa.selenium.internal.ReturnedCookie;
import org.openqa.selenium.internal.FindsByClassName;
import static org.openqa.selenium.remote.MapMaker.map;

import java.lang.reflect.Constructor;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Arrays;

public class RemoteWebDriver implements WebDriver, SearchContext,
    FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByXPath {

  private CommandExecutor executor;
  private Capabilities capabilities;
  private SessionId sessionId;

  @SuppressWarnings({"unchecked"})
  public RemoteWebDriver(URL remoteAddress, Capabilities desiredCapabilities) throws Exception {
    URL toUse = remoteAddress;
    if (remoteAddress == null) {
      String remoteServer = System.getProperty("webdriver.remote.server");
      toUse = remoteServer == null ? null : new URL(remoteServer);
    }

    executor = new HttpCommandExecutor(toUse);

    Response response = execute("newSession", desiredCapabilities);

    Map<String, Object> rawCapabilities = (Map<String, Object>) response.getValue();
    String browser = (String) rawCapabilities.get("browserName");
    String version = (String) rawCapabilities.get("version");
    OperatingSystem os = OperatingSystem.valueOf((String) rawCapabilities.get("operatingSystem"));

    DesiredCapabilities returnedCapabilities = new DesiredCapabilities(browser, version, os);
    returnedCapabilities.setJavascriptEnabled((Boolean) rawCapabilities.get("javascriptEnabled"));
    capabilities = returnedCapabilities;
    sessionId = new SessionId(response.getSessionId());
  }

  public RemoteWebDriver(Capabilities desiredCapabilities) throws Exception {
    this(null, desiredCapabilities);
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public void get(String url) {
    execute("get", url);
  }

  public String getTitle() {
    Response response = execute("getTitle");
    return response.getValue().toString();
  }

  public String getCurrentUrl() {
    return execute("currentUrl").getValue().toString();
  }


  public boolean getVisible() {
    Response response = execute("getVisible");
    return (Boolean) response.getValue();
  }

  public void setVisible(boolean visible) {
    execute("setVisible", visible);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements((SearchContext) this);
  }

  public WebElement findElement(By by) {
    return by.findElement((SearchContext) this);
  }


  public WebElement findElementById(String using) {
    Response response = execute("findElement", "id", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsById(String using) {
    Response response = execute("findElements", "id", using);
    return getElementsFrom(response);
  }


  public WebElement findElementByLinkText(String using) {
    Response response = execute("findElement", "link text", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    Response response = execute("findElements", "link text", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByName(String using) {
    Response response = execute("findElement", "name", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByName(String using) {
    Response response = execute("findElements", "name", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByClassName(String using) {
    Response response = execute("findElement", "class name", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByClassName(String using) {
    Response response = execute("findElements", "class name", using);
    return getElementsFrom(response);
  }

  public WebElement findElementByXPath(String using) {
    Response response = execute("findElement", "xpath", using);
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByXPath(String using) {
    Response response = execute("findElements", "xpath", using);
    return getElementsFrom(response);
  }

  // Misc

  public String getPageSource() {
    return (String) execute("pageSource").getValue();
  }

  public void close() {
    execute("close");
  }

  public void quit() {
    execute("quit");
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
  protected Response execute(String commandName, Object... parameters) {
    Command command = new Command(sessionId, new Context("foo"), commandName, parameters);

    Response response = new Response();

    try {
      response = executor.execute(command);
    } catch (Exception e) {
      response.setError(true);
      response.setValue(e.getStackTrace());
    }

    if (response.isError()) {
      if (response.getValue() instanceof StackTraceElement[]) {
        RuntimeException runtimeException = new RuntimeException();
        runtimeException.setStackTrace((StackTraceElement[]) response.getValue());
        throw runtimeException;
      }

      Map rawException = (Map) response.getValue();

      String message = (String) rawException.get("message");
      String className = (String) rawException.get("class");

      RuntimeException toThrow;
      try {
        Class<?> aClass;
        try {
          aClass = Class.forName(className);
          if (!RuntimeException.class.isAssignableFrom(aClass)) {
            aClass = RuntimeException.class;
          }
        } catch (ClassNotFoundException e) {
          aClass = RuntimeException.class;
        }

        try {
          Constructor<? extends RuntimeException> constructor =
              (Constructor<? extends RuntimeException>) aClass.getConstructor(String.class);
          toThrow = constructor.newInstance(message);
        } catch (NoSuchMethodException e) {
          toThrow = (RuntimeException) aClass.newInstance();
        }

        List<Map> elements = (List<Map>) rawException.get("stackTrace");
        StackTraceElement[] trace = new StackTraceElement[elements.size()];

        int lastInsert = 0;
        for (int i = 0; i < elements.size(); i++) {
          Map values = (Map) elements.get(i);

          // I'm so sorry.
          Long lineNumber = (Long) values.get("lineNumber");
          if (lineNumber == null) {
            continue;
          }

          trace[lastInsert++] = new StackTraceElement((String) values.get("className"),
                                                      (String) values.get("methodName"),
                                                      (String) values.get("fileName"),
                                                      (int) (long) lineNumber);
        }

        if (lastInsert == elements.size()) {
          toThrow.setStackTrace(trace);
        }
      } catch (Exception e) {
        toThrow = new RuntimeException(e);
      }
      throw toThrow;
    }

    return response;
  }

  private class RemoteWebDriverOptions implements Options {

    public void addCookie(Cookie cookie) {
      execute("addCookie", cookie);
    }

    public void deleteCookieNamed(String name) {
      execute("deleteCookie", map("name", name));
    }

    public void deleteCookie(Cookie cookie) {
      deleteCookieNamed(cookie.getName());
    }

    public void deleteAllCookies() {
      execute("deleteAllCookies");
    }

    public Set<Cookie> getCookies() {
      Object returned = execute("getAllCookies").getValue();

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
        throw new RuntimeException(e);
      }

    }

    public Speed getSpeed() {
      Response response = execute("getSpeed");

      return Speed.valueOf((String) response.getValue());
    }

    public void setSpeed(Speed speed) {
      execute("setSpeed", speed);
    }
  }

  private class RemoteNavigation implements Navigation {

    public void back() {
      execute("back");
    }

    public void forward() {
      execute("forward");
    }

    public void to(String url) {
      get(url);
    }
  }

  private class RemoteTargetLocator implements TargetLocator {

    public WebDriver frame(int frameIndex) {
      execute("switchToFrame", map("id", frameIndex));
      return RemoteWebDriver.this;
    }

    public WebDriver frame(String frameName) {
      execute("switchToFrame", map("id", frameName));
      return RemoteWebDriver.this;
    }

    public WebDriver window(String windowName) {
      execute("switchToWindow", map("name", windowName));
      return RemoteWebDriver.this;
    }

    public WebDriver defaultContent() {
      execute("switchToFrame", map("id", null));
      return RemoteWebDriver.this;
    }
  }
}
