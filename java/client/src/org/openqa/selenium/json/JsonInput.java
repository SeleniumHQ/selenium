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
import java.io.Reader;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.Objects;
import java.util.concurrent.Callable;

public class JsonInput implements Closeable {
  private final JsonReader jsonReader;
  private volatile boolean readPerformed = false;
  private volatile JsonTypeCoercer coercer;
  private volatile PropertySetting setter;

  JsonInput(Reader reader, JsonTypeCoercer coercer) {
    this.jsonReader = Json.GSON.newJsonReader(reader);
    this.coercer = coercer;
    this.setter = PropertySetting.BY_NAME;
  }

  public JsonInput propertySetting(PropertySetting setter) {
    if (readPerformed) {
      throw new JsonException("JsonInput has already been used and may not be modified");
    }
    this.setter = Objects.requireNonNull(setter);
    return this;
  }

  public JsonInput addCoercers(TypeCoercer<?>... coercers) {
    return addCoercers(Arrays.asList(coercers));
  }

  public JsonInput addCoercers(Iterable<TypeCoercer<?>> coercers) {
    synchronized (this) {
      if (readPerformed) {
        throw new JsonException("JsonInput has already been used and may not be modified");
      }

      this.coercer = new JsonTypeCoercer(coercer, coercers);
    }

    return this;
  }

  @Override
  public void close() {
    execute((VoidCallable) jsonReader::close);
  }

  public JsonType peek() {
    return execute(() -> {
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
    });
  }

  public void beginObject() {
    execute((VoidCallable) jsonReader::beginObject);
  }

  public void endObject() {
    execute((VoidCallable) jsonReader::endObject);
  }

  public void beginArray() {
    execute((VoidCallable) jsonReader::beginArray);
  }

  public void endArray() {
    execute((VoidCallable) jsonReader::endArray);
  }

  public boolean hasNext() {
    return execute(jsonReader::hasNext);
  }

  public Boolean nextBoolean() {
    return execute(jsonReader::nextBoolean);
  }

  public String nextName() {
    return execute(jsonReader::nextName);
  }

  public Number nextNumber() {
    return execute(
        () -> {
          if (jsonReader.peek() != JsonToken.NUMBER) {
            throw new JsonException("Expected number but was: " + peek());
          }

          String raw = jsonReader.nextString();
          if (raw.contains(".")) {
            return Double.parseDouble(raw);
          }
          return Long.parseLong(raw);
        });
  }

  public String nextString() {
    return execute(
        () -> {
          if (jsonReader.peek() == JsonToken.NULL) {
            jsonReader.nextNull();
            return null;
          }

          return jsonReader.nextString();
        });
  }

  public <T> T read(Type type) {
    return coercer.coerce(this, type, setter);
  }

  public void skipValue() {
    execute((VoidCallable) jsonReader::skipValue);
  }

  private <T> T execute(Callable<T> callable) {
    readPerformed = true;
    try {
      return callable.call();
    } catch (Exception e) {
      throw new JsonException(e);
    }
  }

  private interface VoidCallable extends Callable<Void> {
    void execute() throws Exception;

    @Override
    default Void call() throws Exception {
      execute();
      return null;
    }
  }
}
