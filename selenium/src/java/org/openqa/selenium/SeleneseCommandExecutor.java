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
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class SeleneseCommandExecutor implements CommandExecutor {
  private final Selenium instance;
  private Map<String, SeleneseFunction> functions = new HashMap<String, SeleneseFunction>();

  public SeleneseCommandExecutor(URL seleniumServer, URL remoteAddress, Capabilities capabilities) {
    this(new HttpCommandProcessor(
            seleniumServer.getHost(), seleniumServer.getPort(),
            startCommand(capabilities), remoteAddress.toString()));
  }

  public SeleneseCommandExecutor(CommandProcessor processor) {
    instance = new DefaultSelenium(processor);

    prepareCommands();
  }

  public Response execute(Command command) throws Exception {
    SeleneseFunction function = functions.get(command.getMethodName());
    if (function == null) {
      System.out.println("command.getMethodName() = " + command.getMethodName());
      throw new UnsupportedOperationException("cannot execute: " + command.getMethodName());
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
    response.setError(true);

    Exception toUse = e;
    if (e instanceof SeleniumException) {
      // World of fragility. *sigh*
       if (e.getMessage().matches("ERROR: Element .+ not found")) {
        toUse = new StaleElementReferenceException(e.getMessage(), e);
      }
    }

    // It's like a lesson in inefficiency
    Object raw = new JsonToBeanConverter().convert(Map.class, new BeanToJsonConverter().convert(toUse));
    response.setValue(raw);
    return response;
  }

  private void prepareCommands() {
    functions.put("clearElement", new ClearElement());
    functions.put("clickElement", new ClickElement());
    functions.put("currentUrl", new GetCurrentUrl());
    functions.put("findElement", new FindElement());
    functions.put("get", new GetUrl());
    functions.put("getElementAttribute", new GetElementAttribute());
    functions.put("getElementText", new GetElementText());
    functions.put("getElementValue", new GetElementValue());
    functions.put("getTagName", new GetTagName());
    functions.put("getTitle", new GetTitle());
    functions.put("isElementDisplayed", new IsElementDisplayed());
    functions.put("isElementEnabled", new IsElementEnabled());
    functions.put("isElementSelected", new IsElementSelected());
    functions.put("newSession", new NewSession());
    functions.put("pageSource", new GetPageSource());
    functions.put("sendKeys", new SendKeys());
    functions.put("setElementSelected", new SetElementSelected());
    functions.put("submitElement", new SubmitElement());
    functions.put("toggleElement", new ToggleElement());
    functions.put("quit", new QuitSelenium());
  }

  private static String startCommand(Capabilities capabilities) {
    String browser = capabilities.getBrowserName();
    if (DesiredCapabilities.firefox().getBrowserName().equals(browser)) {
      String path = new Executable(null).getPath();
      return "*chrome " + path;
    } else if ("safari".equals(browser)) {
      String path = findSafari();
      return "*safari " + path;
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
