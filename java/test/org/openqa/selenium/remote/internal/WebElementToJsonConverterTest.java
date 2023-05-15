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

package org.openqa.selenium.remote.internal;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.google.common.collect.ImmutableMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrappedWebElement;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.RemoteWebElement;

class WebElementToJsonConverterTest {

  private static final WebElementToJsonConverter CONVERTER = new WebElementToJsonConverter();

  @Test
  void returnsPrimitivesAsIs() {
    assertThat(CONVERTER.apply(null)).isNull();
    assertThat(CONVERTER.apply("abc")).isEqualTo("abc");
    assertThat(CONVERTER.apply(Boolean.TRUE)).isEqualTo(Boolean.TRUE);
    assertThat(CONVERTER.apply(123)).isEqualTo(123);
    assertThat(CONVERTER.apply(Math.PI)).isEqualTo(Math.PI);
  }

  @Test
  void convertsRemoteWebElementToWireProtocolMap() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(element);
    assertIsWebElementObject(value, "abc123");
  }

  @Test
  void unwrapsWrappedElements() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(wrapElement(element));
    assertIsWebElementObject(value, "abc123");
  }

  @Test
  void unwrapsWrappedElements_multipleLevelsOfWrapping() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    WrappedWebElement wrapped = wrapElement(element);
    wrapped = wrapElement(wrapped);
    wrapped = wrapElement(wrapped);
    wrapped = wrapElement(wrapped);

    Object value = CONVERTER.apply(wrapped);
    assertIsWebElementObject(value, "abc123");
  }

  @Test
  void convertsSimpleCollections() {
    Object converted = CONVERTER.apply(asList(null, "abc", true, 123, Math.PI));
    assertThat(converted).isInstanceOf(Collection.class);

    List<?> list = new ArrayList<>((Collection<?>) converted);
    assertContentsInOrder(list, null, "abc", true, 123, Math.PI);
  }

  @Test
  void convertsNestedCollections_simpleValues() {
    List<?> innerList = asList(123, "abc");
    List<Object> outerList = asList("apples", "oranges", innerList);

    Object converted = CONVERTER.apply(outerList);
    assertThat(converted).isInstanceOf(Collection.class);

    List<?> list = new ArrayList<>((Collection<?>) converted);
    assertThat(list).hasSize(3);
    assertThat(list.get(0)).isEqualTo("apples");
    assertThat(list.get(1)).isEqualTo("oranges");
    assertThat(list.get(2)).isInstanceOf(Collection.class);

    list = new ArrayList<>((Collection<?>) list.get(2));
    assertContentsInOrder(list, 123, "abc");
  }

  @Test
  void requiresMapsToHaveStringKeys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> CONVERTER.apply(ImmutableMap.of(new Object(), "bunny")));
  }

  @Test
  void requiresNestedMapsToHaveStringKeys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(
            () ->
                CONVERTER.apply(
                    ImmutableMap.of(
                        "one", ImmutableMap.of("two", ImmutableMap.of(3, "not good")))));
  }

  @Test
  void convertsASimpleMap() {
    Object converted =
        CONVERTER.apply(ImmutableMap.of("one", 1, "fruit", "apples", "honest", true));
    assertThat(converted).isInstanceOf(Map.class);

    @SuppressWarnings("unchecked")
    Map<String, Object> map = (Map<String, Object>) converted;
    assertThat(map).hasSize(3);
    assertThat(map.get("one")).isEqualTo(1);
    assertThat(map.get("fruit")).isEqualTo("apples");
    assertThat(map.get("honest")).isEqualTo(true);
  }

  @SuppressWarnings("unchecked")
  @Test
  void convertsANestedMap() {
    Object converted =
        CONVERTER.apply(
            ImmutableMap.of(
                "one",
                1,
                "fruit",
                "apples",
                "honest",
                true,
                "nested",
                ImmutableMap.of("bugs", "bunny")));
    assertThat(converted).isInstanceOf(Map.class);

    Map<String, Object> map = (Map<String, Object>) converted;
    assertThat(map).hasSize(4);
    assertThat(map.get("one")).isEqualTo(1);
    assertThat(map.get("fruit")).isEqualTo("apples");
    assertThat(map.get("honest")).isEqualTo(true);
    assertThat(map.get("nested")).isInstanceOf(Map.class);

    map = (Map<String, Object>) map.get("nested");
    assertThat(map.size()).isEqualTo(1);
    assertThat(map.get("bugs")).isEqualTo("bunny");
  }

  @SuppressWarnings("unchecked")
  @Test
  void convertsAListWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    RemoteWebElement element2 = new RemoteWebElement();
    element2.setId("anotherId");

    Object value = CONVERTER.apply(asList(element, element2));
    assertThat(value).isInstanceOf(Collection.class);

    List<Object> list = new ArrayList<>((Collection<Object>) value);
    assertThat(list).hasSize(2);
    assertIsWebElementObject(list.get(0), "abc123");
    assertIsWebElementObject(list.get(1), "anotherId");
  }

  @SuppressWarnings("unchecked")
  @Test
  void convertsAMapWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(ImmutableMap.of("one", element));
    assertThat(value).isInstanceOf(Map.class);

    Map<String, Object> map = (Map<String, Object>) value;
    assertThat(map.size()).isEqualTo(1);
    assertIsWebElementObject(map.get("one"), "abc123");
  }

  @Test
  void convertsAnArray() {
    Object value1 = CONVERTER.apply(new Object[] {"abc123", true, 123, Math.PI});

    assertThat(value1).isInstanceOf(Collection.class);
    assertContentsInOrder(new ArrayList<>((Collection<?>) value1), "abc123", true, 123, Math.PI);

    Object value2 = CONVERTER.apply(new int[] {123, 456, 789});

    assertThat(value2).isInstanceOf(Collection.class);
    assertContentsInOrder(new ArrayList<>((Collection<?>) value2), 123, 456, 789);
  }

  @Test
  void convertsAnArrayWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(new Object[] {element});
    assertContentsInOrder(
        new ArrayList<>((Collection<?>) value),
        ImmutableMap.of(Dialect.W3C.getEncodedElementKey(), "abc123"));
  }

  private static WrappedWebElement wrapElement(WebElement element) {
    return new WrappedWebElement(element);
  }

  private static void assertIsWebElementObject(Object value, String expectedKey) {
    assertThat(value).isInstanceOf(Map.class);

    Map<?, ?> map = (Map<?, ?>) value;
    assertThat(map).hasSize(1);
    assertThat(map.containsKey(Dialect.W3C.getEncodedElementKey())).isTrue();
    assertThat(map.get(Dialect.W3C.getEncodedElementKey())).isEqualTo(expectedKey);
  }

  private static void assertContentsInOrder(List<?> list, Object... expectedContents) {
    List<Object> expected = asList(expectedContents);
    assertThat(list).isEqualTo(expected);
  }
}
