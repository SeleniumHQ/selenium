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

package org.openqa.selenium.remote.server.handler.html5;

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.html5.DatabaseStorage;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.ResponseAwareWebDriverHandler;
import org.openqa.selenium.remote.server.handler.internal.ArgumentConverter;
import org.openqa.selenium.remote.server.handler.internal.ResultConverter;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;
import java.util.Map;

public class ExecuteSQL extends ResponseAwareWebDriverHandler implements JsonParametersAware {
  private String dbName;
  private String query;
  private List<Object> args = Lists.newArrayList();

  public ExecuteSQL(Session session) {
    super(session);
  }

  public ResultType call() throws Exception {
    Object value =
        ((DatabaseStorage) getUnwrappedDriver()).executeSQL(dbName, query, args.toArray());
    Object result = new ResultConverter(getKnownElements()).apply(value);
    response.setValue(result);
    return ResultType.SUCCESS;
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    dbName = (String) allParameters.get("dbName");
    query = (String) allParameters.get("query");
    List<?> params = (List<?>) allParameters.get("args");
    args = Lists.newArrayList(Iterables.transform(params,
        new ArgumentConverter(getKnownElements())));
  }

  @Override
  public String toString() {
    return String.format("[execute SQL query: %s, %s, %s]", dbName, query, args);
  }
}
