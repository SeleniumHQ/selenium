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

package org.openqa.selenium.devtools;

import java.lang.reflect.Type;
import java.util.function.Function;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class ConverterFunctions {

  public static <X> Function<JsonInput, X> map(final String keyName, Type typeOfX) {
    Require.nonNull("Key name", keyName);
    Require.nonNull("Type to convert to", typeOfX);

    return map(keyName, input -> input.read(typeOfX));
  }

  public static <X> Function<JsonInput, X> map(final String keyName, Function<JsonInput, X> read) {
    Require.nonNull("Key name", keyName);
    Require.nonNull("Read callback", read);

    return input -> {
      X value = null;

      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if (keyName.equals(name)) {
          value = read.apply(input);
        } else {
          input.skipValue();
        }
      }
      input.endObject();

      return value;
    };
  }

  public static Function<JsonInput, Void> empty() {
    return input -> {
      // expects an empty object
      input.beginObject();
      input.endObject();

      return null;
    };
  }
}
