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

package org.openqa.selenium.ie;

import static org.openqa.selenium.browserlaunchers.CapabilityType.PROXY;
import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import com.sun.jna.Native;
import com.sun.jna.NativeLong;
import com.sun.jna.Pointer;
import com.sun.jna.WString;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.Speed;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.CapabilityType;
import org.openqa.selenium.browserlaunchers.DoNotUseProxyPac;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.ReturnedCookie;
import org.openqa.selenium.internal.TemporaryFilesystem;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class InternetExplorerDriver implements WebDriver, JavascriptExecutor, TakesScreenshot {

  private static ExportedWebDriverFunctions lib;
  private Pointer driver;
  private Speed speed = Speed.FAST;
  private ErrorHandler errors = new ErrorHandler();
  private Thread cleanupThread;
  private WindowsProxyManager proxyManager;

  public InternetExplorerDriver() {
    this(null);
  }

  public InternetExplorerDriver(Capabilities caps) {
    proxyManager = new WindowsProxyManager(true, "webdriver-ie", 0, 0);
    
    prepareProxy(caps);

    initializeLib();
    PointerByReference ptr = new PointerByReference();
    int result = lib.wdNewDriverInstance(ptr);
    if (result != SUCCESS) {
      throw new IllegalStateException("Cannot create new browser instance: " + result);
    }
    driver = ptr.getValue();
  }

  private void prepareProxy(Capabilities caps) {
    if (caps == null || caps.getCapability(PROXY) == null) {
      return;
    }

    // Because of the way that the proxying is currently implemented,
    // we can only set a single host.

    try {
      proxyManager.backupRegistrySettings();
      proxyManager.changeRegistrySettings(caps);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }

    cleanupThread = new Thread() {
      @Override
      public void run() {
        proxyManager.restoreRegistrySettings(true);
      }
    };
    Runtime.getRuntime().addShutdownHook(cleanupThread);
  }

  public String getPageSource() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdGetPageSource(driver, wrapper);

    errors.verifyErrorCode(result, "Unable to get page source");

    return new StringWrapper(lib, wrapper).toString();
  }

  public void close() {
    int result = lib.wdClose(driver);
    if (result != SUCCESS) {
      throw new IllegalStateException("Unable to close driver: " + result);
    }
  }

  public void quit() {
    if (proxyManager != null) {
      proxyManager.restoreRegistrySettings(true);
    }
    if (cleanupThread != null) {
      Runtime.getRuntime().removeShutdownHook(cleanupThread);
    }

    try {
      for (String handle : getWindowHandles()) {
      try {
        switchTo().window(handle);
        close();
      } catch (NoSuchWindowException e) {
        // doesn't matter one jot.
      }
    }
    } catch (IllegalStateException e) {
      // Stuff happens. Bail out
      lib.wdFreeDriver(driver);
      driver = null;
    }
    
    lib.wdFreeDriver(driver);
    driver = null;
  }

  public Set<String> getWindowHandles() {
    PointerByReference rawHandles = new PointerByReference();
    int result = lib.wdGetAllWindowHandles(driver, rawHandles);

    errors.verifyErrorCode(result, "Unable to obtain all window handles");

    return new StringCollection(lib, rawHandles.getValue()).toSet();
  }

  public String getWindowHandle() {
    PointerByReference handle = new PointerByReference();
    int result = lib.wdGetCurrentWindowHandle(driver, handle);

    errors.verifyErrorCode(result, "Unable to obtain current window handle");

    return new StringWrapper(lib, handle).toString();
  }

  /**
   * Execute javascript in the context of the currently selected frame or
   * window. This means that "document" will refer to the current document.
   * If the script has a return value, then the following steps will be taken:
   *
   * <ul> <li>For an HTML element, this method returns a WebElement</li>
   * <li>For a number, a Long is returned</li>
   * <li>For a boolean, a Boolean is returned</li>
   * <li>For all other cases, a String is returned.</li>
   * <li>Unless the value is null or there is no return value,
   * in which null is returned</li>
   * <li>Does not support lists or arrays. See Webdriver issue #110</li></ul>
   *
   * <p>Arguments must be a number, a boolean, a String or WebElement.
   * An exception will be thrown if the arguments do not meet these criteria.
   * The arguments will be made available to the javascript via the "arguments"
   * magic variable, as if the function were called via "Function.apply"
   *
   * @param script The javascript to execute
   * @param args The arguments to the script. May be empty
   * @return One of Boolean, Long, String or WebElement. Or null.
   */
  public Object executeScript(String script, Object... args) {
    PointerByReference scriptArgsRef = new PointerByReference();
    int result = lib.wdNewScriptArgs(scriptArgsRef, args.length);
    errors.verifyErrorCode(result, "Unable to create new script arguments array");
    Pointer scriptArgs = scriptArgsRef.getValue();

    try {
      populateArguments(result, scriptArgs, args);

      script = "(function() { return function(){" + script + "};})();";

      PointerByReference scriptResultRef = new PointerByReference();
      result = lib.wdExecuteScript(driver, new WString(script), scriptArgs, scriptResultRef);

      errors.verifyErrorCode(result, "Cannot execute script");
      return new JavascriptResultCollection(lib, this).extractReturnValue(scriptResultRef);
    } finally {
      lib.wdFreeScriptArgs(scriptArgs);
    }
  }

  public boolean isJavascriptEnabled() {
    return true;
  }

  private int populateArguments(int result, Pointer scriptArgs, Object... args) {
    for (Object arg : args) {
      if (arg instanceof String) {
        result = lib.wdAddStringScriptArg(scriptArgs, new WString((String) arg));
      } else if (arg instanceof Boolean) {
        Boolean param = (Boolean) arg;
        result = lib.wdAddBooleanScriptArg(scriptArgs, param == null || !param ? 0 : 1);
      } else if (arg instanceof Double || arg instanceof Float) {
        Double number = ((Number) arg).doubleValue();
        result = lib.wdAddDoubleScriptArg(scriptArgs, number);
      } else if (arg instanceof Number) {
        long number = ((Number) arg).longValue();
        result = lib.wdAddNumberScriptArg(scriptArgs, new NativeLong(number));
      } else if (arg instanceof InternetExplorerElement) {
        result = ((InternetExplorerElement) arg).addToScriptArgs(scriptArgs);
      } else {
        throw new IllegalArgumentException("Parameter is not of recognized type: " + arg);
      }

      errors.verifyErrorCode(result, ("Unable to add argument: " + arg));
    }
    return result;
  }

  public void get(String url) {
    int result = lib.wdGet(driver, new WString(url));
    if (result != SUCCESS) {
      errors.verifyErrorCode(result, String.format("Cannot get \"%s\": %s", url, result));
    }
  }

  public String getCurrentUrl() {
    PointerByReference ptr = new PointerByReference();
    int result = lib.wdGetCurrentUrl(driver, ptr);
    if (result != SUCCESS) {
      throw new IllegalStateException("Unable to get current URL: " + result);
    }

    return new StringWrapper(lib, ptr).toString();
  }

  public String getTitle() {
    PointerByReference ptr = new PointerByReference();
    int result = lib.wdGetTitle(driver, ptr);
    if (result != SUCCESS) {
      throw new IllegalStateException("Unable to get title: " + result);
    }

    return new StringWrapper(lib, ptr).toString();
  }

  /**
   * Is the browser visible or not?
   *
   * @return True if the browser can be seen, or false otherwise
   */
  public boolean getVisible() {
    IntByReference toReturn = new IntByReference();
    int result = lib.wdGetVisible(driver, toReturn);

    errors.verifyErrorCode(result, "Unable to determine if browser is visible");

    return toReturn.getValue() == 1;
  }

  /**
   * Make the browser visible or not.
   *
   * @param visible Set whether or not the browser is visible
   */
  public void setVisible(boolean visible) {
    int result = lib.wdSetVisible(driver, visible ? 1 : 0);

    errors.verifyErrorCode(result, "Unable to change the visibility of the browser");
  }

  public List<WebElement> findElements(By by) {
    return new Finder(lib, this, null).findElements(by);
  }

  public WebElement findElement(By by) {
    return new Finder(lib, this, null).findElement(by);
  }

  @Override
  public String toString() {
    return getClass().getName() + ": Implement me!";
  }

  public TargetLocator switchTo() {
    return new InternetExplorerTargetLocator();
  }


  public Navigation navigate() {
    return new InternetExplorerNavigation();
  }

  public Options manage() {
    return new InternetExplorerOptions();
  }

  protected void waitForLoadToComplete() {
    lib.wdWaitForLoadToComplete(driver);
  }
  
  public Pointer getDriverPointer() {
    return driver;
  }

  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
	// Get the screenshot as base64.
	PointerByReference ptr = new PointerByReference();
	int result = lib.wdCaptureScreenshotAsBase64(driver, ptr);
	if (result != SUCCESS) {
	  throw new IllegalStateException("Unable to capture screenshot: " + result);
    }
    // ... and convert it.
    return target.convertFromBase64Png(new StringWrapper(lib, ptr).toString());
  }

  @Override
  protected void finalize() throws Throwable {
    super.finalize();
    if (driver != null) {
      lib.wdFreeDriver(driver);
    }
  }

  // Deliberately package level visibility
  Pointer getUnderlyingPointer() {
    return driver;
  }

  private class InternetExplorerTargetLocator implements TargetLocator {

    public WebDriver frame(int frameIndex) {
      return frame(String.valueOf(frameIndex));
    }

    public WebDriver frame(String frameName) {
      int result = lib.wdSwitchToFrame(driver, new WString(frameName));

      errors.verifyErrorCode(result, ("Unable to switch to frame: " + frameName));

      return InternetExplorerDriver.this;
    }

    public WebDriver window(String windowName) {
      int result = lib.wdSwitchToWindow(driver, new WString(windowName));
      errors.verifyErrorCode(result, "Unable to locate window: " + windowName);
      return InternetExplorerDriver.this;
    }

    public WebDriver defaultContent() {
      return frame("");
    }


    public WebElement activeElement() {
      PointerByReference element = new PointerByReference();
      int result = lib.wdSwitchToActiveElement(driver, element);

      errors.verifyErrorCode(result, "Unable to find active element");

      return new InternetExplorerElement(lib, InternetExplorerDriver.this, element.getValue());
    }

    public Alert alert() {
      throw new UnsupportedOperationException("alert");
    }
  }

  private class InternetExplorerNavigation implements Navigation {

    public void back() {
      int result = lib.wdGoBack(driver);
      errors.verifyErrorCode(result, "Unable to go back");
    }

    public void forward() {
      int result = lib.wdGoForward(driver);
      errors.verifyErrorCode(result, "Unable to go forward");
    }

    public void to(String url) {
      get(url);
    }

    public void to(URL url) {
      get(String.valueOf(url));
    }

    public void refresh() {
      int result = lib.wdRefresh(driver);
      errors.verifyErrorCode(result, "Unable to refresh current page");
    }
  }

  private class InternetExplorerOptions implements Options {

    public void addCookie(Cookie cookie) {
      StringBuilder sb = new StringBuilder(cookie.getName());
      sb.append("=").append(cookie.getValue()).append("; ");
      if (cookie.getPath() != null && !"".equals(cookie.getPath())) {
        sb.append("path=").append(cookie.getPath()).append("; ");
      }
      if (cookie.getDomain() != null && !"".equals(cookie.getDomain())) {
        String domain = cookie.getDomain();
        int colon = domain.indexOf(":");
        if (colon != -1) {
          domain = domain.substring(0, colon);
        }
        sb.append("domain=").append(domain).append("; ");
      }
      if (cookie.getExpiry() != null) {
        sb.append("expires=");
        sb.append(new SimpleDateFormat("EEE, d MMM yyyy hh:mm:ss z").format(cookie.getExpiry()));
      }

      executeScript("document.cookie = arguments[0]", sb.toString());
    }

    public void deleteAllCookies() {
      Set<Cookie> cookies = getCookies();
      for (Cookie cookie : cookies) {
        deleteCookie(cookie);
      }
    }

    public void deleteCookie(Cookie cookie) {
      if (cookie == null) {
        throw new WebDriverException("Cookie to delete cannot be null");
      }

      deleteCookieNamed(cookie.getName());
    }

    public void deleteCookieNamed(String name) {
      if (name == null) {
        throw new WebDriverException("Cookie to delete cannot be null");
      }

      int result = lib.wdDeleteCookie(driver, new WString(name));
      errors.verifyErrorCode(result, "Cannot delete cookie " + name);
    }

    public Set<Cookie> getCookies() {
      String currentUrl = getCurrentHost();

      PointerByReference wrapper = new PointerByReference();
      int result = lib.wdGetCookies(driver, wrapper);

      errors.verifyErrorCode(result, "Unable to extract visible cookies");

      Set<Cookie> toReturn = new HashSet<Cookie>();
      String allDomainCookies = new StringWrapper(lib, wrapper).toString();

      String[] cookies = allDomainCookies.split("; ");
      for (String cookie : cookies) {
        String[] parts = cookie.split("=");
        if (parts.length != 2) {
          continue;
        }

        toReturn.add(new ReturnedCookie(parts[0], parts[1], currentUrl, "", null, false, currentUrl));
      }

      return toReturn;
    }

    public Cookie getCookieNamed(String name) {
      Set<Cookie> allCookies = getCookies();
      for (Cookie cookie : allCookies) {
        if (name.equals(cookie.getName())) {
          return cookie;
        }
      }

      return null;
    }

    private String getCurrentHost() {
      try {
        URL url = new URL(getCurrentUrl());
        return url.getHost();
      } catch (MalformedURLException e) {
        return "";
      }
    }

    public Speed getSpeed() {
      return speed;
    }

    public void setSpeed(Speed speed) {
      InternetExplorerDriver.this.speed = speed;
    }

    public Timeouts timeouts() {
      return new InternetExplorerTimeouts();
    }
  }

  private class InternetExplorerTimeouts implements Timeouts {
    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      NativeLong timeout = new NativeLong(unit.toMillis(time));
      int result = lib.wdSetImplicitWaitTimeout(driver, timeout);
      errors.verifyErrorCode(result, "Unable to set implicit wait timeout.");
      return this;
    }
  }

  private void initializeLib() {
    synchronized (this) {
      if (lib != null) {
        return;
      }

      File parentDir = TemporaryFilesystem.createTempDir("webdriver", "libs");

      // We need to do this before calling any JNA methods because
      // the map of paths to search is static. Apparently.
      StringBuilder jnaPath = new StringBuilder(System.getProperty("jna.library.path", ""));
      jnaPath.append(File.pathSeparator);
      jnaPath.append(System.getProperty("java.class.path"));
      jnaPath.append(File.pathSeparator);
      jnaPath.append(parentDir.getAbsolutePath());
      jnaPath.append(File.pathSeparator);

      try {
        FileHandler.copyResource(parentDir, getClass(), "InternetExplorerDriver.dll");
      } catch (IOException e) {
        if (Boolean.getBoolean("webdriver.development")) {
          System.err.println(
                  "Exception unpacking required libraries, but in development mode. Continuing");
        } else {
          throw new WebDriverException(e);
        }
      }

      System.setProperty("jna.library.path", jnaPath.toString());

      try {
        lib = (ExportedWebDriverFunctions) Native.loadLibrary(
            "InternetExplorerDriver", ExportedWebDriverFunctions.class);
      } catch (UnsatisfiedLinkError e) {
        System.out.println("new File(\".\").getAbsolutePath() = " + new File(".").getAbsolutePath());
        throw new WebDriverException(e);
      }
    }
  }

  private class NullPathCookie extends Cookie {
    private final String path;

    private NullPathCookie(String name, String value, String domain, String path, Date expiry) {
      super(name, value, domain, path, expiry);
      this.path = path;
    }

    @Override
    public String getPath() {
      return path;
    }
  }
}
