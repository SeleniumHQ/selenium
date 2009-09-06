package org.openqa.selenium.chrome;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Vector;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.Speed;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Context;
import org.openqa.selenium.remote.SessionId;

public class ChromeDriver implements WebDriver, SearchContext, JavascriptExecutor,
FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByTagName, FindsByXPath {

  private ChromeCommandExecutor executor;
  private ChromeBinary chromeBinary = new ChromeBinary();
  
  /**
   * Starts up a new instance of Chrome, with the required extension loaded,
   * and has it connect to a new ChromeCommandExecutor on port 9700
   */
  public ChromeDriver() {
    init();
  }
  
  private void init() {
    while (executor == null || !executor.hasClient()) {
      stopClient();
      //TODO(danielwh): Remove explicit port (blocked on crbug.com 11547)
      this.executor = new ChromeCommandExecutor(9700);
      startClient();
    }
  }
  
  /**
   * By default will try to load Chrome from system property
   * webdriver.chrome.bin and the extension from
   * webdriver.chrome.extensiondir.  If the former fails, will try to guess the
   * path to Chrome.  If the latter fails, will try to unzip from the JAR we 
   * hope we're in.  If these fail, throws exceptions.
   */
  protected void startClient() {
    try {
      File extensionDir = getExtensionDir();
      if (!extensionDir.isDirectory()) {
        throw new FileNotFoundException("Could not find extension directory" +
            "(" + extensionDir + ").  Try setting webdriver.chrome.extensiondir."); 
      }
      
      //Copy over the correct manifest file
      if (Platform.getCurrent().is(Platform.WINDOWS)) {
        FileHandler.copy(new File(extensionDir, "manifest-win.json"),
                         new File(extensionDir, "manifest.json"));
      } else {
        FileHandler.copy(new File(extensionDir, "manifest-nonwin.json"),
                         new File(extensionDir, "manifest.json"));
      }
      
      File profileDir = TemporaryFilesystem.createTempDir("profile", "");
      File firstRunFile = new File(profileDir, "First Run Dev");
      firstRunFile.createNewFile();
      //TODO(danielwh): Maybe add Local State file with window_placement
      
      System.setProperty("webdriver.reap_profile", "false");

      String[] flags = new String[2];
      flags[0] = "--user-data-dir=" + wrapInQuotesIfWindows(profileDir.getCanonicalPath());
      flags[1] = "--load-extension=" + wrapInQuotesIfWindows(extensionDir.getCanonicalPath());
      chromeBinary.start(flags);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }
  
  /**
   * Kills the started Chrome process and ChromeCommandExecutor if they exist
   */
  protected void stopClient() {
    chromeBinary.kill();
    if (executor != null) {
      executor.stopListening();
      executor = null;
    }
  }
  
  /**
   * Executes a passed command using the current ChromeCommandExecutor
   * @param commandName command to execute
   * @param parameters parameters of command being executed
   * @return response to the command (a Response wrapping a null value if none) 
   */
  ChromeResponse execute(String commandName, Object... parameters) {
    Command command = new Command(new SessionId("[No sessionId]"),
                                  new Context("[No context]"),
                                  commandName,
                                  parameters);
    try {
      return executor.execute(command);
    } catch (Exception e) {
      if (e instanceof IllegalArgumentException ||
          e instanceof FatalChromeException) {
        //These exceptions may leave the extension hung, or in an
        //inconsistent state, so we restart Chrome
        /*if (e instanceof FatalChromeException) {
          try { Thread.sleep(100000000); } catch (InterruptedException e2) {}
        }*/
        stopClient();
        init();
      }
      if (e instanceof RuntimeException) {
        throw (RuntimeException)e;
      } else {
        throw new WebDriverException(e);
      }
    }
  }
  
  /**
   * Locates the directory containing the extension to load Chrome with,
   * trying to unzip the zipped extension if no explicit extension is set using
   * the system property webdriver.chrome.extensiondir.
   * @return the extension directory
   * @throws IOException if tried to unzip extension but couldn't
   */
  protected File getExtensionDir() throws IOException {
    File extensionDir = null;
    String extensionDirSystemProperty = System.getProperty(
        "webdriver.chrome.extensiondir");
    if (extensionDirSystemProperty != null &&
        extensionDirSystemProperty != "") {
      //Default to reading from the property
      extensionDir = new File(extensionDirSystemProperty);
    } else {
      //If property not set, try to unpack the zip from the jar
      extensionDir = FileHandler.unzip(this.getClass().getResourceAsStream(
          "/chrome-extension.zip"));
    }
    return extensionDir;
  }

  /**
   * Wraps the passed argument in "s if the platform is Windows
   * @param arg string to wrap
   * @return "arg"
   */
  private String wrapInQuotesIfWindows(String arg) {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      return "\"" + arg + "\"";
    } else {
      return arg;
    }
  }

  public void close() {
    execute("close");
  }

  public WebElement findElement(By by) {
    return by.findElement((SearchContext)this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements((SearchContext)this);
  }

  public void get(String url) {
    execute("get", url);
  }

  public String getCurrentUrl() {
    return execute("getCurrentUrl").getValue().toString();
  }

  public String getPageSource() {
    return execute("getPageSource").getValue().toString();
  }

  public String getTitle() {
    return execute("getTitle").getValue().toString();
  }

  public String getWindowHandle() {
    return execute("getWindowHandle").getValue().toString();
  }

  public Set<String> getWindowHandles() {
    Vector<?> windowHandles = (Vector<?>)execute("getWindowHandles").getValue();
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
      execute("quit");
    } finally {
      stopClient();
    }
  }

  public TargetLocator switchTo() {
    return new ChromeTargetLocator();
  }

  public Object executeScript(String script, Object... args) {
    ChromeResponse response;
    response = execute("execute", script, args);
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
    return getElementFrom(execute("findElement", "id", using));
  }

  public List<WebElement> findElementsById(String using) {
    return getElementsFrom(execute("findElements", "id", using));
  }

  public WebElement findElementByClassName(String using) {
    return getElementFrom(execute("findElement", "class name", using));
  }

  public List<WebElement> findElementsByClassName(String using) {
    return getElementsFrom(execute("findElements", "class name", using));
  }

  public WebElement findElementByLinkText(String using) {
    return getElementFrom(execute("findElement", "link text", using));
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return getElementsFrom(execute("findElements", "link text", using));
  }

  public WebElement findElementByName(String using) {
    return getElementFrom(execute("findElement", "name", using));
  }

  public List<WebElement> findElementsByName(String using) {
    return getElementsFrom(execute("findElements", "name", using));
  }

  public WebElement findElementByTagName(String using) {
    return getElementFrom(execute("findElement", "tag name", using));
  }

  public List<WebElement> findElementsByTagName(String using) {
    return getElementsFrom(execute("findElements", "tag name", using));
  }

  public WebElement findElementByXPath(String using) {
    return getElementFrom(execute("findElement", "xpath", using));
  }

  public List<WebElement> findElementsByXPath(String using) {
    return getElementsFrom(execute("findElements", "xpath", using));
  }

  public WebElement findElementByPartialLinkText(String using) {
    return getElementFrom(execute("findElement", "partial link text", using));
  }
  
  public List<WebElement> findElementsByPartialLinkText(String using) {
    return getElementsFrom(execute("findElements", "partial link text", using));
  }
  
  WebElement getElementFrom(ChromeResponse response) {
    Object result = response.getValue();
    List<?> elements = (List<?>)result;
    return new ChromeWebElement(this, (String)elements.get(0));
  }

  List<WebElement> getElementsFrom(ChromeResponse response) {
    Object result = response.getValue();
    List<WebElement> elements = new Vector<WebElement>();
    for (Object element : (List<?>)result) {
      elements.add(new ChromeWebElement(this, (String)element));
    }
    return elements;
  }
  
  List<WebElement> findChildElements(ChromeWebElement parent, String by, String using) {
    return getElementsFrom(execute("findChildElements", parent, by, using));
  }
  
  private class ChromeOptions implements Options {

    public void addCookie(Cookie cookie) {
      execute("addCookie", cookie);
    }

    public void deleteAllCookies() {
      execute("deleteAllCookies");
    }

    public void deleteCookie(Cookie cookie) {
      if (!Platform.getCurrent().is(Platform.WINDOWS)) {
        //See crbug.com issue 14734
        throw new UnsupportedOperationException(
            "Deleting cookies currently doesn't work in Chrome");
      }
      execute("deleteCookie", cookie.getName());
    }

    public void deleteCookieNamed(String name) {
      execute("deleteCookie", name);
    }

    public Set<Cookie> getCookies() {
      Vector<?> result = (Vector<?>)execute("getCookies").getValue();
      Set<Cookie> cookies = new HashSet<Cookie>();
      for (Object cookie : result) {
        cookies.add((Cookie)cookie);
      }
      return cookies;
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
      execute("goBack");
    }

    public void forward() {
      execute("goForward");
    }

    public void to(String url) {
      get(url);
    }

    public void to(URL url) {
      get(String.valueOf(url));
    }

    public void refresh() {
      execute("refresh");
    }
  }
  
  private class ChromeTargetLocator implements TargetLocator {
    public WebElement activeElement() {
      throw new UnsupportedOperationException("Chrome does not support active element switching yet");
    }

    public WebDriver defaultContent() {
      execute("switchToDefaultContent");
      return ChromeDriver.this;
    }

    public WebDriver frame(int frameIndex) {
      execute("switchToFrameByIndex", frameIndex);
      return ChromeDriver.this;
    }

    public WebDriver frame(String frameName) {
      execute("switchToFrameByName", frameName);
      return ChromeDriver.this;
    }

    public WebDriver window(String windowName) {
      execute("switchToWindow", windowName);
      return ChromeDriver.this;
    }
    
  }
}
