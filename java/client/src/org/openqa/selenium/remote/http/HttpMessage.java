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

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.http.Contents.string;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;
import com.google.common.net.MediaType;

import java.io.InputStream;
import java.io.Reader;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;
import java.util.stream.Collectors;

class HttpMessage {

  private final Multimap<String, String> headers = ArrayListMultimap.create();
  private final Map<String, Object> attributes = new HashMap<>();
  private Supplier<InputStream> content = Contents.empty();

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

  public void setAttribute(String key, Object value) {
    attributes.put(key, value);
  }

  public void removeAttribute(String key) {
    attributes.remove(key);
  }

  public Iterable<String> getHeaderNames() {
    return headers.keySet();
  }

  public Iterable<String> getHeaders(String name) {
    return headers.entries().stream()
        .filter(e -> Objects.nonNull(e.getKey()))
        .filter(e -> e.getKey().equalsIgnoreCase(name.toLowerCase()))
        .map(Map.Entry::getValue)
        .collect(Collectors.toList());
  }

  public String getHeader(String name) {
    Iterable<String> initialHeaders = getHeaders(name);
    if (initialHeaders == null) {
      return null;
    }

    Iterator<String> headers = initialHeaders.iterator();
    if (headers.hasNext()) {
      return headers.next();
    }
    return null;
  }

  public void setHeader(String name, String value) {
    removeHeader(name);
    addHeader(name, value);
  }

  public void addHeader(String name, String value) {
    headers.put(name, value);
  }

  public void removeHeader(String name) {
    headers.removeAll(name);
  }

  public Charset getContentEncoding() {
    Charset charset = UTF_8;
    try {
      String contentType = getHeader(CONTENT_TYPE);
      if (contentType != null) {
        MediaType mediaType = MediaType.parse(contentType);
        charset = mediaType.charset().or(UTF_8);
      }
    } catch (IllegalArgumentException ignored) {
      // Do nothing.
    }
    return charset;
  }

  /**
   * @deprecated Pass {@link Contents#bytes(byte[])} to {@link #setContent(Supplier)}.
   */
  @Deprecated
  public void setContent(byte[] data) {
    setContent(bytes(data));
  }

  /**
   * @deprecated Pass {@code () -> toStreamFrom} to {@link #setContent(Supplier)}.
   */
  @Deprecated
  public void setContent(InputStream toStreamFrom) {
    setContent(() -> toStreamFrom);
  }

  public void setContent(Supplier<InputStream> supplier) {
    this.content = Objects.requireNonNull(supplier, "Supplier must be set.");
  }

  public Supplier<InputStream> getContent() {
    return content;
  }

  /**
   * @deprecated Use {@link Contents#string(HttpMessage)} instead.
   */
  @Deprecated
  public String getContentString() {
    return string(this);
  }

  /**
   * @deprecated Use {@link Contents#reader(HttpMessage)} instead.
   */
  @Deprecated
  public Reader getContentReader() {
    return reader(this);
  }

  /**
   * @deprecated Use {@link #getContent()} and call {@link Supplier#get()}.
   */
  @Deprecated
  public InputStream getContentStream() {
    return getContent().get();
  }

  /**
   * Get the underlying content stream, bypassing the caching mechanisms that allow it to be read
   * again.
   * @deprecated No direct replacement. Use {@link #getContent()} and call {@link Supplier#get()}.
   */
  public InputStream consumeContentStream() {
    return getContent().get();
  }
}

