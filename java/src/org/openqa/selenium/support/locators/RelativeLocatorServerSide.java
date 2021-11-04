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

package org.openqa.selenium.support.locators;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.By;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.JsonToWebElementConverter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.locators.CustomLocator;

import java.util.List;

import static org.openqa.selenium.support.locators.RelativeLocatorScript.FIND_ELEMENTS;

@AutoService(CustomLocator.class)
public class RelativeLocatorServerSide implements CustomLocator {
  @Override
  public String getLocatorName() {
    return "relative";
  }

  @Override
  public By createBy(Object usingParameter) {
    Require.nonNull("Using", usingParameter);
    return new RemoteRelative(usingParameter);
  }

  private static class RemoteRelative extends By {
    private final Object using;

    private RemoteRelative(Object usingParameter) {
      using = usingParameter;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      JavascriptExecutor js = getJavascriptExecutor(context);

      WebDriver driver = getWebDriver(context);

      if (driver instanceof RemoteWebDriver) {
        Object converted = new JsonToWebElementConverter((RemoteWebDriver) driver).apply(using);

        @SuppressWarnings("unchecked")
        List<WebElement> elements = (List<WebElement>) js.executeScript(FIND_ELEMENTS, ImmutableMap.of("relative", converted));
        return elements;
      }

      throw new InvalidArgumentException("Unable to find element");
    }
  }
}
