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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import com.google.common.collect.Maps;

import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Platform;

import java.util.Map;

@RunWith(JUnit4.class)
public class CommandLineTest {

  private static String testExecutable;

  @Before
  public void setUp() throws Exception {
    // ping can be found on every platform we support.
    testExecutable = "ping";
  }

  @Test
  public void testSetEnvironmentVariableWithNullKeyThrows() {
    String key = null;
    String value = "Bar";
    CommandLine commandLine = new CommandLine(testExecutable);
    try {
      commandLine.setEnvironmentVariable(key, value);
    } catch (IllegalArgumentException iae) {
      assertFalse(commandLine.getEnvironment()
                      .containsValue(value));
    }
  }

  @Test
  public void testSetEnvironmentVariableWithNullValueThrows() {
    String key = "Foo";
    String value = null;
    CommandLine commandLine = new CommandLine(testExecutable);
    try {
      commandLine.setEnvironmentVariable(key, value);
    } catch (IllegalArgumentException iae) {
      assertFalse(commandLine.getEnvironment()
                      .containsKey(key));
    }
  }

  @Test
  public void testSetEnvironmentVariableWithNonNullValueSets() {
    String key = "Foo";
    String value = "Bar";
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.setEnvironmentVariable(key, value);
    assertEquals(value,
                 commandLine.getEnvironment().get(key));
  }

  @Test
  public void testSetEnvironmentVariablesWithNullValueThrows() {
    Map<String, String> input = Maps.newHashMap();
    input.put("key1", "value1");
    input.put("key2", null);
    CommandLine commandLine = new CommandLine(testExecutable);
    try {
      commandLine.setEnvironmentVariables(input);
    } catch (IllegalArgumentException iae) {
      assertFalse(commandLine.getEnvironment()
                      .containsKey("key2"));
    }
  }

  @Test
  public void testSetEnvironmentVariablesWithNonNullValueSetsAll() {
    Map<String, String> input = Maps.newHashMap();
    input.put("key1", "value1");
    input.put("key2", "value2");
    CommandLine commandLine = new CommandLine(testExecutable);
    commandLine.setEnvironmentVariables(input);
    assertEquals("value1",
                 commandLine.getEnvironment().get("key1"));
    assertEquals("value2",
                 commandLine.getEnvironment().get("key2"));
  }

  @Test
  public void testSetDynamicLibraryPathWithNullValueIgnores() {
    String value = null;
    CommandLine commandLine = new CommandLine(testExecutable);
    try {
      commandLine.setDynamicLibraryPath(value);
    } catch (IllegalArgumentException iae) {
      assertFalse(commandLine.getEnvironment()
                      .containsKey(CommandLine.getLibraryPathPropertyName()));
    }
  }

  @Test
  public void testSetDynamicLibraryPathWithNonNullValueSets() {
    String value = "Bar";
    CommandLine commandLine = new CommandLine(testExecutable);
    try {
      commandLine.setDynamicLibraryPath(value);
    } catch (IllegalArgumentException iae) {
      assertEquals(value,
                   commandLine.getEnvironment()
                       .get(CommandLine.getLibraryPathPropertyName()));
    }
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
    assertEquals(String.format("%s;%s", System.getenv("PATH"), "C:\\My\\Tools"),
                 commandLine.getEnvironment().get(CommandLine.getLibraryPathPropertyName()));
  }
}
