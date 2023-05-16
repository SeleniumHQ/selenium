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

package org.openqa.selenium.net;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import org.junit.jupiter.api.Test;

class UrlsTest {

  @Test
  void shouldCreateUrlFromProperlyFormedUrl() {
    URI uri = Urls.from("http://localhost:4444");

    assertThat(uri).isEqualTo(URI.create("http://localhost:4444"));
  }

  @Test
  void shouldAssumeAPlainStringIsAHostName() {
    URI uri = Urls.from("localhost");

    assertThat(uri).isEqualTo(URI.create("http://localhost"));
  }

  @Test
  void shouldHandleShortFormIp6AddressWithScheme() {
    URI uri = Urls.from("https://2001:db8::1:0:0:1");

    assertThat(uri).isEqualTo(URI.create("https://2001:db8::1:0:0:1"));
  }

  @Test
  void shouldHandleAShortFormIp6Address() {
    URI uri = Urls.from("2001:db8::1:0:0:1");

    assertThat(uri).isEqualTo(URI.create("http://[2001:db8::1:0:0:1]"));
  }

  @Test
  void shouldHandleTheIp6LoopbackAddress() {
    URI uri = Urls.from("::1");

    assertThat(uri).isEqualTo(URI.create("http://[::1]"));
  }

  @Test
  void shouldHandleTheUnspecifiedIp6Address() {
    URI uri = Urls.from("::");

    assertThat(uri).isEqualTo(URI.create("http://[::]"));
  }

  @Test
  void shouldHandleIpv6LoopbackAddressWithPath() {
    URI uri = Urls.from("::1/wd/hub");

    assertThat(uri).isEqualTo(URI.create("http://[::1]/wd/hub"));
  }
}
