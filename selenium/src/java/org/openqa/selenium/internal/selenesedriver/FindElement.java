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

package org.openqa.selenium.internal.selenesedriver;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriverException;

import com.google.common.collect.ImmutableMap;
import com.thoughtworks.selenium.Selenium;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map;

public class FindElement implements SeleneseFunction<Map<String, String>> {

  private long implicitlyWait = 0;

  public Map<String, String> apply(Selenium selenium, Map<String, ?> args) {
    String how = (String) args.get("using");
    String using = (String) args.get("value");

    String locator = null;
    if ("class name".equals(how)) {
      locator = "css=." + using;
    } else if ("id".equals(how)) {
      locator = "id=" + using;
    } else if ("link text".equals(how)) {
      locator = "link=" + using; 
    } else if ("name".equals(how)) {
      locator = "name=" + using;
    } else if ("tag name".equals(how)) {
      locator = "xpath=//" + using;
    } else if ("xpath".equals(how)) {
      locator = "xpath=" + using;
    } else {
      throw new WebDriverException("Cannot determine locator mechanism from: " + how);
    }

    if (locator != null) {
      long startTime = System.currentTimeMillis();
      do {
        if (selenium.isElementPresent(locator)) {
          // Escape the locator
          try {
            locator = URLEncoder.encode(locator, "utf-8");
          } catch (UnsupportedEncodingException e) {
            // Deeply unlikely if we're running on a conforming JVM
            throw new RuntimeException(e);
          }
          return ImmutableMap.of("ELEMENT", locator);
        }
      } while (System.currentTimeMillis() - startTime <= implicitlyWait);
    }

    throw new NoSuchElementException("Cannot find element using " + locator);
  }

  public ImplicitWait implicitlyWait() {
    return new ImplicitWait();
  }

  public class ImplicitWait implements SeleneseFunction<Object> {
    public Object apply(Selenium selenium, Map<String, ?> args) {
      FindElement.this.implicitlyWait = ((Number) args.get("ms")).longValue();
      return null;
    }
  }
}
