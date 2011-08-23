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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.ByteStreams;
import com.google.common.io.Closeables;

import android.content.Context;

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
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TouchScreen;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.util.SimpleTimer;
import org.openqa.selenium.android.util.XPathInstaller;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.remote.ErrorCodes;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class AndroidDriver implements WebDriver, SearchContext, FindsByTagName, JavascriptExecutor,
    FindsById, FindsByLinkText, FindsByName, FindsByXPath, TakesScreenshot,
    Rotatable, BrowserConnection, HasTouchScreen {

  private static final String ELEMENT_KEY = "ELEMENT";
  private static final String WINDOW_KEY = "WINDOW";
  private static final String STATUS = "status";
  private static final String VALUE = "value";

  private Long asyncScriptTimeout;
  private static Context context;
  private final SimpleTimer timer;
  private final AndroidWebElement element;
  private final Atoms atoms;
  private DomWindow currentWindowOrFrame;
  private long implicitWait = 0;
  private final ActivityController controller;
  // Maps the element ID to the AndroidWebElement
  private Map<String, AndroidWebElement> store;
  private final AndroidTouchScreen touchScreen;
  private final AndroidNavigation navigation;
  private final AndroidOptions options;

  private AndroidWebElement getOrCreateWebElement(String id) {
    if (store.get(id) != null) {
      return store.get(id);
    } else {
      AndroidWebElement toReturn = new AndroidWebElement(this, id);
      store.put(id, toReturn);
      return toReturn;
    }
  }

  public AndroidDriver() {
    store = Maps.newHashMap();
    currentWindowOrFrame = new DomWindow("");
    timer = new SimpleTimer();
    atoms = Atoms.getInstance();
    controller = ActivityController.getInstance();
    store = Maps.newHashMap();
    touchScreen = new AndroidTouchScreen(this);
    navigation = new AndroidNavigation();
    options = new AndroidOptions();
    asyncScriptTimeout = 0L;
    element = getOrCreateWebElement("");

    // Create a new view and delete existing windows.
    controller.newWebView( /*Delete existing windows*/true);
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
      return (WebElement) executeRawScript("(" + atoms.activeElementJs + ")()");
    }

    public WebDriver defaultContent() {
      executeRawScript("(" + atoms.defaultContentJs + ")()");
      return AndroidDriver.this;
    }

    public WebDriver frame(int index) {
      DomWindow window = (DomWindow) executeRawScript(
          "(" + atoms.frameByIndexJs + ")(" + index + ")");
      if (window == null) {
        throw new NoSuchFrameException("Frame with index '" + index + "' does not exists.");
      }
      currentWindowOrFrame = window;
      return AndroidDriver.this;
    }

    public WebDriver frame(String frameNameOrId) {
      DomWindow window = (DomWindow) executeRawScript(
          "(" + atoms.frameByIdOrNameJs + ")('" + frameNameOrId + "')");
      if (window == null) {
        throw new NoSuchFrameException("Frame with ID or name '" + frameNameOrId
            + "' does not exists.");
      }
      currentWindowOrFrame = window;
      return AndroidDriver.this;
    }

    public WebDriver frame(WebElement frameElement) {
      DomWindow window = (DomWindow) executeScript("return arguments[0].contentWindow;",
          ((AndroidWebElement) ((WrapsElement) frameElement).getWrappedElement()));
      if (window == null) {
        throw new NoSuchFrameException("Frame does not exists.");
      }
      currentWindowOrFrame = window;
      return AndroidDriver.this;
    }

    public WebDriver window(String nameOrHandle) {
      controller.switchToWindow(nameOrHandle);
      return AndroidDriver.this;
    }

    public Alert alert() {
       return controller.getAlert();
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
      } else if (args[i] instanceof java.util.Map<?, ?>) {
        java.util.Map<Object, Object> aMap = (java.util.Map<Object, Object>) args[i];
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

  /* package */ void writeTo(String name, String toWrite) {
    try {
      java.io.File f = new java.io.File(android.os.Environment.getExternalStorageDirectory(),
          name);
      java.io.FileWriter w = new java.io.FileWriter(f);
      w.append(toWrite);
      w.flush();
      w.close();
    } catch (java.io.FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }


  private Object executeRawScript(String toExecute) {
    synchronized (controller) {
      String result = null;
      for (int i = 0; i < 7; i++) {
        result = executeJavascriptInWebView("window.webdriver.resultMethod(" + toExecute + ")");
        if (result != null && result.startsWith(XPathInstaller.XPATH_FAILED)) {
          Sleeper.sleepQuietly(50);
        } else {
          break;
        }
      }
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
  }

  public Object executeAtom(String toExecute, boolean installXPath, Object... args) {
    String scriptInWindow =
        "(function(){ " + (installXPath ? XPathInstaller.installXPathJs() : "")
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

  public Object injectJavascript(String toExecute, boolean isAsync, Object... args) {
    String executeScript = atoms.executeScriptJs;
    toExecute = "var win_context; try{win_context= " + getWindowString() + "}catch(e){"
        + "win_context=window;}with(win_context){" + toExecute +"}";
    String wrappedScript =
            "(function(){" + XPathInstaller.installXPathJs()
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

  private java.util.Map<Object, Object> convertJsonObjectToMap(final JSONObject json) {
    java.util.Map<Object, Object> toReturn = Maps.newHashMap();
    for (java.util.Iterator it = json.keys(); it.hasNext();) {
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
        throw new WebDriverException("Error: " + errorMsg);
    }
  }

  public static String getResourceAsString(int id) {
    InputStream is = getContext().getResources().openRawResource(id);
    try {
      return new String(ByteStreams.toByteArray(is));
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      Closeables.closeQuietly(is);
    }
  }

  /**
   * Executes the given Javascript in the WebView and wait until it is done executing. If the
   * Javascript executed returns a value, the later is updated in the class variable jsResult when
   * the event is broadcasted.
   *
   * @param script the Javascript to be executed
   */
  private String executeJavascriptInWebView(String script) {
    synchronized (controller) {
      return controller.executeJavascript(script);
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
    return options;
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
