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

  private Process clientProcess;
  private ChromeCommandExecutor executor;
  
  public ChromeDriver() throws Exception {
    init();
  }
  
  private void init() throws Exception {
    this.executor = new ChromeCommandExecutor(9700, 9701);
    try {
      startClient();
    } catch (Exception e) {
      executor.stopListening();
      stopClient();
      throw e;
    }
    //Ick, we sleep for a little bit in case the browser hasn't quite loaded
    Thread.sleep(2500);
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
      File chromeFile = getChromeFile();
      if (!chromeFile.isFile()) {
        throw new FileNotFoundException("Could not find chrome binary(" +
            chromeFile.getCanonicalPath() + ").  " +
            "Try setting webdriver.chrome.bin.");
      }
      
      File profileDir = TemporaryFilesystem.createTempDir("profile", "");
      
      String[] toExec = new String[3];
      toExec[0] = chromeFile.getCanonicalPath();
      toExec[1] = "--user-data-dir=" + wrapInQuotesIfWindows(profileDir.getCanonicalPath());
      toExec[2] = " --load-extension=" + wrapInQuotesIfWindows(extensionDir.getCanonicalPath()); 
      clientProcess = Runtime.getRuntime().exec(toExec);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
  
  protected void stopClient() {
    if (clientProcess != null) {
      System.out.println("Killing browser");
      clientProcess.destroy();
      clientProcess = null;
    }
    try {
      executor.stopListening();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
  
  Response execute(String commandName, Object... parameters) {
    Command command = new Command(new SessionId("[No sessionId]"),
                                  new Context("[No context]"),
                                  commandName,
                                  parameters);
    try {
      return executor.execute(command);
    } catch (Exception e) {
      if (e instanceof UnsupportedOperationException ||
          e instanceof IllegalArgumentException ||
          e instanceof FatalChromeException) {
        /*if (e instanceof ChromeDriverException) {
          try { Thread.sleep(100000); } catch (Exception e2) {}
        }*/
        //These exceptions may leave the extension hung, or in an
        //inconsistent state, so we restart Chrome
        stopClient();
        try {
          executor.stopListening();
          init();
        } catch (Exception e2) {
          throw new RuntimeException(e2);
        }
      }
      if (e instanceof RuntimeException) {
        throw (RuntimeException)e;
      } else {
        throw new RuntimeException(e);
      }
    }
  }
  
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
   * This is a fairly ugly way of getting the path
   * @return Absolute path to chrome executable
   * @throws IOException if file could not be found/accessed
   */
  protected File getChromeFile() throws IOException {
    File chromeFile = null;
    String chromeFileSystemProperty = System.getProperty(
        "webdriver.chrome.bin");
    if (chromeFileSystemProperty != null) {
      chromeFile = new File(chromeFileSystemProperty);
    } else {
      StringBuilder chromeFileString = new StringBuilder();
      if (System.getProperty("os.name").equals("Windows XP")) {
        chromeFileString.append(System.getProperty("user.home"))
                        .append("\\Local Settings\\Application Data\\")
                        .append("Google\\Chrome\\Application\\chrome.exe");
      } else if (System.getProperty("os.name").equals("Windows Vista")) {
        chromeFileString.append("C:\\Users\\")
                        .append(System.getProperty("user.name"))
                        .append("\\AppData\\Local\\")
                        .append("Google\\Chrome\\Application\\chrome.exe");
      } else if (System.getProperty("os.name").equals("Linux")) {
        chromeFileString.append("/usr/bin/google-chrome");
      } else if (System.getProperty("os.name").startsWith("Mac OS")) {
        File binary = new File("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
        if (binary.exists()) {
          chromeFileString.append(binary.getCanonicalFile());
        } else {
          binary = new File("/Users/" + System.getProperty("user.name") +
              binary.getCanonicalPath());
          if (binary.exists()) {
            chromeFileString.append(binary.getCanonicalFile());
          } else {
            throw new WebDriverException("Couldn't locate Chrome.  " +
                "Set webdriver.chrome.bin");
          }
        }
      } else {
        throw new WebDriverException("Unsupported operating system.  " +
            "Could not locate Chrome.  Set webdriver.chrome.bin");
      }
      chromeFile = new File(chromeFileString.toString());
    }
    return chromeFile;
  }
  
  private String wrapInQuotesIfWindows(String arg) {
    if (System.getProperty("os.name").startsWith("Windows")) {
      return "\"" + arg + "\"";
    } else {
      return arg;
    }
  }

  public void close() {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
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
    Object[] windowHandles = (Object[])execute("getWindowHandles").getValue();
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
    Response response;
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
  
  WebElement getElementFrom(Response response) {
    Object result = response.getValue();
    Object[] elements = (Object[])result;
    return new ChromeWebElement(this, (String)elements[0]);
  }

  List<WebElement> getElementsFrom(Response response) {
    Object result = response.getValue();
    List<WebElement> elements = new Vector<WebElement>();
    for (Object element : (Object[])result) {
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
      execute("deleteCookie", cookie.getName());
    }

    public void deleteCookieNamed(String name) {
      execute("deleteCookie", name);
    }

    public Set<Cookie> getCookies() {
      Object result = execute("getCookies").getValue();
      Set<Cookie> cookies = new HashSet<Cookie>();
      for (Object cookie : (Object[])result) {
        if (!(cookie instanceof JSONObject)) {
          //Ignore malformed cookie
          continue;
        }
        JSONObject jsonCookie = (JSONObject)cookie;
        if (!jsonCookie.has("name") || !jsonCookie.has("value")) {
          //Ignore malformed cookie
          continue;
        }
        try {
          cookies.add(new Cookie(jsonCookie.getString("name"), jsonCookie.getString("value")));
        } catch (JSONException e) {
          //Ignore malformed cookie
          continue;
        }
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
      throw new UnsupportedOperationException("Chrome does not support default content switching yet");
    }

    public WebDriver frame(int frameIndex) {
      throw new UnsupportedOperationException("Chrome does not support frame switching yet");
    }

    public WebDriver frame(String frameName) {
      throw new UnsupportedOperationException("Chrome does not support frame switching yet");
    }

    public WebDriver window(String windowName) {
      execute("switchToWindow", windowName);
      return ChromeDriver.this;
    }
    
  }
}
