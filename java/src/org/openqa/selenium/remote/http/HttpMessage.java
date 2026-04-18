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
import static java.util.Collections.emptyList;
import static java.util.Objects.requireNonNullElse;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Supplier;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.Read;

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
  @Nullable
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
    return Collections.unmodifiableCollection(
        headers.getOrDefault(name.toLowerCase(Locale.ENGLISH), emptyList()));
  }

  /** See {@link #getHeader(String)} */
  @Nullable
  public String getHeader(HttpHeader name) {
    return getHeader(name.getName());
  }

  /**
   * Returns the value of the first header with the {@code name} (case-insensitive).
   *
   * @param name the name of the header, case-insensitive
   * @return the value
   */
  @Nullable
  public String getHeader(String name) {
    String lcName = name.toLowerCase(Locale.ENGLISH);
    List<String> values = headers.getOrDefault(lcName, emptyList());
    return !values.isEmpty() ? values.get(0) : null;
  }

  public String getHeader(HttpHeader header, String defaultValue) {
    return requireNonNullElse(getHeader(header.getName()), defaultValue);
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
    String lcName = name.toLowerCase(Locale.ENGLISH);
    return removeHeader(lcName).addHeader(lcName, value);
  }

  /** See {@link #addHeader(String, String)} */
  public M addHeader(HttpHeader name, String value) {
    return addHeader(name.getName(), value);
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
    String lcName = name.toLowerCase(Locale.ENGLISH);
    List<String> values = headers.computeIfAbsent(lcName, (n) -> new ArrayList<>());
    values.add(value);
    return self();
  }

  /**
   * Removes all headers with the {@code name} (case-insensitive).
   *
   * @param name the name of the header, case-insensitive
   * @return self
   */
  public M removeHeader(String name) {
    String lcName = name.toLowerCase(Locale.ENGLISH);
    headers.remove(lcName);
    return self();
  }

  /**
   * Get the value of "Content-Length" header
   *
   * @return Content length or -1 if the message has no header "Content-Length"
   */
  @Nullable
  public Long getContentLength() {
    return Optional.ofNullable(getHeader(HttpHeader.ContentLength))
        .map(Long::parseLong)
        .orElse(-1L);
  }

  @Nullable
  public String getContentType() {
    return getHeader(HttpHeader.ContentType);
  }

  public Charset getContentEncoding() {
    try {
      String contentType = getContentType();
      if (contentType != null) {
        return Arrays.stream(contentType.split(";"))
            .map((e) -> e.trim().toLowerCase(Locale.ENGLISH))
            .filter((e) -> e.startsWith("charset="))
            .map((e) -> e.substring(e.indexOf('=') + 1))
            .map(Charset::forName)
            .findFirst()
            .orElse(UTF_8);
      }
    } catch (IllegalArgumentException ignored) {
      // Do nothing.
    }
    return UTF_8;
  }

  @Deprecated
  public M setContent(Supplier<InputStream> supplier) {
    try (InputStream in = supplier.get()) {
      return setContent(Contents.bytes(Read.toByteArray(in)));
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

  @Override
  public String toString() {
    return getContent().toString();
  }

  public String contentAsString() {
    return getContent().contentAsString(getContentEncoding());
  }

  @SuppressWarnings("unchecked")
  private M self() {
    return (M) this;
  }
}
