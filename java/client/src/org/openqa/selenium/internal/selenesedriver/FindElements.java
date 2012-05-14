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

import com.google.common.base.Splitter;
import com.google.common.collect.Lists;

import com.thoughtworks.selenium.Selenium;

import java.util.List;
import java.util.Map;

public class FindElements extends AbstractElementFinder<List<Map<String, String>>> {

  private static final String SCRIPT =
      "selenium.browserbot.findElementsLikeWebDriver('%s', '%s', %s);";

  @Override
  protected List<Map<String, String>> executeFind(Selenium selenium, String how, String using,
      String parentLocator) {
    String result =
        selenium.getEval(String.format(SCRIPT, how, using, parentLocator));

    Iterable<String> allKeys = Splitter.on(",").split(result);
    List<Map<String, String>> toReturn = Lists.newArrayList();

    for (String key : allKeys) {
      if (key.length() > 0) {
        toReturn.add(newElement(key));
      }
    }

    return toReturn;
  }

  @Override
  protected List<Map<String, String>> onFailure(String how, String using) {
    return Lists.newArrayList();
  }
}
