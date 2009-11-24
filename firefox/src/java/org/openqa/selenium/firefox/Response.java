/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

package org.openqa.selenium.firefox;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.ElementNotVisibleException;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Response {
    private final JSONObject result;
    private final String methodName;
    private final Context context;
    private final String responseText;
    private boolean isError;

    public Response(String json) {
        try {
            result = new JSONObject(json.trim());

            methodName = (String) result.get("commandName");
            String contextAsString = (String) result.get("context");
            if (contextAsString != null)
                context = new Context(contextAsString);
            else
                context = null;
            responseText = String.valueOf(result.get("response"));

            isError = (Boolean) result.get("isError");
        } catch (Exception e) {
            throw new WebDriverException("Could not parse \"" + json.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + "\".", e);
        }
    }

    public String getCommand() {
        return methodName;
    }

    public Context getContext() {
        return context;
    }

    public String getResponseText() {
        return responseText;
    }

    public boolean isError() {
        return isError;
    }

  @Override
  public String toString() {
    return result.toString();
  }

  public Object getExtraResult(String fieldName) {
    try {
      return result.isNull(fieldName) ? null : result.get(fieldName);
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }
  }

    public void ifNecessaryThrow(Class<? extends RuntimeException> exceptionClass) {
        if (!isError)
            return;

        if (responseText.startsWith("element is obsolete")) {
          throw new StaleElementReferenceException("Element is obsolete");
        }

        if (responseText.startsWith("Element is not currently visible")) {
          throw new ElementNotVisibleException("Element is not visible, and so cannot be interacted with");
        }

        RuntimeException toThrow = null;
        try {
            Constructor<? extends RuntimeException> constructor = exceptionClass.getConstructor(String.class);
            JSONObject info = null;
            try {
                info = new JSONObject(getResponseText());
            } catch (Exception e) {
                toThrow = constructor.newInstance(getResponseText());
            }

            if (info != null) {
                toThrow = constructor.newInstance(String.format("%s: %s", info.has("name") ? info.get("name") : "unknown", info.get("message")));
                List<StackTraceElement> stack = new ArrayList<StackTraceElement>();
                if (info.has("stack")) {
                  for (String trace : ((String) info.get("stack")).split("\n")) {
                      StackTraceElement element = createStackTraceElement(trace);
                      if (element != null)
                          stack.add(element);
                  }
                }
                stack.addAll(Arrays.asList(toThrow.getStackTrace()));
                toThrow.setStackTrace(stack.toArray(new StackTraceElement[0]));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new WebDriverException(getResponseText());
        }

        throw toThrow;
    }

    private StackTraceElement createStackTraceElement(String trace) {
        try {
            String[] parts = trace.split(" -> ");
            int splitAt = parts[1].lastIndexOf(":");
            int lineNumber = Integer.parseInt(parts[1].substring(splitAt + 1));
            return new StackTraceElement("FirefoxDriver", parts[0], parts[1].substring(0, splitAt), lineNumber);
        } catch (Exception e) {
            return null;
        }
    }
}
