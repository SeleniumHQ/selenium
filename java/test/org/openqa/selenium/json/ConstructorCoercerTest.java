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

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class ConstructorCoercerTest {

  @Test
  void canPopulateAnObjectUsingANamedConstructor() {
    String raw = "{\"value\": \"time\"}";

    NoDefaultConstructor bean = new Json().toType(raw, NoDefaultConstructor.class);

    assertThat(bean.getValue()).isEqualTo("time");
  }

  @Test
  void namedConstructorNeedNotBePublic() {
    String raw = "{\"value\": \"time\"}";

    PrivateConstructor bean = new Json().toType(raw, PrivateConstructor.class);

    assertThat(bean.value).isEqualTo("time");
  }

  @Test
  void canPopulateNestedValuesUsingANamedConstructor() {
    String raw =
        String.join(
            "",
            "{",
            "\"child\": {\"value\": \"time\"},",
            "\"tags\": [\"brie\", \"cheddar\"],",
            "\"count\": 2,",
            "\"flavor\": \"cheddar\",",
            "\"unused\": \"ignored\"",
            "}");

    ConstructorWithNestedValues bean = new Json().toType(raw, ConstructorWithNestedValues.class);

    assertThat(bean.child.getValue()).isEqualTo("time");
    assertThat(bean.tags).containsExactly("brie", "cheddar");
    assertThat(bean.count).isEqualTo(2);
    assertThat(bean.flavor).isEqualTo(Flavor.CHEDDAR);
  }

  @Test
  void missingOptionalConstructorParametersAreEmpty() {
    String raw = "{\"value\": \"time\"}";

    ConstructorWithOptionalValue bean = new Json().toType(raw, ConstructorWithOptionalValue.class);

    assertThat(bean.value).isEqualTo("time");
    assertThat(bean.optionalValue).isEmpty();
  }

  @Test
  void nullOptionalConstructorParametersAreEmpty() {
    String raw = "{\"value\": \"time\", \"optionalValue\": null}";

    ConstructorWithOptionalValue bean = new Json().toType(raw, ConstructorWithOptionalValue.class);

    assertThat(bean.value).isEqualTo("time");
    assertThat(bean.optionalValue).isEmpty();
  }

  @Test
  void canPopulateOptionalConstructorParameters() {
    String raw = "{\"value\": \"time\", \"optionalValue\": \"space\"}";

    ConstructorWithOptionalValue bean = new Json().toType(raw, ConstructorWithOptionalValue.class);

    assertThat(bean.value).isEqualTo("time");
    assertThat(bean.optionalValue).contains("space");
  }

  @Test
  void canPopulateOptionalParameterizedConstructorParameters() {
    String raw = "{\"values\": [\"brie\", \"cheddar\"]}";

    ConstructorWithOptionalList bean = new Json().toType(raw, ConstructorWithOptionalList.class);

    assertThat(bean.values).contains(List.of("brie", "cheddar"));
  }

  @Test
  void canPopulateCollectionConstructorParameters() {
    String raw = "{\"values\": [\"brie\", \"cheddar\"]}";

    ConstructorWithCollection bean = new Json().toType(raw, ConstructorWithCollection.class);

    assertThat(bean.values).containsExactly("brie", "cheddar");
  }

  @Test
  void choosesLongestConstructorWithMatchingParameters() {
    String raw = "{\"value\": \"time\"}";

    MultipleConstructors bean = new Json().toType(raw, MultipleConstructors.class);

    assertThat(bean.value).isEqualTo("time");
    assertThat(bean.optionalValue).isEmpty();
    assertThat(bean.constructorUsed).isEqualTo("longest");
  }

  @Test
  void usesShorterConstructorWhenLongerRequiredParametersAreMissing() {
    String raw = "{\"value\": \"time\"}";

    ConstructorWithLongerRequiredOverload bean =
        new Json().toType(raw, ConstructorWithLongerRequiredOverload.class);

    assertThat(bean.value).isEqualTo("time");
    assertThat(bean.constructorUsed).isEqualTo("shortest");
  }

  @Test
  void usesLongerConstructorWhenRequiredParametersArePresent() {
    String raw = "{\"value\": \"time\", \"requiredValue\": \"space\"}";

    ConstructorWithLongerRequiredOverload bean =
        new Json().toType(raw, ConstructorWithLongerRequiredOverload.class);

    assertThat(bean.value).isEqualTo("time");
    assertThat(bean.requiredValue).isEqualTo("space");
    assertThat(bean.constructorUsed).isEqualTo("longest");
  }

  @Test
  void rejectsAmbiguousConstructorMatches() {
    String raw = "{\"value\": \"time\", \"left\": \"space\", \"right\": 3}";

    assertThatExceptionOfType(JsonException.class)
        .isThrownBy(() -> new Json().toType(raw, AmbiguousConstructors.class))
        .withMessage("Unable to parse: " + raw)
        .havingCause()
        .isInstanceOf(JsonException.class)
        .withMessageStartingWith(
            String.format(
                "Unable to choose between 2 constructors for %s", AmbiguousConstructors.class));
  }

  @Test
  void requiresAllNamedConstructorParametersToBePresent() {
    String raw = "{\"child\": {\"value\": \"time\"}, \"tags\": [], \"flavor\": \"cheddar\"}";

    assertThatExceptionOfType(JsonException.class)
        .isThrownBy(() -> new Json().toType(raw, ConstructorWithNestedValues.class))
        .withMessage("Unable to parse: " + raw)
        .havingCause()
        .isInstanceOf(JsonException.class)
        .withMessageStartingWith(
            "Missing JSON value for constructor parameter %s.count",
            ConstructorWithNestedValues.class.getName());
  }

  @Test
  void requiresNonOptionalConstructorParametersToBeNonNull() {
    String raw = "{\"value\": null}";

    assertThatExceptionOfType(JsonException.class)
        .isThrownBy(() -> new Json().toType(raw, NoDefaultConstructor.class))
        .withMessage("Unable to parse: " + raw)
        .havingCause()
        .isInstanceOf(JsonException.class)
        .withMessageStartingWith(
            "Constructor parameter %s.value cannot be null", NoDefaultConstructor.class.getName());
  }

  @Test
  void fromJsonTakesPrecedenceOverNamedConstructors() {
    String raw = "{\"value\": \"constructor\"}";

    ConstructorAndFromJson bean = new Json().toType(raw, ConstructorAndFromJson.class);

    assertThat(bean.value).isEqualTo("fromJson");
  }

  public enum Flavor {
    CHEDDAR
  }

  public static class NoDefaultConstructor {

    private final String value;

    public NoDefaultConstructor(String value) {
      this.value = value;
    }

    public String getValue() {
      return value;
    }
  }

  private static class PrivateConstructor {

    private final String value;

    private PrivateConstructor(String value) {
      this.value = value;
    }
  }

  public static class ConstructorWithNestedValues {

    private final NoDefaultConstructor child;
    private final List<String> tags;
    private final int count;
    private final Flavor flavor;

    public ConstructorWithNestedValues(
        NoDefaultConstructor child, List<String> tags, int count, Flavor flavor) {
      this.child = child;
      this.tags = tags;
      this.count = count;
      this.flavor = flavor;
    }
  }

  public static class ConstructorWithOptionalValue {

    private final String value;
    private final Optional<String> optionalValue;

    public ConstructorWithOptionalValue(String value, Optional<String> optionalValue) {
      this.value = value;
      this.optionalValue = optionalValue;
    }
  }

  public static class ConstructorWithOptionalList {

    private final Optional<List<String>> values;

    public ConstructorWithOptionalList(Optional<List<String>> values) {
      this.values = values;
    }
  }

  public static class ConstructorWithCollection {

    private final Collection<String> values;

    public ConstructorWithCollection(Collection<String> values) {
      this.values = values;
    }
  }

  public static class MultipleConstructors {

    private final String value;
    private final Optional<String> optionalValue;
    private final String constructorUsed;

    public MultipleConstructors(String value) {
      this.value = value;
      this.optionalValue = Optional.empty();
      this.constructorUsed = "shortest";
    }

    public MultipleConstructors(String value, Optional<String> optionalValue) {
      this.value = value;
      this.optionalValue = optionalValue;
      this.constructorUsed = "longest";
    }
  }

  public static class ConstructorWithLongerRequiredOverload {

    private final String value;
    private final String requiredValue;
    private final String constructorUsed;

    public ConstructorWithLongerRequiredOverload(String value) {
      this.value = value;
      this.requiredValue = null;
      this.constructorUsed = "shortest";
    }

    public ConstructorWithLongerRequiredOverload(String value, String requiredValue) {
      this.value = value;
      this.requiredValue = requiredValue;
      this.constructorUsed = "longest";
    }
  }

  public static class AmbiguousConstructors {

    public AmbiguousConstructors(String value, String left) {}

    public AmbiguousConstructors(String value, int right) {}
  }

  public static class ConstructorAndFromJson {

    private final String value;

    public ConstructorAndFromJson(String value) {
      this.value = value;
    }

    private static ConstructorAndFromJson fromJson(Map<String, Object> ignored) {
      return new ConstructorAndFromJson("fromJson");
    }
  }
}
