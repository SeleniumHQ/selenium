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

package com.thoughtworks.selenium.webdriven;

import com.google.common.io.Resources;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class JavascriptLibrary {

  static final String PREFIX = "/" + JavascriptLibrary.class.getPackage()
      .getName().replace(".", "/") + "/";
  private final ConcurrentHashMap<String, String> scripts = new ConcurrentHashMap<>();

  private static final String injectableSelenium =
      "/com/thoughtworks/selenium/webdriven/injectableSelenium.js";
  private static final String htmlUtils =
      "/com/thoughtworks/selenium/webdriven/htmlutils.js";

  /**
   * Loads the named Selenium script and returns it wrapped in an anonymous function.
   *
   * @param name The script to load.
   * @return The loaded script wrapped in an anonymous function.
   */
  public String getSeleniumScript(String name) {
    String rawFunction = readScript(PREFIX + name);

    return String.format("function() { return (%s).apply(null, arguments);}",
                         rawFunction);
  }

  public void callEmbeddedSelenium(WebDriver driver, String functionName,
                                   WebElement element, Object... values) {

    List<Object> args = new ArrayList<>();
    args.add(element);
    args.addAll(Arrays.asList(values));

    String script = readScript(injectableSelenium) + "return browserbot." + functionName
                    + ".apply(browserbot, arguments);";
    ((JavascriptExecutor) driver).executeScript(script, args.toArray());
  }

  public Object callEmbeddedHtmlUtils(WebDriver driver, String functionName, WebElement element,
                                      Object... values) {

    List<Object> args = new ArrayList<>();
    args.add(element);
    args.addAll(Arrays.asList(values));

    String script = readScript(htmlUtils) + "return htmlutils." + functionName
                    + ".apply(htmlutils, arguments);";
    return ((JavascriptExecutor) driver).executeScript(script, args.toArray());
  }

  public Object executeScript(WebDriver driver, String script, Object... args) {
    if (driver instanceof JavascriptExecutor) {
      return ((JavascriptExecutor) driver).executeScript(script, args);
    }

    throw new UnsupportedOperationException(
        "The underlying WebDriver instance does not support executing javascript");
  }

  private String readScript(String script) {
    String result = scripts.get(script);
    if (result == null) {
      result = readScriptImpl(script);
      scripts.put(script, result);
    }
    return result;
  }

  String readScriptImpl(String script) {
    URL url = getClass().getResource(script);

    if (url == null) {
      throw new RuntimeException("Cannot locate " + script);
    }

    try {
      return Resources.toString(url, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
