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

package org.openqa.selenium.remote.server.scheduler;

import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.net.MediaType;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Map;

public class WebDriverStatusHealthCheck implements HealthCheck {

  private final Json json;
  private final HttpClient client;
  private volatile boolean lastStatus;

  public WebDriverStatusHealthCheck(HttpClient client) {
    this.client = client;
    this.lastStatus = false;
    this.json = new Json();
  }

  @Override
  public Result check() {
    HttpRequest request = new HttpRequest(HttpMethod.GET, "/status");

    Result toReturn = new Result(false, "Unable to determine status");

    try {
      HttpResponse response = client.execute(request);

      if (response.getStatus() == 200) {
        // Assume the response is valid JSON
        Map<String, Object> result = json.toType(response.getContentString(), MAP_TYPE);

        if (result.get("value") instanceof Map) {
          Map<?, ?> value = (Map<?, ?>) result.get("value");
          if (value.get("ready") instanceof Boolean &&
              value.get("message") instanceof String) {
            toReturn = new Result(true, (String) value.get("message"));
          }
        }
      } else {
        toReturn = new Result(
            false,
            "Server returned a status code indicating it was down: " + response.getStatus());
      }
    } catch (JsonException e) {
      toReturn = new Result(false, "Unable to parse JSON from server: " + e.getMessage());
    } catch (IOException e) {
      toReturn = new Result(false, "Unable to reach host.");
    } catch (IllegalArgumentException e) {
      toReturn = new Result(false, "Unable to determine content type of returned values");
    } catch (Throwable t) {
      toReturn = new Result(false, "Something went awry");
    }

    lastStatus = toReturn.isAlive();
    return toReturn;
  }
}
