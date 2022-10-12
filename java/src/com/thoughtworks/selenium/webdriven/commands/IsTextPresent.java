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

package com.thoughtworks.selenium.webdriven.commands;

import com.thoughtworks.selenium.webdriven.JavascriptLibrary;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class IsTextPresent extends SeleneseCommand<Boolean> {
  private final JavascriptLibrary js;

  public IsTextPresent(JavascriptLibrary js) {
    this.js = js;
  }

  @Override
  protected Boolean handleSeleneseCommand(WebDriver driver, String pattern, String ignored) {
    String script = js.getSeleniumScript("isTextPresent.js");

    Boolean result = (Boolean) ((JavascriptExecutor) driver).executeScript(
        "return (" + script + ")(arguments[0]);", pattern);

    // Handle the null case
    return Boolean.TRUE.equals(result);
  }
}
