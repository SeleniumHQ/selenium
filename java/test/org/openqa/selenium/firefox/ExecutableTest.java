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

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Before;
import org.junit.Test;
import org.junit.Assume;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.testing.UnitTests;

import java.io.File;

@Category(UnitTests.class)
public class ExecutableTest {

  private String binaryPath;

  @Before
  public void setUp() {
    try {
      binaryPath = new FirefoxBinary().getPath();
    } catch (WebDriverException ex) {
      ex.printStackTrace();
      Assume.assumeTrue(false);
    }
  }

  @Test
  public void canFindVersion() {
    Executable exe = new Executable(new File(binaryPath));
    System.out.println(exe.getVersion());
    assertThat(exe.getVersion()).isNotEmpty().isNotEqualTo("1000.0 unknown");
  }

  @Test
  public void canFindChannel() {
    Executable exe = new Executable(new File(binaryPath));
    System.out.println(exe.getChannel());
    assertThat(exe.getChannel()).isNotNull();
  }

}
