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

package org.openqa.selenium.internal.seleniumemulation;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Resources;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class JavascriptLibrary {

  static final String PREFIX = "/" + JavascriptLibrary.class.getPackage()
      .getName().replace(".", "/") + "/selenium_atoms/";
  private final ConcurrentHashMap<String, String> scripts = new ConcurrentHashMap<String, String>();

  private static final String injectableSelenium =
      "/org/openqa/selenium/internal/seleniumemulation/scripts/injectableSelenium.js";
  private static final String htmlUtils =
      "/org/openqa/selenium/internal/seleniumemulation/scripts/htmlutils.js";

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
    StringBuilder builder = new StringBuilder(readScript(injectableSelenium));
    builder.append("return browserbot.").append(functionName)
        .append(".apply(browserbot, arguments);");

    List<Object> args = new ArrayList<Object>();
    args.add(element);
    args.addAll(Arrays.asList(values));

    ((JavascriptExecutor) driver).executeScript(builder.toString(), args.toArray());
  }

  public Object callEmbeddedHtmlUtils(WebDriver driver, String functionName, WebElement element,
                                      Object... values) {
    StringBuilder builder = new StringBuilder(readScript(htmlUtils));

    builder.append("return htmlutils.").append(functionName)
        .append(".apply(htmlutils, arguments);");

    List<Object> args = new ArrayList<Object>();
    args.add(element);
    args.addAll(Arrays.asList(values));

    return ((JavascriptExecutor) driver).executeScript(builder.toString(), args.toArray());
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
      return Resources.toString(url, Charsets.UTF_8);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    }
  }
}
