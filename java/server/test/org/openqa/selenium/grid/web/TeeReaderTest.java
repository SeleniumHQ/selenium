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

package org.openqa.selenium.grid.web;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;


public class TeeReaderTest {

  @Test
  public void shouldDuplicateStreams() {
    String expected = "{\"key\": \"value\"}";
    Reader source = new StringReader(expected);

    StringWriter writer = new StringWriter();

    Reader tee = new TeeReader(source, writer);

    try (JsonInput reader = new Json().newInput(tee)) {

      reader.beginObject();
      assertEquals("key", reader.nextName());
      reader.skipValue();
      reader.endObject();

      assertEquals(expected, writer.toString());
    }
  }
}