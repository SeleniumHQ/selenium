package org.openqa.selenium.internal;

import org.json.JSONArray;
import org.json.JSONException;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.remote.BeanToJsonConverter;

import java.lang.reflect.Method;
import java.util.*;

public class IgnoreCollector implements IgnoredTestCallback {
  private Set<Map> tests = new HashSet<Map>();
  private BeanToJsonConverter converter = new BeanToJsonConverter();

  public void callback(Class clazz, String testName, Ignore ignore) {
    for (String name : getTestMethodsFor(clazz, testName)) {
      tests.add(IgnoredTestCase.asMap(clazz.getName(), name, ignore));
    }
  }

  private List<String> getTestMethodsFor(Class clazz, String testName) {
    if (!testName.isEmpty()) {
      return Arrays.asList(testName);
    }

    List<String> testMethods = new ArrayList<String>();

    Method[] methods = clazz.getDeclaredMethods();
    for (Method method : methods) {
      if (isTestMethod(method)) {
        testMethods.add(method.getName());
      }
    }
    return testMethods;
  }

  private boolean isTestMethod(Method method) {
    return method.getAnnotation(org.junit.Test.class) != null || method.getName().startsWith("test");
  }

  public String toJson() throws JSONException {
    return new JSONArray(converter.convert(tests)).toString();
  }

  private static class IgnoredTestCase {
    public static Map<String, Object> asMap(String className, String testName, Ignore ignore) {
      final Map<String, Object> map = new HashMap<String, Object>();
      map.put("className", className);
      map.put("testName", testName);
      map.put("reason", ignore.reason());
      map.put("issues", ignore.issues());

      final Set<String> drivers = new HashSet<String>();
      for (Ignore.Driver driver : ignore.value()) {
        drivers.add(driver.name());
      }

      map.put("drivers", drivers);

      return map;
    }
  }
}
