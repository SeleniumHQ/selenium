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
package org.openqa.selenium.os;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.Platform.WINDOWS;

import org.junit.Assume;
import org.junit.Test;
import org.openqa.selenium.Platform;

import java.util.Properties;

public class WindowsUtilsUnitTest {

  @Test
  public void testLoadEnvironment() {
    Assume.assumeTrue(Platform.getCurrent().is(WINDOWS));

    String osVersion = System.getProperty("os.version");
    assertThat(osVersion).matches("^(\\d)+\\.(\\d)+$");

    Properties p = WindowsUtils.loadEnvironment();
    assertThat(p).isNotEmpty();
  }
}
