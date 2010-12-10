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

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriverException;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map;

public class FindElement implements SeleneseFunction<Map<String, String>> {

  private final static String SCRIPT =
      "var e = selenium.browserbot.findElement('%s');" +
      "bot.inject.cache.addElement(e);";

  private long implicitlyWait = 0;


  public Map<String, String> apply(Selenium selenium, Map<String, ?> args) {
    String how = (String) args.get("using");
    String using = (String) args.get("value");

    String locator = null;
    if ("class name".equals(how)) {
      locator = "css=." + using;
    } else if ("css selector".equals(how)) {
      locator = "css=" + using;
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
      locator = String.format(SCRIPT, locator.replaceAll("'", "\\\\'"));

      long startTime = System.currentTimeMillis();
      do {
        try {
          String key = selenium.getEval(locator);

          key = URLEncoder.encode(key, "utf-8");

          return ImmutableMap.of("ELEMENT", "stored=" + key);
        } catch (SeleniumException e) {
          // Ignore. The element couldn't be found
        } catch (UnsupportedEncodingException e) {
          // This really can't happen on a conforming JVM
          throw Throwables.propagate(e);
        }
      } while (System.currentTimeMillis() - startTime <= implicitlyWait);
    }

    throw new NoSuchElementException(
        String.format("Cannot find element using %s=%s ", how, using));
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
