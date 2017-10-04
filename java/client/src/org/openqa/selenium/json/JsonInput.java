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

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;

import java.io.Closeable;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;

public class JsonInput implements Closeable {
  private final Gson gson;
  private final JsonReader jsonReader;

  JsonInput(Gson gson, JsonReader jsonReader) {
    this.gson = gson;
    this.jsonReader = jsonReader;
  }

  @Override
  public void close() {
    try {
      jsonReader.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public void beginObject() {
    try {
    jsonReader.beginObject();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public void endObject() {
    try {
    jsonReader.endObject();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public void beginArray() {
    try {
    jsonReader.beginArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public void endArray() {
    try {
      jsonReader.endArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public boolean hasNext() {
    try {
      return jsonReader.hasNext();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public String nextName() {
    try {
      return jsonReader.nextName();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public <T> T read(Type type) {
    return gson.fromJson(jsonReader, type);
  }

  public void skipValue() {
    try {
      jsonReader.skipValue();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
