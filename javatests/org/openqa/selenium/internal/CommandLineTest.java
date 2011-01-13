/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.internal;

import java.util.HashMap;
import java.util.Map;
import junit.framework.TestCase;

import org.junit.Test;

public class CommandLineTest extends TestCase {

  @Test
  public void testSetEnvironmentVariableWithNullKeyThrows() {
    String key = null;
    String value = "Bar";
    CommandLine commandLine = new CommandLine(new String[]{});
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
    CommandLine commandLine = new CommandLine(new String[]{});
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
    CommandLine commandLine = new CommandLine(new String[]{});
    commandLine.setEnvironmentVariable(key, value);
    assertEquals(value,
        commandLine.getEnvironment().get(key));
  }

  @Test
  public void testSetEnvironmentVariablesWithNullValueThrows() {
    Map<String, String> input = new HashMap();
    input.put("key1", "value1");
    input.put("key2", null);
    CommandLine commandLine = new CommandLine(new String[]{});
    try {
      commandLine.setEnvironmentVariables(input);
    } catch (IllegalArgumentException iae) {
      assertFalse(commandLine.getEnvironment()
          .containsKey("key2"));
    }
  }

  @Test
  public void testSetEnvironmentVariablesWithNonNullValueSetsAll() {
    Map<String, String> input = new HashMap();
    input.put("key1", "value1");
    input.put("key2", "value2");
    CommandLine commandLine = new CommandLine(new String[]{});
    commandLine.setEnvironmentVariables(input);
    assertEquals("value1",
        commandLine.getEnvironment().get("key1"));
    assertEquals("value2",
        commandLine.getEnvironment().get("key2"));
  }

  @Test
  public void testSetDynamicLibraryPathWithNullValueIgnores() {
    String value = null;
    CommandLine commandLine = new CommandLine(new String[]{});
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
    CommandLine commandLine = new CommandLine(new String[]{});
    try {
      commandLine.setDynamicLibraryPath(value);
    } catch (IllegalArgumentException iae) {
      assertEquals(value,
          commandLine.getEnvironment()
              .get(CommandLine.getLibraryPathPropertyName()));
    }
  }

}
