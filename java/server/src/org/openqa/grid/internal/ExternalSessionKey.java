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

package org.openqa.grid.internal;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.openqa.grid.internal.exception.NewSessionException;

public class ExternalSessionKey {

  private final String key;

  public ExternalSessionKey(String key) {
    this.key = key;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    ExternalSessionKey that = (ExternalSessionKey) o;

    return key.equals(that.key);

  }

  public String getKey() {
    return key;
  }

  @Override
  public String toString() {
    return getKey();
  }

  @Override
  public int hashCode() {
    return key.hashCode();
  }

  public static ExternalSessionKey fromSe1Request(String piece) {
    if (piece.startsWith("sessionId=")) {
      return new ExternalSessionKey(piece.replace("sessionId=", ""));
    }
    return null;
  }

  /**
   * extract the session xxx from http://host:port/a/b/c/session/xxx/...
   *
   * @param path The path to the session
   * @return the ExternalSessionKey provided by the remote., or null if the url didn't contain a session id
   */
  public static ExternalSessionKey fromWebDriverRequest(String path) {
      int sessionIndex = path.indexOf("/session/");
      if (sessionIndex != -1) {
        sessionIndex += "/session/".length();
        int nextSlash = path.indexOf("/", sessionIndex);
        String session;
        if (nextSlash != -1) {
          session = path.substring(sessionIndex, nextSlash);
        } else {
          session = path.substring(sessionIndex, path.length());
        }
        if ("".equals(session)) {
          return null;
        }
        return new ExternalSessionKey(session);
      }
      return null;
  }

  /**
   * Extract the external key from the server response for a selenium2 new session request.
   * The response body is expected to be of the form {"status":0,"sessionId":"XXXX",...}.
   * @param responseBody the response body to parse
   * @return the extracted ExternalKey, or null if one was not found.
   */
  public static ExternalSessionKey fromJsonResponseBody(String responseBody) {
    try {
      JsonObject json = new JsonParser().parse(responseBody).getAsJsonObject();
      if (!json.has("sessionId") || json.get("sessionId").isJsonNull()) {
        return null;
      }
      return new ExternalSessionKey(json.get("sessionId").getAsString());
    } catch (JsonSyntaxException e) {
      return null;
    }
  }

  /**
   * extract the external key from the server response for a selenium1 new session request.
   * @param responseBody the response from the server
   * @return the ExternalKey if it was present in the server's response.
   * @throws NewSessionException in case the server didn't send back a success result.
   */
  public static ExternalSessionKey fromResponseBody(String responseBody) throws NewSessionException {
    if (responseBody != null && responseBody.startsWith("OK,")) {
      return new ExternalSessionKey(responseBody.replace("OK,", ""));
    }
    throw new NewSessionException("The server returned an error : "+responseBody);
  }

  public static ExternalSessionKey fromString(String keyString) {
    return new ExternalSessionKey(keyString);
  }

  public static ExternalSessionKey fromJSON(String keyString) {
    return new ExternalSessionKey(keyString);
  }

}
