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
import org.openqa.selenium.WebDriverException;

import java.util.Map;

public class SetElementSelected extends ElementFunction<Void> {

  public Void apply(Selenium selenium, Map<String, ?> args) {
    String locator = getLocator(args);

    String tagName = new GetTagName().apply(selenium, args);
    if ("option".equals(tagName)) {
      throw new WebDriverException("Selecting options is currently unsupported");
    }

    if ("input".equals(tagName)) {
      if (selenium.isEditable(locator)) {
        selenium.check(locator);
      } else {
        throw new UnsupportedOperationException("Element is not selectable: " + locator);
      }
    } else {
      throw new UnsupportedOperationException("Element is not selectable: " + locator);
    }

    return null;
  }
}
