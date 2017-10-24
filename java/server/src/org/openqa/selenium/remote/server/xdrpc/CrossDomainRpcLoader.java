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

import com.google.common.base.Charsets;
import com.google.common.io.ByteStreams;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;

/**
 * Loads a {@link CrossDomainRpc} from a {@link HttpServletRequest}.
 */
public class CrossDomainRpcLoader {

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
    JsonObject json;
    InputStream stream = null;
    try {
      stream = request.getInputStream();
      byte[] data = ByteStreams.toByteArray(stream);
      json = new JsonParser().parse(new String(data, Charsets.UTF_8)).getAsJsonObject();
    } catch (JsonSyntaxException e) {
      throw new IllegalArgumentException(
          "Failed to parse JSON request: " + e.getMessage(), e);
    } finally {
      if (stream != null) {
        stream.close();
      }
    }

    return new CrossDomainRpc(
        getField(json, Field.METHOD),
        getField(json, Field.PATH),
        getField(json, Field.DATA));
  }

  private String getField(JsonObject json, String key) {
    if (!json.has(key) || json.get(key).isJsonNull()) {
      throw new IllegalArgumentException("Missing required parameter: " + key);
    }

    if (json.get(key).isJsonPrimitive() && json.get(key).getAsJsonPrimitive().isString()) {
      return json.get(key).getAsString();
    }
    return json.get(key).toString();
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
