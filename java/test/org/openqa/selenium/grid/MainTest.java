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

package org.openqa.selenium.grid;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

public class MainTest {

  ByteArrayOutputStream out;
  ByteArrayOutputStream err;

  @BeforeEach
  public void init() {
    out = new ByteArrayOutputStream();
    err = new ByteArrayOutputStream();
  }

  private PrintStream toPrintStream(ByteArrayOutputStream baos) {
    try {
      return new PrintStream(baos, true, StandardCharsets.UTF_8.name());
    } catch (UnsupportedEncodingException e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  public void shouldPrintAListOfCommandsWhenStartedWithoutOptions() {
    new Main(toPrintStream(out), toPrintStream(err), new String[]{}).go();
    assertThat(out.toString()).contains("A list of all the commands available");
  }

  @Test
  public void shouldPrintAListOfCommandsWhenStartedWithHelpOption() {
    new Main(toPrintStream(out), toPrintStream(err), new String[]{"--help"}).go();
    assertThat(out.toString()).contains("A list of all the commands available");
  }

}
