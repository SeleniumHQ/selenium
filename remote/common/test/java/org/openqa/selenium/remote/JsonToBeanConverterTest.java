/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import junit.framework.TestCase;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Platform;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class JsonToBeanConverterTest extends TestCase {

  public void testCanConstructASimpleString() throws Exception {
    String text = new JsonToBeanConverter().convert(String.class, "cheese");

    assertThat(text, is("cheese"));
  }

  @SuppressWarnings("unchecked")
  public void testCanPopulateAMap() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("cheese", "brie");
    toConvert.put("foodstuff", "cheese");

    Map<String, String> map = new JsonToBeanConverter().convert(Map.class, toConvert.toString());
    assertThat(map.size(), is(2));
  }

  @SuppressWarnings("unchecked")
  public void testCanPopulateASimpleBean() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("value", "time");

    SimpleBean bean = new JsonToBeanConverter().convert(SimpleBean.class, toConvert.toString());

    assertThat(bean.getValue(), is("time"));
  }

  @SuppressWarnings("unchecked")
  public void testWillSilentlyDiscardUnusedFieldsWhenPopulatingABean() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("value", "time");
    toConvert.put("frob", "telephone");

    SimpleBean bean = new JsonToBeanConverter().convert(SimpleBean.class, toConvert.toString());

    assertThat(bean.getValue(), is("time"));
  }

  @SuppressWarnings("unchecked")
  public void testShouldSetPrimitiveValuesToo() throws Exception {
    JSONObject toConvert = new JSONObject();
    toConvert.put("magicNumber", 3);

    Map map = new JsonToBeanConverter().convert(Map.class, toConvert.toString());

    assertThat(3L, is(map.get("magicNumber")));
  }

  @SuppressWarnings("unchecked")
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

  public void testShouldProperlyFillInACapabilitiesObject() throws Exception {
    DesiredCapabilities capabilities =
        new DesiredCapabilities("browser", "version", Platform.ANY);
    capabilities.setJavascriptEnabled(true);
    String text = new BeanToJsonConverter().convert(capabilities);

    DesiredCapabilities readCapabilities =
        new JsonToBeanConverter().convert(DesiredCapabilities.class, text);

    assertEquals(capabilities, readCapabilities);
  }

  @SuppressWarnings("unchecked")
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
  public void testShouldUseAMapToRepresentComplexObjects() throws Exception {
    JSONObject toModel = new JSONObject();
    toModel.put("thing", "hairy");
    toModel.put("hairy", "true");

    Map modelled = (Map) new JsonToBeanConverter().convert(Object.class, toModel);
    assertEquals(2, modelled.size());
  }

  @SuppressWarnings("unchecked")
  public void testShouldConvertAResponseWithAnElementInIt() throws Exception {
    String json =
        "{\"value\":{\"value\":\"\",\"text\":\"\",\"selected\":false,\"enabled\":true,\"id\":\"three\"},\"context\":\"con\",\"sessionId\":\"sess\",\"error\":false}";
    Response converted = new JsonToBeanConverter().convert(Response.class, json);

    Map value = (Map) converted.getValue();
    assertEquals("three", value.get("id"));
  }

  public void testConvertABlankStringAsAStringEvenWhenAskedToReturnAnObject() throws Exception {
    Object o = new JsonToBeanConverter().convert(Object.class, "");

    assertTrue(o instanceof String);
  }

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

  public void testShouldBeAbleToSetAnObjectToABoolean() throws Exception {
    String json =
        "{\"value\":true,\"context\":\"foo\",\"sessionId\":\"1210084658750\",\"error\":false}";

    Response response = new JsonToBeanConverter().convert(Response.class, json);

    assertThat((Boolean) response.getValue(), is(true));
  }

  @SuppressWarnings("unchecked")
  public void testCanHandleValueBeingAnArray() throws Exception {
    String[] value = {"Cheese", "Peas"};

    Response response = new Response();
    response.setContext("foo");
    response.setSessionId("bar");
    response.setValue(value);
    response.setError(true);

    String json = new BeanToJsonConverter().convert(response);
    Response converted = new JsonToBeanConverter().convert(Response.class, json);

    assertEquals(2, ((List) converted.getValue()).size());
    assertTrue(converted.isError());
  }

  public void testShouldConvertObjectsInArraysToMaps() throws Exception {
    Date date = new Date();
    Cookie cookie = new Cookie("foo", "bar", "/rooted", date);

    String rawJson = new BeanToJsonConverter().convert(Collections.singletonList(cookie));
    List list = new JsonToBeanConverter().convert(List.class, rawJson);
    
    Object first = list.get(0);
    assertTrue(first instanceof Map);
  }

  public void testShouldConvertAnArrayBackIntoAnArray() throws Exception {
    Exception e = new Exception();
    String converted = new BeanToJsonConverter().convert(e);

    Map reconstructed = new JsonToBeanConverter().convert(Map.class, converted);
    List trace = (List) reconstructed.get("stackTrace");

    assertTrue(trace.get(0) instanceof Map);
  }

  public void testShouldBeAbleToReconsituteASessionId() throws Exception {
    String json = new BeanToJsonConverter().convert(new SessionId("id"));
    SessionId sessionId = new JsonToBeanConverter().convert(SessionId.class, json);

    assertEquals("id", sessionId.toString());
  }

  public void testShouldBeAbleToReconsituteAContext() throws Exception {
    String json = new BeanToJsonConverter().convert(new Context("ctxt"));
    Context context = new JsonToBeanConverter().convert(Context.class, json);

    assertEquals("ctxt", context.toString());
  }

  public void testShouldBeAbleToConvertACommand() throws Exception {
    SessionId sessionId = new SessionId("session id");
    Context context = new Context("context");
    Command original = new Command(sessionId, context, DriverCommand.NEW_SESSION, "cheese");
    String raw = new BeanToJsonConverter().convert(original);
    Command converted = new JsonToBeanConverter().convert(Command.class, raw);

    assertEquals(sessionId.toString(), converted.getSessionId().toString());
    assertEquals(context.toString(), converted.getContext().toString());
    assertEquals(original.getName(), converted.getName());

    assertTrue(converted.getParameters().length == 1);
    assertEquals("cheese", converted.getParameters()[0]);
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
