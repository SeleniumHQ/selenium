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

package org.openqa.selenium.remote.html5;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.html5.DatabaseStorage;
import org.openqa.selenium.html5.ResultSet;
import org.openqa.selenium.html5.ResultSetRows;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.InterfaceImplementation;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

public class AddDatabaseStorage implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return DatabaseStorage.class;
  }

  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {
      public Object invoke(ExecuteMethod executeMethod, Object self, Method method, Object... args) {
        String databaseName = (String) args[0];
        String query = (String) args[1];
        Object[] arguments = (Object[]) args[2];

        query = query.replaceAll("\"", "\\\"");
        Iterable<Object> convertedArgs = Iterables.transform(
            Lists.newArrayList(arguments), new WebElementToJsonConverter());

        Map<String, ?> params = ImmutableMap.of(
            "dbName", databaseName,
            "query", query,
            "args", Lists.newArrayList(convertedArgs));

        Map<Object, Object> resultAsMap =
            (Map<Object, Object>) executeMethod.execute(DriverCommand.EXECUTE_SQL, params);
        ResultSet rs = new ResultSet(((Long) resultAsMap.get("insertId")).intValue(),
            ((Long) resultAsMap.get("rowsAffected")).intValue(),
            new ResultSetRows((List<Map<String, Object>>) resultAsMap.get("rows")));
        return rs;
      }
    };
  }
}
