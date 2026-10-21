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

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.openqa.selenium.Platform;
import org.openqa.selenium.build.BazelBuild;

class ExternalProcessTest {

  private static final String testExecutable =
      findExecutable("java/test/org/openqa/selenium/os/echo");

  @Test
  void testSetEnvironmentVariableWithNullKeyThrows() {
    ExternalProcess.Builder builder = ExternalProcess.builder().command(testExecutable);
    var environment = builder.environment();

    String key = null;
    String value = "Bar";
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> builder.environment(key, value));
    assertThat(environment).doesNotContainValue(value);
  }

  @Test
  void testSetEnvironmentVariableWithNullValueThrows() {
    ExternalProcess.Builder builder = ExternalProcess.builder().command(testExecutable);
    var environment = builder.environment();

    String key = "Foo";
    String value = null;
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> builder.environment(key, value));
    assertThat(environment).doesNotContainKey(key);
  }

  @Test
  void testSetEnvironmentVariableWithNonNullValueSets() {
    ExternalProcess.Builder builder = ExternalProcess.builder().command(testExecutable);
    var environment = builder.environment();

    String key = "Foo";
    String value = "Bar";
    builder.environment(key, value);
    assertThat(environment).containsEntry(key, value);
  }

  @Test
  void testDestroy() {
    ExternalProcess process = ExternalProcess.builder().command(testExecutable).start();
    assertThat(process.isAlive()).isTrue();
    process.shutdown();
    assertThat(process.isAlive()).isFalse();
  }

  @Test
  void canHandleOutput() throws InterruptedException {
    ExternalProcess process = ExternalProcess.builder().command(testExecutable, "ping").start();

    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
    assertThat(process.getOutput()).isNotEmpty().contains("ping");
  }

  @Test
  void canCopyOutput() throws InterruptedException {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    ExternalProcess process =
        ExternalProcess.builder()
            .command(testExecutable, "Who", "else", "likes", "cheese?")
            .copyOutputTo(buffer)
            .start();

    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
    assertThat(buffer.toByteArray()).isNotEmpty();
    assertThat(process.getOutput()).isEqualTo(buffer.toString());
  }

  @Test
  void canDetectSuccess() throws InterruptedException {
    ExternalProcess process = ExternalProcess.builder().command(testExecutable, "foo").start();

    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
    assertThat(process.exitValue()).isZero();
  }

  @Test
  void canDetectFailure() throws InterruptedException {
    ExternalProcess process = ExternalProcess.builder().command(testExecutable).start();

    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
    assertThat(process.exitValue()).isNotEqualTo(0);
  }

  @Test
  @DisabledOnOs(OS.WINDOWS)
  void waitForReturnsWhenAChildKeepsTheOutputOpen() throws InterruptedException {
    // the child inherits stdout and outlives the process, like a browser started by a driver
    ExternalProcess process =
        ExternalProcess.builder()
            .command("/bin/sh", List.of("-c", "echo parent; sleep 12 & sleep 1"))
            .start();

    long start = System.nanoTime();
    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
    Duration waited = Duration.ofNanos(System.nanoTime() - start);

    assertThat(waited).isLessThan(Duration.ofSeconds(5));
    assertThat(process.getOutput()).contains("parent");
  }

  @Test
  @DisabledOnOs(OS.WINDOWS)
  void shutdownReturnsWhenAChildKeepsTheOutputOpen() throws InterruptedException {
    ExternalProcess process =
        ExternalProcess.builder()
            .command("/bin/sh", List.of("-c", "echo parent; sleep 12 & sleep 30"))
            .start();
    // wait until the worker is reading, the stall only happens when it is blocked in a read
    long deadline = System.nanoTime() + Duration.ofSeconds(10).toNanos();
    while (!process.getOutput().contains("parent") && System.nanoTime() < deadline) {
      Thread.sleep(10);
    }

    long start = System.nanoTime();
    process.shutdown();
    Duration waited = Duration.ofNanos(System.nanoTime() - start);

    assertThat(process.isAlive()).isFalse();
    assertThat(waited).isLessThan(Duration.ofSeconds(5));
  }

  @Test
  @DisabledOnOs(OS.WINDOWS)
  void waitForKeepsWaitingWhileASlowCopyIsInProgress() throws InterruptedException {
    OutputStream slow =
        new OutputStream() {
          private boolean first = true;

          @Override
          public void write(int b) {}

          @Override
          public void write(byte[] b, int off, int len) {
            if (first) {
              first = false;
              sleep(3000);
            }
          }
        };
    String script = "echo first; sleep 12 & sleep 0.5; echo second; sleep 0.5";
    ExternalProcess process =
        ExternalProcess.builder()
            .command("/bin/sh", List.of("-c", script))
            .copyOutputTo(slow)
            .start();

    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
    assertThat(process.getOutput()).contains("first").contains("second");
  }

  @Test
  @DisabledOnOs(OS.WINDOWS)
  void outputIsStillReadWhenTheCopyFails() throws InterruptedException {
    OutputStream failing =
        new OutputStream() {
          @Override
          public void write(int b) throws IOException {
            throw new IOException("closed");
          }

          @Override
          public void write(byte[] b, int off, int len) throws IOException {
            throw new IOException("closed");
          }
        };
    // more than a pipe buffer holds, so the process blocks unless its output is read
    ExternalProcess process =
        ExternalProcess.builder()
            .command("/bin/sh", List.of("-c", "head -c 1000000 /dev/zero"))
            .copyOutputTo(failing)
            .start();

    assertThat(process.waitFor(Duration.ofSeconds(20))).isTrue();
  }

  /** Blocks like a slow stream does: an interrupt does not end it early. */
  private static void sleep(long millis) {
    long deadline = System.nanoTime() + Duration.ofMillis(millis).toNanos();
    boolean interrupted = false;
    while (System.nanoTime() < deadline) {
      try {
        Thread.sleep(Math.max(1, Duration.ofNanos(deadline - System.nanoTime()).toMillis()));
      } catch (InterruptedException e) {
        interrupted = true;
      }
    }
    if (interrupted) {
      Thread.currentThread().interrupt();
    }
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
