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

package org.openqa.selenium.remote.server.xdrpc;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.Charset;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

/**
 * Loads a {@link CrossDomainRpc} from a {@link HttpServletRequest}.
 */
public class CrossDomainRpcLoader {

  private final Json json = new Json();

  /**
   * Parses the request for a CrossDomainRpc.
   *
   * @param request The request to parse.
   * @return The parsed RPC.
   * @throws IOException If an error occurs reading from the request.
   * @throws IllegalArgumentException If an occurs while parsing the request
   *     data.
   */
  public CrossDomainRpc loadRpc(HttpServletRequest request) throws IOException {
    Charset encoding;
    try {
      String enc = request.getCharacterEncoding();
      encoding = Charset.forName(enc);
    } catch (IllegalArgumentException | NullPointerException e) {
      encoding = UTF_8;
    }

    // We tend to look at the input stream, rather than the reader.
    try (InputStream in = request.getInputStream();
        Reader reader = new InputStreamReader(in, encoding);
        JsonInput jsonInput = json.newInput(reader)) {
      Map<String, Object> read = jsonInput.read(MAP_TYPE);

      return new CrossDomainRpc(
          getField(read, Field.METHOD),
          getField(read, Field.PATH),
          getField(read, Field.DATA));
    } catch (JsonException e) {
      throw new IllegalArgumentException(
          "Failed to parse JSON request: " + e.getMessage(), e);
    }
  }

  private String getField(Map<String, Object> json, String key) {
    if (json.get(key) == null) {
      throw new IllegalArgumentException("Missing required parameter: " + key);
    }

    if (json.get(key) instanceof String) {
      return json.get(key).toString();
    }

    return this.json.toJson(json.get(key));
  }

  /**
   * Fields used to encode a {@link CrossDomainRpc} in the JSON body of a
   * {@link HttpServletRequest}.
   */
  private static class Field {
    private Field() {}  // Utility class.

    public static final String METHOD = "method";
    public static final String PATH = "path";
    public static final String DATA = "data";
  }
}
