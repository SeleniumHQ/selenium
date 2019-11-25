// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package com.thoughtworks.selenium;

import org.openqa.selenium.Capabilities;

/**
 * The default implementation of the Selenium interface; <i>end users will primarily interact with
 * this object.</i>
 *
 * @deprecated The RC interface will be removed in Selenium 3.0. Please migrate to using WebDriver.
 */
@Deprecated
public class DefaultSelenium implements Selenium {

  protected CommandProcessor commandProcessor;

  /**
   * Uses a CommandBridgeClient, specifying a server host/port, a command to launch the browser, and
   * a starting URL for the browser.
   *
   * <p>
   * <i>browserStartCommand</i> may be any one of the following:
   * <ul>
   * <li><code>*firefox [absolute path]</code> - Automatically launch a new Firefox process using a
   * custom Firefox profile. This profile will be automatically configured to use the Selenium
   * Server as a proxy and to have all annoying prompts ("save your password?" "forms are insecure"
   * "make Firefox your default browser?" disabled. You may optionally specify an absolute path to
   * your firefox executable, or just say "*firefox". If no absolute path is specified, we'll look
   * for firefox.exe in a default location (normally c:\program files\mozilla firefox\firefox.exe),
   * which you can override by setting the Java system property <code>firefoxDefaultPath</code> to
   * the correct path to Firefox.</li>
   * <li><code>*iexplore [absolute path]</code> - Automatically launch a new Internet Explorer
   * process using custom Windows registry settings. This process will be automatically configured
   * to use the Selenium Server as a proxy and to have all annoying prompts ("save your password?"
   * "forms are insecure" "make Firefox your default browser?" disabled. You may optionally specify
   * an absolute path to your iexplore executable, or just say "*iexplore". If no absolute path is
   * specified, we'll look for iexplore.exe in a default location (normally c:\program
   * files\internet explorer\iexplore.exe), which you can override by setting the Java system
   * property <code>iexploreDefaultPath</code> to the correct path to Internet Explorer.</li>
   * <li><code>/path/to/my/browser [other arguments]</code> - You may also simply specify the
   * absolute path to your browser executable, or use a relative path to your executable (which
   * we'll try to find on your path). <b>Warning:</b> If you specify your own custom browser, it's
   * up to you to configure it correctly. At a minimum, you'll need to configure your browser to use
   * the Selenium Server as a proxy, and disable all browser-specific prompting.
   * </ul>
   *
   * @param serverHost the host name on which the Selenium Server resides
   * @param serverPort the port on which the Selenium Server is listening
   * @param browserStartCommand the command string used to launch the browser, e.g. "*firefox",
   *        "*iexplore" or "c:\\program files\\internet explorer\\iexplore.exe"
   * @param browserURL the starting URL including just a domain name. We'll start the browser
   *        pointing at the Selenium resources on this URL, e.g. "http://www.google.com" would send
   *        the browser to "http://www.google.com/selenium-server/SeleneseRunner.html"
   */
  public DefaultSelenium(String serverHost, int serverPort, String browserStartCommand,
      String browserURL) {
    this.commandProcessor =
        detectCommandProcessor(serverHost, serverPort, browserStartCommand, browserURL);
  }

  private CommandProcessor detectCommandProcessor(String serverHost, int serverPort,
      String browserStartCommand, String browserURL) {
    return new HttpCommandProcessor(serverHost, serverPort, browserStartCommand, browserURL);
  }

  /** Uses an arbitrary CommandProcessor
   *  @param processor Command Processor to use
   */
  public DefaultSelenium(CommandProcessor processor) {
    this.commandProcessor = processor;
  }

  /**
   * Allows javascript to be specified for the test on a per-browser session basis. The javascript
   * will be in-play the next time a session is created; that is, typically the next time
   * <code>start()</code> is invoked (and <code>getNewBrowserSession</code> is sent to the RC under
   * the sheets).
   *
   * @param extensionJs a string representing the extra extension javascript to include in the
   *        browser session. This is in addition to any specified via the -userExtensions switch
   *        when starting the RC.
   */
  @Override
  public void setExtensionJs(String extensionJs) {
    commandProcessor.setExtensionJs(extensionJs);
  }

  @Override
  public void start() {
    try {
      commandProcessor.start();
    } catch (Exception e) {
      final String message = e.getMessage();
      if (message != null && message.startsWith("Connection refused")) {
        throw new RuntimeException("Could not contact Selenium Server; have you started it on '" +
            commandProcessor.getRemoteControlServerLocation() +
            "' ?\nRead more at https://selenium.dev/documentation/en/legacy_docs/selenium_rc/#unable-to-connect-to-server\n" +
            e.getMessage());
      }
      throw new RuntimeException("Could not start Selenium session: " + e.getMessage(), e);
    }
  }

  @Override
  public void start(String optionsString) {
    try {
      commandProcessor.start(optionsString);
    }
    // TODO: EB Add exception catching for bad BrowserConfigurationOptions (i.e. Extension Not
    // Found)
    catch (Exception e) {
      final String message = e.getMessage();
      if (message != null && message.indexOf("Connection refused: connect") != -1) {
        throw new RuntimeException("Could not contact Selenium Server; have you started it?\n" +
            e.getMessage());
      }
      throw new RuntimeException("Could not start Selenium session: " + e.getMessage(), e);
    }
  }

  @Override
  public void start(Object optionsObject) {
    if (optionsObject instanceof Capabilities) {
      Object id = ((Capabilities) optionsObject).getCapability("webdriver.remote.sessionid");
      start("webdriver.remote.sessionid=" + id);
    } else {
      start(optionsObject.toString());
    }
  }

  @Override
  public void stop() {
    commandProcessor.stop();
  }

  @Override
  public void showContextualBanner() {

    try {
      StackTraceElement[] e = Thread.currentThread().getStackTrace();

      String className = null;
      String methodName = null;

      for (int i = 0; i < e.length; i++) {
        if (e[i].getClassName().equals("java.lang.Thread")
            || e[i].getMethodName().equals("showContextualBanner")) {
          continue;
        }
        className = e[i].getClassName();
        methodName = e[i].getMethodName();
        break;
      }
      showContextualBanner(className, methodName);
    } catch (Exception e) {
      this.setContext("<unknown context>");
    }

  }

  @Override
  public void showContextualBanner(String className, String methodName) {

    StringBuilder context = new StringBuilder().append(className).append(": ");

    boolean lastOneWasUpperCase = false;
    boolean nextOneIsUpperCase = false;
    int len = methodName.length();
    for (int i = 0; i < len; i++) {
      char ch = methodName.charAt(i);
      nextOneIsUpperCase = i >= len - 1 || Character.isUpperCase(methodName.charAt(i + 1));

      if ((Character.isUpperCase(ch) && (!lastOneWasUpperCase || !nextOneIsUpperCase))) {
        context.append(" ");
        lastOneWasUpperCase = true;
      }
      if (!Character.isUpperCase(ch)) {
        lastOneWasUpperCase = false;
      }
      context.append(ch);
    }
    this.setContext(context.toString());

  }



  @Override
  public void click(String locator) {
    commandProcessor.doCommand("click", new String[] {locator,});
  }

  @Override
  public void doubleClick(String locator) {
    commandProcessor.doCommand("doubleClick", new String[] {locator,});
  }

  @Override
  public void contextMenu(String locator) {
    commandProcessor.doCommand("contextMenu", new String[] {locator,});
  }

  @Override
  public void clickAt(String locator, String coordString) {
    commandProcessor.doCommand("clickAt", new String[] {locator, coordString,});
  }

  @Override
  public void doubleClickAt(String locator, String coordString) {
    commandProcessor.doCommand("doubleClickAt", new String[] {locator, coordString,});
  }

  @Override
  public void contextMenuAt(String locator, String coordString) {
    commandProcessor.doCommand("contextMenuAt", new String[] {locator, coordString,});
  }

  @Override
  public void fireEvent(String locator, String eventName) {
    commandProcessor.doCommand("fireEvent", new String[] {locator, eventName,});
  }

  @Override
  public void focus(String locator) {
    commandProcessor.doCommand("focus", new String[] {locator,});
  }

  @Override
  public void keyPress(String locator, String keySequence) {
    commandProcessor.doCommand("keyPress", new String[] {locator, keySequence,});
  }

  @Override
  public void shiftKeyDown() {
    commandProcessor.doCommand("shiftKeyDown", new String[] {});
  }

  @Override
  public void shiftKeyUp() {
    commandProcessor.doCommand("shiftKeyUp", new String[] {});
  }

  @Override
  public void metaKeyDown() {
    commandProcessor.doCommand("metaKeyDown", new String[] {});
  }

  @Override
  public void metaKeyUp() {
    commandProcessor.doCommand("metaKeyUp", new String[] {});
  }

  @Override
  public void altKeyDown() {
    commandProcessor.doCommand("altKeyDown", new String[] {});
  }

  @Override
  public void altKeyUp() {
    commandProcessor.doCommand("altKeyUp", new String[] {});
  }

  @Override
  public void controlKeyDown() {
    commandProcessor.doCommand("controlKeyDown", new String[] {});
  }

  @Override
  public void controlKeyUp() {
    commandProcessor.doCommand("controlKeyUp", new String[] {});
  }

  @Override
  public void keyDown(String locator, String keySequence) {
    commandProcessor.doCommand("keyDown", new String[] {locator, keySequence,});
  }

  @Override
  public void keyUp(String locator, String keySequence) {
    commandProcessor.doCommand("keyUp", new String[] {locator, keySequence,});
  }

  @Override
  public void mouseOver(String locator) {
    commandProcessor.doCommand("mouseOver", new String[] {locator,});
  }

  @Override
  public void mouseOut(String locator) {
    commandProcessor.doCommand("mouseOut", new String[] {locator,});
  }

  @Override
  public void mouseDown(String locator) {
    commandProcessor.doCommand("mouseDown", new String[] {locator,});
  }

  @Override
  public void mouseDownRight(String locator) {
    commandProcessor.doCommand("mouseDownRight", new String[] {locator,});
  }

  @Override
  public void mouseDownAt(String locator, String coordString) {
    commandProcessor.doCommand("mouseDownAt", new String[] {locator, coordString,});
  }

  @Override
  public void mouseDownRightAt(String locator, String coordString) {
    commandProcessor.doCommand("mouseDownRightAt", new String[] {locator, coordString,});
  }

  @Override
  public void mouseUp(String locator) {
    commandProcessor.doCommand("mouseUp", new String[] {locator,});
  }

  @Override
  public void mouseUpRight(String locator) {
    commandProcessor.doCommand("mouseUpRight", new String[] {locator,});
  }

  @Override
  public void mouseUpAt(String locator, String coordString) {
    commandProcessor.doCommand("mouseUpAt", new String[] {locator, coordString,});
  }

  @Override
  public void mouseUpRightAt(String locator, String coordString) {
    commandProcessor.doCommand("mouseUpRightAt", new String[] {locator, coordString,});
  }

  @Override
  public void mouseMove(String locator) {
    commandProcessor.doCommand("mouseMove", new String[] {locator,});
  }

  @Override
  public void mouseMoveAt(String locator, String coordString) {
    commandProcessor.doCommand("mouseMoveAt", new String[] {locator, coordString,});
  }

  @Override
  public void type(String locator, String value) {
    commandProcessor.doCommand("type", new String[] {locator, value,});
  }

  @Override
  public void typeKeys(String locator, String value) {
    commandProcessor.doCommand("typeKeys", new String[] {locator, value,});
  }

  @Override
  public void setSpeed(String value) {
    commandProcessor.doCommand("setSpeed", new String[] {value,});
  }

  @Override
  public String getSpeed() {
    return commandProcessor.getString("getSpeed", new String[] {});
  }

  @Override
  public String getLog() {
    return commandProcessor.getString("getLog", new String[] {});
  }

  @Override
  public void check(String locator) {
    commandProcessor.doCommand("check", new String[] {locator,});
  }

  @Override
  public void uncheck(String locator) {
    commandProcessor.doCommand("uncheck", new String[] {locator,});
  }

  @Override
  public void select(String selectLocator, String optionLocator) {
    commandProcessor.doCommand("select", new String[] {selectLocator, optionLocator,});
  }

  @Override
  public void addSelection(String locator, String optionLocator) {
    commandProcessor.doCommand("addSelection", new String[] {locator, optionLocator,});
  }

  @Override
  public void removeSelection(String locator, String optionLocator) {
    commandProcessor.doCommand("removeSelection", new String[] {locator, optionLocator,});
  }

  @Override
  public void removeAllSelections(String locator) {
    commandProcessor.doCommand("removeAllSelections", new String[] {locator,});
  }

  @Override
  public void submit(String formLocator) {
    commandProcessor.doCommand("submit", new String[] {formLocator,});
  }

  @Override
  public void open(String url, String ignoreResponseCode) {
    commandProcessor.doCommand("open", new String[] {url, ignoreResponseCode});
  }

  @Override
  public void open(String url) {
    commandProcessor.doCommand("open", new String[] {url,});
  }

  @Override
  public void openWindow(String url, String windowID) {
    commandProcessor.doCommand("openWindow", new String[] {url, windowID,});
  }

  @Override
  public void selectWindow(String windowID) {
    commandProcessor.doCommand("selectWindow", new String[] {windowID,});
  }

  @Override
  public void selectPopUp(String windowID) {
    commandProcessor.doCommand("selectPopUp", new String[] {windowID,});
  }

  @Override
  public void deselectPopUp() {
    commandProcessor.doCommand("deselectPopUp", new String[] {});
  }

  @Override
  public void selectFrame(String locator) {
    commandProcessor.doCommand("selectFrame", new String[] {locator,});
  }

  @Override
  public boolean getWhetherThisFrameMatchFrameExpression(String currentFrameString, String target) {
    return commandProcessor.getBoolean("getWhetherThisFrameMatchFrameExpression", new String[] {
        currentFrameString, target,});
  }

  @Override
  public boolean getWhetherThisWindowMatchWindowExpression(String currentWindowString, String target) {
    return commandProcessor.getBoolean("getWhetherThisWindowMatchWindowExpression", new String[] {
        currentWindowString, target,});
  }

  @Override
  public void waitForPopUp(String windowID, String timeout) {
    commandProcessor.doCommand("waitForPopUp", new String[] {windowID, timeout,});
  }

  @Override
  public void chooseCancelOnNextConfirmation() {
    commandProcessor.doCommand("chooseCancelOnNextConfirmation", new String[] {});
  }

  @Override
  public void chooseOkOnNextConfirmation() {
    commandProcessor.doCommand("chooseOkOnNextConfirmation", new String[] {});
  }

  @Override
  public void answerOnNextPrompt(String answer) {
    commandProcessor.doCommand("answerOnNextPrompt", new String[] {answer,});
  }

  @Override
  public void goBack() {
    commandProcessor.doCommand("goBack", new String[] {});
  }

  @Override
  public void refresh() {
    commandProcessor.doCommand("refresh", new String[] {});
  }

  @Override
  public void close() {
    commandProcessor.doCommand("close", new String[] {});
  }

  @Override
  public boolean isAlertPresent() {
    return commandProcessor.getBoolean("isAlertPresent", new String[] {});
  }

  @Override
  public boolean isPromptPresent() {
    return commandProcessor.getBoolean("isPromptPresent", new String[] {});
  }

  @Override
  public boolean isConfirmationPresent() {
    return commandProcessor.getBoolean("isConfirmationPresent", new String[] {});
  }

  @Override
  public String getAlert() {
    return commandProcessor.getString("getAlert", new String[] {});
  }

  @Override
  public String getConfirmation() {
    return commandProcessor.getString("getConfirmation", new String[] {});
  }

  @Override
  public String getPrompt() {
    return commandProcessor.getString("getPrompt", new String[] {});
  }

  @Override
  public String getLocation() {
    return commandProcessor.getString("getLocation", new String[] {});
  }

  @Override
  public String getTitle() {
    return commandProcessor.getString("getTitle", new String[] {});
  }

  @Override
  public String getBodyText() {
    return commandProcessor.getString("getBodyText", new String[] {});
  }

  @Override
  public String getValue(String locator) {
    return commandProcessor.getString("getValue", new String[] {locator,});
  }

  @Override
  public String getText(String locator) {
    return commandProcessor.getString("getText", new String[] {locator,});
  }

  @Override
  public void highlight(String locator) {
    commandProcessor.doCommand("highlight", new String[] {locator,});
  }

  @Override
  public String getEval(String script) {
    return commandProcessor.getString("getEval", new String[] {script,});
  }

  @Override
  public boolean isChecked(String locator) {
    return commandProcessor.getBoolean("isChecked", new String[] {locator,});
  }

  @Override
  public String getTable(String tableCellAddress) {
    return commandProcessor.getString("getTable", new String[] {tableCellAddress,});
  }

  @Override
  public String[] getSelectedLabels(String selectLocator) {
    return commandProcessor.getStringArray("getSelectedLabels", new String[] {selectLocator,});
  }

  @Override
  public String getSelectedLabel(String selectLocator) {
    return commandProcessor.getString("getSelectedLabel", new String[] {selectLocator,});
  }

  @Override
  public String[] getSelectedValues(String selectLocator) {
    return commandProcessor.getStringArray("getSelectedValues", new String[] {selectLocator,});
  }

  @Override
  public String getSelectedValue(String selectLocator) {
    return commandProcessor.getString("getSelectedValue", new String[] {selectLocator,});
  }

  @Override
  public String[] getSelectedIndexes(String selectLocator) {
    return commandProcessor.getStringArray("getSelectedIndexes", new String[] {selectLocator,});
  }

  @Override
  public String getSelectedIndex(String selectLocator) {
    return commandProcessor.getString("getSelectedIndex", new String[] {selectLocator,});
  }

  @Override
  public String[] getSelectedIds(String selectLocator) {
    return commandProcessor.getStringArray("getSelectedIds", new String[] {selectLocator,});
  }

  @Override
  public String getSelectedId(String selectLocator) {
    return commandProcessor.getString("getSelectedId", new String[] {selectLocator,});
  }

  @Override
  public boolean isSomethingSelected(String selectLocator) {
    return commandProcessor.getBoolean("isSomethingSelected", new String[] {selectLocator,});
  }

  @Override
  public String[] getSelectOptions(String selectLocator) {
    return commandProcessor.getStringArray("getSelectOptions", new String[] {selectLocator,});
  }

  @Override
  public String getAttribute(String attributeLocator) {
    return commandProcessor.getString("getAttribute", new String[] {attributeLocator,});
  }

  @Override
  public boolean isTextPresent(String pattern) {
    return commandProcessor.getBoolean("isTextPresent", new String[] {pattern,});
  }

  @Override
  public boolean isElementPresent(String locator) {
    return commandProcessor.getBoolean("isElementPresent", new String[] {locator,});
  }

  @Override
  public boolean isVisible(String locator) {
    return commandProcessor.getBoolean("isVisible", new String[] {locator,});
  }

  @Override
  public boolean isEditable(String locator) {
    return commandProcessor.getBoolean("isEditable", new String[] {locator,});
  }

  @Override
  public String[] getAllButtons() {
    return commandProcessor.getStringArray("getAllButtons", new String[] {});
  }

  @Override
  public String[] getAllLinks() {
    return commandProcessor.getStringArray("getAllLinks", new String[] {});
  }

  @Override
  public String[] getAllFields() {
    return commandProcessor.getStringArray("getAllFields", new String[] {});
  }

  @Override
  public String[] getAttributeFromAllWindows(String attributeName) {
    return commandProcessor.getStringArray("getAttributeFromAllWindows",
        new String[] {attributeName,});
  }

  @Override
  public void dragdrop(String locator, String movementsString) {
    commandProcessor.doCommand("dragdrop", new String[] {locator, movementsString,});
  }

  @Override
  public void setMouseSpeed(String pixels) {
    commandProcessor.doCommand("setMouseSpeed", new String[] {pixels,});
  }

  @Override
  public Number getMouseSpeed() {
    return commandProcessor.getNumber("getMouseSpeed", new String[] {});
  }

  @Override
  public void dragAndDrop(String locator, String movementsString) {
    commandProcessor.doCommand("dragAndDrop", new String[] {locator, movementsString,});
  }

  @Override
  public void dragAndDropToObject(
      String locatorOfObjectToBeDragged,
                                  String locatorOfDragDestinationObject) {
    commandProcessor.doCommand(
        "dragAndDropToObject",
        new String[] {locatorOfObjectToBeDragged, locatorOfDragDestinationObject,});
  }

  @Override
  public void windowFocus() {
    commandProcessor.doCommand("windowFocus", new String[] {});
  }

  @Override
  public void windowMaximize() {
    commandProcessor.doCommand("windowMaximize", new String[] {});
  }

  @Override
  public String[] getAllWindowIds() {
    return commandProcessor.getStringArray("getAllWindowIds", new String[] {});
  }

  @Override
  public String[] getAllWindowNames() {
    return commandProcessor.getStringArray("getAllWindowNames", new String[] {});
  }

  @Override
  public String[] getAllWindowTitles() {
    return commandProcessor.getStringArray("getAllWindowTitles", new String[] {});
  }

  @Override
  public String getHtmlSource() {
    return commandProcessor.getString("getHtmlSource", new String[] {});
  }

  @Override
  public void setCursorPosition(String locator, String position) {
    commandProcessor.doCommand("setCursorPosition", new String[] {locator, position,});
  }

  @Override
  public Number getElementIndex(String locator) {
    return commandProcessor.getNumber("getElementIndex", new String[] {locator,});
  }

  @Override
  public boolean isOrdered(String locator1, String locator2) {
    return commandProcessor.getBoolean("isOrdered", new String[] {locator1, locator2,});
  }

  @Override
  public Number getElementPositionLeft(String locator) {
    return commandProcessor.getNumber("getElementPositionLeft", new String[] {locator,});
  }

  @Override
  public Number getElementPositionTop(String locator) {
    return commandProcessor.getNumber("getElementPositionTop", new String[] {locator,});
  }

  @Override
  public Number getElementWidth(String locator) {
    return commandProcessor.getNumber("getElementWidth", new String[] {locator,});
  }

  @Override
  public Number getElementHeight(String locator) {
    return commandProcessor.getNumber("getElementHeight", new String[] {locator,});
  }

  @Override
  public Number getCursorPosition(String locator) {
    return commandProcessor.getNumber("getCursorPosition", new String[] {locator,});
  }

  @Override
  public String getExpression(String expression) {
    return commandProcessor.getString("getExpression", new String[] {expression,});
  }

  @Override
  public Number getXpathCount(String xpath) {
    return commandProcessor.getNumber("getXpathCount", new String[] {xpath,});
  }

  @Override
  public Number getCssCount(String css) {
    return commandProcessor.getNumber("getCssCount", new String[] {css,});
  }

  @Override
  public void assignId(String locator, String identifier) {
    commandProcessor.doCommand("assignId", new String[] {locator, identifier,});
  }

  @Override
  public void allowNativeXpath(String allow) {
    commandProcessor.doCommand("allowNativeXpath", new String[] {allow,});
  }

  @Override
  public void ignoreAttributesWithoutValue(String ignore) {
    commandProcessor.doCommand("ignoreAttributesWithoutValue", new String[] {ignore,});
  }

  @Override
  public void waitForCondition(String script, String timeout) {
    commandProcessor.doCommand("waitForCondition", new String[] {script, timeout,});
  }

  @Override
  public void setTimeout(String timeout) {
    commandProcessor.doCommand("setTimeout", new String[] {timeout,});
  }

  @Override
  public void waitForPageToLoad(String timeout) {
    commandProcessor.doCommand("waitForPageToLoad", new String[] {timeout,});
  }

  @Override
  public void waitForFrameToLoad(String frameAddress, String timeout) {
    commandProcessor.doCommand("waitForFrameToLoad", new String[] {frameAddress, timeout,});
  }

  @Override
  public String getCookie() {
    return commandProcessor.getString("getCookie", new String[] {});
  }

  @Override
  public String getCookieByName(String name) {
    return commandProcessor.getString("getCookieByName", new String[] {name,});
  }

  @Override
  public boolean isCookiePresent(String name) {
    return commandProcessor.getBoolean("isCookiePresent", new String[] {name,});
  }

  @Override
  public void createCookie(String nameValuePair, String optionsString) {
    commandProcessor.doCommand("createCookie", new String[] {nameValuePair, optionsString,});
  }

  @Override
  public void deleteCookie(String name, String optionsString) {
    commandProcessor.doCommand("deleteCookie", new String[] {name, optionsString,});
  }

  @Override
  public void deleteAllVisibleCookies() {
    commandProcessor.doCommand("deleteAllVisibleCookies", new String[] {});
  }

  @Override
  public void setBrowserLogLevel(String logLevel) {
    commandProcessor.doCommand("setBrowserLogLevel", new String[] {logLevel,});
  }

  @Override
  public void runScript(String script) {
    commandProcessor.doCommand("runScript", new String[] {script,});
  }

  @Override
  public void addLocationStrategy(String strategyName, String functionDefinition) {
    commandProcessor.doCommand("addLocationStrategy", new String[] {strategyName,
        functionDefinition,});
  }

  @Override
  public void captureEntirePageScreenshot(String filename, String kwargs) {
    commandProcessor.doCommand("captureEntirePageScreenshot", new String[] {filename, kwargs,});
  }

  @Override
  public void rollup(String rollupName, String kwargs) {
    commandProcessor.doCommand("rollup", new String[] {rollupName, kwargs,});
  }

  @Override
  public void addScript(String scriptContent, String scriptTagId) {
    commandProcessor.doCommand("addScript", new String[] {scriptContent, scriptTagId,});
  }

  @Override
  public void removeScript(String scriptTagId) {
    commandProcessor.doCommand("removeScript", new String[] {scriptTagId,});
  }

  @Override
  public void useXpathLibrary(String libraryName) {
    commandProcessor.doCommand("useXpathLibrary", new String[] {libraryName,});
  }

  @Override
  public void setContext(String context) {
    commandProcessor.doCommand("setContext", new String[] {context,});
  }

  @Override
  public void attachFile(String fieldLocator, String fileLocator) {
    commandProcessor.doCommand("attachFile", new String[] {fieldLocator, fileLocator,});
  }

  @Override
  public void captureScreenshot(String filename) {
    commandProcessor.doCommand("captureScreenshot", new String[] {filename,});
  }

  @Override
  public String captureScreenshotToString() {
    return commandProcessor.getString("captureScreenshotToString", new String[] {});
  }

  @Override
  public String captureNetworkTraffic(String type) {
    return commandProcessor.getString("captureNetworkTraffic", new String[] {type});
  }

  @Override
  public void addCustomRequestHeader(String key, String value) {
    commandProcessor.getString("addCustomRequestHeader", new String[] {key, value});
  }

  @Override
  public String captureEntirePageScreenshotToString(String kwargs) {
    return commandProcessor
        .getString("captureEntirePageScreenshotToString", new String[] {kwargs,});
  }

  @Override
  public void shutDownSeleniumServer() {
    commandProcessor.doCommand("shutDownSeleniumServer", new String[] {});
  }

  @Override
  public String retrieveLastRemoteControlLogs() {
    return commandProcessor.getString("retrieveLastRemoteControlLogs", new String[] {});
  }

  @Override
  public void keyDownNative(String keycode) {
    commandProcessor.doCommand("keyDownNative", new String[] {keycode,});
  }

  @Override
  public void keyUpNative(String keycode) {
    commandProcessor.doCommand("keyUpNative", new String[] {keycode,});
  }

  @Override
  public void keyPressNative(String keycode) {
    commandProcessor.doCommand("keyPressNative", new String[] {keycode,});
  }

}
