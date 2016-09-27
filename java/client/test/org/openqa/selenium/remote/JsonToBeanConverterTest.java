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

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.gson.JsonArray;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Platform;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

@RunWith(JUnit4.class)
public class JsonToBeanConverterTest {

  @Test
  public void testCanConstructASimpleString() throws Exception {
    String text = new JsonToBeanConverter().convert(String.class, "cheese");

    assertThat(text, is("cheese"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testCanPopulateAMap() throws Exception {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("cheese", "brie");
    toConvert.addProperty("foodstuff", "cheese");

    Map<String, String> map = new JsonToBeanConverter().convert(Map.class, toConvert.toString());
    assertThat(map.size(), is(2));
    assertThat(map, hasEntry("cheese", "brie"));
    assertThat(map, hasEntry("foodstuff", "cheese"));
  }

  @Test
  public void testCanPopulateAMapThatContainsNull() throws Exception {
    JsonObject toConvert = new JsonObject();
    toConvert.add("foo", JsonNull.INSTANCE);

    Map<?,?> converted = new JsonToBeanConverter().convert(Map.class, toConvert.toString());
    assertEquals(1, converted.size());
    assertTrue(converted.containsKey("foo"));
    assertNull(converted.get("foo"));
  }

  @Test
  public void testCanPopulateASimpleBean() throws Exception {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("value", "time");

    SimpleBean bean = new JsonToBeanConverter().convert(SimpleBean.class, toConvert.toString());

    assertThat(bean.getValue(), is("time"));
  }

  @Test
  public void testWillSilentlyDiscardUnusedFieldsWhenPopulatingABean() throws Exception {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("value", "time");
    toConvert.addProperty("frob", "telephone");

    SimpleBean bean = new JsonToBeanConverter().convert(SimpleBean.class, toConvert.toString());

    assertThat(bean.getValue(), is("time"));
  }

  @Test
  public void testShouldSetPrimitiveValuesToo() throws Exception {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("magicNumber", 3);

    Map<?,?> map = new JsonToBeanConverter().convert(Map.class, toConvert.toString());

    assertEquals(3L, map.get("magicNumber"));
  }

  @Test
  public void testShouldPopulateFieldsOnNestedBeans() throws Exception {
    JsonObject toConvert = new JsonObject();
    toConvert.addProperty("name", "frank");
    JsonObject child = new JsonObject();
    child.addProperty("value", "lots");
    toConvert.add("bean", child);

    ContainingBean bean =
        new JsonToBeanConverter().convert(ContainingBean.class, toConvert.toString());

    assertThat(bean.getName(), is("frank"));
    assertThat(bean.getBean().getValue(), is("lots"));
  }

  @Test
  public void testShouldProperlyFillInACapabilitiesObject() throws Exception {
    DesiredCapabilities capabilities =
        new DesiredCapabilities("browser", CapabilityType.VERSION, Platform.ANY);
    capabilities.setJavascriptEnabled(true);
    String text = new BeanToJsonConverter().convert(capabilities);

    DesiredCapabilities readCapabilities =
        new JsonToBeanConverter().convert(DesiredCapabilities.class, text);

    assertEquals(capabilities, readCapabilities);
  }

  @Test
  public void testShouldBeAbleToInstantiateBooleans() throws Exception {
    JsonArray array = new JsonArray();
    array.add(new JsonPrimitive(true));
    array.add(new JsonPrimitive(false));

    boolean first = new JsonToBeanConverter().convert(Boolean.class, array.get(0));
    boolean second = new JsonToBeanConverter().convert(Boolean.class, array.get(1));

    assertTrue(first);
    assertFalse(second);
  }

  @Test
  public void testShouldUseAMapToRepresentComplexObjects() throws Exception {
    JsonObject toModel = new JsonObject();
    toModel.addProperty("thing", "hairy");
    toModel.addProperty("hairy", "true");

    Map<?,?> modelled = (Map<?,?>) new JsonToBeanConverter().convert(Object.class,
                                                                     toModel.toString());
    assertEquals(2, modelled.size());
  }

  @Test
  public void testShouldConvertAResponseWithAnElementInIt() throws Exception {
    String json =
        "{\"value\":{\"value\":\"\",\"text\":\"\",\"selected\":false,\"enabled\":true,\"id\":\"three\"},\"context\":\"con\",\"sessionId\":\"sess\"}";
    Response converted = new JsonToBeanConverter().convert(Response.class, json);

    Map<?,?> value = (Map<?,?>) converted.getValue();
    assertEquals("three", value.get("id"));
  }

  @Test
  public void testConvertABlankStringAsAStringEvenWhenAskedToReturnAnObject() throws Exception {
    Object o = new JsonToBeanConverter().convert(Object.class, "");

    assertTrue(o instanceof String);
  }

  @Test
  public void testShouldBeAbleToCopeWithStringsThatLookLikeBooleans() throws Exception {
    String json =
        "{\"value\":\"false\",\"context\":\"foo\",\"sessionId\":\"1210083863107\"}";

    try {
      new JsonToBeanConverter().convert(Response.class, json);
    } catch (Exception e) {
      e.printStackTrace();
      fail("This should have worked");
    }
  }

  @Test
  public void testShouldBeAbleToSetAnObjectToABoolean() throws Exception {
    String json =
        "{\"value\":true,\"context\":\"foo\",\"sessionId\":\"1210084658750\"}";

    Response response = new JsonToBeanConverter().convert(Response.class, json);

    assertThat((Boolean) response.getValue(), is(true));
  }

  @Test
  public void testCanHandleValueBeingAnArray() throws Exception {
    String[] value = {"Cheese", "Peas"};

    Response response = new Response();
    response.setSessionId("bar");
    response.setValue(value);
    response.setStatus(1512);

    String json = new BeanToJsonConverter().convert(response);
    Response converted = new JsonToBeanConverter().convert(Response.class, json);

    assertEquals("bar", response.getSessionId());
    assertEquals(2, ((List<?>) converted.getValue()).size());
    assertEquals(1512, response.getStatus().intValue());
  }

  @Test
  public void testShouldConvertObjectsInArraysToMaps() throws Exception {
    Date date = new Date();
    Cookie cookie = new Cookie("foo", "bar", "localhost", "/rooted", date, true, true);

    String rawJson = new BeanToJsonConverter().convert(Collections.singletonList(cookie));
    List<?> list = new JsonToBeanConverter().convert(List.class, rawJson);

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
  public void testShouldConvertAnArrayBackIntoAnArray() throws Exception {
    Exception e = new Exception();
    String converted = new BeanToJsonConverter().convert(e);

    Map<?,?> reconstructed = new JsonToBeanConverter().convert(Map.class, converted);
    List<?> trace = (List<?>) reconstructed.get("stackTrace");

    assertTrue(trace.get(0) instanceof Map);
  }

  @Test
  public void testShouldBeAbleToReconsituteASessionId() throws Exception {
    String json = new BeanToJsonConverter().convert(new SessionId("id"));
    SessionId sessionId = new JsonToBeanConverter().convert(SessionId.class, json);

    assertEquals("id", sessionId.toString());
  }

  @Test
  public void testShouldBeAbleToConvertACommand() throws Exception {
    SessionId sessionId = new SessionId("session id");
    Command original = new Command(sessionId, DriverCommand.NEW_SESSION,
        new HashMap<String, String>() {
          {
            put("food", "cheese");
          }
        });
    String raw = new BeanToJsonConverter().convert(original);
    Command converted = new JsonToBeanConverter().convert(Command.class, raw);

    assertEquals(sessionId.toString(), converted.getSessionId().toString());
    assertEquals(original.getName(), converted.getName());

    assertEquals(1, converted.getParameters().keySet().size());
    assertEquals("cheese", converted.getParameters().get("food"));
  }

  @Test
  public void testShouldConvertCapabilitiesToAMapAndIncludeCustomValues() throws Exception {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("furrfu", "fishy");

    String raw = new BeanToJsonConverter().convert(caps);
    Capabilities converted = new JsonToBeanConverter().convert(Capabilities.class, raw);

    assertEquals("fishy", converted.getCapability("furrfu"));
  }

  @Test
  public void testShouldParseCapabilitiesWithLoggingPreferences() throws Exception {
    JsonObject prefs = new JsonObject();
    prefs.addProperty("browser", "WARNING");
    prefs.addProperty("client", "DEBUG");
    prefs.addProperty("driver", "ALL");
    prefs.addProperty("server", "OFF");

    JsonObject caps = new JsonObject();
    caps.add(CapabilityType.LOGGING_PREFS, prefs);

    Capabilities converted = new JsonToBeanConverter()
        .convert(Capabilities.class, caps.toString());

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

    Object convertedOuter = new JsonToBeanConverter().convert(Map.class, jsonStr);
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

    Command converted = new JsonToBeanConverter().convert(Command.class, stringified);

    assertEquals(expectedId, converted.getSessionId());
  }

  @Test
  public void testShouldCallFromJsonMethodIfPresent() {
    JsonAware res = new JsonToBeanConverter().convert(JsonAware.class, "converted");
    assertEquals("converted", res.convertedValue);
  }

  // Test for issue 8187
  @Test
  public void testDecodingResponseWithNumbersInValueObject() {
    Response response = new JsonToBeanConverter()
        .convert(Response.class, "{\"status\":0,\"value\":{\"width\":96,\"height\":46.19140625}}");

    @SuppressWarnings("unchecked")
    Map<String, Number> value = (Map<String, Number>) response.getValue();
    assertEquals(96, value.get("width").intValue());
    assertEquals(46, value.get("height").intValue());
    assertEquals(46.19140625, value.get("height").doubleValue(), 0.00001);
  }

  @Test
  public void testShouldRecognizeNumericStatus() {
    Response response = new JsonToBeanConverter()
      .convert(Response.class, "{\"status\":0,\"value\":\"cheese\"}");

    assertEquals(0, response.getStatus().intValue());
    assertEquals(new ErrorCodes().toState(0), response.getState());
    @SuppressWarnings("unchecked")
    String value = (String) response.getValue();
    assertEquals("cheese", value);
  }

  @Test
  public void testShouldRecognizeStringStatus() {
    Response response = new JsonToBeanConverter()
      .convert(Response.class, "{\"status\":\"success\",\"value\":\"cheese\"}");

    assertEquals(0, response.getStatus().intValue());
    assertEquals(new ErrorCodes().toState(0), response.getState());
    @SuppressWarnings("unchecked")
    String value = (String) response.getValue();
    assertEquals("cheese", value);
  }

  @Test
  public void testShouldRecognizeStringState() {
    Response response = new JsonToBeanConverter()
      .convert(Response.class, "{\"state\":\"success\",\"value\":\"cheese\"}");

    assertEquals("success", response.getState());
    assertEquals(0, response.getStatus().intValue());
    @SuppressWarnings("unchecked")
    String value = (String) response.getValue();
    assertEquals("cheese", value);
  }

  @Test
  public void testNoStatusShouldBeNullInResponseObject() {
    Response response = new JsonToBeanConverter()
      .convert(Response.class, "{\"value\":\"cheese\"}");
    assertNull(response.getStatus());
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
