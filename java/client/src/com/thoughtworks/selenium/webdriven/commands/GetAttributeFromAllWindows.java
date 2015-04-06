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

import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.util.ArrayList;
import java.util.List;

public class GetAttributeFromAllWindows extends SeleneseCommand<String[]> {
  @Override
  protected String[] handleSeleneseCommand(WebDriver driver, String attributeName, String ignored) {
    String current = driver.getWindowHandle();

    List<String> attributes = new ArrayList<String>();
    for (String handle : driver.getWindowHandles()) {
      driver.switchTo().window(handle);
      String value = (String) ((JavascriptExecutor) driver).executeScript(
          "return '' + window[arguments[0]];", attributeName);
      attributes.add(value);
    }

    driver.switchTo().window(current);

    return attributes.toArray(new String[attributes.size()]);
  }
}
