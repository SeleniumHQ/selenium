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
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.TypeAdapter;
import com.google.gson.TypeAdapterFactory;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

public class Json {
  final static Gson GSON = new GsonBuilder()
      .registerTypeAdapterFactory(ListAdapter.FACTORY)
      .registerTypeAdapterFactory(MapAdapter.FACTORY)
      .setLenient()
      .serializeNulls()
      .create();

  public static final Type MAP_TYPE = new TypeToken<Map<String, Object>>() {}.getType();
  public static final Type OBJECT_TYPE = new TypeToken<Object>() {}.getType();

  private final JsonToBeanConverter toBean = new JsonToBeanConverter();
  private final BeanToJsonConverter toJson = new BeanToJsonConverter();

  public String toJson(Object toConvert) {
    return toJson.convert(toConvert);
  }

  public <T> T toType(Object source, Class<T> typeOfT) {
    return toBean.convert(typeOfT, source);
  }

  public <T> T toType(Object source, Type typeOfT) {
    Class<?> type;
    if (typeOfT instanceof ParameterizedType) {
      type = (Class<?>) ((ParameterizedType) typeOfT).getRawType();
    } else if (typeOfT instanceof Class) {
      type = (Class<?>) typeOfT;
    } else {
      throw new IllegalArgumentException("Unable to convert type: " + typeOfT);
    }
    return (T) toBean.convert(type, source);
  }

  private static Object readValue(JsonReader in, Gson gson) throws IOException {
    switch (in.peek()) {
      case BEGIN_ARRAY:
      case BEGIN_OBJECT:
      case BOOLEAN:
      case NULL:
      case STRING:
        return gson.fromJson(in, Object.class);

      case NUMBER:
        String number = in.nextString();
        if (number.indexOf('.') != -1) {
          return Double.parseDouble(number);
        }
        return Long.parseLong(number);

      default:
        throw new JsonParseException("Unexpected type: " + in.peek());
    }
  }

  public JsonInput newInput(Reader from) throws UncheckedIOException {
    return new JsonInput(GSON, GSON.newJsonReader(from));
  }

  public JsonOutput newOutput(Writer to) throws UncheckedIOException {
    try {
      return new JsonOutput(toJson, GSON.newJsonWriter(to));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static class MapAdapter extends TypeAdapter<Map<?, ?>> {

    private final static TypeAdapterFactory FACTORY = new TypeAdapterFactory() {
      @SuppressWarnings("unchecked")
      @Override
      public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
        if (type.getRawType() == Map.class) {
          return (TypeAdapter<T>) new MapAdapter(gson);
        }
        return null;
      }
    };

    private final Gson gson;

    private MapAdapter(Gson gson) {
      this.gson = Objects.requireNonNull(gson);
    }

    @Override
    public Map<?, ?> read(JsonReader in) throws IOException {
      if (in.peek() == JsonToken.NULL) {
        in.nextNull();
        return null;
      }

      Map<String, Object> map = new TreeMap<>();
      in.beginObject();

      while (in.hasNext()) {
        String key = in.nextName();
        Object value = readValue(in, gson);

        map.put(key, value);
      }

      in.endObject();
      return map;
    }

    @Override
    public void write(JsonWriter out, Map<?, ?> value) throws IOException {
      // It's fine to use GSON's own default writer for this.
      out.beginObject();
      for (Map.Entry<?, ?> entry : value.entrySet()) {
        out.name(String.valueOf(entry.getKey()));
        @SuppressWarnings("unchecked")
        TypeAdapter<Object>
            adapter =
            (TypeAdapter<Object>) gson.getAdapter(entry.getValue().getClass());
        adapter.write(out, entry.getValue());
      }
      out.endObject();
    }
  }

  private static class ListAdapter extends TypeAdapter<List<?>> {

    private final static TypeAdapterFactory FACTORY = new TypeAdapterFactory() {
      @SuppressWarnings("unchecked")
      @Override
      public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
        if (type.getRawType() == List.class) {
          return (TypeAdapter<T>) new ListAdapter(gson);
        }
        return null;
      }
    };

    private final Gson gson;

    private ListAdapter(Gson gson) {
      this.gson = Objects.requireNonNull(gson);
    }

    @Override
    public List<?> read(JsonReader in) throws IOException {
      if (in.peek() == JsonToken.NULL) {
        in.nextNull();
        return null;
      }

      List<Object> list = new LinkedList<>();
      in.beginArray();

      while (in.hasNext()) {
        list.add(readValue(in, gson));
      }

      in.endArray();
      return list;
    }

    @Override
    public void write(JsonWriter out, List<?> value) throws IOException {
      out.beginArray();
      for (Object entry : value) {
        @SuppressWarnings("unchecked")
        TypeAdapter<Object> adapter = (TypeAdapter<Object>) gson.getAdapter(entry.getClass());
        adapter.write(out, entry);
      }
      out.endArray();
    }
  }
}
