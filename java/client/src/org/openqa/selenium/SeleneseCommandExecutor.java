/*
Copyright 2007-2009 Selenium committers

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

import static org.openqa.selenium.remote.DriverCommand.CLEAR_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLICK_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLOSE;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_ASYNC_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.GET;
import static org.openqa.selenium.remote.DriverCommand.GET_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_URL;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_ATTRIBUTE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TAG_NAME;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.GET_PAGE_SOURCE;
import static org.openqa.selenium.remote.DriverCommand.GET_TITLE;
import static org.openqa.selenium.remote.DriverCommand.IMPLICITLY_WAIT;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_DISPLAYED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_ENABLED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_SELECTED;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.DriverCommand.SCREENSHOT;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SET_SCRIPT_TIMEOUT;
import static org.openqa.selenium.remote.DriverCommand.SUBMIT_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_FRAME;

import com.google.common.collect.Maps;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.HttpCommandProcessor;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.internal.selenesedriver.ClearElement;
import org.openqa.selenium.internal.selenesedriver.ClickElement;
import org.openqa.selenium.internal.selenesedriver.Close;
import org.openqa.selenium.internal.selenesedriver.ExecuteAsyncScript;
import org.openqa.selenium.internal.selenesedriver.ExecuteScript;
import org.openqa.selenium.internal.selenesedriver.FindElement;
import org.openqa.selenium.internal.selenesedriver.FindElements;
import org.openqa.selenium.internal.selenesedriver.GetActiveElement;
import org.openqa.selenium.internal.selenesedriver.GetCurrentUrl;
import org.openqa.selenium.internal.selenesedriver.GetElementAttribute;
import org.openqa.selenium.internal.selenesedriver.GetElementText;
import org.openqa.selenium.internal.selenesedriver.GetElementValue;
import org.openqa.selenium.internal.selenesedriver.GetPageSource;
import org.openqa.selenium.internal.selenesedriver.GetSize;
import org.openqa.selenium.internal.selenesedriver.GetTagName;
import org.openqa.selenium.internal.selenesedriver.GetTitle;
import org.openqa.selenium.internal.selenesedriver.GetUrl;
import org.openqa.selenium.internal.selenesedriver.IsElementDisplayed;
import org.openqa.selenium.internal.selenesedriver.IsElementEnabled;
import org.openqa.selenium.internal.selenesedriver.IsElementSelected;
import org.openqa.selenium.internal.selenesedriver.NewSession;
import org.openqa.selenium.internal.selenesedriver.QuitSelenium;
import org.openqa.selenium.internal.selenesedriver.SeleneseFunction;
import org.openqa.selenium.internal.selenesedriver.SendKeys;
import org.openqa.selenium.internal.selenesedriver.SubmitElement;
import org.openqa.selenium.internal.selenesedriver.SwitchToFrame;
import org.openqa.selenium.internal.selenesedriver.TakeScreenshot;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

import java.io.File;
import java.net.URL;
import java.util.Map;

public class SeleneseCommandExecutor implements CommandExecutor {
  private final ErrorCodes errorCodes;
  private final Selenium instance;
  private Map<String, SeleneseFunction> functions = Maps.newHashMap();

  public SeleneseCommandExecutor(URL seleniumServer, URL remoteAddress, Capabilities capabilities) {
    this(new HttpCommandProcessor(
        seleniumServer.getHost(), seleniumServer.getPort(),
        startCommand(capabilities), remoteAddress.toString()));
  }

  public SeleneseCommandExecutor(CommandProcessor processor) {
    this(new DefaultSelenium(processor));
  }

  public SeleneseCommandExecutor(Selenium instance) {
    this.instance = instance;
    errorCodes = new ErrorCodes();

    prepareCommands();
  }

  public Selenium getWrappedSelenium() {
    return instance;
  }

  public Response execute(Command command) {
    SeleneseFunction function = functions.get(command.getName());
    if (function == null) {
      throw new UnsupportedOperationException("cannot execute: " + command.getName());
    }

    try {
      Response response = new Response();
      response.setValue(function.apply(instance, command.getParameters()));
      return response;
    } catch (Exception e) {
      return prepareExceptionResponse(e);
    }
  }

  private Response prepareExceptionResponse(Exception e) {
    Response response = new Response();

    Exception toUse = e;
    if (e instanceof SeleniumException) {
      // World of fragility. *sigh*
      if (e.getMessage().matches("ERROR: (Threw an exception: )?Element .+ not found")) {
        toUse = new StaleElementReferenceException(e.getMessage(), e);
      }
    }
    response.setStatus(errorCodes.toStatusCode(toUse));

    // It's like a lesson in inefficiency
    Object raw =
        new JsonToBeanConverter().convert(Map.class, new BeanToJsonConverter().convert(toUse));
    response.setValue(raw);
    return response;
  }

  public void addCommand(String methodName, SeleneseFunction command) {
    functions.put(methodName, command);
  }

  private void prepareCommands() {
    FindElement findElement = new FindElement();
    FindElements findElements = new FindElements();
    SeleneseTimeouts timeouts = new SeleneseTimeouts(
        findElement.implicitlyWait(), findElements.implicitlyWait());
    ExecuteAsyncScript executeAsyncScript = new ExecuteAsyncScript();

    addCommand(CLEAR_ELEMENT, new ClearElement());
    addCommand(CLICK_ELEMENT, new ClickElement());
    addCommand(CLOSE, new Close());
    addCommand(GET_CURRENT_URL, new GetCurrentUrl());
    addCommand(EXECUTE_SCRIPT, new ExecuteScript());
    addCommand(EXECUTE_ASYNC_SCRIPT, executeAsyncScript);
    addCommand(SET_SCRIPT_TIMEOUT, executeAsyncScript.setScriptTimeout());
    addCommand(FIND_CHILD_ELEMENT, findElement);
    addCommand(FIND_CHILD_ELEMENTS, findElements);
    addCommand(FIND_ELEMENT, findElement);
    addCommand(FIND_ELEMENTS, findElements);
    addCommand(IMPLICITLY_WAIT, timeouts);
    addCommand(GET, new GetUrl());
    addCommand(GET_ACTIVE_ELEMENT, new GetActiveElement());
    addCommand(GET_ELEMENT_ATTRIBUTE, new GetElementAttribute());
    addCommand(GET_ELEMENT_SIZE, new GetSize());
    addCommand(GET_ELEMENT_TEXT, new GetElementText());
    addCommand(GET_ELEMENT_VALUE, new GetElementValue());
    addCommand(GET_ELEMENT_TAG_NAME, new GetTagName());
    addCommand(GET_TITLE, new GetTitle());
    addCommand(IS_ELEMENT_DISPLAYED, new IsElementDisplayed());
    addCommand(IS_ELEMENT_ENABLED, new IsElementEnabled());
    addCommand(IS_ELEMENT_SELECTED, new IsElementSelected());
    addCommand(NEW_SESSION, new NewSession());
    addCommand(GET_PAGE_SOURCE, new GetPageSource());
    addCommand(SCREENSHOT, new TakeScreenshot());
    addCommand(SEND_KEYS_TO_ELEMENT, new SendKeys());
    addCommand(SWITCH_TO_FRAME, new SwitchToFrame());
    addCommand(SUBMIT_ELEMENT, new SubmitElement());
    addCommand(QUIT, new QuitSelenium());
  }

  private static String startCommand(Capabilities capabilities) {
    String browser = capabilities.getBrowserName();

    if (browser.startsWith("*")) {
      return browser;
    }

    if (DesiredCapabilities.firefox().getBrowserName().equals(browser)) {
      return "*chrome";
    }

    if ("safari".equals(browser)) {
      String path = findSafari();
      return "*safari " + path;
    }

    if (DesiredCapabilities.chrome().getBrowserName().equals(browser)) {
      return "*googlechrome /Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    }

    throw new IllegalArgumentException(
        "Cannot determine which selenium type to use: " + capabilities.getBrowserName());
  }

  private static String findSafari() {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      File[] locations = new File[] {
          new File("C:\\Program Files (x86)\\Safari\\safari.exe"),
          new File("C:\\Program Files\\Safari\\safari.exe")
      };

      for (File location : locations) {
        if (location.exists()) {
          return location.getAbsolutePath();
        }
      }
    }

    return "";
  }

  private class SeleneseTimeouts implements SeleneseFunction<Void> {
    private final SeleneseFunction<Object>[] functions;

    public SeleneseTimeouts(SeleneseFunction<Object>... functions) {
      this.functions = functions;
    }

    public Void apply(Selenium selenium, Map<String, ?> args) {
      for (SeleneseFunction<Object> function : functions) {
        function.apply(selenium, args);
      }

      return null;
    }
  }
}
