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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Platform;
import org.openqa.selenium.browserlaunchers.DoNotUseProxyPac;

import java.io.StringWriter;
import java.io.Writer;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

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

public class JsonToBeanConverterTest {

  @Test
  public void testCanConstructASimpleString() throws Exception {
    String text = new JsonToBeanConverter().convert(String.class, "cheese");

    assertThat(text, is("cheese"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testCanPopulateAMap() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("cheese", "brie");
    toConvert.put("foodstuff", "cheese");

    Map<String, String> map = new JsonToBeanConverter().convert(Map.class, toConvert.toString());
    assertThat(map.size(), is(2));
    assertThat(map, hasEntry("cheese", "brie"));
    assertThat(map, hasEntry("foodstuff", "cheese"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testCanPopulateAMapThatContainsNull() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("foo", JSONObject.NULL);

    Map converted = new JsonToBeanConverter().convert(Map.class, toConvert.toString());
    assertEquals(1, converted.size());
    assertTrue(converted.containsKey("foo"));
    assertNull(converted.get("foo"));
  }

  @Test
  public void testCanPopulateASimpleBean() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("value", "time");

    SimpleBean bean = new JsonToBeanConverter().convert(SimpleBean.class, toConvert.toString());

    assertThat(bean.getValue(), is("time"));
  }

  @Test
  public void testWillSilentlyDiscardUnusedFieldsWhenPopulatingABean() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("value", "time");
    toConvert.put("frob", "telephone");

    SimpleBean bean = new JsonToBeanConverter().convert(SimpleBean.class, toConvert.toString());

    assertThat(bean.getValue(), is("time"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldSetPrimitiveValuesToo() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("magicNumber", 3);

    Map map = new JsonToBeanConverter().convert(Map.class, toConvert.toString());

    assertThat(3L, is(map.get("magicNumber")));
  }

  @Test
  public void testShouldPopulateFieldsOnNestedBeans() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("name", "frank");
    JSONObject child = new JSONObject();
    child.put("value", "lots");
    toConvert.put("bean", child);

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
    JSONArray array = new JSONArray();
    array.put(true);
    array.put(false);

    boolean first = new JsonToBeanConverter().convert(Boolean.class, array.get(0));
    boolean second = new JsonToBeanConverter().convert(Boolean.class, array.get(1));

    assertTrue(first);
    assertFalse(second);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldUseAMapToRepresentComplexObjects() throws Exception {
    JSONObject toModel = new JSONObject();
    toModel.put("thing", "hairy");
    toModel.put("hairy", "true");

    Map modelled = (Map) new JsonToBeanConverter().convert(Object.class, toModel);
    assertEquals(2, modelled.size());
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldConvertAResponseWithAnElementInIt() throws Exception {
    String json =
        "{\"value\":{\"value\":\"\",\"text\":\"\",\"selected\":false,\"enabled\":true,\"id\":\"three\"},\"context\":\"con\",\"sessionId\":\"sess\",\"error\":false}";
    Response converted = new JsonToBeanConverter().convert(Response.class, json);

    Map value = (Map) converted.getValue();
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
        "{\"value\":\"false\",\"context\":\"foo\",\"sessionId\":\"1210083863107\",\"error\":false}";

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
        "{\"value\":true,\"context\":\"foo\",\"sessionId\":\"1210084658750\",\"error\":false}";

    Response response = new JsonToBeanConverter().convert(Response.class, json);

    assertThat((Boolean) response.getValue(), is(true));
  }

  @SuppressWarnings("unchecked")
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
    assertEquals(2, ((List) converted.getValue()).size());
    assertEquals(1512, response.getStatus());
  }

  @Test
  public void testShouldConvertObjectsInArraysToMaps() throws Exception {
    Date date = new Date();
    Cookie cookie = new Cookie("foo", "bar", "/rooted", date);

    String rawJson = new BeanToJsonConverter().convert(Collections.singletonList(cookie));
    List list = new JsonToBeanConverter().convert(List.class, rawJson);

    Object first = list.get(0);
    assertTrue(first instanceof Map);

    Map map = (Map) first;
    assertMapEntry(map, "name", "foo");
    assertMapEntry(map, "value", "bar");
    assertMapEntry(map, "path", "/rooted");
    assertMapEntry(map, "expiry", TimeUnit.MILLISECONDS.toSeconds(date.getTime()));
  }

  private void assertMapEntry(Map map, String key, Object expected) {
    assertTrue("Missing key: " + key, map.containsKey(key));
    assertEquals("Wrong value for key: " + key + ": " + map.get(key).getClass().getName(),
        expected, map.get(key));
  }

  @Test
  public void testShouldConvertAnArrayBackIntoAnArray() throws Exception {
    Exception e = new Exception();
    String converted = new BeanToJsonConverter().convert(e);

    Map reconstructed = new JsonToBeanConverter().convert(Map.class, converted);
    List trace = (List) reconstructed.get("stackTrace");

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
  public void testShouldBeAbleToReconstituteAProxyPac() throws Exception {
    DoNotUseProxyPac pac = new DoNotUseProxyPac();
    pac.map("*/selenium/*").toProxy("http://localhost:8080/selenium-server");
    pac.map("/[a-zA-Z]{4}.microsoft.com/").toProxy("http://localhost:1010/selenium-server/");
    pac.map("/flibble*").toNoProxy();
    pac.mapHost("www.google.com").toProxy("http://fishy.com/");
    pac.mapHost("seleniumhq.org").toNoProxy();
    pac.defaults().toNoProxy();

    String raw = new BeanToJsonConverter().convert(pac);
    DoNotUseProxyPac converted = new JsonToBeanConverter().convert(DoNotUseProxyPac.class, raw);

    Writer source = new StringWriter();
    pac.outputTo(source);
    Writer derived = new StringWriter();
    converted.outputTo(derived);

    assertEquals(source.toString(), derived.toString());
  }

  @Test
  public void testShouldNotParseQuotedJsonObjectsAsActualJsonObjects() throws JSONException {
    JSONObject inner = new JSONObject()
        .put("color", "green")
        .put("number", 123);

    JSONObject outer = new JSONObject()
        .put("inner", inner.toString());

    String jsonStr = outer.toString();

    Object convertedOuter = new JsonToBeanConverter().convert(Map.class, jsonStr);
    assertThat(convertedOuter, instanceOf(Map.class));

    Object convertedInner = ((Map) convertedOuter).get("inner");
    assertNotNull(convertedInner);
    assertThat(convertedInner, instanceOf(String.class));
    assertThat(convertedInner.toString(), equalTo(inner.toString()));
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
}
