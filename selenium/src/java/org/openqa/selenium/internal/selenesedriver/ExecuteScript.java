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

import com.thoughtworks.selenium.Selenium;
import com.google.common.collect.Maps;

import java.util.Map;

public class ExecuteScript implements SeleneseFunction<Object> {
  public Object apply(Selenium selenium, Object... args) {
    String script = prepareScript(args);

    System.out.println("script = " + script);

    String value = selenium.getEval(script);

    return populateReturnValue(value);
  }

  private String prepareScript(Object... args) {
    String script = String.format("(function() { %s })();", args[0])
        .replaceAll("\\bwindow\\.", "selenium.browserbot.getCurrentWindow().")
        .replaceAll("\\bdocument\\.", "selenium.browserbot.getDocument().");

    if (args.length > 1) {
      Object[] scriptArgs = (Object[]) args[1];
      for (int i = 0; i < scriptArgs.length; i++) {
        script = script.replaceAll("arguments\\[\\s*" + i + "\\s*\\]",
            getArgumentValue(scriptArgs[i]));
      }
    }

    return script;
  }

  private String getArgumentValue(Object arg) {
    if (arg instanceof Map) {
      Map<String, Object> raw = (Map<String, Object>) arg;
      if ("STRING".equals(raw.get("type"))) {
        return String.format("'%s'", ((String) raw.get("value")).replaceAll("'", "\\'"));
      }
      return String.valueOf(raw.get("value"));
    }

    return null;
  }

  private Map<String, Object> populateReturnValue(String value) {
    Map<String, Object> toReturn = Maps.newHashMap();

    if ("__undefined__".equals(value)) {
      toReturn.put("type", "STRING");
      toReturn.put("value", null);
    } else if (value.matches("^\\d+$")) {
      toReturn.put("type", "NUMBER");
      toReturn.put("value", Long.parseLong(value));
    } else if (value.matches("^\\d+\\.\\d+$")) {
      toReturn.put("type", "NUMBER");
      toReturn.put("value", Double.parseDouble(value));
    } else if ("true".equals(value) || "false".equals(value)) {
      toReturn.put("type", "BOOLEAN");
      toReturn.put("value", Boolean.parseBoolean(value));
    } else {
      // Falll back to a string
      toReturn.put("type", "STRING");
      toReturn.put("value", value);
    }
    
    return toReturn;
  }
}
