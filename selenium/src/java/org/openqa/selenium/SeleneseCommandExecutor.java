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

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.HttpCommandProcessor;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.internal.selenesedriver.SeleneseFunction;
import org.openqa.selenium.internal.selenesedriver.ClearElement;
import org.openqa.selenium.internal.selenesedriver.ClickElement;
import org.openqa.selenium.internal.selenesedriver.FindElement;
import org.openqa.selenium.internal.selenesedriver.GetCurrentUrl;
import org.openqa.selenium.internal.selenesedriver.GetElementText;
import org.openqa.selenium.internal.selenesedriver.GetElementValue;
import org.openqa.selenium.internal.selenesedriver.GetTagName;
import org.openqa.selenium.internal.selenesedriver.GetTitle;
import org.openqa.selenium.internal.selenesedriver.GetUrl;
import org.openqa.selenium.internal.selenesedriver.NewSession;
import org.openqa.selenium.internal.selenesedriver.QuitSelenium;
import org.openqa.selenium.internal.selenesedriver.GetElementAttribute;
import org.openqa.selenium.internal.selenesedriver.GetPageSource;
import org.openqa.selenium.internal.selenesedriver.IsElementDisplayed;
import org.openqa.selenium.internal.selenesedriver.IsElementEnabled;
import org.openqa.selenium.internal.selenesedriver.IsElementSelected;
import org.openqa.selenium.internal.selenesedriver.SendKeys;
import org.openqa.selenium.internal.selenesedriver.SetElementSelected;
import org.openqa.selenium.internal.selenesedriver.SubmitElement;
import org.openqa.selenium.internal.selenesedriver.ToggleElement;
import org.openqa.selenium.internal.selenesedriver.ExecuteScript;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import static org.openqa.selenium.remote.DriverCommand.*;

import java.io.File;
import java.net.URL;
import java.util.Map;

public class SeleneseCommandExecutor implements CommandExecutor {
  private final ErrorCodes errorCodes;
  private final Selenium instance;
  private Map<String, SeleneseFunction> functions;

  public SeleneseCommandExecutor(URL seleniumServer, URL remoteAddress, Capabilities capabilities) {
    this(new HttpCommandProcessor(
            seleniumServer.getHost(), seleniumServer.getPort(),
            startCommand(capabilities), remoteAddress.toString()));
  }

  public SeleneseCommandExecutor(CommandProcessor processor) {
    instance = new DefaultSelenium(processor);
    errorCodes = new ErrorCodes();

    prepareCommands();
  }

  public Response execute(Command command) throws Exception {
    SeleneseFunction function = functions.get(command.getName());
    if (function == null) {
      System.out.println("command.getMethodName() = " + command.getName());
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

  private Response prepareExceptionResponse(Exception e) throws Exception {
    Response response = new Response();

    Exception toUse = e;
    if (e instanceof SeleniumException) {
      // World of fragility. *sigh*
       if (e.getMessage().matches("ERROR: Element .+ not found")) {
        toUse = new StaleElementReferenceException(e.getMessage(), e);
      }
    }
    response.setStatus(errorCodes.toStatusCode(toUse));

    // It's like a lesson in inefficiency
    Object raw = new JsonToBeanConverter().convert(Map.class, new BeanToJsonConverter().convert(toUse));
    response.setValue(raw);
    return response;
  }

  private void prepareCommands() {
    FindElement findElement = new FindElement();
    
    functions = ImmutableMap.<String, SeleneseFunction>builder()
        .put(CLEAR_ELEMENT, new ClearElement())
        .put(CLICK_ELEMENT, new ClickElement())
        .put(GET_CURRENT_URL, new GetCurrentUrl())
        .put(EXECUTE_SCRIPT, new ExecuteScript())
        .put(FIND_ELEMENT, findElement)
        .put(IMPLICITLY_WAIT, findElement.implicitlyWait())
        .put(GET, new GetUrl())
        .put(GET_ELEMENT_ATTRIBUTE, new GetElementAttribute())
        .put(GET_ELEMENT_TEXT, new GetElementText())
        .put(GET_ELEMENT_VALUE, new GetElementValue())
        .put(GET_ELEMENT_TAG_NAME, new GetTagName())
        .put(GET_TITLE, new GetTitle())
        .put(IS_ELEMENT_DISPLAYED, new IsElementDisplayed())
        .put(IS_ELEMENT_ENABLED, new IsElementEnabled())
        .put(IS_ELEMENT_SELECTED, new IsElementSelected())
        .put(NEW_SESSION, new NewSession())
        .put(GET_PAGE_SOURCE, new GetPageSource())
        .put(SEND_KEYS_TO_ELEMENT, new SendKeys())
        .put(SET_ELEMENT_SELECTED, new SetElementSelected())
        .put(SUBMIT_ELEMENT, new SubmitElement())
        .put(TOGGLE_ELEMENT, new ToggleElement())
        .put(QUIT, new QuitSelenium())
        .build();
  }

  private static String startCommand(Capabilities capabilities) {
    String browser = capabilities.getBrowserName();
    if (DesiredCapabilities.firefox().getBrowserName().equals(browser)) {
      String path = new Executable(null).getPath();
      return "*chrome " + path;
    } else if ("safari".equals(browser)) {
      String path = findSafari();
      return "*safari " + path;
    } else if (DesiredCapabilities.chrome().getBrowserName().equals(browser)) {

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
}
