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

package org.openqa.selenium.bidi;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;

@Beta
public class ConverterFunctions {

  private static final Json JSON = new Json();

  private ConverterFunctions() {
    throw new IllegalStateException("Utility class");
  }

  /**
   * Build a {@link Command} result mapper for the common case where the useful value is a single
   * field of the response's {@code result} object.
   *
   * <p>The returned function is applied to a command's {@code result} value, which {@link
   * org.openqa.selenium.bidi.Connection} has already parsed into a {@code Map<String, Object>}. It
   * reads {@code keyName} from that map and deserializes it to {@code typeOfX} via {@link
   * Json#convert(Object, Type)}, without re-parsing any JSON text. Both the {@code result} and the
   * field are required: a missing {@code result} or a {@code null}/absent field is an error.
   *
   * @param keyName the field to read from the command's {@code result} object
   * @param typeOfX the type to deserialize that field to (class or {@link
   *     org.openqa.selenium.json.TypeToken})
   */
  public static <X> Function<@Nullable Object, X> map(String keyName, Type typeOfX) {
    Require.nonNull("Key name", keyName);
    Require.nonNull("Type to convert to", typeOfX);

    return result -> {
      Object value = ((Map<?, ?>) Require.nonNull("Command result", result)).get(keyName);
      return Require.nonNull("Field '" + keyName + "'", JSON.convert(value, typeOfX));
    };
  }
}
