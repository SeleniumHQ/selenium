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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.byLessThan;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.Proxy.ProxyType.PAC;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.json.PropertySetting.BY_FIELD;

import com.google.common.reflect.TypeToken;
import java.io.StringReader;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

@Tag("UnitTests")
@SuppressWarnings("removal")
class JsonTest {

  @Test
  void canReadBooleans() {
    assertThat((Boolean) new Json().toType("true", Boolean.class)).isTrue();
    assertThat((Boolean) new Json().toType("false", Boolean.class)).isFalse();
  }

  @Test
  void canReadANumber() {
    assertThat((Number) new Json().toType("42", Number.class)).isEqualTo(42L);
    assertThat((Integer) new Json().toType("42", Integer.class)).isEqualTo(42);
    assertThat((Double) new Json().toType("42", Double.class)).isEqualTo(42.0);
    assertThat((Double) new Json().toType("4.2e+1", Double.class)).isEqualTo(42.0);
    assertThat((Double) new Json().toType("42e+1", Double.class)).isEqualTo(420.0);
    assertThat((Double) new Json().toType("42e-1", Double.class)).isEqualTo(4.2);
    assertThat((Double) new Json().toType("4.2e-1", Double.class)).isEqualTo(0.42);
  }

  @Test
  void canRoundTripNumbers() {
    Map<String, Object> original = Map.of("options", Map.of("args", List.of(1L, "hello")));

    Json json = new Json();
    String converted = json.toJson(original);
    Object remade = json.toType(converted, MAP_TYPE);

    assertThat(remade).asInstanceOf(MAP).containsExactlyInAnyOrderEntriesOf(original);
  }

  @Test
  void roundTripAFirefoxOptions() {
    Map<String, Object> caps = Map.of("moz:firefoxOptions", Map.of("prefs", Map.of("foo.bar", 1)));
    String json = new Json().toJson(caps);
    assertThat(json).doesNotContain("1.0");

    try (JsonInput input = new Json().newInput(new StringReader(json))) {
      json = new Json().toJson(input.read(Json.MAP_TYPE));
      assertThat(json).doesNotContain("1.0");
    }
  }

  @Test
  void shouldCoerceAListOfCapabilitiesIntoSomethingMutable() {
    // This is needed since Grid expects each of the capabilities to be mutable
    ImmutableCapabilities capabilities1 = new ImmutableCapabilities("cheese", "brie");
    ImmutableCapabilities capabilities2 = new ImmutableCapabilities("peas", 42L);

    Json json = new Json();
    String raw = json.toJson(List.of(capabilities1, capabilities2));
    List<Capabilities> seen = json.toType(raw, new TypeToken<List<Capabilities>>() {}.getType());

    assertThat(seen).containsExactly(capabilities1, capabilities2);
    assertThat(seen.get(0)).isInstanceOf(MutableCapabilities.class);
    assertThat(seen.get(1)).isInstanceOf(MutableCapabilities.class);
  }

  @Test
  void shouldUseBeanSettersToPopulateFields() {
    Map<String, String> map = Map.of("name", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithSetter seen = json.toType(raw, BeanWithSetter.class);

    assertThat(seen.theName).isEqualTo("fishy");
  }

  @Test
  void shouldAllowUserToPopulateFieldsDirectly() {
    Map<String, String> map = Map.of("theName", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithSetter seen = json.toType(raw, BeanWithSetter.class, BY_FIELD);

    assertThat(seen.theName).isEqualTo("fishy");
  }

  @Test
  void shouldThrowWhenDuplicateFieldNamesExistWithFieldSetting() {
    String raw = "{\"value\": \"test\"}";

    assertThatThrownBy(() -> new Json().toType(raw, ChildFieldBean.class, BY_FIELD))
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Unable to parse: " + raw)
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessage("Duplicate JSON field name detected while collecting field writers");
  }

  @Test
  void settingFinalFieldsShouldWork() {
    Map<String, String> map = Map.of("theName", "fishy");

    Json json = new Json();
    String raw = json.toJson(map);
    BeanWithFinalField seen = json.toType(raw, BeanWithFinalField.class, BY_FIELD);

    assertThat(seen.theName).isEqualTo("fishy");
  }

  @Test
  void canConstructASimpleString() {
    String text = new Json().toType("\"cheese\"", String.class);

    assertThat(text).isEqualTo("cheese");
  }

  @Test
  void canPopulateAMap() {
    String raw = "{\"cheese\": \"brie\", \"foodstuff\": \"cheese\"}";

    Map<String, String> map = new Json().toType(raw, Map.class);
    assertThat(map).hasSize(2).containsEntry("cheese", "brie").containsEntry("foodstuff", "cheese");
  }

  @Test
  void canPopulateAMapThatContainsNull() {
    String raw = "{\"foo\": null}";

    Map<String, ?> converted = new Json().toType(raw, Map.class);
    assertThat(converted).hasSize(1).containsEntry("foo", null);
  }

  @Test
  void canPopulateASimpleBean() {
    String raw = "{\"value\": \"time\"}";

    SimpleBean bean = new Json().toType(raw, SimpleBean.class);
    assertThat(bean.getValue()).isEqualTo("time");
  }

  @Test
  void canNotPopulateAnObjectOfAClassWithNoDefaultConstructor() {
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
  void willSilentlyDiscardUnusedFieldsWhenPopulatingABean() {
    String raw = "{\"value\": \"time\", \"frob\": \"telephone\"}";

    SimpleBean bean = new Json().toType(raw, SimpleBean.class);

    assertThat(bean.getValue()).isEqualTo("time");
  }

  @Test
  void shouldSetPrimitiveValuesToo() {
    String raw = "{\"magicNumber\": 3}";

    Map<?, ?> map = new Json().toType(raw, Map.class);

    assertThat(map.get("magicNumber")).isEqualTo(3L);
  }

  @Test
  void canReadNumericValues() {
    String raw =
        "{\"id\": 1234567890123456789, \"age\": 1234567890, \"fee\": \"999.888\", \"amount\":"
            + " \"999888.777666\"}";

    NumericValues bean = new Json().toType(raw, NumericValues.class, BY_FIELD);

    assertThat(bean.id).isEqualTo(1234567890123456789L);
    assertThat(bean.age).isEqualTo(1234567890);
    assertThat(bean.fee).isEqualTo(999.888f);
    assertThat(bean.amount).isEqualTo(999888.777666);
    assertThat(bean.remainder).isNull();
  }

  @Test
  void reportsWhichNumericValueWasInvalid() {
    String raw = "{\"id\": 123, \"age\": \"df8e0744-b1db-49b2-96df-45bd0d70dcd3\"}";

    assertThatThrownBy(() -> new Json().toType(raw, NumericValues.class, BY_FIELD))
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Unable to parse: " + raw)
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Not a numeric value: \"df8e0744-b1db-49b2-96df-45bd0d70dcd3\"");
  }

  @Test
  void reportsTooLargeNumericValue() {
    String raw = "{\"id\": 123456789012345678901234567890}";

    assertThatThrownBy(() -> new Json().toType(raw, NumericValues.class, BY_FIELD))
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Unable to parse: " + raw)
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Unable to parse to a number: 123456789012345678901234567890")
        .cause()
        .isInstanceOf(NumberFormatException.class)
        .hasMessage("For input string: \"123456789012345678901234567890\"");
  }

  @Test
  void canReadBooleanValues() {
    String raw = "{\"hero\": true, \"gangster\": false}";

    BooleanValues bean = new Json().toType(raw, BooleanValues.class, BY_FIELD);

    assertThat(bean.hero).isEqualTo(true);
    assertThat(bean.gangster).isEqualTo(false);
  }

  @Test
  void reportsWhichBooleanValueWasInvalid() {
    String raw = "{\"hero\": true, \"gangster\": \"not sure\"}";

    assertThatThrownBy(() -> new Json().toType(raw, BooleanValues.class, BY_FIELD))
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Unable to parse: " + raw)
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("Expected to read a BOOLEAN but instead have: STRING")
        .hasMessageContaining("to read: \"not sure\"");
  }

  @Test
  void shouldBeAbleToReadAnInstant() {
    Instant now = Instant.now();

    Dates instant = new Json().toType("{\"birth\": \"" + now + "\"}", Dates.class, BY_FIELD);

    assertThat(instant.birth).isEqualTo(now);
  }

  @Test
  void shouldBeAbleToReadAnInstantFromTimestamp() {
    long now = System.currentTimeMillis();

    Dates instant = new Json().toType("{\"birth\": " + now + "}", Dates.class, BY_FIELD);

    assertThat(instant.birth).isEqualTo(Instant.ofEpochMilli(now));
  }

  @Test
  void shouldBeAbleToReadAnInstantFromTimestampAsString() {
    long now = System.currentTimeMillis();

    Dates instant = new Json().toType("{\"birth\": \"" + now + "\"}", Dates.class, BY_FIELD);

    assertThat(instant.birth).isEqualTo(Instant.ofEpochMilli(now));
  }

  @Test
  void reportsWhichInstantValueWasInvalid() {
    String raw = "\"2025-13-32\"";

    assertThatThrownBy(() -> new Json().toType(raw, Instant.class))
        .isInstanceOf(JsonException.class)
        .hasMessage("Unable to parse: \"2025-13-32\"")
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessageStartingWith("\"2025-13-32\" does not look like an Instant")
        .cause()
        .isInstanceOf(java.time.format.DateTimeParseException.class)
        .hasMessageContaining("Text '2025-13-32' could not be parsed");
  }

  @Test
  void shouldPopulateFieldsOnNestedBeans() {
    String raw = "{\"name\": \"frank\", \"bean\": {\"value\": \"lots\"}}";

    ContainingBean bean = new Json().toType(raw, ContainingBean.class);

    assertThat(bean.getName()).isEqualTo("frank");
    assertThat(bean.getBean().getValue()).isEqualTo("lots");
  }

  @Test
  void shouldProperlyFillInACapabilitiesObject() {
    DesiredCapabilities capabilities =
        new DesiredCapabilities(
            CapabilityType.BROWSER_NAME, CapabilityType.BROWSER_VERSION, Platform.ANY);
    String text = new Json().toJson(capabilities);

    Capabilities readCapabilities = new Json().toType(text, DesiredCapabilities.class);

    assertThat(readCapabilities.getBrowserName()).isEqualTo(capabilities.getBrowserName());
    assertThat(readCapabilities.getBrowserVersion()).isEqualTo(capabilities.getBrowserVersion());
    assertThat(readCapabilities.getPlatformName()).isEqualTo(capabilities.getPlatformName());
  }

  @Test
  void shouldUseAMapToRepresentComplexObjects() {
    String toModel = "{\"thing\": \"hairy\", \"hairy\": true}";

    Map<?, ?> modelled = new Json().toType(toModel, Object.class);
    assertThat(modelled).hasSize(2);
  }

  @Test
  void shouldConvertAResponseWithAnElementInIt() {
    String json =
        "{\"value\":{\"value\":\"\",\"text\":\"\",\"selected\":false,\"enabled\":true,\"id\":\"three\"},\"context\":\"con\",\"sessionId\":\"sess\"}";
    Response converted = new Json().toType(json, Response.class);

    assertThat(converted).extracting("value").asInstanceOf(MAP).containsEntry("id", "three");
  }

  @Test
  @SuppressWarnings("deprecation")
  void shouldBeAbleToCopeWithStringsThatLookLikeBooleans() {
    String json = "{\"value\":\"false\",\"context\":\"foo\",\"sessionId\":\"1210083863107\"}";
    Response parsed = new Json().toType(json, Response.class);
    assertThat(parsed.getValue()).isEqualTo("false");
    assertThat(parsed.getSessionId()).isEqualTo("1210083863107");
    assertThat(parsed.getState()).isNull();
    assertThat(parsed.getStatus()).isNull();
  }

  @Test
  void shouldBeAbleToSetAnObjectToABoolean() {
    String json = "{\"value\":true,\"context\":\"foo\",\"sessionId\":\"true\"}";

    Response response = new Json().toType(json, Response.class);

    assertThat(response.getValue()).isEqualTo(true);
    assertThat(response.getSessionId()).isEqualTo("true");
  }

  @Test
  void canHandleValueBeingAnArray() {
    String[] value = {"Cheese", "Peas"};

    Response response = new Response();
    response.setSessionId("bar");
    response.setValue(value);
    response.setStatus(1512);

    String json = new Json().toJson(response);
    Response converted = new Json().toType(json, Response.class);

    assertThat(response.getSessionId()).isEqualTo("bar");
    assertThat(((List<?>) converted.getValue())).hasSize(2);
    assertThat(response.getStatus()).isEqualTo(1512);
  }

  @Test
  void shouldConvertObjectsInArraysToMaps() {
    Date date = new Date();
    Cookie cookie = new Cookie("foo", "bar", "localhost", "/rooted", date, true, true);

    String rawJson = new Json().toJson(Collections.singletonList(cookie));
    List<?> list = new Json().toType(rawJson, List.class);

    Object first = list.get(0);

    assertThat(first)
        .asInstanceOf(MAP)
        .containsEntry("name", "foo")
        .containsEntry("value", "bar")
        .containsEntry("domain", "localhost")
        .containsEntry("path", "/rooted")
        .containsEntry("secure", true)
        .containsEntry("httpOnly", true)
        .containsEntry("expiry", TimeUnit.MILLISECONDS.toSeconds(date.getTime()));
  }

  @Test
  void shouldConvertAnArrayBackIntoAnArray() {
    Exception e = new Exception();
    String converted = new Json().toJson(e);

    Map<?, ?> reconstructed = new Json().toType(converted, Map.class);
    List<?> trace = (List<?>) reconstructed.get("stackTrace");

    assertThat(trace.get(0)).isInstanceOf(Map.class);
  }

  @Test
  void sShouldBeAbleToReconstituteASessionId() {
    String json = new Json().toJson(new SessionId("id"));
    SessionId sessionId = new Json().toType(json, SessionId.class);

    assertThat(sessionId.toString()).isEqualTo("id");
  }

  @Test
  void shouldBeAbleToConvertACommand() {
    SessionId sessionId = new SessionId("session id");
    Command original = new Command(sessionId, DriverCommand.NEW_SESSION, Map.of("food", "cheese"));
    String raw = new Json().toJson(original);
    Command converted = new Json().toType(raw, Command.class);

    assertThat(converted.getSessionId().toString()).isEqualTo(sessionId.toString());
    assertThat(converted.getName()).isEqualTo(original.getName());

    assertThat(converted.getParameters().keySet()).hasSize(1);
    assertThat(converted.getParameters().get("food")).isEqualTo("cheese");
  }

  @Test
  void shouldConvertCapabilitiesToAMapAndIncludeCustomValues() {
    Capabilities caps = new ImmutableCapabilities("furrfu", "fishy");

    String raw = new Json().toJson(caps);
    Capabilities converted = new Json().toType(raw, Capabilities.class);

    assertThat(converted.getCapability("furrfu")).isEqualTo("fishy");
  }

  @Test
  void shouldNotParseQuotedJsonObjectsAsActualJsonObjects() {
    String jsonStr = "{\"inner\":\"{\\\"color\\\":\\\"green\\\",\\\"number\\\":123}\"}";

    System.out.println(jsonStr);

    Object convertedOuter = new Json().toType(jsonStr, Map.class);
    assertThat(convertedOuter).isInstanceOf(Map.class);

    Object convertedInner = ((Map<?, ?>) convertedOuter).get("inner");
    assertThat(convertedInner).isNotNull();
    assertThat(convertedInner).isInstanceOf(String.class);
    assertThat(convertedInner.toString()).isEqualTo("{\"color\":\"green\",\"number\":123}");
  }

  @Test
  void shouldBeAbleToConvertASelenium3CommandToASelenium2Command() {
    SessionId expectedId = new SessionId("thisisakey");

    // In selenium 2, the sessionId is an object. In selenium 3, it's a straight string.
    String raw =
        "{\"sessionId\": \""
            + expectedId
            + "\", "
            + "\"name\": \"some command\","
            + "\"parameters\": {}}";

    Command converted = new Json().toType(raw, Command.class);

    assertThat(converted.getSessionId()).isEqualTo(expectedId);
  }

  @Test
  void shouldCallFromJsonMethodIfPresent() {
    JsonAware res = new Json().toType("\"converted\"", JsonAware.class);
    assertThat(res.convertedValue).isEqualTo("converted");
  }

  @Test
  void fromJsonMethodNeedNotBePublic() {
    JsonAware res = new Json().toType("\"converted\"", PrivatelyAware.class);
    assertThat(res.convertedValue).isEqualTo("converted");
  }

  @Test
  void fromJsonMethodNeedNotOnlyAcceptAString() {
    Json json = new Json();
    String raw = json.toJson(Map.of("cheese", "truffled brie"));
    MapTakingFromJsonMethod res = json.toType(raw, MapTakingFromJsonMethod.class);

    assertThat(res.cheese).isEqualTo("truffled brie");
  }

  // Test for issue 8187
  @Test
  void decodingResponseWithNumbersInValueObject() {
    Response response =
        new Json()
            .toType(
                "{\"status\":0,\"value\":{\"width\":96,\"height\":46.19140625}}", Response.class);

    @SuppressWarnings("unchecked")
    Map<String, Number> value = (Map<String, Number>) response.getValue();
    assertThat(value.get("width").intValue()).isEqualTo(96);
    assertThat(value.get("height").intValue()).isEqualTo(46);
    assertThat(value.get("height").doubleValue()).isCloseTo(46.19140625, byLessThan(0.00001));
  }

  @Test
  void shouldRecognizeNumericStatus() {
    Response response = new Json().toType("{\"status\":0,\"value\":\"cheese\"}", Response.class);

    assertThat(response.getStatus()).isZero();
    assertThat(response.getState()).isEqualTo(new ErrorCodes().toState(0));
    String value = (String) response.getValue();
    assertThat(value).isEqualTo("cheese");
  }

  @Test
  void shouldRecognizeStringStatus() {
    Response response =
        new Json().toType("{\"status\":\"success\",\"value\":\"cheese\"}", Response.class);

    assertThat(response.getStatus()).isZero();
    assertThat(response.getState()).isEqualTo(new ErrorCodes().toState(0));
    String value = (String) response.getValue();
    assertThat(value).isEqualTo("cheese");
  }

  @Test
  void shouldConvertInvalidSelectorError() {
    Response response =
        new Json()
            .toType(
                "{\"state\":\"invalid selector\",\"message\":\"invalid xpath selector\"}",
                Response.class);
    assertThat(response.getStatus()).isEqualTo(32);
    assertThat(response.getState()).isEqualTo(new ErrorCodes().toState(32));
  }

  @Test
  void shouldRecognizeStringState() {
    Response response =
        new Json().toType("{\"state\":\"success\",\"value\":\"cheese\"}", Response.class);
    assertThat(response.getState()).isEqualTo("success");
    assertThat(response.getStatus()).isZero();
    String value = (String) response.getValue();
    assertThat(value).isEqualTo("cheese");
  }

  @Test
  void noStatusShouldBeNullInResponseObject() {
    Response response = new Json().toType("{\"value\":\"cheese\"}", Response.class);
    assertThat(response.getStatus()).isNull();
  }

  @Test
  void canConvertAnEnumWithALowerCaseValue() {
    Proxy.ProxyType type = new Json().toType("\"pac\"", Proxy.ProxyType.class);
    assertThat(type).isEqualTo(PAC);
  }

  @Test
  void canCoerceSimpleValuesToStrings() {
    Map<String, Object> value = Map.of("boolean", true, "integer", 42, "float", 3.14);

    Json json = new Json();
    String raw = json.toJson(value);
    Map<String, String> roundTripped =
        json.toType(raw, new TypeToken<Map<String, String>>() {}.getType());

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

  public static class ParentFieldBean {
    String value;
  }

  public static class ChildFieldBean extends ParentFieldBean {
    String value;
  }

  public static class JsonAware {
    private final String convertedValue;

    public JsonAware(String convertedValue) {
      this.convertedValue = convertedValue;
    }

    public static JsonAware fromJson(String json) {
      return new JsonAware(json);
    }
  }

  public static class PrivatelyAware {
    private final String convertedValue;

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

  static class NumericValues {
    long id;
    int age;
    float fee;
    double amount;
    @Nullable Double remainder;
  }

  static class BooleanValues {
    boolean hero;
    Boolean gangster;
  }

  static class Dates {
    Instant birth;
    Date wedding;
    Instant death;
  }
}
