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

package org.openqa.selenium;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Supplier;
import com.google.common.collect.Maps;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.seleniumemulation.AddLocationStrategy;
import org.openqa.selenium.internal.seleniumemulation.AddSelection;
import org.openqa.selenium.internal.seleniumemulation.AlertOverride;
import org.openqa.selenium.internal.seleniumemulation.AltKeyDown;
import org.openqa.selenium.internal.seleniumemulation.AltKeyUp;
import org.openqa.selenium.internal.seleniumemulation.AssignId;
import org.openqa.selenium.internal.seleniumemulation.AttachFile;
import org.openqa.selenium.internal.seleniumemulation.CaptureScreenshotToString;
import org.openqa.selenium.internal.seleniumemulation.Check;
import org.openqa.selenium.internal.seleniumemulation.Click;
import org.openqa.selenium.internal.seleniumemulation.ClickAt;
import org.openqa.selenium.internal.seleniumemulation.Close;
import org.openqa.selenium.internal.seleniumemulation.CompoundMutator;
import org.openqa.selenium.internal.seleniumemulation.ControlKeyDown;
import org.openqa.selenium.internal.seleniumemulation.ControlKeyUp;
import org.openqa.selenium.internal.seleniumemulation.CreateCookie;
import org.openqa.selenium.internal.seleniumemulation.DeleteAllVisibleCookies;
import org.openqa.selenium.internal.seleniumemulation.DeleteCookie;
import org.openqa.selenium.internal.seleniumemulation.DoubleClick;
import org.openqa.selenium.internal.seleniumemulation.DragAndDrop;
import org.openqa.selenium.internal.seleniumemulation.ElementFinder;
import org.openqa.selenium.internal.seleniumemulation.FindFirstSelectedOptionProperty;
import org.openqa.selenium.internal.seleniumemulation.FindSelectedOptionProperties;
import org.openqa.selenium.internal.seleniumemulation.FireEvent;
import org.openqa.selenium.internal.seleniumemulation.FireNamedEvent;
import org.openqa.selenium.internal.seleniumemulation.GetAlert;
import org.openqa.selenium.internal.seleniumemulation.GetAllButtons;
import org.openqa.selenium.internal.seleniumemulation.GetAllFields;
import org.openqa.selenium.internal.seleniumemulation.GetAllLinks;
import org.openqa.selenium.internal.seleniumemulation.GetAllWindowTitles;
import org.openqa.selenium.internal.seleniumemulation.GetAttribute;
import org.openqa.selenium.internal.seleniumemulation.GetAttributeFromAllWindows;
import org.openqa.selenium.internal.seleniumemulation.GetBodyText;
import org.openqa.selenium.internal.seleniumemulation.GetConfirmation;
import org.openqa.selenium.internal.seleniumemulation.GetCookie;
import org.openqa.selenium.internal.seleniumemulation.GetCookieByName;
import org.openqa.selenium.internal.seleniumemulation.GetElementHeight;
import org.openqa.selenium.internal.seleniumemulation.GetElementIndex;
import org.openqa.selenium.internal.seleniumemulation.GetElementPositionLeft;
import org.openqa.selenium.internal.seleniumemulation.GetElementPositionTop;
import org.openqa.selenium.internal.seleniumemulation.GetElementWidth;
import org.openqa.selenium.internal.seleniumemulation.GetEval;
import org.openqa.selenium.internal.seleniumemulation.GetExpression;
import org.openqa.selenium.internal.seleniumemulation.GetHtmlSource;
import org.openqa.selenium.internal.seleniumemulation.GetLocation;
import org.openqa.selenium.internal.seleniumemulation.GetSelectOptions;
import org.openqa.selenium.internal.seleniumemulation.GetTable;
import org.openqa.selenium.internal.seleniumemulation.GetText;
import org.openqa.selenium.internal.seleniumemulation.GetTitle;
import org.openqa.selenium.internal.seleniumemulation.GetValue;
import org.openqa.selenium.internal.seleniumemulation.GetXpathCount;
import org.openqa.selenium.internal.seleniumemulation.GoBack;
import org.openqa.selenium.internal.seleniumemulation.Highlight;
import org.openqa.selenium.internal.seleniumemulation.IsAlertPresent;
import org.openqa.selenium.internal.seleniumemulation.IsChecked;
import org.openqa.selenium.internal.seleniumemulation.IsConfirmationPresent;
import org.openqa.selenium.internal.seleniumemulation.IsCookiePresent;
import org.openqa.selenium.internal.seleniumemulation.IsEditable;
import org.openqa.selenium.internal.seleniumemulation.IsElementPresent;
import org.openqa.selenium.internal.seleniumemulation.IsOrdered;
import org.openqa.selenium.internal.seleniumemulation.IsSomethingSelected;
import org.openqa.selenium.internal.seleniumemulation.IsTextPresent;
import org.openqa.selenium.internal.seleniumemulation.IsVisible;
import org.openqa.selenium.internal.seleniumemulation.JavascriptLibrary;
import org.openqa.selenium.internal.seleniumemulation.KeyEvent;
import org.openqa.selenium.internal.seleniumemulation.KeyState;
import org.openqa.selenium.internal.seleniumemulation.MetaKeyDown;
import org.openqa.selenium.internal.seleniumemulation.MetaKeyUp;
import org.openqa.selenium.internal.seleniumemulation.MouseEvent;
import org.openqa.selenium.internal.seleniumemulation.MouseEventAt;
import org.openqa.selenium.internal.seleniumemulation.NoOp;
import org.openqa.selenium.internal.seleniumemulation.Open;
import org.openqa.selenium.internal.seleniumemulation.OpenWindow;
import org.openqa.selenium.internal.seleniumemulation.Refresh;
import org.openqa.selenium.internal.seleniumemulation.RemoveAllSelections;
import org.openqa.selenium.internal.seleniumemulation.RemoveSelection;
import org.openqa.selenium.internal.seleniumemulation.RunScript;
import org.openqa.selenium.internal.seleniumemulation.ScriptMutator;
import org.openqa.selenium.internal.seleniumemulation.SelectFrame;
import org.openqa.selenium.internal.seleniumemulation.SelectOption;
import org.openqa.selenium.internal.seleniumemulation.SelectWindow;
import org.openqa.selenium.internal.seleniumemulation.SeleneseCommand;
import org.openqa.selenium.internal.seleniumemulation.SetNextConfirmationState;
import org.openqa.selenium.internal.seleniumemulation.SetTimeout;
import org.openqa.selenium.internal.seleniumemulation.ShiftKeyDown;
import org.openqa.selenium.internal.seleniumemulation.ShiftKeyUp;
import org.openqa.selenium.internal.seleniumemulation.Submit;
import org.openqa.selenium.internal.seleniumemulation.Timer;
import org.openqa.selenium.internal.seleniumemulation.Type;
import org.openqa.selenium.internal.seleniumemulation.TypeKeys;
import org.openqa.selenium.internal.seleniumemulation.Uncheck;
import org.openqa.selenium.internal.seleniumemulation.WaitForCondition;
import org.openqa.selenium.internal.seleniumemulation.WaitForPageToLoad;
import org.openqa.selenium.internal.seleniumemulation.WaitForPopup;
import org.openqa.selenium.internal.seleniumemulation.WindowFocus;
import org.openqa.selenium.internal.seleniumemulation.WindowMaximize;
import org.openqa.selenium.internal.seleniumemulation.Windows;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Map;


/**
 * A CommandProcessor which delegates commands down to an underlying webdriver
 * instance.
 */
public class WebDriverCommandProcessor implements CommandProcessor, WrapsDriver {
  private final Map<String, SeleneseCommand<?>> seleneseMethods = Maps.newHashMap();
  private final String baseUrl;
  private final Timer timer;
  private final CompoundMutator scriptMutator;
  private Supplier<WebDriver> maker;
  private WebDriver driver;

  /**
   * Create an instance that will later be configured by calling
   * {@link #start(Object)} with a {@link Capabilities}
   * instance.
   *
   * @param baseUrl The URL from which relative URLs should be based on
   */
  public WebDriverCommandProcessor(String baseUrl) {
    // Firefox seems like a reasonable default
    this(baseUrl, new SuppliesWebDriver(DesiredCapabilities.firefox()));
  }

  /**
   * Create an instance that will later be started by calling
   * {@link #start()}
   *
   * @param baseUrl The URL from which relative URLs should be based on
   * @param likeThis Typically a {@link org.openqa.selenium.remote.DesiredCapabilities} instance
   */
  public WebDriverCommandProcessor(String baseUrl, Capabilities likeThis) {
    this(baseUrl, new SuppliesWebDriver(likeThis));
  }

  public WebDriverCommandProcessor(String baseUrl, WebDriver driver) {
    this(baseUrl, new ExplodingSupplier());
    this.driver = driver;

    assertDriverSupportsJavascript(driver);

    setUpMethodMap();
  }

  public WebDriverCommandProcessor(String baseUrl, Supplier<WebDriver> maker) {
    this.maker = maker;

    if (baseUrl.endsWith("/")) {
      this.baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
    } else {
      this.baseUrl = baseUrl;
    }

    this.timer = new Timer(30000);
    this.scriptMutator = new CompoundMutator(baseUrl);
  }

  public WebDriver getWrappedDriver() {
    return driver;
  }

    public String getRemoteControlServerLocation() {
    throw new UnsupportedOperationException();
  }

  public String doCommand(String commandName, String[] args) {
    Object val = execute(commandName, args);
    if (val == null) {
      return null;
    }

    return val.toString();
  }

  public void setExtensionJs(String s) {
    throw new UnsupportedOperationException();
  }

  public void start() {
    start((Object) null);
  }

  public void start(String s) {
    throw new UnsupportedOperationException("Unsure how to process: " + s);
  }

  public void start(Object o) {
    if (driver != null) {
      throw new SeleniumException("You may not start more than one session at a time");
    }

    driver = maker.get();

    assertDriverSupportsJavascript(driver);

    setUpMethodMap();
  }

  public void stop() {
    timer.stop();
    if (driver != null) {
      driver.quit();
    }
    driver = null;
  }

  public String getString(String commandName, String[] args) {
    return (String) execute(commandName, args);
  }

  public String[] getStringArray(String commandName, String[] args) {
    return (String[]) execute(commandName, args);
  }

  public Number getNumber(String commandName, String[] args) {
    return (Number) execute(commandName, args);
  }

  public Number[] getNumberArray(String s, String[] strings) {
    throw new UnsupportedOperationException();
  }

  public boolean getBoolean(String commandName, String[] args) {
    return (Boolean) execute(commandName, args);
  }

  public boolean[] getBooleanArray(String s, String[] strings) {
    throw new UnsupportedOperationException();
  }

  private Object execute(String commandName, final String[] args) {
    final SeleneseCommand<?> command = seleneseMethods.get(commandName);
    if (command == null) {
      throw new UnsupportedOperationException(commandName);
    }

    return timer.run(command, driver, args);
  }

  public void addMutator(ScriptMutator mutator) {
    scriptMutator.addMutator(mutator);
  }

  public boolean isMethodAvailable(String methodName) {
    return seleneseMethods.containsKey(methodName);
  }

  public void addMethod(String methodName, SeleneseCommand command) {
    seleneseMethods.put(methodName, command);
  }

  public SeleneseCommand getMethod(String methodName) {
    return seleneseMethods.get(methodName);
  }

  @VisibleForTesting
  protected void assertDriverSupportsJavascript(WebDriver driver) {
    if (!(driver instanceof JavascriptExecutor)) {
      throw new IllegalStateException("Driver instance must support JS.");
    }

    if (!(driver instanceof HasCapabilities)) {
      // Might be proxy. Bail.
      return;
    }

    if (!((HasCapabilities) driver).getCapabilities().isJavascriptEnabled()) {
      throw new IllegalStateException("JS support must be enabled.");
    }
  }

  private void setUpMethodMap() {
    JavascriptLibrary javascriptLibrary = new JavascriptLibrary();
    ElementFinder elementFinder = new ElementFinder(javascriptLibrary);
    KeyState keyState = new KeyState();

    AlertOverride alertOverride = new AlertOverride();
    Windows windows = new Windows(driver);

    // Note the we use the names used by the CommandProcessor
    seleneseMethods.put("addLocationStrategy", new AddLocationStrategy(elementFinder));
    seleneseMethods.put("addSelection", new AddSelection(javascriptLibrary, elementFinder));
    seleneseMethods.put("altKeyDown", new AltKeyDown(keyState));
    seleneseMethods.put("altKeyUp", new AltKeyUp(keyState));
    seleneseMethods.put("assignId", new AssignId(javascriptLibrary, elementFinder));
    seleneseMethods.put("attachFile", new AttachFile(elementFinder));
    seleneseMethods.put("captureScreenshotToString", new CaptureScreenshotToString());
    seleneseMethods.put("click", new Click(alertOverride, elementFinder));
    seleneseMethods.put("clickAt", new ClickAt(alertOverride, elementFinder));
    seleneseMethods.put("check", new Check(alertOverride, elementFinder));
    seleneseMethods.put("chooseCancelOnNextConfirmation", new SetNextConfirmationState(false));
    seleneseMethods.put("chooseOkOnNextConfirmation", new SetNextConfirmationState(true));
    seleneseMethods.put("close", new Close());
    seleneseMethods.put("createCookie", new CreateCookie());
    seleneseMethods.put("controlKeyDown", new ControlKeyDown(keyState));
    seleneseMethods.put("controlKeyUp", new ControlKeyUp(keyState));
    seleneseMethods.put("deleteAllVisibleCookies", new DeleteAllVisibleCookies());
    seleneseMethods.put("deleteCookie", new DeleteCookie());
    seleneseMethods.put("doubleClick", new DoubleClick(alertOverride, elementFinder));
    seleneseMethods.put("dragdrop", new DragAndDrop(elementFinder));
    seleneseMethods.put("dragAndDrop", new DragAndDrop(elementFinder));
    seleneseMethods.put("fireEvent", new FireEvent(elementFinder, javascriptLibrary));
    seleneseMethods.put("focus", new FireNamedEvent(elementFinder, javascriptLibrary, "focus"));
    seleneseMethods.put("getAlert", new GetAlert(alertOverride));
    seleneseMethods.put("getAllButtons", new GetAllButtons());
    seleneseMethods.put("getAllFields", new GetAllFields());
    seleneseMethods.put("getAllLinks", new GetAllLinks());
    seleneseMethods.put("getAllWindowTitles", new GetAllWindowTitles());
    seleneseMethods.put("getAttribute", new GetAttribute(javascriptLibrary, elementFinder));
    seleneseMethods.put("getAttributeFromAllWindows", new GetAttributeFromAllWindows());
    seleneseMethods.put("getBodyText", new GetBodyText());
    seleneseMethods.put("getConfirmation", new GetConfirmation(alertOverride));
    seleneseMethods.put("getCookie", new GetCookie());
    seleneseMethods.put("getCookieByName", new GetCookieByName());
    seleneseMethods.put("getElementHeight", new GetElementHeight(elementFinder));
    seleneseMethods.put("getElementIndex", new GetElementIndex(elementFinder,
        javascriptLibrary));
    seleneseMethods.put("getElementPositionLeft", new GetElementPositionLeft(elementFinder));
    seleneseMethods.put("getElementPositionTop", new GetElementPositionTop(elementFinder));
    seleneseMethods.put("getElementWidth", new GetElementWidth(elementFinder));
    seleneseMethods.put("getEval", new GetEval(scriptMutator));
    seleneseMethods.put("getExpression", new GetExpression());
    seleneseMethods.put("getHtmlSource", new GetHtmlSource());
    seleneseMethods.put("getLocation", new GetLocation());
    seleneseMethods.put("getSelectedId", new FindFirstSelectedOptionProperty(javascriptLibrary, elementFinder, "id"));
    seleneseMethods.put("getSelectedIds", new FindSelectedOptionProperties(javascriptLibrary, elementFinder, "id"));
    seleneseMethods.put("getSelectedIndex", new FindFirstSelectedOptionProperty(javascriptLibrary, elementFinder, "index"));
    seleneseMethods.put("getSelectedIndexes", new FindSelectedOptionProperties(javascriptLibrary, elementFinder, "index"));
    seleneseMethods.put("getSelectedLabel", new FindFirstSelectedOptionProperty(javascriptLibrary, elementFinder, "text"));
    seleneseMethods.put("getSelectedLabels", new FindSelectedOptionProperties(javascriptLibrary, elementFinder, "text"));
    seleneseMethods.put("getSelectedValue", new FindFirstSelectedOptionProperty(javascriptLibrary, elementFinder, "value"));
    seleneseMethods.put("getSelectedValues", new FindSelectedOptionProperties(javascriptLibrary, elementFinder, "value"));
    seleneseMethods.put("getSelectOptions", new GetSelectOptions(javascriptLibrary, elementFinder));
    seleneseMethods.put("getSpeed", new NoOp("0"));
    seleneseMethods.put("getTable", new GetTable(elementFinder, javascriptLibrary));
    seleneseMethods.put("getText", new GetText(javascriptLibrary, elementFinder));
    seleneseMethods.put("getTitle", new GetTitle());
    seleneseMethods.put("getValue", new GetValue(elementFinder));
    seleneseMethods.put("getXpathCount", new GetXpathCount());
    seleneseMethods.put("goBack", new GoBack());
    seleneseMethods.put("highlight", new Highlight(elementFinder, javascriptLibrary));
    seleneseMethods.put("isAlertPresent", new IsAlertPresent(alertOverride));
    seleneseMethods.put("isChecked", new IsChecked(elementFinder));
    seleneseMethods.put("isConfirmationPresent", new IsConfirmationPresent(alertOverride));
    seleneseMethods.put("isCookiePresent", new IsCookiePresent());
    seleneseMethods.put("isEditable", new IsEditable(elementFinder));
    seleneseMethods.put("isElementPresent", new IsElementPresent(elementFinder));
    seleneseMethods.put("isOrdered", new IsOrdered(elementFinder, javascriptLibrary));
    seleneseMethods.put("isSomethingSelected", new IsSomethingSelected(javascriptLibrary));
    seleneseMethods.put("isTextPresent", new IsTextPresent(javascriptLibrary));
    seleneseMethods.put("isVisible", new IsVisible(elementFinder));
    seleneseMethods.put("keyDown", new KeyEvent(elementFinder, javascriptLibrary, keyState, "doKeyDown"));
    seleneseMethods.put("keyPress", new TypeKeys(alertOverride, elementFinder));
    seleneseMethods.put("keyUp", new KeyEvent(elementFinder, javascriptLibrary, keyState, "doKeyUp"));
    seleneseMethods.put("metaKeyDown", new MetaKeyDown(keyState));
    seleneseMethods.put("metaKeyUp", new MetaKeyUp(keyState));
    seleneseMethods.put("mouseOver", new MouseEvent(elementFinder, javascriptLibrary, "mouseover"));
    seleneseMethods.put("mouseOut", new MouseEvent(elementFinder, javascriptLibrary, "mouseout"));
    seleneseMethods.put("mouseDown", new MouseEvent(elementFinder, javascriptLibrary, "mousedown"));
    seleneseMethods.put("mouseDownAt", new MouseEventAt(elementFinder, javascriptLibrary, "mousedown"));
    seleneseMethods.put("mouseMove", new MouseEvent(elementFinder, javascriptLibrary, "mousemove"));
    seleneseMethods.put("mouseMoveAt", new MouseEventAt(elementFinder, javascriptLibrary, "mousemove"));
    seleneseMethods.put("mouseUp", new MouseEvent(elementFinder, javascriptLibrary, "mouseup"));
    seleneseMethods.put("mouseUpAt", new MouseEventAt(elementFinder, javascriptLibrary, "mouseup"));
    seleneseMethods.put("open", new Open(baseUrl));
    seleneseMethods.put("openWindow", new OpenWindow(new GetEval(scriptMutator)));
    seleneseMethods.put("refresh", new Refresh());
    seleneseMethods.put("removeAllSelections", new RemoveAllSelections(elementFinder));
    seleneseMethods.put("removeSelection", new RemoveSelection(javascriptLibrary, elementFinder));
    seleneseMethods.put("runScript", new RunScript(scriptMutator));
    seleneseMethods.put("select", new SelectOption(alertOverride, javascriptLibrary, elementFinder));
    seleneseMethods.put("selectFrame", new SelectFrame(windows));
    seleneseMethods.put("selectWindow", new SelectWindow(windows));
    seleneseMethods.put("setBrowserLogLevel", new NoOp(null));
    seleneseMethods.put("setContext", new NoOp(null));
    seleneseMethods.put("setSpeed", new NoOp(null));
    seleneseMethods.put("setTimeout", new SetTimeout(timer));
    seleneseMethods.put("shiftKeyDown", new ShiftKeyDown(keyState));
    seleneseMethods.put("shiftKeyUp", new ShiftKeyUp(keyState));
    seleneseMethods.put("submit", new Submit(elementFinder));
    seleneseMethods.put("type", new Type(alertOverride, javascriptLibrary, elementFinder, keyState));
    seleneseMethods.put("typeKeys", new TypeKeys(alertOverride, elementFinder));
    seleneseMethods.put("uncheck", new Uncheck(alertOverride, elementFinder));
    seleneseMethods.put("useXpathLibrary", new NoOp(null));
    seleneseMethods.put("waitForCondition", new WaitForCondition(scriptMutator));
    seleneseMethods.put("waitForFrameToLoad", new NoOp(null));
    seleneseMethods.put("waitForPageToLoad", new WaitForPageToLoad());
    seleneseMethods.put("waitForPopUp", new WaitForPopup(windows));
    seleneseMethods.put("windowFocus", new WindowFocus(javascriptLibrary));
    seleneseMethods.put("windowMaximize", new WindowMaximize(javascriptLibrary));
  }
}
