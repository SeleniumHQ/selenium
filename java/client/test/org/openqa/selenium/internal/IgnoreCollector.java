package org.openqa.selenium.internal;

import org.json.JSONArray;
import org.json.JSONException;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.remote.BeanToJsonConverter;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class IgnoreCollector implements IgnoredTestCallback {
    private Set<Map> tests = new HashSet<Map>();

    public void callback(String className, String testName, Ignore ignore) {
        tests.add(IgnoredTestCase.asMap(className, testName, ignore));
    }

    BeanToJsonConverter converter = new BeanToJsonConverter();

    public String toJson() throws JSONException {
      return new JSONArray(converter.convert(tests)).toString();
    }

    private static class IgnoredTestCase {
        public static Map<String, Object> asMap(String className, String testName, Ignore ignore) {
            final Map<String, Object> map = new HashMap<String, Object>();
            map.put("className", className);
            map.put("testName", testName);
            map.put("reason", ignore.reason());

            final Set<String> drivers = new HashSet<String>();
            for(Ignore.Driver driver : ignore.value()) {
                drivers.add(driver.name());
            }

            map.put("drivers", drivers);

            return map;
        }
    }
}
