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
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Fail.fail;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class FormEncodedDataTest {

  @Test
  void shouldRequireCorrectContentType() {
    HttpRequest request = createRequest("key", "value").removeHeader("Content-Type");
    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data).isNotPresent();
  }

  @Test
  void canReadASinglePairOfValues() {
    HttpRequest request = createRequest("key", "value");

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get()).isEqualTo(ImmutableMap.of("key", singletonList("value")));
  }

  @Test
  void canReadTwoValues() {
    HttpRequest request = createRequest("key", "value", "foo", "bar");

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get())
        .isEqualTo(ImmutableMap.of("key", singletonList("value"), "foo", singletonList("bar")));
  }

  @Test
  void shouldSetEmptyValuesToTheEmptyString() {
    HttpRequest request = createRequest("key", null);

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get()).isEqualTo(ImmutableMap.of("key", singletonList("")));
  }

  @Test
  void shouldDecodeParameterNames() {
    HttpRequest request = createRequest("%foo%", "value");

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get()).isEqualTo(ImmutableMap.of("%foo%", singletonList("value")));
  }

  @Test
  void shouldDecodeParameterValues() {
    HttpRequest request = createRequest("key", "%bar%");

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get()).isEqualTo(ImmutableMap.of("key", singletonList("%bar%")));
  }

  @Test
  void shouldCollectMultipleValuesForTheSameParameterNamePreservingOrder() {
    HttpRequest request = createRequest("foo", "bar", "foo", "baz");

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get()).isEqualTo(ImmutableMap.of("foo", Arrays.asList("bar", "baz")));
  }

  @Test
  void aSingleParameterNameIsEnough() {
    HttpRequest request =
        new HttpRequest(GET, "/example")
            .addHeader("Content-Type", MediaType.FORM_DATA.toString())
            .setContent(bytes("param".getBytes()));

    Optional<Map<String, List<String>>> data = FormEncodedData.getData(request);

    assertThat(data.get()).isEqualTo(ImmutableMap.of("param", singletonList("")));
  }

  private HttpRequest createRequest(String key, String value, String... others) {
    if (others.length % 2 != 0) {
      fail("Other parameters must be of even length");
    }

    List<String> allStrings = new ArrayList<>();
    allStrings.add(key);
    allStrings.add(value);
    allStrings.addAll(Arrays.asList(others));

    StringBuilder content = new StringBuilder();
    Iterator<String> iterator = allStrings.iterator();
    boolean isFirst = true;
    while (iterator.hasNext()) {
      if (!isFirst) {
        content.append("&");
      }
      try {
        content.append(URLEncoder.encode(iterator.next(), UTF_8.toString()));

        String next = iterator.next();
        if (next != null) {
          content.append("=").append(URLEncoder.encode(next, UTF_8.toString()));
        }
      } catch (UnsupportedEncodingException e) {
        fail(e.getMessage());
      }
      if (isFirst) {
        isFirst = false;
      }
    }

    return new HttpRequest(GET, "/foo")
        .addHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")
        .setContent(utf8String(content.toString()));
  }
}
