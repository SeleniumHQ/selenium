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

import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class SeleneseBackedWebDriver extends RemoteWebDriver implements FindsByCssSelector {
  public SeleneseBackedWebDriver() throws Exception {
    super(newCommandExecutor(getSeleniumServerUrl(), describeBrowser()),
        describeBrowser());
  }

  private static CommandExecutor newCommandExecutor(URL remoteAddress, Capabilities capabilities)
      throws MalformedURLException {
    return new SeleneseCommandExecutor(getSeleniumServerUrl(), remoteAddress, capabilities);
  }

  private static URL getSeleniumServerUrl() throws MalformedURLException {
    String port = System.getProperty("webdriver.selenium.server.port", "5555");
    return new URL("http://localhost:" + port);
  }

  public WebElement findElementByCssSelector(String using) {
    return findElement("css selector", using);
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    return findElements("css selector", using);
  }

  private static Capabilities describeBrowser() {
    return DesiredCapabilities.firefox();
  }

  // TODO(jleyba): Get rid of this once all RemoteWebDrivers handle async scripts.
  @Override
  public Object executeAsyncScript(String script, Object... args) {
    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    Iterable<Object> convertedArgs = Iterables.transform(
        Lists.newArrayList(args), new WebElementToJsonConverter());

    Map<String, ?> params = ImmutableMap.of(
        "script", script, "args", Lists.newArrayList(convertedArgs));

    return execute(DriverCommand.EXECUTE_ASYNC_SCRIPT, params).getValue();
  }

  @Override
  public Options manage() {
    return new SeleneseOptions();
  }

  private class SeleneseOptions extends RemoteWebDriverOptions {
    @Override
    public Timeouts timeouts() {
      return new SeleneseTimeouts();
    }
  }

  private class SeleneseTimeouts extends RemoteTimeouts {
    @Override
    public Timeouts setScriptTimeout(long time, TimeUnit unit) {
      execute(DriverCommand.SET_SCRIPT_TIMEOUT,
          ImmutableMap.of("ms", TimeUnit.MILLISECONDS.convert(time, unit)));
      return this;
    }
  }
}
