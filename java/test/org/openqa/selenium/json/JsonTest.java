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

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

import java.io.StringReader;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static java.util.logging.Level.ALL;
import static java.util.logging.Level.FINE;
import static java.util.logging.Level.OFF;
import static java.util.logging.Level.WARNING;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.byLessThan;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.Proxy.ProxyType.PAC;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.logging.LogType.BROWSER;
import static org.openqa.selenium.logging.LogType.CLIENT;
import static org.openqa.selenium.logging.LogType.DRIVER;
import static org.openqa.selenium.logging.LogType.SERVER;

@Tag("UnitTests")
public class JsonTest {

  @Test
  public void canReadBooleans() {
    assertThat((Boolean) new Json().toType("true", Boolean.class)).isTrue();
    assertThat((Boolean) new Json().toType("false", Boolean.class)).isFalse();
  }

  @Test
  public void canReadANumber() {
    assertThat((Number) new Json().toType("42", Number.class)).isEqualTo(Long.valueOf(42));
    assertThat((Integer) new Json().toType("42", Integer.class)).isEqualTo(Integer.valueOf(42));
    assertThat((Double) new Json().toType("42", Double.class)).isEqualTo(Double.valueOf(42));
  }

  @Test
  public void canRoundTripNumbers() {
    Map<String, Object> original = ImmutableMap.of(
        "options", ImmutableMap.of("args", Arrays.asList(1L, "hello")));

    Json json = new Json();
    String converted = json.toJson(original);
    Object remade = json.toType(converted, MAP_TYPE);

    assertThat(remade).isEqualTo(original);
  }

  @Test
  public void roundTripAFirefoxOptions() {
    Map<String, Object> caps = ImmutableMap.of(
        "moz:firefoxOptions", ImmutableMap.of(
            "prefs", ImmutableMap.of("foo.bar", 1)));
    String json = new Json().toJson(caps);
    assertThat(json).doesNotContain("1.0");

    try (JsonInput input = new Json().newInput(new StringReader(json))) {
      json = new Json().toJson(input.read(Json.MAP_TYPE));
      assertThat(json).doesNotContain("1.0");
    }
  }

  @Test
  public void shouldCoerceAListOfCapabilitiesIntoSomethingMutable() {
    // This is needed since Grid expects each of the capabilities to be mutable
    List<Capabilities> expected = Arrays.asList(
        new ImmutableCapabilities("cheese", "brie"),
        new ImmutableCapabilities("peas", 42L));

    Json json = new Json();
    String raw = json.toJson(expected);
    List<Capabilities> seen = json.toType(raw, new TypeToken<List<Capabilities>>(){}.getType());

    assertThat(seen).isEqualTo(expected);
    assertThat(seen.get(0)).isInstanceOf(MutableCapabilities.class);
  }

  @Test
  public void shouldUseBeanSettersToPopulateFields() {
    Map<String, String> map = ImmutableMap.of("name", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithSetter seen = json.toType(raw, BeanWithSetter.class);

    assertThat(seen.theName).isEqualTo("fishy");
  }

  @Test
  public void shouldAllowUserToPopulateFieldsDirectly() {
    Map<String, String> map = ImmutableMap.of("theName", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithSetter seen = json.toType(raw, BeanWithSetter.class, PropertySetting.BY_FIELD);

    assertThat(seen.theName).isEqualTo("fishy");
  }

  @Test
  public void settingFinalFieldsShouldWork() {
    Map<String, String> map = ImmutableMap.of("theName", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithFinalField seen = json.toType(raw, BeanWithFinalField.class, PropertySetting.BY_FIELD);

    assertThat(seen.theName).isEqualTo("fishy");
  }

  @Test
  public void canConstructASimpleString() {
    String text = new Json().toType("\"cheese\"", String.class);

    assertThat(text).isEqualTo("cheese");
  }

  @Test
  public void canPopulateAMap() {
    String raw = "{\"cheese\": \"brie\", \"foodstuff\": \"cheese\"}";

    Map<String, String> map = new Json().toType(raw, Map.class);
    assertThat(map)
        .hasSize(2)
        .containsEntry("cheese", "brie")
        .containsEntry("foodstuff", "cheese");
  }

  @Test
  public void canPopulateAMapThatContainsNull() {
    String raw = "{\"foo\": null}";

    Map<?,?> converted = new Json().toType(raw, Map.class);
    assertThat(converted.size()).isEqualTo(1);
    assertThat(converted.containsKey("foo")).isTrue();
    assertThat(converted.get("foo")).isNull();
  }

  @Test
  public void canPopulateASimpleBean() {
    String raw = "{\"value\": \"time\"}";

    SimpleBean bean = new Json().toType(raw, SimpleBean.class);
    assertThat(bean.getValue()).isEqualTo("time");
  }

  @Test
  public void canNotPopulateAnObjectOfAClassWithNoDefaultConstructor() {
    String raw = "{\"value\": \"time\"}";

    assertThatExceptionOfType(JsonException.class)
      .isThrownBy(() -> new Json().toType(raw, NoDefaultConstructor.class))
      .withMessage("Unable to parse: {\"value\": \"time\"}")
      .havingCause()
      .isInstanceOf(JsonException.class)
      .withMessageStartingWith(
        "Unable to find type coercer for class %s", NoDefaultConstructor.class.getTypeName());
  }

  @Test
  public void willSilentlyDiscardUnusedFieldsWhenPopulatingABean() {
    String raw = "{\"value\": \"time\", \"frob\": \"telephone\"}";

    SimpleBean bean = new Json().toType(raw, SimpleBean.class);

    assertThat(bean.getValue()).isEqualTo("time");
  }

  @Test
  public void shouldSetPrimitiveValuesToo() {
    String raw = "{\"magicNumber\": 3}";

    Map<?,?> map = new Json().toType(raw, Map.class);

    assertThat(map.get("magicNumber")).isEqualTo(3L);
  }

  @Test
  public void shouldBeAbleToReadAnInstant() {
    // We will lose the nanoseconds
    Instant now = Instant.ofEpochMilli(System.currentTimeMillis());
    String raw = String.valueOf(now.toEpochMilli());

    Instant instant = new Json().toType(raw, Instant.class);

    assertThat(instant).isEqualTo(now);
  }

  @Test
  public void shouldPopulateFieldsOnNestedBeans() {
    String raw = "{\"name\": \"frank\", \"bean\": {\"value\": \"lots\"}}";

    ContainingBean bean = new Json().toType(raw, ContainingBean.class);

    assertThat(bean.getName()).isEqualTo("frank");
    assertThat(bean.getBean().getValue()).isEqualTo("lots");
  }

  @Test
  public void shouldProperlyFillInACapabilitiesObject() {
    DesiredCapabilities capabilities = new DesiredCapabilities(CapabilityType.BROWSER_NAME,
                                                               CapabilityType.BROWSER_VERSION,
                                                               Platform.ANY);
    String text = new Json().toJson(capabilities);

    Capabilities readCapabilities = new Json().toType(text, DesiredCapabilities.class);

    assertThat(readCapabilities.getBrowserName()).isEqualTo(capabilities.getBrowserName());
    assertThat(readCapabilities.getBrowserVersion()).isEqualTo(capabilities.getBrowserVersion());
    assertThat(readCapabilities.getPlatformName()).isEqualTo(capabilities.getPlatformName());
  }

  @Test
  public void shouldUseAMapToRepresentComplexObjects() {
    String toModel = "{\"thing\": \"hairy\", \"hairy\": true}";

    Map<?,?> modelled = new Json().toType(toModel, Object.class);
    assertThat(modelled).hasSize(2);
  }

  @Test
  public void shouldConvertAResponseWithAnElementInIt() {
    String json =
        "{\"value\":{\"value\":\"\",\"text\":\"\",\"selected\":false,\"enabled\":true,\"id\":\"three\"},\"context\":\"con\",\"sessionId\":\"sess\"}";
    Response converted = new Json().toType(json, Response.class);

    assertThat(converted).extracting("value").asInstanceOf(MAP)
      .containsEntry("id", "three");
  }

  @Test
  public void shouldBeAbleToCopeWithStringsThatLookLikeBooleans() {
    String json = "{\"value\":\"false\",\"context\":\"foo\",\"sessionId\":\"1210083863107\"}";
    new Json().toType(json, Response.class);
  }

  @Test
  public void shouldBeAbleToSetAnObjectToABoolean() {
    String json = "{\"value\":true,\"context\":\"foo\",\"sessionId\":\"1210084658750\"}";

    Response response = new Json().toType(json, Response.class);

    assertThat(response.getValue()).isEqualTo(true);
  }

  @Test
  public void canHandleValueBeingAnArray() {
    String[] value = {"Cheese", "Peas"};

    Response response = new Response();
    response.setSessionId("bar");
    response.setValue(value);
    response.setStatus(1512);

    String json = new Json().toJson(response);
    Response converted = new Json().toType(json, Response.class);

    assertThat(response.getSessionId()).isEqualTo("bar");
    assertThat(((List<?>) converted.getValue())).hasSize(2);
    assertThat(response.getStatus().intValue()).isEqualTo(1512);
  }

  @Test
  public void shouldConvertObjectsInArraysToMaps() {
    Date date = new Date();
    Cookie cookie = new Cookie("foo", "bar", "localhost", "/rooted", date, true, true);

    String rawJson = new Json().toJson(Collections.singletonList(cookie));
    List<?> list = new Json().toType(rawJson, List.class);

    Object first = list.get(0);
    assertThat(first instanceof Map).isTrue();

    assertThat(first).asInstanceOf(MAP)
        .containsEntry("name", "foo")
        .containsEntry("value", "bar")
        .containsEntry("domain", "localhost")
        .containsEntry("path", "/rooted")
        .containsEntry("secure", true)
        .containsEntry("httpOnly", true)
        .containsEntry("expiry", TimeUnit.MILLISECONDS.toSeconds(date.getTime()));
  }

  @Test
  public void shouldConvertAnArrayBackIntoAnArray() {
    Exception e = new Exception();
    String converted = new Json().toJson(e);

    Map<?,?> reconstructed = new Json().toType(converted, Map.class);
    List<?> trace = (List<?>) reconstructed.get("stackTrace");

    assertThat(trace.get(0)).isInstanceOf(Map.class);
  }

  @Test
  public void sShouldBeAbleToReconsituteASessionId() {
    String json = new Json().toJson(new SessionId("id"));
    SessionId sessionId = new Json().toType(json, SessionId.class);

    assertThat(sessionId.toString()).isEqualTo("id");
  }

  @Test
  public void shouldBeAbleToConvertACommand() {
    SessionId sessionId = new SessionId("session id");
    Command original = new Command(
        sessionId,
        DriverCommand.NEW_SESSION,
        ImmutableMap.of("food", "cheese"));
    String raw = new Json().toJson(original);
    Command converted = new Json().toType(raw, Command.class);

    assertThat(converted.getSessionId().toString()).isEqualTo(sessionId.toString());
    assertThat(converted.getName()).isEqualTo(original.getName());

    assertThat(converted.getParameters().keySet()).hasSize(1);
    assertThat(converted.getParameters().get("food")).isEqualTo("cheese");
  }

  @Test
  public void shouldConvertCapabilitiesToAMapAndIncludeCustomValues() {
    Capabilities caps = new ImmutableCapabilities("furrfu", "fishy");

    String raw = new Json().toJson(caps);
    Capabilities converted = new Json().toType(raw, Capabilities.class);

    assertThat(converted.getCapability("furrfu")).isEqualTo("fishy");
  }

  @Test
  public void shouldParseCapabilitiesWithLoggingPreferences() {
    String caps = String.format(
        "{\"%s\": {" +
        "\"browser\": \"WARNING\"," +
        "\"client\": \"DEBUG\", " +
        "\"driver\": \"ALL\", " +
        "\"server\": \"OFF\"}}",
        CapabilityType.LOGGING_PREFS);

    Capabilities converted = new Json().toType(caps, Capabilities.class);

    LoggingPreferences lp =
        (LoggingPreferences) converted.getCapability(CapabilityType.LOGGING_PREFS);
    assertThat(lp).isNotNull();
    assertThat(lp.getLevel(BROWSER)).isEqualTo(WARNING);
    assertThat(lp.getLevel(CLIENT)).isEqualTo(FINE);
    assertThat(lp.getLevel(DRIVER)).isEqualTo(ALL);
    assertThat(lp.getLevel(SERVER)).isEqualTo(OFF);
  }

  @Test
  public void shouldNotParseQuotedJsonObjectsAsActualJsonObjects() {
    String jsonStr = "{\"inner\":\"{\\\"color\\\":\\\"green\\\",\\\"number\\\":123}\"}";

    System.out.println(jsonStr);

    Object convertedOuter = new Json().toType(jsonStr, Map.class);
    assertThat(convertedOuter).isInstanceOf(Map.class);

    Object convertedInner = ((Map<?,?>) convertedOuter).get("inner");
    assertThat(convertedInner).isNotNull();
    assertThat(convertedInner).isInstanceOf(String.class);
    assertThat(convertedInner.toString()).isEqualTo("{\"color\":\"green\",\"number\":123}");
  }

  @Test
  public void shouldBeAbleToConvertASelenium3CommandToASelenium2Command() {
    SessionId expectedId = new SessionId("thisisakey");

    // In selenium 2, the sessionId is an object. In selenium 3, it's a straight string.
    String raw = "{\"sessionId\": \"" + expectedId.toString() + "\", " +
                 "\"name\": \"some command\"," +
                 "\"parameters\": {}}";

    Command converted = new Json().toType(raw, Command.class);

    assertThat(converted.getSessionId()).isEqualTo(expectedId);
  }

  @Test
  public void shouldCallFromJsonMethodIfPresent() {
    JsonAware res = new Json().toType("\"converted\"", JsonAware.class);
    assertThat(res.convertedValue).isEqualTo("converted");
  }

  @Test
  public void fromJsonMethodNeedNotBePublic() {
    JsonAware res = new Json().toType("\"converted\"", PrivatelyAware.class);
    assertThat(res.convertedValue).isEqualTo("converted");
  }

  @Test
  public void fromJsonMethodNeedNotOnlyAcceptAString() {
    Json json = new Json();
    String raw = json.toJson(ImmutableMap.of("cheese", "truffled brie"));
    MapTakingFromJsonMethod res = json.toType(raw, MapTakingFromJsonMethod.class);

    assertThat(res.cheese).isEqualTo("truffled brie");
  }

  // Test for issue 8187
  @Test
  public void decodingResponseWithNumbersInValueObject() {
    Response response = new Json().toType(
        "{\"status\":0,\"value\":{\"width\":96,\"height\":46.19140625}}",
        Response.class);

    @SuppressWarnings("unchecked")
    Map<String, Number> value = (Map<String, Number>) response.getValue();
    assertThat(value.get("width").intValue()).isEqualTo(96);
    assertThat(value.get("height").intValue()).isEqualTo(46);
    assertThat(value.get("height").doubleValue()).isCloseTo(46.19140625, byLessThan(0.00001));
  }

  @Test
  public void shouldRecognizeNumericStatus() {
    Response response = new Json().toType(
        "{\"status\":0,\"value\":\"cheese\"}",
        Response.class);

    assertThat(response.getStatus().intValue()).isEqualTo(0);
    assertThat(response.getState()).isEqualTo(new ErrorCodes().toState(0));
    String value = (String) response.getValue();
    assertThat(value).isEqualTo("cheese");
  }

  @Test
  public void shouldRecognizeStringStatus() {
    Response response = new Json().toType(
        "{\"status\":\"success\",\"value\":\"cheese\"}",
        Response.class);

    assertThat(response.getStatus().intValue()).isEqualTo(0);
    assertThat(response.getState()).isEqualTo(new ErrorCodes().toState(0));
    String value = (String) response.getValue();
    assertThat(value).isEqualTo("cheese");
  }

  @Test
  public void shouldConvertInvalidSelectorError() {
    Response response = new Json().toType(
        "{\"state\":\"invalid selector\",\"message\":\"invalid xpath selector\"}",
        Response.class);
    assertThat(response.getStatus().intValue()).isEqualTo(32);
    assertThat(response.getState()).isEqualTo(new ErrorCodes().toState(32));
  }

  @Test
  public void shouldRecognizeStringState() {
    Response response = new Json()
        .toType(
            "{\"state\":\"success\",\"value\":\"cheese\"}",
            Response.class);
    assertThat(response.getState()).isEqualTo("success");
    assertThat(response.getStatus().intValue()).isEqualTo(0);
    String value = (String) response.getValue();
    assertThat(value).isEqualTo("cheese");
  }

  @Test
  public void noStatusShouldBeNullInResponseObject() {
    Response response = new Json().toType("{\"value\":\"cheese\"}", Response.class);
    assertThat(response.getStatus()).isNull();
  }

  @Test
  public void canConvertAnEnumWithALowerCaseValue() {
    Proxy.ProxyType type = new Json().toType("\"pac\"", Proxy.ProxyType.class);
    assertThat(type).isEqualTo(PAC);
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
      new TypeToken<Map<String, String>>() {
      }.getType());

    assertThat(roundTripped.get("boolean")).isEqualTo("true");
    assertThat(roundTripped.get("integer")).isEqualTo("42");
    assertThat(roundTripped.get("float")).isEqualTo("3.14");
  }

  public static class BeanWithSetter {

    String theName;

    public void setName(String name) {
      theName = name;
    }
  }

  public static class BeanWithFinalField {

    private final String theName;

    public BeanWithFinalField() {
      this.theName = "magic";
    }
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

  public static class NoDefaultConstructor {

    private String value;

    public NoDefaultConstructor(String value) {
      this.value = value;
    }

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

  public static class PrivatelyAware {
    private String convertedValue;

    public PrivatelyAware(String convertedValue) {
      this.convertedValue = convertedValue;
    }

    private static JsonAware fromJson(String json) {
      return new JsonAware(json);
    }
  }

  public static class MapTakingFromJsonMethod {

    private String cheese;

    private static MapTakingFromJsonMethod fromJson(Map<String, Object> args) {
      MapTakingFromJsonMethod toReturn = new MapTakingFromJsonMethod();
      toReturn.cheese = String.valueOf(args.get("cheese"));
      return toReturn;
    }
  }
}
