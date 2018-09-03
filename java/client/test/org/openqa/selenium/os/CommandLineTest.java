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

import static java.lang.System.getenv;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.os.CommandLine.getLibraryPathPropertyName;

import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Platform;

import java.util.HashMap;
import java.util.Map;

public class CommandLineTest {

  private static String testExecutable;

  @Before
  public void setUp() {
    // ping can be found on every platform we support.
    testExecutable = "ping";
  }

  @Test
  public void testSetEnvironmentVariableWithNullKeyThrows() {
    String key = null;
    String value = "Bar";
    CommandLine commandLine = new CommandLine(testExecutable);
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> commandLine.setEnvironmentVariable(key, value));
    assertThat(commandLine.getEnvironment()).doesNotContainValue(value);
  }

  @Test
  public void testSetEnvironmentVariableWithNullValueThrows() {
    String key = "Foo";
    String value = null;
    CommandLine commandLine = new CommandLine(testExecutable);
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> commandLine.setEnvironmentVariable(key, value));
    assertThat(commandLine.getEnvironment()).doesNotContainKey(key);
  }

  @Test
  public void testSetEnvironmentVariableWithNonNullValueSets() {
    String key = "Foo";
    String value = "Bar";
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.setEnvironmentVariable(key, value);
    assertThat(commandLine.getEnvironment()).containsEntry(key, value);
  }

  @Test
  public void testSetEnvironmentVariablesWithNullValueThrows() {
    Map<String, String> input = new HashMap<>();
    input.put("key1", "value1");
    input.put("key2", null);
    CommandLine commandLine = new CommandLine(testExecutable);
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> commandLine.setEnvironmentVariables(input));
    assertThat(commandLine.getEnvironment()).doesNotContainKey("key2");
  }

  @Test
  public void testSetEnvironmentVariablesWithNonNullValueSetsAll() {
    Map<String, String> input = new HashMap<>();
    input.put("key1", "value1");
    input.put("key2", "value2");
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.setEnvironmentVariables(input);
    assertThat(commandLine.getEnvironment())
        .containsEntry("key1", "value1")
        .containsEntry("key2", "value2");
  }

  @Test
  public void testSetDynamicLibraryPathWithNullValueIgnores() {
    String value = null;
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.setDynamicLibraryPath(value);
    assertThat(commandLine.getEnvironment()).doesNotContainKey(getLibraryPathPropertyName());
  }

  @Test
  public void testSetDynamicLibraryPathWithNonNullValueSets() {
    String value = "Bar";
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.setDynamicLibraryPath(value);
    assertThat(commandLine.getEnvironment().get(getLibraryPathPropertyName())).isEqualTo(value);
  }

  @Test
  public void testDestroy() {
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.executeAsync();
    commandLine.destroy();
  }

  @Test
  public void canUpdateLibraryPath() {
    Assume.assumeTrue(Platform.getCurrent().is(Platform.WINDOWS));
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.updateDynamicLibraryPath("C:\\My\\Tools");
    assertThat(commandLine.getEnvironment())
        .containsEntry(getLibraryPathPropertyName(),
                       String.format("%s;%s", getenv("PATH"), "C:\\My\\Tools"));
  }
}
