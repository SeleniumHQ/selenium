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
import com.thoughtworks.selenium.SeleniumException;

import java.io.File;
import java.net.MalformedURLException;
import java.util.Map;

public class SendKeys extends ElementFunction<Void> {
  public Void apply(Selenium selenium, Map<String, ?> args) {
    String locator = getLocator(args);

    CharSequence[] allKeys = (CharSequence[]) args.get("value");

    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : allKeys) {
      builder.append(seq);
    }

    if (isFileInput(selenium, locator)) {
      String toType = builder.toString();
      if (isLocalFile(toType)) {
        toType = convertToFileUrl(toType);
      }

      selenium.attachFile(locator, toType);
    } else {
      selenium.typeKeys(locator, builder.toString());
    }
    
    return null;
  }

  private String convertToFileUrl(String toType) {
    try {
      return new File(toType).toURL().toString();
    } catch (MalformedURLException e) {
      throw new SeleniumException("Cannot convert file to file url: " + toType);
    }
  }

  private boolean isFileInput(Selenium selenium, String locator) {
    try {
      String type = selenium.getAttribute(locator + "@type");
      return "file".equals(type.toLowerCase());
    } catch (SeleniumException e) {
      // Thrown if the "type" attribute is omitted. By definition, this means
      // that the element is not a file input element
      return false;
    }
  }

  private boolean isLocalFile(String name) {
    File file = new File(name);
    return file.exists() && file.canRead();
  }
}
