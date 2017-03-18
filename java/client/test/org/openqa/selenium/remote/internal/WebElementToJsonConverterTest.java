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

import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.RemoteWebElement;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@RunWith(JUnit4.class)
public class WebElementToJsonConverterTest {

  private static final WebElementToJsonConverter CONVERTER = new WebElementToJsonConverter();

  @Test
  public void returnsPrimitivesAsIs() {
    assertNull(CONVERTER.apply(null));
    assertEquals("abc", CONVERTER.apply("abc"));
    assertEquals(Boolean.TRUE, CONVERTER.apply(Boolean.TRUE));
    assertEquals(Integer.valueOf(123), CONVERTER.apply(123));
    assertEquals(Math.PI, CONVERTER.apply(Math.PI));
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

    WrappingWebElement wrapped = wrapElement(element);
    wrapped = wrapElement(wrapped);
    wrapped = wrapElement(wrapped);
    wrapped = wrapElement(wrapped);

    Object value = CONVERTER.apply(wrapped);
    assertIsWebElementObject(value, "abc123");
  }

  @SuppressWarnings("unchecked")
  @Test
  public void convertsSimpleCollections() {
    Object converted = CONVERTER.apply(Lists.newArrayList(null, "abc", true, 123, Math.PI));
    assertThat(converted, instanceOf(Collection.class));

    List<?> list = Lists.newArrayList((Collection<?>) converted);
    assertContentsInOrder(list, null, "abc", true, 123, Math.PI);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void convertsNestedCollections_simpleValues() {
    List<?> innerList = Lists.newArrayList(123, "abc");
    List<Object> outerList = Lists.newArrayList((Object) "apples", "oranges");
    outerList.add(innerList);

    Object converted = CONVERTER.apply(outerList);
    assertThat(converted, instanceOf(Collection.class));

    List<?> list = ImmutableList.copyOf((Collection<?>) converted);
    assertEquals(3, list.size());
    assertEquals("apples", list.get(0));
    assertEquals("oranges", list.get(1));
    assertThat(list.get(2), instanceOf(Collection.class));

    list = ImmutableList.copyOf((Collection<?>) list.get(2));
    assertContentsInOrder(list, 123, "abc");
  }

  @Test
  public void requiresMapsToHaveStringKeys() {
    try {
      CONVERTER.apply(ImmutableMap.of(new Object(), "bunny"));
      fail();
    } catch (IllegalArgumentException expected) {
    }
  }

  @Test
  public void requiresNestedMapsToHaveStringKeys() {
    try {
      CONVERTER.apply(ImmutableMap.of(
          "one", ImmutableMap.of(
          "two", ImmutableMap.of(
          Integer.valueOf(3), "not good"))));
      fail();
    } catch (IllegalArgumentException expected) {
    }
  }

  @Test
  public void convertsASimpleMap() {
    Object converted = CONVERTER.apply(ImmutableMap.of(
        "one", 1,
        "fruit", "apples",
        "honest", true));
    assertThat(converted, instanceOf(Map.class));

    @SuppressWarnings("unchecked")
    Map<String, Object> map = (Map<String, Object>) converted;
    assertEquals(3, map.size());
    assertEquals(1, map.get("one"));
    assertEquals("apples", map.get("fruit"));
    assertEquals(true, map.get("honest"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void convertsANestedMap() {
    Object converted = CONVERTER.apply(ImmutableMap.of(
        "one", 1,
        "fruit", "apples",
        "honest", true,
        "nested", ImmutableMap.of("bugs", "bunny")));
    assertThat(converted, instanceOf(Map.class));

    Map<String, Object> map = (Map<String, Object>) converted;
    assertEquals(4, map.size());
    assertEquals(1, map.get("one"));
    assertEquals("apples", map.get("fruit"));
    assertEquals(true, map.get("honest"));
    assertThat(map.get("nested"), instanceOf(Map.class));

    map = (Map<String, Object>) map.get("nested");
    assertEquals(1, map.size());
    assertEquals("bunny", map.get("bugs"));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void convertsAListWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    RemoteWebElement element2 = new RemoteWebElement();
    element2.setId("anotherId");

    Object value = CONVERTER.apply(Lists.newArrayList(element, element2));
    assertThat(value, instanceOf(Collection.class));

    List<Object> list = Lists.newArrayList((Collection<Object>) value);
    assertEquals(2, list.size());
    assertIsWebElementObject(list.get(0), "abc123");
    assertIsWebElementObject(list.get(1), "anotherId");
  }

  @SuppressWarnings("unchecked")
  @Test
  public void convertsAMapWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(ImmutableMap.of("one", element));
    assertThat(value, instanceOf(Map.class));

    Map<String, Object> map = (Map<String, Object>) value;
    assertEquals(1, map.size());
    assertIsWebElementObject(map.get("one"), "abc123");
  }

  @Test
  public void convertsAnArray() {
    Object value = CONVERTER.apply(new Object[] {
        "abc123", true, 123, Math.PI
    });

    assertThat(value, instanceOf(Collection.class));
    assertContentsInOrder(Lists.newArrayList((Collection<?>) value),
        "abc123", true, 123, Math.PI);
  }

  @Test
  public void convertsAnArrayWithAWebElement() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("abc123");

    Object value = CONVERTER.apply(new Object[] { element });
    assertContentsInOrder(Lists.newArrayList((Collection<?>) value),
        ImmutableMap.of(
          Dialect.OSS.getEncodedElementKey(), "abc123",
          Dialect.W3C.getEncodedElementKey(), "abc123"));
  }

  @Test
  public void rejectsUnrecognizedTypes() {
    try {
      CONVERTER.apply(new Object());
      fail();
    } catch (IllegalArgumentException expected) {
    }
  }

  private static WrappingWebElement wrapElement(WebElement element) {
    return new WrappingWebElement(element);
  }

  private static void assertIsWebElementObject(Object value, String expectedKey) {
    assertThat(value, instanceOf(Map.class));

    Map<?, ?>  map = (Map<?, ?>) value;
    assertEquals(2, map.size());
    assertTrue(map.containsKey(Dialect.OSS.getEncodedElementKey()));
    assertEquals(expectedKey, map.get(Dialect.OSS.getEncodedElementKey()));
    assertTrue(map.containsKey(Dialect.W3C.getEncodedElementKey()));
    assertEquals(expectedKey, map.get(Dialect.W3C.getEncodedElementKey()));
  }

  private static void assertContentsInOrder(List<?> list, Object... expectedContents) {
    List<Object> expected = Lists.newArrayList(expectedContents);
    assertEquals(expected, list);
  }

  private static class WrappingWebElement implements WebElement, WrapsElement {

    private WebElement element;

    public WrappingWebElement(WebElement element) {
      this.element = element;
    }

    public WebElement getWrappedElement() {
      return element;
    }

    public void click() {
      throw new UnsupportedOperationException();
    }

    public void submit() {
      throw new UnsupportedOperationException();
    }

    public void sendKeys(CharSequence... keysToSend) {
      throw new UnsupportedOperationException();
    }

    public void clear() {
      throw new UnsupportedOperationException();
    }

    public String getTagName() {
      throw new UnsupportedOperationException();
    }

    public String getAttribute(String name) {
      throw new UnsupportedOperationException();
    }

    public boolean isSelected() {
      throw new UnsupportedOperationException();
    }

    public boolean isEnabled() {
      throw new UnsupportedOperationException();
    }

    public String getText() {
      throw new UnsupportedOperationException();
    }

    public List<WebElement> findElements(By by) {
      throw new UnsupportedOperationException();
    }

    public WebElement findElement(By by) {
      throw new UnsupportedOperationException();
    }

    public boolean isDisplayed() {
      throw new UnsupportedOperationException();
    }

    public Point getLocation() {
      throw new UnsupportedOperationException();
    }

    public Dimension getSize() {
      throw new UnsupportedOperationException();
    }

    public Rectangle getRect() {
      throw new UnsupportedOperationException();
    }

    public String getCssValue(String propertyName) {
      throw new UnsupportedOperationException();
    }

    public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
      throw new UnsupportedOperationException();
    }
  }
}
