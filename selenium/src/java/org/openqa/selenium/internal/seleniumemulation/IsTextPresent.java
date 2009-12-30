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
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class IsTextPresent extends SeleneseCommand<Boolean> {
  private static final Pattern TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+):(.*)");
  private final Map<String, TextMatchingStrategy> textMatchingStrategies = Maps.newHashMap();

  public IsTextPresent() {
    setUpTextMatchingStrategies();
  }

  @Override
  protected Boolean handleSeleneseCommand(WebDriver driver, String pattern, String ignored) {
    String text;
    if (driver instanceof JavascriptExecutor) {
      // let's use the same getTextContent function provided by Selenium 1.0 in htmlutils.js if we can
      JavascriptExecutor js = (JavascriptExecutor) driver;
      String script = "if (!window.__seleniumCompat__getTextContent) {\n"
                      + "  window.__seleniumCompat__getTextContent = function(element, preformatted) {\n"
                      + "    if (element.style && (element.style.visibility == 'hidden' || element.style.display == 'none')) return '';\n"
                      + "    if (element.nodeType == 3 /*Node.TEXT_NODE*/) {\n"
                      + "      var text = element.data;\n"
                      + "      if (!preformatted) {\n"
                      + "        text = text.replace(/\\n|\\r|\\t/g, \" \");\n"
                      + "      }\n"
                      + "      \n"
                      + "      return text;\n"
                      + "    }\n"
                      + "    if (element.nodeType == 1 /*Node.ELEMENT_NODE*/ && element.nodeName != 'SCRIPT') {\n"
                      + "      var childrenPreformatted = preformatted || (element.tagName == \"PRE\");\n"
                      + "      var text = \"\";\n"
                      + "      for (var i = 0; i < element.childNodes.length; i++) {\n"
                      + "        var child = element.childNodes.item(i);\n"
                      + "        text += window.__seleniumCompat__getTextContent(child, childrenPreformatted);\n"
                      + "        if (element.tagName == \"P\" || element.tagName == \"BR\" || element.tagName == \"HR\" || element.tagName == \"DIV\") {\n"
                      + "          text += \"\\n\";\n"
                      + "        }\n"
                      + "      }\n"
                      + "      return text;\n"
                      + "    }\n"
                      + "    return '';\n"
                      + "  }\n"
                      + "};\n"
                      + "return window.__seleniumCompat__getTextContent(document.body);\n";
      text = js.executeScript(script).toString();
    } else {
      // bummer - no javascript support available. We can do it this way, but be warned: this can
      // be slow and cause some weird visual artifacts due to crazy scrolling as WebDriver determines
      // if some text is visible or not
      text = driver.findElement(By.xpath("/html/body")).getText();
    }
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
