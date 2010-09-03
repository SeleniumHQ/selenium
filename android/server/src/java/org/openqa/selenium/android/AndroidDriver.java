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

import android.content.Context;
import android.os.SystemClock;
import android.util.Log;

import com.google.common.collect.Sets;

import com.google.common.io.ByteStreams;
import com.google.common.io.Closeables;
import com.google.common.io.Resources;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.Speed;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.app.R;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.FutureExecutor;
import org.openqa.selenium.android.intents.IntentReceiver;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;
import org.openqa.selenium.android.intents.IntentSender;
import org.openqa.selenium.android.intents.IntentReceiver.IntentReceiverListener;
import org.openqa.selenium.android.sessions.SessionCookieManager;
import org.openqa.selenium.android.util.JsUtil;
import org.openqa.selenium.android.util.SimpleTimer;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

public class AndroidDriver implements WebDriver, SearchContext, FindsByTagName, JavascriptExecutor,
    FindsById, FindsByLinkText, FindsByName, FindsByXPath, TakesScreenshot,
    IntentReceiverListener {

  public static final String LOG_TAG = AndroidDriver.class.getName();
  
  public static final String ERROR = "_ERROR:";  // Prefixes JS result when returning an error
  public static final String TYPE = "_TYPE";  // Prefixes JS result to be converted
  public static final String WEBELEMENT_TYPE = TYPE + "1:"; // Convert to WebElement
  private static final String WINDOW_HANDLE = "windowOne";
  // Timeouts in milliseconds
  public static final long INTENT_TIMEOUT = 10000L;
  public static final long LOADING_TIMEOUT = 30000L;
  public static final long START_LOADING_TIMEOUT = 800L;
  public static final long WAIT_FOR_RESPONSE_TIMEOUT = 20000L;

  private static final String NOT_DONE_INDICATOR = Long.toString(SystemClock.uptimeMillis());
  private static Context context;
  private final SimpleTimer timer;
  private final IntentReceiverRegistrar intentRegistrar;
  private final AndroidWebElement element;
  private final JavascriptDomAccessor domAccessor;
  private final IntentSender sender;
  private boolean pageHasLoaded = false;
  private boolean pageHasStartedLoading = false;
  private String jsResult;
  private String jsonLibrary;
  private String currentFrame;
  private long implicitWait = 0;  
  
  public AndroidDriver() {
    Log.e(LOG_TAG, "AndroidDriver constructor: " + getContext().getPackageName());
    // By default currentFrame is the root, i.e. window
    currentFrame = "window";
    initJsonLibrary();
    intentRegistrar = new IntentReceiverRegistrar(getContext());
    timer = new SimpleTimer();
    sender = new IntentSender();
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
  }

  private void initJsonLibrary() {
    // Unfortunately JSON is not natively supported until Android 1.6
    // TODO(berrada): Only do this if we're on <1.6
    InputStream stream = null;
    try {
      stream = getContext().getResources().openRawResource(R.raw.json);
      jsonLibrary = new String(ByteStreams.toByteArray(stream));
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      Closeables.closeQuietly(stream);
    }
  }

  public JavascriptDomAccessor getDomAccessor() {
    return domAccessor;
  }
  
  public String getCurrentFrame() {
    return currentFrame;
  }
  
  public String getCurrentUrl() {
    Log.d(LOG_TAG, "getCurrentUrl");
    if ("window".equals(currentFrame)) {
      return (String) executeScript("return " + currentFrame + ".location.href");
    }
    return (String) sendIntent(Action.GET_URL);
  }

  public String getTitle() {
    Log.d(LOG_TAG, "getTitle");
    if (!"window".equals(currentFrame)) {
      return (String) executeScript("return " + currentFrame + ".document.title");
    }
    return (String) sendIntent(Action.GET_TITLE);
  }

  public void get(String url) {
    doNavigation(Action.NAVIGATE, url);
  }

  public String getPageSource() {
    Log.d(LOG_TAG, "getPageSource");
    executeScript("return " + currentFrame + ".document.documentElement.outerHTML");
    return jsResult;
  }

  public void close() {
    // Delete the current session. Android driver does not support multisessions
    // closing is equivalent to quit().
    Log.d(LOG_TAG, "Close");
    quit();
  }

  public void quit() {
    Log.d(LOG_TAG, "Quitting..");
    intentRegistrar.unregisterAllReceivers();
  }

  public WebElement findElement(By by) {
    Log.d(LOG_TAG, "findElement by: " + by.toString());
    timer.start();
    while (true) {
      try {
        return by.findElement(this);
      } catch (NoSuchElementException e) {
        if (timer.getTimeElapsedInMillisSinceStart() > implicitWait) {
          throw e;
        }
        sleepQuietly(100);
      }
    }
  }

  public List<WebElement> findElements(By by) {
    Log.d(LOG_TAG, "findElements by: " + by.toString());
    timer.start();
    List<WebElement> found;
    do {
      found = by.findElements(this);
      if (found.isEmpty()) {
        sleepQuietly(100);
      } else {
        break;
      }
    } while (timer.getTimeElapsedInMillisSinceStart() <= implicitWait);
    return found;
  }

  private static void sleepQuietly(long ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException ignored) {
    }
  }

  public WebElement findElementByLinkText(String using) {
    Log.d(LOG_TAG, "Searching for element by link text: " + using);
    return element.findElementByLinkText(using);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    Log.d(LOG_TAG, "Searching for elements by link text: " + using);
    return element.findElementsByLinkText(using);
  }

  public WebElement findElementById(String id) {
    Log.d(LOG_TAG, "Searching for element by Id: " + id);
    return element.findElementById(id);
  }

  public List<WebElement> findElementsById(String id) {
    Log.d(LOG_TAG, "Searching for elements by Id: " + id);
    return findElementsByXPath("//*[@id='" + id + "']");
  }

  public WebElement findElementByName(String using) {
    Log.d(LOG_TAG, "Searching for element by name: " + using);
    return element.findElementByName(using);
  }

  public List<WebElement> findElementsByName(String using) {
    Log.d(LOG_TAG, "Searching for elements by name: " + using);
    return element.findElementsByName(using);
  }

  public WebElement findElementByTagName(String using) {
    Log.d(LOG_TAG, "Searching for element by tag name: " + using);
    return element.findElementByTagName(using);
  }

  public List<WebElement> findElementsByTagName(String using) {
    Log.d(LOG_TAG, "Searching for elements by tag name: " + using);
    return element.findElementsByTagName(using);
  }

  public WebElement findElementByXPath(String using) {
    Log.d(LOG_TAG, "Searching for element by XPath: " + using);
    return element.findElementByXPath(using);
  }

  public List<WebElement> findElementsByXPath(String using) {
    Log.d(LOG_TAG, "Searching for elements by XPath: " + using);
    return element.findElementsByXPath(using);
  }

  public WebElement findElementByPartialLinkText(String using) {
    Log.d(LOG_TAG, "Searching for element by partial link text: " + using);
    return element.findElementByPartialLinkText(using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    Log.d(LOG_TAG, "Searching for elements by partial link text: " + using);
    return element.findElementsByPartialLinkText(using);
  }

  public Set<String> getWindowHandles() {
    Set<String> toReturn = Sets.newHashSet();
    toReturn.add(WINDOW_HANDLE);
    return toReturn;
  }

  public String getWindowHandle() {
    return WINDOW_HANDLE;
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
      Log.d(LOG_TAG, "Switch to frame: " + index);
      if (isFrameIndexValid(index)) {
        currentFrame += ".frames[" + index + "]"; 
      } else {
        throw new NoSuchFrameException("Frame not found: " + index);
      }
      return AndroidDriver.this;
    }

    public WebDriver frame(String frameNameOrId) {
      Log.d(LOG_TAG, "Switch to frame: " + frameNameOrId);
      setCurrentFrame(frameNameOrId);
      return AndroidDriver.this;
    }

    public WebDriver window(String nameOrHandle) {
      throw new UnsupportedOperationException("Only one window can be opened at a time.");
    }
    
    private void setCurrentFrame(String frameNameOrId) {
      if (frameNameOrId == null) {
        currentFrame = "window";
      } else if (isFrameNameOrIdValid(frameNameOrId)) {
        currentFrame += "." + frameNameOrId;
      } else {
        throw new NoSuchFrameException("Frame not found: " + frameNameOrId);
      }
      Log.d(LOG_TAG, "New frame context is: " + currentFrame);
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
  }

  public Navigation navigate() {
    return new AndroidNavigation(this);
  }
  
  public boolean isJavascriptEnabled() {
    return true;
  }

  public Object executeScript(String script, Object... args) {
    String jsFunction = embedScriptInJsFunction(script, args);
    executeJavascriptInWebView(jsFunction);
    
    // jsResult is updated by the intent receiver when the JS result is ready. 
    Object res = checkResultAndConvert(jsResult);
    Log.d(LOG_TAG, String.format("executeScript Converted result from %s, to %s.", jsResult, res));
    return res;
  }

  private String embedScriptInJsFunction(String script, Object... args) {
    String funcName = "func_" + System.currentTimeMillis();
    String objName = "obj_" + System.currentTimeMillis();
    StringBuilder jsFunction = new StringBuilder();
    jsFunction.append(" try {");
    // Android 1.6 does not support JSON
    jsFunction.append(jsonLibrary);
    // call
    StringBuilder toExecute = new StringBuilder();
    toExecute.append(" var ")
        .append(objName)
        .append("=(function(){")
        .append(script)
        .append("})(");
    for (int i = 0; i < args.length; i++) {
      toExecute.append(JsUtil.convertArgumentToJsObject(args[i])).append(
          (i == args.length - 1) ? "" : ",");
    }
    toExecute.append("); ");

    // TODO(berrada): Extract this as an atom
    toExecute.append("if (")
        .append(objName)
        .append(" instanceof HTMLElement) {")
         // TODO(kuzmin): try to move it to JavascriptDocAccessor
        .append(JavascriptDomAccessor.initCacheJs(currentFrame))
        .append(" var result = []; result.push(" + objName + ");")
        .append(JavascriptDomAccessor.ADD_TO_CACHE)
        .append(objName).append("='")
        .append(WEBELEMENT_TYPE)
        .append("'+indices;")
        .append("}");

    toExecute.append("else {")
        .append(objName)
        .append("='{" + TYPE + ":'+androiddriver_str98234('', {'':")
        .append(objName).append("})+'}'; ")
        .append("}");

    // Callback to get the result passed from JS to Java
    toExecute.append("window.webdriver.resultMethod(").append(objName).append(");");

    Log.d(LOG_TAG, "executeScript executing: " + toExecute);
    jsFunction.append(toExecute);

    // Delete JSON functions
    jsFunction.append(" delete androiddriver_quote98234; delete androiddriver_str98234;");

    // Catch errors
    jsFunction.append("}catch(err){window.webdriver.resultMethod('" + ERROR + "'+err);}");
    return jsFunction.toString();
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
    jsResult = NOT_DONE_INDICATOR;
    timer.start();
    sendIntent(Action.EXECUTE_JAVASCRIPT, args);
    
    FutureExecutor.executeFuture(new Callable<Void>() {
      public Void call() {
        while (NOT_DONE_INDICATOR.equals(jsResult)) {
          try {
            Thread.sleep(50);
          } catch (InterruptedException e) {
            Log.e(LOG_TAG, "Sleep Interupted while waiting for result. " + e.toString());
          }  // ms
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
        Log.e(LOG_TAG, "checkResultAndConvert JSONException", e);
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
    Log.d(LOG_TAG, "setProxy, host: " + host + " port:" + port);
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
          continue;
        }
        return null;
      }
      
    }, LOADING_TIMEOUT);
  }
  
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    byte[] rawPng = (byte[]) sendIntent(Action.TAKE_SCREENSHOT);
    String base64Png = new Base64Encoder().encode(rawPng);
    return target.convertFromBase64Png(base64Png);
  }
  
  public Object sendIntent(String action, Object... args) {
    resetPageHasLoaded();
    resetPageHasStartedLoading();
    sender.broadcast(getContext(), action, args);
    return FutureExecutor.executeFuture(sender, INTENT_TIMEOUT);
  }

  public Object onReceiveBroadcast(String action, Object... args) {
    Log.e(LOG_TAG, "onBroadcastWithResult handling: " + action);
    if (Action.JAVASCRIPT_RESULT_AVAILABLE.equals(action)) {
      jsResult = (String) args[0];
    } else if (Action.PAGE_LOADED.equals(action)) {
      pageHasLoaded = true;
    } else if (Action.PAGE_STARTED_LOADING.equals(action)) {
      pageHasStartedLoading = true;
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
    return pageHasStartedLoading;
  }
}
