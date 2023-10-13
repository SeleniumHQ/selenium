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

package org.openqa.selenium.bidi.log;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonInputFactory;
import org.openqa.selenium.testing.JupiterTestBase;

public class LogEntryUtilsTest extends JupiterTestBase {

  @Test
  public void testFromJsonForGenericLogEntry() {
    String json = "{ \"level\": \"info\", \"text\": \"Test\", \"timestamp\": 12345 }";
    JsonInput input = JsonInputFactory.createJsonInput(json); // Utiliza JsonInputFactory

    GenericLogEntry entry =
        (GenericLogEntry) LogEntryUtils.fromJson("GenericLogEntry", input, "defaultType");

    assertEquals("info", entry.getLevel().toString());
    assertEquals("Test", entry.getText());
    assertEquals(12345, entry.getTimestamp());
    assertEquals("defaultType", entry.getType());
  }

  @Test
  public void testFromJsonForJavascriptLogEntry() {
    String json = "{ \"level\": \"info\", \"text\": \"Test JS\", \"timestamp\": 67890 }";
    JsonInput input = JsonInputFactory.createJsonInput(json); // Utiliza JsonInputFactory

    JavascriptLogEntry entry =
        (JavascriptLogEntry) LogEntryUtils.fromJson("JavascriptLogEntry", input, "javascript");

    assertEquals("info", entry.getLevel().toString());
    assertEquals("Test JS", entry.getText());
    assertEquals(67890, entry.getTimestamp());
    assertEquals("javascript", entry.getType());
  }

  @Test
  public void testFromJsonForUnknownType() {
    String json = "{ \"level\": \"INFO\", \"text\": \"Test\", \"timestamp\": 12345 }";
    JsonInput input = JsonInputFactory.createJsonInput(json); // Utiliza JsonInputFactory

    try {
      LogEntryUtils.fromJson("UnknownType", input, "defaultType");
    } catch (IllegalArgumentException e) {
      assertTrue(e.getMessage().contains("Unknown name: UnknownType"));
    }
  }
}
