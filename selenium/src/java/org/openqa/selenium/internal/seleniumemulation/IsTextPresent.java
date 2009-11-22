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

package org.openqa.selenium.internal.seleniumemulation;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.common.collect.Maps;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class IsTextPresent extends SeleneseCommand<Boolean> {
  private static final Pattern TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+):(.*)");
  private final Map<String, TextMatchingStrategy> textMatchingStrategies = Maps.newHashMap();

  public IsTextPresent() {
    setUpTextMatchingStrategies();
  }

  @Override
  protected Boolean handleSeleneseCommand(WebDriver driver, String pattern, String ignored) {
    String text = driver.findElement(By.xpath("/html/body")).getText();
    text = text.trim();

    String strategyName = "implicit";
    String use = pattern;
    Matcher matcher = TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN.matcher(pattern);
    if (matcher.matches()) {
      strategyName = matcher.group(1);
      use = matcher.group(2);
    }
    TextMatchingStrategy strategy = textMatchingStrategies.get(strategyName);

    return strategy.isAMatch(use, text);

  }

  private void setUpTextMatchingStrategies() {
    textMatchingStrategies.put("implicit", new GlobTextMatchingStrategy());
    textMatchingStrategies.put("glob", new GlobTextMatchingStrategy());
    textMatchingStrategies.put("regexp", new RegExTextMatchingStrategy());
    textMatchingStrategies.put("exact", new ExactTextMatchingStrategy());
  }
}
