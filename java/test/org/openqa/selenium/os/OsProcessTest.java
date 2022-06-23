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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.testing.TestUtilities.isOnTravis;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.build.BazelBuild;

import java.io.ByteArrayOutputStream;
import java.io.File;

public class OsProcessTest {

  private final static String testExecutable = findExecutable(
    "java/test/org/openqa/selenium/os/echo");

  private OsProcess process = new OsProcess(testExecutable);

  @Test
  public void testSetEnvironmentVariableWithNullKeyThrows() {
    String key = null;
    String value = "Bar";
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> process.setEnvironmentVariable(key, value));
    assertThat(process.getEnvironment()).doesNotContainValue(value);
  }

  @Test
  public void testSetEnvironmentVariableWithNullValueThrows() {
    String key = "Foo";
    String value = null;
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> process.setEnvironmentVariable(key, value));
    assertThat(process.getEnvironment()).doesNotContainKey(key);
  }

  @Test
  public void testSetEnvironmentVariableWithNonNullValueSets() {
    String key = "Foo";
    String value = "Bar";
    process.setEnvironmentVariable(key, value);
    assertThat(process.getEnvironment()).containsEntry(key, value);
  }

  @Test
  public void testDestroy() {
    process.executeAsync();
    assertThat(process.isRunning()).isTrue();
    process.destroy();
    assertThat(process.isRunning()).isFalse();
  }

  @Test
  public void canHandleOutput() throws InterruptedException {
    process = new OsProcess(testExecutable, "ping");
    process.executeAsync();
    process.waitFor();
    assertThat(process.getStdOut()).isNotEmpty().contains("ping");
  }

  @Test
  public void canCopyOutput() throws InterruptedException {
    process = new OsProcess(testExecutable, "Who", "else", "likes", "cheese?");
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    process.copyOutputTo(buffer);
    process.executeAsync();
    process.waitFor();
    assertThat(buffer.toByteArray()).isNotEmpty();
    assertThat(process.getStdOut()).isEqualTo(buffer.toString());
  }

  @Test
  public void canDetectSuccess() throws InterruptedException {
    assumeThat(isOnTravis()).as("Operation not permitted on travis").isFalse();
    OsProcess process = new OsProcess(
      testExecutable, (Platform.getCurrent().is(WINDOWS) ? "-n" : "-c"), "3", "localhost");
    process.executeAsync();
    process.waitFor();
    assertThat(process.getExitCode()).isEqualTo(0);
  }

  @Test
  public void canDetectFailure() throws InterruptedException {
    process.executeAsync();
    process.waitFor();
    assertThat(process.getExitCode()).isNotEqualTo(0);
  }

  private static String findExecutable(String relativePath) {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      File workingDir = BazelBuild.findBinRoot(new File(".").getAbsoluteFile());
      return new File(workingDir, relativePath).getAbsolutePath();
    } else {
      return relativePath;
    }
  }
}
