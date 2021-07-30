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

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.thoughtworks.selenium.webdriven.ElementFinder;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class TypeKeysTest {
  private ElementFinder elementFinder;
  private WebElement element;

  @Before
  public void setUp() {
    element = mock(WebElement.class);

    elementFinder = new ElementFinder() {
      @Override
      public WebElement findElement(WebDriver driver, String locator) {
        return element;
      }
    };
  }

  @Test
  public void substitutesArrowKeys() {
    String expected = newString(Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_UP);
    String input = "\\40\\37\\39\\38";

    new TypeKeys(new AlertOverrideStub(), elementFinder).apply(null, new String[] {"foo", input});

    verify(element).sendKeys(expected);
  }

  @Test
  public void substitutesReturnAndEscapeKeys() {
    String expected = newString(Keys.ENTER, Keys.RETURN, Keys.ESCAPE);
    String input = "\\10\\13\\27";

    new TypeKeys(new AlertOverrideStub(), elementFinder).apply(null, new String[] {"foo", input});

    verify(element).sendKeys(expected);
  }

  private String newString(CharSequence... toType) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence key : toType) {
      builder.append(key);
    }

    return builder.toString();
  }
}
