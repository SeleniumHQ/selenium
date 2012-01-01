/*
 Copyright 2011 Software Freedom Conservancy.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

package org.openqa.selenium.remote.server.xdrpc;

import com.google.common.io.CharStreams;

import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

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
    JSONObject json;
    try {
      json = new JSONObject(CharStreams.toString(request.getReader()));
    } catch (JSONException e) {
      throw new IllegalArgumentException(
          "Failed to parse JSON request: " + e.getMessage(), e);
    }

    return new CrossDomainRpc(
        getField(json, Field.METHOD),
        getField(json, Field.PATH),
        getField(json, Field.DATA));
  }

  private String getField(JSONObject json, String key) {
    if (!json.has(key) || json.isNull(key)) {
      throw new IllegalArgumentException("Missing required parameter: " + key);
    }

    try {
      return json.get(key).toString();
    } catch (JSONException e) {
      throw new IllegalArgumentException(key + " is not a string", e);
    }
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
