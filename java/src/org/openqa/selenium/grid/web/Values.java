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

import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.json.JsonType.END;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.http.Contents.string;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.ErrorCodec;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;

public class Values {

  private static final Json JSON = new Json();
  private static final ErrorCodec ERRORS = ErrorCodec.createDefault();

  public static <T> T get(HttpResponse response, Type typeOfT) {
    try (Reader reader = reader(response);
         JsonInput input = JSON.newInput(reader)) {

      // Alright then. We might be dealing with the object we expected, or we might have an
      // error. We shall assume that a non-200 http status code indicates that something is
      // wrong.
      if (response.getStatus() != 200) {
        throw ERRORS.decode(JSON.toType(string(response), MAP_TYPE));
      }

      if (Void.class.equals(typeOfT) && input.peek() == END) {
        return null;
      }

      input.beginObject();

      while (input.hasNext()) {
        if ("value".equals(input.nextName())) {
          return input.read(typeOfT);
        } else {
          input.skipValue();
        }
      }

      throw new IllegalStateException("Unable to locate value: " + string(response));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
