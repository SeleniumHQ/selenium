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

package org.openqa.selenium.json;

import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

import java.io.StringReader;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

public class JsonTest {

  @Test
  public void canReadBooleans() {
    assertTrue(new Json().toType("true", Boolean.class));
    assertFalse(new Json().toType("false", Boolean.class));
  }

  @Test
  public void canReadANumber() {
    assertEquals(Long.valueOf(42), new Json().toType("42", Number.class));
    assertEquals(Integer.valueOf(42), new Json().toType("42", Integer.class));
    assertEquals(Double.valueOf(42), new Json().toType("42", Double.class));
  }

  @Test
  public void canRoundTripNumbers() {
    Map<String, Object> original = ImmutableMap.of(
        "options", ImmutableMap.of("args", ImmutableList.of(1L, "hello")));

    Json json = new Json();
    String converted = json.toJson(original);
    System.out.println("converted = " + converted);
    Object remade = json.toType(converted, MAP_TYPE);

    assertEquals(original, remade);
  }

  @Test
  public void roundTripAFirefoxOptions() {
    Map<String, Object> caps = ImmutableMap.of(
        "moz:firefoxOptions", ImmutableMap.of(
            "prefs", ImmutableMap.of("foo.bar", 1)));
    String json = new Json().toJson(caps);
    assertFalse(json, json.contains("1.0"));

    try (JsonInput input = new Json().newInput(new StringReader(json))) {
      json = new Json().toJson(input.read(Json.MAP_TYPE));
      assertFalse(json, json.contains("1.0"));
    }
  }

  @Test
  public void shouldCoerceAListOfCapabilitiesIntoSomethingMutable() {
    // This is needed since Grid expects each of the capabilities to be mutable
    List<Capabilities> expected = ImmutableList.of(
        new ImmutableCapabilities("cheese", "brie"),
        new ImmutableCapabilities("peas", 42L));

    Json json = new Json();
    String raw = json.toJson(expected);
    System.out.println("raw = " + raw);
    List<Capabilities> seen = json.toType(raw, new TypeToken<List<Capabilities>>(){}.getType());

    assertEquals(expected, seen);
    assertTrue(seen.get(0) instanceof MutableCapabilities);
  }

  @Test
  public void shouldUseBeanSettersToPopulateFields() {
    Map<String, String> map = ImmutableMap.of("name", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithSetter seen = json.toType(raw, BeanWithSetter.class);

    assertEquals("fishy", seen.theName);
  }

  public static class BeanWithSetter {
    String theName;

    public void setName(String name) {
      theName = name;
    }
  }

  @Test
  public void shouldAllowUserToPopulateFieldsDirectly() {
    Map<String, String> map = ImmutableMap.of("theName", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithSetter seen = json.toType(raw, BeanWithSetter.class, PropertySetting.BY_FIELD);

    assertEquals("fishy", seen.theName);
  }

  @Test
  public void testCanConstructASimpleString() {
    String text = new Json().toType("\"cheese\"", String.class);

    assertThat(text, is("cheese"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testCanPopulateAMap() {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("cheese", "brie");
    toConvert.addProperty("foodstuff", "cheese");

    Map<String, String> map = new Json().toType(toConvert.toString(), Map.class);
    assertThat(map.size(), is(2));
    assertThat(map, hasEntry("cheese", "brie"));
    assertThat(map, hasEntry("foodstuff", "cheese"));
  }

  @Test
  public void testCanPopulateAMapThatContainsNull() {
    JsonObject toConvert = new JsonObject();
    toConvert.add("foo", JsonNull.INSTANCE);

    Map<?,?> converted = new Json().toType(toConvert.toString(), Map.class);
    assertEquals(1, converted.size());
    assertTrue(converted.containsKey("foo"));
    assertNull(converted.get("foo"));
  }

  @Test
  public void testCanPopulateASimpleBean() {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("value", "time");

    SimpleBean bean = new Json().toType(toConvert.toString(), SimpleBean.class);
    assertThat(bean.getValue(), is("time"));
  }

  @Test
  public void testWillSilentlyDiscardUnusedFieldsWhenPopulatingABean() {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("value", "time");
    toConvert.addProperty("frob", "telephone");

    SimpleBean bean = new Json().toType(toConvert.toString(), SimpleBean.class);

    assertThat(bean.getValue(), is("time"));
  }

  @Test
  public void testShouldSetPrimitiveValuesToo() {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("magicNumber", 3);

    Map<?,?> map = new Json().toType(toConvert.toString(), Map.class);

    assertEquals(3L, map.get("magicNumber"));
  }

  @Test
  public void testShouldPopulateFieldsOnNestedBeans() {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("name", "frank");
    JsonObject child = new JsonObject();
    child.addProperty("value", "lots");
    toConvert.add("bean", child);

    ContainingBean bean = new Json().toType(toConvert.toString(), ContainingBean.class);

    assertThat(bean.getName(), is("frank"));
    assertThat(bean.getBean().getValue(), is("lots"));
  }

  @Test
  public void testShouldProperlyFillInACapabilitiesObject() {
    DesiredCapabilities capabilities =
        new DesiredCapabilities("browser", CapabilityType.VERSION, Platform.ANY);
    capabilities.setJavascriptEnabled(true);
    String text = new Json().toJson(capabilities);

    Capabilities readCapabilities = new Json().toType(text, DesiredCapabilities.class);

    assertEquals(capabilities, readCapabilities);
  }

  @Test
  public void testShouldUseAMapToRepresentComplexObjects() {
    JsonObject toModel = new JsonObject();
    toModel.addProperty("thing", "hairy");
    toModel.addProperty("hairy", "true");

    Map<?,?> modelled = (Map<?,?>) new Json().toType(toModel.toString(), Object.class);
    assertEquals(2, modelled.size());
  }

  @Test
  public void testShouldConvertAResponseWithAnElementInIt() {
    String json =
        "{\"value\":{\"value\":\"\",\"text\":\"\",\"selected\":false,\"enabled\":true,\"id\":\"three\"},\"context\":\"con\",\"sessionId\":\"sess\"}";
    Response converted = new Json().toType(json, Response.class);

    Map<?,?> value = (Map<?,?>) converted.getValue();
    assertEquals("three", value.get("id"));
  }

  @Test
  public void testShouldBeAbleToCopeWithStringsThatLookLikeBooleans() {
    String json =
        "{\"value\":\"false\",\"context\":\"foo\",\"sessionId\":\"1210083863107\"}";

    try {
      new Json().toType(json, Response.class);
    } catch (Exception e) {
      e.printStackTrace();
      fail("This should have worked");
    }
  }

  @Test
  public void testShouldBeAbleToSetAnObjectToABoolean() {
    String json =
        "{\"value\":true,\"context\":\"foo\",\"sessionId\":\"1210084658750\"}";

    Response response = new Json().toType(json, Response.class);

    assertThat(response.getValue(), is(true));
  }

  @Test
  public void testCanHandleValueBeingAnArray() {
    String[] value = {"Cheese", "Peas"};

    Response response = new Response();
    response.setSessionId("bar");
    response.setValue(value);
    response.setStatus(1512);

    String json = new Json().toJson(response);
    Response converted = new Json().toType(json, Response.class);

    assertEquals("bar", response.getSessionId());
    assertEquals(2, ((List<?>) converted.getValue()).size());
    assertEquals(1512, response.getStatus().intValue());
  }

  @Test
  public void testShouldConvertObjectsInArraysToMaps() {
    Date date = new Date();
    Cookie cookie = new Cookie("foo", "bar", "localhost", "/rooted", date, true, true);

    String rawJson = new Json().toJson(Collections.singletonList(cookie));
    List<?> list = new Json().toType(rawJson, List.class);

    Object first = list.get(0);
    assertTrue(first instanceof Map);

    Map<?,?> map = (Map<?,?>) first;
    assertMapEntry(map, "name", "foo");
    assertMapEntry(map, "value", "bar");
    assertMapEntry(map, "domain", "localhost");
    assertMapEntry(map, "path", "/rooted");
    assertMapEntry(map, "secure", true);
    assertMapEntry(map, "httpOnly", true);
    assertMapEntry(map, "expiry", TimeUnit.MILLISECONDS.toSeconds(date.getTime()));
  }

  private void assertMapEntry(Map<?,?> map, String key, Object expected) {
    assertTrue("Missing key: " + key, map.containsKey(key));
    assertEquals("Wrong value for key: " + key + ": " + map.get(key).getClass().getName(),
                 expected, map.get(key));
  }

  @Test
  public void testShouldConvertAnArrayBackIntoAnArray() {
    Exception e = new Exception();
    String converted = new Json().toJson(e);

    Map<?,?> reconstructed = new Json().toType(converted, Map.class);
    List<?> trace = (List<?>) reconstructed.get("stackTrace");

    assertTrue(trace.get(0) instanceof Map);
  }

  @Test
  public void testShouldBeAbleToReconsituteASessionId() {
    String json = new Json().toJson(new SessionId("id"));
    SessionId sessionId = new Json().toType(json, SessionId.class);

    assertEquals("id", sessionId.toString());
  }

  @Test
  public void testShouldBeAbleToConvertACommand() {
    SessionId sessionId = new SessionId("session id");
    Command original = new Command(
        sessionId,
        DriverCommand.NEW_SESSION,
        ImmutableMap.of("food", "cheese"));
    String raw = new Json().toJson(original);
    Command converted = new Json().toType(raw, Command.class);

    assertEquals(sessionId.toString(), converted.getSessionId().toString());
    assertEquals(original.getName(), converted.getName());

    assertEquals(1, converted.getParameters().keySet().size());
    assertEquals("cheese", converted.getParameters().get("food"));
  }

  @Test
  public void testShouldConvertCapabilitiesToAMapAndIncludeCustomValues() {
    Capabilities caps = new ImmutableCapabilities("furrfu", "fishy");

    String raw = new Json().toJson(caps);
    Capabilities converted = new Json().toType(raw, Capabilities.class);

    assertEquals("fishy", converted.getCapability("furrfu"));
  }

  @Test
  public void testShouldParseCapabilitiesWithLoggingPreferences() {
    JsonObject prefs = new JsonObject();
    prefs.addProperty("browser", "WARNING");
    prefs.addProperty("client", "DEBUG");
    prefs.addProperty("driver", "ALL");
    prefs.addProperty("server", "OFF");

    JsonObject caps = new JsonObject();
    caps.add(CapabilityType.LOGGING_PREFS, prefs);

    Capabilities converted = new Json().toType(caps.toString(), Capabilities.class);

    LoggingPreferences lp =
        (LoggingPreferences) converted.getCapability(CapabilityType.LOGGING_PREFS);
    assertNotNull(lp);
    assertEquals(Level.WARNING, lp.getLevel(LogType.BROWSER));
    assertEquals(Level.FINE, lp.getLevel(LogType.CLIENT));
    assertEquals(Level.ALL, lp.getLevel(LogType.DRIVER));
    assertEquals(Level.OFF, lp.getLevel(LogType.SERVER));
  }

  @Test
  public void testShouldNotParseQuotedJsonObjectsAsActualJsonObjects() {
    JsonObject inner = new JsonObject();
    inner.addProperty("color", "green");
    inner.addProperty("number", 123);

    JsonObject outer = new JsonObject();
    outer.addProperty("inner", inner.toString());

    String jsonStr = outer.toString();

    Object convertedOuter = new Json().toType(jsonStr, Map.class);
    assertThat(convertedOuter, instanceOf(Map.class));

    Object convertedInner = ((Map<?,?>) convertedOuter).get("inner");
    assertNotNull(convertedInner);
    assertThat(convertedInner, instanceOf(String.class));
    assertThat(convertedInner.toString(), equalTo(inner.toString()));
  }

  @Test
  public void shouldBeAbleToConvertASelenium3CommandToASelenium2Command() {
    SessionId expectedId = new SessionId("thisisakey");

    JsonObject rawJson = new JsonObject();
    // In selenium 2, the sessionId is an object. In selenium 3, it's a straight string.
    rawJson.addProperty("sessionId", expectedId.toString());
    rawJson.addProperty("name", "some command");
    rawJson.add("parameters", new JsonObject());

    String stringified = rawJson.toString();

    Command converted = new Json().toType(stringified, Command.class);

    assertEquals(expectedId, converted.getSessionId());
  }

  @Test
  public void testShouldCallFromJsonMethodIfPresent() {
    JsonAware res = new Json().toType("\"converted\"", JsonAware.class);
    assertEquals("\"converted\"", res.convertedValue);
  }

  // Test for issue 8187
  @Test
  public void testDecodingResponseWithNumbersInValueObject() {
    Response response = new Json().toType(
        "{\"status\":0,\"value\":{\"width\":96,\"height\":46.19140625}}",
        Response.class);

    @SuppressWarnings("unchecked")
    Map<String, Number> value = (Map<String, Number>) response.getValue();
    assertEquals(96, value.get("width").intValue());
    assertEquals(46, value.get("height").intValue());
    assertEquals(46.19140625, value.get("height").doubleValue(), 0.00001);
  }

  @Test
  public void testShouldRecognizeNumericStatus() {
    Response response = new Json().toType(
        "{\"status\":0,\"value\":\"cheese\"}",
        Response.class);

    assertEquals(0, response.getStatus().intValue());
    assertEquals(new ErrorCodes().toState(0), response.getState());
    String value = (String) response.getValue();
    assertEquals("cheese", value);
  }

  @Test
  public void testShouldRecognizeStringStatus() {
    Response response = new Json().toType(
        "{\"status\":\"success\",\"value\":\"cheese\"}",
        Response.class);

    assertEquals(0, response.getStatus().intValue());
    assertEquals(new ErrorCodes().toState(0), response.getState());
    String value = (String) response.getValue();
    assertEquals("cheese", value);
  }

  @Test
  public void testShouldConvertInvalidSelectorError() {
    Response response = new Json().toType(
        "{\"state\":\"invalid selector\",\"message\":\"invalid xpath selector\"}",
        Response.class);
    assertEquals(32, response.getStatus().intValue());
    assertEquals(new ErrorCodes().toState(32), response.getState());
  }

  @Test
  public void testShouldRecognizeStringState() {
    Response response = new Json()
        .toType(
            "{\"state\":\"success\",\"value\":\"cheese\"}",
            Response.class);
    assertEquals("success", response.getState());
    assertEquals(0, response.getStatus().intValue());
    String value = (String) response.getValue();
    assertEquals("cheese", value);
  }

  @Test
  public void testNoStatusShouldBeNullInResponseObject() {
    Response response = new Json().toType("{\"value\":\"cheese\"}", Response.class);
    assertNull(response.getStatus());
  }

  @Test
  public void canConvertAnEnumWithALowerCaseValue() {
    Proxy.ProxyType type = new Json().toType("\"pac\"", Proxy.ProxyType.class);
    assertEquals(Proxy.ProxyType.PAC, type);
  }

  @Test
  public void canCoerceSimpleValuesToStrings() {
    Map<String, Object> value = ImmutableMap.of(
        "boolean", true,
        "integer", 42,
        "float", 3.14);

    Json json = new Json();
    String raw = json.toJson(value);
    Map<String, String> roundTripped = json.toType(
        raw,
        new TypeToken<Map<String, String>>(){}.getType());

    assertEquals("true", roundTripped.get("boolean"));
    assertEquals("42", roundTripped.get("integer"));
    assertEquals("3.14", roundTripped.get("float"));
  }

  public static class SimpleBean {

    private String value;

    public String getValue() {
      return value;
    }

    public void setValue(String value) {
      this.value = value;
    }
  }

  public static class ContainingBean {

    private String name;
    private SimpleBean bean;

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public SimpleBean getBean() {
      return bean;
    }

    public void setBean(SimpleBean bean) {
      this.bean = bean;
    }
  }

  public static class JsonAware {
    private String convertedValue;

    public JsonAware(String convertedValue) {
      this.convertedValue = convertedValue;
    }

    public static JsonAware fromJson(String json) {
      return new JsonAware(json);
    }
  }
}
