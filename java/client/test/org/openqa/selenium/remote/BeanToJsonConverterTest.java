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

package org.openqa.selenium.remote;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;

import java.awt.*;
import java.io.StringReader;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;


@RunWith(JUnit4.class)
public class BeanToJsonConverterTest {

  @Test
  public void testShouldBeAbleToConvertASimpleString() throws Exception {
    String json = new BeanToJsonConverter().convert("cheese");

    assertThat(json, is("\"cheese\""));
  }

  @Test
  public void testShouldConvertAMapIntoAJsonObject() throws Exception {
    Map<String, String> toConvert = new HashMap<>();
    toConvert.put("cheese", "cheddar");
    toConvert.put("fish", "nice bit of haddock");

    String json = new BeanToJsonConverter().convert(toConvert);

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();
    assertThat(converted.get("cheese").getAsString(), is("cheddar"));
  }

  @Test
  public void testShouldConvertASimpleJavaBean() throws Exception {
    String json = new BeanToJsonConverter().convert(new SimpleBean());

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();
    assertThat(converted.get("foo").getAsString(), is("bar"));
    assertThat(converted.get("simple").getAsBoolean(), is(true));
    assertThat(converted.get("number").getAsDouble(), is(123.456));
  }

  @Test
  public void testShouldConvertArrays() throws Exception {
    String json = new BeanToJsonConverter().convert(new BeanWithArray());

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();
    JsonArray allNames = converted.get("names").getAsJsonArray();
    assertThat(allNames.size(), is(3));
  }

  @Test
  public void testShouldConvertCollections() throws Exception {
    String json = new BeanToJsonConverter().convert(new BeanWithCollection());

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();
    JsonArray allNames = converted.get("something").getAsJsonArray();
    assertThat(allNames.size(), is(2));
  }

  @Test
  public void testShouldConvertNumbersAsLongs() throws Exception {
    String json = new BeanToJsonConverter().convert(new Exception());
    Map<?,?> map = new JsonToBeanConverter().convert(Map.class, json);

    List<?> stack = (List<?>) map.get("stackTrace");
    Map<?,?> line = (Map<?,?>) stack.get(0);

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

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();

    assertEquals(SimpleBean.class.getName(), converted.get("class").getAsString());
  }

  @Test
  public void testShouldBeAbleToConvertASessionId() {
    SessionId sessionId = new SessionId("some id");
    String json = new BeanToJsonConverter().convert(sessionId);

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();

    assertEquals("some id", converted.get("value").getAsString());
  }

  @Test
  public void testShouldBeAbleToConvertAJsonObject() {
    JsonObject obj = new JsonObject();
    obj.addProperty("key", "value");
    String json = new BeanToJsonConverter().convert(obj);

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();

    assertEquals("value", converted.get("key").getAsString());
  }

  @Test
  public void testShouldBeAbleToConvertACapabilityObject() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("key", "alpha");

    String json = new BeanToJsonConverter().convert(caps);

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();

    assertEquals("alpha", converted.get("key").getAsString());
  }

  @Test
  public void testShouldConvertAProxyCorrectly() {
    Proxy proxy = new Proxy();
    proxy.setHttpProxy("localhost:4444");

    DesiredCapabilities caps = new DesiredCapabilities("foo", "1", Platform.LINUX);
    caps.setCapability(CapabilityType.PROXY, proxy);
    Map<String, ?> asMap = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(new SessionId("empty"), DriverCommand.NEW_SESSION, asMap);

    String json = new BeanToJsonConverter().convert(command.getParameters());

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();
    JsonObject capsAsMap = converted.get("desiredCapabilities").getAsJsonObject();

    assertEquals(json, proxy.getHttpProxy(),
        capsAsMap.get(CapabilityType.PROXY).getAsJsonObject()
            .get("httpProxy").getAsString());
  }

  @Test
  public void testShouldCallToJsonMethodIfPresent() {
    String json = new BeanToJsonConverter().convert(new JsonAware("converted"));
    assertEquals("\"converted\"", json);
  }

  @Test
  public void testShouldCallAsMapMethodIfPresent() {
    String json = new BeanToJsonConverter().convert(new Mappable1("a key", "a value"));
    assertEquals("{\"a key\":\"a value\"}", json);
  }

  @Test
  public void testShouldCallToMapMethodIfPresent() {
    String json = new BeanToJsonConverter().convert(new Mappable2("a key", "a value"));
    assertEquals("{\"a key\":\"a value\"}", json);
  }

  @Test
  public void testShouldCallAsListMethodIfPresent() {
    String json = new BeanToJsonConverter().convert(new Listable1("item1", "item2"));
    assertEquals("[\"item1\",\"item2\"]", json);
  }

  @Test
  public void testShouldCallToListMethodIfPresent() {
    String json = new BeanToJsonConverter().convert(new Listable2("item1", "item2"));
    assertEquals("[\"item1\",\"item2\"]", json);
  }

  @Test
  public void testConvertsToJsonMethodResultToPrimitiveIfItIsNotJson() {
    // We want this parsed as a string primitive, but JsonParser will reject it
    // as malformed because of the slash.
    String raw = "gnu/linux";

    try {
      // Make sure that the parser does actually reject this so the test is
      // meaningful. If this stops failing, choose a different malformed JSON
      // string.
      new JsonParser().parse(raw).toString();
      fail("Expected a parser exception when parsing: " + raw);
    } catch (JsonSyntaxException expected) {
    }

    String json = new BeanToJsonConverter().convert(new JsonAware(raw));
    assertEquals("\"gnu/linux\"", json);
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
  public void testShouldBeAbleToConvertAWebDriverException() {
    RuntimeException clientError = new WebDriverException("foo bar baz!");
    StackTraceElement[] stackTrace = clientError.getStackTrace();
    String raw = new BeanToJsonConverter().convert(clientError);

    JsonObject converted = new JsonParser().parse(raw).getAsJsonObject();

    assertTrue(raw, converted.has("buildInformation"));
    assertTrue(raw, converted.has("systemInformation"));
    assertTrue(raw, converted.has("additionalInformation"));

    assertTrue(raw, converted.has("message"));
    assertThat(converted.get("message").getAsString(), containsString("foo bar baz!"));
    assertThat(converted.get("class").getAsString(), is(WebDriverException.class.getName()));

    assertTrue(raw, converted.has("stackTrace"));
    verifyStackTraceInJson(raw, stackTrace);
  }

  @Test
  public void testShouldConverUnhandledAlertException() {
    RuntimeException clientError = new UnhandledAlertException("unhandled alert", "cheese!");
    Map<?, ?> obj = new Gson()
        .fromJson(new StringReader(new BeanToJsonConverter().convert(clientError)), Map.class);
    assertTrue(obj.containsKey("alert"));
    assertEquals(ImmutableMap.of("text", "cheese!"), obj.get("alert"));
  }


  @Test
  public void testShouldConvertDatesToMillisecondsInUtcTime() {
    String jsonStr = new BeanToJsonConverter().convert(new Date(0));
    assertEquals(0, Integer.valueOf(jsonStr).intValue());
  }

  @Test
  public void testShouldConvertDateFieldsToSecondsSince1970InUtcTime() {
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

    JsonObject converted = new JsonParser().parse(jsonStr).getAsJsonObject();

    assertTrue(converted.has("date"));
    assertEquals(123456L, converted.get("date").getAsLong());
  }

  @Test
  public void testShouldBeAbleToConvertACookie() {
    Date expiry = new Date();
    Cookie cookie = new Cookie("name", "value", "domain", "/path", expiry, true, true);

    String jsonStr = new BeanToJsonConverter().convert(cookie);

    JsonObject converted = new JsonParser().parse(jsonStr).getAsJsonObject();

    assertEquals("name", converted.get("name").getAsString());
    assertEquals("value", converted.get("value").getAsString());
    assertEquals("domain", converted.get("domain").getAsString());
    assertEquals("/path", converted.get("path").getAsString());
    assertTrue(converted.get("secure").getAsBoolean());
    assertTrue(converted.get("httpOnly").getAsBoolean());
    assertEquals(TimeUnit.MILLISECONDS.toSeconds(expiry.getTime()),
                 converted.get("expiry").getAsLong());
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
  public void testConvertLoggingPreferencesToJson() {
    LoggingPreferences prefs = new LoggingPreferences();
    prefs.enable(LogType.BROWSER, Level.WARNING);
    prefs.enable(LogType.CLIENT, Level.FINE);
    prefs.enable(LogType.DRIVER, Level.ALL);
    prefs.enable(LogType.SERVER, Level.OFF);

    String json = new BeanToJsonConverter().convert(prefs);

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();

    assertEquals("WARNING", converted.get(LogType.BROWSER).getAsString());
    assertEquals("DEBUG", converted.get(LogType.CLIENT).getAsString());
    assertEquals("ALL", converted.get(LogType.DRIVER).getAsString());
    assertEquals("OFF", converted.get(LogType.SERVER).getAsString());
  }

  @Test
  public void testConvertsLogEntryToJson() {
    String raw = new BeanToJsonConverter().convert(new LogEntry(Level.OFF, 17, "foo"));

    JsonObject converted = new JsonParser().parse(raw).getAsJsonObject();

    assertEquals("foo", converted.get("message").getAsString());
    assertEquals(17, converted.get("timestamp").getAsLong());
    assertEquals("OFF", converted.get("level").getAsString());
  }

  @Test
  public void testConvertLogEntriesToJson() {
    long timestamp = new Date().getTime();
    final LogEntry entry1 = new LogEntry(Level.OFF, timestamp, "entry1");
    final LogEntry entry2 = new LogEntry(Level.WARNING, timestamp, "entry2");
    LogEntries entries = new LogEntries(Lists.newArrayList(entry1, entry2));

    String json = new BeanToJsonConverter().convert(entries);

    JsonArray converted = new JsonParser().parse(json).getAsJsonArray();

    JsonObject obj1 = converted.get(0).getAsJsonObject();
    JsonObject obj2 = converted.get(1).getAsJsonObject();
    assertEquals("OFF", obj1.get("level").getAsString());
    assertEquals(timestamp, obj1.get("timestamp").getAsLong());
    assertEquals("entry1", obj1.get("message").getAsString());
    assertEquals("WARNING", obj2.get("level").getAsString());
    assertEquals(timestamp, obj2.get("timestamp").getAsLong());
    assertEquals("entry2", obj2.get("message").getAsString());
  }

  @Test
  public void testShouldBeAbleToConvertACommand() {
    SessionId sessionId = new SessionId("some id");
    String commandName = "some command";
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("param1", "value1");
    parameters.put("param2", "value2");
    Command command = new Command(sessionId, commandName, parameters);

    String json = new BeanToJsonConverter().convert(command);

    JsonObject converted = new JsonParser().parse(json).getAsJsonObject();

    assertTrue(converted.has("sessionId"));
    JsonObject sid = converted.get("sessionId").getAsJsonObject();
    assertEquals(sid.get("value").getAsString(), sessionId.toString());

    assertEquals(converted.get("name").getAsString(), commandName);

    assertTrue(converted.has("parameters"));
    JsonObject pars = converted.get("parameters").getAsJsonObject();
    assertEquals(pars.entrySet().size(), 2);
    assertEquals(pars.get("param1").getAsString(), parameters.get("param1"));
    assertEquals(pars.get("param2").getAsString(), parameters.get("param2"));
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
    public Set<?> getSomething() {
      Set<Integer> integers = new HashSet<>();
      integers.add(1);
      integers.add(43);
      return integers;
    }
  }

  private static class BeanWithNullCollection {

    @SuppressWarnings("unused")
    public List<?> getList() {
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

  public class Mappable1 {
    private String key;
    private Object value;

    public Mappable1(String key, Object value) {
      this.key = key;
      this.value = value;
    }

    public Map<String, Object> asMap() {
      return ImmutableMap.of(key, value);
    }
  }

  public class Mappable2 {
    private String key;
    private Object value;

    public Mappable2(String key, Object value) {
      this.key = key;
      this.value = value;
    }

    public Map<String, Object> toMap() {
      return ImmutableMap.of(key, value);
    }
  }

  public class Listable1 {
    private List<String> items;

    public Listable1(String... items) {
      this.items = ImmutableList.copyOf(items);
    }

    public List<String> asList() {
      return items;
    }
  }

  public class Listable2 {
    private List<String> items;

    public Listable2(String... items) {
      this.items = ImmutableList.copyOf(items);
    }

    public List<String> toList() {
      return items;
    }
  }

}
