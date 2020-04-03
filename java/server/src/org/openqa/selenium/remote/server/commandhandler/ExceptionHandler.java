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

package org.openqa.selenium.remote.server.commandhandler;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Stream;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.Contents.bytes;

/**
 * Takes an exception and formats it for a local end that speaks either the OSS or W3C dialect of
 * the wire protocol.
 */
public class ExceptionHandler implements HttpHandler {

  private final static ErrorCodes ERRORS = new ErrorCodes();
  private final static Json toJson = new Json();

  private final Throwable exception;

  public ExceptionHandler(Throwable e) {
    if (e == null) {
      e = new WebDriverException("Unknown error");
    }
    if (e instanceof ExecutionException && e.getCause() != null) {
      e = e.getCause();
    }
    this.exception = e;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    int code = ERRORS.toStatusCode(exception);
    String status = ERRORS.toState(code);

    Map<String, Object> toSerialise = new HashMap<>();

    // W3C
    Map<String, Object> value = new HashMap<>();
    value.put("message", exception.getMessage());
    value.put("stacktrace", Throwables.getStackTraceAsString(exception));
    value.put("error", status);

    // JSON Wire Protocol
    toSerialise.put("status", code);
      value.put(
          "stackTrace",
          Stream.of(exception.getStackTrace())
              .map(ste -> {
                HashMap<String, Object> line = new HashMap<>();
                line.put("fileName", ste.getFileName());
                line.put("lineNumber", ste.getLineNumber());
                line.put("className", ste.getClassName());
                line.put("methodName", ste.getMethodName());
                return line;
              })
              .collect(ImmutableList.toImmutableList()));

    toSerialise.put("value", value);

    byte[] bytes = toJson.toJson(toSerialise).getBytes(UTF_8);

    return new HttpResponse()
      .setStatus(HTTP_INTERNAL_ERROR)
      .setHeader("Content-Type", JSON_UTF_8.toString())
      .setContent(bytes(bytes));
  }
}
