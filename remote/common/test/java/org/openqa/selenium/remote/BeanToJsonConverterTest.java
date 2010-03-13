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
import org.json.JSONException;
import org.json.JSONObject;

import java.awt.*;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


public class BeanToJsonConverterTest extends TestCase {

  public void testShouldBeAbleToConvertASimpleString() throws Exception {
    String json = new BeanToJsonConverter().convert("cheese");

    assertThat(json, is("cheese"));
  }

  public void testShouldConvertAMapIntoAJsonObject() throws Exception {
    Map<String, String> toConvert = new HashMap<String, String>();
    toConvert.put("cheese", "cheddar");
    toConvert.put("fish", "nice bit of haddock");

    String json = new BeanToJsonConverter().convert(toConvert);

    JSONObject converted = new JSONObject(json);
    assertThat((String) converted.get("cheese"), is("cheddar"));
  }

  public void testShouldConvertASimpleJavaBean() throws Exception {
    String json = new BeanToJsonConverter().convert(new SimpleBean());

    JSONObject converted = new JSONObject(json);
    assertThat((String) converted.get("foo"), is("bar"));
  }

  public void testShouldConvertArrays() throws Exception {
    String json = new BeanToJsonConverter().convert(new BeanWithArray());

    JSONObject converted = new JSONObject(json);
    JSONArray allNames = (JSONArray) converted.get("names");
    assertThat(allNames.length(), is(3));
  }

  public void testShouldConvertCollections() throws Exception {
    String json = new BeanToJsonConverter().convert(new BeanWithCollection());

    JSONObject converted = new JSONObject(json);
    JSONArray allNames = (JSONArray) converted.get("something");
    assertThat(allNames.length(), is(2));
  }

  public void testShouldConvertNumbersAsLongs() throws Exception {
    
    String json = new BeanToJsonConverter().convert(new Exception());
    Map map = new JsonToBeanConverter().convert(Map.class, json);

    List stack = (List) map.get("stackTrace");
    Map line = (Map) stack.get(0);

    Object o = line.get("lineNumber");
    assertTrue("line number is of type: " + o.getClass(), o instanceof Long);
  }

  public void testShouldNotChokeWhenCollectionIsNull() throws Exception {
    try {
      new BeanToJsonConverter().convert(new BeanWithNullCollection());
    } catch (Exception e) {
      e.printStackTrace();
      fail("That shouldn't have happened");
    }
  }

  public void testShouldConvertEnumsToStrings() throws Exception {
    // If this doesn't hang indefinitely, we're all good
    new BeanToJsonConverter().convert(State.INDIFFERENT);
  }

  public void testShouldConvertEnumsWithMethods() throws Exception {
    // If this doesn't hang indefinitely, we're all good
    new BeanToJsonConverter().convert(WithMethods.CHEESE);
  }

  public void testNullAndAnEmptyStringAreEncodedDifferently() throws Exception {
    BeanToJsonConverter converter = new BeanToJsonConverter();

    String nullValue = converter.convert(null);
    String emptyString = converter.convert("");

    assertFalse(emptyString.equals(nullValue));
  }

  public void testShouldBeAbleToConvertAPoint() throws Exception {
    Point point = new Point(65, 75);

    try {
      new BeanToJsonConverter().convert(point);
    } catch (StackOverflowError e) {
      fail("This should never happen");
    }
  }

  public void testShouldEncodeClassNameAsClassProperty() throws Exception {
    String json = new BeanToJsonConverter().convert(new SimpleBean());
    JSONObject converted = new JSONObject(json);

    assertEquals(SimpleBean.class.getName(), converted.get("class"));
  }

  public void testShouldBeAbleToConvertASessionId() throws JSONException {
    SessionId sessionId = new SessionId("some id");
    String json = new BeanToJsonConverter().convert(sessionId);
    JSONObject converted = new JSONObject(json);

    assertEquals("some id", converted.getString("value"));
  }

  public void testShouldBeAbleToConvertAJsonObject() throws JSONException {
    JSONObject obj = new JSONObject();
    obj.put("key", "value");
    String json = new BeanToJsonConverter().convert(obj);
    JSONObject converted = new JSONObject(json);

    assertEquals("value", converted.getString("key"));
  }

  private static class SimpleBean {

    public String getFoo() {
      return "bar";
    }
  }

  private static class BeanWithArray {

    public String[] getNames() {
      return new String[]{"peter", "paul", "mary"};
    }
  }

  private static class BeanWithCollection {

    @SuppressWarnings("unchecked")
    public Set getSomething() {
      Set<Integer> integers = new HashSet<Integer>();
      integers.add(1);
      integers.add(43);
      return integers;
    }
  }

  private static class BeanWithNullCollection {

    @SuppressWarnings("unchecked")
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
      public void eat(String foodStuff) {
        // Does nothing
      }
    },
    EGGS() {
      public void eat(String foodStuff) {
        // Does nothing too
      }
    };

    public abstract void eat(String foodStuff);
  }
}
