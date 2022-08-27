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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.build.BazelBuild;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import static java.lang.System.getenv;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.os.CommandLine.getLibraryPathPropertyName;
import static org.openqa.selenium.testing.TestUtilities.isOnTravis;

public class CommandLineTest {

  // ping can be found on every platform we support.
  private final static String testExecutable = findExecutable(
    "java/test/org/openqa/selenium/os/echo");

  private final CommandLine commandLine = new CommandLine(testExecutable);
  private final OsProcess process = spyProcess(commandLine);

  @Test
  public void testSetEnvironmentVariableDelegatesToProcess() {
    String key = "foo";
    String value = "bar";
    commandLine.setEnvironmentVariable(key, value);
    verify(process).setEnvironmentVariable(key, value);
    verifyNoMoreInteractions(process);
  }

  @Test
  public void testSetEnvironmentVariablesDelegatesToProcess() {
    Map<String, String> env = new HashMap<>();
    env.put("k1", "v1");
    env.put("k2", "v2");
    commandLine.setEnvironmentVariables(env);
    verify(process).setEnvironmentVariable("k1", "v1");
    verify(process).setEnvironmentVariable("k2", "v2");
    verifyNoMoreInteractions(process);
  }

  @Test
  public void testSetDynamicLibraryPathWithNullValueIgnores() {
    commandLine.setDynamicLibraryPath(null);
    verifyNoInteractions(process);
  }

  @Test
  public void testSetDynamicLibraryPathWithNonNullValueSets() {
    String value = "Bar";
    commandLine.setDynamicLibraryPath(value);
    verify(process).setEnvironmentVariable(getLibraryPathPropertyName(), value);
    verifyNoMoreInteractions(process);
  }

  @Test
  public void executeWaitsForProcessFinish() throws InterruptedException {
    commandLine.execute();
    verify(process).executeAsync();
    verify(process).waitFor();
    verifyNoMoreInteractions(process);
  }

  @Test
  public void testDestroy() {
    commandLine.executeAsync();
    verify(process).executeAsync();
    assertThat(commandLine.isRunning()).isTrue();
    verify(process).isRunning();
    commandLine.destroy();
    verify(process).destroy();
    assertThat(commandLine.isRunning()).isFalse();
    verify(process, atLeastOnce()).isRunning();
  }

  @Test
  public void canHandleOutput() {
    CommandLine commandLine = new CommandLine(testExecutable, "ping");
    commandLine.execute();
    assertThat(commandLine.getStdOut()).isNotEmpty().contains("ping");
  }

  @Test
  public void canCopyOutput() {
    CommandLine commandLine = new CommandLine(testExecutable, "I", "love", "cheese");

    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    commandLine.copyOutputTo(buffer);
    commandLine.execute();
    assertThat(buffer.toByteArray()).isNotEmpty();
    assertThat(commandLine.getStdOut()).isEqualTo(buffer.toString());
  }

  @Test
  public void canDetectSuccess() {
    assumeThat(isOnTravis()).as("Operation not permitted on travis").isFalse();
    CommandLine commandLine = new CommandLine(
      testExecutable, (Platform.getCurrent().is(WINDOWS) ? "-n" : "-c"), "3", "localhost");
    commandLine.execute();
    assertThat(commandLine.getExitCode()).isEqualTo(0);
    assertThat(commandLine.isSuccessful()).isTrue();
  }

  @Test
  public void canDetectFailure() {
    commandLine.execute();
    assertThat(commandLine.getExitCode()).isNotEqualTo(0);
    assertThat(commandLine.isSuccessful()).isFalse();
  }

  @Test
  public void canUpdateLibraryPath() {
    assumeTrue(Platform.getCurrent().is(WINDOWS));
    commandLine.updateDynamicLibraryPath("C:\\My\\Tools");
    verify(process).setEnvironmentVariable(
      getLibraryPathPropertyName(), String.format("%s;%s", getenv("PATH"), "C:\\My\\Tools"));
  }

  private OsProcess spyProcess(CommandLine commandLine) {
    try {
      Field processField = CommandLine.class.getDeclaredField("process");
      processField.setAccessible(true);
      OsProcess process = (OsProcess) processField.get(commandLine);
      OsProcess spyProcess = spy(process);
      processField.set(commandLine, spyProcess);
      return spyProcess;
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
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
