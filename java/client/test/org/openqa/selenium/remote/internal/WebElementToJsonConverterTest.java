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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrappedWebElement;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.RemoteWebElement;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class WebElementToJsonConverterTest {

  private static final WebElementToJsonConverter CONVERTER = new WebElementToJsonConverter();

  @Test
  public void returnsPrimitivesAsIs() {
    assertThat(CONVERTER.apply(null)).isNull();
    assertThat(CONVERTER.apply("abc")).isEqualTo("abc");
    assertThat(CONVERTER.apply(Boolean.TRUE)).isEqualTo(Boolean.TRUE);
    assertThat(CONVERTER.apply(123)).isEqualTo(123);
    assertThat(CONVERTER.apply(Math.PI)).isEqualTo(Math.PI);
  }

  @Test
  public void convertsRemoteWebElementToWireProtocolMap() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(element);
    assertIsWebElementObject(value, "abc123");
  }

  @Test
  public void unwrapsWrappedElements() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(wrapElement(element));
    assertIsWebElementObject(value, "abc123");
  }

  @Test
  public void unwrapsWrappedElements_multipleLevelsOfWrapping() {
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
  public void convertsSimpleCollections() {
    Object converted = CONVERTER.apply(asList(null, "abc", true, 123, Math.PI));
    assertThat(converted).isInstanceOf(Collection.class);

    List<?> list = new ArrayList<>((Collection<?>) converted);
    assertContentsInOrder(list, null, "abc", true, 123, Math.PI);
  }

  @Test
  public void convertsNestedCollections_simpleValues() {
    List<?> innerList = asList(123, "abc");
    List<Object> outerList = asList("apples", "oranges", innerList);

    Object converted = CONVERTER.apply(outerList);
    assertThat(converted).isInstanceOf(Collection.class);

    List<?> list = ImmutableList.copyOf((Collection<?>) converted);
    assertThat(list).hasSize(3);
    assertThat(list.get(0)).isEqualTo("apples");
    assertThat(list.get(1)).isEqualTo("oranges");
    assertThat(list.get(2)).isInstanceOf(Collection.class);

    list = ImmutableList.copyOf((Collection<?>) list.get(2));
    assertContentsInOrder(list, 123, "abc");
  }

  @Test
  public void requiresMapsToHaveStringKeys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> CONVERTER.apply(ImmutableMap.of(new Object(), "bunny")));
  }

  @Test
  public void requiresNestedMapsToHaveStringKeys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> CONVERTER.apply(
            ImmutableMap.of("one", ImmutableMap.of("two", ImmutableMap.of(3, "not good")))));
  }

  @Test
  public void convertsASimpleMap() {
    Object converted = CONVERTER.apply(ImmutableMap.of(
        "one", 1,
        "fruit", "apples",
        "honest", true));
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
  public void convertsANestedMap() {
    Object converted = CONVERTER.apply(ImmutableMap.of(
        "one", 1,
        "fruit", "apples",
        "honest", true,
        "nested", ImmutableMap.of("bugs", "bunny")));
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
  public void convertsAListWithAWebElement() {
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
  public void convertsAMapWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(ImmutableMap.of("one", element));
    assertThat(value).isInstanceOf(Map.class);

    Map<String, Object> map = (Map<String, Object>) value;
    assertThat(map.size()).isEqualTo(1);
    assertIsWebElementObject(map.get("one"), "abc123");
  }

  @Test
  public void convertsAnArray() {
    Object value = CONVERTER.apply(new Object[] {
        "abc123", true, 123, Math.PI
    });

    assertThat(value).isInstanceOf(Collection.class);
    assertContentsInOrder(new ArrayList<>((Collection<?>) value),
        "abc123", true, 123, Math.PI);
  }

  @Test
  public void convertsAnArrayWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(new Object[] { element });
    assertContentsInOrder(new ArrayList<>((Collection<?>) value),
        ImmutableMap.of(
          Dialect.OSS.getEncodedElementKey(), "abc123",
          Dialect.W3C.getEncodedElementKey(), "abc123"));
  }

  private static WrappedWebElement wrapElement(WebElement element) {
    return new WrappedWebElement(element);
  }

  private static void assertIsWebElementObject(Object value, String expectedKey) {
    assertThat(value).isInstanceOf(Map.class);

    Map<?, ?>  map = (Map<?, ?>) value;
    assertThat(map).hasSize(2);
    assertThat(map.containsKey(Dialect.OSS.getEncodedElementKey())).isTrue();
    assertThat(map.get(Dialect.OSS.getEncodedElementKey())).isEqualTo(expectedKey);
    assertThat(map.containsKey(Dialect.W3C.getEncodedElementKey())).isTrue();
    assertThat(map.get(Dialect.W3C.getEncodedElementKey())).isEqualTo(expectedKey);
  }

  private static void assertContentsInOrder(List<?> list, Object... expectedContents) {
    List<Object> expected = asList(expectedContents);
    assertThat(list).isEqualTo(expected);
  }

}
