/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium.android;

import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.HasTouchScreen;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.TouchScreen;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.util.JsUtil;
import org.openqa.selenium.android.util.SimpleTimer;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class AndroidDriver implements WebDriver, SearchContext, FindsByTagName, JavascriptExecutor,
    FindsById, FindsByLinkText, FindsByName, FindsByXPath, TakesScreenshot,
    Rotatable, BrowserConnection, HasTouchScreen {

  public static final String LOG_TAG = AndroidDriver.class.getName();

  public static final String ERROR = "_ERROR:";  // Prefixes JS result when returning an error
  public static final String TYPE = "_TYPE";  // Prefixes Jaresult to be converted
  public static final String WEBELEMENT_TYPE = TYPE + "1:"; // Convert to WebElement

  private static Context context;
  private final SimpleTimer timer;
  private final AndroidWebElement element;
  private final JavascriptDomAccessor domAccessor;

  private String currentFrame;
  private long implicitWait = 0;
  private long asyncScriptTimeout = 0;
  private ActivityController controller = ActivityController.getInstance();
  private AndroidTouchScreen touchScreen = new AndroidTouchScreen(AndroidDriver.this);

  public AndroidDriver() {
    // By default currentFrame is the root, i.e. window
    currentFrame = "window";
    timer = new SimpleTimer();
    domAccessor = new JavascriptDomAccessor(this);
    element = new AndroidWebElement(this);

    controller.newWebView();
  }

  public JavascriptDomAccessor getDomAccessor() {
    return domAccessor;
  }

  public String getCurrentUrl() {
    return controller.getCurrentUrl();
  }

  public String getTitle() {
    return controller.getTitle();
  }

  public void get(String url) {
    controller.get(url);
  }

  public String getPageSource() {
    return (String) executeScript(
        "return (new XMLSerializer()).serializeToString(document.documentElement);");
  }

  public void close() {
    quit();
  }

  public void quit() {
    controller.quit();
  }

  public WebElement findElement(By by) {
    timer.start();
    while (true) {
      try {
        return by.findElement(this);
      } catch (NoSuchElementException e) {
        if (timer.getTimeElapsedInMillisSinceStart() > implicitWait) {
          throw e;
        }
        Sleeper.sleepQuietly(100);
      }
    }
  }

  public List<WebElement> findElements(By by) {
    timer.start();
    List<WebElement> found;
    do {
      found = by.findElements(this);
      if (found.isEmpty()) {
        Sleeper.sleepQuietly(100);
      } else {
        break;
      }
    } while (timer.getTimeElapsedInMillisSinceStart() <= implicitWait);
    return found;
  }

  public WebElement findElementByLinkText(String using) {
    return element.findElementByLinkText(using);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return element.findElementsByLinkText(using);
  }

  public WebElement findElementById(String id) {
    return element.findElementById(id);
  }

  public List<WebElement> findElementsById(String id) {
    return findElementsByXPath("//*[@id='" + id + "']");
  }

  public WebElement findElementByName(String using) {
    return element.findElementByName(using);
  }

  public List<WebElement> findElementsByName(String using) {
    return element.findElementsByName(using);
  }

  public WebElement findElementByTagName(String using) {
    return element.findElementByTagName(using);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return element.findElementsByTagName(using);
  }

  public WebElement findElementByXPath(String using) {
    return element.findElementByXPath(using);
  }

  public List<WebElement> findElementsByXPath(String using) {
    return element.findElementsByXPath(using);
  }

  public WebElement findElementByPartialLinkText(String using) {
    return element.findElementByPartialLinkText(using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return element.findElementsByPartialLinkText(using);
  }

  public Set<String> getWindowHandles() {
    return controller.getAllWindowHandles();
  }

  public String getWindowHandle() {
    return controller.getWindowHandle();
  }

  public TargetLocator switchTo() {
    return new AndroidTargetLocator();
  }

  private class AndroidTargetLocator implements TargetLocator {
    public WebElement activeElement() {
      Object element = executeScript(
        "try {" +
          "return document.activeElement;" +
        "} catch (err) {" +
        "  return 'failed_' + err;" +
        "}");
      if (element == null) {
        return findElementByXPath("//body");
      } else if (element instanceof WebElement) {
        return (WebElement) element;
      }
      return null;
    }

    public WebDriver defaultContent() {
      setCurrentFrame(null);
      return AndroidDriver.this;
    }

    public WebDriver frame(int index) {
      if (isFrameIndexValid(index)) {
        currentFrame += ".frames[" + index + "]";
      } else {
        throw new NoSuchFrameException("Frame not found: " + index);
      }
      return AndroidDriver.this;
    }

    public WebDriver frame(String frameNameOrId) {
      setCurrentFrame(frameNameOrId);
      return AndroidDriver.this;
    }

    public WebDriver frame(WebElement frameElement) {
      String tagName = frameElement.getTagName();
      if (!tagName.equalsIgnoreCase("iframe") && !tagName.equalsIgnoreCase("frame")) {
        throw new NoSuchFrameException(
            "Element is not a frame element: " + frameElement.getTagName());
      }

      int index = (Integer) executeScript(
          "var element = arguments[0];" +
          "var targetWindow = element.contentWindow;" +
          "if (!targetWindow) { throw Error('No such window!'); }" +
          // NOTE: this script executes in the context of the current frame, so
          // window === currentFrame
          "var numFrames = window.frames.length;" +
          "for (var i = 0; i < numFrames; i++) {" +
          "  if (targetWindow == window.frames[i]) {" +
          "    return i;" +
          "  }" +
          "}" +
          "return -1;",
          frameElement);

      if (index < 0) {
        throw new NoSuchFrameException("Unable to locate frame: " + tagName
            + "; current window: " + currentFrame);
      }

      currentFrame += ".frames[" + index + "]";
      return AndroidDriver.this;
    }

    public WebDriver window(String nameOrHandle) {
      controller.switchToWindow(nameOrHandle);
      return AndroidDriver.this;
    }

    private void setCurrentFrame(String frameNameOrId) {
      if (frameNameOrId == null) {
        currentFrame = "window";
      } else {
        currentFrame += ".frames[" + getIndexForFrameWithNameOrId(frameNameOrId) + "]";
      }
    }

    private int getIndexForFrameWithNameOrId(String name) {
      int index = (Integer) executeScript(
          "try {" +
          "  var foundById = null;" +
          // NOTE: this script executes in the context of the current frame, so
          // window === currentFrame
          "  var frames = window.frames;" +
          "  var numFrames = frames.length;" +
          "  for (var i = 0; i < numFrames; i++) {" +
          "    if (frames[i].name == arguments[0]) {" +
          "      return i;" +
          "    } else if (null == foundById && frames[i].frameElement.id == arguments[0]) {" +
          "      foundById = i;" +
          "    }" +
          "  }" +
          "  if (foundById != null) {" +
          "    return foundById;" +
          "  }" +
          "} catch (ignored) {" +
          "}" +
          "return -1;",
          name);

      if (index < 0) {
        throw new NoSuchFrameException("Frame not found: " + name);
      }

      return index;
    }

    private boolean isFrameIndexValid(int index) {
      return (Boolean) executeScript(
        "try {" +
        // NOTE: this script executes in the context of the current frame, so
        // window === currentFrame
        "  window.frames[arguments[0]].document;" +
        "  return true;" +
        "} catch(err) {" +
        "  return false;" +
        "}", index);
    }

    public Alert alert() {
      return controller.getAlert();
    }
  }

  public Navigation navigate() {
    return new AndroidNavigation();
  }

  public boolean isJavascriptEnabled() {
    return true;
  }

  public Object executeScript(String script, Object... args) {
    return executeJavascript(script, false, args);
  }

  public Object executeAsyncScript(String script, Object... args) {
    return executeJavascript(script, true, args);
  }

  private Object executeJavascript(String script, boolean sync, Object... args) {
    String jsFunction = embedScriptInJsFunction(script, sync, args);
    String jsResult = executeJavascriptInWebView(jsFunction);

    // jsResult is updated by the intent receiver when the JS result is ready.
    Object res = checkResultAndConvert(jsResult);
    return res;
  }

  private String embedScriptInJsFunction(String script, boolean isAsync, Object... args) {
    String finalScript = new StringBuilder("(function() {")
        .append("var isAsync=").append(isAsync).append(";")
        .append("var timeout=").append(asyncScriptTimeout).append(", timeoutId;")
        .append("var win=").append(currentFrame).append(";")
        .append("function sendResponse(value, isError) {")
        .append("  if (isAsync) {")
        .append("    win.clearTimeout(timeoutId);")
        .append("    win.removeEventListener('unload', onunload, false);")
        .append("  }")
        .append("  if (isError) {")
        .append("    window.webdriver.resultMethod('").append(ERROR).append("'+value);")
        .append("  } else {")
        .append(wrapAndReturnJsResult("value"))
        .append("  }")
        .append("}")
        .append("function onunload() {")
        .append("  sendResponse('Detected a page unload event; async script execution")
        .append(" does not work across page loads', true);")
        .append("}")
        .append("if (isAsync) {")
        .append("  win.addEventListener('unload', onunload, false);")
        .append("}")
        .append("var startTime = new Date().getTime();")
        .append("try {")
        .append("  var result=(function(){with(win){").append(script).append("}})(")
        .append(getArgsString(isAsync, args)).append(");")
        .append("  if (isAsync) {")
        .append("    timeoutId = win.setTimeout(function() {")
        .append("      sendResponse('Timed out waiting for async script after ' +")
        .append("(new Date().getTime() - startTime) + 'ms', true);")
        .append("    }, timeout);")
        .append("  } else {")
        .append("    sendResponse(result, false);")
        .append("  }")
        .append("} catch (e) {")
        .append("  sendResponse(e, true);")
        .append("}")
        .append("})()")
        .toString();

    return finalScript;
  }

  private String getArgsString(boolean isAsync, Object... args) {
    StringBuilder argsString = new StringBuilder();
    for (int i = 0; i < args.length; i++) {
      argsString.append(JsUtil.convertArgumentToJsObject(args[i]))
          .append((i == args.length - 1) ? "" : ",");
    }
    if (isAsync) {
      if (args.length > 0) {
        argsString.append(",");
      }
      argsString.append("function(value){sendResponse(value,false);}");
    }
    return argsString.toString();
  }

  private String wrapAndReturnJsResult(String objName) {
    // TODO(berrada): Extract this as an atom
    return new StringBuilder()
        .append("if (").append(objName).append(" instanceof HTMLElement) {")
        .append("with(").append(currentFrame).append(") {")
        .append(JavascriptDomAccessor.initCacheJs())
        .append(" var result = []; result.push(").append(objName).append(");")
        .append(JavascriptDomAccessor.ADD_TO_CACHE)
        .append(objName).append("='")
        .append(WEBELEMENT_TYPE)
        .append("'+indices;")
        .append("}")
        .append("} else {")
        .append(objName)
        .append("='{" + TYPE + ":'+JSON.stringify(")
        .append(objName).append(")+'}';")
        .append("}")
        // Callback to get the result passed from JS to Java
        .append("window.webdriver.resultMethod(").append(objName).append(");")
        .toString();
  }

  /**
   * Executes the given Javascript in the WebView and
   * wait until it is done executing.
   * If the Javascript executed returns a value, the later is updated in the
   * class variable jsResult when the event is broadcasted.
   *
   * @param args the Javascript to be executed
   */
  private String executeJavascriptInWebView(String script) {
    return controller.executeJavascript(script);
  }

  /**
   * Convert result to java type.
   *
   * @param jsResult JSON format or Error
   * @return java objects like long, double, String, boolean, Array, Map
   */
  protected Object checkResultAndConvert(String jsResult) {
    if (jsResult == null) {
      return null;
    } else if (jsResult.startsWith(ERROR)) {
      if (jsResult.startsWith(ERROR + "Timed out waiting for async script")) {
        throw new TimeoutException(jsResult);
      }
      throw new WebDriverException(jsResult);
    } else if (jsResult.startsWith(WEBELEMENT_TYPE)) {
      return new AndroidWebElement(this, jsResult.substring(7));
    } else if (jsResult.equals("{" + TYPE + ":null}")) {
      return null;
    } else if (jsResult.length() > 0) {
      try {
        JSONObject obj = new JSONObject(jsResult);
        return processJsonObject(obj.opt(TYPE));
      } catch (JSONException e) {
        Logger.log(Log.ERROR, LOG_TAG,
            "checkResultAndConvert JSONException + " + e.getMessage());
      }
    }
    return jsResult;
  }

  protected Object processJsonObject(Object res) throws JSONException {
    if (res instanceof JSONArray) {
      return convertJsonArray2List((JSONArray) res);
    } else if ("undefined".equals(res)) {
      return null;
    }
    return res;
  }

  protected List<Object> convertJsonArray2List(JSONArray arr) throws JSONException {
    List<Object> list = new ArrayList<Object>();
    for (int i = 0; i < arr.length(); i++) {
      list.add(processJsonObject(arr.get(i)));
    }
    return list;
  }

  public void setProxy(String host, int port) {
    if ((host != null) && (host.length() > 0)) {
      System.getProperties().put("proxySet", "true");
      System.getProperties().put("proxyHost", host);
      System.getProperties().put("proxyPort", port);
    }
  }

  public static void setContext(Context contentContext) {
    context = contentContext;
  }

  public static Context getContext() {
    return context;
  }

  public Options manage() {
    return new AndroidOptions();
  }

  private class AndroidOptions implements Options {

    public void addCookie(Cookie cookie) {
        controller.addCookie(cookie.getName(), cookie.getValue(), cookie.getPath());
    }

    public void deleteCookieNamed(String name) {
      controller.removeCookie(name);
    }

    public void deleteCookie(Cookie cookie) {
      controller.removeCookie(cookie.getName());
    }

    public void deleteAllCookies() {
      controller.removeAllCookies();
    }

    public Set<Cookie> getCookies() {
      return controller.getCookies();
    }

    public Cookie getCookieNamed(String name) {
      return controller.getCookie(name);
    }

    public Timeouts timeouts() {
      return new AndroidTimeouts();
    }

    public ImeHandler ime() {
      throw new UnsupportedOperationException("Not implementing IME input just yet.");
    }
  }

  class AndroidTimeouts implements Timeouts {
    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      implicitWait = TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit);
      return this;
    }

    public Timeouts setScriptTimeout(long time, TimeUnit unit) {
      asyncScriptTimeout = TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit);
      return this;
    }
  }

  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    byte[] rawPng = controller.takeScreenshot();
    String base64Png = new Base64Encoder().encode(rawPng);
    return target.convertFromBase64Png(base64Png);
  }

  public ScreenOrientation getOrientation() {
    return controller.getScreenOrientation();
  }

  public void rotate(ScreenOrientation orientation) {
    controller.rotate(orientation);
  }

  public boolean isOnline() {
    return controller.isConnected();
  }

  public void setOnline(boolean online) throws WebDriverException {
    controller.setConnected(online);
  }

  public TouchScreen getTouch() {
    return touchScreen;
  }
}
