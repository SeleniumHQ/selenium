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


package org.openqa.selenium.remote.server.handler;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class FindElements extends WebDriverHandler<Set<Map<String, String>>>
    implements JsonParametersAware {

  private volatile By by;

  public FindElements(Session session) {
    super(session);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    by = newBySelector().pickFromJsonParameters(allParameters);
  }

  @Override
  public Set<Map<String, String>> call() throws Exception {
    List<WebElement> elements = getDriver().findElements(by);
    return Sets.newLinkedHashSet(
        Iterables.transform(elements, new Function<WebElement, Map<String, String>>() {
          public Map<String, String> apply(WebElement element) {
            return ImmutableMap.of("ELEMENT", getKnownElements().add(element));
          }
        }));
  }

  @Override
  public String toString() {
    return String.format("[find elements: %s]", by);
  }

}
