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

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

public class GetAllFields extends SeleneseCommand<String[]> {
  @Override
  protected String[] handleSeleneseCommand(WebDriver driver, String locator, String value) {
    List<WebElement> allInputs = driver.findElements(By.xpath("//input"));
    List<String> ids = new ArrayList<>();

    for (WebElement input : allInputs) {
      String type = input.getAttribute("type").toLowerCase();
      if ("text".equals(type))
        ids.add(input.getAttribute("id"));
    }

    return ids.toArray(new String[ids.size()]);
  }
}
