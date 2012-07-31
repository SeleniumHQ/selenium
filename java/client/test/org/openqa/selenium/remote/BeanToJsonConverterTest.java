/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.DoNotUseProxyPac;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;

import java.awt.*;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;


public class BeanToJsonConverterTest {

  @Test
  public void testShouldBeAbleToConvertASimpleString() throws Exception {
    String json = new BeanToJsonConverter().convert("cheese");

    assertThat(json, is("cheese"));
  }

  @Test
  public void testShouldConvertAMapIntoAJsonObject() throws Exception {
    Map<String, String> toConvert = new HashMap<String, String>();
    toConvert.put("cheese", "cheddar");
    toConvert.put("fish", "nice bit of haddock");

    String json = new BeanToJsonConverter().convert(toConvert);

    JSONObject converted = new JSONObject(json);
    assertThat((String) converted.get("cheese"), is("cheddar"));
  }

  @Test
  public void testShouldConvertASimpleJavaBean() throws Exception {
    String json = new BeanToJsonConverter().convert(new SimpleBean());

    JSONObject converted = new JSONObject(json);
    assertThat((String) converted.get("foo"), is("bar"));
    assertThat((Boolean) converted.get("simple"), is(true));
    assertThat((Double) converted.get("number"), is(123.456));
  }

  @Test
  public void testShouldConvertArrays() throws Exception {
    String json = new BeanToJsonConverter().convert(new BeanWithArray());

    JSONObject converted = new JSONObject(json);
    JSONArray allNames = (JSONArray) converted.get("names");
    assertThat(allNames.length(), is(3));
  }

  @Test
  public void testShouldConvertCollections() throws Exception {
    String json = new BeanToJsonConverter().convert(new BeanWithCollection());

    JSONObject converted = new JSONObject(json);
    JSONArray allNames = (JSONArray) converted.get("something");
    assertThat(allNames.length(), is(2));
  }

  @Test
  public void testShouldConvertNumbersAsLongs() throws Exception {

    String json = new BeanToJsonConverter().convert(new Exception());
    Map map = new JsonToBeanConverter().convert(Map.class, json);

    List stack = (List) map.get("stackTrace");
    Map line = (Map) stack.get(0);

    Object o = line.get("lineNumber");
    assertTrue("line number is of type: " + o.getClass(), o instanceof Long);
  }

  @Test
  public void testShouldNotChokeWhenCollectionIsNull() throws Exception {
    try {
      new BeanToJsonConverter().convert(new BeanWithNullCollection());
    } catch (Exception e) {
      e.printStackTrace();
      fail("That shouldn't have happened");
    }
  }

  @Test
  public void testShouldConvertEnumsToStrings() throws Exception {
    // If this doesn't hang indefinitely, we're all good
    new BeanToJsonConverter().convert(State.INDIFFERENT);
  }

  @Test
  public void testShouldConvertEnumsWithMethods() throws Exception {
    // If this doesn't hang indefinitely, we're all good
    new BeanToJsonConverter().convert(WithMethods.CHEESE);
  }

  @Test
  public void testNullAndAnEmptyStringAreEncodedDifferently() throws Exception {
    BeanToJsonConverter converter = new BeanToJsonConverter();

    String nullValue = converter.convert(null);
    String emptyString = converter.convert("");

    assertFalse(emptyString.equals(nullValue));
  }

  @Test
  public void testShouldBeAbleToConvertAPoint() throws Exception {
    Point point = new Point(65, 75);

    try {
      new BeanToJsonConverter().convert(point);
    } catch (StackOverflowError e) {
      fail("This should never happen");
    }
  }

  @Test
  public void testShouldEncodeClassNameAsClassProperty() throws Exception {
    String json = new BeanToJsonConverter().convert(new SimpleBean());
    JSONObject converted = new JSONObject(json);

    assertEquals(SimpleBean.class.getName(), converted.get("class"));
  }

  @Test
  public void testShouldBeAbleToConvertASessionId() throws JSONException {
    SessionId sessionId = new SessionId("some id");
    String json = new BeanToJsonConverter().convert(sessionId);
    JSONObject converted = new JSONObject(json);

    assertEquals("some id", converted.getString("value"));
  }

  @Test
  public void testShouldBeAbleToConvertAJsonObject() throws JSONException {
    JSONObject obj = new JSONObject();
    obj.put("key", "value");
    String json = new BeanToJsonConverter().convert(obj);
    JSONObject converted = new JSONObject(json);

    assertEquals("value", converted.getString("key"));
  }

  @Test
  public void testShouldBeAbleToConvertACapabilityObject() throws JSONException {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("key", "alpha");

    String json = new BeanToJsonConverter().convert(caps);
    JSONObject converted = new JSONObject(json);

    assertEquals("alpha", converted.getString("key"));
  }

  @Test
  public void testShouldConvertAProxyPacProperly() throws JSONException {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();
    pac.map("*/selenium/*").toProxy("http://localhost:8080/selenium-server");
    pac.map("/[a-zA-Z]{4}.microsoft.com/").toProxy("http://localhost:1010/selenium-server/");
    pac.map("/flibble*").toNoProxy();
    pac.mapHost("www.google.com").toProxy("http://fishy.com/");
    pac.mapHost("seleniumhq.org").toNoProxy();
    pac.defaults().toNoProxy();

    String json = new BeanToJsonConverter().convert(pac);
    JSONObject converted = new JSONObject(json);

    assertEquals("http://localhost:8080/selenium-server",
        converted.getJSONObject("proxiedUrls").get("*/selenium/*"));
    assertEquals("http://localhost:1010/selenium-server/",
        converted.getJSONObject("proxiedRegexUrls").get("/[a-zA-Z]{4}.microsoft.com/"));
    assertEquals("/flibble*", converted.getJSONArray("directUrls").get(0));
    assertEquals("seleniumhq.org", converted.getJSONArray("directHosts").get(0));
    assertEquals("http://fishy.com/", converted.getJSONObject("proxiedHosts").get("www.google.com"));
    assertEquals("'DIRECT'", converted.get("defaultProxy"));
  }

  @Test
  public void testShouldConvertAProxyCorrectly() throws JSONException {
    Proxy proxy = new Proxy();
    proxy.setHttpProxy("localhost:4444");

    DesiredCapabilities caps = new DesiredCapabilities("foo", "1", Platform.LINUX);
    caps.setCapability(CapabilityType.PROXY, proxy);
    Map<String, ?> asMap = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(new SessionId("empty"), DriverCommand.NEW_SESSION, asMap);

    String json = new BeanToJsonConverter().convert(command.getParameters());
    JSONObject converted = new JSONObject(json);
    JSONObject capsAsMap = converted.getJSONObject("desiredCapabilities");

    assertEquals(json, proxy.getHttpProxy(),
        capsAsMap.getJSONObject(CapabilityType.PROXY).get("httpProxy"));
  }

  @Test
  public void testShouldCallToJsonMethodIfPresent() {
    String json = new BeanToJsonConverter().convert(new JsonAware("converted"));

    assertEquals("converted", json);
  }


  private void verifyStackTraceInJson(String json, StackTraceElement[] stackTrace) {
    int posOfLastStackTraceElement = 0;
    for (StackTraceElement e : stackTrace) {
      if (e.getFileName() != null) {
        // Native methods may have null filenames
        assertTrue("Filename not found", json.contains("\"fileName\":\"" + e.getFileName() + "\""));
      }
      assertTrue("Line number not found",
          json.contains("\"lineNumber\":" + e.getLineNumber() + ""));
      assertTrue("class not found.",
          json.contains("\"class\":\"" + e.getClass().getName() + "\""));
      assertTrue("class name not found",
          json.contains("\"className\":\"" + e.getClassName() + "\""));
      assertTrue("method name not found.",
          json.contains("\"methodName\":\"" + e.getMethodName() + "\""));

      int posOfCurrStackTraceElement = json.indexOf(e.getMethodName());
      assertTrue("Mismatch in order of stack trace elements.",
          posOfCurrStackTraceElement > posOfLastStackTraceElement);
    }
  }

  @Test
  public void testShouldBeAbleToConvertARuntimeException() {
    RuntimeException clientError = new RuntimeException("foo bar baz!");
    StackTraceElement[] stackTrace = clientError.getStackTrace();
    String json = new BeanToJsonConverter().convert(clientError);
    assertTrue(json.contains("\"message\":\"foo bar baz!\""));
    assertTrue(json.contains("\"class\":\"java.lang.RuntimeException\""));
    assertTrue(json.contains("\"stackTrace\""));
    verifyStackTraceInJson(json, stackTrace);
  }

  @Test
  public void testShouldBeAbleToConvertAWebDriverException() throws JSONException {
    RuntimeException clientError = new WebDriverException("foo bar baz!");
    StackTraceElement[] stackTrace = clientError.getStackTrace();
    String raw = new BeanToJsonConverter().convert(clientError);

    JSONObject json = new JSONObject(raw);
    assertTrue(raw, json.has("buildInformation"));
    assertTrue(raw, json.has("systemInformation"));
    assertTrue(raw, json.has("driverInformation"));

    assertTrue(raw, json.has("message"));
    assertThat(json.getString("message"), containsString("foo bar baz!\n"));
    assertThat(json.getString("class"), is(WebDriverException.class.getName()));

    assertTrue(raw, json.has("stackTrace"));
    verifyStackTraceInJson(raw, stackTrace);
  }

  @Test
  public void testShouldConvertDatesToMillisecondsInUtcTime() {
    String jsonStr = new BeanToJsonConverter().convert(new Date(0));
    assertEquals(0, Integer.valueOf(jsonStr).intValue());
  }

  @Test
  public void testShouldConvertDateFieldsToSecondsSince1970InUtcTime() throws JSONException {
    class Bean {
      private final Date date;

      Bean(Date date) {
        this.date = date;
      }

      public Date getDate() {
        return date;
      }
    }

    Date date = new Date(123456789L);
    Bean bean = new Bean(date);
    String jsonStr = new BeanToJsonConverter().convert(bean);
    JSONObject json = new JSONObject(jsonStr);

    assertTrue(json.has("date"));
    assertEquals(123456L, json.getLong("date"));
  }

  @Test
  public void testShouldBeAbleToConvertACookie() throws JSONException {
    Date expiry = new Date();
    Cookie cookie = new Cookie("name", "value", "domain", "/path", expiry, true);

    String jsonStr = new BeanToJsonConverter().convert(cookie);
    JSONObject json = new JSONObject(jsonStr);

    assertEquals("name", json.getString("name"));
    assertEquals("value", json.getString("value"));
    assertEquals("domain", json.getString("domain"));
    assertEquals("/path", json.getString("path"));
    assertTrue(json.getBoolean("secure"));
    assertEquals(TimeUnit.MILLISECONDS.toSeconds(expiry.getTime()), json.getLong("expiry"));
  }

  @Test
  public void testUnsetCookieFieldsAreUndefined() {
    Cookie cookie = new Cookie("name", "value");
    String jsonStr = new BeanToJsonConverter().convert(cookie);
    // assertThat(jsonStr, not(containsString("path")));
    assertThat(jsonStr, not(containsString("domain")));
    assertThat(jsonStr, not(containsString("expiry")));
  }

  @Test
  public void testProperlyConvertsNulls() {
    Map<String, Object> frameId = Maps.newHashMap();
    frameId.put("id", null);
    String payload = new BeanToJsonConverter().convert(frameId);
    assertEquals("{\"id\":null}", payload);
  }

  @Test
  public void testConvertLoggingPreferencesToJson() throws JSONException {
    LoggingPreferences prefs = new LoggingPreferences();
    prefs.enable(LogType.CLIENT, Level.FINE);
    prefs.enable(LogType.DRIVER, Level.ALL);

    JSONObject json = new JSONObject(new BeanToJsonConverter().convert(prefs));
    assertEquals("FINE", json.getString(LogType.CLIENT));
    assertEquals("ALL", json.getString(LogType.DRIVER));
  }

  @Test
  public void testConvertsLogEntryToJson() throws JSONException {
    JSONObject object = new JSONObject(new BeanToJsonConverter().convert(new LogEntry(Level.OFF, 17, "foo")));
    assertEquals("foo", object.get("message"));
    assertEquals(17, object.get("timestamp"));
    assertEquals("OFF", object.get("level"));
    
  }

  @Test
  public void testConvertLogEntriesToJson() throws JSONException {
    long timestamp = new Date().getTime();
    final LogEntry entry1 = new LogEntry(Level.OFF, timestamp, "entry1");
    final LogEntry entry2 = new LogEntry(Level.WARNING, timestamp, "entry2");
    LogEntries entries = new LogEntries(Lists.<LogEntry>newArrayList(entry1, entry2));

    JSONArray json = new JSONArray(new BeanToJsonConverter().convert(entries));
    JSONObject obj1 = (JSONObject) json.get(0);
    JSONObject obj2 = (JSONObject) json.get(1);
    assertEquals("OFF", obj1.get("level"));
    assertEquals(timestamp, obj1.get("timestamp"));
    assertEquals("entry1", obj1.get("message"));
    assertEquals("WARNING", obj2.get("level"));
    assertEquals(timestamp, obj2.get("timestamp"));
    assertEquals("entry2", obj2.get("message"));
  }

  @SuppressWarnings("unused")
  private static class SimpleBean {

    public String getFoo() {
      return "bar";
    }

    public boolean isSimple() {
      return true;
    }

    public double getNumber() {
      return 123.456;
    }
  }

  @SuppressWarnings("unused")
  private static class BeanWithArray {
    public String[] getNames() {
      return new String[] {"peter", "paul", "mary"};
    }
  }

  private static class BeanWithCollection {

    @SuppressWarnings("unused")
    public Set getSomething() {
      Set<Integer> integers = new HashSet<Integer>();
      integers.add(1);
      integers.add(43);
      return integers;
    }
  }

  private static class BeanWithNullCollection {

    @SuppressWarnings("unused")
    public List getList() {
      return null;
    }
  }

  public static enum State {

    GOOD,
    BAD,
    INDIFFERENT
  }

  public static enum WithMethods {

    CHEESE() {
      @Override
      public void eat(String foodStuff) {
        // Does nothing
      }
    },
    EGGS() {
      @Override
      public void eat(String foodStuff) {
        // Does nothing too
      }
    };

    public abstract void eat(String foodStuff);
  }

  public class JsonAware {
    private String convertedValue;

    public JsonAware(String convertedValue) {
      this.convertedValue = convertedValue;
    }

    public String toJson() {
      return convertedValue;
    }
  }
}
