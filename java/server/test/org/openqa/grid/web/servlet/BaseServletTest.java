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

package org.openqa.grid.web.servlet;

import com.google.gson.JsonObject;

import org.openqa.testing.FakeHttpServletRequest;
import org.openqa.testing.FakeHttpServletResponse;
import org.openqa.testing.UrlInfo;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;


public class BaseServletTest {
  private static final String BASE_URL = "http://localhost:4444";
  private static final String CONTEXT_PATH = "/";

  protected HttpServlet servlet;

  protected static UrlInfo createUrl(String path) {
    return new UrlInfo(BASE_URL, CONTEXT_PATH, path);
  }

  protected FakeHttpServletResponse sendCommand(String method, String commandPath)
    throws IOException, ServletException {
    return sendCommand(method, commandPath, null);
  }

  protected FakeHttpServletResponse sendCommand(String method, String commandPath,
                                              JsonObject parameters) throws IOException, ServletException {
    FakeHttpServletRequest request = new FakeHttpServletRequest(method, createUrl(commandPath));
    if (parameters != null) {
      request.setBody(parameters.toString());
    }
    FakeHttpServletResponse response = new FakeHttpServletResponse();
    servlet.service(request, response);
    return response;
  }
}
