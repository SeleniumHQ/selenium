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

package org.openqa.selenium.internal.seleniumemulation;

import java.util.regex.Pattern;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class GetEval extends SeleneseCommand<String> {
  /**
   * Regular expression for scripts that reference the current window.
   */
  private static final Pattern SELENIUM_WINDOW_REF_REGEX = Pattern.compile(
        "selenium\\.(browserbot|page\\(\\))\\.getCurrentWindow\\(\\)");

  /**
   * Regular expression for scripts that reference the current window's document.
   */
  private static final Pattern SELENIUM_DOCUMENT_REF_REGEX = Pattern.compile(
        "selenium\\.(browserbot|page\\(\\))\\.getDocument\\(\\)");

  private final Pattern seleniumBaseUrl;
  private String baseUrl;

  public GetEval(String baseUrl) {
    this.baseUrl = '"' + baseUrl + '"';

    seleniumBaseUrl = Pattern.compile("selenium\\.browserbot\\.baseUrl");
  }

  @Override
  protected String handleSeleneseCommand(WebDriver driver, String locator, String value) {
    String script = locator.replaceAll("\n", "\\\\n");
    script = SELENIUM_WINDOW_REF_REGEX.matcher(script).replaceAll("window");
    script = SELENIUM_DOCUMENT_REF_REGEX.matcher(script).replaceAll("window.document");
    script = seleniumBaseUrl.matcher(script).replaceAll(baseUrl);
    script = script.replaceAll("\"", "\\\"");
    script = script.replaceAll("'", "\\\\'");
    script = String.format("return eval('%s');", script);

    return String.valueOf(((JavascriptExecutor) driver).executeScript(script));
  }
}
