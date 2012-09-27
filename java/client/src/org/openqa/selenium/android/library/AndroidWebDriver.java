/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.android.library;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Picture;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Environment;
import android.os.Looper;
import android.provider.Settings;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.WebView;
import com.google.common.base.Supplier;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.Closeables;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.HasTouchScreen;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TouchScreen;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.html5.AppCacheStatus;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.remote.ErrorCodes;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

public class AndroidWebDriver implements WebDriver, SearchContext, JavascriptExecutor,
    TakesScreenshot, Rotatable, BrowserConnection, HasTouchScreen,
    WebStorage, LocationContext, LocationListener, ApplicationCache {

  private static final String ELEMENT_KEY = "ELEMENT";
  private static final String WINDOW_KEY = "WINDOW";
  private static final String STATUS = "status";
  private static final String VALUE = "value";

  private AndroidWebElement element;
  private DomWindow currentWindowOrFrame;
  private long implicitWait = 0;

  // Maps the element ID to the AndroidWebElement
  private Map<String, AndroidWebElement> store;
  private AndroidTouchScreen touchScreen;
  private AndroidNavigation navigation;
  private AndroidOptions options;
  private AndroidLocalStorage localStorage;
  private AndroidSessionStorage sessionStorage;
  private AndroidTargetLocator targetLocator;
  private AndroidFindBy findBy;
  private AndroidLogs logs;

  // Use for control redirect, contains the last url loaded (updated after each redirect)
  private volatile String lastUrlLoaded;

  private SessionCookieManager sessionCookieManager;
  private ViewAdapter view;
  private WebDriverViewManager viewManager;
  private final Object syncObject = new Object();
  private volatile boolean pageDoneLoading;
  private NetworkStateHandler networkHandler;
  private Activity activity;
  private volatile boolean editAreaHasFocus;

  private volatile String result;
  private volatile boolean resultReady;

  // Timeouts in milliseconds
  private static final long LOADING_TIMEOUT = 30000L;
  private static final long START_LOADING_TIMEOUT = 700L;
  static final long RESPONSE_TIMEOUT = 10000L;
  private static final long FOCUS_TIMEOUT = 1000L;
  private static final long POLLING_INTERVAL = 50L;
  static final long UI_TIMEOUT = 3000L;

  private boolean acceptSslCerts;
  private volatile boolean pageStartedLoading;
  private boolean done = false;

  private Supplier<LocationManager> locManagerSupplier;
  private String locationProvider;

  private JavascriptResultNotifier notifier = new JavascriptResultNotifier() {
     public void notifyResultReady(String updated) {
      synchronized (syncObject) {
        result = updated;
        resultReady = true;
        syncObject.notify();
      }
    }
  };

  private AndroidWebElement getOrCreateWebElement(String id) {
    if (store.get(id) != null) {
      return store.get(id);
    } else {
      AndroidWebElement toReturn = new AndroidWebElement(this, id);
      store.put(id, toReturn);
      return toReturn;
    }
  }

  public void setAcceptSslCerts(boolean accept) {
    acceptSslCerts = accept;
  }

  public boolean getAcceptSslCerts() {
    return acceptSslCerts;
  }

  private void initDriverState() {
    store = Maps.newHashMap();
    findBy = new AndroidFindBy();
    currentWindowOrFrame = new DomWindow("");
    store = Maps.newHashMap();
    touchScreen = new AndroidTouchScreen(this);
    navigation = new AndroidNavigation();
    options = new AndroidOptions();
    element = getOrCreateWebElement("");
    localStorage = new AndroidLocalStorage(this);
    sessionStorage = new AndroidSessionStorage(this);
    targetLocator = new AndroidTargetLocator();
    viewManager = new WebDriverViewManager();
    logs = new AndroidLogs();

    Looper.prepare();
    try {
      locationProvider = LocationManager.GPS_PROVIDER;
      final LocationManager locManager =
          (LocationManager)activity.getSystemService(Context.LOCATION_SERVICE);
      locManagerSupplier = new Supplier<LocationManager>() {
        public LocationManager get() {
          return locManager;
          }
      };
      locManager.addTestProvider(locationProvider,
          true, true, true, true, true, true, true, 0, 5);
      locManager.setTestProviderEnabled(locationProvider, true);
      locManager.requestLocationUpdates(locationProvider, 0, 0, this);
    } catch (SecurityException e) {
      // Devices require manually setting up to allow location, 99% of tests don't need location,
      // ignore the relevant exception here
      locManagerSupplier = new Supplier<LocationManager>() {
        public LocationManager get() {
          throw new IllegalStateException(
            "The permission to ALLOW_MOCK_LOCATION needs to be set on your android device, " +
            "but currently is not. Cannot perform location actions without this permission.");
        }
      };
    }
  }

  private void initCookiesState() {
    // Needs to be called before CookieMAnager::getInstance()
    CookieSyncManager.createInstance(activity);
    sessionCookieManager = new SessionCookieManager();
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.removeAllCookie();
  }

  /**
   * Use this contructor to use WebDriver with a WebView that has the same settings as
   * the Android browser.
   *
   * @param activity the activity context where the WebView will be created.
   */
  public AndroidWebDriver(Activity activity) {
    this.activity = activity;
    initDriverState();
    ChromeClientWrapper chromeWrapper = new ChromeClientWrapper("android.webkit.WebChromeClient",
        new DefaultChromeClient());
    ViewClientWrapper viewClientWrapper = new ViewClientWrapper("android.webkit.WebViewClient",
        new DefaultViewClient());
    WebDriverView wdview = new WebDriverView(this, new DefaultWebViewFactory(),
        viewClientWrapper, chromeWrapper, null);
    // Create a new view and delete existing windows.
    newWebView( /*Delete existing windows*/true, wdview);
    initCookiesState();
    networkHandler = new NetworkStateHandler(activity, view);
  }

  /**
   * Use this constructor to use WebDriver with a custom view.
   *
   * @param activity the activity context where the view will be displayed.
   * @param viewFactory a implementation of the ViewFactory interface. WebDriver will
   *     use this creation mechanism to create views when needed (e.g. when clicking on a link
   *     that opens a new window).
   * @param viewClient the ViewClientWrapper used by the custom WebView.
   * @param chromeClient the ChromeClientWrapper used by the custom WebView.
   */
  public AndroidWebDriver(Activity activity, ViewFactory viewFactory,
      ViewClientWrapper viewClient, ChromeClientWrapper chromeClient) {
    this.activity = activity;
    initDriverState();
    WebDriverView wdview = new WebDriverView(this, viewFactory, viewClient, chromeClient,
        null);
    newWebView(/*Delete existing windows*/true, wdview);
    initCookiesState();
    networkHandler = new NetworkStateHandler(activity, view);
  }

  /**
   * Use this constructor to use WebDriver with a custom view and a custom
   * View.OnFocusChangeListener for that view..
   *
   * @param activity the activity context where the view will be displayed.
   * @param viewFactory a implementation of the ViewFactory interface. WebDriver will
   *     use this creation mechanism to create views when needed (e.g. when clicking on a link
   *     that opens a new window).
   * @param viewClient the ViewClientWrapper used by the custom WebView.
   * @param chromeClient the ChromeClientWrapper used by the custom WebView.
   * @param focusListener the listener used by the view that will be created by the viewFactory.
   */
  public AndroidWebDriver(Activity activity, ViewFactory viewFactory,
      ViewClientWrapper viewClient, ChromeClientWrapper chromeClient,
      View.OnFocusChangeListener focusListener) {
    this.activity = activity;
    initDriverState();
    WebDriverView wdview = new WebDriverView(this, viewFactory, viewClient, chromeClient,
        focusListener);
    newWebView(/*Delete existing windows*/true, wdview);
    initCookiesState();
    networkHandler = new NetworkStateHandler(activity, view);
  }

   String getLastUrlLoaded() {
    return lastUrlLoaded;
  }

   void setLastUrlLoaded(String url) {
    this.lastUrlLoaded = url;
  }

   void setEditAreaHasFocus(boolean focused) {
    editAreaHasFocus = focused;
  }

   boolean getEditAreaHasFocus() {
    return editAreaHasFocus;
  }

   void resetPageIsLoading() {
    pageStartedLoading = false;
    pageDoneLoading = false;
  }

   void notifyPageStartedLoading() {
    synchronized (syncObject) {
      pageStartedLoading = true;
      pageDoneLoading = false;
      syncObject.notify();
    }
  }

   void notifyPageDoneLoading() {
    synchronized (syncObject) {
      pageDoneLoading = true;
      syncObject.notify();
    }
  }

   void waitForPageToLoad() {
    synchronized (syncObject) {
      long timeout = System.currentTimeMillis() + START_LOADING_TIMEOUT;
      while (!pageStartedLoading && (System.currentTimeMillis() < timeout)) {
        try {
          syncObject.wait(POLLING_INTERVAL);
        } catch (InterruptedException e) {
          throw new RuntimeException();
        }
      }

      long end = System.currentTimeMillis() + LOADING_TIMEOUT;
      while (!pageDoneLoading && pageStartedLoading && (System.currentTimeMillis() < end)) {
        try {
          syncObject.wait(LOADING_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
    }
  }

   void waitUntilEditAreaHasFocus() {
     long timeout = System.currentTimeMillis() + FOCUS_TIMEOUT;
     while (!editAreaHasFocus && (System.currentTimeMillis() < timeout)) {
       try {
         Thread.sleep(POLLING_INTERVAL);
       } catch (InterruptedException e) {
         throw new RuntimeException(e);
       }
     }
  }
  
  public WebView getWebView() {
    if (view.getUnderlyingView() instanceof WebView) {
      return (WebView) view.getUnderlyingView();
    }
    throw new WebDriverException("This WebDriver instance is not using a WebView!");
  }

  public Object getView() {
    return view.getUnderlyingView();
  }

  void newWebView(boolean newDriver, final WebDriverView wdview) {
    // If we are requesting a new driver, then close all
    // existing window before opening a new one.
    if (newDriver) {
      quit();
    }
    long start = System.currentTimeMillis();
    long end = start + UI_TIMEOUT;
    done = false;
    activity.runOnUiThread(new Runnable() {
      public void run() {
        synchronized (syncObject) {
          final ViewAdapter newView = wdview.create();
          view = newView;
          viewManager.addView(view);
          activity.setContentView((View) view.getUnderlyingView());
          done = true;
          syncObject.notify();
        }
      }
    });
    waitForDone(end, UI_TIMEOUT, "Failed to create WebView.");
  }

  private void waitForDone(long end, long timeout, String error) {
    synchronized (syncObject) {
      while (!done && System.currentTimeMillis() < end) {
        try {
          syncObject.wait(timeout);
        } catch (InterruptedException e) {
          throw new WebDriverException(error, e);
        }
      }
    }
  }

   WebDriverViewManager getViewManager() {
    return viewManager;
  }

  public Activity getActivity() {
    return activity;
  }

  public String getCurrentUrl() {
    if (view == null) {
      throw new WebDriverException("No open windows.");
    }
    done = false;

    long end = System.currentTimeMillis() + UI_TIMEOUT;
    final String[] url = new String[1];
    activity.runOnUiThread(new Runnable() {
      public void run() {
        synchronized (syncObject) {
          url[0] = view.getUrl();
          done = true;
          syncObject.notify();
        }
      }
    });
    waitForDone(end, UI_TIMEOUT, "Failed to get current url.");
    return url[0];
  }

  public String getTitle() {
    if (view == null) {
      throw new WebDriverException("No open windows.");
    }
    long end = System.currentTimeMillis() + UI_TIMEOUT;
    final String[] title = new String[1];
    done = false;
    activity.runOnUiThread(new Runnable() {
      public void run() {
        synchronized (syncObject) {
          title[0] = view.getTitle();
          done = true;
          syncObject.notify();
        }
      }
    });
    waitForDone(end, UI_TIMEOUT, "Failed to get title");
    return title[0];
  }

  public void get(String url) {
    navigation.to(url);
  }

  public String getPageSource() {
    return (String) executeScript(
        "return (new XMLSerializer()).serializeToString(document.documentElement);");
  }

  public void close() {
    if (view == null) {
      throw new WebDriverException("No open windows.");
    }

    // Dispose of existing alerts (if any) for this view.
    AlertManager.removeAlertForView(view);

    done = false;
    long end = System.currentTimeMillis() + RESPONSE_TIMEOUT;
    activity.runOnUiThread(new Runnable() {
      public void run() {
        synchronized (syncObject) {
          view.destroy();
          viewManager.removeView(view);
          done = true;
          syncObject.notify();
        }
      }
    });
    waitForDone(end, RESPONSE_TIMEOUT, "Failed to close window.");
    view = null;
  }

  public void quit() {
    AlertManager.removeAllAlerts();
    activity.runOnUiThread(new Runnable() {
      public void run() {
        viewManager.closeAll();
        view = null;
      }
    });
  }

  public WebElement findElement(By by) {
    long start = System.currentTimeMillis();
    while (true) {
      try {
        return by.findElement(findBy);
      } catch (NoSuchElementException e) {
        if (System.currentTimeMillis() - start > implicitWait) {
          throw e;
        }
        sleepQuietly(100);
      }
    }
  }

  public List<WebElement> findElements(By by) {
    long start = System.currentTimeMillis();
    List<WebElement> found = by.findElements(findBy);
    while (found.isEmpty() && (System.currentTimeMillis() - start <= implicitWait)) {
      sleepQuietly(100);
      found = by.findElements(findBy);
    }
    return found;
  }

    public AppCacheStatus getStatus() {
      Long scriptRes = (Long) executeRawScript("(" + AndroidAtoms.GET_APPCACHE_STATUS.getValue() + ")()");
      return AppCacheStatus.getEnum(scriptRes.intValue());
    }

    private class AndroidFindBy implements SearchContext, FindsByTagName, FindsById,
      FindsByLinkText, FindsByName, FindsByXPath, FindsByCssSelector, FindsByClassName {

    public WebElement findElement(By by) {
      long start = System.currentTimeMillis();
      while (true) {
        try {
          return by.findElement(findBy);
        } catch (NoSuchElementException e) {
          if (System.currentTimeMillis() - start > implicitWait) {
            throw e;
          }
          sleepQuietly(100);
        }
      }
    }

    public List<WebElement> findElements(By by) {
      long start = System.currentTimeMillis();
      List<WebElement> found = by.findElements(findBy);
      while (found.isEmpty() && (System.currentTimeMillis() - start <= implicitWait)) {
        sleepQuietly(100);
        found = by.findElements(this);
      }
      return found;
    }

    public WebElement findElementByLinkText(String using) {
      return element.getFinder().findElementByLinkText(using);
    }

    public List<WebElement> findElementsByLinkText(String using) {
      return element.getFinder().findElementsByLinkText(using);
    }

    public WebElement findElementById(String id) {
      return element.getFinder().findElementById(id);
    }

    public List<WebElement> findElementsById(String id) {
      return findElementsByXPath("//*[@id='" + id + "']");
    }

    public WebElement findElementByName(String using) {
      return element.getFinder().findElementByName(using);
    }

    public List<WebElement> findElementsByName(String using) {
      return element.getFinder().findElementsByName(using);
    }

    public WebElement findElementByTagName(String using) {
      return element.getFinder().findElementByTagName(using);
    }

    public List<WebElement> findElementsByTagName(String using) {
      return element.getFinder().findElementsByTagName(using);
    }

    public WebElement findElementByXPath(String using) {
      return element.getFinder().findElementByXPath(using);
    }

    public List<WebElement> findElementsByXPath(String using) {
      return element.getFinder().findElementsByXPath(using);
    }

    public WebElement findElementByPartialLinkText(String using) {
      return element.getFinder().findElementByPartialLinkText(using);
    }

    public List<WebElement> findElementsByPartialLinkText(String using) {
      return element.getFinder().findElementsByPartialLinkText(using);
    }

    public WebElement findElementByCssSelector(String using) {
      return element.getFinder().findElementByCssSelector(using);
    }

    public List<WebElement> findElementsByCssSelector(String using) {
      return element.getFinder().findElementsByCssSelector(using);
    }

    public WebElement findElementByClassName(String using) {
      return element.getFinder().findElementByClassName(using);
    }

    public List<WebElement> findElementsByClassName(String using) {
      return element.getFinder().findElementsByClassName(using);
    }
  }

  private static void sleepQuietly(long ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException cause) {
      Thread.currentThread().interrupt();
      throw new WebDriverException(cause);
    }
  }

   public Set<String> getWindowHandles() {
    return viewManager.getAllHandles();
  }

  public String getWindowHandle() {
    String r = viewManager.getWindowHandle(view);
    if (r == null) {
      throw new WebDriverException("FATAL ERROR HANDLE IS NULL");
    }
    return r;
  }

  public TargetLocator switchTo() {
    return targetLocator;
  }

  public LocalStorage getLocalStorage() {
    return localStorage;
  }

  public SessionStorage getSessionStorage() {
    return sessionStorage;
  }

  private class AndroidTargetLocator implements TargetLocator {

    public WebElement activeElement() {
      return (WebElement) executeRawScript("(" + AndroidAtoms.ACTIVE_ELEMENT.getValue() + ")()");
    }

    public WebDriver defaultContent() {
      executeRawScript("(" + AndroidAtoms.DEFAULT_CONTENT.getValue() + ")()");
      return AndroidWebDriver.this;
    }

    public WebDriver frame(int index) {
      DomWindow window = (DomWindow) executeRawScript(
          "(" + AndroidAtoms.FRAME_BY_INDEX.getValue() + ")(" + index + ")");
      if (window == null) {
        throw new NoSuchFrameException("Frame with index '" + index + "' does not exists.");
      }
      currentWindowOrFrame = window;
      return AndroidWebDriver.this;
    }

    public WebDriver frame(String frameNameOrId) {
      DomWindow window = (DomWindow) executeRawScript(
          "(" + AndroidAtoms.FRAME_BY_ID_OR_NAME.getValue() + ")('" + frameNameOrId + "')");
      if (window == null) {
        throw new NoSuchFrameException("Frame with ID or name '" + frameNameOrId
            + "' does not exists.");
      }
      currentWindowOrFrame = window;
      return AndroidWebDriver.this;
    }

    public WebDriver frame(WebElement frameElement) {
      DomWindow window = (DomWindow) executeScript("return arguments[0].contentWindow;",
          ((AndroidWebElement) ((WrapsElement) frameElement).getWrappedElement()));
      if (window == null) {
        throw new NoSuchFrameException("Frame does not exists.");
      }
      currentWindowOrFrame = window;
      return AndroidWebDriver.this;
    }

    public WebDriver window(final String nameOrHandle) {
      final boolean[] shouldhTrow = new boolean[1];
      shouldhTrow[0] = false;

      done = false;
      long end = System.currentTimeMillis() + RESPONSE_TIMEOUT;
      activity.runOnUiThread(new Runnable() {
        public void run() {
          synchronized (syncObject) {
            ViewAdapter v = viewManager.getView(nameOrHandle);
            if (v != null) {
              view = v;
            } else {
              // Can't throw an exception in the UI thread
              // Or the App crashes
              shouldhTrow[0] = true;
            }
            activity.setContentView((View) view.getUnderlyingView());
            done = true;
            syncObject.notify();
          }
        }
      });
      waitForDone(end, RESPONSE_TIMEOUT, "Failed to switch to window: " + nameOrHandle);
      if (shouldhTrow[0]) {
        throw new NoSuchWindowException(
                "Window '" + nameOrHandle + "' does not exist.");
      }
      return AndroidWebDriver.this;
    }

    public Alert alert() {
      if (view == null) {
        // An alert may have popped up when the window was closed.
        // If there is an alert, just return it.
        throw new WebDriverException("Asked for an alert without a window context. " +
            "switchTo().window(...) first.");
      }

      Alert foundAlert = AlertManager.getAlertForView(view);

      if (foundAlert == null) {
        throw new NoAlertPresentException("No alert in current view.");
      }

      return foundAlert;
    }
  }

  public Navigation navigate() {
    return navigation;
  }

  public boolean isJavascriptEnabled() {
    return true;
  }

  public Object executeScript(String script, Object... args) {
    return injectJavascript(script, false, args);
  }

  public Object executeAsyncScript(String script, Object... args) {
    throw new UnsupportedOperationException("This is feature will be implemented soon!");
  }

  /**
   * Converts the arguments passed to a JavaScript friendly format.
   *
   * @param args The arguments to convert.
   * @return Comma separated Strings containing the arguments.
   */
  private String convertToJsArgs(final Object... args) {
    StringBuilder toReturn = new StringBuilder();
    int length = args.length;
    for (int i = 0; i < length; i++) {
      toReturn.append((i > 0) ? "," : "");
      if (args[i] instanceof List<?>) {
        toReturn.append("[");
        List<Object> aList = (List<Object>) args[i];
        for (int j = 0; j < aList.size(); j++) {
          String comma = ((j == 0) ? "" : ",");
          toReturn.append(comma + convertToJsArgs(aList.get(j)));
        }
        toReturn.append("]");
      } else if (args[i] instanceof Map<?, ?>) {
        Map<Object, Object> aMap = (Map<Object, Object>) args[i];
        String toAdd = "{";
        for (Object key : aMap.keySet()) {
          toAdd += key + ":"
              + convertToJsArgs(aMap.get(key)) + ",";
        }
        toReturn.append(toAdd.substring(0, toAdd.length() - 1) + "}");
      } else if (args[i] instanceof WebElement) {
        // A WebElement is represented in JavaScript by an Object as
        // follow: {"ELEMENT":"id"} where "id" refers to the id
        // of the HTML element in the javascript cache that can
        // be accessed throught bot.inject.cache.getCache_()
        toReturn.append("{\"" + ELEMENT_KEY + "\":\""
            + ((AndroidWebElement) args[i]).getId() + "\"}");
      } else if (args[i] instanceof DomWindow) {
        // A DomWindow is represented in JavaScript by an Object as
        // follow {"WINDOW":"id"} where "id" refers to the id of the
        // DOM window in the cache.
        toReturn.append("{\"" + WINDOW_KEY + "\":\"" + ((DomWindow) args[i]).getKey() + "\"}");
      } else if (args[i] instanceof Number || args[i] instanceof Boolean) {
        toReturn.append(String.valueOf(args[i]));
      } else if (args[i] instanceof String) {
        toReturn.append(escapeAndQuote((String) args[i]));
      } else {
        throw new IllegalArgumentException(
            "Javascript arguments can be "
                + "a Number, a Boolean, a String, a WebElement, "
                + "or a List or a Map of those. Got: "
                + ((args[i] == null) ? "null" : args[i].getClass()
                + ", value: " + args[i].toString()));
      }
    }
    return toReturn.toString();
  }

  /**
   * Wraps the given string into quotes and escape existing quotes and backslashes. "foo" ->
   * "\"foo\"" "foo\"" -> "\"foo\\\"\"" "fo\o" -> "\"fo\\o\""
   *
   * @param toWrap The String to wrap in quotes
   * @return a String wrapping the original String in quotes
   */
  private static String escapeAndQuote(final String toWrap) {
    StringBuilder toReturn = new StringBuilder("\"");
    for (int i = 0; i < toWrap.length(); i++) {
      char c = toWrap.charAt(i);
      if (c == '\"') {
        toReturn.append("\\\"");
      } else if (c == '\\') {
        toReturn.append("\\\\");
      } else {
        toReturn.append(c);
      }
    }
    toReturn.append("\"");
    return toReturn.toString();
  }

  void writeTo(String name, String toWrite) {
    try {
      File f = new File(Environment.getExternalStorageDirectory(),
          name);
      FileWriter w = new FileWriter(f);
      w.append(toWrite);
      w.flush();
      w.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }


  private Object executeRawScript(String toExecute) {
    String result = null;

    result = executeJavascriptInWebView("window.webdriver.resultMethod(" + toExecute + ")");

    if (result == null || "undefined".equals(result)) {
      return null;
    }
    try {
      JSONObject json = new JSONObject(result);
      throwIfError(json);
      Object value = json.get(VALUE);
      return convertJsonToJavaObject(value);
    } catch (JSONException e) {
      throw new RuntimeException("Failed to parse JavaScript result: "
          + result.toString(), e);
    }
  }

   Object executeAtom(String toExecute, Object... args) {
    String scriptInWindow =
        "(function(){ "
            + " var win; try{win=" + getWindowString() + "}catch(e){win=window;}"
            + "with(win){return ("
            + toExecute + ")(" + convertToJsArgs(args) + ")}})()";
    return executeRawScript(scriptInWindow);
  }

  private String getWindowString() {
    String window = "";
    if (!currentWindowOrFrame.getKey().equals("")) {
      window = "document['$wdc_']['" + currentWindowOrFrame.getKey() + "'] ||";
    }
    return (window += "window;");
  }

   Object injectJavascript(String toExecute, boolean isAsync, Object... args) {
    String executeScript = AndroidAtoms.EXECUTE_SCRIPT.getValue();
    toExecute = "var win_context; try{win_context= " + getWindowString() + "}catch(e){"
        + "win_context=window;}with(win_context){" + toExecute + "}";
    String wrappedScript =
        "(function(){"
            + "var win; try{win=" + getWindowString() + "}catch(e){win=window}"
            + "with(win){return (" + executeScript + ")("
            + escapeAndQuote(toExecute) + ", [" + convertToJsArgs(args) + "], true)}})()";
    return executeRawScript(wrappedScript);
  }

  private Object convertJsonToJavaObject(final Object toConvert) {
    try {
      if (toConvert == null
          || toConvert.equals(null)
          || "undefined".equals(toConvert)
          || "null".equals(toConvert)) {
        return null;
      } else if (toConvert instanceof Boolean) {
        return toConvert;
      } else if (toConvert instanceof Double
          || toConvert instanceof Float) {
        return Double.valueOf(String.valueOf(toConvert));
      } else if (toConvert instanceof Integer
          || toConvert instanceof Long) {
        return Long.valueOf(String.valueOf(toConvert));
      } else if (toConvert instanceof JSONArray) { // List
        return convertJsonArrayToList((JSONArray) toConvert);
      } else if (toConvert instanceof JSONObject) { // Map or WebElment
        JSONObject map = (JSONObject) toConvert;
        if (map.opt(ELEMENT_KEY) != null) { // WebElement
          return getOrCreateWebElement((String) map.get(ELEMENT_KEY));
        } else if (map.opt(WINDOW_KEY) != null) { // DomWindow
          return new DomWindow((String) map.get(WINDOW_KEY));
        } else { // Map
          return convertJsonObjectToMap(map);
        }
      } else {
        return toConvert.toString();
      }
    } catch (JSONException e) {
      throw new RuntimeException("Failed to parse JavaScript result: "
          + toConvert.toString(), e);
    }
  }

  private List<Object> convertJsonArrayToList(final JSONArray json) {
    List<Object> toReturn = Lists.newArrayList();
    for (int i = 0; i < json.length(); i++) {
      try {
        toReturn.add(convertJsonToJavaObject(json.get(i)));
      } catch (JSONException e) {
        throw new RuntimeException("Failed to parse JSON: "
            + json.toString(), e);
      }
    }
    return toReturn;
  }

  private Map<Object, Object> convertJsonObjectToMap(final JSONObject json) {
    Map<Object, Object> toReturn = Maps.newHashMap();
    for (Iterator it = json.keys(); it.hasNext();) {
      String key = (String) it.next();
      try {
        Object value = json.get(key);
        toReturn.put(convertJsonToJavaObject(key),
            convertJsonToJavaObject(value));
      } catch (JSONException e) {
        throw new RuntimeException("Failed to parse JSON:"
            + json.toString(), e);
      }
    }
    return toReturn;
  }


  private void throwIfError(final JSONObject jsonObject) {
    int status;
    String errorMsg;
    try {
      status = (Integer) jsonObject.get(STATUS);
      errorMsg = String.valueOf(jsonObject.get(VALUE));
    } catch (JSONException e) {
      throw new RuntimeException("Failed to parse JSON Object: "
          + jsonObject, e);
    }
    switch (status) {
      case ErrorCodes.SUCCESS:
        return;
      case ErrorCodes.NO_SUCH_ELEMENT:
        throw new NoSuchElementException("Could not find "
            + "WebElement.");
      case ErrorCodes.STALE_ELEMENT_REFERENCE:
        throw new StaleElementReferenceException("WebElement is stale.");
      default:
        if (jsonObject.toString().contains("Result of expression 'd.evaluate' [undefined] is"
            + " not a function.")) {
          throw new WebDriverException("You are using a version of Android WebDriver APK"
              + " compatible with ICS SDKs or more recent SDKs. For more info take a look at"
              + " http://code.google.com/p/selenium/wiki/AndroidDriver#Supported_Platforms. Error:"
              + " " + jsonObject.toString());
        }
        throw new WebDriverException("Error: " + errorMsg);
    }
  }

  /**
   * Executes the given Javascript in the WebView and wait until it is done executing. If the
   * Javascript executed returns a value, the later is updated in the class variable jsResult when
   * the event is broadcasted.
   *
   * @param script the Javascript to be executed
   */
  private String executeJavascriptInWebView(final String script) {
    if (view == null) {
      throw new WebDriverException("No open windows.");
    }
    result = null;
    resultReady = false;
    activity.runOnUiThread(new Runnable() {
      public void run() {
        org.openqa.selenium.android.library.JavascriptExecutor.executeJs(
            view, notifier, script);
      }
    });
    long timeout = System.currentTimeMillis() + RESPONSE_TIMEOUT;
    synchronized (syncObject) {
      while (!resultReady && (System.currentTimeMillis() < timeout)) {
        try {
          syncObject.wait(RESPONSE_TIMEOUT);
        } catch (InterruptedException e) {
          throw new WebDriverException(e);
        }
      }
      
      return result;
    }
  }

  protected Object processJsonObject(Object res) throws JSONException {
    if (res instanceof JSONArray) {
      return convertJsonArray2List((JSONArray) res);
    } else if ("undefined".equals(res)) {
      return null;
    }
    return res;
  }

  private List<Object> convertJsonArray2List(JSONArray arr) throws JSONException {
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

  public Options manage() {
    return options;
  }

  private class AndroidOptions implements Options {

    public Logs logs() {
      return logs;
    }

    public void addCookie(Cookie cookie) {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      sessionCookieManager.addCookie(getCurrentUrl(), cookie);
    }

    public void deleteCookieNamed(String name) {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      sessionCookieManager.remove(getCurrentUrl(), name);
    }

    public void deleteCookie(Cookie cookie) {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      sessionCookieManager.remove(getCurrentUrl(), cookie.getName());
    }

    public void deleteAllCookies() {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      sessionCookieManager.removeAllCookies(getCurrentUrl());
    }

    public Set<Cookie> getCookies() {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      return sessionCookieManager.getAllCookies(getCurrentUrl());
    }

    public Cookie getCookieNamed(String name) {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      return sessionCookieManager.getCookie(getCurrentUrl(), name);
    }

    public Timeouts timeouts() {
      return new AndroidTimeouts();
    }

    public ImeHandler ime() {
      throw new UnsupportedOperationException("Not implementing IME input just yet.");
    }

    @Beta
    public Window window() {
      throw new UnsupportedOperationException("Window handling not supported on Android");
    }

  }

  private class AndroidTimeouts implements Timeouts {

    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      implicitWait = TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit);
      return this;
    }

    public Timeouts setScriptTimeout(long time, TimeUnit unit) {
      //asyncScriptTimeout = TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit);
      return this;
    }

    public Timeouts pageLoadTimeout(long time, TimeUnit unit) {
      throw new UnsupportedOperationException("pageLoadTimeout");
    }
  }

  public Location location() {
    android.location.Location loc = locManagerSupplier.get().getLastKnownLocation(locationProvider);
    return new Location(loc.getLatitude(), loc.getLongitude(), loc.getAltitude());
  }

  public void setLocation(Location loc) {
    android.location.Location location =
        new android.location.Location(locationProvider);
    location.setLatitude(loc.getLatitude());
    location.setLongitude(loc.getLongitude());
    location.setAltitude(loc.getAltitude());
    // set the time so it's not ignored!
    location.setTime(System.currentTimeMillis());
    locManagerSupplier.get().setTestProviderLocation(locationProvider, location);
  }

  public void onLocationChanged(android.location.Location location) {
    Logger.log(Level.WARNING, AndroidWebDriver.class.getName(), "onLocationChanged",
        "New location: " + location.toString());
  }

  public void onStatusChanged(String s, int i, Bundle bundle) {
  }

  public void onProviderEnabled(String s) {
  }

  public void onProviderDisabled(String s) {
  }

  private byte[] takeScreenshot() {
    if (view == null) {
      throw new WebDriverException("No open windows.");
    }
    done = false;
    long end = System.currentTimeMillis() + RESPONSE_TIMEOUT;
    final byte[][] rawPng = new byte[1][1];
    activity.runOnUiThread(new Runnable() {
      public void run() {
        synchronized (syncObject) {
          Picture pic = view.capturePicture();
          // Bitmap of the entire document
          Bitmap raw = Bitmap.createBitmap(
              pic.getWidth(),
              pic.getHeight(),
              Bitmap.Config.RGB_565);
          // Drawing on a canvas
          Canvas cv = new Canvas(raw);
          cv.drawPicture(pic);

          ByteArrayOutputStream stream = new ByteArrayOutputStream();
          if (!raw.compress(Bitmap.CompressFormat.PNG, 100, stream)) {
            throw new RuntimeException(
                "Error while compressing screenshot image.");
          }
          try {
            stream.flush();
            stream.close();
          } catch (IOException e) {
            throw new RuntimeException(
                "I/O Error while capturing screenshot: " + e.getMessage());
          } finally {
            Closeables.closeQuietly(stream);
          }
          rawPng[0] = stream.toByteArray();
          done = true;
          syncObject.notify();
        }
      }
    });

    waitForDone(end, RESPONSE_TIMEOUT, "Failed to take screenshot.");
    return rawPng[0];
  }

  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    byte[] rawPng = takeScreenshot();
    String base64Png = new Base64Encoder().encode(rawPng);
    return target.convertFromBase64Png(base64Png);
  }

  public ScreenOrientation getOrientation() {
    int value = activity.getRequestedOrientation();
    if (value == 0) {
      return ScreenOrientation.LANDSCAPE;
    }
    return ScreenOrientation.PORTRAIT;
  }

  public void rotate(ScreenOrientation orientation) {
    activity.setRequestedOrientation(getAndroidScreenOrientation(orientation));
  }

  private int getAndroidScreenOrientation(ScreenOrientation orientation) {
    if (ScreenOrientation.LANDSCAPE.equals(orientation)) {
      return 0;
    }
    return 1;
  }

  public boolean isOnline() {
    return Settings.System.getInt(getActivity().getContentResolver(),
        Settings.System.AIRPLANE_MODE_ON, 0) != 1;
  }

  public void setOnline(boolean online) throws WebDriverException {
    Settings.System.putInt(getActivity().getContentResolver(),
        Settings.System.AIRPLANE_MODE_ON, online ? 0 : 1);

    Intent intent = new Intent(Intent.ACTION_AIRPLANE_MODE_CHANGED);
    intent.putExtra("state", online);
    getActivity().sendBroadcast(intent);
  }

  public TouchScreen getTouch() {
    return touchScreen;
  }

  private class AndroidNavigation implements Navigation {

    public void back() {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      pageDoneLoading = false;
      activity.runOnUiThread(new Runnable() {
        public void run() {
          view.goBack();
        }
      });
      waitForPageLoadToComplete();
    }

    public void forward() {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      pageDoneLoading = false;
      activity.runOnUiThread(new Runnable() {
        public void run() {
          view.goForward();
        }
      });
      waitForPageLoadToComplete();
    }

    public void to(final String url) {
      if (url == null) {
        return;
      }
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      pageDoneLoading = false;
      activity.runOnUiThread(new Runnable() {
        public void run() {
          try {
            view.loadUrl(url);
          } catch (Exception e) {
            // For some dark reason WebView sometimes throws an
            // NPE here.
          }
        }
      });
      waitForPageLoadToComplete();
    }

    public void to(URL url) {
      to(url.toString());
    }

    public void refresh() {
      if (view == null) {
        throw new WebDriverException("No open windows.");
      }
      pageDoneLoading = false;
      activity.runOnUiThread(new Runnable() {
        public void run() {
          view.reload();
        }
      });
      waitForPageLoadToComplete();
    }

    private void waitForPageLoadToComplete() {
      long timeout = System.currentTimeMillis() + LOADING_TIMEOUT;
      synchronized (syncObject) {
      while (!pageDoneLoading && (System.currentTimeMillis() < timeout)) {
        try {
          syncObject.wait(LOADING_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
      }
    }
  }
}
