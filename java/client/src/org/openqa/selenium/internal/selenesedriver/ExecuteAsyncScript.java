/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import org.json.JSONException;
import org.json.JSONWriter;

import java.io.StringWriter;
import java.util.Map;

public class ExecuteAsyncScript implements SeleneseFunction<Object> {

  private long timeoutMillis = 0;

  public Object apply(Selenium selenium, Map<String, ?> parameters) {
    StringWriter sw = new StringWriter();
    try {
      new JSONWriter(sw)
          .object()
          .key("script").value(parameters.get("script"))
          .key("args").value(parameters.get("args"))
          .key("timeout").value(timeoutMillis)
          .endObject();
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }

    String script = "core.script.execute(" + sw + ")";
    String value;
    try {
      value = selenium.getEval(script);
    } catch (SeleniumException e) {
      if (e.getMessage().startsWith("ScriptTimeoutError")) {
        throw new TimeoutException(e.getMessage(), e);
      }
      throw e;
    }
    return populateReturnValue(value);
  }

  private String getArgumentValue(Object arg) {
    if (arg == null) {
      return null;
    } else if (arg instanceof String) {
      return String.format("'%s'", ((String) arg).replaceAll("'", "\\'"));
    } else {
      return String.valueOf(arg);
    }
  }

  private Object populateReturnValue(String value) {
    if ("__undefined__".equals(value)) {
      return null;
    } else if (value.matches("^\\d+$")) {
      return Long.parseLong(value);
    } else if (value.matches("^\\d+\\.\\d+$")) {
      return Double.parseDouble(value);
    } else if ("true".equals(value) || "false".equals(value)) {
      return Boolean.parseBoolean(value);
    } else {
      // Falll back to a string
      return value;
    }
  }

  public SeleneseFunction<Object> setScriptTimeout() {
    return new SeleneseFunction<Object>() {

      public Object apply(Selenium selenium, Map<String, ?> args) {
        ExecuteAsyncScript.this.timeoutMillis = ((Number) args.get("ms")).longValue();
        return null;
      }
    };
  }
}
