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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.common.collect.Maps;
import com.thoughtworks.selenium.Selenium;
import org.openqa.selenium.internal.seleniumemulation.AddLocationStrategy;
import org.openqa.selenium.internal.seleniumemulation.AddSelection;
import org.openqa.selenium.internal.seleniumemulation.AltKeyDown;
import org.openqa.selenium.internal.seleniumemulation.AltKeyUp;
import org.openqa.selenium.internal.seleniumemulation.AssignId;
import org.openqa.selenium.internal.seleniumemulation.AttachFile;
import org.openqa.selenium.internal.seleniumemulation.Check;
import org.openqa.selenium.internal.seleniumemulation.Click;
import org.openqa.selenium.internal.seleniumemulation.Close;
import org.openqa.selenium.internal.seleniumemulation.ControlKeyDown;
import org.openqa.selenium.internal.seleniumemulation.ControlKeyUp;
import org.openqa.selenium.internal.seleniumemulation.CreateCookie;
import org.openqa.selenium.internal.seleniumemulation.DeleteAllVisibleCookies;
import org.openqa.selenium.internal.seleniumemulation.DeleteCookie;
import org.openqa.selenium.internal.seleniumemulation.DoubleClick;
import org.openqa.selenium.internal.seleniumemulation.DragAndDrop;
import org.openqa.selenium.internal.seleniumemulation.DragAndDropToObject;
import org.openqa.selenium.internal.seleniumemulation.ElementFinder;
import org.openqa.selenium.internal.seleniumemulation.FindFirstSelectedOptionProperty;
import org.openqa.selenium.internal.seleniumemulation.FindSelectedOptionProperties;
import org.openqa.selenium.internal.seleniumemulation.FireEvent;
import org.openqa.selenium.internal.seleniumemulation.FireNamedEvent;
import org.openqa.selenium.internal.seleniumemulation.GetAllButtons;
import org.openqa.selenium.internal.seleniumemulation.GetAllFields;
import org.openqa.selenium.internal.seleniumemulation.GetAllLinks;
import org.openqa.selenium.internal.seleniumemulation.GetAllWindowTitles;
import org.openqa.selenium.internal.seleniumemulation.GetAttribute;
import org.openqa.selenium.internal.seleniumemulation.GetAttributeFromAllWindows;
import org.openqa.selenium.internal.seleniumemulation.GetBodyText;
import org.openqa.selenium.internal.seleniumemulation.GetCookie;
import org.openqa.selenium.internal.seleniumemulation.GetCookieByName;
import org.openqa.selenium.internal.seleniumemulation.GetElementHeight;
import org.openqa.selenium.internal.seleniumemulation.GetElementIndex;
import org.openqa.selenium.internal.seleniumemulation.GetElementPositionLeft;
import org.openqa.selenium.internal.seleniumemulation.GetElementPositionTop;
import org.openqa.selenium.internal.seleniumemulation.GetElementWidth;
import org.openqa.selenium.internal.seleniumemulation.GetEval;
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
import org.openqa.selenium.internal.seleniumemulation.IsChecked;
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
import org.openqa.selenium.internal.seleniumemulation.SelectFrame;
import org.openqa.selenium.internal.seleniumemulation.SelectOption;
import org.openqa.selenium.internal.seleniumemulation.SelectWindow;
import org.openqa.selenium.internal.seleniumemulation.SeleneseCommand;
import org.openqa.selenium.internal.seleniumemulation.SeleniumSelect;
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

import static org.openqa.selenium.internal.seleniumemulation.SeleniumSelect.Property.ID;
import static org.openqa.selenium.internal.seleniumemulation.SeleniumSelect.Property.INDEX;
import static org.openqa.selenium.internal.seleniumemulation.SeleniumSelect.Property.TEXT;
import static org.openqa.selenium.internal.seleniumemulation.SeleniumSelect.Property.VALUE;

public class WebDriverBackedSelenium implements Selenium {
  private final WebDriver driver;

  private final String baseUrl;

  private final Map<String, SeleneseCommand> seleneseMethods = Maps.newHashMap();
  private final ElementFinder elementFinder = new ElementFinder();

  private final JavascriptLibrary javascriptLibrary = new JavascriptLibrary();

  // Keyboard related stuff
  private KeyState keyState = new KeyState();

  public WebDriverBackedSelenium(WebDriver baseDriver, String baseUrl) {
    this.driver = baseDriver;
    if (baseUrl.endsWith("/")) {
      this.baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
    } else {
      this.baseUrl = baseUrl;
    }

    setUpMethodMap();
  }

  public WebDriver getUnderlyingWebDriver() {
    return driver;
  }



  /**
   * Sets the per-session extension Javascript
   */
  public void setExtensionJs(String s) {
    throw new UnsupportedOperationException("setExtensionJs");
  }

  /**
   * Launches the browser with a new Selenium session
   */
  public void start() {
    // no-op
  }

  /**
   * Starts a new Selenium testing session with a String, representing a configuration
   */
  public void start(String optionsString) {
    // no-op
  }

  /**
   * Starts a new Selenium testing session with a configuration options object
   */
  public void start(Object optionsObject) {
    // no-op
  }

  /**
   * Ends the test session, killing the browser
   */
  public void stop() {
    driver.quit();
  }

  /**
   * Shows in the RemoteRunner a banner for the current test
   * The banner is 'classname : methodname' where those two are derived from the caller
   * The method name will be unCamelCased with the insertion of spaces at word boundaries
   */
  public void showContextualBanner() {
    throw new UnsupportedOperationException("showContextualBanner");
  }

  /**
   * Shows in the RemoteRunner a banner for the current test
   * The banner is 'classname : methodname'
   * The method name will be unCamelCased with the insertion of spaces at word boundaries
   */
  public void showContextualBanner(String className, String methodName) {
    throw new UnsupportedOperationException("showContextualBanner");
  }

  /**
   * Clicks on a link, button, checkbox or radio button. If the click action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator an element locator
   */
  public void click(String locator) {
    seleneseMethods.get("click").apply(driver, locator);
  }

  /**
   * Double clicks on a link, button, checkbox or radio button. If the double click action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator an element locator
   */
  public void doubleClick(String locator) {
    seleneseMethods.get("doubleClick").apply(driver, locator);
  }

  /**
   * Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
   *
   * @param locator an element locator
   */
  public void contextMenu(String locator) {
    throw new UnsupportedOperationException("contextMenu");
  }

  /**
   * Clicks on a link, button, checkbox or radio button. If the click action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator     an element locator
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void clickAt(String locator, String coordString) {
    throw new UnsupportedOperationException("clickAt");
  }

  /**
   * Doubleclicks on a link, button, checkbox or radio button. If the action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator     an element locator
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void doubleClickAt(String locator, String coordString) {
    throw new UnsupportedOperationException("doubleClickAt");
  }

  /**
   * Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
   *
   * @param locator     an element locator
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void contextMenuAt(String locator, String coordString) {
    throw new UnsupportedOperationException("contextMenuAt");
  }

  /**
   * Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
   * handler.
   *
   * @param locator   an <a href="#locators">element locator</a>
   * @param eventName the event name, e.g. "focus" or "blur"
   */
  public void fireEvent(String locator, String eventName) {
    seleneseMethods.get("fireEvent").apply(driver, locator, eventName);
  }

  /**
   * Move the focus to the specified element; for example, if the element is an input field, move the cursor to that field.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void focus(String locator) {
    seleneseMethods.get("focus").apply(driver, locator);
  }

  /**
   * Simulates a user pressing and releasing a key.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param keySequence Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
   */
  public void keyPress(String locator, String keySequence) {
    seleneseMethods.get("keyPress").apply(driver, locator, keySequence);
  }

  /**
   * Press the shift key and hold it down until doShiftUp() is called or a new page is loaded.
   */
  public void shiftKeyDown() {
    seleneseMethods.get("shiftKeyDown").apply(driver);
  }

  /**
   * Release the shift key.
   */
  public void shiftKeyUp() {
    seleneseMethods.get("shiftKeyUp").apply(driver);
  }

  /**
   * Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
   */
  public void metaKeyDown() {
    seleneseMethods.get("metaKeyDown").apply(driver);
  }

  /**
   * Release the meta key.
   */
  public void metaKeyUp() {
    seleneseMethods.get("metaKeyUp").apply(driver);
  }

  /**
   * Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
   */
  public void altKeyDown() {
    seleneseMethods.get("altKeyDown").apply(driver);
  }

  /**
   * Release the alt key.
   */
  public void altKeyUp() {
    seleneseMethods.get("altKeyUp").apply(driver);
  }

  /**
   * Press the control key and hold it down until doControlUp() is called or a new page is loaded.
   */
  public void controlKeyDown() {
    seleneseMethods.get("controlKeyUp").apply(driver);
  }

  /**
   * Release the control key.
   */
  public void controlKeyUp() {
    seleneseMethods.get("controlKeyUp").apply(driver);
  }

  /**
   * Simulates a user pressing a key (without releasing it yet).
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param keySequence Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
   */
  public void keyDown(String locator, String keySequence) {
    seleneseMethods.get("keyDown").apply(driver, "doKeyDown", locator, keySequence, keyState);
  }

  /**
   * Simulates a user releasing a key.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param keySequence Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
   */
  public void keyUp(String locator, String keySequence) {
    seleneseMethods.get("keyUp").apply(driver, "doKeyUp", locator, keySequence, keyState);
  }

  /**
   * Simulates a user hovering a mouse over the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseOver(String locator) {
    seleneseMethods.get("mouseOver").apply(driver, locator);
  }

  /**
   * Simulates a user moving the mouse pointer away from the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseOut(String locator) {
    seleneseMethods.get("mouseOut").apply(driver, locator);
  }

  /**
   * Simulates a user pressing the left mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseDown(String locator) {
    seleneseMethods.get("mouseDown").apply(driver, locator);
  }

  /**
   * Simulates a user pressing the right mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseDownRight(String locator) {
    throw new UnsupportedOperationException("mouseDownRight");
  }

  /**
   * Simulates a user pressing the left mouse button (without releasing it yet) at
   * the specified location.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void mouseDownAt(String locator, String coordString) {
    seleneseMethods.get("mouseDownAt").apply(driver, locator, coordString);
  }

  /**
   * Simulates a user pressing the right mouse button (without releasing it yet) at
   * the specified location.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void mouseDownRightAt(String locator, String coordString) {
    throw new UnsupportedOperationException("mouseDownRightAt");
  }

  /**
   * Simulates the event that occurs when the user releases the mouse button (i.e., stops
   * holding the button down) on the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseUp(String locator) {
    seleneseMethods.get("mouseUp").apply(driver, locator);
  }

  /**
   * Simulates the event that occurs when the user releases the right mouse button (i.e., stops
   * holding the button down) on the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseUpRight(String locator) {
    throw new UnsupportedOperationException("mouseUpRight");
  }

  /**
   * Simulates the event that occurs when the user releases the mouse button (i.e., stops
   * holding the button down) at the specified location.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void mouseUpAt(String locator, String coordString) {
    seleneseMethods.get("mouseUpAt").apply(driver, locator, coordString);
  }

  /**
   * Simulates the event that occurs when the user releases the right mouse button (i.e., stops
   * holding the button down) at the specified location.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void mouseUpRightAt(String locator, String coordString) {
    throw new UnsupportedOperationException("mouseUpRightAt");
  }

  /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void mouseMove(String locator) {
    seleneseMethods.get("mouseUpAt").apply(driver, locator);
  }

  /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator     an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
   */
  public void mouseMoveAt(String locator, String coordString) {
    seleneseMethods.get("mouseMoveAt").apply(driver, locator, coordString);
  }

  /**
   * Sets the value of an input field, as though you typed it in.
   * <p/>
   * <p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
   * value should be the value of the option selected, not the visible text.</p>
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param value   the value to type
   */
  public void type(String locator, String value) {
    seleneseMethods.get("type").apply(driver, locator, value);
  }

  /**
   * Simulates keystroke events on the specified element, as though you typed the value key-by-key.
   * <p/>
   * <p>This is a convenience method for calling keyDown, keyUp, keyPress for every character in the specified string;
   * this is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.</p><p>Unlike the simple "type" command, which forces the specified value into the page directly, this command
   * may or may not have any visible effect, even in cases where typing keys would normally have a visible effect.
   * For example, if you use "typeKeys" on a form element, you may or may not see the results of what you typed in
   * the field.</p><p>In some cases, you may need to use the simple "type" command to set the value of the field and then the "typeKeys" command to
   * send the keystroke events corresponding to what you just typed.</p>
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param value   the value to type
   */
  public void typeKeys(String locator, String value) {
    seleneseMethods.get("typeKeys").apply(driver, locator, value);
  }

  /**
   * Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation).  By default, there is no such delay, i.e.,
   * the delay is 0 milliseconds.
   *
   * @param value the number of milliseconds to pause after operation
   */
  public void setSpeed(String value) {
    seleneseMethods.get("setSpeed").apply(driver, value);
  }

  /**
   * Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
   * the delay is 0 milliseconds.
   * <p/>
   * See also setSpeed.
   *
   * @return the execution speed in milliseconds.
   */
  public String getSpeed() {
    // no-op. Pretend we work instantly. Which we do
    return (String) seleneseMethods.get("getSpeed").apply(driver);
  }

  /**
   * Check a toggle-button (checkbox/radio)
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void check(String locator) {
    seleneseMethods.get("check").apply(driver, locator);
  }

  /**
   * Uncheck a toggle-button (checkbox/radio)
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void uncheck(String locator) {
    seleneseMethods.get("uncheck").apply(driver, locator);
  }

  /**
   * Select an option from a drop-down using an option locator.
   * <p/>
   * <p>
   * Option locators provide different ways of specifying options of an HTML
   * Select element (e.g. for selecting a specific option, or for asserting
   * that the selected option satisfies a specification). There are several
   * forms of Select Option Locator.
   * </p><ul><li><strong>label</strong>=<em>labelPattern</em>:
   * matches options based on their labels, i.e. the visible text. (This
   * is the default.)
   * <ul class="first last simple"><li>label=regexp:^[Oo]ther</li></ul></li><li><strong>value</strong>=<em>valuePattern</em>:
   * matches options based on their values.
   * <ul class="first last simple"><li>value=other</li></ul></li><li><strong>id</strong>=<em>id</em>:
   * <p/>
   * matches options based on their ids.
   * <ul class="first last simple"><li>id=option1</li></ul></li><li><strong>index</strong>=<em>index</em>:
   * matches an option based on its index (offset from zero).
   * <ul class="first last simple"><li>index=2</li></ul></li></ul><p>
   * If no option locator prefix is provided, the default behaviour is to match on <strong>label</strong>.
   * </p>
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @param optionLocator an option locator (a label by default)
   */
  public void select(String selectLocator, String optionLocator) {
    seleneseMethods.get("select").apply(driver, selectLocator, optionLocator);
  }

  /**
   * Add a selection to the set of selected options in a multi-select element using an option locator.
   *
   * @param locator       an <a href="#locators">element locator</a> identifying a multi-select box
   * @param optionLocator an option locator (a label by default)
   */
  public void addSelection(String locator, String optionLocator) {
    seleneseMethods.get("addSelection").apply(driver, locator, optionLocator);
  }

  /**
   * Remove a selection from the set of selected options in a multi-select element using an option locator.
   *
   * @param locator       an <a href="#locators">element locator</a> identifying a multi-select box
   * @param optionLocator an option locator (a label by default)
   */
  public void removeSelection(String locator, String optionLocator) {
    seleneseMethods.get("removeSelection").apply(driver, locator, optionLocator);
  }

  /**
   * Unselects all of the selected options in a multi-select element.
   *
   * @param locator an <a href="#locators">element locator</a> identifying a multi-select box
   */
  public void removeAllSelections(String locator) {
    seleneseMethods.get("removeAllSelections").apply(driver, locator);
  }

  /**
   * Submit the specified form. This is particularly useful for forms without
   * submit buttons, e.g. single-input "Search" forms.
   *
   * @param formLocator an <a href="#locators">element locator</a> for the form you want to submit
   */
  public void submit(String formLocator) {
    seleneseMethods.get("submit").apply(driver, formLocator);
  }

  /**
   * Opens an URL in the test frame. This accepts both relative and absolute
   * URLs.
   * <p/>
   * The "open" command waits for the page to load before proceeding,
   * ie. the "AndWait" suffix is implicit.
   * <p/>
   * <em>Note</em>: The URL must be on the same domain as the runner HTML
   * due to security restrictions in the browser (Same Origin Policy). If you
   * need to open an URL on another domain, use the Selenium Server to start a
   * new browser session on that domain.
   *
   * @param url the URL to open; may be relative or absolute
   */
  public void open(String url) {
    seleneseMethods.get("open").apply(driver, url);
  }

  /**
   * Opens a popup window (if a window with that ID isn't already open).
   * After opening the window, you'll need to select it using the selectWindow
   * command.
   * <p/>
   * <p>This command can also be a useful workaround for bug SEL-339.  In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
   * In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
   * an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
   *
   * @param url      the URL to open, which can be blank
   * @param windowID the JavaScript window ID of the window to select
   */
  public void openWindow(String url, String windowID) {
    seleneseMethods.get("openWindow").apply(driver, url, windowID);
  }

  /**
   * Selects a popup window using a window locator; once a popup window has been selected, all
   * commands go to that window. To select the main window again, use null
   * as the target.
   * <p/>
   * <p>
   * <p/>
   * Window locators provide different ways of specifying the window object:
   * by title, by internal JavaScript "name," or by JavaScript variable.
   * </p><ul><li><strong>title</strong>=<em>My Special Window</em>:
   * Finds the window using the text that appears in the title bar.  Be careful;
   * two windows can share the same title.  If that happens, this locator will
   * just pick one.
   * </li><li><strong>name</strong>=<em>myWindow</em>:
   * Finds the window using its internal JavaScript "name" property.  This is the second
   * parameter "windowName" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag)
   * (which Selenium intercepts).
   * </li><li><strong>var</strong>=<em>variableName</em>:
   * Some pop-up windows are unnamed (anonymous), but are associated with a JavaScript variable name in the current
   * application window, e.g. "window.foo = window.open(url);".  In those cases, you can open the window using
   * "var=foo".
   * </li></ul><p>
   * If no window locator prefix is provided, we'll try to guess what you mean like this:</p><p>1.) if windowID is null, (or the string "null") then it is assumed the user is referring to the original window instantiated by the browser).</p><p>2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
   * that this variable contains the return value from a call to the JavaScript window.open() method.</p><p>3.) Otherwise, selenium looks in a hash it maintains that maps string names to window "names".</p><p>4.) If <em>that</em> fails, we'll try looping over all of the known windows to try to find the appropriate "title".
   * Since "title" is not necessarily unique, this may have unexpected behavior.</p><p>If you're having trouble figuring out the name of a window that you want to manipulate, look at the Selenium log messages
   * which identify the names of windows created via window.open (and therefore intercepted by Selenium).  You will see messages
   * like the following for each window as it is opened:</p><p><code>debug: window.open call intercepted; window ID (which you can use with selectWindow()) is "myNewWindow"</code></p><p>In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
   * (This is bug SEL-339.)  In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
   * an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
   *
   * @param windowID the JavaScript window ID of the window to select
   */
  public void selectWindow(String windowID) {
    seleneseMethods.get("selectWindow").apply(driver, windowID);
  }

  /** Simplifies the process of selecting a popup window (and does not offer
   * functionality beyond what <code>selectWindow()</code> already provides).
   * <ul><li>If <code>windowID</code> is either not specified, or specified as
   * "null", the first non-top window is selected. The top window is the one
   * that would be selected by <code>selectWindow()</code> without providing a
   * <code>windowID</code> . This should not be used when more than one popup
   * window is in play.</li><li>Otherwise, the window will be looked up considering
   * <code>windowID</code> as the following in order: 1) the "name" of the
   * window, as specified to <code>window.open()</code>; 2) a javascript
   * variable which is a reference to a window; and 3) the title of the
   * window. This is the same ordered lookup performed by
   * <code>selectWindow</code> .</li></ul>
   *
   * @param windowID an identifier for the popup window, which can take on a
   *                 number of different meanings
   */
  public void selectPopUp(String windowID) {
    throw new UnsupportedOperationException("Not implemented yet.");
  }

  /** Selects the main window. Functionally equivalent to using
   * <code>selectWindow()</code> and specifying no value for
   * <code>windowID</code>.
   */
  public void deselectPopUp() {
    throw new UnsupportedOperationException("Not implemented yet.");
  }

  /**
   * Selects a frame within the current window.  (You may invoke this command
   * multiple times to select nested frames.)  To select the parent frame, use
   * "relative=parent" as a locator; to select the top frame, use "relative=top".
   * You can also select a frame by its 0-based index number; select the first frame with
   * "index=0", or the third frame with "index=2".
   * <p/>
   * <p>You may also use a DOM expression to identify the frame you want directly,
   * like this: <code>dom=frames["main"].frames["subframe"]</code></p>
   *
   * @param locator an <a href="#locators">element locator</a> identifying a frame or iframe
   */
  public void selectFrame(String locator) {
    seleneseMethods.get("selectFrame").apply(driver, locator);
  }

  /**
   * Determine whether current/locator identify the frame containing this running code.
   * <p/>
   * <p>This is useful in proxy injection mode, where this code runs in every
   * browser frame and window, and sometimes the selenium server needs to identify
   * the "current" frame.  In this case, when the test calls selectFrame, this
   * routine is called for each frame to figure out which one has been selected.
   * The selected frame will return true, while all others will return false.</p>
   *
   * @param currentFrameString starting frame
   * @param target             new frame (which might be relative to the current one)
   * @return true if the new frame is this code's window
   */
  public boolean getWhetherThisFrameMatchFrameExpression(String currentFrameString, String target) {
    throw new UnsupportedOperationException("getWhetherThisFrameMatchFrameExpression");
  }

  /**
   * Determine whether currentWindowString plus target identify the window containing this running code.
   * <p/>
   * <p>This is useful in proxy injection mode, where this code runs in every
   * browser frame and window, and sometimes the selenium server needs to identify
   * the "current" window.  In this case, when the test calls selectWindow, this
   * routine is called for each window to figure out which one has been selected.
   * The selected window will return true, while all others will return false.</p>
   *
   * @param currentWindowString starting window
   * @param target              new window (which might be relative to the current one, e.g., "_parent")
   * @return true if the new window is this code's window
   */
  public boolean getWhetherThisWindowMatchWindowExpression(String currentWindowString, String target) {
    throw new UnsupportedOperationException("getWhetherThisWindowMatchWindowExpression");
  }

  /**
   * Waits for a popup window to appear and load up.
   * 
   * <p>If <code>windowID</code> is equals to <code>_blank</code> then instead
   * of searching the window by ID it is necessary to search for the only window
   * without a name.
   * 
   * @param windowID the JavaScript window "name" of the window that will appear (not the text of the title bar)
   * @param timeout  a timeout in milliseconds, after which the action will return with an error
   */
  public void waitForPopUp(final String windowID, String timeout) {
    seleneseMethods.get("waitForPopUp").apply(driver, windowID, timeout);
  }

  /**
   * <p>
   * By default, Selenium's overridden window.confirm() function will
   * return true, as if the user had manually clicked OK; after running
   * this command, the next call to confirm() will return false, as if
   * the user had clicked Cancel.  Selenium will then resume using the
   * default behavior for future confirmations, automatically returning
   * true (OK) unless/until you explicitly call this command for each
   * confirmation.
   * </p><p>
   * Take note - every time a confirmation comes up, you must
   * consume it with a corresponding getConfirmation, or else
   * the next selenium operation will fail.
   * </p>
   */
  public void chooseCancelOnNextConfirmation() {
    throw new UnsupportedOperationException("chooseCancelOnNextConfirmation");
  }

  /**
   * <p>
   * Undo the effect of calling chooseCancelOnNextConfirmation.  Note
   * that Selenium's overridden window.confirm() function will normally automatically
   * return true, as if the user had manually clicked OK, so you shouldn't
   * need to use this command unless for some reason you need to change
   * your mind prior to the next confirmation.  After any confirmation, Selenium will resume using the
   * default behavior for future confirmations, automatically returning
   * true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each
   * confirmation.
   * </p><p>
   * Take note - every time a confirmation comes up, you must
   * consume it with a corresponding getConfirmation, or else
   * the next selenium operation will fail.
   * </p>
   */
  public void chooseOkOnNextConfirmation() {
    throw new UnsupportedOperationException("chooseOkOnNextConfirmation");
  }

  /**
   * Instructs Selenium to return the specified answer string in response to
   * the next JavaScript prompt [window.prompt()].
   *
   * @param answer the answer to give in response to the prompt pop-up
   */
  public void answerOnNextPrompt(String answer) {
    throw new UnsupportedOperationException("answerOnNextPrompt");
  }

  /**
   * Simulates the user clicking the "back" button on their browser.
   */
  public void goBack() {
    seleneseMethods.get("goBack").apply(driver);
  }

  /**
   * Simulates the user clicking the "Refresh" button on their browser.
   */
  public void refresh() {
    seleneseMethods.get("refresh").apply(driver);
  }

  /**
   * Simulates the user clicking the "close" button in the titlebar of a popup
   * window or tab.
   */
  public void close() {
    seleneseMethods.get("close").apply(driver);
  }

  /**
   * Has an alert occurred?
   * <p/>
   * <p>
   * This function never throws an exception
   * </p>
   *
   * @return true if there is an alert
   */
  public boolean isAlertPresent() {
    throw new UnsupportedOperationException("isAlertPresent");
  }

  /**
   * Has a prompt occurred?
   * <p/>
   * <p>
   * This function never throws an exception
   * </p>
   *
   * @return true if there is a pending prompt
   */
  public boolean isPromptPresent() {
    throw new UnsupportedOperationException("isPromptPresent");
  }

  /**
   * Has confirm() been called?
   * <p/>
   * <p>
   * This function never throws an exception
   * </p>
   *
   * @return true if there is a pending confirmation
   */
  public boolean isConfirmationPresent() {
    throw new UnsupportedOperationException("isConfirmationPresent");
  }

  /**
   * Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.
   * <p/>
   * <p>Getting an alert has the same effect as manually clicking OK. If an
   * alert is generated but you do not consume it with getAlert, the next Selenium action
   * will fail.</p><p>Under Selenium, JavaScript alerts will NOT pop up a visible alert
   * dialog.</p><p>Selenium does NOT support JavaScript alerts that are generated in a
   * page's onload() event handler. In this case a visible dialog WILL be
   * generated and Selenium will hang until someone manually clicks OK.</p>
   *
   * @return The message of the most recent JavaScript alert
   */
  public String getAlert() {
    throw new UnsupportedOperationException("getAlert");
  }

  /**
   * Retrieves the message of a JavaScript confirmation dialog generated during
   * the previous action.
   * <p/>
   * <p>
   * By default, the confirm function will return true, having the same effect
   * as manually clicking OK. This can be changed by prior execution of the
   * chooseCancelOnNextConfirmation command.
   * </p><p>
   * If an confirmation is generated but you do not consume it with getConfirmation,
   * the next Selenium action will fail.
   * </p><p>
   * NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
   * dialog.
   * </p><p>
   * NOTE: Selenium does NOT support JavaScript confirmations that are
   * generated in a page's onload() event handler. In this case a visible
   * dialog WILL be generated and Selenium will hang until you manually click
   * OK.
   * </p>
   *
   * @return the message of the most recent JavaScript confirmation dialog
   */
  public String getConfirmation() {
    throw new UnsupportedOperationException("getConfirmation");
  }

  /**
   * Retrieves the message of a JavaScript question prompt dialog generated during
   * the previous action.
   * <p/>
   * <p>Successful handling of the prompt requires prior execution of the
   * answerOnNextPrompt command. If a prompt is generated but you
   * do not get/verify it, the next Selenium action will fail.</p><p>NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
   * dialog.</p><p>NOTE: Selenium does NOT support JavaScript prompts that are generated in a
   * page's onload() event handler. In this case a visible dialog WILL be
   * generated and Selenium will hang until someone manually clicks OK.</p>
   *
   * @return the message of the most recent JavaScript question prompt
   */
  public String getPrompt() {
    throw new UnsupportedOperationException("getPrompt");
  }

  /**
   * Gets the absolute URL of the current page.
   *
   * @return the absolute URL of the current page
   */
  public String getLocation() {
    return (String) seleneseMethods.get("getLocation").apply(driver);
  }

  /**
   * Gets the title of the current page.
   *
   * @return the title of the current page
   */
  public String getTitle() {
    return (String) seleneseMethods.get("getTitle").apply(driver);
  }

  /**
   * Gets the entire text of the page.
   *
   * @return the entire text of the page
   */
  public String getBodyText() {
    return (String) seleneseMethods.get("getBodyText").apply(driver);
  }

  /**
   * Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
   * For checkbox/radio elements, the value will be "on" or "off" depending on
   * whether the element is checked or not.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return the element value, or "on/off" for checkbox/radio elements
   */
  public String getValue(String locator) {
    return (String) seleneseMethods.get("getValue").apply(driver, locator);
  }

  /**
   * Gets the text of an element. This works for any element that contains
   * text. This command uses either the textContent (Mozilla-like browsers) or
   * the innerText (IE-like browsers) of the element, which is the rendered
   * text shown to the user.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return the text of the element
   */
  public String getText(String locator) {
    return (String) seleneseMethods.get("getText").apply(driver, locator);
  }

  /**
   * Briefly changes the backgroundColor of the specified element yellow.  Useful for debugging.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
  public void highlight(String locator) {
    seleneseMethods.get("highlight").apply(driver, locator);
  }

  /**
   * Gets the result of evaluating the specified JavaScript snippet.  The snippet may
   * have multiple lines, but only the result of the last line will be returned.
   * <p/>
   * <p>Note that, by default, the snippet will run in the context of the "selenium"
   * object itself, so <code>this</code> will refer to the Selenium object.  Use <code>window</code> to
   * refer to the window of your application, e.g. <code>window.document.getElementById('foo')</code></p><p>If you need to use
   * a locator to refer to a single element in your application page, you can
   * use <code>this.browserbot.findElement("id=foo")</code> where "id=foo" is your locator.</p>
   *
   * @param script the JavaScript snippet to run
   * @return the results of evaluating the snippet
   */
  public String getEval(String script) {
    return (String) seleneseMethods.get("getEval").apply(driver, script);
  }

  /**
   * Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
   *
   * @param locator an <a href="#locators">element locator</a> pointing to a checkbox or radio button
   * @return true if the checkbox is checked, false otherwise
   */
  public boolean isChecked(String locator) {
    return (Boolean) seleneseMethods.get("isChecked").apply(driver, locator);
  }

  /**
   * Gets the text from a cell of a table. The cellAddress syntax
   * tableLocator.row.column, where row and column start at 0.
   *
   * @param tableCellAddress a cell address, e.g. "foo.1.4"
   * @return the text from the specified cell
   */
  public String getTable(String tableCellAddress) {
    return (String) seleneseMethods.get("getTable").apply(driver, tableCellAddress);
  }

  /**
   * Gets all option labels (visible text) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return an array of all selected option labels in the specified select drop-down
   */
  public String[] getSelectedLabels(String selectLocator) {
    return (String[]) seleneseMethods.get("getSelectedLabels").apply(driver, selectLocator);
  }

  /**
   * Gets option label (visible text) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return the selected option label in the specified select drop-down
   */
  public String getSelectedLabel(String selectLocator) {
    return (String) seleneseMethods.get("getSelectedLabel").apply(driver, selectLocator);
  }

  /**
   * Gets all option values (value attributes) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return an array of all selected option values in the specified select drop-down
   */
  public String[] getSelectedValues(String selectLocator) {
    return (String[]) seleneseMethods.get("getSelectedValues").apply(driver, selectLocator);
  }

  /**
   * Gets option value (value attribute) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return the selected option value in the specified select drop-down
   */
  public String getSelectedValue(String selectLocator) {
    return (String) seleneseMethods.get("getSelectedValue").apply(driver, selectLocator);
  }

  /**
   * Gets all option indexes (option number, starting at 0) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return an array of all selected option indexes in the specified select drop-down
   */
  public String[] getSelectedIndexes(String selectLocator) {
    return (String[]) seleneseMethods.get("getSelectedIndexes").apply(driver, selectLocator);
  }

  /**
   * Gets option index (option number, starting at 0) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return the selected option index in the specified select drop-down
   */
  public String getSelectedIndex(String selectLocator) {
    return (String) seleneseMethods.get("getSelectedIndex").apply(driver, selectLocator);
  }

  /**
   * Gets all option element IDs for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return an array of all selected option IDs in the specified select drop-down
   */
  public String[] getSelectedIds(String selectLocator) {
    return (String[]) seleneseMethods.get("getSelectedIds").apply(driver, selectLocator);
  }

  /**
   * Gets option element ID for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return the selected option ID in the specified select drop-down
   */
  public String getSelectedId(String selectLocator) {
    return (String) seleneseMethods.get("getSelectedId").apply(driver, selectLocator);
  }

  /**
   * Determines whether some option in a drop-down menu is selected.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return true if some option has been selected, false otherwise
   */
  public boolean isSomethingSelected(String selectLocator) {
    return (Boolean) seleneseMethods.get("isSomethingSelected").apply(driver, selectLocator);
  }

  /**
   * Gets all option labels in the specified select drop-down.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return an array of all option labels in the specified select drop-down
   */
  public String[] getSelectOptions(String selectLocator) {
    return (String[]) seleneseMethods.get("getSelectOptions").apply(driver, selectLocator);
  }

  /**
   * Gets the value of an element attribute. The value of the attribute may
   * differ across browsers (this is the case for the "style" attribute, for
   * example).
   *
   * @param attributeLocator an element locator followed by an @ sign and then the name of the attribute, e.g. "foo@bar"
   * @return the value of the specified attribute
   */
  public String getAttribute(String attributeLocator) {
    return (String) seleneseMethods.get("getAttribute").apply(driver, attributeLocator);
  }

  /**
   * Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
   *
   * @param pattern a <a href="#patterns">pattern</a> to match with the text of the page
   * @return true if the pattern matches the text, false otherwise
   */
  public boolean isTextPresent(String pattern) {
    return (Boolean) seleneseMethods.get("isTextPresent").apply(driver, pattern);
  }

  /**
   * Verifies that the specified element is somewhere on the page.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return true if the element is present, false otherwise
   */
  public boolean isElementPresent(String locator) {
    return (Boolean) seleneseMethods.get("isElementPresent").apply(driver, locator);
  }

  /**
   * Determines if the specified element is visible. An
   * element can be rendered invisible by setting the CSS "visibility"
   * property to "hidden", or the "display" property to "none", either for the
   * element itself or one if its ancestors.  This method will fail if
   * the element is not present.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return true if the specified element is visible, false otherwise
   */
  public boolean isVisible(String locator) {
    return (Boolean) seleneseMethods.get("isVisible").apply(driver, locator);
  }

  /**
   * Determines whether the specified input element is editable, ie hasn't been disabled.
   * This method will fail if the specified element isn't an input element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return true if the input element is editable, false otherwise
   */
  public boolean isEditable(String locator) {
    return (Boolean) seleneseMethods.get("isEditable").apply(driver, locator);
  }

  /**
   * Returns the IDs of all buttons on the page.
   * <p/>
   * <p>If a given button has no ID, it will appear as "" in this array.</p>
   *
   * @return the IDs of all buttons on the page
   */
  public String[] getAllButtons() {
    return (String[]) seleneseMethods.get("getAllButtons").apply(driver);
  }

  /**
   * Returns the IDs of all links on the page.
   * <p/>
   * <p>If a given link has no ID, it will appear as "" in this array.</p>
   *
   * @return the IDs of all links on the page
   */
  public String[] getAllLinks() {
    return (String[]) seleneseMethods.get("getAllLinks").apply(driver);
  }

  /**
   * Returns the IDs of all input fields on the page.
   * <p/>
   * <p>If a given field has no ID, it will appear as "" in this array.</p>
   *
   * @return the IDs of all field on the page
   */
  public String[] getAllFields() {
    return (String[]) seleneseMethods.get("getAllLinks").apply(driver);
  }

  /**
   * Returns every instance of some attribute from all known windows.
   *
   * @param attributeName name of an attribute on the windows
   * @return the set of values of this attribute from all known windows.
   */
  public String[] getAttributeFromAllWindows(String attributeName) {
    return (String[]) seleneseMethods.get("getAttributeFromAllWindows").apply(driver, attributeName);
  }

  /**
   * deprecated - use dragAndDrop instead
   *
   * @param locator         an element locator
   * @param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
   */
  public void dragdrop(String locator, String movementsString) {
    seleneseMethods.get("dragdrop").apply(driver, locator, movementsString);
  }

  /**
   * Configure the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
   * <p>Setting this value to 0 means that we'll send a "mousemove" event to every single pixel
   * in between the start location and the end location; that can be very slow, and may
   * cause some browsers to force the JavaScript to timeout.</p><p>If the mouse speed is greater than the distance between the two dragged objects, we'll
   * just send one "mousemove" at the start location and then one final one at the end location.</p>
   *
   * @param pixels the number of pixels between "mousemove" events
   */
  public void setMouseSpeed(String pixels) {
    throw new UnsupportedOperationException("setMouseSpeed");
  }

  /**
   * Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
   *
   * @return the number of pixels between "mousemove" events during dragAndDrop commands (default=10)
   */
  public Number getMouseSpeed() {
    throw new UnsupportedOperationException("getMouseSpeed");
  }

  /**
   * Drags an element a certain distance and then drops it
   *
   * @param locator         an element locator
   * @param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
   */
  public void dragAndDrop(String locator, String movementsString) {
    seleneseMethods.get("dragAndDrop").apply(driver, locator, movementsString);
  }

  /**
   * Drags an element and drops it on another element
   *
   * @param locatorOfObjectToBeDragged     an element to be dragged
   * @param locatorOfDragDestinationObject an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged  is dropped
   */
  public void dragAndDropToObject(String locatorOfObjectToBeDragged, String locatorOfDragDestinationObject) {
    seleneseMethods.get("dragAndDropToObject").apply(driver, locatorOfObjectToBeDragged, locatorOfDragDestinationObject);
  }

  /**
   * Gives focus to the currently selected window
   */
  public void windowFocus() {
    seleneseMethods.get("windowFocus").apply(driver);
  }

  /**
   * Resize currently selected window to take up the entire screen
   */
  public void windowMaximize() {
    seleneseMethods.get("windowMaximize").apply(driver);
  }

  /**
   * Returns the IDs of all windows that the browser knows about.
   *
   * @return the IDs of all windows that the browser knows about.
   */
  public String[] getAllWindowIds() {
    return getAttributeFromAllWindows("id");
  }

  /**
   * Returns the names of all windows that the browser knows about.
   *
   * @return the names of all windows that the browser knows about.
   */
  public String[] getAllWindowNames() {
    return getAttributeFromAllWindows("name");
  }

  /**
   * Returns the titles of all windows that the browser knows about.
   *
   * @return the titles of all windows that the browser knows about.
   */
  public String[] getAllWindowTitles() {
    return (String[]) seleneseMethods.get("getAllWindowTitles").apply(driver);
  }

  /**
   * Returns the entire HTML source between the opening and
   * closing "html" tags.
   *
   * @return the entire HTML source
   */
  public String getHtmlSource() {
    return (String) seleneseMethods.get("getHtmlSource").apply(driver);
  }

  /**
   * Moves the text cursor to the specified position in the given input element or textarea.
   * This method will fail if the specified element isn't an input element or textarea.
   *
   * @param locator  an <a href="#locators">element locator</a> pointing to an input element or textarea
   * @param position the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field.
   */
  public void setCursorPosition(String locator, String position) {
    throw new UnsupportedOperationException("setCursorPosition");
  }

  /**
   * Get the relative index of an element to its parent (starting from 0). The comment node and empty text node
   * will be ignored.
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element
   * @return of relative index of the element to its parent (starting from 0)
   */
  public Number getElementIndex(String locator) {
    return (Number) seleneseMethods.get("getElementIndex").apply(driver, locator);
  }

  /**
   * Check if these two elements have same parent and are ordered siblings in the DOM. Two same elements will
   * not be considered ordered.
   *
   * @param locator1 an <a href="#locators">element locator</a> pointing to the first element
   * @param locator2 an <a href="#locators">element locator</a> pointing to the second element
   * @return true if element1 is the previous sibling of element2, false otherwise
   */
  public boolean isOrdered(String locator1, String locator2) {
    return (Boolean) seleneseMethods.get("isOrdered").apply(driver, locator1, locator2);
  }

  /**
   * Retrieves the horizontal position of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
   * @return of pixels from the edge of the frame.
   */
  public Number getElementPositionLeft(String locator) {
    return (Number) seleneseMethods.get("getElementPositionLeft").apply(driver, locator);
  }

  /**
   * Retrieves the vertical position of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
   * @return of pixels from the edge of the frame.
   */
  public Number getElementPositionTop(String locator) {
return (Number) seleneseMethods.get("getElementPositionTop").apply(driver, locator);
  }

  /**
   * Retrieves the width of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element
   * @return width of an element in pixels
   */
  public Number getElementWidth(String locator) {
    return (Number) seleneseMethods.get("getElementWidth").apply(driver, locator);
  }

  /**
   * Retrieves the height of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element
   * @return height of an element in pixels
   */
  public Number getElementHeight(String locator) {
    return (Number) seleneseMethods.get("getElementHeight").apply(driver, locator);
  }

  /**
   * Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.
   * <p/>
   * <p>Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
   * return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as <a href="http://jira.openqa.org/browse/SEL-243">SEL-243</a>.</p>
   * This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an input element or textarea
   * @return the numerical position of the cursor in the field
   */
  public Number getCursorPosition(String locator) {
    throw new UnsupportedOperationException("getCursorPosition");
  }

  /**
   * Returns the specified expression.
   * <p/>
   * <p>This is useful because of JavaScript preprocessing.
   * It is used to generate commands like assertExpression and waitForExpression.</p>
   *
   * @param expression the value to return
   * @return the value passed in
   */
  public String getExpression(String expression) {
    return expression;
  }

  /**
   * Returns the number of nodes that match the specified xpath, eg. "//table" would give
   * the number of tables.
   *
   * @param xpath the xpath expression to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.
   * @return the number of nodes that match the specified xpath
   */
  public Number getXpathCount(String xpath) {
    return (Number) seleneseMethods.get("getXpathCount").apply(driver, xpath);
  }

  /**
   * Temporarily sets the "id" attribute of the specified element, so you can locate it in the future
   * using its ID rather than a slow/complicated XPath.  This ID will disappear once the page is
   * reloaded.
   *
   * @param locator    an <a href="#locators">element locator</a> pointing to an element
   * @param identifier a string to be used as the ID of the specified element
   */
  public void assignId(String locator, String identifier) {
    seleneseMethods.get("assignId").apply(driver, locator, identifier);
  }

  /**
   * Specifies whether Selenium should use the native in-browser implementation
   * of XPath (if any native version is available); if you pass "false" to
   * this function, we will always use our pure-JavaScript xpath library.
   * Using the pure-JS xpath library can improve the consistency of xpath
   * element locators between different browser vendors, but the pure-JS
   * version is much slower than the native implementations.
   *
   * @param allow boolean, true means we'll prefer to use native XPath; false means we'll only use JS XPath
   */
  public void allowNativeXpath(String allow) {
    // no-op
  }

  /**
   * Specifies whether Selenium will ignore xpath attributes that have no
   * value, i.e. are the empty string, when using the non-native xpath
   * evaluation engine. You'd want to do this for performance reasons in IE.
   * However, this could break certain xpaths, for example an xpath that looks
   * for an attribute whose value is NOT the empty string.
   * <p/>
   * The hope is that such xpaths are relatively rare, but the user should
   * have the option of using them. Note that this only influences xpath
   * evaluation when using the ajaxslt engine (i.e. not "javascript-xpath").
   *
   * @param ignore boolean, true means we'll ignore attributes without value                        at the expense of xpath "correctness"; false means                        we'll sacrifice speed for correctness.
   */
  public void ignoreAttributesWithoutValue(String ignore) {
    // no-op
  }

  /**
   * Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
   * The snippet may have multiple lines, but only the result of the last line
   * will be considered.
   * <p/>
   * <p>Note that, by default, the snippet will be run in the runner's test window, not in the window
   * of your application.  To get the window of your application, you can use
   * the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
   * run your JavaScript in there</p>
   *
   * @param script  the JavaScript snippet to run
   * @param timeout a timeout in milliseconds, after which this command will return with an error
   */
  public void waitForCondition(final String script, String timeout) {
    seleneseMethods.get("waitForCondition").apply(driver, script, timeout);
  }
  

  /**
   * Specifies the amount of time that Selenium will wait for actions to complete.
   * <p/>
   * <p>Actions that require waiting include "open" and the "waitFor*" actions.</p>
   * The default timeout is 30 seconds.
   *
   * @param timeout a timeout in milliseconds, after which the action will return with an error
   */
  public void setTimeout(String timeout) {
    seleneseMethods.get("setTimeout").apply(driver, timeout);
  }
  
  /**
   * Waits for a new page to load.
   * <p/>
   * <p>You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
   * (which are only available in the JS API).</p><p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
   * flag when it first notices a page load.  Running any other Selenium command after
   * turns the flag to false.  Hence, if you want to wait for a page to load, you must
   * wait immediately after a Selenium command that caused a page-load.</p>
   *
   * @param timeout a timeout in milliseconds, after which this command will return with an error
   */
  public void waitForPageToLoad(String timeout) {
    seleneseMethods.get("waitForPageToLoad").apply(driver, timeout);
  }

  /**
   * Waits for a new frame to load.
   * <p/>
   * <p>Selenium constantly keeps track of new pages and frames loading,
   * and sets a "newPageLoaded" flag when it first notices a page load.</p>
   * <p/>
   * See waitForPageToLoad for more information.
   *
   * @param frameAddress FrameAddress from the server side
   * @param timeout      a timeout in milliseconds, after which this command will return with an error
   */
  public void waitForFrameToLoad(String frameAddress, String timeout) {
    seleneseMethods.get("waitForFrameToLoad").apply(driver, frameAddress, timeout);
  }

  /**
   * Return all cookies of the current page under test.
   *
   * @return all cookies of the current page under test
   */
  public String getCookie() {
    return (String) seleneseMethods.get("getCookie").apply(driver);
  }

  /**
   * Returns the value of the cookie with the specified name, or throws an error if the cookie is not present.
   *
   * @param name the name of the cookie
   * @return the value of the cookie
   */
  public String getCookieByName(String name) {
    return (String) seleneseMethods.get("getCookieByName").apply(driver, name);
  }

  /**
   * Returns true if a cookie with the specified name is present, or false otherwise.
   *
   * @param name the name of the cookie
   * @return true if a cookie with the specified name is present, or false otherwise.
   */
  public boolean isCookiePresent(String name) {
    return (Boolean) seleneseMethods.get("isCookiePresent").apply(driver, name);
  }

  /**
   * Create a new cookie whose path and domain are same with those of current page
   * under test, unless you specified a path for this cookie explicitly.
   *
   * @param nameValuePair name and value of the cookie in a format "name=value"
   * @param optionsString options for the cookie. Currently supported options include 'path', 'max_age' and 'domain'.      the optionsString's format is "path=/path/, max_age=60, domain=.foo.com". The order of options are irrelevant, the unit      of the value of 'max_age' is second.  Note that specifying a domain that isn't a subset of the current domain will      usually fail.
   */
  public void createCookie(String nameValuePair, String optionsString) {
    seleneseMethods.get("createCookie").apply(driver, nameValuePair, optionsString);
  }

  /**
   * Delete a named cookie with specified path and domain.  Be careful; to delete a cookie, you
   * need to delete it using the exact same path and domain that were used to create the cookie.
   * If the path is wrong, or the domain is wrong, the cookie simply won't be deleted.  Also
   * note that specifying a domain that isn't a subset of the current domain will usually fail.
   * <p/>
   * Since there's no way to discover at runtime the original path and domain of a given cookie,
   * we've added an option called 'recurse' to try all sub-domains of the current domain with
   * all paths that are a subset of the current path.  Beware; this option can be slow.  In
   * big-O notation, it operates in O(n*m) time, where n is the number of dots in the domain
   * name and m is the number of slashes in the path.
   *
   * @param name          the name of the cookie to be deleted
   * @param optionsString options for the cookie. Currently supported options include 'path', 'domain'      and 'recurse.' The optionsString's format is "path=/path/, domain=.foo.com, recurse=true".      The order of options are irrelevant. Note that specifying a domain that isn't a subset of      the current domain will usually fail.
   */
  public void deleteCookie(String name, String optionsString) {
    seleneseMethods.get("deleteCookie").apply(driver, name);
  }

  /**
   * Calls deleteCookie with recurse=true on all cookies visible to the current page.
   * As noted on the documentation for deleteCookie, recurse=true can be much slower
   * than simply deleting the cookies using a known domain/path.
   */
  public void deleteAllVisibleCookies() {
    seleneseMethods.get("deleteAllVisibleCookies").apply(driver);
  }

  /**
   * Sets the threshold for browser-side logging messages; log messages beneath this threshold will be discarded.
   * Valid logLevel strings are: "debug", "info", "warn", "error" or "off".
   * To see the browser logs, you need to
   * either show the log window in GUI mode, or enable browser-side logging in Selenium RC.
   *
   * @param logLevel one of the following: "debug", "info", "warn", "error" or "off"
   */
  public void setBrowserLogLevel(String logLevel) {
    seleneseMethods.get("setBrowserLogLevel").apply(driver, logLevel);
  }

  /**
   * Creates a new "script" tag in the body of the current test window, and
   * adds the specified text into the body of the command.  Scripts run in
   * this way can often be debugged more easily than scripts executed using
   * Selenium's "getEval" command.  Beware that JS exceptions thrown in these script
   * tags aren't managed by Selenium, so you should probably wrap your script
   * in try/catch blocks if there is any chance that the script will throw
   * an exception.
   *
   * @param script the JavaScript snippet to run
   */
  public void runScript(String script) {
    seleneseMethods.get("runScript").apply(driver, script);
  }

  /**
   * Defines a new function for Selenium to locate elements on the page.
   * For example,
   * if you define the strategy "foo", and someone runs click("foo=blah"), we'll
   * run your function, passing you the string "blah", and click on the element
   * that your function
   * returns, or throw an "Element not found" error if your function returns null.
   * <p/>
   * We'll pass three arguments to your function:
   * <ul><li>locator: the string the user passed in</li><li>inWindow: the currently selected window</li><li>inDocument: the currently selected document</li></ul>
   * The function must return null if the element can't be found.
   *
   * @param strategyName       the name of the strategy to define; this should use only   letters [a-zA-Z] with no spaces or other punctuation.
   * @param functionDefinition a string defining the body of a function in JavaScript.   For example: <code>return inDocument.getElementById(locator);</code>
   */
  public void addLocationStrategy(String strategyName, final String functionDefinition) {
    seleneseMethods.get("addLocationStrategy").apply(driver, strategyName, functionDefinition);
  }

  /**
   * Saves the entire contents of the current window canvas to a PNG file.
   * Contrast this with the captureScreenshot command, which captures the
   * contents of the OS viewport (i.e. whatever is currently being displayed
   * on the monitor), and is implemented in the RC only. Currently this only
   * works in Firefox when running in chrome mode, and in IE non-HTA using
   * the EXPERIMENTAL "Snapsie" utility. The Firefox implementation is mostly
   * borrowed from the Screengrab! Firefox extension. Please see
   * http://www.screengrab.org and http://snapsie.sourceforge.net/ for
   * details.
   *
   * @param filename the path to the file to persist the screenshot as. No                  filename extension will be appended by default.                  Directories will not be created if they do not exist,                    and an exception will be thrown, possibly by native                  code.
   * @param kwargs   a kwargs string that modifies the way the screenshot                  is captured. Example: "background=#CCFFDD" .                  Currently valid options:                  <dl><dt>background</dt><dd>the background CSS for the HTML document. This                     may be useful to set for capturing screenshots of                     less-than-ideal layouts, for example where absolute                     positioning causes the calculation of the canvas                     dimension to fail and a black background is exposed                     (possibly obscuring black text).</dd></dl>
   */
  public void captureEntirePageScreenshot(String filename, String kwargs) {
    throw new UnsupportedOperationException("captureEntirePageScreenshot");
  }

  /**
   * Executes a command rollup, which is a series of commands with a unique
   * name, and optionally arguments that control the generation of the set of
   * commands. If any one of the rolled-up commands fails, the rollup is
   * considered to have failed. Rollups may also contain nested rollups.
   *
   * @param rollupName the name of the rollup command
   * @param kwargs     keyword arguments string that influences how the                    rollup expands into commands
   */
  public void rollup(String rollupName, String kwargs) {
    throw new UnsupportedOperationException("rollup");
  }

  /**
   * Allows choice of one of the available libraries.
   *
   * @param libraryName name of the desired library Only the following two can be chosen:   ajaxslt - Google's library   javascript - Cybozu Labs' faster library The default library is ajaxslt. If libraryName isn't one of them, then  no change will be made.
   */
  public void useXpathLibrary(String libraryName) {
    seleneseMethods.get("useXpathLibrary").apply(driver, libraryName);
  }

  /**
   * Writes a message to the status bar and adds a note to the browser-side
   * log.
   *
   * @param context the message to be sent to the browser
   */
  public void setContext(String context) {
    seleneseMethods.get("setContext").apply(driver, context);
  }

  /**
   * Sets a file input (upload) field to the file listed in fileLocator
   *
   * @param fieldLocator an <a href="#locators">element locator</a>
   * @param fileLocator  a URL pointing to the specified file. Before the file  can be set in the input field (fieldLocator), Selenium RC may need to transfer the file    to the local machine before attaching the file in a web page form. This is common in selenium  grid configurations where the RC server driving the browser is not the same  machine that started the test.   Supported Browsers: Firefox ("*chrome") only.
   */
  public void attachFile(String fieldLocator, String fileLocator) {
    seleneseMethods.get("attachFile").apply(driver, fieldLocator);
  }

  /**
   * Captures a PNG screenshot to the specified file.
   *
   * @param filename the absolute path to the file to be written, e.g. "c:\blah\screenshot.png"
   */
  public void captureScreenshot(String filename) {
    throw new UnsupportedOperationException("captureScreenshot");
  }

  /**
   * Capture a PNG screenshot.  It then returns the file as a base 64 encoded string.
   *
   * @return The base 64 encoded string of the screen shot (PNG file)
   */
  public String captureScreenshotToString() {
    throw new UnsupportedOperationException("captureScreenshotToString");
  }

  /**
   * Returns the network traffic seen by the browser, including headers,
   * AJAX requests, status codes, and timings. When this function is called,
   * the traffic log is cleared, so the returned content is only the traffic
   * seen since the last call.
   *
   * @param type The type of data to return the network traffic as.
   *             Valid values are: json, xml, or plain.
   * @return A string representation in the defined type of the network traffic seen by the browser.
   */
  public String captureNetworkTraffic(String type) {
    throw new UnsupportedOperationException("Not implemented yet.");
  }
    
  /**
   * Downloads a screenshot of the browser current window canvas to a
   * based 64 encoded PNG file. The <em>entire</em> windows canvas is captured,
   * including parts rendered outside of the current view port.
   * <p/>
   * Currently this only works in Mozilla and when running in chrome mode.
   *
   * @param kwargs A kwargs string that modifies the way the screenshot is captured. Example: "background=#CCFFDD". This may be useful to set for capturing screenshots of less-than-ideal layouts, for example where absolute positioning causes the calculation of the canvas dimension to fail and a black background is exposed  (possibly obscuring black text).
   * @return The base 64 encoded string of the page screenshot (PNG file)
   */
  public String captureEntirePageScreenshotToString(String kwargs) {
    throw new UnsupportedOperationException("captureEntirePageScreenshotToString");
  }

  /**
   * Kills the running Selenium Server and all browser sessions.  After you run this command, you will no longer be able to send
   * commands to the server; you can't remotely start the server once it has been stopped.  Normally
   * you should prefer to run the "stop" command, which terminates the current browser session, rather than
   * shutting down the entire server.
   */
  public void shutDownSeleniumServer() {
    driver.quit();
  }

  /**
   * Retrieve the last messages logged on a specific remote control. Useful for error reports, especially
   * when running multiple remote controls in a distributed environment. The maximum number of log messages
   * that can be retrieve is configured on remote control startup.
   *
   * @return The last N log messages as a multi-line string.
   */
  public String retrieveLastRemoteControlLogs() {
    throw new UnsupportedOperationException("retrieveLastRemoteControlLogs");
  }

  /**
   * Simulates a user pressing a key (without releasing it yet) by sending a native operating system keystroke.
   * This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
   * a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
   * metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
   * element, focus on the element first before running this command.
   *
   * @param keycode an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
   */
  public void keyDownNative(String keycode) {
    throw new UnsupportedOperationException("keyDownNative");
  }

  /**
   * Simulates a user releasing a key by sending a native operating system keystroke.
   * This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
   * a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
   * metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
   * element, focus on the element first before running this command.
   *
   * @param keycode an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
   */
  public void keyUpNative(String keycode) {
    throw new UnsupportedOperationException("keyUpNative");
  }

  /**
   * Simulates a user pressing and releasing a key by sending a native operating system keystroke.
   * This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
   * a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
   * metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
   * element, focus on the element first before running this command.
   *
   * @param keycode an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
   */
  public void keyPressNative(String keycode) {
    throw new UnsupportedOperationException("keyPressNative");
  }

  public void captureEntirePageScreenshot(String s) {
      throw new UnsupportedOperationException("captureEntirePageScreenshot");
  }

  public void addScript(String arg0, String arg1) {
      throw new UnsupportedOperationException("Selenium.addScript() not implemented yet.");
  }

  public void removeScript(String arg0) {
      throw new UnsupportedOperationException("Selenium.removeScript() not implemented yet.");
  }

  public void addCustomRequestHeader(String s, String s1) {
    throw new UnsupportedOperationException("Selenium.addCustomRequestHeader() not implemented yet.");
  }

  private void setUpMethodMap() {
    // TODO(simon): Switch to wrapping all calls in a timed future
    // Default to 30 seconds on the timer
    Timer timer = new Timer(30000);
    SeleniumSelect select = new SeleniumSelect(elementFinder);
    Windows windows = new Windows(driver);

    // Note the we use the names used by the CommandProcessor
    // TODO(simon): Add a "getCommandProcessor" method to DefaultSelenium and move this to a
    //              command processor
    seleneseMethods.put("addLocationStrategy", new AddLocationStrategy(elementFinder));
    seleneseMethods.put("addSelection", new AddSelection(elementFinder, select));
    seleneseMethods.put("altKeyDown", new AltKeyDown(keyState));
    seleneseMethods.put("altKeyUp", new AltKeyUp(keyState));
    seleneseMethods.put("assignId", new AssignId(javascriptLibrary, elementFinder));
    seleneseMethods.put("attachFile", new AttachFile(elementFinder));
    seleneseMethods.put("click", new Click(elementFinder));
    seleneseMethods.put("check", new Check(elementFinder));
    seleneseMethods.put("close", new Close());
    seleneseMethods.put("createCookie", new CreateCookie());
    seleneseMethods.put("controlKeyDown", new ControlKeyDown(keyState));
    seleneseMethods.put("controlKeyUp", new ControlKeyUp(keyState));
    seleneseMethods.put("deleteAllVisibleCookies", new DeleteAllVisibleCookies());
    seleneseMethods.put("deleteCookie", new DeleteCookie());
    seleneseMethods.put("doubleClick", new DoubleClick(elementFinder));
    seleneseMethods.put("dragdrop", new DragAndDrop(elementFinder));
    seleneseMethods.put("dragAndDrop", new DragAndDrop(elementFinder));
    seleneseMethods.put("dragAndDropToObject", new DragAndDropToObject(elementFinder));
    seleneseMethods.put("fireEvent", new FireEvent(elementFinder, javascriptLibrary));
    seleneseMethods.put("focus", new FireNamedEvent(elementFinder, javascriptLibrary, "focus"));
    seleneseMethods.put("getAllButtons", new GetAllButtons());
    seleneseMethods.put("getAllFields", new GetAllFields());
    seleneseMethods.put("getAllLinks", new GetAllLinks());
    seleneseMethods.put("getAllWindowTitles", new GetAllWindowTitles());
    seleneseMethods.put("getAttribute", new GetAttribute(elementFinder));
    seleneseMethods.put("getAttributeFromAllWindows", new GetAttributeFromAllWindows());
    seleneseMethods.put("getBodyText", new GetBodyText());
    seleneseMethods.put("getCookie", new GetCookie());
    seleneseMethods.put("getCookieByName", new GetCookieByName());
    seleneseMethods.put("getElementHeight", new GetElementHeight(elementFinder));
    seleneseMethods.put("getElementIndex", new GetElementIndex(elementFinder, javascriptLibrary));
    seleneseMethods.put("getElementPositionLeft", new GetElementPositionLeft(elementFinder));
    seleneseMethods.put("getElementPositionTop", new GetElementPositionTop(elementFinder));
    seleneseMethods.put("getElementWidth", new GetElementWidth(elementFinder));
    seleneseMethods.put("getEval", new GetEval());
    seleneseMethods.put("getHtmlSource", new GetHtmlSource());
    seleneseMethods.put("getLocation", new GetLocation());
    seleneseMethods.put("getSelectedId", new FindFirstSelectedOptionProperty(select, ID));
    seleneseMethods.put("getSelectedIds", new FindSelectedOptionProperties(select, ID));
    seleneseMethods.put("getSelectedIndex", new FindFirstSelectedOptionProperty(select, INDEX));
    seleneseMethods.put("getSelectedIndexes", new FindSelectedOptionProperties(select, INDEX));
    seleneseMethods.put("getSelectedLabel", new FindFirstSelectedOptionProperty(select, TEXT));
    seleneseMethods.put("getSelectedLabels", new FindSelectedOptionProperties(select, TEXT));
    seleneseMethods.put("getSelectedValue", new FindFirstSelectedOptionProperty(select, VALUE));
    seleneseMethods.put("getSelectedValues", new FindSelectedOptionProperties(select, VALUE));
    seleneseMethods.put("getSelectOptions", new GetSelectOptions(select));
    seleneseMethods.put("getSpeed", new NoOp("0"));
    seleneseMethods.put("getTable", new GetTable(elementFinder, javascriptLibrary));
    seleneseMethods.put("getText", new GetText(elementFinder));
    seleneseMethods.put("getTitle", new GetTitle());
    seleneseMethods.put("getValue", new GetValue(elementFinder));
    seleneseMethods.put("getXpathCount", new GetXpathCount());
    seleneseMethods.put("goBack", new GoBack(timer));
    seleneseMethods.put("highlight", new Highlight(elementFinder, javascriptLibrary));
    seleneseMethods.put("isChecked", new IsChecked(elementFinder));
    seleneseMethods.put("isCookiePresent", new IsCookiePresent());
    seleneseMethods.put("isEditable", new IsEditable(elementFinder));
    seleneseMethods.put("isElementPresent", new IsElementPresent(elementFinder));
    seleneseMethods.put("isOrdered", new IsOrdered(elementFinder, javascriptLibrary));
    seleneseMethods.put("isSomethingSelected", new IsSomethingSelected(select));
    seleneseMethods.put("isTextPresent", new IsTextPresent());
    seleneseMethods.put("isVisible", new IsVisible(elementFinder));
    seleneseMethods.put("keyDown", new KeyEvent(elementFinder, javascriptLibrary, keyState, "doKeyDown"));
    seleneseMethods.put("keyPress", new TypeKeys(elementFinder));
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
    seleneseMethods.put("open", new Open(timer, baseUrl));
    seleneseMethods.put("openWindow", new OpenWindow(timer, new GetEval()));
    seleneseMethods.put("refresh", new Refresh(timer));
    seleneseMethods.put("removeAllSelections", new RemoveAllSelections(elementFinder));
    seleneseMethods.put("removeSelection", new RemoveSelection(elementFinder, select));
    seleneseMethods.put("runScript", new RunScript(javascriptLibrary));
    seleneseMethods.put("select", new SelectOption(select));
    seleneseMethods.put("selectFrame", new SelectFrame(windows));
    seleneseMethods.put("selectWindow", new SelectWindow(windows));
    seleneseMethods.put("setBrowserLogLevel", new NoOp(null));
    seleneseMethods.put("setContext", new NoOp(null));
    seleneseMethods.put("setSpeed", new NoOp(null));
    seleneseMethods.put("setTimeout", new SetTimeout(timer));
    seleneseMethods.put("shiftKeyDown", new ShiftKeyDown(keyState));
    seleneseMethods.put("shiftKeyUp", new ShiftKeyUp(keyState));
    seleneseMethods.put("submit", new Submit(elementFinder));
    seleneseMethods.put("type", new Type(javascriptLibrary, elementFinder, keyState));
    seleneseMethods.put("typeKeys", new TypeKeys(elementFinder));
    seleneseMethods.put("uncheck", new Uncheck(elementFinder));
    seleneseMethods.put("useXpathLibrary", new NoOp(null));
    seleneseMethods.put("waitForCondition", new WaitForCondition(timer));
    seleneseMethods.put("waitForFrameToLoad", new NoOp(null));
    seleneseMethods.put("waitForPageToLoad", new WaitForPageToLoad());
    seleneseMethods.put("waitForPopUp", new WaitForPopup(timer, windows));
    seleneseMethods.put("windowFocus", new WindowFocus(javascriptLibrary));
    seleneseMethods.put("windowMaximize", new WindowMaximize(javascriptLibrary));
  }
}
