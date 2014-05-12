/*
Copyright 2007-2009 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.htmlunit;

import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_FINDING_BY_CSS;

import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.CookieManager;
import com.gargoylesoftware.htmlunit.ElementNotFoundException;
import com.gargoylesoftware.htmlunit.Page;
import com.gargoylesoftware.htmlunit.ProxyConfig;
import com.gargoylesoftware.htmlunit.ScriptResult;
import com.gargoylesoftware.htmlunit.SgmlPage;
import com.gargoylesoftware.htmlunit.StringWebResponse;
import com.gargoylesoftware.htmlunit.TopLevelWindow;
import com.gargoylesoftware.htmlunit.UnexpectedPage;
import com.gargoylesoftware.htmlunit.Version;
import com.gargoylesoftware.htmlunit.WaitingRefreshHandler;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.WebClientOptions;
import com.gargoylesoftware.htmlunit.WebResponse;
import com.gargoylesoftware.htmlunit.WebWindow;
import com.gargoylesoftware.htmlunit.WebWindowEvent;
import com.gargoylesoftware.htmlunit.WebWindowListener;
import com.gargoylesoftware.htmlunit.WebWindowNotFoundException;
import com.gargoylesoftware.htmlunit.html.BaseFrameElement;
import com.gargoylesoftware.htmlunit.html.DomElement;
import com.gargoylesoftware.htmlunit.html.DomNode;
import com.gargoylesoftware.htmlunit.html.DomNodeList;
import com.gargoylesoftware.htmlunit.html.FrameWindow;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlHtml;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.javascript.host.Location;
import com.gargoylesoftware.htmlunit.javascript.host.html.HTMLCollection;
import com.gargoylesoftware.htmlunit.javascript.host.html.HTMLElement;

import net.sourceforge.htmlunit.corejs.javascript.Context;
import net.sourceforge.htmlunit.corejs.javascript.ContextAction;
import net.sourceforge.htmlunit.corejs.javascript.Function;
import net.sourceforge.htmlunit.corejs.javascript.NativeArray;
import net.sourceforge.htmlunit.corejs.javascript.NativeObject;
import net.sourceforge.htmlunit.corejs.javascript.Scriptable;
import net.sourceforge.htmlunit.corejs.javascript.ScriptableObject;
import net.sourceforge.htmlunit.corejs.javascript.Undefined;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionNotFoundException;
import org.w3c.css.sac.CSSException;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

public class HtmlUnitDriver implements WebDriver, JavascriptExecutor,
    FindsById, FindsByLinkText, FindsByXPath, FindsByName, FindsByCssSelector,
    FindsByTagName, FindsByClassName, HasCapabilities, HasInputDevices {

  private WebClient webClient;
  private WebWindow currentWindow;

  // Fictive position just to implement the API
  private Point windowPosition = new Point(0, 0);
  private Dimension initialWindowDimension;

  private boolean enableJavascript;
  private ProxyConfig proxyConfig;
  private long implicitWait = 0;
  private long scriptTimeout = 0;
  private HtmlUnitKeyboard keyboard;
  private HtmlUnitMouse mouse;
  private boolean gotPage;

  public static final String INVALIDXPATHERROR = "The xpath expression '%s' cannot be evaluated";
  public static final String INVALIDSELECTIONERROR =
      "The xpath expression '%s' selected an object of type '%s' instead of a WebElement";

  public HtmlUnitDriver(BrowserVersion version) {
    webClient = createWebClient(version);
    currentWindow = webClient.getCurrentWindow();
    initialWindowDimension = new Dimension(currentWindow.getOuterWidth(), currentWindow.getOuterHeight());

    webClient.addWebWindowListener(new WebWindowListener() {
      public void webWindowOpened(WebWindowEvent webWindowEvent) {
        // Ignore
      }

      public void webWindowContentChanged(WebWindowEvent event) {
        if (event.getWebWindow() != currentWindow) {
          return;
        }

        // Do we need to pick some new default content?
        switchToDefaultContentOfWindow(currentWindow);
      }

      public void webWindowClosed(WebWindowEvent event) {
        // Check if the event window refers to us or one of our parent windows
        // setup the currentWindow appropriately if necessary
        WebWindow curr = currentWindow;
        do {
          // Instance equality is okay in this case
          if (curr == event.getWebWindow()) {
            currentWindow = currentWindow.getTopWindow();
            return;
          }
          curr = curr.getParentWindow();
        } while (curr != currentWindow.getTopWindow());
      }
    });

    // Now put us on the home page, like a real browser
    get(webClient.getOptions().getHomePage());
    gotPage = false;
    resetKeyboardAndMouseState();
  }

  public HtmlUnitDriver() {
    this(false);
  }

  public HtmlUnitDriver(boolean enableJavascript) {
    this(BrowserVersion.getDefault());
    setJavascriptEnabled(enableJavascript);
  }

  /**
   * Note: There are two configuration modes for the HtmlUnitDriver using this constructor. The
   * first is where the browserName is "firefox", "internet explorer" and browserVersion denotes the
   * desired version. The second one is where the browserName is "htmlunit" and the browserVersion
   * denotes the required browser AND its version. In this mode the browserVersion could either be
   * "firefox" for Firefox or "internet explorer-7" for IE 7. The Remote WebDriver uses the second
   * mode - the first mode is deprecated and should not be used.
   */
  public HtmlUnitDriver(Capabilities capabilities) {
    this(determineBrowserVersion(capabilities));

    setJavascriptEnabled(capabilities.isJavascriptEnabled());

    setProxySettings(Proxy.extractFrom(capabilities));
  }

  // Package visibility for testing
  static BrowserVersion determineBrowserVersion(Capabilities capabilities) {
    String browserName = null;
    String browserVersion = null;

    String rawVersion = capabilities.getVersion();
    String[] splitVersion = rawVersion == null ? new String[0] : rawVersion.split("-");
    if (splitVersion.length > 1) {
      browserVersion = splitVersion[1];
      browserName = splitVersion[0];
    } else {
      browserName = capabilities.getVersion();
      browserVersion = "";
    }

    // This is for backwards compatibility - in case there are users who are trying to
    // configure the HtmlUnitDriver by using the c'tor with capabilities.
    if (!BrowserType.HTMLUNIT.equals(capabilities.getBrowserName())) {
      browserName = capabilities.getBrowserName();
      browserVersion = capabilities.getVersion();
    }

    if (BrowserType.FIREFOX.equals(browserName)) {
      return BrowserVersion.FIREFOX_17;
    }

    if (BrowserType.CHROME.equals(browserName)) {
      return BrowserVersion.CHROME;
    }

    if (BrowserType.IE.equals(browserName)) {
      // Try and convert the version
      try {
        int version = Integer.parseInt(browserVersion);
        switch (version) {
          case 8:
            return BrowserVersion.INTERNET_EXPLORER_8;
          case 9:
            return BrowserVersion.INTERNET_EXPLORER_9;
          default:
            return BrowserVersion.INTERNET_EXPLORER_11;
        }
      } catch (NumberFormatException e) {
        return BrowserVersion.INTERNET_EXPLORER_11;
      }
    }

    return BrowserVersion.getDefault();
  }

  private WebClient createWebClient(BrowserVersion version) {
    WebClient client = newWebClient(version);
    WebClientOptions options = client.getOptions();
    options.setHomePage(WebClient.URL_ABOUT_BLANK.toString());
    options.setThrowExceptionOnFailingStatusCode(false);
    options.setPrintContentOnFailingStatusCode(false);
    options.setJavaScriptEnabled(enableJavascript);
    options.setRedirectEnabled(true);
    options.setUseInsecureSSL(true);

    // Ensure that we've set the proxy if necessary
    if (proxyConfig != null) {
      options.setProxyConfig(proxyConfig);
    }

    client.setRefreshHandler(new WaitingRefreshHandler());

    return modifyWebClient(client);
  }

  /**
   * Create the underlying webclient, but don't set any fields on it.
   * 
   * @param version Which browser to emulate
   * @return a new instance of WebClient.
   */
  protected WebClient newWebClient(BrowserVersion version) {
    return new WebClient(version);
  }

  /**
   * Child classes can override this method to customise the webclient that the HtmlUnit driver
   * uses.
   * 
   * @param client The client to modify
   * @return The modified client
   */
  protected WebClient modifyWebClient(WebClient client) {
    // Does nothing here to be overridden.
    return client;
  }

  /**
   * Set proxy for WebClient using Proxy.
   *
   * @param proxy The proxy preferences.
   */
  public void setProxySettings(Proxy proxy) {
    if (proxy == null || proxy.getProxyType() == Proxy.ProxyType.UNSPECIFIED) {
      return;
    }

    switch (proxy.getProxyType()) {
      case MANUAL:

        ArrayList<String> noProxyHosts = new ArrayList<String>();
        String noProxy = proxy.getNoProxy();
        if (noProxy != null && !noProxy.equals("")) {
          String[] hosts = noProxy.split(",");
          for (int i = 0; i < hosts.length; i++) {
            if (hosts[i].trim().length() > 0) {
              noProxyHosts.add(hosts[i].trim());
            }
          }
        }

        String httpProxy = proxy.getHttpProxy();
        if (httpProxy != null && !httpProxy.equals("")) {
          String host = httpProxy;
          int port = 0;

          int index = httpProxy.indexOf(":");
          if (index != -1) {
            host = httpProxy.substring(0, index);
            port = Integer.parseInt(httpProxy.substring(index + 1));
          }

          setHTTPProxy(host, port, noProxyHosts);
        }

        String socksProxy = proxy.getSocksProxy();
        if (socksProxy != null && !socksProxy.equals("")) {
          String host = socksProxy;
          int port = 0;

          int index = socksProxy.indexOf(":");
          if (index != -1) {
            host = socksProxy.substring(0, index);
            port = Integer.parseInt(socksProxy.substring(index + 1));
          }

          setSocksProxy(host, port, noProxyHosts);
        }

        // sslProxy is not supported/implemented
        // ftpProxy is not supported/implemented

        break;
      case PAC:
        String pac = proxy.getProxyAutoconfigUrl();
        if (pac != null && !pac.equals("")) {
          setAutoProxy(pac);
        }
        break;
    }
  }

  /**
   * Sets HTTP proxy for WebClient
   *
   * @param host The hostname of HTTP proxy
   * @param port The port of HTTP proxy, 0 means HTTP proxy w/o port
   */
  public void setProxy(String host, int port) {
    setHTTPProxy(host, port, null);
  }

  /**
   * Sets HTTP proxy for WebClient with bypass proxy hosts
   *
   * @param host The hostname of HTTP proxy
   * @param port The port of HTTP proxy, 0 means HTTP proxy w/o port
   * @param noProxyHosts The list of hosts which need to bypass HTTP proxy
   */
  public void setHTTPProxy(String host, int port, ArrayList<String> noProxyHosts) {
    proxyConfig = new ProxyConfig();
    proxyConfig.setProxyHost(host);
    proxyConfig.setProxyPort(port);
    if (noProxyHosts != null && noProxyHosts.size() > 0) {
      for (String noProxyHost : noProxyHosts) {
        proxyConfig.addHostsToProxyBypass(noProxyHost);
      }
    }
    getWebClient().getOptions().setProxyConfig(proxyConfig);
  }

  /**
   * Sets SOCKS proxy for WebClient
   *
   * @param host The hostname of SOCKS proxy
   * @param port The port of SOCKS proxy, 0 means HTTP proxy w/o port
   */
  public void setSocksProxy(String host, int port) {
    setSocksProxy(host, port, null);
  }

  /**
   * Sets SOCKS proxy for WebClient with bypass proxy hosts
   *
   * @param host The hostname of SOCKS proxy
   * @param port The port of SOCKS proxy, 0 means HTTP proxy w/o port
   * @param noProxyHosts The list of hosts which need to bypass SOCKS proxy
   */
  public void setSocksProxy(String host, int port, ArrayList<String> noProxyHosts) {
    proxyConfig = new ProxyConfig();
    proxyConfig.setProxyHost(host);
    proxyConfig.setProxyPort(port);
    proxyConfig.setSocksProxy(true);
    if (noProxyHosts != null && noProxyHosts.size() > 0) {
      for (String noProxyHost : noProxyHosts) {
        proxyConfig.addHostsToProxyBypass(noProxyHost);
      }
    }
    getWebClient().getOptions().setProxyConfig(proxyConfig);
  }

  /**
   * Sets Proxy Autoconfiguration URL for WebClient
   *
   * @param autoProxyUrl The Proxy Autoconfiguration URL
   */
  public void setAutoProxy(String autoProxyUrl) {
    proxyConfig = new ProxyConfig();
    proxyConfig.setProxyAutoConfigUrl(autoProxyUrl);
    getWebClient().getOptions().setProxyConfig(proxyConfig);
  }

  public Capabilities getCapabilities() {
    DesiredCapabilities capabilities = DesiredCapabilities.htmlUnit();

    capabilities.setPlatform(Platform.getCurrent());
    capabilities.setJavascriptEnabled(isJavascriptEnabled());
    capabilities.setVersion(Version.getProductVersion());
    capabilities.setCapability(SUPPORTS_FINDING_BY_CSS, true);

    return capabilities;
  }

  public void get(String url) {
    // Prevent the malformed url exception.
    if (WebClient.URL_ABOUT_BLANK.toString().equals(url)) {
      get(WebClient.URL_ABOUT_BLANK);
      return;
    }

    URL fullUrl;
    try {
      fullUrl = new URL(url);
    } catch (Exception e) {
      throw new WebDriverException(e);
    }

    get(fullUrl);
  }

  /**
   * Allows HtmlUnit's about:blank to be loaded in the constructor, and may be useful for other
   * tests?
   * 
   * @param fullUrl The URL to visit
   */
  protected void get(URL fullUrl) {
    try {
      getWebClient().getPage(fullUrl);
      // A "get" works over the entire page
      currentWindow = getCurrentWindow().getTopWindow();
    } catch (UnknownHostException e) {
      getCurrentWindow().getTopWindow().setEnclosedPage(new UnexpectedPage(
          new StringWebResponse("Unknown host", fullUrl),
          getCurrentWindow().getTopWindow()
      ));
    } catch (ConnectException e) {
      // This might be expected
    } catch (SocketTimeoutException e) {
      throw new TimeoutException(e);
    } catch (Exception e) {
      throw new WebDriverException(e);
    }

    gotPage = true;
    pickWindow();
    resetKeyboardAndMouseState();
  }

  private void resetKeyboardAndMouseState() {
    keyboard = new HtmlUnitKeyboard(this);
    mouse = new HtmlUnitMouse(this, keyboard);
  }

  protected void pickWindow() {
    // TODO(simon): HtmlUnit tries to track the current window as the frontmost. We don't
    if (currentWindow == null) {
      currentWindow = getWebClient().getCurrentWindow();
    }
  }

  public String getCurrentUrl() {
    // TODO(simon): Blech. I can see this being baaad
    URL url = getRawUrl();
    if (url == null) {
      return null;
    }

    return url.toString();
  }

  public String getTitle() {
    Page page = lastPage();
    if (page == null || !(page instanceof HtmlPage)) {
      return null; // no page so there is no title
    }
    if (getCurrentWindow() instanceof FrameWindow) {
      page = ((FrameWindow) getCurrentWindow()).getTopWindow().getEnclosedPage();
    }

    return ((HtmlPage) page).getTitleText();
  }

  public WebElement findElement(By by) {
    return findElement(by, this);
  }

  public List<WebElement> findElements(By by) {
    return findElements(by, this);
  }

  public String getPageSource() {
    Page page = lastPage();
    if (page == null) {
      return null;
    }

    if (page instanceof SgmlPage) {
      return ((SgmlPage) page).asXml();
    }
    WebResponse response = page.getWebResponse();
    return response.getContentAsString();
  }

  public void close() {
    getWebClient(); // check that session is active
    WebWindow thisWindow = getCurrentWindow(); // check that the current window is active
    if (getWebClient().getWebWindows().size() == 1) {
      // closing the last window is equivalent to quit
      quit();

    } else {
      if (thisWindow != null) {
        ((TopLevelWindow) thisWindow.getTopWindow()).close();
      }
      if (getWebClient().getWebWindows().size() == 0) {
        quit();
      }
    }
  }

  public void quit() {
    if (webClient != null) {
      webClient.closeAllWindows();
      webClient = null;
    }
    currentWindow = null;
  }

  public Set<String> getWindowHandles() {
    final Set<String> allHandles = Sets.newHashSet();
    for (final WebWindow window : getWebClient().getTopLevelWindows()) {
      allHandles.add(String.valueOf(System.identityHashCode(window)));
    }

    return allHandles;
  }

  public String getWindowHandle() {
    WebWindow topWindow = getCurrentWindow().getTopWindow();
    if (topWindow.isClosed()) {
      throw new NoSuchWindowException("Window is closed");
    }
    return String.valueOf(System.identityHashCode(topWindow));
  }

  public Object executeScript(String script, final Object... args) {
    HtmlPage page = getPageToInjectScriptInto();

    script = "function() {" + script + "\n};";
    ScriptResult result = page.executeJavaScript(script);
    Function func = (Function) result.getJavaScriptResult();

    Object[] parameters = convertScriptArgs(page, args);

    try {
      result = page.executeJavaScriptFunctionIfPossible(
          func,
          (ScriptableObject) getCurrentWindow().getScriptObject(),
          parameters,
          page.getDocumentElement());
    } catch (Throwable ex) {
      throw new WebDriverException(ex);
    }

    return parseNativeJavascriptResult(result);
  }

  public Object executeAsyncScript(String script, Object... args) {
    HtmlPage page = getPageToInjectScriptInto();
    args = convertScriptArgs(page, args);

    Object result = new AsyncScriptExecutor(page, scriptTimeout)
        .execute(script, args);

    return parseNativeJavascriptResult(result);
  }
  
  private Object[] convertScriptArgs(HtmlPage page, final Object[] args) {
    final Scriptable scope = (Scriptable) page.getEnclosingWindow().getScriptObject();

    final Object[] parameters = new Object[args.length];
    final ContextAction action = new ContextAction() {
      public Object run(final Context context) {
        for (int i = 0; i < args.length; i++) {
          parameters[i] = parseArgumentIntoJavascriptParameter(context, scope, args[i]);
        }
        return null;
      }
    };
    getWebClient().getJavaScriptEngine().getContextFactory().call(action);
    return parameters;
  }

  private HtmlPage getPageToInjectScriptInto() {
    if (!isJavascriptEnabled()) {
      throw new UnsupportedOperationException(
          "Javascript is not enabled for this HtmlUnitDriver instance");
    }

    final Page lastPage = lastPage();
    if (!(lastPage instanceof HtmlPage)) {
      throw new UnsupportedOperationException("Cannot execute JS against a plain text page");
    } else if (!gotPage) {
      // just to make ExecutingJavascriptTest.testShouldThrowExceptionIfExecutingOnNoPage happy
      // but does this limitation make sense?
      throw new WebDriverException("Can't execute JavaScript before a page has been loaded!");
    }

    return (HtmlPage) lastPage;
  }

  private Object parseArgumentIntoJavascriptParameter(
      Context context, Scriptable scope, Object arg) {
    while (arg instanceof WrapsElement) {
      arg = ((WrapsElement) arg).getWrappedElement();
    }
    
    if (!(arg instanceof HtmlUnitWebElement ||
        arg instanceof HtmlElement || // special case the underlying type
        arg instanceof Number ||
        arg instanceof String ||
        arg instanceof Boolean ||
        arg.getClass().isArray() ||
        arg instanceof Collection<?> ||
        arg instanceof Map<?, ?>)) {
      throw new IllegalArgumentException(
          "Argument must be a string, number, boolean or WebElement: " +
              arg + " (" + arg.getClass() + ")");
    }

    if (arg instanceof HtmlUnitWebElement) {
      HtmlUnitWebElement webElement = (HtmlUnitWebElement) arg;
      assertElementNotStale(webElement.getElement());
      return webElement.getElement().getScriptObject();

    } else if (arg instanceof HtmlElement) {
      HtmlElement element = (HtmlElement) arg;
      assertElementNotStale(element);
      return element.getScriptObject();

    } else if (arg instanceof Collection<?>) {
      List<Object> list = new ArrayList<Object>();
      for (Object o : (Collection<?>) arg) {
        list.add(parseArgumentIntoJavascriptParameter(context, scope, o));
      }
      return context.newArray(scope, list.toArray());

    } else if (arg.getClass().isArray()) {
      List<Object> list = new ArrayList<Object>();
      for (Object o : (Object[]) arg) {
        list.add(parseArgumentIntoJavascriptParameter(context, scope, o));
      }
      return context.newArray(scope, list.toArray());

    } else if (arg instanceof Map<?,?>) {
      Map<?,?> argmap = (Map<?,?>) arg;
      Scriptable map = context.newObject(scope);
      for (Object key: argmap.keySet()) {
        map.put((String) key, map, parseArgumentIntoJavascriptParameter(context, scope,
                                                                        argmap.get(key)));
      }
      return map;

    } else {
      return arg;
    }
  }

  protected void assertElementNotStale(HtmlElement element) {
    SgmlPage elementPage = element.getPage();
    Page currentPage = lastPage();

    if (!currentPage.equals(elementPage)) {
      throw new StaleElementReferenceException(
          "Element appears to be stale. Did you navigate away from the page that contained it? "
          + " And is the current window focussed the same as the one holding this element?");
    }

    // We need to walk the DOM to determine if the element is actually attached
    DomNode parentElement = element;
    while (parentElement != null && !(parentElement instanceof HtmlHtml)) {
      parentElement = parentElement.getParentNode();
    }

    if (parentElement == null) {
      throw new StaleElementReferenceException(
          "The element seems to be disconnected from the DOM. "
          + " This means that a user cannot interact with it.");
    }
  }

  public Keyboard getKeyboard() {
    return keyboard;
  }

  public Mouse getMouse() {
    return mouse;
  }

  protected interface JavaScriptResultsCollection {
    int getLength();

    Object item(int index);
  }

  private Object parseNativeJavascriptResult(Object result) {
    Object value;
    if (result instanceof ScriptResult) {
      value = ((ScriptResult) result).getJavaScriptResult();
    } else {
      value = result;
    }
    if (value instanceof HTMLElement) {
      return newHtmlUnitWebElement(((HTMLElement) value).getDomNodeOrDie());
    }

    if (value instanceof Number) {
      final Number n = (Number) value;
      final String s = n.toString();
      if (s.indexOf(".") == -1 || s.endsWith(".0")) { // how safe it is? enough for the unit tests!
        return n.longValue();
      }
      return n.doubleValue();
    }

    if (value instanceof NativeObject) {
      final Map<String, Object> map = Maps.newHashMap((NativeObject) value);
      for (final Entry<String, Object> e : map.entrySet()) {
        e.setValue(parseNativeJavascriptResult(e.getValue()));
      }
      return map;
    }
    
    if (value instanceof Location) {
      return convertLocationtoMap((Location) value);
    }

    if (value instanceof NativeArray) {
      final NativeArray array = (NativeArray) value;

      JavaScriptResultsCollection collection = new JavaScriptResultsCollection() {
        public int getLength() {
          return (int) array.getLength();
        }

        public Object item(int index) {
          return array.get(index);
        }
      };

      return parseJavascriptResultsList(collection);
    }

    if (value instanceof HTMLCollection) {
      final HTMLCollection array = (HTMLCollection) value;

      JavaScriptResultsCollection collection = new JavaScriptResultsCollection() {
        public int getLength() {
          return array.getLength();
        }

        public Object item(int index) {
          return array.get(index);
        }
      };

      return parseJavascriptResultsList(collection);
    }

    if (value instanceof Undefined) {
      return null;
    }

    return value;
  }

  private Map<String, Object> convertLocationtoMap(Location location) {
    Map<String, Object> map = Maps.newHashMap();
    map.put("href", location.getHref());
    map.put("protocol", location.getProtocol());
    map.put("host", location.getHost());
    map.put("hostname", location.getHostname());
    map.put("port", location.getPort());
    map.put("pathname", location.getPathname());
    map.put("search", location.getSearch());
    map.put("hash", location.getHash());
    map.put("href", location.getHref());
    return map;
  }

  private List<Object> parseJavascriptResultsList(JavaScriptResultsCollection array) {
    List<Object> list = new ArrayList<Object>(array.getLength());
    for (int i = 0; i < array.getLength(); ++i) {
      list.add(parseNativeJavascriptResult(array.item(i)));
    }
    return list;
  }

  public TargetLocator switchTo() {
    return new HtmlUnitTargetLocator();
  }

  private void switchToDefaultContentOfWindow(WebWindow window) {
    Page page = window.getEnclosedPage();
    if (page instanceof HtmlPage) {
      currentWindow = window;
    }
  }

  public Navigation navigate() {
    return new HtmlUnitNavigation();
  }

  protected Page lastPage() {
    getWebClient(); // check that session is active
    return getCurrentWindow().getEnclosedPage();
  }

  public WebElement findElementByLinkText(String selector) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new IllegalStateException("Cannot find links for " + lastPage());
    }

    String expectedText = selector.trim();

    List<HtmlAnchor> anchors = ((HtmlPage) lastPage()).getAnchors();
    for (HtmlAnchor anchor : anchors) {
      if (expectedText.equals(anchor.asText().trim())) {
        return newHtmlUnitWebElement(anchor);
      }
    }
    throw new NoSuchElementException("No link found with text: " + expectedText);
  }

  protected WebElement newHtmlUnitWebElement(HtmlElement element) {
    return new HtmlUnitWebElement(this, element);
  }

  public List<WebElement> findElementsByLinkText(String selector) {
    List<WebElement> elements = new ArrayList<WebElement>();

    if (!(lastPage() instanceof HtmlPage)) {
      return elements;
    }

    String expectedText = selector.trim();

    List<HtmlAnchor> anchors = ((HtmlPage) lastPage()).getAnchors();
    for (HtmlAnchor anchor : anchors) {
      if (expectedText.equals(anchor.asText().trim())) {
        elements.add(newHtmlUnitWebElement(anchor));
      }
    }
    return elements;
  }

  public WebElement findElementById(String id) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new NoSuchElementException("Unable to locate element by id for " + lastPage());
    }

    try {
      HtmlElement element = ((HtmlPage) lastPage()).getHtmlElementById(id);
      return newHtmlUnitWebElement(element);
    } catch (ElementNotFoundException e) {
      throw new NoSuchElementException("Unable to locate element with ID: " + id);
    }
  }

  public List<WebElement> findElementsById(String id) {
    return findElementsByXPath("//*[@id='" + id + "']");
  }

  @Override
  public WebElement findElementByClassName(String className) {
    if (className.indexOf(' ') != -1) {
      throw new NoSuchElementException("Compound class names not permitted");
    }
    return findElementByCssSelector("." + className);
  }

  @Override
  public List<WebElement> findElementsByClassName(String className) {
    if (className.indexOf(' ') != -1) {
      throw new NoSuchElementException("Compound class names not permitted");
    }
    return findElementsByCssSelector("." + className);
  }

  public WebElement findElementByCssSelector(String using) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new NoSuchElementException("Unable to locate element using css: " + lastPage());
    }

    DomNode node;
    try {
      node = ((HtmlPage) lastPage()).querySelector(using);
    } catch (CSSException ex) {
      throw new NoSuchElementException("Unable to locate element using css", ex);
    }

    if (node instanceof HtmlElement) {
      return newHtmlUnitWebElement((HtmlElement) node);
    }

    throw new NoSuchElementException("Returned node was not an HTML element");
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new NoSuchElementException("Unable to locate element using css: " + lastPage());
    }

    DomNodeList<DomNode> allNodes;

    try {
      allNodes = ((HtmlPage) lastPage()).querySelectorAll(using);
    } catch (CSSException ex) {
      throw new NoSuchElementException("Unable to locate element using css", ex);
    }

    List<WebElement> toReturn = new ArrayList<WebElement>();

    for (DomNode node : allNodes) {
      if (node instanceof HtmlElement) {
        toReturn.add(newHtmlUnitWebElement((HtmlElement) node));
      } else {
        throw new NoSuchElementException("Returned node was not an HTML element");
      }
    }

    return toReturn;
  }

  public WebElement findElementByName(String name) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new IllegalStateException("Unable to locate element by name for " + lastPage());
    }

    List<DomElement> allElements = ((HtmlPage) lastPage()).getElementsByName(name);
    if (!allElements.isEmpty()) {
      return newHtmlUnitWebElement((HtmlElement) allElements.get(0));
    }

    throw new NoSuchElementException("Unable to locate element with name: " + name);
  }

  public List<WebElement> findElementsByName(String using) {
    if (!(lastPage() instanceof HtmlPage)) {
      return new ArrayList<WebElement>();
    }

    List<DomElement> allElements = ((HtmlPage) lastPage()).getElementsByName(using);
    return convertRawHtmlElementsToWebElements(allElements);
  }

  public WebElement findElementByTagName(String name) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new IllegalStateException("Unable to locate element by name for " + lastPage());
    }

    NodeList allElements = ((HtmlPage) lastPage()).getElementsByTagName(name);
    if (allElements.getLength() > 0) {
      return newHtmlUnitWebElement((HtmlElement) allElements.item(0));
    }

    throw new NoSuchElementException("Unable to locate element with name: " + name);
  }

  public List<WebElement> findElementsByTagName(String using) {
    if (!(lastPage() instanceof HtmlPage)) {
      return new ArrayList<WebElement>();
    }

    NodeList allElements = ((HtmlPage) lastPage()).getElementsByTagName(using);
    List<WebElement> toReturn = new ArrayList<WebElement>(allElements.getLength());
    for (int i = 0; i < allElements.getLength(); i++) {
      Node item = allElements.item(i);
      if (item instanceof HtmlElement) {
        toReturn.add(newHtmlUnitWebElement((HtmlElement) item));
      }
    }
    return toReturn;
  }

  public WebElement findElementByXPath(String selector) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new IllegalStateException("Unable to locate element by xpath for " + lastPage());
    }

    Object node;
    try {
      node = ((HtmlPage) lastPage()).getFirstByXPath(selector);
    } catch (Exception ex) {
      // The xpath expression cannot be evaluated, so the expression is invalid
      throw new InvalidSelectorException(
          String.format(INVALIDXPATHERROR, selector),
          ex);
    }
    if (node == null) {
      throw new NoSuchElementException("Unable to locate a node using " + selector);
    }
    if (node instanceof HtmlElement) {
      return newHtmlUnitWebElement((HtmlElement) node);
    }
    // The xpath expression selected something different than a WebElement.
    // The selector is therefore invalid
    throw new InvalidSelectorException(
        String.format(INVALIDSELECTIONERROR, selector, node.getClass()));
  }

  public List<WebElement> findElementsByXPath(String selector) {
    if (!(lastPage() instanceof HtmlPage)) {
      return new ArrayList<WebElement>();
    }

    List<?> nodes;
    List<WebElement> result;
    try {
      nodes = ((HtmlPage) lastPage()).getByXPath(selector);
      result = convertRawHtmlElementsToWebElements(nodes);
    } catch (RuntimeException ex) {
      // The xpath expression cannot be evaluated, so the expression is invalid
      throw new InvalidSelectorException(String.format(INVALIDXPATHERROR, selector), ex);
    }
    if (nodes.size() != result.size()) {
      // There exist elements in the nodes list which could not be converted to WebElements.
      // A valid xpath selector should only select WebElements.

      // Find out the type of the element which is not a WebElement
      for (Object node : nodes) {
        if (!(node instanceof HtmlElement)) {
          // We only want to know the type of one invalid element so that we can give this
          // information in the exception. We can throw the exception immediately.
          throw new InvalidSelectorException(
              String.format(INVALIDSELECTIONERROR, selector, node.getClass()));

        }
      }
    }

    return result;
  }

  private List<WebElement> convertRawHtmlElementsToWebElements(List<?> nodes) {
    List<WebElement> elements = new ArrayList<WebElement>();

    for (Object node : nodes) {
      if (node instanceof HtmlElement) {
        elements.add(newHtmlUnitWebElement((HtmlElement) node));
      }
    }

    return elements;
  }

  public boolean isJavascriptEnabled() {
    return getWebClient().getOptions().isJavaScriptEnabled();
  }

  public void setJavascriptEnabled(boolean enableJavascript) {
    this.enableJavascript = enableJavascript;
    getWebClient().getOptions().setJavaScriptEnabled(enableJavascript);
  }

  private class HtmlUnitTargetLocator implements TargetLocator {

    public WebDriver frame(int index) {
      Page page = lastPage();
      if (page instanceof HtmlPage) {
        try {
          currentWindow = ((HtmlPage) page).getFrames().get(index);
        } catch (IndexOutOfBoundsException ignored) {
          throw new NoSuchFrameException("Cannot find frame: " + index);
        }
      }
      return HtmlUnitDriver.this;
    }

    public WebDriver frame(final String nameOrId) {
      Page page = lastPage();
      if (page instanceof HtmlPage) {
        // First check for a frame with the matching name.
        for (final FrameWindow frameWindow : ((HtmlPage) page).getFrames()) {
          if (frameWindow.getName().equals(nameOrId)) {
            currentWindow = frameWindow;
            return HtmlUnitDriver.this;
          }
        }
      }

      // Next, check for a frame with a matching ID. For simplicity, assume the ID is unique.
      // Users can still switch to frames with non-unique IDs using a WebElement switch:
      // WebElement frameElement = driver.findElement(By.xpath("//frame[@id=\"foo\"]"));
      // driver.switchTo().frame(frameElement);
      try {
        HtmlUnitWebElement element =
            (HtmlUnitWebElement) HtmlUnitDriver.this.findElementById(nameOrId);
        HtmlElement domElement = element.getElement();
        if (domElement instanceof BaseFrameElement) {
          currentWindow = ((BaseFrameElement) domElement).getEnclosedWindow();
          return HtmlUnitDriver.this;
        }
      } catch (NoSuchElementException ignored) {
      }

      throw new NoSuchFrameException("Unable to locate frame with name or ID: " + nameOrId);
    }

    public WebDriver frame(WebElement frameElement) {
      while (frameElement instanceof WrapsElement) {
        frameElement = ((WrapsElement) frameElement).getWrappedElement();
      }

      HtmlUnitWebElement webElement = (HtmlUnitWebElement) frameElement;
      webElement.assertElementNotStale();

      HtmlElement domElement = webElement.getElement();
      if (!(domElement instanceof BaseFrameElement)) {
        throw new NoSuchFrameException(webElement.getTagName() + " is not a frame element.");
      }

      currentWindow = ((BaseFrameElement) domElement).getEnclosedWindow();
      return HtmlUnitDriver.this;
    }

    public WebDriver parentFrame() {
      currentWindow = currentWindow.getParentWindow();
      return HtmlUnitDriver.this;
    }

    public WebDriver window(String windowId) {
      try {
        WebWindow window = getWebClient().getWebWindowByName(windowId);
        return finishSelecting(window);
      } catch (WebWindowNotFoundException e) {

        List<WebWindow> allWindows = getWebClient().getWebWindows();
        for (WebWindow current : allWindows) {
          WebWindow top = current.getTopWindow();
          if (String.valueOf(System.identityHashCode(top)).equals(windowId)) {
            return finishSelecting(top);
          }
        }
        throw new NoSuchWindowException("Cannot find window: " + windowId);
      }
    }

    private WebDriver finishSelecting(WebWindow window) {
      getWebClient().setCurrentWindow(window);
      currentWindow = window;
      pickWindow();
      return HtmlUnitDriver.this;
    }

    public WebDriver defaultContent() {
      switchToDefaultContentOfWindow(getCurrentWindow().getTopWindow());
      return HtmlUnitDriver.this;
    }

    public WebElement activeElement() {
      Page page = lastPage();
      if (page instanceof HtmlPage) {
        HtmlElement element = ((HtmlPage) page).getFocusedElement();
        if (element == null || element instanceof HtmlHtml) {
          List<? extends HtmlElement> allBodies =
              ((HtmlPage) page).getDocumentElement().getHtmlElementsByTagName("body");
          if (!allBodies.isEmpty()) {
            return newHtmlUnitWebElement(allBodies.get(0));
          }
        } else {
          return newHtmlUnitWebElement(element);
        }
      }

      throw new NoSuchElementException("Unable to locate element with focus or body tag");
    }

    public Alert alert() {
      throw new UnsupportedOperationException("alert()");
    }

    public WebDriver context(String name) {
      throw new UnsupportedOperationException("context(String)");
    }
  }

  protected <X> X implicitlyWaitFor(Callable<X> condition) {
    long end = System.currentTimeMillis() + implicitWait;
    Exception lastException = null;

    do {
      X toReturn = null;
      try {
        toReturn = condition.call();
      } catch (Exception e) {
        lastException = e;
      }

      if (toReturn instanceof Boolean && !(Boolean) toReturn) {
        continue;
      }

      if (toReturn != null) {
        return toReturn;
      }

      sleepQuietly(200);
    } while (System.currentTimeMillis() < end);

    if (lastException != null) {
      if (lastException instanceof RuntimeException) {
        throw (RuntimeException) lastException;
      }
      throw new WebDriverException(lastException);
    }

    return null;
  }

  protected WebClient getWebClient() {
    if (webClient == null) {
      throw new SessionNotFoundException("Session is closed");
    }
    return webClient;
  }

  protected WebWindow getCurrentWindow() {
    if (currentWindow == null || currentWindow.isClosed()) {
      throw new NoSuchWindowException("Window is closed");
    }
    return currentWindow;
  }

  private URL getRawUrl() {
    // TODO(simon): I can see this being baaad.
    Page page = lastPage();
    if (page == null) {
      return null;
    }

    return page.getUrl();
  }

  private class HtmlUnitNavigation implements Navigation {

    public void back() {
      try {
        getCurrentWindow().getHistory().back();
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }

    public void forward() {
      try {
        getCurrentWindow().getHistory().forward();
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }


    public void to(String url) {
      get(url);
    }

    public void to(URL url) {
      get(url);
    }

    public void refresh() {
      if (lastPage() instanceof HtmlPage) {
        try {
          ((HtmlPage) lastPage()).refresh();
        } catch (SocketTimeoutException e) {
          throw new TimeoutException(e);
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
    }
  }

  public Options manage() {
    return new HtmlUnitOptions();
  }

  private class HtmlUnitOptions implements Options {

    public Logs logs() {
      throw new UnsupportedOperationException("Driver does not support this operation.");
    }

    public void addCookie(Cookie cookie) {
      Page page = lastPage();
      if (!(page instanceof HtmlPage)) {
        throw new UnableToSetCookieException("You may not set cookies on a page that is not HTML");
      }

      String domain = getDomainForCookie();
      verifyDomain(cookie, domain);

      getWebClient().getCookieManager().addCookie(
          new com.gargoylesoftware.htmlunit.util.Cookie(domain, cookie.getName(),
              cookie.getValue(),
              cookie.getPath(), cookie.getExpiry(), cookie.isSecure()));
    }

    private void verifyDomain(Cookie cookie, String expectedDomain) {
      String domain = cookie.getDomain();
      if (domain == null) {
        return;
      }

      if ("".equals(domain)) {
        throw new InvalidCookieDomainException(
            "Domain must not be an empty string. Consider using null instead");
      }

      // Line-noise-tastic
      if (domain.matches(".*[^:]:\\d+$")) {
        domain = domain.replaceFirst(":\\d+$", "");
      }

      expectedDomain = expectedDomain.startsWith(".") ? expectedDomain : "." + expectedDomain;
      domain = domain.startsWith(".") ? domain : "." + domain;

      if (!expectedDomain.endsWith(domain)) {
        throw new InvalidCookieDomainException(
            String.format(
                "You may only add cookies that would be visible to the current domain: %s => %s",
                domain, expectedDomain));
      }
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

    public void deleteCookieNamed(String name) {
      CookieManager cookieManager = getWebClient().getCookieManager();

      URL url = getRawUrl();
      Set<com.gargoylesoftware.htmlunit.util.Cookie> rawCookies = cookieManager.getCookies(url);
      for (com.gargoylesoftware.htmlunit.util.Cookie cookie : rawCookies) {
        if (name.equals(cookie.getName())) {
          cookieManager.removeCookie(cookie);
        }
      }
    }

    public void deleteCookie(Cookie cookie) {
      getWebClient().getCookieManager().removeCookie(convertSeleniumCookieToHtmlUnit(cookie));
    }

    public void deleteAllCookies() {
      getWebClient().getCookieManager().clearCookies();
    }

    public Set<Cookie> getCookies() {
      URL url = getRawUrl();

      // The about:blank URL (the default in case no navigation took place)
      // does not have a valid 'hostname' part and cannot be used for creating
      // cookies based on it - return an empty set.

      if (!url.toString().startsWith("http")) {
        return Sets.newHashSet();
      }

      return ImmutableSet.copyOf(Collections2.transform(
          getWebClient().getCookieManager().getCookies(url),
          htmlUnitCookieToSeleniumCookieTransformer));
    }

    private com.gargoylesoftware.htmlunit.util.Cookie convertSeleniumCookieToHtmlUnit(Cookie cookie) {
      return new com.gargoylesoftware.htmlunit.util.Cookie(
          cookie.getDomain(),
          cookie.getName(),
          cookie.getValue(),
          cookie.getPath(),
          cookie.getExpiry(),
          cookie.isSecure(),
          cookie.isHttpOnly()
      );
    }

    private final com.google.common.base.Function<? super com.gargoylesoftware.htmlunit.util.Cookie, org.openqa.selenium.Cookie> htmlUnitCookieToSeleniumCookieTransformer =
        new com.google.common.base.Function<com.gargoylesoftware.htmlunit.util.Cookie, org.openqa.selenium.Cookie>() {
          public org.openqa.selenium.Cookie apply(com.gargoylesoftware.htmlunit.util.Cookie c) {
            return new Cookie.Builder(c.getName(), c.getValue())
                .domain(c.getDomain())
                .path(c.getPath())
                .expiresOn(c.getExpires())
                .isSecure(c.isSecure())
                .build();
          }
        };

    private String getDomainForCookie() {
      URL current = getRawUrl();
      return current.getHost();
    }

    public Timeouts timeouts() {
      return new HtmlUnitTimeouts();
    }

    public ImeHandler ime() {
      throw new UnsupportedOperationException("Cannot input IME using HtmlUnit.");
    }

    public Window window() {
      return new HtmlUnitWindow();
    }

  }

  class HtmlUnitTimeouts implements Timeouts {
    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      HtmlUnitDriver.this.implicitWait =
          TimeUnit.MILLISECONDS.convert(Math.max(0, time), unit);
      return this;
    }

    public Timeouts setScriptTimeout(long time, TimeUnit unit) {
      HtmlUnitDriver.this.scriptTimeout = TimeUnit.MILLISECONDS.convert(time, unit);
      return this;
    }

    public Timeouts pageLoadTimeout(long time, TimeUnit unit) {
      int timeout = (int) TimeUnit.MILLISECONDS.convert(time, unit);
      getWebClient().getOptions().setTimeout(timeout > 0 ? timeout : 0);
      return this;
    }
  }

  public class HtmlUnitWindow implements Window {

    private int SCROLLBAR_WIDTH = 8;
    private int HEADER_HEIGHT = 150;

    @Override
    public void setSize(Dimension targetSize) {
      WebWindow topWindow = getCurrentWindow().getTopWindow();

      int width = targetSize.getWidth();
      if (width < SCROLLBAR_WIDTH) width = SCROLLBAR_WIDTH;
      topWindow.setOuterWidth(width);
      topWindow.setInnerWidth(width - SCROLLBAR_WIDTH);

      int height = targetSize.getHeight();
      if (height < HEADER_HEIGHT) height = HEADER_HEIGHT;
      topWindow.setOuterHeight(height);
      topWindow.setInnerHeight(height - HEADER_HEIGHT);
    }

    @Override
    public void setPosition(Point targetPosition) {
      windowPosition = targetPosition;
    }

    @Override
    public Dimension getSize() {
      WebWindow topWindow = getCurrentWindow().getTopWindow();
      return new Dimension(topWindow.getOuterWidth(), topWindow.getOuterHeight());
    }

    @Override
    public Point getPosition() {
      return windowPosition;
    }

    @Override
    public void maximize() {
      setSize(initialWindowDimension);
      setPosition(new Point(0, 0));
    }
  }

  public WebElement findElementByPartialLinkText(String using) {
    if (!(lastPage() instanceof HtmlPage)) {
      throw new IllegalStateException("Cannot find links for " + lastPage());
    }

    List<HtmlAnchor> anchors = ((HtmlPage) lastPage()).getAnchors();
    for (HtmlAnchor anchor : anchors) {
      if (anchor.asText().contains(using)) {
        return newHtmlUnitWebElement(anchor);
      }
    }
    throw new NoSuchElementException("No link found with text: " + using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {

    List<HtmlAnchor> anchors = ((HtmlPage) lastPage()).getAnchors();
    List<WebElement> elements = new ArrayList<WebElement>();
    for (HtmlAnchor anchor : anchors) {
      if (anchor.asText().contains(using)) {
        elements.add(newHtmlUnitWebElement(anchor));
      }
    }
    return elements;
  }

  WebElement findElement(final By locator, final SearchContext context) {
    return implicitlyWaitFor(new Callable<WebElement>() {

      public WebElement call() throws Exception {
        return locator.findElement(context);
      }
    });
  }

  List<WebElement> findElements(final By by, final SearchContext context) {
    long end = System.currentTimeMillis() + implicitWait;
    List<WebElement> found;
    do {
      found = by.findElements(context);
      if (!found.isEmpty()) {
        return found;
      }
    } while (System.currentTimeMillis() < end);

    return found;
  }

  private static void sleepQuietly(long ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException ignored) {
    }
  }
}
