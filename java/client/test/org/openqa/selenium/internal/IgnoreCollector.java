// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


package org.openqa.selenium.internal;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.base.Objects;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.IgnoreList;

import java.lang.reflect.Method;
import java.util.Set;

public class IgnoreCollector implements IgnoredTestCallback {

  private Set<IgnoredTest> tests = Sets.newHashSet();

  @Override
  public void callback(Class<?> clazz, Method method) {
    checkNotNull(clazz);
    checkNotNull(method);

    if (wasIgnored(clazz, method)) {
      IgnoredTest ignoredTest = new IgnoredTest(clazz, method);
      tests.add(ignoredTest);
    }
  }

  /**
   * @param clazz The test class (not necessarily the method's declaring class).
   * @param method The test method.
   * @return Whether the test was ignored from a {@link Ignore} annotation.
   */
  private static boolean wasIgnored(Class<?> clazz, Method method) {
    return method.getAnnotation(Ignore.class) != null
        || clazz.getAnnotation(Ignore.class) != null;
  }

  public String toJson() {
    JsonArray array = new JsonArray();
    for (IgnoredTest test : tests) {
      array.add(test.toJson());
    }
    return new Gson().toJson(array);
  }

  private static class IgnoredTest {

    private final Class<?> clazz;
    private final Method method;

    private IgnoredTest(Class<?> clazz, Method method) {
      this.clazz = clazz;
      this.method = method;
    }

    @Override
    public int hashCode() {
      return Objects.hashCode(clazz, method);
    }

    @Override
    public boolean equals(Object o) {
      if (o instanceof IgnoredTest) {
        IgnoredTest that = (IgnoredTest) o;
        return Objects.equal(this.clazz, that.clazz)
            && Objects.equal(this.method, that.method);
      }
      return false;
    }

    public JsonObject toJson() {
      JsonObject json = new JsonObject();
      json.addProperty("className", clazz.getName());
      json.addProperty("testName", method.getName());

      IgnoreList methodIgnore = method.getAnnotation(IgnoreList.class);
      if (methodIgnore != null) {
        json.add("method", getIgnoreInfo(methodIgnore));
      }

      IgnoreList classIgnore = clazz.getAnnotation(IgnoreList.class);
      if (classIgnore != null) {
        json.add("class", getIgnoreInfo(classIgnore));
      }

      return json;
    }

    private static JsonObject getIgnoreInfo(IgnoreList annotation) {
      JsonObject json = new JsonObject();
      Gson gson = new Gson();
      json.add("drivers", gson.toJsonTree(annotation.value()));
      // TODO: rework
      //json.add("issues", gson.toJsonTree(annotation.issues()));
      //json.add("platforms", gson.toJsonTree(annotation.platforms()));
      //json.addProperty("reason", annotation.reason());
      return json;
    }
  }
}
