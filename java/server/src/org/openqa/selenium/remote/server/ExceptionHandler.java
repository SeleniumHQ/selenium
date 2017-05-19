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

package org.openqa.selenium.remote.server;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.base.Throwables;
import com.google.common.net.MediaType;
import com.google.gson.Gson;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Takes an exception and formats it for a local end that speaks either the OSS or W3C dialect of
 * the wire protocol.
 */
class ExceptionHandler implements CommandHandler {

  private final Exception exception;

  public ExceptionHandler(Exception e) {
    this.exception = e;
    System.err.println(e);
  }

  @Override
  public void execute(HttpServletRequest req, HttpServletResponse resp) {
    resp.reset();

    Map<String, Object> value = new HashMap<>();
    value.put("message", exception.getMessage());
    value.put("stacktrace", Throwables.getStackTraceAsString(exception));
    value.put("error", "unknown error");

    Map<String, Object> toSerialise = new HashMap<>();
    toSerialise.put("value", value);

    byte[] bytes = new Gson().toJson(value).getBytes(UTF_8);
    resp.setStatus(HTTP_INTERNAL_ERROR);
    resp.setContentType(MediaType.JAVASCRIPT_UTF_8.toString());
    resp.setContentLengthLong(bytes.length);
    try (OutputStream out = resp.getOutputStream()) {
      out.write(bytes);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
