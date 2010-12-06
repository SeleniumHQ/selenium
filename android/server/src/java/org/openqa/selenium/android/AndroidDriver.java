/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

import com.google.common.base.Splitter;
import com.google.common.collect.Sets;

import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.*;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.FutureExecutor;
import org.openqa.selenium.android.intents.IntentReceiver;
import org.openqa.selenium.android.intents.IntentReceiver.IntentReceiverListener;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;
import org.openqa.selenium.android.intents.IntentSender;
import org.openqa.selenium.android.sessions.SessionCookieManager;
import org.openqa.selenium.android.util.JsUtil;
import org.openqa.selenium.android.util.SimpleTimer;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.internal.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

public class AndroidDriver implements WebDriver, SearchContext, FindsByTagName, JavascriptExecutor,
    FindsById, FindsByLinkText, FindsByName, FindsByXPath, TakesScreenshot,
    IntentReceiverListener, Rotatable, BrowserConnection {

  public static final String LOG_TAG = AndroidDriver.class.getName();
  
  // Timeouts in milliseconds
  public static final long INTENT_TIMEOUT = 10000L;
  public static final long LOADING_TIMEOUT = 30000L;
  public static final long START_LOADING_TIMEOUT = 800L;
  public static final long WAIT_FOR_RESPONSE_TIMEOUT = 20000L;
  public static final long FOCUS_TIMEOUT = 1000L;
  
  public static final String ERROR = "_ERROR:";  // Prefixes JS result when returning an error
  public static final String TYPE = "_TYPE";  // Prefixes JS result to be converted
  public static final String WEBELEMENT_TYPE = TYPE + "1:"; // Convert to WebElement
  
  private static Context context;
  private final SimpleTimer timer;
  private final IntentReceiverRegistrar intentRegistrar;
  private final AndroidWebElement element;
  private final JavascriptDomAccessor domAccessor;
  private final IntentSender sender;

  private volatile boolean pageHasLoaded = false;
  private volatile boolean pageHasStartedLoading = false;
  private volatile boolean editableAreaIsFocused = false;

  private volatile String jsResult;
  private String currentFrame;
  private long implicitWait = 0;
  private long asyncScriptTimeout = 0;

  public AndroidDriver() {
    // By default currentFrame is the root, i.e. window
    currentFrame = "window";
    intentRegistrar = new IntentReceiverRegistrar(getContext());
    timer = new SimpleTimer();
    sender = new IntentSender(getContext());
    // TODO(berrada): This object is stateless, think about isolating the JS and
    // provide helper functions.
    domAccessor = new JavascriptDomAccessor(this);
    element = new AndroidWebElement(this);
    initIntentReceivers();
  }

  private void initIntentReceivers() {    
    IntentReceiver receiver = new IntentReceiver();
    receiver.setListener(this);
    intentRegistrar.registerReceiver(receiver, Action.JAVASCRIPT_RESULT_AVAILABLE);
    intentRegistrar.registerReceiver(receiver, Action.PAGE_LOADED);
    intentRegistrar.registerReceiver(receiver, Action.PAGE_STARTED_LOADING);
    intentRegistrar.registerReceiver(receiver, Action.EDITABLE_AERA_FOCUSED);
  }

  public JavascriptDomAccessor getDomAccessor() {
    return domAccessor;
  }
  
  public String getCurrentFrame() {
    return currentFrame;
  }
  
  public String getCurrentUrl() {
    if ("window".equals(currentFrame)) {
      return (String) executeScript("return " + currentFrame + ".location.href");
    }
    return (String) sendIntent(Action.GET_URL);
  }

  public String getTitle() {
    if (!"window".equals(currentFrame)) {
      return (String) executeScript("return " + currentFrame + ".document.title");
    }
    return (String) sendIntent(Action.GET_TITLE);
  }

  public void get(String url) {
    doNavigation(Action.NAVIGATE, url);
  }

  public String getPageSource() {
    return (String) executeScript(
        "return (new XMLSerializer()).serializeToString("
            + currentFrame + ".document.documentElement);");
  }

  public void close() {
    // Delete the current session. Android driver does not support multisessions
    // closing is equivalent to quit().
    quit();
  }

  public void quit() {
    intentRegistrar.unregisterAllReceivers();
    sendIntent(Action.ACTIVITY_QUIT);
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
    String result = (String) sendIntent(Action.GET_ALL_WINDOW_HANDLES);
    Iterable<String> iterable = Splitter.on(",")
        .trimResults()
        .omitEmptyStrings()
        .split(result.substring(1, result.length() -1));
    return Sets.newHashSet(iterable);
  }

  public String getWindowHandle() {
    return (String) sendIntent(Action.GET_CURRENT_WINDOW_HANDLE);
  }

  public TargetLocator switchTo() {
    return new AndroidTargetLocator();
  }
  
  private class AndroidTargetLocator implements TargetLocator {
    public WebElement activeElement() {
      Object element = executeScript(
        "try {" +
          "return " + currentFrame + ".document.activeElement;" +
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

    public WebDriver window(String nameOrHandle) {
      boolean success = (Boolean) sendIntent(Action.SWITCH_TO_WINDOW, nameOrHandle);
      if (!success) {
        throw new NoSuchWindowException(String.format("Invalid window name \"%s\".", nameOrHandle));
      }
      return AndroidDriver.this;
    }
    
    private void setCurrentFrame(String frameNameOrId) {
      if (frameNameOrId == null) {
        currentFrame = "window";
      } else if (isFrameNameOrIdValid(frameNameOrId)) {
        currentFrame += "." + frameNameOrId;
      } else {
        throw new NoSuchFrameException("Frame not found: " + frameNameOrId);
      }
    }
    
    private boolean isFrameNameOrIdValid(String name) {
      return (Boolean) executeScript(
        "try {" +
           currentFrame + "." + name + ".document;" +
        "  return true;" +
        "} catch(err) {" +
        "  return false;" +
        "}");
    }
    
    private boolean isFrameIndexValid(int index) {
      return (Boolean) executeScript(
        "try {" +
           currentFrame + ".frames[arguments[0]].document;" +
        "  return true;" +
        "} catch(err) {" +
        "  return false;" +
        "}", index);
    }

    public Alert alert() {
      throw new UnsupportedOperationException("alert()");
    }
  }

  public Navigation navigate() {
    return new AndroidNavigation(this);
  }
  
  public boolean isJavascriptEnabled() {
    return true;
  }

  public Object executeScript(String script, Object... args) {
    String jsFunction = embedScriptInJsFunction(script, false, args);
    executeJavascriptInWebView(jsFunction);

    // jsResult is updated by the intent receiver when the JS result is ready. 
    Object res = checkResultAndConvert(jsResult);
    return res;
  }

  public Object executeAsyncScript(String script, Object... args) {
    String jsFunction = embedScriptInJsFunction(script, true, args);
    executeJavascriptInWebView(jsFunction);

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
        .append("does not work across page loads', true);")
        .append("}")
        .append("if (isAsync) {")
        .append("  win.addEventListener('unload', onunload, false);")
        .append("}")
        .append("var startTime = new Date().getTime();")
        .append("try {")
        .append("  var result=(function(){").append(script).append("})(")
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

    Logger.log(Log.DEBUG, LOG_TAG, "executeScript executing: " + finalScript);
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
        .append(JavascriptDomAccessor.initCacheJs(currentFrame))
        .append(" var result = []; result.push(").append(objName).append(");")
        .append(JavascriptDomAccessor.ADD_TO_CACHE)
        .append(objName).append("='")
        .append(WEBELEMENT_TYPE)
        .append("'+indices;")
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
  private void executeJavascriptInWebView(Object... args) {
    jsResult = Action.NOT_DONE_INDICATOR;
    timer.start();
    sendIntent(Action.EXECUTE_JAVASCRIPT, args);
    
    FutureExecutor.executeFuture(new Callable<Void>() {
      public Void call() {
        while (Action.NOT_DONE_INDICATOR.equals(jsResult)) {
          Sleeper.sleepQuietly(10);
        }
        return null;
      }
    }, WAIT_FOR_RESPONSE_TIMEOUT);
    timer.stop("ExecuteJavascript");
  }

  /**
   * Convert result to java type.
   *
   * @param jsResult JSON format or Error
   * @return java objects like long, double, String, boolean, Array, Map
   */
  protected Object checkResultAndConvert(String jsResult) {
    // TODO(berrada): Prepare the JSON to return in the JS
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
      sendIntent(Action.ADD_COOKIE,
          cookie.getName(), cookie.getValue(), cookie.getPath());
    }

    public void deleteCookieNamed(String name) {
      sendIntent(Action.REMOVE_COOKIE, name, "", "");
    }

    public void deleteCookie(Cookie cookie) {
      sendIntent(Action.REMOVE_COOKIE, cookie.getName(), "", cookie.getPath());
    }

    public void deleteAllCookies() {
      sendIntent(Action.REMOVE_ALL_COOKIES, "", "", "");
    }

    public Set<Cookie> getCookies() {
      Set<Cookie> cookies = new HashSet<Cookie>();
      String cookieString = (String) sendIntent(Action.GET_ALL_COOKIES, "", "", "");

      if (cookieString != null) {
        for (String cookie : cookieString.split(SessionCookieManager.COOKIE_SEPARATOR)) {
          String[] cookieValues = cookie.split("=");
          if (cookieValues.length >= 2) {
            cookies.add(new Cookie(cookieValues[0].trim(), cookieValues[1], null, null, null));
          }
        }
      }
      return cookies;
    }

    public Cookie getCookieNamed(String name) {
      String cookieValue = (String) sendIntent(Action.GET_COOKIE, name, "", "");

      if (cookieValue.length() > 0)
        return new Cookie(name, cookieValue, null, null, null);
      else
        return null;
    }

    public Speed getSpeed() {
      throw new UnsupportedOperationException();
    }

    public void setSpeed(Speed speed) {
      throw new UnsupportedOperationException();
    }

    public Timeouts timeouts() {
      return new AndroidTimeouts();
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
  
  public void doNavigation(String intentName) {
    doNavigation(intentName, null);
  }
  
  private void doNavigation(String intentName, String url) {
    timer.start();
    sendIntent(intentName, url);
    waitUntilPageFinishedLoading();
    currentFrame = "window";
    timer.stop(intentName);
  }
  
  public void waitUntilPageFinishedLoading() {
    FutureExecutor.executeFuture(new Callable<Void>() {
      public Void call() throws Exception {
        while (!pageHasLoaded) {
          Sleeper.sleepQuietly(50);
        }
        return null;
      }
      
    }, LOADING_TIMEOUT);
  }
  
  public void waitUntilEditableAreaFocused() {
    FutureExecutor.executeFuture(new Callable<Void>() {
      public Void call() throws Exception {
        while (!editableAreaIsFocused) {
          Sleeper.sleepQuietly(50);
        }
        return null;
      }
      
    }, FOCUS_TIMEOUT);
  }
  
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    byte[] rawPng = (byte[]) sendIntent(Action.TAKE_SCREENSHOT);
    String base64Png = new Base64Encoder().encode(rawPng);
    return target.convertFromBase64Png(base64Png);
  }

  public ScreenOrientation getOrientation() {
    return (ScreenOrientation) sendIntent(Action.GET_SCREEN_ORIENTATION);
  }

  public void rotate(ScreenOrientation orientation) {
    sendIntent(Action.ROTATE_SCREEN, orientation);
  }
  
  public Object sendIntent(String action, Object... args) {
    resetPageHasLoaded();
    resetPageHasStartedLoading();
    editableAreaIsFocused = false;
    sender.broadcast(action, args);
    return FutureExecutor.executeFuture(sender, INTENT_TIMEOUT);
  }

  public Object onReceiveBroadcast(String action, Object... args) {
    if (Action.JAVASCRIPT_RESULT_AVAILABLE.equals(action)) {
      jsResult = (String) args[0];
    } else if (Action.PAGE_LOADED.equals(action)) {
      pageHasLoaded = true;
    } else if (Action.PAGE_STARTED_LOADING.equals(action)) {
      pageHasStartedLoading = true;
    } else if (Action.EDITABLE_AERA_FOCUSED.equals(action)) {
      editableAreaIsFocused = true;
    }
    return null;
  }
  
  public void resetPageHasLoaded() {
    pageHasLoaded = false;
  }
  
  public boolean pageHasLoaded() {
    return pageHasLoaded;
  }
  
  public void resetPageHasStartedLoading() {
    pageHasStartedLoading = false;
  }
  
  public boolean pageHasStartedLoading() {
    // Wait 500 ms to detect is a page has started loading
    long timeout = System.currentTimeMillis() + 500;
    while (!pageHasStartedLoading) {
      if (System.currentTimeMillis() > timeout) {
        break;
      }
      try {
        Thread.sleep(50);
      } catch (InterruptedException e) {
        // Restore the interrupted status
        Thread.currentThread().interrupt();
      }
    }
    return pageHasStartedLoading;
  }

  public boolean isOnline() {
    return Settings.System.getInt(getContext().getContentResolver(),
        Settings.System.AIRPLANE_MODE_ON, 0) == 0;
  }

  public void setOnline(boolean online) throws WebDriverException {
    Settings.System.putInt(getContext().getContentResolver(),
        Settings.System.AIRPLANE_MODE_ON, online ? 0 : 1);
    Intent intent = new Intent(Intent.ACTION_AIRPLANE_MODE_CHANGED);
    intent.putExtra("state", !online);
    getContext().sendBroadcast(intent);
  }
}
