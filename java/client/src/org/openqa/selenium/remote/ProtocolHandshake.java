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

package org.openqa.selenium.remote;

import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;

import com.google.common.base.Preconditions;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

public class ProtocolHandshake {

  private final static Logger LOG = Logger.getLogger(ProtocolHandshake.class.getName());

  public Result createSession(HttpClient client, Command command)
    throws IOException {
    // Avoid serialising the capabilities too many times. Things like profiles are expensive.

    Capabilities desired = (Capabilities) command.getParameters().get("desiredCapabilities");
    desired = desired == null ? new DesiredCapabilities() : desired;
    Capabilities required = (Capabilities) command.getParameters().get("requiredCapabilities");
    required = required == null ? new DesiredCapabilities() : required;

    String des = new BeanToJsonConverter().convert(desired);
    String req = new BeanToJsonConverter().convert(required);

    // Assume the remote end obeys the robustness principle.
    StringBuilder parameters = new StringBuilder("{");
    amendW3CParameters(parameters, des, req);
    parameters.append(",");
    amendOssParamters(parameters, des, req);
    parameters.append("}");
    LOG.fine("Attempting bi-dialect session, assuming Postel's Law holds true on the remote end");
    Optional<Result> result = createSession(client, parameters);

    // Assume a fragile OSS webdriver implementation
    if (!result.isPresent()) {
      parameters = new StringBuilder("{");
      amendOssParamters(parameters, des, req);
      parameters.append("}");
      LOG.fine("Falling back to original OSS JSON Wire Protocol.");
      result = createSession(client, parameters);
    }

    // Assume a fragile w3c implementation
    if (!result.isPresent()) {
      parameters = new StringBuilder("{");
      amendW3CParameters(parameters, des, req);
      parameters.append("}");
      LOG.fine("Falling back to straight W3C remote end connection");
      result = createSession(client, parameters);
    }

    if (result.isPresent()) {
      Result toReturn = result.get();
      LOG.info(String.format("Detected dialect: %s", toReturn.dialect));
      return toReturn;
    }

    throw new SessionNotCreatedException(
      String.format(
        "Unable to create new remote session. " +
        "desired capabilities = %s, required capabilities = %s",
        desired,
        required));
  }

  private Optional<Result> createSession(HttpClient client, StringBuilder params)
    throws IOException {
    // Create the http request and send it
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session");
    String content = params.toString();
    byte[] data = content.getBytes(UTF_8);

    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
    request.setContent(data);
    HttpResponse response = client.execute(request, true);

    Map<?, ?> jsonBlob = null;
    String resultString = response.getContentString();
    try {
      jsonBlob = new JsonToBeanConverter().convert(Map.class, resultString);
    } catch (ClassCastException e) {
      LOG.info("Unable to parse response from server: " + resultString);
      return Optional.empty();
    } catch (JsonException e) {
      // Fine. Handle that below
    }

    if (jsonBlob == null) {
      jsonBlob = new HashMap<>();
    }

    // If the result looks positive, return the result.
    Object sessionId = jsonBlob.get("sessionId");
    Object value = jsonBlob.get("value");
    Object w3cError = jsonBlob.get("error");
    Object ossStatus = jsonBlob.get("status");
    Map<String, ?> capabilities = null;
    if (value != null && value instanceof Map) {
      capabilities = (Map<String, ?>) value;
    } else if (value != null && value instanceof Capabilities) {
      capabilities = ((Capabilities) capabilities).asMap();
    }

    if (response.getStatus() == HttpURLConnection.HTTP_OK) {
      if (sessionId != null && capabilities != null) {
        Dialect dialect = ossStatus == null ? Dialect.W3C : Dialect.OSS;
        return Optional.of(
          new Result(dialect, String.valueOf(sessionId), capabilities));
      }
    }

    // If the result was an error that we believe has to do with the remote end failing to start the
    // session, create an exception and throw it.
    Response tempResponse = null;
    if ("session not created".equals(w3cError)) {
      tempResponse = new Response(null);
      tempResponse.setStatus(ErrorCodes.SESSION_NOT_CREATED);
      tempResponse.setValue(jsonBlob);
    } else if (
      ossStatus instanceof Number &&
      ((Number) ossStatus).intValue() == ErrorCodes.SESSION_NOT_CREATED) {
      tempResponse = new Response(null);
      tempResponse.setStatus(ErrorCodes.SESSION_NOT_CREATED);
      tempResponse.setValue(jsonBlob);
    }

    if (tempResponse != null) {
      new ErrorHandler(true).throwIfResponseFailed(tempResponse, 0);
    }

    // Otherwise, just return empty.
    return Optional.empty();
  }

  private void amendW3CParameters(
    StringBuilder params,
    String desired,
    String required) {
    params.append("\"capabilities\": {");
    params.append("\"desiredCapabilities\": ").append(desired);
    params.append(",");
    params.append("\"requiredCapabilities\": ").append(required);
    params.append("}");
  }

  private void amendOssParamters(
    StringBuilder params,
    String desired,
    String required) {
    params.append("\"desiredCapabilities\": ").append(desired);
    params.append(",");
    params.append("\"requiredCapabilities\": ").append(required);
  }


  public class Result {
    private final Dialect dialect;
    private final Map<String, ?> capabilities;
    private final SessionId sessionId;

    private Result(Dialect dialect, String sessionId, Map<String, ?> capabilities) {
      this.dialect = dialect;
      this.sessionId = new SessionId(Preconditions.checkNotNull(sessionId));
      this.capabilities = capabilities;
    }

    public Dialect getDialect() {
      return dialect;
    }

    public Response createResponse() {
      Response response = new Response(sessionId);
      response.setValue(capabilities);
      response.setStatus(ErrorCodes.SUCCESS);
      return response;
    }

    @Override
    public String toString() {
      return String.format("%s: %s", dialect, capabilities);
    }
  }
}
