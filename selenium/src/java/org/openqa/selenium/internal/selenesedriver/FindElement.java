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

import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.selenesedriver.SeleneseFunction;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.List;

public class FindElement implements SeleneseFunction<List<String>> {

  public List<String> apply(Selenium selenium, Object... args) {
    String how = (String) args[0];
    String using = (String) args[1];

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
      if (selenium.isElementPresent(locator)) {
        // Escape the locator
        try {
          locator = URLEncoder.encode(locator, "utf-8");
        } catch (UnsupportedEncodingException e) {
          // Deeply unlikely if we're running on a conforming JVM
          throw new RuntimeException(e);
        }
        return Collections.singletonList("ignored/" + locator);
      } else {
        throw new NoSuchElementException("Cannot find element by " + locator);
      }
    }

    // we should never get here
    throw new WebDriverException("Cannot find element using " + locator);
  }
}
