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

package org.openqa.selenium.remote.http;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.openqa.selenium.internal.Require;

abstract class HttpMessage<M extends HttpMessage<M>> {

  private final Map<String, List<String>> headers = new HashMap<>();
  private final Map<String, Object> attributes = new HashMap<>();
  private Contents.Supplier content = Contents.empty();

  /**
   * Retrieves a user-defined attribute of this message. Attributes are stored as simple key-value
   * pairs and are not included in a message's serialized form.
   *
   * @param key attribute name
   * @return attribute object
   */
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  public M setAttribute(String key, Object value) {
    attributes.put(key, value);
    return self();
  }

  public M removeAttribute(String key) {
    attributes.remove(key);
    return self();
  }

  public Iterable<String> getAttributeNames() {
    return Set.copyOf(attributes.keySet());
  }

  /**
   * Calls the {@code action} for all headers set.
   *
   * @param action the action to call
   */
  public void forEachHeader(BiConsumer<String, String> action) {
    headers.forEach((name, values) -> values.forEach((value) -> action.accept(name, value)));
  }

  /**
   * Returns an iterable with all the names of the headers set.
   *
   * @return an iterable view of the header names
   */
  public Iterable<String> getHeaderNames() {
    return Collections.unmodifiableCollection(headers.keySet());
  }

  /**
   * Returns an iterable of the values of headers with the {@code name} (case-insensitive).
   *
   * @param name the name of the header, case-insensitive
   * @return an iterable view of the values
   */
  public Iterable<String> getHeaders(String name) {
    return headers.entrySet().stream()
        .filter(e -> Objects.nonNull(e.getKey()))
        .filter(e -> e.getKey().equalsIgnoreCase(name.toLowerCase()))
        .flatMap((e) -> e.getValue().stream())
        .collect(Collectors.toList());
  }

  /**
   * Returns the value of the first header with the {@code name} (case-insensitive).
   *
   * @param name the name of the header, case-insensitive
   * @return the value
   */
  public String getHeader(String name) {
    return headers.entrySet().stream()
        .filter(e -> Objects.nonNull(e.getKey()))
        .filter(e -> e.getKey().equalsIgnoreCase(name.toLowerCase()))
        .flatMap((e) -> e.getValue().stream())
        .findFirst()
        .orElse(null);
  }

  /**
   * Removes all headers with the {@code name} (case-insensitive) and adds a header with the {@code
   * value}.
   *
   * @param name the name of the header, case-insensitive
   * @param value the value to set
   * @return self
   */
  public M setHeader(String name, String value) {
    return removeHeader(name).addHeader(name, value);
  }

  /**
   * Adds a header with the {@code name} and {@code value}, headers with the same (case-insensitive)
   * name will be preserved.
   *
   * @param name the name of the header, case-insensitive
   * @param value the value to set
   * @return self
   */
  public M addHeader(String name, String value) {
    headers.computeIfAbsent(name, (n) -> new ArrayList<>()).add(value);
    return self();
  }

  /**
   * Removes all headers with the {@code name} (case-insensitive).
   *
   * @param name the name of the header, case-insensitive
   * @return self
   */
  public M removeHeader(String name) {
    headers.keySet().removeIf(header -> header.equalsIgnoreCase(name));
    return self();
  }

  public Charset getContentEncoding() {
    Charset charset = UTF_8;
    try {
      String contentType = getHeader(HttpHeader.ContentType.getName());
      if (contentType != null) {
        return Arrays.stream(contentType.split(";"))
            .map((e) -> e.trim().toLowerCase())
            .filter((e) -> e.startsWith("charset="))
            .map((e) -> e.substring(e.indexOf('=') + 1))
            .map(Charset::forName)
            .findFirst()
            .orElse(UTF_8);
      }
    } catch (IllegalArgumentException ignored) {
      // Do nothing.
    }
    return charset;
  }

  @Deprecated
  public M setContent(Supplier<InputStream> supplier) {
    try {
      return setContent(Contents.bytes(supplier.get().readAllBytes()));
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
  }

  public M setContent(Contents.Supplier supplier) {
    this.content = Require.nonNull("Supplier", supplier);
    return self();
  }

  public Contents.Supplier getContent() {
    return content;
  }

  @SuppressWarnings("unchecked")
  private M self() {
    return (M) this;
  }
}
