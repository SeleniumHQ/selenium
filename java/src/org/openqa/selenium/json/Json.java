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

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

/**
 * The <b>Json</b> class is the entrypoint for the JSON processing features of the Selenium API.
 * These features include:
 *
 * <ul>
 *   <li>Built-in JSON deserialization to primitives and collections from the standard types shown
 *       below.
 *   <li>Facilities to deserialize JSON to custom data types:
 *       <ul>
 *         <li>Classes that declare a {@code fromJson(T)} static method, where <b>T</b> is any of
 *             the standard types shown below.
 *         <li>Classes that declare a {@code fromJson(JsonInput)} static method.<br>
 *             <b>NOTE</b>: Objects deserialized via a {@code fromJson} static method can be
 *             immutable.
 *         <li>Classes that declare setter methods adhering to the <a
 *             href="https://docs.oracle.com/javase/tutorial/javabeans/writing/index.html">JavaBean</a>
 *             specification.<br>
 *             <b>NOTE</b>: Deserialized {@code JavaBean} objects are mutable, which may be
 *             undesirable.
 *       </ul>
 *   <li>Built-in JSON serialization from primitives and collections from the standard types shown
 *       below.
 *   <li>Facilities to serialize custom data types to JSON:
 *       <ul>
 *         <li>Classes that declare a {@code toJson()} method returning a primitive or collection
 *             from the standard types shown below.
 *         <li>Classes that declare getter methods adhering to the {@code JavaBean} specification.
 *       </ul>
 * </ul>
 *
 * The standard types supported by built-in processing:
 *
 * <ul>
 *   <li><b>Numeric Types</b>:<br>
 *       {@link java.lang.Byte Byte}, {@link java.lang.Double Double}, {@link java.lang.Float
 *       Float}, {@link java.lang.Integer Integer}, {@link java.lang.Long Long}, {@link
 *       java.lang.Short Short}
 *   <li><b>Collection Types</b>:<br>
 *       {@link java.util.List List}, {@link java.util.Set Set}
 *   <li><b>Standard Java Types</b>:<br>
 *       {@link java.util.Map Map}, {@link java.lang.Boolean Boolean}, {@link java.lang.String
 *       String}, {@link java.lang.Enum Enum}, {@link java.net.URI URI}, {@link java.net.URL URL},
 *       {@link java.util.UUID UUID}, {@link java.time.Instant Instant}, {@link java.lang.Object
 *       Object}
 * </ul>
 *
 * You can serialize objects for which no explicit coercer has been specified, and the <b>Json</b>
 * API will use a generic process to provide best-effort JSON output. For the most predictable
 * results, though, it's best to provide a {@code toJson()} method for the <b>Json</b> API to use
 * for serialization. This is especially beneficial for objects that contain transient properties
 * that should be omitted from the JSON output.
 *
 * <p>You can deserialize objects for which no explicit handling has been defined. Note that the
 * data type of the result will be {@code Map<String,?>}, which means that you'll need to perform
 * type checking and casting every time you extract an entry value from the result. For this reason,
 * it's best to declare a type-specific {@code fromJson()} method in every type you need to
 * deserialize.
 *
 * @see JsonTypeCoercer
 * @see JsonInput
 * @see JsonOutput
 */
public class Json {
  /**
   * The value of {@code Content-Type} headers for HTTP requests and responses with JSON entities
   */
  public static final String JSON_UTF_8 = "application/json; charset=utf-8";

  /** Specifier for {@code List<Map<String, Object>} input/output type */
  public static final Type LIST_OF_MAPS_TYPE =
      new TypeToken<List<Map<String, Object>>>() {}.getType();

  /** Specifier for {@code Map<String, Object>} input/output type */
  public static final Type MAP_TYPE = new TypeToken<Map<String, Object>>() {}.getType();

  /** Specifier for {@code Object} input/output type */
  public static final Type OBJECT_TYPE = new TypeToken<Object>() {}.getType();

  private final JsonTypeCoercer fromJson = new JsonTypeCoercer();

  /**
   * Serialize the specified object to JSON string representation.<br>
   * <b>NOTE</b>: This method limits traversal of nested objects to the default {@link
   * JsonOutput#MAX_DEPTH maximum depth}.
   *
   * @param toConvert the object to be serialized
   * @return JSON string representing the specified object
   */
  public String toJson(Object toConvert) {
    return toJson(toConvert, JsonOutput.MAX_DEPTH);
  }

  /**
   * Serialize the specified object to JSON string representation.
   *
   * @param toConvert the object to be serialized
   * @param maxDepth maximum depth of nested object traversal
   * @return JSON string representing the specified object
   * @throws JsonException if an I/O exception is encountered
   */
  public String toJson(Object toConvert, int maxDepth) {
    try (Writer writer = new StringWriter();
        JsonOutput jsonOutput = newOutput(writer)) {
      jsonOutput.write(toConvert, maxDepth);
      return writer.toString();
    } catch (IOException e) {
      throw new JsonException(e);
    }
  }

  /**
   * Deserialize the specified JSON string into an object of the specified type.<br>
   * <b>NOTE</b>: This method uses the {@link PropertySetting#BY_NAME BY_NAME} strategy to assign
   * values to properties in the deserialized object.
   *
   * @param source serialized source as JSON string
   * @param typeOfT data type for deserialization (class or {@link TypeToken})
   * @return object of the specified type deserialized from [source]
   * @param <T> result type (as specified by [typeOfT])
   * @throws JsonException if an I/O exception is encountered
   */
  public <T> T toType(String source, Type typeOfT) {
    return toType(source, typeOfT, PropertySetting.BY_NAME);
  }

  /**
   * Deserialize the specified JSON string into an object of the specified type.
   *
   * @param source serialized source as JSON string
   * @param typeOfT data type for deserialization (class or {@link TypeToken})
   * @param setter strategy used to assign values during deserialization
   * @return object of the specified type deserialized from [source]
   * @param <T> result type (as specified by [typeOfT])
   * @throws JsonException if an I/O exception is encountered
   */
  public <T> T toType(String source, Type typeOfT, PropertySetting setter) {
    try (StringReader reader = new StringReader(source)) {
      return toType(reader, typeOfT, setter);
    } catch (JsonException e) {
      throw new JsonException("Unable to parse: " + source, e);
    }
  }

  /**
   * Deserialize the JSON string supplied by the specified {@code Reader} into an object of the
   * specified type.<br>
   * <b>NOTE</b>: This method uses the {@link PropertySetting#BY_NAME BY_NAME} strategy to assign
   * values to properties in the deserialized object.
   *
   * @param source {@link Reader} that supplies a serialized JSON string
   * @param typeOfT data type for deserialization (class or {@link TypeToken})
   * @return object of the specified type deserialized from [source]
   * @param <T> result type (as specified by [typeOfT])
   * @throws JsonException if an I/O exception is encountered
   */
  public <T> T toType(Reader source, Type typeOfT) {
    return toType(source, typeOfT, PropertySetting.BY_NAME);
  }

  /**
   * Deserialize the JSON string supplied by the specified {@code Reader} into an object of the
   * specified type.
   *
   * @param source {@link Reader} that supplies a serialized JSON string
   * @param typeOfT data type for deserialization (class or {@link TypeToken})
   * @param setter strategy used to assign values during deserialization
   * @return object of the specified type deserialized from [source]
   * @param <T> result type (as specified by [typeOfT])
   * @throws JsonException if an I/O exception is encountered
   */
  public <T> T toType(Reader source, Type typeOfT, PropertySetting setter) {
    if (setter == null) {
      throw new JsonException("Mechanism for setting properties must be set");
    }

    try (JsonInput json = newInput(source)) {
      return fromJson.coerce(json, typeOfT, setter);
    }
  }

  /**
   * Create a new {@code JsonInput} object to traverse the JSON string supplied the specified {@code
   * Reader}.<br>
   * <b>NOTE</b>: The {@code JsonInput} object returned by this method uses the {@link
   * PropertySetting#BY_NAME BY_NAME} strategy to assign values to properties objects it
   * deserializes.
   *
   * @param from {@link Reader} that supplies a serialized JSON string
   * @return {@link JsonInput} object to traverse the JSON string supplied by [from]
   * @throws UncheckedIOException if an I/O exception occurs
   */
  public JsonInput newInput(Reader from) throws UncheckedIOException {
    return new JsonInput(from, fromJson, PropertySetting.BY_NAME);
  }

  /**
   * Create a new {@code JsonOutput} object to produce a serialized JSON string in the specified
   * {@code Appendable}.
   *
   * @param to {@link Appendable} that consumes a serialized JSON string
   * @return {@link JsonOutput} object to product a JSON string in [to]
   * @throws UncheckedIOException if an I/O exception occurs
   */
  public JsonOutput newOutput(Appendable to) throws UncheckedIOException {
    return new JsonOutput(to);
  }
}
