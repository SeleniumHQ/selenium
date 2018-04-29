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

import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;

import java.io.Closeable;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;

public class JsonInput implements Closeable {
  private final JsonReader jsonReader;
  private final JsonTypeCoercer coercer;

  JsonInput(JsonReader jsonReader, JsonTypeCoercer coercer) {
    this.jsonReader = jsonReader;
    this.coercer = coercer;
  }

  @Override
  public void close() {
    try {
      jsonReader.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonType peek() {
    try {
      JsonToken token = jsonReader.peek();
      switch (token) {
        case BEGIN_ARRAY:
          return JsonType.START_COLLECTION;

        case BEGIN_OBJECT:
          return JsonType.START_MAP;

        case BOOLEAN:
          return JsonType.BOOLEAN;

        case NAME:
          return JsonType.NAME;

        case NULL:
          return JsonType.NULL;

        case NUMBER:
          return JsonType.NUMBER;

        case STRING:
          return JsonType.STRING;

        default:
          throw new JsonException("Unrecognized underlying type: " + token);
      }
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

  public Boolean nextBoolean() {
    try {
      return jsonReader.nextBoolean();
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

  public Number nextNumber() {
    try {
      if (jsonReader.peek() != JsonToken.NUMBER) {
        throw new JsonException("Expected number but was: " + peek());
      }

      String raw = jsonReader.nextString();
      if (raw.contains(".")) {
        return Double.parseDouble(raw);
      }
      return Long.parseLong(raw);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public String nextString() {
    try {
      if (jsonReader.peek() == JsonToken.NULL) {
        jsonReader.nextNull();
        return null;
      }

      return jsonReader.nextString();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

  }

  public <T> T read(Type type) {
    return coercer.coerce(this, type, PropertySetting.BY_NAME);
  }

  public void skipValue() {
    try {
      jsonReader.skipValue();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
