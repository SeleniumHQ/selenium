/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.internal;

import static com.google.common.base.Preconditions.checkNotNull;

import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.IgnoredTestCallback;

import com.google.common.base.Objects;
import com.google.common.collect.Sets;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

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

  public String toJson() throws JSONException {
    JSONArray array = new JSONArray();
    for (IgnoredTest test : tests) {
      array.put(test.toJson());
    }
    return array.toString();
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
    
    public JSONObject toJson() throws JSONException {
      JSONObject json = new JSONObject()
          .put("className", clazz.getName())
          .put("testName", method.getName());

      Ignore methodIgnore = method.getAnnotation(Ignore.class);
      if (methodIgnore != null) {
        json.put("method", getIgnoreInfo(methodIgnore));
      }

      Ignore classIgnore = clazz.getAnnotation(Ignore.class);
      if (classIgnore != null) {
        json.put("class", getIgnoreInfo(classIgnore));
      }

      return json;
    }
    
    private static JSONObject getIgnoreInfo(Ignore annotation) throws JSONException {
      return new JSONObject()
          .put("drivers", annotation.value())
          .put("issues", annotation.issues())
          .put("platforms", annotation.platforms())
          .put("reason", annotation.reason());
    }
  }
}
