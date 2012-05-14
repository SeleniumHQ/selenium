/*
Copyright 2007-2009 Selenium committers

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

import org.openqa.selenium.WebDriverException;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Map;

public abstract class ElementFunction<T> implements SeleneseFunction<T> {
  public String getLocator(Map<String, ?> parameters) {
    String locator = (String) parameters.get("id");

    try {
      return URLDecoder.decode(locator, "utf-8");
    } catch (UnsupportedEncodingException e) {
      // Should never happen
      throw new WebDriverException(e);
    }
  }

  protected String escape(String toEscape) {
    return toEscape.replaceAll("'", "\\\\'");
  }
}
