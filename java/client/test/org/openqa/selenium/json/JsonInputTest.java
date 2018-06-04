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

import static org.junit.Assert.*;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import org.junit.Ignore;
import org.junit.Test;

import java.io.StringReader;

public class JsonInputTest {

  @Test
  public void shouldParseBooleanValues() {
    JsonInput input = newInput(true);
    assertEquals(JsonType.BOOLEAN, input.peek());
    assertTrue(input.nextBoolean());

    input = newInput(false);
    assertEquals(JsonType.BOOLEAN, input.peek());
    assertFalse(input.nextBoolean());
  }

  @Test
  public void shouldParseNonDecimalNumbersAsLongs() {
    JsonInput input = newInput(42);
    assertEquals(JsonType.NUMBER, input.peek());
    assertEquals(42L, input.nextNumber());
  }

  @Test
  public void shouldParseDecimalNumbersAsDoubles() {
    JsonInput input = newInput(42.0);
    assertEquals(JsonType.NUMBER, input.peek());
    assertEquals(42.0d, (Double) input.nextNumber(), 0);
  }

  @Test
  public void shouldHandleNullValues() {
    JsonInput input = newInput(null);
    assertEquals(JsonType.NULL, input.peek());
    assertNull(input.nextNull());
  }

  @Test
  public void shouldBeAbleToReadAString() {
    JsonInput input = newInput("cheese");
    assertEquals(JsonType.STRING, input.peek());
    assertEquals("cheese", input.nextString());
  }

  @Test
  public void shouldBeAbleToReadTheEmptyString() {
    JsonInput input = newInput("");
    assertEquals(JsonType.STRING, input.peek());
    assertEquals("", input.nextString());
  }

  @Test
  public void anEmptyArrayHasNoContents() {
    JsonInput input = newInput(ImmutableList.of());
    assertEquals(JsonType.START_COLLECTION, input.peek());
    input.beginArray();
    assertFalse(input.hasNext());
    assertEquals(JsonType.END_COLLECTION, input.peek());
    input.endArray();
  }

  @Test
  public void anArrayWithASingleElementHasNextButOnlyOneValue() {
    JsonInput input = newInput(ImmutableList.of("peas"));
    input.beginArray();
    assertEquals("peas", input.nextString());
    input.endArray();
  }

  @Test
  public void anArrayWithMultipleElementsReturnsTrueFromHasNextMoreThanOnce() {
    JsonInput input = newInput(ImmutableList.of("brie", "cheddar"));
    input.beginArray();
    assertTrue(input.hasNext());
    assertEquals("brie", input.nextString());
    assertTrue(input.hasNext());
    assertEquals("cheddar", input.nextString());
    assertFalse(input.hasNext());
    input.endArray();
  }

  @Test
  @Ignore
  public void callingHasNextWhenNotInAnArrayOrMapReturnsFalse() {
    JsonInput input = newInput("cheese");
    assertFalse(input.hasNext());
  }

  @Test
  public void anEmptyMapHasNoContents() {
    JsonInput input = newInput(ImmutableMap.of());
    assertEquals(JsonType.START_MAP, input.peek());
    input.beginObject();
    assertFalse(input.hasNext());
    assertEquals(JsonType.END_MAP, input.peek());
    input.endObject();
  }

  @Test
  public void canReadAMapWithASingleEntry() {
    JsonInput input = newInput(ImmutableMap.of("cheese", "feta"));
    input.beginObject();
    assertTrue(input.hasNext());
    assertEquals(JsonType.NAME, input.peek());
    assertEquals("cheese", input.nextName());
    assertEquals(JsonType.STRING, input.peek());
    assertEquals("feta", input.nextString());
    assertFalse(input.hasNext());
    input.endObject();
  }

  @Test
  public void canReadAMapWithManyEntries() {
    JsonInput input = newInput(ImmutableMap.of(
        "cheese", "stilton",
        "vegetable", "peas",
        "random", 42));

    assertEquals(JsonType.START_MAP, input.peek());
    input.beginObject();
    assertTrue(input.hasNext());
    assertEquals(JsonType.NAME, input.peek());
    assertEquals("cheese", input.nextName());
    assertEquals("stilton", input.nextString());
    assertTrue(input.hasNext());
    assertEquals(JsonType.NAME, input.peek());
    assertEquals("vegetable", input.nextName());
    assertEquals("peas", input.nextString());
    assertTrue(input.hasNext());
    assertEquals(JsonType.NAME, input.peek());
    assertEquals("random", input.nextName());
    assertEquals(42L, input.nextNumber());
    assertFalse(input.hasNext());
    assertEquals(JsonType.END_MAP, input.peek());
    input.endObject();
  }

  private JsonInput newInput(Object toParse) {
    String raw = new Gson().toJson(toParse);
    StringReader reader = new StringReader(raw);
    return new JsonInput(reader, new JsonTypeCoercer());
  }
}
