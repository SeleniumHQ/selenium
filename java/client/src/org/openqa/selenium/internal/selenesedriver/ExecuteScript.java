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

import java.util.List;
import java.util.Map;

public class ExecuteScript implements SeleneseFunction<Object> {

  public Object apply(Selenium selenium, Map<String, ?> parameters) {
    String script = (String) parameters.get("script");

    @SuppressWarnings({"unchecked"})
    List<Object> args = (List<Object>) parameters.get("args");

    return new ScriptExecutor(selenium)
        .inContextOfApplicationUnderTest()
        .executeScript(script, args);
  }
}
