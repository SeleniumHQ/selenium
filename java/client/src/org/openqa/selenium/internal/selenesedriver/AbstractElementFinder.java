/*
Copyright 2010 Selenium committers

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

import static org.openqa.selenium.net.Urls.urlEncode;

import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.List;
import java.util.Map;

public abstract class AbstractElementFinder<T> implements SeleneseFunction<T> {
  private long implicitlyWait = 0;

  protected abstract T executeFind(Selenium selenium, String how, String using, String parentLocator);

  protected abstract T onFailure(String how, String using);

  protected Map<String, String> newElement(String key) {
    String locator = "stored=" + urlEncode(key);
    return ImmutableMap.of("ELEMENT", locator);
  }

  public T apply(Selenium selenium, Map<String, ?> args) {
    String how = (String) args.get("using");
    String using = (String) args.get("value");
    String parentLocator = (String) args.get("id");

    if (parentLocator == null) {
      parentLocator = "selenium.browserbot.getDocument()";
    } else {
      try {
        parentLocator =
            "selenium.browserbot.findElement('" + URLDecoder.decode(parentLocator, "UTF-8") + "')";
      } catch (UnsupportedEncodingException e) {
        e.printStackTrace(); // To change body of catch statement use File | Settings | File
                             // Templates.
      }
    }

    using = using.replaceAll("'", "\\\\'");

    long startTime = System.currentTimeMillis();
    do {
      try {
        T result = executeFind(selenium, how, using, parentLocator);

        if (result instanceof List && ((List) result).size() == 0) {
          continue;
        }

        return result;
      } catch (SeleniumException e) {
        // Ignore. The element couldn't be found
      }
      sleepQuietly(200);
    } while (System.currentTimeMillis() - startTime <= implicitlyWait);

    return onFailure(how, using);
  }

  private static void sleepQuietly(long ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException ignored) {
    }
  }

  public ImplicitWait implicitlyWait() {
    return new ImplicitWait();
  }

  public class ImplicitWait implements SeleneseFunction<Object> {
    public Object apply(Selenium selenium, Map<String, ?> args) {
      AbstractElementFinder.this.implicitlyWait = ((Number) args.get("ms")).longValue();
      return null;
    }
  }
}
