/*
Copyright 2007-2010 Selenium committers

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

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.internal.ArgumentConverter;
import org.openqa.selenium.remote.server.handler.internal.ResultConverter;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ExecuteAsyncScript extends ResponseAwareWebDriverHandler
    implements JsonParametersAware {
  private volatile String script;
  private final List<Object> args = new ArrayList<Object>();

  public ExecuteAsyncScript(Session session) {
    super(session);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    script = (String) allParameters.get("script");

    List<?> params = (List<?>) allParameters.get("args");

    args.addAll(Lists.newArrayList(
      Iterables.transform(params, new ArgumentConverter(getKnownElements()))));
  }

  public ResultType call() throws Exception {

    Object value;
    if (args.size() > 0) {
      value = ((JavascriptExecutor) getDriver()).executeAsyncScript(script, args.toArray());
    } else {
      value = ((JavascriptExecutor) getDriver()).executeAsyncScript(script);
    }

    Object result = new ResultConverter(getKnownElements()).apply(value);
    response.setValue(result);

    return ResultType.SUCCESS;
  }

  @Override
  public String toString() {
    return String.format("[execute async script: %s, %s]", script, args);
  }
}
