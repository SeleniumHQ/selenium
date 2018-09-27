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
package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.OutputType.BASE64;

import org.junit.Test;

import java.io.File;

public class OutputTypeTest {
  public static final String TEST_BASE64 = "ABADABAD";
  public static final byte[] TEST_BYTES = new byte[] {0, 16, 3, 0, 16, 3};

  @Test
  public void testBase64() {
    assertThat(BASE64.convertFromBase64Png(TEST_BASE64)).isEqualTo(TEST_BASE64);
  }

  @Test
  public void testBytes() {
    byte[] bytes = OutputType.BYTES
        .convertFromBase64Png(TEST_BASE64);
    assertThat(bytes.length).isEqualTo(TEST_BYTES.length);
    for (int i = 0; i < TEST_BYTES.length; i++) {
      assertThat(TEST_BYTES[i]).as("index " + i).isEqualTo(bytes[i]);
    }
  }

  @Test
  public void testFiles() {
    File tmpFile = OutputType.FILE
        .convertFromBase64Png(TEST_BASE64);
    assertThat(tmpFile.exists()).isTrue();
    assertThat(tmpFile.length()).isEqualTo(TEST_BYTES.length);
    tmpFile.delete();
  }
}
