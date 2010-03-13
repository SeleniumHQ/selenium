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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.rest.ResultType;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ExecuteScript extends WebDriverHandler implements JsonParametersAware {
  private Response response;
  private String script;
  private List<Object> args = new ArrayList<Object>();

  public ExecuteScript(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    script = (String) allParameters.get("script");

    List<?> params = (List<?>) allParameters.get("args");

    args = Lists.newArrayList(Iterables.transform(params, new ArgumentConverter()));
  }
  
  public ResultType call() throws Exception {
    response = newResponse();

    Object value;
    if (args.size() > 0) {
      value = ((JavascriptExecutor) getDriver()).executeScript(script, args.toArray());
    } else {
      value = ((JavascriptExecutor) getDriver()).executeScript(script);
    }

    Object result = new ResultConverter().apply(value);
    response.setValue(result);
    
    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
  
  @Override
  public String toString() {
    return String.format("[execute script: %s, %s]", script, args);
  }

  private class ArgumentConverter implements Function<Object, Object> {
    public Object apply(Object arg) {
      if (arg instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> paramAsMap = (Map<String, Object>)arg;
        if (paramAsMap.containsKey("ELEMENT")) {
          KnownElements.ProxiedElement element = (KnownElements.ProxiedElement) getKnownElements()
              .get((String) paramAsMap.get("ELEMENT"));
          return element.getWrappedElement();
        }

        Map<String, Object> converted = Maps.newHashMapWithExpectedSize(paramAsMap.size());
        for (Map.Entry<String, Object> entry : paramAsMap.entrySet()) {
          converted.put(entry.getKey(), apply(entry.getValue()));
        }
        return converted;
      }

      if (arg instanceof List<?>) {
        return Lists.newArrayList(Iterables.transform((List<?>) arg, this));
      }

      return arg;
    }
  }

  /**
   * Converts an object to be sent as JSON according to the wire protocol.
   */
  private class ResultConverter implements Function<Object, Object> {
    public Object apply(Object result) {
      if (result instanceof WebElement) {
        String elementId = getKnownElements().add((WebElement) result);
        return ImmutableMap.of("ELEMENT", elementId);
      }

      if (result instanceof List) {
        @SuppressWarnings("unchecked")
        List<Object> resultAsList = (List<Object>) result;
        return Lists.newArrayList(Iterables.transform(resultAsList, this));
      }

      if (result instanceof Map<?, ?>) {
        Map<?, ?> resultAsMap = (Map<?, ?>) result;
        Map<Object, Object> converted = Maps.newHashMapWithExpectedSize(resultAsMap.size());
        for (Map.Entry<?, ?> entry : resultAsMap.entrySet()) {
          converted.put(entry.getKey(), apply(entry.getValue()));
        }
        return converted;
      }

      return result;
    }
  }
}
