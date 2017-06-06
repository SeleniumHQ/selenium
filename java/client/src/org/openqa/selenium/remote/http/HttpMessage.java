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

import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.common.io.ByteStreams;
import com.google.common.net.MediaType;

import org.openqa.selenium.WebDriverException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.Map;

class HttpMessage {

  private final Multimap<String, String> headers = Multimaps.newListMultimap(
      Maps.<String, Collection<String>>newHashMap(), Lists::newLinkedList);

  private final Map<String, Object> attributes = Maps.newHashMap();

  private InputStream content = new ByteArrayInputStream(new byte[0]);
  private volatile byte[] readContent = null;

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
    return headers.get(name);
  }

  public String getHeader(String name) {
    Collection<String> values = headers.get(name);
    return values.isEmpty() ? null : values.iterator().next();
  }

  public void setHeader(String name, String value) {
    removeHeader(name);
    headers.put(name, value);
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

  public void setContent(byte[] data) {
    this.content = new ByteArrayInputStream(data);
  }

  public void setContent(InputStream toStreamFrom) {
    this.content = toStreamFrom;
  }

  public byte[] getContent() {
    if (readContent == null) {
      synchronized (this) {
        if (readContent == null) {
          try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            ByteStreams.copy(consumeContentStream(), bos);
            readContent = bos.toByteArray();
          } catch (IOException e) {
            throw new WebDriverException(e);
          }
        }
      }
    }
    return readContent;
  }

  public String getContentString() {
    return new String(getContent(), getContentEncoding());
  }

  /**
   * Get the underlying content stream, bypassing the caching mechanisms that allow it to be read
   * again.
   */
  public InputStream consumeContentStream() {
    return content;
  }
}
