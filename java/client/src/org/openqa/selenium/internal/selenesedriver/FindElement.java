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

import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.NoSuchElementException;

import java.util.Map;

public class FindElement extends AbstractElementFinder<Map<String, String>> {

  private final static String SCRIPT =
      "var by = {}; by['%s'] = '%s'; " +
      "var e = bot.locators.findElement(by, %s);" +
      "e = core.firefox.unwrap(e); " +
      "bot.inject.cache.addElement(e);";

  @Override
  protected Map<String, String> executeFind(Selenium selenium, String how, String using,
      String parentLocator) {
    String locator = String.format(SCRIPT, how, using, parentLocator);

    String key = selenium.getEval(locator);
    return newElement(key);
  }

  @Override
  protected Map<String, String> onFailure(String how, String using) {
    throw new NoSuchElementException(
        String.format("No elements were found: %s=%s ", how, using));
  }
}
