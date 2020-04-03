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

package org.openqa.selenium.docker.v1_40;

import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Map;
import java.util.Objects;
import java.util.logging.Logger;

import static org.openqa.selenium.json.Json.MAP_TYPE;

class DockerMessages {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(DockerMessages.class.getName());

  private DockerMessages() {
    // Utility method
  }

  public static HttpResponse throwIfNecessary(HttpResponse response, String message, Object... args) {
    Objects.requireNonNull(response);

    if (response.isSuccessful()) {
      return response;
    }

    String userMessage = String.format(message, args);
    String exceptionMessage;

    try {
      Map<String, Object> value = JSON.toType(Contents.string(response), MAP_TYPE);
      message = (String) value.get("message");
      exceptionMessage = userMessage + "\n" + message;
    } catch (Exception e) {
      exceptionMessage = userMessage;
    }

    LOG.warning(exceptionMessage);
    throw new DockerException(exceptionMessage);
  }
}
