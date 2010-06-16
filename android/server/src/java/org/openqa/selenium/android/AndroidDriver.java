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

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.android.intents.Action.PAGE_LOADED;
import static org.openqa.selenium.android.intents.Action.PAGE_STARTED_LOADING;
import android.content.Context;
import android.content.IntentFilter;
import android.util.Log;

import com.google.common.collect.Sets;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.jetty.util.IO;
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
import org.openqa.selenium.android.app.R;
import org.openqa.selenium.android.intents.CommandExecutedIntentReceiver;
import org.openqa.selenium.android.intents.CookiesIntent;
import org.openqa.selenium.android.intents.DoActionIntent;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.IntentBroadcasterWithResult;
import org.openqa.selenium.android.intents.NavigateIntent;
import org.openqa.selenium.android.intents.PageLoadedIntentReceiver;
import org.openqa.selenium.android.intents.PageStartedLoadingIntentReceiver;
import org.openqa.selenium.android.intents.SetProxyIntent;
import org.openqa.selenium.android.intents.TakeScreenshotIntent;
import org.openqa.selenium.android.intents.CommandExecutedIntentReceiver.CommandExecutedListener;
import org.openqa.selenium.android.intents.PageLoadedIntentReceiver.PageLoadedListener;
import org.openqa.selenium.android.intents.PageStartedLoadingIntentReceiver.PageStartedLoadingListener;
import org.openqa.selenium.android.sessions.SessionCookieManager;
import org.openqa.selenium.android.sessions.SessionCookieManager.CookieActions;
import org.openqa.selenium.android.util.JsUtil;
import org.openqa.selenium.android.util.SimpleTimer;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;

import java.io.InputStream;
import java.io.Serializable;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class AndroidDriver implements WebDriver, SearchContext, FindsByTagName, JavascriptExecutor,
    FindsById, FindsByLinkText, FindsByName, FindsByXPath,  CommandExecutedListener,
    PageStartedLoadingListener, PageLoadedListener, TakesScreenshot {

  public static final String LOG_TAG = AndroidDriver.class.getName();
  public static final String ERROR = "_ERROR:";  // Prefixes JS result when returning an error
  public static final String TYPE = "_TYPE";  // Prefixes JS result to be converted
  public static final String WEBELEMENT_TYPE = TYPE + "1:"; // Convert to WebElement
  public static final long INTENT_TIMEOUT = 7000L; // in milliseconds
  public static final long LOADING_TIMEOUT = 30000L; // in milliseconds
  public static final long START_LOADING_TIMEOUT = 800L; // in milliseconds

  private static Context context;
  private Object commandResult;
  private final String jsonLibrary;
  private boolean isProxySet;
  private final SimpleTimer timer = new SimpleTimer();
  private CountDownLatch blockUntilPageHasLoaded = new CountDownLatch(1);
  private CountDownLatch blockUntilPageHasStartedLoading = new CountDownLatch(1);
  private CountDownLatch commandExecutionLock;
  private final PageLoadedIntentReceiver pageLoadedReceiver = new PageLoadedIntentReceiver();
  private final CommandExecutedIntentReceiver commandExecutedReceiver =
      new CommandExecutedIntentReceiver();
  private final PageStartedLoadingIntentReceiver pageStartedLoadingReceiver =
      new PageStartedLoadingIntentReceiver();
  private static final String WINDOW_HANDLE = "windowOne";

  public AndroidDriver() {
    Log.e(LOG_TAG, "AndroidDriver constructor: " + getContext().getPackageName());

    // Unfortunately JSON is not natively supported until Android 1.6
    // TODO(berrada): Only do this if we're on <1.6
    InputStream in = null;
    try {
      in = getContext().getResources().openRawResource(R.raw.json);
      jsonLibrary = IO.toString(in);
    } catch (Exception e) {
      throw new WebDriverException("Could not read JSON library.", e);
    } finally {
      IO.close(in);
    }
    try {
      context.registerReceiver(pageLoadedReceiver, new IntentFilter(PAGE_LOADED));
      pageLoadedReceiver.setPageLoadedListener(this);

      context.registerReceiver(pageStartedLoadingReceiver,
          new IntentFilter(PAGE_STARTED_LOADING));
      pageStartedLoadingReceiver.setListener(this);

      context.registerReceiver(commandExecutedReceiver, new IntentFilter(
          Action.COMMAND_EXECUTED));
      commandExecutedReceiver.setListener(this);

    } catch (Exception e) {
      Log.e(LOG_TAG, "Unable to register receiver: " + e.toString() + "\n"
          + Log.getStackTraceString(e));
      quit();
    }
  }

  public String getCurrentUrl() {
    Log.d(LOG_TAG, "getCurrentUrl");
    return sendIntentWithResult(Action.GET_URL);
  }

  public String getTitle() {
    Log.d(LOG_TAG, "getTitle");
    return sendIntentWithResult(Action.GET_TITLE);
  }

  public void get(String url) {
    timer.start();
    boolean navigateOk =
        NavigateIntent.getInstance().broadcastSync(getContext(), url, true);

    if (!navigateOk) {
      String message = "Error navigating to URL: " + url;
      Log.e(LOG_TAG, message);
    }
    try {
      // Waits until the page has finished loaded. When the page is fully
      // loaded in the webview, an intent will be sent to notify that the page
      // load is complete, upon which this is unlocked. If no intent is received
      // this will timeout after 30 seconds
      // TODO(berrada): There's a race condition here.
      resetPageHasLoadedLock();
      awaitPageHasLoaded();
      timer.stop();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
    Log.d(LOG_TAG,
        url + " loaded in " + timer.getInMillis() + " milliseconds.");
  }

  public String getPageSource() {
    Log.d(LOG_TAG, "getPageSource");
    commandExecutionLock = new CountDownLatch(1);

    DoActionIntent.getInstance().broadcast(Action.GET_PAGESOURCE, null, getContext(), null);
    try {
      commandExecutionLock.await(INTENT_TIMEOUT, MILLISECONDS);
    } catch (Exception e) {
      Log.e(LOG_TAG, "getPageSource Exception", e);
    }
    return (String) commandResult;
  }

  public void close() {
    // Delete the current session. Android driver does not support multisessions
    // closing is equivalent to quit().
    Log.d(LOG_TAG, "Close");
    quit();
  }

  public void quit() {
    Log.d(LOG_TAG, "Quitting..");
    if (pageLoadedReceiver != null)
      context.unregisterReceiver(pageLoadedReceiver);
    if (pageStartedLoadingReceiver != null)
      context.unregisterReceiver(pageStartedLoadingReceiver);
    if (commandExecutedReceiver != null)
      context.unregisterReceiver(commandExecutedReceiver);
  }

  public WebElement findElement(By by) {
    Log.d(LOG_TAG, "findElement by: " + by.toString());
    return by.findElement((SearchContext) this);
  }

  public List<WebElement> findElements(By by) {
    Log.d(LOG_TAG, "findElements by: " + by.toString());
    return by.findElements((SearchContext) this);
  }

  public WebElement findElementByLinkText(String using) {
    Log.d(LOG_TAG, "Searching for element by link text: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementByLinkText(using);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    Log.d(LOG_TAG, "Searching for elements by link text: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementsByLinkText(using);
  }

  public WebElement findElementById(String id) {
    Log.d(LOG_TAG, "Searching for element by Id: " + id);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementById(id);
  }

  public List<WebElement> findElementsById(String id) {
    Log.d(LOG_TAG, "Searching for elements by Id: " + id);
    return findElementsByXPath("//*[@id='" + id + "']");
  }

  public WebElement findElementByName(String using) {
    Log.d(LOG_TAG, "Searching for element by name: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementByName(using);
  }

  public List<WebElement> findElementsByName(String using) {
    Log.d(LOG_TAG, "Searching for elements by name: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementsByName(using);
  }

  public WebElement findElementByTagName(String using) {
    Log.d(LOG_TAG, "Searching for element by tag name: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementByTagName(using);
  }

  public List<WebElement> findElementsByTagName(String using) {
    Log.d(LOG_TAG, "Searching for elements by tag name: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementsByTagName(using);
  }

  public WebElement findElementByXPath(String using) {
    Log.d(LOG_TAG, "Searching for element by XPath: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementByXPath(using);
  }

  public List<WebElement> findElementsByXPath(String using) {
    Log.d(LOG_TAG, "Searching for elements by XPath: " + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementsByXPath(using);
  }

  public WebElement findElementByPartialLinkText(String using) {
    Log.d(LOG_TAG, "Searching for element by partial link text: "
        + using);
    AndroidWebElement element = new AndroidWebElement(this);
    return element.findElementByPartialLinkText(using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    Log.d(LOG_TAG, "Searching for elements by partial link text: "
        + using);
    AndroidWebElement element = new AndroidWebElement(this);
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
    // TODO(berrada): This should have an implementation
    return null;
  }

  public Navigation navigate() {
    return new AndroidNavigation();
  }
  
  public boolean isJavascriptEnabled() {
    return true;
  }

  public Object executeScript(String script, Object... args) {
    timer.start();
    commandExecutionLock = new CountDownLatch(1);

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
        .append(JavascriptDomAccessor.INIT_CACHE)
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

    // callback
    toExecute.append("window.webdriver.resultMethod(").append(objName).append(");");

    Log.d(LOG_TAG, "executeScript executing: " + toExecute);
    jsFunction.append(toExecute);

    // delete JSON functions
    jsFunction.append(" delete androiddriver_quote98234; delete androiddriver_str98234;");

    // catch errors
    jsFunction.append("}catch(err){window.webdriver.resultMethod('" + ERROR + "'+err);}");

    String[] intentArgs = {jsFunction.toString()};

    DoActionIntent.getInstance().broadcast(Action.EXECUTE_JAVASCRIPT,
        intentArgs, getContext(), null);
    Log.d(LOG_TAG, "executeScript waiting " + this + " " + commandExecutionLock);

    try {
      commandExecutionLock.await(INTENT_TIMEOUT, MILLISECONDS);
      timer.stop();
    } catch (Exception e) {
      Log.e(LOG_TAG, "executeScript Exception", e);
    }
    Log.d(LOG_TAG, "executeScript executed in " + timer.getInMillis() + " milliseconds.");

    // convert result to java types
    Object res = checkResultAndConvert((String) commandResult);
    Log.d(LOG_TAG, "executeScript Converted result is " + res);
    return res;
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
    SetProxyIntent broadcaster = SetProxyIntent.getInstance();
    broadcaster.broadcast(host, String.valueOf(port), getContext());
    final ExecutorService executor = Executors.newSingleThreadExecutor();
    Future<Boolean> future = executor.submit(broadcaster);
    boolean isProxySet = false;
    try {
      isProxySet = future.get();
    } catch (InterruptedException cause) {
      Thread.currentThread().interrupt();
    } catch (ExecutionException cause) {
      throw new WebDriverException("Future task interupted.", cause.getCause());
    } finally {
      executor.shutdown();
    }
    if (!isProxySet) {
      throw new WebDriverException("Proxy configuration failed!");
    }
  }

  public static void setContext(Context contentContext) {
    context = contentContext;
  }

  public static Context getContext() {
    return context;
  }

  private class AndroidNavigation implements Navigation, PageLoadedListener {

    private CountDownLatch pageLoadedLock = new CountDownLatch(0);
    private PageLoadedIntentReceiver pageLoadedRcv = new PageLoadedIntentReceiver();
    
    public AndroidNavigation() {
      context.registerReceiver(pageLoadedRcv, new IntentFilter(PAGE_LOADED));
      pageLoadedRcv.setPageLoadedListener(this);
    }

    private void doNavigation(String intentName, String description) {
      final CountDownLatch latch = new CountDownLatch(1);
      DoActionIntent.getInstance().broadcast(intentName, null, getContext(),
          new Callback() {
            @Override
            public void stringCallback(String arg0) {
              latch.countDown();
            }
          });
      try {
        latch.await(INTENT_TIMEOUT, MILLISECONDS);
      } catch (InterruptedException cause) {
        throw new WebDriverException("Navigation " + description + " failed. " +
            "Lock was interupted or timed out.", cause);
      }
      pageLoadedLock = new CountDownLatch(1);
      try {
        pageLoadedLock.await(AndroidDriver.LOADING_TIMEOUT, MILLISECONDS);
      } catch (InterruptedException cause) {
        throw new WebDriverException("Navigation " + description + " failed. " +
            "Lock was interupted or timed out.", cause);
      }
    }
    
    public void back() {
      doNavigation(Action.NAVIGATE_BACK, "back");
    }

    public void forward() {
      doNavigation(Action.NAVIGATE_FORWARD, "forward");
    }

    public void refresh() {
      doNavigation(Action.REFRESH, "refresh");
    }

    public void to(String url) {
      get(url);
    }

    public void to(URL url) {
      get(url.toString());
    }
    
    public void onPageLoaded() {
      pageLoadedLock.countDown();
    }
  }

  public Options manage() {
    return new AndroidOptions();
  }

  private class AndroidOptions implements Options {
    
    public void addCookie(Cookie cookie) {
      Map<String, Serializable> args = new HashMap<String, Serializable>();
      args.put(CookiesIntent.NAME_PARAM, cookie.getName());
      args.put(CookiesIntent.VALUE_PARAM, cookie.getValue());
      args.put(CookiesIntent.PATH_PARAM, cookie.getPath());

      CookiesIntent.getInstance().broadcastSync(CookieActions.ADD, args, getContext());
    }

    public void deleteCookieNamed(String name) {
      Map<String, Serializable> args = new HashMap<String, Serializable>();
      args.put(CookiesIntent.NAME_PARAM, name);

      CookiesIntent.getInstance().broadcastSync(CookieActions.REMOVE, args, getContext());
    }

    public void deleteCookie(Cookie cookie) {
      Map<String, Serializable> args = new HashMap<String, Serializable>();
      args.put(CookiesIntent.NAME_PARAM, cookie.getName());
      args.put(CookiesIntent.PATH_PARAM, cookie.getPath());

      CookiesIntent.getInstance().broadcastSync(CookieActions.REMOVE, args, getContext());
    }

    public void deleteAllCookies() {
      CookiesIntent.getInstance().broadcastSync(CookieActions.REMOVE_ALL, null, getContext());
    }

    public Set<Cookie> getCookies() {
      Set<Cookie> cookies = new HashSet<Cookie>();
      String cookieString =
          CookiesIntent.getInstance().broadcastSync(CookieActions.GET_ALL, null, getContext());

      if (cookieString != null) {
        for (String cookie : cookieString.split(SessionCookieManager.COOKIES_SEPARATOR)) {
          String[] cookieValues = cookie.split("=");
          if (cookieValues.length >= 2) {
            cookies.add(new Cookie(cookieValues[0].trim(), cookieValues[1], null, null, null));
          }
        }
      }
      return cookies;
    }

    public Cookie getCookieNamed(String name) {
      Map<String, Serializable> args = new HashMap<String, Serializable>();
      args.put(CookiesIntent.NAME_PARAM, name);

      String cookieValue =
          CookiesIntent.getInstance().broadcastSync(CookieActions.GET, args, getContext());

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
      // TODO(berrada): Implement me! (apparently already done.)
      throw new UnsupportedOperationException("Not Implemented");
    }
  }

  public void onPageLoaded() {
    Log.d(LOG_TAG, "onPageLoaded unlocking.");
    blockUntilPageHasLoaded.countDown();
  }

  public void pageStartedLoading() {
    blockUntilPageHasStartedLoading.countDown();
  }

  public void onCommandExecuted(Object result) {
    if (commandExecutionLock != null && commandExecutionLock.getCount() > 0) {
      commandResult = result;
      commandExecutionLock.countDown();
    } else {
      Log.e(LOG_TAG, "onCommandExecuted failed "
          + result + " " + this + " " + commandExecutionLock);
    }
  }

  public boolean awaitPageHasLoaded() throws InterruptedException {
    return blockUntilPageHasLoaded.await(LOADING_TIMEOUT, MILLISECONDS);
  }

  public boolean awaitPageHasStartedLoading() throws InterruptedException {
    return blockUntilPageHasStartedLoading.await(START_LOADING_TIMEOUT, MILLISECONDS);
  }

  public void resetPageHasLoadedLock() {
    blockUntilPageHasLoaded = new CountDownLatch(1);
  }

  public void resetPageHasStartedLoadingLock() {
    blockUntilPageHasStartedLoading = new CountDownLatch(1);
  }
  
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    class PngHolder {
	    public byte[] rawPng;
    }
    final PngHolder holder = new PngHolder();

    final CountDownLatch lock = new CountDownLatch(1);
    TakeScreenshotIntent.getInstance().broadcast(getContext(), true,
        new Callback() {
          @Override
          public void byteArrayCallback(byte[] arg0) {
            holder.rawPng = arg0;
            lock.countDown();
          }
    });
    try {
      lock.await(INTENT_TIMEOUT, MILLISECONDS);
    } catch (InterruptedException e) {
      Log.e(LOG_TAG, "Error: Lock interupted while waiting for screenshot.");
    }
    String base64Png = new Base64Encoder().encode(holder.rawPng);
    return target.convertFromBase64Png(base64Png);
  }
  
  private String sendIntentWithResult(String action) {
    IntentBroadcasterWithResult broadcaster = IntentBroadcasterWithResult.getInstance();
    broadcaster.broadcast(getContext(), action);
    final ExecutorService executor = Executors.newSingleThreadExecutor();
    Future<String> future = executor.submit(broadcaster);
    String toReturn = null;
    try {
      toReturn = future.get();
    } catch (InterruptedException cause) {
      Thread.currentThread().interrupt();
    } catch (ExecutionException cause) {
      throw new WebDriverException("Future task interupted.", cause.getCause());
    } finally {
      executor.shutdown();
    }
    return toReturn;
  }
}
