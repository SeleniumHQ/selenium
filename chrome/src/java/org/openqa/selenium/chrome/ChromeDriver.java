package org.openqa.selenium.chrome;

import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.Speed;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Context;
import org.openqa.selenium.remote.DriverCommand;
import static org.openqa.selenium.remote.DriverCommand.*;
import org.openqa.selenium.remote.SessionId;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ChromeDriver implements WebDriver, SearchContext, JavascriptExecutor, TakesScreenshot,
  FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByTagName, FindsByXPath, FindsByCssSelector {

  private final static int MAX_START_RETRIES = 5;
  private final ChromeCommandExecutor executor;
  private final ChromeBinary chromeBinary;

  /**
   * Starts up a new instance of Chrome using the specified profile and
   * extension.
   *
   * @param profile The profile to use.
   * @param extension The extension to use.
   */
  public ChromeDriver(ChromeProfile profile, ChromeExtension extension) {
    chromeBinary = new ChromeBinary(profile, extension);
    executor = new ChromeCommandExecutor();
    startClient();
  }

  /**
   * Starts up a new instance of Chrome, with the required extension loaded,
   * and has it connect to a new ChromeCommandExecutor on its port
   *
   * @see ChromeDriver(ChromeProfile, ChromeExtension)
   */
  public ChromeDriver() {
    this(new ChromeProfile(), new ChromeExtension());
  }
  
  /**
   * By default will try to load Chrome from system property
   * webdriver.chrome.bin and the extension from
   * webdriver.chrome.extensiondir.  If the former fails, will try to guess the
   * path to Chrome.  If the latter fails, will try to unzip from the JAR we 
   * hope we're in.  If these fail, throws exceptions.
   */
  protected void startClient() {
    for (int retries = MAX_START_RETRIES; !executor.hasClient() && retries > 0; retries--) {
      stopClient();
      try {
        executor.startListening();
        chromeBinary.start(getServerUrl());
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
      //In case this attempt fails, we increment how long we wait before sending a command
      chromeBinary.incrementBackoffBy(1);
    }
    //The last one attempt succeeded, so we reduce back to that time
    chromeBinary.incrementBackoffBy(-1);

    if (!executor.hasClient()) {
      stopClient();
      throw new FatalChromeException("Cannot create chrome driver");
    }
  }
  
  /**
   * Kills the started Chrome process and ChromeCommandExecutor if they exist
   */
  protected void stopClient() {
    chromeBinary.kill();
    executor.stopListening();
  }
  
  /**
   * Executes a passed command using the current ChromeCommandExecutor
   * @param driverCommand command to execute
   * @param parameters parameters of command being executed
   * @return response to the command (a Response wrapping a null value if none) 
   */
  ChromeResponse execute(DriverCommand driverCommand, Object... parameters) {
    Command command = new Command(new SessionId("[No sessionId]"),
                                  new Context("[No context]"),
                                  driverCommand,
                                  parameters);
    try {
      return executor.execute(command);
    } catch (Exception e) {
      if (e instanceof IllegalArgumentException ||
          e instanceof FatalChromeException) {
        //These exceptions may leave the extension hung, or in an
        //inconsistent state, so we restart Chrome
        stopClient();
        startClient();
      }
      if (e instanceof RuntimeException) {
        throw (RuntimeException)e;
      } else {
        throw new WebDriverException(e);
      }
    }
  }
  
  protected String getServerUrl() {
    return "http://localhost:" + executor.getPort() + "/chromeCommandExecutor";
  }

  public void close() {
    execute(CLOSE);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public void get(String url) {
    execute(GET, url);
  }

  public String getCurrentUrl() {
    return execute(GET_CURRENT_URL).getValue().toString();
  }

  public String getPageSource() {
    return execute(GET_PAGE_SOURCE).getValue().toString();
  }

  public String getTitle() {
    return execute(GET_TITLE).getValue().toString();
  }

  public String getWindowHandle() {
    return execute(GET_CURRENT_WINDOW_HANDLE).getValue().toString();
  }

  public Set<String> getWindowHandles() {
    List<?> windowHandles = (List<?>)execute(GET_WINDOW_HANDLES).getValue();
    Set<String> setOfHandles = new HashSet<String>();
    for (Object windowHandle : windowHandles) {
      setOfHandles.add((String)windowHandle);
    }
    return setOfHandles;
  }

  public Options manage() {
    return new ChromeOptions();
  }

  public Navigation navigate() {
    return new ChromeNavigation();
  }

  public void quit() {
    try {
      execute(QUIT);
    } finally {
      stopClient();
    }
  }

  public TargetLocator switchTo() {
    return new ChromeTargetLocator();
  }

  public Object executeScript(String script, Object... args) {
    ChromeResponse response;
    response = execute(EXECUTE_SCRIPT, script, args);
    if (response.getStatusCode() == -1) {
      return new ChromeWebElement(this, response.getValue().toString());
    } else {
      return response.getValue();
    }
  }

  public boolean isJavascriptEnabled() {
    return true;
  }

  public WebElement findElementById(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "id", using));
  }

  public List<WebElement> findElementsById(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "id", using));
  }

  public WebElement findElementByClassName(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "class name", using));
  }

  public List<WebElement> findElementsByClassName(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "class name", using));
  }

  public WebElement findElementByLinkText(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "link text", using));
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "link text", using));
  }

  public WebElement findElementByName(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "name", using));
  }

  public List<WebElement> findElementsByName(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "name", using));
  }

  public WebElement findElementByTagName(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "tag name", using));
  }

  public List<WebElement> findElementsByTagName(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "tag name", using));
  }

  public WebElement findElementByXPath(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "xpath", using));
  }

  public List<WebElement> findElementsByXPath(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "xpath", using));
  }

  public WebElement findElementByPartialLinkText(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "partial link text", using));
  }
  
  public List<WebElement> findElementsByPartialLinkText(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "partial link text", using));
  }
  
  public WebElement findElementByCssSelector(String using) {
    return getElementFrom(execute(FIND_ELEMENT, "css", using));
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    return getElementsFrom(execute(FIND_ELEMENTS, "css", using));
  }
  
  WebElement getElementFrom(ChromeResponse response) {
    Object result = response.getValue();
    List<?> elements = (List<?>)result;
    return new ChromeWebElement(this, (String)elements.get(0));
  }

  List<WebElement> getElementsFrom(ChromeResponse response) {
    Object result = response.getValue();
    List<WebElement> elements = new ArrayList<WebElement>();
    for (Object element : (List<?>)result) {
      elements.add(new ChromeWebElement(this, (String)element));
    }
    return elements;
  }
  
  List<WebElement> findChildElements(ChromeWebElement parent, String by, String using) {
    return getElementsFrom(execute(FIND_CHILD_ELEMENTS, parent, by, using));
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    return target.convertFromBase64Png(execute(SCREENSHOT).getValue().toString());
  }
  
  private class ChromeOptions implements Options {

    public void addCookie(Cookie cookie) {
      execute(ADD_COOKIE, cookie);
    }

    public void deleteAllCookies() {
      execute(DELETE_ALL_COOKIES);
    }

    public void deleteCookie(Cookie cookie) {
      execute(DELETE_COOKIE, cookie.getName());
    }

    public void deleteCookieNamed(String name) {
      execute(DELETE_COOKIE, name);
    }

    public Set<Cookie> getCookies() {
      List<?> result = (List<?>)execute(GET_ALL_COOKIES).getValue();
      Set<Cookie> cookies = new HashSet<Cookie>();
      for (Object cookie : result) {
        cookies.add((Cookie)cookie);
      }
      return cookies;
    }

    public Cookie getCookieNamed(String name) {
      return (Cookie)execute(GET_COOKIE, name).getValue();
    }
    
    public Speed getSpeed() {
      throw new UnsupportedOperationException("Not yet supported in Chrome");
    }

    public void setSpeed(Speed speed) {
      throw new UnsupportedOperationException("Not yet supported in Chrome");
    }
  }
  
  private class ChromeNavigation implements Navigation {
    public void back() {
      execute(GO_BACK);
    }

    public void forward() {
      execute(GO_FORWARD);
    }

    public void to(String url) {
      get(url);
    }

    public void to(URL url) {
      get(String.valueOf(url));
    }

    public void refresh() {
      execute(REFRESH);
    }
  }
  
  private class ChromeTargetLocator implements TargetLocator {
    public WebElement activeElement() {
      return getElementFrom(execute(GET_ACTIVE_ELEMENT));
    }

    public WebDriver defaultContent() {
      execute(SWITCH_TO_DEFAULT_CONTENT);
      return ChromeDriver.this;
    }

    public WebDriver frame(int frameIndex) {
      execute(SWITCH_TO_FRAME_BY_INDEX, frameIndex);
      return ChromeDriver.this;
    }

    public WebDriver frame(String frameName) {
      execute(SWITCH_TO_FRAME_BY_NAME, frameName);
      return ChromeDriver.this;
    }

    public WebDriver window(String windowName) {
      execute(SWITCH_TO_WINDOW, windowName);
      return ChromeDriver.this;
    }
    
  }
}
