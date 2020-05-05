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

package org.openqa.selenium.chrome;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.Test;

import java.util.List;
import java.util.Map;

public class ChromeOptionsTest {

  @Test
  public void optionsAsMapShouldBeImmutable() {
    Map<String, Object> options = new ChromeOptions().asMap();
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> options.put("browserType", "firefox"));

    Map<String, Object> googOptions = (Map<String, Object>) options.get(ChromeOptions.CAPABILITY);
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> googOptions.put("binary", ""));

    List<String> extensions = (List<String>) googOptions.get("extensions");
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> extensions.add("x"));

    List<String> args = (List<String>) googOptions.get("args");
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> args.add("-help"));
  }


}
