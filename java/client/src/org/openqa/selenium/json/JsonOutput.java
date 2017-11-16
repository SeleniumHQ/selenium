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

package org.openqa.selenium.json;

import com.google.gson.stream.JsonWriter;

import java.io.Closeable;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;

public class JsonOutput implements Closeable {
  private final JsonWriter jsonWriter;
  private final BeanToJsonConverter toJson;

  JsonOutput(BeanToJsonConverter toJson, JsonWriter jsonWriter) {
    this.jsonWriter = jsonWriter;
    this.jsonWriter.setIndent("  ");
    this.toJson = toJson;
  }

  @Override
  public void close() throws IOException {
    jsonWriter.close();
  }

  public JsonOutput write(JsonInput input, Type type) {
    try {
      Object read = input.read(type);
      jsonWriter.jsonValue(toJson.convert(read));
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonOutput write(Object input, Type type) {
    try {
      jsonWriter.jsonValue(toJson.convert(input));
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonOutput beginObject() {
    try {
      jsonWriter.beginObject();
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonOutput endObject() {
    try {
      jsonWriter.endObject();
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonOutput name(String name) {
    try {
      jsonWriter.name(name);
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonOutput beginArray() {
    try {
      jsonWriter.beginArray();
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonOutput endArray() {
    try {
      jsonWriter.endArray();
      return this;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
