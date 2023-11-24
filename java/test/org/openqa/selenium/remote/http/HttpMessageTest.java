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

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class HttpMessageTest {

  @Test
  void allHeadersAreAdded() {
    for (HttpMessage<?> message :
        Arrays.asList(new HttpRequest(HttpMethod.GET, "/"), new HttpResponse())) {
      message.addHeader("Content-Length", "1024");
      message.addHeader("Content-length", "2048");
      message.addHeader("content-length", "4096");

      Set<String> headers = new HashSet<>();

      message.getHeaderNames().forEach(headers::add);

      assertThat(headers.contains("Content-Length")).isTrue();
      assertThat(headers.contains("Content-length")).isTrue();
      assertThat(headers.contains("content-length")).isTrue();
    }
  }

  @Test
  void readingIsCaseInsensitive() {
    for (HttpMessage<?> message :
        Arrays.asList(new HttpRequest(HttpMethod.GET, "/"), new HttpResponse())) {
      message.addHeader("Content-Length", "1024");
      message.addHeader("Content-length", "2048");
      message.addHeader("content-length", "4096");

      assertThat(message.getHeader("Content-Length")).isEqualTo("4096");
    }
  }

  @Test
  void replacingIsCaseInsensitive() {
    for (HttpMessage<?> message :
        Arrays.asList(new HttpRequest(HttpMethod.GET, "/"), new HttpResponse())) {
      message.addHeader("Content-Length", "1024");
      message.addHeader("Content-length", "2048");
      message.addHeader("content-length", "4096");
      message.setHeader("contenT-length", "8192");

      Set<String> headers = new HashSet<>();

      message.getHeaderNames().forEach(headers::add);

      assertThat(message.getHeader("content-length")).isEqualTo("8192");
      assertThat(headers.contains("Content-Length")).isFalse();
      assertThat(headers.contains("Content-length")).isFalse();
      assertThat(headers.contains("content-length")).isFalse();
    }
  }

  @Test
  void allHeadersAreRemoved() {
    for (HttpMessage<?> message :
        Arrays.asList(new HttpRequest(HttpMethod.GET, "/"), new HttpResponse())) {
      message.addHeader("Content-Length", "1024");
      message.addHeader("Content-length", "2048");
      message.addHeader("content-length", "4096");

      assertThat(message.getHeaderNames().iterator().hasNext()).isTrue();

      message.removeHeader("Content-Length");

      assertThat(message.getHeaderNames().iterator().hasNext()).isFalse();
    }
  }
}
