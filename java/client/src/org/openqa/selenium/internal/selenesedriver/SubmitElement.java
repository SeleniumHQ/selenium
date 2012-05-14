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

import org.openqa.selenium.WebDriverException;

import java.util.Map;

public class SubmitElement extends ElementFunction<Void> {

  public Void apply(Selenium selenium, Map<String, ?> args) {
    String locator = getLocator(args).replace("'", "\\'");

    String eval = submitJs.replace("LOCATOR", locator);

    String result = selenium.getEval(eval);

    if (!"true".equals(result)) {
      throw new WebDriverException(result);
    }

    // Turns out that on Firefox, the load may not have started. Rest for a very
    // short time to let it being.
    sleep(100);

    return null;
  }

  private void sleep(long timeout) {
    try {
      Thread.sleep(timeout);
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  private final String submitJs =
      "(function submit() { "
          + "var curr = selenium.browserbot.findElement('LOCATOR'); "
          + "while (curr != null && curr.tagName != 'FORM') {"
          + "  curr = curr.parentNode || curr.parentElement; "
          + "} "
          + "if (curr) { curr.submit(); return 'true'; } "
          + "return 'false'; "
          + "})()";
}
