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

package org.openqa.selenium.io;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.junit.jupiter.api.Test;

class ReadTest {
  @Test
  void canReadInputStreamToByteArray() throws IOException {
    InputStream in = new ByteArrayInputStream("Hello, world".getBytes(UTF_8));
    byte[] result = Read.toByteArray(in);
    assertThat(result).asString().isEqualTo("Hello, world");
  }

  @Test
  void canReadInputStreamToString() throws IOException {
    InputStream in = new ByteArrayInputStream("Hello, world".getBytes(UTF_8));
    String result = Read.toString(in);
    assertThat(result).isEqualTo("Hello, world");
  }

  @Test
  void canReadResourceFromClasspath() {
    String script = Read.resourceAsString(Read.class, "/org/openqa/selenium/remote/isDisplayed.js");
    assertThat(script).isNotBlank().contains("function () {");
  }
}
