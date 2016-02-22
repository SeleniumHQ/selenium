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

import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;

public class TypeKeys extends SeleneseCommand<Void> {
  private final AlertOverride alertOverride;
  private final ElementFinder finder;

  public TypeKeys(AlertOverride alertOverride, ElementFinder finder) {
    this.alertOverride = alertOverride;
    this.finder = finder;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    alertOverride.replaceAlertMethod(driver);

    value = value.replace("\\10", Keys.ENTER);
    value = value.replace("\\13", Keys.RETURN);
    value = value.replace("\\27", Keys.ESCAPE);
    value = value.replace("\\38", Keys.ARROW_UP);
    value = value.replace("\\40", Keys.ARROW_DOWN);
    value = value.replace("\\37", Keys.ARROW_LEFT);
    value = value.replace("\\39", Keys.ARROW_RIGHT);

    finder.findElement(driver, locator).sendKeys(value);

    return null;
  }
}
